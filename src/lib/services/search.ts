import { db } from "@/lib/db";
import { AppError } from "@/lib/api/errors";

/**
 * Cross-entity search — powers the global search bar.
 *
 * Catalog results (courses, lessons, glossary) are public; discussions
 * require authentication. Each bucket is capped so the merged result stays
 * useful. SQLite `contains` is ASCII-case-insensitive, which covers the
 * catalogue; Postgres swaps in ILIKE (see DATABASE_DESIGN.md).
 */
export type SearchBucket = "courses" | "lessons" | "glossary" | "discussions";

export async function searchAll(q: string, authenticated: boolean, perBucket = 5) {
  if (q.trim().length < 2) {
    throw new AppError("BAD_REQUEST", "'q' must be at least 2 characters");
  }
  const term = q.trim();

  const [courses, lessons, glossary, discussions] = await Promise.all([
    db.course.findMany({
      where: { status: "PUBLISHED", OR: [{ title: { contains: term } }, { subtitle: { contains: term } }, { description: { contains: term } }] },
      select: { id: true, slug: true, title: true, subtitle: true, level: true, subject: { select: { title: true, color: true } }, _count: { select: { enrollments: true } } },
      take: perBucket,
      orderBy: { enrollments: { _count: "desc" } },
    }),
    db.lesson.findMany({
      where: { status: "PUBLISHED", OR: [{ title: { contains: term } }, { summary: { contains: term } }] },
      select: { id: true, title: true, summary: true, estimatedMinutes: true, chapter: { select: { title: true, module: { select: { title: true, course: { select: { id: true, slug: true, title: true } } } } } } },
      take: perBucket,
    }),
    db.glossaryTerm.findMany({
      where: { OR: [{ term: { contains: term } }, { definition: { contains: term } }] },
      select: { id: true, slug: true, term: true, definition: true, subject: { select: { title: true, color: true } } },
      take: perBucket,
    }),
    authenticated
      ? db.discussion.findMany({
          where: { OR: [{ title: { contains: term } }, { body: { contains: term } }] },
          select: { id: true, title: true, status: true, createdAt: true, user: { select: { name: true } }, _count: { select: { comments: true } } },
          take: perBucket,
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return {
    query: term,
    buckets: {
      courses: { total: courses.length, items: courses },
      lessons: { total: lessons.length, items: lessons },
      glossary: { total: glossary.length, items: glossary },
      discussions: { total: discussions.length, items: discussions },
    },
    totalHits: courses.length + lessons.length + glossary.length + discussions.length,
  };
}
