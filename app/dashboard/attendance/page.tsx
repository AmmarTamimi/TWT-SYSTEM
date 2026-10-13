"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import {
  Search,
  CalendarCheck,
  Filter,
  AlertCircle,
  Download,
  Clock,
  ChevronDown,
  Users,
} from "lucide-react";
import { useUser } from "../UserContext";

/* ---------------- Types ---------------- */

type AttendanceRow = {
  id: number;
  meeting_number: number;
  user_id: string;
  status: "present" | "absent";
  marked_at: string;
  User?: {
    id: string;
    name: string;
    cnic: string;
  } | null;
};

type MeetingRef = {
  id: string;
  meeting_number: number;
  title: string;
  date: string;
};

type FilterType = "all" | "present" | "absent";

type MeetingGroup = {
  meeting_number: number;
  meeting?: MeetingRef;
  rows: AttendanceRow[];
  present: number;
  absent: number;
  total: number;
  lastMarkedAt: string | null;
};

/* ---------------- CSV helpers ---------------- */

function escapeCsv(v: unknown) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadAttendanceCsv(rows: AttendanceRow[], meetings: MeetingRef[]) {
  const meetingMap = new Map(meetings.map((m) => [m.meeting_number, m]));
  const headers = [
    "Meeting #",
    "Meeting Title",
    "Meeting Date",
    "Member Name",
    "CNIC",
    "Status",
    "Marked At",
  ];
  const data = rows.map((r) => {
    const meeting = meetingMap.get(r.meeting_number);
    return [
      r.meeting_number,
      meeting?.title || "",
      meeting ? formatDateTime(meeting.date) : "",
      r.User?.name || "",
      r.User?.cnic || "",
      r.status,
      formatDateTime(r.marked_at),
    ];
  });
  const csv = [
    headers.map(escapeCsv).join(","),
    ...data.map((r) => r.map(escapeCsv).join(",")),
  ].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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

/* ---------------- Page ---------------- */

export default function AttendancePage() {
  const user = useUser();
  const isAdmin = user.role === "admin";

  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [meetings, setMeetings] = useState<MeetingRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  /* ---------- Fetch ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [attRes, meetRes] = await Promise.all([
          fetch("/api/attendance"),
          fetch("/api/meetings"),
        ]);

        const attData = await attRes.json();
        if (!attRes.ok)
          throw new Error(attData.error || "Failed to load attendance");

        const meetData = meetRes.ok ? await meetRes.json() : [];

        if (!cancelled) {
          setRows(attData ?? []);
          setMeetings(
            (meetData ?? []).map((m: any) => ({
              id: m.id,
              meeting_number: m.meeting_number,
              title: m.title,
              date: m.date,
            }))
          );
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
  }, []);

  /* ---------- Lookup ---------- */
  const meetingByNumber = useMemo(() => {
    const map = new Map<number, MeetingRef>();
    for (const m of meetings) map.set(m.meeting_number, m);
    return map;
  }, [meetings]);

  /* ---------- Filter + dedupe ---------- */
  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    let base = rows;
    if (!isAdmin) {
      const myId = String(user.id);
      base = base.filter((r) => String(r.user_id) === myId);
    }

    const seen = new Map<string, AttendanceRow>();
    for (const r of base) {
      const key = `${r.meeting_number}::${r.user_id}`;
      const existing = seen.get(key);
      if (!existing || new Date(r.marked_at) > new Date(existing.marked_at)) {
        seen.set(key, r);
      }
    }
    base = Array.from(seen.values());

    return base.filter((r) => {
      const meeting = meetingByNumber.get(r.meeting_number);
      const matchesSearch =
        !term ||
        (r.User?.name ?? "").toLowerCase().includes(term) ||
        (r.User?.cnic ?? "").toLowerCase().includes(term) ||
        (meeting?.title ?? "").toLowerCase().includes(term) ||
        String(r.meeting_number).includes(term);

      const matchesFilter = filter === "all" || r.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [rows, search, filter, meetingByNumber, isAdmin, user.id]);

  /* ---------- Group by meeting ---------- */
  const groups: MeetingGroup[] = useMemo(() => {
    const map = new Map<number, MeetingGroup>();

    for (const r of filteredRows) {
      if (!map.has(r.meeting_number)) {
        map.set(r.meeting_number, {
          meeting_number: r.meeting_number,
          meeting: meetingByNumber.get(r.meeting_number),
          rows: [],
          present: 0,
          absent: 0,
          total: 0,
          lastMarkedAt: null,
        });
      }
      const g = map.get(r.meeting_number)!;
      g.rows.push(r);
      if (r.status === "present") g.present++;
      else if (r.status === "absent") g.absent++;
      g.total++;
      if (!g.lastMarkedAt || r.marked_at > g.lastMarkedAt) {
        g.lastMarkedAt = r.marked_at;
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const ad = a.meeting?.date ? new Date(a.meeting.date).getTime() : 0;
      const bd = b.meeting?.date ? new Date(b.meeting.date).getTime() : 0;
      if (ad !== bd) return bd - ad;
      return b.meeting_number - a.meeting_number;
    });
  }, [filteredRows, meetingByNumber]);

  /* ---------- Stats ---------- */
  const stats = useMemo(() => {
    const present = filteredRows.filter((r) => r.status === "present").length;
    const absent = filteredRows.filter((r) => r.status === "absent").length;
    const total = filteredRows.length;
    return {
      total,
      present,
      absent,
      rate: total === 0 ? 0 : Math.round((present / total) * 100),
    };
  }, [filteredRows]);

  const handleExport = () => {
    if (filteredRows.length === 0) {
      alert("Nothing to export.");
      return;
    }
    downloadAttendanceCsv(filteredRows, meetings);
  };

  const toggleExpand = (meetingNumber: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(meetingNumber)) next.delete(meetingNumber);
      else next.add(meetingNumber);
      return next;
    });
  };

  const expandAll = () =>
    setExpanded(new Set(groups.map((g) => g.meeting_number)));
  const collapseAll = () => setExpanded(new Set());

  return (
    <div className="space-y-5 md:space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#2c6e49]">
            {isAdmin ? "Attendance" : "My Attendance"}
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            {isAdmin
              ? "View attendance records grouped by meeting"
              : "Your attendance history across meetings"}
          </p>
        </div>
        {isAdmin && filteredRows.length > 0 && (
          <button
            onClick={handleExport}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49]/5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox
          label={isAdmin ? "Total Records" : "Total Marked"}
          value={stats.total}
          color="text-[#2c6e49]"
        />
        <StatBox
          label="Present"
          value={stats.present}
          color="text-emerald-600"
        />
        <StatBox label="Absent" value={stats.absent} color="text-rose-600" />
        <StatBox label="Rate" value={`${stats.rate}%`} color="text-blue-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={
              isAdmin
                ? "Search by member, CNIC, or meeting..."
                : "Search by meeting..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-gray-200 bg-white/50"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <Filter className="w-4 h-4 text-gray-400 ml-1 shrink-0" />
            {(["all", "present", "absent"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                  filter === f
                    ? "bg-[#2c6e49] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {groups.length > 0 && (
            <div className="flex items-center gap-2 sm:shrink-0 self-end sm:self-auto">
              <button
                onClick={expandAll}
                className="text-[11px] text-gray-500 hover:text-[#2c6e49] font-medium"
              >
                Expand all
              </button>
              <span className="text-gray-300">·</span>
              <button
                onClick={collapseAll}
                className="text-[11px] text-gray-500 hover:text-[#2c6e49] font-medium"
              >
                Collapse all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Grouped list */}
      {!loading && !error && groups.length > 0 && (
        <div className="space-y-3">
          {groups.map((group) => {
            const isOpen = expanded.has(group.meeting_number);
            const rate =
              group.total === 0
                ? 0
                : Math.round((group.present / group.total) * 100);

            return (
              <Card
                key={group.meeting_number}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Header */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(group.meeting_number)}
                    className={`w-full text-left p-4 md:p-5 flex items-start justify-between gap-3 transition-colors ${
                      isOpen ? "bg-[#2c6e49]/5" : "hover:bg-gray-50"
                    }`}
                    aria-expanded={isOpen}
                  >
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm md:text-base font-semibold text-gray-800 truncate">
                          {group.meeting?.title ||
                            `Meeting #${group.meeting_number}`}
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] md:text-[11px] font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          Meeting #{group.meeting_number}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 text-[11px] md:text-xs text-gray-500">
                        {group.meeting?.date && (
                          <span className="flex items-center gap-1">
                            <CalendarCheck className="w-3 h-3" />
                            {formatDateTime(group.meeting.date)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {group.total}{" "}
                          {group.total === 1 ? "record" : "records"}
                        </span>
                        {group.lastMarkedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last marked {formatDateTime(group.lastMarkedAt)}
                          </span>
                        )}
                      </div>

                      {/* Summary pills */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <SummaryPill
                          label="Present"
                          value={group.present}
                          variant="present"
                        />
                        <SummaryPill
                          label="Absent"
                          value={group.absent}
                          variant="absent"
                        />
                        <span className="text-[11px] text-gray-400">
                          {rate}% attendance
                        </span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <div className="shrink-0 pt-1">
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded body */}
                  {isOpen && (
                    <div className="border-t border-gray-100 px-3 md:px-5 py-3 bg-white">
                      <div className="space-y-1.5">
                        {group.rows.map((r) => (
                          <div
                            key={r.id}
                            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {/* Member info */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2c6e49] to-[#1f5234] flex items-center justify-center text-white font-semibold text-[11px] shrink-0">
                                {(r.User?.name || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {r.User?.name || `User #${r.user_id}`}
                                </p>
                                {r.User?.cnic && (
                                  <p className="text-[11px] text-gray-400 font-mono truncate">
                                    {r.User.cnic}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right side: status pill + marked-at */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:shrink-0 pl-11 sm:pl-0">
                              <StatusPill status={r.status} />
                              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                <Clock className="w-3 h-3" />
                                {formatDateTime(r.marked_at)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && groups.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-full mb-4">
            <CalendarCheck className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-gray-700">
            {rows.length === 0 ? "No attendance yet" : "No records found"}
          </h3>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            {rows.length === 0
              ? isAdmin
                ? "Mark attendance in a meeting to see records here."
                : "Your attendance will appear here once admins mark it."
              : "Try adjusting your search or filter."}
          </p>
        </div>
      )}

      {/* Footer */}
      {!loading && !error && groups.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs md:text-sm text-gray-500">
            {groups.length} {groups.length === 1 ? "meeting" : "meetings"} ·{" "}
            {filteredRows.length} total records
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------------- Status pill ---------------- */

function StatusPill({ status }: { status: "present" | "absent" }) {
  const styles =
    status === "present"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border tracking-wide ${styles}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ---------------- Summary pill ---------------- */

function SummaryPill({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "present" | "absent";
}) {
  const styles =
    variant === "present"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border ${styles}`}
    >
      <span className="font-bold">{value}</span>
      {label}
    </span>
  );
}

/* ---------------- Stat box ---------------- */

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm">
      <p className="text-[11px] md:text-xs text-gray-500">{label}</p>
      <p className={`text-xl md:text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}