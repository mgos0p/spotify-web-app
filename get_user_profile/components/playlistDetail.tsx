import React, { useEffect, useRef, useState } from "react";
import { fetchPlaylistItems } from "../pages/api/playlist";
interface PlaylistDetailProps {
  playlistDetail: SpotifyPlaylistResponse;
  additionalPlaylistItems: SpotifyPlaylistTracksResponse | null;
  trackFeatures: { [key: string]: SpotifyAudioFeaturesResponse };
  handlePrevious?: () => void;
  handleNext?: () => void;
}

export const PlaylistDetail: React.FC<PlaylistDetailProps> = ({
  playlistDetail,
  additionalPlaylistItems,
  trackFeatures,
  handleNext,
}) => {
  const [items, setItems] = useState(playlistDetail.tracks.items);
  const loaderRef = useRef(null);

  function displayArtistNames(artists: SpotifyArtistObject[]): string {
    return artists.map((artist) => artist.name).join(", ");
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && playlistDetail.tracks.next) {
          handleNext();
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
  }, [playlistDetail.tracks.next]);

  //   const fetchMoreItems = async () => {

  //     const moreItems = await fetchPlaylistItems(,playlistDetail.tracks.next);
  //     setItems([...items, ...moreItems]);
  //   };

  useEffect(() => {
    // Assuming handleNext updates the items and playlistDetail.tracks.next
    if (additionalPlaylistItems) {
      setItems([...items, ...additionalPlaylistItems.items]);
    }
  }, [additionalPlaylistItems]);

  return (
    <>
      <section
        id="playlist-detail"
        className="bg-gray-800 text-white p-5 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4">
          Playlist: {playlistDetail.name}
        </h2>
        <div className="space-y-4">
          {items.map((item, index) => {
            const features = trackFeatures[item.track.id];
            return (
              <div key={index} className="bg-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold">{item.track.name}</h3>
                <p className="text-gray-400">
                  {displayArtistNames(item.track.artists)}
                </p>
                <div className="mt-2">
                  <a
                    href={item.track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition duration-300 ease-in-out"
                  >
                    Listen on Spotify
                  </a>
                </div>
                {features && (
                  <ul className="text-sm mt-2">
                    <li>Danceability: {features.danceability}</li>
                    <li>Energy: {features.energy}</li>
                    <li>Tempo: {features.tempo} BPM</li>
                    <li>Acousticness: {features.acousticness}</li>
                    <li>Instrumentalness: {features.instrumentalness}</li>
                    <li>Liveness: {features.liveness}</li>
                    <li>Loudness: {features.loudness}</li>
                    <li>Mode: {features.mode}</li>
                    <li>Speechiness: {features.speechiness}</li>
                    <li>Time Signature: {features.time_signature}</li>
                    <li>Valence: {features.valence}</li>
                  </ul>
                )}
              </div>
            );
          })}
        </div>
        <div ref={loaderRef} className="flex justify-center p-5">
          {playlistDetail.tracks.next && <p>Loading more...</p>}
        </div>
      </section>
    </>
  );
};

// import React from "react";

// interface PlaylistDetailProps {
//   playlistDetail: SpotifyPlaylistResponse;
//   additionalPlaylistItems: SpotifyPlaylistTracksResponse | null;
//   handlePrevious?: () => void;
//   handleNext?: () => void;
// }
// export const PlaylistDetail: React.FC<PlaylistDetailProps> = ({
//   playlistDetail,
//   additionalPlaylistItems,
//   handlePrevious,
//   handleNext,
// }) => {
//   function displayArtistNames(artists: SpotifyArtistObject[]): string {
//     return artists.map((artist) => artist.name).join(", ");
//   }
//   console.log(additionalPlaylistItems);
//   return (
//     <>
//       <section
//         id="playlist-detail"
//         className="bg-gray-800 text-white p-5 rounded-lg shadow-lg"
//       >
//         <h2 className="text-2xl font-bold mb-4">
//           Playlist: {playlistDetail.name}
//         </h2>
//         <div className="space-y-4">
//           {playlistDetail.tracks.items.length > 0 &&
//             playlistDetail.tracks.items.map((item, index) => (
//               <div key={index} className="bg-gray-700 p-4 rounded-lg shadow">
//                 <h3 className="text-xl font-semibold">{item.track.name}</h3>
//                 <p className="text-gray-400">
//                   {displayArtistNames(item.track.artists)}
//                 </p>
//                 <div className="mt-2">
//                   <a
//                     href={item.track.external_urls.spotify}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-400 hover:text-blue-300 transition duration-300 ease-in-out"
//                   >
//                     Listen on Spotify
//                   </a>
//                 </div>
//               </div>
//             ))}
//         </div>
//         <div className="flex flex-row gap-4 pb-4 justify-center mt-6">
//           {playlistDetail.tracks.previous && (
//             <button
//               onClick={handlePrevious}
//               className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//             >
//               前へ
//             </button>
//           )}
//           {playlistDetail.tracks.next && (
//             <button
//               onClick={handleNext}
//               className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//             >
//               次へ
//             </button>
//           )}
//         </div>
//         <a
//           href="/playlists"
//           className="text-blue-500 hover:text-blue-700 transition duration-300 ease-in-out"
//         >
//           戻る
//         </a>
//       </section>
//     </>
//   );
// };
