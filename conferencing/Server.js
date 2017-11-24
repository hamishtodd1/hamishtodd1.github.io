//--------------Bringing in libraries, not really sure what they do
var express = require('express');
var app = express();
app.use(express.static(__dirname ));

//Sends files when requested?
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

//-------------The real stuff
var rooms = {};

// https://gist.github.com/alexpchin/3f257d0bb813e2c8c476
//it gets serverConnected but not the one after that?
io.on('connection', function(socket)
{
	console.log("User connected: ", socket.id);

	socket.emit('serverConnected');

	socket.on( 'logThisMessage', function(msg)
	{
		console.log(msg);
	});

	var roomKey = "";

	function bringIntoAllocatedRoom()
	{
		socket.emit('roomInvitation', {roomKey:roomKey,pdbWebAddress:rooms[roomKey].pdbWebAddress} );
		//next is to add participants

		rooms[roomKey].participants.push(socket);

		console.log( "\nallocating ", socket.id, " to room ", roomKey, ".\ncurrent set of participants: ", rooms[roomKey].participants);
	}

	socket.on('roomInitializationRequest', function(pdbWebAddress)
	{
		roomKey = (Math.random()+1).toString(36).substr(2,2);
		console.log( "starting room: ", roomKey)
		if( rooms[roomKey] )
			console.log("Oh dear")

		rooms[roomKey] = {};
		rooms[roomKey].pdbWebAddress = pdbWebAddress;
		rooms[roomKey].participants = [];

		bringIntoAllocatedRoom();
	});

	socket.on('roomEntryRequest', function(requestedRoomKey)
	{
		if( !rooms[requestedRoomKey] )
		{
			console.log( "didn't find room ", requestedRoomKey, ", all we have is ", rooms)
			socket.emit('logThisMessage', "room not found");
		}
		else
		{
			roomKey = requestedRoomKey;
			bringIntoAllocatedRoom();
		}
	});

	// socket.on('disconnect', function ()
	// {
	// 	ourRoom.participants.splice(rooms.indexOf(socket),1);
		
	// 	socket.broadcast.emit('UserDisconnected', socket.id);
	// });
});

http.listen(9090, function() //Might need a sudo
{
	console.log('\nServer is listening on port 9090, go there in a browser');

	var os = require('os');

	var interfaces = os.networkInterfaces();
	console.log("\nPossible IP addresses:")
	for (var k in interfaces) {
	    for (var k2 in interfaces[k]) {
	        var address = interfaces[k][k2];
	        if (address.family === 'IPv4' && !address.internal) {
	            console.log(address.address)
	        }
	    }
	}
});

/*
This server runs "forever"

When someone logs in they have, themselves,

TODO if you refresh the script, all running windows must close, who knows what happens otherwise
*/

//bug: as soon as user's address bar autocompletes to the address, apparently that's a connection?
//that is a problem because they register as separate connections but one of them DOESN'T DISCONNECT RAAAARGH