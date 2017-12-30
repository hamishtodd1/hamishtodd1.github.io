/*
	What are the editing controls you'd need? Remember a major point is that "effects" are done live, eg putting music over
	You're going to use keyboard shortcuts anyway so not much need for buttons
	The fundamental thing to imagine: a bunch of lines of different colors, parts of which you shall cut out and assemble into another line
	You can grab the ends and move them to change how much is there. Contract a line and it will "ripple" the gap shut
	Do want zooming and marks for seconds and minutes. And the ability to grab and move the timeline along
	Probably fine to only have editing be on the main timeline. So you start out by all the original pieces (possibly many copies) and putting them in order, then trimming them.
	Just display the pieces above the timeline, grab them when you please
	Probably want names for the various bits displayed on them

	timeline should be a nice relative-motion slider! Or not, because people are used to one thing
*/

function initUi(clickables, grabbables, audio, monitorer, recordedFrames)
{
	var ui = {};

	var timeline = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2), new THREE.MeshBasicMaterial({color:0x808080}));
	timeline.position.z = -camera.near*2;

	var background = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2), new THREE.MeshBasicMaterial({color:0xFFFFFF}));
	background.position.z = timeline.position.z - 0.0001;

	var timelineTracker = new THREE.Mesh(new THREE.CircleBufferGeometry(1,16), new THREE.MeshBasicMaterial({color:0xFF0000}));
	timelineTracker.position.z = timeline.position.z+0.00001;

	var playPauseButton = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0x00FF00}));
	for(var i = 0; i < 8; i++)
	{
		playPauseButton.geometry.vertices.push(new THREE.Vector3());
	}
	playPauseButton.position.z = timeline.position.z;
	playPauseButton.geometry.vertices[0].set(-1,1,0);
	playPauseButton.geometry.vertices[4].set(-1,-1,0);
	playPauseButton.geometry.faces.push(new THREE.Face3(0,4,1),new THREE.Face3(1,4,5),new THREE.Face3(2,6,3),new THREE.Face3(3,6,7));

	var speedline = timeline.clone();
	var speedlineTracker = timelineTracker.clone();

	camera.add(background);
	camera.add(playPauseButton);
	camera.add(timeline);
	camera.add(timelineTracker);
	camera.add(speedline);
	camera.add(speedlineTracker);

	function updateTrackerPositionFromTime()
	{
		var proportionThrough = recordedFrames ? audio.currentTime / recordedFrames[recordedFrames.length-1].frameTime : 0;
		timelineTracker.position.x = -timeline.scale.x + timeline.scale.x * 2 * proportionThrough;
	}

	function updateTimeFromTrackerPosition()
	{
		var proportionThrough = (timelineTracker.position.x + timeline.scale.x) / (timeline.scale.x * 2);
		audio.currentTime = proportionThrough * recordedFrames[recordedFrames.length-1].frameTime
		monitorer.dispense();
	}

	clickables.push(playPauseButton,timeline);
	grabbables.push(timelineTracker, speedlineTracker);

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

	speedlineTracker.postDragFunction = function(grabbedPoint)
	{
		speedlineTracker.position.y = speedline.position.y;
		var specifiedSpeedDifference = (speedlineTracker.position.x - speedline.position.x) / speedline.scale.x;
		if( specifiedSpeedDifference < -1 || 1 < specifiedSpeedDifference )
		{
			specifiedSpeedDifference = clamp(specifiedSpeedDifference,-1,1)
			speedlineTracker.position.x = speedline.position.x + specifiedSpeedDifference * speedline.scale.x;
		}
		if( Math.abs(specifiedSpeedDifference) < 0.1)
		{
			specifiedSpeedDifference = 0;
		}

		audio.playbackRate = Math.pow(2,specifiedSpeedDifference)
	}

	playPauseButton.onClick = function()
	{
		monitorer.togglePlaying();
	}

	monitorer.setUiSize = function()
	{
		var frameDimensions = frameDimensionsAtZDistance(-timeline.position.z);

		var distanceAboveBottom = frameDimensions.width * 0.05;

		timeline.scale.x = frameDimensions.width / 2 * 0.7;
		timeline.scale.y = timeline.scale.x / 30;
		timeline.scale.z = timeline.scale.y;

		playPauseButton.scale.setScalar(timeline.scale.y*3);
		playPauseButton.position.y = -frameDimensions.height / 2 + distanceAboveBottom;
		playPauseButton.position.x = -frameDimensions.width / 2 + (frameDimensions.width / 2-timeline.scale.x)/2;

		timeline.position.y = playPauseButton.position.y;

		timelineTracker.position.y = timeline.position.y;
		timelineTracker.scale.setScalar(timeline.scale.y * 1.9);

		background.position.copy(timeline.position);
		background.position.z -= 0.00001;
		background.scale.x = frameDimensions.width / 2;
		background.scale.y = distanceAboveBottom;

		speedline.position.copy(timeline.position);
		speedline.position.x = -playPauseButton.position.x;
		speedline.scale.x = playPauseButton.scale.x
		speedline.scale.y = timeline.scale.y;
		speedlineTracker.scale.copy(timelineTracker.scale);
		speedlineTracker.position.copy(speedline.position);
		speedlineTracker.position.z = timelineTracker.position.z;

		updateTrackerPositionFromTime()
	}
	monitorer.setUiSize();

	ui.update = function(recording, audio)
	{
		playPauseButton.visible = !recording;
		timeline.visible = !recording;
		timelineTracker.visible = !recording;

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