/**
 * @dataverse/content — public API.
 *
 * The content system that powers every course:
 *   compileContent()   load + validate + registry-join the content tree
 *   validateContent() the full quality gate (rules + verify + lifecycle)
 *   scaffoldLesson()  archetype-correct lesson skeletons from the registry
 *
 * Consumed by prisma/seed-modules/content-registry.ts (DB projection),
 * tests/unit/content.test.ts (CI gate) and src/lib/content/cli.ts.
 */
export { parseYaml, parseYamlMap, YamlParseError } from "./yaml";
export { ARCHETYPE_PROFILES, headingToId, MIN_TOTAL_WORDS, NO_VERIFY_SECTIONS, VERIFY_SECTIONS, profileOf } from "./sections";
export type { Archetype, SectionId, SectionRequirement, SectionSpec } from "./sections";
export {
  frontmatterSchema, lessonDataSchema, glossarySchema, manifestSchema, exerciseSchema,
  knowledgeCheckItemSchema, terminologyEntrySchema, reviewRecordSchema, verificationSchema,
  isCodeExercise, SCHOOL_ARCHETYPE, ARCHETYPES,
  type LessonFrontmatter, type LessonData, type ContentManifest, type Glossary,
  type Exercise, type CodeExercise, type ProseExercise, type KnowledgeCheckItem,
} from "./schemas";
export { parseLessonMdx, sectionize, splitFrontmatter, wordCount, bulletItems, numberedItems, linksOf } from "./sectionize";
export type { ParsedLessonFile, SectionNode, FencedBlock } from "./sectionize";
export { compileContent, defaultContentRoot, lessonProseWords } from "./compile";
export type { CompiledLesson, ContentBundle, Finding, SubjectCoverage } from "./compile";
export { validateContent, validateLessonsIn, buildContext, reportOf } from "./rules";
export type { ValidationReport, RuleContext } from "./rules";
export { verifyLesson, runPython, normalizeOutput } from "./verify";
export type { VerifyOptions, RunOutcome } from "./verify";
export { lifecycleFindings, canPublish, subjectPublishDecision, REQUIRED_APPROVERS, LIFECYCLE_STATES } from "./lifecycle";
export type { LifecycleState, ReviewRole, PublishDecision } from "./lifecycle";
export { scaffoldLesson, lessonMdxTemplate, lessonYamlTemplate } from "./templates";
export type { ScaffoldOptions } from "./templates";
