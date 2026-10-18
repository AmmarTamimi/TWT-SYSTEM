// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getSession } from "@/app/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const userId = Number(session.userId);
  const isAdmin = session.role === "admin";

  /* ================================================================
   * MEMBER DASHBOARD — personal stats only
   * ================================================================ */
  if (!isAdmin) {
    // 1. Attendance records (how many meetings they were marked present in)
    const { data: attendanceRows } = await supabase
      .from("Attendance")
      .select("id, status, marked_at")
      .eq("user_id", userId);

    const attendanceCount = attendanceRows?.length ?? 0;
    const meetingsAttended =
      attendanceRows?.filter((a) => a.status === "present").length ?? 0;

    // 2. Outstanding dues (sum)
    const { data: dueRows } = await supabase
      .from("due")
      .select("amount")
      .eq("user_id", userId);

    const outstandingDues = (dueRows ?? []).reduce(
      (sum, d) => sum + Number(d.amount),
      0
    );

    // 3. Total funds donated
    const { data: donationRows } = await supabase
      .from("donation")
      .select("amount")
      .eq("userId", userId);

    const totalDonated = (donationRows ?? []).reduce(
      (sum, d) => sum + Number(d.amount),
      0
    );

    return NextResponse.json({
      role: "member",
      stats: {
        attendanceCount,
        meetingsAttended,
        outstandingDues,
        totalDonated,
      },
      activities: [], // no activity feed for members
    });
  }

  /* ================================================================
   * ADMIN DASHBOARD — org-wide stats + activity (unchanged)
   * ================================================================ */
  const { count: totalMembers } = await supabase
    .from("User")
    .select("id", { count: "exact", head: true })
    .eq("role", "member");

  const { data: allDonations } = await supabase
    .from("donation")
    .select("amount");
  const totalFunds = (allDonations ?? []).reduce(
    (sum, d) => sum + Number(d.amount),
    0
  );

  const { count: meetingsHeld } = await supabase
    .from("Meeting")
    .select("id", { count: "exact", head: true })
    .lte("date", new Date().toISOString());

  const { count: duesCount } = await supabase
    .from("due")
    .select("id", { count: "exact", head: true });

  /* ---------- Recent activity (top 5) ---------- */

  const { data: recentMeetings } = await supabase
    .from("Meeting")
    .select("id, title, meeting_number, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentDonations } = await supabase
    .from("donation")
    .select("id, amount, category, created_at, userId")
    .order("created_at", { ascending: false })
    .limit(5);

  const donorIds = Array.from(
    new Set(
      (recentDonations ?? [])
        .map((d) => d.userId)
        .filter((v): v is number => v !== null)
    )
  );
  const { data: donors } = donorIds.length
    ? await supabase.from("User").select("id, name").in("id", donorIds)
    : { data: [] as { id: number; name: string }[] };
  const donorMap = new Map(
    (donors ?? []).map((u) => [String(u.id), u.name])
  );

  const { data: recentMembers } = await supabase
    .from("User")
    .select("id, name, verification_status, created_at")
    .eq("role", "member")
    .order("created_at", { ascending: false })
    .limit(10);

  type Activity = {
    action: string;
    actor: string;
    ts: number;
    kind: "meeting" | "donation" | "member" | "verified" | "declined";
  };

  const activities: Activity[] = [];

  for (const m of recentMeetings ?? []) {
    activities.push({
      action: `Meeting created — #${m.meeting_number} ${m.title}`,
      actor: "Admin",
      ts: new Date(m.created_at).getTime(),
      kind: "meeting",
    });
  }

  for (const d of recentDonations ?? []) {
    const name = d.userId
      ? donorMap.get(String(d.userId)) ?? "Unknown"
      : "Unknown";
    activities.push({
      action: `Donation added — PKR ${Number(d.amount).toLocaleString()} (${
        d.category
      })`,
      actor: name,
      ts: new Date(d.created_at).getTime(),
      kind: "donation",
    });
  }

  for (const m of recentMembers ?? []) {
    let kind: Activity["kind"] = "member";
    let action = `User registered — ${m.name}`;

    if (m.verification_status === "verified") {
      kind = "verified";
      action = `User verified — ${m.name}`;
    } else if (m.verification_status === "declined") {
      kind = "declined";
      action = `User declined — ${m.name}`;
    }

    activities.push({
      action,
      actor: "Admin",
      ts: new Date(m.created_at).getTime(),
      kind,
    });
  }

  activities.sort((a, b) => b.ts - a.ts);
  const top5 = activities.slice(0, 5);

  const now = Date.now();
  const formatRelative = (ts: number) => {
    const diffSec = Math.floor((now - ts) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return new Date(ts).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  const finalActivities = top5.map((a) => ({
    action: a.action,
    user: a.actor,
    time: formatRelative(a.ts),
    kind: a.kind,
  }));

  return NextResponse.json({
    role: "admin",
    stats: {
      totalMembers: totalMembers ?? 0,
      totalFunds,
      meetingsHeld: meetingsHeld ?? 0,
      duesCount: duesCount ?? 0,
    },
    activities: finalActivities,
  });
}