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
	
	Scene = new THREE.Scene();
	
	//FOV depends on whether you're talking VR
	Camera = new THREE.PerspectiveCamera( 90, //VERTICAL_FOV_VIVE, //mrdoob says 70. They seem to change it anyway...
			Renderer.domElement.width / Renderer.domElement.height, //window.innerWidth / window.innerHeight,
			0.001, 700);
	
	Scene.add(Camera);
	
	if ( WEBVR.isLatestAvailable() === false ){
		VRMODE = 0;
		//A cardboard user still counts as a lecturer. Nobody will want to spectate as cardboard, that will be vomit-inducing
	}
	else
	{
		OurVREffect = new THREE.VREffect( Renderer );
		OurVRControls = new THREE.VRControls( Camera );
		
		if ( WEBVR.isAvailable() === true )
			document.body.appendChild( WEBVR.getButton( OurVREffect ) );
		
		VRMODE = 1; //OR GOOGLE CARDBOARD TODO
		//TODO why wait for a button press?
	}
	
	var audioListener = new THREE.AudioListener();
	Camera.add( audioListener );
	indicatorsound = new THREE.Audio( audioListener );
	indicatorsound.load(
		'http://hamishtodd1.github.io/BrowserProsenter/Data/SineSound.wav'
	);
	indicatorsound.autoplay = true;
	indicatorsound.setLoop(true);
	
	
	Add_stuff_from_demo();
//	initVideo();
	
	//you can add other things to this
	var PreInitChecklist = {
		Downloads: Array()
	};
	
	var OurFontLoader = new THREE.FontLoader();
	OurFontLoader.load(  "gentilis.js", 
		function ( reponse ) { gentilis = reponse; },
		function ( xhr ) {},
		function ( xhr ) { console.error( "couldn't load font" ); }
	);
	
	//"grippable objects"
	var Models = Array();
	
	//Trp-Cage Miniprotein Construct TC5b, 20 residues: 1l2y. Rubisco: 1rcx. Insulin: 4ins
	Loadpdb("1L2Y", Models);
	Loadpdb("1L2Y", Models);
	
	var OurOBJLoader = new THREE.OBJLoader();
	OurOBJLoader.load( "http://hamishtodd1.github.io/BrowserProsenter/Data/vr_controller_vive_1_5.obj",
		function ( object ) { 
//			ControllerModel.geometry = object.geometry; 
//			ControllerModel.material = object.material;
			var Downloads = {};
			
			var Controllers = Array(2);
			Controllers[0] = new THREE.Mesh(object.children[0].geometry, new THREE.MeshPhongMaterial({color:0x000000}));
			Controllers[1] = new THREE.Mesh(object.children[0].geometry, new THREE.MeshPhongMaterial({color:0x000000}));
			Controllers[0].Gripping = 0;
			Controllers[1].Gripping = 0;
		
			Render(Models, Controllers, indicatorsound); // you have to list everything that goes in there? How about a while loop. 
		},
		function ( xhr ) {}, function ( xhr ) { console.error( "couldn't load OBJ" ); }
	);
});