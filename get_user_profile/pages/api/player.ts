export const fetchPlayerState = async (
  code: string
): Promise<any | null> => {
  const res = await fetch("https://api.spotify.com/v1/me/player", {
    method: "GET",
    headers: { Authorization: `Bearer ${code}` },
  });
  if (res.status === 204) {
    return null;
  }
  return await res.json();
};

export const fetchAvailableDevices = async (
  code: string
): Promise<any[]> => {
  const res = await fetch("https://api.spotify.com/v1/me/player/devices", {
    method: "GET",
    headers: { Authorization: `Bearer ${code}` },
  });
  const data = await res.json();
  return Array.isArray(data.devices) ? data.devices : [];
};
