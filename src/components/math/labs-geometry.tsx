"use client";

/**
 * Geometry lab — the unit circle: drag an angle, watch sin/cos/tan as
 * literal lengths on the picture. Trigonometry as geometry first, formulas
 * second.
 */
import { useState } from "react";
import { LabShell, Readout } from "./plotframe";
import { cleanNumber } from "@/lib/mathcourse/numeric";

export function UnitCircleLab() {
  const [deg, setDeg] = useState(40);
  const [showTan, setShowTan] = useState(false);

  const rad = (deg * Math.PI) / 180;
  const cx = 200, cy = 190, r = 130;
  const px = cx + r * Math.cos(-rad);
  const py = cy + r * Math.sin(-rad); // SVG y grows downward

  const sinLen = Math.sin(rad);
  const cosLen = Math.cos(rad);
  const tanLen = Math.tan(rad);

  const toDegText = (d: number) => `${((d % 360) + 360) % 360}°`;

  return (
    <LabShell
      title="Unit circle explorer"
      hint="Drag the angle. cos θ is how far along (horizontal shadow); sin θ is how far up (vertical shadow); tan θ is the length of the tangent segment where the radius line meets x = 1. All three are just lengths on this one picture."
      onReset={() => { setDeg(40); setShowTan(false); }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[380px_1fr]">
        <svg viewBox="0 0 400 380" style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={`Unit circle at ${deg} degrees showing sine, cosine and tangent`}>
          {/* axes */}
          <line x1="20" y1={cy} x2="380" y2={cy} stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
          <line x1={cx} y1="20" x2={cx} y2="360" stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
          {/* the circle */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth={1.6} opacity={0.8} />
          {/* cos (horizontal) */}
          <line x1={cx} y1={cy} x2={px} y2={cy} stroke="#0ea5e9" strokeWidth={4} />
          {/* sin (vertical) */}
          <line x1={px} y1={cy} x2={px} y2={py} stroke="#059669" strokeWidth={4} />
          {/* hypotenuse (radius) */}
          <line x1={cx} y1={cy} x2={px} y2={py} stroke="#7c3aed" strokeWidth={2.6} />
          {/* right-angle mark */}
          <rect x={px - (px > cx ? 10 : -10) - 0.5} y={py + (py < cy ? 0 : -10) + (py < cy ? -0.5 : 0)} width="10" height="10"
            fill="none" stroke="currentColor" strokeWidth={1} opacity={0.6}
            transform={px > cx ? "" : `translate(-10,0)`} />
          {/* tangent segment at x = 1 */}
          {showTan && Math.abs(Math.cos(rad)) > 0.08 && (
            <>
              <line x1={cx + r} y1={cy - r * 1.6} x2={cx + r} y2={cy + r * 1.6} stroke="#d97706" strokeWidth={1.4} strokeDasharray="4 4" opacity={0.7} />
              <line x1={cx} y1={cy} x2={cx + r} y2={cy - r * tanLen} stroke="#d97706" strokeWidth={2.6} opacity={0.9} />
              <line x1={cx + r} y1={cy} x2={cx + r} y2={cy - r * tanLen} stroke="#d97706" strokeWidth={4} />
              <text x={cx + r + 8} y={cy - r * tanLen / 2} fontSize={12} fontWeight={700} fill="#d97706">tan θ = {cleanNumber(tanLen, 3)}</text>
            </>
          )}
          {/* labels */}
          <text x={(cx + px) / 2} y={cy + (py > cy ? 20 : -10)} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#0ea5e9">cos = {cleanNumber(cosLen, 3)}</text>
          <text x={px + (px > cx ? 8 : -8)} textAnchor={px > cx ? "start" : "end"} y={(cy + py) / 2 + 4} fontSize={12.5} fontWeight={700} fill="#059669">sin = {cleanNumber(sinLen, 3)}</text>
          <text x={(cx + px) / 2 - 10} y={(cy + py) / 2 - 8} fontSize={12} fontWeight={700} fill="#7c3aed">r = 1</text>
          {/* angle arc */}
          <path d={`M ${cx + 34} ${cy} A 34 34 0 ${rad > Math.PI ? 1 : 0} 0 ${cx + 34 * Math.cos(-rad)} ${cy + 34 * Math.sin(-rad)}`} fill="none" stroke="#dc2626" strokeWidth={1.8} />
          {/* draggable handle */}
          <circle cx={px} cy={py} r={9} fill="white" stroke="#dc2626" strokeWidth={3}
            style={{ cursor: "grab" }}
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture?.(e.pointerId);
              dragging.on = true;
            }}
            onPointerMove={(e) => {
              if (!dragging.on) return;
              const svg = (e.currentTarget as Element).closest("svg")!;
              const rect = svg.getBoundingClientRect();
              const scale = 400 / rect.width;
              const mx = ((e.clientX - rect.left) * scale - cx) / r;
              const my = -((e.clientY - rect.top) * scale - cy) / r;
              const a = (Math.atan2(my, mx) * 180) / Math.PI;
              setDeg(Math.round(((a % 360) + 360) % 360));
            }}
            onPointerUp={() => (dragging.on = false)}
          />
          <text x={cx + 46} y={cy - 12} fontSize={12.5} fontWeight={700} fill="#dc2626">θ = {toDegText(deg)}</text>
        </svg>
        <div className="space-y-2.5">
          <input type="range" min={0} max={360} step={1} value={deg} onChange={(e) => setDeg(Number(e.target.value))}
            aria-label="Angle in degrees" className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-violet-600" />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[0, 30, 45, 60, 90, 180, 270].map((d) => (
              <button key={d} type="button" onClick={() => setDeg(d)}
                className={
                  "rounded border px-2 py-1 text-[11px] font-medium transition-colors " +
                  (deg === d ? "border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300" : "border-border text-muted-foreground hover:text-foreground")
                }>{d}°</button>
            ))}
            <button type="button" onClick={() => setShowTan((t) => !t)}
              className={
                "rounded border px-2 py-1 text-[11px] font-medium transition-colors " +
                (showTan ? "border-warning-text bg-warning-bg text-warning-text" : "border-border text-muted-foreground hover:text-foreground")
              }>show tan</button>
          </div>
          <Readout items={[
            { label: "Degrees", value: toDegText(deg) },
            { label: "Radians", value: `${cleanNumber(rad, 4)} = ${radianFraction(deg)}`, tone: "good" },
            { label: "cos θ", value: cleanNumber(cosLen, 4) },
            { label: "sin θ", value: cleanNumber(sinLen, 4) },
            { label: "tan θ", value: Math.abs(cosLen) < 0.01 ? "undefined (cos = 0)" : cleanNumber(tanLen, 4), tone: Math.abs(cosLen) < 0.01 ? "warn" : "default" },
            { label: "Identity check", value: `sin² + cos² = ${cleanNumber(sinLen * sinLen + cosLen * cosLen, 4)}`, tone: "good" },
          ]} />
        </div>
      </div>
    </LabShell>
  );
}

const dragging = { on: false };

function radianFraction(deg: number): string {
  const known: Record<number, string> = {
    0: "0", 30: "π/6", 45: "π/4", 60: "π/3", 90: "π/2", 120: "2π/3", 135: "3π/4", 150: "5π/6",
    180: "π", 210: "7π/6", 225: "5π/4", 240: "4π/3", 270: "3π/2", 300: "5π/3", 315: "7π/4", 330: "11π/6", 360: "2π",
  };
  return known[deg] ?? "—";
}
