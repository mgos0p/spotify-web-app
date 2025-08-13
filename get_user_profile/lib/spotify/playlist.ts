import { spotifyFetch, ApiResult } from "./api";

export const fetchPlaylists = async (
  code: string,
  limit: number,
  offset: number
): Promise<ApiResult<SpotifyPlaylistsResponse>> =>
  spotifyFetch<SpotifyPlaylistsResponse>(
    `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${code}` },
    },
    "Failed to fetch playlists"
  );

export const fetchPlaylist = async (
  code: string,
  playlistId: string,
  limit: number,
  offset: number
): Promise<ApiResult<SpotifyPlaylistResponse>> =>
  spotifyFetch<SpotifyPlaylistResponse>(
    `https://api.spotify.com/v1/playlists/${playlistId}?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${code}` },
    },
    "Failed to fetch playlist"
  );

export const fetchPlaylistItems = async (
  code: string,
  url: string
): Promise<ApiResult<SpotifyPlaylistTracksResponse>> =>
  spotifyFetch<SpotifyPlaylistTracksResponse>(
    url,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${code}` },
    },
    "Failed to fetch playlist items"
  );
