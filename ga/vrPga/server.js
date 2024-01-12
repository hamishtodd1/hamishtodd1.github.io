///////////////
// IMPORTING //
///////////////

const express = require("express");
const app = express();
app.use(express.static(__dirname ));

//Sends files
app.get("/", function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

const http = require("http").Server(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 8000
http.listen(port, () => {
	log("\nserver is listening on port ", port);
})

////////////////////
// INFRASTRUCTURE //
////////////////////

const log = console.log

let sockets = []

io.on('connection', socket => {
	// console.log("User connected")

    sockets.push(socket)

	socket.emit("serverConnected")

	socket.on("snappable", (msg) => {
        sockets.forEach(s=>{
            if(s === socket)
                return

            s.emit("snappable",msg)
        })
    })
    socket.on("sclptable", (msg) => {
        sockets.forEach(s => {
            if (s === socket)
                return

            s.emit("sclptable", msg)
        })
    })
})