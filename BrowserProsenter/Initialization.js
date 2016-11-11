//the first init
socket.on('OnConnect_Message', function(msg)
{
	Master = msg.Master;
	if(msg.Master)
		console.log("Master");
	else
		console.log("Not master");
	
	var Renderer = new THREE.WebGLRenderer({ antialias: true }); //antialiasing would be nice and we're only aiming for 30fps
	Renderer.setClearColor( 0x101010 );
	Renderer.setPixelRatio( window.devicePixelRatio );
	Renderer.setSize( window.innerWidth, window.innerHeight );
	Renderer.sortObjects = false;
	Renderer.shadowMap.enabled = true;
	Renderer.shadowMap.cullFace = THREE.CullFaceBack;
	document.body.appendChild( Renderer.domElement );
		
//	var HORIZONTAL_FOV_OCULUS = 110;
	var HORIZONTAL_FOV_VIVE = 110;
//	var HORIZONTAL_FOV_GEAR = 110;
//	var HORIZONTAL_FOV_STAR = 110;
//	
//	var ASPECT_OCULUS = 
	var EYE_PIXELS_HORIZONTAL_VIVE = 1080;
	var EYE_PIXELS_VERTICAL_VIVE = 1200;
	var EYE_ASPECT_VIVE = EYE_PIXELS_HORIZONTAL_VIVE/EYE_PIXELS_VERTICAL_VIVE;
	
	var VERTICAL_FOV_VIVE = HORIZONTAL_FOV_VIVE / EYE_ASPECT_VIVE;
	
	/* Scratch the below, probably, it's vertical that you input.
	 * 
	 * Horizontal FOV (subject to update):
	 * 
	 * Oculus: 110
	 * Vive: 110
	 * GearVR: 96
	 * Google Cardboard: 90
	 * StarVR: 210
	 * 
	 */
	
	Scene = new THREE.Scene();
	
	//Camera will be added to the scene when the user is set up
	Camera = new THREE.PerspectiveCamera( 90, //VERTICAL_FOV_VIVE, //mrdoob says 70. They seem to change it anyway...
			Renderer.domElement.width / Renderer.domElement.height, //window.innerWidth / window.innerHeight,
			0.001, 700);
	
	Camera.position.copy(INITIAL_CAMERA_POSITION); //initial state subject to change! you may not want them on the floor. Owlchemy talked about this
	var fireplaceangle = msg.Master ? 0 : Math.PI; //called so because they're seated around it
	Camera.position.applyAxisAngle(Central_Y_axis,fireplaceangle);
	Camera.lookAt(new THREE.Vector3());
	
	OurVREffect = new THREE.VREffect( Renderer );
	console.log(Camera.fov)
	
	if ( WEBVR.isLatestAvailable() === false ){
//		document.body.appendChild( WEBVR.getMessage() );
	}
	else
	{
		//This is where the split could get more fundamental. Many things to take into account: it may be a google cardboard.
		OurVRControls = new THREE.VRControls( Camera,Renderer.domElement );
		if ( WEBVR.isAvailable() === true )
			document.body.appendChild( WEBVR.getButton( OurVREffect ) );
	}
	
	Add_stuff_from_demo();
//	initVideo();
	
	//us. We'll be added to the user array soon, in the way everyone else is.
	//This is also the place where the user object is defined
	InputObject.UserData.push({
		CameraPosition: new THREE.Vector3(),
		CameraQuaternion: new THREE.Quaternion(),
		
		HandPosition: new THREE.Vector3(0,-10000,0), //By default it's offscreen.
		HandQuaternion: new THREE.Quaternion(),
		
		Gripping: 0,
		ID: msg.ID
	});
	
	//you can add other things to this
	var PreInitChecklist = {
		Downloads: Array()
	};
	
	var ControllerModel = new THREE.Mesh(new THREE.Geometry, new THREE.MeshPhongMaterial({color:0x000000})); //material thing needed?
	var OurOBJLoader = new THREE.OBJLoader();
	OurOBJLoader.load( "http://hamishtodd1.github.io/BrowserProsenter/Data/vr_controller_vive_1_5.obj",
		function ( object ) { ControllerModel.geometry = object.geometry; ControllerModel.material = object.material; },
		function ( xhr ) {}, function ( xhr ) { console.error( "couldn't load OBJ" ); }
	);
	
	var OurFontLoader = new THREE.FontLoader();
	OurFontLoader.load(  "gentilis.js", 
		function ( reponse ) { gentilis = reponse; },
		function ( xhr ) {},
		function ( xhr ) { console.error( "couldn't load font" ); }
	);
	
	//"grippable objects"
	var Models = Array();
	Loadpdb("1L2Y", Models);
	
	var Users = Array();
	
	Render(Models, Users, ControllerModel); // you have to list everything that goes in there? How about a while loop
});

function get_NGL_protein()
{
	var xhr = new XMLHttpRequest();
	xhr.open( "GET", "http://mmtf.rcsb.org/v0.2/full/1L2Y", true );
	xhr.addEventListener( 'load', function( event ){
		var blob = new Blob( [ xhr.response ], { type: 'application/octet-binary'} );
		
//		stage.loadFile( blob, {
//				ext: "pdb", defaultRepresentation: true
//		} ).then( function( o ){
//			var rep_name = "surface";
//			o.addRepresentation( rep_name );
//			console.log(o)
//			loose_surface = o.reprList[ o.reprList.length - 1 ].repr;
//			if( rep_name === "surface")
//				stage.tasks.onZeroOnce( placeholder_interpret_ngl );
////			if( rep_name === "ribbon")
////				stage.tasks.onZeroOnce( placeholder_interpret_ngl_ribbon );
//			
//			//we would like to know when it has finished making its representation and call the code currently in input			
//		} );
		
		stage.loadFile( blob, {
				ext: "mmtf", defaultRepresentation: true
		} ).then( function( o ){
			o.addRepresentation( "surface" );
			console.log(o.reprList);
			loose_surface = o.reprList[3].repr;
//			stage.tasks.onZeroOnce( placeholder_interpret_ngl );
			
			//we would like to know when it has finished making its representation and call the code currently in input			
		} );
	} );
	xhr.responseType = "arraybuffer";
	xhr.send( null );
}