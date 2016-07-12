function init() {
	init_CK_and_irreg();
	initialize_QS_stuff();	
	initialize_protein();
	init_DNA_cage();
	
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