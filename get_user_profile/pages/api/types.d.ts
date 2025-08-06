interface UserProfile {
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

interface Image {
  url: string;
  height: number;
  width: number;
}

interface ImportMetaEnv {
  readonly VITE_SPOTIFY_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface SpotifyPlaylistsResponse {
  href: string;
  items: SpotifyPlaylistResponse[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

interface SpotifyPlaylistResponse {
  collaborative: boolean;
  description: string | null;
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  href: string;
  id: string;
  images: SpotifyImageObject[];
  name: string;
  owner: SpotifyUserObject;
  public: boolean | null;
  snapshot_id: string;
  tracks?: SpotifyPlaylistTracksResponse;
  type: string;
  uri: string;
}

interface SpotifyImageObject {
  url: string;
  height: number | null;
  width: number | null;
}

interface SpotifyUserObject {
  external_urls: {
    spotify: string;
  };
  followers?: {
    href: string | null;
    total: number;
  };
  href: string;
  id: string;
  type: string;
  uri: string;
  display_name: string | null;
}

interface SpotifyPlaylistTracksResponse {
  href: string;
  items: SpotifyPlaylistTrackObject[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

interface SpotifyPlaylistTrackObject {
  added_at: string;
  added_by: SpotifyUserObject;
  is_local: boolean;
  track: SpotifyTrackObject;
}

interface SpotifyTrackObject {
  album: SpotifyAlbumObject;
  artists: SpotifyArtistObject[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc: string;
    ean: string;
    upc: string;
  };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_playable: boolean;
  linked_from: object;
  restrictions: {
    reason: string;
  };
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

interface SpotifyAlbumObject {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: SpotifyImageObject[];
  name: string;
  release_date: string;
  release_date_precision: string;
  restrictions: {
    reason: string;
  };
  type: string;
  uri: string;
}

interface SpotifyArtistObject {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
  followers?: {
    total: number;
  };
  genres?: string[];
  images?: SpotifyImageObject[];
  popularity?: number;
}

interface SpotifyAudioFeaturesResponse {
  acousticness: number; // A confidence measure from 0.0 to 1.0 of whether the track is acoustic.
  analysis_url: string; // A URL to access the full audio analysis of this track.
  danceability: number; // Danceability describes how suitable a track is for dancing.
  duration_ms: number; // The duration of the track in milliseconds.
  energy: number; // Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity.
  id: string; // The Spotify ID for the track.
  instrumentalness: number; // Predicts whether a track contains no vocals.
  key: number; // The key the track is in. Integers map to pitches using standard Pitch Class notation.
  liveness: number; // Detects the presence of an audience in the recording.
  loudness: number; // The overall loudness of a track in decibels (dB).
  mode: number; // Mode indicates the modality (major or minor) of a track.
  speechiness: number; // Speechiness detects the presence of spoken words in a track.
  tempo: number; // The overall estimated tempo of a track in beats per minute (BPM).
  time_signature: number; // An estimated time signature of the track.
  track_href: string; // A link to the Web API endpoint providing full details of the track.
  type: string; // The object type, e.g., "audio_features".
  uri: string; // The Spotify URI for the track.
  valence: number; // A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track.
}
