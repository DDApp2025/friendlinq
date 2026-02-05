import type {
  ApiResponse,
  CustomerData,
  LoginPayload,
  LoginResponseData,
  RegistrationResponseData,
  SignupPayload,
} from './types';
import { getDevUserByEmailAndPassword, DEV_USERS } from '../constants/devUser';

/**
 * DEV ONLY: match email+password to a dev user. Login page handles DEV locally; this is fallback.
 */
function getDevCustomerData(payload?: LoginPayload): CustomerData | null {
  if (!import.meta.env.DEV || !payload?.email) return null;
  const u = getDevUserByEmailAndPassword(payload.email, payload.password || '');
  if (!u) return null;
  return {
    _id: u._id,
    fullName: u.fullName,
    email: u.email,
    accessToken: u.accessToken,
    imageURL: u.imageURL,
  };
}

export async function login(
  payload: LoginPayload
): Promise<ApiResponse<LoginResponseData>> {
  if (import.meta.env.DEV) {
    const customerData = getDevCustomerData(payload);
    if (customerData) return { message: 'Success', data: { customerData } };
    return { message: 'Invalid email or password.', data: null };
  }
  return { message: 'Login not available.', data: null };
}

export async function signup(
  _payload: SignupPayload
): Promise<ApiResponse<RegistrationResponseData>> {
  const u = import.meta.env.DEV ? DEV_USERS[0] : null;
  const customerData = u
    ? { _id: u._id, fullName: u.fullName, email: u.email, accessToken: u.accessToken, imageURL: u.imageURL }
    : ({} as CustomerData);
  return { message: 'Success', data: { customerData } };
}

export async function forgotPassword(
  _email: string
): Promise<ApiResponse<null>> {
  return {
    message: 'Success',
    data: null,
  };
}
