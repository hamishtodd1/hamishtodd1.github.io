function init() 
{
	scene.add(new THREE.Mesh(new THREE.PlaneGeometry(4,0.2), new THREE.MeshBasicMaterial({color:0xFF0000})));
	scene.add(new THREE.Mesh(new THREE.PlaneGeometry(4.09,0.29), new THREE.MeshBasicMaterial({color:0xCCCCCC})));
	scene.children[1].position.z = -0.001;
	camera.position.z = min_cameradist;
	render();

	
	//-----properly initializing
	pentagonDemo.init();
	init_CK_and_irreg();
	initialize_QS_stuff();
	init_story();
	init_tree();
	init_bocavirus_stuff();
	
	load_AV_stuff(); //TODO the above took 0.9 seconds on Rory's laptop
	
	INITIALIZED = 1;
	attempt_launch();
}

function attempt_launch()
{
	if( !PICTURES_LOADED || !YOUTUBE_READY )
		return;
	
	if( !INITIALIZED )
	{
		console.error("everything loaded but we didn't initialize?");
		return;
	}
	
	/*
	 * Don't worry about having the loading as a percentage - have it as a geometrical object.
	 * Do load a canvas, because we should be checking for webgl first.
	 * 
	 * There's an argument for only loading those of the current youtube video
	 * 
	 * Really you want the youtube stuff to begin coming in after you have a loading picture up
	 */
}