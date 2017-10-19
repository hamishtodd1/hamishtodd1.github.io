/*
 * TODO for 3
 * video
 * make the magnesium very visible?
 * sand rises up
 * F5 to restart
 * 
 * TODO for midlothian
 * video, with explanation with stromata
 */

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
	
	document.body.appendChild( Renderer.domElement );
	
	Scene = new THREE.Scene();
	
	//Camera will be added to the scene when the user is set up
	Camera = new THREE.PerspectiveCamera( 70, //VERTICAL_FOV_VIVE, //mrdoob says 70. They seem to change it anyway...
			Renderer.domElement.width / Renderer.domElement.height, //window.innerWidth / window.innerHeight,
			0.001, 7000);
	
	Camera.position.copy(INITIAL_CAMERA_POSITION); //initial state subject to change! you may not want them on the floor. Owlchemy talked about this
	var fireplaceangle = msg.Master ? 0 : Math.PI; //called so because they're seated around it
	Camera.position.applyAxisAngle(Central_Y_axis,fireplaceangle);
	Camera.lookAt(new THREE.Vector3());
	
	Add_stuff_from_demo();
//	initVideo();
	
	//us. We'll be added to the user array soon. 
	//This is also the place where this object is "defined"
	InputObject.UserData.push({
		CameraPosition: new THREE.Vector3(),
		CameraQuaternion: new THREE.Quaternion(),
		
		HandPosition: new THREE.Vector3(0,-10000,0), //may get these from somewhere in future
		HandQuaternion: new THREE.Quaternion(),
		
		Gripping: 0,
		ID: msg.ID
	});
	
	//you can add other things to this
	var PreInitChecklist = {
		Downloads: Array()
	};
	
	OurVREffect = new THREE.VREffect( Renderer, Renderer.domElement );
	
	if ( WEBVR.isLatestAvailable() === false ){
//		document.body.appendChild( WEBVR.getMessage() );
	}
	else
	{
		OurVRControls = new THREE.VRControls( Camera,Renderer.domElement );
		if ( WEBVR.isAvailable() === true )
			document.body.appendChild( WEBVR.getButton( OurVREffect ) );
	}
	
	Download_initial_stuff(PreInitChecklist);
	
	add_static_scene_stuff();
	
});

function add_static_scene_stuff()
{
	//hack
	var FloorLoader = new THREE.TextureLoader();
	FloorLoader.crossOrigin = true;
	FloorLoader.load(
		"Data/Bryum_capillare_leaf_cells.jpg",
		function(texture) {
			
//			texture.magFilter = THREE.NearestFilter;
//			texture.minFilter = THREE.LinearMipMapLinearFilter;
			
			var floorwidth = 8;
			var FloorTile = new THREE.Mesh(
					new THREE.CubeGeometry(floorwidth, floorwidth, 0),
					new THREE.MeshBasicMaterial({map:texture}) );
			
			var CeilingTile = new THREE.Mesh(
					new THREE.CubeGeometry(floorwidth, floorwidth, 0),
					new THREE.MeshBasicMaterial({map:texture}) );
			
			var Walls1 = new THREE.Mesh(
					new THREE.CylinderGeometry(floorwidth / 3, floorwidth / 3, 6, 20, 1, true, 0, TAU / 2),
					new THREE.MeshBasicMaterial({map:texture, side:THREE.DoubleSide}) );
			
			var Walls2 = new THREE.Mesh(
					new THREE.CylinderGeometry(floorwidth / 3, floorwidth / 3, 6, 20, 1, true, TAU / 2, TAU / 2),
					new THREE.MeshBasicMaterial({map:texture, side:THREE.DoubleSide}) );
			
			FloorTile.material.map = texture;
			
			FloorTile.position.y = -1;
			CeilingTile.position.y = 2.5;
			Walls1.position.y = 1;
			Walls2.position.y = 1;
			
			FloorTile.lookAt(new THREE.Vector3())
			CeilingTile.lookAt(new THREE.Vector3())

			Scene.add(FloorTile);
			Scene.add(CeilingTile);
			Scene.add(Walls1);
			Scene.add(Walls2);
		},
		function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
	);
}

function PostDownloadInit(OurLoadedThings)
{		 
	var ControllerModel = OurLoadedThings[0].children[0];
	ControllerModel.visible = false;
	
	//"grippable objects"
	var Models = Array();
	
	Grain_of_sand = OurLoadedThings[2];
	Grain_of_sand.position.copy(sand_starting_position);
	Grain_of_sand.scale.set(1000,1000,1000)
	Scene.add(Grain_of_sand);
	
	RubiscoModel = OurLoadedThings[3];
	RubiscoModel.position.set(0, -0.1, 0);
	
	{
		RubiscoModel.children[15].material = new THREE.MeshPhongMaterial({color:0xF4927B});
		RubiscoModel.children[3].material = RubiscoModel.children[15].material;
		RubiscoModel.children[4].material = RubiscoModel.children[15].material;
		RubiscoModel.children[6].material = RubiscoModel.children[15].material;
		
		RubiscoModel.children[0].material = new THREE.MeshPhongMaterial({color:0xF4AE64});
		RubiscoModel.children[5].material = RubiscoModel.children[0].material;
		RubiscoModel.children[10].material = RubiscoModel.children[0].material;
		RubiscoModel.children[13].material = RubiscoModel.children[0].material;
		
		//front ring: 2, 7 are opposite, 8,
		RubiscoModel.children[2].material = new THREE.MeshPhongMaterial({color:0xC4E2FC});
		RubiscoModel.children[7].material = RubiscoModel.children[2].material;
		RubiscoModel.children[8].material = new THREE.MeshPhongMaterial({color:0xE4C6FC});
		RubiscoModel.children[12].material = RubiscoModel.children[8].material;
		
		//back ring
		RubiscoModel.children[9].material = new THREE.MeshPhongMaterial({color:0xC4E2FC});
		RubiscoModel.children[11].material = RubiscoModel.children[9].material;
		RubiscoModel.children[1].material = new THREE.MeshPhongMaterial({color:0xE4C6FC});
		RubiscoModel.children[14].material = RubiscoModel.children[1].material;
	}
	
	RubiscoModel.scale.multiplyScalar(0.002);
	console.log(RubiscoModel.children[0].geometry)
	var OurPDBLoader = new THREE.PDBLoader(); //or are you supposed to create these on the fly?
	OurPDBLoader.load( 'Data/rubps.pdb',
		function ( geometryAtoms, geometryBonds, json )
		{
			var MyGeometry = new THREE.Geometry();	
			var SphereRadius = 0.4;
			var TemplateAtomGeometry = new THREE.IcosahedronGeometry( 1.3,1 );
			
			MyGeometry.vertices = Array(geometryAtoms.vertices.length * TemplateAtomGeometry.vertices.length);
			MyGeometry.faces 	= Array(geometryAtoms.vertices.length * TemplateAtomGeometry.faces.length);
			
			for(var i = 0; i < rubps_colors.length; i++) {
				for( var j = 0; j < TemplateAtomGeometry.vertices.length; j++){
					MyGeometry.vertices[i * TemplateAtomGeometry.vertices.length + j] = new THREE.Vector3(
							TemplateAtomGeometry.vertices[j].x + rubps_positions[i].x,
							TemplateAtomGeometry.vertices[j].y + rubps_positions[i].y,
							TemplateAtomGeometry.vertices[j].z + rubps_positions[i].z);
				}
				
				for( var j = 0; j < TemplateAtomGeometry.faces.length; j++){			
					MyGeometry.faces[i * TemplateAtomGeometry.faces.length + j] = new THREE.Face3(
							TemplateAtomGeometry.faces[j].a + i * TemplateAtomGeometry.vertices.length,
							TemplateAtomGeometry.faces[j].b + i * TemplateAtomGeometry.vertices.length,
							TemplateAtomGeometry.faces[j].c + i * TemplateAtomGeometry.vertices.length,
							new THREE.Vector3(),
							rubps_colors[i],
							0 );
				}
			}
			
			MyGeometry.computeFaceNormals();
			MyGeometry.computeVertexNormals();
			
			var SpheresMaterial = new THREE.MeshPhongMaterial( { 
				specular: 0xffffff, 
				shininess: 100,
				vertexColors: THREE.VertexColors,
				shading: THREE.SmoothShading } );
			
		//		SpheresMesh.castShadow = true;
		//		SpheresMesh.receiveShadow = true;
		
			RubiscoModel.add( new THREE.Mesh( MyGeometry,SpheresMaterial ) );
			var offset = (Central_Z_axis.clone()).multiplyScalar(18);
			RubiscoModel.children[RubiscoModel.children.length - 1].position.add(offset);
//			RubiscoModel.children[RubiscoModel.children.length - 2].z = -1;
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load PDB" ); }
	);
	
//	Scene.add(indicatorsphere);
	
	Scene.add(RubiscoModel);
	
	Users = [];
	
	initRubiscoGame(Models);
	init_audio();
	
	Render(Models, Users, ControllerModel);
}