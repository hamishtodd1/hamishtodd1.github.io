/*
	Do we want an editing system? It'd definitely be cool
		Adobe premiere pro interface?
		"clips" are rectangles of a certain length - audio coupled with state.
		Have two "screens" - left plays clips, right plays timeline

	To generate a "random" frame you need to know about typical ranges of values
*/

function initMonitorer()
{
	var monitorer = {};

	monitorer.objectsAndPropertiesToBeMonitored = [];
	var quaternionsToBeMonitored = [];
	
	var recordedFrames = [];
	new THREE.FileLoader().load("record.txt",function(stringFromFile)
	{
		recordedFrames = JSON.parse(stringFromFile);
	})

	monitorer.recording = false;
	monitorer.playing = false;

	document.addEventListener( 'keydown', function(event)
	{
		if(event.keyCode === 82) //r toggle
		{
			if(!monitorer.recording)
			{
				monitorer.playing = false;
				monitorer.recording = true;
				console.log("rolling");
			}
			else if(monitorer.recording)
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
		if(event.keyCode===32) //space
		{
			if(monitorer.playing)
			{
				monitorer.playing = false;
				console.log("stop")
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
					console.log("playing")
				}
			}
		}
	} );

	var playingTime = 0;
	var recordingTime = 0;

	{
		// var playButton = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0xFFFFFF}));
		// playButton.geometry.vertices.push(new THREE.Vector3(1,0,0),new THREE.Vector3(-1,1,0),new THREE.Vector3(-1,-1,0));
		// playButton.geometry.faces.push(new THREE.Face3(0,1,2));
		// playButton.scale.setScalar(0.001)
		// playButton.position.set(-0.014,-0.008,-camera.near*2);

		// var timeLine = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0xFFFFFF}));
		// timeLine.geometry.vertices.push(new THREE.Vector3(1,1,0),new THREE.Vector3(-1,1,0),new THREE.Vector3(-1,-1,0),new THREE.Vector3(1,-1,0));
		// timeLine.geometry.faces.push(new THREE.Face3(0,1,2),new THREE.Face3(2,3,0));
		// timeLine.scale.set(0.01, 0.0003,1);
		// timeLine.position.set(0,-0.008,-camera.near*2);

		// var tracker = new THREE.Mesh(new THREE.CircleGeometry(0.0006,16), new THREE.MeshBasicMaterial({color:0xFF00FF}));
		// tracker.position.set(0,-0.008,-camera.near*2+0.00001);

		// camera.add(playButton);
		// camera.add(timeLine);
		// camera.add(tracker);
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
			frameJustAfter--;
			frameJustBefore--;
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

		if( frameJustAfter !== frameJustBefore)
		{
			playingTime += frameDelta;
		}

		// playButton.visible = !monitorer.recording;
		// timeLine.visible = !monitorer.recording;
		// tracker.visible = !monitorer.recording;
		// tracker.position.x = -timeLine.scale.x + timeLine.scale.x * 2 * playingTime;
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