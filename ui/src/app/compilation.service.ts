import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { apiUrls } from '../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompilationService {
  private compilationUrl = apiUrls.compilation;

  private httpOptions = {};
  private httpOptionsFile = {};
  private httpOptionsHtml = {};
  private globalData: any = {};

  handleError(error: HttpErrorResponse) {
    console.log(error);
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      return throwError(`${error.error.warning}`);
    }
    return throwError('Something bad happened');
  }

  constructor(private httpClient: HttpClient) {
    const globalData = JSON.parse(localStorage.getItem('globalData'));
    this.globalData = globalData;
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this.httpOptionsFile = {
      headers: new HttpHeaders({}),
    };

    this.httpOptionsHtml = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain; charset=utf-8',
      }),
      responseType: 'text' as 'text',
    };
  }

  postLocalCompilation(formData) {
    return this.httpClient
      .post(this.compilationUrl + '/localCompile', formData, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  getCompilation() {
    return this.httpClient
      .get(this.compilationUrl + '/byCompileId', this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteCompilation(compileId) {
    return this.httpClient
      .delete(this.compilationUrl + '?compileId=' + compileId, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
}
