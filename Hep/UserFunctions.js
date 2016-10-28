//including our own connect
function handle_Connects_and_Disconnects(Users,ControllerModel,Models)
{
	if( Users.length < InputObject.UserData.length)
	{		
		for(var i = Users.length; i < InputObject.UserData.length; i++)
		{
			var CameraArgument;
			if(Users.length === 0){
				CameraArgument = Camera;
				InputObject.UserData[i].CameraPosition.copy(Camera.position);
				InputObject.UserData[i].CameraQuaternion.copy(Camera.quaternion);
			}
			else
				CameraArgument = "you need to make it";
			
			Users[i] = new User(
				InputObject.UserData[i].Gripping, 		InputObject.UserData[i].ID,					ControllerModel,
				InputObject.UserData[i].HandPosition,  	InputObject.UserData[i].HandQuaternion,
				InputObject.UserData[i].CameraPosition,	InputObject.UserData[i].CameraQuaternion, 	CameraArgument, i);
			
			Scene.add(Users[i].Controller);
			Scene.add(Users[i].CameraObject);
			
			if(Master)
				EmitModelStates(Models); //also emit state of every other object
		}
	}

	if( InputObject.UserDisconnect !== "" ){
		for(var i = 0; i < InputObject.UserData.length; i++ )
		{
			if( InputObject.UserData[i].ID === InputObject.UserDisconnect ) 
			{
				Scene.remove(Users[i].Controller);
				Scene.remove(Users[i].CameraObject);
				Users.splice(i,1);
				InputObject.UserData.splice(i,1);
				
				InputObject.UserDisconnect = "";
				break;
			}
		}
	}
}

function EmitModelStates(Models)
{
	var ModelPositions = Array(Models.length);
	var ModelQuaternions = Array(Models.length);
	for(var i = 0; i < Models.length; i++)
	{
		ModelPositions[i] = Models[i].position.clone();
		ModelQuaternions[i] = Models[i].quaternion.clone();
	}
	socket.emit('ModelsReSync', {ModelPositions,ModelQuaternions});
}

//"constructor", though we don't expect to use it outside of handle_Connects_and_Disconnects
function User(Gripping, ID, ControllerModel,
		HandPosition,HandQuaternion,
		CameraPosition,CameraQuaternion,CameraArgument, PositionInUserArray)
{
	var newUserColorComponent;
	if( Master )
	{
		if(PositionInUserArray)
			newUserColorComponent = 1;
		else
			newUserColorComponent = 0;
	}
	else {
		if(PositionInUserArray)
			newUserColorComponent = 0;
		else
			newUserColorComponent = 1;
	}
	var newUserColor = new THREE.Color(newUserColorComponent,newUserColorComponent,newUserColorComponent);
	
	if( CameraArgument !== "you need to make it" ) {
		this.CameraObject = CameraArgument;
	}
	else
	{
		this.CameraObject = new THREE.Object3D();
		
		CameraRadius = 8;
		
		//aperture
		this.CameraObject.add(new THREE.Mesh( 
				new THREE.CylinderGeometry(CameraRadius / 2, CameraRadius/3, 4, 16, 1, true), 
				new THREE.MeshBasicMaterial({color:0x888888}) ) );
		
		for(var i = 0; i < this.CameraObject.children[0].geometry.vertices.length; i++)
		{
			this.CameraObject.children[0].geometry.vertices[i].applyAxisAngle(Central_Y_axis, TAU / 8);
			this.CameraObject.children[0].geometry.vertices[i].y += CameraRadius; //really this should be deduced based on aperture
			this.CameraObject.children[0].geometry.vertices[i].applyAxisAngle(Central_X_axis, -TAU / 4);
		}
		this.CameraObject.children[0].material.side = THREE.DoubleSide;
		
		//box
		this.CameraObject.add(new THREE.Mesh( 
				new THREE.BoxGeometry(
						CameraRadius * Math.sqrt(2),
						CameraRadius * Math.sqrt(2),
						CameraRadius * Math.sqrt(2),
						CameraRadius * Math.sqrt(2) ), 
						new THREE.MeshBasicMaterial({}) ) );
		this.CameraObject.children[1].material.color.copy(newUserColor);
		
		//red light
		this.CameraObject.add(new THREE.Mesh( 
				new THREE.CylinderGeometry(CameraRadius / 16, 0.001, 10, 4), 
				new THREE.MeshBasicMaterial({color:0xff0000}) ) );
		for(var i = 0; i < this.CameraObject.children[2].geometry.vertices.length; i++)
		{
			this.CameraObject.children[2].geometry.vertices[i].applyAxisAngle(Central_Y_axis, TAU / 8);
			this.CameraObject.children[2].geometry.vertices[i].y += CameraRadius / 2 - 3;
			this.CameraObject.children[2].geometry.vertices[i].x += CameraRadius / 2;
			this.CameraObject.children[2].geometry.vertices[i].z += CameraRadius / 2;
			this.CameraObject.children[2].geometry.vertices[i].applyAxisAngle(Central_X_axis, -TAU / 4);
		}
		
//		if(newUserColorComponent === 0)
//			this.CameraObject.add(Ourface)
//		Ourface.scale.set(30,30,30);
//		Ourface.position.z = -10;
		
		this.CameraObject.scale.set(0.006,0.006,0.006);
	}
	
//	this.CameraObject.position.copyvec(CameraPosition);
	copyvec(this.CameraObject.position,CameraPosition);
	copyquat(this.CameraObject.quaternion,CameraQuaternion);
//	this.CameraObject.quaternion.copy(CameraQuaternion);
	
	this.Controller = ControllerModel.clone();
	this.Controller.material = ControllerModel.material.clone();
	this.Controller.material.color.copy(newUserColor);

	this.Controller.position.copy(HandPosition); //so we're not doing anything with handposition
	
	//this can be removed once you have tracking
	{
		this.Controller.lookAt(this.CameraObject.position);
		this.Controller.rotateOnAxis(Central_X_axis, TAU / 4);
		copyquat(HandQuaternion,this.Controller.quaternion);
	}
	
	this.Gripping = Gripping;
	this.GetInput = GetInput;
	this.ID = ID;
}

//becomes a function associated with the Users
function GetInput()
{
	this.Gripping_previously = this.Gripping;
	
	for(var i = 0; i < InputObject.UserData.length; i++ ) {
		if(InputObject.UserData[i].ID === this.ID)
		{
			//should we be updating at all here?
			if(Camera.uuid === this.CameraObject.uuid)
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
							//console.log(gamepads[k].pose.orientation);
							
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
			else
			{
				copyvec(  this.CameraObject.position,	InputObject.UserData[i].CameraPosition );
				copyquat( this.CameraObject.quaternion,	InputObject.UserData[i].CameraQuaternion );
				
				copyvec( this.Controller.position,		InputObject.UserData[i].HandPosition);
				copyquat(this.Controller.quaternion, 	InputObject.UserData[i].HandQuaternion);
				
				this.Gripping = InputObject.UserData[i].Gripping;
			}
			
			this.Controller.updateMatrixWorld();
			
			break;
		}
	}
}