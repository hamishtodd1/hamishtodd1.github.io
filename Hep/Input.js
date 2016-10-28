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
	
	Camera.position.set(0,0,0); //simulating cardboard
}

function ReadInput(Users, ControllerModel,Models)
{
	//eventually this will do everything that the mouse event listeners and the first "User.getinput" currently does
	if(VRMODE)
		UpdateVRCameraPosition();
	
	handle_Connects_and_Disconnects(Users,ControllerModel,Models);
	
	//orbit stuff. GearVR stuff will be very comparable. WARNING, uncomment this and you have problems with camera being picked up!
	if(!VRMODE)
	{
		var FocussedModelPosition = new THREE.Vector3();
		
		var CameraRelativeToModelZero = Camera.position.clone();
		CameraRelativeToModelZero.sub(FocussedModelPosition); //Models[0].position
		
		var CameraLongtitude = Math.atan2(CameraRelativeToModelZero.z, CameraRelativeToModelZero.x);
		CameraLongtitude += InputObject.UserOrbitRequest.x * 0.01;
		
		var CameraLatitude = Math.atan2(CameraRelativeToModelZero.y, Math.sqrt(
				CameraRelativeToModelZero.z * CameraRelativeToModelZero.z + 
				CameraRelativeToModelZero.x * CameraRelativeToModelZero.x ));
		CameraLatitude += InputObject.UserOrbitRequest.y * 0.0077;
		
		var polerepulsion = 0.01;
		if(Math.abs(CameraLatitude) + polerepulsion > TAU / 4 )
		{
			if( CameraLatitude > 0 )
				CameraLatitude = TAU / 4 - polerepulsion;
			else
				CameraLatitude =-TAU / 4 + polerepulsion;
		}
		
		Camera.position.set(
			CameraRelativeToModelZero.length() * Math.cos(CameraLatitude) * Math.cos(CameraLongtitude),
			CameraRelativeToModelZero.length() * Math.sin(CameraLatitude),
			CameraRelativeToModelZero.length() * Math.cos(CameraLatitude) * Math.sin(CameraLongtitude) );
		Camera.position.add(FocussedModelPosition);
		Camera.lookAt(FocussedModelPosition);
		
		InputObject.UserOrbitRequest.set(0,0,0);
				//don't let them get up to the pole
	}
	
	for(var i = 0; i < Users.length; i++)
		Users[i].GetInput();
	
	for(var i = 1; i < Users.length; i++)
	{
		if(Users[i].CameraObject.position.distanceTo(Camera.position) < 0.07)
			Users[i].CameraObject.visible = false;
		else
			Users[i].CameraObject.visible = true;
	}
	
	if(InputObject.ModelsReSynched && Models.length === InputObject.ModelPositions.length ) //will be destroyed by the possibility of deleting models
	{
		for(var i = 0; i < Models.length; i++)
		{
			Models[i].position.copy(InputObject.ModelPositions[i]);
			Models[i].quaternion.copy(InputObject.ModelQuaternions[i]);
		}
		
		InputObject.ModelsReSynched = 0;
	}
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
	
}, false );


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
