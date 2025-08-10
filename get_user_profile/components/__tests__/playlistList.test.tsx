/** @jest-environment jsdom */
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { PlaylistList } from "../playlistList";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("PlaylistList", () => {
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

  it("renders playlists when provided", async () => {
    const playlists = { items: [{ id: "1", name: "Mix", images: [] }] } as any;
    const onSelect = jest.fn();
    await act(async () => {
      root.render(<PlaylistList playlists={playlists} onSelect={onSelect} />);
    });
    expect(container.textContent).toContain("Mix");
  });

  it("handles missing playlists", async () => {
    const onSelect = jest.fn();
    await act(async () => {
      root.render(<PlaylistList onSelect={onSelect} />);
    });
    expect(container.textContent).toContain("No playlists found");
  });
});
