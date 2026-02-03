import type {
  ApiResponse,
  GetFriendListResponseData,
  SearchUserResponseData,
} from './types';
import { FRIEND_LIST_STATUS } from './types';

const BASE = '/api';

function toConnectionMessage(err: unknown): string {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return 'Cannot reach the server. Use "npm run dev" so the dev proxy can forward /api to the backend.';
  }
  if (err instanceof Error) return err.message;
  return 'Network or server error.';
}

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

/** POST /api/user/getFriendList – payload { skip, limit, status } */
export async function getFriendList(
  skip: number,
  limit: number,
  status: keyof typeof FRIEND_LIST_STATUS,
  accessToken: string
): Promise<ApiResponse<GetFriendListResponseData>> {
  return requestWithAuth<GetFriendListResponseData>('/user/getFriendList', accessToken, {
    method: 'POST',
    body: JSON.stringify({ skip, limit, status }),
  });
}

/** POST /api/user/sendFriendRequest – payload { userToId } */
export async function sendFriendRequest(
  userToId: string,
  accessToken: string
): Promise<ApiResponse<null>> {
  return requestWithAuth<null>('/user/sendFriendRequest', accessToken, {
    method: 'POST',
    body: JSON.stringify({ userToId }),
  });
}

/** POST /api/user/acceptFriendRequest – payload { userToId, status } */
export async function acceptFriendRequest(
  userToId: string,
  status: string,
  accessToken: string
): Promise<ApiResponse<null>> {
  return requestWithAuth<null>('/user/acceptFriendRequest', accessToken, {
    method: 'POST',
    body: JSON.stringify({ userToId, status }),
  });
}

/** POST /api/user/searchUser – payload { searchText, skip, limit } */
export async function searchUser(
  searchText: string,
  skip: number,
  limit: number,
  accessToken: string
): Promise<ApiResponse<SearchUserResponseData>> {
  return requestWithAuth<SearchUserResponseData>('/user/searchUser', accessToken, {
    method: 'POST',
    body: JSON.stringify({ searchText: searchText.trim(), skip, limit }),
  });
}
