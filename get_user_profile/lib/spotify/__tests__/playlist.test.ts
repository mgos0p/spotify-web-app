import { fetchPlaylist, fetchPlaylistItems, fetchPlaylists } from "../playlist";

describe("playlist API error handling", () => {
  const token = "test-token";

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns error when fetchPlaylists response is not ok", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: false } as any);

    const result = await fetchPlaylists(token, 20, 0);
    expect(result.error).toBe("Failed to fetch playlists");
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.spotify.com/v1/me/playlists?limit=20&offset=0`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  });

  it("returns error when fetchPlaylist response is not ok", async () => {
    const playlistId = "abc";
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: false } as any);

    const result = await fetchPlaylist(token, playlistId, 20, 0);
    expect(result.error).toBe("Failed to fetch playlist");
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.spotify.com/v1/playlists/${playlistId}?limit=20&offset=0`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  });

  it("returns error when fetchPlaylistItems response is not ok", async () => {
    const url = "https://api.spotify.com/v1/playlist/items";
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: false } as any);

    const result = await fetchPlaylistItems(token, url);
    expect(result.error).toBe("Failed to fetch playlist items");
    expect(fetchMock).toHaveBeenCalledWith(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  });
});
