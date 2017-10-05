function initInit()
{
	var supportsWebGL = ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )();

	if( !supportsWebGL )
	{
		var apologyImage = document.createElement("IMG");
		apologyImage.setAttribute('src', 'apology.jpg');
		apologyImage.setAttribute('height', renderer.domElement.width.toString() +'px');
		apologyImage.setAttribute('width', renderer.domElement.width.toString() +'px');
		
		targetDIV.removeChild(renderer.domElement);
		targetDIV.appendChild(apologyImage);
		return;
	}
	
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
					if( !btFaces[j].textureLoaded )
						return;
				}
				init();
			},
			function ( xhr ) {}, function (  )
			{
				console.error( "couldn't load texture with url ", url );
			} );
	}
	
	for(var i = 0; i < btFaces.length; i++)
	{
		btFaces[i] = new THREE.Mesh(new THREE.PlaneGeometry(playing_field_dimension/2, playing_field_dimension/2), new THREE.MeshBasicMaterial({transparent:true,opacity:0}));
		btFaces[i].textureLoaded = false;
		
		scene.add( btFaces[i] );
		
		loadFace(i);
	}
}

function init() 
{
	camera.position.z = min_cameradist;
	render();
	
	//-----properly initializing
	pentagonDemo.init();
	init_CK_and_irreg();
	initialize_QS_stuff();
	init_story();
	init_tree();
	init_bocavirus_stuff();
	
	load_AV_stuff();
	
	INITIALIZED = 1;
	attempt_launch();
}

function attempt_launch()
{
	if(  !PICTURES_LOADED || !INITIALIZED )
	{
		return;
	}
	
	ChangeScene(CK_MODE );
}