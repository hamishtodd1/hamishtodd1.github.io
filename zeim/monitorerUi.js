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

function initUi(clickables, grabbables, audio, monitorer, recordedFrames)
{
	var ui = {};

	var timeline = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2), new THREE.MeshBasicMaterial({color:0xDADADA}));
	timeline.position.z = -camera.near*2;
	camera.add(timeline);

	var background = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2), new THREE.MeshBasicMaterial({color:0xFAFAFA}));
	background.position.z = timeline.position.z - 0.0001;
	camera.add(background);

	var timelineTracker = new THREE.Mesh(new THREE.CircleBufferGeometry(1,32), new THREE.MeshBasicMaterial({color:0x298AF1}));
	timelineTracker.position.z = timeline.position.z+0.00001;
	camera.add(timelineTracker);

	var speedline = timeline.clone();
	camera.add(speedline);

	var speedlineTracker = timelineTracker.clone();
	camera.add(speedlineTracker);

	var bufferedHighlights = [];
	var bufferedMaterial = timeline.material.clone();
	bufferedMaterial.color.multiplyScalar(0.85);

	var playPauseButton = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0x5A5A5A}));
	for(var i = 0; i < 8; i++)
	{
		playPauseButton.geometry.vertices.push(new THREE.Vector3());
	}
	playPauseButton.position.z = timeline.position.z;
	playPauseButton.geometry.vertices[0].set(-1,1,0);
	playPauseButton.geometry.vertices[4].set(-1,-1,0);
	playPauseButton.geometry.faces.push(new THREE.Face3(0,4,1),new THREE.Face3(1,4,5),new THREE.Face3(2,6,3),new THREE.Face3(3,6,7));
	camera.add(playPauseButton);

	clickables.push(playPauseButton, timeline);
	grabbables.push(timelineTracker, speedlineTracker);

	function timelinePositionFromTime(time)
	{
		var proportionThrough = recordedFrames ? time / recordedFrames[recordedFrames.length-1].frameTime : 0;
		return -timeline.scale.x + timeline.scale.x * 2 * proportionThrough;
	}

	function updateTrackerPositionFromTime()
	{
		timelineTracker.position.x = timelinePositionFromTime( audio.currentTime )
	}

	function updateTimeFromTrackerPosition()
	{
		var proportionThrough = (timelineTracker.position.x + timeline.scale.x) / (timeline.scale.x * 2);
		audio.currentTime = proportionThrough * recordedFrames[recordedFrames.length-1].frameTime
		monitorer.dispense();
	}

	timelineTracker.postDragFunction = function(grabbedPoint)
	{
		timelineTracker.position.y = timeline.position.y;
		updateTimeFromTrackerPosition();
	}

	timeline.onClick = function(worldSpaceLocation)
	{
		timelineTracker.position.x = worldSpaceLocation.x;
		updateTimeFromTrackerPosition();
	}

	function updateSpeedlineTrackerFromPlaybackRate()
	{
		var specifiedSpeedDifference = Math.log2( audio.playbackRate );

		speedlineTracker.position.x = speedline.position.x + specifiedSpeedDifference * speedline.scale.x;
	}

	speedlineTracker.postDragFunction = function(grabbedPoint)
	{
		speedlineTracker.position.y = speedline.position.y;

		var specifiedSpeedDifference = (speedlineTracker.position.x - speedline.position.x) / speedline.scale.x;
		if( specifiedSpeedDifference < -1 || 1 < specifiedSpeedDifference )
		{
			specifiedSpeedDifference = clamp(specifiedSpeedDifference,-1,1)
		}

		audio.playbackRate = Math.pow(2,specifiedSpeedDifference)

		updateSpeedlineTrackerFromPlaybackRate();

		//bit deceptive but whatever. Nice because lerps will look bad at anything other than the native framerate
		if(Math.abs(audio.playbackRate - 1) < 0.1)
		{
			audio.playbackRate = 1;
		}
	}

	playPauseButton.onClick = function()
	{
		monitorer.togglePlaying();
	}

	monitorer.setUiSize = function()
	{
		var frameDimensions = frameDimensionsAtZDistance(-timeline.position.z);

		var height = frameDimensions.width * 0.05;
		//TODO aspect ratio logic

		timeline.scale.x = ( frameDimensions.width - height * 16/9 * 2 ) / 2;
		timeline.scale.y = height * 0.1;
		timeline.scale.z = timeline.scale.y;

		playPauseButton.scale.setScalar(height/2*0.8);
		playPauseButton.position.y = -frameDimensions.height / 2 + height / 2;
		playPauseButton.position.x = -frameDimensions.width / 2 + (frameDimensions.width / 2-timeline.scale.x)/2;

		timeline.position.y = playPauseButton.position.y;

		timelineTracker.position.y = timeline.position.y;
		timelineTracker.scale.setScalar(timeline.scale.y * 1.6);
		updateTrackerPositionFromTime();

		background.position.copy(timeline.position);
		background.position.z -= 0.00001;
		background.scale.x = frameDimensions.width / 2;
		background.scale.y = height / 2;

		speedline.position.copy(timeline.position);
		speedline.position.x = -playPauseButton.position.x;
		speedline.scale.x = playPauseButton.scale.x;
		speedline.scale.y = timeline.scale.y;
		speedlineTracker.scale.copy(timelineTracker.scale);
		speedlineTracker.position.z = timelineTracker.position.z;
		speedlineTracker.position.y = speedline.position.y;
		updateSpeedlineTrackerFromPlaybackRate();
	}
	monitorer.setUiSize();

	ui.update = function(recording, audio)
	{
		//youtube visibility: take mouse off and it disappears. Don't move mouse for 3s, it disappears. Dunno about touchscreens

		background.visible = !recording; //also if the mouse isn't towards the bottom?
		playPauseButton.visible = background.visible;
		timeline.visible = background.visible;
		timelineTracker.visible = background.visible;
		speedline.visible = background.visible;
		speedlineTracker.visible = background.visible;

		if(bufferedHighlights.length > audio.buffered.length)
		{
			for(var i = bufferedHighlights.length-1; i >= audio.buffered.length; i--)
			{
				scene.remove(bufferedHighlights[i])
				delete bufferedHighlights[i];
			}
			bufferedHighlights.length = audio.buffered.length;
		}
		for(var i = 0, il = audio.buffered.length; i < il; i++)
		{
			if( bufferedHighlights.length <= i)
			{
				var bufferedHighlight = new THREE.Mesh( new THREE.PlaneBufferGeometry(2,2), bufferedMaterial);
				camera.add( bufferedHighlight );
				bufferedHighlight.position.z = ( timeline.position.z + timelineTracker.position.z ) / 2;
				
				bufferedHighlights.push(bufferedHighlight);
			}
			var start = timelinePositionFromTime(audio.buffered.start(i));
			var end = timelinePositionFromTime(audio.buffered.end(i));

			// var start = timelinePositionFromTime(0);
			// var end = timelinePositionFromTime(5);
			// console.log(start,end, timeline.scale.x)

			bufferedHighlights[i].scale.x = (end-start)/2
			bufferedHighlights[i].scale.y = timeline.scale.y;
			bufferedHighlights[i].position.x = (start+end)/2;
			bufferedHighlights[i].position.y = timeline.position.y;
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

		updateTrackerPositionFromTime();
	}

	return ui;
}