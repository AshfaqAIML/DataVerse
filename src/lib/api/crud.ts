import type { NextRequest, NextResponse } from "next/server";
import type { ZodType } from "zod";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { AppError, notFound, ok, created as createdResp, paginated, conflict } from "./errors";
import { combineWhere, listWithPagination, parseFilters, parsePagination, parseSearch, parseSort, toPrismaOrderBy, type FilterConfig } from "./query";
import { parseBody, withApi, type ApiContext } from "./handler";
import { hasPermission, isAdmin } from "@/auth/rbac";
import type { Permission } from "@/lib/domain/constants";
import type { SessionUser } from "@/auth/session";

/**
 * Generic CRUD factory.
 *
 * Produces consistent, validated, permission-gated handlers for a Prisma
 * model with: pagination, sorting, search, filtering, ownership checks and
 * unified error mapping. Domain routes stay thin: schema + config + hooks.
 *
 * The delegate is intentionally typed loosely (Prisma delegate generics do
 * not compose well with a generic factory); input safety is guaranteed by
 * the Zod schemas and output shape by the route-level `include`.
 */

type AnyDelegate = Record<string, (args: any) => Promise<any>>;

export type AccessRule =
  | "public" // no auth, guests included
  | "auth" // any authenticated user
  | { permission: Permission }; // needs this permission

export type CrudConfig = {
  /** Prisma model key on `db`, e.g. "course". */
  model: string;
  /** Human resource name for errors, e.g. "Course". */
  resource: string;
  read: AccessRule;
  create?: AccessRule;
  update?: AccessRule;
  remove?: AccessRule;
  createSchema: ZodType;
  updateSchema: ZodType;
  searchableFields?: readonly string[];
  sortableFields?: readonly string[];
  defaultSort?: { field: string; dir: "asc" | "desc" };
  filters?: FilterConfig;
  /** Prisma include applied on reads (list + by-id). */
  include?: any;
  /** Extra `where` scoping per requester (e.g. students see only PUBLISHED). */
  scopeWhere?: (user: SessionUser | null) => Record<string, unknown>;
  /** Field holding the owning user id — enables owner update/delete. */
  ownerField?: string;
  /** Transform validated input right before create (e.g. inject userId). */
  beforeCreate?: (data: any, ctx: ApiContext) => Promise<any> | any;
  /** Post-create side effects (notifications, rollups). */
  afterCreate?: (record: any, ctx: ApiContext) => Promise<void> | void;
  /** Post-update side effects. */
  afterUpdate?: (record: any, ctx: ApiContext) => Promise<void> | void;
  /** Guard called before update/delete for custom domain rules. */
  beforeDelete?: (record: any, ctx: ApiContext) => Promise<void> | void;
  /** Output serialization (strip secrets like solutionCode per viewer role). */
  serialize?: (record: any, user: SessionUser | null) => any;
};

function delegate(model: string): AnyDelegate {
  const d = (db as any)[model];
  if (!d) throw new AppError("INTERNAL_ERROR", `Unknown model '${model}'`);
  return d;
}

function canAccess(rule: AccessRule | undefined, user: SessionUser | null): boolean {
  if (!rule) return false;
  if (rule === "public") return true;
  if (rule === "auth") return !!user;
  return !!user && hasPermission(user, rule.permission);
}

function assertAccess(rule: AccessRule | undefined, user: SessionUser | null, action: string): void {
  if (rule === "public" || rule === "auth") return;
  if (!user) throw new AppError("UNAUTHORIZED", `Authentication required to ${action}`);
  if (!rule) throw new AppError("FORBIDDEN", `No access rule configured to ${action}`);
  if (!hasPermission(user, rule.permission)) {
    throw new AppError("FORBIDDEN", `Missing permission '${rule.permission}' to ${action}`);
  }
}

/** AND-joins search fragments across multiple columns (SQLite `contains`). */
function searchWhere(search: { q: string; fields: string[] } | null): Record<string, unknown> | null {
  if (!search) return null;
  const ORs = search.fields.map((f) => ({ [f]: { contains: search.q } }));
  return ORs.length > 0 ? { OR: ORs } : null;
}

function ser<T>(cfg: CrudConfig, record: T, user: SessionUser | null): T {
  return cfg.serialize ? cfg.serialize(record, user) : record;
}

// ---------------------------------------------------------------- handlers

export function makeListHandler(cfg: CrudConfig) {
  return withApi({ auth: false, rateLimit: "read" }, async (ctx) => {
    // Public access to the resource is fine for guests; otherwise require auth.
    if (cfg.read !== "public" && !ctx.user) {
      throw new AppError("UNAUTHORIZED", "Authentication required");
    }

    const { page, pageSize, skip, take } = parsePagination(ctx.req);
    const sort = parseSort(ctx.req, cfg.sortableFields ?? ["createdAt"]);
    const search = parseSearch(ctx.req, cfg.searchableFields ?? []);
    const filters = parseFilters(ctx.req, cfg.filters ?? {});

    // permission scoping
    const scope = cfg.scopeWhere ? cfg.scopeWhere(ctx.user) : {};
    if (cfg.read !== "public" && cfg.read !== "auth" && !isAdmin(ctx.user) && !hasPermission(ctx.user, cfg.read.permission)) {
      throw new AppError("FORBIDDEN", "Missing permission to list this resource");
    }

    const where = combineWhere(scope as Record<string, unknown>, filters, searchWhere(search));

    const d = delegate(cfg.model);
    const [items, meta] = await listWithPagination(
      (a) =>
        d.findMany({
          where,
          orderBy: sort.length
            ? toPrismaOrderBy(sort)
            : cfg.defaultSort
              ? [{ [cfg.defaultSort.field]: cfg.defaultSort.dir }]
              : [{ createdAt: "desc" }],
          ...a,
          include: cfg.include,
        }),
      () => d.count({ where }),
      page,
      pageSize
    );

    return paginated(items.map((i) => ser(cfg, i, ctx.user)), meta);
  });
}

export function makeGetByIdHandler(cfg: CrudConfig) {
  return withApi({ auth: false, rateLimit: "read" }, async (ctx) => {
    if (cfg.read !== "public" && !ctx.user) {
      throw new AppError("UNAUTHORIZED", "Authentication required");
    }
    const record = await delegate(cfg.model).findUnique({
      where: { id: ctx.params.id },
      include: cfg.include,
    });
    if (!record) throw notFound(`${cfg.resource} not found`);
    // scope check for non-public resources (owner or permission holders)
    if (cfg.read !== "public") {
      const permOk = cfg.read === "auth" ? true : hasPermission(ctx.user, (cfg.read as { permission: Permission }).permission);
      const ownerOk = cfg.ownerField ? record[cfg.ownerField] === ctx.user?.id : false;
      if (!permOk && !ownerOk) throw new AppError("FORBIDDEN", "You cannot view this resource");
    }
    return ok(ser(cfg, record, ctx.user));
  });
}

export function makeCreateHandler(cfg: CrudConfig) {
  return withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
    assertAccess(cfg.create, ctx.user, `create ${cfg.resource}`);
    let data = await parseBody(ctx.req, cfg.createSchema);
    if (cfg.beforeCreate) data = await cfg.beforeCreate(data, ctx);
    const record = await delegate(cfg.model).create({ data, include: cfg.include });
    if (cfg.afterCreate) await cfg.afterCreate(record, ctx);
    return createdResp(ser(cfg, record, ctx.user));
  });
}

export function makeUpdateHandler(cfg: CrudConfig) {
  return withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
    assertAccess(cfg.update, ctx.user, `update ${cfg.resource}`);
    const d = delegate(cfg.model);
    const record = await d.findUnique({ where: { id: ctx.params.id } });
    if (!record) throw notFound(`${cfg.resource} not found`);

    // ownership fallback: holders of the base permission may edit their own
    if (cfg.ownerField && !isAdmin(ctx.user)) {
      const permOk = cfg.update && cfg.update !== "public" && cfg.update !== "auth"
        ? hasPermission(ctx.user, (cfg.update as { permission: Permission }).permission)
        : false;
      if (record[cfg.ownerField] !== ctx.user!.id && !permOk) {
        throw new AppError("FORBIDDEN", "You can only modify your own records");
      }
    }

    const data = await parseBody(ctx.req, cfg.updateSchema);
    const updated = await d.update({ where: { id: ctx.params.id }, data, include: cfg.include });
    if (cfg.afterUpdate) await cfg.afterUpdate(updated, ctx);
    return ok(ser(cfg, updated, ctx.user));
  });
}

export function makeDeleteHandler(cfg: CrudConfig) {
  return withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
    assertAccess(cfg.remove, ctx.user, `delete ${cfg.resource}`);
    const d = delegate(cfg.model);
    const record = await d.findUnique({ where: { id: ctx.params.id } });
    if (!record) throw notFound(`${cfg.resource} not found`);

    if (cfg.ownerField && !isAdmin(ctx.user)) {
      const permOk = cfg.remove && cfg.remove !== "public" && cfg.remove !== "auth"
        ? hasPermission(ctx.user, (cfg.remove as { permission: Permission }).permission)
        : false;
      if (record[cfg.ownerField] !== ctx.user!.id && !permOk) {
        throw new AppError("FORBIDDEN", "You can only delete your own records");
      }
    }

    if (cfg.beforeDelete) await cfg.beforeDelete(record, ctx);
    await d.delete({ where: { id: ctx.params.id } });
    return ok({ id: ctx.params.id, deleted: true });
  });
}

/** Bundles list+create for /resource and get+update+delete for /resource/[id]. */
export function crudRoutes(cfg: CrudConfig) {
  return {
    list: makeListHandler(cfg),
    create: makeCreateHandler(cfg),
    getById: makeGetByIdHandler(cfg),
    update: makeUpdateHandler(cfg),
    remove: makeDeleteHandler(cfg),
  };
}

// re-exports used by domain routes
export { conflict, ok };
