/** @jest-environment jsdom */
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { AuthProvider, useAuth } from "../AuthContext";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

describe("AuthProvider", () => {
  let container: HTMLDivElement;
  let root: Root;
  let context: { token: string | null; setToken: (t: string | null) => void };

  const TestComponent = () => {
    context = useAuth();
    return null;
  };

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
    window.localStorage.clear();
  });

  afterAll(() => {
    consoleError.mockRestore();
  });

  it("loads token from localStorage on mount", async () => {
    window.localStorage.setItem("access_token", "stored-token");

    await act(async () => {
      root.render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(context.token).toBe("stored-token");
  });

  it("has null token when localStorage is empty", async () => {
    await act(async () => {
      root.render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(context.token).toBeNull();
  });

  it("handles localStorage access errors gracefully", async () => {
    const spy = jest
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded");
      });

    await act(async () => {
      root.render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(context.token).toBeNull();
    spy.mockRestore();
  });

  it("setToken updates token and localStorage", async () => {
    await act(async () => {
      root.render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await act(async () => {
      context.setToken("new-token");
    });

    expect(context.token).toBe("new-token");
    expect(window.localStorage.getItem("access_token")).toBe("new-token");
  });

  it("setToken(null) clears token and localStorage", async () => {
    window.localStorage.setItem("access_token", "existing");

    await act(async () => {
      root.render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await act(async () => {
      context.setToken(null);
    });

    expect(context.token).toBeNull();
    expect(window.localStorage.getItem("access_token")).toBeNull();
  });

  it("throws error when useAuth is used outside provider", () => {
    const Consumer = () => {
      useAuth();
      return null;
    };

    expect(() => {
      act(() => {
        root.render(<Consumer />);
      });
    }).toThrow("useAuth must be used within an AuthProvider");
  });
});
