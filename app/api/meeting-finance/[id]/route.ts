// app/api/meeting-finance/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getSession } from "@/app/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") return null;
  return session;
}

/* ---------- GET single donation ---------- */
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
  const { data: donation, error } = await supabase
    .from("donation")
    .select(
      "id, userId, amount, description, reciept, meeting_id, category, created_at"
    )
    .eq("id", id)
    .single();

  if (error || !donation) {
    return NextResponse.json(
      { error: error?.message || "Not found" },
      { status: 404 }
    );
  }

  // Fetch user info
  let user = null;
  if (donation.userId) {
    const { data: u } = await supabase
      .from("User")
      .select("id, name, cnic")
      .eq("id", donation.userId)
      .single();
    if (u) user = { id: String(u.id), name: u.name, cnic: u.cnic };
  }

  // Fetch meeting info
  let meeting = null;
  if (donation.meeting_id) {
    const { data: m } = await supabase
      .from("Meeting")
      .select("id, title, meeting_number, date")
      .eq("meeting_number", donation.meeting_id)
      .single();
    if (m) meeting = m;
  }

  return NextResponse.json({
    ...donation,
    User: user,
    Meeting: meeting,
  });
}

/* ---------- PATCH update donation (admin only) ---------- */
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

  const allowed = ["amount", "description", "category", "userId"] as const;
  const patch: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in body) patch[k] = body[k];
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("donation")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

/* ---------- DELETE donation (admin only) ---------- */
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
  const { error } = await supabase.from("donation").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}