"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
  Plus,
  Download,
  XCircle,
  Banknote,
  Receipt,
  TrendingDown,
  HeartHandshake,
  Flower2,
  MoreHorizontal
} from "lucide-react";

interface Expense {
  id: string;
  amount: number;
  description: string | null;
  date: string;
  category: string;
}

const CATEGORIES = [
  { value: "WEDDING", label: "Wedding" },
  { value: "FUNERAL", label: "Funeral" },
  { value: "OTHER", label: "Other" },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (res.ok) setExpenses(data);
    } catch (err) {
      console.error("Failed to load expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Calculate totals dynamically
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const weddingAmount = expenses.filter(e => e.category === "WEDDING").reduce((sum, e) => sum + e.amount, 0);
  const funeralAmount = expenses.filter(e => e.category === "FUNERAL").reduce((sum, e) => sum + e.amount, 0);
  const otherAmount = expenses.filter(e => e.category === "OTHER").reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#2c6e49]">Expenses</h2>
            <p className="text-gray-500 text-sm mt-1">
              Manage and track all welfare organization expenses.
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#2c6e49] hover:bg-[#1f5234] text-white shadow-md w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Expenses Box */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium truncate">
                Total Expenses
              </p>
              <p className="text-xl sm:text-2xl font-bold text-red-600 truncate">
                PKR {totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Wedding Box */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
            <p className="text-sm text-gray-500 font-medium mb-1">Wedding</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              PKR {weddingAmount.toLocaleString()}
            </p>
          </div>

          {/* Funeral Box */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
            <p className="text-sm text-gray-500 font-medium mb-1">Funeral</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              PKR {funeralAmount.toLocaleString()}
            </p>
          </div>

          {/* Other Box */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
            <p className="text-sm text-gray-500 font-medium mb-1">Other Expenses</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              PKR {otherAmount.toLocaleString()}
            </p>
          </div>

        </div>

        {/* History Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 font-medium">Date</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Category</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Description</th>
                    <th className="px-4 sm:px-6 py-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                        Loading expenses...
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                        No expenses found. Click "Add Expense" to get started.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 sm:px-6 py-4">
                          {new Date(e.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200">
                            {e.category}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-gray-500 truncate max-w-[150px] sm:max-w-[300px]">
                          {e.description || "—"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right font-semibold text-red-600">
                          - {e.amount.toLocaleString()}
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

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchExpenses(); // refresh list
          }}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------
// Expense Form Component
// ---------------------------------------------------------
function ExpenseForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    amount: "",
    category: "WEDDING",
    date: new Date().toISOString().split("T")[0],
    description: "",
    type: "GENERAL",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.amount || parseFloat(form.amount) <= 0) {
      return setError("Please enter a valid amount");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-[#2c6e49]">Add Expense</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="e.g. 15000"
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

          <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pay From Fund <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:border-[#2c6e49] outline-none"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="GENERAL">General</option>
            <option value="ZAKAT">Zakat</option>
            <option value="FITRANA">Fitrana</option>
            <option value="SADQA">Sadqa</option>
          </select>
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
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
            <textarea
              placeholder="e.g. Supplied rations to family..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              className="w-full border border-gray-200 rounded-lg bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#2c6e49] focus:ring-1 focus:ring-[#2c6e49] transition-all duration-300 resize-y"
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
              {loading ? "Saving..." : "Save Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}