/*
	Would be nice if speed was a slider

	The camera is a specific thing

	What's a small, simple room in which you would expect to find geese?
	Geese rather than swans, geese are more humourous whereas swans are known for elegance and you can do the former but not the latter
	Office might be appropriate, things on desk

	But ask: how does AR integrate into this? Well, it'll just be a video in the bg

	A hard one is things like drawing, what's the state of that? Could record control points.

	You DO want to be able to create as many things as you like at runtime, and make them disappear too.
		Special notification when a particular thing is created
		But what if you go over that part many times?
		Alternative is to build up an array and when you stop recording, go back and put them all in.
		Another alternative: we reduce the improvizational nature and say nothing gets made at runtime.
*/

function initMonitorer(clickables,grabbables)
{
	var socket = new WebSocket("ws://" + window.location.href.substring(7) + "ws");
	if(!socket)
	{
		console.error("socket invalid");
		return;
	}
	socket.onmessage = function(msg)
	{
		if(msg.data === "oldAudioDeleted")
		{
			audioRecorder.stopRecording();
		}
	}

	var audio = document.querySelector('audio');
	var audioRecorder = initAudioRecorder(audio);
	var monitorer = {};

	monitorer.objectsAndPropertiesToBeMonitored = [];
	var quaternionsToBeMonitored = [];
	
	var recording = false;
	var recordingTime = 0;

	function startRecording()
	{
		audio.pause();
		audio.currentTime = 0;
		
		recording = true;
		audioRecorder.startRecording();

		recordingTime = 0;
		recordedFrames.length = 0;
		console.log("rolling");
	}
	function stopRecording()
	{
		recording = false;
		console.log("cut. Saving");
		socket.send( JSON.stringify(recordedFrames) );
	}

	monitorer.togglePlaying = function()
	{
		if( audio.paused )
		{
			audio.play();
		}
		else
		{
			audio.pause();
		}
	}

	document.addEventListener( 'keydown', function(event)
	{
		if(event.keyCode === 82) //r for record
		{
			if( !recording )
			{
				startRecording()
			}
			else
			{
				stopRecording()
			}
		}
		if(event.keyCode===32) //space to play
		{
			monitorer.togglePlaying()
		}
	});

	monitorer.record = function()
	{
		var newFrame = {};
		newFrame.frameTime = recordingTime;

		newFrame.objectPropertyData = Array( monitorer.objectsAndPropertiesToBeMonitored.length );
		newFrame.quaternionData = Array( quaternionsToBeMonitored.length );

		for(var i = 0, il = monitorer.objectsAndPropertiesToBeMonitored.length; i < il; i++)
		{
			newFrame.objectPropertyData[i] = monitorer.objectsAndPropertiesToBeMonitored[i].object[ monitorer.objectsAndPropertiesToBeMonitored[i].property ];
		}
		for(var i = 0, il = quaternionsToBeMonitored.length; i < il; i++)
		{
			newFrame.quaternionData[i] = quaternionsToBeMonitored[i].toArray();
		}

		recordedFrames.push(newFrame);

		recordingTime += frameDelta;
	}

	monitorer.dispense = function()
	{
		//tis annoying how we aren't sure exactly where audio.currentTime gets updated
		var frameJustBefore = 0;
		for( var i = 0, il = recordedFrames.length; i < il; i++ )
		{
			if( recordedFrames[i].frameTime <= audio.currentTime )
			{
				frameJustBefore = i;
			}
		}
		var frameJustAfter = frameJustBefore + 1;
		if( frameJustAfter > recordedFrames.length-1 )
		{
			console.log("recording end reached")
			audio.pause()
			return;
		}

		var lerpValue = ( audio.currentTime - recordedFrames[frameJustBefore].frameTime ) / (recordedFrames[frameJustAfter].frameTime - recordedFrames[frameJustBefore].frameTime);
		lerpValue = clamp(lerpValue, 0,1);

		for(var i = 0, il = monitorer.objectsAndPropertiesToBeMonitored.length; i < il; i++)
		{
			if( typeof recordedFrames[frameJustBefore].objectPropertyData[i] === "number")
			{
				var frameDiff = recordedFrames[frameJustAfter].objectPropertyData[i] - recordedFrames[frameJustBefore].objectPropertyData[i];
				monitorer.objectsAndPropertiesToBeMonitored[i].object[ monitorer.objectsAndPropertiesToBeMonitored[i].property ] = lerpValue * frameDiff + recordedFrames[frameJustBefore].objectPropertyData[i];
			}
			else
			{
				monitorer.objectsAndPropertiesToBeMonitored[i].object[ monitorer.objectsAndPropertiesToBeMonitored[i].property ] = recordedFrames[frameJustBefore].objectPropertyData[i];
			}
		}
		for(var i = 0, il = quaternionsToBeMonitored.length; i < il; i++)
		{
			quaternionsToBeMonitored[i].fromArray( recordedFrames[frameJustBefore].quaternionData[i] );
			var nextFrameQuaternion = new THREE.Quaternion().fromArray( recordedFrames[frameJustAfter].quaternionData[i] );
			quaternionsToBeMonitored[i].slerp( nextFrameQuaternion, lerpValue );
		}
	}

	monitorer.monitorObjectAndProperty = function( object, property )
	{
		monitorer.objectsAndPropertiesToBeMonitored.push({object: object, property: property});
	}

	monitorer.monitorPositionAndQuaternion = function( object3D )
	{
		monitorer.monitorObjectAndProperty(object3D.position, "x");
		monitorer.monitorObjectAndProperty(object3D.position, "y");
		monitorer.monitorObjectAndProperty(object3D.position, "z");

		quaternionsToBeMonitored.push(object3D.quaternion)
	}

	var recordedFrames = null;
	var ui = null;
	THREE.Cache.enabled = false; //don't forget to ctrl+F5
	new THREE.FileLoader().load("record.txt",function(stringFromFile)
	{
		recordedFrames = JSON.parse(stringFromFile);
		var initUiCallString = getStandardFunctionCallString(initUi);
		ui = eval(initUiCallString);
	});

	monitorer.update = function(thingsToBeUpdated)
	{
		/*
			Philofophie
			One might like to change initial conditions then watch what I do
				That would mean: DO NOT record certain things, instead update them while the recording is playing
				But it is also important to be able to skip around the timeline
				Could simulate forward by going through what's happened in every frame.
				Could mark certain properties as "recalled if you skip to this point but not if you're simulating forward". That's a lot of work for yourself.
				It is REALLY UNAVOIDABLY COMPLEX to think about any kind of updating during playingtime. Consider that some things are inter-frame.
				Could record only controller input
				It also risks (hugely) people seeing something you didn't intend

			updating when paused will mean stuff continues to do things
			but that's ok, you're pausing *me*, not the simulation
			But mightn't it be quite fun to "play" with the audience? Yeesh
		*/
		if(!audio.paused)
		{
			monitorer.dispense();
		}
		else
		{
			for( var thing in thingsToBeUpdated)
			{
				if( Array.isArray( thingsToBeUpdated[thing] ) )
				{
					for(var i = 0, il = thingsToBeUpdated[thing].length; i < il; i++)
					{
						thingsToBeUpdated[thing][i].update();
					}
				}
				else
				{
					thingsToBeUpdated[thing].update();
				}
			}
			if(recording)
			{
				monitorer.record();
			}
		}

		if( ui )
		{
			ui.update(recording,audio);
		}
	}

	return monitorer;
}