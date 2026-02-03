import type { ApiResponse, FeedResponseData } from './types';

const BASE = '/api';

function toConnectionMessage(err: unknown): string {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return 'Cannot reach the server. Use "npm run dev" so the dev proxy can forward /api to the backend.';
  }
  if (err instanceof Error) return err.message;
  return 'Network or server error.';
}

/** Authenticated request – backend expects header "authorization" with token */
async function requestWithAuth<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
        ...options.headers,
      },
    });
  } catch (err) {
    throw new Error(toConnectionMessage(err));
  }
  const text = await res.text();
  let json: ApiResponse<T>;
  try {
    json = JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new Error(res.ok ? 'Invalid response' : `HTTP ${res.status}`);
  }
  if (!res.ok) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json;
}

/** POST /api/post/getAllFriendsPost – backend PostRoute.js getAllFriendsPost */
export async function getFriendFeed(
  skip: number,
  limit: number,
  accessToken: string
): Promise<ApiResponse<FeedResponseData>> {
  return requestWithAuth<FeedResponseData>('/post/getAllFriendsPost', accessToken, {
    method: 'POST',
    body: JSON.stringify({ skip, limit }),
  });
}

/** POST /api/post/getMyPost – backend PostRoute.js getMyPost */
export async function getMyPost(
  skip: number,
  limit: number,
  accessToken: string
): Promise<ApiResponse<FeedResponseData>> {
  return requestWithAuth<FeedResponseData>('/post/getMyPost', accessToken, {
    method: 'POST',
    body: JSON.stringify({ skip, limit }),
  });
}

/** POST /api/post/getAnotherUsersPost – payload { userToId, skip, limit } */
export async function getAnotherUsersPost(
  userToId: string,
  skip: number,
  limit: number,
  accessToken: string
): Promise<ApiResponse<FeedResponseData>> {
  return requestWithAuth<FeedResponseData>('/post/getAnotherUsersPost', accessToken, {
    method: 'POST',
    body: JSON.stringify({ userToId, skip, limit }),
  });
}
