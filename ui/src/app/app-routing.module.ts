import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TerminalComponent } from './terminal/terminal.component';
import { UserSignUpComponent } from './user-sign-up/user-sign-up.component';
import { UserloginComponent } from './userlogin/userlogin.component';
const routes: Routes = [
  {
    path: 'sign-in',
    component: UserloginComponent,
  },
  {
    path: 'sign-up',
    component: UserSignUpComponent,
  },
  {
    path: 'reset_password',
    component: ResetPasswordComponent,
  },
  {
    path: 'terminal',
    component: TerminalComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
