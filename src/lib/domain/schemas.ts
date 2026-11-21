import { z } from "zod";
import {
  zCourseStatus, zContentLevel, zLessonStatus, zSectionKind, zDifficulty, zQuestionKind,
  zUserStatus, zEnrollmentStatus, zDiscussionStatus, zNotificationKind, zRoleKey,
  zAiMessageRole, zAiConversationStatus, zExerciseLanguage, zLessonProgressStatus,
  zProjectSubmissionStatus, zAttemptStatus,
} from "./constants";

/**
 * Request schemas — every mutating endpoint validates through one of these.
 * String IDs (cuid) + bounded text + enum values from the constants module.
 */

const cuid = z.string().min(1, "Required id");
const nonEmpty = (max: number, field = "Value") => z.string().trim().min(1, `${field} is required`).max(max, `${field} must be at most ${max} characters`);
const optionalText = (max: number) => z.string().trim().max(max).optional();
export { optionalText, nonEmpty };
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const zSlug = z.string().regex(slugRegex, "Slug must be kebab-case (a-z, 0-9, dashes)");
const zEmail = z.string().trim().email("Invalid email address").max(254);
const zPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[a-zA-Z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

// ------------------------------------------------------------------ auth
export const registerSchema = z.object({
  email: zEmail,
  password: zPassword,
  name: nonEmpty(80, "Name"),
  headline: optionalText(120),
}).strict();

export const loginSchema = z.object({
  email: zEmail,
  password: z.string().min(1, "Password is required").max(128),
}).strict();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: zPassword,
}).strict();

// ------------------------------------------------------------------ users
export const userUpdateSchema = z.object({
  name: nonEmpty(80, "Name").optional(),
  avatarUrl: z.string().url().max(500).nullable().optional(),
  bio: optionalText(1000),
  headline: optionalText(120).nullable(),
  status: zUserStatus.optional(),
  roleId: cuid.optional(),
}).strict();

export const meUpdateSchema = z.object({
  name: nonEmpty(80, "Name").optional(),
  avatarUrl: z.string().url().max(500).nullable().optional(),
  bio: optionalText(1000),
  headline: optionalText(120).nullable(),
}).strict();

// --------------------------------------------------------------- catalog
export const subjectCreateSchema = z.object({
  slug: zSlug,
  title: nonEmpty(80, "Title"),
  description: nonEmpty(600, "Description"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #10b981").default("#10b981"),
  icon: optionalText(40),
  orderIndex: z.coerce.number().int().min(0).default(0),
}).strict();

export const subjectUpdateSchema = z.object({
  title: nonEmpty(80, "Title").optional(),
  description: nonEmpty(600, "Description").optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: optionalText(40),
  orderIndex: z.coerce.number().int().min(0).optional(),
}).strict();

export const courseCreateSchema = z.object({
  slug: zSlug,
  title: nonEmpty(120, "Title"),
  subtitle: optionalText(200),
  description: nonEmpty(4000, "Description"),
  subjectId: cuid,
  instructorId: cuid.optional(),
  level: zContentLevel.default("BEGINNER"),
  status: zCourseStatus.default("DRAFT"),
  estimatedHours: z.coerce.number().int().min(0).max(500).default(0),
  priceCents: z.coerce.number().int().min(0).default(0),
  heroImage: z.string().url().max(500).optional(),
}).strict();

export const courseUpdateSchema = z.object({
  title: nonEmpty(120, "Title").optional(),
  subtitle: optionalText(200),
  description: nonEmpty(4000, "Description").optional(),
  subjectId: cuid.optional(),
  instructorId: cuid.nullable().optional(),
  level: zContentLevel.optional(),
  status: zCourseStatus.optional(),
  estimatedHours: z.coerce.number().int().min(0).max(500).optional(),
  priceCents: z.coerce.number().int().min(0).optional(),
  heroImage: z.string().url().max(500).optional(),
}).strict();

export const learningPathCreateSchema = z.object({
  slug: zSlug,
  title: nonEmpty(120, "Title"),
  description: nonEmpty(2000, "Description"),
  audience: optionalText(120),
  heroImage: z.string().url().max(500).optional(),
  status: zCourseStatus.default("DRAFT"),
  courseIds: z.array(cuid).min(1, "A learning path needs at least one course").max(20).optional(),
}).strict();

export const learningPathUpdateSchema = z.object({
  title: nonEmpty(120, "Title").optional(),
  description: nonEmpty(2000, "Description").optional(),
  audience: optionalText(120),
  heroImage: z.string().url().max(500).optional(),
  status: zCourseStatus.optional(),
  courseIds: z.array(cuid).max(20).optional(),
}).strict();

// ---------------------------------------------------------------- content
export const moduleCreateSchema = z.object({
  courseId: cuid,
  title: nonEmpty(120, "Title"),
  summary: optionalText(1000),
  orderIndex: z.coerce.number().int().min(0).default(0),
  status: zCourseStatus.optional(),
}).strict();

export const moduleUpdateSchema = z.object({
  title: nonEmpty(120, "Title").optional(),
  summary: optionalText(1000),
  orderIndex: z.coerce.number().int().min(0).optional(),
  status: zCourseStatus.optional(),
}).strict();

export const chapterCreateSchema = z.object({
  moduleId: cuid,
  title: nonEmpty(120, "Title"),
  summary: optionalText(1000),
  orderIndex: z.coerce.number().int().min(0).default(0),
}).strict();

export const chapterUpdateSchema = z.object({
  title: nonEmpty(120, "Title").optional(),
  summary: optionalText(1000),
  orderIndex: z.coerce.number().int().min(0).optional(),
}).strict();

export const lessonCreateSchema = z.object({
  chapterId: cuid,
  title: nonEmpty(160, "Title"),
  slug: zSlug.optional(),
  summary: optionalText(500),
  estimatedMinutes: z.coerce.number().int().min(1).max(240).default(15),
  status: zLessonStatus.default("DRAFT"),
  orderIndex: z.coerce.number().int().min(0).default(0),
  isPreviewFree: z.coerce.boolean().default(false),
}).strict();

export const lessonUpdateSchema = z.object({
  title: nonEmpty(160, "Title").optional(),
  slug: zSlug.optional(),
  summary: optionalText(500),
  estimatedMinutes: z.coerce.number().int().min(1).max(240).optional(),
  status: zLessonStatus.optional(),
  orderIndex: z.coerce.number().int().min(0).optional(),
  isPreviewFree: z.coerce.boolean().optional(),
}).strict();

export const sectionCreateSchema = z.object({
  lessonId: cuid,
  kind: zSectionKind.default("TEXT"),
  title: optionalText(200),
  content: z.string().max(20000).default(""),
  orderIndex: z.coerce.number().int().min(0).default(0),
}).strict();

export const sectionUpdateSchema = z.object({
  kind: zSectionKind.optional(),
  title: optionalText(200).nullable(),
  content: z.string().max(20000).optional(),
  orderIndex: z.coerce.number().int().min(0).optional(),
}).strict();

export const codeExampleCreateSchema = z.object({
  lessonSectionId: cuid,
  filename: optionalText(120),
  language: nonEmpty(30, "Language").default("python"),
  code: z.string().min(1, "Code cannot be empty").max(20000),
  explanation: optionalText(2000),
  orderIndex: z.coerce.number().int().min(0).default(0),
}).strict();

export const codeExampleUpdateSchema = z.object({
  filename: optionalText(120).nullable(),
  language: nonEmpty(30, "Language").optional(),
  code: z.string().min(1).max(20000).optional(),
  explanation: optionalText(2000).nullable(),
  orderIndex: z.coerce.number().int().min(0).optional(),
}).strict();

// -------------------------------------------------------------- practice
export const exerciseCreateSchema = z.object({
  lessonId: cuid,
  title: nonEmpty(160, "Title"),
  prompt: nonEmpty(4000, "Prompt"),
  starterCode: z.string().max(20000).default(""),
  solutionCode: z.string().max(20000).optional(),
  language: zExerciseLanguage.default("python"),
  difficulty: zDifficulty.default("EASY"),
  points: z.coerce.number().int().min(1).max(500).default(10),
  orderIndex: z.coerce.number().int().min(0).default(0),
  status: zLessonStatus.default("DRAFT"),
}).strict();

export const exerciseUpdateSchema = z.object({
  title: nonEmpty(160, "Title").optional(),
  prompt: nonEmpty(4000, "Prompt").optional(),
  starterCode: z.string().max(20000).optional(),
  solutionCode: z.string().max(20000).nullable().optional(),
  language: zExerciseLanguage.optional(),
  difficulty: zDifficulty.optional(),
  points: z.coerce.number().int().min(1).max(500).optional(),
  orderIndex: z.coerce.number().int().min(0).optional(),
  status: zLessonStatus.optional(),
}).strict();

export const exerciseSubmitSchema = z.object({
  code: z.string().min(1, "Code cannot be empty").max(20000),
  language: zExerciseLanguage,
}).strict();

export const testCaseCreateSchema = z.object({
  exerciseId: cuid,
  name: nonEmpty(120, "Name"),
  input: z.string().max(5000).nullable().optional(),
  expectedOutput: z.string().min(1, "Expected output is required").max(10000),
  hidden: z.coerce.boolean().default(false),
  orderIndex: z.coerce.number().int().min(0).default(0),
}).strict();

export const testCaseUpdateSchema = z.object({
  name: nonEmpty(120, "Name").optional(),
  input: z.string().max(5000).nullable().optional(),
  expectedOutput: z.string().min(1).max(10000).optional(),
  hidden: z.coerce.boolean().optional(),
  orderIndex: z.coerce.number().int().min(0).optional(),
}).strict();

export const quizCreateSchema = z.object({
  lessonId: cuid,
  title: nonEmpty(160, "Title"),
  description: optionalText(1000),
  passingScore: z.coerce.number().int().min(0).max(100).default(80),
  maxAttempts: z.coerce.number().int().min(1).max(50).nullable().optional(),
  shuffleQuestions: z.coerce.boolean().default(false),
}).strict();

export const quizUpdateSchema = z.object({
  title: nonEmpty(160, "Title").optional(),
  description: optionalText(1000).nullable(),
  passingScore: z.coerce.number().int().min(0).max(100).optional(),
  maxAttempts: z.coerce.number().int().min(1).max(50).nullable().optional(),
  shuffleQuestions: z.coerce.boolean().optional(),
}).strict();

export const questionCreateSchema = z.object({
  quizId: cuid,
  prompt: nonEmpty(2000, "Prompt"),
  kind: zQuestionKind.default("MCQ"),
  points: z.coerce.number().int().min(1).max(100).default(1),
  explanation: optionalText(2000),
  orderIndex: z.coerce.number().int().min(0).default(0),
  options: z.array(z.object({ text: nonEmpty(500, "Option text"), isCorrect: z.coerce.boolean() }).strict()).min(2, "A question needs at least 2 options").max(8).optional(),
}).strict();

export const questionUpdateSchema = z.object({
  prompt: nonEmpty(2000, "Prompt").optional(),
  kind: zQuestionKind.optional(),
  points: z.coerce.number().int().min(1).max(100).optional(),
  explanation: optionalText(2000).nullable(),
  orderIndex: z.coerce.number().int().min(0).optional(),
}).strict();

export const answerOptionCreateSchema = z.object({
  questionId: cuid,
  text: nonEmpty(500, "Option text"),
  isCorrect: z.coerce.boolean().default(false),
  orderIndex: z.coerce.number().int().min(0).default(0),
}).strict();

export const answerOptionUpdateSchema = z.object({
  text: nonEmpty(500, "Option text").optional(),
  isCorrect: z.coerce.boolean().optional(),
  orderIndex: z.coerce.number().int().min(0).optional(),
}).strict();

export const attemptSubmitSchema = z.object({
  answers: z.array(z.object({
    questionId: cuid,
    selectedOptionIds: z.array(cuid).max(8).optional(),
    text: optionalText(1000),
  }).strict()).min(1, "Submit at least one answer").max(50),
}).strict();

// --------------------------------------------------------------- projects
export const projectCreateSchema = z.object({
  courseId: cuid,
  title: nonEmpty(160, "Title"),
  brief: nonEmpty(4000, "Brief"),
  requirements: z.array(nonEmpty(300, "Requirement")).min(1).max(20),
  starterRepoUrl: z.string().url().max(500).optional(),
  difficulty: zContentLevel.default("INTERMEDIATE"),
  points: z.coerce.number().int().min(1).max(1000).default(100),
  status: zLessonStatus.default("DRAFT"),
}).strict();

export const projectUpdateSchema = z.object({
  title: nonEmpty(160, "Title").optional(),
  brief: nonEmpty(4000, "Brief").optional(),
  requirements: z.array(nonEmpty(300, "Requirement")).min(1).max(20).optional(),
  starterRepoUrl: z.string().url().max(500).nullable().optional(),
  difficulty: zContentLevel.optional(),
  points: z.coerce.number().int().min(1).max(1000).optional(),
  status: zLessonStatus.optional(),
}).strict();

export const projectSubmitSchema = z.object({
  repoUrl: z.string().url("Repository URL must be a valid URL").max(500).optional(),
  artifactsUrl: z.string().url().max(500).optional(),
  notes: optionalText(4000),
}).strict();

export const projectReviewSchema = z.object({
  status: zProjectSubmissionStatus,
  score: z.coerce.number().int().min(0).max(100).optional(),
  feedback: optionalText(4000),
}).strict();

// ------------------------------------------------------- enroll & progress
export const progressRecordSchema = z.object({
  lessonId: cuid,
  status: zLessonProgressStatus.default("IN_PROGRESS"),
  timeSpentMinutes: z.coerce.number().int().min(0).max(600).optional(),
  lastSectionIndex: z.coerce.number().int().min(0).max(200).optional(),
}).strict();

// ------------------------------------------------------------- study aids
export const bookmarkCreateSchema = z.object({
  lessonId: cuid,
  label: optionalText(120),
}).strict();

export const noteCreateSchema = z.object({
  lessonId: cuid,
  sectionIndex: z.coerce.number().int().min(0).max(200).nullable().optional(),
  content: nonEmpty(10000, "Note content"),
}).strict();

export const noteUpdateSchema = z.object({
  sectionIndex: z.coerce.number().int().min(0).max(200).nullable().optional(),
  content: nonEmpty(10000, "Note content").optional(),
}).strict();

// ------------------------------------------------------ community & comms
export const discussionCreateSchema = z.object({
  title: nonEmpty(200, "Title"),
  body: nonEmpty(10000, "Body"),
  lessonId: cuid.optional(),
  courseId: cuid.optional(),
  pinned: z.coerce.boolean().optional(),
}).strict();

export const discussionUpdateSchema = z.object({
  title: nonEmpty(200, "Title").optional(),
  body: nonEmpty(10000, "Body").optional(),
  status: zDiscussionStatus.optional(),
  pinned: z.coerce.boolean().optional(),
}).strict();

export const commentCreateSchema = z.object({
  discussionId: cuid,
  body: nonEmpty(5000, "Comment"),
  parentId: cuid.optional(),
}).strict();

export const commentUpdateSchema = z.object({
  body: nonEmpty(5000, "Comment").optional(),
}).strict();

export const notificationCreateSchema = z.object({
  userId: cuid,
  kind: zNotificationKind,
  title: nonEmpty(200, "Title"),
  body: nonEmpty(2000, "Body"),
  link: optionalText(300),
}).strict();

// ------------------------------------------------------------------- AI
export const aiConversationCreateSchema = z.object({
  title: optionalText(160),
  contextLessonId: cuid.optional(),
}).strict();

export const aiMessageSendSchema = z.object({
  content: nonEmpty(4000, "Message"),
}).strict();

// --------------------------------------------------------------- misc
export const glossaryCreateSchema = z.object({
  term: nonEmpty(80, "Term"),
  definition: nonEmpty(3000, "Definition"),
  example: optionalText(4000),
  subjectId: cuid.optional(),
  relatedTermIds: z.array(zSlug).max(20).optional(),
}).strict();

export const glossaryUpdateSchema = z.object({
  term: nonEmpty(80, "Term").optional(),
  definition: nonEmpty(3000, "Definition").optional(),
  example: optionalText(4000).nullable().optional(),
  subjectId: cuid.nullable().optional(),
  relatedTermIds: z.array(zSlug).max(20).nullable().optional(),
}).strict();

export const certificateIssueSchema = z.object({
  courseId: cuid,
  userId: cuid.optional(), // admins may issue on behalf; students omit
}).strict();

export const roleUpdateSchema = z.object({
  name: nonEmpty(60, "Name").optional(),
  description: optionalText(400),
  rank: z.coerce.number().int().min(0).max(1000).optional(),
}).strict();

export const enrollmentUpdateSchema = z.object({
  status: zEnrollmentStatus,
}).strict();

export const userRoleSchema = z.object({
  roleKey: zRoleKey,
}).strict();
