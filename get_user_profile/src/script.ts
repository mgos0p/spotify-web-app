// 文字通りのシングルページアプリであるため
// ハッシュフラグメントを確認してSpotifyからのコールバックを検出する
import {
  redirectToAuthCodeFlow,
  getAccessToken,
  refreshAccessToken,
} from "./authCodeWithPkce";
import type { UserProfile } from "../types";

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (code) {
  const tokenData = await getAccessToken(clientId, code);
  if (tokenData?.access_token) {
    try {
      localStorage.setItem("access_token", tokenData.access_token);
      if (tokenData.refresh_token) {
        localStorage.setItem("refresh_token", tokenData.refresh_token);
      }
      if (tokenData.expires_in) {
        const exp = (Date.now() + tokenData.expires_in * 1000).toString();
        localStorage.setItem("expires_at", exp);
      }
    } catch (e) {
      console.warn("Failed to write tokens to localStorage", e);
    }
  }
}

const accessToken = await getStoredAccessToken();
if (!accessToken) {
  redirectToAuthCodeFlow(clientId);
} else {
  const profile = await fetchProfile(accessToken);
  populateUI(profile);
}

async function getStoredAccessToken(): Promise<string | null> {
  try {
    const token = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    const expires = localStorage.getItem("expires_at");
    if (!token) return null;

    if (expires) {
      const expiresAt = parseInt(expires, 10);
      // トークンが期限切れか1分以内に期限切れとなる場合は更新する
      if (expiresAt - Date.now() < 60_000) {
        if (!refreshToken) return null;
        try {
          const refreshed = await refreshAccessToken(clientId, refreshToken);
          if (!refreshed?.access_token) return null;
          localStorage.setItem("access_token", refreshed.access_token);
          if (refreshed.refresh_token) {
            localStorage.setItem("refresh_token", refreshed.refresh_token);
          }
          if (refreshed.expires_in) {
            const newExp = (Date.now() + refreshed.expires_in * 1000).toString();
            localStorage.setItem("expires_at", newExp);
          }
          return refreshed.access_token;
        } catch (e) {
          console.warn("Failed to refresh access token", e);
          return null;
        }
      }
    }

    return token;
  } catch (e) {
    console.warn("Failed to read tokens from localStorage", e);
    return null;
  }
}

async function fetchProfile(token: string): Promise<UserProfile> {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await result.json();
}

function populateUI(profile: UserProfile) {
  document.getElementById("displayName")!.innerText = profile.display_name;
  document.getElementById("avatar")!.setAttribute("src", profile.images[0].url);
  document.getElementById("id")!.innerText = profile.id;
  document.getElementById("email")!.innerText = profile.email;
  document.getElementById("uri")!.innerText = profile.uri;
  document
    .getElementById("uri")!
    .setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url")!.innerText = profile.href;
  document.getElementById("url")!.setAttribute("href", profile.href);
  document.getElementById("imgUrl")!.innerText = profile.images[0].url;
}
