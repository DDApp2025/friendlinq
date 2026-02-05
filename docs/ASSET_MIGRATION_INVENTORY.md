# Asset Migration Inventory — Mobile (Angular) → Web (React)

**Scope:** All visual assets (images, icons, emojis) used in the 26 screens.  
**Mobile app:** `mobile/Friendlinq_frontend/` (Angular).  
**Asset root:** `mobile/Friendlinq_frontend/src/assets/images/`

---

## STEP 1 — INVENTORY (RN/Mobile asset usage)

### 1. Login (`mobile/.../public/login/login.component.html`)

| Reference | Line | Resolved asset path |
|-----------|------|----------------------|
| `assets/images/friendlinq_logo.png` | 4 | `mobile/Friendlinq_frontend/src/assets/images/friendlinq_logo.png` |
| Emoji: `👁️` (toggle password) | 14 | Inline character — no file |

### 2. Signup (`mobile/.../public/signup/signup.component.html`)

| Reference | Line | Resolved asset path |
|-----------|------|----------------------|
| `assets/images/friendlinq_logo.png` | 8 | `mobile/Friendlinq_frontend/src/assets/images/friendlinq_logo.png` |

### 3. Dashboard (`mobile/.../private/dashboard/dashboard.component.html`)

| Reference | Line | Resolved asset path |
|-----------|------|----------------------|
| `../../../../assets/images/photo.png` | 39 | `mobile/Friendlinq_frontend/src/assets/images/photo.png` |
| `../../../../assets/images/loading.gif` | 60 | `mobile/Friendlinq_frontend/src/assets/images/loading.gif` |

### 4. Private container / header (`mobile/.../private/container/private-container/`)

**private-container.component.html:**

| Reference | Line | Resolved asset path |
|-----------|------|----------------------|
| `../../../../../assets/images/logo.png` | 8 | `mobile/Friendlinq_frontend/src/assets/images/logo.png` |
| `../../../../assets/images/loading.gif` | 88 | `mobile/Friendlinq_frontend/src/assets/images/loading.gif` |

**private-container.component.ts** (default avatar/cover):

| Reference | Line | Resolved asset path |
|-----------|------|----------------------|
| `'../../../../../assets/images/user.jfif'` | 82, 101 | `mobile/Friendlinq_frontend/src/assets/images/user.jfif` |

### 5. Profile (`mobile/.../private/profile/`)

**profile.component.html:**

| Reference | Line | Resolved asset path |
|-----------|------|----------------------|
| `../../../../../assets/images/camera.png` | 6 | `mobile/Friendlinq_frontend/src/assets/images/camera.png` |

**profile.component.ts** (fallback cover image):

| Reference | Line | Resolved asset path |
|-----------|------|----------------------|
| `'../../../../../assets/images/banner1.jpg'` | 68, 174 | `mobile/Friendlinq_frontend/src/assets/images/banner1.jpg` |

### 6. Friend profile (`mobile/.../private/friend-profile/friend-profile.component.ts`)

| Reference | Line | Resolved asset path |
|-----------|------|----------------------|
| `'../../../../../assets/images/banner1.jpg'` | 77 | `mobile/Friendlinq_frontend/src/assets/images/banner1.jpg` |

### 7. Add-friend (`mobile/.../private/add-friend/add-friend.component.html`)

| Reference | Line | Resolved asset path |
|-----------|------|----------------------|
| `../../../../assets/images/loading.gif` | 20, 61, 89, 116, 137 | `mobile/Friendlinq_frontend/src/assets/images/loading.gif` |

### 8. Chat (`mobile/.../private/chat/chat.component.html`)

| Reference | Line | Resolved asset path |
|-----------|------|----------------------|
| `../../../../assets/images/loading.gif` | 4 | `mobile/Friendlinq_frontend/src/assets/images/loading.gif` |
| `../../../../assets/images/arrow.png` | 154, 157 | `mobile/Friendlinq_frontend/src/assets/images/arrow.png` |

### 9. Audio (`mobile/.../private/audio/`)

**audio.component.html:**

| Reference | Line | Resolved asset path |
|-----------|------|----------------------|
| `../../../../assets/images/call-loader.gif` | 8 | `mobile/Friendlinq_frontend/src/assets/images/call-loader.gif` |
| `../../../../assets/images/logo.png` | 12 | `mobile/Friendlinq_frontend/src/assets/images/logo.png` |

### 10. Video (`mobile/.../private/video/video.component.html`)

| Reference | Line | Resolved asset path |
|-----------|------|----------------------|
| `../../../../assets/images/call-loader.gif` | 9 | `mobile/Friendlinq_frontend/src/assets/images/call-loader.gif` |

### 11. Public container (`mobile/.../public/container/public-container/public-container.component.html`)

| Reference | Line | Resolved asset path |
|-----------|------|----------------------|
| `../../../../../assets/images/logo.png` | 7 | `mobile/Friendlinq_frontend/src/assets/images/logo.png` |
| `../../../../../assets/images/google-play.png` | 33 | `mobile/Friendlinq_frontend/src/assets/images/google-play.png` |
| `../../../../../assets/images/apple-store.png` | 34 | `mobile/Friendlinq_frontend/src/assets/images/apple-store.png` |

### 12. Fonts (read-only reference; not copied per “images/icons” scope)

- `styles.css` / `styles_OLD_Blue.css`: `assets/fonts/SFProDisplay-Regular.*` — **excluded** from image/icon copy.

### 13. Icons (Font Awesome / Material Icons)

- Nav and UI use **Font Awesome** (`fa fa-home`, `fa fa-user-plus`, `fa fa-cog`, etc.) and optionally Material Icons via CDN. No local icon files in `assets/images/` for these.

---

## Unique image assets to copy (by filename)

| Asset filename | Used in (mobile) |
|----------------|------------------|
| friendlinq_logo.png | Login, Signup |
| logo.png | Private container, Public container, Audio |
| loading.gif | Dashboard, Private container, Add-friend, Chat |
| photo.png | Dashboard |
| banner1.jpg | Profile, Friend-profile (fallback cover) |
| camera.png | Profile |
| user.jfif | Private container (default avatar) |
| arrow.png | Chat (send button) |
| call-loader.gif | Audio, Video |
| google-play.png | Public container |
| apple-store.png | Public container |

**Also in `assets/images/` but not referenced in component code:**  
camera.jpg, google.png, imgpsh_fullsize_anim (1).jpg, imgpsh_fullsize_anim (2).jpg, imgpsh_fullsize_anim.jpg, profile2.jpg, profile3.jpg, profile4.jfif, small-loader.gif.

**Decision:** Copy only assets that are **referenced** in mobile screens (list above). Optional: copy the rest for future use; this report treats “copy referenced only” to keep minimal.

---

## Emoji

- **Login:** `👁️` (toggle password visibility) — keep as inline character in web Login.

---

## Assets that could not be located

None. All referenced image paths resolve under `mobile/Friendlinq_frontend/src/assets/images/`.

---

## STEP 2 — FILES COPIED INTO `web/src/assets/`

All from `mobile/Friendlinq_frontend/src/assets/images/` → `web/src/assets/images/`:

| File |
|------|
| apple-store.png |
| arrow.png |
| banner1.jpg |
| call-loader.gif |
| camera.png |
| friendlinq_logo.png |
| google-play.png |
| loading.gif |
| logo.png |
| photo.png |
| user.jfif |

---

## STEP 3–4 — WEB FILES UPDATED

| File | Change |
|------|--------|
| `web/src/pages/Login.tsx` | Import and use `friendlinq_logo.png` for logo (emoji 👁️ already present). |
| `web/src/pages/Signup.tsx` | Import and use `friendlinq_logo.png` for logo. |
| `web/src/pages/Dashboard.tsx` | Import and use `friendlinq_logo.png`, `photo.png`, `loading.gif` (header logo, Photo option icon, loading state). |
| `web/src/pages/Profile.tsx` | Import and use `banner1.jpg`, `camera.png` (banner fallback, upload button icon). |
| `web/src/pages/UserProfile.tsx` | Import and use `banner1.jpg` (banner fallback when no user photo). |
| `web/src/components/HamburgerMenu.tsx` | Import and use `user.jfif` as default avatar when no profile image. |
| `web/src/pages/ChatConversation.tsx` | Import and use `arrow.png` for send button icon. |
| `web/src/pages/CreatePost.tsx` | Import and use `photo.png` for Photo button icon. |
| `web/src/pages/Dashboard.css` | Added `.dashboard-loading-gif`, `.dashboard-icon-photo-img`. |
| `web/src/pages/Profile.css` | Added `.profile-banner-camera-icon`. |
| `web/src/pages/ChatConversation.css` | Added `.chat-conv-send-icon`, flex on `.chat-conv-send`. |

**Not wired (no matching usage in web):** `logo.png`, `call-loader.gif`, `google-play.png`, `apple-store.png` — kept in `web/src/assets/images/` for future use (e.g. auth/public container, call UI).

---

## STEP 5 — COMMANDS RUN + OUTCOME

- **`npm run build`** — Success (tsc + vite build). Assets emitted to `dist/assets/` (e.g. friendlinq_logo, photo, camera, loading, banner1).
- **`npm run dev`** — Started successfully for manual verification.

---

## Summary

- **RN assets found:** 11 unique image files referenced across login, signup, dashboard, container, profile, friend-profile, add-friend, chat, audio, video, public-container; 1 inline emoji (👁️) on login.
- **Copied:** 11 files into `web/src/assets/images/`.
- **Wired:** Login, Signup, Dashboard, Profile, UserProfile, HamburgerMenu, ChatConversation, CreatePost; minimal CSS for new asset classes.
- **Assets not located:** None.
