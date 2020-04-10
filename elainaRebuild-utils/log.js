function LogtoConsole(msg) {
    console.log(new Date(Date.now()).toTimeString() + ": " + msg)
}

function ErrortoConsole(msg) {
    //TODO: make a log file and upload to somewhere
    console.error(new Date(Date.now()).toTimeString() + ": " + msg)
}

module.exports.toConsole = LogtoConsole
module.exports.errConsole = ErrortoConsole