"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
  Search,
  Plus,
  Calendar,
  MapPin,
  Clock,
  Users,
  Edit,
  Eye,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarCheck,
  UserPlus,
} from "lucide-react";
import { useUser } from "../UserContext";

interface Meeting {
  id: string;
  title: string;
  agenda: string | null;
  location: string;
  date: string;
  meeting_number: number;
  arranged_by: string;
  created_at: string;
}

interface MemberOption {
  id: string;
  name: string;
  role: string;
}

type StatusFilter = "All" | "Upcoming" | "Completed" | "Cancelled";

/* ---------- Helpers ---------- */

function getMeetingStatus(date: string): "Upcoming" | "Completed" | "Cancelled" {
  const t = new Date(date).getTime();
  const now = Date.now();
  if (t > now) return "Upcoming";
  return "Completed";
}

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

/* ---------- Timezone-safe conversion helpers ---------- */

/** Convert a UTC ISO string from DB → local "YYYY-MM-DDTHH:mm" for datetime-local input */
function toLocalInputValue(utcIso: string | null | undefined): string {
  if (!utcIso) return "";
  const d = new Date(utcIso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert local datetime-local value → UTC ISO string for DB */
function toUtcIso(localValue: string): string {
  return new Date(localValue).toISOString();
}

/* ---------- CSV ---------- */

function escapeCsv(v: unknown) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadMeetingsCsv(meetings: Meeting[]) {
  const headers = [
    "Meeting #",
    "Title",
    "Location",
    "Date",
    "Arranged By",
    "Agenda",
    "Status",
  ];
  const rows = meetings.map((m) => [
    m.meeting_number,
    m.title,
    m.location,
    formatDateTime(m.date),
    m.arranged_by,
    m.agenda || "",
    getMeetingStatus(m.date),
  ]);
  const csv = [
    headers.map(escapeCsv).join(","),
    ...rows.map((r) => r.map(escapeCsv).join(",")),
  ].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `meetings-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------- Page ---------- */

export default function MeetingsPage() {
  const router = useRouter();
  const user = useUser();
  const isAdmin = user.role === "admin";

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchMeetings = async () => {
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load meetings");
      setMeetings(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      if (res.ok) setMembers(data);
    } catch {
      /* non-fatal */
    }
  };

  useEffect(() => {
    fetchMeetings();
    if (isAdmin) fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const filteredMeetings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return meetings.filter((m) => {
      const matchesSearch =
        !term ||
        m.title.toLowerCase().includes(term) ||
        m.location.toLowerCase().includes(term) ||
        m.arranged_by.toLowerCase().includes(term) ||
        String(m.meeting_number).includes(term);

      const status = getMeetingStatus(m.date);
      const matchesStatus =
        selectedStatus === "All" || status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [meetings, searchTerm, selectedStatus]);

  const stats = useMemo(() => {
    const upcoming = meetings.filter(
      (m) => getMeetingStatus(m.date) === "Upcoming"
    ).length;
    const completed = meetings.filter(
      (m) => getMeetingStatus(m.date) === "Completed"
    ).length;
    return { total: meetings.length, upcoming, completed };
  }, [meetings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Upcoming":
        return <CalendarCheck className="w-3 h-3" />;
      case "Completed":
        return <CheckCircle className="w-3 h-3" />;
      case "Cancelled":
        return <XCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const handleExport = () => {
    if (filteredMeetings.length === 0) {
      alert("No meetings to export.");
      return;
    }
    downloadMeetingsCsv(filteredMeetings);
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#2c6e49]">
            Meetings
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            {isAdmin
              ? "Manage and view all welfare meetings"
              : "View all welfare meetings"}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 sm:flex-initial bg-[#2c6e49] hover:bg-[#1f5234] text-white shadow-md hover:shadow-lg transition-all duration-300 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Meeting
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              className="flex-1 sm:flex-initial border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49]/5 text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by title, location, arranged by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 transition-all duration-300 bg-white/50"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <Filter className="w-4 h-4 text-gray-400 ml-1 shrink-0" />
          {(["All", "Upcoming", "Completed", "Cancelled"] as StatusFilter[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                  selectedStatus === status
                    ? "bg-[#2c6e49] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <p className="text-[11px] md:text-xs text-gray-500">
            Total Meetings
          </p>
          <p className="text-xl md:text-2xl font-bold text-[#2c6e49]">
            {stats.total}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <p className="text-[11px] md:text-xs text-gray-500">Upcoming</p>
          <p className="text-xl md:text-2xl font-bold text-blue-600">
            {stats.upcoming}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[11px] md:text-xs text-gray-500">Completed</p>
          <p className="text-xl md:text-2xl font-bold text-green-600">
            {stats.completed}
          </p>
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
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {!loading && !error && filteredMeetings.length > 0 && (
        <div className="space-y-3 md:space-y-4">
          {filteredMeetings.map((meeting) => {
            const status = getMeetingStatus(meeting.date);
            return (
              <Card
                key={meeting.id}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/meetings/${meeting.id}`)
                }
              >
                <CardContent className="p-0">
                  <div className="p-4 md:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#2c6e49]/10 flex items-center justify-center">
                              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#2c6e49]" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-sm md:text-base font-semibold text-gray-800">
                                {meeting.title}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border ${getStatusColor(
                                  status
                                )}`}
                              >
                                {getStatusIcon(status)}
                                {status}
                              </span>
                            </div>
                            <p className="text-[11px] md:text-xs text-gray-400 font-medium mb-2">
                              Meeting #{meeting.meeting_number}
                            </p>

                            <div className="flex flex-col gap-1.5 text-xs md:text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span className="truncate">
                                  {meeting.location}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span>{formatDateTime(meeting.date)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <UserPlus className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span className="truncate">
                                  Arranged by: {meeting.arranged_by}
                                </span>
                              </div>
                            </div>

                            {meeting.agenda && (
                              <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-[11px] md:text-xs text-gray-500 line-clamp-2">
                                  <span className="font-medium text-gray-700">
                                    Agenda:
                                  </span>{" "}
                                  {meeting.agenda}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-1 sm:flex-col sm:items-end flex-shrink-0 self-end sm:self-start"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          title="View"
                          onClick={() =>
                            router.push(`/dashboard/meetings/${meeting.id}`)
                          }
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            title="Edit"
                            onClick={() =>
                              router.push(
                                `/dashboard/meetings/${meeting.id}?edit=1`
                              )
                            }
                            className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredMeetings.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-full mb-4">
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-gray-700">
            {meetings.length === 0 ? "No meetings yet" : "No meetings found"}
          </h3>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            {meetings.length === 0
              ? isAdmin
                ? "Create your first meeting to get started."
                : "Meetings will appear here once created."
              : "Try adjusting your search or filter criteria."}
          </p>
          {meetings.length === 0 && isAdmin && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-[#2c6e49] hover:bg-[#1f5234] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Meeting
            </Button>
          )}
        </div>
      )}

      {/* Count */}
      {!loading && !error && filteredMeetings.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs md:text-sm text-gray-500">
            Showing {filteredMeetings.length} of {meetings.length} meetings
          </p>
        </div>
      )}

      {/* Create Modal — admin only */}
      {isAdmin && showCreateModal && (
        <CreateMeetingModal
          members={members}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            setLoading(true);
            setError(null);
            fetchMeetings();
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Create Meeting Modal                                                */
/* ------------------------------------------------------------------ */

function CreateMeetingModal({
  members,
  onClose,
  onCreated,
}: {
  members: MemberOption[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    location: "",
    date: "",
    agenda: "",
    meeting_number: "",
    arranged_by: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) return setError("Title is required");
    if (!form.location.trim()) return setError("Location is required");
    if (!form.date) return setError("Date & time is required");
    if (!form.meeting_number) return setError("Meeting number is required");
    if (!form.arranged_by)
      return setError("Please select who arranged the meeting");

    const num = parseInt(form.meeting_number, 10);
    if (isNaN(num) || num < 1)
      return setError("Meeting number must be a positive integer");

    setSubmitting(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          location: form.location.trim(),
          agenda: form.agenda.trim() || null,
          date: toUtcIso(form.date), // ✅ timezone-safe
          meeting_number: num,
          arranged_by: form.arranged_by,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to create meeting");
        return;
      }
      onCreated();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full p-5 md:p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-[#2c6e49]">
            Create New Meeting
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <XCircle className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Meeting Title <span className="text-red-500">*</span>
            </label>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Monthly Welfare Meeting"
              className="border-gray-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Meeting Number <span className="text-red-500">*</span>
            </label>
            <Input
              name="meeting_number"
              type="number"
              min={1}
              value={form.meeting_number}
              onChange={handleChange}
              placeholder="e.g. 12"
              className="border-gray-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Location <span className="text-red-500">*</span>
            </label>
            <Input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Community Hall, Main Branch"
              className="border-gray-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date &amp; Time <span className="text-red-500">*</span>
            </label>
            <Input
              name="date"
              type="datetime-local"
              value={form.date}
              onChange={handleChange}
              className="border-gray-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Arranged By <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                name="arranged_by"
                value={form.arranged_by}
                onChange={handleChange}
                className="w-full h-10 border border-gray-200 rounded-lg bg-white pl-10 pr-3 text-sm focus:outline-none focus:border-[#2c6e49] focus:ring-1 focus:ring-[#2c6e49]/40 transition"
                required
              >
                <option value="">Select a member...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} {m.role === "admin" ? "(Admin)" : ""}
                  </option>
                ))}
              </select>
            </div>
            {members.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                No active members found. Add members first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Agenda
            </label>
            <textarea
              name="agenda"
              value={form.agenda}
              onChange={handleChange}
              placeholder="Enter meeting agenda..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#2c6e49] focus:ring-1 focus:ring-[#2c6e49]/40 transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#2c6e49] hover:bg-[#1f5234] text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                "Create Meeting"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}