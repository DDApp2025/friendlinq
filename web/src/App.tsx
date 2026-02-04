import { Routes, Route, Navigate } from 'react-router-dom'

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

// If it does NOT exist, tell me and I’ll adjust the import.
export default function App() {
  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to={import.meta.env.DEV ? '/dashboard' : '/login'} replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />

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
      <Route path="/profile/:userId" element={<UserProfile />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/friends" element={<Friends />} />

      <Route path="*" element={<Navigate to={import.meta.env.DEV ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
