/*
	What are the editing controls you'd need? Remember a major point is that "effects" are done live, eg putting music over
	You're going to use keyboard shortcuts anyway so not much need for buttons
	The fundamental thing to imagine: a bunch of lines of different colors, parts of which you shall cut out and assemble into another line
	You can grab the ends and move them to change how much is there. Contract a line and it will "ripple" the gap shut
	Do want zooming and marks for seconds and minutes. And the ability to grab and move the timeline along
	Probably fine to only have editing be on the main timeline. So you start out by all the original pieces (possibly many copies) and putting them in order, then trimming them.
	Just display the pieces above the timeline, grab them when you please
	Probably want names for the various bits displayed on them

	audio.buffered() returns something you can use. need to think about autoplay

	timeline should be a nice relative-motion slider! Or not, because people are used to one thing
*/

function initUi(clickables, audio, monitorer, recordedFrames)
{
	var ui = {};

	var background = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2), new THREE.MeshBasicMaterial({color:0xFAFAFA, transparent:true, opacity:0.77}));
	background.position.z = -spectatorCamera.near*2;
	spectatorCamera.add(background);

	var playPauseButton = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0x5A5A5A}));
	ui.playPauseButton = playPauseButton;
	for(var i = 0; i < 8; i++)
	{
		playPauseButton.geometry.vertices.push(new THREE.Vector3());
	}
	playPauseButton.position.z = background.position.z + 0.0001;
	playPauseButton.geometry.vertices[0].set(-1,1,0);
	playPauseButton.geometry.vertices[4].set(-1,-1,0);
	playPauseButton.geometry.faces.push(new THREE.Face3(0,4,1),new THREE.Face3(1,4,5),new THREE.Face3(2,6,3),new THREE.Face3(3,6,7));
	spectatorCamera.add(playPauseButton);
	clickables.push(playPauseButton);

	{
		function updateTimeFromSlider(valueBetweenZeroAndOne)
		{
			audio.currentTime = valueBetweenZeroAndOne * recordedFrames[recordedFrames.length-1].frameTime; //or audio length?
			monitorer.dispense();
		}
		function onTimeTrackerGrab()
		{
			audio.pause();
		}
		var timeSlider = SliderSystem(updateTimeFromSlider, 0, clickables,onTimeTrackerGrab);
		spectatorCamera.add(timeSlider);
		timeSlider.position.z = playPauseButton.position.z

		function getTimelinePositionFromTime(time)
		{
			return recordedFrames ? time / recordedFrames[recordedFrames.length-1].frameTime : 0;
		}

		function updateTimeSliderFromTime()
		{
			timeSlider.setValue( getTimelinePositionFromTime( audio.currentTime ) )
		}

		var bufferedHighlights = [];
		var bufferedMaterial = timeSlider.material.clone();
		bufferedMaterial.color.multiplyScalar(0.85);
	}

	{
		function updateSpeedFromSlider(valueBetweenZeroAndOne)
		{
			audio.playbackRate = Math.pow(2,valueBetweenZeroAndOne * 2 - 1)

			//lerps will look bad at anything other than the native framerate
			//this is not reflected in the tracker position. But if it was it would be more complex to allow you to move away from this
			if(Math.abs(audio.playbackRate - 1) < 0.1)
			{
				audio.playbackRate = 1;
			}
		}
		var speedSlider = SliderSystem(updateSpeedFromSlider, 0.5, clickables);
		spectatorCamera.add(speedSlider);
		speedSlider.position.z = playPauseButton.position.z
	}

	playPauseButton.onClick = function()
	{
		monitorer.togglePlaying();
	}

	monitorer.setUiSize = function()
	{
		var frameDimensions = frameDimensionsAtZDistance(spectatorCamera,-playPauseButton.position.z);

		var height = frameDimensions.width * 0.1;

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

	{
		//youtube visibility: take mouse off and it disappears. Don't move mouse for 3s, it disappears. Dunno about touchscreens
		//if you're paused it's only there if you move your mouse downt there
		var uiVisibilityTimeout = 3;
		var uiVisibilityTimer = uiVisibilityTimeout;

		document.addEventListener( 'mousemove', function(event)
		{
			event.preventDefault();
			background.visible = true;
			uiVisibilityTimer = uiVisibilityTimeout;
		}, false );
	}

	ui.update = function(recording, audio)
	{
		if( mouse.clicking )
		{
			uiVisibilityTimer = uiVisibilityTimeout;
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

		if(!audio.paused)
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

		speedSlider.update();
		timeSlider.update();

		updateTimeSliderFromTime();
	}

	return ui;
}