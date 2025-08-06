import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setTokenState] = useState<string | null>(null);

  // Load token from localStorage on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("access_token");
      if (stored) {
        setTokenState(stored);
      }
    } catch (e) {
      console.warn("Failed to read access token from localStorage", e);
    }
  }, []);

  const setToken = (newToken: string | null) => {
    if (typeof window !== "undefined") {
      try {
        if (newToken) {
          window.localStorage.setItem("access_token", newToken);
        } else {
          window.localStorage.removeItem("access_token");
        }
      } catch (e) {
        console.warn("Failed to write access token to localStorage", e);
      }
    }
    setTokenState(newToken);
  };

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

