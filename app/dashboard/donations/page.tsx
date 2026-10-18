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
} from "lucide-react";

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
              <p className="text-sm text-gray-500 font-medium mb-1">Zakat Balance</p>
              <p className="text-xl sm:text-2xl font-bold text-[#2c6e49]">
                PKR {balances.zakat.toLocaleString()}
              </p>
            </div>

            {/* Fitrana Balance */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-sm text-gray-500 font-medium mb-1">Fitrana Balance</p>
              <p className="text-xl sm:text-2xl font-bold text-[#2c6e49]">
                PKR {balances.fitrana.toLocaleString()}
              </p>
            </div>

            {/* Sadqa Balance */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-sm text-gray-500 font-medium mb-1">Sadqa Balance</p>
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
                    <th className="px-4 sm:px-6 py-4 font-medium">Receipt No.</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Date</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Category</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Description</th>
                    <th className="px-4 sm:px-6 py-4 font-medium text-right">Amount</th>
                    <th className="px-4 sm:px-6 py-4 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        Loading donations...
                      </td>
                    </tr>
                  ) : donations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No donations found. Click "Add Donation" to get started.
                      </td>
                    </tr>
                  ) : (
                    donations.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 font-mono text-xs">
                          {d.reciept}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          {d.date ? formatDate(d.date) : formatDate(d.created_at)}
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
                            onClick={() => setActiveReceipt({ ...d, userName: "Member" })}
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
      {activeReceipt && (
        <div className="hidden print:block fixed inset-0 bg-white z-50 p-12 text-black">
          <div className="max-w-2xl mx-auto border-2 border-gray-200 p-8 rounded-2xl">
            {/* Header */}
            <div className="text-center border-b border-gray-200 pb-6 mb-6">
              <h1 className="text-3xl font-bold text-[#2c6e49] uppercase tracking-wider">
                Tamimi Welfare
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Official Donation Receipt
              </p>
            </div>

            {/* Receipt Details */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-500 mb-1">Receipt No:</p>
                <p className="font-mono font-medium">{activeReceipt.reciept}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Date:</p>
                <p className="font-medium">
                  {new Date(activeReceipt.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Donor Name:</p>
                <p className="font-medium">{activeReceipt.userName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Category:</p>
                <p className="font-medium">
                  {activeReceipt.category.replace("_", " ")}
                </p>
              </div>
            </div>

            {/* Amount Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">
                      Description
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600 text-right">
                      Amount (PKR)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-4 text-gray-800">
                      {activeReceipt.description || "General Donation"}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-lg">
                      {activeReceipt.amount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-green-50">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-[#2c6e49]">
                      Total Paid
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#2c6e49]">
                      {activeReceipt.amount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-200">
              <p>Thank you for your generous contribution.</p>
              <p className="mt-1">
                This is a computer-generated receipt and does not require a
                signature.
              </p>
            </div>
          </div>

          {/* Close button only visible on screen, not print */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 print:hidden">
            <Button
              onClick={() => setActiveReceipt(null)}
              className="bg-black text-white"
            >
              Close Preview
            </Button>
          </div>
        </div>
      )}
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
      m.name.toLowerCase().includes(searchMember.toLowerCase())
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