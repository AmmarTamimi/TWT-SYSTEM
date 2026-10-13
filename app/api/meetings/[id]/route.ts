// app/api/meetings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getSession } from "@/app/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") return null;
  return session;
}

/* ---------- GET single meeting ---------- */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("Meeting")
    .select(
      "id, title, agenda, location, date, meeting_number, arranged_by, created_at"
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json(data);
}

/* ---------- PATCH update meeting (admin only) ---------- */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();

  const allowed = [
    "title",
    "location",
    "agenda",
    "date",
    "meeting_number",
    "arranged_by",
  ] as const;

  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) patch[k] = body[k];

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("Meeting")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Meeting number already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}

/* ---------- DELETE meeting (admin only) ---------- */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;

  const supabase = createAdminClient();

  // Attendance rows cascade automatically via FK ON DELETE CASCADE,
  // but we do it manually too in case FK wasn't set:
  const { data: meeting } = await supabase
    .from("Meeting")
    .select("meeting_number")
    .eq("id", id)
    .single();

  if (meeting?.meeting_number) {
    await supabase
      .from("Attendance")
      .delete()
      .eq("meeting_number", meeting.meeting_number);
  }

  const { error } = await supabase.from("Meeting").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}