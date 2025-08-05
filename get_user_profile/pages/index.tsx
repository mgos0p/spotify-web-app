import React, { useEffect, useState } from "react";
import { Profile } from "../components/profile";
import { fetchProfile } from "../pages/api/profile";
import {
  redirectToAuthCodeFlow,
  getAccessToken,
} from "../../get_user_profile/src/authCodeWithPkce";
import { useAuth } from "../src/AuthContext";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { token, setToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return;
      if (token) {
        const profileData = await fetchProfile(token);
        setProfile(profileData);
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
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchData();
  }, [token]);

  if (!profile) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <Profile profile={profile} />
    </div>
  );
}
