import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchPlaylist, fetchPlaylistItems } from "../api/playlist";
import { fetchAudioFeatures } from "../api/track";
import { PlaylistDetail } from "../../components/playlistDetail";
import { redirectToAuthCodeFlow } from "../../../get_user_profile/src/authCodeWithPkce";
const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const PlaylistDetailPage = () => {
  const [playlistDetail, setPlaylistDetail] =
    useState<SpotifyPlaylistResponse | null>(null);
  const [additionalPlaylistItems, setAdditionalPlaylistItems] =
    useState<SpotifyPlaylistTracksResponse | null>(null);
  const [trackFeatures, setTrackFeatures] = useState<{
    [key: string]: SpotifyAudioFeaturesResponse;
  }>({});
  const router = useRouter();
  const { id } = router.query;
  const playlistId = typeof id === "string" ? id : undefined;
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.error("Access token not found");
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
          const featuresPromises = playlistData.tracks.items.map((track) =>
            fetchAudioFeatures(accessToken, track.track.id)
          );
          const features = await Promise.all(featuresPromises);
          const featuresMap = features.reduce((acc, feature) => {
            acc[feature.id] = feature;
            return acc;
          }, {});
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
  useEffect(() => {
    console.log(trackFeatures);
  }, [trackFeatures]);

  if (!playlistDetail) {
    return <div>Loading...</div>;
  }
  const handleNext = async () => {
    if (!clientId) return;
    try {
      const storedAccessToken = localStorage.getItem("access_token");
      if (!storedAccessToken) {
        router.push("/");
        redirectToAuthCodeFlow(clientId);
      } else {
        if (playlistDetail && playlistDetail.tracks.next) {
          const tracks = await fetchPlaylistItems(
            storedAccessToken,
            playlistDetail.tracks.next
          );
          setAdditionalPlaylistItems(tracks);
        }
      }
    } catch (error) {
      console.error("Failed to fetch playlist items:", error);
    }
  };
  return (
    <div>
      <PlaylistDetail
        playlistDetail={playlistDetail}
        additionalPlaylistItems={additionalPlaylistItems}
        trackFeatures={trackFeatures}
        handleNext={handleNext}
      />
    </div>
  );
};

export default PlaylistDetailPage;

// import React, { useEffect, useState } from "react";
// import { Playlists } from "../../components/playlists";
// import { fetchPlaylist, fetchPlaylistItems } from "../../pages/api/playlist";
// import {
//   redirectToAuthCodeFlow,
//   getAccessToken,
// } from "../../../get_user_profile/src/authCodeWithPkce";
// import { useRouter } from "next/router";
// import { PlaylistDetail } from "../../components/playlistDetail";

// const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
// export default function PlaylistDetailPage() {
//   const [playlistDetail, setPlaylistDetail] =
//     useState<SpotifyPlaylistResponse | null>(null);
//   const [additionalPlaylistItems, setAdditionalPlaylistItems] =
//     useState<SpotifyPlaylistTracksResponse | null>(null);
//   const router = useRouter();
//   const { id } = router.query;
//   const playlistId = typeof id === "string" ? id : undefined;
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!clientId) return;

//       try {
//         const storedAccessToken = localStorage.getItem("access_token");
//         if (!storedAccessToken) {
//           router.push("/");
//           redirectToAuthCodeFlow(clientId);
//         } else {
//           if (playlistId) {
//             const playlistData = await fetchPlaylist(
//               storedAccessToken,
//               playlistId,
//               20,
//               0
//             );
//             setPlaylistDetail(playlistData);
//           }
//         }
//       } catch (error) {
//         console.error("Failed to fetch playlists:", error);
//       }
//     };

//     fetchData();
//   }, [playlistId, clientId, router]);
//   const handlePrevious = async () => {
//     if (!clientId) return;
//     try {
//       const storedAccessToken = localStorage.getItem("access_token");
//       if (!storedAccessToken) {
//         router.push("/");
//         redirectToAuthCodeFlow(clientId);
//       } else {
//         if (playlistDetail && playlistDetail.tracks.previous) {
//           const tracks = await fetchPlaylistItems(
//             storedAccessToken,
//             playlistDetail.tracks.previous
//           );
//           setAdditionalPlaylistItems(tracks);
//         }
//       }
//     } catch (error) {
//       console.error("Failed to fetch playlist items:", error);
//     }
//   };
//   const handleNext = async () => {
//     if (!clientId) return;
//     try {
//       const storedAccessToken = localStorage.getItem("access_token");
//       if (!storedAccessToken) {
//         router.push("/");
//         redirectToAuthCodeFlow(clientId);
//       } else {
//         if (playlistDetail && playlistDetail.tracks.next) {
//           const tracks = await fetchPlaylistItems(
//             storedAccessToken,
//             playlistDetail.tracks.next
//           );
//           setAdditionalPlaylistItems(tracks);
//         }
//       }
//     } catch (error) {
//       console.error("Failed to fetch playlist items:", error);
//     }
//   };
//   if (!playlistDetail) {
//     return <div>Loading...</div>;
//   }
//   return (
//     <div>
//       <PlaylistDetail
//         playlistDetail={playlistDetail}
//         additionalPlaylistItems={additionalPlaylistItems}
//         handlePrevious={handlePrevious}
//         handleNext={handleNext}
//       />
//     </div>
//   );
// }
