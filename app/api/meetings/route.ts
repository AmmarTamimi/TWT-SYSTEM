// app/api/meetings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getSession } from "@/app/lib/session";

/* ---------- GET: list all meetings ---------- */
export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("Meeting")
    .select(
      "id, title, agenda, location, date, meeting_number, arranged_by, created_at"
    )
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

/* ---------- POST: create meeting (admin only) ---------- */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { title, agenda, location, date, meeting_number, arranged_by } = body;

  // Validate
  if (!title || !location || !date || !meeting_number || !arranged_by) {
    return NextResponse.json(
      {
        error:
          "Title, location, date, meeting number, and arranged by are required",
      },
      { status: 400 }
    );
  }

  if (typeof meeting_number !== "number" || meeting_number < 1) {
    return NextResponse.json(
      { error: "Meeting number must be a positive integer" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Check meeting_number uniqueness
  const { data: existing } = await supabase
    .from("Meeting")
    .select("id")
    .eq("meeting_number", meeting_number)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: `Meeting #${meeting_number} already exists` },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("Meeting")
    .insert({
      title,
      agenda: agenda || null,
      location,
      date,
      meeting_number,
      arranged_by,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Meeting number already exists" },
        { status: 409 }
      );
    }
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "Selected member does not exist" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}