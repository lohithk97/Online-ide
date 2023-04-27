const PTY = require("./pty");
let fs = require('fs');

let compileIt=function (socket, data) {
    console.log("started");
        let code = data.code;
        fs.writeFileSync(__dirname + '/' + data.userId + '.py', code, function (err) {
            if (err) {
                console.log('File not written')
            }
            console.log('success')
        })

        let pty = new PTY(socket);
       
      pty.write('python '+ __dirname + '/' + data.userId + '.py \n');
    
        
        pty.socket.on('input', input => {
           
            // Runs this listener when socket receives "input" events from socket.io client.
            // input event is emitted on client side when user types in terminal UI
            pty.write(input );
             
        });
    
        pty.socket.on('disconnect', function () {
            pty.closeTerminal();
            console.log("exit")
        });
        
        pty.socket.on('stop', function () {
            pty.sendToClient('', 'stop');
            pty.closeTerminal();
            console.log("exit")
        });
        return pty;
    }




    module.exports = {  compileIt: compileIt}