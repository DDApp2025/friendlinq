import type {
  ApiResponse,
  CustomerData,
  GetProfileResponseData,
  SaveProfilePayload,
} from './types';

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
        ...(options.headers as Record<string, string>),
        authorization: token,
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

/** GET /api/user/getProfile – auth required, returns own profile + topFourFriend */
export async function getProfile(accessToken: string): Promise<ApiResponse<GetProfileResponseData>> {
  return requestWithAuth<GetProfileResponseData>('/user/getProfile', accessToken, {
    method: 'GET',
  });
}

/** POST /api/v1/user/saveProfileData – update own profile (backend Joi payload) */
export async function saveProfileData(
  accessToken: string,
  payload: SaveProfilePayload
): Promise<ApiResponse<{ customerData: CustomerData }>> {
  return requestWithAuth<{ customerData: CustomerData }>('/v1/user/saveProfileData', accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** POST /api/user/getProfileofAnotherUser – payload { userId } */
export async function getProfileOfAnotherUser(
  accessToken: string,
  userId: string
): Promise<ApiResponse<GetProfileResponseData>> {
  return requestWithAuth<GetProfileResponseData>('/user/getProfileofAnotherUser', accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
}

/** POST /api/v1/user/changePassword – payload { oldPassword, newPassword } */
export async function changePassword(
  oldPassword: string,
  newPassword: string,
  accessToken: string
): Promise<ApiResponse<null>> {
  return requestWithAuth<null>('/v1/user/changePassword', accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPassword: oldPassword.trim(), newPassword: newPassword.trim() }),
  });
}

/** POST /api/v1/user/updateWallpaperData – payload { wallpaper } */
export async function updateWallpaper(
  wallpaper: string,
  accessToken: string
): Promise<ApiResponse<null>> {
  return requestWithAuth<null>('/v1/user/updateWallpaperData', accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallpaper }),
  });
}

/** POST /api/v1/user/uploadsProfilePic – multipart form field "document" */
export async function uploadProfilePic(
  accessToken: string,
  file: File
): Promise<ApiResponse<CustomerData>> {
  const form = new FormData();
  form.append('document', file);
  let res: Response;
  try {
    res = await fetch(`${BASE}/v1/user/uploadsProfilePic`, {
      method: 'POST',
      headers: { authorization: accessToken },
      body: form,
    });
  } catch (err) {
    throw new Error(toConnectionMessage(err));
  }
  const text = await res.text();
  let json: ApiResponse<CustomerData>;
  try {
    json = JSON.parse(text) as ApiResponse<CustomerData>;
  } catch {
    throw new Error(res.ok ? 'Invalid response' : `HTTP ${res.status}`);
  }
  if (!res.ok) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json;
}

/** POST /api/v1/user/uploadBannerPic – multipart form field "document" */
export async function uploadBannerPic(
  accessToken: string,
  file: File
): Promise<ApiResponse<CustomerData>> {
  const form = new FormData();
  form.append('document', file);
  let res: Response;
  try {
    res = await fetch(`${BASE}/v1/user/uploadBannerPic`, {
      method: 'POST',
      headers: { authorization: accessToken },
      body: form,
    });
  } catch (err) {
    throw new Error(toConnectionMessage(err));
  }
  const text = await res.text();
  let json: ApiResponse<CustomerData>;
  try {
    json = JSON.parse(text) as ApiResponse<CustomerData>;
  } catch {
    throw new Error(res.ok ? 'Invalid response' : `HTTP ${res.status}`);
  }
  if (!res.ok) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json;
}
