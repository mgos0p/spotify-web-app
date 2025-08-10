export const fetchPlayerState = async (code: string): Promise<any | null> => {
  const res = await fetch("https://api.spotify.com/v1/me/player", {
    method: "GET",
    headers: { Authorization: `Bearer ${code}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch player state");
  }
  if (res.status === 204) {
    return null;
  }
  return await res.json();
};

export const fetchAvailableDevices = async (code: string): Promise<any[]> => {
  const res = await fetch("https://api.spotify.com/v1/me/player/devices", {
    method: "GET",
    headers: { Authorization: `Bearer ${code}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch available devices");
  }
  const data = await res.json();
  return Array.isArray(data.devices) ? data.devices : [];
};

export const startPlayback = async (
  token: string,
  contextUri: string,
  offset: number,
  deviceId?: string,
  positionMs?: number
): Promise<void> => {
  const res = await fetch(
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
    }
  );
  if (!res.ok) {
    throw new Error("Failed to start playback");
  }
};

export const resumePlayback = async (
  token: string,
  deviceId?: string
): Promise<void> => {
  const res = await fetch(
    `https://api.spotify.com/v1/me/player/play${
      deviceId ? `?device_id=${deviceId}` : ""
    }`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({}),
    }
  );
  if (!res.ok) {
    throw new Error("Failed to resume playback");
  }
};

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
): Promise<void> => {
  const res = await fetch("https://api.spotify.com/v1/me/player", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ device_ids: [deviceId], play }),
  });
  if (!res.ok) {
    throw new Error("Failed to transfer playback");
  }
};

export const pausePlayback = async (
  token: string,
  deviceId?: string
): Promise<void> => {
  const res = await fetch(
    `https://api.spotify.com/v1/me/player/pause${
      deviceId ? `?device_id=${deviceId}` : ""
    }`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to pause playback");
  }
};

export const nextTrack = async (
  token: string,
  deviceId?: string
): Promise<void> => {
  const res = await fetch(
    `https://api.spotify.com/v1/me/player/next${
      deviceId ? `?device_id=${deviceId}` : ""
    }`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to skip to next track");
  }
};

export const previousTrack = async (
  token: string,
  deviceId?: string
): Promise<void> => {
  const res = await fetch(
    `https://api.spotify.com/v1/me/player/previous${
      deviceId ? `?device_id=${deviceId}` : ""
    }`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to skip to previous track");
  }
};

export const seekPlayback = async (
  token: string,
  positionMs: number,
  deviceId?: string
): Promise<void> => {
  const res = await fetch(
    `https://api.spotify.com/v1/me/player/seek?position_ms=${positionMs}${
      deviceId ? `&device_id=${deviceId}` : ""
    }`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to seek playback");
  }
};

export const setVolume = async (
  token: string,
  volumePercent: number,
  deviceId?: string
): Promise<void> => {
  const res = await fetch(
    `https://api.spotify.com/v1/me/player/volume?volume_percent=${volumePercent}${
      deviceId ? `&device_id=${deviceId}` : ""
    }`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to set volume");
  }
};

export const setShuffle = async (
  token: string,
  state: boolean,
  deviceId?: string
): Promise<void> => {
  const res = await fetch(
    `https://api.spotify.com/v1/me/player/shuffle?state=${state}${
      deviceId ? `&device_id=${deviceId}` : ""
    }`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to set shuffle");
  }
};

export const setRepeat = async (
  token: string,
  state: "off" | "track" | "context",
  deviceId?: string
): Promise<void> => {
  const res = await fetch(
    `https://api.spotify.com/v1/me/player/repeat?state=${state}${
      deviceId ? `&device_id=${deviceId}` : ""
    }`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to set repeat");
  }
};
