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

export interface ChatMessage {
  _id?: string;
  senderId?: { _id?: string; fullName?: string; imageURL?: { original?: string } };
  receiverId?: { _id?: string; fullName?: string; imageURL?: { original?: string } };
  textMessage?: string;
  imageURL?: { original?: string };
  videoURL?: string;
  createdAt?: string;
  isRead?: boolean;
}

export interface GetChatMessageResponseData {
  totalCount: number;
  chatData: ChatMessage[];
}

/** GET /api/v1/chat/getChatMessage – query receiverId, skip, limit */
export async function getChatMessages(
  receiverId: string,
  skip: number,
  limit: number,
  accessToken: string
): Promise<ApiResponse<GetChatMessageResponseData>> {
  return requestWithAuth<GetChatMessageResponseData>(
    `/v1/chat/getChatMessage?receiverId=${encodeURIComponent(receiverId)}&skip=${skip}&limit=${limit}`,
    accessToken,
    { method: 'GET' }
  );
}

/** POST /api/v1/chat/sendMessage – payload { receiverId, textMessage } */
export async function sendChatMessage(
  receiverId: string,
  textMessage: string,
  accessToken: string
): Promise<ApiResponse<{ chatData?: ChatMessage }>> {
  return requestWithAuth<{ chatData?: ChatMessage }>('/v1/chat/sendMessage', accessToken, {
    method: 'POST',
    body: JSON.stringify({ receiverId, textMessage: textMessage.trim() }),
  });
}
