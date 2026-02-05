# Photo Library Page — Migration Report

## STEP 1 — RN source of truth

**Finding:** The `mobile/` app (Angular/Ionic) does **not** contain a dedicated "Photo Library" screen.

- **Routes in** `mobile/Friendlinq_frontend/src/app/app-routing.module.ts`: `dashboard`, `profile`, `profile/:id`, `friend`, `chat/:id`, `video`, `audio`. No `photo-library` or `gallery` route.
- **Media usage in mobile:**  
  - **Dashboard** (`dashboard.component.ts`): post creation with `mediaFile` (image/video) via formData.  
  - **Profile:** `uploadsProfilePic` / banner image.  
  - **Chat:** `mediaFile` for chat media.  
- **No** dedicated component that:
  - Shows "Add Image" / "Add Video" buttons
  - Displays a row/grid of image and video thumbnails
  - Opens a preview/modal on thumbnail click

**Conclusion:** Photo Library is implemented in web from the **specified behavior** (Add Image, Add Video, thumbnails, click-to-preview), not from an existing RN screen.

---

## STEP 2 — Backend contract

**Finding:** There is **no** backend API dedicated to a "Photo Library" or user media gallery.

- **Searched:** `backend/.../Routes/`, `Controllers/`, `Models/` for gallery, photo library, media list, getMedia, etc.
- **Existing backend media-related endpoints:**
  - **Profile:** `uploadsProfilePic`, `uploadsBannerImage` (CustomerRoute.js) — single profile/banner upload.
  - **Post:** createPost with `mediaFile` / `videoThumbnail` (PostRoute.js, PostController.js).
  - **Portfolio:** portfolio upload with `mediaFile0–4`, `thumbnailFile0–4` (PostController.js).
  - **Chat:** chat media upload (ChatController.js).

**No endpoint for:**
- Fetching a list of user "Photo Library" / gallery media
- Uploading an image/video to a dedicated gallery (only to post, profile, or portfolio)
- Deleting gallery media

**Conclusion:** Photo Library is implemented **local-only in DEV MODE**: file picker → component state → thumbnails and preview. No backend calls. When a real backend exists, it can be wired to a future "gallery list" and "gallery upload" API.

---

## STEP 3 — Web implementation

- **Route:** `/photo-library`
- **Component:** `web/src/pages/PhotoLibrary.tsx`
- **Behavior:** Add Image (hidden `input accept="image/*"`), Add Video (hidden `input accept="video/*"`); thumbnails in a grid at bottom; click thumbnail opens modal preview (image or video); no auth required.

---

## STEP 4 — Verify

- **`npm run build`:** Success.
- **`npm run dev`:** Run and open `http://localhost:5173/` (or the port shown). Navigate to `/photo-library` (e.g. from Gallery page link "Photo Library"). Confirm: Add Image opens file picker and adds thumbnail; Add Video opens file picker and adds thumbnail; clicking a thumbnail opens modal preview; no crashes or redirect loops.

---

## OUTPUT SUMMARY

- **Route added:** `/photo-library` — file: `web/src/App.tsx`.
- **RN source files referenced:** None (no Photo Library screen in `mobile/`). Behavior implemented from spec.
- **Backend endpoints used:** None. Implementation is local-only in DEV MODE (no backend for Photo Library).
- **Web files changed:**
  - **New:** `web/src/pages/PhotoLibrary.tsx`, `web/src/pages/PhotoLibrary.css`, `docs/PHOTO_LIBRARY_MIGRATION.md`
  - **Updated:** `web/src/App.tsx` (import + route for PhotoLibrary), `web/src/pages/Gallery.tsx` (link to Photo Library in list).
- **Commands run:** `npm run build` (success), `npm run dev` (started for manual verification).
