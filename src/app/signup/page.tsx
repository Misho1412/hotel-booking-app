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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear validation errors when field is changed
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate name
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    // Validate email
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    // Phone number validation (optional)
    if (formData.phoneNumber && !/^\+?[0-9]{10,15}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Ensure this runs immediately to prevent default form submission
    console.log("Form submission handler called - preventing default");
    
    setErrorMessage(null);
    setSuccessMessage(null);
    
    // Validate form
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }
    
    console.log("Attempting to register with data:", {
      name: formData.name,
      email: formData.email,
      passwordLength: formData.password.length,
      phoneNumber: formData.phoneNumber || "(not provided)",
    });

    try {
      setSuccessMessage("Creating your account...");
      
      // Call the register function from auth context
      console.log("Calling register function...");
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber,
      });
      
      console.log("Registration successful, redirecting...");
      // Redirect to homepage or dashboard after successful registration
      router.push("/");
    } catch (error: any) {
      console.error("Registration error:", error);
      setSuccessMessage(null);
      
      // Extract and display the error message
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
          Signup
        </h2>
        <div className="max-w-md mx-auto space-y-6 ">
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
          
          {/* FORM */}
          <form 
            className="grid grid-cols-1 gap-6" 
            onSubmit={handleSubmit}
            method="post"
            action="#"
          >
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Username
              </span>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="johndoe"
                className={`mt-1 ${validationErrors.name ? 'border-red-500' : ''}`}
                required
              />
              {validationErrors.name && (
                <span className="text-red-500 text-sm">{validationErrors.name}</span>
              )}
            </label>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Email address
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
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Phone number (optional)
              </span>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+1234567890"
                className={`mt-1 ${validationErrors.phoneNumber ? 'border-red-500' : ''}`}
              />
              {validationErrors.phoneNumber && (
                <span className="text-red-500 text-sm">{validationErrors.phoneNumber}</span>
              )}
            </label>
            <label className="block">
              <span className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
                Password
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
                Confirm Password
              </span>
              <Input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
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
              onClick={(e) => {
                console.log("Button clicked");
                // Don't put submission logic here, just log that button was clicked
              }}
            >
              {isLoading ? "Creating account..." : "Continue"}
            </ButtonPrimary>
          </form>

          {/* ==== */}
          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            Already have an account? {` `}
            <Link href={getLocalizedUrl("/login", locale) as Route} className="font-semibold underline">
              Sign in
            </Link>
          </span>
          
          {/* For development and testing only */}
          {process.env.NODE_ENV === 'development' && <TestRegistration />}
        </div>
      </div>
    </div>
  );
};

export default PageSignUp;
