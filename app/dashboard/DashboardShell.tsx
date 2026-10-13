"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CalendarCheck,
  HandCoins,
  Settings,
  UserPlus,
  CreditCard,
  Bell,
  LogOut,
  Menu,
  ChevronDown,
  Clock,
  UserCheck,
  Shield,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { UserProvider } from "./UserContext";

interface User {
  id: string;
  name: string;
  cnic: string;
  role: "admin" | "member" | string;
  verification_status: string;
}

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
    name: "Verifications",
    href: "/dashboard/verifications",
    icon: <UserCheck className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    name: "My Funding",
    href: "/dashboard/funding",
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    name: "My Attendance",
    href: "/dashboard/attendance",
    icon: <Clock className="w-5 h-5" />,
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

export default function DashboardShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  const profileRef = useRef<HTMLDivElement | null>(null);

  /* ---------- Close popup on outside click / Escape ---------- */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsProfileOpen(false);
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileOpen]);

  /* ---------- Auto-close popup when sidebar collapses ---------- */
  useEffect(() => {
    if (!isSidebarOpen && isProfileOpen) {
      setIsProfileOpen(false);
    }
  }, [isSidebarOpen, isProfileOpen]);

  const toggleSidebar = () => setIsSidebarOpen((s) => !s);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((s) => !s);

  /* ---------- Handle user button click ---------- */
  const handleUserButtonClick = () => {
    // If sidebar is collapsed, expand it first (don't open popup)
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
      return;
    }
    // If expanded, toggle popup
    setIsProfileOpen((o) => !o);
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly && user.role !== "admin") return false;
    if (item.memberOnly && user.role !== "member") return false;
    return true;
  });

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  const verificationBadge = (v: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      verified: "bg-green-50 text-green-700 border-green-200",
      declined: "bg-red-50 text-red-700 border-red-200",
    };
    const icon: Record<string, React.ReactNode> = {
      pending: <Clock className="w-3 h-3" />,
      verified: <CheckCircle2 className="w-3 h-3" />,
      declined: <XCircle className="w-3 h-3" />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${
          map[v] || "bg-gray-50 text-gray-700 border-gray-200"
        }`}
      >
        {icon[v] || null}
        {v.charAt(0).toUpperCase() + v.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-green-50/20">
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* ---------- Sidebar ---------- */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full flex flex-col bg-white/95 backdrop-blur-xl border-r border-green-100/50 shadow-xl transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        } ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-green-100/50 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2c6e49] to-[#1f5234] rounded-lg flex items-center justify-center shadow-md shrink-0">
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
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isSidebarOpen ? "rotate-90" : "-rotate-90"
              }`}
            />
          </button>
        </div>

        {/* Nav — scrollable */}
        <nav className="flex-1 min-h-0 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
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

        {/* User card + popup */}
        <div
          className="border-t border-green-100/50 p-4 shrink-0 relative"
          ref={profileRef}
        >
          {/* ---------- Crystal popup — only when sidebar expanded ---------- */}
          {isProfileOpen && isSidebarOpen && (
            <div
              className="absolute bottom-full left-3 right-3 mb-3 z-[60] bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 ring-1 ring-black/5 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="false"
              aria-label="Profile"
            >
              {/* Header — crystal gradient */}
              <div className="relative bg-gradient-to-br from-[#2c6e49] via-[#245738] to-[#1f5234] px-5 pt-5 pb-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsProfileOpen(false);
                  }}
                  className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-lg bg-white/15 hover:bg-white/30 text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

                <p className="relative text-white/80 text-[10px] uppercase tracking-wider font-medium">
                  Signed in as
                </p>
                <h3 className="relative text-white text-base font-bold mt-0.5 truncate pr-6">
                  {user.name}
                </h3>
              </div>

              {/* Avatar */}
              <div className="relative -mt-9 px-5 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2c6e49] to-[#1f5234] flex items-center justify-center text-white text-xl font-bold ring-4 ring-white shadow-lg">
                  {initials}
                </div>
                <p className="mt-2 text-xs text-gray-500 capitalize">
                  {user.role === "admin" ? "Administrator" : "Welfare Member"}
                </p>
                <div className="mt-2">
                  {verificationBadge(user.verification_status)}
                </div>
              </div>

              {/* Info rows */}
              <div className="px-5 py-4 space-y-2.5">
                <InfoRow
                  icon={<CreditCard className="w-3.5 h-3.5" />}
                  label="CNIC"
                  value={user.cnic || "—"}
                />
                <InfoRow
                  icon={<Shield className="w-3.5 h-3.5" />}
                  label="Role"
                  value={user.role === "admin" ? "Administrator" : "Member"}
                />
                <InfoRow
                  icon={<UserCheck className="w-3.5 h-3.5" />}
                  label="Verification"
                  value={
                    user.verification_status
                      ? user.verification_status.charAt(0).toUpperCase() +
                        user.verification_status.slice(1)
                      : "—"
                  }
                />
              </div>

              {/* Actions */}
              <div className="px-5 pb-5 pt-1 flex flex-col gap-2">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Account settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-100 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log out
                </button>
              </div>
            </div>
          )}

          {/* User button */}
          <button
            onClick={handleUserButtonClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isProfileOpen && isSidebarOpen
                ? "bg-[#2c6e49]/10 ring-1 ring-[#2c6e49]/20"
                : "bg-green-50/50 hover:bg-green-50"
            }`}
            aria-haspopup="dialog"
            aria-expanded={isProfileOpen && isSidebarOpen}
            title={!isSidebarOpen ? "Expand sidebar" : "Open profile"}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2c6e49] to-[#1f5234] flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {initials}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {user.role === "admin" ? "Administrator" : "Welfare Member"}
                </p>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* ---------- Main content ---------- */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
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
                {pageTitle(pathname)}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-green-50 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button
                onClick={handleUserButtonClick}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2c6e49] to-[#1f5234] flex items-center justify-center text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                aria-label="Open profile"
              >
                {initials}
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <UserProvider user={user}>{children}</UserProvider>
        </main>
      </div>
    </div>
  );
}

/* ---------------- Helper ---------------- */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
        <span className="text-gray-400">{icon}</span>
        {label}
      </span>
      <span className="text-xs font-medium text-gray-800 truncate max-w-[60%] text-right">
        {value}
      </span>
    </div>
  );
}

function pageTitle(pathname: string) {
  const map: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/members": "Members",
    "/dashboard/add-member": "Add Member",
    "/dashboard/verifications": "Member Verification",
    "/dashboard/funding": "My Funding",
    "/dashboard/attendance": "My Attendance",
    "/dashboard/meetings": "Meetings",
    "/dashboard/loans": "Loan Requests",
    "/dashboard/loan-details": "Loan Details",
    "/dashboard/settings": "Settings",
  };
  return map[pathname] ?? "";
} 