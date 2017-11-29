//Would also be nice if people could get in with a web link

(function()
{
	var socket = io();

	socket.on( 'logThisMessage', function(msg)
	{
		console.log(msg);
	});
	
	socket.on('serverConnected', function()
	{
		var textBox = document.createElement("TEXTAREA");
		textBox.cols = 100;
		textBox.rows = 8;
		textBox.autofocus = true;
		textBox.value = "data/NUDT7A-x1203.pdb"//"2AM9"
		// textBox.value = "Please enter one of the following:\n1. Session ID number (if someone has already set up a room)\n2. PDB ID\n3. Weblink to a .pdb file\n\nThen press enter";
		document.body.appendChild( textBox );

		socket.on('roomInvitation', function(roomInformation)
		{
			console.log("accepted into room with protein link: ", roomInformation.pdbWebAddress);

			document.removeEventListener( 'keydown', onEnterPressed );
			document.body.removeChild(textBox);

			crossPlatformInitialize(socket, roomInformation.pdbWebAddress, roomInformation.roomKey);
		});

		var onEnterPressed = function(event)
		{
			if(event.keyCode !== 13)
				return;

			var request = textBox.value.replace(/\s/g, '');

			if( request.length === 2 )
			{
				camera.position.z = -1;
				camera.rotation.y = TAU/2;
				socket.emit( 'roomEntryRequest', request );
			}
			else if(request.length === 4 )
			{
				socket.emit( 'roomInitializationRequest', "https://files.rcsb.org/download/" + request + ".pdb" );
			}
			else if( request.length > 8 && request.substr(request.length-4,request.length-1) === ".pdb")
			{
				socket.emit( 'roomInitializationRequest', request );
			}
			else textBox.value = "Sorry, request was not recognized"
		}

		// document.addEventListener( 'keydown', onEnterPressed );
		onEnterPressed({keyCode:13});
	});
})();