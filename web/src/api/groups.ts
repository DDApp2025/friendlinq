import type { ApiResponse } from './types';

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
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  headers.set('authorization', token);
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
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

export interface GroupItem {
  _id?: string;
  groupName?: string;
  createdBy?: string;
}

export interface GetGroupListResponseData {
  totalCount?: number;
  groupList?: GroupItem[];
}

/** Backend getGroupDetails returns group info */
export interface GroupDetailsResponseData {
  group?: GroupItem;
  groupMemberList?: { _id?: string; groupMemberId?: { _id?: string; fullName?: string }; [key: string]: unknown }[];
}

/** Backend getMemberOfGroup returns { totalCount, groupMemberList } */
export interface GetMemberOfGroupResponseData {
  totalCount: number;
  groupMemberList: { _id?: string; groupMemberId?: { _id?: string; fullName?: string }; [key: string]: unknown }[];
}

/** GET /api/v1/postGroup/getGroupList – query skip, limit */
export async function getGroupList(
  skip: number,
  limit: number,
  accessToken: string
): Promise<ApiResponse<GetGroupListResponseData>> {
  return requestWithAuth<GetGroupListResponseData>(
    `/v1/postGroup/getGroupList?skip=${skip}&limit=${limit}`,
    accessToken,
    { method: 'GET' }
  );
}

/** POST /api/v1/postGroup/createGroup – payload { groupName } */
export async function createGroup(
  groupName: string,
  accessToken: string
): Promise<ApiResponse<GroupItem>> {
  return requestWithAuth<GroupItem>('/v1/postGroup/createGroup', accessToken, {
    method: 'POST',
    body: JSON.stringify({ groupName: groupName.trim() }),
  });
}

/** POST /api/postGroup/getGroupDetails – payload { groupId } */
export async function getGroupDetails(
  groupId: string,
  accessToken: string
): Promise<ApiResponse<GroupDetailsResponseData>> {
  return requestWithAuth<GroupDetailsResponseData>('/postGroup/getGroupDetails', accessToken, {
    method: 'POST',
    body: JSON.stringify({ groupId }),
  });
}

/** POST /api/v1/postGroup/getMemberOfGroup – payload { groupId } */
export async function getMemberOfGroup(
  groupId: string,
  accessToken: string
): Promise<ApiResponse<GetMemberOfGroupResponseData>> {
  return requestWithAuth<GetMemberOfGroupResponseData>('/v1/postGroup/getMemberOfGroup', accessToken, {
    method: 'POST',
    body: JSON.stringify({ groupId }),
  });
}
