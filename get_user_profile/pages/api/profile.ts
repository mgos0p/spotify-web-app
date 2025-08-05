import { useRouter } from "next/router";
export const fetchProfile = async (code: string): Promise<UserProfile> => {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${code}` },
  });
  return await result.json();
};
