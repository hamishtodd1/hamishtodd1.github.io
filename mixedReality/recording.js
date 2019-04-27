/*
	Should be a diff, you may be recording like an hour

	can make eyes follow after

	Time synchronization
		smack controllers together
		could make controller flash at instant that it changes direction dramatically

	Visual synchronization
		If you glue the vive tracker to a tablet you only have to do it once
*/

initPlaybackAndRecording = function()
{
	let discretes = [];
	let quaternions = [];
	let lerpedFloats = []

	let frames = []

	let lag = 0;
	let recording = false
	let recordingTime = 0
	bindButton("r", function()
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
	}, "toggle recording" )

	{
		var videoDomElement = document.createElement( 'video' )
		videoDomElement.loop = false
		videoDomElement.style = "display:none"
		videoDomElement.src = "data/video.mp4"
		videoDomElement.crossOrigin = 'anonymous';

		var videoTexture = new THREE.VideoTexture( videoDomElement );
		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.magFilter = THREE.LinearFilter;
		videoTexture.format = THREE.RGBFormat;

		var planeHeight = 1.8
		var plane = new THREE.Mesh(new THREE.PlaneGeometry(planeHeight/(16/9),planeHeight),new THREE.MeshBasicMaterial({map:videoTexture}))
		plane.visible = false
		camera.add(plane)
		plane.position.z -= 3
	}

	new THREE.FileLoader().load( "data/frames.txt",
		function( str )
		{
			frames = eval(str)
			// synchronizeStateToVideo()
		}
	);

	bindButton( 'space', function()
	{
		if( videoDomElement.paused )
		{
			videoDomElement.play()
		}
		else
		{
			videoDomElement.pause()
		}
	}, "toggle playing");

	bindButton( "y", function(){}, "reset",function()
	{
		videoDomElement.currentTime = 0 
		synchronizeStateToVideo()
	} )

	function recordFrame()
	{
		recordingTime += frameDelta;

		let frame = {};
		frame.frameTime = recordingTime;

		frame.discretes = Array( discretes.length );
		frame.quaternions = Array( quaternions.length );
		frame.lerpedFloats = Array( lerpedFloats.length );

		for(let i = 0, il = discretes.length; i < il; i++)
		{
			frame.discretes[i] = discretes[i].object[ discretes[i].property ];
		}
		for(let i = 0, il = quaternions.length; i < il; i++)
		{
			frame.quaternions[i] = quaternions[i].toArray();
		}
		for(let i = 0, il = lerpedFloats.length; i < il; i++)
		{
			frame.lerpedFloats[i] = lerpedFloats[i].object[ lerpedFloats[i].property ];
		}

		frames.push(frame);
	}

	markObjectProperty = function( object, property )
	{
		discretes.push({object, property});
	}
	markLerpedFloat = function( object, property )
	{
		lerpedFloats.push({object, property});
	}

	markQuaternion = function( object3d )
	{
		quaternions.push(object3d.quaternion)
	}
	markPosition = function( object3d )
	{
		markLerpedFloat(object3d.position, "x");
		markLerpedFloat(object3d.position, "y");
		markLerpedFloat(object3d.position, "z");
	}
	markPositionAndQuaternion = function( object3d )
	{
		console.warn("marking position and quaternion")
		markPosition(object3d)
		markQuaternion(object3d)
	}

	synchronizeStateToVideo = function()
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
		for(let i = 0, il = lerpedFloats.length; i < il; i++)
		{
			//if it's a matrix this is a bad idea
			log(frames[frameJustAfter].lerpedFloats)
			let diff = frames[frameJustAfter].lerpedFloats[i] - frames[frameJustBefore].lerpedFloats[i];
			lerpedFloats[i].object[ lerpedFloats[i].property ] = lerpValue * diff + frames[frameJustBefore].lerpedFloats[i];
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

	function bindAlignmentControls()
	{
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
	}
}