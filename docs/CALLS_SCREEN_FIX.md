# Calls Screen Fix — RN Parity

## STEP 1 — RN source of truth

- **Finding:** The Angular mobile app does **not** include a dedicated “Calls” or “Schedule Calls” screen with two cards (“Host a Voice or Video Call Now” and “Schedule a future Voice or Video Call”) and four buttons.
- **References:**  
  - **`mobile/.../private/container/private-container.component.html`** — Accept call button in navbar.  
  - **`mobile/.../private/audio/audio.component.html`** — “Calling ..............” + loader.  
  - **`mobile/.../private/video/video.component.html`** — Same.  
  - **`mobile/.../private/friend-profile/friend-profile.component.html`** — Calling options (phone/video).  
  - **`mobile/.../private/chat/chat.component.html`** — Calling option.  
- Call flow is initiated from friend profile or chat via socket `call-request`; audio/video routes are `/audio` and `/video`. No standalone “Host now” / “Schedule future” card screen in RN. Implementation follows the **required UI** from the task spec.

## STEP 2 — Backend contract

- **Schedule call:**  
  - `POST /api/v1/call/schedule` — payload: `emails`, `names`, `title`, `channelId`, `scheduleDate`, `callType`, `inviteLink`, `hostId`.  
  - `POST /api/v1/call/web/schedule` — same minus `inviteLink`.  
- **List calls:** `GET /api/v1/call/allList` (via query).  
- **Update / get single:** `POST` update, `GET` single (ScheduleCallRoute.js).  
- **Friend/group selection:** Uses existing friends list and groups list APIs; no separate “call selection” endpoint.

## STEP 3–4 — Web Calls screen (ScheduleCalls)

- **Layout:** Two cards stacked vertically, then “Your scheduled calls” list.
- **Card 1 title:** “Host a Voice or Video Call Now”.  
  - Buttons: **Select Friends**, **Select a Group**.
- **Card 2 title:** “Schedule a future Voice or Video Call”.  
  - Buttons: **Select Friends**, **Select a Group**.
- **Wiring:**  
  - Host Now → Select Friends: navigate to `/friends` with `state: { callContext: 'hostNow' }`.  
  - Host Now → Select a Group: navigate to `/groups` with `state: { callContext: 'hostNow' }`.  
  - Schedule future → Select Friends: navigate to `/friends` with `state: { callContext: 'schedule' }`.  
  - Schedule future → Select a Group: navigate to `/groups` with `state: { callContext: 'schedule' }`.  
- Friends and groups pages are unchanged; they can read `location.state?.callContext` later if needed. No new screens or routes.

## Button → route mapping

| Card        | Button          | Web route | State |
|------------|-----------------|-----------|--------|
| Host now   | Select Friends  | `/friends` | `{ callContext: 'hostNow' }` |
| Host now   | Select a Group  | `/groups`  | `{ callContext: 'hostNow' }` |
| Schedule   | Select Friends  | `/friends` | `{ callContext: 'schedule' }` |
| Schedule   | Select a Group  | `/groups`  | `{ callContext: 'schedule' }` |

## Files changed (web/)

- **`web/src/pages/ScheduleCalls.tsx`** — Two cards with titles and four buttons; `goToFriends` / `goToGroups` with context; “Your scheduled calls” list below.  
- **`web/src/pages/ScheduleCalls.css`** — Styles for `.schedule-calls-card`, `.schedule-calls-card-title`, `.schedule-calls-card-actions`, `.schedule-calls-card-btn`, list heading and items.  
- **`docs/CALLS_SCREEN_FIX.md`** — This file.

## Commands

- **`npm run build`** — Run to verify.  
- **`npm run dev`** — Open `/schedule-calls` and confirm both cards, all four buttons, and that each button navigates to `/friends` or `/groups` without crashes.
