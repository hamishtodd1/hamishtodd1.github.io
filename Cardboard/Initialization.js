function Initialize()
{
	Renderer = new THREE.WebGLRenderer({  }); //antialiasing would be nice and we're only aiming for 30fps
	Renderer.setClearColor( 0x101010 );
	Renderer.setPixelRatio( window.devicePixelRatio );
	Renderer.setSize( window.innerWidth, window.innerHeight );
	Renderer.sortObjects = false;
	Renderer.shadowMap.cullFace = THREE.CullFaceBack;
	document.body.appendChild( Renderer.domElement );
	
	Scene = new THREE.Scene();
	
	console.error(stage)
	
	//Camera will be added to the scene when the user is set up
	Camera = new THREE.PerspectiveCamera( 70,
			Renderer.domElement.width / Renderer.domElement.height, //window.innerWidth / window.innerHeight,
			0.001, 700);
	
	init_OurObject();
	
	var OurFontLoader = new THREE.FontLoader();
	OurFontLoader.load(  "http://hamishtodd1.github.io/Sysmic/gentilis.js", 
		function ( reponse ) {
			gentilis = reponse;
			
			Camera.lookAt(new THREE.Vector3(0,0,1));
			
			if(Protein.children.length === 0) //if the protein isn't loaded yet you need something to show
			{
				LoadingSign = create_and_center_and_orient_text( "Loading..." );	
				LoadingSign.throb_parameter = 0;
				Protein.add(LoadingSign);
			}
			
			if( !THREEx.FullScreen.activated() )
			{
				FullScreenSign = create_and_center_and_orient_text( "Touch for fullscreen" );
				OurObject.add(FullScreenSign);
			}
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load font" ); }
	);
	
	OurOrientationControls = new THREE.DeviceOrientationControls(Camera);
	
	OurStereoEffect = new THREE.StereoEffect( Renderer );
	
	Add_stuff_from_demo();
	
	get_NGL_protein();
	
	var OurTextureLoader = new THREE.TextureLoader();
	OurTextureLoader.crossOrigin = true;
	OurTextureLoader.load(
		"http://hamishtodd1.github.io/Cardboard/Floor.png",
		function(texture) {
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.LinearMipMapLinearFilter;
			
			var floorwidth = 250;
			var FloorTile = new THREE.Mesh(
					new THREE.CubeGeometry(floorwidth, floorwidth, 0),
					new THREE.MeshBasicMaterial({}) );
			
			FloorTile.material.map = texture;
			
			FloorTile.position.y = -1;
			
			FloorTile.lookAt(new THREE.Vector3())

			Scene.add(FloorTile);
		},
		function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
	);
	
	Render();
}