import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import * as io from 'socket.io-client'
import { apiUrls } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TerminalService {
  socket;

  constructor() { }
  setupSocketConnection() {
      let globalData = JSON.parse(localStorage.getItem('globalData'));
      this.socket = io(apiUrls.socketServer);
      this.socket.emit('new-user');
  }

  public sendMessage(message) {
      console.log(message)
      this.socket.emit('input', message);
  }

  public getMessages = () => {
      return Observable.create((observer) => {
          this.socket.on('output', (message) => {
              console.log(message);
              observer.next(message);
          });
      });
  }

  public getErrorMessages = () => {
      return Observable.create((observer) => {
          this.socket.on('error', (message) => {
              console.log(message);
              observer.next(message);
          });
      });
  }

  runCompilation = (data) => {
      console.log(data);
      this.socket.emit('run-compilation', data)
  }

  stopCompilation = (data) => {
      this.socket.emit('stop', data)
  }

  
}
