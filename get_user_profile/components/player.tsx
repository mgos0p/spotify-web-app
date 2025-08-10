import React, { useState } from "react";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaRandom,
  FaRedoAlt,
} from "react-icons/fa";

/**
 * Modal-like player that slides down from the top of the page to control the
 * current track. When `visible` is false nothing is rendered. Each control is
 * disabled when `controlsDisabled` is true, preventing interaction.
 */
interface PlayerProps {
  /** Whether the modal should be shown */
  visible: boolean;
  /** Track information for the currently selected song */
  track: SpotifyTrackObject | null;
  /** Indicates if Spotify is currently playing */
  isPlaying: boolean;
  /**
   * Disables all playback controls. When true the icons render with reduced
   * opacity and their handlers become no-ops.
   */
  controlsDisabled: boolean;
  /** Toggle play/pause; should be a no-op if controlsDisabled */
  onTogglePlay: () => void;
  /** Skip to the previous track; no-op if controlsDisabled */
  onPrev: () => void;
  /** Skip to the next track; no-op if controlsDisabled */
  onNext: () => void;
  /** Called when the × button is clicked to close the modal */
  onClose: () => void;
  /** Current playback position in ms */
  position: number;
  /** Duration of current track in ms */
  duration: number;
  /** Volume 0-1 */
  volume: number;
  /** Whether shuffle mode is enabled */
  shuffle: boolean;
  /** Current repeat mode */
  repeat: "off" | "track" | "context";
  /** Seek handler */
  onSeek: (ms: number) => void;
  /** Volume change handler */
  onVolumeChange: (v: number) => void;
  /** Toggle shuffle handler */
  onToggleShuffle: () => void;
  /** Toggle repeat handler */
  onToggleRepeat: () => void;
}

export const Player: React.FC<PlayerProps> = ({
  visible,
  track,
  isPlaying,
  controlsDisabled,
  onTogglePlay,
  onPrev,
  onNext,
  onClose,
  position,
  duration,
  volume,
  shuffle,
  repeat,
  onSeek,
  onVolumeChange,
  onToggleShuffle,
  onToggleRepeat,
}) => {
  const [showImage, setShowImage] = useState(false);
  if (!track) return null;
  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 h-1/2 bg-gray-900 z-10 flex flex-col items-center justify-center transform transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Clicking the × delegates to onClose so the parent can hide the modal */}
        <button className="absolute top-2 right-2 text-2xl" onClick={onClose}>
          ×
        </button>
        {track.album.images.length > 0 && (
          <img
            src={track.album.images[0].url}
            alt={track.name}
            className="w-48 h-48 object-cover mb-4 cursor-pointer"
            onClick={() => setShowImage(true)}
          />
        )}
        <div className="flex space-x-6 text-4xl items-center">
          <FaRandom
            className={
              controlsDisabled
                ? "opacity-50 cursor-not-allowed"
                : shuffle
                ? "text-green-500 cursor-pointer"
                : "cursor-pointer"
            }
            onClick={controlsDisabled ? undefined : onToggleShuffle}
          />
          <FaStepBackward
            className={
              controlsDisabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }
            onClick={controlsDisabled ? undefined : onPrev}
          />
          {isPlaying ? (
            <FaPause
              className={
                controlsDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
              onClick={controlsDisabled ? undefined : onTogglePlay}
            />
          ) : (
            <FaPlay
              className={
                controlsDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
              onClick={controlsDisabled ? undefined : onTogglePlay}
            />
          )}
          <FaStepForward
            className={
              controlsDisabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }
            onClick={controlsDisabled ? undefined : onNext}
          />
          <FaRedoAlt
            className={
              controlsDisabled
                ? "opacity-50 cursor-not-allowed"
                : repeat !== "off"
                ? "text-green-500 cursor-pointer"
                : "cursor-pointer"
            }
            onClick={controlsDisabled ? undefined : onToggleRepeat}
          />
        </div>
        {/**
         * Slider for seeking within the track. Clamp values to avoid NaN or
         * values outside the duration range, especially when duration is 0.
         */}
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 0}
          value={Math.min(Math.max(position, 0), duration > 0 ? duration : 0)}
          onChange={
            controlsDisabled
              ? undefined
              : (e) =>
                  onSeek(
                    Math.min(
                      Math.max(Number(e.target.value), 0),
                      duration > 0 ? duration : 0
                    )
                  )
          }
          className="w-3/4 mt-4"
          aria-label="Seek position"
          disabled={controlsDisabled}
        />
        {/**
         * Volume slider clamped between 0 and 1 for accessibility and to
         * prevent out-of-range values.
         */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={Math.min(Math.max(volume, 0), 1)}
          onChange={
            controlsDisabled
              ? undefined
              : (e) =>
                  onVolumeChange(
                    Math.min(Math.max(Number(e.target.value), 0), 1)
                  )
          }
          className="w-1/2 mt-4"
          aria-label="Volume"
          disabled={controlsDisabled}
        />
      </div>
      {showImage && track && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-20"
          onClick={() => setShowImage(false)}
        >
          <img
            src={track.album.images[0].url}
            alt={track.name}
            className="max-w-full max-h-full"
          />
        </div>
      )}
    </>
  );
};
