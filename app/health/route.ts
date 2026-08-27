import { NextResponse } from "next/server";

/** Minimal public health — no secrets, schema names, or auth state. */
export async function GET() {
  return NextResponse.json({ ok: true, service: "tone" });
}
