"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "../../../../../components/ui/Card";
import { Input } from "../../../../../components/ui/Input";
import { Button } from "../../../../../components/ui/Button";
import {
  ArrowLeft,
  Wallet,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  Download,
  User as UserIcon,
  CreditCard,
  Calendar,
  FileText,
  HandCoins,
} from "lucide-react";
import { useUser } from "../../../../UserContext";

/* ---------------- Types ---------------- */

type Category =
  | "ZAKAT"
  | "FITRANA"
  | "SADQA"
  | "MEETING_FUND"
  | "MEETING_DUE"
  | "GENERAL";

type Entity = {
  id: number;
  // donation-specific
  userId?: number | null;
  description?: string | null;
  reciept?: string | null;
  category?: Category;
  // due-specific
  user_id?: number | null;
  // shared
  amount: number;
  meeting_id: number | null;
  created_at: string;
  User?: { id: string; name: string; cnic: string } | null;
  Meeting?: {
    id: string;
    title: string;
    meeting_number: number;
    date: string;
  } | null;
};

/* ---------------- Helpers ---------------- */

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
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
  MEETING_DUE: "bg-purple-50 text-purple-700 border-purple-200",
  GENERAL: "bg-gray-50 text-gray-700 border-gray-200",
};

/* ---------------- Page ---------------- */

export default function FinanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();

  const meetingId = params.id as string;
  const entryId = params.donationId as string;

  const isDue = searchParams.get("type") === "due";
  const isAdmin = user.role === "admin";

  const [entry, setEntry] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Entity>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  /* ---------- Fetch ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = isDue
          ? `/api/meeting-finance/due/${entryId}`
          : `/api/meeting-finance/${entryId}`;

        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data.error || `Failed to load ${isDue ? "due" : "donation"}`
          );
        if (!cancelled) {
          setEntry(data);
          setDraft(data);
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
  }, [entryId, isDue]);

  /* ---------- Save ---------- */
  const handleSave = async () => {
    if (!entry) return;
    setSaving(true);
    try {
      const url = isDue
        ? `/api/meeting-finance/due/${entryId}`
        : `/api/meeting-finance/${entryId}`;

      const payload = isDue
        ? { amount: Number(draft.amount) }
        : {
            amount: Number(draft.amount),
            description: draft.description || null,
            category: draft.category,
          };

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      // Refetch for fresh joins
      const fresh = await fetch(url);
      const freshData = await fresh.json();
      setEntry(freshData);
      setDraft(freshData);
      setEditing(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const url = isDue
        ? `/api/meeting-finance/due/${entryId}`
        : `/api/meeting-finance/${entryId}`;

      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      router.push(`/dashboard/meetings/${meetingId}/funding`);
    } catch (err) {
      alert((err as Error).message);
      setDeleting(false);
    }
  };

  /* ---------- Download receipt (only for donations) ---------- */
  const handleDownloadReceipt = () => {
    if (!entry || isDue) return;

    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return;

    const esc = (s: unknown) =>
      String(s ?? "").replace(/[&<>"']/g, (c) =>
        (
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }) as Record<string, string>
        )[c]
      );

    const categoryLabel = esc(
      categoryLabels[entry.category ?? "GENERAL"] ?? entry.category
    );
    const donorName = esc(entry.User?.name ?? "—");
    const donorCnic = esc(entry.User?.cnic ?? "—");
    const meetingTitle = esc(entry.Meeting?.title ?? "—");
    const meetingNumber = esc(entry.meeting_id ?? "—");
    const amountFormatted = esc(formatMoney(Number(entry.amount)));
    const description = entry.description ? esc(entry.description) : "";

    const rawDate = (entry as any).createdAt ?? (entry as any).created_at;
    const createdDate = rawDate
      ? esc(
          new Date(rawDate).toLocaleString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        )
      : "—";

    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Donation Receipt</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            html, body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #d4e8d8;
              color: #1a1a1a;
            }
            @page { size: A4; margin: 8mm; }
            body {
              display: flex;
              justify-content: center;
              align-items: flex-start;
              padding: 20px;
              min-height: 100vh;
            }
            .page {
              width: 100%;
              display: flex;
              justify-content: center;
            }
            .receipt {
              width: 100%;
              max-width: 700px;
              background: #ffffff;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 24px 60px rgba(44,110,73,0.22), 0 6px 18px rgba(0,0,0,0.06);
            }
            .header {
              background: linear-gradient(135deg, #2c6e49 0%, #1f5234 60%, #18402a 100%);
              color: #ffffff;
              padding: 24px 32px 48px;
              position: relative;
              overflow: hidden;
            }
            .brand-row { display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
            .logo {
              width: 44px; height: 44px;
              background: linear-gradient(135deg, #ffffff 0%, #e8f5ee 100%);
              border-radius: 12px; display: flex; align-items: center; justify-content: center;
              font-weight: 800; font-size: 17px; color: #2c6e49;
            }
            .brand-name { font-size: 17px; font-weight: 700; }
            .brand-tag { font-size: 9.5px; opacity: 0.85; letter-spacing: 1.8px; text-transform: uppercase; margin-top: 2px; color: #c9e6d3; }
            .doc-type { margin-top: 20px; position: relative; z-index: 1; }
            .doc-type h1 { font-size: 24px; font-weight: 800; color: #ffffff; }
            .doc-type p { font-size: 12px; opacity: 0.85; margin-top: 3px; color: #c9e6d3; }
            .body { padding: 0 32px 24px; background: #ffffff; }
            .amount-card {
              background: linear-gradient(135deg, #2c6e49 0%, #3a8a5f 100%);
              border-radius: 16px; padding: 22px 26px; margin-top: -32px; position: relative; z-index: 3;
              box-shadow: 0 14px 30px rgba(44,110,73,0.28);
            }
            .amount-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.8px; color: #b8e0c6; font-weight: 600; }
            .amount-value { font-size: 36px; font-weight: 800; color: #ffffff; margin-top: 4px; }
            .amount-badge {
              display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px;
              font-size: 10px; font-weight: 700; background: rgba(255,255,255,0.2); color: #fff;
              border: 1px solid rgba(255,255,255,0.35); margin-top: 10px; text-transform: uppercase;
            }
            .section-title {
              font-size: 10px; text-transform: uppercase; letter-spacing: 1.8px; color: #2c6e49; font-weight: 700;
              margin: 20px 0 8px; display: flex; align-items: center; gap: 10px;
            }
            .section-title::after { content: ''; flex: 1; height: 2px; background: linear-gradient(90deg, #d1e7dd, transparent); border-radius: 2px; }
            .info-card { background: linear-gradient(135deg, #f0f9f4 0%, #e8f5ee 100%); border: 1px solid #d1e7dd; border-radius: 12px; padding: 2px 18px; }
            .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed #c9e6d3; gap: 20px; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-size: 12px; color: #5a7d67; font-weight: 500; }
            .info-value { font-size: 12.5px; color: #1a3d2a; font-weight: 700; text-align: right; }
            .info-value.mono { font-family: 'Courier New', monospace; color: #2c6e49; }
            .thank-box { margin-top: 20px; padding: 18px 24px; background: linear-gradient(135deg, #f0f9f4 0%, #e0f2e6 100%); border-radius: 12px; border: 2px solid #c9e6d3; text-align: center; }
            .thank-box h3 { font-size: 15px; color: #2c6e49; font-weight: 800; margin-bottom: 5px; }
            .thank-box p { font-size: 11.5px; color: #3f5f4d; line-height: 1.55; max-width: 440px; margin: 0 auto; font-weight: 500; }
            .footer { background: linear-gradient(135deg, #1f5234 0%, #18402a 100%); padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; }
            .footer-left { font-weight: 600; color: #c9e6d3; }
            .footer-right { text-align: right; font-style: italic; color: #a8e0b8; font-weight: 500; }
            @media print {
              html, body { background: #ffffff !important; padding: 0; margin: 0; display: block; }
              .page { height: 275mm; display: flex; align-items: center; justify-content: center; }
              .receipt { max-width: 170mm; box-shadow: none; border: 1px solid #c9e6d3; border-radius: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="receipt">
              <div class="header">
                <div class="brand-row">
                  <div class="logo">TW</div>
                  <div>
                    <div class="brand-name">Tamimi Welfare Trust</div>
                    <div class="brand-tag">Official Donation Receipt</div>
                  </div>
                </div>
                <div class="doc-type">
                  <h1>Donation Receipt</h1>
                  <p>Thank you for your generous contribution.</p>
                </div>
              </div>
              <div class="body">
                <div class="amount-card">
                  <div class="amount-label">Amount Received</div>
                  <div class="amount-value">${amountFormatted}</div>
                  <div class="amount-badge">${categoryLabel}</div>
                </div>

                <div class="section-title">Donation Details</div>
                <div class="info-card">
                  <div class="info-row">
                    <div class="info-label">Date Created</div>
                    <div class="info-value">${createdDate}</div>
                  </div>
                </div>

                <div class="section-title">Donor Information</div>
                <div class="info-card">
                  <div class="info-row">
                    <div class="info-label">Full Name</div>
                    <div class="info-value">${donorName}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">CNIC Number</div>
                    <div class="info-value mono">${donorCnic}</div>
                  </div>
                </div>

                <div class="section-title">Meeting Details</div>
                <div class="info-card">
                  <div class="info-row">
                    <div class="info-label">Meeting</div>
                    <div class="info-value">${meetingTitle}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Meeting Number</div>
                    <div class="info-value mono">#${meetingNumber}</div>
                  </div>
                </div>

                ${
                  description
                    ? `
                    <div class="section-title">Note</div>
                    <div class="info-card">
                      <div class="info-row">
                        <div class="info-label">Description</div>
                        <div class="info-value">${description}</div>
                      </div>
                    </div>
                  `
                    : ""
                }

                <div class="thank-box">
                  <h3>JazakAllah Khair</h3>
                  <p>Your contribution supports our mission to serve communities with compassion and dignity.</p>
                </div>
              </div>
              <div class="footer">
                <div class="footer-left">Tamimi Welfare Trust · Est. 2014</div>
                <div class="footer-right">Compassion. Community. Change.</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function () {
              setTimeout(function () { window.print(); }, 400);
            };
          </script>
        </body>
      </html>
    `);
    w.document.close();
  };

  /* ---------- Loading / error ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Loading {isDue ? "due" : "donation"}...
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-lg font-semibold text-gray-800">
          {error || `${isDue ? "Due" : "Donation"} not found`}
        </h2>
        <Link
          href={`/dashboard/meetings/${meetingId}/funding`}
          className="mt-4 inline-flex items-center gap-2 text-[#2c6e49] font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Funding
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6 max-w-3xl">
      {/* Back */}
      <Link
        href={`/dashboard/meetings/${meetingId}/funding`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#2c6e49] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Funding
      </Link>

      {/* Header */}
      <div
        className={`rounded-2xl p-4 md:p-6 border ${
          isDue
            ? "bg-gradient-to-r from-rose-50 to-rose-100/40 border-rose-200"
            : "bg-gradient-to-r from-[#2c6e49]/10 to-green-50/50 border-[#2c6e49]/10"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
              {isDue ? (
                <>
                  <HandCoins className="w-3 h-3" />
                  Due #{entry.id}
                </>
              ) : (
                <>
                  <Wallet className="w-3 h-3" />
                  {entry.reciept
                    ? `Receipt ${entry.reciept}`
                    : `Receipt #${entry.id}`}
                </>
              )}
            </p>
            <h1
              className={`text-xl md:text-2xl font-bold ${
                isDue ? "text-rose-700" : "text-[#2c6e49]"
              }`}
            >
              {formatMoney(Number(draft.amount || 0))}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {isDue ? (
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border bg-rose-100 text-rose-700 border-rose-300">
                  Outstanding Due
                </span>
              ) : (
                <span
                  className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${
                    categoryColors[entry.category ?? "GENERAL"] ??
                    categoryColors.GENERAL
                  }`}
                >
                  {categoryLabels[entry.category ?? "GENERAL"] ??
                    entry.category}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {formatDateTime(entry.created_at)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            {/* Download only for donations */}
            {!isDue && (
              <Button
                onClick={handleDownloadReceipt}
                className="flex-1 sm:flex-initial bg-[#2c6e49] hover:bg-[#1f5234] text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
            )}

            {isAdmin && !editing && (
              <>
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  className="flex-1 sm:flex-initial border-gray-300 text-gray-700"
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
            )}
          </div>
        </div>
      </div>

      {/* Detail card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-5">
          {editing ? (
            <>
              <Field label="Amount (PKR)" icon={<Wallet className="w-4 h-4" />}>
                <Input
                  type="number"
                  min={0}
                  value={draft.amount ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      amount: Number(e.target.value) as any,
                    }))
                  }
                />
              </Field>

              {/* Category only for donations */}
              {!isDue && (
                <Field
                  label="Category"
                  icon={<FileText className="w-4 h-4" />}
                >
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({ ...d, category: "MEETING_FUND" }))
                      }
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition ${
                        draft.category === "MEETING_FUND"
                          ? "bg-[#2c6e49] text-white border-[#2c6e49]"
                          : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      }`}
                    >
                      Meeting Fund
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({ ...d, category: "MEETING_DUE" }))
                      }
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition ${
                        draft.category === "MEETING_DUE"
                          ? "bg-[#2c6e49] text-white border-[#2c6e49]"
                          : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                      }`}
                    >
                      Meeting Due
                    </button>
                  </div>
                </Field>
              )}

              {/* Description only for donations */}
              {!isDue && (
                <Field
                  label="Description"
                  icon={<FileText className="w-4 h-4" />}
                >
                  <textarea
                    value={draft.description ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, description: e.target.value }))
                    }
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#2c6e49] focus:ring-1 focus:ring-[#2c6e49]/40 resize-none"
                  />
                </Field>
              )}

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDraft(entry);
                    setEditing(false);
                  }}
                  disabled={saving}
                  className="flex-1 border-gray-200 text-gray-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-[#2c6e49] hover:bg-[#1f5234] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Field label="Amount" icon={<Wallet className="w-4 h-4" />}>
                <span
                  className={`font-semibold ${
                    isDue ? "text-rose-700" : "text-emerald-700"
                  }`}
                >
                  {formatMoney(Number(entry.amount))}
                </span>
              </Field>

              {!isDue && (
                <Field
                  label="Category"
                  icon={<FileText className="w-4 h-4" />}
                >
                  <span
                    className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${
                      categoryColors[entry.category ?? "GENERAL"] ??
                      categoryColors.GENERAL
                    }`}
                  >
                    {categoryLabels[entry.category ?? "GENERAL"] ??
                      entry.category}
                  </span>
                </Field>
              )}

              <Field label="Member" icon={<UserIcon className="w-4 h-4" />}>
                <span className="font-medium">{entry.User?.name ?? "—"}</span>
              </Field>

              <Field label="CNIC" icon={<CreditCard className="w-4 h-4" />}>
                <span className="font-mono text-sm">
                  {entry.User?.cnic ?? "—"}
                </span>
              </Field>

              <Field label="Meeting" icon={<Calendar className="w-4 h-4" />}>
                <span className="font-medium">
                  {entry.Meeting?.title ?? "—"}{" "}
                  <span className="text-gray-400">(#{entry.meeting_id})</span>
                </span>
              </Field>

              <Field label="Created" icon={<Calendar className="w-4 h-4" />}>
                <span className="font-medium">
                  {formatDateTime(entry.created_at)}
                </span>
              </Field>

              {!isDue && (
                <Field
                  label="Description"
                  icon={<FileText className="w-4 h-4" />}
                >
                  <span className="text-gray-700">
                    {entry.description || "—"}
                  </span>
                </Field>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
              Delete {isDue ? "Due" : "Donation"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this {isDue ? "due" : "donation"}{" "}
              of{" "}
              <span className="font-semibold">
                {formatMoney(Number(entry.amount))}
              </span>{" "}
              for {entry.User?.name ?? "unknown member"}? This cannot be
              undone.
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

/* ---------------- Field helper ---------------- */

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start sm:items-center">
      <span className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
        <span className="text-gray-400">{icon}</span>
        {label}
      </span>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}