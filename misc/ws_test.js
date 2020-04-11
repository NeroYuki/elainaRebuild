const WebSocket = require('ws');
const zlib = require('zlib')
// Create WebSocket connection.
const socket = new WebSocket('wss://arc.estertion.win:616');

let data = ""

// Connection opened
socket.on('open', function (event) {
    data = ""
    socket.send('498367497')
});

// Listen for messages
socket.on('message', function (message) {
    console.log('Message from server ', message);
    if (message != 'bye') {
        data += message
    }
    else if (message == 'bye') { 
        dataProcess()
    }
});

socket.on("error", function(err) {
    console.log(err)
    dataProcess();
})

function dataProcess() {
    zlib.brotliDecompress(data, {}, (err, res) => {
        if(err) throw err
        console.log(res)
    })
}