/**
 * Seed simulation — learner journeys executed through the REAL services:
 * enrollment, lesson progress rollups, quiz attempts (graded server-side),
 * exercise submissions (executed + graded), certificates, achievements
 * and notifications all emerge from the actual business logic.
 */
import { db } from "../../src/lib/db";
import { enrollUser } from "../../src/lib/services/enrollment";
import { recordLessonProgress } from "../../src/lib/services/progress";
import { startAttempt, submitAttempt } from "../../src/lib/services/assessment";
import { submitSolution } from "../../src/lib/services/submissions";
import { lessonIndex } from "./lib";
import { logger } from "../../src/lib/logger";

type Answer = { questionId: string; selectedOptionIds?: string[]; text?: string };

async function buildAnswers(quizId: string, wrongCount: number): Promise<Answer[]> {
  const quiz = await db.quiz.findUniqueOrThrow({
    where: { id: quizId },
    include: { questions: { orderBy: { orderIndex: "asc" }, include: { answerOptions: { orderBy: { orderIndex: "asc" } } } } },
  });
  return quiz.questions.map((q, i) => {
    const correct = q.answerOptions.filter((o) => o.isCorrect).map((o) => o.id);
    const wrong = q.answerOptions.filter((o) => !o.isCorrect).map((o) => o.id);
    if (i < wrongCount && wrong.length > 0) {
      return { questionId: q.id, selectedOptionIds: [wrong[0]] };
    }
    return { questionId: q.id, selectedOptionIds: correct };
  });
}

async function takeQuiz(userId: string, quizId: string, wrongCount = 0) {
  const attempt = await startAttempt(userId, quizId);
  const answers = await buildAnswers(quizId, wrongCount);
  return submitAttempt(userId, attempt.id, answers);
}

function lesson(slug: string) {
  const entry = lessonIndex.get(slug);
  if (!entry) throw new Error(`Unknown lesson slug in seed simulation: ${slug}`);
  return entry;
}

async function completeLesson(userId: string, slug: string, minutes: number) {
  await recordLessonProgress(userId, lesson(slug).id, {
    status: "COMPLETED",
    timeSpentMinutes: minutes,
  });
}

async function visitLesson(userId: string, slug: string, minutes: number) {
  await recordLessonProgress(userId, lesson(slug).id, {
    status: "IN_PROGRESS",
    timeSpentMinutes: minutes,
  });
}

// ------------------------------------------------------------- journeys

/**
 * Priya (student) — mid-way through Python Foundations:
 * 7/12 lessons, one quiz failed then aced, one exercise failed then passed.
 */
export async function simulatePriya(priyaId: string) {
  const pythonCourse = await db.course.findUniqueOrThrow({ where: { slug: "python-foundations" } });
  await enrollUser(priyaId, pythonCourse.id);

  await completeLesson(priyaId, "why-python", 12);
  await completeLesson(priyaId, "first-program", 18);
  await completeLesson(priyaId, "variables", 16);
  await completeLesson(priyaId, "numbers-strings", 22);

  // quiz 1: perfect
  const nsQuiz = lesson("numbers-strings").quizIds[0];
  if (nsQuiz) await takeQuiz(priyaId, nsQuiz, 0);

  // exercise 1: wrong text first, then correct
  const fp = lesson("first-program").exercises[0];
  await submitSolution(priyaId, fp.id, 'print("Hello World")', fp.language); // FAILED
  await submitSolution(priyaId, fp.id, fp.solutionCode, fp.language); // PASSED

  await completeLesson(priyaId, "booleans", 14);
  await completeLesson(priyaId, "conditionals", 20);

  // quiz 2: one wrong (66.7% -> fail at 80), retake -> perfect
  const condQuiz = lesson("conditionals").quizIds[0];
  if (condQuiz) {
    await takeQuiz(priyaId, condQuiz, 1);
    await takeQuiz(priyaId, condQuiz, 0);
  }

  await completeLesson(priyaId, "lists", 25);

  // lists exercise: first pass
  const listsEx = lesson("lists").exercises[0];
  await submitSolution(priyaId, listsEx.id, listsEx.solutionCode, listsEx.language);

  return { status: "Priya: 7/12 lessons, quizzes aced, 1 exercise recovered" };
}

/**
 * Leo (student) — completes Python Foundations (certificate auto-issued),
 * starts pandas (3 lessons + checkpoint passed) and SQL (1 lesson).
 */
export async function simulateLeo(leoId: string) {
  const [pythonCourse, pandasCourse, sqlCourse] = await Promise.all([
    db.course.findUniqueOrThrow({ where: { slug: "python-foundations" } }),
    db.course.findUniqueOrThrow({ where: { slug: "data-analysis-pandas" } }),
    db.course.findUniqueOrThrow({ where: { slug: "sql-foundations" } }),
  ]);

  await enrollUser(leoId, pythonCourse.id);

  const pythonLessons = [
    "why-python", "first-program", "variables", "numbers-strings",
    "booleans", "conditionals", "lists", "dictionaries",
    "functions", "loops", "reading-csv", "sales-summary",
  ];
  const minutes = [10, 15, 14, 18, 12, 17, 21, 19, 23, 18, 27, 31];

  for (let i = 0; i < pythonLessons.length; i++) {
    await completeLesson(leoId, pythonLessons[i], minutes[i]);

    // checkpoints along the way
    if (pythonLessons[i] === "numbers-strings") {
      const quizId = lesson("numbers-strings").quizIds[0];
      if (quizId) await takeQuiz(leoId, quizId, 0);
      const ex = lesson("first-program").exercises[0];
      await submitSolution(leoId, ex.id, ex.solutionCode, ex.language);
    }
    if (pythonLessons[i] === "conditionals") {
      const quizId = lesson("conditionals").quizIds[0];
      if (quizId) await takeQuiz(leoId, quizId, 0);
    }
    if (pythonLessons[i] === "dictionaries") {
      const quizId = lesson("dictionaries").quizIds[0];
      if (quizId) {
        await takeQuiz(leoId, quizId, 2); // 50% -> fail (needs 75)
        await takeQuiz(leoId, quizId, 0); // perfect retake
      }
    }
    if (pythonLessons[i] === "functions") {
      const ex = lesson("functions").exercises[0];
      await submitSolution(leoId, ex.id, ex.solutionCode, ex.language);
    }
    if (pythonLessons[i] === "loops") {
      const quizId = lesson("loops").quizIds[0];
      if (quizId) await takeQuiz(leoId, quizId, 0);
    }
    if (pythonLessons[i] === "reading-csv") {
      const ex = lesson("reading-csv").exercises[0];
      await submitSolution(leoId, ex.id, ex.solutionCode, ex.language);
    }
  }
  // sales-summary quiz (final checkpoint)
  const finalQuiz = lesson("sales-summary").quizIds[0];
  if (finalQuiz) await takeQuiz(leoId, finalQuiz, 0);

  // ---- course finished: enrollment COMPLETED + certificate auto-issued

  await enrollUser(leoId, pandasCourse.id);
  await completeLesson(leoId, "meet-the-dataframe", 22);
  await completeLesson(leoId, "selecting-data", 26);
  await completeLesson(leoId, "missing-data", 28);
  const mdEx = lesson("meet-the-dataframe").exercises[0];
  await submitSolution(leoId, mdEx.id, mdEx.solutionCode, mdEx.language);
  const mdQuiz = lesson("missing-data").quizIds[0];
  if (mdQuiz) await takeQuiz(leoId, mdQuiz, 0);

  await enrollUser(leoId, sqlCourse.id);
  await completeLesson(leoId, "select-basics", 15);

  return { status: "Leo: Python complete (certified), pandas 3/8, SQL started" };
}

/** Ana (student) — brand new: enrolled, first two lessons in progress. */
export async function simulateAna(anaId: string) {
  const pythonCourse = await db.course.findUniqueOrThrow({ where: { slug: "python-foundations" } });
  await enrollUser(anaId, pythonCourse.id);
  await visitLesson(anaId, "why-python", 11);
  await visitLesson(anaId, "first-program", 6);
  return { status: "Ana: enrolled, 2 lessons in progress" };
}

// ------------------------------------------------------------ community

export async function seedCommunity(priyaId: string, leoId: string, anaId: string, mayaId: string) {
  // discussion on the Lists lesson
  const listsLesson = lesson("lists");
  const d1 = await db.discussion.create({
    data: {
      userId: anaId,
      lessonId: listsLesson.id,
      title: "List vs dictionary — when do I use which?",
      body:
        "I finished the Lists lesson but in my own notes app I don't know if the tags of a note should be a list or a dict. How do you decide?",
      status: "OPEN",
      views: 42,
    },
  });
  const c1 = await db.comment.create({
    data: { discussionId: d1.id, userId: priyaId, body: "My rule of thumb: if you only need to loop over the values, use a list. If you need to look something up by name — like price['banana'] — use a dict." },
  });
  await db.comment.create({
    data: { discussionId: d1.id, userId: mayaId, body: "Exactly what Priya said. One more signal: position matters → list; label matters → dictionary. And note you can nest them: a list of dicts is basically a tiny DataFrame — foreshadowing the pandas course ;)", parentId: c1.id },
  });

  // course-level discussion
  const pythonCourse = await db.course.findUniqueOrThrow({ where: { slug: "python-foundations" } });
  const d2 = await db.discussion.create({
    data: {
      userId: leoId,
      courseId: pythonCourse.id,
      title: "Capstone idea: bike-sharing data in my city",
      body: "For the capstone I want to analyze the public bike-sharing CSV my city publishes (station, duration, subscription type). Anyone done something similar and can warn me about data quality traps?",
      status: "RESOLVED",
      pinned: true,
      views: 128,
    },
  });
  await db.comment.create({
    data: {
      discussionId: d2.id,
      userId: mayaId,
      body: "Great choice. Watch for: duplicated station names with different spellings, durations of 0 (maintenance repositioning), and subscription types in three languages. Deduplicate first, then group. Marking resolved after your submission — it was excellent.",
    },
  });

  // glossary-adjacent discussion
  const dictLesson = lesson("dictionaries");
  const d3 = await db.discussion.create({
    data: {
      userId: priyaId,
      lessonId: dictLesson.id,
      title: "get() vs [] in real projects",
      body: "The lesson says get() returns a default instead of crashing. When would you still use brackets on purpose?",
      status: "OPEN",
      views: 17,
    },
  });
  await db.comment.create({
    data: { discussionId: d3.id, userId: leoId, body: "If a missing key means your data is broken, crashing early with [] is actually the honest choice. get() is for when missing is a normal, expected case." },
  });

  // sample AI tutor conversation
  const variablesLesson = lesson("variables");
  const conversation = await db.aIConversation.create({
    data: {
      userId: priyaId,
      title: "Why does revenue = revenue + 800 work?",
      contextLessonId: variablesLesson.id,
    },
  });
  await db.aIMessage.createMany({
    data: [
      {
        conversationId: conversation.id,
        role: "USER",
        content: "I don't get why revenue = revenue + 800 works. Isn't revenue already taken by the old value? It feels like math class where x = x + 1 was illegal.",
      },
      {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content:
          "Nice catch — that's exactly the right thing to be suspicious about! Here's a guiding question instead of the answer: in `revenue = revenue + 800`, which side of the `=` do you think Python reads FIRST — the left or the right? Try predicting, then run it with two print statements: one before and one after the line. What do you observe?",
      },
      {
        conversationId: conversation.id,
        role: "USER",
        content: "Oh! It printed 4200 before and 5000 after. So the right side uses the OLD value and THEN stores it?",
      },
      {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content:
          "You just discovered assignment semantics on your own — that's exactly it. Next step: what do you think happens with a = 5; b = a; a = 10 — is b now 5 or 10? Write it down, run it, and tell me what surprised you.",
      },
    ],
  });

  logger.info("seed_community", { discussions: 3, comments: 4, aiConversation: 1 });
}
