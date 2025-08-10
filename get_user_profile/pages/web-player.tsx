// Web player page that lists user playlists and, upon selection, opens a
// slide-in Player modal for controlling playback via Spotify's Web API.
// The modal consumes the first playable track of the chosen playlist.
import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
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
  const [currentTrack, setCurrentTrack] =
    useState<SpotifyTrackObject | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [controlsDisabled] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [shuffle, setShuffleState] = useState(false);
  const [repeat, setRepeatState] = useState<"off" | "track" | "context">(
    "off"
  );
  const playerRef = useRef<any>(null);
  const selectedRef = useRef<SpotifyPlaylistResponse | null>(null);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

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
  }, [token, deviceId]);

  useEffect(() => {
    if (!token || playerRef.current) return;
    const initialize = () => {
      const player = new (window as any).Spotify.Player({
        name: "Web Playback SDK Player",
        getOAuthToken: (cb: (t: string) => void) => cb(token),
      });
      player.addListener("ready", ({ device_id }: any) => {
        setDeviceId(device_id);
      });
      player.addListener("player_state_changed", (state: any) => {
        if (!state) return;
        setPosition(state.position);
        setDuration(state.duration);
        setIsPlaying(!state.paused);
        setCurrentTrack(state.track_window?.current_track ?? null);
        const idx =
          selectedRef.current?.tracks?.items.findIndex(
            (t) => t.track.id === state.track_window?.current_track?.id
          ) ?? -1;
        if (idx !== -1) setCurrentTrackIndex(idx);
      });
      player.connect();
      playerRef.current = player;
    };
    if ((window as any).Spotify) {
      initialize();
    } else {
      (window as any).onSpotifyWebPlaybackSDKReady = initialize;
    }
    return () => {
      playerRef.current?.disconnect?.();
    };
  }, [token]);

  useEffect(() => {
    if (!token || !deviceId) return;
    const updatePlayback = async () => {
      const data = await fetchPlayerState(token);
      if (!data || data.device?.id !== deviceId) return;
      setVolume((data.device.volume_percent ?? 100) / 100);
      setShuffleState(data.shuffle_state ?? false);
      setRepeatState(data.repeat_state ?? "off");
      setCurrentTrack(data.item ?? null);
      const idx =
        selected?.tracks?.items.findIndex(
          (t) => t.track.id === data.item?.id
        ) ?? -1;
      if (idx !== -1) setCurrentTrackIndex(idx);
    };
    updatePlayback();
    const interval = setInterval(updatePlayback, 1000);
    return () => clearInterval(interval);
  }, [token, deviceId, selected]);

  const openPlaylist = async (pl: SpotifyPlaylistResponse) => {
    if (!token) return;
    const detail = await fetchPlaylist(token, pl.id, 50, 0);
    setSelected(detail);
    const firstPlayable =
      detail.tracks?.items.findIndex((t) => t.track.is_playable !== false) ?? 0;
    setCurrentTrackIndex(firstPlayable === -1 ? 0 : firstPlayable);
    setCurrentTrack(
      detail.tracks?.items[firstPlayable === -1 ? 0 : firstPlayable]?.track ??
        null
    );
    setDuration(
      detail.tracks?.items[firstPlayable === -1 ? 0 : firstPlayable]?.track
        ?.duration_ms ?? 0
    );
    setIsPlaying(false);
  };

  const togglePlay = async () => {
    if (!token || !selected || !deviceId) return;
    if (!activated) {
      await playerRef.current?.activateElement?.();
      setActivated(true);
    }
    if (isPlaying) {
      await pausePlayback(token, deviceId);
      setIsPlaying(false);
    } else {
      await startPlayback(
        token,
        selected.uri,
        currentTrackIndex,
        deviceId
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
    const idx = findPlayableIndex(currentTrackIndex, 1);
    setCurrentTrackIndex(idx);
    setCurrentTrack(selected.tracks.items[idx].track);
    setDuration(selected.tracks.items[idx].track.duration_ms ?? 0);
    setIsPlaying(true);
  };

  const playPrev = async () => {
    if (!token || !selected?.tracks) return;
    await previousTrack(token, deviceId ?? undefined);
    const idx = findPlayableIndex(currentTrackIndex, -1);
    setCurrentTrackIndex(idx);
    setCurrentTrack(selected.tracks.items[idx].track);
    setDuration(selected.tracks.items[idx].track.duration_ms ?? 0);
    setIsPlaying(true);
  };

  const handleSeek = async (ms: number) => {
    if (!token) return;
    await seekPlayback(token, ms, deviceId ?? undefined);
    setPosition(ms);
  };

  const handleVolumeChange = async (v: number) => {
    if (!token || !deviceId) return;
    setVolume(v);
    await apiSetVolume(token, Math.round(v * 100), deviceId);
    playerRef.current?.setVolume?.(v);
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
    <>
      <Script src="https://sdk.scdn.co/spotify-player.js" strategy="afterInteractive" />
      <WebPlayer
        playlists={playlists}
        selected={selected}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        controlsDisabled={controlsDisabled}
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
    </>
  );
}
