export const fetchProfile = async (code: string): Promise<UserProfile> => {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${code}` },
  });
  if (!result.ok) {
    throw new Error("Failed to fetch profile");
  }
  return await result.json();
};
