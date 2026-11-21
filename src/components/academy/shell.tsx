"use client";

/**
 * Site shell — the global chrome every route lives inside. Design system v2
 * ("Ink & Indigo", docs/design/STYLE-SWEEP-BLUEPRINT.md).
 *
 *   - brand: the "verse" glyph (an indigo arc resolving into rising data
 *     points) + Fraunces/Inter lockup
 *   - navigation IA: Home · Explore · Learning Paths · Schools ▾ (mega) ·
 *     Projects ▾ · Career Centre · Resources ▾ — every entry a real route
 *   - utilities: search palette (⌘K), theme switch, and an auth-aware
 *     account cluster (guest: Sign in + Start learning · signed in:
 *     Dashboard + avatar menu) over the real /api/auth session
 *   - mobile: a focus-trapped sheet with search, auth state, primary
 *     destinations and grouped accordions (Escape + scrim + scroll lock)
 *   - footer: the institutional sign-off — programmes, learning, practice
 *     and platform columns (guide, terms, privacy) over a hairline
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";import {
  ArrowRight,
  ChevronDown,
  Compass,
  Database,
  FlaskConical,
  FolderGit2,
  GraduationCap,
  Grid3x3,
  LayoutDashboard,
  LineChart,
  Map,
  Menu,
  MessagesSquare,
  Moon,
  Search,
  Shapes,
  Sigma,
  Sun,
  Terminal,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { curriculum } from "@/lib/curriculum/data";
import { DISPLAY_COURSES } from "@/lib/academy/student";
import { SchoolIcon } from "./shared";
import { SearchPalette, SearchTrigger } from "./search";
import { AccountCluster, useSession } from "./account";
import { AuthDialog } from "./auth-dialogs";

/* ------------------------------------------------------------------- brand */

/** The DataVerse mark: an open arc resolving into rising data points. */
export function BrandGlyph({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="dv-glyph-arc" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--dv-blue-500)" />
          <stop offset="60%" stopColor="var(--dv-indigo-500)" />
          <stop offset="100%" stopColor="var(--dv-violet-500)" />
        </linearGradient>
      </defs>
      {/* the open "verse" — an arc that never closes on the left */}
      <path
        d="M25.5 9.2A11.5 11.5 0 1 1 6.2 12.4"
        stroke="url(#dv-glyph-arc)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* data points rising along the implied curve — indigo, one violet highlight */}
      <circle cx="7.4" cy="16.6" r="1.5" fill="var(--dv-indigo-600)" className="dark:[fill:var(--dv-indigo-400)]" />
      <circle cx="10.8" cy="11.4" r="1.9" fill="var(--dv-indigo-600)" className="dark:[fill:var(--dv-indigo-400)]" />
      <circle cx="15.4" cy="8.4" r="2.3" fill="var(--dv-indigo-500)" className="dark:[fill:var(--dv-indigo-300)]" />
      <circle cx="20.4" cy="7.6" r="1.7" fill="var(--dv-violet-500)" className="dark:[fill:var(--dv-indigo-300)]" />
      <circle cx="24.6" cy="9.6" r="1.3" fill="var(--dv-blue-500)" className="dark:[fill:var(--dv-indigo-300)]" />
    </svg>
  );
}

/** Wordmark lockup — glyph + DataVerse (Fraunces) + Academy (small caps). */
function BrandLockup({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex shrink-0 items-center gap-2.5 text-left"
      aria-label="Go to the academy home"
    >
      <BrandGlyph className="h-[26px] w-[26px] transition-transform duration-300 group-hover:-rotate-[8deg]" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-semibold tracking-tight text-ink">
          DataVerse
          <span className="ml-1.5 hidden align-middle text-[10.5px] font-sans font-semibold uppercase tracking-[0.16em] text-ink-3 sm:inline">
            Academy
          </span>
        </span>
        <span className="tabular mt-1 hidden text-[11px] text-ink-3 2xl:block">
          {curriculum.registry.schools.length} schools · {curriculum.registry.subjects.length} subjects · learn by doing
        </span>
      </span>
    </button>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:bg-accent hover:text-ink"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform duration-200 dark:absolute dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100" />
    </button>
  );
}

/* ------------------------------------------------------------------- menus */

/** Navigation-surface abbreviations — the school pages keep full names. */
const SHORT_SCHOOL_NAMES: Record<string, string> = {
  J: "Classical AI",
};

/** One project entry — shared by the desktop dropdown and the mobile sheet. */
const PROJECTS_MENU = [
  {
    hash: "#/projects",
    title: "The Project Record",
    desc: "Every registry project — briefs, tiers, deliverables, rubrics",
    icon: FolderGit2,
    hue: "var(--dv-primary)",
  },
  {
    hash: "#/dap",
    title: "Data Analyst Project Academy",
    desc: "36 engagements across 12 industries, instructor-evaluated",
    icon: LineChart,
    hue: "var(--dv-viz-10)",
  },
  {
    hash: "#/sql/cases",
    title: "SQL Case Studies",
    desc: "Six business investigations on real databases",
    icon: Database,
    hue: "var(--dv-viz-7)",
  },
] as const;

/** The Resources menu — two labelled groups, all real destinations. */
const RESOURCES_GROUPS = [
  {
    label: "Practice",
    items: [
      { hash: "#/labs", title: "Learning Laboratories", desc: "Seven disciplines, one lab interface", icon: FlaskConical, hue: "var(--dv-viz-1)" },
      { hash: "#/visuals", title: "The Visual Library", desc: "31 interactive math & data demonstrations", icon: Shapes, hue: "var(--dv-viz-4)" },
      { hash: "#/playground", title: "Python Playground", desc: "Real CPython, in your browser", icon: Terminal, hue: "var(--dv-viz-1)" },
      { hash: "#/sql/lab", title: "SQL Lab", desc: "Query six PostgreSQL databases", icon: Database, hue: "var(--dv-viz-7)" },
      { hash: "#/numpy/playground", title: "NumPy Playground", desc: "The array sandbox, zero setup", icon: Grid3x3, hue: "var(--dv-viz-5)" },
    ],
  },
  {
    label: "Assessment & guidance",
    items: [
      { hash: "#/assessments", title: "Assessment Center", desc: "Checkpoints, quizzes, finals, challenges", icon: GraduationCap, hue: "var(--dv-violet-500)" },
      { hash: "#/placement", title: "Placement Hub", desc: "Test out of what you already know", icon: LineChart, hue: "var(--dv-indigo-500)" },
      { hash: "#/math/diagnostic", title: "Mathematics Diagnostic", desc: "Find your exact starting level", icon: Sigma, hue: "var(--dv-viz-2)" },
      { hash: "#/tutor", title: "Ada, the AI Tutor", desc: "Socratic guidance, lesson-grounded", icon: MessagesSquare, hue: "var(--dv-violet-500)" },
    ],
  },
] as const;

/**
 * A hover/click dropdown that closes on outside-click and Escape. The
 * panel animates in (dv-menu-in) and plays a short exit (dv-menu-out)
 * before unmounting, held alive by the "closing" phase of a tiny state
 * machine: closed → open → closing → closed.
 */
function NavMenu({
  label,
  active,
  children,
  panelClassName = "w-[24rem] max-w-[calc(100vw-2rem)]",
}: {
  label: string;
  active?: boolean;
  children: (close: () => void) => React.ReactNode;
  panelClassName?: string;
}) {
  const [phase, setPhase] = useState<"closed" | "open" | "closing">("closed");
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const open = phase === "open";

  // Let the exit animation finish, then unmount the panel.
  useEffect(() => {
    if (phase !== "closing") return;
    const t = setTimeout(() => setPhase("closed"), 140);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const beginClose = () => setPhase((p) => (p === "open" ? "closing" : p));

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) beginClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && beginClose();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const enter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPhase("open");
  };
  const leave = () => {
    closeTimer.current = setTimeout(beginClose, 120);
  };

  return (
    <div ref={ref} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        onClick={() => (open ? beginClose() : enter())}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "relative flex h-9 items-center gap-1 whitespace-nowrap rounded-md px-2 text-[13px] font-medium transition-colors duration-150 xl:px-2.5",
          active || open ? "text-ink" : "text-ink-3 hover:text-ink"
        )}
      >
        {label}
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-150", open && "rotate-180")} />
        {active && <span className="dv-nav-underline absolute inset-x-2 -bottom-[13px] h-0.5 rounded-full bg-primary" />}
      </button>
      {/* the page scrim — a quiet dim over the content while a menu is open */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          aria-hidden="true"
          onClick={beginClose}
          className="dv-fade fixed inset-0 z-40 bg-ink/35 backdrop-blur-[2px] dark:bg-ink/50"
        />,
        document.body
      )}
      {phase !== "closed" && (
        <div
          data-closing={phase === "closing" ? "true" : undefined}
          className={cn(
            "dv-menu absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-e3",
            panelClassName
          )}
        >
          {children(() => beginClose())}
        </div>
      )}
    </div>
  );
}

function MenuIconTile({ hue, children }: { hue: string; children: React.ReactNode }) {
  return (
    <span
      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
      style={{ backgroundColor: `color-mix(in srgb, ${hue} 12%, transparent)`, color: hue }}
    >
      {children}
    </span>
  );
}

/** A row inside a dropdown panel — icon tile, title, description. */
function MenuRow({
  hash,
  title,
  desc,
  icon: Icon,
  hue,
  onGo,
  onClose,
}: {
  hash: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  hue: string;
  onGo: (hash: string) => void;
  onClose: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onClose();
        onGo(hash);
      }}
      className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-accent"
    >
      <MenuIconTile hue={hue}>
        <Icon className="h-4 w-4" />
      </MenuIconTile>
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-snug text-ink">{title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-ink-3">{desc}</span>
      </span>
    </button>
  );
}

/* ----------------------------------------------------------------- header */

export type ShellRoute =
  | "academy" | "school" | "subject" | "roadmap" | "placement"
  | "explore" | "projects" | "career" | "tutor" | "assessments"
  | "course" | "part" | "lesson" | "playground"
  | "sql" | "sql-lab" | "math" | "numpy" | "pandas" | "stats"
  | "dashboard" | "labs" | "visuals" | "dap" | "platform";

interface HeaderProps {
  route: ShellRoute;
  navigate: (hash: string) => void;
}

export function SiteHeader({ route, navigate }: HeaderProps) {
  const [mobilePhase, setMobilePhase] = useState<"closed" | "open" | "closing">("closed");
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<"schools" | "projects" | "resources" | "courses" | null>(null);
  const session = useSession();
  const sheetRef = useRef<HTMLDivElement>(null);
  const mobileOpen = mobilePhase === "open";

  // Let the exit animation finish, then unmount the sheet.
  useEffect(() => {
    if (mobilePhase !== "closing") return;
    const t = setTimeout(() => setMobilePhase("closed"), 200);
    return () => clearTimeout(t);
  }, [mobilePhase]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /** Close the mobile sheet, playing its short exit animation first. */
  const closeMobile = () => setMobilePhase((p) => (p === "open" ? "closing" : p));
  const openMobile = () => setMobilePhase("open");

  /** Navigate and close every menu in the same gesture. */
  const go = (hash: string) => {
    closeMobile();
    setMobileGroup(null);
    navigate(hash);
  };

  // Mobile sheet keyboard behaviour: Escape closes, Tab stays trapped.
  useEffect(() => {
    if (!mobileOpen) return;
    const sheet = sheetRef.current;
    if (sheet) {
      const focusables = Array.from(
        sheet.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])')
      );
      focusables[0]?.focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMobile();
        return;
      }
      if (e.key === "Tab" && sheet) {
        const list = Array.from(
          sheet.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])')
        ).filter((el) => el.offsetParent !== null);
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const navBtn =
    "relative flex h-9 items-center whitespace-nowrap rounded-md px-1.5 text-[13px] font-medium transition-colors duration-150 xl:px-2";
  const idle = "text-ink-3 hover:text-ink";

  const isActive = {
    home: route === "academy",
    explore: route === "explore",
    paths: route === "roadmap",
    schools: route === "school" || route === "subject",
    projects: route === "projects" || route === "dap",
    career: route === "career",
    resources:
      route === "playground" ||
      route === "sql-lab" ||
      route === "sql" ||
      route === "placement" ||
      route === "labs" ||
      route === "visuals" ||
      route === "math" ||
      route === "numpy" ||
      route === "stats" ||
      route === "assessments" ||
      route === "tutor",
  };

  return (
    <header className="dv-header sticky top-0 z-50 border-b border-border-subtle bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6 2xl:max-w-[1560px]">
        <BrandLockup onClick={() => go("#/")} />

        {/* ------------------------------------------------ desktop navigation */}
        <nav className="ml-auto hidden items-center gap-0.5 xl:flex" aria-label="Primary">
          <button type="button" onClick={() => go("#/")} className={cn(navBtn, isActive.home ? "text-ink" : idle)}>
            Home
            {isActive.home && <span className="dv-nav-underline absolute inset-x-2 -bottom-[13px] h-0.5 rounded-full bg-primary" />}
          </button>
          <button type="button" onClick={() => go("#/explore")} className={cn(navBtn, isActive.explore ? "text-ink" : idle)}>
            Explore
            {isActive.explore && <span className="dv-nav-underline absolute inset-x-2 -bottom-[13px] h-0.5 rounded-full bg-primary" />}
          </button>
          <button type="button" onClick={() => go("#/roadmap")} className={cn(navBtn, isActive.paths ? "text-ink" : idle)}>
            Learning Paths
            {isActive.paths && <span className="dv-nav-underline absolute inset-x-2 -bottom-[13px] h-0.5 rounded-full bg-primary" />}
          </button>

          {/* Schools — the mega menu */}
          <NavMenu label="Schools" active={isActive.schools} panelClassName="w-[48rem] max-w-[calc(100vw-2rem)]">
            {(close) => (
              <div className="grid grid-cols-[1fr_12.5rem]">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {curriculum.registry.schools.map((school) => {
                    const stats = curriculum.stats().bySchool[school.code];
                    return (
                      <button
                        key={school.code}
                        type="button"
                        onClick={() => {
                          close();
                          go(`#/school/${school.slug}`);
                        }}
                        className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-accent"
                      >
                        <MenuIconTile hue={school.color}>
                          <SchoolIcon name={school.icon} className="h-4 w-4" />
                        </MenuIconTile>
                        <span className="min-w-0">
                          <span className="block whitespace-nowrap text-sm font-medium leading-snug text-ink">
                            <span className="mr-1.5 font-mono text-[11px] font-normal text-ink-3">{school.code}</span>
                            {SHORT_SCHOOL_NAMES[school.code] ?? school.name}
                          </span>
                          <span className="tabular mt-0.5 block truncate text-xs text-ink-3">
                            {stats.subjects} subjects · {stats.lessons} lessons
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {/* the beginner's rail — real guidance, not decoration */}
                <div className="flex flex-col border-l border-border-subtle pl-1.5">
                  <p className="eyebrow px-3 pb-1 pt-2.5">Where to begin</p>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      go("#/placement");
                    }}
                    className="rounded-lg px-3 py-2 text-left transition-colors duration-150 hover:bg-accent"
                  >
                    <span className="block text-[13px] font-medium text-ink">Test out of what you know</span>
                    <span className="mt-0.5 block text-xs leading-snug text-ink-3">Placement for every subject</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      go("#/math/diagnostic");
                    }}
                    className="rounded-lg px-3 py-2 text-left transition-colors duration-150 hover:bg-accent"
                  >
                    <span className="block text-[13px] font-medium text-ink">Find your math level</span>
                    <span className="mt-0.5 block text-xs leading-snug text-ink-3">The mathematics diagnostic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      go("#/course");
                    }}
                    className="rounded-lg px-3 py-2 text-left transition-colors duration-150 hover:bg-accent"
                  >
                    <span className="block text-[13px] font-medium text-ink">Start with Python</span>
                    <span className="mt-0.5 block text-xs leading-snug text-ink-3">The first lesson, no account needed</span>
                  </button>
                  <p className="tabular mt-auto px-3 pt-3 text-[11px] text-ink-3">
                    {curriculum.stats().subjects} subjects · {curriculum.stats().lessons.toLocaleString()} lessons
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      go("#/explore");
                    }}
                    className="mb-0.5 mt-3 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-left text-[13px] font-medium text-primary-foreground shadow-e1 transition-colors duration-150 hover:bg-primary-hover"
                  >
                    Browse every subject
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </NavMenu>

          {/* Projects — three real destinations */}
          <NavMenu label="Projects" active={isActive.projects}>
            {(close) => (
              <div>
                {PROJECTS_MENU.map((r) => (
                  <MenuRow key={r.hash} {...r} onGo={go} onClose={close} />
                ))}
              </div>
            )}
          </NavMenu>

          <button type="button" onClick={() => go("#/career")} className={cn(navBtn, isActive.career ? "text-ink" : idle)}>
            Career Centre
            {isActive.career && <span className="dv-nav-underline absolute inset-x-2 -bottom-[13px] h-0.5 rounded-full bg-primary" />}
          </button>

          {/* Resources — grouped practice / assessment */}
          <NavMenu label="Resources" active={isActive.resources} panelClassName="w-[38rem] max-w-[calc(100vw-2rem)]">
            {(close) => (
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {RESOURCES_GROUPS.map((group, gi) => (
                  <div key={group.label} className={cn(gi > 0 && "border-l border-border-subtle pl-1.5")}>
                    <p className="eyebrow px-3 pb-1 pt-2.5">{group.label}</p>
                    {group.items.map((r) => (
                      <MenuRow key={r.hash} {...r} onGo={go} onClose={close} />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </NavMenu>
        </nav>

        {/* ------------------------------------------------------ utilities */}
        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <div className="hidden sm:block">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:bg-accent hover:text-ink sm:hidden"
          >
            <Search className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <AccountCluster session={session} navigate={navigate} />

          {/* mobile trigger */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => (mobileOpen ? closeMobile() : openMobile())}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:bg-accent hover:text-ink xl:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* --------------------------------------------------- mobile sheet */}
      {/* Portaled to body: the header's backdrop-filter creates a containing
          block that would otherwise crush this fixed panel to header height. */}
      {mobilePhase !== "closed" && typeof document !== "undefined" && createPortal(
        <>
          <button
            aria-label="Close menu"
            tabIndex={-1}
            data-closing={mobilePhase === "closing" ? "true" : undefined}
            onClick={closeMobile}
            className="dv-fade fixed inset-x-0 bottom-0 top-16 z-40 bg-ink/25 backdrop-blur-[2px] xl:hidden dark:bg-ink/45"
          />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            data-closing={mobilePhase === "closing" ? "true" : undefined}
            className="dv-sheet fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto border-t border-border-subtle bg-canvas px-4 pb-10 pt-4 xl:hidden"
          >
            <div className="mx-auto max-w-lg space-y-6">
              {/* search — the palette, reachable in one tap */}
              <button
                type="button"
                onClick={() => {
                  closeMobile();
                  setSearchOpen(true);
                }}
                className="flex h-11 w-full items-center gap-2.5 rounded-lg border border-border-subtle bg-surface px-3.5 text-left text-[15px] text-ink-3 shadow-e1"
              >
                <Search className="h-4 w-4" />
                Search courses, schools, subjects…
              </button>

              {/* auth state */}
              {session === null ? (
                <div className="h-[4.25rem] dv-skel rounded-xl" aria-hidden="true" />
              ) : session.authenticated && session.user ? (
                <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-3.5 shadow-e1">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-[15px] font-bold text-primary-foreground">
                    {(session.user.name ?? session.user.email).slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink" title={session.user.name ?? session.user.email}>{session.user.name ?? session.user.email}</span>
                    <span className="block truncate text-xs text-ink-3" title={session.user.email}>{session.user.email}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => go("#/dashboard")}
                    className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-medium text-primary-foreground"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Dashboard
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-e1">
                  <p className="text-sm font-medium text-ink">You are learning as a guest</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
                    A free account syncs progress across devices and unlocks the dashboard, Ada and certificates.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      closeMobile();
                      window.setTimeout(() => setAuthOpen(true), 280);
                    }}
                    className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-subtle text-sm font-medium text-ink"
                  >
                    Sign in or create an account
                  </button>
                </div>
              )}

              {/* primary destinations */}
              <div className="grid gap-1">
                {[
                  { label: "Home", desc: "The academy front door", hash: "#/", icon: Compass },
                  { label: "Explore", desc: "The full catalogue — every school and subject", hash: "#/explore", icon: Map },
                  { label: "Learning Paths", desc: "The staged roadmaps", hash: "#/roadmap", icon: Map },
                  { label: "Career Centre", desc: "Portfolio, interviews, graduation", hash: "#/career", icon: Compass },
                ].map((item) => (
                  <button
                    key={item.hash}
                    type="button"
                    onClick={() => go(item.hash)}
                    className="flex min-h-[56px] items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5 shrink-0 text-ink-3" />
                    <span>
                      <span className="block text-[15px] font-medium text-ink">{item.label}</span>
                      <span className="block text-xs text-ink-3">{item.desc}</span>
                    </span>
                  </button>
                ))}
              </div>

              {/* expandable groups */}
              <MobileGroup
                id="schools"
                label="Learning Schools"
                open={mobileGroup === "schools"}
                onToggle={() => setMobileGroup(mobileGroup === "schools" ? null : "schools")}
              >
                {curriculum.registry.schools.map((school) => (
                  <button
                    key={school.code}
                    type="button"
                    onClick={() => go(`#/school/${school.slug}`)}
                    className="flex min-h-[52px] items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-accent"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${school.color} 12%, transparent)`,
                        color: school.color,
                      }}
                    >
                      <SchoolIcon name={school.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium text-ink">
                        {SHORT_SCHOOL_NAMES[school.code] ?? school.name}
                      </span>
                      <span className="block truncate text-xs text-ink-3" title={school.tagline}>{school.tagline}</span>
                    </span>
                  </button>
                ))}
              </MobileGroup>

              <MobileGroup
                id="projects"
                label="Projects"
                open={mobileGroup === "projects"}
                onToggle={() => setMobileGroup(mobileGroup === "projects" ? null : "projects")}
              >
                {PROJECTS_MENU.map((r) => (
                  <button
                    key={r.hash}
                    type="button"
                    onClick={() => go(r.hash)}
                    className="flex min-h-[52px] items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-accent"
                  >
                    <r.icon className="h-5 w-5 shrink-0 text-ink-3" />
                    <span>
                      <span className="block text-[15px] font-medium text-ink">{r.title}</span>
                      <span className="block text-xs text-ink-3">{r.desc}</span>
                    </span>
                  </button>
                ))}
              </MobileGroup>

              <MobileGroup
                id="resources"
                label="Resources & Laboratories"
                open={mobileGroup === "resources"}
                onToggle={() => setMobileGroup(mobileGroup === "resources" ? null : "resources")}
              >
                {RESOURCES_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="eyebrow px-3 pb-1 pt-2">{group.label}</p>
                    {group.items.map((r) => (
                      <button
                        key={r.hash}
                        type="button"
                        onClick={() => go(r.hash)}
                        className="flex min-h-[52px] w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-accent"
                      >
                        <r.icon className="h-5 w-5 shrink-0 text-ink-3" />
                        <span>
                          <span className="block text-[15px] font-medium text-ink">{r.title}</span>
                          <span className="block text-xs text-ink-3">{r.desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </MobileGroup>

              <MobileGroup
                id="courses"
                label="Programmes"
                open={mobileGroup === "courses"}
                onToggle={() => setMobileGroup(mobileGroup === "courses" ? null : "courses")}
              >
                {DISPLAY_COURSES.map((c) => (
                  <button
                    key={c.href}
                    type="button"
                    onClick={() => go(c.href)}
                    className="flex min-h-[52px] items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-accent"
                  >
                    <span className="tabular text-[13px] text-ink-3">{c.lessons}</span>
                    <span>
                      <span className="block text-[15px] font-medium leading-snug text-ink">{c.label}</span>
                      <span className="block text-xs text-ink-3">interactive · verified outputs</span>
                    </span>
                  </button>
                ))}
              </MobileGroup>

              {/* the institutional tail */}
              <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                <p className="text-[12px] text-ink-3">
                  <button type="button" onClick={() => go("#/docs")} className="link-dv">Guide</button>
                  <span className="mx-1.5">·</span>
                  <button type="button" onClick={() => go("#/terms")} className="link-dv">Terms</button>
                  <span className="mx-1.5">·</span>
                  <button type="button" onClick={() => go("#/privacy")} className="link-dv">Privacy</button>
                </p>
                <p className="tabular text-[12px] text-ink-3">
                  {curriculum.registry.schools.length} schools · {curriculum.registry.subjects.length} subjects
                </p>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} navigate={navigate} />
      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthed={() => window.location.reload()}
        reason="A free account syncs progress across devices and unlocks the dashboard, Ada the AI tutor and certificates."
      />
    </header>
  );
}

/** A labelled, collapsible group of navigation rows for the mobile sheet. */
function MobileGroup({
  id,
  label,
  open,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`mobile-group-${id}`}
        className="flex w-full items-center justify-between py-1"
      >
        <p className="eyebrow">{label}</p>
        <ChevronDown className={cn("h-4 w-4 text-ink-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div id={`mobile-group-${id}`} className="dv-expand mt-2 grid gap-1">
          {children}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- footer */

/** Institutional footer — brand sign-off plus four destination columns. */
export function SiteFooter({ navigate }: { navigate: (hash: string) => void }) {
  const manifest = curriculum.stats();
  const year = new Date().getFullYear();

  const col = "space-y-2.5 text-[13px]";
  const link =
    "dv-link-underline block w-fit text-left text-ink-2 transition-colors duration-150 hover:text-ink";

  return (
    <footer className="border-t border-border-subtle bg-surface-subtle/50">
      <div className="mx-auto grid grid-cols-1 max-w-6xl gap-x-8 gap-y-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr] xl:grid-cols-[1.5fr_1fr_1fr_1fr_0.85fr]">
        {/* brand column */}
        <div>
          <div className="flex items-center gap-2">
            <BrandGlyph className="h-5 w-5" />
            <span className="font-display text-[15px] font-semibold text-ink">DataVerse Academy</span>
          </div>
          <p className="mt-3 max-w-xs font-display text-[15px] italic leading-relaxed text-ink-2">
            Learn the foundations. Master the intelligence. Build the future.
          </p>
          <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-ink-3">
            A dependency-honest curriculum: every program output machine-verified on a real engine before you
            ever see it, and every laboratory runs privately in your browser.
          </p>
        </div>

        {/* programmes */}
        <div>
          <p className="eyebrow">Programmes</p>
          <div className={cn(col, "mt-3")}>
            {DISPLAY_COURSES.map((c) => (
              <button key={c.href} type="button" onClick={() => navigate(c.href)} className={link}>
                {c.label}
              </button>
            ))}
            <button type="button" onClick={() => navigate("#/sql/cases")} className={link}>
              SQL Case Studies
            </button>
          </div>
        </div>

        {/* learn */}
        <div>
          <p className="eyebrow">Learn</p>
          <div className={cn(col, "mt-3")}>
            <button type="button" onClick={() => navigate("#/explore")} className={link}>Explore the catalogue</button>
            <button type="button" onClick={() => navigate("#/roadmap")} className={link}>Learning paths</button>
            <button type="button" onClick={() => navigate("#/placement")} className={link}>Placement tests</button>
            <button type="button" onClick={() => navigate("#/math/diagnostic")} className={link}>Mathematics diagnostic</button>
            <button type="button" onClick={() => navigate("#/tutor")} className={link}>Ada, the AI tutor</button>
            <button type="button" onClick={() => navigate("#/dashboard")} className={link}>My dashboard</button>
          </div>
        </div>

        {/* practice */}
        <div>
          <p className="eyebrow">Practice</p>
          <div className={cn(col, "mt-3")}>
            <button type="button" onClick={() => navigate("#/labs")} className={link}>Learning Laboratories</button>
            <button type="button" onClick={() => navigate("#/visuals")} className={link}>The Visual Library</button>
            <button type="button" onClick={() => navigate("#/playground")} className={link}>Python Playground</button>
            <button type="button" onClick={() => navigate("#/sql/lab")} className={link}>SQL Lab</button>
            <button type="button" onClick={() => navigate("#/numpy/playground")} className={link}>NumPy Playground</button>
            <button type="button" onClick={() => navigate("#/projects")} className={link}>Projects</button>
            <button type="button" onClick={() => navigate("#/dap")} className={link}>Project Academy</button>
            <button type="button" onClick={() => navigate("#/career")} className={link}>Career Centre</button>
            <button type="button" onClick={() => navigate("#/assessments")} className={link}>Assessment Center</button>
          </div>
        </div>

        {/* platform */}
        <div>
          <p className="eyebrow">Platform</p>
          <div className={cn(col, "mt-3")}>
            <button type="button" onClick={() => navigate("#/docs")} className={link}>Platform guide</button>
            <button type="button" onClick={() => navigate("#/terms")} className={link}>Terms of use</button>
            <button type="button" onClick={() => navigate("#/privacy")} className={link}>Privacy notice</button>
          </div>
          <p className="tabular mt-4 max-w-[13rem] text-[11.5px] leading-relaxed text-ink-3">
            {curriculum.registry.schools.length} schools · {manifest.subjects} subjects ·{" "}
            {manifest.lessons.toLocaleString()} lessons
          </p>
        </div>
      </div>

      <div className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {year} DataVerse Academy — an honest institution for the data age.</p>
          <p className="tabular">
            {manifest.subjects} subjects · {manifest.lessons.toLocaleString()} lessons ·{" "}
            {Math.round(manifest.totalHours).toLocaleString()} estimated hours
          </p>
        </div>
      </div>
    </footer>
  );
}
