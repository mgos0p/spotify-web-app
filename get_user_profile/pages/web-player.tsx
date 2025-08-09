// Web player page that lists user playlists and, upon selection, opens a
// slide-in Player modal for controlling playback via Spotify's Web API.
// The modal consumes the first playable track of the chosen playlist.
import React, { useEffect, useState } from "react";
import { useAuth } from "../src/AuthContext";
import { Loader } from "../components/loader";
import { fetchPlaylists, fetchPlaylist } from "./api/playlist";
import {
  fetchPlayerState,
  startPlayback,
  pausePlayback,
  nextTrack,
  previousTrack,
} from "./api/player";
import { redirectToAuthCodeFlow } from "../src/authCodeWithPkce";
import { WebPlayer } from "../components/webPlayer";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

export default function WebPlayerPage() {
  const { token, setToken } = useAuth();
  const [playlists, setPlaylists] = useState<SpotifyPlaylistsResponse | null>(
    null
  );
  const [selected, setSelected] = useState<SpotifyPlaylistResponse | null>(
    null
  );
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [controlsDisabled, setControlsDisabled] = useState(false);

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

  useEffect(() => {
    if (!token) return;
    let attempts = 0;
    let interval: NodeJS.Timeout;

    const updatePlayback = async () => {
      const data = await fetchPlayerState(token);
      if (!data || !data.device) {
        setDeviceError(
          "No active Spotify device found. Please open Spotify on a device."
        );
        setDeviceId(null);
        setIsPlaying(false);
        // setControlsDisabled(true);
        attempts++;
        if (attempts >= 3) {
          clearInterval(interval);
        }
        return;
      }
      setDeviceId(data.device.id);
      setIsPlaying(data.is_playing);
      setDeviceError(null);
      // setControlsDisabled(false);
      attempts = 0;
    };

    updatePlayback();
    interval = setInterval(updatePlayback, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const openPlaylist = async (pl: SpotifyPlaylistResponse) => {
    if (!token) return;
    const detail = await fetchPlaylist(token, pl.id, 50, 0);
    setSelected(detail);
    const firstPlayable =
      detail.tracks?.items.findIndex((t) => t.track.is_playable !== false) ?? 0;
    setCurrentTrackIndex(firstPlayable === -1 ? 0 : firstPlayable);
    setIsPlaying(false);
  };

  const currentTrack =
    selected?.tracks?.items[currentTrackIndex]?.track ?? null;

  const togglePlay = async () => {
    if (!token || !selected || !deviceId) return;
    if (isPlaying) {
      await pausePlayback(token, deviceId);
      setIsPlaying(false);
    } else {
      await startPlayback(token, deviceId, selected.uri, currentTrackIndex);
      setIsPlaying(true);
    }
  };

  const findPlayableIndex = (start: number, direction: 1 | -1): number => {
    if (!selected?.tracks) return start;
    const items = selected.tracks.items;
    let idx = start;
    do {
      idx = (idx + direction + items.length) % items.length;
    } while (items[idx].track.is_playable === false && idx !== start);
    return idx;
  };

  const playNext = async () => {
    if (!token || !selected?.tracks || !deviceId) return;
    await nextTrack(token, deviceId);
    setCurrentTrackIndex(findPlayableIndex(currentTrackIndex, 1));
    setIsPlaying(true);
  };

  const playPrev = async () => {
    if (!token || !selected?.tracks || !deviceId) return;
    await previousTrack(token, deviceId);
    setCurrentTrackIndex(findPlayableIndex(currentTrackIndex, -1));
    setIsPlaying(true);
  };

  const closePlayer = async () => {
    setSelected(null);
    setIsPlaying(false);
    if (token && deviceId) {
      await pausePlayback(token, deviceId);
    }
  };

  if (!playlists) {
    return <Loader />;
  }
  return (
    <WebPlayer
      playlists={playlists}
      selected={selected}
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      controlsDisabled={controlsDisabled}
      deviceError={deviceError}
      onTogglePlay={togglePlay}
      onPrev={playPrev}
      onNext={playNext}
      onClose={closePlayer}
      onSelectPlaylist={openPlaylist}
    />
  );
}
