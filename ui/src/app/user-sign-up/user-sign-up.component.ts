import { Component, OnInit } from '@angular/core';

import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { UsersService } from '../user.service';

@Component({
  selector: 'app-user-sign-up',
  templateUrl: './user-sign-up.component.html',
  styleUrls: ['./user-sign-up.component.css']
})
export class UserSignUpComponent implements OnInit {

  isValid: any = true;
  mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  passwordformat = /[0-9a-zA-Z@$!%*#?&]{6,}/;
  token: any = "";
  firstName: any = { disabled: false, value: "" };
  lastName: any = { disabled: false, value: "" };
  email: any = { disabled: false, value: "" };
  contact: any = { disabled: false, value: "" };
  password: any = { disabled: false, value: "" };
  rePassword: any = { disabled: false, value: "" };

  userObject = {
      "name": "",
      "email": "",
      "password": "",
      "role": "authenticatedUser",
      "is_new": true
  }
  user = {
      "name": "",
      "userId": "",
      "role": "developer"
  }
  organisationId = "";
  teamIds = [];
  inValidToken: boolean = false;
  linkExpired: boolean = false;
  activate: boolean = false;
  inviteId: any;

  constructor(private router: Router,
      private route: ActivatedRoute,
      private userService: UsersService) { }

  ngOnInit() {
      this.isValid = false;
      if (this.router.url.includes("activate")) {
          this.route.paramMap.subscribe(params => {
              this.activate = true;
              this.token = params.get('token');
              if (this.token) {
                  this.userService.getTokenValidation(this.token).subscribe((data: any) => {
                      if (data.valid) {
                          this.isValid = true;
                      }
                      this.userObject.email = data.doc.email;
                      this.user.role = data.doc.role;
                  }, (error) => {
                      this.isValid = false;
                      if (error === "Cannot read property 'createdAt' of null" || error === "Token is not valid") {
                          this.inValidToken = true;
                          this.linkExpired = false;
                      } else {
                          this.inValidToken = false;
                          this.linkExpired = true;
                      }
                  })
              } else {
                  this.inValidToken = true;
                  this.linkExpired = false;
              }
          });
      } else {
          this.isValid = true;
      }
  }

  onFirstNameChange(event) {
      if (event == '') {
          this.firstName = { value: '', disabled: true }
      } else {
          this.userObject.name = event;
          this.firstName = { value: event, disabled: false }
      }
  }

  onEmailChange(event) {
      if (event.match(this.mailformat)) {
          this.userObject.email = event;
          this.email = { value: event, disabled: false }
      } else {
          this.email = { value: '', disabled: true }
      }
  }

  onPassWordChange(event) {
      if (event.match(this.passwordformat)) {
          this.userObject.password = event;
          this.password = { disabled: false, value: event }
      } else {
          this.password = { value: '', disabled: true }
      }
  }

  onRePasswordChange(event) {
      if (event === this.password.value) {
          this.rePassword = { disabled: false, value: event }
      } else {
          this.rePassword = { value: '', disabled: true }
      }
  }

  createAccount() {
      this.userService.createUser(this.userObject).subscribe((data: any) => {
          this.user.userId = data.id;
          this.user.name = data.name;
      });
  }

}
