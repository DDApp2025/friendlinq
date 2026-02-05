import type {
  ApiResponse,
  CustomerData,
  GetFriendListResponseData,
  SearchUserResponseData,
} from './types';
import { FRIEND_LIST_STATUS } from './types';
import { DEV_USERS, LOGGED_IN_USER_KEY } from '../constants/devUser'

const BASE = '/api'

/** DEV-only: localStorage key for friend relationships. */
const DEV_FRIEND_RELATIONSHIPS_KEY = 'DEV_FRIEND_RELATIONSHIPS'

type DevRelationshipStatus = 'SEND' | 'ACCEPTED'

interface DevRelationship {
  fromUserId: string
  toUserId: string
  status: DevRelationshipStatus
}

function getDevRelationships(): DevRelationship[] {
  try {
    const raw = localStorage.getItem(DEV_FRIEND_RELATIONSHIPS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as DevRelationship[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function setDevRelationships(list: DevRelationship[]) {
  try {
    localStorage.setItem(DEV_FRIEND_RELATIONSHIPS_KEY, JSON.stringify(list))
  } catch {
    // ignore
  }
}

function getCurrentUserIdFromStorage(): string | null {
  try {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw) return null
    const u = JSON.parse(raw) as { _id?: string }
    return u._id ?? null
  } catch {
    return null
  }
}

function devUserIdToCustomerData(userId: string): CustomerData | null {
  const u = DEV_USERS.find((x) => x._id === userId)
  if (!u) return null
  return { _id: u._id, fullName: u.fullName, email: u.email, imageURL: u.imageURL }
}

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
  if (import.meta.env.DEV) {
    const currentId = getCurrentUserIdFromStorage()
    if (!currentId) {
      return Promise.resolve({ message: 'Success', data: { totalCount: 0, friendList: [] } })
    }
    const list = getDevRelationships()
    let friendIds: string[] = []
    if (status === FRIEND_LIST_STATUS.ACCEPTED) {
      friendIds = list
        .filter((r) => r.status === 'ACCEPTED' && (r.fromUserId === currentId || r.toUserId === currentId))
        .map((r) => (r.fromUserId === currentId ? r.toUserId : r.fromUserId))
    } else if (status === FRIEND_LIST_STATUS.SEND) {
      friendIds = list
        .filter((r) => r.fromUserId === currentId && r.status === 'SEND')
        .map((r) => r.toUserId)
    } else if (status === FRIEND_LIST_STATUS.INVITATION) {
      friendIds = list
        .filter((r) => r.toUserId === currentId && r.status === 'SEND')
        .map((r) => r.fromUserId)
    }
    const uniq = [...new Set(friendIds)]
    const friendList = uniq
      .map((id) => devUserIdToCustomerData(id))
      .filter((u): u is CustomerData => u != null)
      .slice(skip, skip + limit)
    return Promise.resolve({
      message: 'Success',
      data: { totalCount: uniq.length, friendList },
    })
  }
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
  if (import.meta.env.DEV) {
    const currentId = getCurrentUserIdFromStorage()
    if (!currentId || !userToId) return Promise.resolve({ message: 'Failed', data: null })
    const list = getDevRelationships()
    const already = list.some(
      (r) =>
        r.status === 'ACCEPTED' &&
        ((r.fromUserId === currentId && r.toUserId === userToId) || (r.fromUserId === userToId && r.toUserId === currentId))
    )
    if (already) return Promise.resolve({ message: 'Success', data: null })
    const sendExists = list.some((r) => r.fromUserId === currentId && r.toUserId === userToId && r.status === 'SEND')
    if (sendExists) return Promise.resolve({ message: 'Success', data: null })
    list.push({ fromUserId: currentId, toUserId: userToId, status: 'ACCEPTED' })
    list.push({ fromUserId: userToId, toUserId: currentId, status: 'ACCEPTED' })
    setDevRelationships(list)
    return Promise.resolve({ message: 'Success', data: null })
  }
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
  if (import.meta.env.DEV) {
    const currentId = getCurrentUserIdFromStorage()
    if (!currentId || !userToId) return Promise.resolve({ message: 'Failed', data: null })
    const list = getDevRelationships()
    if (status === 'ACCEPTED') {
      const withoutSend = list.filter(
        (r) =>
          !(r.fromUserId === userToId && r.toUserId === currentId && r.status === 'SEND') &&
          !(r.fromUserId === currentId && r.toUserId === userToId && r.status === 'SEND')
      )
      withoutSend.push({ fromUserId: userToId, toUserId: currentId, status: 'ACCEPTED' })
      withoutSend.push({ fromUserId: currentId, toUserId: userToId, status: 'ACCEPTED' })
      setDevRelationships(withoutSend)
    } else {
      const withoutInvite = list.filter(
        (r) => !(r.fromUserId === userToId && r.toUserId === currentId && r.status === 'SEND')
      )
      setDevRelationships(withoutInvite)
    }
    return Promise.resolve({ message: 'Success', data: null })
  }
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
  if (import.meta.env.DEV) {
    const q = searchText.trim().toLowerCase()
    const currentId = getCurrentUserIdFromStorage()
    const list = getDevRelationships()
    const acceptedIds = new Set(
      list
        .filter((r) => r.status === 'ACCEPTED' && (r.fromUserId === currentId || r.toUserId === currentId))
        .map((r) => (r.fromUserId === currentId ? r.toUserId : r.fromUserId))
    )
    const sendIds = new Set(
      list.filter((r) => r.fromUserId === currentId && r.status === 'SEND').map((r) => r.toUserId)
    )
    const candidates = DEV_USERS.filter((u) => u._id !== currentId).map((u) => {
      const match =
        q === '' ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        q.includes(u.fullName.toLowerCase()) ||
        q.includes(u.email.toLowerCase().split('@')[0] ?? '')
      if (!match) return null
      return {
        ...devUserIdToCustomerData(u._id),
        isFriend: acceptedIds.has(u._id),
        isFriendRequestSend: sendIds.has(u._id),
      } as (CustomerData & { isFriend?: boolean; isFriendRequestSend?: boolean }) | null
    }).filter((u): u is CustomerData & { isFriend?: boolean; isFriendRequestSend?: boolean } => u != null)
    const customerData = candidates.slice(skip, skip + limit)
    return Promise.resolve({
      message: 'Success',
      data: { totalCount: candidates.length, customerData },
    })
  }
  return requestWithAuth<SearchUserResponseData>('/user/searchUser', accessToken, {
    method: 'POST',
    body: JSON.stringify({ searchText: searchText.trim(), skip, limit }),
  });
}
