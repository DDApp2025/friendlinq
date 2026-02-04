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

/** Schedule call item – matches backend ScheduleCall schema */
export interface ScheduleCallItem {
  _id?: string;
  title?: string;
  channelId?: string;
  scheduleDate?: string;
  scheduleTime?: string;
  callType?: string;
  isEnded?: boolean;
  inviteLink?: string;
  hostId?: string;
  memberEmails?: string[];
  memberNames?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** GET /api/v1/call/allList – returns list of scheduled calls; backend may return array as data */
export async function getAllCalls(accessToken: string): Promise<ApiResponse<ScheduleCallItem[]>> {
  return requestWithAuth<ScheduleCallItem[]>('/v1/call/allList', accessToken, { method: 'GET' });
}
