/*
	TODO
		XSplit definitely fucked you, find a different compositer, maybe OBS
		You probably do need parenthood to be marked. Not *that* complicated to think about
		Detect controller smack in VR and make it so you just have to get to the frame where it happened
		More roughness on helmet. Is lower part reflecting correctly?
		Music, sound effects
		Eyebrows
		Visual alignment
			Could bring back hiro or points
			If there's *any* adjustment in post then it defeats the entire point.
			There has to be some adjustment during the shoot anyway, because AR probably can't get that camera in place
	

	Reasons to have bradyBot:
		Bob Ross looked at his canvas and at the camera, watch him
		Draws people's attention to things (including face) better
		Makes it feel more like being present with you/more natural
		More exciting / varied / "dynamic"
		Want all this but don't want to bring someone else in
			Have to wait on them
			Extra communication
			They can't re-zoom or track things as accurately as a robot
			And if they can they're probably costly
	Spherical camera
		Camera direction is going to change a lot, both sideways and downwards. Spherical necessary for perspective correction
		No need to do that roll/pitch eliminating adjustment
		Transferrable to VR (but depth information would be better)
	Pose / cinematography
		Shake? See surely that's cheap and bad
		Zoom? For shots of thing versus shot of both of you
		You want the board close to the camera, closer than your hands
			Arms/writsts behind objects
				Can work out where wrist is just from model, check wrist dist to camera vs controller
			Maybe wear a glove and have that in 3D model?
		Shots
			Looking at board (audience view should be basically the same as yours)
			Looking at face (potentially very zoomed in)
			Looking at both while face looks at camera
			Looking at face and small thing brought out of board
			Automatic shot selection CAN WAIT UNTIL YOU'VE DONE IT MANUALLY! But:
				Looking at camera = camera looks at you
					If you're not holding or even gesturing at thing, probably it *only* looks at you
				Looking at camera while holding some object = track the thing, potentially getting your face in
				Looking at thing but face reacts = probably you've not done anything serious with it
				Looking at face and board should be very rare, so it's ok if it's got weird barrel distortion!
	Resolution
		May not matter so much, since interacting hand and face are mainly obscured. You'll know after trying it!
		Temporary solution for background (might look awful, test first):
			Choose your alpha color in threejs
			Get your high-res picture in paint.net
			"Paint" on it in that color in all the places where your body goes
		Could do the chromakey crap and then have a high-res photo as an inner sphere
		New camera
			3840x2160 with 180x2*camera.fov lens, that'd allow the video to be 1080p
			No zooming though
			Your phone with a 180x180 fisheye is not a improvement resolution-wise
	Could turn yourself into a virtual object
		Helmet can go all the way around head
		Arms can go in front of virtual objects
		Better for folks in VR
		How
			Key out everything but you and your chair,
			Know where head and hand are in 3D space, adjust sphere scale to make it line up
			Depth camera or static key are options but green is probably easiest
*/

markObjectProperty = function(){}
markLerpedFloat = function(){}
markQuaternion = function(){}
markPosition = function(){}
markPositionAndQuaternion = function(){}
markMatrix = function(){}
callContingentUpdateFunctionsAndMaybeRecordOrSynchronizeToVideo = function()
{
	for(let i = 0; i < updateFunctions.length; i++)
	{
		updateFunctions[i]();
	}
}

function initPlaybackAndRecording()
{
	{
		realityVideoDomElement.src = "recordings/sintel.mp4"
		// realityVideoDomElement.volume = 0

		let videoTexture = new THREE.VideoTexture( realityVideoDomElement );

		//????????
		videoTexture.rotation = TAU/2;
		videoTexture.center.set(0.5,0.5)

		let screen = new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({
			map:videoTexture,
			overdraw: true,
			// transparent:true,
			// opacity:1.0
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

	presentFramesFile = function()
	{
		//Really ought to list names of objects and put them in output file
		//also post processing effects eg eye state
		presentJsonFile( JSON.stringify(frames), filename )
	}

	function loadRecording(version)
	{
		new THREE.FileLoader().load( "recordings/0-03 (2).txt", //2-07
			function( str )
			{
				frames = eval(str)
				log("frames loaded")
				togglePlaying()
			}
		);
	}

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
				let name = (fakeError.stack.split("at init"))[1].split(" (")[0]
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

	function synchronizeStateToVideo()
	{
		//if you're recording in 30fps it doesn't matter! Eeeeexcept the recording might be off by one frame from what you saw
		let videoFps = 30.0 //ffmpeg tells us so 
		let relevantVideoFrameWeAreOn = Math.floor( (realityVideoDomElement.currentTime + lag) * videoFps); //VideoFrame.js says floor		
		let timeInSimulation = relevantVideoFrameWeAreOn / videoFps
		if(timeInSimulation < 0)
		{
			realityVideoDomElement.currentTime = 1 - lag
			relevantVideoFrameWeAreOn = Math.floor( (realityVideoDomElement.currentTime + lag) * videoFps);
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

			if( 455.669324 <= realityVideoDomElement.currentTime && realityVideoDomElement.currentTime <= 510.2 &&
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

	callContingentUpdateFunctionsAndMaybeRecordOrSynchronizeToVideo = function()
	{
		if( MODE === PLAYBACK_MODE )
		{
			synchronizeStateToVideo()
		}
		else
		{
			for(let i = 0; i < updateFunctions.length; i++)
			{
				updateFunctions[i]();
			}

			if( recording )
			{
				recordFrame()
			}
		}
	}

	function togglePlaying()
	{
		if( !realityVideoDomElement.paused )
		{
			realityVideoDomElement.pause()
			log("pause ", realityVideoDomElement.currentTime)
		}
		else
		{
			realityVideoDomElement.play();
			log("playing ", realityVideoDomElement.currentTime)
		}
	}

	if( MODE === PLAYBACK_MODE )
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
		console.error(".mp4 doesn't work in chromium")
		if(renderer.vr.enabled)
		{
			console.error( "vr enabled, restart (camera will not cooperate even if you disable vr)" )
			return
		}

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
			realityVideoDomElement.playbackRate += 0.1
		}, "increase video speed")
		bindButton("down",function()
		{
			realityVideoDomElement.playbackRate -= 0.1
		}, "decrease video speed")
		bindButton("left",function()
		{
			realityVideoDomElement.currentTime -= 5
		}, "jump back")
		bindButton("right",function()
		{
			realityVideoDomElement.currentTime += 5
		}, "jump forwards")

		bindButton( 'space', togglePlaying, "toggle playing")

		loadRecording()
	}

	if( MODE === VR_TESTING_MODE )
	{
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
	}
}