//the first init
//strip away whatever you can and try to get it to load fast, using cardboard as inspiration
function init()
{	
	Renderer = new THREE.WebGLRenderer({ antialias: true }); //antialiasing would be nice and we're only aiming for 30fps
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
	
//	var ASPECT_OCULUS = 
	var EYE_PIXELS_HORIZONTAL_VIVE = 1080;
	var EYE_PIXELS_VERTICAL_VIVE = 1200;
	var EYE_ASPECT_VIVE = EYE_PIXELS_HORIZONTAL_VIVE/EYE_PIXELS_VERTICAL_VIVE;
	
	var VERTICAL_FOV_VIVE = HORIZONTAL_FOV_VIVE / EYE_ASPECT_VIVE;
	
	Scene = new THREE.Scene();
	
	//Camera will be added to the scene when the user is set up
	Camera = new THREE.PerspectiveCamera( 70, //VERTICAL_FOV_VIVE, //mrdoob says 70. They seem to change it anyway...
			Renderer.domElement.width / Renderer.domElement.height, //window.innerWidth / window.innerHeight,
			0.001, 700);
	
	Camera.position.set(0,0,0);
	
	OurOrientationControls = new THREE.DeviceOrientationControls(Camera);
	
	OurStereoEffect = new THREE.StereoEffect( Renderer );
	Camera.updateProjectionMatrix();
	
	Add_stuff_from_demo();
	
	set_up_pictures();
	initVideo();
	
	//changes isMobileOrTablet if necessary
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) isMobileOrTablet = true;})(navigator.userAgent||navigator.vendor||window.opera);
	
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