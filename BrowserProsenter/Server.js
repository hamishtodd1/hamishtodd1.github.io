var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname ));

//Just sends the damn files, then others are brought in?
app.get('/', function(req, res)
{
	res.sendFile(__dirname + '/index.html');
});

//pretty freaking crazy: as soon as user's address bar autocompletes to the address, apparently that's a connection?
//that is a problem because they register as separate connections but one of them DOESN'T DISCONNECT RAAAARGH
io.on('connection', function(socket)
{
	console.log("User connected: ", socket.id)
	io.to(socket.id).emit('OnConnect_Message', {ID:socket.id});
	
	socket.broadcast.on(
		'ModelsControllersCameraUpdate',
		function( msg )
		{
			socket.broadcast.emit( 'ModelsControllersCameraUpdate', msg);
		}
	);

	socket.broadcast.on(
		'screenIndicator',
		function( msg )
		{
			socket.broadcast.emit( 'screenIndicator', msg);
		}
	);
});

let port = 3000;
http.listen(port, function()
{
	//3000 for local, 8000 for proper. Might need a sudo
	console.log('Server is listening on port ' + port + ', go there in a browser');
});

//socket.emit('ModelsControllersCameraUpdate', objectContainingStuff );
// socket.on('ModelsControllersCameraUpdate', function(objectContainingStuff)
// {
// });