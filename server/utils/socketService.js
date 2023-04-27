//SocketService.js

const socketIO = require("socket.io");
let userModel = require('../db/models/user');
let util =require('../lib/stubs/utils')
const ptyService = require("./pty-service");



class SocketService {
    constructor() {
        if (SocketService._instance) {
            return SocketService._instance;
        }
        SocketService._instance = this;

    }
    io;
    user = {};
    attachServer(server) {
        if (!server) {
            throw new Error("Server not found...");
        }
        this.io = socketIO(server)
        const io = this.io;
        console.log("Created socket server. Waiting for client connection.");
        // "connection" event happens when any client connects to this io instance.

        io.on("connection", socket => {
             console.log("Client connect to socket.", socket.id);

            this.socket = socket;

            this.socket.on("new-user", () => {
                console.log(this.socket.id,"created new-user");
                this.user[this.socket.id]= {};
                this.user[this.socket.id]["socket"] = this.socket;

            })

            this.socket.on("run-compilation", async (data) => {
                let id = data.userId;
              
            
                if (!id) {
                    e = new Error();
                    e.status = 400;
                    e.message = "user id is required"
            
                    return next(e);
                }
                try {
                    let user = await userModel.findOne({ id: id });
                   
            
                    if (!user) {
                        try {
                            throw new Error('Invalid Id');
                        } catch (er) {
                            return next(er)
                        }
                    } 
                } catch (e) {
                    this.user[this.socket.id].socket.emit({err:"user not found"});
                    delete this.user[this.socket.id];
                    return;
                }

                
                if (!this.user[this.socket.id]["pty"]) {    
                    console.log("in socket")
                    this.user[this.socket.id]["pty"] = ptyService.compileIt(this.user[this.socket.id].socket, data);
                   
                }
                else {
                    this.user[this.socket.id]["pty"].write('python '+ __dirname + '/' + data.userId + '.py \n');
                }
            })

            this.socket.on("docker-start", (data) => {
               //authenticate the session id
                console.log(data);
            })





            this.socket.on("disconnect", () => {
                console.log("Disconnected Socket: ", socket.id);
                delete this.user[this.socket.id];
            });

        }); 

    }




    // {
    //     "Version": "2008-10-17",
    //     "Id": "__default_policy_ID",
    //     "Statement": [
    //       {
    //         "Sid": "__owner_statement",
    //         "Effect": "Allow",
    //         "Principal": {
    //           "AWS": "633913878239"
    //         },
    //         "Action": [
    //           "SQS:*"
    //         ],
    //         "Resource": "arn:aws:sqs:us-east-1:633913878239:myQueue.fifo"
    //       }
    //     ]
    //   }
   

}

module.exports = SocketService;