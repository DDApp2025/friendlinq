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

export interface NotificationItem {
  _id?: string;
  textMessage?: string;
  notificationType?: string;
  senderId?: { _id?: string; fullName?: string };
  createdAt?: string;
  isRead?: boolean;
  isView?: boolean;
}

export interface GetNotificationResponseData {
  totalCount?: number;
  totalRecord?: number;
  totalUnView: number;
  totalUnRead: number;
  notificationData: NotificationItem[];
}

/** GET /api/v1/notification/getNotification – query skip, limit */
export async function getNotifications(
  skip: number,
  limit: number,
  accessToken: string
): Promise<ApiResponse<GetNotificationResponseData>> {
  return requestWithAuth<GetNotificationResponseData>(
    `/v1/notification/getNotification?skip=${skip}&limit=${limit}`,
    accessToken,
    { method: 'GET' }
  );
}

/** POST /api/v1/notification/viewAllNotification */
export async function viewAllNotifications(accessToken: string): Promise<ApiResponse<{ _id?: string }>> {
  return requestWithAuth<{ _id?: string }>('/v1/notification/viewAllNotification', accessToken, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
