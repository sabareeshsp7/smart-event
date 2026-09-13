"use client";
/**
 * User Profile Hook — stores and manages attendee Name and Phone number in localStorage.
 * Automatically synchronizes identity across ticket claims, emergency SOS, and chat.
 */

import { useState, useEffect } from "react";

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  company?: string;
  role?: string;
}

const STORAGE_KEY = "eventiq_attendee_profile";

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  phone: "",
  email: "",
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UserProfile>;
        setProfile({
          name: parsed.name ?? "",
          phone: parsed.phone ?? "",
          email: parsed.email ?? "",
          company: parsed.company ?? "",
          role: parsed.role ?? "",
        });
      }
    } catch {
      /* ignore storage read errors */
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProfile = (newProfile: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated: UserProfile = {
        ...prev,
        ...newProfile,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        /* ignore storage write errors */
      }
      return updated;
    });
  };

  const clearProfile = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setProfile(DEFAULT_PROFILE);
  };

  return {
    profile,
    isLoaded,
    hasProfile: Boolean(profile.name.trim() && profile.phone.trim()),
    saveProfile,
    clearProfile,
  };
}
