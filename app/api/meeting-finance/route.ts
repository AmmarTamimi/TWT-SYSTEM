// app/api/meeting-finance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getSession } from "@/app/lib/session";

/* ---------- GET: donations + dues for a meeting ---------- */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const meetingId = url.searchParams.get("meeting_id");
  if (!meetingId) {
    return NextResponse.json({ error: "meeting_id required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const [donationRes, dueRes] = await Promise.all([
    supabase
      .from("donation")
      .select(
        "id, userId, amount, description, reciept, meeting_id, category, created_at"
      )
      .eq("meeting_id", Number(meetingId))
      .order("created_at", { ascending: false }),
    supabase
      .from("due")
      .select("id, user_id, amount, meeting_id, created_at")
      .eq("meeting_id", Number(meetingId))
      .order("created_at", { ascending: false }),
  ]);

  if (donationRes.error || dueRes.error) {
    return NextResponse.json(
      { error: donationRes.error?.message || dueRes.error?.message },
      { status: 500 }
    );
  }

  // Attach user info
  const userIds = Array.from(
    new Set([
      ...(donationRes.data ?? [])
        .map((d) => d.userId)
        .filter((v): v is number => v !== null),
      ...(dueRes.data ?? [])
        .map((d) => d.user_id)
        .filter((v): v is number => v !== null),
    ])
  );

  const userMap: Record<string, { id: string; name: string; cnic: string }> = {};
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("User")
      .select("id, name, cnic")
      .in("id", userIds);
    for (const u of users ?? []) {
      userMap[String(u.id)] = {
        id: String(u.id),
        name: u.name,
        cnic: u.cnic,
      };
    }
  }

  return NextResponse.json({
    donations: (donationRes.data ?? []).map((d) => ({
      ...d,
      User: d.userId ? userMap[String(d.userId)] ?? null : null,
    })),
    dues: (dueRes.data ?? []).map((d) => ({
      ...d,
      User: d.user_id ? userMap[String(d.user_id)] ?? null : null,
    })),
  });
}

/* ---------- POST ---------- */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { type } = body;
  const supabase = createAdminClient();

  /* ---------- donation ---------- */
  if (type === "donation") {
    const { userId, amount, description, category, meetingId } = body;

    if (!userId || amount === undefined || !category || !meetingId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const numericUserId = Number(userId);
    const numericMeetingId = Number(meetingId);
    const numericAmount = Number(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Check if this user has an outstanding due for this meeting
    const { data: existingDue } = await supabase
      .from("due")
      .select("id, amount")
      .eq("meeting_id", numericMeetingId)
      .eq("user_id", numericUserId)
      .maybeSingle();

    // Compensation: if a due exists, reduce it by the donation amount
    let remainingDue = 0;
    let dueCompensated = 0;
    if (existingDue) {
      const dueAmount = Number(existingDue.amount);
      remainingDue = dueAmount - numericAmount;
      dueCompensated = Math.min(dueAmount, numericAmount);

      if (remainingDue <= 0) {
        await supabase.from("due").delete().eq("id", existingDue.id);
        remainingDue = 0;
      } else {
        await supabase
          .from("due")
          .update({ amount: remainingDue })
          .eq("id", existingDue.id);
      }
    }

    // Auto-generate receipt number
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from("donation")
      .select("id", { count: "exact", head: true })
      .gte("created_at", `${year}-01-01T00:00:00Z`)
      .lt("created_at", `${year + 1}-01-01T00:00:00Z`);

    const seq = String((count ?? 0) + 1).padStart(4, "0");
    const receiptNumber = `TWT-${year}-${seq}`;

    const { data, error } = await supabase
      .from("donation")
      .insert({
        userId: numericUserId,
        amount: numericAmount,
        description: description || null,
        reciept: receiptNumber,
        category,
        meeting_id: numericMeetingId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        ...data,
        _compensation: existingDue
          ? { dueCompensated, remainingDue }
          : null,
      },
      { status: 201 }
    );
  }

  /* ---------- single due ---------- */
  if (type === "due") {
    const { userId, amount, meetingId } = body;

    if (!userId || amount === undefined || !meetingId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("due")
      .insert({
        user_id: Number(userId),
        amount: Number(amount),
        meeting_id: Number(meetingId),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  }

  /* ---------- bulk due (all users: admins + members) ---------- */
  if (type === "bulk_due") {
    const { meetingId, amount } = body;

    if (!meetingId || amount === undefined) {
      return NextResponse.json(
        { error: "meetingId and amount are required" },
        { status: 400 }
      );
    }

    const bulkAmount = Number(amount);
    if (isNaN(bulkAmount) || bulkAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const meetingNum = Number(meetingId);

    // Get ALL users (both admins and members)
    const { data: allUsers, error: usersErr } = await supabase
      .from("User")
      .select("id");

    if (usersErr) {
      return NextResponse.json({ error: usersErr.message }, { status: 500 });
    }

    // Skip users who already donated or have a due for this meeting
    const [{ data: donations }, { data: dues }] = await Promise.all([
      supabase.from("donation").select("userId").eq("meeting_id", meetingNum),
      supabase.from("due").select("user_id").eq("meeting_id", meetingNum),
    ]);

    const settledIds = new Set([
      ...(donations ?? []).map((d) => String(d.userId)),
      ...(dues ?? []).map((d) => String(d.user_id)),
    ]);

    const pendingUsers = (allUsers ?? []).filter(
      (u) => !settledIds.has(String(u.id))
    );

    if (pendingUsers.length === 0) {
      return NextResponse.json({
        ok: true,
        count: 0,
        message: "All users are already settled for this meeting.",
      });
    }

    const rows = pendingUsers.map((u) => ({
      user_id: Number(u.id),
      amount: bulkAmount,
      meeting_id: meetingNum,
    }));

    const { error: insertErr } = await supabase.from("due").insert(rows);

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: pendingUsers.length });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

/* ---------- DELETE ---------- */
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const id = url.searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const table =
    type === "donation" ? "donation" : type === "due" ? "due" : null;
  if (!table) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}