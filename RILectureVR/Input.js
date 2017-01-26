/*
 * You need a "viewport square", because people are used to their FOV being huge - that's the psychological thing that has been happenning. Put in VR journal?
 * If you connect with a browser and there's no VRMODE thing broadcasting, put a sign up
 */

//"get position data from other users" and "get our controller data" might be very different abstractions
var inputObject = { 
	//"private variables"
	holdableStates: {},
	
	userString: "",
	proteinRequested: 0,
	
	clientX: 0,
	clientY: 0,
	
	controllerStates: [ //or hey you could send them the matrix, numnuts
	    { position: new THREE.Vector3(), quaternion: new THREE.Quaternion() },
		{ position: new THREE.Vector3(), quaternion: new THREE.Quaternion() } ],

	cameraState: {position: new THREE.Vector3(), quaternion: new THREE.Quaternion()}
};

inputObject.updateFromAsynchronousInput = function(holdables, holdablesInScene, presentation, Controllers ) //the purpose of this is to update everything
{
	if(VRMODE) //including google cardboard TODO
	{
		/* OurVRControls is external. TODO replace it so you understand it. Later.
		 * Is camera position updated asynchronously? :X surely this rift asynchronous business means that?
		 */
		OurVRControls.update();
		
		Controllers[0].updateMatrix();
		Controllers[1].updateMatrix();
		var formerPositions = Array(Controllers[0].position.clone(), Controllers[1].position.clone());
		var formerQuaternions = Array(Controllers[0].quaternion.clone(), Controllers[1].quaternion.clone());
		
		//"Controllers" are updated synchronously and are the data you use
		var gamepads = navigator.getGamepads();
	    var riftGripButton = 2;
	    var riftChangePageButton = 1;
	    var requestButton = 3;
	    //pushing the thumbstick in is 0, the two buttons are 3 and 4
		for(var k = 0; k < 2 && k < gamepads.length; ++k)
		{
			var affectedControllerIndex = 666;
			if (gamepads[k] && gamepads[k].id === "Oculus Touch (Right)") //because some are undefined
				affectedControllerIndex = RIGHT_CONTROLLER_INDEX;
			if (gamepads[k] && gamepads[k].id === "Oculus Touch (Left)")
				affectedControllerIndex = LEFT_CONTROLLER_INDEX;
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
			
			if( affectedControllerIndex === RIGHT_CONTROLLER_INDEX )
			{
				if( gamepads[k].buttons[riftChangePageButton].value > 0.97 )
				{
					if( !presentation.alreadyMovedSlideForward )
					{
						presentation.changePage( 1 );
						socket.emit('pageChange', presentation.currentPageIndex );
						presentation.alreadyMovedSlideForward = 1;
					}
				}
				else presentation.alreadyMovedSlideForward = 0;
			}
			else{
				if( gamepads[k].buttons[riftChangePageButton].value > 0.97 )
				{
					if( !presentation.alreadyMovedSlideBackward )
					{
						presentation.changePage( -1 );
						socket.emit('pageChange', presentation.currentPageIndex );
						presentation.alreadyMovedSlideBackward = 1;
					}
				}
				else presentation.alreadyMovedSlideBackward = 0;
			}
		}
		//if there hasn't been controller data, the controllers will just hang around
		
		for(var i = 0; i < Controllers.length; i++)
		{
			if( !Controllers[i].Gripping )
			{
				if( Controllers[i].heldObject !== null )
				{
					Controllers[i].heldObject.controllerWeAreGrabbedBy = null;
					Controllers[i].heldObject = null;
				}
			}
			else if( Controllers[i].heldObject === null )
			{
				var potentialGrabs = [];
				var controllerRadius = Controllers[i].children[0].geometry.boundingSphere.radius;
				for( var j = 0; j < holdablesInScene.length; j++ )
				{
					var modelRadius = holdablesInScene[j].scale.x;
					var holdableGeometry;
					
					if(typeof holdablesInScene[j].geometry !== 'undefined')
						holdableGeometry = holdablesInScene[j].geometry;
					else if(typeof holdablesInScene[j].children[0] !== 'undefined')
					{
						if(typeof holdablesInScene[j].children[0].geometry !== 'undefined')
						{
							modelRadius *= holdablesInScene[j].children[0].scale.x;
							holdableGeometry = holdablesInScene[j].children[0].geometry;
						}
						else if( typeof holdablesInScene[j].children[0].children[0] !== 'undefined' )
							if(  typeof holdablesInScene[j].children[0].children[0].geometry !== 'undefined')
							{
								modelRadius *= holdablesInScene[j].children[0].children[0].scale.x;
								holdableGeometry = holdablesInScene[j].children[0].children[0].geometry;
							}
					} 
					else
					{
						console.log("holdable with no geometry?")
						continue;
					}
					
					if( holdableGeometry.boundingSphere === null)
						holdableGeometry.computeBoundingSphere();
					modelRadius *= holdableGeometry.boundingSphere.radius;
					
					if( Controllers[i].position.distanceTo( holdablesInScene[j].position ) < modelRadius + controllerRadius )
						potentialGrabs.push(j);
				}
				
				if( potentialGrabs.length)
				{
					var finalGrab = 0; //we start by assuming it's the first
					for(var j = 1; j < potentialGrabs.length; j++)
						if( Controllers[i].position.distanceTo( holdablesInScene[ potentialGrabs[j] ].position ) < Controllers[i].position.distanceTo( holdablesInScene[ potentialGrabs[finalGrab] ].position ) )
							finalGrab = j;
					Controllers[i].heldObject = holdablesInScene[ potentialGrabs[finalGrab] ];
					holdablesInScene[ potentialGrabs[finalGrab] ].controllerWeAreGrabbedBy = Controllers[i];
				}
			}

			if( Controllers[i].heldObject !== null )
			{
				var invFormer = formerQuaternions[i].clone();
				invFormer.inverse();
				
				if( Controllers[i].heldObject.movable )
				{
					Controllers[i].heldObject.position.sub(formerPositions[i]);
					Controllers[i].heldObject.position.applyQuaternion( invFormer );
					Controllers[i].heldObject.position.applyQuaternion( Controllers[i].quaternion );
					Controllers[i].heldObject.position.add( Controllers[i].position );
				}
				
				if( Controllers[i].heldObject.rotateable )
				{
					Controllers[i].heldObject.quaternion.premultiply( invFormer );
					Controllers[i].heldObject.quaternion.premultiply( Controllers[i].quaternion );
				}
			}
		}
		
		{
			//seems like five lines too much code, but we want to keep this part synchronous
			for( var i in holdables )
				copyPositionAndQuaternion( this.holdableStates[i], holdables[i] );
			for(var i = 0; i < 2; i++)
				copyPositionAndQuaternion( this.controllerStates[i], Controllers[i] );
			copyPositionAndQuaternion( this.cameraState, Camera );
			socket.emit('holdablesControllersCameraUpdate', this );
		}
	}
	else
	{
		//could have this be asynchronous as spectator is simple, 
		//but the spectator only updates every frame anyway
		
		for(var i in holdables )
			copyPositionAndQuaternion(holdables[i], this.holdableStates[i]);
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
			frustumCorner.multiplyScalar(0.005); //If you change the frustum culler or whatever then this changes :X
			var cornerIndex = i % 3 ? i : 3-i;
			screenCornerCoords[cornerIndex*3+0] = frustumCorner.x;
			screenCornerCoords[cornerIndex*3+1] = frustumCorner.y;
			screenCornerCoords[cornerIndex*3+2] = frustumCorner.z;
		}
		Camera.children[1].scale.setScalar(Math.abs( screenCornerCoords[0*3+1] - screenCornerCoords[3*3+1] ) );
		Camera.children[1].position.z = screenCornerCoords[2];
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
	Camera.children[0].geometry.vertices[4].set( //loop back
			spectatorScreenCornerCoords[0],
			spectatorScreenCornerCoords[1],
			spectatorScreenCornerCoords[2]
			);
	Camera.children[0].geometry.verticesNeedUpdate = true;
	
	Camera.children[1].scale.setScalar(Math.abs( spectatorScreenCornerCoords[0*3+1] - spectatorScreenCornerCoords[3*3+1] ) );
	Camera.children[1].position.z = spectatorScreenCornerCoords[2] - 0.00001;
});

socket.on('holdablesControllersCameraUpdate', function(lecturerInputObject)
{
	for(var i in inputObject.holdableStates )
		copyPositionAndQuaternion(inputObject.holdableStates[i], lecturerInputObject.holdableStates[i]);
	copyPositionAndQuaternion(inputObject.cameraState, lecturerInputObject.cameraState);
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
	if(event.keyCode === 190 && WEBVR.isAvailable() === true)
	{
		event.preventDefault();
		OurVREffect.setFullScreen( true );

		VRMODE = 1; //OR GOOGLE CARDBOARD TODO, nobody wants to spectate as cardboard
		
		//bug if we do this earlier(?)
		OurVREffect.scale = 0;
		
		return;
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