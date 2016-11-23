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

//becomes a function associated with the Users
function GetVRInput()
{
	if( VRMODE )
	{
		//we change the camera position during the loop
		
		var worldspacePosition = new THREE.Vector3();
		Camera.localToWorld(worldspacePosition);
		
		var worldspaceQuaternion = new THREE.Quaternion();
		worldspaceQuaternion.setFromRotationMatrix(new THREE.Matrix4().extractRotation(Camera.matrixWorld));
		
		copyvec(  InputObject.UserData[i].CameraPosition,	worldspacePosition);
		copyquat( InputObject.UserData[i].CameraQuaternion,	worldspaceQuaternion);
		
		if( VRMODE ) //hands
		{
			var gamepads = navigator.getGamepads();
			
			for(var k = 0; k < gamepads.length; ++k)
			{					
				if (gamepads[k] && gamepads[k].pose) //because some are undefined
				{
					this.Controller.position.x = gamepads[k].pose.position[0];
					this.Controller.position.y = gamepads[k].pose.position[1];
					this.Controller.position.z = gamepads[k].pose.position[2];
					
					//pretty hacky solution to relative position problem
					this.Controller.position.add(INITIAL_CAMERA_POSITION);
					
					this.Controller.quaternion.x = gamepads[k].pose.orientation[0];
					this.Controller.quaternion.y = gamepads[k].pose.orientation[1];
					this.Controller.quaternion.z = gamepads[k].pose.orientation[2];
					this.Controller.quaternion.w = gamepads[k].pose.orientation[3];
				      
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
					
					//TODO deffo a bit weird to have this one go in the opposite direction. Certainly introduces latency
					copyvec( InputObject.UserData[i].HandPosition,	this.Controller.position);
					copyquat(InputObject.UserData[i].HandQuaternion,this.Controller.quaternion);
					InputObject.UserData[i].Gripping = this.Gripping;
				}
			}
		}
	}
}

socket.on('UserStateUpdate', function(msg)
{
	//note that this will not happen if InputObject.UserData.length === 0. i.e. first user will be us.
	for(var i = 0; i < InputObject.UserData.length; i++ ) {
		if(msg.ID === InputObject.UserData[i].ID ) {
			copyvec(	InputObject.UserData[i].CameraPosition, 	msg.CameraPosition);
			copyquat(	InputObject.UserData[i].CameraQuaternion, 	msg.CameraQuaternion);
			copyvec(	InputObject.UserData[i].HandPosition,		msg.HandPosition);
			copyquat(	InputObject.UserData[i].HandQuaternion,		msg.HandQuaternion);
			InputObject.UserData[i].Gripping = msg.Gripping;
			
			break;
		}
		
		if(i === InputObject.UserData.length - 1){
			//Couldn't find our user. So, new user
			InputObject.UserData.push(msg);
		}
	}
});

socket.on('UserDisconnected', function(msg)
{
	if(InputObject.UserDisconnect !== ""){
		var textGeo = new THREE.TextGeometry( "TWO USERS DISCONNECTED SIMULTANEOUSLY!!!", {

			font: font,

			size: size,
			height: height,
			curveSegments: curveSegments,

			bevelThickness: bevelThickness,
			bevelSize: bevelSize,
			bevelEnabled: bevelEnabled,

			material: 0,
			extrudeMaterial: 1

		});
		var mat = new THREE.MultiMaterial( [
			new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
			new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
		] );
		Scene.add(new THREE.Mesh(textGeo,mat));
	}
		
	InputObject.UserDisconnect = msg;
});