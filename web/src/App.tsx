import { Routes, Route, Navigate } from 'react-router-dom'

import { LOGGED_IN_USER_KEY } from './constants/devUser'
import AppLayout from './AppLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import Friends from './pages/Friends'
import CreatePost from './pages/CreatePost'
import PostDetail from './pages/PostDetail'
import EditPost from './pages/EditPost'
import ChatList from './pages/ChatList'
import ChatConversation from './pages/ChatConversation'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import ChangePassword from './pages/ChangePassword'
import Wallpapers from './pages/Wallpapers'
import GroupsList from './pages/GroupsList'
import CreateGroup from './pages/CreateGroup'
import GroupDetail from './pages/GroupDetail'
import GroupMembers from './pages/GroupMembers'
import Portfolio from './pages/Portfolio'
import NearbyUsers from './pages/NearbyUsers'
import ScheduleCalls from './pages/ScheduleCalls'
import SendInvitation from './pages/SendInvitation'
import Gallery from './pages/Gallery'
import PhotoLibrary from './pages/PhotoLibrary'
import ProfileVideo from './pages/ProfileVideo'
import ProfileEdit from './pages/ProfileEdit'
import ProfilePhoto from './pages/ProfilePhoto'
import ProfileBanner from './pages/ProfileBanner'
import ProfileTopFourImages from './pages/ProfileTopFourImages'
import ProfileTopFourFriends from './pages/ProfileTopFourFriends'
import NotFound from './pages/NotFound'

// If it does NOT exist, tell me and I'll adjust the import.
function RootRedirect() {
  if (!import.meta.env.DEV) return <Navigate to="/login" replace />
  try {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (raw) return <Navigate to="/dashboard" replace />
  } catch {
    // ignore
  }
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/post/:postId/edit" element={<EditPost />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/chat/:userId" element={<ChatConversation />} />
        <Route path="/chat" element={<ChatList />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/wallpapers" element={<Wallpapers />} />
        <Route path="/groups/create" element={<CreateGroup />} />
        <Route path="/groups/:groupId/members" element={<GroupMembers />} />
        <Route path="/groups/:groupId" element={<GroupDetail />} />
        <Route path="/groups" element={<GroupsList />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/nearby" element={<NearbyUsers />} />
        <Route path="/schedule-calls" element={<ScheduleCalls />} />
        <Route path="/send-invitation" element={<SendInvitation />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/profile/photo" element={<ProfilePhoto />} />
        <Route path="/profile/banner" element={<ProfileBanner />} />
        <Route path="/profile/top-four-images" element={<ProfileTopFourImages />} />
        <Route path="/profile/top-four-friends" element={<ProfileTopFourFriends />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/photo-library" element={<PhotoLibrary />} />
        <Route path="/profile-video" element={<ProfileVideo />} />
        <Route path="/dev" element={<Gallery />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}