/*
	You DO want to be able to create as many things as you like at runtime, and make them disappear too.
		Special notification when a particular thing is created
		But what if you go over that part many times?
		Alternative is to build up an array and when you stop recording, go back and put them all in.
		Another alternative: we reduce the improvizational nature and say nothing gets made at runtime.

	Make it so events can propagate back in time?
		For example, a goose is to pick up an object, but it turns its head to it first
	At some point may want to do black hole effects, eg something that will want to render for a long time, so timestep should be slowable
	Put links to your work at the end. It's just confusing to have a scrollbar
	avoid things being affected by camera movement, because that will be smoothed out
	As soon as there's a hololens like thing with hand controllers, be the first to do a good hand enabled VR lecture!
	If you're not running from a server (i.e. you're not intending to save things i.e. you're being run by a user), have some stuff come up in the console for the benefit of people who'd like to play around with it
	If you CAN be changed by the player then you ARE monitorerd (eg clobbered on play)?

	SFX
	http://sfbgames.com/chiptone/
	https://www.bfxr.net/
	http://boscaceoil.net/

	if you have it, it will need to be over your audio
*/

function initPlaybackSystemAndMaybeRecordingSystem(launcher, vrAndRecording)
{
	var audio = new Audio();
	audio.src = "playbackAndRecording/record.wav?v=1258";
	if( !vrAndRecording )
	{
		audio.autoplay = true;
	}

	var markedObjectsAndProperties = [];
	/*
		interpolation
			Quaternions have a specific function to interpolate
			as do numbers, so bit hacky to have separate array for quaternions but not numbers
			But booleans? Who knows which frame it "should" change on. Hence, no updating during playout!
		The intuition is that interpolation is good because it spoofs a higher frame rate
		Maybe you should just record at a high frame rate though?
	*/
	var markedQuaternions = [];

	//TODO sliders are a nice example of interpolation, test that
	markObjectProperty = function( object, property )
	{
		markedObjectsAndProperties.push({object: object, property: property});
	}
	markQuaternion = function( object3D )
	{
		markedQuaternions.push(object3D.quaternion)
	}
	markPosition = function( object3D )
	{
		markObjectProperty(object3D.position, "x");
		markObjectProperty(object3D.position, "y");
		markObjectProperty(object3D.position, "z");
	}
	markPositionAndQuaternion = function( object3D )
	{
		markPosition(object3D)
		markQuaternion(object3D)
	}

	new THREE.FileLoader().load("playbackAndRecording/record.txt?v=1299",function(stringFromFile)
	{
		var recordedFrames = JSON.parse(stringFromFile);

		getIndexOfFrameJustBeforeTime = function(time)
		{
			for( var i = 0, il = recordedFrames.length - 1; i < il; i++ )
			{
				if( recordedFrames[i+1].frameTime > time )
				{
					return i;
				}
			}
			return recordedFrames.length - 1;
		}

		initPlaybackControl( 
			audio, recordedFrames );
		initStateSynchronization( 
			audio, recordedFrames,
			markedObjectsAndProperties, markedQuaternions );

		if( vrAndRecording )
		{
			socket = new WebSocket("ws://localhost:9090/ws")
			socket.onopen = function()
			{
				initRecordingSystem(
					audio, recordedFrames,
					markedObjectsAndProperties, markedQuaternions,
					socket);

				launcher.dataLoaded["recordedFrames"] = true;
				launcher.attemptLaunch();
			}
		}
		else
		{
			isRecordSynchable = function()
			{
				return true;
			}

			launcher.dataLoaded["recordedFrames"] = true;
			launcher.attemptLaunch();
		}
	});
}