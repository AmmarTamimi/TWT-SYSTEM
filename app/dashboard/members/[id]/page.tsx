"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import {
  ArrowLeft,
  User,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  UserCog,
  Users,
  Power,
} from "lucide-react";

type VerificationStatus = "pending" | "verified" | "declined";
type AccountStatus = "active" | "inactive";

type Member = {
  id: string;
  name: string;
  father_name: string | null;
  cnic: string;
  number: string | null;
  email: string | null;
  address: string | null;
  role: string;
  verification_status: VerificationStatus;
  status: AccountStatus;
  created_at: string;
};

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [draft, setDraft] = useState<Partial<Member>>({});

  /* ---------- Fetch ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/members/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load member");
        if (!cancelled) {
          setMember(data);
          setDraft(data);
          if (searchParams.get("edit") === "1") setEditing(true);
          if (searchParams.get("delete") === "1") setConfirmDelete(true);
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
  }, [id, searchParams]);

  /* ---------- Save ---------- */
  const handleSave = async () => {
    if (!member) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          father_name: draft.father_name,
          number: draft.number,
          email: draft.email,
          address: draft.address,
          status: draft.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMember(data);
      setDraft(data);
      setEditing(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Quick account-status toggle ---------- */
  const setAccountStatus = async (s: AccountStatus) => {
    if (!member) return;
    const res = await fetch(`/api/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    const data = await res.json();
    if (res.ok) {
      setMember(data);
      setDraft(data);
    } else {
      alert(data.error);
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      router.push("/dashboard/members");
      router.refresh();
    } catch (err) {
      alert((err as Error).message);
      setDeleting(false);
    }
  };

  /* ---------- Loading / error ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Loading member...
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-lg font-semibold text-gray-800">
          {error || "Member not found"}
        </h2>
        <Link
          href="/dashboard/members"
          className="mt-4 inline-flex items-center gap-2 text-[#2c6e49] font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Members
        </Link>
      </div>
    );
  }

  /* ---------- Verification badge (read-only) ---------- */
  const verificationBadge = () => {
    const v = member.verification_status;
    const map: Record<VerificationStatus, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      verified: "bg-green-50 text-green-700 border-green-200",
      declined: "bg-red-50 text-red-700 border-red-200",
    };
    const icon: Record<VerificationStatus, React.ReactNode> = {
      pending: <Clock className="w-3.5 h-3.5" />,
      verified: <CheckCircle2 className="w-3.5 h-3.5" />,
      declined: <XCircle className="w-3.5 h-3.5" />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${map[v]}`}
      >
        {icon[v]}
        {v.charAt(0).toUpperCase() + v.slice(1)}
      </span>
    );
  };

  const initials = (member.name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back link */}
      <Link
        href="/dashboard/members"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#2c6e49] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Members
      </Link>

      {/* Header card */}
      <div className="bg-gradient-to-r from-[#2c6e49]/10 to-green-50/50 rounded-2xl p-6 border border-[#2c6e49]/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2c6e49] to-[#1f5234] flex items-center justify-center text-white font-bold text-xl">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2c6e49]">
                {member.name}
              </h1>
              <p className="text-gray-500 text-sm">
                s/o {member.father_name || "—"}
              </p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {verificationBadge()}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${
                    member.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {member.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!editing ? (
              <>
                <Button
                  onClick={() => setEditing(true)}
                  className="bg-[#2c6e49] hover:bg-[#1f5234] text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => setConfirmDelete(true)}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#2c6e49] hover:bg-[#1f5234] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button
                  onClick={() => {
                    setDraft(member);
                    setEditing(false);
                  }}
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Account Status toggle */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
            Account status
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAccountStatus("active")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${
                member.status === "active"
                  ? "bg-[#2c6e49] text-white border-[#2c6e49]"
                  : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Active
            </button>
            <button
              onClick={() => setAccountStatus("inactive")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${
                member.status === "inactive"
                  ? "bg-[#2c6e49] text-white border-[#2c6e49]"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              }`}
            >
              <XCircle className="w-4 h-4" />
              Inactive
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Inactive members cannot log in.
          </p>
        </CardContent>
      </Card>

      {/* Detail card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-5">
          {editing ? (
            <>
              <Field label="Full Name" icon={<User className="w-4 h-4" />}>
                <Input
                  value={draft.name ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, name: e.target.value }))
                  }
                />
              </Field>
              <Field
                label="Father Name"
                icon={<Users className="w-4 h-4" />}
              >
                <Input
                  value={draft.father_name ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, father_name: e.target.value }))
                  }
                />
              </Field>
              <Field label="CNIC" icon={<CreditCard className="w-4 h-4" />}>
                <Input value={member.cnic} disabled className="bg-gray-50" />
                <p className="text-xs text-gray-400 mt-1">
                  CNIC cannot be changed (unique identifier).
                </p>
              </Field>
              <Field label="Phone" icon={<Phone className="w-4 h-4" />}>
                <Input
                  value={draft.number ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, number: e.target.value }))
                  }
                />
              </Field>
              <Field label="Email" icon={<Mail className="w-4 h-4" />}>
                <Input
                  value={draft.email ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, email: e.target.value }))
                  }
                />
              </Field>
              <Field label="Address" icon={<MapPin className="w-4 h-4" />}>
                <Input
                  value={draft.address ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, address: e.target.value }))
                  }
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Full Name" icon={<User className="w-4 h-4" />}>
                <span className="font-medium text-gray-800">
                  {member.name}
                </span>
              </Field>
              <Field
                label="Father Name"
                icon={<Users className="w-4 h-4" />}
              >
                <span className="font-medium text-gray-800">
                  {member.father_name || "—"}
                </span>
              </Field>
              <Field label="CNIC" icon={<CreditCard className="w-4 h-4" />}>
                <span className="font-mono text-gray-800">{member.cnic}</span>
              </Field>
              <Field label="Phone" icon={<Phone className="w-4 h-4" />}>
                <span className="font-medium text-gray-800">
                  {member.number || "—"}
                </span>
              </Field>
              <Field label="Email" icon={<Mail className="w-4 h-4" />}>
                <span className="font-medium text-gray-800">
                  {member.email || "—"}
                </span>
              </Field>
              <Field label="Address" icon={<MapPin className="w-4 h-4" />}>
                <span className="font-medium text-gray-800">
                  {member.address || "—"}
                </span>
              </Field>
              <Field label="Role" icon={<UserCog className="w-4 h-4" />}>
                <span className="font-medium text-gray-800 capitalize">
                  {member.role}
                </span>
              </Field>
              <Field label="Joined" icon={<Calendar className="w-4 h-4" />}>
                <span className="font-medium text-gray-800">
                  {new Date(member.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </Field>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-red-50">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Delete Member
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold">{member.name}</span>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Helper ---------- */

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}