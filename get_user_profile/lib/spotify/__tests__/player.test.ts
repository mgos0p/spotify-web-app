import { fetchPlayerState, startPlayback } from "../player";

describe("player API error handling", () => {
  const token = "test-token";

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns error when fetchPlayerState response is not ok", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: false } as any);

    const result = await fetchPlayerState(token);
    expect(result.error).toBe("Failed to fetch player state");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.spotify.com/v1/me/player",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  });

  it("returns error when startPlayback response is not ok", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: false } as any);

    const result = await startPlayback(token, "spotify:album:1", 0);
    expect(result.error).toBe("Failed to start playback");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.spotify.com/v1/me/player/play",
      expect.objectContaining({
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    );
  });
});
