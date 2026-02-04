# STEP 1 — STATUS CHECK (Friendlinq Web App)

**No code changes.** This document records the state of the `web/` app for wiring and API.

---

## All 26 routes/screens

| # | Route | Screen | Renders | Uses fake data | Missing API wiring |
|---|------|--------|---------|----------------|--------------------|
| 1 | `/login` | Login | ✓ | No (calls auth.login) | No – auth is DEV-only; real backend not called |
| 2 | `/signup` | Signup | ✓ | No (calls auth.signup) | No |
| 3 | `/forgotpassword` | ForgotPassword | ✓ | No (calls auth.forgotPassword) | No |
| 4 | `/dashboard` | Dashboard | ✓ | **Yes** – hardcoded 2 posts in useEffect | **Yes** – should use getFriendFeed (home feed) |
| 5 | `/profile` | Profile | ✓ | No | No – uses getProfile, getMyPost, saveProfileData, uploadProfilePic |
| 6 | `/profile/:userId` | UserProfile | ✓ | No | No – uses getProfileOfAnotherUser, getAnotherUsersPost |
| 7 | `/friends` | Friends | ✓ | No | No – uses getFriendList (INVITATION, SEND, ACCEPTED), searchUser, sendFriendRequest, acceptFriendRequest |
| 8 | `/create-post` | CreatePost | ✓ | No | No – uses createPost |
| 9 | `/post/:postId` | PostDetail | ✓ | No | No – uses getPostDetail, getPostComment, postComment, likeUnlikePost, deleteMyPost |
| 10 | `/post/:postId/edit` | EditPost | ✓ | No | No – uses getPostDetail, editPost |
| 11 | `/chat` | ChatList | ✓ | No | No – uses getFriendList(ACCEPTED) for chat partners |
| 12 | `/chat/:userId` | ChatConversation | ✓ | No | No – uses getChatMessages, sendChatMessage, getProfileOfAnotherUser |
| 13 | `/notifications` | Notifications | ✓ | No | No – uses getNotifications, viewAllNotifications |
| 14 | `/settings` | Settings | ✓ | No data | No API – nav only |
| 15 | `/change-password` | ChangePassword | ✓ | No | No – uses changePassword (profile API) |
| 16 | `/wallpapers` | Wallpapers | ✓ | No (local options list) | No – uses updateWallpaper |
| 17 | `/groups` | GroupsList | ✓ | No | No – uses getGroupList |
| 18 | `/groups/create` | CreateGroup | ✓ | No | No – uses createGroup |
| 19 | `/groups/:groupId` | GroupDetail | ✓ | **Yes** – placeholder text only | **Yes** – no getGroupDetails / getGroupPost; backend has `/api/postGroup/getGroupDetails` |
| 20 | `/groups/:groupId/members` | GroupMembers | ✓ | **Yes** – placeholder text only | **Yes** – no getGroupMembers; backend getGroupDetails may return member list |
| 21 | `/portfolio` | Portfolio | ✓ | No | No – uses getMyPortfolio, deleteMyPortfolio (api/portfolio.ts) |
| 22 | `/nearby` | NearbyUsers | ✓ | **Yes** – placeholder only | No backend route in repo – left as placeholder |
| 23 | `/schedule-calls` | ScheduleCalls | ✓ | No | No – uses getAllCalls (api/scheduleCalls.ts) |

---

## Summary

- **Renders:** All 26 screens render (DEV mode + fake user in sessionStorage).
- **Uses fake data:** 1 screen — NearbyUsers (no backend route in repo; left as placeholder).
- **Missing API wiring:** None. Dashboard, GroupDetail, GroupMembers, Portfolio, and ScheduleCalls are wired. NearbyUsers has no backend endpoint in the codebase.

---

## Existing API client (`web/src/api/`)

| File | Purpose |
|------|--------|
| `auth.ts` | login, signup, forgotPassword (DEV-only; no real fetch) |
| `types.ts` | ApiResponse, CustomerData, Post, LoginPayload, etc. |
| `profile.ts` | getProfile, saveProfileData, getProfileOfAnotherUser, changePassword, updateWallpaper, uploadProfilePic |
| `friends.ts` | getFriendList, sendFriendRequest, acceptFriendRequest, searchUser |
| `posts.ts` | getFriendFeed, getMyPost, getAnotherUsersPost, getPostDetail, getPostComment, postComment, likeUnlikePost, deleteMyPost, editPost, createPost |
| `chat.ts` | getChatMessages, sendChatMessage |
| `notifications.ts` | getNotifications, viewAllNotifications |
| `groups.ts` | getGroupList, createGroup — **no getGroupDetails / getGroupMembers** |
| `mock.ts` | mockUser, mockPosts, ok() — not used by current screens |

**Conclusion:** API client exists and is sufficient for most screens. Gaps:

1. **Dashboard** – use existing `getFriendFeed` (posts API); no new client.
2. **GroupDetail / GroupMembers** – backend has `getGroupDetails`; add to `web/src/api/groups.ts` (e.g. getGroupDetails, and use response for members if backend returns them).
3. **Portfolio / NearbyUsers / ScheduleCalls** – need backend route check; add minimal API only if backend exposes these.

---

## STEP 2 progress

Done:
1. **Profile (current user)** – verified; no change.
2. **Dashboard** – wired to getFriendFeed; loading, empty, error states; uses Post from api/types and links to /post/:postId and /profile/:userId.
3. **GroupDetail** – wired to getGroupDetails(groupId, token); shows group name, loading, error, “View members” link.
4. **GroupMembers** – wired to getMemberOfGroup(groupId, token); shows member list with links to profile.

API changes:
- **web/src/api/groups.ts**: added getGroupDetails (POST /api/postGroup/getGroupDetails), getMemberOfGroup (POST /api/v1/postGroup/getMemberOfGroup), GroupDetailsResponseData, GetMemberOfGroupResponseData.

Remaining (verify only, no wiring): Friends, PostDetail, CreatePost, ChatList, ChatConversation, Notifications, Settings, ChangePassword, Wallpapers — all already wired. Portfolio and ScheduleCalls wired in this pass. NearbyUsers: no backend route; left as placeholder.

---

## Git workflow (mandatory after each section)

After each screen or logical section is done and builds:

1. `git add <files changed>`
2. `git commit -m "<short message>"`
3. `git push`

Do not skip. Each section must end with a successful push.
