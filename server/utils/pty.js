// PTYService.js

const os = require("os");
const pty = require("node-pty");
const { includes } = require("lodash");


class PTY {
 
    
    cmdHistory= [];
    outputHistory =[];
    constructor(socket) {
        // Setting default terminals based on user os
        // if(socket){
        //   this.socket = socket
        this.shell = os.platform() === "win32" ? "powershell.exe" : "bash";
        this.ptyProcess = null;
        this.socket = socket;
        // Initialize PTY process.

        // }
        if (PTY._instance) {
             return PTY._instance;
        }
        // else{
        this.startPtyProcess();
        // }

        PTY._instance = this;
    }

    /**
     * Spawn an instance of pty with a selected shell.
     */
    startPtyProcess() {
        this.ptyProcess = pty.spawn(this.shell, [], {
            name: "xterm-color",
            cwd: __dirname, // Which path should terminal start
            env: process.env, // Pass environment variables
            cols: 80,
            rows: 30,
        });

        this.cmdHistory =[];
        this.outputHistory= [];
        // Add a "data" event listener.
        this.ptyProcess.onData(data => {
            
            // Whenever terminal generates any data, send that output to socket.io client
            this.sendToClient(data, 'command');
        });
    }

    spawn(commands, spawnOptions) {
         this.ptyProcess = pty.spawn( commands, spawnOptions);
         
       
    }

    isThisAnEcho(cmdStr, history) {
        let _1 = cmdStr.trim()
        let _2 = [...history].pop()?.trim()
        _1 = _1.split('\n')[0].trim()
        return _1 === _2;
      }
    
   
    write(data) {
     
        if(this.ptyProcess){
            this.cmdHistory.push(data);
            console.log(this.cmdHistory)
            
             this.ptyProcess.write(data );
        }

    }

    sendToClient(data, type) {
        if(this.socket){
            if (this.isThisAnEcho(data,this.cmdHistory)) return;
            if (this.isThisAnEcho(data,this.outputHistory))return;
            this.outputHistory.push(data)
            console.log("1st place",JSON.stringify(data));
            if(data.includes("\u0007\u001b")){

                data = this.removeLastLine(data);
            }
            if(data.includes("\n")){
                let temp ="";
                let  splitLines =  data.split(/\r?\n/);
                console.log(splitLines);
                let i=0;
                console.log(splitLines);
                while(splitLines[i]&&splitLines[i]!=="") {
                    temp = temp+ splitLines[i]+"\n"
                    i++;
                    console.log("temp",temp);
                }
                data = temp;
            }
            else{
                data =data+"\n";
            }
            console.log(data);


            
           
           
            
            // Emit data to socket.io client in an event "output"
            this.socket.emit('output', JSON.stringify({
                "type": type,
                "output": data
            }));
        }
    }

    removeLastLine(x) {
        x = x.split('\n');
        x.pop();
        return x.join('\n')
    }

    closeTerminal() {
        PTY._instance = null;
        this.ptyProcess = null;
    }
}

module.exports = PTY;