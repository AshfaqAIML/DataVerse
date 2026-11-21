import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * GET /api — service health check (no rate limit, no auth).
 * Verifies the database connection, reports service identity.
 */
export async function GET() {
  const started = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      success: true,
      data: {
        service: "DataVerse Academy API",
        status: "healthy",
        database: "connected",
        latencyMs: Date.now() - started,
        time: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Database unavailable" },
      },
      { status: 503 }
    );
  }
}
