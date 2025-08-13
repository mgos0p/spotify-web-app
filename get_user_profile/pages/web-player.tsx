// ユーザープレイリストを一覧表示し、選択すると
// Spotify Web APIで再生を操作できるスライド式プレイヤーモーダルを開くページ。
// モーダルは選択したプレイリストの最初に再生可能なトラックを利用する。
import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useAuth } from "../src/AuthContext";
import { Loader } from "../components/loader";
import { fetchPlaylists, fetchPlaylist } from "../lib/spotify/playlist";
import {
  fetchPlayerState,
  fetchAvailableDevices,
  startPlayback,
  pausePlayback,
  nextTrack,
  previousTrack,
  seekPlayback,
  setVolume as apiSetVolume,
  setShuffle as apiSetShuffle,
  setRepeat as apiSetRepeat,
  resumePlayback,
  transferPlayback,
} from "../lib/spotify/player";
import { redirectToAuthCodeFlow } from "../src/authCodeWithPkce";
import { WebPlayer } from "../components/webPlayer";
import type { ApiResult } from "../lib/spotify/api";

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
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
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
  const [hasStarted, setHasStarted] = useState(false);
  const deviceActiveRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const unwrap = <T,>(result: ApiResult<T>): T | null => {
    if (result.error) {
      setError(result.error);
      return null;
    }
    return result.data;
  };

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
        const playlistsData = unwrap(
          await fetchPlaylists(storedAccessToken, 50, 0)
        );
        if (playlistsData) setPlaylists(playlistsData);
      }
    };
    fetchData();
  }, [token, deviceId]);

  useEffect(() => {
    if (!token) return;
    const loadDevices = async () => {
      const list = unwrap(await fetchAvailableDevices(token));
      if (list) setDevices(list);
    };
    loadDevices();
  }, [token]);

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
      const data = unwrap(await fetchPlayerState(token));
      if (!data) return;
      if (data.device?.id !== deviceId) {
        deviceActiveRef.current = false;
        await unwrap(
          await transferPlayback(token, deviceId, data.is_playing ?? false)
        );
        return;
      }
      deviceActiveRef.current = true;
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
    const detail = unwrap(await fetchPlaylist(token, pl.id, 50, 0));
    if (!detail) return;
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
    setHasStarted(false);
  };

  const ensureDeviceActive = async () => {
    if (!token || !deviceId || deviceActiveRef.current) return;
    await unwrap(await transferPlayback(token, deviceId));
    for (let i = 0; i < 10; i++) {
      const data = unwrap(await fetchPlayerState(token));
      if (data?.device?.id === deviceId) {
        deviceActiveRef.current = true;
        playerRef.current?.setVolume?.(volume);
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  };

  const togglePlay = async () => {
    if (!token || !selected || !deviceId) return;
    if (!activated) {
      await playerRef.current?.activateElement?.();
      setActivated(true);
    }
    await ensureDeviceActive();
    if (isPlaying) {
      await unwrap(await pausePlayback(token, deviceId));
      setIsPlaying(false);
    } else {
      if (!hasStarted) {
        await unwrap(
          await startPlayback(
            token,
            selected.uri,
            currentTrackIndex,
            deviceId,
            position
          )
        );
        setHasStarted(true);
      } else {
        await unwrap(await resumePlayback(token, deviceId));
      }
      setIsPlaying(true);
    }
  };

  const handleDeviceChange = async (id: string) => {
    if (!token) return;
    setDeviceId(id);
    deviceActiveRef.current = false;
    await unwrap(await transferPlayback(token, id, isPlaying));
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
    await ensureDeviceActive();
    await unwrap(await nextTrack(token, deviceId ?? undefined));
    const idx = findPlayableIndex(currentTrackIndex, 1);
    setCurrentTrackIndex(idx);
    setCurrentTrack(selected.tracks.items[idx].track);
    setDuration(selected.tracks.items[idx].track.duration_ms ?? 0);
    setIsPlaying(true);
  };

  const playPrev = async () => {
    if (!token || !selected?.tracks) return;
    await ensureDeviceActive();
    await unwrap(await previousTrack(token, deviceId ?? undefined));
    const idx = findPlayableIndex(currentTrackIndex, -1);
    setCurrentTrackIndex(idx);
    setCurrentTrack(selected.tracks.items[idx].track);
    setDuration(selected.tracks.items[idx].track.duration_ms ?? 0);
    setIsPlaying(true);
  };

  const handleSeek = async (ms: number) => {
    if (!token) return;
    await ensureDeviceActive();
    await unwrap(await seekPlayback(token, ms, deviceId ?? undefined));
    setPosition(ms);
  };

  const handleVolumeChange = async (v: number) => {
    if (!token || !deviceId) return;
    setVolume(v);
    await ensureDeviceActive();
    await unwrap(await apiSetVolume(token, Math.round(v * 100), deviceId));
    playerRef.current?.setVolume?.(v);
  };

  const toggleShuffle = async () => {
    if (!token) return;
    const newState = !shuffle;
    await unwrap(await apiSetShuffle(token, newState, deviceId ?? undefined));
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
    await unwrap(await apiSetRepeat(token, next, deviceId ?? undefined));
    setRepeatState(next);
  };

  useEffect(() => {
    if (!isPlaying || !playerRef.current) return;
    const interval = setInterval(async () => {
      const state = await playerRef.current.getCurrentState();
      if (state) setPosition(state.position);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const closePlayer = async () => {
    setSelected(null);
    setIsPlaying(false);
    if (token) {
      await unwrap(await pausePlayback(token, deviceId ?? undefined));
    }
  };

  if (!playlists) {
    return error ? <div>{error}</div> : <Loader />;
  }
  return (
    <>
      {error && <div className="text-red-500">{error}</div>}
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
        devices={devices}
        deviceId={deviceId}
        onDeviceSelect={handleDeviceChange}
      />
    </>
  );
}
