//the first init
socket.on('OnConnect_Message', function(msg)
{	
	var Renderer = new THREE.WebGLRenderer({ antialias: true }); //antialiasing would be nice and we're only aiming for 30fps
	Renderer.setClearColor( 0x101010 );
	Renderer.setPixelRatio( window.devicePixelRatio );
	Renderer.setSize( window.innerWidth, window.innerHeight );
	Renderer.sortObjects = false;
	Renderer.shadowMap.enabled = true;
	Renderer.shadowMap.cullFace = THREE.CullFaceBack;
	document.body.appendChild( Renderer.domElement );
	window.addEventListener( 'resize', function(){
		console.log("resizing")
	    Renderer.setSize( window.innerWidth, window.innerHeight );
	    Camera.aspect = window.innerWidth / window.innerHeight;
	    Camera.updateProjectionMatrix();
	}, false );
	
	Scene = new THREE.Scene();
	
	//FOV should depend on whether you're talking VR
	Camera = new THREE.PerspectiveCamera( 50, //will be changed by VR
			Renderer.domElement.width / Renderer.domElement.height, //window.innerWidth / window.innerHeight,
			0.001, 700);
	spectatorScreenIndicator = new THREE.Line(new THREE.Geometry());
	for(var i = 0; i < 4; i++)
		spectatorScreenIndicator.geometry.vertices.push(new THREE.Vector3());
	spectatorScreenIndicator.visible = false;
	Camera.add( spectatorScreenIndicator );
	Scene.add(Camera);
	
	VRMODE = 0;
	OurVREffect = new THREE.VREffect( Renderer );
	OurVRControls = new THREE.VRControls( Camera );
	
	var audioListener = new THREE.AudioListener();
//	Camera.add( audioListener );
	indicatorsound = new THREE.Audio( audioListener );
//	indicatorsound.load(
//		'http://hamishtodd1.github.io/BrowserProsenter/Data/SineSound.wav'
//	);
//	indicatorsound.autoplay = true;
//	indicatorsound.setLoop(true);
	
	Add_stuff_from_demo();
	
	var OurFontLoader = new THREE.FontLoader();
	OurFontLoader.load(  "gentilis.js", 
		function ( reponse ) { gentilis = reponse; },
		function ( xhr ) {},
		function ( xhr ) { console.error( "couldn't load font" ); }
	);
	
	//"grippable objects"
	var Models = Array();
	
	//Rubisco: 1rcx. Insulin: 4ins. Trp-Cage Miniprotein Construct TC5b, 20 residues: 1l2y
	putModelInScene("1L2Y", Models);
	putModelInScene("1L2Y", Models);
	
	var Controllers = Array(2);
	for(var i = 0; i < 2; i++)
	{
		Controllers[ i ] = new THREE.Mesh( new THREE.Geometry(), new THREE.MeshPhongMaterial({color:0x000000}));
		Controllers[ i ].Gripping = 0;
		Scene.add( Controllers[ i ] );
	}
	var handModelLink = "http://hamishtodd1.github.io/BrowserProsenter/Data/glove.obj"
	if ( WEBVR.isAvailable() === true ) //Hah and when all browsers have VR?
	{
		//actually people might want to spectate in google cardboard
		//you just need to move the hands to be in the right position relative to wherever they're looking
		document.body.appendChild( WEBVR.getButton( OurVREffect ) );
		spectatorScreenIndicator.visible = true;
		spectatorScreenIndicator.frustumCulled = false;
		handModelLink = "http://hamishtodd1.github.io/BrowserProsenter/Data/external_controller01_left.obj"
	}
	var OurOBJLoader = new THREE.OBJLoader();
	OurOBJLoader.load( handModelLink,
		function ( object ) 
		{
			Controllers[ RIGHT_CONTROLLER_INDEX ].geometry = object.children[0].geometry;
			Controllers[ RIGHT_CONTROLLER_INDEX ].scale.x *= -1;
			Controllers[ RIGHT_CONTROLLER_INDEX ].material.side = THREE.BackSide;
			Controllers[1-RIGHT_CONTROLLER_INDEX].geometry = object.children[0].geometry;
		},
		function ( xhr ) {}, function ( xhr ) { console.error( "couldn't load OBJ" ); } );
	
	Render(Models, Controllers, indicatorsound);
});

function putModelInScene(linkstring, Models)
{
	if(linkstring.length === 4)
	{
		var OurPDBLoader = new THREE.PDBLoader();
		
		linkstring = "http://files.rcsb.org/download/" + linkstring + ".pdb"
		
		OurPDBLoader.load(linkstring,
			function ( geometryAtoms, geometryBonds, json ) {
				Models.push( Create_first_model( geometryAtoms ) ); //they're just objects in the array
				
				var thisModelIndex = Models.length - 1;
				
				Models[thisModelIndex].position.z = -0.3;
				var initial_model_spacing = 0.4;
				Models[thisModelIndex].position.x = thisModelIndex * initial_model_spacing;
				
				inputObject.modelStates[thisModelIndex] = {
						position: Models[thisModelIndex].position.clone(), 
						quaternion: Models[thisModelIndex].quaternion.clone()
					};
				
				Scene.add( Models[thisModelIndex]);
				
				Make_collisionbox( Models[thisModelIndex] );
			},
			function ( xhr ) {}, //progression function
			function ( xhr ) { console.error( "couldn't load PDB" ); }
		);
	}
}

function Make_collisionbox(Model)
{
	Model.children[0].BoundingBoxAppearance = new THREE.BoxHelper(Model.children[0]);
	if(debugging)
		Model.children[0].BoundingBoxAppearance.visible = true;
	else
		Model.children[0].BoundingBoxAppearance.visible = false;
	
	Scene.add( Model.children[0].BoundingBoxAppearance );
}