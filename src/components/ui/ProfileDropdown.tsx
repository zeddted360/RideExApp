"use client";
import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Edit, 
  Check, 
  Loader2,
  Shield,
  Smartphone,
  Settings,
  LogOut,
  UserCircle
} from "lucide-react";
import { useAuth } from "@/context/authContext";
import { account } from "@/utils/appwrite";
import { storeUserPhone, getUserPhone } from "@/utils/phoneStorage";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/state/store";
import { logoutAsync } from "@/state/authSlice";
import { useRouter } from "next/navigation";

interface ProfileDropdownProps {
  children: React.ReactNode;
}

interface UpdateFormData {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileDropdown = ({ children }: ProfileDropdownProps) => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateFormData>({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Safety check to ensure we don't render objects
  const safeUser = user
    ? {
        name: typeof user?.username === "string" ? user.username : "",
        email: typeof user?.email === "string" ? user.email : "",
        phoneNumber:
          typeof user?.phoneNumber === "string" ? user.phoneNumber : "",
        phoneVerified:
          typeof user?.phoneVerified === "boolean" ? user.phoneVerified : false,
        userId: user?.userId || user?.userId || "",
        existingUserData: (user as any)?.existingUserData || null,
        isGuest: (user as any)?.isGuest || false,
      }
    : null;

  // Check if user is a guest
  const isGuestUser = safeUser?.email?.includes('@guest.com') || safeUser?.userId?.startsWith('guest_');
  
  // Check if guest user has existing account data
  const hasExistingAccount = safeUser?.existingUserData || (isGuestUser && safeUser?.phoneNumber);

  // Load user data on mount
  useEffect(() => {
    if (user && isAuthenticated) {
      const userPhoneData = getUserPhone();
      const userPhone = userPhoneData?.phoneNumber || user.phoneNumber || "";
      setFormData({
        name: user.username || "",
        email: user.email || "",
        phone: userPhone,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user, isAuthenticated]);

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleInputChange = (field: keyof UpdateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startEditing = (field: string) => {
    setEditingField(field);
    setShowEditDialog(true);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setShowEditDialog(false);
    // Reset form data to original values
    if (user) {
      const userPhoneData = getUserPhone();
      const userPhone = userPhoneData?.phoneNumber || user.phoneNumber || "";
      setFormData((prev) => ({
        ...prev,
        name: user.username || "",
        email: user.email || "",
        phone: userPhone,
      }));
    }
  };

  const handleUpdateName = async () => {
    if (!formData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      await account.updateName(formData.name);
      if (safeUser) {
        updateUser({ ...safeUser, name: formData.name });
      }
      toast.success("Name updated successfully!");
      setEditingField(null);
      setShowEditDialog(false);
    } catch (error) {
      toast.error("Failed to update name");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!formData.email.trim()) {
      toast.error("Email cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      // hardcode for now
      await account.updateEmail(formData.email, formData.currentPassword);
      toast.success(
        "Email update initiated. Please check your email for verification."
      );
      setEditingField(null);
      setShowEditDialog(false);
    } catch (error) {
      toast.error("Failed to update email");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!formData.phone.trim()) {
      toast.error("Phone number cannot be empty");
      return;
    }

    // Format phone number
    let formattedPhone = formData.phone.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+234" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("234")) {
      formattedPhone = "+" + formattedPhone;
    } else if (!formattedPhone.startsWith("+234")) {
      formattedPhone = "+234" + formattedPhone;
    }

    const regex = /^\+234\d{10}$/;
    if (!regex.test(formattedPhone)) {
      toast.error("Please enter a valid Nigerian phone number");
      return;
    }

    setIsUpdating(true);
    try {
      // Send verification code
      const response = await fetch("/api/phone-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          action: "send",
        }),
      });

      const result = await response.json();
      if (result.success) {
        setFormData((prev) => ({ ...prev, phone: formattedPhone }));
        setShowPhoneVerification(true);
        setResendCountdown(60);
        setShowEditDialog(false);
        toast.success("Verification code sent!");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to send verification code");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifyingCode(true);
    try {
      const response = await fetch("/api/phone-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: formData.phone,
          action: "verify",
          code: verificationCode,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Store the new phone number
        if (safeUser?.userId) {
          storeUserPhone(formData.phone, true); // Mark as verified since it was just verified
        }

        // Update user in auth context
        if (safeUser) {
          updateUser({
            ...safeUser,
            phoneNumber: formData.phone,
            phoneVerified: true,
          });
        }

        toast.success("Phone number updated successfully!");
        setShowPhoneVerification(false);
        setEditingField(null);
        setVerificationCode("");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to verify code");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;

    setIsSendingCode(true);
    try {
      const response = await fetch("/api/phone-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: formData.phone,
          action: "send",
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Verification code resent!");
        setResendCountdown(60);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to resend code");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsUpdating(true);
    try {
      await account.updatePassword(formData.newPassword);
      toast.success("Password updated successfully!");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setEditingField(null);
      setShowEditDialog(false);
    } catch (error) {
      toast.error("Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      toast.success("Logged out successfully!");
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleCreateAccount = () => {
    router.push("/signup");
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-0" align="end">
          {/* Profile Header */}
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {isGuestUser && hasExistingAccount
                      ? safeUser?.existingUserData?.name || safeUser?.name
                      : safeUser?.name || "User"}
                  </h3>
                  {isGuestUser && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      Guest
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isGuestUser && hasExistingAccount
                    ? "Guest session - existing account"
                    : safeUser?.email || "No email"}
                </p>
                {safeUser?.phoneNumber && (
                  <div className="flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {safeUser.phoneNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Actions */}
          <div className="p-2">
            {isGuestUser ? (
              <DropdownMenuItem
                onClick={handleCreateAccount}
                className="flex items-center gap-3 p-3 cursor-pointer"
              >
                <UserCircle className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <div className="font-medium">Create Account</div>
                  <div className="text-sm text-gray-500">
                    Sign up for a new account
                  </div>
                </div>
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem
                  onClick={() => startEditing("name")}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="font-medium">Edit Name</div>
                    <div className="text-sm text-gray-500">
                      {safeUser?.name || "Not set"}
                    </div>
                  </div>
                  <Edit className="w-4 h-4 text-gray-400" />
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => startEditing("email")}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="font-medium">Edit Email</div>
                    <div className="text-sm text-gray-500">
                      {safeUser?.email || "Not set"}
                    </div>
                  </div>
                  <Edit className="w-4 h-4 text-gray-400" />
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => startEditing("phone")}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="font-medium">Edit Phone</div>
                    <div className="text-sm text-gray-500">
                      {safeUser?.phoneNumber || "Not set"}
                    </div>
                  </div>
                  <Edit className="w-4 h-4 text-gray-400" />
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => startEditing("password")}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="font-medium">Change Password</div>
                    <div className="text-sm text-gray-500">
                      Update your password
                    </div>
                  </div>
                  <Edit className="w-4 h-4 text-gray-400" />
                </DropdownMenuItem>
              </>
            )}

            {/* My Orders and Addresses */}

            <DropdownMenuItem
              onClick={() => router.push("/myorders")}
              className="flex items-center gap-3 p-3 cursor-pointer"
            >
              <UserCircle className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <div className="font-medium">My Orders</div>
                <div className="text-sm text-gray-500">
                  View your order history
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/address")}
              className="flex items-center gap-3 p-3 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <div className="font-medium">My Addresses</div>
                <div className="text-sm text-gray-500">
                  Manage your delivery addresses
                </div>
              </div>
            </DropdownMenuItem>

            {user?.isAdmin && (
              <DropdownMenuItem
                onClick={() => router.push("/admin/orders")}
                className="flex items-center gap-3 p-3 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <div className="font-medium">Admin Dashboard</div>
                  <div className="text-sm text-gray-500">
                    Manage orders and system
                  </div>
                </div>
              </DropdownMenuItem>
            )}
          </div>

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 cursor-pointer text-red-600 hover:text-red-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingField === "name" && <User className="w-5 h-5" />}
              {editingField === "email" && <Mail className="w-5 h-5" />}
              {editingField === "phone" && <Phone className="w-5 h-5" />}
              {editingField === "password" && <Lock className="w-5 h-5" />}
              Edit{" "}
              {/* {editingField?.charAt(0).toUpperCase() + editingField?.slice(1)} */}
            </DialogTitle>
            <DialogDescription>
              Update your {editingField} information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {editingField === "name" && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {editingField === "email" && (
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            )}

            {editingField === "phone" && (
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+2348012345678"
                />
              </div>
            )}

            {editingField === "password" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={cancelEditing}>
              Cancel
            </Button>
            <Button
              onClick={
                editingField === "name"
                  ? handleUpdateName
                  : editingField === "email"
                  ? handleUpdateEmail
                  : editingField === "phone"
                  ? handleUpdatePhone
                  : editingField === "password"
                  ? handleUpdatePassword
                  : () => {}
              }
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phone Verification Dialog */}
      <Dialog
        open={showPhoneVerification}
        onOpenChange={setShowPhoneVerification}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Verify Phone Number
            </DialogTitle>
            <DialogDescription>
              Enter the 6-digit verification code sent to {formData.phone}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="Enter 6-digit code"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleVerifyPhoneCode}
                disabled={isVerifyingCode || verificationCode.length !== 6}
                className="flex-1"
              >
                {isVerifyingCode ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Verify
              </Button>
              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={isSendingCode || resendCountdown > 0}
              >
                {isSendingCode ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : resendCountdown > 0 ? (
                  `${resendCountdown}s`
                ) : (
                  "Resend"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileDropdown; 