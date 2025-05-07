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
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { getLocalizedUrl } from "@/utils/getLocalizedUrl";
import { Route } from "next";
import Alert from "@/shared/Alert";
import TestLogin from "./TestLogin";

export interface PageLoginProps {}

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

const PageLogin: FC<PageLoginProps> = ({}) => {
  const { login, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale as string;
  const redirectTo = searchParams?.get("redirect") || "/";

  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "Welcome@1",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    
    // Redirect to home or the original redirect URL if already authenticated
    if (isAuthenticated) {
      console.log("User already authenticated, redirecting to:", redirectTo);
      setRedirecting(true);
      
      // Use a short timeout to avoid immediate redirect
      // This helps with page transition animations
      setTimeout(() => {
        router.push(redirectTo as any);
      }, 100);
    }
  }, [isAuthenticated, redirectTo, router]);

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
    
    // Validate email
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      console.log('Attempting login with email:', formData.email);
      
      // Call the login function from AuthContext
      const result = await login({
        email: formData.email,
        password: formData.password,
      });
      
      if (result.success) {
        console.log('Login successful');
        // Show success message
        setSuccessMessage('Login successful! Redirecting...');
        
        // Clear form data
        setFormData({
          email: '',
          password: '',
        });
        
        // Get the redirect URL from query parameters or localStorage backup
        const urlParams = new URLSearchParams(window.location.search);
        let redirectUrl = urlParams.get('redirect') || '';
        
        // If no redirect in URL, check localStorage
        if (!redirectUrl) {
          const savedRedirect = localStorage.getItem('amr_redirect_after_login');
          if (savedRedirect) {
            console.log('Found saved redirect URL in localStorage:', savedRedirect);
            redirectUrl = savedRedirect;
            // Clear the saved redirect to prevent unwanted redirects in future
            localStorage.removeItem('amr_redirect_after_login');
          } else {
            // Default fallback
            redirectUrl = '/';
          }
        }
        
        console.log('Redirecting to:', redirectUrl);
        
        // Show success message briefly before redirecting
        setTimeout(() => {
          // Use router for navigation instead of window.location for better Next.js integration
          router.push(redirectUrl as any);
        }, 1500); // Increased timeout to ensure the message is visible
      } else {
        console.error('Login failed:', result.message);
        setErrorMessage(result.message || 'Login failed. Please check your credentials and try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMsg = 'Login failed. Please try again.';
      
      if (error.message) {
        errorMsg = error.message;
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`nc-PageLogin`}>
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
          Login
        </h2>
        <div className="max-w-md mx-auto space-y-6">
          {/* Show the redirect notice if a redirect parameter is present */}
          {redirectTo && redirectTo !== "/" && !redirecting && (
            <Alert className="mb-5">
              You'll be redirected back to your previous page after login.
            </Alert>
          )}

          {/* Redirecting Message */}
          {redirecting && (
            <Alert type="success" className="mb-5">
              Authentication successful! Redirecting you...
            </Alert>
          )}

          <div className="grid gap-3">
            {loginSocials.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex w-full rounded-lg bg-primary-50 dark:bg-neutral-800 px-4 py-3 transform transition-transform sm:px-6 hover:translate-y-[-2px]"
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
          
          {/* FORM - disable if redirecting */}
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Email
              </span>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className={`mt-1 ${validationErrors.email ? 'border-red-500' : ''}`}
                required
              />
              {validationErrors.email && (
                <span className="text-red-500 text-sm">{validationErrors.email}</span>
              )}
            </label>
            <label className="block">
              <span className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
                Password
                <Link href={getLocalizedUrl("/forgot-password", locale) as Route} className="text-sm underline font-medium">
                  Forgot password?
                </Link>
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
            <ButtonPrimary type="submit" disabled={isLoading || redirecting}>
              {isLoading ? "Logging in..." : redirecting ? "Redirecting..." : "Continue"}
            </ButtonPrimary>
          </form>

          {/* ==== */}
          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            New user? {` `}
            <Link href={getLocalizedUrl("/signup", locale) as Route} className="font-semibold underline">
              Create an account
            </Link>
          </span>
          
          {/* For development and testing only */}
          {process.env.NODE_ENV === 'development' && <TestLogin />}
        </div>
      </div>
    </div>
  );
};

export default PageLogin;

