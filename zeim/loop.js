function loop( controllers, vrAndRecording )
{
	frameDelta = ourClock.getDelta();
	frameCount++;
	
	if( vrAndRecording )
	{
		updateVrInputSystem();
	}
	mouse.updateFromAsyncAndCheckClicks();

	/*
		One might like to change initial conditions then watch what I do.
			In principle, that would just mean not monitoring something
			That would mean: DO NOT record certain things, instead update them while the recording is playing
			But it is also important to be able to skip around the timeline
			Could simulate forward by going through what's happened in every frame.
			Could mark certain properties as "recalled if you skip to this point but not if you're simulating forward". That's a lot of work for yourself.
			It is REALLY UNAVOIDABLY COMPLEX to think about any kind of updating during playingtime. Consider that some things are inter-frame.
			Could record only controller input
			It obviously risks people seeing something you didn't intend
	*/

	respondToPlaybackControlInput();
	
	if( isRecordSynchable() && !hasStateBeenSynchronizedToCurrentTime() )
	{
		synchronizeState();
	}
	else
	{
		for(var i = 0; i < markedThingsToBeUpdated.length; i++)
		{
			markedThingsToBeUpdated[i].update();
		}
	}

	for(var i = 0, il = thingsToAlwaysBeUpdated.length; i < il; i++)
	{
		thingsToAlwaysBeUpdated[i].update();
	}

	if( vrAndRecording )
	{
		updateRecorder();
	}
}