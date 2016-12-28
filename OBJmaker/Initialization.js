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
	
//	init_hexacross();
	init_cardioid(0.02);
	
	Render();
}

function init_halffuncube()
{
	/*
	 * Three 1x1x3 cuboids for three of the edges
	 * Six of same but sliced... in some way! heights on the edges: 1.5, 2.5, 1.5, 0.5 - we believe
	 * Though hey, they need to be hollow 
	 * 
	 * Wouldn't be that hard to craft it. Or even sonobe unit it
	 * 
	 * Could have one with one hole in it, one with three?
	 */
}

function init_cardioid(thickness)
{
	/*
	 * A hole through the middle would be nice but maybe too hard. And it would look like a bum aroumd your neck. She could glue her own chain onto it or whatever
	 * 
	 * Improvements: given that you can't see the lines disappear into the singularity (unless they're different colors!), probably centering_mode should be true
	 * 
	 * You could also make the thickness proportional to the radius - the small ones are supported by the large ones
	 */
	
	var radius_segments = 128;
	
	function hemisphere_geometry(radius)
	{
		var outer_shell;
		var inner_shell;
		var annulus;
		
		var centering_mode = false;
		
		if(centering_mode)
		{
			outer_shell = new THREE.SphereGeometry(radius + thickness / 2, radius_segments, radius_segments / 3, 0, TAU, 0, TAU / 4);
			inner_shell = new THREE.SphereGeometry(radius - thickness / 2, radius_segments, radius_segments / 3, 0, TAU, 0, TAU / 4);
			annulus = new THREE.RingGeometry(radius - thickness / 2, radius + thickness / 2, radius_segments, 1);
		}
		else
		{
			outer_shell = new THREE.SphereGeometry(radius, radius_segments, 32, 0, TAU, 0, TAU / 4);
			inner_shell = new THREE.SphereGeometry(radius - thickness, radius_segments, 32, 0, TAU, 0, TAU / 4);
			annulus = new THREE.RingGeometry(radius - thickness, radius, radius_segments, 1);
		}
		for(var i = 0, il = annulus.vertices.length; i < il; i++)
		{
			annulus.vertices[i].z = annulus.vertices[i].y;
			annulus.vertices[i].y = 0;
		}
		
		var final_geometry = new THREE.Geometry();
		final_geometry.merge( outer_shell ); //might need more arguments
		final_geometry.merge( inner_shell ); //might need more arguments
		final_geometry.merge( annulus ); //might need more arguments
		return final_geometry;
	}
	
	var num_hemispheres = 13;
	var cardioid_hemispheres = Array(num_hemispheres);
	var centercircle_radius = 0.2;
	var twelve_oclock = new THREE.Vector3(0,0,centercircle_radius);
	
	var cardioid_materials = Array(1);
	cardioid_materials[0] = new THREE.MeshPhongMaterial({side:THREE.DoubleSide, color:0xffffff});
//	cardioid_materials[1] = new THREE.MeshPhongMaterial({side:THREE.DoubleSide, color:0x000000});
	var cardioid = new THREE.Object3D();
	for(var i = 0; i < num_hemispheres; i++)
	{
		var hemisphere_position = twelve_oclock.clone();
		hemisphere_position.applyAxisAngle(Central_Y_axis, (i+1) / (num_hemispheres+1) * TAU );
		cardioid_hemispheres[i] = new THREE.Mesh(hemisphere_geometry(hemisphere_position.distanceTo(twelve_oclock)), cardioid_materials[i % cardioid_materials.length] );
		cardioid_hemispheres[i].position.copy(hemisphere_position);
		cardioid.add( cardioid_hemispheres[i] );
	}
	
	cardioid.rotation.x = -TAU / 4;
	Protein.add(cardioid);
}

function extend_rect_edges()
{
	for(var i = 0; i < 12; i++)
	{
		var vertexposition = normalized_virtualico_vertices[i].clone();
		vertexposition.setLength(ico_radius);
		
		if( Math.abs(vertexposition.x ) > Math.abs(vertexposition.y ) && Math.abs(vertexposition.x ) > Math.abs(vertexposition.z) )
			vertexposition.x *= 1.2;
		else if(Math.abs(vertexposition.y ) > Math.abs(vertexposition.x ) && Math.abs(vertexposition.y ) > Math.abs(vertexposition.z) )
			vertexposition.y *= 1.2;
		else if(Math.abs(vertexposition.z ) > Math.abs(vertexposition.y ) && Math.abs(vertexposition.z ) > Math.abs(vertexposition.x) )
			vertexposition.z *= 1.2;
		
		Hexacross.children[i].position.copy( vertexposition );
	}
	for(var i = 12; i < Hexacross.children.length; i++)
		Hexacross.children[i].update_ends();
}

function Random_perp_vector(OurVector){
	var PerpVector = new THREE.Vector3();
	
	if( OurVector.equals(Central_Z_axis))
		PerpVector.crossVectors(OurVector, Central_Z_axis);
	else
		PerpVector.crossVectors(OurVector, Central_Y_axis);
	
	return PerpVector;
}

lengthen = 1;
twist = 0;
function tet_distort()
{
	if(lengthen === 0)
		console.log("lengthen needs something you know!")
	var normalized_tet_vertices = Array(4);
	normalized_tet_vertices[0] = new THREE.Vector3(1,1,1);
	normalized_tet_vertices[1] = new THREE.Vector3(1,-1,-1);
	normalized_tet_vertices[2] = new THREE.Vector3(-1,1,-1);
	normalized_tet_vertices[3] = new THREE.Vector3(-1,-1,1);
	for(var i = 0; i < 4; i++)
		normalized_tet_vertices[i].normalize();
	for(var i = 0; i < 12; i++)
	{
		var closest_index = 666;
		var closest_length = 1000000;
		for(var j = 0; j < normalized_tet_vertices.length; j++)
		{
			if( normalized_virtualico_vertices[i].distanceTo(normalized_tet_vertices[j]) < closest_length )
			{
				closest_index = j;
				closest_length = normalized_virtualico_vertices[i].distanceTo(normalized_tet_vertices[j]);
			}
		}
		
		var tet_to_ico = normalized_virtualico_vertices[i].clone();
		tet_to_ico.sub( normalized_tet_vertices[closest_index] );
		tet_to_ico.multiplyScalar(lengthen);
		tet_to_ico.applyAxisAngle( normalized_tet_vertices[closest_index], twist );
		
		Protein.children[0].children[i].position.copy( tet_to_ico );
		Protein.children[0].children[i].position.add( normalized_tet_vertices[closest_index] );
		Protein.children[0].children[i].position.setLength(ico_radius);
	}

	for(var i = 12; i < Protein.children[0].children.length; i++)
		Protein.children[0].children[i].update_ends();
}