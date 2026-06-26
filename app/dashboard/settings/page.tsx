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

// Dummy member data
const memberData = {
  id: "MEM-001",
  name: "Ahmed Khan",
  cnic: "35201-1234567-8",
  phone: "0300-1234567",
  email: "ahmed.khan@email.com",
  address: "123 Main Street, Lahore",
  joinDate: "2024-01-15",
  role: "Admin",
  status: "Active",
};

export default function SettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: memberData.name,
    cnic: memberData.cnic,
    phone: memberData.phone,
    email: memberData.email,
    address: memberData.address,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [id]: value }));
    if (id === "newPassword") {
      checkPasswordStrength(value);
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

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
    }, 1500);
  };

  const handlePasswordSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStrength(0);
    }, 1500);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: memberData.name,
      cnic: memberData.cnic,
      phone: memberData.phone,
      email: memberData.email,
      address: memberData.address,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#2c6e49]">Settings</h2>
        <p className="text-gray-500 text-sm mt-1">
          Manage your profile and account settings
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-green-100/50 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#2c6e49]/10 to-green-50/50 px-6 py-8 border-b border-green-100/50">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2c6e49] to-[#1f5234] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {getInitials(memberData.name)}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h3 className="text-xl font-semibold text-gray-800">
                  {memberData.name}
                </h3>
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  {memberData.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 justify-center sm:justify-start">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <UserCog className="w-3.5 h-3.5" />
                  {memberData.role}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {new Date(memberData.joinDate).toLocaleDateString()}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  {memberData.id}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#2c6e49] hover:bg-[#1f5234] text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  <label htmlFor="cnic" className="block text-sm font-medium text-gray-700 mb-1.5">
                    CNIC Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="cnic"
                      value={formData.cnic}
                      onChange={handleInputChange}
                      className="pl-10 border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10 border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 bg-[#2c6e49] hover:bg-[#1f5234] text-white"
                >
                  {isLoading ? (
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
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-medium">Full Name</label>
                  <p className="text-gray-800 font-medium flex items-center gap-2 mt-0.5">
                    <User className="w-4 h-4 text-gray-400" />
                    {memberData.name}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-medium">CNIC Number</label>
                  <p className="text-gray-800 flex items-center gap-2 mt-0.5">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    {memberData.cnic}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-medium">Phone Number</label>
                  <p className="text-gray-800 flex items-center gap-2 mt-0.5">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {memberData.phone}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-medium">Email Address</label>
                  <p className="text-gray-800 flex items-center gap-2 mt-0.5">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {memberData.email}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-medium">Address</label>
                  <p className="text-gray-800 flex items-center gap-2 mt-0.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {memberData.address}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-medium">Role</label>
                  <p className="text-gray-800 flex items-center gap-2 mt-0.5">
                    <Shield className="w-4 h-4 text-gray-400" />
                    {memberData.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div className="border-t border-green-100/50 p-6">
          {!showChangePassword ? (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Password</h4>
                <p className="text-xs text-gray-500">Last changed 30 days ago</p>
              </div>
              <Button
                onClick={() => setShowChangePassword(true)}
                variant="outline"
                className="border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49]/5"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Change Password</h4>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setPasswordStrength(0);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
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

                  {/* Password strength indicator */}
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
                  {passwordData.confirmPassword &&
                    passwordData.newPassword !== passwordData.confirmPassword && (
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
                    }}
                    className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePasswordSubmit}
                    disabled={
                      isLoading ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      passwordData.newPassword !== passwordData.confirmPassword
                    }
                    className="flex-1 bg-[#2c6e49] hover:bg-[#1f5234] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
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