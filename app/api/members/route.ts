// app/api/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getSession } from "@/app/lib/session";

export async function POST(req: NextRequest) {
  try {
    // 1. Only admins can add members
    const session = await getSession();
    if (!session.userId || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name, father_name, contactNum, cnic, address,
      password, role, verification_status, status,
    } = body;

    // 2. Validate
    if (!name || !father_name || !contactNum || !cnic || !address || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!/^\d{5}-\d{7}-\d$/.test(cnic)) {
      return NextResponse.json({ error: "Invalid CNIC format" }, { status: 400 });
    }
    if (!/^03\d{2}-\d{7}$/.test(contactNum)) {
      return NextResponse.json({ error: "Invalid phone format" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 3. Check duplicate CNIC
    const { data: existing } = await supabase
      .from("User")
      .select("id")
      .eq("cnic", cnic)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "CNIC already registered" }, { status: 409 });
    }

    // 4. Hash and insert
    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("User")
      .insert({
        name,
        father_name,
        number: contactNum,
        cnic,
        address,
        password: password_hash,
        role: role || "member",
        verification_status: verification_status || "verified",
        status: status || "active",
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "CNIC already registered" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, userId: data.id }, { status: 201 });
  } catch (err) {
    console.error("Add member error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("User")
    .select("id, name, father_name, cnic, number, address, role, verification_status, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}