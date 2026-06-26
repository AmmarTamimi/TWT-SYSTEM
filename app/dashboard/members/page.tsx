"use client";

import { useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
  Search,
  UserPlus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Download,
  Filter,
} from "lucide-react";

// Dummy data
const membersData = [
  {
    id: "MEM-001",
    name: "Ahmed Khan",
    phone: "0300-1234567",
    email: "ahmed.khan@email.com",
    address: "123 Main Street, Lahore",
    joinDate: "2024-01-15",
    status: "Active",
    cnic: "35201-1234567-8",
  },
  {
    id: "MEM-002",
    name: "Fatima Ali",
    phone: "0311-2345678",
    email: "fatima.ali@email.com",
    address: "456 Park Avenue, Karachi",
    joinDate: "2024-02-20",
    status: "Active",
    cnic: "42201-2345678-9",
  },
  {
    id: "MEM-003",
    name: "Muhammad Usman",
    phone: "0322-3456789",
    email: "usman.m@email.com",
    address: "789 Garden Road, Islamabad",
    joinDate: "2024-03-10",
    status: "Pending",
    cnic: "35201-3456789-0",
  },
  {
    id: "MEM-004",
    name: "Ayesha Bibi",
    phone: "0333-4567890",
    email: "ayesha.b@email.com",
    address: "321 Lake View, Rawalpindi",
    joinDate: "2024-04-05",
    status: "Active",
    cnic: "42201-4567890-1",
  },
  {
    id: "MEM-005",
    name: "Ali Raza",
    phone: "0344-5678901",
    email: "ali.raza@email.com",
    address: "654 Hill Street, Peshawar",
    joinDate: "2024-05-12",
    status: "Inactive",
    cnic: "35201-5678901-2",
  },
  {
    id: "MEM-006",
    name: "Sana Mahmood",
    phone: "0355-6789012",
    email: "sana.m@email.com",
    address: "987 Colony, Quetta",
    joinDate: "2024-06-18",
    status: "Active",
    cnic: "42201-6789012-3",
  },
  {
    id: "MEM-007",
    name: "Bilal Ahmed",
    phone: "0366-7890123",
    email: "bilal.a@email.com",
    address: "147 Mall Road, Multan",
    joinDate: "2024-07-22",
    status: "Active",
    cnic: "35201-7890123-4",
  },
  {
    id: "MEM-008",
    name: "Hina Tariq",
    phone: "0377-8901234",
    email: "hina.t@email.com",
    address: "258 Lake Road, Faisalabad",
    joinDate: "2024-08-30",
    status: "Pending",
    cnic: "42201-8901234-5",
  },
];

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const filteredMembers = membersData.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);
    const matchesStatus =
      selectedStatus === "All" || member.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Inactive":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
          <Button className="bg-[#2c6e49] hover:bg-[#1f5234] text-white shadow-md hover:shadow-lg transition-all duration-300">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200  transition-all duration-300 bg-white/50"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-gray-400 ml-1" />
          {["All", "Active", "Pending", "Inactive"].map((status) => (
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
          <p className="text-2xl font-bold text-[#2c6e49]">{membersData.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {membersData.filter((m) => m.status === "Active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {membersData.filter((m) => m.status === "Pending").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-red-600">
            {membersData.filter((m) => m.status === "Inactive").length}
          </p>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <Card
            key={member.id}
            className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover-lift overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="p-5">
                {/* Header with ID and Status */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs text-gray-400 font-medium">
                      {member.id}
                    </span>
                    <h3 className="text-base font-semibold text-gray-800 mt-0.5">
                      {member.name}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      member.status
                    )}`}
                  >
                    {member.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{member.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No members found</h3>
          <p className="text-gray-500 text-sm mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Showing {filteredMembers.length} of {membersData.length} members
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
            3
          </button>
          <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}