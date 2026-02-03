import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PublicContainerComponent } from './components/public/container/public-container/public-container.component';
import { LoginComponent } from './components/public/login/login.component';
import { SignupComponent } from './components/public/signup/signup.component';
import { ForgotPasswordComponent } from './components/public/forgot-password/forgot-password.component';
import { PrivateContainerComponent } from './components/private/container/private-container/private-container.component';
import { DashboardComponent } from './components/private/dashboard/dashboard.component';
import { ProfileComponent } from './components/private/profile/profile.component';
import { AddFriendComponent } from './components/private/add-friend/add-friend.component';
import { FriendProfileComponent } from './components/private/friend-profile/friend-profile.component';
import { ChatComponent } from './components/private/chat/chat.component';
import { VideoComponent } from './components/private/video/video.component';
import { AudioComponent } from './components/private/audio/audio.component';

const appRoutes: Routes = [
  {
    path: '',
    component: PublicContainerComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'forgotpassword', component: ForgotPasswordComponent },
    ],
  },

  // App routes goes here here
  {
    path: '',
    component: PrivateContainerComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'profile/:id', component: FriendProfileComponent },
      { path: 'friend', component: AddFriendComponent },
      { path: 'chat/:id', component: ChatComponent },
      { path: 'video', component: VideoComponent },
      { path: 'audio', component: AudioComponent },
    ],
  },
  // otherwise redirect to home
  { path: '**', redirectTo: 'public' },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
