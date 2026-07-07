// AuthContext.js
// Wraps mockApi's (or the real api.js's — see src/store/api.js) auth
// functions with session persistence, mirroring the admin panel's
// lib/auth.tsx pattern: a logged-in flag + user profile kept in AsyncStorage
// so a killed-and-reopened app resumes the same session.
//
// Session token storage itself now lives in mockApi/api's module (login/
// register/verifyOtp already persist the token(s) there) — this file only
// asks "is there a session?" via hasSession()/clearSession(), rather than
// owning a storage key directly. That's what lets this same file work
// against either the mock (single fake token) or the real api.js (a real
// access+refresh JWT pair) without caring which one is wired in.

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import mockApi, { hasSession, clearSession } from "../store/api";

const KYC_SEEN_KEY = "zoro_onboarding_seen";

const AuthContext = createContext({
  isLoading: true,
  isAuthenticated: false,
  hasSeenOnboarding: false,
  user: null,
  pendingMobile: null,
  login: async () => {},
  loginWithOtp: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  finishOnboarding: async () => {},
  setPendingMobile: () => {},
});

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [user, setUser] = useState(null);
  const [pendingMobile, setPendingMobile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [authed, seen] = await Promise.all([hasSession(), AsyncStorage.getItem(KYC_SEEN_KEY)]);
        setHasSeenOnboarding(seen === "true");
        if (authed) {
          const profile = await mockApi.getProfile();
          setUser(profile);
          setIsAuthenticated(true);
        }
      } catch (e) {
        // corrupt/missing session, or the stored token is no longer valid — fall back to logged out
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await mockApi.getProfile();
    setUser(profile);
    return profile;
  }, []);

  // login/loginWithOtp/registerProfile all persist their own token(s)
  // internally (see mockApi.js/api.js) — this context just reacts to that by
  // fetching the profile and flipping isAuthenticated, it doesn't touch
  // storage itself.
  const login = useCallback(async (email, password) => {
    const res = await mockApi.loginWithPassword(email, password);
    const profile = await mockApi.getProfile();
    setUser(profile);
    setIsAuthenticated(true);
    return res;
  }, []);

  const loginWithOtp = useCallback(async (mobile, otp, mode) => {
    const res = await mockApi.verifyOtp(mobile, otp, mode);
    if (mode === "login") {
      const profile = await mockApi.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
    }
    // mode === "register": a session token now exists (verifyOtp persisted
    // it) but isAuthenticated stays false until ProfileSetupScreen's
    // register() below finishes — the navigator keeps showing the
    // unauthenticated group (ProfileSetup -> TransactionPin) until then.
    return res;
  }, []);

  const register = useCallback(async (profile) => {
    const res = await mockApi.registerProfile(profile);
    const full = await mockApi.getProfile();
    setUser(full);
    setIsAuthenticated(true);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await mockApi.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const finishOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(KYC_SEEN_KEY, "true");
    setHasSeenOnboarding(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        hasSeenOnboarding,
        user,
        pendingMobile,
        setPendingMobile,
        login,
        loginWithOtp,
        register,
        logout,
        refreshProfile,
        finishOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
