//--------------Bringing in libraries
var express = require('express');
var app = express();
app.use(express.static(__dirname ));

//Sends files when requested
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

//-------------Below here is our stuff

//we'll have a "make me the teacher" message
var participants = []
var teacherId = null
var chapter = 0

io.on('connection', function(socket)
{
	participants.push(socket)
	socket.emit('roomInvitation', {id:socket.id,chapter:chapter} );

	console.log("user connected")

	socket.on('This is the teacher', function (message)
	{
		if(teacherId === null)
		{
			console.log("teacher reserved")
			socket.emit("teacher status accepted")
			teacherId = socket.id
		}
		else
		{
			console.log("teacher hacking attempted!")
		}
	});

	socket.on("chapter update",function(newChapter)
	{
		chapter = newChapter
		for(var i = 0; i < participants.length; i++)
		{
			if( participants[i] !== socket )
			{
				participants[i].emit("chapter update",chapter);
			}
		}
	})

	socket.on('disconnect', function ()
	{
		console.log("user disconnected")
		if(socket.id === teacherId)
		{
			teacherId = null
		}
		participants.splice(participants.indexOf(socket),1);
	});
});

http.listen(9090, function() //Might need a sudo
{
	console.log('\nServer is listening on port 9090, go there in a browser');

	var os = require('os');

	var interfaces = os.networkInterfaces();
	console.log("\nPossible IP addresses:")
	for (var k in interfaces)
	{
	    for (var k2 in interfaces[k])
	    {
	        var address = interfaces[k][k2];
	        if (address.family === 'IPv4' && !address.internal)
	        {
	            console.log(address.address)
	        }
	    }
	}
});