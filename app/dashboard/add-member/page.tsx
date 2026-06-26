"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function AddMemberPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [role, setRole] = useState<"member" | "admin">("member");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
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
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter full name"
                  className="w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50 pl-10"
                  required
                />
              </div>
            </div>

            {/* CNIC */}
            <div>
              <label htmlFor="cnic" className="block text-sm font-medium text-gray-700 mb-1.5">
                CNIC Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="cnic"
                  type="text"
                  placeholder="XXXXX-XXXXXXX-X"
                  className="w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50 pl-10"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  className="w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50 pl-10"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
                Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter complete address"
                  className="w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50 pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50 pl-10 pr-10"
                  onChange={(e) => checkPasswordStrength(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className="w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] transition-all duration-300 bg-white/50 pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2c6e49] hover:bg-[#1f5234] text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
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