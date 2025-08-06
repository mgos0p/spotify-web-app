import React, { useEffect, useRef, useState } from "react";
import { Playlists } from "../../components/playlists";
import { Loader } from "../../components/loader";
import { fetchPlaylists } from "../../pages/api/playlist";
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
  const fetchData = async () => {
    if (!clientId || !hasMore || loading) return;
    setLoading(true);
    try {
      const storedAccessToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null);
      if (!storedAccessToken) {
        redirectToAuthCodeFlow(clientId);
      } else {
        if (!token) setToken(storedAccessToken);
        const playlistsData = await fetchPlaylists(
          storedAccessToken,
          50,
          offset
        );
        if (!playlistsData || !Array.isArray(playlistsData.items)) {
          console.error("Invalid playlists data:", playlistsData);
          setHasMore(false);
          return;
        }
        // Deduplicate playlists by ID before updating state
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
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
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
