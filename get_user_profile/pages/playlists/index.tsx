import React, { useEffect, useRef, useState } from "react";
import { Playlists } from "../../components/playlists";
import { fetchPlaylists } from "../../pages/api/playlist";
import { redirectToAuthCodeFlow } from "../../../get_user_profile/src/authCodeWithPkce";
import { useRouter } from "next/router";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<SpotifyPlaylistsResponse | null>(
    null
  );
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const fetchData = async () => {
    if (!clientId || !hasMore || loading) return;
    setLoading(true);
    try {
      const storedAccessToken = localStorage.getItem("access_token");
      if (!storedAccessToken) {
        router.push("/");
        redirectToAuthCodeFlow(clientId);
      } else {
        const playlistsData = await fetchPlaylists(
          storedAccessToken,
          50,
          offset
        );
        //   setPlaylists(playlistsData);
        setPlaylists((prev) => ({
          ...playlistsData,
          items: [...(prev?.items || []), ...playlistsData.items],
        }));
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
  }, []);
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
    return <div>Loading...</div>;
  }
  return (
    <div>
      <Playlists playlists={playlists} />
      <div ref={loaderRef} style={{ height: "20px" }}></div>
    </div>
  );
}
