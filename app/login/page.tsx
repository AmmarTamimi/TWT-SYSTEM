"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Eye,
  EyeOff,
  LogIn,
  Lock,
  CreditCard,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCode(null);

    if (!identifier.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError("Login failed. Please try again.");
        setErrorCode(data.code || null);
        return;
      }

      // Success → route based on role
      router.push(data.redirectTo || "/dashboard");
      router.refresh(); // ensures the session cookie is picked up by server components
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-green-50/30 flex items-center justify-center px-4 py-12">
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
              <LogIn className="w-8 h-8 text-[#2c6e49]" />
            </div>
            <h1 className="text-2xl font-bold text-[#2c6e49]">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className={`mb-5 p-4 rounded-xl flex items-start gap-3 border ${
                errorCode === "NOT_VERIFIED"
                  ? "bg-amber-50 border-amber-200"
                  : errorCode === "DISABLED"
                  ? "bg-red-50 border-red-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {errorCode === "NOT_VERIFIED" ? (
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    errorCode === "NOT_VERIFIED"
                      ? "text-amber-800"
                      : "text-red-800"
                  }`}
                >
                  {errorCode === "NOT_VERIFIED"
                    ? "Verification Pending"
                    : errorCode === "DISABLED"
                    ? "Account Disabled"
                    : "Sign In Failed"}
                </p>
                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    errorCode === "NOT_VERIFIED"
                      ? "text-amber-700"
                      : "text-red-700"
                  }`}
                >
                  {error}
                </p>
                {errorCode === "NOT_VERIFIED" && (
                  <p className="text-xs mt-2 text-amber-700">
                    Need help?{" "}
                    <a
                      href="mailto:admin@yourapp.com"
                      className="font-semibold underline"
                    >
                      Contact admin
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* CNIC / Phone */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                CNIC
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="35202-1234567-1"
                  className="w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50 pl-10"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) {
                      setError(null);
                      setErrorCode(null);
                    }
                  }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50 pl-10 pr-10"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) {
                      setError(null);
                      setErrorCode(null);
                    }
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
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#2c6e49] focus:ring-[#2c6e49]"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-[#2c6e49] hover:text-[#1f5234] font-medium transition-colors"
              >
                Forgot password?
              </Link>
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
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Want to become a Member?{" "}
              <Link
                href="/register"
                className="text-[#2c6e49] hover:text-[#1f5234] font-semibold transition-colors"
              >
                Become a member
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}