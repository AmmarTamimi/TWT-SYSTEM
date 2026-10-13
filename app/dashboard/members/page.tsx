"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Phone,
  MapPin,
  Calendar,
  Download,
  Filter,
  CreditCard,
  UserCog,
  Users,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  name: string;
  father_name: string;
  cnic: string;
  number: string;
  address: string;
  role: string;
  verification_status: string;
  status: string;
  created_at: string;
}

type StatusFilter =
  | "All"
  | "Verified"
  | "Pending"
  | "Declined"
  | "Inactive";

/* ---------- CSV helper ---------- */

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // Escape quotes and wrap in quotes if it contains comma, quote, newline
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadMembersCsv(members: Member[]) {
  const headers = [
    "ID",
    "Name",
    "Father Name",
    "CNIC",
    "Phone",
    "Address",
    "Role",
    "Verification Status",
    "Account Status",
    "Joined",
  ];

  const rows = members.map((m) => [
    m.id,
    m.name,
    m.father_name || "",
    m.cnic,
    m.number || "",
    m.address || "",
    m.role,
    m.verification_status,
    m.status,
    new Date(m.created_at).toLocaleDateString("en-GB"),
  ]);

  const csv = [
    headers.map(escapeCsv).join(","),
    ...rows.map((r) => r.map(escapeCsv).join(",")),
  ].join("\r\n");

  // Add BOM so Excel reads UTF-8 correctly (fixes Urdu/special chars)
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `tamimi-members-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");

  /* ---------- Fetch ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/members");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load members");
        if (!cancelled) setMembers(data);
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

  /* ---------- Display status ---------- */
  const displayStatus = (m: Member) => {
    if (m.status !== "active") return "Inactive";
    if (m.verification_status === "verified") return "Verified";
    if (m.verification_status === "declined") return "Declined";
    return "Pending";
  };

  /* ---------- Filter ---------- */
  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return members.filter((m) => {
      const matchesSearch =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.cnic.toLowerCase().includes(term) ||
        m.number?.includes(term);

      const matchesStatus =
        selectedStatus === "All" || displayStatus(m) === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [members, searchTerm, selectedStatus]);

  /* ---------- Stats ---------- */
  const stats = useMemo(
    () => ({
      total: members.length,
      verified: members.filter((m) => displayStatus(m) === "Verified").length,
      pending: members.filter((m) => displayStatus(m) === "Pending").length,
      inactive: members.filter((m) => displayStatus(m) === "Inactive").length,
    }),
    [members]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Declined":
        return "bg-red-100 text-red-700";
      case "Inactive":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  /* ---------- Export handler ---------- */
  const handleExport = () => {
    if (filteredMembers.length === 0) {
      alert("No members to export.");
      return;
    }
    downloadMembersCsv(filteredMembers);
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#2c6e49]">
            Members
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage and view all welfare members
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href={"/dashboard/add-member"} className="flex-1 sm:flex-initial">
            <Button className="w-full sm:w-auto bg-[#2c6e49] hover:bg-[#1f5234] text-white shadow-md hover:shadow-lg transition-all duration-300 text-sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </Link>
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex-1 sm:flex-initial border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49]/5 text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, CNIC, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 transition-all duration-300 bg-white/50"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {(
            [
              "All",
              "Verified",
              "Pending",
              "Declined",
              "Inactive",
            ] as StatusFilter[]
          ).map((status) => (
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
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl md:text-2xl font-bold text-[#2c6e49]">
            {stats.total}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Verified</p>
          <p className="text-xl md:text-2xl font-bold text-green-600">
            {stats.verified}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl md:text-2xl font-bold text-yellow-600">
            {stats.pending}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Inactive</p>
          <p className="text-xl md:text-2xl font-bold text-red-600">
            {stats.inactive}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse"
            >
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members Grid */}
      {!loading && !error && filteredMembers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const status = displayStatus(member);
            return (
              <Card
                key={member.id}
                className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => router.push(`/dashboard/members/${member.id}`)}
              >
                <CardContent className="p-0">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2c6e49] to-[#1f5234] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {initials(member.name)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-gray-800 truncate">
                            {member.name}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            s/o {member.father_name}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-mono text-xs">{member.cnic}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{member.number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{member.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>
                          Joined:{" "}
                          {new Date(member.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {member.role === "admin" ? (
                          <>
                            <UserCog className="w-4 h-4 text-[#2c6e49] flex-shrink-0" />
                            <span className="text-xs font-medium text-[#2c6e49]">
                              Administrator
                            </span>
                          </>
                        ) : (
                          <>
                            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500">
                              Member
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        title="View details"
                        onClick={() =>
                          router.push(`/dashboard/members/${member.id}`)
                        }
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title="Edit"
                        onClick={() =>
                          router.push(`/dashboard/members/${member.id}?edit=1`)
                        }
                        className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete"
                        onClick={() =>
                          router.push(
                            `/dashboard/members/${member.id}?delete=1`
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">
            {members.length === 0 ? "No members yet" : "No members found"}
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            {members.length === 0
              ? "Add your first member to get started."
              : "Try adjusting your search or filter criteria."}
          </p>
        </div>
      )}

      {/* Footer / count */}
      {!loading && !error && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing {filteredMembers.length} of {members.length} members
          </p>
        </div>
      )}
    </div>
  );
}