import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../src/AuthContext";
import { Loader } from "../components/loader";
import { fetchPlaylists, fetchPlaylist } from "./api/playlist";
import { redirectToAuthCodeFlow } from "../src/authCodeWithPkce";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
} from "react-icons/fa";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

export default function WebPlayerPage() {
  const { token, setToken } = useAuth();
  const [playlists, setPlaylists] = useState<SpotifyPlaylistsResponse | null>(null);
  const [selected, setSelected] =
    useState<SpotifyPlaylistResponse | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return;
      const storedAccessToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null);
      if (!storedAccessToken) {
        redirectToAuthCodeFlow(clientId);
      } else {
        if (!token) setToken(storedAccessToken);
        const playlistsData = await fetchPlaylists(storedAccessToken, 50, 0);
        setPlaylists(playlistsData);
      }
    };
    fetchData();
  }, [token]);

  const openPlaylist = async (pl: SpotifyPlaylistResponse) => {
    if (!token) return;
    const detail = await fetchPlaylist(token, pl.id, 50, 0);
    setSelected(detail);
    const firstPlayable = detail.tracks.items.findIndex(
      (t) => t.track.preview_url
    );
    setCurrentTrackIndex(firstPlayable === -1 ? 0 : firstPlayable);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const currentTrack =
    selected?.tracks?.items[currentTrackIndex]?.track;

  useEffect(() => {
    if (!currentTrack?.preview_url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.preview_url);
    } else {
      audioRef.current.src = currentTrack.preview_url;
    }
    if (isPlaying) {
      audioRef.current.play();
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (!currentTrack?.preview_url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.preview_url);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const findPlayableIndex = (
    start: number,
    direction: 1 | -1
  ): number => {
    if (!selected?.tracks) return start;
    const items = selected.tracks.items;
    let idx = start;
    do {
      idx = (idx + direction + items.length) % items.length;
    } while (!items[idx].track.preview_url && idx !== start);
    return idx;
  };

  const playNext = () => {
    if (!selected?.tracks) return;
    setCurrentTrackIndex(findPlayableIndex(currentTrackIndex, 1));
    setIsPlaying(false);
  };

  const playPrev = () => {
    if (!selected?.tracks) return;
    setCurrentTrackIndex(findPlayableIndex(currentTrackIndex, -1));
    setIsPlaying(false);
  };

  const closePlayer = () => {
    setSelected(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  if (!playlists) {
    return <Loader />;
  }

  return (
    <div className="relative text-white">
      <div
        className={`fixed top-0 left-0 right-0 h-1/2 bg-gray-900 z-10 flex flex-col items-center justify-center transform transition-transform duration-300 ${selected ? "translate-y-0" : "-translate-y-full"}`}
      >
        {selected && currentTrack && (
          <>
            <button
              className="absolute top-2 right-2 text-2xl"
              onClick={closePlayer}
            >
              ×
            </button>
            {currentTrack.album.images.length > 0 && (
              <img
                src={currentTrack.album.images[0].url}
                alt={currentTrack.name}
                className="w-48 h-48 object-cover mb-4 cursor-pointer"
                onClick={() => setShowImage(true)}
              />
            )}
            <div className="flex space-x-6 text-4xl">
              <FaStepBackward className="cursor-pointer" onClick={playPrev} />
              {isPlaying ? (
                <FaPause className="cursor-pointer" onClick={togglePlay} />
              ) : (
                <FaPlay className="cursor-pointer" onClick={togglePlay} />
              )}
              <FaStepForward className="cursor-pointer" onClick={playNext} />
            </div>
          </>
        )}
      </div>
      {showImage && currentTrack && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-20"
          onClick={() => setShowImage(false)}
        >
          <img
            src={currentTrack.album.images[0].url}
            alt={currentTrack.name}
            className="max-w-full max-h-full"
          />
        </div>
      )}
      <section className={selected ? "pt-[50vh]" : ""}>
        <h2 className="text-2xl font-bold mb-4">My Playlists</h2>
        <ul className="list-none space-y-2">
          {playlists.items.map((pl) => (
            <li
              key={pl.id}
              className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg flex items-center cursor-pointer"
              onClick={() => openPlaylist(pl)}
            >
              {pl.images.length > 0 && (
                <img
                  src={pl.images[0].url}
                  alt={pl.name}
                  className="w-16 h-16 mr-4 object-cover rounded"
                />
              )}
              <span className="text-blue-400 hover:text-blue-300 flex-grow">
                {pl.name}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
