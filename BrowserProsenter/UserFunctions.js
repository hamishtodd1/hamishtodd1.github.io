//including our own connect

function EmitModelStates(Models, Controllers)
{
	var ModelPositions = Array(Models.length);
	var ModelQuaternions = Array(Models.length);
	for(var i = 0; i < Models.length; i++)
	{
		ModelPositions[i] = Models[i].position.clone();
		ModelQuaternions[i] = Models[i].quaternion.clone();
	}
	
	var ControllerPositions = Array(Controllers.length);
	var ControllerQuaternions = Array(Controllers.length);
	for(var i = 0; i < Controllers.length; i++)
	{
		ControllerPositions[i] = Controllers[i].position.clone();
		ControllerQuaternions[i] = Controllers[i].quaternion.clone();
	}
	
	socket.emit('ModelsReSync', {ModelPositions,ModelQuaternions,ControllerPositions,ControllerQuaternions});
}

function GetVRInput(Controllers)
{
	var gamepads = navigator.getGamepads();
	
	if(gamepads.length>1)console.error(gamepads.length, " controllers???")
	for(var k = 0; k < gamepads.length && k < 2; ++k)
	{		
		if (gamepads[k] && gamepads[k].pose) //because some are undefined
		{
			Controllers[k].position.x = gamepads[k].pose.position[0];
			Controllers[k].position.y = gamepads[k].pose.position[1];
			Controllers[k].position.z = gamepads[k].pose.position[2];
			
			Controllers[k].quaternion.x = gamepads[k].pose.orientation[0];
			Controllers[k].quaternion.y = gamepads[k].pose.orientation[1];
			Controllers[k].quaternion.z = gamepads[k].pose.orientation[2];
			Controllers[k].quaternion.w = gamepads[k].pose.orientation[3];
		      
			//a very primitive way to work out grippingness. If any button on any gamepad is pushed.
			for (var j = 0; j < gamepads[k].buttons.length; ++j)
			{
				if (gamepads[k].buttons[j].pressed)
				{
					this.Gripping = 1;
					break;
				}
				
				if( j === gamepads[k].buttons.length - 1)
					this.Gripping = 0;
			}
		}
	}
}

socket.on('UserStateUpdate', function(msg)
{
	//waiting for the getinput function to be called doesn't seem all that important since you're a spectator
	copyvec(	Camera.position, 	msg.CameraPosition );
	copyquat(	Camera.quaternion, 	msg.CameraQuaternion );
	copyvec(	InputObject.HandPositions[0],		msg.HandPosition);
	copyquat(	InputObject.HandQuaternions[0],		msg.HandQuaternion);
});

socket.on('UserDisconnected', function(msg)
{
	if(InputObject.UserDisconnect !== ""){
		console.error("TWO USERS DISCONNECTED SIMULTANEOUSLY!!!")
	}
		
	InputObject.UserDisconnect = msg;
});