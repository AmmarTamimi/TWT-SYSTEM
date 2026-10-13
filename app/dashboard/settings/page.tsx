"use client";

import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  User,
  Phone,
  MapPin,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Save,
  Edit,
  X,
  CheckCircle,
  Shield,
  Mail,
  Calendar,
  UserCog,
  Key,
  AlertCircle,
} from "lucide-react";

type Profile = {
  id: string;
  name: string;
  father_name: string | null;
  cnic: string;
  number: string | null;
  email: string | null;
  address: string | null;
  role: string;
  verification_status: string;
  status: string;
  created_at: string;
};

/* ---------------- Page ---------------- */

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    number: "",
    email: "",
    address: "",
  });

  /* ---------- Password state ---------- */
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  /* ---------- Fetch profile ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load profile");
        if (!cancelled) {
          setProfile(data);
          setFormData({
            name: data.name ?? "",
            number: data.number ?? "",
            email: data.email ?? "",
            address: data.address ?? "",
          });
        }
      } catch (err) {
        if (!cancelled) setLoadError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Handlers ---------- */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (saveError) setSaveError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [id]: value }));
    if (id === "newPassword") checkPasswordStrength(value);
    if (passwordError) setPasswordError(null);
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setProfile(data);
      setFormData({
        name: data.name ?? "",
        number: data.number ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    setIsEditing(false);
    setSaveError(null);
    setFormData({
      name: profile.name ?? "",
      number: profile.number ?? "",
      email: profile.email ?? "",
      address: profile.address ?? "",
    });
  };

  const handlePasswordSubmit = async () => {
    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      const res = await fetch("/api/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password update failed");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStrength(0);
      setShowChangePassword(false);
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError((err as Error).message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  /* ---------- Loading / error ---------- */
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh] text-gray-500">
        Loading settings...
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-lg font-semibold text-gray-800">
          {loadError || "Could not load profile"}
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 md:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#2c6e49]">
          Settings
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Manage your profile and account settings
        </p>
      </div>

      {/* Success banner */}
      {saveSuccess && (
        <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            Profile updated successfully.
          </p>
        </div>
      )}

      {passwordSuccess && (
        <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            Password updated successfully.
          </p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#2c6e49]/10 to-green-50/50 px-5 md:px-6 py-6 md:py-8 border-b border-green-100/50">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2c6e49] to-[#1f5234] flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
              {getInitials(profile.name)}
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                  {profile.name}
                </h3>
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                    profile.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {profile.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 justify-center sm:justify-start">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <UserCog className="w-3.5 h-3.5" />
                  <span className="capitalize">
                    {profile.role === "admin" ? "Administrator" : "Member"}
                  </span>
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined{" "}
                  {new Date(profile.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto bg-[#2c6e49] hover:bg-[#1f5234] text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-5 md:p-6">
          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{saveError}</p>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    CNIC Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={profile.cnic}
                      disabled
                      className="pl-10 border-gray-200 bg-gray-50 text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    CNIC cannot be changed.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="number"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="number"
                      placeholder="0300-1234567"
                      value={formData.number}
                      onChange={handleInputChange}
                      className="pl-10 border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49]"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49]"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="pl-10 border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-[#2c6e49] hover:bg-[#1f5234] text-white"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </div>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-medium">
                    Full Name
                  </label>
                  <p className="text-gray-800 font-medium flex items-center gap-2 mt-0.5">
                    <User className="w-4 h-4 text-gray-400" />
                    {profile.name}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-medium">
                    Father Name
                  </label>
                  <p className="text-gray-800 flex items-center gap-2 mt-0.5">
                    <User className="w-4 h-4 text-gray-400" />
                    {profile.father_name || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-medium">
                    CNIC Number
                  </label>
                  <p className="text-gray-800 flex items-center gap-2 mt-0.5 font-mono">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    {profile.cnic}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-medium">
                    Phone Number
                  </label>
                  <p className="text-gray-800 flex items-center gap-2 mt-0.5">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {profile.number || "—"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-medium">
                    Email Address
                  </label>
                  <p className="text-gray-800 flex items-center gap-2 mt-0.5 break-all">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    {profile.email || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-medium">
                    Address
                  </label>
                  <p className="text-gray-800 flex items-center gap-2 mt-0.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    {profile.address || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-medium">
                    Role
                  </label>
                  <p className="text-gray-800 flex items-center gap-2 mt-0.5">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="capitalize">
                      {profile.role === "admin" ? "Administrator" : "Member"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div className="border-t border-gray-100 p-5 md:p-6">
          {!showChangePassword ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Password</h4>
                <p className="text-xs text-gray-500">
                  Keep your account secure with a strong password
                </p>
              </div>
              <Button
                onClick={() => setShowChangePassword(true)}
                variant="outline"
                className="w-full sm:w-auto border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49]/5"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Change Password
                </h4>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setPasswordStrength(0);
                    setPasswordError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{passwordError}</p>
                </div>
              )}

              <div className="space-y-3">
                {/* Current Password */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-10 border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-10 border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {passwordData.newPassword.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i < passwordStrength
                                ? i < 2
                                  ? "bg-red-400"
                                  : i < 3
                                  ? "bg-yellow-400"
                                  : "bg-[#2c6e49]"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        {passwordStrength < 2 &&
                          "Weak — add more characters, numbers, and symbols"}
                        {passwordStrength === 2 &&
                          "Fair — add special characters for better security"}
                        {passwordStrength === 3 && "Good — almost there!"}
                        {passwordStrength === 4 && "Strong — great password!"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-10 border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {passwordData.confirmPassword &&
                    passwordData.newPassword !==
                      passwordData.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Passwords do not match
                      </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setPasswordStrength(0);
                      setPasswordError(null);
                    }}
                    disabled={isChangingPassword}
                    className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePasswordSubmit}
                    disabled={
                      isChangingPassword ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      passwordData.newPassword !== passwordData.confirmPassword
                    }
                    className="flex-1 bg-[#2c6e49] hover:bg-[#1f5234] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Update Password
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}