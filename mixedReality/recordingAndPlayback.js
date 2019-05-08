/*
	Diffing
		An hour is less than 2MB, you're probably fine
		If you do do it, round the floats.

	It's complicated to think about but you probably do need parenthood to be marked

	can make eyes follow after

	Time synchronization
		smack controllers together
		could make controller flash at instant that it changes direction dramatically

	Visual synchronization
		If you glue the vive tracker to a tablet you only have to do it once

	would be nice to have a frustum. Hahaha

	Really ought to list names and put them in output file

	better off marking the controller/inputs?
		Jon Blow says "pain in the ass"
		Smaller filesize for recording
		Might somehow have to backtrack through frames to recover total state
*/

initPlaybackAndRecording = function()
{
	{
		let theoreticalCamera = new THREE.Group()
		scene.add(theoreticalCamera)

		let plane = new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({side:THREE.DoubleSide}))
		plane.position.z = -1
		plane.scale.y = 2 * Math.tan( camera.fov * THREE.Math.DEG2RAD / 2 ) * Math.abs( plane.position.z )
		plane.scale.x = 16/9 * plane.scale.y
		theoreticalCamera.add(plane)
		clickables.push(plane)
		let indexBeingLaid = 0
		bindButton("[",function()
		{
			indexBeingLaid = 1-indexBeingLaid
		}, "switch guide point being laid on videoScreen")
		plane.onClick = function(intersection)
		{
			let newLocation = intersection.point
			theoreticalCamera.worldToLocal(newLocation)
			screenGuidePoints[indexBeingLaid].copy(newLocation)

			repositionScreen()

			log("guide point " + indexBeingLaid + " at ", newLocation.toArray().toString())
		}

		let realSpaceGuidePoints = Array(2)
		for(let i = 0; i < 2; i++)
		{
			let ball = new THREE.Mesh(new THREE.SphereGeometry(0.02))
			scene.add(ball)

			realSpaceGuidePoints[i] = ball.position
			realSpaceGuidePoints[i].x = 2 * (i?1:-1) * Math.random()
			realSpaceGuidePoints[i].z = -0.5
		}
		let screenGuidePoints = Array(2)
		for(let i = 0; i < 2; i++)
		{
			let ball = new THREE.Mesh(new THREE.SphereGeometry(0.02))
			ball.material.transparent = true
			ball.material.opacity = 0.5
			theoreticalCamera.add(ball)

			screenGuidePoints[i] = ball.position
			screenGuidePoints[i].z = plane.position.z
			screenGuidePoints[i].x = 0.4 * plane.scale.x * (i?1:-1)
			screenGuidePoints[i].y = -0.25 * plane.scale.y

			let line = new THREE.Line(new THREE.Geometry())
			line.geometry.vertices.push(new THREE.Vector3())
			line.geometry.vertices.push(screenGuidePoints[i].clone().multiplyScalar(100))
			theoreticalCamera.add(line)
		}
		updateFunctions.push(function()
		{
			if( handControllers[LEFT_CONTROLLER_INDEX].button1 )
			{
				realSpaceGuidePoints[0].copy( handControllers[LEFT_CONTROLLER_INDEX].position )
				repositionScreen()
			}
			if( handControllers[LEFT_CONTROLLER_INDEX].button2 )
			{
				realSpaceGuidePoints[1].copy( handControllers[LEFT_CONTROLLER_INDEX].position )
				repositionScreen()
			}

			//mouse???? add ability to edit screen ones on here. Can "zoom in" and everything.
		})

		function repositionScreen()
		{
			let planarScreenGuidePoints = [screenGuidePoints[0].clone(),screenGuidePoints[1].clone()]
			let toBeFlattenedIndex = planarScreenGuidePoints[0].y < planarScreenGuidePoints[1].y ? 1:0
			planarScreenGuidePoints[toBeFlattenedIndex].multiplyScalar( planarScreenGuidePoints[1-toBeFlattenedIndex].y / planarScreenGuidePoints[toBeFlattenedIndex].y )

			let planarVectorScreen = planarScreenGuidePoints[1].clone().sub(planarScreenGuidePoints[0]).setComponent(1,0)
			let planarVectorRealSpace = realSpaceGuidePoints[1].clone().sub(realSpaceGuidePoints[0]).setComponent(1,0)

			theoreticalCamera.quaternion.setFromUnitVectors(planarVectorScreen.clone().normalize(),planarVectorRealSpace.clone().normalize())

			let expectedBall0PositionFromCamera = planarScreenGuidePoints[0].clone()
			expectedBall0PositionFromCamera.multiplyScalar( planarVectorRealSpace.length() / planarVectorScreen.length() )
			expectedBall0PositionFromCamera.applyQuaternion( theoreticalCamera.quaternion )

			theoreticalCamera.position.copy(realSpaceGuidePoints[0])
			theoreticalCamera.position.sub(expectedBall0PositionFromCamera)
		}
		repositionScreen()
	}



	let discretes = [];
	let quaternions = [];
	let lerpedFloats = []

	let frames = [] //there is a problem here, download error, fix it

	let lag = 0;
	let recording = false
	let recordingTime = 0
	let filename = ""
	bindButton( "z", function()
	{
		if( !recording )
		{
			frustumIndicator.material.color.r = 1;
			recording = true
			log("recording")
			frames = []
		}
		else
		{
			frustumIndicator.material.color.r = 0.267
			recording = false
			log("not recording")

			filename = new Date().toString().slice(16,23)
			presentFramesFile()
		}
	}, "toggle recording" )

	presentFramesFile = function()
	{
		presentJsonFile( JSON.stringify(frames), filename )
	}

	{
		var videoDomElement = document.createElement( 'video' )
		videoDomElement.style = "display:none"
		videoDomElement.crossOrigin = 'anonymous';
		videoDomElement.src = "recordings/video.mp4"
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
		new THREE.FileLoader().load( "recordings/00-55-4.txt",
			function( str )
			{
				frames = eval(str)
				// synchronizeStateToVideo()
			}
		);

		// videoDomElement.src = bbb.ogv
	}
	loadRecording()

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

	{
		let height = 0.1
		var cameraHolder = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshLambertMaterial({color:0xFF0000}) )
		cameraHolder.position.set(0,1.6,0.4)
		scene.add(cameraHolder)

		// var frustumIndicator = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.0,height,0.1,4), new THREE.MeshLambertMaterial())
		// frustumIndicator.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-height/2,0))
		// frustumIndicator.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(TAU/8))
		// frustumIndicator.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(TAU/4))
		// cameraHolder.add(frustumIndicator)

		let heldVertical = true
		let heldHorizontal = true

		bindButton("b",function()
		{
			heldVertical = !heldVertical
			heldHorizontal = !heldHorizontal
		}, "grab cameraHolder" )
		updateFunctions.push(function()
		{
			if( heldVertical )
			{
				cameraHolder.position.y = handControllers[LEFT_CONTROLLER_INDEX].position.y
			}
			if( heldHorizontal )
			{
				cameraHolder.position.x = handControllers[LEFT_CONTROLLER_INDEX].position.x
				cameraHolder.position.z = handControllers[LEFT_CONTROLLER_INDEX].position.z - 0.03
			}

			if( !heldHorizontal && !heldVertical )
			{
				cameraHolder.rotation.y = -TAU/2
			}
			else
			{
				cameraHolder.rotation.y = 0
			}
		})
		markPositionAndQuaternion(cameraHolder)
	}

	let helmet = initHelmet()

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

	synchronizeToVideoOrCallContingentUpdateFunctionsAndMaybeRecord = function()
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

		maybeRecordFrame()
	}

	function togglePlaying()
	{
		if(plane.visible === false) //first time
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
				console.error( "vr enabled, camera will not cooperate (even if you disable vr)" )
				return
			}
			if(chromiumRatherThanChrome)
			{
				console.error(".mp4 doesn't work in chromium, use chrome")
				return
			}

			//if you wanna go back to recording or be in VR, refresh
			cameraHolder.add(camera)
			frustumIndicator.visible = false
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