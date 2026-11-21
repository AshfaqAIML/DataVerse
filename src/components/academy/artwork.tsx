"use client";

/**
 * DataVerse Academy — illustration language.
 *
 * One visual grammar for every drawing on the platform:
 *   - fine 1.4–1.6px strokes, round caps and joins (drafting-pen feel)
 *   - brand ramps only (indigo / blue / violet), graphite scaffolding
 *   - surfaces are white cards with hairline borders, not glass
 *   - motion is slow and calm: float, draw-in, soft pulse (all
 *     disabled under prefers-reduced-motion via globals.css)
 *
 * Every illustration is inline SVG referencing --dv-* tokens, so both
 * themes repaint them without JavaScript.
 */

const INK_SCAFFOLD = "var(--dv-ink-3)";

/* ------------------------------------------------------------------ hero */

/**
 * The hero composition — "the ascent of a learner".
 * A dashed path rises from a drafting grid through three milestones:
 * foundations (sigma), practice (code + verified output), intelligence
 * (network). A formula chip and a terminal card float alongside.
 */
export function HeroArtwork({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 396"
      fill="none"
      aria-hidden="true"
      className={className}
      role="presentation"
    >
      <defs>
        <linearGradient id="dv-hero-path" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--dv-blue-300)" />
          <stop offset="55%" stopColor="var(--dv-indigo-400)" />
          <stop offset="100%" stopColor="var(--dv-violet-400)" />
        </linearGradient>
        <radialGradient id="dv-hero-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--dv-indigo-200)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--dv-indigo-200)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* breathing glow behind the composition */}
      <circle cx="268" cy="212" r="190" fill="url(#dv-hero-glow)" className="dv-pulse" />

      {/* drafting grid — the foundations */}
      <g stroke={INK_SCAFFOLD} strokeOpacity="0.28" strokeWidth="1">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={`v${i}`} x1={88 + i * 40} y1="96" x2={88 + i * 40} y2="376" />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={`h${i}`} x1="88" y1={96 + i * 46.6} x2="328" y2={96 + i * 46.6} />
        ))}
      </g>
      <line x1="88" y1="376" x2="328" y2="376" stroke={INK_SCAFFOLD} strokeOpacity="0.55" strokeWidth="1.2" />

      {/* the rising path — drawn in on load */}
      <path
        d="M 96 372 C 170 366 196 318 232 268 C 268 218 296 172 356 128 C 392 101 428 84 458 74"
        stroke="url(#dv-hero-path)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="7 8"
        className="dv-draw"
        style={{ "--dv-dash": 620 } as React.CSSProperties}
      />

      {/* milestone I — foundations (sigma) */}
      <g className="dv-float">
        <circle cx="132" cy="330" r="21" fill="var(--dv-surface)" stroke="var(--dv-blue-400)" strokeWidth="1.6" />
        <text x="132" y="337" textAnchor="middle" fontFamily="Newsreader, Georgia, serif" fontStyle="italic" fontSize="21" fill="var(--dv-blue-600)" className="dark:[fill:var(--dv-blue-300)]">Σ</text>
      </g>

      {/* milestone II — practice (code brackets) */}
      <g className="dv-float dv-delay-2" style={{ animationDelay: "1.2s" }}>
        <circle cx="268" cy="222" r="21" fill="var(--dv-surface)" stroke="var(--dv-indigo-400)" strokeWidth="1.6" />
        <text x="268" y="229" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="15" fontWeight="600" fill="var(--dv-indigo-600)" className="dark:[fill:var(--dv-indigo-300)]">{"</>"}</text>
      </g>

      {/* milestone III — intelligence (network) */}
      <g className="dv-float dv-delay-3" style={{ animationDelay: "2.4s" }}>
        <circle cx="424" cy="104" r="26" fill="var(--dv-surface)" stroke="var(--dv-violet-400)" strokeWidth="1.6" />
        <g stroke="var(--dv-violet-500)" strokeWidth="1.2" className="dark:[stroke:var(--dv-violet-300)]">
          <line x1="416" y1="98" x2="432" y2="98" />
          <line x1="416" y1="110" x2="432" y2="110" />
          <line x1="418" y1="94" x2="418" y2="114" />
          <line x1="430" y1="94" x2="430" y2="114" />
          <circle cx="424" cy="92" r="1.8" fill="var(--dv-violet-500)" stroke="none" />
          <circle cx="424" cy="116" r="1.8" fill="var(--dv-violet-500)" stroke="none" />
        </g>
      </g>

      {/* the network constellation above the last milestone */}
      <g stroke="var(--dv-violet-300)" strokeOpacity="0.7" strokeWidth="1.1" className="dark:[stroke:var(--dv-violet-400)]">
        <path d="M 424 104 L 470 62" />
        <path d="M 424 104 L 486 118" />
        <path d="M 470 62 L 486 118" />
      </g>
      <circle cx="470" cy="62" r="3.4" fill="var(--dv-violet-400)" className="dv-pulse" />
      <circle cx="486" cy="118" r="2.6" fill="var(--dv-indigo-400)" className="dv-pulse" style={{ animationDelay: "1.1s" }} />

      {/* formula chip — the mathematics alongside */}
      <g className="dv-float" style={{ animationDelay: "0.8s" }}>
        <rect x="40" y="144" width="152" height="60" rx="10" fill="var(--dv-surface)" stroke="var(--dv-border)" strokeWidth="1.2" />
        <text x="116" y="167" textAnchor="middle" fontFamily="Newsreader, Georgia, serif" fontStyle="italic" fontSize="15" fill="var(--dv-violet-700)" className="dark:[fill:var(--dv-violet-300)]">
          P(A|B) =
          <tspan x="116" dy="19">P(B|A)·P(A) / P(B)</tspan>
        </text>
      </g>

      {/* terminal card — verified output */}
      <g className="dv-float dv-delay-1" style={{ animationDelay: "1.9s" }}>
        <rect x="318" y="268" width="176" height="102" rx="12" fill="var(--dv-surface)" stroke="var(--dv-border)" strokeWidth="1.2" />
        <circle cx="334" cy="284" r="3" fill="var(--dv-danger-border)" />
        <circle cx="346" cy="284" r="3" fill="var(--dv-warning-border)" />
        <circle cx="358" cy="284" r="3" fill="var(--dv-success-border)" />
        <text x="334" y="310" fontFamily="JetBrains Mono, monospace" fontSize="11.5" fill="var(--dv-ink-2)">
          {"prices.mean()"}
        </text>
        <text x="334" y="330" fontFamily="JetBrains Mono, monospace" fontSize="11.5" fill="var(--dv-success-text)">
          {"23.8  ✓ verified"}
        </text>
        <text x="334" y="350" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--dv-ink-3)">
          {"real engine · real output"}
        </text>
      </g>

      {/* small bar-chart — describing data */}
      <g className="dv-float" style={{ animationDelay: "2.8s" }}>
        <rect x="30" y="256" width="92" height="70" rx="10" fill="var(--dv-surface)" stroke="var(--dv-border)" strokeWidth="1.2" />
        <g fill="var(--dv-blue-300)" className="dark:[fill:var(--dv-blue-400)]">
          <rect x="44" y="300" width="9" height="14" rx="2" />
          <rect x="58" y="290" width="9" height="24" rx="2" />
          <rect x="72" y="278" width="9" height="36" rx="2" />
          <rect x="86" y="268" width="9" height="46" rx="2" fill="var(--dv-indigo-400)" />
        </g>
      </g>

      {/* orbiting accents */}
      <circle cx="212" cy="112" r="2.4" fill="var(--dv-blue-400)" className="dv-pulse" style={{ animationDelay: "0.5s" }} />
      <circle cx="360" cy="196" r="2" fill="var(--dv-indigo-300)" className="dv-pulse" style={{ animationDelay: "1.6s" }} />
      <circle cx="76" cy="228" r="2" fill="var(--dv-violet-300)" className="dv-pulse" style={{ animationDelay: "2.1s" }} />
    </svg>
  );
}

/* --------------------------------------------------------- classical AI */

/**
 * The state-space ascent — School J's hero emblem. A search graph rising
 * from start to goal: explored nodes filled, the frontier pulsing, edge
 * costs in mono, heuristic contours dashed around the goal, and the
 * optimal path carried in bronze.
 */
export function ClassicalHeroArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 400" fill="none" aria-hidden="true" className={className} role="presentation">
      <defs>
        <radialGradient id="dv-cai-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--dv-viz-3)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--dv-viz-3)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* glow behind the goal region */}
      <circle cx="415" cy="80" r="140" fill="url(#dv-cai-glow)" className="dv-pulse" />

      {/* heuristic contours around the goal — h as distance */}
      <circle cx="438" cy="74" r="64" stroke="var(--dv-viz-3)" strokeWidth="1" strokeDasharray="3 6" opacity="0.5" />
      <circle cx="438" cy="74" r="118" stroke="var(--dv-viz-3)" strokeWidth="1" strokeDasharray="3 6" opacity="0.28" />

      {/* scaffold edges */}
      <g stroke={INK_SCAFFOLD} strokeOpacity="0.65" strokeWidth="1.3" strokeLinecap="round">
        <path d="M56 330 C 100 322 130 292 168 256" />
        <path d="M56 330 C 96 342 126 350 158 352" />
        <path d="M180 252 C 226 226 258 196 294 162" />
        <path d="M180 252 C 222 260 258 262 290 262" />
        <path d="M168 356 C 216 330 258 300 292 274" />
        <path d="M306 262 C 356 226 396 160 428 100" />
      </g>
      {/* the optimal path — bronze, drawn in */}
      <g stroke="var(--dv-viz-3)" strokeWidth="2.2" strokeLinecap="round">
        <path d="M56 330 C 100 322 130 292 168 256" className="dv-draw" style={{ "--dv-dash": 130 } as React.CSSProperties} />
        <path d="M180 252 C 226 226 258 196 294 162" className="dv-draw" style={{ "--dv-dash": 130 } as React.CSSProperties} />
        <path d="M306 150 C 352 116 392 92 424 78" className="dv-draw" style={{ "--dv-dash": 130 } as React.CSSProperties} />
      </g>

      {/* edge costs */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--dv-ink-2)">
        <text x="96" y="286">2</text>
        <text x="102" y="348">4</text>
        <text x="238" y="200">5</text>
        <text x="228" y="252">3</text>
        <text x="228" y="320">2</text>
        <text x="384" y="196">6</text>
        <text x="352" y="106" fill="var(--dv-viz-3)" className="dark:[fill:var(--dv-gold-300)]">2</text>
      </g>

      {/* start node */}
      <g>
        <circle cx="56" cy="330" r="17" fill="var(--dv-surface)" stroke="var(--dv-ink-3)" strokeWidth="1.6" />
        <text x="56" y="335" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="600" fill="var(--dv-ink-2)">S</text>
        <text x="56" y="362" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="var(--dv-ink-2)">g=0 h=7</text>
      </g>

      {/* explored node a */}
      <g className="dv-float">
        <circle cx="180" cy="246" r="17" fill="var(--dv-viz-3)" fillOpacity="0.14" stroke="var(--dv-viz-3)" strokeWidth="1.6" />
        <text x="180" y="251" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="600" fill="var(--dv-ink-2)">a</text>
        <text x="180" y="278" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="var(--dv-ink-2)">g=2 h=5</text>
      </g>

      {/* explored node b (dimmer — off the optimal path) */}
      <g>
        <circle cx="168" cy="352" r="15" fill="var(--dv-surface)" stroke="var(--dv-ink-3)" strokeWidth="1.3" />
        <text x="168" y="357" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="600" fill="var(--dv-ink-3)">b</text>
      </g>

      {/* frontier node c — next to expand */}
      <g className="dv-float dv-delay-2">
        <circle cx="306" cy="150" r="19" fill="var(--dv-surface)" stroke="var(--dv-viz-3)" strokeWidth="1.8" className="dv-pulse" />
        <text x="306" y="155" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="600" fill="var(--dv-ink-2)">c</text>
        <text x="306" y="184" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="var(--dv-ink-2)">g=7 h=2</text>
      </g>

      {/* node d */}
      <g>
        <circle cx="306" cy="262" r="15" fill="var(--dv-surface)" stroke="var(--dv-ink-3)" strokeWidth="1.3" />
        <text x="306" y="267" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="600" fill="var(--dv-ink-3)">d</text>
      </g>

      {/* the goal — double ring */}
      <g className="dv-float dv-delay-1">
        <circle cx="438" cy="74" r="23" stroke="var(--dv-viz-3)" strokeWidth="1.4" opacity="0.5" />
        <circle cx="438" cy="74" r="15" fill="var(--dv-viz-3)" />
        <text x="438" y="79" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="var(--dv-surface)" className="dark:[fill:var(--dv-canvas)]">G</text>
        <text x="438" y="118" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="var(--dv-ink-2)">goal · h=0</text>
      </g>

      {/* legend */}
      <g fontFamily="Inter, sans-serif" fontSize="9.5" fill="var(--dv-ink-3)">
        <circle cx="72" cy="60" r="4.5" fill="var(--dv-viz-3)" fillOpacity="0.14" stroke="var(--dv-viz-3)" strokeWidth="1.3" />
        <text x="84" y="63.5">explored</text>
        <circle cx="146" cy="60" r="4.5" fill="var(--dv-surface)" stroke="var(--dv-viz-3)" strokeWidth="1.3" />
        <text x="158" y="63.5">frontier</text>
        <circle cx="216" cy="60" r="4.5" fill="var(--dv-surface)" stroke="var(--dv-ink-3)" strokeWidth="1.1" />
        <text x="228" y="63.5">unvisited</text>
      </g>
      <text x="72" y="90" fontFamily="Inter, sans-serif" fontSize="9.5" fill="var(--dv-ink-3)">
        state-space search · f(n) = g(n) + h(n)
      </text>
    </svg>
  );
}

/** The syllogism — knowledge as logic, inference as calculation. */
export function LogicArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true" className={className} role="presentation">
      <rect x="28" y="22" width="244" height="150" rx="12" fill="var(--dv-surface)" stroke="var(--dv-border)" strokeWidth="1.2" />
      {/* modus ponens chip */}
      <rect x="196" y="34" width="62" height="18" rx="9" fill="var(--dv-viz-3)" fillOpacity="0.1" />
      <text x="227" y="46.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="var(--dv-ink-2)">modus ponens</text>

      {/* gutter line numbers */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="var(--dv-ink-3)">
        <text x="44" y="76">1</text>
        <text x="44" y="104">2</text>
      </g>

      {/* premises */}
      <g fontFamily="Newsreader, Georgia, serif" fontStyle="italic" fontSize="13.5" fill="var(--dv-ink-2)">
        <text x="60" y="76">
          <tspan>∀x (Man(x) → Mortal(x))</tspan>
        </text>
        <text x="60" y="104">Man(Socrates)</text>
      </g>

      {/* the inference rule */}
      <line x1="44" y1="118" x2="256" y2="118" stroke="var(--dv-border-strong)" strokeWidth="1.1" />
      <text x="52" y="144" fontFamily="Newsreader, Georgia, serif" fontStyle="italic" fontSize="15" fill="var(--dv-viz-3)" className="dark:[fill:var(--dv-gold-300)]">∴</text>
      <text x="72" y="144" fontFamily="Newsreader, Georgia, serif" fontStyle="italic" fontSize="13.5" fontWeight="600" fill="var(--dv-ink)">
        Mortal(Socrates)
      </text>
      <text x="150" y="176" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9.5" fill="var(--dv-ink-3)">
        knowledge as logic · inference is calculation
      </text>
      <circle cx="264" cy="160" r="2.2" fill="var(--dv-viz-3)" className="dv-pulse" />
    </svg>
  );
}

/**
 * The minimax tree — Classical AI's emblem. An adversarial game tree
 * with one branch pruned (the crossed edge), values at the leaves.
 */
export function SearchTreeArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 220" fill="none" aria-hidden="true" className={className}>
      <g stroke="var(--dv-viz-3)" strokeOpacity="0.75" strokeWidth="1.4" strokeLinecap="round">
        <path d="M150 36 L86 92" className="dv-draw" style={{ "--dv-dash": 90 } as React.CSSProperties} />
        <path d="M150 36 L214 92" className="dv-draw" style={{ "--dv-dash": 90 } as React.CSSProperties} />
        <path d="M86 92 L44 148" className="dv-draw" style={{ "--dv-dash": 80 } as React.CSSProperties} />
        <path d="M86 92 L104 148" className="dv-draw" style={{ "--dv-dash": 80 } as React.CSSProperties} />
        <path d="M214 92 L184 148" className="dv-draw" style={{ "--dv-dash": 80 } as React.CSSProperties} />
      </g>
      {/* the pruned branch */}
      <g stroke="var(--dv-ink-3)" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.7">
        <path d="M214 92 L258 148" />
      </g>
      {/* the ghost node the pruning cut off */}
      <circle cx="258" cy="148" r="7.5" fill="var(--dv-surface)" stroke="var(--dv-ink-3)" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.8" />
      <g stroke="var(--dv-danger-text)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M228 112 L244 128" />
        <path d="M244 112 L228 128" />
      </g>

      <circle cx="150" cy="36" r="11" fill="var(--dv-surface)" stroke="var(--dv-viz-3)" strokeWidth="1.6" />
      <circle cx="86" cy="92" r="9" fill="var(--dv-surface)" stroke="var(--dv-viz-3)" strokeWidth="1.4" />
      <circle cx="214" cy="92" r="9" fill="var(--dv-surface)" stroke="var(--dv-viz-3)" strokeWidth="1.4" />
      <g className="dv-float">
        <circle cx="44" cy="148" r="8" fill="var(--dv-surface)" stroke="var(--dv-viz-3)" strokeWidth="1.4" />
        <circle cx="104" cy="148" r="8" fill="var(--dv-surface)" stroke="var(--dv-viz-3)" strokeWidth="1.4" />
        <circle cx="184" cy="148" r="8" fill="var(--dv-surface)" stroke="var(--dv-viz-3)" strokeWidth="1.4" />
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="var(--dv-ink-2)">
        <text x="150" y="76" textAnchor="middle">max</text>
        <text x="62" y="122" textAnchor="middle">min</text>
        <text x="214" y="122" textAnchor="middle">min</text>
        <text x="44" y="176" textAnchor="middle">+7</text>
        <text x="104" y="176" textAnchor="middle">+3</text>
        <text x="184" y="176" textAnchor="middle">+9</text>
        <text x="258" y="178" textAnchor="middle" fill="var(--dv-ink-3)">?</text>
      </g>
      <text x="150" y="205" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fill="var(--dv-ink-3)">
        adversarial search · alpha–beta pruning
      </text>
    </svg>
  );
}

/* ------------------------------------------------------ math & statistics */

/** The normal curve over a fine histogram — the statistician's view. */
export function DistributionArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true" className={className}>
      {/* histogram bars */}
      <g fill="var(--dv-violet-200)" className="dark:[fill:var(--dv-violet-900)]">
        {[0.14, 0.3, 0.55, 0.8, 1, 0.86, 0.6, 0.34, 0.16].map((h, i) => (
          <rect key={i} x={48 + i * 24} y={150 - h * 96} width="17" height={h * 96} rx="3" />
        ))}
      </g>
      {/* the curve */}
      <path
        d="M 44 150 C 88 148 96 54 150 54 C 204 54 212 148 256 150"
        stroke="var(--dv-viz-2)"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="dv-draw"
        style={{ "--dv-dash": 420 } as React.CSSProperties}
      />
      {/* mean line */}
      <line x1="150" y1="46" x2="150" y2="158" stroke="var(--dv-ink-3)" strokeWidth="1.1" strokeDasharray="3 4" />
      <g fontFamily="Newsreader, Georgia, serif" fontStyle="italic" fontSize="12" fill="var(--dv-ink-2)">
        <text x="150" y="38" textAnchor="middle">μ</text>
        <text x="205" y="76">σ</text>
      </g>
      {/* axis */}
      <line x1="36" y1="150" x2="266" y2="150" stroke="var(--dv-ink-3)" strokeWidth="1.2" strokeLinecap="round" />
      <g className="dv-float">
        <text x="150" y="188" textAnchor="middle" fontFamily="Newsreader, Georgia, serif" fontStyle="italic" fontSize="13" fill="var(--dv-ink-3)">
          X ~ N(μ, σ²)
        </text>
      </g>
      <circle cx="150" cy="54" r="3" fill="var(--dv-viz-2)" className="dv-pulse" />
    </svg>
  );
}

/* ---------------------------------------------------------- programming */

/** The editor card — a real, runnable first program. */
export function CodeCardArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 200" fill="none" aria-hidden="true" className={className}>
      <rect x="30" y="26" width="240" height="148" rx="12" fill="var(--dv-surface)" stroke="var(--dv-border)" strokeWidth="1.2" />
      <circle cx="48" cy="44" r="3" fill="var(--dv-danger-border)" />
      <circle cx="60" cy="44" r="3" fill="var(--dv-warning-border)" />
      <circle cx="72" cy="44" r="3" fill="var(--dv-success-border)" />
      <text x="48" y="76" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--dv-viz-7)" className="dark:[fill:var(--dv-viz-7)]">print</text>
      <text x="82" y="76" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--dv-ink-2)">(</text>
      <text x="90" y="76" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--dv-success-text)">&quot;Hello, DataVerse!&quot;</text>
      <text x="220" y="76" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--dv-ink-2)">)</text>
      {/* output */}
      <line x1="46" y1="94" x2="254" y2="94" stroke="var(--dv-border-subtle)" strokeWidth="1" />
      <text x="48" y="118" fontFamily="JetBrains Mono, monospace" fontSize="11.5" fill="var(--dv-ink-3)">output</text>
      <text x="48" y="140" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--dv-ink)">Hello, DataVerse!</text>
      <text x="48" y="160" fontFamily="JetBrains Mono, monospace" fontSize="10.5" fill="var(--dv-success-text)">✓ executed · verified</text>
      <rect x="236" y="146" width="8" height="14" fill="var(--dv-viz-7)" className="dv-blink" rx="1" />
    </svg>
  );
}

/* ------------------------------------------------------------- labs */

/** The laboratory bench — terminal, database cylinder, array grid. */
export function LabBenchArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 200" fill="none" aria-hidden="true" className={className}>
      {/* terminal */}
      <g className="dv-float">
        <rect x="26" y="30" width="130" height="104" rx="10" fill="var(--dv-surface)" stroke="var(--dv-border)" strokeWidth="1.2" />
        <text x="42" y="54" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--dv-ink-3)">python</text>
        <text x="42" y="76" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="var(--dv-ink-2)">{">>>"} import numpy</text>
        <text x="42" y="94" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="var(--dv-ink-2)">{">>>"} a.sum()</text>
        <text x="42" y="114" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="var(--dv-success-text)">15</text>
        <rect x="150" y="102" width="7" height="13" fill="var(--dv-indigo-400)" rx="1" className="dv-blink" />
      </g>
      {/* database */}
      <g className="dv-float" style={{ animationDelay: "1.4s" }}>
        <ellipse cx="222" cy="58" rx="34" ry="12" fill="var(--dv-surface)" stroke="var(--dv-viz-7)" strokeWidth="1.5" />
        <path d="M188 58 v34 c0 6.6 15.2 12 34 12 s34 -5.4 34 -12 v-34" fill="var(--dv-surface)" stroke="var(--dv-viz-7)" strokeWidth="1.5" />
        <path d="M188 76 c0 6.6 15.2 12 34 12 s34 -5.4 34 -12" stroke="var(--dv-viz-7)" strokeWidth="1.2" />
        <text x="222" y="130" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="var(--dv-ink-3)">PostgreSQL</text>
      </g>
      {/* array grid */}
      <g className="dv-float" style={{ animationDelay: "2.2s" }}>
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((c) => (
            <rect
              key={`${r}${c}`}
              x={44 + c * 26}
              y={146 + r * 15}
              width="22"
              height="12"
              rx="3"
              fill={(r + c) % 3 === 0 ? "var(--dv-viz-5)" : "var(--dv-surface-subtle)"}
              stroke="var(--dv-border)"
              strokeWidth="1"
            />
          ))
        )}
        <text x="176" y="168" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="var(--dv-ink-3)">shape (3, 4)</text>
      </g>
      <circle cx="270" cy="26" r="2.2" fill="var(--dv-viz-5)" className="dv-pulse" />
      <circle cx="16" cy="150" r="2" fill="var(--dv-viz-7)" className="dv-pulse" style={{ animationDelay: "1s" }} />
    </svg>
  );
}

/* --------------------------------------------------------------- Ada */

/** Ada's mark — a lantern of guidance drawn in the brand grammar. */
export function AdaArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 200" fill="none" aria-hidden="true" className={className}>
      {/* the guide glow */}
      <circle cx="150" cy="92" r="58" fill="var(--dv-violet-100)" opacity="0.5" className="dv-pulse dark:[fill:var(--dv-violet-950)]" />
      {/* lantern body */}
      <path
        d="M150 34 c-22 0 -36 17 -36 38 c0 25 22 44 36 58 c14 -14 36 -33 36 -58 c0 -21 -14 -38 -36 -38 z"
        fill="var(--dv-surface)"
        stroke="var(--dv-violet-500)"
        strokeWidth="1.8"
        className="dark:[stroke:var(--dv-violet-400)]"
      />
      <path d="M150 58 c-10 0 -16 8 -16 18 c0 12 10 21 16 27 c6 -6 16 -15 16 -27 c0 -10 -6 -18 -16 -18 z" fill="var(--dv-violet-200)" className="dark:[fill:var(--dv-violet-800)]" />
      <circle cx="150" cy="80" r="5.5" fill="var(--dv-violet-500)" className="dv-pulse dark:[fill:var(--dv-violet-300)]" />
      {/* hanging point + base */}
      <line x1="150" y1="18" x2="150" y2="34" stroke="var(--dv-violet-500)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="150" cy="16" r="2.6" fill="var(--dv-violet-500)" />
      <line x1="136" y1="136" x2="164" y2="136" stroke="var(--dv-violet-500)" strokeWidth="1.6" strokeLinecap="round" />
      {/* Socratic exchange — two real tutoring turns, not decoration */}
      <g className="dv-float" style={{ animationDelay: "0.6s" }}>
        <path d="M120 60 L131 54 L120 66 Z" fill="var(--dv-violet-300)" className="dark:[fill:var(--dv-violet-500)]" />
        <rect x="14" y="46" width="106" height="28" rx="9" fill="var(--dv-surface)" stroke="var(--dv-violet-300)" strokeWidth="1.2" className="dark:[stroke:var(--dv-violet-500)]" />
        <text x="67" y="64" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9.5" fill="var(--dv-ink-2)">
          why is A* optimal?
        </text>
      </g>
      <g className="dv-float" style={{ animationDelay: "2s" }}>
        <path d="M180 118 L169 124 L180 130 Z" fill="var(--dv-violet-300)" className="dark:[fill:var(--dv-violet-500)]" />
        <rect x="180" y="110" width="106" height="28" rx="9" fill="var(--dv-violet-50)" stroke="var(--dv-violet-300)" strokeWidth="1.2" className="dark:[fill:var(--dv-violet-950)] dark:[stroke:var(--dv-violet-500)]" />
        <text x="233" y="128" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9.5" fill="var(--dv-ink-2)">
          name the invariant
        </text>
      </g>
      {/* orbiting questions — Socratic sparks */}
      <g fontFamily="Newsreader, Georgia, serif" fontStyle="italic" fontSize="13" fill="var(--dv-ink-3)">
        <text x="244" y="72" className="dv-float" style={{ animationDelay: "1.3s" }}>?</text>
        <text x="52" y="164" className="dv-float" style={{ animationDelay: "2.1s" }}>?</text>
      </g>
      <text x="150" y="176" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fill="var(--dv-ink-3)">
        guides with questions · never hands over answers
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------ projects */

/** Assembling blocks into a structure — the project builder. */
export function ProjectArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 200" fill="none" aria-hidden="true" className={className}>
      {/* blueprint outline of the finished piece */}
      <rect x="92" y="70" width="116" height="88" rx="8" stroke="var(--dv-ink-3)" strokeWidth="1.1" strokeDasharray="5 5" fill="none" />
      {/* assembled rows */}
      <g className="dv-float">
        <rect x="100" y="134" width="100" height="16" rx="4" fill="var(--dv-indigo-500)" opacity="0.92" />
        <rect x="110" y="114" width="80" height="16" rx="4" fill="var(--dv-indigo-400)" opacity="0.85" />
        <rect x="122" y="94" width="56" height="16" rx="4" fill="var(--dv-indigo-300)" opacity="0.85" />
      </g>
      {/* the arriving block */}
      <g className="dv-float" style={{ animationDelay: "1.6s" }}>
        <rect x="236" y="46" width="22" height="22" rx="5" fill="var(--dv-violet-400)" />
        <path d="M232 74 C 214 84 208 96 196 106" stroke="var(--dv-violet-400)" strokeWidth="1.4" strokeDasharray="4 5" strokeLinecap="round" />
      </g>
      {/* dimension marks — the builder's discipline */}
      <g stroke="var(--dv-ink-3)" strokeWidth="1" opacity="0.8">
        <line x1="92" y1="170" x2="208" y2="170" />
        <line x1="92" y1="165" x2="92" y2="175" />
        <line x1="208" y1="165" x2="208" y2="175" />
        <line x1="80" y1="70" x2="80" y2="158" />
        <line x1="75" y1="70" x2="85" y2="70" />
        <line x1="75" y1="158" x2="85" y2="158" />
      </g>
      <text x="150" y="186" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="var(--dv-ink-3)">guided · independent · capstone</text>
      <circle cx="70" cy="52" r="2.2" fill="var(--dv-indigo-300)" className="dv-pulse" />
      <circle cx="238" cy="156" r="2" fill="var(--dv-violet-300)" className="dv-pulse" style={{ animationDelay: "1.2s" }} />
    </svg>
  );
}

/* -------------------------------------------------------------- career */

/** The compass rose over a rising path — the career journey. */
export function CompassArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 200" fill="none" aria-hidden="true" className={className}>
      <circle cx="150" cy="92" r="56" fill="var(--dv-surface)" stroke="var(--dv-border)" strokeWidth="1.3" />
      <circle cx="150" cy="92" r="44" stroke="var(--dv-border-subtle)" strokeWidth="1" strokeDasharray="2 5" />
      {/* ticks */}
      <g stroke="var(--dv-ink-3)" strokeWidth="1" opacity="0.7">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6;
          return <line key={i} x1={150 + 50 * Math.sin(a)} y1={92 - 50 * Math.cos(a)} x2={150 + 56 * Math.sin(a)} y2={92 - 56 * Math.cos(a)} />;
        })}
      </g>
      {/* the needle — pointing up and slightly forward */}
      <g className="dv-float">
        <path d="M150 48 L160 92 L150 100 L140 92 Z" fill="var(--dv-indigo-500)" />
        <path d="M150 136 L140 92 L150 84 L160 92 Z" fill="var(--dv-ink-3)" opacity="0.5" />
        <circle cx="150" cy="92" r="4" fill="var(--dv-surface)" stroke="var(--dv-indigo-600)" strokeWidth="1.6" />
      </g>
      <text x="150" y="34" textAnchor="middle" fontFamily="Newsreader, Georgia, serif" fontStyle="italic" fontSize="12" fill="var(--dv-ink-3)">N</text>
      {/* milestones on the path below */}
      <path d="M62 172 C 104 158 128 186 168 170 C 198 158 224 172 246 164" stroke="var(--dv-indigo-300)" strokeWidth="1.6" strokeDasharray="6 6" strokeLinecap="round" />
      <circle cx="62" cy="172" r="3.2" fill="var(--dv-indigo-400)" />
      <circle cx="168" cy="170" r="3.2" fill="var(--dv-violet-400)" />
      <circle cx="246" cy="164" r="3.2" fill="var(--dv-gold-500)" className="dv-pulse" />
      <text x="246" y="150" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9.5" fill="var(--dv-ink-3)">the offer</text>
    </svg>
  );
}

/* ------------------------------------------------------------- roadmap */

/** The staged ascent — ten stages from first tools to career launch. */
export function RoadmapArt({ className = "" }: { className?: string }) {
  const steps = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <svg viewBox="0 0 420 120" fill="none" aria-hidden="true" className={className}>
      <path
        d="M16 96 C 60 96 64 76 108 76 C 152 76 156 56 200 56 C 244 56 248 36 292 36 C 336 36 340 20 404 20"
        stroke="var(--dv-indigo-200)"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="dark:[stroke:var(--dv-indigo-800)]"
      />
      <path
        d="M16 96 C 60 96 64 76 108 76 C 152 76 156 56 200 56 C 244 56 248 36 292 36 C 336 36 340 20 404 20"
        stroke="var(--dv-indigo-500)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="6 10"
        className="dv-draw dark:[stroke:var(--dv-indigo-400)]"
        style={{ "--dv-dash": 480 } as React.CSSProperties}
      />
      {steps.map((i) => {
        const x = 16 + i * ((404 - 16) / 9);
        const y = 96 - i * 8.4;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={i === 9 ? 6 : 4.4} fill="var(--dv-surface)" stroke="var(--dv-indigo-400)" strokeWidth="1.6" className="dark:[stroke:var(--dv-indigo-300)]" />
            {i === 9 && <circle cx={x} cy={y} r="2.6" fill="var(--dv-gold-500)" className="dv-pulse" />}
          </g>
        );
      })}
      <text x="16" y="114" fontFamily="Inter, sans-serif" fontSize="9.5" fill="var(--dv-ink-3)">first tools</text>
      <text x="404" y="38" textAnchor="end" fontFamily="Inter, sans-serif" fontSize="9.5" fill="var(--dv-ink-3)">career launch</text>
    </svg>
  );
}
