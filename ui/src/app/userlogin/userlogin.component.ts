import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { apiUrls } from '../../environments/environment';
import { UsersService } from '../user.service';
import { TerminalService } from '../terminal.service';
import { CompilationService } from '../compilation.service';


@Component({
  selector: 'app-userlogin',
  templateUrl: './userlogin.component.html',
  styleUrls: ['./userlogin.component.css']
})
export class UserloginComponent implements OnInit {

  public sidebarMinimized = false;

  public language = '';

  showToggler = false;

  public lang = '';
  public indentation = "1";
  uploadedFiles: any;
  closeButton = false;
  importInProgress : boolean = true;
  popupImportVisible = false;
  uploadSuccessfull = false;

  public projectList: any = [];
  public selectedProject: any = [];
  public projectId = "";
  userId="";
  isLoggedIn = "false";
  emailAddress: any = "";
  password: any = "";
  output ="";
  code = "";

  interactive = true;


  statusMessage: any = {
      success: false,
      error: false,
      message: ''
  };
  editField: string;

  importPercentage = 0;
  importMessage: any = "";
  popupVisible = true;
  message = "";
  showWarningMessage: any = false;

  httpOptions = {
      headers: new HttpHeaders({
          'Content-Type': 'application/json'
      })
  }
  user: any;


  constructor(
      private httpClient: HttpClient,
      private router: Router,
      private usersService: UsersService,
      private compilationService: CompilationService,
      private terminalService:TerminalService
   
  ) {
      const globalData = JSON.parse(localStorage.getItem('globalData'));
      this.language = globalData && globalData.language ? globalData.language : 'python';
      this.indentation = globalData && globalData.indentation ? globalData.indentation : '1';
      this.userId = globalData && globalData.userId ? globalData.userId : '';
      // this.showWarningMessage = globalData.mode;
  }

  ngOnInit() {
      // const modeData = JSON.parse(localStorage.getItem('globalData'));
      // this.showWarningMessage = modeData.mode;
      let globalData = {
          userId: this.userId,
          language: this.language
      }
      localStorage.setItem('globalData', JSON.stringify(globalData));
      // this.getUrl();
  }

  ngDoCheck() {
      const modeData = JSON.parse(localStorage.getItem('globalData'));
      this.showWarningMessage = modeData.mode;
      if (modeData.projectId !== "") {
          this.showToggler = true;
      } else {
          this.showToggler = false;
      }
  }

  ngAfterViewInit() {


  }

  forgottonPassword() {

  }

  onEmailNameChange(email) {
      this.emailAddress = email;
  }

  onPasswordChange(password) {
      this.password = password;
  }

  importPopUp() {
      this.popupImportVisible = true;
  }

 

  login() {
      this.usersService.getUserByEmailPassword(this.emailAddress, this.password).subscribe(async (data: any) => {
          localStorage.setItem("dataObject", Date.now() + "`" + JSON.stringify(data));
          this.isLoggedIn = "true";
          this.user = data.user;
          if (this.user.is_new === true) {
              this.user.is_new = false;
              this.usersService.updateUser(this.user).subscribe((data) => {
                  localStorage.setItem("dataObject", Date.now() + "`" + JSON.stringify({ "user": data }));
                  
              })
          } else if (this.router.url === "/") {
              this.router.navigate(['/project']);
          }

      }, (error) => {
          this.popupVisible = true;
          if (error === 'Invalid Email' || error === 'Invalid Password') {
              this.message = "Incorrect email or password."
          }
      });
  }

  
  upload(event) {
 
  
  }

 
  toggleMinimize(e) {
      this.sidebarMinimized = e;
  }

  

  selectIndentation(value: any) {
      this.indentation = value;
      let globalData = {
          projectId: this.projectId,
          language: this.language,
          indentation: this.indentation,
          mode: this.showWarningMessage
      }

     
      localStorage.setItem('globalData', JSON.stringify(globalData));
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([this.router.url]);
  }

  logout() {
      localStorage.removeItem('dataObject');
      this.isLoggedIn = 'false';
      this.router.navigate(['/'])
  }

  about() {
      this.router.navigate(['/about'])
  }
  
 

  updateCode(code){
   
     this.code = code;
   

  }
  compile(){
      let compileData= {
          "userId": this.user.id ,
          "status":0,
          "output":"",
          "compilationPercentage": 0,   
           "compilationMessage":  "",  
          "language": "python",
          "code":this.code
      }
      
    if(this.interactive) {
        this.terminalService.runCompilation(compileData);
    }
    else {
        this.compilationService.postLocalCompilation(compileData).subscribe((res: any) => {
    
            console.log(res);
            if(res.err !== "") {
                console.log(res.err);
                this.output =res.err;
            }
            else {
          
                this.output =res.output;
            }
        });
    }


  }


 



}
