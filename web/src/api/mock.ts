// web/src/api/mock.ts – DEV only; matches constants/devUser.ts (Julio)
export const mockUser = {
  _id: "dev-user",
  name: "Julio",
  email: "julio@gmail.com",
  profilePic: "",
};

export const mockPosts = [
  {
    _id: "post-1",
    content: "This is a mock post for UI rendering.",
    createdAt: new Date().toISOString(),
    likes: [],
    comments: [],
    user: mockUser,
  },
];

export function ok<T>(data: T) {
  return Promise.resolve({
    success: true,
    message: "OK",
    data,
  });
}
