import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Profile } from "../components/profile";
import { Loader } from "../components/loader";
import { fetchProfile } from "../lib/spotify/profile";
import {
  redirectToAuthCodeFlow,
  getAccessToken,
} from "../src/authCodeWithPkce";
import { useAuth } from "../src/AuthContext";
import type { UserProfile } from "../types";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { token, setToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) {
        setError("Missing Spotify Client ID");
        return;
      }
      if (token) {
        try {
          const profileData = await fetchProfile(token);
          setProfile(profileData);
        } catch (err) {
          console.error("Failed to fetch profile:", err);
          setError("Failed to load profile");
        }
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) {
        redirectToAuthCodeFlow(clientId);
        return;
      }
      try {
        const tokenData = await getAccessToken(clientId, code);
        if (!tokenData || !tokenData.access_token) {
          redirectToAuthCodeFlow(clientId);
          return;
        }
        setToken(
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.expires_in
        );
        const redirectPath = localStorage.getItem("redirect_path");
        if (redirectPath && redirectPath !== router.pathname) {
          localStorage.removeItem("redirect_path");
          router.push(redirectPath);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile");
      }
    };

    fetchData();
  }, [token, router, setToken]);

  if (error) {
    return <div>{error}</div>;
  }
  if (!profile) {
    return <Loader />;
  }
  return (
    <div>
      <Profile profile={profile} />
    </div>
  );
}
