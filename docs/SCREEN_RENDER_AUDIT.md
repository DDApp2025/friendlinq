# Screen Render Audit

Generated from `web/src/routeConfig.ts` and `web/src/App.tsx`.  
In DEV, open **http://localhost:5173/dev** to see the Screen Gallery with green/red status per screen.

| path | component file path | status |
|------|---------------------|--------|
| /dev | pages/DevScreenGallery.tsx | OK |
| /login | pages/Login.tsx | OK |
| /signup | pages/Signup.tsx | OK |
| /forgotpassword | pages/ForgotPassword.tsx | OK |
| /dashboard | pages/Dashboard.tsx | OK |
| /profile | pages/Profile.tsx | OK |
| /profile/:userId | pages/UserProfile.tsx | OK |
| /friends | pages/Friends.tsx | OK |
| /create-post | pages/CreatePost.tsx | OK |
| /post/:postId | pages/PostDetail.tsx | OK |
| /post/:postId/edit | pages/EditPost.tsx | OK |
| /chat | pages/ChatList.tsx | OK |
| /chat/:userId | pages/ChatConversation.tsx | OK |
| /notifications | pages/Notifications.tsx | OK |
| /settings | pages/Settings.tsx | OK |
| /change-password | pages/ChangePassword.tsx | OK |
| /wallpapers | pages/Wallpapers.tsx | OK |
| /groups | pages/GroupsList.tsx | OK |
| /groups/create | pages/CreateGroup.tsx | OK |
| /groups/:groupId | pages/GroupDetail.tsx | OK |
| /groups/:groupId/members | pages/GroupMembers.tsx | OK |
| /portfolio | pages/Portfolio.tsx | OK |
| /nearby | pages/NearbyUsers.tsx | OK |
| /schedule-calls | pages/ScheduleCalls.tsx | OK |

**Definition of broken:** route exists but blank/white, component import fails, runtime error, page redirects away, or screen not reachable.  
**Fix:** All screens use DEV bypass (getStoredUser() mock, navigateToLogin no-op, mock API). PageErrorBoundary in DEV shows any runtime error with copy button. Gallery shows green when a screen mounts successfully and red when the boundary catches an error.
