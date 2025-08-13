import { spotifyFetch, ApiResult } from "./api";

export const fetchAudioFeatures = async (
  accessToken: string,
  trackId: string
): Promise<ApiResult<SpotifyAudioFeaturesResponse>> =>
  spotifyFetch<SpotifyAudioFeaturesResponse>(
    `https://api.spotify.com/v1/audio-features/${trackId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    "Failed to fetch audio features"
  );

export const fetchAudioFeaturesBatch = async (
  accessToken: string,
  trackIds: string[]
): Promise<ApiResult<SpotifyAudioFeaturesResponse[]>> => {
  const result = await spotifyFetch<{ audio_features: (SpotifyAudioFeaturesResponse | null)[] }>(
    `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(",")}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    "Failed to fetch audio features"
  );
  return {
    data: (result.data?.audio_features || []).filter(
      (f: SpotifyAudioFeaturesResponse | null): f is SpotifyAudioFeaturesResponse => f !== null
    ),
    error: result.error,
  };
};

export const fetchAudioAnalysis = async (
  accessToken: string,
  trackId: string
): Promise<ApiResult<SpotifyAudioAnalysisResponse>> =>
  spotifyFetch<SpotifyAudioAnalysisResponse>(
    `https://api.spotify.com/v1/audio-analysis/${trackId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    "Failed to fetch audio analysis"
  );
