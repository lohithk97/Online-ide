import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserloginComponent } from './userlogin/userlogin.component';
import { TerminalComponent } from './terminal/terminal.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UserSignUpComponent } from './user-sign-up/user-sign-up.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { EditorComponent } from './editor/editor.component';
import { NgTerminalModule } from 'ng-terminal';

@NgModule({
  declarations: [
    AppComponent,
    UserloginComponent,
    TerminalComponent,
    ResetPasswordComponent,
    UserSignUpComponent,
    EditorComponent
 
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgTerminalModule
 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
