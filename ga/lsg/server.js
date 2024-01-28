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
	log("\nlistening on port ", port);
})

////////////////////
// INFRASTRUCTURE //
////////////////////

const log = console.log

io.on('connection', function (socket) {
	// console.log("User connected")

	socket.emit("serverConnected")

	socket.broadcast.on(
		'genericUpdate',
		msg => socket.broadcast.emit('genericUpdate', msg)
	);
});