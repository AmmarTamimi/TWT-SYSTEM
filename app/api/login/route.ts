import { createAdminClient } from "@/app/lib/supabase/admin";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    // 1. Validate input
    if (!identifier || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // 2. Find user by CNIC or phone
    const { data: user, error } = await supabase
      .from("User")
      .select("*")
      .eq("cnic", identifier)
      .maybeSingle();

    if (error) {
      console.error("DB error:", error);
      return NextResponse.json(
        { error: "Something went wrong. Try again." },
        { status: 500 },
      );
    }

    // 3. Generic "invalid credentials" to avoid leaking which part is wrong
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 4. Verify password
    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 5. Verification check
    if (user.verification_status !== "verified") {
      return NextResponse.json(
        {
          error:
            "Your account is not verified yet. Please contact the admin for approval.",
          code: "NOT_VERIFIED",
        },
        { status: 403 },
      );
    }

    // 6. Status check
    if (user.status !== "active") {
      return NextResponse.json(
        {
          error: "Your account has been disabled. Please contact the admin.",
          code: "DISABLED",
        },
        { status: 403 },
      );
    }

    // 7. Create session
    const session = await getSession();
    session.userId = String(user.id);
    session.name = user.name;
    session.role = user.role;
    await session.save();

    // 8. Success
    return NextResponse.json({
      ok: true,
      role: user.role,
      redirectTo: user.role === "admin" ? "/admin" : "/dashboard",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
