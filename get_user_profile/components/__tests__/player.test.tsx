/** @jest-environment jsdom */
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { Player } from "../player";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("Player", () => {
  let container: HTMLDivElement;
  let root: Root;

  const track = {
    name: "Track",
    album: { images: [{ url: "img" }] },
  } as any;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("slides in when visible and hides when not", async () => {
    await act(async () => {
      root.render(
        <Player
          visible={false}
          track={track}
          isPlaying={false}
          controlsDisabled={false}
          onTogglePlay={() => {}}
          onPrev={() => {}}
          onNext={() => {}}
          onClose={() => {}}
          position={0}
          duration={0}
          volume={1}
          shuffle={false}
          repeat="off"
          onSeek={() => {}}
          onVolumeChange={() => {}}
          onToggleShuffle={() => {}}
          onToggleRepeat={() => {}}
          devices={[]}
          deviceId={null}
          onDeviceSelect={() => {}}
        />
      );
    });
    let playerDiv = container.querySelector("div.fixed") as HTMLDivElement;
    expect(playerDiv.className).toContain("-translate-y-full");

    await act(async () => {
      root.render(
        <Player
          visible={true}
          track={track}
          isPlaying={false}
          controlsDisabled={false}
          onTogglePlay={() => {}}
          onPrev={() => {}}
          onNext={() => {}}
          onClose={() => {}}
          position={0}
          duration={0}
          volume={1}
          shuffle={false}
          repeat="off"
          onSeek={() => {}}
          onVolumeChange={() => {}}
          onToggleShuffle={() => {}}
          onToggleRepeat={() => {}}
          devices={[]}
          deviceId={null}
          onDeviceSelect={() => {}}
        />
      );
    });
    playerDiv = container.querySelector("div.fixed") as HTMLDivElement;
    expect(playerDiv.className).toContain("translate-y-0");
  });

  it("calls onClose when \u00d7 button clicked", async () => {
    const onClose = jest.fn();
    await act(async () => {
      root.render(
        <Player
          visible={true}
          track={track}
          isPlaying={false}
          controlsDisabled={false}
          onTogglePlay={() => {}}
          onPrev={() => {}}
          onNext={() => {}}
          onClose={onClose}
          position={0}
          duration={0}
          volume={1}
          shuffle={false}
          repeat="off"
          onSeek={() => {}}
          onVolumeChange={() => {}}
          onToggleShuffle={() => {}}
          onToggleRepeat={() => {}}
          devices={[]}
          deviceId={null}
          onDeviceSelect={() => {}}
        />
      );
    });

    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    await act(async () => {
      button!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("handles playback controls and disabled state", async () => {
    const onTogglePlay = jest.fn();
    const onPrev = jest.fn();
    const onNext = jest.fn();

    await act(async () => {
      root.render(
        <Player
          visible={true}
          track={track}
          isPlaying={false}
          controlsDisabled={false}
          onTogglePlay={onTogglePlay}
          onPrev={onPrev}
          onNext={onNext}
          onClose={() => {}}
          position={0}
          duration={0}
          volume={1}
          shuffle={false}
          repeat="off"
          onSeek={() => {}}
          onVolumeChange={() => {}}
          onToggleShuffle={() => {}}
          onToggleRepeat={() => {}}
          devices={[]}
          deviceId={null}
          onDeviceSelect={() => {}}
        />
      );
    });

    let icons = container.querySelectorAll("svg");
    expect(icons[1].getAttribute("class")).toContain("cursor-pointer");
    expect(icons[2].getAttribute("class")).toContain("cursor-pointer");
    expect(icons[3].getAttribute("class")).toContain("cursor-pointer");

    await act(async () => {
      icons[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
      icons[2].dispatchEvent(new MouseEvent("click", { bubbles: true }));
      icons[3].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onTogglePlay).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.render(
        <Player
          visible={true}
          track={track}
          isPlaying={false}
          controlsDisabled={true}
          onTogglePlay={onTogglePlay}
          onPrev={onPrev}
          onNext={onNext}
          onClose={() => {}}
          position={0}
          duration={0}
          volume={1}
          shuffle={false}
          repeat="off"
          onSeek={() => {}}
          onVolumeChange={() => {}}
          onToggleShuffle={() => {}}
          onToggleRepeat={() => {}}
          devices={[]}
          deviceId={null}
          onDeviceSelect={() => {}}
        />
      );
    });
    icons = container.querySelectorAll("svg");
    expect(icons[1].getAttribute("class")).toContain("cursor-not-allowed");
    expect(icons[2].getAttribute("class")).toContain("cursor-not-allowed");
    expect(icons[3].getAttribute("class")).toContain("cursor-not-allowed");

    await act(async () => {
      icons[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
      icons[2].dispatchEvent(new MouseEvent("click", { bubbles: true }));
      icons[3].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onTogglePlay).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("clamps slider values and prevents changes when disabled", async () => {
    const onSeek = jest.fn();
    const onVolumeChange = jest.fn();

    await act(async () => {
      root.render(
        <Player
          visible={true}
          track={track}
          isPlaying={false}
          controlsDisabled={false}
          onTogglePlay={() => {}}
          onPrev={() => {}}
          onNext={() => {}}
          onClose={() => {}}
          position={2000}
          duration={1000}
          volume={2}
          shuffle={false}
          repeat="off"
          onSeek={onSeek}
          onVolumeChange={onVolumeChange}
          onToggleShuffle={() => {}}
          onToggleRepeat={() => {}}
          devices={[]}
          deviceId={null}
          onDeviceSelect={() => {}}
        />
      );
    });

    let sliders = container.querySelectorAll('input[type="range"]');
    const seek = sliders[0] as HTMLInputElement;
    const volumeSlider = sliders[1] as HTMLInputElement;

    // 初期値はクランプされる
    expect(seek.value).toBe("1000");
    expect(volumeSlider.value).toBe("1");

    // ユーザーがスライダーを範囲外に動かした場合をシミュレート
    seek.value = "1500";
    volumeSlider.value = "2";
    await act(async () => {
      seek.dispatchEvent(new Event("input", { bubbles: true }));
      volumeSlider.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(onSeek).toHaveBeenCalledWith(1000);
    expect(onVolumeChange).toHaveBeenCalledWith(1);

    await act(async () => {
      root.render(
        <Player
          visible={true}
          track={track}
          isPlaying={false}
          controlsDisabled={true}
          onTogglePlay={() => {}}
          onPrev={() => {}}
          onNext={() => {}}
          onClose={() => {}}
          position={500}
          duration={0}
          volume={0.5}
          shuffle={false}
          repeat="off"
          onSeek={onSeek}
          onVolumeChange={onVolumeChange}
          onToggleShuffle={() => {}}
          onToggleRepeat={() => {}}
          devices={[]}
          deviceId={null}
          onDeviceSelect={() => {}}
        />
      );
    });

    sliders = container.querySelectorAll('input[type="range"]');
    const disabledSeek = sliders[0] as HTMLInputElement;
    const disabledVolume = sliders[1] as HTMLInputElement;

    expect(disabledSeek.value).toBe("0");
    expect(disabledSeek.disabled).toBe(true);
    expect(disabledVolume.disabled).toBe(true);

    disabledSeek.value = "100";
    disabledVolume.value = "0.9";
    await act(async () => {
      disabledSeek.dispatchEvent(new Event("input", { bubbles: true }));
      disabledVolume.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // コントロールが無効なときはハンドラーが再度呼ばれないはず
    expect(onSeek).toHaveBeenCalledTimes(1);
    expect(onVolumeChange).toHaveBeenCalledTimes(1);
  });

  it("displays formatted time and volume", async () => {
    await act(async () => {
      root.render(
        <Player
          visible={true}
          track={track}
          isPlaying={false}
          controlsDisabled={false}
          onTogglePlay={() => {}}
          onPrev={() => {}}
          onNext={() => {}}
          onClose={() => {}}
          position={65000}
          duration={3723000}
          volume={0.55}
          shuffle={false}
          repeat="off"
          onSeek={() => {}}
          onVolumeChange={() => {}}
          onToggleShuffle={() => {}}
          onToggleRepeat={() => {}}
          devices={[]}
          deviceId={null}
          onDeviceSelect={() => {}}
        />
      );
    });

    const elapsed = container.querySelector(
      '[data-testid="elapsed-time"]'
    ) as HTMLElement;
    const total = container.querySelector(
      '[data-testid="total-time"]'
    ) as HTMLElement;
    const volumeValue = container.querySelector(
      '[data-testid="volume-value"]'
    ) as HTMLElement;

    expect(elapsed.textContent).toBe("01:05");
    expect(total.textContent).toBe("01:02:03");
    expect(volumeValue.textContent).toBe("55");
  });

  it("returns null when track is missing", async () => {
    await act(async () => {
      root.render(
        <Player
          visible={true}
          track={null}
          isPlaying={false}
          controlsDisabled={false}
          onTogglePlay={() => {}}
          onPrev={() => {}}
          onNext={() => {}}
          onClose={() => {}}
          position={0}
          duration={0}
          volume={1}
          shuffle={false}
          repeat="off"
          onSeek={() => {}}
          onVolumeChange={() => {}}
          onToggleShuffle={() => {}}
          onToggleRepeat={() => {}}
          devices={[]}
          deviceId={null}
          onDeviceSelect={() => {}}
        />
      );
    });

    expect(container.firstChild).toBeNull();
  });
});

