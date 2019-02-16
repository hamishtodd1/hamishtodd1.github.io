/*
	can make eyes follow after

	Time synchronization
		smack controllers together

	Visual synchronization
		If you glue the vive tracker to a tablet you only have to do it once
*/

initPlaybackAndRecording = function()
{
	let discretes = [];
	let quaternions = [];
	let floats = []

	let frames = []

	let recording = false

	markObjectProperty = function( object, property )
	{
		discretes.push({object, property});
	}
	markFloat = function( object, property )
	{
		floats.push({object, property});
	}
	markQuaternion = function( object3d )
	{
		quaternions.push(object3d.quaternion)
	}

	markPosition = function( object3d )
	{
		markFloat(object3d.position, "x");
		markFloat(object3d.position, "y");
		markFloat(object3d.position, "z");
	}
	markPositionAndQuaternion = function( object3d )
	{
		markPosition(object3d)
		markQuaternion(object3d)
	}

	function synchronizeStateToVideo()
	{
		let lastTimeReadFrom = videoDomElement.currentTime + lag;
		lastTimeReadFrom = clamp(lastTimeReadFrom,0)

		let frameJustBefore = null
		for( let i = 0, il = frames.length - 1; i < il; i++ )
		{
			if( frames[i+1].frameTime > lastTimeReadFrom )
			{
				frameJustBefore = i;
				break
			}
		}
		if(frameJustBefore === null)
		{
			frameJustBefore = frames.length - 2
		}
		let frameJustAfter = frameJustBefore + 1;

		let lerpValue = ( lastTimeReadFrom - frames[frameJustBefore].frameTime ) / (frames[frameJustAfter].frameTime - frames[frameJustBefore].frameTime);
		lerpValue = clamp(lerpValue, 0, 1);

		for(let i = 0, il = discretes.length; i < il; i++)
		{
			discretes[i].object[ discretes[i].property ] = frames[frameJustBefore].discretes[i];
		}
		for(let i = 0, il = floats.length; i < il; i++)
		{
			let diff = frames[frameJustAfter].discretes[i] - frames[frameJustBefore].discretes[i];
			discretes[i].object[ discretes[i].property ] = lerpValue * diff + frames[frameJustBefore].discretes[i];
		}
		for(let i = 0, il = frames[frameJustBefore].quaternions.length; i < il; i++)
		{
			quaternions[i].fromArray( frames[frameJustBefore].quaternions[i] );
			let nextFrameQuaternion = new THREE.Quaternion().fromArray( frames[frameJustAfter].quaternions[i] );
			quaternions[i].slerp( nextFrameQuaternion, lerpValue );
		}
	}

	synchronizeToVideoOrCallContingentUpdateFunctions = function()
	{
		if( recording === true )
		{
			recordFrame()
		}

		// synchronizeStateToVideo()
		for(let i = 0; i < updateFunctions.length; i++)
		{
			updateFunctions[i]();
		}
	}
}

function bindPlaybackControls()
{
	let recordingTime = 0
	function recordFrame()
	{
		recordingTime += frameDelta;

		let frame = {};
		frame.frameTime = recordingTime;

		frame.discretes = Array( discretes.length );
		frame.quaternions = Array( quaternions.length );
		frame.floats = Array( floats.length );

		for(let i = 0, il = discretes.length; i < il; i++)
		{
			frame.discretes[i] = discretes[i].object[ discretes[i].property ];
		}
		for(let i = 0, il = quaternions.length; i < il; i++)
		{
			frame.quaternions[i] = quaternions[i].toArray();
		}
		for(let i = 0, il = floats.length; i < il; i++)
		{
			frame.floats[i] = floats[i].object[ floats[i].property ];
		}

		frames.push(frame);
	}

	let videoDomElement = document.createElement( 'video' )
	videoDomElement.loop = false
	videoDomElement.style = "display:none"
	videoDomElement.src = "data/video.mp4"
	videoDomElement.crossOrigin = 'anonymous';

	let videoTexture = new THREE.VideoTexture( videoDomElement );
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;
	videoTexture.format = THREE.RGBFormat;

	let planeHeight = 1.8
	let plane = new THREE.Mesh(new THREE.PlaneGeometry(planeHeight/(16/9),planeHeight),new THREE.MeshBasicMaterial({map:videoTexture}))
	plane.visible = false
	camera.add(plane)
	plane.position.z -= 3

	new THREE.FileLoader().load( "data/frames.txt",
		function( str )
		{
			frames = eval(str)
			synchronizeStateToVideo()
		}
	);

	let recording = false
	toggleRecording = function()
	{
		if( !recording )
		{
			handControllers[LEFT_CONTROLLER_INDEX].children[0].material.color.r = 1;
			recording = true
			frames = []
		}
		else
		{
			handControllers[LEFT_CONTROLLER_INDEX].children[0].material.color.r = 0.267
			recording = false

			presentJsonFile(frames, "frames")
		}
	}
	document.addEventListener( 'keydown', function(event)
	{
		if(event.keyCode === 32 ) //spacebar
		{
			if( videoDomElement.paused )
			{
				videoDomElement.play()
			}
			else
			{
				videoDomElement.pause()
			}
		}
	});

	bindButton( "z", function(){}, "camera left",function()
	{
		camera.position.x -= 0.01
	} )
	bindButton( "x", function(){}, "camera right",function()
	{
		camera.position.x += 0.01
	} )
	
	bindButton( "w", function(){}, "camera forward",function()
	{
		camera.position.z -= 0.01
	} )
	bindButton( "s", function(){}, "camera back",function()
	{
		camera.position.z += 0.01
	} )
	bindButton( "a", function(){}, "camera down",function()
	{ 
		camera.position.y -= 0.01
	} )
	bindButton( "q", function(){}, "camera up",function()
	{
		camera.position.y += 0.01
	} )

	bindButton( "e", function(){}, "increase lag",function()
	{
		lag += 0.01
		console.log("lag: ", lag)
	} )
	bindButton( "d", function(){}, "decrease lag",function()
	{
		lag -= 0.01
		console.log("lag: ", lag)
	} )

	bindButton( "r", function(){}, "pitch forward",function()
	{
		camera.rotation.x += 0.01
		console.log("pitch: ", camera.rotation.x)
	} )
	bindButton( "f", function(){}, "pitch back",function()
	{
		camera.rotation.x -= 0.01
		console.log("pitch: ", camera.rotation.x)
	} )

	bindButton( "y", function(){}, "reset",function()
	{
		videoDomElement.currentTime = 0 
		synchronizeStateToVideo()
	} )
}