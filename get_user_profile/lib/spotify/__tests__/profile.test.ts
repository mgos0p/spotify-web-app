import { fetchProfile } from "../profile";
import type { UserProfile } from "../../../types";

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
    expect(result.data).toEqual(mockProfile);
    expect(result.error).toBeNull();
  });

  it("returns error when the response is not ok", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
    } as any);

    const result = await fetchProfile(token);
    expect(result.error).toBe("Failed to fetch profile");
    expect(fetchMock).toHaveBeenCalledWith("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  });
});
