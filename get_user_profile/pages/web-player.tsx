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
  seekPlayback,
  setVolume as apiSetVolume,
  setShuffle as apiSetShuffle,
  setRepeat as apiSetRepeat,
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
  const controlsDisabled = !deviceId;
  const [sdkPlayer, setSdkPlayer] = useState<any | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [shuffle, setShuffleState] = useState(false);
  const [repeat, setRepeatState] = useState<"off" | "track" | "context">(
    "off"
  );

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
    const updatePlayback = async () => {
      const data = await fetchPlayerState(token);
      if (!data) return;
      if (data.device) setDeviceId(data.device.id);
      setIsPlaying(data.is_playing);
      setPosition(data.progress_ms ?? 0);
      setDuration(data.item?.duration_ms ?? 0);
      setShuffleState(data.shuffle_state ?? false);
      setRepeatState(data.repeat_state ?? "off");
    };
    updatePlayback();
    const interval = setInterval(updatePlayback, 5000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token || sdkPlayer) return;
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
    let player: any;
    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      player = new (window as any).Spotify.Player({
        name: "Web Playback",
        getOAuthToken: (cb: any) => cb(token),
      });
      player.addListener("ready", ({ device_id }: any) => {
        setDeviceId(device_id);
        setDeviceError(null);
        player.getVolume().then((v: number) => setVolume(v));
      });
      player.addListener("player_state_changed", (state: any) => {
        if (!state) return;
        setIsPlaying(!state.paused);
        setPosition(state.position);
        setDuration(state.duration);
        setShuffleState(state.shuffle);
        const map: Record<number, "off" | "track" | "context"> = {
          0: "off",
          1: "track",
          2: "context",
        };
        setRepeatState(map[state.repeat_mode] || "off");
      });
      player.connect();
      setSdkPlayer(player);
    };
    return () => {
      if (player) player.disconnect();
      document.body.removeChild(script);
    };
  }, [token, sdkPlayer]);

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
    if (!token || !selected) return;
    if (isPlaying) {
      await pausePlayback(token, deviceId ?? undefined);
      setIsPlaying(false);
    } else {
      await sdkPlayer?.activateElement?.();
      await startPlayback(
        token,
        selected.uri,
        currentTrackIndex,
        deviceId ?? undefined
      );
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
    if (!token || !selected?.tracks) return;
    await nextTrack(token, deviceId ?? undefined);
    setCurrentTrackIndex(findPlayableIndex(currentTrackIndex, 1));
    setIsPlaying(true);
  };

  const playPrev = async () => {
    if (!token || !selected?.tracks) return;
    await previousTrack(token, deviceId ?? undefined);
    setCurrentTrackIndex(findPlayableIndex(currentTrackIndex, -1));
    setIsPlaying(true);
  };

  const handleSeek = async (ms: number) => {
    if (!token) return;
    await seekPlayback(token, ms, deviceId ?? undefined);
    if (sdkPlayer) await sdkPlayer.seek(ms);
    setPosition(ms);
  };

  const handleVolumeChange = async (v: number) => {
    if (!token || !sdkPlayer) return;
    setVolume(v);
    await sdkPlayer.setVolume(v);
    await apiSetVolume(token, Math.round(v * 100), deviceId ?? undefined);
  };

  const toggleShuffle = async () => {
    if (!token) return;
    const newState = !shuffle;
    await apiSetShuffle(token, newState, deviceId ?? undefined);
    setShuffleState(newState);
  };

  const cycleRepeat = async () => {
    if (!token) return;
    const modes: Array<"off" | "context" | "track"> = [
      "off",
      "context",
      "track",
    ];
    const next = modes[(modes.indexOf(repeat) + 1) % modes.length];
    await apiSetRepeat(token, next, deviceId ?? undefined);
    setRepeatState(next);
  };

  const closePlayer = async () => {
    setSelected(null);
    setIsPlaying(false);
    if (token) {
      await pausePlayback(token, deviceId ?? undefined);
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
      position={position}
      duration={duration}
      volume={volume}
      shuffle={shuffle}
      repeat={repeat}
      onSeek={handleSeek}
      onVolumeChange={handleVolumeChange}
      onToggleShuffle={toggleShuffle}
      onToggleRepeat={cycleRepeat}
    />
  );
}
