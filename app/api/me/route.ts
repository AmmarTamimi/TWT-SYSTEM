// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getSession } from "@/app/lib/session";

/* ---------- GET: current user profile ---------- */
export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("User")
    .select(
      "id, name, father_name, cnic, number, email, address, role, verification_status, status, created_at"
    )
    .eq("id", session.userId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "User not found" },
      { status: 404 }
    );
  }
  return NextResponse.json(data);
}

/* ---------- PATCH: update own profile ---------- */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Only allow editing these fields for one's own profile
  const allowed = ["name", "number", "email", "address"] as const;
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  // Basic validation
  if (patch.name && String(patch.name).trim().length < 2) {
    return NextResponse.json({ error: "Name is too short" }, { status: 400 });
  }
  if (patch.number && !/^03\d{2}-\d{7}$/.test(String(patch.number))) {
    return NextResponse.json(
      { error: "Invalid phone format (e.g. 0300-1234567)" },
      { status: 400 }
    );
  }
  if (patch.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(patch.email))) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("User")
    .update(patch)
    .eq("id", session.userId)
    .select(
      "id, name, father_name, cnic, number, email, address, role, verification_status, status, created_at"
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}