var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var MasterID = "none";

app.use(express.static(__dirname ));

//No idea what these things are. Just sends the damn page. 
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

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
	
	socket.broadcast.on('Carbon caught', function(msg){ console.log("Carbon caught"); });
	socket.broadcast.on('Oxygen caught', function(msg){ console.log("Oxygen caught"); });
	socket.broadcast.on('Oxygen appeared', function(msg){ console.log("OXYGEN APPEARED"); });
	socket.broadcast.on('Carbon appeared', function(msg){ console.log("CARBON APPEARED"); });
	socket.broadcast.on('level loaded', function(msg){ console.log("LEVEL LOADED"); });
	socket.broadcast.on('DETACHED', function(msg){ console.log("DETACHED"); });
	
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