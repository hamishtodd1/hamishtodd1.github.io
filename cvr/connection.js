function initSocket() 
{
	var ip = "192.168.56.101"
	ip = "localhost"
	// ip = "131.111.85.90"
	// ip = "10.0.2.15"
	socket = new WebSocket("ws://"+ip+":9090/ws");
	oldReadyState = socket.readyState;
	socket.onerror = function()
	{
		console.error("Connection address may need to be changed");
	}
	
	socket.onclose = function()
	{
		console.log("Lost connection");
	}

	socket.commandReactions = {};
	socket.onmessage = function(msgContainer)
	{
		//parse and stringify are both linear in number of characters
		//does it have to be with strings? Take it to a connections expert at some point
		//perfectly possible with ASCII
		var msg = JSON.parse(msgContainer.data);

		if(!socket.commandReactions[msg.command])
		{
			console.error("Mistyped header: ", msg.command)
			return;
		}

		var commandExecutedSuccessfully = socket.commandReactions[msg.command](msg);

		if( commandExecutedSuccessfully !== false )
		{
			for(var i = 0; i < commandExpectations.length; i++)
			{
				if( commandExpectations[i].command === msg.command )
				{
					//if you have a bunch of identical ones you won't know which is which
					console.log("expectation resolved: ", msg.command)
					commandExpectations.splice(i, 1);
					break;
				}
			}
		}
	}

	{
		var commandExpectations = [];

		function CommandExpectation(command,length)
		{
			if(length === undefined)
			{
				length = 1;
			}
			this.timer = length;
			this.command = command;
		}
		CommandExpectation.prototype = {
			constructor:CommandExpectation,
		}

		socket.expectCommand = function(specificExpectedCommand,length)
		{
			for(var i = 0; i < commandExpectations.length; i++)
			{
				if( commandExpectations[i].command === specificExpectedCommand )
				{
					return;
				}
			}

			var commandExpectation = new CommandExpectation(specificExpectedCommand,length);
			commandExpectations.push(commandExpectation);
		}

		socket.expectationExists = function(command)
		{
			for(var i = 0; i < commandExpectations.length; i++)
			{
				if( commandExpectations[i].command === command )
				{
					return true;
				}
			}
			return false;
		}
	}

	socket.update = function()
	{
		if(this.readyState === socket.OPEN && oldReadyState !== socket.OPEN)
		{
			// console.log("opened")
		}
		oldReadyState = this.readyState;
		
		for(var i = 0, il = commandExpectations.length; i < il; i++)
		{
			commandExpectations[i].timer -= frameDelta;
			if( commandExpectations[i].timer < 0 )
			{
				console.error( "request not granted: ", commandExpectations[i].command );
				delete commandExpectations[i];
				commandExpectations.splice(i, 1);
			}
		}
	}

	return socket;
}