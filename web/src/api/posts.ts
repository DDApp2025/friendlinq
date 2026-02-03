import type {
  ApiResponse,
  FeedResponseData,
  PostDetailResponseData,
  GetPostCommentResponseData,
  Post,
} from './types';

const BASE = '/api';

function toConnectionMessage(err: unknown): string {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return 'Cannot reach the server. Use "npm run dev" so the dev proxy can forward /api to the backend.';
  }
  if (err instanceof Error) return err.message;
  return 'Network or server error.';
}

/** Authenticated request – backend expects header "authorization" with token */
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

/** POST /api/post/getAllFriendsPost – backend PostRoute.js getAllFriendsPost */
export async function getFriendFeed(
  skip: number,
  limit: number,
  accessToken: string
): Promise<ApiResponse<FeedResponseData>> {
  return requestWithAuth<FeedResponseData>('/post/getAllFriendsPost', accessToken, {
    method: 'POST',
    body: JSON.stringify({ skip, limit }),
  });
}

/** POST /api/post/getMyPost – backend PostRoute.js getMyPost */
export async function getMyPost(
  skip: number,
  limit: number,
  accessToken: string
): Promise<ApiResponse<FeedResponseData>> {
  return requestWithAuth<FeedResponseData>('/post/getMyPost', accessToken, {
    method: 'POST',
    body: JSON.stringify({ skip, limit }),
  });
}

/** POST /api/post/getAnotherUsersPost – payload { userToId, skip, limit } */
export async function getAnotherUsersPost(
  userToId: string,
  skip: number,
  limit: number,
  accessToken: string
): Promise<ApiResponse<FeedResponseData>> {
  return requestWithAuth<FeedResponseData>('/post/getAnotherUsersPost', accessToken, {
    method: 'POST',
    body: JSON.stringify({ userToId, skip, limit }),
  });
}

/** POST /api/post/postDetail – payload { postId } */
export async function getPostDetail(
  postId: string,
  accessToken: string
): Promise<ApiResponse<PostDetailResponseData>> {
  return requestWithAuth<PostDetailResponseData>('/post/postDetail', accessToken, {
    method: 'POST',
    body: JSON.stringify({ postId }),
  });
}

/** POST /api/post/getPostComment – payload { postId, skip, limit } */
export async function getPostComment(
  postId: string,
  skip: number,
  limit: number,
  accessToken: string
): Promise<ApiResponse<GetPostCommentResponseData>> {
  return requestWithAuth<GetPostCommentResponseData>('/post/getPostComment', accessToken, {
    method: 'POST',
    body: JSON.stringify({ postId, skip, limit }),
  });
}

/** POST /api/v1/post/postComment – payload { postId, commentText, parentId? } */
export async function postComment(
  postId: string,
  commentText: string,
  accessToken: string,
  parentId?: string
): Promise<ApiResponse<{ comment: unknown }>> {
  return requestWithAuth<{ comment: unknown }>('/v1/post/postComment', accessToken, {
    method: 'POST',
    body: JSON.stringify({ postId, commentText: commentText.trim(), ...(parentId && { parentId }) }),
  });
}

/** POST /api/v1/post/likeUnlikePost – payload { postId, isLike } */
export async function likeUnlikePost(
  postId: string,
  isLike: boolean,
  accessToken: string
): Promise<ApiResponse<null>> {
  return requestWithAuth<null>('/v1/post/likeUnlikePost', accessToken, {
    method: 'POST',
    body: JSON.stringify({ postId, isLike }),
  });
}

/** POST /api/post/deleteMyPost – payload { postId } */
export async function deleteMyPost(
  postId: string,
  accessToken: string
): Promise<ApiResponse<null>> {
  return requestWithAuth<null>('/post/deleteMyPost', accessToken, {
    method: 'POST',
    body: JSON.stringify({ postId }),
  });
}

/** PUT /api/v1/post/editPost – multipart: postId, postTitle, postContent, isMediaFileUploaded?, isMediaTypeVideo?, mediaFile? */
export async function editPost(
  formData: FormData,
  accessToken: string
): Promise<ApiResponse<Post>> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/v1/post/editPost`, {
      method: 'PUT',
      headers: { authorization: accessToken },
      body: formData,
    });
  } catch (err) {
    throw new Error(toConnectionMessage(err));
  }
  const text = await res.text();
  let json: ApiResponse<Post>;
  try {
    json = JSON.parse(text) as ApiResponse<Post>;
  } catch {
    throw new Error(res.ok ? 'Invalid response' : `HTTP ${res.status}`);
  }
  if (!res.ok) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json;
}

/** POST /api/v1/post/createPost – multipart: postTitle, postContent, postType, isMediaFileUploaded, isMediaTypeVideo, mediaFile? */
export async function createPost(
  formData: FormData,
  accessToken: string
): Promise<ApiResponse<Post>> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/v1/post/createPost`, {
      method: 'POST',
      headers: { authorization: accessToken },
      body: formData,
    });
  } catch (err) {
    throw new Error(toConnectionMessage(err));
  }
  const text = await res.text();
  let json: ApiResponse<Post>;
  try {
    json = JSON.parse(text) as ApiResponse<Post>;
  } catch {
    throw new Error(res.ok ? 'Invalid response' : `HTTP ${res.status}`);
  }
  if (!res.ok) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json;
}
