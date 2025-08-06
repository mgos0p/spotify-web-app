/** @jest-environment jsdom */
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { PlaylistDetail } from "../../components/playlistDetail";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("PlaylistDetail", () => {
  let container: HTMLDivElement;
  let root: Root;

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

  it("renders without tracks data", async () => {
    const playlist = {
      name: "Test Playlist",
    } as any;

    await act(async () => {
      root.render(
        <PlaylistDetail playlistDetail={playlist} trackFeatures={{}} />
      );
    });

    expect(container.textContent).toContain("Playlist: Test Playlist");
  });
});
