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

function initMonitorer(clickables)
{
	var monitorer = {};

	monitorer.objectsAndPropertiesToBeMonitored = [];
	var quaternionsToBeMonitored = [];
	
	var recordedFrames = null;
	THREE.Cache.enabled = false; //don't forget to ctrl+F5
	new THREE.FileLoader().load("record.txt",function(stringFromFile)
	{
		recordedFrames = JSON.parse(stringFromFile);
	})

	monitorer.recording = false;
	monitorer.playing = false;
	var playingTime = 0;
	var recordingTime = 0;

	monitorer.togglePlaying = function()
	{
		if(monitorer.playing)
		{
			monitorer.playing = false;
		}
		else
		{
			monitorer.recording = false;
			if(recordedFrames.length === 0)
			{
				console.log("no data")
			}
			else
			{
				monitorer.playing = true;
				if( playingTime > recordedFrames[recordedFrames.length-1].frameTime )
				{
					playingTime = 0;
				}
			}
		}
	}

	document.addEventListener( 'keydown', function(event)
	{
		if(event.keyCode === 82) //r for record
		{
			if( !monitorer.recording )
			{
				monitorer.playing = false;
				monitorer.recording = true;
				recordingTime = 0;
				recordedFrames.length = 0;
				playingTime = 0;
				console.log("rolling");
			}
			else if( monitorer.recording )
			{
				monitorer.recording = false;
				console.log("cut, ", recordedFrames);
			}
		}
		if(event.keyCode===83) //s for save 
		{
			console.log("saving")
			socket.send( JSON.stringify(recordedFrames) );
		}
		if(event.keyCode===32) //space to play
		{
			monitorer.togglePlaying()
		}
	} );

	{
		//timeline should be a nice relative-motion slider! Or not, because people are used to one thing
		var timeline = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2), new THREE.MeshBasicMaterial({color:0x808080}));
		timeline.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(TAU/4))
		timeline.position.z = -camera.near*2;

		var playPauseButton = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0xFFFFFF}));
		for(var i = 0; i < 8; i++)
		{
			playPauseButton.geometry.vertices.push(new THREE.Vector3());
		}
		playPauseButton.position.z = timeline.position.z;
		playPauseButton.geometry.vertices[0].set(-1,1,0);
		playPauseButton.geometry.vertices[4].set(-1,-1,0);
		playPauseButton.geometry.faces.push(new THREE.Face3(0,4,1),new THREE.Face3(1,4,5),new THREE.Face3(2,6,3),new THREE.Face3(3,6,7));

		var timelineTracker = new THREE.Mesh(new THREE.CircleBufferGeometry(1,16), new THREE.MeshBasicMaterial({color:0xFF00FF}));
		timelineTracker.position.z = timeline.position.z+0.00001;

 		function updateTrackerPositionFromTime()
		{
			var proportionThrough = recordedFrames ? playingTime / recordedFrames[recordedFrames.length-1].frameTime : 0;
			timelineTracker.position.x = -timeline.scale.x + timeline.scale.x * 2 * proportionThrough;
		}

		(monitorer.setUiSize = function()
		{
			var frameDimensions = frameDimensionsAtZDistance(-timeline.position.z);
			timeline.scale.x = frameDimensions.width / 2 * 0.7;
			timeline.scale.y = timeline.scale.x/30;
			timeline.scale.z = timeline.scale.y;

			playPauseButton.scale.setScalar(timeline.scale.y*3);
			playPauseButton.position.y = -frameDimensions.height / 2 + playPauseButton.scale.y * 1.4;
			playPauseButton.position.x = -frameDimensions.width / 2 + (frameDimensions.width / 2-timeline.scale.x)/2;

			timeline.position.y = playPauseButton.position.y;

			timelineTracker.position.y = timeline.position.y;
			timelineTracker.scale.setScalar(timeline.scale.y * 1.9);
			updateTrackerPositionFromTime()
		})();

		camera.add(playPauseButton);
		camera.add(timeline);
		camera.add(timelineTracker);

		//and the speed thing

		clickables.push(playPauseButton,timeline);

		timeline.onClick = function(worldSpaceLocation)
		{
			timelineTracker.position.x = worldSpaceLocation.x;
			var proportionThrough = (timelineTracker.position.x + timeline.scale.x) / (timeline.scale.x * 2);
			playingTime = proportionThrough * recordedFrames[recordedFrames.length-1].frameTime
			if(!monitorer.playing)
			{
				monitorer.dispense();
			}
		}

		playPauseButton.onClick = function()
		{
			monitorer.togglePlaying();
		}

		//speed and maybe volume would be nice but not necessary
	}

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

	monitorer.updateUiAppearance = function()
	{
		playPauseButton.visible = !monitorer.recording;
		timeline.visible = !monitorer.recording;
		timelineTracker.visible = !monitorer.recording;

		if(monitorer.playing)
		{
			playPauseButton.geometry.vertices[1].set(-1/16,1,0);
			playPauseButton.geometry.vertices[2].set(1/16,1,0);
			playPauseButton.geometry.vertices[3].set(1,1,0);

			playPauseButton.geometry.vertices[5].set(-1/16,-1,0);
			playPauseButton.geometry.vertices[6].set(1/16,-1,0);
			playPauseButton.geometry.vertices[7].set(1,-1,0);
		}
		else
		{
			playPauseButton.geometry.vertices[3].set(1,0,0);
			playPauseButton.geometry.vertices[7].set(1,0,0);

			playPauseButton.geometry.vertices[1].set(0,0.5,0);
			playPauseButton.geometry.vertices[2].set(0,0.5,0);
			playPauseButton.geometry.vertices[5].set(0,-0.5,0);
			playPauseButton.geometry.vertices[6].set(0,-0.5,0);
		}
		playPauseButton.geometry.verticesNeedUpdate = true;
	}

	monitorer.dispense = function()
	{
		//playingTime should come from a video or audio

		var frameJustBefore = 0;
		for( var i = 0, il = recordedFrames.length; i < il; i++ )
		{
			if( recordedFrames[i].frameTime <= playingTime )
			{
				frameJustBefore = i;
			}
		}
		var frameJustAfter = frameJustBefore + 1;
		if( frameJustAfter > recordedFrames.length-1 )
		{
			console.log("recording end reached")
			monitorer.playing = false;
			return;
		}

		var lerpValue = ( playingTime - recordedFrames[frameJustBefore].frameTime ) / (recordedFrames[frameJustAfter].frameTime - recordedFrames[frameJustBefore].frameTime);
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

		playingTime += frameDelta;
		updateTrackerPositionFromTime();
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

	var socket = new WebSocket("ws://" + window.location.href.substring(7) + "ws");
	if(!socket)
	{
		console.error("socket invalid");
		return;
	}

	return monitorer;
}

/*
	What are the editing controls you'd need? Remember a major point is that "effects" are done live, eg putting music over
	You're going to use keyboard shortcuts anyway so not much need for buttons
	The fundamental thing to imagine: a bunch of lines of different colors, parts of which you shall cut out and assemble into another line
	You can grab the ends and move them to change how much is there. Contract a line and it will "ripple" the gap shut
	Do want zooming and marks for seconds and minutes. And the ability to grab and move the timeline along
	Probably fine to only have editing be on the main timeline. So you start out by all the original pieces (possibly many copies) and putting them in order, then trimming them.
	Just display the pieces above the timeline, grab them when you please
	Probably want names for the various bits displayed on them
*/