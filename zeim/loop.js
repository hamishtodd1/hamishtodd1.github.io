function loop( controllers )
{
	frameDelta = ourClock.getDelta();
	frameTime += frameDelta;
	frameCount++;
	
	if( RUNNING_LOCALLY )
	{
		updateVrInputSystem();
	}
	mouse.updateFromAsyncAndCheckClicks();

	updatePlaybackSystem();
	if( RUNNING_LOCALLY )
	{
		updateRecorder();
	}
}