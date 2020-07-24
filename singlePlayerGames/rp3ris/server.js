var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.use(express.static(__dirname ));
app.get("../mixedReality/", function(req, res)
{
	res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket)
{
	console.log("User connected: ", socket.id)
	io.to(socket.id).emit("yesYouAreConnectedToAServer", {id:socket.id});
	
	//"automatically rebroadcast everything" would be good
	
	socket.broadcast.on(
		'hey, I am a connected browser window',
		function( msg )
		{
			socket.broadcast.emit( 'hey, I am a connected browser window', msg);
		}
	);
});

let port = 3000;
http.listen(port, function()
{
	//3000 for local, 8000 for proper. Might need a sudo
	console.log("Server is listening on port #" + port + ", go there in a browser");
});