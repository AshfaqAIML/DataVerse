import { z } from "zod";

/**
 * DataVerse Academy — domain constants.
 *
 * SQLite (sandbox) has no native ENUM type, so all status-like fields are
 * stored as strings and validated here at the application boundary.
 * When porting to PostgreSQL, each `*_VALUES` tuple maps 1:1 to a Postgres
 * enum (see DATABASE_DESIGN.md).
 */

// ------------------------------------------------------------------ roles
export const ROLE_KEYS = ["GUEST", "STUDENT", "INSTRUCTOR", "CONTENT_EDITOR", "ADMINISTRATOR"] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];
export const zRoleKey = z.enum(ROLE_KEYS);

// ----------------------------------------------------------- permissions
// Canonical permission catalogue: "<resource>:<action>"
export const PERMISSIONS = [
  // catalog (public read)
  "catalog:read",
  // content authoring
  "content:create",
  "content:update",
  "content:delete",
  "content:publish",
  // people
  "user:read",
  "user:update",
  "user:delete",
  "user:manage-role",
  // assessment authoring
  "exercise:manage",
  "quiz:manage",
  // grading & review
  "submission:review",
  "project:review",
  "submission:submit",
  // progress & study aids (own data)
  "progress:write",
  "note:write",
  "bookmark:write",
  // community
  "discussion:moderate",
  // analytics
  "analytics:read-own",
  "analytics:read-all",
  // achievements & certificates
  "certificate:issue",
  "achievement:award",
  // AI tutor
  "ai:use",
  // notifications
  "notification:send",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

/**
 * Static mirror of the RolePermission matrix (also seeded into the DB).
 * The runtime guard resolves permissions through the DB with this as the
 * documented source of truth — see src/auth/rbac.ts.
 */
export const ROLE_PERMISSIONS: Record<RoleKey, readonly Permission[]> = {
  GUEST: ["catalog:read"],
  STUDENT: [
    "catalog:read",
    "submission:submit",
    "progress:write",
    "note:write",
    "bookmark:write",
    "analytics:read-own",
    "ai:use",
  ],
  INSTRUCTOR: [
    "catalog:read",
    "content:create",
    "content:update",
    "exercise:manage",
    "quiz:manage",
    "submission:review",
    "project:review",
    "user:read",
    "analytics:read-all",
    "discussion:moderate",
  ],
  CONTENT_EDITOR: [
    "catalog:read",
    "content:create",
    "content:update",
    "content:delete",
    "content:publish",
    "exercise:manage",
    "quiz:manage",
    "user:read",
    "analytics:read-all",
    "discussion:moderate",
  ],
  ADMINISTRATOR: [...PERMISSIONS], // full catalogue
};

export const ROLE_LABELS: Record<RoleKey, string> = {
  GUEST: "Guest",
  STUDENT: "Student",
  INSTRUCTOR: "Instructor",
  CONTENT_EDITOR: "Content Editor",
  ADMINISTRATOR: "Administrator",
};

export const ROLE_RANK: Record<RoleKey, number> = {
  GUEST: 0,
  STUDENT: 1,
  INSTRUCTOR: 60,
  CONTENT_EDITOR: 70,
  ADMINISTRATOR: 100,
};

// ---------------------------------------------------------------- statuses
export const USER_STATUS = ["ACTIVE", "SUSPENDED", "PENDING"] as const;
export const zUserStatus = z.enum(USER_STATUS);

export const COURSE_STATUS = ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"] as const;
export const zCourseStatus = z.enum(COURSE_STATUS);

export const CONTENT_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export const zContentLevel = z.enum(CONTENT_LEVELS);

export const LESSON_STATUS = ["DRAFT", "IN_REVIEW", "PUBLISHED"] as const;
export const zLessonStatus = z.enum(LESSON_STATUS);

export const SECTION_KINDS = ["TEXT", "CODE", "CALLOUT", "VISUAL", "INTERACTIVE"] as const;
export const zSectionKind = z.enum(SECTION_KINDS);

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
export const zDifficulty = z.enum(DIFFICULTIES);

export const QUESTION_KINDS = ["MCQ", "MULTI_SELECT", "TRUE_FALSE", "SHORT_ANSWER"] as const;
export const zQuestionKind = z.enum(QUESTION_KINDS);

export const ATTEMPT_STATUS = ["IN_PROGRESS", "SUBMITTED", "GRADED", "ABANDONED"] as const;
export const zAttemptStatus = z.enum(ATTEMPT_STATUS);

export const SUBMISSION_STATUS = ["PENDING", "PASSED", "FAILED", "ERROR"] as const;
export const zSubmissionStatus = z.enum(SUBMISSION_STATUS);

export const PROJECT_SUBMISSION_STATUS = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "CHANGES_REQUESTED"] as const;
export const zProjectSubmissionStatus = z.enum(PROJECT_SUBMISSION_STATUS);

export const ENROLLMENT_STATUS = ["ACTIVE", "COMPLETED", "DROPPED"] as const;
export const zEnrollmentStatus = z.enum(ENROLLMENT_STATUS);

export const LESSON_PROGRESS_STATUS = ["IN_PROGRESS", "COMPLETED"] as const;
export const zLessonProgressStatus = z.enum(LESSON_PROGRESS_STATUS);

export const DISCUSSION_STATUS = ["OPEN", "RESOLVED", "ARCHIVED"] as const;
export const zDiscussionStatus = z.enum(DISCUSSION_STATUS);

export const NOTIFICATION_KINDS = ["SYSTEM", "COURSE", "ACHIEVEMENT", "REMINDER", "SOCIAL"] as const;
export const zNotificationKind = z.enum(NOTIFICATION_KINDS);

export const AI_MESSAGE_ROLES = ["USER", "ASSISTANT", "SYSTEM"] as const;
export const zAiMessageRole = z.enum(AI_MESSAGE_ROLES);

export const AI_CONVERSATION_STATUS = ["ACTIVE", "ARCHIVED"] as const;
export const zAiConversationStatus = z.enum(AI_CONVERSATION_STATUS);

// ---------------------------------------------------------------- helpers
export const SUPPORTED_EXERCISE_LANGUAGES = ["python", "javascript"] as const;
export const zExerciseLanguage = z.enum(SUPPORTED_EXERCISE_LANGUAGES);

export const SESSION_COOKIE = "dva_session";
export const SESSION_TTL_DAYS = 30;
