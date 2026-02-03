/** Backend login payload – matches CustomerRoute.js validate.payload */
export interface LoginPayload {
  email: string;
  password: string;
  deviceType: 'IOS' | 'ANDROID';
  deviceToken: string;
  latitude: number;
  longitude: number;
}

/** Backend success response wrapper */
export interface ApiResponse<T> {
  statusCode?: number;
  message: string;
  data: T | null;
}

/** Login response data – controller returns { customerData } */
export interface LoginResponseData {
  customerData: CustomerData;
}

export interface CustomerData {
  _id?: string;
  email?: string;
  fullName?: string;
  accessToken?: string;
  [key: string]: unknown;
}

/** Backend registration payload – matches CustomerRoute.js customerRegister.validate.payload */
export interface SignupPayload {
  fullName?: string;
  email: string;
  password: string;
  age?: number;
  country?: string;
  gender?: string;
  deviceType: 'IOS' | 'ANDROID';
  deviceToken?: string;
  usertype?: string;
}

/** Registration response – controller returns { customerData } */
export interface RegistrationResponseData {
  customerData: CustomerData;
}
