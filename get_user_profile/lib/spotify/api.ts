export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

export async function spotifyFetch<T>(
  url: string,
  options: RequestInit,
  errorMessage: string,
  parseJson: boolean = true
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      return { data: null, error: errorMessage };
    }
    if (!parseJson || res.status === 204) {
      return { data: null, error: null } as ApiResult<T>;
    }
    const data = (await res.json()) as T;
    return { data, error: null };
  } catch (e: any) {
    return { data: null, error: e?.message || errorMessage };
  }
}
