//this only interacts with anything via audio.currentTime

function initStateSynchronization(audio,
	recordedFrames, markedObjectsAndProperties, markedQuaternions)
{
	var lastTimeReadFrom = null;

	hasStateBeenSynchronizedToCurrentTime = function()
	{
		return audio.currentTime === lastTimeReadFrom;
	}

	synchronizeState = function()
	{
		lastTimeReadFrom = audio.currentTime;

		var frameJustBefore = getIndexOfFrameJustBeforeTime(lastTimeReadFrom);
		var frameJustAfter = frameJustBefore + 1;
		if( frameJustAfter > recordedFrames.length-1 )
		{
			console.log("recording end reached")
			audio.pause()
			audio.currentTime = 0;
			return;
		}

		var lerpValue = ( lastTimeReadFrom - recordedFrames[frameJustBefore].frameTime ) / (recordedFrames[frameJustAfter].frameTime - recordedFrames[frameJustBefore].frameTime);
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
}