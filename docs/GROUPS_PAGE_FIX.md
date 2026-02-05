# Groups Page Fix — RN/Backend Reference

## STEP 1 — RN source of truth

- **Groups screen in mobile:** The Angular app does **not** have a dedicated Groups list screen. The only reference is in **`mobile/Friendlinq_frontend/src/app/components/private/container/private-container/private-container.component.html`**: sidebar link "Groups" with icon `fa fa-users` (no route in app-routing; sidebar is part of the private container).
- **Layout/icons:** No RN Groups list with "Join Group" / "Create Group" or per-row Call/Video/Schedule/Edit/Pause. Implementation follows the **required UI/behavior** from the task spec and backend contract.

## STEP 2 — Backend contract

**File:** `backend/.../Routes/PostGroupRoute.js`, `Controllers/PostGroupController.js`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/postGroup/getGroupList` | GET (query: skip, limit) | List user's groups. Returns `{ totalCount, groupList }`. Each group has `_id`, `groupName`, `groupAdminId` (populated). |
| `/api/v1/postGroup/createGroup` | POST `{ groupName }` | Create group. |
| `/api/v1/postGroup/addMember` | POST `{ groupId, memberId }` | Join/add member. |
| `/api/postGroup/getGroupDetails` | POST `{ groupId }` | Group detail. |
| `/api/postGroup/updateGroupChannel` | POST | Update channel/call type (no pause). |
| **Pause/unpause:** | — | **No** dedicated pause endpoint. PostGroup schema has `isActive` but no exposed pause API. Pause is implemented as DEV-only local UI state. |

## STEP 3–4 — Web Groups page (fix)

- **Top:** "Join Group" (navigate to `/groups` — list is the join/discover surface), "Create Group" (navigate to `/groups/create`).
- **List:** Each row shows group name (link to `/groups/:groupId`) and action icons: Call (📞), Video (📹), Schedule (📅), and when current user is **group admin**: Edit (✏️), Pause (⏸). Edit links to group detail; Pause toggles local state (no backend).
- **Icons:** Emoji (📞 📹 📅 ✏️ ⏸ ▶️) to match existing web pattern; no new assets.

## STEP 5 — DEV mock data

- When `getGroupList` returns empty or fails in DEV, the page seeds **5 mock groups** (shape: `_id`, `groupName`, `groupAdminId`). Three have `groupAdminId: currentUserId` so Edit/Pause appear; two have another id so they don’t.

## Web routes used

| Action | Web route |
|--------|-----------|
| Join Group | `/groups` (same page) |
| Create Group | `/groups/create` |
| Call (audio) | `/schedule-calls` |
| Video | `/schedule-calls?mode=video` |
| Schedule time | `/schedule-calls` |
| Edit | `/groups/:groupId` (group detail) |
| Pause | Local toggle only (no navigation) |

## Files changed (web/)

- `web/src/pages/GroupsList.tsx` — Top buttons, row layout, Call/Video/Schedule/Edit/Pause icons; admin check; pause state; DEV mock groups.
- `web/src/pages/GroupsList.css` — Styles for actions, row, icons.
- `web/src/api/groups.ts` — `GroupItem.groupAdminId` added for admin check.
- `docs/GROUPS_PAGE_FIX.md` — This file.
