import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { apiUrls } from '../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private userUrl = apiUrls.userManager;
    private forgotPasswordUrl = apiUrls.forgotPassword;
    private inviteUrl = apiUrls.invite;
    private httpOptions = {};
    private httpOptionsHtml = {};

    handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.error('An error occurred:', error.error.message);
        } else {
            return throwError(`${error.error.warning}`);
        }
        return throwError('Something bad happened');
    }
  
    constructor(private httpClient: HttpClient) {
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
  
        this.httpOptionsHtml = {
            headers: new HttpHeaders({
                'Content-Type': 'text/plain; charset=utf-8'
            }),
            responseType: 'text' as 'text'
        };
    }

    createUser(formData) {
        return this.httpClient.post( this.userUrl, formData, this.httpOptions )
        .pipe(
            catchError(this.handleError)
        );
    }

    updateUser(formData) {
        return this.httpClient.put( this.userUrl, formData, this.httpOptions )
        .pipe(
            catchError(this.handleError)
        );
    }



    forgotPassword(formData) {
        return this.httpClient.post( this.forgotPasswordUrl, formData, this.httpOptions )
        .pipe(
            catchError(this.handleError)
        );
    }

    getResetPasswordTokenValidation(token) {
        return this.httpClient.get( this.forgotPasswordUrl + "/validateToken" + '?token=' + token, this.httpOptions )
        .pipe(
            catchError(this.handleError)
        );
    }

 
    getUserByEmailPassword(email, password) {
        const params = new HttpParams()
        .set('email', email)
        .set('password', password);
        return this.httpClient.get( this.userUrl + "/userByEmail" , {params} )
        .pipe(
            catchError(this.handleError)
        );
    }

    deleteUser(id) {
        return this.httpClient.delete( this.userUrl + '?id=' + id, this.httpOptions )
        .pipe(
            catchError(this.handleError)
        );
    }

    /*****************************************Invitations************************************/


    getTokenValidation(token) {
        return this.httpClient.get( this.inviteUrl + "/validateToken" + '?token=' + token, this.httpOptions )
        .pipe(
            catchError(this.handleError)
        );
    }

 
}