import React, { useState } from "react";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaRandom,
  FaRedoAlt,
  FaVolumeUp,
} from "react-icons/fa";

// ミリ秒を「hh:mm:ss」または「mm:ss」に整形（時間が0の場合はmm:ss）
const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const two = (n: number) => n.toString().padStart(2, "0");
  return hours > 0
    ? `${two(hours)}:${two(minutes)}:${two(seconds)}`
    : `${two(minutes)}:${two(seconds)}`;
};

/**
 * ページ上部からスライドダウンして再生中のトラックを操作するモーダル風プレイヤー。
 * `visible` が false のときは何も描画されない。`controlsDisabled` が true の場合、
 * 各操作は無効化される。
 */
interface PlayerProps {
  /** モーダルを表示するかどうか */
  visible: boolean;
  /** 選択中の曲のトラック情報 */
  track: SpotifyTrackObject | null;
  /** Spotify が再生中かどうか */
  isPlaying: boolean;
  /**
   * すべての再生操作を無効化する。true のときアイコンは半透明になり、
   * ハンドラは何もしない。
   */
  controlsDisabled: boolean;
  /** 再生/一時停止を切り替える。controlsDisabled の場合は何もしない */
  onTogglePlay: () => void;
  /** 前のトラックへスキップ。controlsDisabled の場合は何もしない */
  onPrev: () => void;
  /** 次のトラックへスキップ。controlsDisabled の場合は何もしない */
  onNext: () => void;
  /** × ボタンがクリックされたときにモーダルを閉じるために呼び出される */
  onClose: () => void;
  /** 現在の再生位置（ms） */
  position: number;
  /** 現在のトラックの長さ（ms） */
  duration: number;
  /** 音量 0〜1 */
  volume: number;
  /** シャッフルモードが有効かどうか */
  shuffle: boolean;
  /** 現在のリピートモード */
  repeat: "off" | "track" | "context";
  /** シーク処理 */
  onSeek: (ms: number) => void;
  /** 音量変更処理 */
  onVolumeChange: (v: number) => void;
  /** シャッフル切り替え処理 */
  onToggleShuffle: () => void;
  /** リピート切り替え処理 */
  onToggleRepeat: () => void;
  /** 利用可能なデバイスの一覧 */
  devices: SpotifyDevice[];
  /** 現在選択中のデバイスID */
  deviceId: string | null;
  /** デバイス選択処理 */
  onDeviceSelect: (id: string) => void;
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
  devices,
  deviceId,
  onDeviceSelect,
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
        {/* × をクリックすると onClose に委譲され、親がモーダルを閉じる */}
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
         * トラック内をシークするためのスライダー。duration が 0 の場合などに
         * NaN や範囲外の値にならないよう制限する。
         */}
        <div className="flex items-center w-3/4 mt-4">
          <span className="mr-2 text-sm" data-testid="elapsed-time">
            {formatTime(position)}
          </span>
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
            className="flex-1"
            aria-label="Seek position"
            disabled={controlsDisabled}
          />
          <span className="ml-2 text-sm" data-testid="total-time">
            {formatTime(duration)}
          </span>
        </div>
        {/**
         * Volume slider clamped between 0 and 1 for accessibility and to
         * prevent out-of-range values. A speaker icon provides a clearer
         * affordance for the control.
         */}
        <div className="flex items-center w-1/2 mt-4">
          <select
            value={deviceId ?? ""}
            onChange={
              controlsDisabled
                ? undefined
                : (e) => onDeviceSelect(e.target.value)
            }
            disabled={controlsDisabled || devices.length === 0}
            className="mr-4 text-black p-1 rounded"
            aria-label="Select device"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <FaVolumeUp className="mr-2" />
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
            className="w-full"
            aria-label="Volume"
            disabled={controlsDisabled}
          />
          <span className="ml-2" data-testid="volume-value">
            {Math.round(Math.min(Math.max(volume, 0), 1) * 100)}
          </span>
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
