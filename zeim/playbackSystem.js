function initPlaybackSystem(audio,
	recordedFrames, markedObjectsAndProperties, markedQuaternions)
{
	var playbackSystem = {};

	togglePlaying = function()
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
	var playingToggled = false;
	document.addEventListener( 'keydown', function(event)
	{
		if( event.keyCode === 32 ) //space
		{
			event.preventDefault();
			playingToggled = true;
		}
	});

	var notedDiscrepancy = false;
	playbackSystem.dispense = function()
	{
		//you can use this to clobber out a starting state you don't like
		if(	recordedFrames[0].quaternionData.length !== markedQuaternions.length
			|| recordedFrames[0].objectPropertyData.length !== markedObjectsAndProperties.length )
		{
			if(!notedDiscrepancy)
			{
				console.error("Recorded data not what expected, we're not using it")
				notedDiscrepancy = true;
			}
			return;
		}

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

		for(var i = 0, il = markedObjectsAndProperties.length; i < il; i++)
		{
			if( typeof recordedFrames[frameJustBefore].objectPropertyData[i] === "number")
			{
				var frameDiff = recordedFrames[frameJustAfter].objectPropertyData[i] - recordedFrames[frameJustBefore].objectPropertyData[i];
				markedObjectsAndProperties[i].object[ markedObjectsAndProperties[i].property ] = lerpValue * frameDiff + recordedFrames[frameJustBefore].objectPropertyData[i];
			}
			else
			{
				markedObjectsAndProperties[i].object[ markedObjectsAndProperties[i].property ] = recordedFrames[frameJustBefore].objectPropertyData[i];
			}
		}
		for(var i = 0, il = recordedFrames[frameJustBefore].quaternionData.length; i < il; i++)
		{
			markedQuaternions[i].fromArray( recordedFrames[frameJustBefore].quaternionData[i] );
			var nextFrameQuaternion = new THREE.Quaternion().fromArray( recordedFrames[frameJustAfter].quaternionData[i] );
			markedQuaternions[i].slerp( nextFrameQuaternion, lerpValue );
		}
	}

	var ui = initUi(audio, playbackSystem, recordedFrames);

	playShowOrUpdateObjects = function()
	{
		if( playingToggled)
		{
			togglePlaying();
			playingToggled = false;
		}

		if( mouse.clicking && mouse.lastClickedObject !== ui.playPauseButton )
		{
			audio.pause();
		}

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
			playbackSystem.dispense();
		}
		else
		{
			for(var i = 0; i < markedThingsToBeUpdated.length; i++)
			{
				markedThingsToBeUpdated[i].update();
			}
		}

		ui.update();
	}
}

function initUi( audio, playbackSystem, recordedFrames)
{
	var ui = {};

	var background = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2), new THREE.MeshBasicMaterial({color:0xFAFAFA, transparent:true, opacity:0.77}));
	background.position.z = -camera.near*2;
	camera.add(background);

	{
		var playPauseButton = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0x5A5A5A}));
		ui.playPauseButton = playPauseButton;
		camera.add(playPauseButton);
		for(var i = 0; i < 8; i++)
		{
			playPauseButton.geometry.vertices.push(new THREE.Vector3());
		}
		playPauseButton.position.z = background.position.z + 0.0001;
		playPauseButton.geometry.vertices[0].set(-1,1,0);
		playPauseButton.geometry.vertices[4].set(-1,-1,0);
		playPauseButton.geometry.faces.push(new THREE.Face3(0,4,1),new THREE.Face3(1,4,5),new THREE.Face3(2,6,3),new THREE.Face3(3,6,7));
		playPauseButton.onClick = function()
		{
			togglePlaying();
		}
		clickables.push(playPauseButton);
	}

	{
		function updateSpeedFromSlider(valueBetweenZeroAndOne)
		{
			audio.playbackRate = Math.pow(2,valueBetweenZeroAndOne * 2 - 1)

			//The below is because lerps will look bad at anything other than the native framerate
			//This is not reflected in the tracker position, which is dishonest.
			//But! If it was it would be more complex to allow you to move away from this
			if(Math.abs(audio.playbackRate - 1) < 0.1)
			{
				audio.playbackRate = 1;
			}
		}
		var speedSlider = SliderSystem(updateSpeedFromSlider, 0.5 );
		camera.add(speedSlider);
		speedSlider.position.z = playPauseButton.position.z
	}

	{
		function getShowLength()
		{
			if(isNaN(audio.duration))
			{
				return recordedFrames[recordedFrames.length-1].frameTime
			}
			else
			{
				return Math.min(audio.duration, recordedFrames[recordedFrames.length-1].frameTime)
			}
		}
		function updateTimeFromSlider(valueBetweenZeroAndOne)
		{
			audio.currentTime = valueBetweenZeroAndOne * getShowLength();
			playbackSystem.dispense();
		}
		function onTimeTrackerGrab()
		{
			audio.pause();
		}
		var timeSlider = SliderSystem(updateTimeFromSlider, 0, false, onTimeTrackerGrab);
		camera.add(timeSlider);
		timeSlider.position.z = playPauseButton.position.z

		function getTimelinePositionFromTime(time)
		{
			if( !recordedFrames || getShowLength() === 0)
			{
				return 0;
			}
			else
			{
				return time / getShowLength();
			}
		}

		function updateTimeSliderFromTime()
		{
			timeSlider.setValue( getTimelinePositionFromTime( audio.currentTime ) )
		}

		var bufferedHighlights = [];
		var bufferedMaterial = timeSlider.material.clone();
		bufferedMaterial.color.multiplyScalar(0.85);
	}

	function setUiSize()
	{
		var frameDimensions = frameDimensionsAtZDistance(camera,-playPauseButton.position.z);

		var height = frameDimensions.width * 0.08
		/ Math.pow(frameDimensions.width/frameDimensions.height,1);

		var slidersHeight = height * 0.2;

		timeSlider.setDimensions( frameDimensions.width - height * 16/9 * 2,slidersHeight);
		timeSlider.position.x = -timeSlider.scale.x / 2;

		playPauseButton.scale.setScalar(height/2*0.8);
		playPauseButton.position.y = -frameDimensions.height / 2 + height / 2;
		playPauseButton.position.x = -frameDimensions.width / 2 + (frameDimensions.width / 2 - timeSlider.scale.x / 2) / 2;

		timeSlider.position.y = playPauseButton.position.y;
		timeSlider.position.z = playPauseButton.position.z;
		updateTimeSliderFromTime();

		background.position.copy(playPauseButton.position);
		background.position.x = 0;
		background.position.z -= 0.00001;
		background.scale.x = frameDimensions.width / 2;
		background.scale.y = height / 2;

		speedSlider.setDimensions(playPauseButton.scale.x*2.6,slidersHeight);
		speedSlider.position.copy(playPauseButton.position);
		speedSlider.position.x = -playPauseButton.position.x;
		speedSlider.position.x -= speedSlider.scale.x / 2;
	}
	setUiSize();
	window.addEventListener( 'resize', setUiSize, false );

	//youtube visibility: take mouse off and it disappears. Don't move mouse for 3s, it disappears. Dunno about touchscreens
	//if you're paused it's only there if you move your mouse downt there
	var uiVisibilityTimerLength = 3;
	var uiVisibilityTimer = uiVisibilityTimerLength;

	ui.update = function()
	{
		if( mouse.clicking || mouse.justMoved )
		{
			uiVisibilityTimer = uiVisibilityTimerLength;
		}
		uiVisibilityTimer -= frameDelta;
		var uiVisibility = audio.paused || uiVisibilityTimer >= 0;

		background.visible = uiVisibility;
		playPauseButton.visible = uiVisibility;
		timeSlider.visible = uiVisibility;
		speedSlider.visible = uiVisibility;

		if(bufferedHighlights.length > audio.buffered.length)
		{
			for(var i = bufferedHighlights.length-1; i >= audio.buffered.length; i--)
			{
				timeSlider.remove(bufferedHighlights[i])
				delete bufferedHighlights[i];
			}
			bufferedHighlights.length = audio.buffered.length;
		}
		for(var i = 0, il = audio.buffered.length; i < il; i++)
		{
			if( bufferedHighlights.length <= i)
			{
				var bufferedHighlight = new THREE.Mesh( new THREE.PlaneBufferGeometry(1,1), bufferedMaterial);
				bufferedHighlight.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5,0,0))
				timeSlider.add( bufferedHighlight );
				bufferedHighlight.position.z = 0.00000001;
				
				bufferedHighlights.push(bufferedHighlight);
			}

			var start = getTimelinePositionFromTime(audio.buffered.start(i));
			var end = getTimelinePositionFromTime(audio.buffered.end(i));
			bufferedHighlights[i].scale.x = end-start;
			bufferedHighlights[i].position.x = start;
			if(bufferedHighlights[i].scale.x === 0)
			{
				bufferedHighlights[i].scale.x = 0.000001
			}
		}

		if( audio.paused )
		{
			playPauseButton.geometry.vertices[3].set(1,0,0);
			playPauseButton.geometry.vertices[7].set(1,0,0);
			playPauseButton.geometry.vertices[1].set(1,0,0);
			playPauseButton.geometry.vertices[2].set(1,0,0);
			playPauseButton.geometry.vertices[5].set(1,0,0);
			playPauseButton.geometry.vertices[6].set(1,0,0);
		}
		else
		{
			playPauseButton.geometry.vertices[1].set(-1/16,1,0);
			playPauseButton.geometry.vertices[2].set(1/16,1,0);
			playPauseButton.geometry.vertices[3].set(1,1,0);

			playPauseButton.geometry.vertices[5].set(-1/16,-1,0);
			playPauseButton.geometry.vertices[6].set(1/16,-1,0);
			playPauseButton.geometry.vertices[7].set(1,-1,0);
		}
		playPauseButton.geometry.verticesNeedUpdate = true;

		speedSlider.update();
		timeSlider.update();

		updateTimeSliderFromTime();
	}

	return ui;
}