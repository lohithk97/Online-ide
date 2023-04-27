//index.js
const http = require("http");
const SocketService = require("./socketService.js");

/* 
  Create Server from http module.
  If you use other packages like express, use something like,
  
  const app = require("express")();
  const server = require("http").Server(app);

*/
/*
TODO: use env variables for routes
*/


const axios = require('axios');


const route = process.env.ROUTE || 'http://localhost:3001/usersManager';

// axios
//   .post(route, {
//     "name": "lohith",
//     "email": "lohith566@gmail.com",
//     "password": "user"
//   })
//   .then(res => {
//     console.log(`statusCode: ${res.status}`);
//     res.end();
//   })
//   .catch(error => {
//     console.error(error);

//   });

// const server = http.createServer((req, res) => {
//   res.write("Terminal Server Running.");
//   res.end();
// });

const port = process.env.PORT || 8080;

const socketService = new SocketService();
socketService.connectToServer();

// server.listen(port, function () {
//   console.log("Server listening on : ", port);
  
//   // We are going to pass server to socket.io in SocketService.js
// });