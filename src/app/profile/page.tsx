"use client";

import React, { FC, useState, useEffect } from "react";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { UserRequest } from "@/lib/api/services";

export interface PageProfileProps {}

const PageProfile: FC<PageProfileProps> = () => {
  const { user, isAuthenticated, isLoading, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<UserRequest>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Populate form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsUpdating(true);

    try {
      await updateProfile(formData);
      setSuccessMessage("Profile updated successfully");
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsUpdating(false);
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="nc-PageProfile">
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
          Profile
        </h2>
        <div className="max-w-md mx-auto space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="text-green-600 dark:text-green-400 text-center bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              {successMessage}
            </div>
          )}
          
          {/* Error Message */}
          {errorMessage && (
            <div className="text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              {errorMessage}
            </div>
          )}
          
          {/* FORM */}
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-neutral-800 dark:text-neutral-200">
                  First name
                </span>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1"
                />
              </label>
              <label className="block">
                <span className="text-neutral-800 dark:text-neutral-200">
                  Last name
                </span>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Email address
              </span>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </label>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Phone number
              </span>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1"
              />
            </label>
            <div className="flex justify-between">
              <ButtonPrimary type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Profile"}
              </ButtonPrimary>
              <button
                type="button"
                onClick={handleLogout}
                className="nc-Button relative h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium px-4 py-3 sm:px-6 text-red-700 dark:text-red-400 border border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PageProfile;