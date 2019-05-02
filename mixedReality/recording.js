/*
	Should be a diff, you may be recording like an hour

	can make eyes follow after

	Time synchronization
		smack controllers together
		could make controller flash at instant that it changes direction dramatically

	Visual synchronization
		If you glue the vive tracker to a tablet you only have to do it once
*/

initPlaybackAndRecording = function(renderer)
{
	let discretes = [];
	let quaternions = [];
	let lerpedFloats = []

	let frames = []

	let lag = 0;
	let recording = false
	let recordingTime = 0
	bindButton( "t", function()
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

			presentJsonFile(JSON.stringify(frames), "frames")
		}
	}, "toggle recording" )

	{
		var videoDomElement = document.createElement( 'video' )
		videoDomElement.crossOrigin = 'anonymous';
		videoDomElement.loop = false
		videoDomElement.style = "display:none"
		videoDomElement.src = "data/sintel.ogv"

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

	let version = 0
	new THREE.FileLoader().load( "data/frames ("+version+").txt",
		function( str )
		{
			frames = eval(str)
			// synchronizeStateToVideo()
		}
	);

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
			let currentValue = discretes[i].object[ discretes[i].property ]

			// if( frames.length > 0 )
			// {
			// 	let j = frames.length-1;
			// 	while( true )
			// 	{
			// 		if( frames[j].discretes[i] === null )
			// 		{
			// 			j--
			// 		}
			// 		else if( frames[j].discretes[i] === currentValue )
			// 		{
			// 			frame.discretes[i] = null
			// 			break; //nothing to put in
			// 		}
			// 		else
			// 		{
			// 			frame.discretes[i] = currentValue
			// 			break;
			// 		}
			// 	}
			// }

			frame.discretes[i] = currentValue
		}
		for(let i = 0, il = quaternions.length; i < il; i++)
		{
			frame.quaternions[i] = quaternions[i].toArray()
		}
		for(let i = 0, il = lerpedFloats.length; i < il; i++)
		{
			let currentValue = lerpedFloats[i].object[ lerpedFloats[i].property ]

			frame.lerpedFloats[i] = currentValue
		}

		frames.push(frame);
	}

	markObjectProperty = function( object, property )
	{
		for(let i = 0; i < discretes.length; i++)
		{
			if(discretes[i].object === object && discretes[i].property === property )
			{
				console.warn("already marked")
				return
			}
		}

		discretes.push({object, property});
	}
	markLerpedFloat = function( object, property )
	{
		for(let i = 0; i < discretes.length; i++)
		{
			if(discretes[i].object === object && discretes[i].property === property )
			{
				console.warn("already marked")
				return
			}
		}

		lerpedFloats.push({object, property});
	}

	markQuaternion = function( object3d )
	{
		if( quaternions.indexOf(object3d.quaternion) !== -1 )
		{
			console.warn("already marked")
			return
		}

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
	markMatrix = function(m)
	{
		for( let i = 0; i < m.elements.length; i++)
		{
			markObjectProperty( m.elements, i.toString() )
		}
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
		if(frameJustBefore === null) //too far before or too far after
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

	maybeRecordFrame = function()
	{
		if( recording === true )
		{
			recordFrame()
		}
	}

	synchronizeToVideoOrCallContingentUpdateFunctions = function()
	{
		if( videoDomElement.paused )
		{
			for(let i = 0; i < updateFunctions.length; i++)
			{
				updateFunctions[i]();
			}
		}
		else
		{
			synchronizeStateToVideo()
		}
	}

	{
		let cameraHolder = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1))
		scene.add(cameraHolder)
		updateFunctions.push(function()
		{
			cameraHolder.position.copy(handControllers[LEFT_CONTROLLER_INDEX].position)
			cameraHolder.quaternion.copy(handControllers[LEFT_CONTROLLER_INDEX].quaternion)
		})
		markPositionAndQuaternion(cameraHolder)
		let helmet = initHelmet()
		
		var cameraExtraPosition = new THREE.Vector3(0,0,0)
		var cameraExtraRotation = new THREE.Euler(0,0,0)
		bindButton( 'space', function()
		{
			if( !videoDomElement.paused )
			{
				videoDomElement.pause()
				log("pause")
			}
			else
			{
				if( frames[0].discretes.length !== discretes.length || 
					frames[0].quaternions.length !== quaternions.length || 
					frames[0].lerpedFloats.length !== lerpedFloats.length )
				{
					console.error("need to rerecord")
				}

				log("playing")
				renderer.vr.enabled = false
				videoDomElement.play()

				//if you wanna go back to recording or be in VR, refresh
				cameraHolder.add(camera)
				camera.position.copy(cameraExtraPosition)
				camera.rotation.copy(cameraExtraRotation)

				helmet.visible = true

				{
					bindButton( "z", function(){}, "camera left",function()
					{
						cameraExtraPosition.x -= 0.01
					} )
					bindButton( "x", function(){}, "camera right",function()
					{
						cameraExtraPosition.x += 0.01
					} )
					
					bindButton( "w", function(){}, "camera forward",function()
					{
						cameraExtraPosition.z -= 0.01
					} )
					bindButton( "s", function(){}, "camera back",function()
					{
						cameraExtraPosition.z += 0.01
					} )
					bindButton( "a", function(){}, "camera down",function()
					{ 
						cameraExtraPosition.y -= 0.01
					} )
					bindButton( "q", function(){}, "camera up",function()
					{
						cameraExtraPosition.y += 0.01
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
						cameraExtraRotation.x += 0.01
						console.log("pitch: ", camera.rotation.x)
					} )
					bindButton( "f", function(){}, "pitch back",function()
					{
						cameraExtraRotation.x -= 0.01
						console.log("pitch: ", camera.rotation.x)
					} )
				}
			}
		}, "toggle playing");
	}
}