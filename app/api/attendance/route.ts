// // app/api/attendance/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { createAdminClient } from "@/app/lib/supabase/admin";
// import { getSession } from "@/app/lib/session";

// /* ---------- GET: list attendance ----------
//    Admin: all rows (optionally filtered by ?meeting_number=)
//    Member: only their own rows
// */
// export async function GET(req: NextRequest) {
//   const session = await getSession();
//   if (!session.userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const url = new URL(req.url);
//   const meetingNumber = url.searchParams.get("meeting_number");
//   const supabase = createAdminClient();

//   let query = supabase
//     .from("Attendance")
//     .select(
//       "id, meeting_number, user_id, status, marked_at, User:user_id (id, name, cnic)"
//     )
//     .order("marked_at", { ascending: false });

//   // Members only see their own
//   if (session.role !== "admin") {
//     query = query.eq("user_id", session.userId);
//   }

//   if (meetingNumber) {
//     query = query.eq("meeting_number", Number(meetingNumber));
//   }

//   const { data, error } = await query;
//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
//   return NextResponse.json(data ?? []);
// }

// /* ---------- POST: mark/upsert attendance (admin only) ---------- */
// export async function POST(req: NextRequest) {
//   const session = await getSession();
//   if (!session.userId || session.role !== "admin") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
//   }

//   const body = await req.json();
//   const { meeting_number, user_id, status } = body;

//   if (!meeting_number || !user_id || !status) {
//     return NextResponse.json({ error: "Missing fields" }, { status: 400 });
//   }
//   if (!["present", "absent"].includes(status)) {
//     return NextResponse.json({ error: "Invalid status" }, { status: 400 });
//   }

//   const supabase = createAdminClient();

//   const { data, error } = await supabase
//     .from("Attendance")
//     .upsert(
//       {
//         meeting_number,
//         user_id,
//         status,
//         marked_at: new Date().toISOString(),
//       },
//       { onConflict: "meeting_number,user_id" }
//     )
//     .select()
//     .single();

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
//   return NextResponse.json(data);
// }

// /* ---------- DELETE: clear one row (admin only) ---------- */
// export async function DELETE(req: NextRequest) {
//   const session = await getSession();
//   if (!session.userId || session.role !== "admin") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
//   }

//   const url = new URL(req.url);
//   const meetingNumber = url.searchParams.get("meeting_number");
//   const userId = url.searchParams.get("user_id");

//   if (!meetingNumber || !userId) {
//     return NextResponse.json({ error: "Missing fields" }, { status: 400 });
//   }

//   const supabase = createAdminClient();
//   const { error } = await supabase
//     .from("Attendance")
//     .delete()
//     .eq("meeting_number", Number(meetingNumber))
//     .eq("user_id", userId);

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
//   return NextResponse.json({ ok: true });
// }















































// app/api/attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getSession } from "@/app/lib/session";

/* ---------- GET: list attendance ----------
   Admin: all rows (optionally filtered by ?meeting_number=)
   Member: only their own rows
*/
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const meetingNumber = url.searchParams.get("meeting_number");
  const supabase = createAdminClient();

  let query = supabase
    .from("Attendance")
    .select("id, meeting_number, user_id, status, marked_at")
    .order("marked_at", { ascending: false });

  if (session.role !== "admin") {
    query = query.eq("user_id", session.userId);
  }

  if (meetingNumber) {
    query = query.eq("meeting_number", Number(meetingNumber));
  }

  const { data: att, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch user details in a second query (avoids any FK join cache issues)
  const userIds = Array.from(new Set((att ?? []).map((a) => a.user_id)));
  const userMap: Record<string, { id: string; name: string; cnic: string }> =
    {};

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

  const merged = (att ?? []).map((a) => ({
    ...a,
    User: userMap[String(a.user_id)] ?? null,
  }));

  return NextResponse.json(merged);
}

/* ---------- POST: mark/upsert a single attendance row (admin only) ---------- */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { meeting_number, user_id, status } = body;

  if (!meeting_number || !user_id || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!["present", "absent"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("Attendance")
    .upsert(
      {
        meeting_number,
        user_id,
        status,
        marked_at: new Date().toISOString(),
      },
      { onConflict: "meeting_number,user_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

/* ---------- PUT: bulk save (used by the Save Attendance button) ---------- */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { meeting_number, entries } = body as {
    meeting_number: number;
    entries: { user_id: string; status: "present" | "absent" }[];
  };

  if (!meeting_number || !Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const rows = entries
    .filter((e) => e.status === "present" || e.status === "absent")
    .map((e) => ({
      meeting_number,
      user_id: e.user_id,
      status: e.status,
      marked_at: now,
    }));

  if (rows.length === 0) {
    return NextResponse.json({ error: "No valid entries" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("Attendance")
    .upsert(rows, { onConflict: "meeting_number,user_id" })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, count: data?.length ?? 0 });
}

/* ---------- DELETE: clear one row (admin only) ---------- */
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(req.url);
  const meetingNumber = url.searchParams.get("meeting_number");
  const userId = url.searchParams.get("user_id");

  if (!meetingNumber || !userId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("Attendance")
    .delete()
    .eq("meeting_number", Number(meetingNumber))
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}