/*
 * You need a "viewport square", because people are used to their FOV being huge - that's the psychological thing that has been happenning. Put in VR journal?
 * If you connect with a browser and there's no VRMODE thing broadcasting, put a sign up
 */

//"get position data from other users" and "get our controller data" might be very different abstractions
var inputObject = { 
	//"private variables"
	modelStates: Array(),
	
	userString: "",
	proteinRequested: 0,
	
	clientX: 0,
	clientY: 0,
	
	controllerStates: [
	    { position: new THREE.Vector3(), quaternion: new THREE.Quaternion() },
		{ position: new THREE.Vector3(), quaternion: new THREE.Quaternion() } ],

	cameraState: {position: new THREE.Vector3(), quaternion: new THREE.Quaternion()}
};

inputObject.updateFromAsynchronousInput = function(Models,Controllers) //the purpose of this is to update everything
{	
	if( this.proteinRequested === 1 || this.theydownloaded !== "" )
	{
		var NewProteinString;
		//pretty damn unlikely that two users downloaded something on the same frame
		//note that this means that a person in VR can use the computer of a spectator to get themselves a protein, if they're on google cardboard
		if( this.proteinRequested === 1 )
		{
			NewProteinString = this.userString;
			socket.emit('wedownloaded', this.userString );
			ChangeuserString("");
			this.proteinRequested = 0;
		}
		else
		{
			NewProteinString = this.theydownloaded;
			this.theydownloaded = "";
		}
		
		for( var i = 0; i < FamousProteins.length / 2; i++ )
		{
			if( NewProteinString === FamousProteins[i*2] )
				putModelInScene( "http://files.rcsb.org/download/" + FamousProteins[i*2+1] + ".pdb", Models);
			
			if( i === FamousProteins.length - 1 ) //what if it's not a protein?
				putModelInScene( "http://files.rcsb.org/download/" + NewProteinString + ".pdb", Models);
		}
	}
	
	if(VRMODE) //including google cardboard TODO
	{
		/* OurVRControls is external. TODO replace it so you understand it. Later.
		 * Is camera position updated asynchronously? :X surely this rift asynchronous business means that?
		 */
		OurVRControls.update();
		
		//"Controllers" are updated synchronously and are the data you use
		var gamepads = navigator.getGamepads();
	    var riftGripButton = 2;
	    var riftNextButton = 1;
	    //pushing the thumbstick in is 0, the two buttons are 3 and 4
		for(var k = 0; k < 2 && k < gamepads.length; ++k)
		{
			var affectedControllerIndex = 666;
			if (gamepads[k] && gamepads[k].id === "Oculus Touch (Right)") //because some are undefined
				affectedControllerIndex = RIGHT_CONTROLLER_INDEX;
			if (gamepads[k] && gamepads[k].id === "Oculus Touch (Left)")
				affectedControllerIndex = 1-RIGHT_CONTROLLER_INDEX;
			if(affectedControllerIndex === 666)
				continue;
			
			Controllers[affectedControllerIndex].position.x = gamepads[k].pose.position[0];
			Controllers[affectedControllerIndex].position.y = gamepads[k].pose.position[1];
			Controllers[affectedControllerIndex].position.z = gamepads[k].pose.position[2];
			Controllers[affectedControllerIndex].quaternion.x = gamepads[k].pose.orientation[0];
			Controllers[affectedControllerIndex].quaternion.y = gamepads[k].pose.orientation[1];
			Controllers[affectedControllerIndex].quaternion.z = gamepads[k].pose.orientation[2];
			Controllers[affectedControllerIndex].quaternion.w = gamepads[k].pose.orientation[3];
			
			if( gamepads[k].buttons[riftGripButton].pressed)
				Controllers[affectedControllerIndex].Gripping = 1;
			else
				Controllers[affectedControllerIndex].Gripping = 0;
		}
		//if there hasn't been controller data, the controllers will just hang around
		
		for(var i = 0; i < Models.length; i++)
			copyPositionAndQuaternion(this.modelStates[i], Models[i]);
		for(var i = 0; i < 2; i++)
			copyPositionAndQuaternion(this.controllerStates[i], Controllers[i]);
		copyPositionAndQuaternion(this.cameraState, Camera);
		
		socket.emit('ModelsControllersCameraUpdate', this );
	}
	else
	{
		//could have this be asynchronous as spectator is simple, 
		//but the spectator only updates every frame anyway
		for(var i = 0; i < Models.length; i++)
			copyPositionAndQuaternion(Models[i], this.modelStates[i]);
		copyPositionAndQuaternion(Camera, this.cameraState);
		for(var i = 0; i < 2; i++)
			copyPositionAndQuaternion(Controllers[i], this.controllerStates[i]);
		
		var cameraFrustum = new THREE.Frustum().setFromMatrix(Camera.projectionMatrix);
		var screenCornerCoords = new Float32Array(12);
		for(var i = 0; i < 4; i++)
		{
			var intersectionPartner = i < 2 ? i + 2 : 3 - i;
			var frustumCorner = cameraFrustum.planes[i].normal.clone();
			frustumCorner.cross( cameraFrustum.planes[ intersectionPartner ].normal );
			screenCornerCoords[i*3+0] = frustumCorner.x;
			screenCornerCoords[i*3+1] = frustumCorner.y;
			screenCornerCoords[i*3+2] = frustumCorner.z;
		}
		//Try tilting, try resizing window
		//then you probably just need to add the camera position :o
		socket.emit( 'screenIndicator', screenCornerCoords );
	}
}

socket.on('screenIndicator', function(spectatorScreenCornerCoords)
{
	for(var i = 0; i < 4; i++)
	{
		Camera.children[0].geometry.vertices[i].set(
			spectatorScreenCornerCoords[i*3+0],
			spectatorScreenCornerCoords[i*3+1],
			spectatorScreenCornerCoords[i*3+2]
			);
	}
	Camera.children[0].geometry.verticesNeedUpdate = true;
});

socket.on('ModelsControllersCameraUpdate', function(lecturerInputObject)
{
	if(lecturerInputObject.modelStates.length > inputObject.modelStates.length)
	{
		//TODO plus way more, who knows what's in there
		//there again if someone is spectating it should all be ready really
		for(var i = inputObject.modelStates.length; i < lecturerInputObject.modelStates.length; i++)
		{
			inputObject.modelStates[i] = {
				position: new THREE.Vector3(), 
				quaternion: new THREE.Quaternion()
			};
		}
	}
	
	for(var i = 0; i < inputObject.modelStates.length; i++)
		copyPositionAndQuaternion(inputObject.modelStates[i], lecturerInputObject.modelStates[i]);
	copyPositionAndQuaternion(inputObject.cameraState, lecturerInputObject.cameraState);
	if(!logged)
	{
		console.log(inputObject.cameraState, lecturerInputObject.cameraState)
		logged = 1;
	}
	for(var i = 0; i < 2; i++)
		copyPositionAndQuaternion(inputObject.controllerStates[i], lecturerInputObject.controllerStates[i]);
});

function copyPositionAndQuaternion(copyToObject, copyFromObject)
{
	copyvec(	copyToObject.position,	copyFromObject.position);
	copyquat(	copyToObject.quaternion,copyFromObject.quaternion);
}

//keyboard crap. Have to use "preventdefault" within ifs, otherwise certain things you'd like to do are prevented
document.addEventListener( 'keydown', function(event)
{
	//arrow keys
	if( 37 <= event.keyCode && event.keyCode <= 40)
	{
//		if(event.keyCode === 38)
//			Scene.scale.multiplyScalar(0.5);
//		if(event.keyCode === 40)
//			Scene.scale.multiplyScalar(2);
		
		//tank controls
//		var movingspeed = 0.8;
//		var turningspeed = 0.05;
//		
//		var forwardvector = Camera.getWorldDirection();
//		forwardvector.setLength(movingspeed);
//		
//		if(event.keyCode === 37)
//			Camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Central_Y_axis, turningspeed));
//		if(event.keyCode === 38)
//			Camera.position.add(forwardvector);
//		if(event.keyCode === 39)
//			Camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Central_Y_axis,-turningspeed));
//		if(event.keyCode === 40)
//			Camera.position.sub(forwardvector);
//		return;
	}
	
	if(event.keyCode === 190 && WEBVR.isAvailable() === true)
	{
		event.preventDefault();
		OurVREffect.setFullScreen( true );

		VRMODE = 1; //OR GOOGLE CARDBOARD TODO, nobody wants to spectate as cardboard
		
		//bug if we do this earlier(?)
		OurVREffect.scale = 0; //you'd think this would put your eyes in the same place but it doesn't
		
		return;
	}
	
	if(event.keyCode === 13) //enter
	{
		event.preventDefault();
		
		
		indicatorsound.source.stop();
		indicatorsound.playbackRate *= 2;
		indicatorsound.play();
		
//		inputObject.proteinRequested = 1;
		return;
	}
	if(event.keyCode === 8) //backspace
	{
		event.preventDefault();
		inputObject.ChangeuserString( inputObject.userString.slice(0, inputObject.userString.length - 1) );
		return;
	}
	
	//symbols
	{
		var arrayposition;
		if( 48 <= event.keyCode && event.keyCode <= 57 )
			arrayposition = event.keyCode - 48;
		if( 65 <= event.keyCode && event.keyCode <= 90 )
			arrayposition = event.keyCode - 55;
		
		if(typeof arrayposition != 'undefined')
		{
//			event.preventDefault(); //want to be able to ctrl+shift+j
			inputObject.ChangeuserString(inputObject.userString + keycodeArray[arrayposition]); //this might get called before the above is compiled, ignore warning
			return;
		}
	}	
}, false );


inputObject.updatemouseposition = function(event)
{
	event.preventDefault();
	
	if(delta_t === 0) return; //so we get no errors before beginning
	
	this.clientX = event.clientX;
	this.clientY = event.clientY;
	
	var vector = new THREE.Vector3(
		  ( event.clientX / window.innerWidth ) * 2 - 1,
	    - ( event.clientY / window.innerHeight) * 2 + 1,
	    0.5 );
	vector.unproject( Camera );
	var dir = vector.sub( Camera.position ).normalize();
	var distance = - Camera.position.z / dir.z;
	var mousePositionInSpace = Camera.position.clone();
	mousePositionInSpace.add( dir.multiplyScalar( distance ) );
	
	//...and you COULD do something with this thing, which is the mouse position in some plane, but not now
}
document.addEventListener( 'mousemove', inputObject.updatemouseposition, false );

socket.on('theydownloaded', function(msg)
{
	this.theydownloaded = msg;
});

//TODO wanna remove spaces and reduce to lower case before checking this
var FamousProteins = Array(
		"rubisco", "1rcx",
		"keratin", "3TNU",
		"actin", "1RFQ",
		"myosin", "1W7J",
		"collagen", "1BKV",
		"integrin", "1rcx",
		"insulin", "4ins",
		"histone", "1AOI",
		"ferritin", "1FHA");

inputObject.ChangeuserString = function(newstring)
{
	this.userString = newstring;
	
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
	
	TextMesh.scale.set(0.02,0.02,0.02)
	
	var TextCenter = new THREE.Vector3();
	for ( var i = 0, l = TextMesh.geometry.vertices.length; i < l; i ++ ){
		TextCenter.add( TextMesh.geometry.vertices[ i ] );
	}
	
	TextMesh.name = "The User's string";

	TextCenter.multiplyScalar( 1 / TextMesh.geometry.vertices.length );
	TextCenter.multiplyScalar( TextMesh.scale.x );
	TextMesh.position.sub(TextCenter);
	Scene.add(TextMesh);
}