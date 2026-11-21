-- Content pipeline: per-option teaching feedback.
-- The content system's knowledge checks carry feedback for every option
-- (lesson.yaml → knowledgeCheck[].options[].feedback); this column stores
-- it so the reader can explain why each distractor is wrong.

ALTER TABLE "AnswerOption" ADD COLUMN "feedback" TEXT;
