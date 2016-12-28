var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname ));

//Just sends the damn files, then others are brought in?
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

//hey is it possible that things seem far away because of inter pupilary distance?

//pretty freaking crazy: as soon as user's address bar autocompletes to the address, apparently that's a connection?
//that is a problem because they register as separate connections but one of them DOESN'T DISCONNECT RAAAARGH
io.on('connection', function(socket){
	//these are called when it happens
	console.log("User connected: ", socket.id)
	io.to(socket.id).emit('OnConnect_Message', {ID:socket.id});
	
	socket.broadcast.on('CameraStateUpdate', function(msg){ socket.broadcast.emit('CameraStateUpdate', msg); });
	socket.broadcast.on('ModelStateUpdate',  function(msg){ socket.broadcast.emit('ModelStateUpdate',  msg); });
	
	socket.on('disconnect', function () {
		console.log("User disconnected");
	});
});

http.listen(3000, function(){ //3000 for local, 8000 for proper. Might need a sudo
	console.log('Server is listening on port 3000, go there in a browser');
});