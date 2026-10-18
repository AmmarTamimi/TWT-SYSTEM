"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
  Plus,
  Wallet,
  Download,
  XCircle,
  Banknote,
  Search,
  User,
  Check,
  TrendingUp,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Donation {
  id: string;
  userId: string;
  amount: number;
  date: string;
  description: string | null;
  reciept: string;
  category: string;
  meetingId: string | null;
  created_at: string;
  User?: {
    name: string;
    cnic: string;
  } | null; // <--- ADD THIS
}

interface MemberOption {
  id: string;
  name: string;
}

const CATEGORIES = [
  { value: "ZAKAT", label: "Zakat" },
  { value: "FITRANA", label: "Fitrana" },
  { value: "SADQA", label: "Sadqa" },
  { value: "GENERAL", label: "General" },
];

const categoryLabels: Record<string, string> = {
  ZAKAT: "Zakat",
  FITRANA: "Fitrana",
  SADQA: "Sadqa",
  MEETING_FUND: "Meeting Fund",
  MEETING_DUE: "Meeting Due",
  GENERAL: "General",
};

export default function FundingPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [balances, setBalances] = useState({
    global: 0,
    zakat: 0,
    fitrana: 0,
    sadqa: 0,
  });

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState<MemberOption[]>([]);

  // State for the generated receipt (triggers print view)
  const [activeReceipt, setActiveReceipt] = useState<
    (Donation & { userName: string }) | null
  >(null);

  const router = useRouter()
  const fetchDonations = async () => {
    try {
      const res = await fetch("/api/donations");
      const data = await res.json();

      if (res.ok) {
        setDonations(data.donations);
        setBalances(data.balances);
      }
    } catch (err) {
      console.error("Failed to load donations", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      if (res.ok) setMembers(data);
    } catch (err) {
      console.error("Failed to load members", err);
    }
  };

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  useEffect(() => {
    fetchDonations();
    fetchMembers();
  }, []);

  // Handle printing the receipt
  useEffect(() => {
    if (activeReceipt) {
      setTimeout(() => {
        window.print();
      }, 100);
    }
  }, [activeReceipt]);

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

   const handleDownloadReceipt = (donation: Donation) => {
    if (!donation) return;

    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return;

    const esc = (s: unknown) =>
      String(s ?? "").replace(/[&<>"']/g, (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c] || c
      );

    const categoryLabel = esc(categoryLabels[donation.category ?? "GENERAL"] ?? donation.category);
    
    // USE JOINED USER DATA
    const donorName = esc(donation.User?.name || "Member");
    const donorCnic = esc(donation.User?.cnic || "—");

    const amountFormatted = esc(formatMoney(Number(donation.amount)));
    const description = donation.description ? esc(donation.description) : "";
    const receiptNo = esc(donation.reciept);

    const rawDate = donation.date || donation.created_at;
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
          <title>Donation Receipt - ${receiptNo}</title>
          <style>
            /* ... (Keep all your exact CSS here, it was perfect) ... */
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            html, body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #d4e8d8; color: #1a1a1a; }
            @page { size: A4; margin: 8mm; }
            body { display: flex; justify-content: center; align-items: flex-start; padding: 20px; min-height: 100vh; }
            .page { width: 100%; display: flex; justify-content: center; }
            .receipt { width: 100%; max-width: 700px; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 60px rgba(44,110,73,0.22), 0 6px 18px rgba(0,0,0,0.06); }
            .header { background: linear-gradient(135deg, #2c6e49 0%, #1f5234 60%, #18402a 100%); color: #ffffff; padding: 24px 32px 48px; position: relative; overflow: hidden; }
            .brand-row { display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
            .logo { width: 44px; height: 44px; background: linear-gradient(135deg, #ffffff 0%, #e8f5ee 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 17px; color: #2c6e49; }
            .brand-name { font-size: 17px; font-weight: 700; }
            .brand-tag { font-size: 9.5px; opacity: 0.85; letter-spacing: 1.8px; text-transform: uppercase; margin-top: 2px; color: #c9e6d3; }
            .doc-type { margin-top: 20px; position: relative; z-index: 1; }
            .doc-type h1 { font-size: 24px; font-weight: 800; color: #ffffff; }
            .doc-type p { font-size: 12px; opacity: 0.85; margin-top: 3px; color: #c9e6d3; }
            .body { padding: 0 32px 24px; background: #ffffff; }
            .amount-card { background: linear-gradient(135deg, #2c6e49 0%, #3a8a5f 100%); border-radius: 16px; padding: 22px 26px; margin-top: -32px; position: relative; z-index: 3; box-shadow: 0 14px 30px rgba(44,110,73,0.28); }
            .amount-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.8px; color: #b8e0c6; font-weight: 600; }
            .amount-value { font-size: 36px; font-weight: 800; color: #ffffff; margin-top: 4px; }
            .amount-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; font-size: 10px; font-weight: 700; background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.35); margin-top: 10px; text-transform: uppercase; }
            .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1.8px; color: #2c6e49; font-weight: 700; margin: 20px 0 8px; display: flex; align-items: center; gap: 10px; }
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

                <div class="section-title">Receipt Information</div>
                <div class="info-card">
                  <div class="info-row">
                    <div class="info-label">Receipt Number</div>
                    <div class="info-value mono">${receiptNo}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Date Issued</div>
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

  return (
    <>
      {/* Main Page Content (Hidden when printing) */}
      <div className="space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#2c6e49]">Donations</h2>
            <p className="text-gray-500 text-sm mt-1">
              View contribution history and make new donations.
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#2c6e49] hover:bg-[#1f5234] text-white shadow-md w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Donation
          </Button>
        </div>

        {/* Professional Balance Dashboard */}
        <div className="space-y-4">
          {/* Dominant Available Balance Card */}
          <div className="bg-gradient-to-br from-[#2c6e49] to-[#1f5234] rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col justify-center relative overflow-hidden text-white">
            <div className="relative z-10">
              <p className="text-sm sm:text-base text-green-100/80 font-medium mb-1 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Total Available Balance
              </p>
              <h3 className="text-4xl sm:text-4xl font-bold tracking-tight">
                PKR {balances.global.toLocaleString()}
              </h3>
            </div>
            {/* Decorative background icon */}
            <Wallet className="absolute -bottom-8 -right-8 w-48 h-48 text-white/5 opacity-50 pointer-events-none" />
          </div>

          {/* Fund-Specific Balances & Total Income Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Income */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-gray-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                  Total Income
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  PKR {totalAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Zakat Balance */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-sm text-gray-500 font-medium mb-1">
                Zakat Balance
              </p>
              <p className="text-xl sm:text-2xl font-bold text-[#2c6e49]">
                PKR {balances.zakat.toLocaleString()}
              </p>
            </div>

            {/* Fitrana Balance */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-sm text-gray-500 font-medium mb-1">
                Fitrana Balance
              </p>
              <p className="text-xl sm:text-2xl font-bold text-[#2c6e49]">
                PKR {balances.fitrana.toLocaleString()}
              </p>
            </div>

            {/* Sadqa Balance */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-sm text-gray-500 font-medium mb-1">
                Sadqa Balance
              </p>
              <p className="text-xl sm:text-2xl font-bold text-[#2c6e49]">
                PKR {balances.sadqa.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* History Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 font-medium">
                      Receipt No.
                    </th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Date</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Category</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">
                      Description
                    </th>
                    <th className="px-4 sm:px-6 py-4 font-medium text-right">
                      Amount
                    </th>
                    <th className="px-4 sm:px-6 py-4 font-medium text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        Loading donations...
                      </td>
                    </tr>
                  ) : donations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        No donations found. Click "Add Donation" to get started.
                      </td>
                    </tr>
                  ) : (
                    donations.map((d) => (
                      <tr
                        key={d.id}
                        className="hover:bg-gray-50/50 transition-colors"
                        onClick={()=>router.push(`/dashboard/donations/${d.id}`)}
                      >
                        <td className="px-4 sm:px-6 py-4 font-mono text-xs">
                          {d.reciept}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          {d.date
                            ? formatDate(d.date)
                            : formatDate(d.created_at)}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            {d.category.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-gray-500 truncate max-w-[150px] sm:max-w-[200px]">
                          {d.description || "—"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right font-semibold">
                          {d.amount.toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-center">
                          <button
                            onClick={() =>
                              handleDownloadReceipt(d)
                            }
                            className="p-2 text-[#2c6e49] hover:bg-green-50 rounded-lg transition-colors"
                            title="Download Receipt"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donation Form Modal */}
      {showForm && (
        <DonationForm
          members={members}
          onClose={() => setShowForm(false)}
          onSuccess={(newDonation) => {
            setShowForm(false);
            fetchDonations(); // refresh list and balance
            setActiveReceipt(newDonation); // trigger print
          }}
        />
      )}

      {/* Printable Receipt Area (Visible ONLY when printing) */}
    </>
  );
}

// ---------------------------------------------------------
// Donation Form Component
// ---------------------------------------------------------
function DonationForm({
  members,
  onClose,
  onSuccess,
}: {
  members: MemberOption[];
  onClose: () => void;
  onSuccess: (d: any) => void;
}) {
  const [form, setForm] = useState({
    amount: "",
    category: "GENERAL",
    date: new Date().toISOString().split("T")[0],
    description: "",
    userId: "",
    userName: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchMember, setSearchMember] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredMembers = useMemo(() => {
    if (!searchMember) return members;
    return members.filter((m) =>
      m.name.toLowerCase().includes(searchMember.toLowerCase()),
    );
  }, [members, searchMember]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.amount || parseFloat(form.amount) <= 0) {
      return setError("Please enter a valid amount");
    }

    if (!form.userId) {
      return setError("Please select a member for this donation");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      onSuccess({ ...data, userName: form.userName });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-[#2c6e49]">Add Donation</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Donor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search member by name..."
                className="pl-10"
                value={searchMember}
                onChange={(e) => {
                  setSearchMember(e.target.value);
                  setIsDropdownOpen(true);
                  setForm({ ...form, userId: "", userName: "" });
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />
            </div>

            {isDropdownOpen && searchMember && !form.userId && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, userId: m.id, userName: m.name });
                        setSearchMember(m.name);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 transition-colors flex items-center gap-2 border-b border-gray-50 last:border-0"
                    >
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {m.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No member found
                  </div>
                )}
              </div>
            )}

            {form.userId && (
              <div className="mt-2 flex items-center gap-2 text-sm text-[#2c6e49] font-medium bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                <Check className="w-4 h-4" />
                Selected: {form.userName}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (PKR) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="number"
                min="1"
                step="any"
                required
                className="pl-10"
                placeholder="e.g. 5000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:border-[#2c6e49] focus:ring-1 focus:ring-[#2c6e49] outline-none"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <Input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <Input
              placeholder="e.g. Monthly contribution"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#2c6e49] text-white"
            >
              {loading ? "Saving..." : "Save & Print Receipt"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
