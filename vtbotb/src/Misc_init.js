function initInit()
{
	var btFaces = Array(8);
	
	function loadFace(i)
	{
		var url = "Data/Misc textures/loading/" + i.toString() + ".png";
		texture_loader.load( url,
			function(texture) 
			{
				btFaces[i].material.map = texture;
				btFaces[i].textureLoaded = true;
				for(var j = 0; j < btFaces.length; j++)
				{
					if(!btFaces[j].textureLoaded)
						return;
				}
				console.log("gonna init")
				init();
			},
			function ( xhr ) {}, function (  )
			{
				console.error( "couldn't load texture with url ", url );
			} );
	}
	
	for(var i = 0; i < btFaces.length; i++)
	{
		btFaces[i] = new THREE.Mesh(new THREE.PlaneGeometry(playing_field_dimension, playing_field_dimension), new THREE.MeshBasicMaterial({transparent:true,opacity:0}));
		btFaces[i].textureLoaded = false;
		
		scene.add( btFaces[i] );
		
		loadFace(i);
	}
}

function init() 
{
	camera.position.z = min_cameradist;
	render();

	var treePic = document.getElementById("goToTreeElement");
	treePic.addEventListener('click', function(event) {
		//this needs more work
		event.preventDefault();
		var treeTimeStamps = [296.06,263.3,221.7,196.5, 219.9];
		ytplayer.seekTo( treeTimeStamps[ ytplayer.chapter ] );
	});
	treePic.addEventListener('mouseleave', function(event) {
		if(cursorIsHand)
			document.body.style.cursor = '-webkit-grab';
		else
			document.body.style.cursor = '';
	});
	
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