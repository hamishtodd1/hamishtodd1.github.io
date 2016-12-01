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
				OurObject.add(Protein); //when showing ribbon, go back to OurObject.add(FullScreenSign);
			}
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load font" ); }
	);
	
	OurOrientationControls = new THREE.DeviceOrientationControls(Camera);
	
	OurStereoEffect = new THREE.StereoEffect( Renderer );
	
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

			Scene.add(FloorTile);
		},
		function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
	);
	
	//changes isMouseOrTablet
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) isMobileOrTablet = true;})(navigator.userAgent||navigator.vendor||window.opera);
	
	init_xmasData();
//	init_octospiral(0.008, 24);
	
	Render();
}

function init_octospiral(arm_width, num_steps_inward)
{
	var octospiral = new THREE.Object3D();
	for(var i = 0; i < 8; i++)
	{
		var arm = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0x000000, side:THREE.DoubleSide}));
		console.log(arm)
		var current_spiral_breadth = 0.2;
		for(var j = 0; j < num_steps_inward; j++)
		{
			arm.geometry.vertices.push(new THREE.Vector3(0,current_spiral_breadth, 0));
			arm.geometry.vertices[arm.geometry.vertices.length - 1].applyAxisAngle(Central_Z_axis, TAU / 8 * j );
			
			arm.geometry.vertices.push(new THREE.Vector3(0,current_spiral_breadth * (1-(1-1/Math.sqrt(2))/ 2), 0));
			arm.geometry.vertices[arm.geometry.vertices.length - 1].applyAxisAngle(Central_Z_axis, TAU / 8 * j );
			
			if( j < num_steps_inward - 1 )
			{
				arm.geometry.faces.push(new THREE.Face3(j * 2, j * 2 + 1, j * 2 + 2));
				arm.geometry.faces.push(new THREE.Face3(j * 2 + 1, j * 2 + 2, j * 2 + 3));
			}
			
			current_spiral_breadth /= Math.sqrt(2);
		}
		
		arm.rotateOnAxis(Central_Z_axis, TAU / 8 * i);
		octospiral.add(arm);
	}
	
	Protein.add(octospiral);
}

function init_xmasData()
{
	var xmasRep = new THREE.Object3D();
	Protein.add(xmasRep);
	
	var loader = new THREE.XHRLoader();
	loader.crossOrigin = '';
	loader.load( "http://hamishtodd1.github.io/xmasData/raw_data.txt", function ( raw_data ) 
	{
		var num_variables_plotted = 2;
		var lines_array = raw_data.split(/\n/);

		var base_radius = 0.1; //very subjective and maybe not even a good idea
		var data_scaling = 0.08;
		var num_points_per_period = 16; //maybe listed somewhere in the file?
		
		var wind_height = base_radius / 3 * 2;
		var step_height = wind_height / num_points_per_period; //vertical distance between "adjacent" points
		var ribbon_width = wind_height / (num_variables_plotted+1); //not precisely "width", but you know
		var total_height = (lines_array.length + 1) * step_height;
		
		var base_cylinder = new THREE.Mesh(new THREE.CylinderGeometry(base_radius, base_radius, total_height, num_points_per_period), new THREE.MeshPhongMaterial({color:0x888888}));
		xmasRep.add(base_cylinder); //cylinder is centered in y btw
		
		for(var variable_index = 0; variable_index < num_variables_plotted; variable_index++)
		{
			var data_points = Array(lines_array.length);
			
			for(var i = 0; i < lines_array.length; i++)
			{
				var nums = lines_array[i].split(",");
				data_points[i] = nums[ variable_index + 1];
			}
			
			//maybe there should also be struts coming out? Or markers for time of day? Certainly there should be a clock on top
			var ribbon = new THREE.Mesh(new THREE.Geometry, new THREE.MeshPhongMaterial({color:0x000000, side:THREE.DoubleSide, 
				transparent: true, opacity: 1
				}));
			switch(variable_index)
			{
			case 0:
				ribbon.material.color.r = 1;
				break;
			case 1:
				ribbon.material.color.r = 1;
				ribbon.material.color.g = 102/255;
				break;
			case 2:
				ribbon.material.color.r = 1;
				ribbon.material.color.g = 238/255;
				break;
			case 3:
				ribbon.material.color.g = 1;
				break;
			case 4:
				ribbon.material.color.g = 153/255;
				ribbon.material.color.b = 1;
				break;
			case 5:
				ribbon.material.color.r = 68/255;
				ribbon.material.color.b = 1;
				break;
			case 6:
				ribbon.material.color.r = 153/255;
				ribbon.material.color.b = 1;
				break; //would you really want more?
			}
			
			function give_ribbon_vertices(i)
			{
				var newreadout = new THREE.Vector3(
						(base_radius + data_points[i] * data_scaling) * Math.cos( -TAU / num_points_per_period * i),
						i * step_height,
						(base_radius + data_points[i] * data_scaling) * Math.sin( -TAU / num_points_per_period * i)
				);
				
				var top_ribbon_edge = newreadout.clone();
				top_ribbon_edge.y += ribbon_width;
				
				ribbon.geometry.vertices.push(newreadout);
				ribbon.geometry.vertices.push(top_ribbon_edge);
			}
			
			give_ribbon_vertices(0);
			ribbon.geometry.vertices.push(ribbon.geometry.vertices[0].clone());
			ribbon.geometry.vertices[2].x = 0;
			ribbon.geometry.vertices[2].z = 0;
			ribbon.geometry.vertices.push(ribbon.geometry.vertices[1].clone());
			ribbon.geometry.vertices[3].x = 0;
			ribbon.geometry.vertices[3].z = 0;
			
			for(var i = 1; i < data_points.length; i++)
			{
				give_ribbon_vertices(i);
				
				var newnum = ribbon.geometry.vertices.length;
				
				var ribbon_center_bottom = ribbon.geometry.vertices[newnum - 6].clone();
				ribbon_center_bottom.lerp(ribbon.geometry.vertices[newnum - 2],0.5);
				ribbon_center_bottom.x = 0;
				ribbon_center_bottom.z = 0;
				ribbon.geometry.vertices.push(ribbon_center_bottom);
				var ribbon_center_top = ribbon.geometry.vertices[newnum - 5].clone();
				ribbon_center_top.lerp(ribbon.geometry.vertices[newnum - 1],0.5);
				ribbon_center_top.x = 0;
				ribbon_center_top.z = 0;
				ribbon.geometry.vertices.push(ribbon_center_top);
				
				newnum = ribbon.geometry.vertices.length;
				
				ribbon.geometry.faces.push(new THREE.Face3(newnum-8,newnum-7,newnum-4)); //the outside
				ribbon.geometry.faces.push(new THREE.Face3(newnum-7,newnum-3,newnum-4));
				
				ribbon.geometry.faces.push(new THREE.Face3(newnum-7,newnum-3,newnum-1)); //the top and bottom of the "slice"
				ribbon.geometry.faces.push(new THREE.Face3(newnum-8,newnum-4,newnum-2));
				
				ribbon.geometry.faces.push(new THREE.Face3(newnum-5,newnum-7,newnum-1)); //connection to previous slice
				ribbon.geometry.faces.push(new THREE.Face3(newnum-2,newnum-8,newnum-6));
			}
			ribbon.geometry.computeFaceNormals();

			ribbon.position.y = -total_height / 2;
			ribbon.position.y += ribbon_width * variable_index;
			
			xmasRep.add(ribbon);
		}
	}, function(xhr){}, function(xhr){} );
}

function Random_perp_vector(OurVector){
	var PerpVector = new THREE.Vector3();
	
	if( OurVector.equals(Central_Z_axis))
		PerpVector.crossVectors(OurVector, Central_Z_axis);
	else
		PerpVector.crossVectors(OurVector, Central_Y_axis);
	
	return PerpVector;
}