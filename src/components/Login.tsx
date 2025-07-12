"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { loginAsync, loginAsGuestAsync, clearError } from "@/state/authSlice";
import { RootState, AppDispatch } from "@/state/store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { account, databases, validateEnv } from "@/utils/appwrite";
import { LoginFormData, loginSchema } from "@/utils/authSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { User, UserCircle, Phone, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ID, Query } from "appwrite";

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [existingUser, setExistingUser] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    dispatch(clearError());
    const result = await dispatch(loginAsync(data));
    if (loginAsync.fulfilled.match(result)) {
      toast.success("Login successful!");
      router.push("/");
    }
  };

  const handleGuestLogin = () => {
    setShowPhoneModal(true);
  };

  const checkPhoneInAppwrite = async (phone: string) => {
    try {
      const { databaseId, userCollectionId } = validateEnv();

      // Format phone number
      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+234" + formattedPhone.slice(1);
      } else if (formattedPhone.startsWith("234")) {
        formattedPhone = "+" + formattedPhone;
      } else if (!formattedPhone.startsWith("+234")) {
        formattedPhone = "+234" + formattedPhone;
      }

      // Search for user with this phone number
      const response = await databases.listDocuments(
        databaseId,
        userCollectionId,
        [Query.equal("phoneNumber", formattedPhone)]
      );

      if (response.documents.length > 0) {
        return response.documents[0];
      }
      return null;
    } catch (error) {
      console.error("Error checking phone:", error);
      return null;
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    // Validate phone number format
    let formattedPhone = phoneNumber.trim();
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

    setIsCheckingPhone(true);
    try {
      // Check if phone exists in Appwrite
      const existingUserData = await checkPhoneInAppwrite(formattedPhone);

      if (existingUserData) {
        // User exists - show their name but still create guest session
        setExistingUser(existingUserData);
        toast.success(
          `Welcome back, ${existingUserData.name || existingUserData.username}!`
        );
      } else {
        // New guest user
        setExistingUser(null);
        toast.success("Welcome! You're browsing as a guest.");
      }

      // Create guest user with phone number
      const guestUser = {
        userId: `guest_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        username:
          existingUserData?.name || existingUserData?.username || "Guest User",
        email: `guest_${Date.now()}@guest.com`,
        role: "user",
        phoneNumber: formattedPhone,
        phoneVerified: false,
        isGuest: true,
        existingUserData: existingUserData
          ? {
              name: existingUserData.name,
              username: existingUserData.username,
              email: existingUserData.email,
            }
          : null,
      };

      // Store in localStorage
      localStorage.setItem("guestUserData", JSON.stringify(guestUser));

      // Dispatch guest login
      const result = await dispatch(loginAsGuestAsync());
      if (loginAsGuestAsync.fulfilled.match(result)) {
        setShowPhoneModal(false);
        setPhoneNumber("");
        router.push("/");
      }
    } catch (error) {
      toast.error("Failed to create guest session");
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = watch("email");
    if (!email) {
      toast.error("Please enter your email to reset password");
      return;
    }
    try {
      await account.createRecovery(
        email,
        "http://localhost:3000/reset-password"
      );
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error(
        `Failed to send reset link: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Welcome Back
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Sign in to your account to continue
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className="h-12"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className="h-12"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={watch("rememberMe")}
                    onCheckedChange={(checked) =>
                      setValue("rememberMe", checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading === "pending"}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold transition-all duration-200"
              >
                {loading === "pending" ? "Signing in..." : "Sign In"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGuestLogin}
                disabled={loading === "pending"}
                variant="outline"
                className="w-full h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200"
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Continue as Guest
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phone Number Modal */}
      <Dialog open={showPhoneModal} onOpenChange={setShowPhoneModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Quick Guest Access
            </DialogTitle>
            <DialogDescription>
              Enter your phone number to continue as a guest. We'll remember you
              for future visits.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+2348012345678"
                className="h-12"
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll check if you have an existing account
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePhoneSubmit}
                disabled={isCheckingPhone || !phoneNumber.trim()}
                className="flex-1"
              >
                {isCheckingPhone ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Checking...
                  </>
                ) : (
                  "Continue as Guest"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPhoneModal(false)}
                disabled={isCheckingPhone}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Login;
