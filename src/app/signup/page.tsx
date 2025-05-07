"use client";

import React, { FC, useState, useEffect } from "react";
import facebookSvg from "@/images/Facebook.svg";
import twitterSvg from "@/images/Twitter.svg";
import googleSvg from "@/images/Google.svg";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { getLocalizedUrl } from "@/utils/getLocalizedUrl";
import { Route } from "next";
import Alert from "@/shared/Alert";
import TestRegistration from "./TestRegistration";

export interface PageSignUpProps {}

// Define the user registration interface based on the schema
export interface UserRegistration {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  is_verified?: boolean; // Backend will handle this
}

const loginSocials = [
  {
    name: "Continue with Facebook",
    href: "#",
    icon: facebookSvg,
  },
  {
    name: "Continue with Twitter",
    href: "#",
    icon: twitterSvg,
  },
  {
    name: "Continue with Google",
    href: "#",
    icon: googleSvg,
  },
];

const PageSignUp: FC<PageSignUpProps> = ({}) => {
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<UserRegistration>({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Clear validation errors when field is changed
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate email
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Validate first name
    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required";
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    // Validate confirm password
    if (formData.password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission handler called - preventing default");
    
    setErrorMessage(null);
    setSuccessMessage(null);
    
    // Validate form
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }
    
    console.log("Form validated, attempting registration with:", {
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
    });

    try {
      setSuccessMessage("Creating your account...");
      
      // Format the data for the registration API
      const registrationData = {
        name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        password: formData.password,
        confirmPassword: confirmPassword,
      };
      
      // Call the register function from auth context
      console.log("Calling register function...");
      await register(registrationData);
      
      // Show OTP verification form
      setShowOtpVerification(true);
      setSuccessMessage("Registration successful! Please verify your email with the OTP code sent to your email.");
      
    } catch (error: any) {
      console.error("Registration error:", error);
      setSuccessMessage(null);
      
      // Handle error response
      if (error.response?.data) {
        console.error("Server response data:", error.response.data);
        
        // Handle different error formats
        if (typeof error.response.data === 'object') {
          // Check if there are field-specific errors
          const fieldErrors: Record<string, string> = {};
          let hasFieldErrors = false;
          
          for (const [key, value] of Object.entries(error.response.data)) {
            if (key !== 'detail' && key !== 'message' && key !== 'error') {
              fieldErrors[key] = Array.isArray(value) ? value[0] : String(value);
              hasFieldErrors = true;
            }
          }
          
          if (hasFieldErrors) {
            setValidationErrors(fieldErrors);
            setErrorMessage("Please correct the errors below");
          } else if (error.response.data.detail || error.response.data.message || error.response.data.error) {
            setErrorMessage(
              error.response.data.detail || error.response.data.message || error.response.data.error
            );
          } else {
            setErrorMessage("Registration failed. Please try again.");
          }
        } else {
          setErrorMessage(String(error.response.data));
        }
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className={`nc-PageSignUp  `}>
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
          {showOtpVerification ? "Verify Your Email" : "Create an Account"}
        </h2>
        <div className="max-w-md mx-auto space-y-6 ">
          {/* Success Message */}
          {successMessage && (
            <Alert type="success" className="mb-5">
              {successMessage}
            </Alert>
          )}
          
          {/* Error Message */}
          {errorMessage && (
            <Alert type="error" className="mb-5">
              {errorMessage}
            </Alert>
          )}
          
          {showOtpVerification ? (
            // OTP Verification Form
            <OtpVerificationForm email={formData.email} onSuccess={() => router.push("/")} />
          ) : (
            <>
              <div className="grid gap-3">
                {loginSocials.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="nc-will-change-transform flex w-full rounded-lg bg-primary-50 dark:bg-neutral-800 px-4 py-3 transform transition-transform sm:px-6 hover:translate-y-[-2px]"
                  >
                    <Image
                      className="flex-shrink-0"
                      src={item.icon}
                      alt={item.name}
                    />
                    <h3 className="flex-grow text-center text-sm font-medium text-neutral-700 dark:text-neutral-300 sm:text-sm">
                      {item.name}
                    </h3>
                  </a>
                ))}
              </div>
              {/* OR */}
              <div className="relative text-center">
                <span className="relative z-10 inline-block px-4 font-medium text-sm bg-white dark:text-neutral-400 dark:bg-neutral-900">
                  OR
                </span>
                <div className="absolute left-0 w-full top-1/2 transform -translate-y-1/2 border border-neutral-100 dark:border-neutral-800"></div>
              </div>
              
              {/* REGISTRATION FORM */}
              <form 
                className="grid grid-cols-1 gap-6" 
                onSubmit={handleSubmit}
                method="post"
                action="#"
              >
                <label className="block">
                  <span className="text-neutral-800 dark:text-neutral-200">
                    Email address *
                  </span>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@example.com"
                    className={`mt-1 ${validationErrors.email ? 'border-red-500' : ''}`}
                    required
                  />
                  {validationErrors.email && (
                    <span className="text-red-500 text-sm">{validationErrors.email}</span>
                  )}
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-neutral-800 dark:text-neutral-200">
                      First name *
                    </span>
                    <Input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="John"
                      className={`mt-1 ${validationErrors.first_name ? 'border-red-500' : ''}`}
                      required
                    />
                    {validationErrors.first_name && (
                      <span className="text-red-500 text-sm">{validationErrors.first_name}</span>
                    )}
                  </label>
                  
                  <label className="block">
                    <span className="text-neutral-800 dark:text-neutral-200">
                      Last name
                    </span>
                    <Input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Doe"
                      className={`mt-1 ${validationErrors.last_name ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.last_name && (
                      <span className="text-red-500 text-sm">{validationErrors.last_name}</span>
                    )}
                  </label>
                </div>
                
                <label className="block">
                  <span className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
                    Password *
                  </span>
                  <Input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`mt-1 ${validationErrors.password ? 'border-red-500' : ''}`}
                    required
                  />
                  {validationErrors.password && (
                    <span className="text-red-500 text-sm">{validationErrors.password}</span>
                  )}
                </label>
                
                <label className="block">
                  <span className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
                    Confirm Password *
                  </span>
                  <Input 
                    type="password" 
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    className={`mt-1 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                    required
                  />
                  {validationErrors.confirmPassword && (
                    <span className="text-red-500 text-sm">{validationErrors.confirmPassword}</span>
                  )}
                </label>
                
                <ButtonPrimary 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </ButtonPrimary>
              </form>

              {/* Sign In Link */}
              <span className="block text-center text-neutral-700 dark:text-neutral-300">
                Already have an account? {` `}
                <Link href={getLocalizedUrl("/login", locale) as Route} className="font-semibold underline">
                  Sign in
                </Link>
              </span>
            </>
          )}
          
          {/* For development and testing only */}
          {process.env.NODE_ENV === 'development' && <TestRegistration />}
        </div>
      </div>
    </div>
  );
};

// OTP Verification Form Component
interface OtpVerificationProps {
  email: string;
  onSuccess: () => void;
}

const OtpVerificationForm: FC<OtpVerificationProps> = ({ email, onSuccess }) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60); // Countdown for resend button (60 seconds)
  const [isResending, setIsResending] = useState(false);
  
  // Use the auth context for OTP verification
  const { verifyOtp, resendOtp, isLoading } = useAuth();
  const router = useRouter();
  
  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(value);
    if (verificationError) {
      setVerificationError(null);
    }
  };
  
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      setVerificationError("Please enter the OTP code");
      return;
    }
    
    if (otp.length < 6) {
      setVerificationError("Please enter the complete 6-digit OTP code");
      return;
    }
    
    setIsVerifying(true);
    setVerificationError(null);
    
    try {
      // Call the OTP verification API using the context function
      await verifyOtp({ email, otp });
      
      // On success, redirect to home or dashboard
      setIsVerifying(false);
      onSuccess();
      
    } catch (error: any) {
      setIsVerifying(false);
      if (error.message.includes('Invalid OTP') || error.message.includes('expired')) {
        setVerificationError("Invalid or expired verification code. Please try again or request a new code.");
      } else {
        setVerificationError(error.message || "Failed to verify OTP. Please try again.");
      }
    }
  };
  
  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;
    
    setIsResending(true);
    try {
      // Call the resend OTP API using the context function
      await resendOtp(email);
      
      // Reset countdown
      setCountdown(60);
      setVerificationError(null);
    } catch (error: any) {
      setVerificationError(error.message || "Failed to resend verification code. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <form className="grid grid-cols-1 gap-6" onSubmit={handleVerifyOtp}>
      <div className="text-center mb-4">
        <p className="text-neutral-600 dark:text-neutral-300">
          We've sent a verification code to <span className="font-semibold">{email}</span>
        </p>
        <p className="text-sm text-neutral-500 mt-2">
          Enter the 6-digit code to verify your email address
        </p>
      </div>
      
      {verificationError && (
        <Alert type="error" className="mb-5">
          {verificationError}
        </Alert>
      )}
      
      <label className="block">
        <span className="text-neutral-800 dark:text-neutral-200">
          Verification Code
        </span>
        <Input
          type="text"
          name="otp"
          value={otp}
          onChange={handleOtpChange}
          placeholder="Enter the 6-digit code"
          className="mt-1 text-center text-xl tracking-widest"
          required
          maxLength={6}
          pattern="[0-9]*"
          inputMode="numeric"
        />
      </label>
      
      <ButtonPrimary 
        type="submit" 
        disabled={isVerifying}
      >
        {isVerifying ? "Verifying..." : "Verify Email"}
      </ButtonPrimary>
      
      <div className="text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Didn't receive the code?{" "}
          <button 
            type="button" 
            className={`${
              countdown > 0 || isResending 
                ? "text-neutral-400 cursor-not-allowed" 
                : "text-primary-600 hover:underline"
            }`}
            onClick={handleResendOtp}
            disabled={countdown > 0 || isResending}
          >
            {isResending 
              ? "Sending..." 
              : countdown > 0 
                ? `Resend in ${countdown}s` 
                : "Resend"
            }
          </button>
        </p>
      </div>
    </form>
  );
};

export default PageSignUp;
