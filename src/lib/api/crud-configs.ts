import type { CrudConfig } from "@/lib/api/crud";
import { isAdmin } from "@/auth/rbac";
import type { SessionUser } from "@/auth/session";
import {
  subjectCreateSchema, subjectUpdateSchema,
  courseCreateSchema, courseUpdateSchema,
  learningPathCreateSchema, learningPathUpdateSchema,
  moduleCreateSchema, moduleUpdateSchema,
  chapterCreateSchema, chapterUpdateSchema,
  lessonCreateSchema, lessonUpdateSchema,
  sectionCreateSchema, sectionUpdateSchema,
  codeExampleCreateSchema, codeExampleUpdateSchema,
  exerciseCreateSchema, exerciseUpdateSchema,
  testCaseCreateSchema, testCaseUpdateSchema,
  quizCreateSchema, quizUpdateSchema,
  questionCreateSchema, questionUpdateSchema,
  answerOptionCreateSchema, answerOptionUpdateSchema,
  projectCreateSchema, projectUpdateSchema,
  glossaryCreateSchema, glossaryUpdateSchema,
  noteCreateSchema, noteUpdateSchema, bookmarkCreateSchema,
  discussionCreateSchema, discussionUpdateSchema,
  commentCreateSchema, commentUpdateSchema,
} from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { conflict, notFound } from "@/lib/api/errors";
import { z } from "zod";
import { optionalText } from "@/lib/domain/schemas";

/**
 * Per-domain CRUD wiring: permissions, list filters, sortable fields,
 * search columns, includes and role-aware serialization.
 *
 * Visibility rules:
 *  - catalog reads (subjects, courses, learning paths, published content,
 *    glossary) are public for guests
 *  - students see only PUBLISHED content; staff (instructor/editor/admin)
 *    see drafts and review states too
 *  - answer keys (isCorrect) and exercise solutions (solutionCode) are
 *    stripped for non-staff readers
 */

const isStaff = (u: SessionUser | null) =>
  !!u && ["INSTRUCTOR", "CONTENT_EDITOR", "ADMINISTRATOR"].includes(u.role);

// ------------------------------------------------------------------ catalog

export const subjectsCrud: CrudConfig = {
  model: "subject",
  resource: "Subject",
  read: "public",
  create: { permission: "content:create" },
  update: { permission: "content:update" },
  remove: { permission: "content:delete" },
  createSchema: subjectCreateSchema,
  updateSchema: subjectUpdateSchema,
  searchableFields: ["title", "description"],
  sortableFields: ["title", "orderIndex", "createdAt"],
  defaultSort: { field: "orderIndex", dir: "asc" },
  filters: {},
  include: { _count: { select: { courses: true, glossaryTerms: true } }, owner: { select: { id: true, name: true } } },
  beforeDelete: async (record) => {
    const count = await db.course.count({ where: { subjectId: record.id } });
    if (count > 0) throw conflict(`Subject still has ${count} course(s) — reassign them first`);
  },
};

const courseInclude = {
  subject: { select: { id: true, slug: true, title: true, color: true } },
  instructor: { select: { id: true, name: true, headline: true } },
  _count: { select: { modules: true, enrollments: true, projects: true, discussions: true } },
};

export const coursesCrud: CrudConfig = {
  model: "course",
  resource: "Course",
  read: "public",
  create: { permission: "content:create" },
  update: { permission: "content:update" },
  remove: { permission: "content:delete" },
  createSchema: courseCreateSchema,
  updateSchema: courseUpdateSchema,
  searchableFields: ["title", "subtitle", "description"],
  sortableFields: ["title", "createdAt", "estimatedHours", "level", "status"],
  defaultSort: { field: "createdAt", dir: "desc" },
  filters: {
    status: { column: "status", type: "string" },
    level: { column: "level", type: "string" },
    subjectId: { column: "subjectId", type: "string" },
    instructorId: { column: "instructorId", type: "string" },
  },
  include: courseInclude,
  scopeWhere: (user) => {
    // guests + students see published courses only; staff see everything
    if (isStaff(user)) return {};
    return { status: "PUBLISHED" };
  },
  beforeDelete: async (record) => {
    const enrolled = await db.enrollment.count({ where: { courseId: record.id } });
    if (enrolled > 0) throw conflict(`Course has ${enrolled} enrollment(s) — archive it instead of deleting`);
  },
};

export const learningPathsCrud: CrudConfig = {
  model: "learningPath",
  resource: "Learning path",
  read: "public",
  create: { permission: "content:create" },
  update: { permission: "content:update" },
  remove: { permission: "content:delete" },
  createSchema: learningPathCreateSchema,
  updateSchema: learningPathUpdateSchema,
  searchableFields: ["title", "description"],
  sortableFields: ["title", "createdAt"],
  defaultSort: { field: "createdAt", dir: "desc" },
  filters: { status: { column: "status", type: "string" } },
  include: {
    courses: {
      orderBy: { orderIndex: "asc" },
      include: { course: { include: { subject: { select: { title: true, color: true } } } } },
    },
  },
  scopeWhere: (user) => (isStaff(user) ? {} : { status: "PUBLISHED" }),
  beforeCreate: async (data) => {
    const { courseIds, ...rest } = data as { courseIds?: string[] } & Record<string, unknown>;
    if (courseIds) {
      const courses = await db.course.findMany({ where: { id: { in: courseIds } }, select: { id: true } });
      if (courses.length !== courseIds.length) throw notFound("One or more courseIds do not exist");
      rest.courses = {
        create: courseIds.map((cid, i) => ({ courseId: cid, orderIndex: i + 1 })),
      };
    }
    return rest;
  },
  beforeDelete: async (record) => {
    await db.learningPathCourse.deleteMany({ where: { learningPathId: record.id } });
  },
};

// ----------------------------------------------------------------- content

export const modulesCrud: CrudConfig = {
  model: "module",
  resource: "Module",
  read: "public",
  create: { permission: "content:create" },
  update: { permission: "content:update" },
  remove: { permission: "content:delete" },
  createSchema: moduleCreateSchema,
  updateSchema: moduleUpdateSchema,
  searchableFields: ["title", "summary"],
  sortableFields: ["title", "orderIndex", "createdAt"],
  defaultSort: { field: "orderIndex", dir: "asc" },
  filters: { courseId: { column: "courseId", type: "string" } },
  include: { course: { select: { id: true, slug: true, title: true, status: true } }, _count: { select: { chapters: true } } },
  scopeWhere: (user) => {
    if (isStaff(user)) return {};
    return { course: { status: "PUBLISHED" } };
  },
};

export const chaptersCrud: CrudConfig = {
  model: "chapter",
  resource: "Chapter",
  read: "public",
  create: { permission: "content:create" },
  update: { permission: "content:update" },
  remove: { permission: "content:delete" },
  createSchema: chapterCreateSchema,
  updateSchema: chapterUpdateSchema,
  searchableFields: ["title", "summary"],
  sortableFields: ["title", "orderIndex", "createdAt"],
  defaultSort: { field: "orderIndex", dir: "asc" },
  filters: { moduleId: { column: "moduleId", type: "string" } },
  include: { module: { select: { id: true, title: true, courseId: true } }, _count: { select: { lessons: true } } },
  scopeWhere: (user) => {
    if (isStaff(user)) return {};
    return { module: { course: { status: "PUBLISHED" } } };
  },
};

export const lessonsCrud: CrudConfig = {
  model: "lesson",
  resource: "Lesson",
  read: "public",
  create: { permission: "content:create" },
  update: { permission: "content:update" },
  remove: { permission: "content:delete" },
  createSchema: lessonCreateSchema,
  updateSchema: lessonUpdateSchema,
  searchableFields: ["title", "summary"],
  sortableFields: ["title", "orderIndex", "estimatedMinutes", "createdAt"],
  defaultSort: { field: "orderIndex", dir: "asc" },
  filters: {
    chapterId: { column: "chapterId", type: "string" },
    status: { column: "status", type: "string" },
  },
  include: {
    chapter: { select: { id: true, title: true, module: { select: { id: true, title: true, courseId: true } } } },
    _count: { select: { sections: true, exercises: true, quizzes: true, discussions: true } },
  },
  scopeWhere: (user) => {
    if (isStaff(user)) return {};
    return {
      status: "PUBLISHED",
      chapter: { module: { course: { status: "PUBLISHED" } } },
    };
  },
};

export const sectionsCrud: CrudConfig = {
  model: "lessonSection",
  resource: "Lesson section",
  read: "public",
  create: { permission: "content:create" },
  update: { permission: "content:update" },
  remove: { permission: "content:delete" },
  createSchema: sectionCreateSchema,
  updateSchema: sectionUpdateSchema,
  searchableFields: ["title", "content"],
  sortableFields: ["orderIndex", "createdAt"],
  defaultSort: { field: "orderIndex", dir: "asc" },
  filters: { lessonId: { column: "lessonId", type: "string" }, kind: { column: "kind", type: "string" } },
  include: { lesson: { select: { id: true, title: true, status: true } }, codeExamples: { orderBy: { orderIndex: "asc" } } },
  scopeWhere: (user) => {
    if (isStaff(user)) return {};
    return { lesson: { status: "PUBLISHED", chapter: { module: { course: { status: "PUBLISHED" } } } } };
  },
};

export const codeExamplesCrud: CrudConfig = {
  model: "codeExample",
  resource: "Code example",
  read: "public",
  create: { permission: "content:create" },
  update: { permission: "content:update" },
  remove: { permission: "content:delete" },
  createSchema: codeExampleCreateSchema,
  updateSchema: codeExampleUpdateSchema,
  searchableFields: ["filename", "code", "explanation"],
  sortableFields: ["orderIndex", "createdAt"],
  defaultSort: { field: "orderIndex", dir: "asc" },
  filters: { lessonSectionId: { column: "lessonSectionId", type: "string" }, language: { column: "language", type: "string" } },
  scopeWhere: (user) => {
    if (isStaff(user)) return {};
    return { lessonSection: { lesson: { status: "PUBLISHED", chapter: { module: { course: { status: "PUBLISHED" } } } } } };
  },
};

// ---------------------------------------------------------------- practice

export const exercisesCrud: CrudConfig = {
  model: "exercise",
  resource: "Exercise",
  read: "public",
  create: { permission: "exercise:manage" },
  update: { permission: "exercise:manage" },
  remove: { permission: "exercise:manage" },
  createSchema: exerciseCreateSchema,
  updateSchema: exerciseUpdateSchema,
  searchableFields: ["title", "prompt"],
  sortableFields: ["title", "difficulty", "points", "orderIndex", "createdAt"],
  defaultSort: { field: "orderIndex", dir: "asc" },
  filters: {
    lessonId: { column: "lessonId", type: "string" },
    difficulty: { column: "difficulty", type: "string" },
    language: { column: "language", type: "string" },
    status: { column: "status", type: "string" },
  },
  include: {
    lesson: {
      select: {
        id: true, title: true,
        chapter: { select: { module: { select: { courseId: true, title: true, course: { select: { title: true } } } } } },
      },
    },
    testCases: { orderBy: { orderIndex: "asc" } },
    _count: { select: { submissions: true } },
  },
  scopeWhere: (user) => {
    if (isStaff(user)) return {};
    return { lesson: { status: "PUBLISHED", chapter: { module: { course: { status: "PUBLISHED" } } } } };
  },
  serialize: (record, user) => {
    // strip answer material for non-staff: solutions + hidden cases
    if (isStaff(user)) return record;
    return {
      ...record,
      solutionCode: undefined,
      testCases: record.testCases
        ? record.testCases
            .filter((tc: { hidden: boolean }) => !tc.hidden)
            .map((tc: Record<string, unknown>) => ({ ...tc, expectedOutput: undefined }))
        : record.testCases,
    };
  },
};

export const testCasesCrud: CrudConfig = {
  model: "testCase",
  resource: "Test case",
  read: { permission: "exercise:manage" },
  create: { permission: "exercise:manage" },
  update: { permission: "exercise:manage" },
  remove: { permission: "exercise:manage" },
  createSchema: testCaseCreateSchema,
  updateSchema: testCaseUpdateSchema,
  sortableFields: ["name", "orderIndex", "createdAt"],
  defaultSort: { field: "orderIndex", dir: "asc" },
  filters: { exerciseId: { column: "exerciseId", type: "string" }, hidden: { column: "hidden", type: "boolean" } },
  include: { exercise: { select: { id: true, title: true, lessonId: true } } },
};

export const quizzesCrud: CrudConfig = {
  model: "quiz",
  resource: "Quiz",
  read: "public",
  create: { permission: "quiz:manage" },
  update: { permission: "quiz:manage" },
  remove: { permission: "quiz:manage" },
  createSchema: quizCreateSchema,
  updateSchema: quizUpdateSchema,
  searchableFields: ["title", "description"],
  sortableFields: ["title", "createdAt"],
  defaultSort: { field: "createdAt", dir: "asc" },
  filters: { lessonId: { column: "lessonId", type: "string" } },
  include: {
    lesson: {
      select: {
        id: true, title: true,
        chapter: { select: { module: { select: { courseId: true, title: true, course: { select: { title: true } } } } } },
      },
    },
    questions: {
      orderBy: { orderIndex: "asc" },
      select: {
        id: true, prompt: true, kind: true, points: true, orderIndex: true,
        answerOptions: { orderBy: { orderIndex: "asc" }, select: { id: true, text: true, orderIndex: true } },
      },
    },
    _count: { select: { attempts: true } },
  },
  scopeWhere: (user) => {
    if (isStaff(user)) return {};
    return { lesson: { status: "PUBLISHED", chapter: { module: { course: { status: "PUBLISHED" } } } } };
  },
};

export const questionsCrud: CrudConfig = {
  model: "quizQuestion",
  resource: "Question",
  read: { permission: "quiz:manage" },
  create: { permission: "quiz:manage" },
  update: { permission: "quiz:manage" },
  remove: { permission: "quiz:manage" },
  createSchema: questionCreateSchema,
  updateSchema: questionUpdateSchema,
  sortableFields: ["orderIndex", "createdAt"],
  defaultSort: { field: "orderIndex", dir: "asc" },
  filters: { quizId: { column: "quizId", type: "string" }, kind: { column: "kind", type: "string" } },
  include: { quiz: { select: { id: true, title: true } }, answerOptions: { orderBy: { orderIndex: "asc" } } },
  beforeCreate: async (data) => {
    const { options, ...rest } = data as { options?: { text: string; isCorrect: boolean }[] } & Record<string, unknown>;
    if (options) {
      // every question needs exactly one+ correct options (>=1 correct)
      if (!options.some((o) => o.isCorrect)) throw conflict("At least one option must be marked correct");
      rest.answerOptions = {
        create: options.map((o, i) => ({ text: o.text, isCorrect: o.isCorrect, orderIndex: i + 1 })),
      };
    }
    return rest;
  },
};

export const answerOptionsCrud: CrudConfig = {
  model: "answerOption",
  resource: "Answer option",
  read: { permission: "quiz:manage" },
  create: { permission: "quiz:manage" },
  update: { permission: "quiz:manage" },
  remove: { permission: "quiz:manage" },
  createSchema: answerOptionCreateSchema,
  updateSchema: answerOptionUpdateSchema,
  sortableFields: ["orderIndex", "createdAt"],
  defaultSort: { field: "orderIndex", dir: "asc" },
  filters: { questionId: { column: "questionId", type: "string" } },
  include: { question: { select: { id: true, prompt: true, quizId: true } } },
};

export const projectsCrud: CrudConfig = {
  model: "project",
  resource: "Project",
  read: "public",
  create: { permission: "content:create" },
  update: { permission: "content:update" },
  remove: { permission: "content:delete" },
  createSchema: projectCreateSchema,
  updateSchema: projectUpdateSchema,
  searchableFields: ["title", "brief"],
  sortableFields: ["title", "difficulty", "points", "createdAt"],
  defaultSort: { field: "createdAt", dir: "desc" },
  filters: { courseId: { column: "courseId", type: "string" }, status: { column: "status", type: "string" }, difficulty: { column: "difficulty", type: "string" } },
  include: {
    course: { select: { id: true, slug: true, title: true, status: true } },
    _count: { select: { submissions: true } },
  },
  scopeWhere: (user) => {
    if (isStaff(user)) return {};
    return { course: { status: "PUBLISHED" }, status: "PUBLISHED" };
  },
};

// -------------------------------------------------------------- study aids

export const bookmarksCrud: CrudConfig = {
  model: "bookmark",
  resource: "Bookmark",
  read: "auth",
  create: { permission: "bookmark:write" },
  update: { permission: "bookmark:write" },
  remove: { permission: "bookmark:write" },
  ownerField: "userId",
  createSchema: bookmarkCreateSchema,
  updateSchema: z.object({ label: optionalText(120) }).strict(),
  sortableFields: ["createdAt"],
  defaultSort: { field: "createdAt", dir: "desc" },
  filters: { lessonId: { column: "lessonId", type: "string" } },
  include: { lesson: { select: { id: true, title: true, chapter: { select: { title: true, module: { select: { title: true, courseId: true } } } } } } },
  beforeCreate: async (data, ctx) => ({ ...data, userId: ctx.user!.id }),
  scopeWhere: (user) => ({ userId: user?.id ?? "none" }),
};

export const notesCrud: CrudConfig = {
  model: "studentNote",
  resource: "Note",
  read: "auth", // owner scoping inside
  create: { permission: "note:write" },
  update: { permission: "note:write" },
  remove: { permission: "note:write" },
  ownerField: "userId",
  createSchema: noteCreateSchema,
  updateSchema: noteUpdateSchema,
  searchableFields: ["content"],
  sortableFields: ["createdAt", "updatedAt"],
  defaultSort: { field: "updatedAt", dir: "desc" },
  filters: { lessonId: { column: "lessonId", type: "string" } },
  include: { lesson: { select: { id: true, title: true } } },
  beforeCreate: async (data, ctx) => ({ ...data, userId: ctx.user!.id }),
  scopeWhere: (user) => ({ userId: user?.id ?? "none" }), // list = own notes only
};

export const discussionsCrud: CrudConfig = {
  model: "discussion",
  resource: "Discussion",
  read: "public",
  create: { permission: "discussion:moderate" }, // overridden by custom route (any authed user may post)
  update: { permission: "discussion:moderate" },
  remove: { permission: "discussion:moderate" },
  createSchema: discussionCreateSchema,
  updateSchema: discussionUpdateSchema,
  searchableFields: ["title", "body"],
  sortableFields: ["title", "views", "createdAt"],
  defaultSort: { field: "createdAt", dir: "desc" },
  filters: {
    status: { column: "status", type: "string" },
    lessonId: { column: "lessonId", type: "string" },
    courseId: { column: "courseId", type: "string" },
  },
  include: {
    user: { select: { id: true, name: true, avatarUrl: true, headline: true } },
    lesson: { select: { id: true, title: true } },
    course: { select: { id: true, title: true } },
    _count: { select: { comments: true } },
  },
};

export const commentsCrud: CrudConfig = {
  model: "comment",
  resource: "Comment",
  read: "public",
  create: { permission: "discussion:moderate" }, // overridden by custom route
  update: { permission: "discussion:moderate" },
  remove: { permission: "discussion:moderate" },
  ownerField: "userId",
  createSchema: commentCreateSchema,
  updateSchema: commentUpdateSchema,
  sortableFields: ["createdAt"],
  defaultSort: { field: "createdAt", dir: "asc" },
  filters: { discussionId: { column: "discussionId", type: "string" } },
  include: {
    user: { select: { id: true, name: true, avatarUrl: true } },
    discussion: { select: { id: true, title: true } },
    replies: { include: { user: { select: { id: true, name: true } } } },
  },
};

export const glossaryCrud: CrudConfig = {
  model: "glossaryTerm",
  resource: "Glossary term",
  read: "public",
  create: { permission: "content:create" },
  update: { permission: "content:update" },
  remove: { permission: "content:delete" },
  createSchema: glossaryCreateSchema,
  updateSchema: glossaryUpdateSchema,
  searchableFields: ["term", "definition"],
  sortableFields: ["term", "createdAt"],
  defaultSort: { field: "term", dir: "asc" },
  filters: { subjectId: { column: "subjectId", type: "string" } },
  include: { subject: { select: { id: true, slug: true, title: true, color: true } } },
};

export { isStaff };
