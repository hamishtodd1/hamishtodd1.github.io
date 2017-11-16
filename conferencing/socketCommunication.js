function initSocket( cursor )
{
	if ( !("WebSocket" in window) )
	{
		alert("Your browser does not support web sockets");
		return;
	}

	var socket = new WebSocket("ws://" + window.location.href.substring(7) + "ws");
	if(!socket)
	{
		console.log("invalid socket");
		return;
	}
	socket.onclose = function()
	{
		console.log("The connection has been closed. Maybe you had no data loaded?");
	}
	
	socket.messageResponses = {};
	
	socket.messageResponses["F5"] = function(messageContents)
	{
		if( parseInt( messageContents[1] ) )
			window.location.reload(true);
	}
	
	socket.messageResponses["Map"] = function(messageContents)
	{
		//it's probably still worthwhile for user to have the slab thing, but you just control it with head
		//have two little grabbable things which you can move towards and away from you. Well, you never want to angle them. So: there's a handle. Grab the handle and move it away, that makes it
	}
	
	socket.messageResponses["Didn't understand that"] = function(messageContents)
	{
		console.error("Server didn't understand our message")
	}
	
	socket.onmessage = function(msg)
	{
		var messageContents = (msg.data).split(",");
		
		if( typeof socket.messageResponses[ messageContents[0] ] === 'undefined' )
			console.error("unrecognized message header: ", messageContents[0] )
		else
			socket.messageResponses[ messageContents[0] ]( messageContents );
	}
	
	return socket;
}