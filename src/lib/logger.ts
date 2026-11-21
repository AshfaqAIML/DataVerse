/**
 * Minimal structured logger (JSON lines) used by the API layer.
 * Writes a single line per request/event so `dev.log` stays greppable.
 * In production this swaps for a real sink (pino / OTLP) without
 * changing call sites.
 */
type Level = "debug" | "info" | "warn" | "error";

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const MIN = LEVELS[(process.env.LOG_LEVEL as Level) ?? "info"] ?? 20;

function emit(level: Level, msg: string, ctx?: Record<string, unknown>) {
  if (LEVELS[level] < MIN) return;
  const line = JSON.stringify({
    t: new Date().toISOString(),
    lvl: level,
    msg,
    ...ctx,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => emit("debug", msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => emit("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => emit("error", msg, ctx),
};
