import React, { useEffect, useRef } from "react";

interface PlaylistDetailProps {
  playlistDetail: SpotifyPlaylistResponse;
  trackFeatures: { [key: string]: SpotifyAudioFeaturesResponse };
  handleNext?: () => void;
}

export const PlaylistDetail: React.FC<PlaylistDetailProps> = ({
  playlistDetail,
  trackFeatures,
  handleNext,
}) => {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  function displayArtistNames(artists: SpotifyArtistObject[]): string {
    return artists.map((artist) => artist.name).join(", ");
  }

  useEffect(() => {
    if (!handleNext) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && playlistDetail.tracks?.next) {
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
  }, [handleNext, playlistDetail.tracks?.next]);

  return (
    <>
      <section
        id="playlist-detail"
        className="bg-gray-800 text-white p-5 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4">
          Playlist: {playlistDetail.name}
        </h2>
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8"
        >
          {playlistDetail.tracks?.items?.map((item, index) => {
            const features = trackFeatures[item.track.id];
            return (
              <div key={index} className="bg-gray-700 p-4 rounded-lg shadow">
                {item.track.album.images.length > 0 && (
                  <img
                    src={item.track.album.images[0].url}
                    alt={`Album art for ${item.track.name}`}
                    className="w-32 h-32 object-cover rounded mb-4"
                  />
                )}
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
          {playlistDetail.tracks?.next && <p>Loading more...</p>}
        </div>
      </section>
    </>
  );
};

