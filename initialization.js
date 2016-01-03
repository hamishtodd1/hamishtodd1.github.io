function init() {
	vertices_derivations = new Array(
		[666,666,666],
		[666,666,666],
		[0,1,666],
		
		[2,1,0],
		[2,3,1],
		[4,3,2],
		
		[0,2,1],
		[6,2,0],
		[6,7,2],
		[8,7,6],
		
		[0,6,2],
		[10,6,0],
		[10,11,6],
		[12,11,10],
		
		[0,10,6],
		[14,10,0],
		[14,15,10],
		[16,15,14],
		
		[0,14,10],
		[18,14,0],
		[18,19,14],
		[20,19,18]);
		
	var default_minimum_angle = 2 * Math.atan(PHI/(PHI-1));
	for( var i = 0; i < 22; i++ )
		minimum_angles[i] = default_minimum_angle;
		
	flatnet_vertices_numbers = new Float32Array([
		0,0,0,
		HS3,-0.5,0,
		
		HS3, 0.5, 0,
		2*HS3, 0,0,
		2*HS3,1,0,
		3*HS3,0.5,0,
		
		0,1,0,
		HS3,1.5,0,
		0,2,0,
		HS3,2.5,0,
		
		-HS3,0.5,0,
		-HS3,1.5,0,
		-2*HS3,1,0,
		-2*HS3,2,0,
		
		-HS3,-0.5,0,
		-2*HS3,0,0,
		-2*HS3,-1,0,
		-3*HS3,-0.5,0,
		
		0,-1,0,
		-HS3,-1.5,0,
		0,-2,0,
		-HS3,-2.5,0]);
	
	net_triangle_vertex_indices = new Uint32Array([
		2,1,0,
		1,2,3,
		4,3,2,
		3,4,5,
		
		6,2,0,
		2,6,7,
		8,7,6,
		7,8,9,
		
		10, 6, 0,
		6, 10,11,
		12,11,10,
		11,12,13,
		
		14,10, 0,
		10,14,15,
		16,15,14,
		15,16,17,
		
		18,14, 0,
		14,18,19,
		20,19,18,
		19,20,21]);
	
	polyhedron_edge_length = Array(12);
	for(var i = 0; i< polyhedron_edge_length.length; i++) {
		polyhedron_edge_length[i] = new Float32Array(12);
		for(var j = 0; j < polyhedron_edge_length[i].length; j++)
			polyhedron_edge_length[i][j] = 666; //not an actual edge
	}		
	for(var i = 0; i< net_triangle_vertex_indices.length / 3; i++) {
		for(var j = 0; j < 3; j++){
			var a_index = polyhedron_index(net_triangle_vertex_indices[i*3 + j]);
			var b_index = polyhedron_index(net_triangle_vertex_indices[i*3 + (j+1)%3]);

			polyhedron_edge_length[a_index][b_index] = 1;
			polyhedron_edge_length[b_index][a_index] = 1; 
		}
	}
	
	for( var i = 0; i < 20; i++ ) {
		line_index_pairs[i*6 + 0] = net_triangle_vertex_indices[i*3 + 0];
		line_index_pairs[i*6 + 1] = net_triangle_vertex_indices[i*3 + 1];
		
		line_index_pairs[i*6 + 2] = net_triangle_vertex_indices[i*3 + 1];
		line_index_pairs[i*6 + 3] = net_triangle_vertex_indices[i*3 + 2];
		
		line_index_pairs[i*6 + 4] = net_triangle_vertex_indices[i*3 + 2];
		line_index_pairs[i*6 + 5] = net_triangle_vertex_indices[i*3 + 0];
	}
	for( var i = 0; i < cylinder_triangle_indices.length / 3 / 2; i++){
		cylinder_triangle_indices[i*6+0] = (i*2);
		cylinder_triangle_indices[i*6+1] = (i*2+2)%(cylinder_triangle_indices.length/3);
		cylinder_triangle_indices[i*6+2] = (i*2+1);
		
		cylinder_triangle_indices[i*6+3] = (i*2+2)%(cylinder_triangle_indices.length/3);
		cylinder_triangle_indices[i*6+4] = (i*2+3)%(cylinder_triangle_indices.length/3);
		cylinder_triangle_indices[i*6+5] = (i*2+1);
	}
	for( var i = 0; i < 2; i++){
		//hopefully this is clockwise
		prism_triangle_indices[i*6+0] = (i*2);
		prism_triangle_indices[i*6+1] = (i*2+2);
		prism_triangle_indices[i*6+2] = (i*2+1);
		
		prism_triangle_indices[i*6+3] = (i*2+2);
		prism_triangle_indices[i*6+4] = (i*2+3);
		prism_triangle_indices[i*6+5] = (i*2+1);
	}
	
	for(var i = 0; i < 22; i++) {
		V_angles[i] = Array(4);
		for(var j = 0; j < 4; j++)
			V_angles[i][j] = TAU /3;
	}
	
	//-------------stuff that goes in the scene
	{
//		var texture_loader = new THREE.TextureLoader();
//		texture_loader.load(
//				'adenovirus256.jpg', //"http://icons.iconarchive.com/icons/aha-soft/torrent/256/virus-icon.png", 
//				function(texture) {
//					console.log("hey");
//					
//					var backgroundtexture_material = new THREE.MeshBasicMaterial({
//						map: texture
//					});
//					var texturedist = -min_cameradist;
//					var texturewidth = playing_field_width;
//					var textureheight = texturewidth; //currently we have a square texture
//		
//					backgroundtexture_geometry = new THREE.CubeGeometry( texturewidth, textureheight, 0);
//					backgroundtexture = new THREE.Mesh( backgroundtexture_geometry, backgroundtexture_material );
//					backgroundtexture.position.z = -10;
//					
//					if(MODE == CK_MODE)
//						scene.add(backgroundtexture);
//					
//					console.log(texture);
//				},
//				function ( xhr ) {},
//				function ( xhr ) {
//					console.log( 'texture loading error' );
//				});
		
		var surfacematerial = new THREE.MeshBasicMaterial({
			color: 0x00ffff,
			side:	THREE.DoubleSide,
			shading: THREE.FlatShading //TODO add light source or whatever you need
		});
		
		surface_vertices = new THREE.BufferAttribute( surface_vertices_numbers, 3 ); //note the 3 means 3 numbers to a vector, not three vectors to a triangle
		
		surface_geometry = new THREE.BufferGeometry();
		surface_geometry.setIndex(new THREE.BufferAttribute( net_triangle_vertex_indices, 1 ) );
		surface_geometry.addAttribute( 'position', surface_vertices );

		surface = new THREE.Mesh( surface_geometry, surfacematerial );
		surface.scale.x = 0.995;
		surface.scale.y = 0.995;
		surface.scale.z = 0.995;
		
		var material1 = new THREE.LineBasicMaterial({
			color: 0x0000ff
		});
		
		//so the flatnet will no longer be flat. At some stable point, change its names.
		flatnet_vertices = new THREE.BufferAttribute( flatnet_vertices_numbers, 3 );
		
		flatnet_geometry = new THREE.BufferGeometry();
		flatnet_geometry.addAttribute( 'position', flatnet_vertices );
		flatnet_geometry.setIndex(new THREE.BufferAttribute( net_triangle_vertex_indices, 1 ) );

		flatnet = new THREE.Mesh( flatnet_geometry, surfacematerial );
		
		var varyingsurface_edgesmaterial = new THREE.MeshBasicMaterial({
			color:	0x000000,
			side:	THREE.DoubleSide
		});
		var spherehandles_material = new THREE.MeshBasicMaterial({
			color:	0xff0000,
			side:	THREE.DoubleSide,
			transparent: true
		});
		for( var i = 0; i < varyingsurface_cylinders.length; i++) {
			var cylinder_vertices_numbers = new Float32Array(16*3);
			put_tube_in_buffer(0,0,0,1,1,1, varyingsurface_edges_default_radius, cylinder_vertices_numbers);
			
			var varyingsurface_cylinders_geometry = new THREE.BufferGeometry();
			varyingsurface_cylinders_geometry.setIndex(new THREE.BufferAttribute( cylinder_triangle_indices, 1 ) );
			varyingsurface_cylinders_geometry.addAttribute( 'position', new THREE.BufferAttribute( cylinder_vertices_numbers, 3 ) );
			
			varyingsurface_cylinders[i] = new THREE.Mesh( varyingsurface_cylinders_geometry, varyingsurface_edgesmaterial );
		}
		for(var i = 0; i<varyingsurface_spheres.length;i++){
			if( (i == 0 || i % 4 == 1) && i != 1)
				varyingsurface_spheres[i] = new THREE.Mesh( (new THREE.BufferGeometry).fromGeometry(new THREE.SphereGeometry(varyingsurface_edges_default_radius,8,4)),varyingsurface_edgesmaterial);
			else
				varyingsurface_spheres[i] = new THREE.Mesh( (new THREE.BufferGeometry).fromGeometry(new THREE.SphereGeometry(varyingsurface_edges_default_radius * 3,8,4)),spherehandles_material);
		}
		varyingsurface = new THREE.Mesh( flatnet_geometry.clone(), surfacematerial );
		
		var flatlatticematerial = new THREE.PointCloudMaterial({
			size: 0.09,
			vertexColors: THREE.VertexColors
		});
		for( var i = 0; i < number_of_lattice_points; i++){
			lattice_colors[i*3+0] = 1;
			lattice_colors[i*3+1] = 1;
			lattice_colors[i*3+2] = 0;
		}

		flatlattice_vertices = new THREE.BufferAttribute( flatlattice_vertices_numbers, 3 );
		
		flatlattice_geometry = new THREE.BufferGeometry();
		flatlattice_geometry.addAttribute( 'position', flatlattice_vertices );
		flatlattice_geometry.addAttribute( 'color', new THREE.BufferAttribute(lattice_colors, 3) );

		flatlattice = new THREE.PointCloud( flatlattice_geometry, flatlatticematerial );
		flatlattice.position.x = flatlattice_center.x;
		//scene.add(flatlattice);
		
		
		surflattice_vertices = new THREE.BufferAttribute( surflattice_vertices_numbers, 3 );		
		surflattice_geometry = new THREE.BufferGeometry();
		surflattice_geometry.addAttribute( 'position', surflattice_vertices );
		surflattice_geometry.addAttribute( 'color', new THREE.BufferAttribute(lattice_colors, 3) );

		surflattice = new THREE.PointCloud( surflattice_geometry, flatlatticematerial );
		
		
		
		
		for( var i = 0; i < 5; i++) {
			surfperimeter_line_index_pairs[2+ i*8+0] = Math.abs(4*i - 2);

			surfperimeter_line_index_pairs[2+ i*8+1] = 4*i + 3;
			surfperimeter_line_index_pairs[2+ i*8+2] = 4*i + 3;
			
			surfperimeter_line_index_pairs[2+ i*8+3] = 4*i + 5;
			surfperimeter_line_index_pairs[2+ i*8+4] = 4*i + 5;
			
			surfperimeter_line_index_pairs[2+ i*8+5] = 4*i + 4;
			surfperimeter_line_index_pairs[2+ i*8+6] = 4*i + 4;
			
			surfperimeter_line_index_pairs[2+ i*8+7] = 4*i + 2;
		}
		surfperimeter_line_index_pairs[0] = 0; surfperimeter_line_index_pairs[1] = 1;
		surfperimeter_line_index_pairs[2] = 1;
		surfperimeter_line_index_pairs[42] = 18; surfperimeter_line_index_pairs[43] = 0;
		surfinterior_line_index_pairs = new Uint16Array([
		                                                 1,2,	2,3,	3,4,
		                                                 2,6,	6,7,	7,8,
		                                                 6,10,	10,11,	11,12,
		                                                 10,14,	14,15,	15,16,
		                                                 14,18,	18,19,	19,20,
		                                                 0,2,	0,6,	0,10,	0,14]);
		
		
		
		var surfperimeter_cylindersmaterial = new THREE.MeshBasicMaterial({
			color: 0x000000,
			side:	THREE.DoubleSide
		});
		var blastcylindersmaterial = new THREE.MeshBasicMaterial({
			color:	0xffffff,
			side:	THREE.DoubleSide
		});
		for( var i = 0; i < surfperimeter_cylinders.length; i++) {
			surfperimeter_spheres[i] = new THREE.Mesh( (new THREE.BufferGeometry).fromGeometry(new THREE.SphereGeometry(surfperimeter_default_radius,8,4)),blastcylindersmaterial);
			
			var cylinder_vertices_numbers = new Float32Array(16*3);
			put_tube_in_buffer(0,0,0,1,1,1, surfperimeter_default_radius, cylinder_vertices_numbers);
			
			var surfperimeter_cylinders_geometry = new THREE.BufferGeometry();
			surfperimeter_cylinders_geometry.setIndex(new THREE.BufferAttribute( cylinder_triangle_indices, 1 ) );
			surfperimeter_cylinders_geometry.addAttribute( 'position', new THREE.BufferAttribute( cylinder_vertices_numbers, 3 ) );
			
			surfperimeter_cylinders[i] = new THREE.Mesh( surfperimeter_cylinders_geometry, surfperimeter_cylindersmaterial );
		}
		for( var i = 0; i < blast_cylinders.length; i++) {			
			var cylinder_vertices_numbers = new Float32Array(16*3);
			put_tube_in_buffer(0,0,0,1,1,1, surfperimeter_default_radius, cylinder_vertices_numbers);
			
			var blast_cylinders_geometry = new THREE.BufferGeometry();
			blast_cylinders_geometry.setIndex(new THREE.BufferAttribute( cylinder_triangle_indices, 1 ) );
			blast_cylinders_geometry.addAttribute( 'position', new THREE.BufferAttribute( cylinder_vertices_numbers, 3 ) );
			
			blast_cylinders[i] = new THREE.Mesh( blast_cylinders_geometry, blastcylindersmaterial );
			
		}
		
		
		
		var material3 = new THREE.MeshBasicMaterial({
			color: 0xff00ff
		});

		var radius = 0.08;

		circle = new THREE.Mesh( new THREE.CircleGeometry( radius ), material3 );
		circle.position.z = 0.1;
		
		var forwardbutton_geometry = new THREE.Geometry();
		forwardbutton_geometry.vertices.push(
				new THREE.Vector3( -0.2, 0.2, 0 ),
				new THREE.Vector3( 0.2,  0, 0 ),
				new THREE.Vector3( -0.2, -0.2, 0 )
			);
		forwardbutton_geometry.faces.push( new THREE.Face3( 0, 2, 1 ) );
		forwardbutton = new THREE.Mesh( forwardbutton_geometry, new THREE.MeshBasicMaterial({color: 0x0000ff}) );
		forwardbutton.position.x += 2.8;
		forwardbutton.position.y -= 2.8;
		var backwardbutton_geometry = new THREE.Geometry();
		backwardbutton_geometry.vertices.push(
				new THREE.Vector3( 0.2, 0.2, 0 ),
				new THREE.Vector3( 0.2, -0.2, 0 ),
				new THREE.Vector3( -0.2,  0, 0 )
			);
		backwardbutton_geometry.faces.push( new THREE.Face3( 0, 2, 1 ) );
		backwardbutton = new THREE.Mesh( backwardbutton_geometry, new THREE.MeshBasicMaterial({color: 0x0000ff}) );
		backwardbutton.position.x -= 2.8;
		backwardbutton.position.y -= 2.8;
		
		Button = new THREE.Mesh( new THREE.CircleGeometry( 0.3 ), new THREE.MeshBasicMaterial({color: 0x00ff00}) );
		Button.position.x += 1.5;
		Button.position.y -= 1.5;
		
		var indicatorblobmaterial = new THREE.MeshBasicMaterial({color: 0xf0f00f});
		for( var i = 0; i<indicatorblobs.length; i++){
			indicatorblobs[i] = new THREE.Mesh(new THREE.SphereGeometry(0.2,8,4), indicatorblobmaterial );
			indicatorblobs[i].position.set(100,100,100);
		}
	}
	
	CK_deduce_surface(capsidopenness, surface_vertices);
	for( var i = 0; i < 20; i++) {
		surface_triangle_side_unit_vectors[i] = new Array(2);
		surface_triangle_side_unit_vectors[i][0] = new THREE.Vector3();
		surface_triangle_side_unit_vectors[i][1] = new THREE.Vector3();
	}
	
	//---------------------------------------------------Vertex Rearrangement stuff
	associated_vertices = Array( //where there is a choice of index, you must have the version of the vertex in the 5th triangle of the W
		1,
		3,
		
		7,
		18,
		2,
		12,
		
		11,
		2,
		6,
		16,
		
		15,
		6,
		10,
		20,
		
		19,
		10,
		14,
		4,
		
		3,
		14,
		18,
		8
		);
	
	//in principle you could work these out from the changed vertex and the right defect.
	var a = TAU / 6;
	var b = TAU / 3;
	var c = TAU / 2;
	var d = -a; 
	var e = -b;
	var f = -c;
	var g = TAU; //mathematically the same as zero, but we do a "if thingy is 0" check to see what's there
		
	//put in two points, it'll tell you how to rotate the change-vector of the first one to get the second one
	vertex_identifications = Array(
		[g,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0],
		[0,g,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,a,0, 0,0],
		[0,0,g,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0],
		[0,0,0,g,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, c,0],
		[0,0,0,0,g, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0],
		
		[0,0,0,0,0, g,0,0,0,e, 0,0,0,b,0, 0,0,f,0,0, 0,c],
		[0,0,0,0,0, 0,g,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0],
		[0,0,0,0,b, 0,0,g,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0],
		[0,0,0,0,0, 0,0,0,g,0, 0,0,0,0,0, 0,0,0,0,0, 0,0],
		[0,0,0,0,0, 0,0,0,0,g, 0,0,0,e,0, 0,0,b,0,0, 0,d],
		
		[0,0,0,0,0, 0,0,0,0,0, g,0,0,0,0, 0,0,0,0,0, 0,0],
		[0,0,0,0,0, 0,0,0,b,0, 0,g,0,0,0, 0,0,0,0,0, 0,0],
		[0,0,0,0,0, 0,0,0,0,0, 0,0,g,0,0, 0,0,0,0,0, 0,0],
		[0,0,0,0,0, 0,0,0,0,0, 0,0,0,g,0, 0,0,e,0,0, 0,b],
		[0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,g, 0,0,0,0,0, 0,0],
		
		[0,0,0,0,0, 0,0,0,0,0, 0,0,b,0,0, g,0,0,0,0, 0,0],
		[0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,g,0,0,0, 0,0],
		[0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,g,0,0, 0,e],
		[0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,g,0, 0,0],
		[0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,b,0,0,g, 0,0],
		
		[0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, g,0],
		[0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,g]);
		
	for( var i = 0; i < 22; i++ ) {
		for( var j = 0; j < 22; j++ ) {
			if( vertex_identifications[i][j] != 0 )
				vertex_identifications[j][i] = -vertex_identifications[i][j];
		}
	}	
	
	W_triangle_indices = Array(
		[4,8,12,17,18,1,	16,0], //the last numbers are the central triangle and the top triangle. The top is only to help the V's, so no vertices needed
		[0, 16,17,19, 3, 2,	18,1],		
		[4, 0, 1, 3,7,6,	2,5],
		[19,3,2,0,16,17,	1,18],
		[3,7,6, 4,0,1,		5,2],
		[7,3,19,14,13,10,	15,11],
		
		[8,4,5,7,11,10,		6,9],
		[3,7,6, 4,0,1,		5,2],
		[7,11,10,8,4,5,		9,6],
		[11,7,3,18,17,14,	19,15],
		
		[12,8,9,11,15,14,	10,13],
		[7,11,10,8,4,5,		9,6],
		[11,15,14,12,8,9,	13,10],
		[15,11,7,2,1,18,	3,19],
		
		[16,12,13,15,19,18,	14,17],
		[11,15,14,12,8,9,	13,10],
		[15,19,18,16,12,13,	17,14],
		[19,15,11,6,5,2,	7,3],
		
		[0, 16,17,19, 3, 2,	18,1],
		[15,19,18,16,12,13,	17,14],
		[19,3,2,0,16,17,	1,18],
		[3,19,15,10,9,6,	11,7]);
	
	for( var i = 0; i < 22; i++)
		W_vertex_indices[i] = [];
	for( var vertex_tobechanged = 0; vertex_tobechanged < 22; vertex_tobechanged++) {
		var associated_vertex = associated_vertices[vertex_tobechanged];
		
		for( var triangle_index_in_W = 0; triangle_index_in_W < 7; triangle_index_in_W++) {
			var triangle = W_triangle_indices[vertex_tobechanged][triangle_index_in_W];
			
			//we need to find which vertex, in this triangle, was either the associated or the changed vertex, and then put the OTHER two vertices in the array
			for( var i = 0; i< 3; i++) {
				var vertex_index = net_triangle_vertex_indices[triangle*3+i];
				var next_vertex_index = net_triangle_vertex_indices[triangle*3 + (i+1)%3 ];
				
				if( triangle_index_in_W !== 6 ) {
					if( vertex_identifications[vertex_tobechanged][vertex_index] !== 0 ||
						vertex_identifications[associated_vertex][vertex_index] !== 0
					   ) {
						W_vertex_indices[vertex_tobechanged][triangle_index_in_W * 2] = net_triangle_vertex_indices[triangle*3 + (i+2)%3 ]; //the indexes ascend clockwise
						W_vertex_indices[vertex_tobechanged][triangle_index_in_W*2+1] = net_triangle_vertex_indices[triangle*3 + (i+1)%3 ]; //but we wind counter-clockwise around the w
					}
				}
				else { //for triangle 6, there should be both identifications
					if( vertex_identifications[vertex_tobechanged][vertex_index] !== 0 &&
						vertex_identifications[associated_vertex][next_vertex_index] !== 0
					   ) {
						W_vertex_indices[vertex_tobechanged][triangle_index_in_W * 2] = net_triangle_vertex_indices[triangle*3 + (i+2)%3 ];
						W_vertex_indices[vertex_tobechanged][RIGHT_DEFECT] = associated_vertex; //this doesn't have to be *here*, but they're side-by-side in the array, so.
					}
				}
			}
		}
	}
	
	//W_vertex_indices example:
	//[2,6, 6,10, 10,14, 14,19, 19,20, 3,2,		14,1]
	//vertices going around the perimeter. The last two are the central triangle corner, and then the right defect. 
	
	V_triangle_indices[CORE] = [];
	V_triangle_indices[ASSOCIATED] = [];
	for( var i = 0; i < 22; i++) {
		V_triangle_indices[CORE][i] = [];
		V_triangle_indices[ASSOCIATED][i] = [];
	}
	for( var vertex_tobechanged = 0; vertex_tobechanged < 22; vertex_tobechanged++) {		
		V_triangle_indices[CORE][vertex_tobechanged][0] = W_triangle_indices[vertex_tobechanged][7];
		V_triangle_indices[CORE][vertex_tobechanged][1] = W_triangle_indices[vertex_tobechanged][0];
		V_triangle_indices[CORE][vertex_tobechanged][2] = W_triangle_indices[vertex_tobechanged][1];
		V_triangle_indices[CORE][vertex_tobechanged][3] = W_triangle_indices[vertex_tobechanged][2];
		V_triangle_indices[CORE][vertex_tobechanged][4] = W_triangle_indices[vertex_tobechanged][6];
		
		V_triangle_indices[ASSOCIATED][vertex_tobechanged][0] = W_triangle_indices[vertex_tobechanged][6];
		V_triangle_indices[ASSOCIATED][vertex_tobechanged][1] = W_triangle_indices[vertex_tobechanged][3];
		V_triangle_indices[ASSOCIATED][vertex_tobechanged][2] = W_triangle_indices[vertex_tobechanged][4];
		V_triangle_indices[ASSOCIATED][vertex_tobechanged][3] = W_triangle_indices[vertex_tobechanged][5];
		V_triangle_indices[ASSOCIATED][vertex_tobechanged][4] = W_triangle_indices[vertex_tobechanged][7];
	}
	
	V_vertex_indices[CORE] = [];
	V_vertex_indices[ASSOCIATED] = [];
	for( var i = 0; i < 22; i++) {
		V_vertex_indices[CORE][i] = [];
		V_vertex_indices[ASSOCIATED][i] = [];
	}
	for( var vertex_tobechanged = 0; vertex_tobechanged < 22; vertex_tobechanged++) {
		for( var triangle_index_in_V = 0; triangle_index_in_V < 5; triangle_index_in_V++) {
			var triangle = V_triangle_indices[CORE][vertex_tobechanged][triangle_index_in_V];
			
			for( var triangle_vertex = 0; triangle_vertex< 3; triangle_vertex++) {
				vertex_index = net_triangle_vertex_indices[triangle*3+triangle_vertex];
				
				if( vertex_identifications[vertex_tobechanged][vertex_index] !== 0 ) {//if this is the vertex to be changed										
					V_vertex_indices[CORE][vertex_tobechanged][triangle_index_in_V * 3 + 2] = vertex_index;
					V_vertex_indices[CORE][vertex_tobechanged][triangle_index_in_V * 3 + 0] = net_triangle_vertex_indices[triangle*3 + (triangle_vertex+2)%3];
					V_vertex_indices[CORE][vertex_tobechanged][triangle_index_in_V * 3 + 1] = net_triangle_vertex_indices[triangle*3 + (triangle_vertex+1)%3];
				}
			}
		}
		
		var associated_vertex = associated_vertices[vertex_tobechanged];
		
		for( var triangle_index_in_V = 0; triangle_index_in_V < 5; triangle_index_in_V++) {
			var triangle = V_triangle_indices[ASSOCIATED][vertex_tobechanged][triangle_index_in_V];
			for( var triangle_vertex = 0; triangle_vertex< 3; triangle_vertex++) {
				vertex_index = net_triangle_vertex_indices[triangle*3+triangle_vertex];
				
				if( vertex_identifications[associated_vertex][vertex_index] !== 0 ) {//if this is the vertex associated with the changed one to be changed									
					V_vertex_indices[ASSOCIATED][vertex_tobechanged][triangle_index_in_V * 3 + 2] = vertex_index;
					V_vertex_indices[ASSOCIATED][vertex_tobechanged][triangle_index_in_V * 3 + 0] = net_triangle_vertex_indices[triangle*3 + (triangle_vertex+2)%3];
					V_vertex_indices[ASSOCIATED][vertex_tobechanged][triangle_index_in_V * 3 + 1] = net_triangle_vertex_indices[triangle*3 + (triangle_vertex+1)%3];
				}
			}
		}
	}
		
	//V vertex indices example:	[2,6,0,		6,10,0,		10,14,0,	14,18,0,	1,2,0],
	
	V_squasher = new Array(
		[8,		4,0,	0,0,	0,6,666],
		[16,	0,1,	1,1,	1,0,666],
		
		[0,		4,5,	2,2,	2,0,666],
		[1,		2,3,	3,3,	3,2,666],
		[5,		6,7,	7,7,	7,666,2],
		[3,		7,11,	9,13,	5,4,666],
		
		[4,		8,9,	6,6,	6,0,666],
		[5,		6,7,	7,7,	7,6,666],
		[9,		10,11,	11,11,	11,666,6],
		[7,		11,15,	13,17,	9,8,666],
		
		[8,		12,13,	10,10,	10,0,666],
		[9,		10,11,	11,11,	11,10,666],
		[13,	14,15,	15,15,	15,666,10],
		[11,	15,19,	17,21,	13,12,666],
		
		[12,	16,17,	14,14,	14,0,666],
		[13,	14,15,	15,15,	15,14,666],
		[17,	18,19,	19,19,	19,666,14],
		[15,	19,3,	21,5,	17,16,666],
		
		[16,	0,1,	1,1,	18,0,666],
		[17,	18,19,	19,19,	19,18,666],
		[1,		2,3,	3,3,	3,666,18],
		[21,	19,3,	7,5,	9,21,20]);
		
	{
		var lattice_generator = Array(6);
		lattice_generator[0] = new THREE.Vector2(0,1);			//up
		lattice_generator[1] = new THREE.Vector2(HS3,0.5);		//TR
		lattice_generator[2] = new THREE.Vector2(HS3,-0.5);		//BR
		lattice_generator[3] = new THREE.Vector2(0,-1);			//down
		lattice_generator[4] = new THREE.Vector2(-HS3,-0.5);	//BL
		lattice_generator[5] = new THREE.Vector2(-HS3,0.5);		//TL
		
		var square_lattice_generator = Array(6);
		square_lattice_generator[0] = new THREE.Vector2(1,1);		//up
		square_lattice_generator[1] = new THREE.Vector2(1,0);		//TR
		square_lattice_generator[2] = new THREE.Vector2(0,-1);		//BR
		square_lattice_generator[3] = new THREE.Vector2(-1,-1);	//down
		square_lattice_generator[4] = new THREE.Vector2(-1,0);		//BL
		square_lattice_generator[5] = new THREE.Vector2(0,1);		//TL
		
		flatlattice_default_vertices[0] = 0; flatlattice_default_vertices[1] = 0; flatlattice_default_vertices[2] = 0;
		surflattice_vertices.setXYZ(0, 0,0,0);
		flatlattice_vertices_velocities[0*3+0] = 0; flatlattice_vertices_velocities[0*3+1] = 0; flatlattice_vertices_velocities[0*3+2] = 0;
		squarelattice_vertices[0] = 0;squarelattice_vertices[1] = 0;
		var index = 1;	
		for(var hexagon_ring = 1; hexagon_ring < number_of_hexagon_rings+1; hexagon_ring++) {
			for( var slice = 0; slice < 6; slice++) {
				var slice_rightmost_point = lattice_generator[slice].clone();
				slice_rightmost_point.multiplyScalar(hexagon_ring);
				
				var square_slice_rightmost_point = square_lattice_generator[slice].clone();
				square_slice_rightmost_point.multiplyScalar(hexagon_ring);
				
				for( var length_along = 0; length_along < hexagon_ring; length_along++) {
					var ourpoint = lattice_generator[(slice + 2)%6].clone();
					ourpoint.multiplyScalar(length_along);				
					ourpoint.add(slice_rightmost_point );
					//if(ourpoint.length() > number_of_hexagon_rings * HS3 )
						//continue;
					
					var ourpointsquare = square_lattice_generator[(slice + 2)%6].clone();
					ourpointsquare.multiplyScalar(length_along);				
					ourpointsquare.add(square_slice_rightmost_point );
					
					flatlattice_default_vertices[index*3+0] = ourpoint.x; flatlattice_default_vertices[index*3+1] = ourpoint.y; flatlattice_default_vertices[index*3+2] = (1-capsidopenness) * camera.position.z * 1.5;
					surflattice_vertices.setXYZ(index, 0,0,0);
					squarelattice_vertices[index*2+0] = ourpointsquare.x; squarelattice_vertices[index*2+1] = ourpointsquare.y;
					flatlattice_vertices_velocities[index*3+0] = 0; flatlattice_vertices_velocities[index*3+1] = 0; flatlattice_vertices_velocities[index*3+2] = 0;
					
					index++;
				}
			}
		}
		
		var costheta = Math.cos(LatticeAngle);
		var sintheta = Math.sin(LatticeAngle);
		for(var i = 0; i < number_of_lattice_points; i++) {
			flatlattice_vertices.setXYZ(i, 	(flatlattice_default_vertices[i*3+0] * costheta - flatlattice_default_vertices[i*3+1] * sintheta) * LatticeScale,
											(flatlattice_default_vertices[i*3+0] * sintheta + flatlattice_default_vertices[i*3+1] * costheta) * LatticeScale,
											(1-capsidopenness) * camera.position.z * 1.5);
		}
		
		for(var i = 0; i<20; i++)
			shear_matrix[i] = new Array(4);
		Update_net_variables();
	}
	
	init_cubicLattice_stuff();
	initialize_QS_stuff();	
	initialize_protein();
	init_DNA_cage();
	init_static_capsid();
	initialize_formation_atom();
	
	//------------------need this so there's something in there for the first frame
	ourclock.getDelta();
	
	//must be kept at bottom
	ChangeScene(MODE);
}