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
	
	Camera.position.copy(FOURBOX_CAMERAPOSITION);
	
	//maybe it should actually be blue for resistant, red for sick, yellow for normal?
	loadtexture_initially('Data/Absent.png', 0);
	loadtexture_initially('Data/Resistant.png', 1);
	loadtexture_initially('Data/Sick.png', 2);
	loadtexture_initially('Data/Susceptible.png', 3);
	loadtexture_initially('Data/Dead.png', 4);
	
	loadtexture_initially('Data/FacesLabel.png', 5);
	loadtexture_initially('Data/RecoveryTimeLabel.png', 6);
	loadtexture_initially('Data/InfectiousnessLabel.png', 7);
	
	EMOJII_SUSCEPTIBLE = 1;
	EMOJII_SICK = 2;
	EMOJII_RESISTANT = 3;
	EMOJII_DEAD = 4;
	
	initVideo();
	init_story();
	init_parameterzone();
	init_Phasezone();
	set_vector_field();
}

function loadtexture_initially(linkstring, picindex)
{
	var mytextureloader = new THREE.TextureLoader();
	mytextureloader.crossOrigin = '';
	mytextureloader.load(
		linkstring,
		function(texture) {
			ourtextures[picindex] = texture;
			attempt_launch();
		},
		function ( xhr ) {}, function ( xhr ) {
			console.log( 'texture loading error' );
		}
	);
}

function attempt_launch()
{
	for(var i = 0; i < ourtextures.length; i++)
		if(typeof ourtextures[i] === 'undefined')
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
	
	FacesLabelMesh = new THREE.Mesh(
		new THREE.CubeGeometry(VIEWBOX_WIDTH * 0.8, VIEWBOX_WIDTH * 0.8, 0),
		new THREE.MeshBasicMaterial({transparent: true, map: ourtextures[ 5 ]}) );
	
	var axesLabelDimension = VIEWBOX_WIDTH * 0.14;
	RecoveryTimeLabelMesh = new THREE.Mesh(
		new THREE.CubeGeometry(axesLabelDimension,axesLabelDimension, 0),
		new THREE.MeshBasicMaterial({transparent: true, map: ourtextures[ 6 ]}) );
	InfectiousnessLabelMesh = new THREE.Mesh(
		new THREE.CubeGeometry(axesLabelDimension,axesLabelDimension, 0),
		new THREE.MeshBasicMaterial({transparent: true, map: ourtextures[ 7 ]}) );
	
	FacesLabelMesh.position.z = -0.02;
	FacesLabelMesh.position.y = -VIEWBOX_HEIGHT / 2 - VIEWBOX_HEIGHT * 0.034;
	RecoveryTimeLabelMesh.position.z = -0.02;
	RecoveryTimeLabelMesh.position.y = -VIEWBOX_HEIGHT / 2 - VIEWBOX_HEIGHT * 0.028;
	InfectiousnessLabelMesh.position.z = -0.02;
	InfectiousnessLabelMesh.position.x =-VIEWBOX_WIDTH / 2 - VIEWBOX_HEIGHT * 0.02;
}