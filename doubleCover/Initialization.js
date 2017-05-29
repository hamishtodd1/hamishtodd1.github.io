function Initialize()
{
	Renderer = new THREE.WebGLRenderer({  }); //antialiasing would be nice and we're only aiming for 30fps
	Renderer.setClearColor( 0x101010 );
	Renderer.setPixelRatio( window.devicePixelRatio );
	Renderer.setSize( window.innerWidth, window.innerHeight );
	Renderer.sortObjects = false;
	Renderer.shadowMap.cullFace = THREE.CullFaceBack;
	document.body.appendChild( Renderer.domElement );
	
	scene = new THREE.Scene();
	
	//camera will be added to the scene when the user is set up
	camera = new THREE.PerspectiveCamera( 70,
			Renderer.domElement.width / Renderer.domElement.height, //window.innerWidth / window.innerHeight,
			0.001, 700);
	
	var OurFontLoader = new THREE.FontLoader();
	OurFontLoader.load(  "http://hamishtodd1.github.io/Sysmic/gentilis.js", 
		function ( reponse ) {
			gentilis = reponse;
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load font" ); }
	);
	
	ourOrientationControls = new THREE.DeviceOrientationControls(camera);
	ourStereoEffect = new THREE.StereoEffect( Renderer );
	
	Add_stuff_from_demo();	
	
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

			scene.add(FloorTile);
		},
		function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
	);
	
	//changes isMouseOrTablet
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) isMobileOrTablet = true;})(navigator.userAgent||navigator.vendor||window.opera);
	
	spectatorPosition = new THREE.Vector3();
	
//	initDoubleShape()
//	initDoubleSphere();
	initRP2();
	
	Render();
}

function initDoubleSphere()
{
	doubleSphere = new THREE.Object3D();
	
	doubleSphere.triangles = [];
	
	//tetrakis hexahedron. Could have triakis octahedron
	{
		doubleSphere.triangles.length = 4*6*2;
		templateTriangle = new THREE.Mesh(new THREE.Geometry(),
				new THREE.MeshBasicMaterial({color:0xFF0000} ) );
		templateTriangle.geometry.vertices.push(new THREE.Vector3( 0,0,1 ) );
		templateTriangle.geometry.vertices.push(new THREE.Vector3( 1,1,1 ) );
		templateTriangle.geometry.vertices.push(new THREE.Vector3( -1,1,1 ) );
		for(var i = 0; i < templateTriangle.geometry.vertices.length; i++)
			templateTriangle.geometry.vertices[i].setLength(0.1);
		templateTriangle.geometry.faces.push( new THREE.Face3( 0,1,2 ) );
		templateTriangle.geometry.computeFaceNormals();
		templateTriangle.geometry.computeVertexNormals();

		for(var i = 0; i < doubleSphere.triangles.length; i++)
		{
			doubleSphere.triangles[i] = templateTriangle = new THREE.Mesh( templateTriangle.geometry,
					templateTriangle.material.clone() );
			doubleSphere.triangles[i].material.color.setRGB(Math.random(),Math.random(),Math.random());
			
			doubleSphere.add(doubleSphere.triangles[i]);
		}
		
		for(var i = 0; i < 6; i++)
		{
			var faceQuaternion = new THREE.Quaternion();
			
			if( i < 4)
				faceQuaternion.setFromAxisAngle(yAxis, i * TAU / 4 );
			else if( i === 4 )
				faceQuaternion.setFromAxisAngle(xAxis, TAU / 4 );
			else if( i === 5 )
				faceQuaternion.setFromAxisAngle(xAxis, TAU / 4 * 3 );
			
			for(var j = 0; j < 4; j++)
			{
				var teepeeQuaternion = new THREE.Quaternion().setFromAxisAngle(zAxis, TAU / 4 * j);
				
				doubleSphere.triangles[i*8+j*2+0].quaternion.multiplyQuaternions(faceQuaternion, teepeeQuaternion);
				doubleSphere.triangles[i*8+j*2+1].quaternion.multiplyQuaternions(faceQuaternion, teepeeQuaternion);
				doubleSphere.triangles[i*8+j*2+1].quaternion.negate();
			}
		}
	}
	
	doubleSphere.spectatorQuaternion = new THREE.Quaternion(); //do you need to make sure it is a particular one?

	scene.add(doubleSphere);
	
	//to do the dice thing, you'd have to make the points very small
}

function initRP2()
{
	RP2 = new THREE.Object3D();
	
	var circumferenceSegments = 32;
	var arcSegments = 16;
	RP2.surface = new THREE.Mesh(new THREE.SphereGeometry(0.1, circumferenceSegments, arcSegments, 0, TAU, 0, TAU / 4 ),
			new THREE.MeshPhongMaterial({vertexColors: THREE.FaceColors, side: THREE.DoubleSide}) );
	
	console.log(RP2.surface.geometry.faces)
	
	//they wrap around circumference-wise
	for(var i = 0; i < RP2.surface.geometry.faces.length; i++)
	{
		if( i%4 < 2 )
			RP2.surface.geometry.faces[i].color.setRGB(1,0,1);
		else
			RP2.surface.geometry.faces[i].color.setRGB(0,1,1);
		
		if( i < circumferenceSegments * (arcSegments/8+1) )
			RP2.surface.geometry.faces[i].color.setRGB(0,0,1);
	}
	
	RP2.add(RP2.surface);
	
	RP2.hider = new THREE.Mesh(new THREE.CylinderGeometry(0.1003,0.1003,0.014,circumferenceSegments), new THREE.MeshPhongMaterial({color:0x000000}));
	RP2.hider.geometry.applyMatrix( (new THREE.Matrix4()).makeTranslation(0,0.007,0));
	RP2.hider.geometry.applyMatrix( (new THREE.Matrix4()).makeRotationAxis(xAxis, TAU / 4));
	RP2.add(RP2.hider);
	
	//maybe: you can look around and that lets you see the back. But it slowly turns back towards you

	scene.add(RP2);
}

function initDoubleShape()
{
	doubleShape = new THREE.Object3D();
	doubleShape.virtualQuaternion = new THREE.Quaternion();
	
	var singleFace = new THREE.Mesh(new THREE.Geometry, new THREE.MeshBasicMaterial({side:THREE.DoubleSide }));
	var radius = 0.1;
	singleFace.geometry.vertices.push(new THREE.Vector3( radius, radius, radius));
	singleFace.geometry.vertices.push(new THREE.Vector3(-radius, radius, radius));
	singleFace.geometry.vertices.push(new THREE.Vector3( radius,-radius, radius));
	singleFace.geometry.vertices.push(new THREE.Vector3(-radius,-radius, radius));
	
	singleFace.geometry.faces.push(new THREE.Face3(0,1,2));
	singleFace.geometry.faces.push(new THREE.Face3(3,2,1));
	
	singleFace.geometry.computeBoundingSphere();
	
	for(var i = 0; i < 6; i++)
	{
		var newFace = new THREE.Mesh(singleFace.geometry, singleFace.material.clone())
		newFace.material.color.setRGB(Math.random(),Math.random(),Math.random())
		
		newFace.defaultQuaternion = new THREE.Quaternion();
		
		if( i < 4)
			newFace.defaultQuaternion.setFromAxisAngle(yAxis, i * TAU / 4 );
		else if( i === 4 )
			newFace.defaultQuaternion.setFromAxisAngle(xAxis, TAU / 4 );
		else if( i === 5 )
			newFace.defaultQuaternion.setFromAxisAngle(xAxis, TAU / 4 * 3 );
		
		newFace.quaternion.copy(newFace.defaultQuaternion);
		
		doubleShape.add(newFace);
		
		var extraFace = new THREE.Mesh(singleFace.geometry, singleFace.material.clone());
		extraFace.material.color.setRGB(Math.random(),Math.random(),Math.random());
		
		extraFace.defaultQuaternion = new THREE.Quaternion(
				-newFace.defaultQuaternion.x,
				-newFace.defaultQuaternion.y,
				-newFace.defaultQuaternion.z,
				-newFace.defaultQuaternion.w);
		
		extraFace.quaternion.copy(extraFace.defaultQuaternion);
		
		doubleShape.add(extraFace);
	}
	scene.add(doubleShape);
	
	doubleShape.virtualQuaternion = new THREE.Quaternion();
	
//	doubleShape.update = function()
//	{
//		var characteristicQuaternion
//		
//		var differenceQuaternion = previousQuaternion.clone().inverse().multiply(camera.quaternion);
//		
//		//do something with the vertices here
//		vertex.applyQuaternion(differenceQuaternion);
//		
//		ourShape.geometry.verticesNeedUpdate = true;
//		
//		previousQuaternion.copy(camera.quaternion);
//	}
}