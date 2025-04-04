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
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
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
    
    // Validate username
    if (!formData.username.trim()) {
      errors.username = "Username is required";
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
    setErrorMessage(null);
    setSuccessMessage(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    console.log("Attempting to login with:", {
      username: formData.username,
      passwordLength: formData.password.length,
    });

    try {
      setSuccessMessage("Logging in...");
      
      // Use direct fetch approach that works in TestLogin component
      const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || 'https://amrbooking.onrender.com/api';
      const fullURL = `${baseURL}/token/`;
      
      console.log("Login URL:", fullURL);
      
      // Make sure we're using the exact content type as expected by the API
      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });
      
      console.log("Login response status:", response.status);
      
      // Get the response body regardless of status
      const responseBody = await response.text();
      console.log("Response body:", responseBody);
      
      // Try to parse it as JSON if possible
      let jsonData;
      try {
        jsonData = JSON.parse(responseBody);
      } catch (e) {
        jsonData = { rawResponse: responseBody };
      }
      
      if (!response.ok) {
        console.error("Login failed:", jsonData);
        throw new Error(jsonData.detail || jsonData.non_field_errors?.join(', ') || JSON.stringify(jsonData));
      }
      
      console.log("Login successful:", jsonData);
      
      // Store token in localStorage
      if (jsonData.token) {
        localStorage.setItem('amr_auth_token', jsonData.token);
        console.log('Token stored in localStorage');
        
        // Set the token in the API client headers for all subsequent requests
        // Import axios and set the default Authorization header
        const axios = (await import('axios')).default;
        axios.defaults.headers.common['Authorization'] = `Token ${jsonData.token}`;
        
        // Also import the apiClient specifically to set its authorization header
        const apiClient = (await import('@/lib/api/apiConfig')).default;
        apiClient.defaults.headers.common['Authorization'] = `Token ${jsonData.token}`;
        console.log('Token set in API client headers with "Token" prefix');
      }
      
      console.log("Login successful, redirecting...");
      // Redirect to homepage or dashboard after successful login
      router.push("/");
    } catch (error: any) {
      console.error("Login error:", error);
      setSuccessMessage(null);
      
      setErrorMessage(error.message || "Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className={`nc-PageLogin`}>
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
          Login
        </h2>
        <div className="max-w-md mx-auto space-y-6">
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
          
          {/* FORM */}
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Username
              </span>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="your.username"
                className={`mt-1 ${validationErrors.username ? 'border-red-500' : ''}`}
                required
              />
              {validationErrors.username && (
                <span className="text-red-500 text-sm">{validationErrors.username}</span>
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
            <ButtonPrimary type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Continue"}
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

