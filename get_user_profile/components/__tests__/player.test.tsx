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
        />
      );
    });

    let icons = container.querySelectorAll("svg");
    expect(icons[0].getAttribute("class")).toContain("cursor-pointer");
    expect(icons[1].getAttribute("class")).toContain("cursor-pointer");
    expect(icons[2].getAttribute("class")).toContain("cursor-pointer");

    await act(async () => {
      icons[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
      icons[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
      icons[2].dispatchEvent(new MouseEvent("click", { bubbles: true }));
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
        />
      );
    });

    icons = container.querySelectorAll("svg");
    expect(icons[0].getAttribute("class")).toContain("cursor-not-allowed");
    expect(icons[1].getAttribute("class")).toContain("cursor-not-allowed");
    expect(icons[2].getAttribute("class")).toContain("cursor-not-allowed");

    await act(async () => {
      icons[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
      icons[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
      icons[2].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onTogglePlay).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
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
        />
      );
    });

    expect(container.firstChild).toBeNull();
  });
});

