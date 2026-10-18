"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import {
  Users,
  Wallet,
  CalendarCheck,
  HandCoins,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useUser } from "./UserContext";

/* ---------------- Types ---------------- */

type AdminStats = {
  totalMembers: number;
  totalFunds: number;
  meetingsHeld: number;
  duesCount: number;
};

type MemberStats = {
  attendanceCount: number;
  meetingsAttended: number;
  outstandingDues: number;
  totalDonated: number;
};

type ActivityKind =
  | "meeting"
  | "donation"
  | "member"
  | "verified"
  | "declined";

type Activity = {
  action: string;
  user: string;
  time: string;
  kind: ActivityKind;
};

type DashboardData =
  | { role: "admin"; stats: AdminStats; activities: Activity[] }
  | { role: "member"; stats: MemberStats; activities: Activity[] };

/* ---------------- Helpers ---------------- */

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
}

const kindStyles: Record<
  ActivityKind,
  { bg: string; icon: React.ReactNode }
> = {
  meeting: {
    bg: "bg-purple-50 text-purple-600",
    icon: <CalendarCheck className="w-4 h-4" />,
  },
  donation: {
    bg: "bg-emerald-50 text-emerald-600",
    icon: <Wallet className="w-4 h-4" />,
  },
  verified: {
    bg: "bg-green-50 text-green-600",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  declined: {
    bg: "bg-rose-50 text-rose-600",
    icon: <XCircle className="w-4 h-4" />,
  },
  member: {
    bg: "bg-gray-50 text-gray-600",
    icon: <Users className="w-4 h-4" />,
  },
};

/* ---------------- Page ---------------- */

export default function DashboardOverview() {
  const user = useUser();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load dashboard");
        if (!cancelled) setData(json);
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

  /* ---------- Loading / error ---------- */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#2c6e49]/10 to-green-50/50 rounded-2xl p-6 border border-[#2c6e49]/10">
          <h2 className="text-2xl font-bold text-[#2c6e49]">
            Welcome back, {user.name}
          </h2>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your welfare management today.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm animate-pulse">
              <CardContent className="p-6 h-32 bg-gray-50 rounded-xl" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        Failed to load dashboard: {error || "Unknown error"}
      </div>
    );
  }

  /* ---------- Build stat cards based on role ---------- */
  const statCards =
    data.role === "admin"
      ? [
          {
            title: "Total Members",
            value: String(data.stats.totalMembers),
            icon: <Users className="w-6 h-6 text-[#2c6e49]" />,
            bg: "bg-green-50",
            subtitle: "Registered members",
          },
          {
            title: "Total Funds",
            value: formatMoney(data.stats.totalFunds),
            icon: <Wallet className="w-6 h-6 text-[#2c6e49]" />,
            bg: "bg-blue-50",
            subtitle: "All donations received",
          },
          {
            title: "Meetings Held",
            value: String(data.stats.meetingsHeld),
            icon: <CalendarCheck className="w-6 h-6 text-[#2c6e49]" />,
            bg: "bg-purple-50",
            subtitle: "Past meetings",
          },
          {
            title: "Outstanding Dues",
            value: String(data.stats.duesCount),
            icon: <HandCoins className="w-6 h-6 text-[#2c6e49]" />,
            bg: "bg-amber-50",
            subtitle: "Due records",
          },
        ]
      : [
          {
            title: "Meetings Held",
            value: String(data.stats.attendanceCount),
            icon: <CalendarCheck className="w-6 h-6 text-[#2c6e49]" />,
            bg: "bg-purple-50",
            subtitle: "Attendance records",
          },
          {
            title: "Meetings Attended",
            value: String(data.stats.meetingsAttended),
            icon: <Users className="w-6 h-6 text-[#2c6e49]" />,
            bg: "bg-green-50",
            subtitle: "Present in meetings",
          },
          {
            title: "Outstanding Dues",
            value: formatMoney(data.stats.outstandingDues),
            icon: <HandCoins className="w-6 h-6 text-[#2c6e49]" />,
            bg: "bg-amber-50",
            subtitle: "Amount pending",
          },
          {
            title: "Total Donated",
            value: formatMoney(data.stats.totalDonated),
            icon: <Wallet className="w-6 h-6 text-[#2c6e49]" />,
            bg: "bg-blue-50",
            subtitle: "Lifetime contributions",
          },
        ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#2c6e49]/10 to-green-50/50 rounded-2xl p-6 border border-[#2c6e49]/10">
        <div>
          <h2 className="text-2xl font-bold text-[#2c6e49]">
            Welcome back, {user.name}
          </h2>
          <p className="text-gray-600 mt-1">
            {data.role === "admin"
              ? "Here's what's happening with your welfare management today."
              : "Here's a summary of your welfare activity."}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="border-0 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1 truncate">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} shrink-0`}>
                  {stat.icon}
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity — admin only */}
      {data.role === "admin" && (
        <div className="px-1 md:px-5">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  Recent Activity
                </h3>
              </div>

              {data.activities.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-500">
                    No recent activity yet.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Activity will appear here as members register, meetings are
                    created, and donations are recorded.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.activities.map((activity, index) => {
                    const style =
                      kindStyles[activity.kind] ?? kindStyles.member;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.bg}`}
                          >
                            {style.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-gray-700 truncate">
                              {activity.action}
                            </p>
                            <p className="text-xs text-gray-400">
                              by {activity.user}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 ml-3">
                          {activity.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}