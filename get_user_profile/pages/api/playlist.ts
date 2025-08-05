import { useRouter } from "next/router";
export const fetchPlaylists = async (
  code: string,
  limit: number,
  offset: number
): Promise<SpotifyPlaylistsResponse> => {
  const result = await fetch(
    `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${code}` },
    }
  );
  return await result.json();
};

export const fetchPlaylist = async (
  code: string,
  playlistId: string,
  limit: number,
  offset: number
): Promise<SpotifyPlaylistResponse> => {
  const result = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${code}` },
    }
  );
  return await result.json();
};
export const fetchPlaylistItems = async (
  code: string,
  url: string
): Promise<SpotifyPlaylistTracksResponse> => {
  const result = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${code}` },
  });
  return await result.json();
};
