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

/** Portfolio item – backend returns imageURL, thumbnailURL, fileType, isSelected (from getMyPortfolio) */
export interface PortfolioItem {
  _id?: string;
  userId?: string;
  imageURL?: string;
  thumbnailURL?: string;
  fileType?: number;
  isSelected?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Backend getMyPortfolio returns { myPortolio: PortfolioItem[] } (typo in backend) */
export interface GetMyPortfolioResponseData {
  myPortolio?: PortfolioItem[];
}

/** POST /api/v1/post/getMyPortfolio – payload { skip, limit } */
export async function getMyPortfolio(
  skip: number,
  limit: number,
  accessToken: string
): Promise<ApiResponse<GetMyPortfolioResponseData>> {
  return requestWithAuth<GetMyPortfolioResponseData>('/v1/post/getMyPortfolio', accessToken, {
    method: 'POST',
    body: JSON.stringify({ skip, limit }),
  });
}

/** POST /api/v1/post/deleteMyPortfolio – payload { portfolioId } */
export async function deleteMyPortfolio(
  portfolioId: string,
  accessToken: string
): Promise<ApiResponse<null>> {
  return requestWithAuth<null>('/v1/post/deleteMyPortfolio', accessToken, {
    method: 'POST',
    body: JSON.stringify({ portfolioId }),
  });
}
