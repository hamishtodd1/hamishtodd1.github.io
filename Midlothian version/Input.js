//"get position data from other users" and "get our controller data" might be very different abstractions
var InputObject = { //only allowed to use this in this file and maybe in initialization
	UserDisconnect: "",
	UserData: Array(), //maybe the coming values should be properties of the objects? There are probably best practices...
	
	ModelPositions: Array(),
	ModelQuaternions: Array(),
	ModelsReSynched: 0,
	
	UserOrbitRequest: new THREE.Vector3(), //vector2, but we may want to cross product
	UserString: "",
	UserPressedEnter: 0,
	
	clientX: 0,
	clientY: 0
};

function UpdateVRCameraPosition()
{
	var oldCameraPosition = Camera.position.clone();
	OurVRControls.update();
	if(!Camera.position.equals(oldCameraPosition))
	{
		//if that changed anything, we need to process it
		Camera.position.add(INITIAL_CAMERA_POSITION);
	}
}

function ReadInput(Users, ControllerModel,Models)
{	
	//eventually this will do everything that the mouse event listeners and the first "User.getinput" currently does
	if(VRMODE)
		UpdateVRCameraPosition();
	
	
	handle_Connects_and_Disconnects(Users,ControllerModel,Models);
	
	
	for(var i = 0; i < Users.length; i++)
		Users[i].GetInput();
	
	if(InputObject.ModelsReSynched && Models.length === InputObject.ModelPositions.length ) //will be destroyed by the possibility of deleting models
	{
		for(var i = 0; i < Models.length; i++)
		{
			Models[i].position.copy(InputObject.ModelPositions[i]);
			Models[i].quaternion.copy(InputObject.ModelQuaternions[i]);
		}
		
		InputObject.ModelsReSynched = 0;
	}
	
	socket.emit('UserStateUpdate', InputObject.UserData[0] ); //we could emit it with every control change?
}

//keyboard crap. Currently using "preventdefault" then "return" on everything you use, there's probably a better way
document.addEventListener( 'keydown', function(event)
{
	if(event.keyCode === 190 )
	{
		event.preventDefault();
		VRMODE = 1; //once you're in I guess you're not coming out!
		OurVREffect.setFullScreen( true );
		
		//bug if we do this earlier(?)
		for(var i = 0; i < 6; i++)
			OurVREffect.scale *= 0.66666666;
		
		return;
	}
	
	if(event.keyCode === 75 )
	{
		rubisco_attached = 0;
		
		socket.emit( 'DETACHED' );
	}
	
	if(event.keyCode === 32 )
	{
		current_chapter++;
		
		if(current_chapter === 1)
		{
			socket.emit( 'Carbon appeared' );
			for(var i = 0,il = CO2s.length; i < il; i++)
				CO2s[i].visible = true;
		}	
		
		if(current_chapter === 2)
		{
			socket.emit( 'Oxygen appeared' );
			for(var i = 0,il = O2s.length; i < il; i++)
				O2s[i].visible = true;
		}
		
		if(current_chapter >= 3)
		{
			load_level(current_chapter - 3);
			socket.emit( 'level loaded' );
		}
	}
	
}, false );

function ChangeUserString(newstring)
{	
	InputObject.UserString = newstring;
	
	//remove the previous string that was in there
	for(var i = 0; i < Scene.children.length; i++)
	{
		if( Scene.children[i].name === "The User's string")
			Scene.remove(Scene.children[i]);
	}
	
	if(newstring === "")
		return;
	
	var TextMesh = new THREE.Mesh(
			new THREE.TextGeometry(newstring,{size: 5, height: 1, font: gentilis}),
			new THREE.MeshPhongMaterial( {
				color: 0x156289,
				emissive: 0x072534,
				shading: THREE.FlatShading
			}) );
	
	var TextCenter = new THREE.Vector3();
	for ( var i = 0, l = TextMesh.geometry.vertices.length; i < l; i ++ ){
		TextCenter.add( TextMesh.geometry.vertices[ i ] );
	}
	
	TextMesh.name = "The User's string";

	TextCenter.multiplyScalar( 1 / TextMesh.geometry.vertices.length );
	TextMesh.position.sub(TextCenter);
	Scene.add(TextMesh);
}

document.addEventListener( 'mousemove', function(event)
{
	event.preventDefault();
	
	if(delta_t === 0) return; //so we get no errors before beginning
	
	if(InputObject.UserData[0].Gripping) //and only if you're not in VR
	{
		InputObject.UserOrbitRequest.x = event.clientX - InputObject.clientX;
		InputObject.UserOrbitRequest.y = event.clientY - InputObject.clientY;
	}
	
	InputObject.clientX = event.clientX;
	InputObject.clientY = event.clientY;
	
	var vector = new THREE.Vector3(
		  ( event.clientX / window.innerWidth ) * 2 - 1,
	    - ( event.clientY / window.innerHeight) * 2 + 1,
	    0.5 );
	vector.unproject( Camera );
	var dir = vector.sub( Camera.position ).normalize();
	var distance = - Camera.position.z / dir.z;
	var finalposition = Camera.position.clone();
	finalposition.add( dir.multiplyScalar( distance ) );
	
//	InputObject.UserData[0].HandPosition.copy(finalposition);
}, false );


document.addEventListener( 'mousedown', function(event) 
{
	event.preventDefault();
	
	InputObject.UserData[0].Gripping = 1;
}, false );

document.addEventListener( 'mouseup', function(event) 
{
	event.preventDefault();
	
	InputObject.UserData[0].Gripping = 0;
}, false );

//bug: will need to think about deleted models somehow. InputObject's arrays have an uncertain length which maybe needs updating?

socket.on('ModelsReSync', function(msg)
{
	if(msg.ModelPositions.length > InputObject.ModelPositions.length)
	{
		for(var i = InputObject.ModelPositions.length; i < msg.ModelPositions.length; i++)
		{
			InputObject.ModelPositions[i] = new THREE.Vector3();
			InputObject.ModelQuaternions[i] = new THREE.Quaternion();
		}
	}
	
	for(var i = 0; i < msg.ModelPositions.length; i++)
	{
		copyvec(InputObject.ModelPositions[i], msg.ModelPositions[i]);
		copyquat(InputObject.ModelQuaternions[i], msg.ModelQuaternions[i]);
	}
	
	InputObject.ModelsReSynched = 1;
});