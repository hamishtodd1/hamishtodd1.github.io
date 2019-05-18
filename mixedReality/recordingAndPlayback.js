/*
	You probably do need parenthood to be marked. Not *that* complicated to think about

	Time synchronization
		smack controllers together
		could make controller flash at instant that it changes direction dramatically
			Automatic sync then?

	Visual synchronization
		If you glue the vive tracker to a tablet you only have to do it once
		could glue the vive tracker to a point exactly behind the camera
		but for time being it is better not to move dude!

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
		videoDomElement.src = "recordings/2-07.mp4"
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
			opacity:1.0
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

	let lag = -7.4209;
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

			cameraHolder.frustumIndicator.material.color.setRGB(1,0,0)
		}
		else
		{
			// frustumIndicator.material.color.r = 0.267
			recording = false
			log("not recording")

			filename = new Date().toString().slice(17,21)
			presentFramesFile()

			cameraHolder.frustumIndicator.material.color.setRGB(0,0,0)
		}
	}, "toggle recording" )

	presentFramesFile = function()
	{
		presentJsonFile( JSON.stringify(frames), filename )
	}

	loadRecording = function(version)
	{
		new THREE.FileLoader().load( "recordings/2-07.txt", //2-07
			function( str )
			{
				frames = eval(str)
				log("frames loaded")
				if(!chromiumRatherThanChrome)
				{
					togglePlaying()
				}
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

			//this is about diffing, which is basically unncessary.
			//rounding the floats and doing this you can reduce file size by maybe 80%
			//Loads in faster, easier to transfer through git
			//but video is so much bigger.
			//is "looking for commonalities" essentially what gzip et al already do?
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

	let helmet = initHelmet()

	synchronizeStateToVideo = function()
	{
		//if you're recording in 30fps it doesn't matter! Eeeeexcept the recording might be off by one frame from what you saw
		let videoFps = 30.0 //ffmpeg tells us so 
		let relevantVideoFrameWeAreOn = Math.floor( (videoDomElement.currentTime + lag) * videoFps); //VideoFrame.js says floor		
		let timeInSimulation = relevantVideoFrameWeAreOn / videoFps
		if(timeInSimulation < 0)
		{
			videoDomElement.currentTime = 1 - lag
			relevantVideoFrameWeAreOn = Math.floor( (videoDomElement.currentTime + lag) * videoFps);
			timeInSimulation = relevantVideoFrameWeAreOn / videoFps
		}

		let frameJustBefore = null
		let frameJustAfter = null
		let lerpValue = null
		for( let i = 0, il = frames.length - 1; i < il; i++ )
		{
			frameJustBefore = frames[i];
			frameJustAfter = frames[i+1];

			if( frames[i+2] === null || frames[i+1].frameTime > timeInSimulation )
			{
				break
			}
		}
		lerpValue = ( timeInSimulation - frameJustBefore.frameTime ) /
						( frameJustAfter.frameTime - frameJustBefore.frameTime );
		lerpValue = clamp(lerpValue, 0, 1);

		let alreadyDoneThatHack = false
		for(let i = 0, il = discretes.length; i < il; i++)
		{
			discretes[i].object[ discretes[i].property ] = frameJustBefore.discretes[i];

			//post-production hacking

			if( 455.669324 <= videoDomElement.currentTime && videoDomElement.currentTime <= 510.2 &&
				discretes[i].property === "value" && frameJustBefore.discretes[i] === 3 && !alreadyDoneThatHack )
			{
				discretes[i].object[ discretes[i].property ] = 0
				alreadyDoneThatHack = true
			}
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
			if(chromiumRatherThanChrome)
			{
				console.error("Use chrome, .mp4 doesn't work in chromium")
				return
			}
			if(renderer.vr.enabled)
			{
				console.error( "vr enabled, restart (camera will not cooperate even if you disable vr)" )
				return
			}

			playbackMode = true

			//if you wanna go back to recording or be in VR, refresh
			cameraHolder.add(camera)
			cameraHolder.frustumIndicator.visible = false
			camera.position.set(0,0,0)
			camera.rotation.set(0,0,0)

			helmet.visible = true

			let lagVelocity = 0
			bindButton( "o", function(){}, "video got there first",function()
			{
				if(lagVelocity < 0)
					lagVelocity = 0
				lagVelocity += 0.0001
				lag += lagVelocity
				console.log("lag: ", lag)
			} )
			bindButton( "p", function(){}, "virtual controller got there first",function()
			{
				if(lagVelocity > 0)
					lagVelocity = 0
				lagVelocity -= 0.0001
				lag += lagVelocity
				console.log("lag: ", lag)
			})
			bindButton("up",function()
			{
				videoDomElement.playbackRate += 0.1
			}, "increase video speed")
			bindButton("down",function()
			{
				videoDomElement.playbackRate -= 0.1
			}, "decrease video speed")
			bindButton("left",function()
			{
				videoDomElement.currentTime -= 5
			}, "jump back")
			bindButton("right",function()
			{
				videoDomElement.currentTime += 5
			}, "jump forwards")
		}

		if( !videoDomElement.paused )
		{
			videoDomElement.pause()
			log("pause ", videoDomElement.currentTime)
		}
		else
		{
			videoDomElement.play();
			log("playing ", videoDomElement.currentTime)
		}
	}
	bindButton( 'space', togglePlaying, "toggle playing")
}