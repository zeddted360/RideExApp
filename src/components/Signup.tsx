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
import { getUserPhone, storeUserPhone } from "@/utils/phoneStorage";
// LocalStorage keys for signup persistence
const SIGNUP_STEP_KEY = "signupStep";
const SIGNUP_PHONE_KEY = "signupPhone";
const SIGNUP_CODE_KEY = "signupCode";
import Link from "next/link";
import { SignupFormData, signupSchema } from "@/utils/authSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PhoneCollection from "./signup/PhoneCollection";
import PhoneVerification from "./signup/PhoneVerification";
import SignupForm from "./signup/SignupForm";
import { useAuth } from "@/context/authContext";

const Signup = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) router.push("/");
  }, [isAuthenticated]);

  const [step, setStep] = useState<"phone" | "verify" | "form">(() => {
    if (typeof window !== "undefined") {
      const phoneData = getUserPhone();
      if (phoneData && phoneData.verified) return "form";
      return (
        (localStorage.getItem(SIGNUP_STEP_KEY) as
          | "phone"
          | "verify"
          | "form") || "phone"
      );
    }
    return "phone";
  });
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (typeof window !== "undefined") {
      const phoneData = getUserPhone();
      if (phoneData && phoneData.verified) return phoneData.phoneNumber;
      return localStorage.getItem(SIGNUP_PHONE_KEY) || "";
    }
    return "";
  });
  const [phoneError, setPhoneError] = useState("");
  const [code, setCode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SIGNUP_CODE_KEY) || "";
    }
    return "";
  });
  const [codeError, setCodeError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Persist step, phoneNumber, and code to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const phoneData = getUserPhone();
      if (phoneData && phoneData.verified) {
        setPhoneNumber(phoneData.phoneNumber);
        setStep("form");
        localStorage.setItem(SIGNUP_STEP_KEY, "form");
        localStorage.setItem(SIGNUP_PHONE_KEY, phoneData.phoneNumber);
        localStorage.removeItem(SIGNUP_CODE_KEY);
        return;
      }
      localStorage.setItem(SIGNUP_STEP_KEY, step);
      localStorage.setItem(SIGNUP_PHONE_KEY, phoneNumber);
      localStorage.setItem(SIGNUP_CODE_KEY, code);
    }
  }, [step, phoneNumber, code]);

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
    if (typeof window !== "undefined") {
      localStorage.setItem(SIGNUP_PHONE_KEY, formattedPhone);
    }

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
        if (typeof window !== "undefined") {
          localStorage.setItem(SIGNUP_STEP_KEY, "verify");
        }
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
    if (typeof window !== "undefined") {
      localStorage.setItem(SIGNUP_CODE_KEY, code);
    }

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
        if (typeof window !== "undefined") {
          localStorage.setItem(SIGNUP_STEP_KEY, "form");
        }
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
        if (typeof window !== "undefined") {
          localStorage.setItem(SIGNUP_STEP_KEY, "verify");
        }
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

      // 2. Create user profile in users collection
      const { databaseId, userCollectionId } = validateEnv();
      await databases.createDocument(databaseId, userCollectionId, user.$id, {
        userId: user.$id,
        fullName: `${data.firstName} ${data.lastName}`,
        phone: phoneNumber,
      });
      // 3. Login the user to get the session
      const loginResult = await dispatch(
        loginAsync({
          email: data.email,
          password: data.password,
          rememberMe: true,
        })
      );
      if (loginAsync.fulfilled.match(loginResult)) {
        // 4. Update the phone number in Appwrite Auth
        try {
          await account.updatePhone(phoneNumber, data.password);
        } catch (err: any) {
          if (err?.code === 409) {
            toast.error(
              "This phone number is already in use. Please use a different number."
            );
          } else {
            toast.error(
              "Failed to update phone in Auth user, but continuing..."
            );
          }
          console.error("Failed to update phone in Auth user:", err);
        }

        // 5. Store phone in localStorage (optional, for legacy reasons)
        try {
          storeUserPhone(phoneNumber, true); // Mark as verified since user just signed up
        } catch (storageError) {
          // If localStorage fails, still create account but warn user
          console.warn("Failed to store phone number:", storageError);
        }

        toast.success("Account created successfully with phone number!");
        // Clear signup persistence after successful signup
        if (typeof window !== "undefined") {
          localStorage.removeItem(SIGNUP_STEP_KEY);
          localStorage.removeItem(SIGNUP_PHONE_KEY);
          localStorage.removeItem(SIGNUP_CODE_KEY);
        }
        router.push("/");
      }
    } catch (error) {
      console.error(
        `Signup failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-950 dark:to-gray-900">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white dark:bg-gray-900">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Create Account
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Join us and start ordering delicious food!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "phone" && (
            <PhoneCollection
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              phoneError={phoneError}
              setPhoneError={setPhoneError}
              isSendingCode={isSendingCode}
              handlePhoneSubmit={handlePhoneSubmit}
            />
          )}
          {step === "verify" && (
            <PhoneVerification
              code={code}
              setCode={setCode}
              codeError={codeError}
              setCodeError={setCodeError}
              isVerifyingCode={isVerifyingCode}
              handleCodeSubmit={handleCodeSubmit}
              handleResendCode={handleResendCode}
              isSendingCode={isSendingCode}
              resendCountdown={resendCountdown}
            />
          )}
          {step === "form" && (
            <SignupForm
              signupForm={signupForm}
              handleSignupSubmit={handleSignupSubmit}
              phoneNumber={phoneNumber}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              error={error || ""}
              loading={loading}
              isSigningUp={isSigningUp}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
