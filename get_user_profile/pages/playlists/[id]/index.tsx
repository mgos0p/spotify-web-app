import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchPlaylist, fetchPlaylistItems } from "../../api/playlist";
import { fetchAudioFeatures } from "../../api/track";
import { PlaylistDetail } from "../../../components/playlistDetail";
import { Loader } from "../../../components/loader";
import { redirectToAuthCodeFlow } from "../../../src/authCodeWithPkce";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

const PlaylistDetailPage = () => {
  const [playlistDetail, setPlaylistDetail] =
    useState<SpotifyPlaylistResponse | null>(null);
  const [trackFeatures, setTrackFeatures] = useState<{
    [key: string]: SpotifyAudioFeaturesResponse;
  }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const playlistId = typeof id === "string" ? id : undefined;

  // 初回のプレイリスト情報とトラック情報を取得
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        redirectToAuthCodeFlow(clientId!);
        return;
      }
      try {
        if (playlistId) {
          const playlistData = await fetchPlaylist(
            accessToken,
            playlistId,
            20,
            0
          );
          setPlaylistDetail(playlistData);

          // トラックの音響特徴量を取得
          const featuresPromises =
            playlistData.tracks?.items?.map((track) =>
              fetchAudioFeatures(accessToken, track.track.id)
            ) ?? [];
          const features = await Promise.all(featuresPromises);
          const featuresMap = features.reduce((acc, feature) => {
            acc[feature.id] = feature;
            return acc;
          }, {} as { [key: string]: SpotifyAudioFeaturesResponse });
          setTrackFeatures(featuresMap);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    if (playlistId) {
      fetchData();
    }
  }, [playlistId, clientId]);

  // 追加読み込み処理
  const handleNext = async () => {
    if (!clientId || !playlistDetail?.tracks?.next || loading) return;
    try {
      setLoading(true);
      const storedAccessToken = localStorage.getItem("access_token");
      if (!storedAccessToken) {
        redirectToAuthCodeFlow(clientId!);
      } else {
        const tracks = await fetchPlaylistItems(
          storedAccessToken,
          playlistDetail.tracks!.next!
        );

        // Deduplicate tracks by ID before updating state
        const uniqueItems = tracks.items.filter(
          (item) =>
            !playlistDetail.tracks!.items.some(
              (existing) => existing.track.id === item.track.id
            )
        );

        // プレイリスト情報を更新（トラックを追加し next を更新）
        setPlaylistDetail((prev) =>
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

        // 新しく取得したトラックの音響特徴量を取得
        const featuresPromises = uniqueItems.map((item) =>
          fetchAudioFeatures(storedAccessToken, item.track.id)
        );
        const features = await Promise.all(featuresPromises);
        const featuresMap = features.reduce((acc, feature) => {
          acc[feature.id] = feature;
          return acc;
        }, {} as { [key: string]: SpotifyAudioFeaturesResponse });

        setTrackFeatures((prev) => ({ ...prev, ...featuresMap }));
      }
    } catch (error) {
      console.error("Failed to fetch playlist items:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!playlistDetail) {
    return <Loader />;
  }

  return (
    <div>
      <PlaylistDetail
        playlistDetail={playlistDetail}
        trackFeatures={trackFeatures}
        handleNext={handleNext}
      />
    </div>
  );
};

export default PlaylistDetailPage;
