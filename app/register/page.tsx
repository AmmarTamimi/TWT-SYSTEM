"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Eye,
  EyeOff,
  UserPlus,
  Lock,
  User,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Mail,
} from "lucide-react";

interface formData {
  name: string;
  father_name: string;
  contactNum: string;
  cnic: string;
  email: string;
  password: string;
  address: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setform] = useState<formData>({
    name: "",
    father_name: "",
    contactNum: "",
    cnic: "",
    email: "",
    password: "",
    address: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Generic change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setform((prev) => ({ ...prev, [id]: value }));
    if (error) setError(null); // clear error when user types
  };

  // Validate all fields before sending
  const validate = (): string | null => {
    if (!form.name.trim()) return "Full name is required";
    if (!form.father_name.trim()) return "Father name is required";
    if (!form.contactNum.trim()) return "Phone number is required";
    if (!/^03\d{2}-?\d{7}$/.test(form.contactNum.replace(/\s/g, "")))
      return "Enter a valid phone number (e.g. 0300-1234567)";
    if (!form.cnic.trim()) return "CNIC is required";
    if (!/^\d{5}-?\d{7}-?\d$/.test(form.cnic))
      return "Enter a valid CNIC (e.g. 35202-1234567-1)";
    if (!form.address.trim()) return "Address is required";
    if (!form.password) return "Password is required";
    if (form.password.length < 8)
      return "Password must be at least 8 characters";
    if (form.password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError("Registration failed. Please try again.");
        return;
      }

      // Success
      setSuccess(true);
      setform({
        name: "",
        father_name: "",
        contactNum: "",
        cnic: "",
        email: "",
        password: "",
        address: "",
      });
      setConfirmPassword("");
      setPasswordStrength(0);

      // Optionally redirect after a few seconds
      // setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection and try again.");
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

  // Formats digits into XXXXX-XXXXXXX-X as the user types
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 13);

    let formatted = digits;
    if (digits.length > 5) {
      formatted = digits.slice(0, 5) + "-" + digits.slice(5);
    }
    if (digits.length > 12) {
      formatted =
        digits.slice(0, 5) + "-" + digits.slice(5, 12) + "-" + digits.slice(12);
    }

    setform((prev) => ({ ...prev, cnic: formatted }));
    if (error) setError(null);
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-green-50/30 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md relative">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#2c6e49]">
              Registration Submitted!
            </h1>
            <p className="text-gray-600 text-sm mt-3 leading-relaxed">
              Your account is pending admin approval. You'll be able to sign in
              once your account is verified.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 text-[#2c6e49] hover:text-[#1f5234] font-semibold transition-colors"
            >
              Go to Sign in →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-green-50/30 flex items-center justify-center px-4 py-12">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2c6e49]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#2c6e49]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2c6e49]/5 rounded-full blur-2xl"></div>
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2c6e49]/10 rounded-2xl mb-4">
              <UserPlus className="w-8 h-8 text-[#2c6e49]" />
            </div>
            <h1 className="text-2xl font-bold text-[#2c6e49]">
              Create Member Account
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Join us in making a difference
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full border-gray-200 transition-all duration-300 bg-white/50 pl-10"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Father Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Father Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="father_name"
                  type="text"
                  placeholder="Enter Father's Name"
                  className="w-full border-gray-200 transition-all duration-300 bg-white/50 pl-10"
                  value={form.father_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* CNIC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                CNIC Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="cnic"
                  type="text"
                  inputMode="numeric"
                  maxLength={15} // 13 digits + 2 dashes
                  placeholder="35202-1234567-1"
                  className="w-full border-gray-200 transition-all duration-300 bg-white/50 pl-10"
                  value={form.cnic}
                  onChange={handleCnicChange}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="contactNum"
                  type="tel"
                  placeholder="0300-1234567"
                  className="w-full border-gray-200 transition-all duration-300 bg-white/50 pl-10"
                  value={form.contactNum}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border-gray-200 transition-all duration-300 bg-white/50 pl-10"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter your complete address"
                  className="w-full border-gray-200 transition-all duration-300 bg-white/50 pl-10"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full border-gray-200 transition-all duration-300 bg-white/50 pl-10 pr-10"
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
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
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
                    {passwordStrength < 2 &&
                      "Weak - Add more characters, numbers, and symbols"}
                    {passwordStrength === 2 &&
                      "Fair - Add special characters for better security"}
                    {passwordStrength === 3 && "Good - Almost there!"}
                    {passwordStrength === 4 && "Strong - Great password!"}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
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
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {confirmPassword && confirmPassword !== form.password && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Verification Info */}
            <div className="mt-4 p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-100/50 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 font-medium">
                  Verification Required
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  A request will be sent to the admin for verification. You'll
                  receive a confirmation message once your account is approved.
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">
                    Secure & Encrypted
                  </span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2c6e49] hover:bg-[#1f5234] text-white py-6 mt-2 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already a Member?{" "}
              <Link
                href="/login"
                className="text-[#2c6e49] hover:text-[#1f5234] font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
