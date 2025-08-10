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

export const fetchAudioFeaturesBatch = async (
  accessToken: string,
  trackIds: string[]
): Promise<SpotifyAudioFeaturesResponse[]> => {
  const response = await fetch(
    `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(",")}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch audio features");
  }
  const data = await response.json();
  return (data.audio_features || []).filter(
    (f: SpotifyAudioFeaturesResponse | null): f is SpotifyAudioFeaturesResponse =>
      f !== null
  );
};
export const fetchAudioAnalysis = async (
  accessToken: string,
  trackId: string
): Promise<SpotifyAudioAnalysisResponse> => {
  const response = await fetch(
    `https://api.spotify.com/v1/audio-analysis/${trackId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch audio analysis");
  }
  return await response.json();
};
