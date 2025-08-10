export interface UserProfile {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: { spotify: string };
  followers?: { href: string; total: number };
  href: string;
  id: string;
  images: Image[];
  product: string;
  type: string;
  uri: string;
}

export interface Image {
  url: string;
  height: number;
  width: number;
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_SPOTIFY_CLIENT_ID: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify: any;
  }
}

export {};
