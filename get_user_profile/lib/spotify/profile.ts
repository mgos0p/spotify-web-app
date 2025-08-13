import type { UserProfile } from "../../types";
import { spotifyFetch, ApiResult } from "./api";

export const fetchProfile = async (
  token: string
): Promise<ApiResult<UserProfile>> =>
  spotifyFetch<UserProfile>(
    "https://api.spotify.com/v1/me",
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
    "Failed to fetch profile"
  );
