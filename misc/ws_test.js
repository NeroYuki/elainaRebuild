const WebSocket = require('ws');
const zlib = require('zlib')
const fs = require('fs')
// Create WebSocket connection.

let data = []
let dataFlag = false;
function connect() {
    const socket = new WebSocket('wss://arc.estertion.win:616');

    // Connection opened
    socket.on('open', function (event) {
        data = []
        socket.send('498367497')
    });

    // Listen for messages
    socket.on('message', function (message) {
        console.log('Message from server ', message);
        if (Buffer.isBuffer(message)) {
            dataProcess(message)
        }
        else if (message == 'bye') { 
            socket.close()
        }
        else if (message == 'error,fetch') {
            connect()
        }
    });

    socket.on("error", function(err) {
        console.log(err)
    })

    socket.on("close", function () {
        console.log("connection closed")
        //console.log(data)
    })
}

connect()

function dataProcess(buffer_data) {
    //let concat_data = Buffer.concat(data)
    zlib.brotliDecompress(buffer_data, {}, (err, res) => {
        if(err) throw err
        //console.log(res)
        let obj = JSON.parse(res)
        console.log(JSON.stringify(obj, "", "  "))
    })
}

function fileDataProcess() {
    fs.readFile('data', (err, filedata) => {
        if (err) throw err
        zlib.brotliDecompress(filedata, {}, (err, res) => {
            if(err) throw err
            let obj = JSON.parse(res, (key, value) => {
                if (key == "data") console.log(JSON.stringify(value))
                console.log(key + ": " + value)
                return value
            })
            console.log(obj)
            // fs.writeFile('songtext.txt', JSON.stringify(obj, "", "\t"), () => {
            //     console.log('done')
            // })
        })
    })
}

//fileDataProcess()