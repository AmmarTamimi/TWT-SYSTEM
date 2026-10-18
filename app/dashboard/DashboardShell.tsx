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
  DollarSign,
  TrendingDown
} from "lucide-react";
import { UserProvider } from "./UserContext";
import ProfileCard from "./ProfileCard/page";

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
    name: "Donations",
    href: "/dashboard/donations",
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    name: "Expenses",
    href: "/dashboard/expenses",
    icon: <TrendingDown className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    name: "Attendance",
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
  const [isSidebarProfileOpen, setIsSidebarProfileOpen] = useState(false);
  const [isHeaderProfileOpen, setIsHeaderProfileOpen] = useState(false);
  const pathname = usePathname();

  const sidebarProfileRef = useRef<HTMLDivElement | null>(null);
  const headerProfileRef = useRef<HTMLDivElement | null>(null);

  /* ---------- Close sidebar popup on outside click / Escape ---------- */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        sidebarProfileRef.current &&
        !sidebarProfileRef.current.contains(e.target as Node)
      ) {
        setIsSidebarProfileOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsSidebarProfileOpen(false);
        setIsHeaderProfileOpen(false);
      }
    }
    if (isSidebarProfileOpen || isHeaderProfileOpen) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isSidebarProfileOpen, isHeaderProfileOpen]);

  /* ---------- Auto-close sidebar popup when collapsed ---------- */
  useEffect(() => {
    if (!isSidebarOpen && isSidebarProfileOpen) {
      setIsSidebarProfileOpen(false);
    }
  }, [isSidebarOpen, isSidebarProfileOpen]);

  const toggleSidebar = () => setIsSidebarOpen((s) => !s);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((s) => !s);

  const handleSidebarUserClick = () => {
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
      return;
    }
    setIsSidebarProfileOpen((o) => !o);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-green-50/20">
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
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

        {/* User card */}
        <div
          className="border-t border-green-100/50 p-4 shrink-0 relative"
          ref={sidebarProfileRef}
        >
          <ProfileCard
            user={user}
            isOpen={isSidebarProfileOpen && isSidebarOpen}
            onClose={() => setIsSidebarProfileOpen(false)}
            variant="anchored"
          />

          <button
            onClick={handleSidebarUserClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isSidebarProfileOpen && isSidebarOpen
                ? "bg-[#2c6e49]/10 ring-1 ring-[#2c6e49]/20"
                : "bg-green-50/50 hover:bg-green-50"
            }`}
            aria-haspopup="dialog"
            aria-expanded={isSidebarProfileOpen && isSidebarOpen}
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

      {/* Main content */}
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
                {pageTitle(pathname, user.role)}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-green-50 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Header avatar + dropdown */}
              <div className="relative" ref={headerProfileRef}>
                <button
                  onClick={() => setIsHeaderProfileOpen((o) => !o)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2c6e49] to-[#1f5234] flex items-center justify-center text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                  aria-label="Open profile"
                  aria-haspopup="dialog"
                  aria-expanded={isHeaderProfileOpen}
                >
                  {initials}
                </button>

                <ProfileCard
                  user={user}
                  isOpen={isHeaderProfileOpen}
                  onClose={() => setIsHeaderProfileOpen(false)}
                  variant="dropdown"
                />
              </div>
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

function pageTitle(pathname: string, role: string) {
  const isMember = role === "member";

  const map: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/members": "Members",
    "/dashboard/add-member": "Add Member",
    "/dashboard/verifications": "Member Verification",
    "/dashboard/donations": isMember ? "My Donations" : "Donations",
    "/dashboard/attendance": isMember ? "My Attendance" : "Attendance",
    "/dashboard/meetings": "Meetings",
    "/dashboard/expenses": "Expenses",
    "/dashboard/loans": isMember ? "My Loan Requests" : "Loan Requests",
    "/dashboard/loan-details": "Loan Details",
    "/dashboard/settings": "Settings",
  };

  return map[pathname] ?? "";
}