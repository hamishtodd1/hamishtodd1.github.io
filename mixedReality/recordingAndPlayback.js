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
		var videoDomElement = document.createElement( 'video' )
		videoDomElement.style = "display:none"
		videoDomElement.crossOrigin = 'anonymous';
		videoDomElement.src = "recordings/t.mp4"
		// videoDomElement.volume = 0

		var videoTexture = new THREE.VideoTexture( videoDomElement );
		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.magFilter = THREE.LinearFilter;
		videoTexture.format = THREE.RGBFormat;
		videoTexture.needsUpdate = true
		videoTexture.rotation = TAU/2
		videoTexture.center.set(0.5,0.5)

		var screen = new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({
			map:videoTexture,
			overdraw: true,
			transparent:true,
			opacity:0.2
		}))
		screen.position.z = -2
		screen.scale.y = 2 * Math.tan( camera.fov * THREE.Math.DEG2RAD / 2 ) * Math.abs( screen.position.z )
		screen.scale.x = 16/9 * screen.scale.y
	}
	let cameraHolder = initCameraHolder(screen)

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
		new THREE.FileLoader().load( "recordings/t.txt",
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

		let frameRate = 30.0 //ffmpeg tells us so
		let frameWeAreOn = Math.floor( exactTime * frameRate); //VideoFrame.js says floor
		exactTime = frameWeAreOn / frameRate

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
			cameraHolder.frustumIndicator.visible = false
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
	bindButton( 'space', togglePlaying, "toggle playing")
}