//--------------Bringing in libraries
var express = require('express');
var app = express();
app.use(express.static(__dirname ));

//Sends files when requested
app.get('/', function(req, res)
{
	res.sendFile(__dirname + '/index.html');
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

//-------------Below here is our stuff
var rooms = {};
function beginRoom(pdbWebAddress, id)
{
	rooms[id] = {};
	rooms[id].pdbWebAddress = "data/NUDT7A-x1203.pdb";
	rooms[id].participants = [];
}
//Default room
beginRoom("data/NUDT7A-x1203.pdb", "oo");

io.on('connection', function(socket)
{
	console.log("potential user connected: ", socket.id);

	socket.emit('serverConnected');

	socket.on( 'logThisMessage', function(msg)
	{
		console.log(msg);
	});

	var roomKey = "";

	socket.on('roomInitializationRequest', function(pdbWebAddress)
	{
		roomKey = (Math.random()+1).toString(36).substr(2,2);
		console.log( "starting room: ", roomKey)
		if( rooms[roomKey] )
		{
			console.log("Tried to start a room that already exists?")
		}

		beginRoom(pdbWebAddress, roomKey)

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

	function bringIntoAllocatedRoom()
	{
		socket.emit('roomInvitation', {
			roomKey:roomKey,
			pdbWebAddress:rooms[roomKey].pdbWebAddress,
			ourID:socket.id
		} );

		rooms[roomKey].participants.push(socket);

		console.log( "\nallocating ", socket.id, " to room ", roomKey, "\ncurrent number of participants: ", rooms[roomKey].participants.length);

		//---------------the below is everything that goes beyond entry
		function emitToAllOthersInRoom(messageString,content)
		{
			for(var i = 0; i < rooms[roomKey].participants.length; i++)
			{
				if( rooms[roomKey].participants[i] !== socket )
				{
					rooms[roomKey].participants[i].emit(messageString,content);
				}
			}
		}

		function markMessageAsSimplyRebroadcasted(messageString)
		{
			socket.on(messageString, function(content)
			{
				emitToAllOthersInRoom(messageString,content)
			});
		}
		markMessageAsSimplyRebroadcasted('userUpdate');
		markMessageAsSimplyRebroadcasted('poiUpdate');
		markMessageAsSimplyRebroadcasted('masterCommand');

		socket.on('disconnect', function ()
		{
			rooms[roomKey].participants.splice(rooms[roomKey].participants.indexOf(socket),1);

			if( roomKey !== "oo" && rooms[roomKey].participants.length === 0)
			{
				delete rooms[roomKey];
			}
		});
	}

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