import { chaptersCrud } from "@/lib/api/crud-configs";
import { crudRoutes } from "@/lib/api/crud";

const routes = crudRoutes(chaptersCrud);

export const GET = routes.getById;
export const PATCH = routes.update;
export const DELETE = routes.remove;
