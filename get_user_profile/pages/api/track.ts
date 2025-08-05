export const fetchAudioFeatures = async (
  accessToken: string,
  trackId: string
): Promise<SpotifyAudioFeaturesResponse> => {
  const response = await fetch(
    `https://api.spotify.com/v1/audio-features/${trackId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch audio features");
  }
  return await response.json();
};
