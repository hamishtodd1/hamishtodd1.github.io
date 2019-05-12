/*
	It's complicated to think about but you probably do need parenthood to be marked

	Time synchronization
		smack controllers together
		could make controller flash at instant that it changes direction dramatically

	Vive tracker?

	Really ought to list names and put them in output file

	better off marking the controller/inputs?
		Jon Blow says "pain in the ass"
		Smaller filesize for recording
		Might somehow have to backtrack through frames to recover total state

	Current workflow, one take:
	1. physically set up camera
	2. set up VR browser
	3. in VR, put guides in place
	4. start recording on both
	5. do stuff
	6. stop recording on both
	7. import video onto computer
	8. Put guides in place on video
	9. Adjust lag
	9a. "Post" eg eyes?
	10. Record whole thing using XSplit
	11. Edit with kdenlive? Patreon symbol at least

	The speed of light:
		there's an app on your phone/tablet which has the virtual objects etc. 
		Also connects to an audio recorder which automatically combines that with video. 
		Can figure out where it is in virtual world in relation to your hands and head (the only truly shared objects). 
		Would need to have the actual position and orientation of the frikkin controllers. 
		Even Vive tracker wouldn't be great. 
		Skip from 2 to 11.
*/

initPlaybackAndRecording = function()
{
	let playbackMode = false

	{
		var cameraHolder = new THREE.Group()
		scene.add(cameraHolder)

		{
			var videoDomElement = document.createElement( 'video' )
			videoDomElement.style = "display:none"
			videoDomElement.crossOrigin = 'anonymous';
			videoDomElement.src = "recordings/sintel.mp4"
			// videoDomElement.volume = 0

			var videoTexture = new THREE.VideoTexture( videoDomElement );
			videoTexture.minFilter = THREE.LinearFilter;
			videoTexture.magFilter = THREE.LinearFilter;
			videoTexture.format = THREE.RGBFormat;
			videoTexture.needsUpdate = true
			// videoTexture.rotation = TAU/2
			// videoTexture.center.set(0.5,0.5)
		}

		{
			//can get y first

			//oh come on, just line up a controller
		}

		var screen = new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({
			map:videoTexture,
			overdraw: true,
			transparent:true,
			opacity:0.2
		}))
		screen.position.z = -1
		screen.scale.y = 2 * Math.tan( camera.fov * THREE.Math.DEG2RAD / 2 ) * Math.abs( screen.position.z )
		screen.scale.x = 16/9 * screen.scale.y
		cameraHolder.add(screen)

		screen.updateMatrix()
		var frustumIndicator = new THREE.LineSegments(new THREE.Geometry())
		frustumIndicator.geometry.vertices.push(
			new THREE.Vector3(),screen.geometry.vertices[0].clone().applyMatrix4(screen.matrix),
			new THREE.Vector3(),screen.geometry.vertices[1].clone().applyMatrix4(screen.matrix),
			new THREE.Vector3(),screen.geometry.vertices[2].clone().applyMatrix4(screen.matrix),
			new THREE.Vector3(),screen.geometry.vertices[3].clone().applyMatrix4(screen.matrix)
			)
		cameraHolder.add(frustumIndicator)
		
		clickables.push(screen)
		let indexBeingLaid = 0
		bindButton("[",function()
		{
			indexBeingLaid = 1-indexBeingLaid
		}, "switch guide point being laid on videoScreen")
		screen.onClick = function(intersection)
		{
			let newLocation = intersection.point
			cameraHolder.worldToLocal(newLocation)
			screenGuidePoints[indexBeingLaid].copy(newLocation)
			log("screen guide point " + indexBeingLaid + " at ", newLocation.toArray().toString())

			repositionScreen()
		}

		let realSpaceGuidePoints = Array(2)
		for(let i = 0; i < 2; i++)
		{
			let mesh = makeTextSign(i?"R":"L",true,false,false)
			mesh.scale.multiplyScalar(0.06)
			scene.add(mesh)

			realSpaceGuidePoints[i] = mesh.position
			realSpaceGuidePoints[i].x = 2 * (i?1:-1) * Math.random()
			realSpaceGuidePoints[i].z = -0.5
		}
		realSpaceGuidePoints[0].set(-0.21576,1.30663,2.3199)
		realSpaceGuidePoints[1].set(-1.24467,1.30663,1.2123)

		let screenGuidePoints = Array(2)
		for(let i = 0; i < 2; i++)
		{
			let mesh = makeTextSign(i?"R":"L",true,false,false)
			mesh.scale.multiplyScalar(0.06)
			cameraHolder.add(mesh)
			screenGuidePoints[i] = mesh.position

			screenGuidePoints[i].z = screen.position.z
			screenGuidePoints[i].x = 0.4 * screen.scale.x * (i?1:-1)
			screenGuidePoints[i].y = -0.25 * screen.scale.y
		}
		screenGuidePoints[0].set(-0.9300020912214844,-0.07516934195963221,-1)
		screenGuidePoints[1].set(0.24473739242654347,-0.0629324723382858,-1)

		let lines = Array(2)
		for(let i = 0; i < 2; i++)
		{
			lines[i] = new THREE.Line(new THREE.Geometry())
			lines[i].geometry.vertices.push( new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() )
			cameraHolder.add(lines[i])
		}

		updateFunctions.push(function()
		{
			if( handControllers[LEFT_CONTROLLER_INDEX].button1 )
			{
				realSpaceGuidePoints[0].copy( handControllers[LEFT_CONTROLLER_INDEX].position )
			}
			else if( handControllers[LEFT_CONTROLLER_INDEX].button2 )
			{
				realSpaceGuidePoints[1].copy( handControllers[LEFT_CONTROLLER_INDEX].position )
			}
			else if( handControllers[LEFT_CONTROLLER_INDEX].button1Old )
			{
				realSpaceGuidePoints[1].y = realSpaceGuidePoints[0].y
				log("real space guide point " + 1 + " at ", screenGuidePoints[1].toArray().toString())
			}
			else if( handControllers[LEFT_CONTROLLER_INDEX].button2Old )
			{
				realSpaceGuidePoints[0].y = realSpaceGuidePoints[1].y
				log("real space guide point " + 0 + " at ", screenGuidePoints[0].toArray().toString())
			}

			repositionScreen()

			for(let i = 0; i < 2; i++)
			{
				lines[i].geometry.vertices[0].copy( realSpaceGuidePoints[i] )
				lines[i].geometry.vertices[1].copy( screenGuidePoints[i] )
				cameraHolder.worldToLocal(lines[i].geometry.vertices[0])

				lines[i].geometry.verticesNeedUpdate = true
			}
		})

		function repositionScreen()
		{
			let planarScreenGuidePoints = [screenGuidePoints[0].clone(),screenGuidePoints[1].clone()]
			let toBeFlattenedIndex = planarScreenGuidePoints[0].y < planarScreenGuidePoints[1].y ? 1:0
			planarScreenGuidePoints[toBeFlattenedIndex].multiplyScalar( planarScreenGuidePoints[1-toBeFlattenedIndex].y / planarScreenGuidePoints[toBeFlattenedIndex].y )

			let planarVectorScreen = planarScreenGuidePoints[1].clone().sub(planarScreenGuidePoints[0]).setComponent(1,0)
			let planarVectorRealSpace = realSpaceGuidePoints[1].clone().sub(realSpaceGuidePoints[0]).setComponent(1,0)

			cameraHolder.quaternion.setFromUnitVectors(planarVectorScreen.clone().normalize(),planarVectorRealSpace.clone().normalize())

			let expectedBall0PositionFromCamera = planarScreenGuidePoints[0].clone()
			expectedBall0PositionFromCamera.multiplyScalar( planarVectorRealSpace.length() / planarVectorScreen.length() )
			expectedBall0PositionFromCamera.applyQuaternion( cameraHolder.quaternion )

			cameraHolder.position.copy(realSpaceGuidePoints[0])
			cameraHolder.position.sub(expectedBall0PositionFromCamera)
		}
		repositionScreen()
	}



	let discretes = [];
	let quaternions = [];
	let lerpedFloats = []

	let frames = []

	let lag = 0;
	let recording = false
	let recordingTime = 0
	let filename = ""
	bindButton( "z", function()
	{
		if( !recording )
		{
			// frustumIndicator.material.color.r = 1;
			recording = true
			log("recording")
			frames = Array(262144) //hopefully enough for 20 minutes
			recordingTime = 0
		}
		else
		{
			// frustumIndicator.material.color.r = 0.267
			recording = false
			log("not recording")

			filename = new Date().toString().slice(17,21)
			presentFramesFile()
		}
	}, "toggle recording" )

	presentFramesFile = function()
	{
		presentJsonFile( JSON.stringify(frames), filename )
	}

	loadRecording = function(version)
	{
		new THREE.FileLoader().load( "recordings/2-42.txt",
			function( str )
			{
				frames = eval(str)
				log("frames loaded")
			}
		);
	}
	if(!chromiumRatherThanChrome)
	{
		loadRecording()
	}

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

			//"diffing". Get a factor of 2-10
			//But file size is already ~10% of the size of the video
			//Could also round the floats
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

		let toNearestSecond = Math.floor(recordingTime)
		if( toNearestSecond % 10 === 0 && recordingTime - toNearestSecond < frameDelta )
		{
			log( toNearestSecond )
		}
		//7MB/m
		//compared with 200MB/m. It's ok.
		//there again not streaming
		//20m should be enough = 140MB
		//1165s = 20m = 95MB = 155,000 frames

		for(let i = 0; i < frames.length; i++)
		{
			if(frames[i] === undefined)
			{
				frames[i] = frame
				return;
			}
		}
		frames.push(frame)
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
	markPositionAndQuaternion = function( object3d,name )
	{
		markPosition(object3d)
		markQuaternion(object3d)
	}
	markMatrix = function(m)
	{
		//not lerped floats, that'd be bad
		for( let i = 0; i < m.elements.length; i++)
		{
			markObjectProperty( m.elements, i.toString() )
		}
	}

	{
		//GET RID OF THIS. You should be able to derive the correct place by now
		let absorberForUselessData = new THREE.Group()
		markPositionAndQuaternion(absorberForUselessData)
	}

	let helmet = initHelmet()

	synchronizeStateToVideo = function()
	{
		let exactTime = videoDomElement.currentTime + lag;
		if(exactTime < 0)
		{
			console.warn("time is less than 0")
			return;
		}

		//goes haywire
		// let frameRate = 30.0 //ffmpeg tells us so
		// exactTime = Math.floor( exactTime.toFixed(5) * frameRate); //from VideoFrame.js

		let frameJustBefore = null
		let frameJustAfter = null
		for( let i = 0, il = frames.length - 1; i < il && frames[i+1] !== null; i++ )
		{
			if( frames[i+1].frameTime > exactTime )
			{
				frameJustBefore = frames[i];
				frameJustAfter = frames[i+1];
				break
			}
		}

		if( frameJustBefore === null )
		{
			console.warn("time is greater than limit")
			videoDomElement.pause()
			videoDomElement.currentTime = 0
			return;
		}

		let lerpValue = ( exactTime - frameJustBefore.frameTime ) /
						( frameJustAfter.frameTime - frameJustBefore.frameTime );
		lerpValue = clamp(lerpValue, 0, 1);

		for(let i = 0, il = discretes.length; i < il; i++)
		{
			discretes[i].object[ discretes[i].property ] = frameJustBefore.discretes[i];
		}
		for(let i = 0, il = lerpedFloats.length; i < il; i++)
		{
			let diff = frameJustAfter.lerpedFloats[i] - frameJustBefore.lerpedFloats[i];
			lerpedFloats[i].object[ lerpedFloats[i].property ] = lerpValue * diff + frameJustBefore.lerpedFloats[i];
		}
		for(let i = 0, il = frameJustBefore.quaternions.length; i < il; i++)
		{
			quaternions[i].fromArray( frameJustBefore.quaternions[i] );
			let nextFrameQuaternion = new THREE.Quaternion().fromArray( frameJustAfter.quaternions[i] );
			quaternions[i].slerp( nextFrameQuaternion, lerpValue );
		}
	}

	synchronizeToVideoOrCallContingentUpdateFunctionsAndMaybeRecord = function()
	{
		if( playbackMode )
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

		maybeRecordFrame()
	}

	function togglePlaying()
	{
		if( playbackMode === false ) //first time
		{
			if( frames[0].discretes.length !== discretes.length || 
				frames[0].quaternions.length !== quaternions.length || 
				frames[0].lerpedFloats.length !== lerpedFloats.length )
			{
				console.error("need to rerecord",
					frames[0].discretes.length, discretes.length,
					frames[0].quaternions.length, quaternions.length,
					frames[0].lerpedFloats.length, lerpedFloats.length )
				return
			}
			if(renderer.vr.enabled)
			{
				console.error( "vr enabled, use chrome (camera will not cooperate even if you disable vr)" )
				return
			}
			if(chromiumRatherThanChrome)
			{
				console.error(".mp4 doesn't work in chromium, use chrome")
				return
			}

			playbackMode = true

			//if you wanna go back to recording or be in VR, refresh
			cameraHolder.add(camera)
			// frustumIndicator.visible = false
			camera.position.set(0,0,0)
			camera.rotation.set(0,0,0)

			screen.material.opacity = 1
			log(screen.material.opacity)
			helmet.visible = true

			if(videoDomElement.currentTime === 0)
			{
				bindButton( "o", function(){}, "increase lag",function()
				{
					lag += 0.01
					console.log("lag: ", lag)
				} )
				bindButton( "p", function(){}, "decrease lag",function()
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

		bindButton( "q", function(){}, "camera down",function()
		{
			camera.rotation.y -= 0.01
			console.log("camera rotation: ", camera.rotation.toArray().toString() )
		} )
		bindButton( "e", function(){}, "camera up",function()
		{
			camera.rotation.y += 0.01
			console.log("camera rotation: ", camera.rotation.toArray().toString() )
		} )
	}
}