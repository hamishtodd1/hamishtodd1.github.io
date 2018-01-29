/*
	You DO want to be able to create as many things as you like at runtime, and make them disappear too.
		Special notification when a particular thing is created
		But what if you go over that part many times?
		Alternative is to build up an array and when you stop recording, go back and put them all in.
		Another alternative: we reduce the improvizational nature and say nothing gets made at runtime.

	Probably the camera "sits on your lap", it is not your face
	Make it so events can propagate back in time?
		For example, a goose is to pick up an object, but it turns its head to it first
	At some point may want to do black hole effects, eg something that will want to render for a long time, so timestep should be slowable
	Put links to your work at the end. It's just confusing to have a scrollbar
	avoid things being affected by camera movement, because that will be smoothed out
	As soon as there's a hololens like thing with hand controllers, be the first to do a good hand enabled VR lecture!
	If you're not running from a server (i.e. you're not intending to save things i.e. you're being run by a user), have some stuff come up in the console for the benefit of people who'd like to play around with it
	Theoretically possible: Video is always at an angle such that camera is looking at the same place that you in webcam video appear to be looking?
*/

function initPlaybackSystemAndMaybeRecorder(launcher)
{
	var audio = new Audio();
	audio.src = "record.wav?v=1174";

	var markedObjectsAndProperties = [];
	/*
		interpolation
			Quaternions have a specific function to interpolate
			as do numbers, so bit hacky to have separate array for quaternions but not numbers
			But booleans? Who knows which frame it "should" change on. Hence, no updating during playout!
	*/
	var markedQuaternions = [];

	markObjectProperty = function( object, property )
	{
		markedObjectsAndProperties.push({object: object, property: property});
	}
	markPositionAndQuaternion = function( object3D )
	{
		markObjectProperty(object3D.position, "x");
		markObjectProperty(object3D.position, "y");
		markObjectProperty(object3D.position, "z");

		markedQuaternions.push(object3D.quaternion)
	}

	new THREE.FileLoader().load("record.txt",function(stringFromFile)
	{
		var recordedFrames = JSON.parse(stringFromFile);
		
		initPlaybackSystem( audio, recordedFrames,
			markedObjectsAndProperties, markedQuaternions );

		if( FULL_SETUP )
		{
			var socket = new WebSocket("ws://" + window.location.href.substring(7) + "ws")
			socket.onopen = function()
			{
				initRecorder( this, audio, recordedFrames,
					markedObjectsAndProperties, markedQuaternions );

				launcher.dataLoaded["recordedFrames"] = true;
				launcher.attemptLaunch();
			}
		}
		else
		{
			launcher.dataLoaded["recordedFrames"] = true;
			launcher.attemptLaunch();
		}
	});
}