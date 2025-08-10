export async function redirectToAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);
  try {
    localStorage.setItem("verifier", verifier);
    const currentPath = window.location.pathname + window.location.search;
    localStorage.setItem("redirect_path", currentPath);
  } catch (e) {
    console.warn("Failed to access localStorage", e);
  }

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  const redirectUri =
    process.env.NEXT_PUBLIC_REDIRECT_URI ?? "http://localhost:3000/callback";
  params.append("redirect_uri", redirectUri);
  params.append(
    "scope",
    "user-read-private user-read-email user-read-currently-playing user-read-playback-state user-modify-playback-state app-remote-control playlist-read-private user-read-playback-position user-library-read"
  );
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getAccessToken(clientId: string, code: string) {
  let verifier: string | null = null;
  try {
    verifier = localStorage.getItem("verifier");
  } catch (e) {
    console.warn("Failed to access localStorage", e);
    return null;
  }

  if (!verifier) {
    return null;
  }

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  const redirectUri =
    process.env.NEXT_PUBLIC_REDIRECT_URI ?? "http://localhost:3000/callback";
  params.append("redirect_uri", redirectUri);
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const { access_token, refresh_token, expires_in } = await result.json();
  if (access_token) {
    try {
      localStorage.setItem("access_token", access_token);
      if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token);
      }
      if (expires_in) {
        const expiresAt = (Date.now() + expires_in * 1000).toString();
        localStorage.setItem("expires_at", expiresAt);
      }
    } catch (e) {
      console.warn("Failed to access localStorage", e);
    }
  }
  return { access_token, refresh_token, expires_in };
}

export async function refreshAccessToken(
  clientId: string,
  refreshToken: string
) {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  return await result.json();
}

export function generateCodeVerifier(length: number) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
