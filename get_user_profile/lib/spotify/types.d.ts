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

interface SpotifyDevice {
  id: string;
  name: string;
  is_active: boolean;
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
  acousticness: number; // トラックがアコースティックであるかどうかの確信度（0.0〜1.0）。
  analysis_url: string; // このトラックの詳細な音響解析にアクセスするためのURL。
  danceability: number; // ダンスに適した度合い。
  duration_ms: number; // トラックの再生時間（ミリ秒）。
  energy: number; // 強度と活動性を表す0.0〜1.0の指標。
  id: string; // トラックのSpotify ID。
  instrumentalness: number; // ボーカルが含まれない可能性を予測。
  key: number; // トラックのキー。整数は標準のピッチクラス表記に対応。
  liveness: number; // 録音に聴衆が存在するかを検出。
  loudness: number; // トラック全体のラウドネス（デシベル）。
  mode: number; // トラックのモード（長調または短調）を示す。
  speechiness: number; // トラック内の話し言葉の存在を検出。
  tempo: number; // トラックのおおよそのテンポ（BPM）。
  time_signature: number; // トラックの推定拍子。
  track_href: string; // トラックの詳細を提供するWeb APIエンドポイントへのリンク。
  type: string; // オブジェクトの種類（例：「audio_features」）。
  uri: string; // トラックのSpotify URI。
  valence: number; // トラックが伝えるポジティブさ（0.0〜1.0）。
}
interface SpotifyAudioAnalysisTimeInterval {
  start: number;
  duration: number;
  confidence: number;
}

interface SpotifyAudioAnalysisSection {
  start: number;
  duration: number;
  confidence: number;
  loudness: number;
  tempo: number;
  tempo_confidence: number;
  key: number;
  key_confidence: number;
  mode: number;
  mode_confidence: number;
  time_signature: number;
  time_signature_confidence: number;
}

interface SpotifyAudioAnalysisSegment {
  start: number;
  duration: number;
  confidence: number;
  loudness_start: number;
  loudness_max_time: number;
  loudness_max: number;
  loudness_end: number;
  pitches: number[];
  timbre: number[];
}

interface SpotifyAudioAnalysisTrack {
  num_samples: number;
  duration: number;
  sample_md5: string;
  offset_seconds: number;
  window_seconds: number;
  analysis_sample_rate: number;
  analysis_channels: number;
  end_of_fade_in: number;
  start_of_fade_out: number;
  loudness: number;
  tempo: number;
  tempo_confidence: number;
  time_signature: number;
  time_signature_confidence: number;
  key: number;
  key_confidence: number;
  mode: number;
  mode_confidence: number;
  codestring: string;
  code_version: number;
  echoprintstring: string;
  echoprint_version: number;
  synchstring: string;
  synch_version: number;
  rhythmstring: string;
  rhythm_version: number;
}

interface SpotifyAudioAnalysisResponse {
  bars: SpotifyAudioAnalysisTimeInterval[];
  beats: SpotifyAudioAnalysisTimeInterval[];
  sections: SpotifyAudioAnalysisSection[];
  segments: SpotifyAudioAnalysisSegment[];
  tatums: SpotifyAudioAnalysisTimeInterval[];
  track: SpotifyAudioAnalysisTrack;
}
