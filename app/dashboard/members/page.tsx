"use client";

import { useEffect, useMemo, useState } from "react";
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
  number: string;            // ⚠️ see note below about column name
  address: string;
  role: string;
  verification_status: string;
  status: string;
  created_at: string;
}

type StatusFilter =
  | "All"
  | "Approved"
  | "Pending"
  | "Rejected"
  | "Inactive";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");

  // ---- Fetch ----
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

  // ---- Derive a display status from verification_status + status ----
  const displayStatus = (m: Member) => {
    if (m.status !== "active") return "Inactive";
    if (m.verification_status === "verified") return "Approved";
    if (m.verification_status === "denied") return "Rejected";
    return "Pending";
  };

  // ---- Filter ----
  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return members.filter((m) => {
      const matchesSearch =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.cnic.toLowerCase().includes(term) ||
        m.number?.includes(term) 

      const matchesStatus =
        selectedStatus === "All" || displayStatus(m) === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [members, searchTerm, selectedStatus]);

  // ---- Stats ----
  const stats = useMemo(
    () => ({
      total: members.length,
      approved: members.filter((m) => displayStatus(m) === "Approved").length,
      pending: members.filter((m) => displayStatus(m) === "Pending").length,
      inactive: members.filter((m) => displayStatus(m) === "Inactive").length,
    }),
    [members]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Rejected":
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2c6e49]">Members</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage and view all welfare members
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={"/dashboard/add-member"}>
            <Button className="bg-[#2c6e49] hover:bg-[#1f5234] text-white shadow-md hover:shadow-lg transition-all duration-300">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49]/5"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, CNIC, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 transition-all duration-300 bg-white/50"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-gray-400 ml-1" />
          {(
            ["All", "Approved", "Pending", "Rejected", "Inactive"] as StatusFilter[]
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
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Total Members</p>
          <p className="text-2xl font-bold text-[#2c6e49]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const status = displayStatus(member);
            return (
              <Card
                key={member.id}
                className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover-lift overflow-hidden"
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
                            <span className="text-xs text-gray-500">Member</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                      <button
                        title="View details"
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title="Edit"
                        className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete"
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