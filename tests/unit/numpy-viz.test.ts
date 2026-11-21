/**
 * Unit tests for the NumPy course visualization logic (pure functions) and
 * the NumPy course content contract.
 */
import { describe, expect, test } from "bun:test";
import {
  axisReduce,
  broadcastAdd,
  broadcastShapes,
  cellRuns,
  flatIndex,
  formatShape,
  parseShape,
  reshapePanels,
  selectionResult,
  selectionResult1d,
  shapeSize,
  vizGrid,
  vizShape,
} from "@/lib/numpycourse/vizlogic";
import { NUMPY_COURSE } from "@/content/numpy";

// ---------------------------------------------------------------------------
// shape helpers
// ---------------------------------------------------------------------------

describe("vizShape / vizGrid", () => {
  test("1D data", () => {
    expect(vizShape([1, 2, 3])).toEqual([3]);
    expect(vizGrid([1, 2, 3])).toEqual([[1, 2, 3]]);
  });
  test("2D data", () => {
    expect(vizShape([[1, 2], [3, 4], [5, 6]])).toEqual([3, 2]);
    expect(vizGrid([[1, 2], [3, 4]])).toEqual([[1, 2], [3, 4]]);
  });
  test("flatIndex row-major", () => {
    expect(flatIndex([3, 4], 0, 0)).toBe(0);
    expect(flatIndex([3, 4], 0, 3)).toBe(3);
    expect(flatIndex([3, 4], 1, 0)).toBe(4);
    expect(flatIndex([3, 4], 2, 3)).toBe(11);
  });
  test("shapeSize", () => {
    expect(shapeSize([3, 4])).toBe(12);
    expect(shapeSize([2, 2, 3])).toBe(12);
    expect(shapeSize([7])).toBe(7);
  });
  test("formatShape", () => {
    expect(formatShape([3, 4])).toBe("(3, 4)");
    expect(formatShape([12])).toBe("(12,)");
  });
});

describe("parseShape", () => {
  test("accepts sensible input", () => {
    expect(parseShape("3, 4")).toEqual([3, 4]);
    expect(parseShape("(3,4)")).toEqual([3, 4]);
    expect(parseShape("4")).toEqual([4]);
    expect(parseShape("2 2 3")).toEqual([2, 2, 3]);
    expect(parseShape("8, 8")).toEqual([8, 8]);
  });
  test("rejects nonsense", () => {
    expect(parseShape("")).toBeNull();
    expect(parseShape("abc")).toBeNull();
    expect(parseShape("0")).toBeNull();
    expect(parseShape("9")).toBeNull(); // dims above 8 rejected
    expect(parseShape("1,1,1,1")).toBeNull(); // more than 3 dims
    expect(parseShape("8, 8, 8")).toBeNull(); // size > 64
    expect(parseShape("3.5")).toBeNull();
    expect(parseShape("-1")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// broadcasting
// ---------------------------------------------------------------------------

describe("broadcastShapes — NumPy rules", () => {
  test("identical shapes", () => {
    const r = broadcastShapes([3, 4], [3, 4]);
    expect(r.ok).toBe(true);
    expect(r.result).toEqual([3, 4]);
    expect(r.dims[1].rule).toBe("equal");
  });

  test("column vector + row vector -> outer (3,1)+(1,4)=(3,4)", () => {
    const r = broadcastShapes([3, 1], [1, 4]);
    expect(r.ok).toBe(true);
    expect(r.result).toEqual([3, 4]);
    expect(r.dims.map((d) => d.rule)).toEqual(["stretch-a", "stretch-b"]);
  });

  test("missing leading dimension counts as 1", () => {
    const r = broadcastShapes([4], [3, 4]);
    expect(r.ok).toBe(true);
    expect(r.result).toEqual([3, 4]);
    expect(r.dims[1].rule).toBe("missing-a");
  });

  test("scalar-like (1,) broadcasts with anything", () => {
    const r = broadcastShapes([1], [5, 3, 2]);
    expect(r.ok).toBe(true);
    expect(r.result).toEqual([5, 3, 2]);
  });

  test("incompatible dims fail with a readable reason", () => {
    const r = broadcastShapes([3, 4], [3, 5]);
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("could not be broadcast");
    // the offending dimension is the last one (fromRight = 1)
    expect(r.dims.length).toBe(1);
    expect(r.dims[0].a).toBe(4);
    expect(r.dims[0].b).toBe(5);
  });

  test("the classic (3,) + (3,1) failure", () => {
    // (3,) right-aligns as (1, 3); (3, 1): dim 3 vs 1 stretches, 1 vs 3 stretches -> (3, 3) ok!
    const r = broadcastShapes([3], [3, 1]);
    expect(r.ok).toBe(true);
    expect(r.result).toEqual([3, 3]);
  });
});

describe("broadcastAdd", () => {
  test("outer sum of column + row", () => {
    const out = broadcastAdd([[10], [20], [30]], [[1, 2, 3, 4]]);
    expect(out).toEqual([
      [11, 12, 13, 14],
      [21, 22, 23, 24],
      [31, 32, 33, 34],
    ]);
  });
  test("row + full matrix (1,3) + (2,3)", () => {
    const out = broadcastAdd([[100, 200, 300]], [[1, 2, 3], [4, 5, 6]]);
    expect(out).toEqual([
      [101, 202, 303],
      [104, 205, 306],
    ]);
  });
  test("incompatible shapes return null", () => {
    expect(broadcastAdd([[1, 2, 3]], [[1, 2], [3, 4]])).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// reshape fill order
// ---------------------------------------------------------------------------

describe("reshapePanels", () => {
  const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  test("flat 1D target", () => {
    const panels = reshapePanels(values, [12]);
    expect(panels).toHaveLength(1);
    expect(panels[0].rows).toHaveLength(1);
    expect(panels[0].rows[0].map((c) => c.value)).toEqual(values);
    expect(panels[0].rows[0].map((c) => c.flat)).toEqual(values);
  });

  test("(3, 4) fill order is row-major", () => {
    const panels = reshapePanels(values, [3, 4]);
    expect(panels).toHaveLength(1);
    const flats = panels[0].rows.flat().map((c) => c.flat);
    expect(flats).toEqual([...Array(12).keys()]);
    expect(panels[0].rows[1][2].value).toBe(6); // row 1, col 2
    expect(panels[0].rows[1][2].flat).toBe(6);
  });

  test("(2, 2, 3) produces two panels", () => {
    const panels = reshapePanels(values, [2, 2, 3]);
    expect(panels).toHaveLength(2);
    expect(panels[0].rows.flat().map((c) => c.value)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(panels[1].rows.flat().map((c) => c.value)).toEqual([6, 7, 8, 9, 10, 11]);
  });

  test("wrong value count -> no panels", () => {
    expect(reshapePanels([1, 2, 3], [2, 2])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// axis reductions
// ---------------------------------------------------------------------------

describe("axisReduce", () => {
  const grid = [
    [1, 2, 3],
    [4, 5, 6],
  ];

  test("axis=0 collapses rows (one value per column)", () => {
    const r = axisReduce(grid, "sum", 0);
    expect(r.values).toEqual([5, 7, 9]);
  });

  test("axis=1 collapses columns (one value per row)", () => {
    const r = axisReduce(grid, "sum", 1);
    expect(r.values).toEqual([6, 15]);
  });

  test("axis=None collapses everything", () => {
    const r = axisReduce(grid, "sum", null);
    expect(r.scalar).toBe(21);
  });

  test("mean and max", () => {
    expect(axisReduce(grid, "mean", 0).values).toEqual([2.5, 3.5, 4.5]);
    expect(axisReduce(grid, "max", 1).values).toEqual([3, 6]);
    expect(axisReduce(grid, "prod", null).scalar).toBe(720);
  });
});

// ---------------------------------------------------------------------------
// slice selections
// ---------------------------------------------------------------------------

describe("selectionResult", () => {
  const grid = [
    [10, 11, 12, 13],
    [20, 21, 22, 23],
  ];

  test("single cell reads like numpy indexing", () => {
    expect(selectionResult(grid, [[1, 2]])).toBe("22");
  });
  test("multiple cells read in visit order", () => {
    expect(selectionResult(grid, [[1, 1], [1, 2], [1, 3]])).toBe("[21, 22, 23]");
    expect(selectionResult(grid, [[0, 1], [1, 1]])).toBe("[11, 21]");
  });
  test("out of range is flagged", () => {
    expect(selectionResult(grid, [[5, 5]])).toBe("(invalid cells)");
  });
  test("1D selections", () => {
    expect(selectionResult1d([10, 20, 30], [[0, 2]])).toBe("30");
    expect(selectionResult1d([10, 20, 30], [[0, 0], [0, 2]])).toBe("[10, 30]");
  });
});

describe("cellRuns", () => {
  test("consecutive cells merge into runs", () => {
    expect(cellRuns([[0, 1], [0, 2], [0, 3]])).toEqual([{ row: 0, from: 1, to: 3 }]);
    expect(cellRuns([[0, 0], [1, 0], [2, 0]])).toEqual([
      { row: 0, from: 0, to: 0 },
      { row: 1, from: 0, to: 0 },
      { row: 2, from: 0, to: 0 },
    ]);
    expect(cellRuns([[0, 0], [0, 2]])).toEqual([
      { row: 0, from: 0, to: 0 },
      { row: 0, from: 2, to: 2 },
    ]);
  });
});

// ---------------------------------------------------------------------------
// course content contract
// ---------------------------------------------------------------------------

describe("NumPy course content", () => {
  test("has all ten parts A-J", () => {
    expect(NUMPY_COURSE.parts.map((p) => p.letter)).toEqual([
      "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
    ]);
  });

  test("every lesson id is unique and follows the letter-number pattern", () => {
    const seen = new Set<string>();
    for (const part of NUMPY_COURSE.parts) {
      for (const lesson of part.lessons) {
        expect(seen.has(lesson.slug)).toBe(false);
        seen.add(lesson.slug);
        expect(lesson.slug).toMatch(new RegExp(`^${part.letter.toLowerCase()}-\\d\\d$`));
      }
    }
  });

  test("every exercise id is unique and prefixed with its part letter", () => {
    const seen = new Set<string>();
    for (const part of NUMPY_COURSE.parts) {
      for (const ex of part.exercises) {
        expect(seen.has(ex.id)).toBe(false);
        seen.add(ex.id);
        expect(ex.id.startsWith(`${part.letter.toLowerCase()}-`)).toBe(true);
      }
    }
  });

  test("every lesson teaches with real structure", () => {
    for (const part of NUMPY_COURSE.parts) {
      for (const lesson of part.lessons) {
        expect(lesson.blocks.length).toBeGreaterThanOrEqual(5);
        expect(lesson.objectives.length).toBeGreaterThanOrEqual(3);
        expect(lesson.terms.length).toBeGreaterThanOrEqual(3);
        expect(lesson.mistakes.length).toBeGreaterThanOrEqual(2);
        expect(lesson.takeaways.length).toBeGreaterThanOrEqual(3);
        expect(lesson.quiz.length).toBeGreaterThanOrEqual(2);
        expect(lesson.why.length).toBeGreaterThanOrEqual(200);
        // every quiz question has exactly one correct option
        for (const q of lesson.quiz) {
          expect(q.options.filter((o) => o.correct).length).toBe(1);
        }
      }
    }
  });

  test("every part has tiered exercises, an assessment and a project", () => {
    for (const part of NUMPY_COURSE.parts) {
      expect(part.exercises.filter((e) => e.tier === "beginner").length).toBeGreaterThanOrEqual(3);
      expect(part.exercises.filter((e) => e.tier === "intermediate").length).toBeGreaterThanOrEqual(3);
      expect(part.exercises.filter((e) => e.tier === "advanced").length).toBeGreaterThanOrEqual(3);
      expect(part.assessment.length).toBeGreaterThanOrEqual(8);
      expect(part.project.requirements.length).toBeGreaterThanOrEqual(5);
      expect(part.project.steps.length).toBeGreaterThanOrEqual(5);
    }
  });

  test("every functionDoc card is complete (all ten aspects)", () => {
    let cards = 0;
    for (const part of NUMPY_COURSE.parts) {
      for (const lesson of part.lessons) {
        for (const block of lesson.blocks) {
          if (block.kind !== "functionDoc") continue;
          cards++;
          expect(block.purpose.length).toBeGreaterThan(20);
          expect(block.signature.length).toBeGreaterThan(5);
          expect(block.params.length).toBeGreaterThanOrEqual(1);
          expect(block.returns.description.length).toBeGreaterThan(10);
          expect(block.example.length).toBeGreaterThan(10);
          if (!block.exampleExpectError) {
            expect(block.exampleOutput).toBeDefined();
          }
          expect(block.commonMistakes.length).toBeGreaterThanOrEqual(1);
          expect(block.related.length).toBeGreaterThanOrEqual(2);
          expect(block.applications.length).toBeGreaterThanOrEqual(2);
        }
      }
    }
    expect(cards).toBeGreaterThanOrEqual(60);
  });

  test("interactive visualizations are structurally sound", () => {
    let viz = 0;
    for (const part of NUMPY_COURSE.parts) {
      for (const lesson of part.lessons) {
        for (const block of lesson.blocks) {
          if (block.kind !== "arrayViz") continue;
          viz++;
          expect(block.title.length).toBeGreaterThan(5);
          if (block.mode === "explore" || block.mode === "axis") expect(block.data).toBeDefined();
          if (block.mode === "slice") {
            expect(block.data).toBeDefined();
            expect(block.selections?.length).toBeGreaterThan(0);
          }
          if (block.mode === "reshape") {
            expect(block.data).toBeDefined();
            expect(block.targets?.length).toBeGreaterThan(0);
          }
          if (block.mode === "broadcast") expect(block.presets?.length).toBeGreaterThan(0);
        }
      }
    }
    expect(viz).toBeGreaterThanOrEqual(12);
  });

  test("tryIt starters never import anything exotic — numpy + stdlib only", () => {
    for (const part of NUMPY_COURSE.parts) {
      for (const lesson of part.lessons) {
        for (const block of lesson.blocks) {
          if (block.kind !== "tryIt") continue;
          const imports = [...block.code.matchAll(/^\s*import\s+(\w+)/gm)].map((m) => m[1]);
          const fromImports = [...block.code.matchAll(/^\s*from\s+(\w+)/gm)].map((m) => m[1]);
          for (const mod of [...imports, ...fromImports]) {
            expect(["numpy", "time", "math", "random", "statistics", "itertools", "functools", "collections"]).toContain(mod);
          }
        }
      }
    }
  });
});
