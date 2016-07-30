function init() {
	init_CK_and_irreg();
	initialize_QS_stuff();
	init_Grabbable_Arrow();
	init_DNA_cage();
	init_story();
	
	//------------------need this so there's something in there for the first frame
	ourclock.getDelta();
	
	INITIALIZED = 1;
	attempt_launch();
}

function attempt_launch()
{
	if( !INITIALIZED || !PICTURES_LOADED || !YOUTUBE_READY )
		return;
	ChangeScene(MODE);
	render();
}