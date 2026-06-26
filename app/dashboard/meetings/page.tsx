"use client";

import { useState } from "react";
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
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarCheck,
  UserPlus,
  DollarSign,
} from "lucide-react";

// Dummy meetings data
const meetingsData = [
  {
    id: "MTG-001",
    title: "Monthly Welfare Meeting",
    location: "Community Hall, Main Branch",
    date: "2024-12-15",
    time: "10:00 AM - 12:00 PM",
    attendees: 24,
    status: "Upcoming",
    agenda: "Review of monthly activities, new member registrations, fund allocation",
    fundCollection: "$2,500",
    organizedBy: "Admin",
  },
  {
    id: "MTG-002",
    title: "Fund Allocation Committee",
    location: "Conference Room A, Head Office",
    date: "2024-12-10",
    time: "2:00 PM - 4:00 PM",
    attendees: 12,
    status: "Completed",
    agenda: "Budget review, project approvals, resource distribution",
    fundCollection: "$5,000",
    organizedBy: "Finance Committee",
  },
  {
    id: "MTG-003",
    title: "Emergency Relief Planning",
    location: "Online - Zoom Meeting",
    date: "2024-12-20",
    time: "11:00 AM - 1:00 PM",
    attendees: 18,
    status: "Upcoming",
    agenda: "Flood relief planning, resource mobilization, volunteer coordination",
    fundCollection: "$3,200",
    organizedBy: "Relief Team",
  },
  {
    id: "MTG-004",
    title: "Annual General Meeting",
    location: "Grand Hall, Convention Center",
    date: "2024-11-25",
    time: "9:00 AM - 5:00 PM",
    attendees: 156,
    status: "Completed",
    agenda: "Annual report, election of new committee, future planning",
    fundCollection: "$15,000",
    organizedBy: "Board of Directors",
  },
  {
    id: "MTG-005",
    title: "Community Outreach Program",
    location: "Community Center, Satellite Town",
    date: "2024-12-28",
    time: "3:00 PM - 6:00 PM",
    attendees: 32,
    status: "Upcoming",
    agenda: "Health camp planning, educational workshop, food distribution",
    fundCollection: "$1,800",
    organizedBy: "Outreach Team",
  },
  {
    id: "MTG-006",
    title: "Financial Review Meeting",
    location: "Board Room, Head Office",
    date: "2024-12-05",
    time: "10:30 AM - 12:30 PM",
    attendees: 8,
    status: "Cancelled",
    agenda: "Quarterly financial audit, expenditure review, budget adjustments",
    fundCollection: "$0",
    organizedBy: "Finance Department",
  },
];

export default function MeetingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredMeetings = meetingsData.filter((meeting) => {
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" || meeting.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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
        return <CalendarCheck className="w-3.5 h-3.5" />;
      case "Completed":
        return <CheckCircle className="w-3.5 h-3.5" />;
      case "Cancelled":
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2c6e49]">Meetings</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage and view all welfare meetings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#2c6e49] hover:bg-[#1f5234] text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Meeting
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
            placeholder="Search by meeting title, ID, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 transition-all duration-300 bg-white/50"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-gray-400 ml-1" />
          {["All", "Upcoming", "Completed", "Cancelled"].map((status) => (
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
          <p className="text-xs text-gray-500">Total Meetings</p>
          <p className="text-2xl font-bold text-[#2c6e49]">{meetingsData.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600">
            {meetingsData.filter((m) => m.status === "Upcoming").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {meetingsData.filter((m) => m.status === "Completed").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Total Attendees</p>
          <p className="text-2xl font-bold text-purple-600">
            {meetingsData.reduce((sum, m) => sum + m.attendees, 0)}
          </p>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.map((meeting) => (
          <Card
            key={meeting.id}
            className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover-lift overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-xl bg-[#2c6e49]/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-[#2c6e49]" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-gray-800">
                            {meeting.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                              meeting.status
                            )}`}
                          >
                            {getStatusIcon(meeting.status)}
                            {meeting.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium mb-2">
                          {meeting.id}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{meeting.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>{meeting.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>{meeting.attendees} attendees</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>Funds: {meeting.fundCollection}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <UserPlus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>Organized by: {meeting.organizedBy}</span>
                          </div>
                        </div>
                        {meeting.agenda && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500">
                              <span className="font-medium text-gray-700">Agenda:</span> {meeting.agenda}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex items-center gap-2 lg:flex-col lg:items-end flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(meeting.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMeetings.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No meetings found</h3>
          <p className="text-gray-500 text-sm mt-1">
            Try adjusting your search or filter criteria
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 bg-[#2c6e49] hover:bg-[#1f5234] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Meeting
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Showing {filteredMeetings.length} of {meetingsData.length} meetings
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

      {/* Create Meeting Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#2c6e49]">Create New Meeting</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Meeting Title
                </label>
                <Input placeholder="Enter meeting title" className="border-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Location
                </label>
                <Input placeholder="Enter location" className="border-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date & Time
                </label>
                <Input type="datetime-local" className="border-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Agenda
                </label>
                <Input placeholder="Enter agenda" className="border-gray-200" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-[#2c6e49] hover:bg-[#1f5234] text-white"
                >
                  Create Meeting
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}