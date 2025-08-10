import { fetchProfile } from "../profile";

describe("fetchProfile", () => {
  const token = "test-token";

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches profile data successfully", async () => {
    const mockProfile = { id: "123", display_name: "Test" } as UserProfile;
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockProfile,
    } as any);

    const result = await fetchProfile(token);

    expect(fetchMock).toHaveBeenCalledWith("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(result).toEqual(mockProfile);
  });

  it("throws an error when the response is not ok", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
    } as any);

    await expect(fetchProfile(token)).rejects.toThrow(
      "Failed to fetch profile"
    );
    expect(fetchMock).toHaveBeenCalledWith("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  });
});
