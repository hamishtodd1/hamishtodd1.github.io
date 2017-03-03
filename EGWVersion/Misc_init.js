function init() {
	init_hexagon_demo();
	init_CK_and_irreg();
	initialize_QS_stuff();
	init_Grabbable_Arrow();
	init_story();
	
	INITIALIZED = 1;
	attempt_launch();
}

function attempt_launch()
{
	if( !INITIALIZED || !PICTURES_LOADED || !YOUTUBE_READY )
		return;
	
	ChangeScene(MODE);
	
	//------------------need this so there's something in there for the first frame
	ourclock.getDelta();
//	ytplayer.seekTo( 311 );
	render();
}