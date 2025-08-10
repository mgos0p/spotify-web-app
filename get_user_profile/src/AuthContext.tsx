import React, { createContext, useContext, useEffect, useState } from "react";
import { refreshAccessToken } from "./authCodeWithPkce";

interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  setToken: (
    token: string | null,
    refreshToken?: string | null,
    expiresIn?: number
  ) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  // 初回マウント時に localStorage からトークンを読み込む
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("access_token");
      const storedRefresh = window.localStorage.getItem("refresh_token");
      const storedExpires = window.localStorage.getItem("expires_at");
      if (stored) {
        setTokenState(stored);
      }
      if (storedRefresh) {
        setRefreshTokenState(storedRefresh);
      }
      if (storedExpires) {
        setExpiresAt(parseInt(storedExpires, 10));
      }
    } catch (e) {
      console.warn("Failed to read access token from localStorage", e);
    }
  }, []);

  // アクセストークンの有効期限が切れる前に自動更新する
  useEffect(() => {
    if (!token || !refreshToken || !expiresAt) return;
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    if (!clientId) return;
    const timeout = setTimeout(async () => {
      try {
        const data = await refreshAccessToken(clientId, refreshToken);
        if (data?.access_token && data?.expires_in) {
          setToken(data.access_token, refreshToken, data.expires_in);
        }
      } catch (e) {
        console.warn("Failed to refresh access token", e);
        setToken(null, null);
      }
    }, Math.max(0, expiresAt - Date.now() - 60000));
    return () => clearTimeout(timeout);
  }, [token, refreshToken, expiresAt]);

  const setToken = (
    newToken: string | null,
    newRefreshToken?: string | null,
    expiresIn?: number
  ) => {
    if (typeof window !== "undefined") {
      try {
        if (newToken) {
          window.localStorage.setItem("access_token", newToken);
          if (newRefreshToken !== undefined) {
            if (newRefreshToken) {
              window.localStorage.setItem("refresh_token", newRefreshToken);
            } else {
              window.localStorage.removeItem("refresh_token");
            }
          }
          if (expiresIn !== undefined) {
            const exp = Date.now() + expiresIn * 1000;
            window.localStorage.setItem("expires_at", exp.toString());
            setExpiresAt(exp);
          }
        } else {
          window.localStorage.removeItem("access_token");
          window.localStorage.removeItem("refresh_token");
          window.localStorage.removeItem("expires_at");
          setRefreshTokenState(null);
          setExpiresAt(null);
        }
      } catch (e) {
        console.warn("Failed to write access token to localStorage", e);
      }
    }
    setTokenState(newToken);
    if (newRefreshToken !== undefined) {
      setRefreshTokenState(newRefreshToken);
    }
    if (expiresIn !== undefined && newToken) {
      const exp = Date.now() + expiresIn * 1000;
      setExpiresAt(exp);
    }
  };

  return (
    <AuthContext.Provider value={{ token, refreshToken, setToken }}>
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

