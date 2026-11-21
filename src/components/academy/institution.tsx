"use client";

/**
 * The institutional pages — Platform Guide (#/docs), Terms of Use
 * (#/terms) and Privacy Notice (#/privacy). One shared editorial layout;
 * every fact on these pages describes the platform as it actually is
 * (registry numbers are computed live, every link is a real destination).
 */
import { ArrowRight, BookOpen, FlaskConical, FolderGit2, GraduationCap, LineChart, Map, MessagesSquare, ShieldCheck } from "lucide-react";
import { curriculum } from "@/lib/curriculum/data";
import { DISPLAY_COURSES } from "@/lib/academy/student";

/* ------------------------------------------------------------- the layout */

function InstitutionPage({
  eyebrow,
  title,
  lede,
  children,
  navigate,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children: React.ReactNode;
  navigate: (hash: string) => void;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="pb-8 pt-2 sm:pt-4">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="t-display mt-2 text-ink">{title}</h1>
        <p className="t-lede mt-4">{lede}</p>
      </header>
      <div className="space-y-10 border-t border-border-subtle pt-10">{children}</div>
      <button
        type="button"
        onClick={() => navigate("#/")}
        className="link-dv mt-12 inline-flex items-center gap-1.5 text-sm"
      >
        ← Back to the academy
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="t-sub text-ink">{title}</h2>
      <div className="dv-lesson-text mt-3 space-y-3">{children}</div>
    </section>
  );
}

/** An inline hop to a real destination — institutional pages link, never dead-end. */
function Go({ hash, children, navigate }: { hash: string; children: React.ReactNode; navigate: (h: string) => void }) {
  return (
    <button type="button" onClick={() => navigate(hash)} className="link-dv font-sans text-[0.92em] font-medium">
      {children}
    </button>
  );
}

/* --------------------------------------------------------- platform guide */

export function PlatformGuide({ navigate }: { navigate: (hash: string) => void }) {
  const manifest = curriculum.stats();
  const courseCount = DISPLAY_COURSES.length;

  return (
    <InstitutionPage
      eyebrow="Platform documentation"
      title="The Platform Guide"
      lede="How DataVerse Academy works — the curriculum, the engines, the assessment system, your progress and your account. Every number below is computed live from the curriculum registry."
      navigate={navigate}
    >
      <Section title="The curriculum">
        <p>
          The academy is organized as <strong>{manifest.subjects} prerequisite-mapped subjects</strong> across ten
          schools — Programming, Mathematics, Statistics, Data Analysis, Python Libraries, Machine Learning,
          Deep Learning &amp; AI, Data Visualization &amp; BI, Career Development and Classical AI. Subjects form a
          dependency graph: a subject unlocks only when its hard prerequisites are mastered, so the order in which
          you meet ideas is always honest.
        </p>
        <p>
          Two <Go hash="#/roadmap" navigate={navigate}>learning paths</Go> sequence the registry for you — the
          recommended Data Scientist roadmap and the generated Full Academy Tour. Browse everything freely in the{" "}
          <Go hash="#/explore" navigate={navigate}>catalogue</Go>.
        </p>
      </Section>

      <Section title="Learning — lessons and programmes">
        <p>
          {courseCount} fully-authored interactive programmes carry the core of the curriculum: the complete Python,
          SQL &amp; PostgreSQL, NumPy, Mathematics and Classical AI courses, plus the Data Visualization course.
          Each is a digital textbook — structured parts, lessons with worked examples, tiered exercises, chapter
          assessments and a project in every part.
        </p>
        <p>
          Every lesson has a <Go hash="#/study/python-a-01" navigate={navigate}>study view</Go> that posts real
          progress as you complete sections.
        </p>
      </Section>

      <Section title="The engines — nothing is simulated">
        <p>
          The practice environments are real engines compiled to WebAssembly and running locally in your browser:
          CPython (the Python Laboratory and the <Go hash="#/playground" navigate={navigate}>Python Playground</Go>),
          PostgreSQL via PGlite (the <Go hash="#/sql/lab" navigate={navigate}>SQL Lab</Go>, with realistic seeded
          databases) and the full NumPy stack. Nothing you write is sent anywhere, and nothing you write can touch
          a production system.
        </p>
        <p>
          Every program output you see on a lesson page was executed on the real engine and verified before it
          reached the page. First use of an engine downloads it once (tens of megabytes); your browser caches it
          afterwards.
        </p>
      </Section>

      <Section title="Practice and projects">
        <p>
          The <Go hash="#/labs" navigate={navigate}>Learning Laboratories</Go> give you seven disciplines with
          instructions, an editor, run controls and test results in one interface. When you are ready to build,
          every course part closes with a project, the registry defines {manifest.projects} more across the
          subjects, and the <Go hash="#/dap" navigate={navigate}>Data Analyst Project Academy</Go> adds thirty-six
          end-to-end engagements across twelve industries — guided or independent, with instructor-grade
          evaluation. The <Go hash="#/sql/cases" navigate={navigate}>SQL case studies</Go> apply the same idea to
          six business investigations.
        </p>
      </Section>

      <Section title="Assessment">
        <p>
          The <Go hash="#/assessments" navigate={navigate}>Assessment Center</Go> holds checkpoints, timed quizzes,
          final exams and server-graded coding challenges. Quizzes mix multiple-choice, numerical and short
          answers; coding challenges are graded on the server against real test cases. Results write to your
          account and feed your mastery record.
        </p>
      </Section>

      <Section title="Progress, placement and your account">
        <p>
          As a guest, your lesson progress is stored privately in your own browser (local storage) — nothing
          leaves your device. A free account adds the personalized{" "}
          <Go hash="#/dashboard" navigate={navigate}>dashboard</Go> (streaks, skills, next actions), server-side
          progress, assessment history and certificates, and conversations with{" "}
          <Go hash="#/tutor" navigate={navigate}>Ada</Go>.
        </p>
        <p>
          Already know a subject? The <Go hash="#/placement" navigate={navigate}>Placement Hub</Go> offers a
          placement test for every subject in the registry, and the{" "}
          <Go hash="#/math/diagnostic" navigate={navigate}>mathematics diagnostic</Go> finds your exact starting
          level.
        </p>
      </Section>

      <Section title="Ada, the AI tutor">
        <p>
          Ada is the academy&apos;s personal tutor. Her teaching contract is Socratic: she answers with the
          lesson you are studying in mind, breaks problems into smaller steps, ends every reply with exactly one
          concrete next step, and never hands over a quiz answer or an exercise solution. Conversations are saved
          to your account.
        </p>
      </Section>

      <nav className="grid grid-cols-1 gap-3 rounded-xl border border-border-subtle bg-surface p-4 shadow-e1 sm:grid-cols-2" aria-label="Guide shortcuts">
        {[
          { hash: "#/explore", label: "Browse the catalogue", icon: BookOpen },
          { hash: "#/roadmap", label: "Open the learning paths", icon: Map },
          { hash: "#/labs", label: "Enter the laboratories", icon: FlaskConical },
          { hash: "#/projects", label: "See the projects", icon: FolderGit2 },
          { hash: "#/assessments", label: "Visit the Assessment Center", icon: GraduationCap },
          { hash: "#/placement", label: "Test out of a subject", icon: LineChart },
          { hash: "#/tutor", label: "Meet Ada", icon: MessagesSquare },
          { hash: "#/career", label: "Open the Career Centre", icon: ArrowRight },
        ].map((l) => (
          <button
            key={l.hash}
            type="button"
            onClick={() => navigate(l.hash)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-2 transition-colors hover:bg-surface-subtle hover:text-ink"
          >
            <l.icon className="h-4 w-4 shrink-0 text-ink-3" />
            {l.label}
          </button>
        ))}
      </nav>
    </InstitutionPage>
  );
}

/* ------------------------------------------------------------- terms of use */

export function TermsOfUse({ navigate }: { navigate: (hash: string) => void }) {
  return (
    <InstitutionPage
      eyebrow="Legal"
      title="Terms of Use"
      lede="Plain terms for a plain-spoken platform. These terms govern your use of DataVerse Academy as a learner or a guest."
      navigate={navigate}
    >
      <Section title="1 · About the platform">
        <p>
          DataVerse Academy is an educational platform for data science and artificial intelligence: a curriculum
          of lessons, laboratories, projects and assessments that run in your browser or on the platform&apos;s
          servers. The <Go hash="#/docs" navigate={navigate}>Platform Guide</Go> describes how each part works.
        </p>
      </Section>
      <Section title="2 · Your account">
        <p>
          An account requires an email address and a password. Keep them accurate and secure; you are responsible
          for activity under your account. Accounts are personal — one human, one account — and may be suspended
          for abuse.
        </p>
      </Section>
      <Section title="3 · Acceptable use">
        <p>
          Use the platform for learning. Do not attempt to disrupt the service, probe or attack other accounts,
          or use the laboratories to craft attacks against any system. The engines run sandboxed in your browser
          by design; treat the sandbox as a classroom, not a staging ground.
        </p>
      </Section>
      <Section title="4 · Content and your work">
        <p>
          The curriculum — lessons, exercises, projects, rubrics and assessments — is provided for your personal,
          non-commercial learning. The code and analyses you write in the laboratories and the projects you
          submit remain yours.
        </p>
      </Section>
      <Section title="5 · No warranty">
        <p>
          The platform is provided as-is. Educational content is prepared with care but may contain errors;
          verify anything you intend to rely on professionally. To the fullest extent permitted by law, the
          platform carries no warranty of fitness for a particular purpose.
        </p>
      </Section>
      <Section title="6 · Changes">
        <p>
          The curriculum grows — subjects, lessons and features are added and revised. Material changes to these
          terms will be reflected on this page with a new review date.
        </p>
      </Section>
    </InstitutionPage>
  );
}

/* ------------------------------------------------------------ privacy notice */

export function PrivacyNotice({ navigate }: { navigate: (hash: string) => void }) {
  return (
    <InstitutionPage
      eyebrow="Legal"
      title="Privacy Notice"
      lede="What DataVerse Academy stores, where it stores it, and what it never does. Short, specific and true."
      navigate={navigate}
    >
      <Section title="Guest learning — your browser only">
        <p>
          You can complete entire courses without an account. Guest progress (lessons finished, playground
          history) is stored in your own browser&apos;s local storage. It never leaves your device, and clearing
          your browser data clears it.
        </p>
      </Section>
      <Section title="Account data — on the platform's server">
        <p>
          With an account, the server stores your email address, display name, role, learning progress,
          assessment attempts and submissions, project submissions and your conversations with Ada the tutor.
          This is exactly the data the personalized features run on — nothing more is collected.
        </p>
      </Section>
      <Section title="What the platform does not do">
        <p>
          No third-party trackers. No advertising. No selling or sharing of personal data. Fonts are self-hosted;
          the engines are downloaded from the platform, not a broker. Platform analytics are computed from
          learning records for your own dashboard — there is no cross-site tracking of any kind.
        </p>
      </Section>
      <Section title="Your choices">
        <p>
          You can learn entirely as a guest, or <Go hash="#/dashboard" navigate={navigate}>sign in</Go> to sync
          progress across devices. Signing out leaves guest-mode data in your browser, where it began. To delete
          your account and its data, sign out of every device and clear your browser storage, or ask for removal
          through the account you used to register.
        </p>
      </Section>
      <p className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-subtle px-4 py-3 text-[13px] text-ink-2">
        <ShieldCheck className="h-4 w-4 shrink-0 text-success-text" />
        Last reviewed with the {curriculum.registry.contentVersion} curriculum release.
      </p>
    </InstitutionPage>
  );
}
