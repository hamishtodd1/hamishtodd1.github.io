/*
	Should be a diff, you may be recording like an hour

	can make eyes follow after

	Time synchronization
		smack controllers together
		could make controller flash at instant that it changes direction dramatically

	Visual synchronization
		If you glue the vive tracker to a tablet you only have to do it once

	Really ought to list names and put them in output file
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
	bindButton( "z", function()
	{
		if( !recording )
		{
			cameraHolder.material.color.r = 1;
			recording = true
			frames = []
		}
		else
		{
			cameraHolder.material.color.r = 0.267
			recording = false

			presentJsonFile(JSON.stringify(frames), "frames")
		}
	}, "toggle recording" )

	{
		var videoDomElement = document.createElement( 'video' )
		videoDomElement.style = "display:none"
		videoDomElement.crossOrigin = 'anonymous';
		videoDomElement.src = "data/video.mp4"
		videoDomElement.loop = true
		// videoDomElement.volume = 0

		var videoTexture = new THREE.VideoTexture( videoDomElement );
		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.magFilter = THREE.LinearFilter;
		videoTexture.format = THREE.RGBFormat;

		var planeHeight = 1.8
		var plane = new THREE.Mesh(new THREE.PlaneGeometry(planeHeight*(16/9),planeHeight),new THREE.MeshBasicMaterial(
			{
				map:videoTexture,
				overdraw: true
			}))
		plane.visible = false
		camera.add(plane)
		plane.position.z -= 3
	}

	loadRecording = function(version)
	{
		new THREE.FileLoader().load( "data/take"+version+".txt",
			function( str )
			{
				frames = eval(str)
				// synchronizeStateToVideo()
			}
		);

		// videoDomElement.src = bbb.ogv
	}
	loadRecording(1)

	maybeRecordFrame = function()
	{
		if( !recording )
		{
			return
		}

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

		let oneWeAreInterestedIn = null
		if( oneWeAreInterestedIn !== null && quaternions.length === oneWeAreInterestedIn + 1)
		{
			let fakeError = new Error()
			if(fakeError.stack)
			{
				var name = (fakeError.stack.split("at init"))[1].split(" (")[0]
				log(name)
			}
			else
			{
				console.error("firefox is bad at naming things")
			}
		}
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

	synchronizeToVideoOrCallContingentUpdateFunctions = function()
	{
		if( plane.visible )
		{
			synchronizeStateToVideo()
		}
		else
		{
			for(let i = 0; i < updateFunctions.length; i++)
			{
				updateFunctions[i]();
			}			
		}
	}

	{
		let cameraHolder = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1))
		scene.add(cameraHolder)
		updateFunctions.push(function()
		{
			//I mean maybe, or maybe you put it in one place
			cameraHolder.position.copy(handControllers[LEFT_CONTROLLER_INDEX].position)
			cameraHolder.quaternion.copy(handControllers[LEFT_CONTROLLER_INDEX].quaternion)
		})
		markPositionAndQuaternion(cameraHolder)
		let helmet = initHelmet()

		function togglePlaying()
		{
			if(plane.visible === false) //first time
			{
				if( frames[0].discretes.length !== discretes.length || 
					frames[0].quaternions.length !== quaternions.length || 
					frames[0].lerpedFloats.length !== lerpedFloats.length )
				{
					console.error("need to rerecord")
					return
				}
				if(renderer.vr.enabled)
				{
					console.error( "vr enabled, camera will not cooperate (even if you disable vr)" )
					return
				}
				let foundPdfViewer = false
				for(i in window.navigator.plugins)
				{
					if(window.navigator.plugins[i].name === "Chrome PDF Viewer")
					{
						foundPdfViewer = true
						break;
					}
				}
				if(!foundPdfViewer)
				{
					console.error(".mp4 doesn't work in chromium, use chrome")
					return
				}

				//if you wanna go back to recording or be in VR, refresh
				cameraHolder.add(camera)
				camera.position.set(0,0,0)
				camera.rotation.set(0,0,0)

				helmet.visible = true
				plane.visible = true

				if(videoDomElement.currentTime === 0)
				{
					bindButton( "e", function(){}, "increase lag",function()
					{
						lag += 0.01
						console.log("lag: ", lag)
					} )
					bindButton( "q", function(){}, "decrease lag",function()
					{
						lag -= 0.01
						console.log("lag: ", lag)
					} )

					bindButton( "r", function(){}, "pitch forward",function()
					{
						camera.rotation.x += 0.01
						console.log( "camera rotation: " + camera.rotation.toArray().slice(0,3).toString() )
					} )
					bindButton( "f", function(){}, "pitch back",function()
					{
						camera.rotation.x -= 0.01
						console.log( "camera rotation: " + camera.rotation.toArray().slice(0,3).toString() )
					} )
				}
			}

			if( !videoDomElement.paused )
			{
				videoDomElement.pause()
				log("pause")
			}
			else
			{
				videoDomElement.play();
				log("playing")
			}
		}
		bindButton( 'space', togglePlaying, "toggle playing");

		{
			bindButton( "a", function(){}, "camera left",function()
			{
				camera.position.x -= 0.01
				console.log("camera position: ", camera.position.toArray().toString() )
			} )
			bindButton( "d", function(){}, "camera right",function()
			{
				camera.position.x += 0.01
				console.log("camera position: ", camera.position.toArray().toString() )
			} )
			bindButton( "w", function(){}, "camera forward",function()
			{
				camera.position.z -= 0.01
				console.log("camera position: ", camera.position.toArray().toString() )
			} )
			bindButton( "s", function(){}, "camera back",function()
			{
				camera.position.z += 0.01
				console.log("camera position: ", camera.position.toArray().toString() )
			} )
			bindButton( "g", function(){}, "camera down",function()
			{
				camera.position.y -= 0.01
				console.log("camera position: ", camera.position.toArray().toString() )
			} )
			bindButton( "t", function(){}, "camera up",function()
			{
				camera.position.y += 0.01
				console.log("camera position: ", camera.position.toArray().toString() )
			} )
		}
	}
}