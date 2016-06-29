function pre_download_init()
{
	THREE.ImageUtils.crossOrigin = '';
	
	Renderer = new THREE.WebGLRenderer({ antialias: true }); //antialiasing would be nice and we're only aiming for 30fps
	Renderer.setClearColor( 0xFFFFFF );
	Renderer.setPixelRatio( window.devicePixelRatio );
	Renderer.setSize( window.innerWidth, window.innerHeight );
	Renderer.sortObjects = false;
	Renderer.shadowMap.enabled = true;
	Renderer.shadowMap.cullFace = THREE.CullFaceBack;
	
	document.body.appendChild( Renderer.domElement );
	
	Scene = new THREE.Scene();
	
	Camera = new THREE.PerspectiveCamera( 1, //placeholder
			Renderer.domElement.width / Renderer.domElement.height, //window.innerWidth / window.innerHeight,
			0.001, 700);
	
	Resize();
	
	Scene.add(Camera)
	
	Camera.position.set(0,0,cameradist); //should be three viewboxes wide, two tall
	
	initVideo();
	
	boundingbox = new THREE.Object3D();
	boundingbox.add( new THREE.Mesh(
		new THREE.CubeGeometry(
				VIEWBOX_WIDTH * (1 + boundingbox_additional_width), 
				VIEWBOX_HEIGHT * (1 + boundingbox_additional_width), 0),
		new THREE.MeshBasicMaterial({color:0x000000}) ));
	boundingbox.add( new THREE.Mesh(
			new THREE.CubeGeometry(
					VIEWBOX_WIDTH, 
					VIEWBOX_HEIGHT, 0),
			new THREE.MeshBasicMaterial({color:0xFFFFFF}) ));
	boundingbox.children[0].position.z =-0.01;
	boundingbox.children[1].position.z =-0.01;
	
//	var OurFontLoader = new THREE.FontLoader();
//	OurFontLoader.load( "gentilis.js", 
//		function ( response ) {
//			gentilis = response;
//		},
//		function ( xhr ) {}, //progression function
//		function ( xhr ) { console.error( "couldn't load font" ); }
//	);
	
	init_parameterzone();
	init_Phasezone();
	set_vector_field();
	
	init_story();
	
	Camera.position.copy(FOURBOX_CAMERAPOSITION);
	
	//maybe it should actually be blue for resistant, red for sick, yellow for normal?
	loadtexture_initially('http://hamishtodd1.github.io/Sysmic/Data/Absent.png', 0);
	loadtexture_initially('http://hamishtodd1.github.io/Sysmic/Data/Resistant.png', 1);
	loadtexture_initially('http://hamishtodd1.github.io/Sysmic/Data/Sick.png', 2);
	loadtexture_initially('http://hamishtodd1.github.io/Sysmic/Data/Susceptible.png', 3);
	loadtexture_initially('http://hamishtodd1.github.io/Sysmic/Data/Dead.png', 4);
	
	EMOJII_SUSCEPTIBLE = 1;
	EMOJII_SICK = 2;
	EMOJII_RESISTANT = 3;
	EMOJII_DEAD = 4;
}

function loadtexture_initially(linkstring, picindex)
{
	var mytextureloader = new THREE.TextureLoader();
	mytextureloader.crossOrigin = '';
	mytextureloader.load(
		linkstring,
		function(texture) {
			emojiitextures[picindex] = texture;
			attempt_launch();
		},
		function ( xhr ) {}, function ( xhr ) {
			console.log( 'texture loading error' );
		}
	);
}

function attempt_launch()
{
	for(var i = 0; i < emojiitextures.length; i++)
		if(typeof emojiitextures[i] === 'undefined')
			return;
//	if(typeof gentilis === 'undefined')
//		return;
	
	post_download_init();
	
	Render();
}

function post_download_init()
{
	//because textures
	init_graph();
	init_Comiczone();
}