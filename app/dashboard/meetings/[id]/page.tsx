"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Hash,
  UserPlus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Users,
  Search,
  UserCog,
  ShieldCheck,
  Lock,
  Wallet,
} from "lucide-react";
import { useUser } from "../../UserContext";

/* ---------------- Types ---------------- */

type Meeting = {
  id: string;
  title: string;
  agenda: string | null;
  location: string;
  date: string;
  meeting_number: number;
  arranged_by: string;
  created_at: string;
};

type Member = {
  id: string;
  name: string;
  cnic: string;
  role: string;
};

type AttendanceRow = {
  id: number;
  meeting_number: number;
  user_id: string;
  status: "present" | "absent";
  marked_at: string;
};

/* ---------------- Formatting ---------------- */

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function toLocalInputValue(utcIso: string | null | undefined): string {
  if (!utcIso) return "";
  const d = new Date(utcIso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toUtcIso(localValue: string): string {
  return new Date(localValue).toISOString();
}

/* ---------------- Page ---------------- */

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const id = params.id as string;

  /* ---------- Tab state (admin only) ---------- */
  const [tab, setTab] = useState<"attendance" | "funding">("attendance");

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft, setDraft] = useState<Partial<Meeting>>({});

  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<
    Record<string, "present" | "absent">
  >({});
  const [originalAttendance, setOriginalAttendance] = useState<
    Record<string, "present" | "absent">
  >({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [search, setSearch] = useState("");

  const isAdmin = user.role === "admin";

  /* ---------- Fetch ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [meetingRes, membersRes] = await Promise.all([
          fetch(`/api/meetings/${id}`),
          isAdmin ? fetch(`/api/members`) : Promise.resolve(null),
        ]);

        const meetingData = await meetingRes.json();
        if (!meetingRes.ok)
          throw new Error(meetingData.error || "Failed to load meeting");

        const membersData =
          membersRes && membersRes.ok ? await membersRes.json() : [];

        let attData: AttendanceRow[] = [];
        if (isAdmin) {
          const attRes = await fetch(
            `/api/attendance?meeting_number=${meetingData.meeting_number}`
          );
          attData = attRes.ok ? await attRes.json() : [];
        }

        if (!cancelled) {
          setMeeting(meetingData);
          setDraft(meetingData);
          setMembers(membersData ?? []);

          const map: Record<string, "present" | "absent"> = {};
          for (const a of attData) {
            map[String(a.user_id)] = a.status;
          }
          setAttendance(map);
          setOriginalAttendance(map);
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isAdmin]);

  /* ---------- Save meeting ---------- */
  const handleSave = async () => {
    if (!meeting) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          location: draft.location,
          agenda: draft.agenda,
          date: draft.date,
          arranged_by: draft.arranged_by,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMeeting(data);
      setDraft(data);
      setEditing(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Delete meeting ---------- */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/meetings/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      router.push("/dashboard/meetings");
      router.refresh();
    } catch (err) {
      alert((err as Error).message);
      setDeleting(false);
    }
  };

  /* ---------- Toggle attendance ---------- */
  const toggleAttendance = (
    memberId: string,
    status: "present" | "absent"
  ) => {
    setAttendance((prev) => ({ ...prev, [memberId]: status }));
  };

  /* ---------- Save attendance ---------- */
  const saveAttendance = async () => {
    if (!meeting) return;

    const entries = Object.entries(attendance).map(([user_id, status]) => ({
      user_id,
      status,
    }));

    if (entries.length === 0) return;

    setSavingAttendance(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_number: meeting.meeting_number,
          entries,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save attendance");

      setOriginalAttendance({ ...attendance });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingAttendance(false);
    }
  };

  /* ---------- Derived ---------- */
  const meetingHasOccurred = useMemo(() => {
    if (!meeting) return false;
    const meetingTime = new Date(meeting.date).getTime();
    return Date.now() >= meetingTime;
  }, [meeting]);

  const hasUnsavedChanges = useMemo(() => {
    const keys = new Set([
      ...Object.keys(attendance),
      ...Object.keys(originalAttendance),
    ]);
    for (const k of keys) {
      if (attendance[k] !== originalAttendance[k]) return true;
    }
    return false;
  }, [attendance, originalAttendance]);

  const admins = useMemo(
    () => members.filter((m) => m.role === "admin"),
    [members]
  );
  const regularMembers = useMemo(
    () => members.filter((m) => m.role !== "admin"),
    [members]
  );

  const filterBySearch = (list: Member[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.cnic.toLowerCase().includes(q)
    );
  };

  const filteredAdmins = filterBySearch(admins);
  const filteredMembers = filterBySearch(regularMembers);

  const attendanceStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    for (const m of members) {
      const s = attendance[m.id];
      if (s === "present") present++;
      else if (s === "absent") absent++;
    }
    return { present, absent, total: members.length };
  }, [attendance, members]);

  /* ---------- Loading / error ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Loading meeting...
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-lg font-semibold text-gray-800">
          {error || "Meeting not found"}
        </h2>
        <Link
          href="/dashboard/meetings"
          className="mt-4 inline-flex items-center gap-2 text-[#2c6e49] font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Meetings
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`space-y-5 md:space-y-6 max-w-5xl ${
        isAdmin && tab === "attendance" && meetingHasOccurred ? "pb-28" : ""
      }`}
    >
      {/* Back */}
      <Link
        href="/dashboard/meetings"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#2c6e49] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Meetings
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#2c6e49]/10 to-green-50/50 rounded-2xl p-4 md:p-6 border border-[#2c6e49]/10">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-1">
              <Hash className="w-3 h-3" /> Meeting #{meeting.meeting_number}
            </p>
            <h1 className="text-xl md:text-2xl font-bold text-[#2c6e49]">
              {meeting.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-x-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                {meeting.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                {formatDateTime(meeting.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-gray-400" />
                Arranged by {meeting.arranged_by}
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-2 w-full sm:w-auto sm:self-end">
              {!editing ? (
                <>
                  <Button
                    onClick={() => setEditing(true)}
                    className="flex-1 sm:flex-initial bg-[#2c6e49] hover:bg-[#1f5234] text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setConfirmDelete(true)}
                    variant="outline"
                    className="flex-1 sm:flex-initial border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 sm:flex-initial bg-[#2c6e49] hover:bg-[#1f5234] text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={() => {
                      setDraft(meeting);
                      setEditing(false);
                    }}
                    variant="outline"
                    className="flex-1 sm:flex-initial border-gray-300 text-gray-600"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details / Edit */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-5">
          {editing ? (
            <>
              <Field label="Title">
                <Input
                  value={draft.title ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, title: e.target.value }))
                  }
                />
              </Field>
              <Field label="Location">
                <Input
                  value={draft.location ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, location: e.target.value }))
                  }
                />
              </Field>
              <Field label="Date & Time">
                <Input
                  type="datetime-local"
                  value={toLocalInputValue(draft.date)}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      date: toUtcIso(e.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Arranged By">
                <Input
                  value={draft.arranged_by ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, arranged_by: e.target.value }))
                  }
                />
              </Field>
              <Field label="Agenda">
                <textarea
                  value={draft.agenda ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, agenda: e.target.value }))
                  }
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#2c6e49] focus:ring-1 focus:ring-[#2c6e49]/40 transition resize-none"
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Meeting #">
                <span className="font-medium">{meeting.meeting_number}</span>
              </Field>
              <Field label="Location">
                <span className="font-medium">{meeting.location}</span>
              </Field>
              <Field label="Date & Time">
                <span className="font-medium">
                  {formatDateTime(meeting.date)}
                </span>
              </Field>
              <Field label="Arranged By">
                <span className="font-medium">{meeting.arranged_by}</span>
              </Field>
              <Field label="Agenda">
                <span className="font-medium text-gray-700">
                  {meeting.agenda || "—"}
                </span>
              </Field>
            </>
          )}
        </CardContent>
      </Card>

      {/* ---------- Tab switcher — ADMIN ONLY ---------- */}
      {isAdmin && (
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setTab("attendance")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === "attendance"
                ? "border-[#2c6e49] text-[#2c6e49]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Attendance
          </button>
          <button
            onClick={() => setTab("funding")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === "funding"
                ? "border-[#2c6e49] text-[#2c6e49]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Wallet className="w-4 h-4" />
            Funding
          </button>
        </div>
      )}

      {/* ---------- Tab: Attendance — ADMIN ONLY ---------- */}
      {isAdmin &&
        tab === "attendance" &&
        (meetingHasOccurred ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col gap-3 mb-4 md:mb-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#2c6e49]" />
                    Attendance
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {attendanceStats.present} present ·{" "}
                    {attendanceStats.absent} absent ·{" "}
                    {attendanceStats.total} total
                    {hasUnsavedChanges && (
                      <span className="ml-2 text-amber-600 font-medium">
                        • Unsaved changes
                      </span>
                    )}
                  </p>
                </div>
                <div className="relative w-full sm:w-64 sm:self-end">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 border-gray-200"
                  />
                </div>
              </div>

              {members.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No members to mark.
                </p>
              ) : (
                <div className="space-y-6">
                  {filteredAdmins.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                        <div className="w-7 h-7 rounded-lg bg-[#2c6e49]/10 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-[#2c6e49]" />
                        </div>
                        <h4 className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          Admins
                        </h4>
                        <span className="ml-auto text-xs text-gray-400 font-medium">
                          {filteredAdmins.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {filteredAdmins.map((m) => (
                          <AttendanceRowCard
                            key={m.id}
                            member={m}
                            status={attendance[m.id]}
                            isAdmin={isAdmin}
                            onToggle={(s) => toggleAttendance(m.id, s)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredMembers.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                          <UserCog className="w-4 h-4 text-blue-600" />
                        </div>
                        <h4 className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          Members
                        </h4>
                        <span className="ml-auto text-xs text-gray-400 font-medium">
                          {filteredMembers.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {filteredMembers.map((m) => (
                          <AttendanceRowCard
                            key={m.id}
                            member={m}
                            status={attendance[m.id]}
                            isAdmin={isAdmin}
                            onToggle={(s) => toggleAttendance(m.id, s)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredAdmins.length === 0 &&
                    filteredMembers.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-6">
                        No members match your search.
                      </p>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm border-dashed">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-100 mb-4">
                <Lock className="w-6 h-6 md:w-7 md:h-7 text-gray-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-700">
                Attendance locked
              </h3>
              <p className="text-gray-500 text-xs md:text-sm mt-1 max-w-sm mx-auto">
                Attendance will be available to mark once the meeting has
                occurred on{" "}
                <span className="font-medium text-gray-700">
                  {formatDateTime(meeting.date)}
                </span>
                .
              </p>
            </CardContent>
          </Card>
        ))}

      {/* ---------- Tab: Funding — ADMIN ONLY ---------- */}
      {isAdmin && tab === "funding" && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 md:p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#2c6e49]/10 mb-4">
              <Wallet className="w-6 h-6 md:w-7 md:h-7 text-[#2c6e49]" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-700">
              Meeting Funding
            </h3>
            <p className="text-gray-500 text-xs md:text-sm mt-1 max-w-sm mx-auto">
              Track contributions for this meeting in a dedicated page.
            </p>
            <Link
              href={`/dashboard/meetings/${meeting.id}/funding`}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2c6e49] hover:bg-[#1f5234] text-white text-sm font-medium transition-colors"
            >
              Open Funding Page
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Floating Save bar (attendance tab only, admin only) */}
      {isAdmin &&
        tab === "attendance" &&
        meetingHasOccurred &&
        (hasUnsavedChanges || justSaved) &&
        members.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 md:left-64 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-xl shadow-lg px-4 md:px-6 py-3">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
              {justSaved && !hasUnsavedChanges ? (
                <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Attendance saved
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 hidden sm:block">
                    You have unsaved attendance changes.
                  </p>
                  <div className="flex gap-2 ml-auto w-full sm:w-auto">
                    <button
                      onClick={() => setAttendance({ ...originalAttendance })}
                      disabled={savingAttendance}
                      className="flex-1 sm:flex-initial px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Discard
                    </button>
                    <button
                      onClick={saveAttendance}
                      disabled={savingAttendance}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 text-sm rounded-lg bg-[#2c6e49] hover:bg-[#1f5234] text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {savingAttendance ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Attendance
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Delete Meeting
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{meeting.title}</span>? All
              attendance and funding records will also be removed.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Row card ---------------- */

function AttendanceRowCard({
  member,
  status,
  isAdmin,
  onToggle,
}: {
  member: Member;
  status: "present" | "absent" | undefined;
  isAdmin: boolean;
  onToggle: (status: "present" | "absent") => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 md:px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2c6e49] to-[#1f5234] flex items-center justify-center text-white font-semibold text-xs shrink-0">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {member.name}
          </p>
          <p className="text-xs text-gray-400 font-mono truncate">
            {member.cnic}
          </p>
        </div>
      </div>

      {isAdmin ? (
        <div className="flex gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => onToggle("present")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
              status === "present"
                ? "bg-[#2c6e49] text-white border-[#2c6e49]"
                : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            }`}
          >
            Present
          </button>
          <button
            onClick={() => onToggle("absent")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
              status === "absent"
                ? "bg-red-600 text-white border-red-600"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
            }`}
          >
            Absent
          </button>
        </div>
      ) : (
        <div className="shrink-0 self-end sm:self-auto">
          {status === "present" ? (
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Present
            </span>
          ) : status === "absent" ? (
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Absent
            </span>
          ) : (
            <span className="text-xs text-gray-400">Not marked</span>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Field helper ---------------- */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start sm:items-center">
      <span className="text-xs md:text-sm text-gray-500">{label}</span>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}