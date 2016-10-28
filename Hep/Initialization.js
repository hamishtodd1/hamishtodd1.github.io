//the first init
function init()
{	
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
	Camera = new THREE.PerspectiveCamera( 70, //VERTICAL_FOV_VIVE, //mrdoob says 70. They seem to change it anyway...
			Renderer.domElement.width / Renderer.domElement.height, //window.innerWidth / window.innerHeight,
			0.001, 700);
	
	Camera.position.copy(INITIAL_CAMERA_POSITION); //initial state subject to change! you may not want them on the floor. Owlchemy talked about this
	var fireplaceangle = 0; //called so because they're seated around it
	Camera.position.applyAxisAngle(Central_Y_axis,fireplaceangle);
	Camera.lookAt(new THREE.Vector3());
	
	OurVREffect = new THREE.VREffect( Renderer );
//	Camera.fov = 25;
	Camera.updateProjectionMatrix();
//	console.log(Camera.fov)
	
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
	initVideo();
	
	//us. We'll be added to the user array soon, in the way everyone else is.
	//This is also the place where the user object is defined
	InputObject.UserData.push({
		CameraPosition: new THREE.Vector3(),
		CameraQuaternion: new THREE.Quaternion(),
		
		HandPosition: new THREE.Vector3(0,-10000,0), //By default it's offscreen.
		HandQuaternion: new THREE.Quaternion(),
		
		Gripping: 0,
		Gripping_previously: 0
	});
	
	set_up_pictures();
	
	//you can add other things to this
	var PreInitChecklist = {
		Downloads: Array()
	};
	Download_initial_stuff(PreInitChecklist);
}

function PostDownloadInit(OurLoadedThings)
{		 
	var ControllerModel = OurLoadedThings[0].children[0];
	
	//"grippable objects"
	Models = Array();
	for( var i = 0; i < OurLoadedThings.length - 1; i++ )
	{
		Models[i] = new THREE.Object3D();
		Models[i] = OurLoadedThings[i + 1];
		Models[i].position.x = 0.6;
		Models[i].position.applyAxisAngle(Central_Y_axis, i * TAU / 3);
//		Models[i].position.x = -0.6 + 0.3 * i; //space all three out in front of you
		
		if(Master)
			Models[i].add(new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshBasicMaterial({color:0xFFF000}) ) );
		
//		Models[i].children[0].material.color = new THREE.Color(i / 3,0,0);
	}
	
	Models[1].children[0].position.z -= 50;
	Models[1].remove( Models[1].children[1] );
	
	var hep_center = new THREE.Vector3(60.5, 59, 74);
	hep_center.multiplyScalar(1 / 0.7);
	Models[2].children[0].updateMatrixWorld();
	Models[2].children[0].worldToLocal(hep_center);
	for(var i = 0, il = Models[2].children[0].geometry.attributes.position.array.length / 3; i < il; i++)
	{
		Models[2].children[0].geometry.attributes.position.array[i*3+0] -= hep_center.x;
		Models[2].children[0].geometry.attributes.position.array[i*3+1] -= hep_center.y;
		Models[2].children[0].geometry.attributes.position.array[i*3+2] -= hep_center.z;
	}
	
	Models[2].children[0].material.vertexColors = THREE.VertexColors;

	var hep_vertexcolors = new Float32Array( Models[2].children[0].geometry.attributes.position.array.length );
	Models[2].children[0].geometry.addAttribute('color', new THREE.BufferAttribute(hep_vertexcolors, 3));
	
	for(var i = 0, il = Models[2].children[0].geometry.attributes.position.array.length; i < il; i++)
		Models[2].children[0].geometry.attributes.position.array[i] *= 0.7;
	
	var layer_boundaries = [1900,1040,650,490,203,100];//disordered membrane, golf ball, protrusions, corners, thing, inner corners
	var radius = 0;
	var blueishR = 62 / 256;
	var blueishG = 108 / 256;
	var blueishB = 210 / 256;
	var blueishRincrement = ( 1 - blueishR ) / layer_boundaries.length;
	var blueishGincrement = ( 1 - blueishG ) / layer_boundaries.length;
	var blueishBincrement = ( 1 - blueishB ) / layer_boundaries.length;
	var j = 0;
	
	for(var i = 0, il = Models[2].children[0].geometry.attributes.position.array.length / 3; i < il; i++)
	{
		radius = 
		  Models[2].children[0].geometry.attributes.position.array[i*3+0] * Models[2].children[0].geometry.attributes.position.array[i*3+0]
		+ Models[2].children[0].geometry.attributes.position.array[i*3+1] * Models[2].children[0].geometry.attributes.position.array[i*3+1] 
		+ Models[2].children[0].geometry.attributes.position.array[i*3+2] * Models[2].children[0].geometry.attributes.position.array[i*3+2];
		
		for( j = 0; j < 6; j++)
		{
			if( radius > layer_boundaries[j] )
			{
				Models[2].children[0].geometry.attributes.color.array[i*3+0] = blueishR + blueishRincrement * j;
				Models[2].children[0].geometry.attributes.color.array[i*3+1] = blueishG + blueishGincrement;
				Models[2].children[0].geometry.attributes.color.array[i*3+2] = blueishB + blueishBincrement;
				
				break;
			}
		}
		if( radius < 100) //stupid blob
		{
			Models[2].children[0].geometry.attributes.position.array[i*3+0] = 0;
			Models[2].children[0].geometry.attributes.position.array[i*3+1] = 0;
			Models[2].children[0].geometry.attributes.position.array[i*3+2] = 0;
		}
	}

	for(var i = 0; i < 3; i++)
	{
		Models[i].scale.multiplyScalar(0.003);
		Scene.add(Models[i]);
	}
	
	Models[2].velocity = new THREE.Vector3();
	
	var Users = Array();

	RecordingDevice.init(Models.length, images.length);
	
	//so you know where their face is
//	AudienceHead.init();
//	Scene.add(AudienceHead);
	
	Render(Models, Users, ControllerModel);
}

var AudienceHead = new THREE.Object3D();
AudienceHead.init = function()
{
	var headradius = 0.08;
	this.add( new THREE.Mesh(new THREE.SphereGeometry(headradius), new THREE.MeshBasicMaterial({color:0x000000}) ) );
	
	var eyeballradius = headradius / 3;
	
	var eyeball1 = new THREE.Mesh(new THREE.SphereGeometry(eyeballradius), new THREE.MeshBasicMaterial({color:0xffffff}) );
	var eyeball2 = new THREE.Mesh(new THREE.SphereGeometry(eyeballradius), new THREE.MeshBasicMaterial({color:0xffffff}) );
	eyeball1.x = headradius;
	eyeball2.x =-headradius;
	this.add(eyeball1);
	this.add(eyeball2);
	
	var pupil1 = new THREE.Mesh(new THREE.SphereGeometry(eyeballradius / 8), new THREE.MeshBasicMaterial({color:0x000000}) );
	var pupil2 = new THREE.Mesh(new THREE.SphereGeometry(eyeballradius / 8), new THREE.MeshBasicMaterial({color:0x000000}) );
	pupil1.z = eyeballradius;
	pupil2.z = eyeballradius;
	eyeball1.add(pupil1);
	eyeball2.add(pupil2);
}
AudienceHead.update = function( point_of_interest )
{
	this.lookAt(point_of_interest);
	
	this.updateMatrixWorld();
	var adjusted_POI = point_of_interest.clone();
	this.worldToLocal(adjusted_POI);
	
	this.children[0].lookAt(adjusted_POI);
	this.children[1].lookAt(adjusted_POI);
}