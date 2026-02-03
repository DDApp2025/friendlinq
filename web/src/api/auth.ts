import type {
  ApiResponse,
  LoginPayload,
  LoginResponseData,
  RegistrationResponseData,
  SignupPayload,
} from './types';

const BASE = '/api';

/** Turn fetch/network failures into a clear message for the UI */
function toConnectionMessage(err: unknown): string {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return 'Cannot reach the server. Use "npm run dev" so the dev proxy can forward /api to the backend, or check the backend is running and reachable.';
  }
  if (err instanceof Error) return err.message;
  return 'Network or server error. Check the console for details.';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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

/** POST /api/v1/user/login – backend contract from CustomerRoute.js */
export async function login(payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> {
  return request<LoginResponseData>('/v1/user/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** POST /api/v1/user/registration – backend contract from CustomerRoute.js customerRegister */
export async function signup(
  payload: SignupPayload
): Promise<ApiResponse<RegistrationResponseData>> {
  return request<RegistrationResponseData>('/v1/user/registration', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** POST /api/v1/user/forgotPassword – backend contract from CustomerRoute.js */
export async function forgotPassword(email: string): Promise<ApiResponse<null>> {
  return request<null>('/v1/user/forgotPassword', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim() }),
  });
}
