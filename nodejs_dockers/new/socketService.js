// Manage Socket.IO server
const socketIO = require("socket.io");
const PTYService = require("./PTYService");
const io = require("socket.io-client");
class SocketService {
  socket;
  constructor() {
    this.socket = null;
    this.pty = null;
  }

  connectToServer() {
      console.log("DASfdasd")
      this.socket = io("http://localhost:3001/");
      console.log("Client connect to socket.", this.socket.id);
   

      let data = JSON.stringify({"session-id":process.env.SESSION||0});
      this.socket.emit("docker-start", data);

      this.socket.on("disconnect", () => {
        console.log("Disconnected Socket: ", socket.id);
      });

      // Create a new pty service when client connects.
      // this.pty = new PTYService(this.socket);
      console.log(data);

      // Attach any event listeners which runs if any event is triggered from socket.io client
      // For now, we are only adding "input" event, where client sends the strings you type on terminal UI.
      this.socket.on("input", input => {
        console.log(input)
        //Runs this event function socket receives "input" events from socket.io client
        this.pty.write(input);
      });
  }
}

module.exports = SocketService;
