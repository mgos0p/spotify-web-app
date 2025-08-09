import React, { useState } from "react";
import { FaPlay, FaPause, FaStepBackward, FaStepForward } from "react-icons/fa";

interface PlayerProps {
  visible: boolean;
  track: SpotifyTrack | null;
  isPlaying: boolean;
  controlsDisabled: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
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
        <div className="flex space-x-6 text-4xl">
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
        </div>
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
