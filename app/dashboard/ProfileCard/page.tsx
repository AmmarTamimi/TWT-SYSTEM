"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  Clock,
  UserCheck,
  Shield,
  X,
  CheckCircle2,
  XCircle,
  Settings,
  LogOut,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ProfileUser = {
  id: string;
  name: string;
  cnic: string;
  role: string;
  verification_status: string;
};

export default function ProfileCard({
  user,
  isOpen,
  onClose,
  variant = "anchored", // "anchored" (bottom-left sidebar) | "dropdown" (top-right header)
}: {
  user: ProfileUser;
  isOpen: boolean;
  onClose: () => void;
  variant?: "anchored" | "dropdown";
}) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement | null>(null);

  /* ---------- Close on outside click + Escape ---------- */
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const badge = (v: string) => {
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

  /* ---------- Positioning classes ---------- */
  const positionClasses =
    variant === "anchored"
      ? "absolute bottom-full left-3 right-3 mb-3 z-[60]" // Inside sidebar, above user card
      : "absolute right-0 top-full mt-2 z-[60] w-80"; // Dropdown below header avatar

  return (
    <div
      ref={cardRef}
      className={`${positionClasses} bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 ring-1 ring-black/5 overflow-hidden`}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Profile"
    >
      {/* Header — crystal gradient */}
      <div className="relative bg-gradient-to-br from-[#2c6e49] via-[#245738] to-[#1f5234] px-5 pt-5 pb-10">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
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
        <div className="mt-2">{badge(user.verification_status)}</div>
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
          onClick={onClose}
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
  );
}

/* ---------- Helper ---------- */

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