"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "../../../../components/ui/Card";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";
import {
  ArrowLeft,
  Wallet,
  Plus,
  AlertCircle,
  Search,
  TrendingUp,
  Receipt,
  X,
  Download,
  Users,
  CheckCircle2,
  HandCoins,
} from "lucide-react";
import { useUser } from "../../../UserContext";
import { downloadReceipt } from "../../../../lib/downloadReceipt";

/* ---------------- Types ---------------- */

type Category = "MEETING_FUND" | "MEETING_DUE";

type Donation = {
  id: number;
  userId: number | null;
  amount: number;
  description: string | null;
  reciept: string | null;
  category:
    | "ZAKAT"
    | "FITRANA"
    | "SADQA"
    | "MEETING_FUND"
    | "MEETING_DUE"
    | "GENERAL";
  meeting_id: number | null;
  created_at: string;
  User?: { id: string; name: string; cnic: string } | null;
};

type Due = {
  id: number;
  user_id: number | null;
  amount: number;
  meeting_id: number | null;
  created_at: string;
  User?: { id: string; name: string; cnic: string } | null;
};

type Member = {
  id: string;
  name: string;
  cnic: string;
  role: string;
};

type Meeting = {
  id: string;
  title: string;
  meeting_number: number;
};

/* ---------------- Helpers ---------------- */

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const categoryLabels: Record<string, string> = {
  ZAKAT: "Zakat",
  FITRANA: "Fitrana",
  SADQA: "Sadqa",
  MEETING_FUND: "Meeting Fund",
  MEETING_DUE: "Meeting Due",
  GENERAL: "General",
};

const categoryColors: Record<string, string> = {
  ZAKAT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FITRANA: "bg-amber-50 text-amber-700 border-amber-200",
  SADQA: "bg-blue-50 text-blue-700 border-blue-200",
  MEETING_FUND: "bg-green-50 text-green-700 border-green-200",
  MEETING_DUE: "bg-slate-50 text-slate-700 border-slate-200",
  GENERAL: "bg-gray-50 text-gray-700 border-gray-200",
};

/* ---------------- Page ---------------- */

export default function MeetingFundingPage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const id = params.id as string;

  const isAdmin = user.role === "admin";

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [dues, setDues] = useState<Due[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showConfirmCollection, setShowConfirmCollection] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [collectionAmount, setCollectionAmount] = useState("1000");

  // Success/error banner instead of alerts
  const [banner, setBanner] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  /* ---------- Fetch ---------- */
  const fetchAll = async () => {
    try {
      setLoading(true);
      const meetingRes = await fetch(`/api/meetings/${id}`);
      const meetingData = await meetingRes.json();
      if (!meetingRes.ok)
        throw new Error(meetingData.error || "Failed to load meeting");

      const [financeRes, membersRes] = await Promise.all([
        fetch(`/api/meeting-finance?meeting_id=${meetingData.meeting_number}`),
        isAdmin ? fetch("/api/members") : Promise.resolve(null),
      ]);

      const financeData = await financeRes.json();
      if (!financeRes.ok)
        throw new Error(financeData.error || "Failed to load finance data");

      const membersData =
        membersRes && membersRes.ok ? await membersRes.json() : [];

      setMeeting(meetingData);
      setDonations(financeData.donations ?? []);
      setDues(financeData.dues ?? []);
      setMembers(membersData ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ---------- Derived ---------- */
  const totalDonations = useMemo(
    () => donations.reduce((s, d) => s + Number(d.amount), 0),
    [donations]
  );

  const totalDues = useMemo(
    () => dues.reduce((s, d) => s + Number(d.amount), 0),
    [dues]
  );

  /**
   * Who is already settled?
   * A user is "settled" if they have a donation OR a due for this meeting.
   */
  const settledMemberIds = useMemo(() => {
    const ids = new Set<string>();
    for (const d of donations) {
      if (d.userId !== null) ids.add(String(d.userId));
    }
    for (const d of dues) {
      if (d.user_id !== null) ids.add(String(d.user_id));
    }
    return ids;
  }, [donations, dues]);

  const unsettledMembers = useMemo(
    () => members.filter((m) => !settledMemberIds.has(String(m.id))),
    [members, settledMemberIds]
  );

  const canCompleteCollection = unsettledMembers.length > 0;

  const filteredDonations = useMemo(() => {
    if (!search.trim()) return donations;
    const q = search.toLowerCase();
    return donations.filter(
      (d) =>
        (d.User?.name ?? "").toLowerCase().includes(q) ||
        (d.User?.cnic ?? "").includes(q) ||
        (categoryLabels[d.category] ?? "").toLowerCase().includes(q)
    );
  }, [donations, search]);

  const filteredDues = useMemo(() => {
    if (!search.trim()) return dues;
    const q = search.toLowerCase();
    return dues.filter(
      (d) =>
        (d.User?.name ?? "").toLowerCase().includes(q) ||
        (d.User?.cnic ?? "").includes(q)
    );
  }, [dues, search]);

  /* ---------- Download handler ---------- */
  const handleDownload = (d: Donation) => {
    downloadReceipt({
      id: d.id,
      amount: d.amount,
      description: d.description,
      reciept: d.reciept,
      category: d.category,
      meeting_id: d.meeting_id,
      created_at: d.created_at,
      User: d.User,
      Meeting: meeting
        ? {
            id: meeting.id,
            title: meeting.title,
            meeting_number: meeting.meeting_number,
          }
        : null,
    });
  };

  /* ---------- Complete collection ---------- */
  const handleCompleteCollection = async () => {
    if (!meeting) return;
    const amount = Number(collectionAmount);
    if (isNaN(amount) || amount <= 0) {
      setBanner({ type: "error", text: "Enter a valid amount." });
      return;
    }

    setCompleting(true);
    try {
      const res = await fetch("/api/meeting-finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bulk_due",
          meetingId: meeting.meeting_number,
          amount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to charge members");

      setShowConfirmCollection(false);

      if (data.count > 0) {
        setBanner({
          type: "success",
          text: `Charged ${data.count} user${
            data.count !== 1 ? "s" : ""
          } ${formatMoney(amount)} each.`,
        });
      } else {
        setBanner({
          type: "success",
          text: data.message || "All users are already settled.",
        });
      }

      await fetchAll();
    } catch (err) {
      setBanner({ type: "error", text: (err as Error).message });
    } finally {
      setCompleting(false);
    }
  };

  const openConfirmCollection = () => {
    setCollectionAmount("1000");
    setShowConfirmCollection(true);
  };

  /* ---------- Loading / error ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Loading funding...
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
          href={`/dashboard/meetings/${id}`}
          className="mt-4 inline-flex items-center gap-2 text-[#2c6e49] font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Meeting
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6 max-w-5xl">
      {/* Back */}
      <Link
        href={`/dashboard/meetings/${id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#2c6e49] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Meeting
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#2c6e49]/10 to-green-50/50 rounded-2xl p-4 md:p-6 border border-[#2c6e49]/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">
              Meeting #{meeting.meeting_number}
            </p>
            <h1 className="text-xl md:text-2xl font-bold text-[#2c6e49] flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              Funding
            </h1>
            <p className="text-gray-600 text-sm mt-1">{meeting.title}</p>
          </div>

          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {canCompleteCollection && (
                <Button
                  onClick={openConfirmCollection}
                  variant="outline"
                  className="border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49]/5"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Complete Collection
                </Button>
              )}
              <Button
                onClick={() => setShowDonationModal(true)}
                className="bg-[#2c6e49] hover:bg-[#1f5234] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Donation
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Inline banner (replaces alerts) */}
      {banner && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 border ${
            banner.type === "success"
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          {banner.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                banner.type === "success"
                  ? "text-emerald-800"
                  : "text-red-800"
              }`}
            >
              {banner.text}
            </p>
          </div>
          <button
            onClick={() => setBanner(null)}
            className={
              banner.type === "success"
                ? "text-emerald-600 hover:text-emerald-800"
                : "text-red-600 hover:text-red-800"
            }
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <p className="text-xs text-gray-500">Total Collected</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-emerald-600">
            {formatMoney(totalDonations)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <HandCoins className="w-4 h-4 text-rose-600" />
            <p className="text-xs text-gray-500">Total Dues</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-rose-600">
            {formatMoney(totalDues)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-gray-500" />
            <p className="text-xs text-gray-500">Records</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-800">
            {donations.length + dues.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by member, CNIC, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 border-gray-200 bg-white/50"
        />
      </div>

      {/* Donations list */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Donations
            </h3>
            <span className="text-xs text-gray-500">
              {filteredDonations.length} record
              {filteredDonations.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredDonations.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No donations recorded for this meeting.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredDonations.map((d) => (
                <div
                  key={d.id}
                  className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-[#2c6e49]/30 transition-colors"
                >
                  {/* Clickable left side → navigates to funding/[donationId] */}
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/dashboard/meetings/${id}/funding/${d.id}`
                      )
                    }
                    className="flex-1 text-left flex items-center gap-3 min-w-0"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2c6e49] to-[#1f5234] flex items-center justify-center text-white font-semibold text-xs shrink-0">
                      {(d.User?.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {d.User?.name || `User #${d.userId ?? "—"}`}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                            categoryColors[d.category] ??
                            categoryColors.GENERAL
                          }`}
                        >
                          {categoryLabels[d.category] ?? d.category}
                        </span>
                        {d.reciept && (
                          <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {d.reciept}
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400">
                          {formatDate(d.created_at)}
                        </span>
                      </div>
                      {d.description && (
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                          {d.description}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Right side: amount + download */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-sm font-semibold text-emerald-700">
                      {formatMoney(Number(d.amount))}
                    </span>

                    <button
                      onClick={() => handleDownload(d)}
                      className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                      title="Download receipt"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dues list */}
      {filteredDues.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-rose-600" />
                Outstanding Dues
              </h3>
              <span className="text-xs text-gray-500">
                {filteredDues.length} record
                {filteredDues.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-2">
              {filteredDues.map((d) => (
                <div
                  key={d.id}
                  className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-3 rounded-xl border border-rose-100 bg-rose-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                      {(d.User?.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {d.User?.name || `User #${d.user_id ?? "—"}`}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border bg-rose-50 text-rose-700 border-rose-200">
                          Due
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono truncate">
                          {d.User?.cnic}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-sm font-semibold text-rose-700">
                      {formatMoney(Number(d.amount))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Donation Modal */}
      {isAdmin && showDonationModal && (
        <DonationModal
          meetingId={meeting.meeting_number}
          members={members}
          onClose={() => setShowDonationModal(false)}
          onCreated={(result) => {
            setShowDonationModal(false);
            if (result?.compensation) {
              const c = result.compensation;
              setBanner({
                type: "success",
                text:
                  c.remainingDue > 0
                    ? `Donation recorded. ${formatMoney(
                        c.dueCompensated
                      )} applied to the outstanding due. Remaining due: ${formatMoney(
                        c.remainingDue
                      )}.`
                    : `Donation recorded. ${formatMoney(
                        c.dueCompensated
                      )} cleared the outstanding due.`,
              });
            } else {
              setBanner({ type: "success", text: "Donation recorded." });
            }
            fetchAll();
          }}
          onError={(msg) => setBanner({ type: "error", text: msg })}
        />
      )}

      {/* Complete Collection confirm modal */}
      {isAdmin && showConfirmCollection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setShowConfirmCollection(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#2c6e49]/10 border border-[#2c6e49]/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#2c6e49]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-800">
                  Charge All Users
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {unsettledMembers.length} user
                  {unsettledMembers.length !== 1 ? "s" : ""} still unpaid
                  (admins + members)
                </p>
              </div>
              <button
                onClick={() => setShowConfirmCollection(false)}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Amount per user
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                    Rs
                  </span>
                  <Input
                    type="number"
                    min={1}
                    step="1"
                    value={collectionAmount}
                    onChange={(e) => setCollectionAmount(e.target.value)}
                    className="pl-9 border-slate-200 text-sm"
                    placeholder="1000"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  This due will be created for each unpaid user.
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  Users who already donated or have a due for this meeting
                  will be skipped.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-[#2c6e49]/5 border border-[#2c6e49]/20 p-3">
                <span className="text-xs text-slate-600 font-medium">
                  Total to be charged
                </span>
                <span className="text-sm font-bold text-[#2c6e49]">
                  {formatMoney(Number(collectionAmount) || 0)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowConfirmCollection(false)}
                disabled={completing}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteCollection}
                disabled={
                  completing ||
                  !collectionAmount ||
                  Number(collectionAmount) <= 0
                }
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-[#2c6e49] hover:bg-[#1f5234] text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {completing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Donation Modal ---------------- */

type DonationResult = {
  compensation?: {
    dueCompensated: number;
    remainingDue: number;
  } | null;
};

function DonationModal({
  meetingId,
  members,
  onClose,
  onCreated,
  onError,
}: {
  meetingId: number;
  members: Member[];
  onClose: () => void;
  onCreated: (result?: DonationResult) => void;
  onError: (msg: string) => void;
}) {
  const [form, setForm] = useState({
    userId: "",
    amount: "",
    description: "",
    category: "MEETING_FUND" as Category,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.userId) return setError("Select a member");
    if (!form.amount || isNaN(Number(form.amount)))
      return setError("Enter a valid amount");

    setSubmitting(true);
    try {
      const res = await fetch("/api/meeting-finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "donation",
          userId: form.userId,
          amount: Number(form.amount),
          description: form.description.trim() || null,
          reciept: null,
          category: form.category,
          meetingId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Failed to add donation");
        onClose();
        return;
      }

      onCreated({ compensation: data._compensation ?? null });
    } catch (err) {
      onError((err as Error).message);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full p-5 md:p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-[#2c6e49]">
            Add Donation
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-400" />
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
              Member <span className="text-red-500">*</span>
            </label>
            <select
              name="userId"
              value={form.userId}
              onChange={handleChange}
              className="w-full h-10 border border-gray-200 rounded-lg bg-white px-3 text-sm focus:outline-none focus:border-[#2c6e49] focus:ring-1 focus:ring-[#2c6e49]/40"
              required
            >
              <option value="">Select member...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.cnic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount (PKR) <span className="text-red-500">*</span>
            </label>
            <Input
              name="amount"
              type="number"
              min={0}
              step="1"
              value={form.amount}
              onChange={handleChange}
              placeholder="e.g. 5000"
              className="border-gray-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, category: "MEETING_FUND" }))
                }
                className={`flex-1 px-3 py-2.5 rounded-lg border text-sm font-medium transition ${
                  form.category === "MEETING_FUND"
                    ? "bg-[#2c6e49] text-white border-[#2c6e49]"
                    : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                }`}
              >
                Meeting Fund
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, category: "MEETING_DUE" }))
                }
                className={`flex-1 px-3 py-2.5 rounded-lg border text-sm font-medium transition ${
                  form.category === "MEETING_DUE"
                    ? "bg-[#2c6e49] text-white border-[#2c6e49]"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                Meeting Due
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="Optional note..."
              className="w-full border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#2c6e49] focus:ring-1 focus:ring-[#2c6e49]/40 resize-none"
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
              className="flex-1 bg-[#2c6e49] hover:bg-[#1f5234] text-white disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Add Donation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}