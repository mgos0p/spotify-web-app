import React, { useEffect, useRef, useState } from "react";
import { Playlists } from "../../components/playlists";
import { Loader } from "../../components/loader";
import { fetchPlaylists } from "../../lib/spotify/playlist";
import { redirectToAuthCodeFlow } from "../../src/authCodeWithPkce";

import { useAuth } from "../../src/AuthContext";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<SpotifyPlaylistsResponse | null>(
    null
  );
  const { token, setToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchData = async () => {
    if (!clientId || !hasMore || loading) return;
    setLoading(true);
    const storedAccessToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null);
    if (!storedAccessToken) {
      redirectToAuthCodeFlow(clientId);
    } else {
      if (!token) setToken(storedAccessToken);
      const result = await fetchPlaylists(storedAccessToken, 50, offset);
      if (result.error) {
        console.error("Failed to fetch playlists:", result.error);
        setError("Failed to fetch playlists");
        setHasMore(false);
        setLoading(false);
        return;
      }
      const playlistsData = result.data;
      if (!playlistsData || !Array.isArray(playlistsData.items)) {
        console.error("Invalid playlists data:", playlistsData);
        setHasMore(false);
        setLoading(false);
        return;
      }
      // 状態を更新する前にIDでプレイリストの重複を排除
      setPlaylists((prev) => {
        const existingItems = prev?.items || [];
        const newItems = playlistsData.items.filter(
          (item) => !existingItems.some((p) => p.id === item.id)
        );
        return {
          ...playlistsData,
          items: [...existingItems, ...newItems],
        };
      });
      setOffset((prevOffset) => prevOffset + playlistsData.items.length);
      setHasMore(playlistsData.items.length > 0);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, [token]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchData();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading]);

  if (error) {
    return <div>{error}</div>;
  }
  if (!playlists) {
    return <Loader />;
  }
  return (
    <div>
      <Playlists playlists={playlists} />
      <div ref={loaderRef} style={{ height: "20px" }}></div>
    </div>
  );
}
