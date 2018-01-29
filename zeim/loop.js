function loop( controllers )
{
	frameDelta = ourClock.getDelta();
	frameTime += frameDelta;
	frameCount++;
	
	if( FULL_SETUP )
	{
		updateVrInputSystem();
	}
	mouse.updateFromAsyncAndCheckClicks();

	playShowOrUpdateObjects();
	if( FULL_SETUP )
	{
		updateRecorder();
	}
}