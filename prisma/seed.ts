/**
 * DataVerse Academy — seed entry point.
 *
 *   bun prisma/seed.ts
 *
 * Phases:
 *   1. roles + permissions       5. glossary + achievements
 *   2. users                     6. simulated learner journeys (real services)
 *   3. subjects + courses        7. community threads + AI conversation
 *   4. learning paths            8. summary
 */
import { db } from "../src/lib/db";
import { hashPassword } from "../src/auth/password";
import { ROLE_PERMISSIONS, ROLE_LABELS, ROLE_RANK, type RoleKey } from "../src/lib/domain/constants";
import { notify } from "../src/lib/services/notifications";
import { logger } from "../src/lib/logger";
import { wipe, createCourse, lessonIndex } from "./seed-modules/lib";
import { PYTHON_FOUNDATIONS } from "./seed-modules/content-python";
import {
  DATA_ANALYSIS_PANDAS,
  SQL_FOUNDATIONS,
  STATISTICS_ESSENTIALS,
  INTRO_ML,
  CAREER_DATA_ANALYST,
} from "./seed-modules/content-courses";
import { simulatePriya, simulateLeo, simulateAna, seedCommunity } from "./seed-modules/simulation";
import { seedRegistryContent } from "./seed-modules/content-registry";

async function main() {
  logger.info("seed_start", { phase: "wipe" });
  await wipe();

  // -------------------------------------------------- 1) roles & permissions
  const permissionByKey = new Map<string, string>();
  for (const key of Object.values(ROLE_PERMISSIONS.ADMINISTRATOR)) {
    const doc = await db.permission.create({
      data: { key, description: `Allows: ${key.replace(":", " ")}` },
    });
    permissionByKey.set(key, doc.id);
  }
  logger.info("seed_permissions", { count: permissionByKey.size });

  const roleByKey = new Map<RoleKey, string>();
  for (const key of Object.keys(ROLE_PERMISSIONS) as RoleKey[]) {
    const role = await db.role.create({
      data: {
        key,
        name: ROLE_LABELS[key],
        description:
          key === "GUEST" ? "Unauthenticated visitors — public catalog browsing only."
          : key === "STUDENT" ? "Enrolls in courses, tracks progress, earns certificates."
          : key === "INSTRUCTOR" ? "Authors content, reviews submissions, sees course analytics."
          : key === "CONTENT_EDITOR" ? "Manages the full content pipeline including publishing."
          : "Full platform administration.",
        rank: ROLE_RANK[key],
      },
    });
    roleByKey.set(key, role.id);
    await db.rolePermission.createMany({
      data: ROLE_PERMISSIONS[key].map((p) => ({ roleId: role.id, permissionId: permissionByKey.get(p)! })),
    });
  }
  logger.info("seed_roles", { count: roleByKey.size });

  // ------------------------------------------------------------- 2) users
  const mkUser = async (
    email: string,
    name: string,
    role: RoleKey,
    password: string,
    extra?: { headline?: string; bio?: string }
  ) =>
    db.user.create({
      data: {
        email,
        name,
        passwordHash: await hashPassword(password),
        roleId: roleByKey.get(role)!,
        headline: extra?.headline,
        bio: extra?.bio,
      },
    });

  const admin = await mkUser("admin@dataverse.academy", "Dana Admin", "ADMINISTRATOR", "Admin123!", {
    bio: "Platform administrator. Keeps the lights on and the data clean.",
  });
  const maya = await mkUser("maya@dataverse.academy", "Maya Chen", "INSTRUCTOR", "Instructor123!", {
    headline: "Lead instructor — Python & pandas",
    bio: "Former analytics lead at a fintech unicorn. Obsessed with making code feel doable for absolute beginners.",
  });
  const alex = await mkUser("alex@dataverse.academy", "Alex Rivera", "INSTRUCTOR", "Instructor123!", {
    headline: "Instructor — SQL, statistics & ML",
    bio: "Data scientist by day, query optimizer by night. Taught SQL to 400+ career switchers.",
  });
  const sam = await mkUser("sam@dataverse.academy", "Sam Okafor", "CONTENT_EDITOR", "Editor123!", {
    headline: "Content editor — curriculum quality",
    bio: "Turns instructor drafts into lessons that read like a good explainer, not a manual.",
  });
  const priya = await mkUser("student@dataverse.academy", "Priya Sharma", "STUDENT", "Student123!", {
    headline: "Career switcher → data analyst",
    bio: "Ex-marketing coordinator learning Python to escape spreadsheet purgatory.",
  });
  const leo = await mkUser("leo@dataverse.academy", "Leo Martins", "STUDENT", "Student123!", {
    headline: "CS student minoring in data",
    bio: "Collecting certificates and interesting datasets in equal measure.",
  });
  const ana = await mkUser("ana@dataverse.academy", "Ana Sofia Reyes", "STUDENT", "Student123!", {
    headline: "First week in the Academy",
    bio: "Journalist exploring data journalism. Everything here is new and slightly magical.",
  });
  logger.info("seed_users", { count: 7 });

  // ------------------------------------------------- 3) subjects & courses
  const mkSubject = (slug: string, title: string, description: string, color: string, icon: string, ownerId: string, order: number) =>
    db.subject.create({ data: { slug, title, description, color, icon, ownerId, orderIndex: order } });

  await mkSubject("python-programming", "Python Programming", "The language of data: syntax, collections, functions and files.", "#10b981", "code", maya.id, 1);
  await mkSubject("data-analysis", "Data Analysis", "Cleaning, transforming and summarizing tables with pandas.", "#14b8a6", "table", maya.id, 2);
  await mkSubject("sql-databases", "SQL & Databases", "Querying relational databases: SELECT, JOIN, GROUP BY.", "#f59e0b", "database", alex.id, 3);
  await mkSubject("statistics-math", "Statistics & Math", "Descriptive stats, distributions and statistical thinking.", "#f43f5e", "sigma", alex.id, 4);
  await mkSubject("machine-learning-ai", "Machine Learning & AI", "What models learn, how they are evaluated, how they fail.", "#ea580c", "brain", alex.id, 5);
  await mkSubject("career", "Career Skills", "Portfolio, resume and interview craft for data roles.", "#64748b", "briefcase", maya.id, 6);

  await createCourse(PYTHON_FOUNDATIONS);
  await createCourse(DATA_ANALYSIS_PANDAS);
  await createCourse(SQL_FOUNDATIONS);
  await createCourse(STATISTICS_ESSENTIALS);
  await createCourse(INTRO_ML);
  await createCourse(CAREER_DATA_ANALYST);
  logger.info("seed_courses", { lessons: lessonIndex.size });

  // --------------------------- 3r) registry curriculum (content pipeline)
  // The content/ tree is the source of truth for lesson content; the
  // curriculum registry (src/lib/curriculum/data) defines the structure.
  // Courses seed as DRAFT until every registry lesson has published
  // content — learner-visible counts are never inflated.
  const registryStats = await seedRegistryContent({
    adminId: admin.id,
    editorId: sam.id,
    instructorBySchool: { A: maya.id, C: alex.id, E: maya.id },
  });
  logger.info("seed_registry_content", registryStats);

  // ------------------------------------------------------ 4) learning paths
  const mkPath = async (slug: string, title: string, description: string, audience: string, status: string, courseSlugs: string[]) => {
    const path = await db.learningPath.create({
      data: { slug, title, description, audience, status },
    });
    let order = 0;
    for (const courseSlug of courseSlugs) {
      order += 1;
      const course = await db.course.findUniqueOrThrow({ where: { slug: courseSlug } });
      await db.learningPathCourse.create({
        data: { learningPathId: path.id, courseId: course.id, orderIndex: order },
      });
    }
    return path;
  };

  await mkPath(
    "data-analyst-path",
    "Data Analyst Career Path",
    "The complete route from zero code to job-ready data analyst: Python, SQL, pandas analysis and the career craft to present it.",
    "Career switchers",
    "PUBLISHED",
    ["python-foundations", "sql-foundations", "data-analysis-pandas", "career-data-analyst"]
  );
  await mkPath(
    "ml-foundations-path",
    "Machine Learning Foundations Path",
    "Programming and statistical thinking first, then a guided tour of machine learning concepts — the honest way into ML.",
    "Aspiring ML practitioners",
    "DRAFT",
    ["python-foundations", "statistics-essentials", "intro-machine-learning"]
  );
  logger.info("seed_learning_paths", { count: 2 });

  // ------------------------------------------------------------- 5) glossary
  const subjectBySlug = new Map(
    (await db.subject.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id])
  );

  const glossary: [string, string, string?, string?][] = [
    ["Variable", "A named label for a value. `revenue = 4200` binds the name revenue to 4200 until reassigned.", "python-programming", "revenue = 4200"],
    ["Data Type", "The kind of value a variable holds — int, float, str, bool. Types decide what operations are legal.", "python-programming", 'type(3.14)  # <class "float">'],
    ["Integer (int)", "A whole number without a decimal point, positive or negative.", "python-programming", "units = 30"],
    ["Float", "A number with a decimal point. Division in Python 3 always produces one: 7 / 2 is 3.5.", "python-programming", "price = 2.5"],
    ["String (str)", "Text: a sequence of characters wrapped in quotes.", "python-programming", 'label = "matcha"'],
    ["Boolean", "A truth value: True or False. Produced by comparisons and consumed by if statements.", "python-programming", "10 > 3  # True"],
    ["List", "An ordered, changeable collection. Indexing starts at 0; slicing copies a range.", "python-programming", "sales = [120, 85, 200]"],
    ["Dictionary", "A collection of key-value pairs. Keys are unique labels; values are looked up by key.", "python-programming", 'prices = {"apple": 1.2}'],
    ["Function", "A named, reusable block of logic that takes inputs and returns a result.", "python-programming", "def total(a, b): return a + b"],
    ["Loop", "Repetition: a for loop visits each item of a collection; a while loop repeats until a condition flips.", "python-programming", "for store in stores: ..."],
    ["Conditional", "A branch in program flow: if / elif / else chooses which block runs based on a boolean.", "python-programming", "if x > 5: print('big')"],
    ["CSV", "Comma-Separated Values — the simplest tabular file format and the analyst's daily bread.", "data-analysis", "name,sales\\nA,10"],
    ["DataFrame", "The pandas table: labeled columns over indexed rows. A programmable spreadsheet.", "data-analysis", "pd.DataFrame({'a': [1, 2]})"],
    ["Series", "A single labeled column of a DataFrame — pandas' one-dimensional array.", "data-analysis", 'df["revenue"]'],
    ["Null Value", "A missing value (NaN in pandas, NULL in SQL). Deciding drop vs fill is a judgment call you must document.", "data-analysis", "df.isna().sum()"],
    ["Data Cleaning", "Fixing nulls, wrong types, duplicates and outliers so analysis rests on solid ground.", "data-analysis", "df.dropna(subset=['revenue'])"],
    ["GROUP BY", "Collapse rows into one summary row per group — in SQL and in pandas alike.", "sql-databases", "GROUP BY category"],
    ["JOIN", "Combine tables by matching keys. INNER keeps matches; LEFT keeps all left rows.", "sql-databases", "JOIN products p ON p.id = s.product_id"],
    ["Primary Key", "The column (or columns) that uniquely identify a row of a table.", "sql-databases", "users.id"],
    ["Query", "A statement asking a database for data — SELECT is its most famous form.", "sql-databases", "SELECT * FROM sales;"],
    ["Mean", "The arithmetic average: sum divided by count. Sensitive to outliers.", "statistics-math", "mean([40, 42, 45])"],
    ["Median", "The middle value of sorted data. Robust to outliers — preferred for skewed data like income.", "statistics-math", "median([1, 2, 100])  # 2"],
    ["Standard Deviation", "The typical distance of values from the mean — the standard measure of spread.", "statistics-math", "stdev([2, 4, 4, 4, 5])"],
    ["Distribution", "How values are spread across possible outcomes — the shape behind the summary numbers.", "statistics-math", "df['price'].hist()"],
    ["Feature", "An input variable a model learns from — one measurable property of an example.", "machine-learning-ai", "size, rooms, location"],
    ["Model Training", "Adjusting a model's parameters so its predictions fit the training data.", "machine-learning-ai", "model.fit(X_train, y_train)"],
    ["Overfitting", "Memorizing the training data instead of learning the pattern — great on train, terrible on new data.", "machine-learning-ai", "train acc 0.99, test acc 0.61"],
  ];

  for (const [term, definition, subjectSlug, example] of glossary) {
    await db.glossaryTerm.create({
      data: {
        term,
        slug: term.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        definition,
        example,
        subjectId: subjectSlug ? subjectBySlug.get(subjectSlug) : null,
        createdById: sam.id,
      },
    }).catch((err) => logger.warn("glossary_seed_skipped", { term, err: String(err) }));
  }
  logger.info("seed_glossary", { count: glossary.length });

  // -------------------------------------------------------- 5b) achievements
  const achievements: { code: string; title: string; description: string; icon: string; points: number; criteria: object }[] = [
    { code: "first_lesson", title: "First Steps", description: "Complete your very first lesson.", icon: "footprints", points: 10, criteria: { type: "lesson_completed", threshold: 1 } },
    { code: "lessons_10", title: "Double Digits", description: "Complete ten lessons across the Academy.", icon: "layers", points: 20, criteria: { type: "lesson_completed", threshold: 10 } },
    { code: "streak_5", title: "On a Roll", description: "Complete five lessons in a row within one course.", icon: "flame", points: 15, criteria: { type: "streak", threshold: 5 } },
    { code: "streak_10", title: "Unstoppable", description: "Complete ten lessons in a row within one course.", icon: "zap", points: 30, criteria: { type: "streak", threshold: 10 } },
    { code: "quiz_ace", title: "Quiz Ace", description: "Score 100% on any checkpoint quiz.", icon: "target", points: 25, criteria: { type: "quiz_perfect", threshold: 100 } },
    { code: "first_exercise", title: "Green Tests", description: "Pass your first coding exercise with all tests green.", icon: "check-circle-2", points: 15, criteria: { type: "exercise_passed", threshold: 1 } },
    { code: "exercise_10", title: "Code Cadet", description: "Pass ten coding exercises.", icon: "code", points: 40, criteria: { type: "exercise_passed", threshold: 10 } },
    { code: "course_finisher", title: "Course Finisher", description: "Complete an entire course and earn your certificate.", icon: "award", points: 50, criteria: { type: "course_completed", threshold: 1 } },
    { code: "courses_3", title: "Polymath", description: "Complete three full courses.", icon: "graduation-cap", points: 100, criteria: { type: "course_completed", threshold: 3 } },
  ];
  for (const a of achievements) {
    await db.achievement.create({ data: a });
  }
  logger.info("seed_achievements", { count: achievements.length });

  // --------------------------------------- 6) learner journeys via services
  const p = await simulatePriya(priya.id);
  logger.info("seed_journey", p);
  const l = await simulateLeo(leo.id);
  logger.info("seed_journey", l);
  const a = await simulateAna(ana.id);
  logger.info("seed_journey", a);

  // ------------------------------------------------ 6b) project submission
  const pythonCourse = await db.course.findUniqueOrThrow({ where: { slug: "python-foundations" } });
  const capstone = await db.project.findFirstOrThrow({ where: { courseId: pythonCourse.id } });
  await db.projectSubmission.create({
    data: {
      projectId: capstone.id,
      userId: leo.id,
      repoUrl: "https://github.com/leo-martins/sales-summary",
      notes: "Dropped 14 malformed rows (negative units) and documented each decision in the README. Best-selling product turned out to be matcha, not coffee as I first guessed.",
      status: "APPROVED",
      score: 92,
      feedback:
        "Excellent defensive parsing and the write-up reads like a junior analyst already. Next time add a sanity check on the total before printing the report — you computed it twice, which risks drift. Well earned: APPROVED, 92/100.",
      reviewedById: maya.id,
      reviewedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      submittedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    },
  });
  await notify(leo.id, "COURSE", "Project review: Capstone approved", "Maya approved your Sales Summary capstone with 92/100. Read the feedback in your project workspace.", "/academy/projects");

  // ------------------------------------------------------- 7) community
  await seedCommunity(priya.id, leo.id, ana.id, maya.id);

  // ------------------------------------------------- 8) welcome notices
  for (const [id, name] of [
    [priya.id, "Priya"],
    [leo.id, "Leo"],
    [ana.id, "Ana"],
  ] as const) {
    await notify(
      id,
      "SYSTEM",
      `Welcome to DataVerse Academy, ${name}!`,
      "Your dashboard tracks progress, streaks and achievements. Start with the Data Analyst Career Path for a guided route, or explore the catalog.",
      "/academy/dashboard"
    );
  }
  await notify(
    priya.id,
    "REMINDER",
    "Your next lesson is waiting",
    "You're 7 of 12 lessons into Python Foundations — Dictionaries is next (about 20 minutes).",
    "/academy/lessons"
  );

  // ------------------------------------------------------------ summary
  const [users, courses, lessons, exercises, quizzes, enrollments, progress, attempts, submissions, certs, notes] =
    await Promise.all([
      db.user.count(),
      db.course.count(),
      db.lesson.count(),
      db.exercise.count(),
      db.quiz.count(),
      db.enrollment.count(),
      db.lessonProgress.count(),
      db.assessmentAttempt.count(),
      db.submission.count(),
      db.certificate.count(),
      db.studentNote.count(),
    ]);

  logger.info("seed_complete", {
    users, courses, lessons, exercises, quizzes, enrollments,
    lessonProgress: progress, attempts, submissions, certificates: certs, notes,
  });
  console.log("\n✅ Seed complete:");
  console.log(`   users=${users} courses=${courses} lessons=${lessons} exercises=${exercises} quizzes=${quizzes}`);
  console.log(`   enrollments=${enrollments} lessonProgress=${progress} attempts=${attempts} submissions=${submissions}`);
  console.log(`   certificates=${certs}`);
  console.log("\n   Demo accounts (password shown):");
  console.log("   admin@dataverse.academy / Admin123!      (ADMINISTRATOR)");
  console.log("   maya@dataverse.academy  / Instructor123! (INSTRUCTOR)");
  console.log("   alex@dataverse.academy  / Instructor123! (INSTRUCTOR)");
  console.log("   sam@dataverse.academy   / Editor123!     (CONTENT_EDITOR)");
  console.log("   student@dataverse.academy / Student123!  (STUDENT — mid-course)");
  console.log("   leo@dataverse.academy    / Student123!   (STUDENT — certified)");
  console.log("   ana@dataverse.academy    / Student123!   (STUDENT — brand new)");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
