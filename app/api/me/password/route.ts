// app/api/me/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getSession } from "@/app/lib/session";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword, confirmPassword } = await req.json();

  // Validate
  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "New passwords do not match" },
      { status: 400 }
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Fetch user's current password hash
  const { data: user, error: fetchError } = await supabase
    .from("User")
    .select("id, password")
    .eq("id", session.userId)
    .single();

  if (fetchError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Verify current password
  const passwordOk = await bcrypt.compare(currentPassword, user.password);
  if (!passwordOk) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 401 }
    );
  }

  // Hash and update
  const newHash = await bcrypt.hash(newPassword, 10);
  const { error: updateError } = await supabase
    .from("User")
    .update({ password: newHash })
    .eq("id", session.userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}