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

/** Feed response – PostController.getAllFriendsPost returns { totalMyPost, myPost } */
export interface FeedResponseData {
  totalMyPost: number;
  myPost: Post[];
}

export interface PostAuthor {
  _id?: string;
  fullName?: string;
  imageURL?: { original?: string; [key: string]: unknown };
}

export interface Post {
  _id?: string;
  postContent?: string;
  postAuthor?: PostAuthor;
  imageURL?: { original?: string | null; [key: string]: unknown };
  videoURL?: string | null;
  totalLike?: number;
  totalComment?: number;
  isLike?: boolean;
  sensitive?: boolean;
  createdAt?: string;
  comment?: PostComment[];
}

export interface PostComment {
  commentText?: string;
  commentAuthor?: PostAuthor;
}

/** GET /api/user/getProfile – controller returns { customerData, topFourFriend } */
export interface GetProfileResponseData {
  customerData: CustomerData;
  topFourFriend?: unknown[];
}

/** POST /api/v1/user/saveProfileData – payload (backend Joi) */
export interface SaveProfilePayload {
  fullName?: string;
  country?: string;
  city?: string;
  state?: string;
  phoneNumber?: string;
  about?: string;
  gender?: string;
}
