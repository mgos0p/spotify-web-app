import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  fetchPlaylist,
  fetchPlaylistItems,
} from "../../../lib/spotify/playlist";
import { fetchAudioFeaturesBatch, fetchAudioAnalysis } from "../../../lib/spotify/track";
import { redirectToAuthCodeFlow } from "../../../src/authCodeWithPkce";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

const featureDefinitions: { key: keyof SpotifyAudioFeaturesResponse; label: string }[] = [
  { key: "danceability", label: "Danceability" },
  { key: "energy", label: "Energy" },
  { key: "acousticness", label: "Acousticness" },
  { key: "instrumentalness", label: "Instrumentalness" },
  { key: "liveness", label: "Liveness" },
  { key: "speechiness", label: "Speechiness" },
  { key: "valence", label: "Valence" },
];

const getHistogramData = (values: number[], bins = 10) => {
  const counts = new Array(bins).fill(0);
  values.forEach((v) => {
    const idx = Math.min(Math.floor(v * bins), bins - 1);
    counts[idx] += 1;
  });
  return {
    labels: counts.map((_, i) => `${(i / bins).toFixed(1)}-${((i + 1) / bins).toFixed(1)}`),
    datasets: [
      {
        label: "Tracks",
        data: counts,
        backgroundColor: "rgba(59,130,246,0.5)",
      },
    ],
  };
};

const getSectionsChartData = (
  playlist: SpotifyPlaylistResponse | null,
  analysis: { [key: string]: SpotifyAudioAnalysisResponse }
) => {
  if (!playlist || !playlist.tracks) {
    return { labels: [], datasets: [] };
  }
  const labels = playlist.tracks.items.map((item) => item.track.name);
  const data = playlist.tracks.items.map(
    (item) => analysis[item.track.id]?.sections.length ?? 0
  );
  return {
    labels,
    datasets: [
      {
        label: "Sections",
        data,
        backgroundColor: "rgba(16,185,129,0.5)",
      },
    ],
  };
};

const AnalyticsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const playlistId = typeof id === "string" ? id : undefined;

  const [playlist, setPlaylist] = useState<SpotifyPlaylistResponse | null>(null);
  const [features, setFeatures] = useState<SpotifyAudioFeaturesResponse[]>([]);
  const [analysis, setAnalysis] = useState<{
    [key: string]: SpotifyAudioAnalysisResponse;
  }>({});
  const [loading, setLoading] = useState(false);

  const loadInitial = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      redirectToAuthCodeFlow(clientId!);
      return;
    }
    if (!playlistId) return;
    try {
      const playlistData = await fetchPlaylist(accessToken, playlistId, 50, 0);
      setPlaylist(playlistData);
      const ids =
        playlistData.tracks?.items
          ?.filter(
            (item) => item.track && item.track.id && item.track.type === "track"
          )
          .map((item) => item.track.id) ?? [];
      if (ids.length > 0) {
        const feats = await fetchAudioFeaturesBatch(accessToken, ids);
        setFeatures(feats);
        const analysisResults = await Promise.all(
          ids.map((id) => fetchAudioAnalysis(accessToken, id))
        );
        const analysisMap = ids.reduce(
          (acc, id, idx) => {
            acc[id] = analysisResults[idx];
            return acc;
          },
          {} as { [key: string]: SpotifyAudioAnalysisResponse }
        );
        setAnalysis(analysisMap);
      }
    } catch (e) {
      console.error("Failed to load analytics", e);
    }
  };

  useEffect(() => {
    if (playlistId) {
      loadInitial();
    }
  }, [playlistId]);

  const handleLoadMore = async () => {
    if (loading || !playlist?.tracks?.next) return;
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      redirectToAuthCodeFlow(clientId!);
      return;
    }
    setLoading(true);
    try {
      const tracks = await fetchPlaylistItems(accessToken, playlist.tracks.next);
      const uniqueItems = tracks.items.filter(
        (item) =>
          item.track &&
          item.track.id &&
          item.track.type === "track" &&
          !playlist.tracks!.items.some(
            (existing) =>
              existing.track && existing.track.id === item.track!.id
          )
      );
      setPlaylist((prev) =>
        prev && prev.tracks
          ? {
              ...prev,
              tracks: {
                ...prev.tracks,
                items: [...prev.tracks.items, ...uniqueItems],
                next: tracks.next,
                previous: tracks.previous,
              },
            }
          : prev
      );
      const ids = uniqueItems.map((item) => item.track!.id);
      if (ids.length > 0) {
        const feats = await fetchAudioFeaturesBatch(accessToken, ids);
        setFeatures((prev) => [...prev, ...feats]);
        const analysisResults = await Promise.all(
          ids.map((id) => fetchAudioAnalysis(accessToken, id))
        );
        setAnalysis((prev) => {
          const next = { ...prev };
          ids.forEach((id, idx) => {
            next[id] = analysisResults[idx];
          });
          return next;
        });
      }
    } catch (e) {
      console.error("Failed to load more tracks", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-800 text-white p-5 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Analytics: {playlist?.name}</h2>
      {features.length > 0 && (
        <div className="space-y-8">
          {featureDefinitions.map((f) => (
            <div key={f.key}>
              <h3 className="mb-2 font-semibold">{f.label}</h3>
              <Bar
                data={getHistogramData(
                  features.map((feat) => feat[f.key] as number)
                )}
              />
            </div>
          ))}
          {Object.keys(analysis).length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Sections per Track</h3>
              <Bar data={getSectionsChartData(playlist, analysis)} />
            </div>
          )}
        </div>
      )}
      {playlist?.tracks?.next && (
        <button
          onClick={handleLoadMore}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Loading..." : "Load more..."}
        </button>
      )}
    </section>
  );
};

export default AnalyticsPage;
