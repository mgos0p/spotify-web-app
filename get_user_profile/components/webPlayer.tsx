import React from "react";
import { Player } from "./player";
import { PlaylistList } from "./playlistList";

interface WebPlayerProps {
  playlists: SpotifyPlaylistsResponse;
  selected: SpotifyPlaylistResponse | null;
  currentTrack: SpotifyTrackObject | null;
  isPlaying: boolean;
  controlsDisabled: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onSelectPlaylist: (
    pl: SpotifyPlaylistsResponse["items"][number]
  ) => void;
  position: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: "off" | "track" | "context";
  onSeek: (ms: number) => void;
  onVolumeChange: (v: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  devices: SpotifyDevice[];
  deviceId: string | null;
  onDeviceSelect: (id: string) => void;
}

/**
 * Renders the player modal alongside the user's playlists. The player slides in
 * from the top when a playlist is selected. All playback controls delegate to
 * callbacks supplied by the parent page.
 */
export const WebPlayer: React.FC<WebPlayerProps> = ({
  playlists,
  selected,
  currentTrack,
  isPlaying,
  controlsDisabled,
  onTogglePlay,
  onPrev,
  onNext,
  onClose,
  onSelectPlaylist,
  position,
  duration,
  volume,
  shuffle,
  repeat,
  onSeek,
  onVolumeChange,
  onToggleShuffle,
  onToggleRepeat,
  devices,
  deviceId,
  onDeviceSelect,
}) => (
  <div className="relative text-white">
    <Player
      visible={!!selected}
      track={currentTrack}
      isPlaying={isPlaying}
      controlsDisabled={controlsDisabled}
      onTogglePlay={onTogglePlay}
      onPrev={onPrev}
      onNext={onNext}
      onClose={onClose}
      position={position}
      duration={duration}
      volume={volume}
      shuffle={shuffle}
      repeat={repeat}
      onSeek={onSeek}
      onVolumeChange={onVolumeChange}
      onToggleShuffle={onToggleShuffle}
      onToggleRepeat={onToggleRepeat}
      devices={devices}
      deviceId={deviceId}
      onDeviceSelect={onDeviceSelect}
    />
    <div className={selected ? "pt-[50vh]" : ""}>
      <PlaylistList playlists={playlists} onSelect={onSelectPlaylist} />
    </div>
  </div>
);

