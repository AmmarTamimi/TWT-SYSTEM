"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  UserPlus,
  Shield,
  Users,
  UserCog,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface MemberFormData {
  name: string;
  father_name: string;
  contactNum: string;
  cnic: string;
  address: string;
  password: string;
}

// CNIC formatter: XXXXX-XXXXXXX-X (13 digits)
function formatCnic(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

// Phone formatter: 0300-1234567 (11 digits)
function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

export default function AddMemberPage() {
  const router = useRouter();

  const [form, setForm] = useState<MemberFormData>({
    name: "",
    father_name: "",
    contactNum: "",
    cnic: "",
    address: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Generic change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // CNIC: format as user types
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCnic(e.target.value);
    setForm((prev) => ({ ...prev, cnic: formatted }));
    if (error) setError(null);
  };

  // Phone: format as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setForm((prev) => ({ ...prev, contactNum: formatted }));
    if (error) setError(null);
  };

  // Client-side validation
  const validate = (): string | null => {
    if (!form.name.trim()) return "Full name is required";
    if (!form.father_name.trim()) return "Father name is required";
    if (!/^\d{5}-\d{7}-\d$/.test(form.cnic))
      return "CNIC must be in format XXXXX-XXXXXXX-X";
    if (!/^03\d{2}-\d{7}$/.test(form.contactNum))
      return "Phone must be in format 03XX-XXXXXXX";
    if (!form.address.trim()) return "Address is required";
    if (form.password.length < 8)
      return "Password must be at least 8 characters";
    if (form.password !== confirmPassword)
      return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          role, // admin or member — chosen via toggle
          // admin is creating directly, so mark as approved
          verification_status: "verified",
          status: "active",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to add member. Please try again.");
        return;
      }

      setSuccess(`${form.name} has been added successfully.`);

      // Reset form
      setForm({
        name: "",
        father_name: "",
        contactNum: "",
        cnic: "",
        address: "",
        password: "",
      });
      setConfirmPassword("");
      setRole("member");
      setPasswordStrength(0);

      router.refresh(); // refresh members list if you have one
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    setPasswordStrength(strength);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-[#2c6e49]">Add New Member</h2>
          <p className="text-gray-500 text-sm mt-1">
            Register a new member to the welfare system
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-green-100/50 p-6 md:p-8">
          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("member")}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                    role === "member"
                      ? "border-[#2c6e49] bg-[#2c6e49]/5 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white/50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      role === "member" ? "bg-[#2c6e49] text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p
                      className={`text-sm font-semibold ${
                        role === "member" ? "text-[#2c6e49]" : "text-gray-600"
                      }`}
                    >
                      Member
                    </p>
                    <p className="text-xs text-gray-400">Standard user access</p>
                  </div>
                  {role === "member" && (
                    <CheckCircle className="w-5 h-5 text-[#2c6e49] ml-auto" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                    role === "admin"
                      ? "border-[#2c6e49] bg-[#2c6e49]/5 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white/50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      role === "admin" ? "bg-[#2c6e49] text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <UserCog className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p
                      className={`text-sm font-semibold ${
                        role === "admin" ? "text-[#2c6e49]" : "text-gray-600"
                      }`}
                    >
                      Admin
                    </p>
                    <p className="text-xs text-gray-400">Full system access</p>
                  </div>
                  {role === "admin" && (
                    <CheckCircle className="w-5 h-5 text-[#2c6e49] ml-auto" />
                  )}
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  className="w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50 pl-10"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Father Name */}
            <div>
              <label  className="block text-sm font-medium text-gray-700 mb-1.5">
                Father Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="father_name"
                  type="text"
                  placeholder="Enter father name"
                  className="w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50 pl-10"
                  value={form.father_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* CNIC */}
            <div>
              <label  className="block text-sm font-medium text-gray-700 mb-1.5">
                CNIC Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="cnic"
                  type="text"
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="35202-1234567-1"
                  className="w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50 pl-10"
                  value={form.cnic}
                  onChange={handleCnicChange}
                  required
                />
              </div>
              {form.cnic && form.cnic.replace(/\D/g, "").length < 13 && (
                <p className="text-xs text-gray-400 mt-1">
                  {form.cnic.replace(/\D/g, "").length}/13 digits
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label  className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="contactNum"
                  type="tel"
                  inputMode="numeric"
                  maxLength={12}
                  placeholder="0300-1234567"
                  className="w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50 pl-10"
                  value={form.contactNum}
                  onChange={handlePhoneChange}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label  className="block text-sm font-medium text-gray-700 mb-1.5">
                Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter complete address"
                  className="w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50 pl-10"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label  className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50 pl-10 pr-10"
                  value={form.password}
                  onChange={(e) => {
                    handleChange(e);
                    checkPasswordStrength(e.target.value);
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordStrength > 0 && (
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
                    {passwordStrength < 2 && "Weak - Add more characters, numbers, and symbols"}
                    {passwordStrength === 2 && "Fair - Add special characters for better security"}
                    {passwordStrength === 3 && "Good - Almost there!"}
                    {passwordStrength === 4 && "Strong - Great password!"}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label  className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className={`w-full transition-all duration-300 bg-white/50 pl-10 pr-10 ${
                    confirmPassword && confirmPassword !== form.password
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {confirmPassword && confirmPassword !== form.password && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-100/50 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 font-medium">Member Registration</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  The new member will receive a confirmation email with their login credentials.
                  {role === "admin" && " They will have administrative access to the system."}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">
                    All data is securely encrypted
                  </span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2c6e49] hover:bg-[#1f5234] text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding member...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}