"use client";

import { useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
  Search,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  User,
  Phone,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Printer,
  Send,
  PieChart,
} from "lucide-react";

// Dummy loan data
const loansData = [
  {
    id: "LOAN-001",
    memberId: "MEM-001",
    memberName: "Ahmed Khan",
    phone: "0300-1234567",
    amount: 50000,
    remainingAmount: 15000,
    paidAmount: 35000,
    installmentAmount: 5000,
    totalInstallments: 10,
    paidInstallments: 7,
    remainingInstallments: 3,
    dateTaken: "2024-06-15",
    dueDate: "2025-03-15",
    status: "Active",
    purpose: "Medical Emergency",
    interestRate: "5%",
    lastPayment: "2024-12-01",
    nextPayment: "2025-01-01",
  },
  {
    id: "LOAN-002",
    memberId: "MEM-003",
    memberName: "Muhammad Usman",
    phone: "0322-3456789",
    amount: 30000,
    remainingAmount: 0,
    paidAmount: 30000,
    installmentAmount: 3000,
    totalInstallments: 10,
    paidInstallments: 10,
    remainingInstallments: 0,
    dateTaken: "2024-03-10",
    dueDate: "2024-12-10",
    status: "Completed",
    purpose: "Business Support",
    interestRate: "3%",
    lastPayment: "2024-12-10",
    nextPayment: "-",
  },
  {
    id: "LOAN-003",
    memberId: "MEM-005",
    memberName: "Ali Raza",
    phone: "0344-5678901",
    amount: 75000,
    remainingAmount: 45000,
    paidAmount: 30000,
    installmentAmount: 7500,
    totalInstallments: 10,
    paidInstallments: 4,
    remainingInstallments: 6,
    dateTaken: "2024-08-20",
    dueDate: "2025-05-20",
    status: "Active",
    purpose: "Education",
    interestRate: "6%",
    lastPayment: "2024-11-20",
    nextPayment: "2025-01-20",
  },
  {
    id: "LOAN-004",
    memberId: "MEM-002",
    memberName: "Fatima Ali",
    phone: "0311-2345678",
    amount: 20000,
    remainingAmount: 5000,
    paidAmount: 15000,
    installmentAmount: 2000,
    totalInstallments: 10,
    paidInstallments: 7,
    remainingInstallments: 3,
    dateTaken: "2024-07-01",
    dueDate: "2025-04-01",
    status: "Active",
    purpose: "Home Renovation",
    interestRate: "4%",
    lastPayment: "2024-12-01",
    nextPayment: "2025-01-01",
  },
  {
    id: "LOAN-005",
    memberId: "MEM-007",
    memberName: "Bilal Ahmed",
    phone: "0366-7890123",
    amount: 100000,
    remainingAmount: 20000,
    paidAmount: 80000,
    installmentAmount: 10000,
    totalInstallments: 10,
    paidInstallments: 8,
    remainingInstallments: 2,
    dateTaken: "2024-05-05",
    dueDate: "2025-02-05",
    status: "Active",
    purpose: "Business Expansion",
    interestRate: "7%",
    lastPayment: "2024-12-05",
    nextPayment: "2025-01-05",
  },
  {
    id: "LOAN-006",
    memberId: "MEM-004",
    memberName: "Ayesha Bibi",
    phone: "0333-4567890",
    amount: 15000,
    remainingAmount: 0,
    paidAmount: 15000,
    installmentAmount: 1500,
    totalInstallments: 10,
    paidInstallments: 10,
    remainingInstallments: 0,
    dateTaken: "2024-01-15",
    dueDate: "2024-10-15",
    status: "Completed",
    purpose: "Medical Treatment",
    interestRate: "2%",
    lastPayment: "2024-10-15",
    nextPayment: "-",
  },
  {
    id: "LOAN-007",
    memberId: "MEM-006",
    memberName: "Sana Mahmood",
    phone: "0355-6789012",
    amount: 40000,
    remainingAmount: 40000,
    paidAmount: 0,
    installmentAmount: 4000,
    totalInstallments: 10,
    paidInstallments: 0,
    remainingInstallments: 10,
    dateTaken: "2024-12-01",
    dueDate: "2025-09-01",
    status: "Active",
    purpose: "Wedding Expenses",
    interestRate: "5%",
    lastPayment: "-",
    nextPayment: "2025-01-01",
  },
];

export default function LoanDetailsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedMember, setSelectedMember] = useState("All");

  // Get unique members for filter
  const uniqueMembers = Array.from(
    new Set(loansData.map((loan) => loan.memberName))
  );

  const filteredLoans = loansData.filter((loan) => {
    const matchesSearch =
      loan.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.phone.includes(searchTerm);
    const matchesStatus =
      selectedStatus === "All" || loan.status === selectedStatus;
    const matchesMember =
      selectedMember === "All" || loan.memberName === selectedMember;
    return matchesSearch && matchesStatus && matchesMember;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "Overdue":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <Clock className="w-3.5 h-3.5" />;
      case "Completed":
        return <CheckCircle className="w-3.5 h-3.5" />;
      case "Overdue":
        return <AlertCircle className="w-3.5 h-3.5" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  // Calculate summary statistics
  const totalLoans = loansData.length;
  const totalAmount = loansData.reduce((sum, loan) => sum + loan.amount, 0);
  const totalRemaining = loansData.reduce(
    (sum, loan) => sum + loan.remainingAmount,
    0
  );
  const totalPaid = loansData.reduce((sum, loan) => sum + loan.paidAmount, 0);
  const activeLoans = loansData.filter((l) => l.status === "Active").length;
  const completedLoans = loansData.filter((l) => l.status === "Completed").length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2c6e49]">Loan Details</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage and track all member loans
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-[#2c6e49] hover:bg-[#1f5234] text-white shadow-md hover:shadow-lg transition-all duration-300">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button
            variant="outline"
            className="border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49]/5"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Total Loans</p>
          <p className="text-xl font-bold text-[#2c6e49]">{totalLoans}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-xl font-bold text-[#2c6e49]">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Remaining</p>
          <p className="text-xl font-bold text-orange-600">
            {formatCurrency(totalRemaining)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-xl font-bold text-blue-600">{activeLoans}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-xl font-bold text-green-600">{completedLoans}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by member name, loan ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 ml-1" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-[#2c6e49] focus:ring-[#2c6e49] bg-white/50 transition-all duration-200"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-[#2c6e49] focus:ring-[#2c6e49] bg-white/50 transition-all duration-200"
          >
            <option value="All">All Members</option>
            {uniqueMembers.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loans List */}
      <div className="space-y-4">
        {filteredLoans.map((loan) => {
          const progressPercentage =
            loan.amount > 0 ? (loan.paidAmount / loan.amount) * 100 : 0;

          return (
            <Card
              key={loan.id}
              className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover-lift overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Left Section - Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 rounded-xl bg-[#2c6e49]/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-[#2c6e49]" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-800">
                              {loan.memberName}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                                loan.status
                              )}`}
                            >
                              {getStatusIcon(loan.status)}
                              {loan.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                            <span className="text-gray-400 font-medium">
                              {loan.id}
                            </span>
                            <span className="text-gray-500 flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" />
                              {loan.memberId}
                            </span>
                            <span className="text-gray-500 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {loan.phone}
                            </span>
                          </div>

                          {/* Loan Details Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                            <div className="bg-gray-50 rounded-lg p-2">
                              <p className="text-xs text-gray-400">Amount</p>
                              <p className="text-sm font-semibold text-gray-800">
                                {formatCurrency(loan.amount)}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <p className="text-xs text-gray-400">Remaining</p>
                              <p className="text-sm font-semibold text-orange-600">
                                {formatCurrency(loan.remainingAmount)}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <p className="text-xs text-gray-400">Paid</p>
                              <p className="text-sm font-semibold text-green-600">
                                {formatCurrency(loan.paidAmount)}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <p className="text-xs text-gray-400">Installment</p>
                              <p className="text-sm font-semibold text-gray-800">
                                {formatCurrency(loan.installmentAmount)}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Repayment Progress</span>
                              <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#2c6e49] h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                              <span>
                                {loan.paidInstallments} of {loan.totalInstallments}{" "}
                                installments paid
                              </span>
                              <span>{loan.remainingInstallments} remaining</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Details & Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0 min-w-[180px]">
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-gray-400">Date Taken</p>
                          <p className="font-medium text-gray-700">
                            {new Date(loan.dateTaken).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-gray-400">Due Date</p>
                          <p className="font-medium text-gray-700">
                            {new Date(loan.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-gray-400">Interest</p>
                          <p className="font-medium text-gray-700">
                            {loan.interestRate}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-gray-400">Purpose</p>
                          <p className="font-medium text-gray-700 truncate">
                            {loan.purpose}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <button className="flex-1 p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors text-xs flex items-center justify-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button className="flex-1 p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors text-xs flex items-center justify-center gap-1">
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button className="flex-1 p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors text-xs flex items-center justify-center gap-1">
                          <Send className="w-3.5 h-3.5" />
                          Remind
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredLoans.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No loans found</h3>
          <p className="text-gray-500 text-sm mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Showing {filteredLoans.length} of {loansData.length} loans
        </p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm bg-[#2c6e49] text-white rounded-lg">
            1
          </span>
          <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            2
          </button>
          <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}