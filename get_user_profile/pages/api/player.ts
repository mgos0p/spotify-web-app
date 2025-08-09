const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.ok || res.status === 204) {
      return res;
    }
  }
  throw new Error(`Request failed after ${retries} attempts`);
};

export const fetchPlayerState = async (code: string): Promise<any | null> => {
  const res = await fetch("https://api.spotify.com/v1/me/player", {
    method: "GET",
    headers: { Authorization: `Bearer ${code}` },
  });
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
  const data = await res.json();
  return Array.isArray(data.devices) ? data.devices : [];
};

export const startPlayback = async (
  token: string,
  deviceId?: string,
  contextUri: string,
  offset: number
): Promise<void> => {
  await fetch(
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
      }),
    }
  );
};

export const pausePlayback = async (
  token: string,
  deviceId?: string
): Promise<void> => {
  await fetch(
    `https://api.spotify.com/v1/me/player/pause${
      deviceId ? `?device_id=${deviceId}` : ""
    }`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const nextTrack = async (
  token: string,
  deviceId?: string
): Promise<void> => {
  await fetch(
    `https://api.spotify.com/v1/me/player/next${
      deviceId ? `?device_id=${deviceId}` : ""
    }`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const previousTrack = async (
  token: string,
  deviceId?: string
): Promise<void> => {
  await fetch(
    `https://api.spotify.com/v1/me/player/previous${
      deviceId ? `?device_id=${deviceId}` : ""
    }`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
