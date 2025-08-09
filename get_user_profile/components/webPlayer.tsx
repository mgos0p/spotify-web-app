import React from "react";
import { Player } from "./player";
import { PlaylistList } from "./playlistList";

interface WebPlayerProps {
  playlists: SpotifyPlaylistsResponse;
  selected: SpotifyPlaylistResponse | null;
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  controlsDisabled: boolean;
  deviceError: string | null;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onSelectPlaylist: (
    pl: SpotifyPlaylistsResponse["items"][number]
  ) => void;
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
  deviceError,
  onTogglePlay,
  onPrev,
  onNext,
  onClose,
  onSelectPlaylist,
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
    />
    {deviceError && (
      <p className="text-center text-red-500 mt-4">{deviceError}</p>
    )}
    <div className={selected ? "pt-[50vh]" : ""}>
      <PlaylistList playlists={playlists} onSelect={onSelectPlaylist} />
    </div>
  </div>
);

