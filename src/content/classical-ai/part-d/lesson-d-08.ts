/**
 * Lesson d-08 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_D_08: ClassicalLesson = {

  slug: "d-08",
  title: "Knowledge Graphs and Ontologies",
  minutes: 30,
  summary:
    "Logic as engineering: triples, schemas, inheritance and queries — what graph databases enforce and what they quietly don't.",
  kind: "concept",
  objectives: [
    "Represent knowledge as subject-predicate-object triples",
    "Read an ontology: classes, domain/range constraints, subsumption",
    "Distinguish what a schema enforces from what it merely documents",
    "Say where knowledge graphs and logic each win",
  ],
  why: "The knowledge graph is where the ideas of this subject meet the systems the industry actually runs: search engines' entity panels, enterprise data fabrics and recommendation pipelines are all triple stores wearing product names. The engineering trade is deliberate and honest: graphs give up logic's deduction for scale and inspectability — a billion triples join in milliseconds, but 'everything the graph implies' is not a query a graph database can answer. Knowing exactly which side of that line your question sits on is the difference between a knowledge engineer and a triple plumber.",
  blocks: [
    {
      kind: "text",
      text: "Strip first-order logic to its atoms and you get **triples**: (subject, predicate, object) — Ada teaches Programming, Programming covers Recursion, Ada advises Bilal. A knowledge graph is a set of such triples, nothing more; its power comes from what you build on top: a schema that constrains, and queries that join.",
    },
    {
      kind: "knowledgeGraph",
      title: "An academic domain as a knowledge graph",
      graph: {
        nodes: [
          { id: "ada", label: "Ada", sub: "Professor", x: 18, y: 22 },
          { id: "grace", label: "Grace", sub: "Professor", x: 62, y: 12 },
          { id: "prog", label: "Programming", sub: "Course", x: 44, y: 38 },
          { id: "nlp", label: "Symbolic NLP", sub: "Course", x: 82, y: 36 },
          { id: "dv", label: "DataVerse", sub: "University", x: 12, y: 62 },
          { id: "bilal", label: "Bilal", sub: "PhDStudent", x: 40, y: 68 },
          { id: "chen", label: "Chen", sub: "MScStudent", x: 72, y: 72 },
          { id: "planner", label: "RoutePlanner", sub: "Paper", x: 22, y: 88 },
        ],
        edges: [
          { from: "ada", to: "prog", label: "teaches" },
          { from: "grace", to: "nlp", label: "teaches" },
          { from: "ada", to: "dv", label: "affiliatedWith" },
          { from: "grace", to: "dv", label: "affiliatedWith" },
          { from: "ada", to: "bilal", label: "advises" },
          { from: "bilal", to: "planner", label: "authorOf" },
          { from: "ada", to: "planner", label: "authorOf" },
          { from: "chen", to: "nlp", label: "enrolledIn" },
          { from: "bilal", to: "prog", label: "teachingAssistantFor" },
          { from: "prog", to: "nlp", label: "prerequisiteOf" },
        ],
        caption:
          "Eight entities, ten typed relations: the whole department, machine-readable. Node subtitles are the entity types the schema defines.",
      },
      queries: [
        "Which professors teach a course that is a prerequisite of Symbolic NLP?",
        "Who co-authored a paper with their own advisor?",
        "Which PhD students TA for a course their advisor teaches?",
        "List every course reachable from Programming through prerequisiteOf chains (transitivity!).",
      ],
      schemaNote:
        "The schema states: teaches has domain Professor and range Course; advises has domain Professor and range PhDStudent; PhDStudent ⊑ Person and Professor ⊑ Person. A triple storing teaches(ada, bilal) would violate the range constraint — IF the store enforces ranges, which bare triple stores do not.",
    },
    { kind: "heading", text: "The schema: what it enforces, what it documents" },
    {
      kind: "text",
      text: "An **ontology** is the knowledge graph's type system: classes for entities (Professor, Course), domain and range constraints for relations (teaches: Professor → Course), and subsumption — PhDStudent ⊑ Person, so every PhD-student fact is also a person fact. Here is the honest ledger: a bare triple store enforces NOTHING (any triple is storable); schema-aware stores reject domain/range violations on write; and subsumption-backed queries — 'all persons affiliated with DataVerse' — require the engine to REASON over ⊑ chains, which is deduction, not lookup. The moment your query needs inference (transitivity, inheritance, implied facts), you have left the graph database and rejoined this subject's logic.",
    },
    {
      kind: "propositions",
      title: "The schema, said in logic",
      entries: [
        { formula: "\\forall x \\ (Professor(x) \\rightarrow Person(x))", name: "subsumption", reading: "⊑ is implication over classes: every professor IS a person, and every query about persons must include them.", tone: "law" },
        { formula: "\\forall x, y\\ (teaches(x, y) \\rightarrow Professor(x) \\wedge Course(y))", name: "domain and range", reading: "The constraint as a logical claim — enforced schemas make it true by rejection; unenforced schemas merely print it.", tone: "law" },
        { formula: "\\forall x, y\\ (ancestorOf(x, y) \\leftrightarrow parentOf(x, y) \\vee \\exists z (parentOf(x, z) \\wedge ancestorOf(z, y)))", name: "transitive closure, defined", reading: "Ancestor-hood is a RECURSIVE rule, not a stored relation: computing it is inference, every time.", tone: "law" },
      ],
      caption:
        "Everything a knowledge graph 'knows beyond its triples' is exactly the formulas its schema could not store — the boundary between data and deduction, drawn precisely.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "The silent gap",
      text: "Product literature blurs the line between storing knowledge and reasoning over it. The test is mechanical: if answering your query requires WALKING more triples than you wrote — transitivity, inheritance chains, rule application — the graph store alone cannot answer it; something (a rule engine, an OWL reasoner, or code you wrote) is doing logic on top. That something is where correctness lives or dies, and it is invisible in the architecture diagram.",
    },
    {
      kind: "table",
      title: "Where each formalism wins",
      headers: ["", "Logic (FOL + resolution)", "Knowledge graph (triples + schema)"],
      rows: [
        ["Core operation", "deduction: entailment, refutation", "lookup and join: pattern matching"],
        ["Scale", "thousands of clauses, then it strains", "billions of triples, routinely"],
        ["Answers questions that are…", "implied by what is written", "literally written"],
        ["Failure mode", "intractability", "confident silence: no match ≠ no fact"],
        ["Your subject's home", "Parts D & E: provers, planners", "this lesson: engineered knowledge"],
      ],
      caption: "The two are complements, not competitors: graphs store what is known; logic derives what follows. Production systems chain them.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "d-08-e1",
      exerciseKind: "predict-output",
      prompt:
        "A tiny triple query in Python: given the lesson's graph as (subject, predicate, object) triples, count how many distinct subjects are objects of an advises triple AND subjects of an authorOf triple — i.e., advisees who write papers. Run the program and type its output.",
      expectedOutput: "1",
      solution: "1",
      explanation:
        "Only Bilal is both advised (by Ada) and an author (of RoutePlanner). One join, no inference — a question the graph store answers alone. Add 'and whose co-author is the advisor' and you have a two-hop join, still no logic; add 'descendants of a course through prerequisite chains' and you need transitivity — inference territory.",
      concepts: ["triple store", "joins"],
    },
    {
      kind: "exercise",
      id: "d-08-e2",
      exerciseKind: "trace",
      prompt:
        "Your product manager asks: 'Show every person in the DataVerse graph.' Write the query two ways — as a bare-triple lookup, and as a schema-aware query over the class hierarchy — and explain why the answers differ.",
      solution:
        "Bare triples: there is no `type: Person` triple for anyone — the graph stores Professor and PhDStudent types. The naive query returns NOTHING. Schema-aware: Person is a superclass of Professor, PhDStudent, MScStudent (⊑ chains), so the query expands: every entity typed as any subclass of Person — Ada, Grace, Bilal, Chen. The answers differ because the second query performs inference: class membership implied by subsumption, not stored anywhere. One line of ⊑ in the schema is worth a thousand stored type-triples — IF something walks the hierarchy at query time.",
      explanation:
        "This is the silent gap in one exercise: 'show all persons' is either an inference problem (schema) or a data-hygiene problem (denormalize types into the graph). Knowing which one your system chose is the engineering.",
      concepts: ["subsumption", "inference vs lookup"],
    },
    {
      kind: "exercise",
      id: "d-08-e3",
      exerciseKind: "concept-check",
      prompt:
        "The team decides to enforce teaches' range constraint (Course) on writes. A month later, a report shows teaches(Ada, Bilal) in production anyway. Most likely explanation?",
      options: [
        { text: "The ontology is wrong — range should be Person", correct: false, feedback: "Arguably a modeling question, but the DATA violated the declared constraint; the model was not the thing that failed." },
        { text: "Enforcement was per-write in one ingestion path; another path (a bulk load, a legacy script, a manual insert) bypassed it — unenforced paths are the standard leak", correct: true, feedback: "Correct — schema enforcement is only as wide as its narrowest write path. The honest fix is validating at the boundary AND sweeping periodically for violations." },
        { text: "Subsumption made it legal: PhDStudent ⊑ Person ⊑ ... Course?", correct: false, feedback: "No hierarchy makes a student a course — ⊑ chains are acyclic and typed." },
        { text: "Triples cannot be deleted, so old data survived", correct: false, feedback: "Triple stores update fine; immutability is not the issue." },
      ],
      solution: "Constraints live at write paths; every unguarded path is a hole. Validate at the boundary and audit the stock, not just the flow.",
      explanation: "Schema enforcement is an architectural promise, not a law of storage — the audit query ('find triples violating declared ranges') is a knowledge-graph's unit test.",
      concepts: ["schema enforcement", "data hygiene"],
    },
  ],
  terms: [
    {
      term: "triple",
      definition: "The atom of a knowledge graph: (subject, predicate, object) — one fact, joinable with every other fact sharing an endpoint.",
    },
    {
      term: "ontology",
      definition: "The graph's type system: classes, domain/range constraints on relations, and subsumption (⊑) links between classes.",
    },
    {
      term: "subsumption",
      definition: "Class inclusion — PhDStudent ⊑ Person — the hierarchy that makes 'all persons' a query about implied, not stored, membership.",
    },
    {
      term: "confident silence",
      definition: "A graph database's no-match answer: absence of a triple is not evidence of absence of the fact — unless the schema and ingestion promise it is.",
    },
  ],
  mistakes: [
    {
      mistake: "Treating no-match as no-fact.",
      why: "Triple stores answer what is WRITTEN; the world contains what is TRUE. A missing prerequisiteOf triple means the data is incomplete, not that the courses are unrelated.",
      fix: "Pair every 'negative' answer with its provenance: is absence meaningful (closed world, validated writes) or accidental (open world, partial ingestion)?",
    },
    {
      mistake: "Storing what the schema implies.",
      why: "Denormalizing implied facts (every Person-type triple next to every Professor-type triple) makes queries fast and updates inconsistent — change the hierarchy and the stored copies go stale silently.",
      fix: "Denormalize deliberately, with a rebuild pipeline; or answer from the schema at query time and pay the inference. Both are defensible; neither is free.",
    },
  ],
  takeaways: [
    "Knowledge graphs are logic's atoms industrialized: triples join at scale, schemas constrain, ontologies organize.",
    "The enforcement ledger: bare stores constrain nothing; validated writes constrain paths; subsumption answers require inference.",
    "If answering needs more triples than you wrote — transitivity, inheritance — you are doing logic on top of the graph, and that layer owns correctness.",
    "Graphs and logic are complements: storage versus derivation, scale versus depth, confident silence versus honest entailment.",
    "The audit query — find schema violations in the stock — is the knowledge graph's unit test.",
  ],
  quiz: [
    {
      id: "d-08-q1",
      prompt: "'List all ancestors of Ada' against a graph storing only parentOf triples requires:",
      options: [
        { text: "A join — graph stores do this natively", correct: false, feedback: "One join gives parents; ancestors need the transitive CLOSURE — chains of arbitrary length." },
        { text: "Transitive closure: either recursive query evaluation or a rule — inference, not lookup", correct: true, feedback: "Correct — the ancestor relation is defined, not stored; every answer is computed through logic the store itself does not possess." },
        { text: "Nothing — ancestorOf triples must exist", correct: false, feedback: "Then the query is a lookup, but you have moved the inference to ingestion time — and inherited its staleness problem." },
        { text: "A stronger schema language", correct: false, feedback: "OWL can DEFINE transitivity — but something must still REASON over the definition." },
      ],
      explanation: "Transitivity is the everyday boundary: the moment answers require walking rules, not rows, you have crossed from data to deduction.",
    },
    {
      id: "d-08-q2",
      prompt: "What does PhDStudent ⊑ Person license that a bare triple store cannot do alone?",
      options: [
        { text: "Rejecting PhDStudent triples for non-persons", correct: false, feedback: "Range constraints do that job; ⊑ alone constrains nothing at write time." },
        { text: "Answering person-queries with PhD-student entities — class membership by implication", correct: true, feedback: "Correct — subsumption is inference: the PhD-student facts imply person facts without storing them." },
        { text: "Faster joins on the person class", correct: false, feedback: "Indexing does speed; ⊑ does meaning." },
        { text: "Converting triples to clauses for resolution", correct: false, feedback: "Possible pipeline, but not what ⊑ itself licenses — that conversion is an engineering choice, not the semantics." },
      ],
      explanation: "⊑ is one-directional implication between classes — the smallest possible ontology rule, and already beyond lookup.",
    },
  ],

};
