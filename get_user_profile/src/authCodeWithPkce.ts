export async function redirectToAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);
  try {
    localStorage.setItem("verifier", verifier);
  } catch (e) {
    console.warn("Failed to access localStorage", e);
  }

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  //   params.append("redirect_uri", "http://localhost:5175/callback");
  params.append("redirect_uri", "http://localhost:3000/callback");
  params.append("scope", "user-read-private user-read-email");
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
  //   params.append("redirect_uri", "http://localhost:5175/callback");
  params.append("redirect_uri", "http://localhost:3000/callback");
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const { access_token } = await result.json();
  if (access_token) {
    try {
      localStorage.setItem("access_token", access_token);
    } catch (e) {
      console.warn("Failed to access localStorage", e);
    }
  }
  return access_token || null;
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
