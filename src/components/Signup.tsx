"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { loginAsync, clearError } from "@/state/authSlice";
import { RootState, AppDispatch } from "@/state/store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { account, databases, validateEnv } from "@/utils/appwrite";
import { storeUserPhone } from "@/utils/phoneStorage";
import Link from "next/link";
import { SignupFormData, signupSchema } from "@/utils/authSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const [step, setStep] = useState<"phone" | "verify" | "form">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Handle phone number submission
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");
    setIsSendingCode(true);

    // Validate phone number format
    let formattedPhone = phoneNumber.trim();

    // Handle different input formats
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+234" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("234")) {
      formattedPhone = "+" + formattedPhone;
    } else if (!formattedPhone.startsWith("+234")) {
      formattedPhone = "+234" + formattedPhone;
    }

    const regex = /^\+234\d{10}$/;
    if (!regex.test(formattedPhone)) {
      setPhoneError(
        "Please enter a valid Nigerian phone number (e.g., +2348012345678 or 08012345678)"
      );
      setIsSendingCode(false);
      return;
    }

    // Update the phone number with the formatted version
    setPhoneNumber(formattedPhone);

    // Send verification code
    try {
      const response = await fetch("/api/phone-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          action: "send",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setStep("verify");
        setResendCountdown(60); // 60 seconds countdown
      } else {
        setPhoneError(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send verification code";
      setPhoneError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSendingCode(false);
    }
  };

  // Handle verification code submission
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError("");
    setIsVerifyingCode(true);

    if (!code || code.length !== 6) {
      setCodeError("Please enter a valid 6-digit code");
      setIsVerifyingCode(false);
      return;
    }

    // Verify the code
    try {
      const response = await fetch("/api/phone-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          action: "verify",
          code: code,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setStep("form");
      } else {
        setCodeError(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to verify code";
      setCodeError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (resendCountdown > 0) return;

    setIsSendingCode(true);
    try {
      const response = await fetch("/api/phone-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          action: "send",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Verification code resent successfully!");
        setResendCountdown(60);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsSendingCode(false);
    }
  };

  // Signup form
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const handleSignupSubmit = async (data: SignupFormData) => {
    dispatch(clearError());
    setIsSigningUp(true);
    try {
      // 1. Create the user account
      const user = await account.create(
        "unique()",
        data.email,
        data.password,
        `${data.firstName} ${data.lastName}`
      );

      // 2. Login the user to get the session
      const loginResult = await dispatch(
        loginAsync({
          email: data.email,
          password: data.password,
          rememberMe: true,
        })
      );

      if (loginAsync.fulfilled.match(loginResult)) {
        // 3. Update the phone number in Appwrite Auth
        try {
          await account.updatePhone(phoneNumber, data.password);
        } catch (err) {
          toast.error("Failed to update phone in Auth user, but continuing...");
        }

        // 4. Create user profile in users collection
        try {
          const { databaseId, userCollectionId } = validateEnv();
          await databases.createDocument(
            databaseId,
            userCollectionId,
            user.$id, // Use Auth userId as document ID
            {
              userId: user.$id,
              fullName: `${data.firstName} ${data.lastName}`,
              address: "", // You can collect this in a later step
              phone: phoneNumber,
            }
          );
        } catch (profileErr) {
          toast.error("Failed to create user profile, but account is created.");
        }

        // 5. Store phone in localStorage (optional, for legacy reasons)
        try {
          storeUserPhone(phoneNumber, user.$id);
        } catch (storageError) {
          // If localStorage fails, still create account but warn user
          console.warn("Failed to store phone number:", storageError);
        }

        toast.success("Account created successfully with phone number!");
        router.push("/");
      }
    } catch (error) {
      toast.error(
        `Signup failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Create Account
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Join us and start ordering delicious food!
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Full Name
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter first name"
                  {...signupForm.register("firstName")}
                  className="h-12"
                />
                {signupForm.formState.errors.firstName && (
                  <p className="text-sm text-red-500">
                    {signupForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter last name"
                  {...signupForm.register("lastName")}
                  className="h-12"
                />
                {signupForm.formState.errors.lastName && (
                  <p className="text-sm text-red-500">
                    {signupForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+2348012345678 or 08012345678"
              className="h-12"
              required
            />
            {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
          </div>
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
              {...signupForm.register("email")}
              className="h-12"
            />
            {signupForm.formState.errors.email && (
              <p className="text-sm text-red-500">
                {signupForm.formState.errors.email.message}
              </p>
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
              placeholder="Create a password"
              {...signupForm.register("password")}
              className="h-12"
            />
            {signupForm.formState.errors.password && (
              <p className="text-sm text-red-500">
                {signupForm.formState.errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...signupForm.register("confirmPassword")}
              className="h-12"
            />
            {signupForm.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {signupForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <Button
            type="submit"
            disabled={loading === "pending" || isSigningUp}
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold transition-all duration-200"
          >
            {loading === "pending" || isSigningUp ? (
              <>
                {loading === "pending" ? (
                  "Creating Account..."
                ) : (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                )}
              </>
            ) : (
              "Create Account"
            )}
          </Button>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
