/** @jest-environment jsdom */
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { Profile } from "../../components/profile";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("Profile", () => {
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

  it("renders follower count when followers data is missing", async () => {
    const profile = {
      display_name: "Test User",
      images: [],
      id: "user-id",
      email: "test@example.com",
      uri: "spotify:user:user-id",
      external_urls: { spotify: "https://spotify.com" },
      href: "https://api.spotify.com/v1/users/user-id",
    } as any;

    await act(async () => {
      root.render(<Profile profile={profile} />);
    });

    expect(container.textContent).toContain("Followers: 0");
  });
});
