import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/app/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, father_name, contactNum, cnic, password, address } = body;

    // 1. Validate required fields
    if (!name || !father_name || !contactNum || !cnic || !password || !address) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 2. Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 3. Check if CNIC already exists (nicer error than DB constraint)
    const { data: existing } = await supabase
      .from("User")
      .select("id")
      .eq("cnic", cnic)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "This CNIC is already registered" },
        { status: 409 }
      );
    }

    // 4. Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // 5. Insert with defaults
    const { data, error } = await supabase
      .from("User")
      .insert({
        name,
        father_name,
        number: contactNum,   // ⚠️ match your actual column name
        cnic,
        address,
        password: password_hash,
        role: "member",
        verification_status: "pending",
        status: "active",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Insert error:", error);

      // Handle unique constraint violation from DB
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This CNIC is already registered" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // 6. Success
    return NextResponse.json(
      {
        ok: true,
        message: "Registration submitted. Awaiting admin approval.",
        userId: data.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}