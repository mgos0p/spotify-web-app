import { fetchPlayerState, startPlayback } from "../player";

describe("player API error handling", () => {
  const token = "test-token";

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("throws an error when fetchPlayerState response is not ok", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: false } as any);

    await expect(fetchPlayerState(token)).rejects.toThrow(
      "Failed to fetch player state"
    );
    expect(fetchMock).toHaveBeenCalledWith("https://api.spotify.com/v1/me/player", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  it("throws an error when startPlayback response is not ok", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({ ok: false } as any);

    await expect(startPlayback(token, "spotify:album:1", 0)).rejects.toThrow(
      "Failed to start playback"
    );
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
