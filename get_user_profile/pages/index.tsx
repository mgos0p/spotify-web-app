import React, { useEffect, useState } from "react";
import { Profile } from "../components/profile";
import { fetchProfile } from "../pages/api/profile";
import {
  redirectToAuthCodeFlow,
  getAccessToken,
} from "../../get_user_profile/src/authCodeWithPkce";
import { useRouter } from "next/router";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return;
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
        }
        // アクセストークンをローカルストレージから取得
        const storedAccessToken = localStorage.getItem("access_token");
        if (storedAccessToken) {
          const profileData = await fetchProfile(storedAccessToken);
          setProfile(profileData);
        } else {
          redirectToAuthCodeFlow(clientId);
        }
        // const profileData = await fetchProfile(accessToken);
        // console.log(profileData);
        // setProfile(profileData);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchData();
  }, []);

  if (!profile) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <Profile profile={profile} />
    </div>
  );
}
