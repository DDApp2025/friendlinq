import type {
  ApiResponse,
  CustomerData,
  LoginPayload,
  LoginResponseData,
  RegistrationResponseData,
  SignupPayload,
} from './types';

/**
 * FRONTEND-ONLY DEMO MODE
 * Backend auth is intentionally bypassed.
 */

export async function login(
  _payload: LoginPayload
): Promise<ApiResponse<LoginResponseData>> {
  const customerData: CustomerData = {
    _id: 'dev-user',
    fullName: 'Dev User',
    email: 'dev@local.test',
    accessToken: 'dev-token',
  };

  localStorage.setItem('token', 'dev-token');
  localStorage.setItem('userData', JSON.stringify(customerData));

  return {
    message: 'Success',
    data: { customerData },
  };
}

export async function signup(
  _payload: SignupPayload
): Promise<ApiResponse<RegistrationResponseData>> {
  const customerData: CustomerData = {
    _id: 'dev-user',
    email: _payload.email,
    fullName: _payload.fullName,
    accessToken: 'dev-token',
  };
  return {
    message: 'Success',
    data: { customerData },
  };
}

export async function forgotPassword(
  _email: string
): Promise<ApiResponse<null>> {
  return {
    message: 'Success',
    data: null,
  };
}
