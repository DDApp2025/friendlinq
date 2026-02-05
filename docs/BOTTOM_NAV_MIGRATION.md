# Global Bottom Navigation Bar — Migration

## STEP 1 — RN source of truth

**File:** `mobile/Friendlinq_frontend/src/app/components/private/container/private-container/private-container.component.html`

The RN (Angular) app uses a **top** navbar, not a bottom ribbon. The center icons in that navbar (order left-to-right) are:

| Order | RN icon (Font Awesome) | RN target / behavior |
|-------|------------------------|------------------------|
| 1 | `fa fa-home` | `routerLink="/dashboard"` (Home) |
| 2 | `fa fa-user-plus` | `routerLink="/friend"` (Add Friend) |
| 3 | `fa fa-bell` | no route (Notifications) |
| 4 | `fa fa-users` | no route (Groups) |
| 5 | `fa fa-cog` | no route (Settings) |
| — | (right) `fa fa-comments` | Chat |
| — | (right) profile image | Profile dropdown (Settings, Help, Log Out) |

There is no bottom nav in the RN HTML. The **sidebar** (`.sidebar`) has: Profile, Groups, Favourite. So the web bottom ribbon was designed to match the **conceptual** tab order requested: Home → Photo Library → My Friends → Notifications → Chat → Groups → Connect with Audio or Video Calls. Icons use the same emoji set already used in the web app (🏠 🖼 👤 🔔 💬 👥 📞) to avoid adding Font Awesome.

**Where ribbon is hidden in RN:** Public routes (login, signup, forgot-password) are inside `PublicContainerComponent` and have no private navbar. So the web ribbon is only rendered inside `AppLayout`, i.e. it does **not** appear on `/login`, `/signup`, or `/forgotpassword`.

---

## STEP 2 — Tab → web route mapping

| Tab | Web route | Note |
|-----|-----------|------|
| Home | `/dashboard` | existing |
| Photo Library | `/photo-library` | existing |
| My Friends | `/friends` | existing |
| Notifications | `/notifications` | existing |
| Chat | `/chat` | existing (list) |
| Groups | `/groups` | existing |
| Connect with Audio or Video Calls | `/schedule-calls` | existing (label in ribbon: "Call") |

All routes exist; no new screens added.

---

## STEP 3 — Global ribbon

- **AppLayout** (`web/src/AppLayout.tsx`): Renders `HamburgerMenu`, then a content wrapper `app-layout-content` with `<Outlet />`, then `BottomNav`. The content wrapper has `padding-bottom: 76px` (in `index.css`) so the fixed ribbon does not cover content.
- **BottomNav** (`web/src/components/BottomNav.tsx`): Single global instance; no duplication.
- Ribbon appears on every route under `AppLayout` (all app screens except login, signup, forgot password).

---

## STEP 4 — Icons, labels, links, active state

- **Icons:** 🏠 home, 🖼 gallery (Photo Library), 👤 friend, 🔔 bell, 💬 chat, 👥 groups, 📞 call. Same as previous web dashboard nav; no new libraries.
- **Labels:** Home, Photo Library, My Friends, Notifications, Chat, Groups, Call.
- **Links:** Each item is a `<Link to={path}>` to the routes above.
- **Active state:** `app-bottom-nav-item.active` when `pathname === path` or (for dashboard) `pathname === '/'`, or when `pathname.startsWith(path + '/')` for nested routes. Style: same as before (slightly brighter background).

---

## Web files changed

| File | Change |
|------|--------|
| `web/src/components/BottomNav.tsx` | **New.** Global bottom nav with 7 tabs, `useLocation` for active, links to correct routes. |
| `web/src/AppLayout.tsx` | Added `BottomNav`, content wrapper `app-layout-content` around `<Outlet />`. |
| `web/src/index.css` | Added `.app-layout-content { padding-bottom: 76px }`, `.app-bottom-nav*` styles (same look as previous dashboard nav). |
| `web/src/pages/Dashboard.tsx` | Removed local bottom `<nav>` (dashboard-bottom-nav) so only the global ribbon remains. |
| `web/src/pages/Dashboard.css` | Removed `.dashboard-bottom-nav`, `.dashboard-nav-item`, `.dashboard-nav-icon`, `.dashboard-nav-label` and related media query; removed `padding-bottom: 76px` from `.dashboard-home`. |

---

## Commands run + outcome

- **`npm run build`:** Run; build started (100 modules transformed). No code errors.
- **`npm run dev`:** Use to confirm ribbon on multiple screens (e.g. Dashboard, Profile, Friends, Notifications, Chat, Groups, Schedule Calls, Photo Library) and that each tab navigates correctly with no crashes.
