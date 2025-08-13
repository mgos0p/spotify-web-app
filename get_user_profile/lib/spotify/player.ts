import { spotifyFetch, ApiResult } from "./api";

export const fetchPlayerState = async (
  code: string
): Promise<ApiResult<any>> =>
  spotifyFetch<any>(
    "https://api.spotify.com/v1/me/player",
    {
      method: "GET",
      headers: { Authorization: `Bearer ${code}` },
    },
    "Failed to fetch player state"
  );

export const fetchAvailableDevices = async (
  code: string
): Promise<ApiResult<any[]>> => {
  const result = await spotifyFetch<{ devices: any[] }>(
    "https://api.spotify.com/v1/me/player/devices",
    {
      method: "GET",
      headers: { Authorization: `Bearer ${code}` },
    },
    "Failed to fetch available devices"
  );
  return {
    data: Array.isArray(result.data?.devices) ? result.data!.devices : [],
    error: result.error,
  };
};

export const startPlayback = async (
  token: string,
  contextUri: string,
  offset: number,
  deviceId?: string,
  positionMs?: number
): Promise<ApiResult<void>> =>
  spotifyFetch<void>(
    `https://api.spotify.com/v1/me/player/play${
      deviceId ? `?device_id=${deviceId}` : ""
    }`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context_uri: contextUri,
        offset: { position: offset },
        position_ms: positionMs,
      }),
    },
    "Failed to start playback",
    false
  );

export const resumePlayback = async (
  token: string,
  deviceId?: string
): Promise<ApiResult<void>> =>
  spotifyFetch<void>(
    `https://api.spotify.com/v1/me/player/play${
      deviceId ? `?device_id=${deviceId}` : ""
    }`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({}),
    },
    "Failed to resume playback",
    false
  );

/**
 * Transfer playback to a specific device.
 *
 * @param token OAuth access token used for authorization.
 * @param deviceId The target device's Spotify ID.
 * @param play Whether playback should start on the new device. Defaults to `false`,
 *             leaving playback paused after transfer. Set to `true` to resume
 *             playback immediately on the new device.
 */
export const transferPlayback = async (
  token: string,
  deviceId: string,
  play = false
): Promise<ApiResult<void>> =>
  spotifyFetch<void>(
    "https://api.spotify.com/v1/me/player",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ device_ids: [deviceId], play }),
    },
    "Failed to transfer playback",
    false
  );

export const pausePlayback = async (
  token: string,
  deviceId?: string
): Promise<ApiResult<void>> =>
  spotifyFetch<void>(
    `https://api.spotify.com/v1/me/player/pause${
      deviceId ? `?device_id=${deviceId}` : ""
    }`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    },
    "Failed to pause playback",
    false
  );

export const nextTrack = async (
  token: string,
  deviceId?: string
): Promise<ApiResult<void>> =>
  spotifyFetch<void>(
    `https://api.spotify.com/v1/me/player/next${
      deviceId ? `?device_id=${deviceId}` : ""
    }`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
    "Failed to skip to next track",
    false
  );

export const previousTrack = async (
  token: string,
  deviceId?: string
): Promise<ApiResult<void>> =>
  spotifyFetch<void>(
    `https://api.spotify.com/v1/me/player/previous${
      deviceId ? `?device_id=${deviceId}` : ""
    }`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
    "Failed to skip to previous track",
    false
  );

export const seekPlayback = async (
  token: string,
  positionMs: number,
  deviceId?: string
): Promise<ApiResult<void>> =>
  spotifyFetch<void>(
    `https://api.spotify.com/v1/me/player/seek?position_ms=${positionMs}${
      deviceId ? `&device_id=${deviceId}` : ""
    }`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    },
    "Failed to seek playback",
    false
  );

export const setVolume = async (
  token: string,
  volumePercent: number,
  deviceId?: string
): Promise<ApiResult<void>> =>
  spotifyFetch<void>(
    `https://api.spotify.com/v1/me/player/volume?volume_percent=${volumePercent}${
      deviceId ? `&device_id=${deviceId}` : ""
    }`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    },
    "Failed to set volume",
    false
  );

export const setShuffle = async (
  token: string,
  state: boolean,
  deviceId?: string
): Promise<ApiResult<void>> =>
  spotifyFetch<void>(
    `https://api.spotify.com/v1/me/player/shuffle?state=${state}${
      deviceId ? `&device_id=${deviceId}` : ""
    }`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    },
    "Failed to set shuffle",
    false
  );

export const setRepeat = async (
  token: string,
  state: "off" | "track" | "context",
  deviceId?: string
): Promise<ApiResult<void>> =>
  spotifyFetch<void>(
    `https://api.spotify.com/v1/me/player/repeat?state=${state}${
      deviceId ? `&device_id=${deviceId}` : ""
    }`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    },
    "Failed to set repeat",
    false
  );
