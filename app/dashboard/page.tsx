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

type Stats = {
  totalMembers: number;
  totalFunds: number;
  meetingsHeld: number;
  duesCount: number;
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

/* ---------------- Helpers ---------------- */

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
}

/* Icon + color per activity kind */
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

  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load dashboard");
        if (!cancelled) {
          setStats(data.stats);
          setActivities(data.activities ?? []);
        }
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

  /* ---------- Build stat cards from real data ---------- */
  const statCards = [
    {
      title: "Total Members",
      value: loading ? "—" : String(stats?.totalMembers ?? 0),
      icon: <Users className="w-6 h-6 text-[#2c6e49]" />,
      bg: "bg-green-50",
      subtitle: "Registered members",
    },
    {
      title: "Total Funds",
      value: loading ? "—" : formatMoney(stats?.totalFunds ?? 0),
      icon: <Wallet className="w-6 h-6 text-[#2c6e49]" />,
      bg: "bg-blue-50",
      subtitle: "All donations received",
    },
    {
      title: "Meetings Held",
      value: loading ? "—" : String(stats?.meetingsHeld ?? 0),
      icon: <CalendarCheck className="w-6 h-6 text-[#2c6e49]" />,
      bg: "bg-purple-50",
      subtitle: "Past meetings",
    },
    {
      title: "Outstanding Dues",
      value: loading ? "—" : String(stats?.duesCount ?? 0),
      icon: <HandCoins className="w-6 h-6 text-[#2c6e49]" />,
      bg: "bg-amber-50",
      subtitle: "Due records",
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
            Here's what's happening with your welfare management today.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          Failed to load dashboard data: {error}
        </div>
      )}

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

      {/* Recent Activity */}
      <div className="px-1 md:px-5">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Recent Activity
              </h3>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 bg-gray-100 rounded w-40" />
                        <div className="h-2.5 bg-gray-100 rounded w-24" />
                      </div>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded w-12" />
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
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
                {activities.map((activity, index) => {
                  const style = kindStyles[activity.kind] ?? kindStyles.member;
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
    </div>
  );
}