function initRecordingSystem(
	audio, recordedFrames, 
	markedObjectsAndProperties, markedQuaternions,
	socket)
{
	var recording = false;

	var recordSyncability = null;
	isRecordSynchable = function()
	{
		if( recordSyncability === null)
		{
			recordSyncability = true;
			var errorMessage = "Detected discrepancy with record. Will not play. Culprit:";
			if(	recordedFrames[0].quaternionData.length 	!== markedQuaternions.length
			 || recordedFrames[0].objectPropertyData.length !== markedObjectsAndProperties.length )
			{
				recordSyncability = false;
				console.error( errorMessage, "change of markings" )
			}
			else
			{
				for(var i = 0; i < recordedFrames[0].objectPropertyData.length; i++ )
				{
					//we expect all these to be the initial states
					if( markedObjectsAndProperties[i].object[ markedObjectsAndProperties[i].property ] !== recordedFrames[0].objectPropertyData[i] )
					{
						// recordSyncability = false;
						// console.error( errorMessage,
						// 	"discrepancy with initial state: ",
						// 	markedObjectsAndProperties[i].object,
						// 	markedObjectsAndProperties[i].property,

						// 	markedObjectsAndProperties[i].object[ markedObjectsAndProperties[i].property ],
						// 	recordedFrames[0].objectPropertyData[i]
						//  )
					}
				}
			}

			//rotation, quaternion, matrix
			//you can change them during the frame, but are you sure what is seen during recording is what is seen in re
			//you have to decide what you should monitor here. Think about this later
			//quaternion is objectively the best because slerp

			if(!recordSyncability)
			{
				audio.pause();
			}
		}

		return recordSyncability;
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

			socket.send( "delete" );

			recordSyncability = true;
		}
	}

	document.addEventListener( 'contextmenu', function(event) //right click because keyboard briefly makes it so mousedown is not called!
	{
		event.preventDefault();
		recordingToggled = true;
	});

	socket.onmessage = function(msg)
	{
		if(msg.data === "oldAudioDeleted")
		{
			var data = new Blob([JSON.stringify(recordedFrames)], {type: 'text/plain'});
			var textFile = window.URL.createObjectURL(data);

			var downloadObject = document.createElement("a");
			document.body.appendChild(downloadObject);
			downloadObject.style = "display: none";
			downloadObject.href = textFile;
			downloadObject.download = "record";
			downloadObject.click();

			audioRecorder.sendRecording();
		}
		if(msg.data === "deletionDenied")
		{
			console.error("couldn't delete? use below in emergency")
			GLOBAL_RECORDED_FRAMES = recordedFrames;
			GLOBAL_AUDIO = audio;
		}
	}

	function recordState()
	{
		var newFrame = {};
		newFrame.frameTime = recordingTime;
		console.log(newFrame.frameTime)

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
		//TODO use ourClock
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
}