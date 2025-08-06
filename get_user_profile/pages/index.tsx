import React, { useEffect, useState } from "react";
import { Profile } from "../components/profile";
import { fetchProfile } from "../pages/api/profile";
import {
  redirectToAuthCodeFlow,
  getAccessToken,
} from "../src/authCodeWithPkce";
import { useAuth } from "../src/AuthContext";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        const accessToken = await getAccessToken(clientId, code);
        if (!accessToken) {
          redirectToAuthCodeFlow(clientId);
          return;
        }
        setToken(accessToken);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile");
      }
    };

    fetchData();
  }, [token]);

  if (error) {
    return <div>{error}</div>;
  }
  if (!profile) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <Profile profile={profile} />
    </div>
  );
}
