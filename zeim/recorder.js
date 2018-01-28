function initRecorder(socket, audio, 
	recordedFrames, markedObjectsAndProperties, markedQuaternions)
{
	var recording = false;

	function sendOffRecordedFramesAsSignalForAudioReplacement()
	{
		socket.send( JSON.stringify(recordedFrames) );
	}

	function toggleRecording()
	{
		if(!recording)
		{
			recording = true;

			audio.pause();
			audio.currentTime = 0;
			
			audioRecorder.startRecording();

			recordingTime = 0;
			recordedFrames.length = 0;
			console.log("rolling");
		}
		else
		{
			recording = false;
			console.log("cut. Saving");
			audioRecorder.stopRecording();
			audioRecorder.sendRecording();

			sendOffRecordedFramesAsSignalForAudioReplacement()
		}
	}

	document.addEventListener( 'contextmenu', function(event)
	{
		//right click because keyboard briefly makes it so mousedown is not called!
		event.preventDefault();
		recordingToggled = true;
	});
	document.addEventListener( 'keydown', function(event)
	{
		if( event.keyCode === 83 ) //s to resend recording
		{
			event.preventDefault();
			sendOffRecordedFramesAsSignalForAudioReplacement();
		}
	});

	socket.onmessage = function(msg)
	{
		if(msg.data === "oldAudioDeleted")
		{
			if(recording)
			{
				toggleRecording();
			}
		}
		if(msg.data === "audioDeletionDenied")
		{
			console.error("couldn't delete audio. Try again")
		}
	}

	function recordState()
	{
		var newFrame = {};
		newFrame.frameTime = recordingTime;

		newFrame.objectPropertyData = Array( markedObjectsAndProperties.length );
		newFrame.quaternionData = Array( markedQuaternions.length );

		for(var i = 0, il = markedObjectsAndProperties.length; i < il; i++)
		{
			newFrame.objectPropertyData[i] = markedObjectsAndProperties[i].object[ markedObjectsAndProperties[i].property ];
		}
		for(var i = 0, il = markedQuaternions.length; i < il; i++)
		{
			newFrame.quaternionData[i] = markedQuaternions[i].toArray();
		}

		recordedFrames.push(newFrame);

		recordingTime += frameDelta;
	}

	var audioRecorder = initAudioRecorder(audio);

	var recording = false;
	var recordingTime = 0;

	var recordingToggled = false;

	updateRecorder = function()
	{
		if( recordingToggled)
		{
			toggleRecording();
			recordingToggled = false;
		}

		if(recording)
		{
			console.assert(audio.paused)
			recordState();
		}
	}

	unmarkedThingsToBeUpdated.push( recorder );
}