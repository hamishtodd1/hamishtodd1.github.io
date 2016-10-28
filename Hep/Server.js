var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var MasterID = "none";

app.use(express.static(__dirname ));

//Just sends the damn files, then others are brought in?
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

//also sometimes the Master doesn't seem to disconnect when you close the page
//pretty freaking crazy: as soon as user's address bar autocompletes to the address, apparently that's a connection?
//that is a problem because they register as separate connections but one of them DOESN'T DISCONNECT RAAAARGH
io.on('connection', function(socket){
	//these are called when it happens
	console.log("new connection")
	if(MasterID === "none"){
		MasterID = socket.id;
		console.log("Master connected: ", socket.id)
		io.to(socket.id).emit('OnConnect_Message', {ID:socket.id,Master:1});
	}
	else
	{
		console.log("Regular user connected: ", socket.id)
		io.to(socket.id).emit('OnConnect_Message', {ID:socket.id,Master:0});
	}
	
	socket.broadcast.on('UserStateUpdate', function(msg){
		socket.broadcast.emit('UserStateUpdate', msg);
	});
	
	socket.broadcast.on('ModelsReSync', function(msg){
		socket.broadcast.emit('ModelsReSync', msg);
	});
	
	socket.on('disconnect', function () {
		if(socket.id === MasterID)
		{
			MasterID = "none";
			console.log("Master disconnected")
		}
		else
			console.log("Regular user disconnected")
		
		//also, remove the copies from all the scenes
		socket.broadcast.emit('UserDisconnected', socket.id);
	});
});

http.listen(3000, function(){
	console.log('Server is listening on port 3000, go there in a browser');
});

//Temporarily: we have connection 0, the lecturer, and other connections are spectators who share a camera