import { fetchAudioAnalysis, fetchAudioFeatures } from "../track";

describe("fetchAudioAnalysis", () => {
  const token = "test-token";
  const trackId = "123";

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches audio analysis data successfully", async () => {
    const mockResponse: SpotifyAudioAnalysisResponse = {
      bars: [],
      beats: [],
      sections: [],
      segments: [],
      tatums: [],
      track: {
        num_samples: 0,
        duration: 0,
        sample_md5: "",
        offset_seconds: 0,
        window_seconds: 0,
        analysis_sample_rate: 0,
        analysis_channels: 0,
        end_of_fade_in: 0,
        start_of_fade_out: 0,
        loudness: 0,
        tempo: 0,
        tempo_confidence: 0,
        time_signature: 0,
        time_signature_confidence: 0,
        key: 0,
        key_confidence: 0,
        mode: 0,
        mode_confidence: 0,
        codestring: "",
        code_version: 0,
        echoprintstring: "",
        echoprint_version: 0,
        synchstring: "",
        synch_version: 0,
        rhythmstring: "",
        rhythm_version: 0,
      },
    };

    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as any);

    const result = await fetchAudioAnalysis(token, trackId);

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.spotify.com/v1/audio-analysis/${trackId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    expect(result.data).toEqual(mockResponse);
    expect(result.error).toBeNull();
  });

  it("returns error when the fetch response is not ok", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
    } as any);

    const result = await fetchAudioAnalysis(token, trackId);
    expect(result.error).toBe("Failed to fetch audio analysis");
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.spotify.com/v1/audio-analysis/${trackId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  });

  it("propagates network errors from fetch", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockRejectedValue(new Error("Network error"));

    const result = await fetchAudioAnalysis(token, trackId);
    expect(result.error).toBe("Network error");
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.spotify.com/v1/audio-analysis/${trackId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  });

  it("returns partial data when some keys are missing", async () => {
    const partialResponse = {
      bars: [],
      beats: [],
    } as Partial<SpotifyAudioAnalysisResponse>;

    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => partialResponse,
    } as any);

    const result = await fetchAudioAnalysis(token, trackId);

    expect(result.data).toEqual(partialResponse);
    expect(result.error).toBeNull();
  });
});

describe("fetchAudioFeatures", () => {
  const token = "test-token";
  const trackId = "123";

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns error when the fetch response is not ok", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
    } as any);

    const result = await fetchAudioFeatures(token, trackId);
    expect(result.error).toBe("Failed to fetch audio features");
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.spotify.com/v1/audio-features/${trackId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  });
});
