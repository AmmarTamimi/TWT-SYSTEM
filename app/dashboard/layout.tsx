"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CalendarCheck,
  HandCoins,
  Settings,
  UserPlus,
  ClipboardList,
  CreditCard,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Shield,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "../components/ui/Button";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  memberOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: "Members",
    href: "/dashboard/members",
    icon: <Users className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    name: "Add Member",
    href: "/dashboard/add-member",
    icon: <UserPlus className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    name: "My Funding",
    href: "/dashboard/funding",
    icon: <Wallet className="w-5 h-5" />,
    memberOnly: true,
  },
  {
    name: "My Attendance",
    href: "/dashboard/attendance",
    icon: <Clock className="w-5 h-5" />,
    memberOnly: true,
  },
  {
    name: "Meetings",
    href: "/dashboard/meetings",
    icon: <CalendarCheck className="w-5 h-5" />,
  },
  {
    name: "Loan Requests",
    href: "/dashboard/loans",
    icon: <HandCoins className="w-5 h-5" />,
  },
  {
    name: "Loan Details",
    href: "/dashboard/loan-details",
    icon: <CreditCard className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  // For demo purposes - toggle between admin and member view
  const [userRole, setUserRole] = useState<"admin" | "member">("admin");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly && userRole !== "admin") return false;
    if (item.memberOnly && userRole !== "member") return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-green-50/20">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white/95 backdrop-blur-xl border-r border-green-100/50 shadow-xl transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        } ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-green-100/50">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2c6e49] to-[#1f5234] rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xs">TW</span>
            </div>
            {isSidebarOpen && (
              <span className="text-lg font-bold text-[#2c6e49] whitespace-nowrap">
                Tamimi Welfare
              </span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="hidden md:block p-1 rounded-lg hover:bg-green-50 transition-colors"
          >
            {isSidebarOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-500 rotate-90" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 -rotate-90" />
            )}
          </button>
        </div>

        {/* User Role Toggle (Demo) */}
        <div className="px-3 py-3 border-b border-green-100/50">
          <div className="flex items-center gap-2 bg-green-50/50 rounded-lg p-1.5">
            <button
              onClick={() => setUserRole("admin")}
              className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                userRole === "admin"
                  ? "bg-[#2c6e49] text-white shadow-sm"
                  : "text-gray-600 hover:text-[#2c6e49]"
              }`}
            >
              Admin View
            </button>
            <button
              onClick={() => setUserRole("member")}
              className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                userRole === "member"
                  ? "bg-[#2c6e49] text-white shadow-sm"
                  : "text-gray-600 hover:text-[#2c6e49]"
              }`}
            >
              Member View
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-[#2c6e49]/10 text-[#2c6e49]"
                        : "text-gray-600 hover:bg-green-50 hover:text-[#2c6e49]"
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {isSidebarOpen && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                    {isActive && isSidebarOpen && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2c6e49]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-green-100/50 p-4">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-green-50/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2c6e49] to-[#1f5234] flex items-center justify-center text-white font-semibold text-sm">
              {userRole === "admin" ? "A" : "M"}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {userRole === "admin" ? "Admin User" : "Member User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userRole === "admin" ? "Administrator" : "Welfare Member"}
                </p>
              </div>
            )}
            <button className="p-1.5 rounded-lg hover:bg-white/50 transition-colors">
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-green-100/50 px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMobileSidebar}
                className="md:hidden p-2 rounded-lg hover:bg-green-50 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-800">
                {pathname === "/dashboard" && "Overview"}
                {pathname === "/dashboard/members" && "Members"}
                {pathname === "/dashboard/add-member" && "Add Member"}
                {pathname === "/dashboard/funding" && "My Funding"}
                {pathname === "/dashboard/attendance" && "My Attendance"}
                {pathname === "/dashboard/meetings" && "Meetings"}
                {pathname === "/dashboard/loans" && "Loan Requests"}
                {pathname === "/dashboard/loan-details" && "Loan Details"}
                {pathname === "/dashboard/settings" && "Settings"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-green-50 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2c6e49] to-[#1f5234] flex items-center justify-center text-white font-semibold text-sm">
                {userRole === "admin" ? "A" : "M"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}