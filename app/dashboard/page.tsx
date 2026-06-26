"use client";

import { Card, CardContent } from "../components/ui/Card";
import {
  Users,
  Wallet,
  CalendarCheck,
  HandCoins,
  TrendingUp,
  Clock,
  UserPlus,
  CreditCard,
} from "lucide-react";

const stats = [
  {
    title: "Total Members",
    value: "1,284",
    icon: <Users className="w-6 h-6 text-[#2c6e49]" />,
    change: "+12%",
    changeType: "increase",
    bg: "bg-green-50",
  },
  {
    title: "Total Funds",
    value: "$45,892",
    icon: <Wallet className="w-6 h-6 text-[#2c6e49]" />,
    change: "+8%",
    changeType: "increase",
    bg: "bg-blue-50",
  },
  {
    title: "Meetings Held",
    value: "24",
    icon: <CalendarCheck className="w-6 h-6 text-[#2c6e49]" />,
    change: "+3",
    changeType: "increase",
    bg: "bg-purple-50",
  },
  {
    title: "Loan Requests",
    value: "18",
    icon: <HandCoins className="w-6 h-6 text-[#2c6e49]" />,
    change: "-2",
    changeType: "decrease",
    bg: "bg-amber-50",
  },
];

// const quickActions = [
//   { label: "Add Member", icon: <UserPlus className="w-5 h-5" />, color: "bg-[#2c6e49]" },
//   { label: "Create Meeting", icon: <CalendarCheck className="w-5 h-5" />, color: "bg-blue-600" },
//   { label: "Request Loan", icon: <HandCoins className="w-5 h-5" />, color: "bg-amber-600" },
//   { label: "View Attendance", icon: <Clock className="w-5 h-5" />, color: "bg-purple-600" },
// ];

const recentActivities = [
  { action: "New member registered", time: "2 minutes ago", user: "Ahmed Khan" },
  { action: "Meeting scheduled", time: "1 hour ago", user: "Admin" },
  { action: "Loan request approved", time: "3 hours ago", user: "Fatima Ali" },
  { action: "Funds collected", time: "5 hours ago", user: "System" },
  { action: "Attendance marked", time: "1 day ago", user: "12 members" },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#2c6e49]/10 to-green-50/50 rounded-2xl p-6 border border-[#2c6e49]/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#2c6e49]">
              Welcome back, Admin!
            </h2>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your welfare management today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 bg-white/70 px-3 py-1.5 rounded-full border border-green-100">
              Last login: Today 10:30 AM
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <span
                  className={`text-xs font-medium ${
                    stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-gray-400">
                  {stat.changeType === "increase" ? "vs last month" : "vs last month"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      
        {/* Quick Actions */}
        {/* <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50/50 hover:bg-green-50 transition-all duration-200 group"
                  >
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#2c6e49] transition-colors">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Recent Activity */}
        <div className="px-5">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Recent Activity</h3>
                <button className="text-xs text-[#2c6e49] font-medium hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-gray-700">{activity.action}</p>
                      <p className="text-xs text-gray-400">by {activity.user}</p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    
  );
}