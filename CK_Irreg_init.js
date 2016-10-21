function init_CK_and_irreg(){
	wedges_assigned_vertices = new Uint16Array([
	                            		0, 1,
	                            		2, 7,
	                            		6, 11,
	                            		10, 15,
	                            		14, 19 ]);
	
	//make wedges. glue their positive x vector to the side of what you want
	var master_wedge = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0x000000, transparent: true}));
	var num_arc_segments = 16;
	var wedge_radius = 0.35;
	var outline_width = 0.03;
	var outside_vec = new THREE.Vector3(wedge_radius,0,0);
	var inside_vec = new THREE.Vector3(wedge_radius - outline_width,0,0);
	
	master_wedge.geometry.vertices.push(outside_vec.clone() );
	master_wedge.geometry.vertices.push( inside_vec.clone() );	
	for(var i = 0; i < num_arc_segments; i++ )
	{
		outside_vec.applyAxisAngle(z_central_axis, -TAU / 6 / num_arc_segments);
		inside_vec.applyAxisAngle(z_central_axis, -TAU / 6 / num_arc_segments);
		master_wedge.geometry.vertices.push(outside_vec.clone() );
		master_wedge.geometry.vertices.push( inside_vec.clone() );
		
		master_wedge.geometry.faces.push(new THREE.Face3(i*2+0,i*2+3,i*2+2));
		master_wedge.geometry.faces.push(new THREE.Face3(i*2+0,i*2+1,i*2+3));
	}
	
	var extras_index = master_wedge.geometry.vertices.length;
	
	master_wedge.geometry.vertices.push( new THREE.Vector3() );
	
	var inside_corner = new THREE.Vector3(outline_width,0,0);
	inside_corner.multiplyScalar(2);
	inside_corner.applyAxisAngle(z_central_axis, -TAU / 12 );
	master_wedge.geometry.vertices.push( inside_corner );
	
	var start_corner = master_wedge.geometry.vertices[1].clone();
	start_corner.y -= outline_width;
	master_wedge.geometry.vertices.push( start_corner );
	
	var end_corner = master_wedge.geometry.vertices[1].clone();
	end_corner.y += outline_width;
	end_corner.applyAxisAngle(z_central_axis, -TAU / 6 );
	master_wedge.geometry.vertices.push( end_corner );
	
	//central, inside corner, start, end 
	master_wedge.geometry.faces.push(new THREE.Face3( extras_index + 0,extras_index + 1,1));
	master_wedge.geometry.faces.push(new THREE.Face3( extras_index + 1,extras_index + 2,1));
	
	master_wedge.geometry.faces.push(new THREE.Face3( extras_index + 0, extras_index - 1, extras_index + 3 ));
	master_wedge.geometry.faces.push(new THREE.Face3( extras_index + 0, extras_index + 3, extras_index + 1 ));
	
	//little gap
	var offset = master_wedge.geometry.vertices[ extras_index + 1 ].clone();
	offset.multiplyScalar(1);
	
	for(var i = 0; i < master_wedge.geometry.vertices.length; i++ )
		master_wedge.geometry.vertices[i].add( offset );
	
	wedges = Array(5);
	for(var i = 0; i < wedges.length; i++ )
		wedges[i] = master_wedge.clone();
	
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
	
	//a test case
	//0, 0, 0, 0.5055593848228455, -0.3021232783794403, 0, 0.5911332964897156, 0.3222222328186035, 0, 1.044405460357666, 0.01323286909610033, 0, 2.2832748889923096, 1.100820779800415, 0, 2.598076343536377, 0.8999999761581421, 0, -0.008866691030561924, 0.644444465637207, 0, 0.7629072666168213, 2.1769635677337646, 0, 0.485552579164505, 2.3700923919677734, 0, 0.7794228196144104, 2.549999952316284, 0, -0.786644458770752, 0.4555555582046509, 0, -1.2561057806015015, 1.9354549646377563, 0, -1.5600461959838867, 1.4909697771072388, 0, -1.5588456392288208, 2.0999999046325684, 0, -0.9199777841567993, -0.5666666626930237, 0, -2.070040464401245, 0.3034752309322357, 0, -1.9071744680404663, -0.36338236927986145, 0, -2.598076343536377, 0, 0, -0.008866691030561924, -0.5888888835906982, 0, -1.5895979404449463, -1.3199701309204102, 0, -0.0051744794473052025, -1.213233232498169, 0, -1.5588456392288208, -2.0999999046325684, 0
	
	//T4
	var S3 = Math.sqrt(3);
	var S13 = Math.sqrt(13);
	
	//NEXT THING TO DO IS RECHECK THESE GUYS. Selection in at 11:06
	
	var T4_arm_points = Array(4);
	var horizontal_arm_segment = 21/2 * Math.sqrt(3/13);
	var vertical_segment = Math.sqrt(31) * 17 / (2*Math.sqrt(403) );
	console.log(S13, HS3*S13, S13/2 );
	
	T4_arm_points[0] = new THREE.Vector3(HS3*S13, S13/2, 0 );
	T4_arm_points[1] = new THREE.Vector3(HS3*S13 + horizontal_arm_segment, -S13/2 + vertical_segment, 0 );
	T4_arm_points[2] = new THREE.Vector3(HS3*S13 + horizontal_arm_segment,  S13/2 + vertical_segment, 0 );
	T4_arm_points[3] = new THREE.Vector3( S3*S13 + horizontal_arm_segment,  		vertical_segment, 0 );
	for(var i = 0; i < T4_arm_points.length; i++)
		console.log(T4_arm_points[i])
	
	setvirus_flatnet_vertices[0] = new Float32Array([
	    0, 0, 0,
		HS3 * S13, -S13/2, 0,
	  	   
  	    0,0,0, 0,0,0, 0,0,0, 0,0,0,
  	    0,0,0, 0,0,0, 0,0,0, 0,0,0,
  	    0,0,0, 0,0,0, 0,0,0, 0,0,0,
  	    0,0,0, 0,0,0, 0,0,0, 0,0,0,
  	    0,0,0, 0,0,0, 0,0,0, 0,0,0
	]);
	
	var T4factor = Math.sqrt(7);
	
	var T4point = new THREE.Vector3();
  	for(var i = 0; i < 5; i++)
  	{
  		for(var j = 0; j < 4; j++)
  		{
  			T4point.copy(T4_arm_points[j]);
  			T4point.applyAxisAngle(z_central_axis, i * TAU / 6 ); //or positive?
  			
  			if(i=== 0 && j === 3 )
  				T4factor /= T4point.length(); 
  			
  			setvirus_flatnet_vertices[0][ (2 + i*4+j) *3+0] = T4point.x;
  			setvirus_flatnet_vertices[0][ (2 + i*4+j) *3+1] = T4point.y;
  			setvirus_flatnet_vertices[0][ (2 + i*4+j) *3+2] = T4point.z;
  		}
  	}
  	
  	
  	for(var i = 0; i < setvirus_flatnet_vertices[0].length; i++ )
  		setvirus_flatnet_vertices[0][i] *= T4factor;
  	
	
	//phi29
	setvirus_flatnet_vertices[1] = new Float32Array([
  	   0, 0, 0, 
  	   3 *3/11*HS3,-9/22,0,
  	   
  	   0,0,0, 0,0,0, 0,0,0, 0,0,0,
  	   0,0,0, 0,0,0, 0,0,0, 0,0,0,
  	   0,0,0, 0,0,0, 0,0,0, 0,0,0,
  	   0,0,0, 0,0,0, 0,0,0, 0,0,0,
  	   0,0,0, 0,0,0, 0,0,0, 0,0,0
  	]);
  	
  	var phi29_arm_points = Array(4);
  	phi29_arm_points[0] = new THREE.Vector3(3 *3/11*HS3, 9/22, 0);
  	phi29_arm_points[1] = new THREE.Vector3(8 *3/11*HS3, 	0, 0);
  	phi29_arm_points[2] = new THREE.Vector3(8 *3/11*HS3,18/22, 0);
  	phi29_arm_points[3] = new THREE.Vector3(11*3/11*HS3, 9/22, 0);
  	
  	var p29point = new THREE.Vector3();
  	for(var i = 0; i < 5; i++)
  	{
  		for(var j = 0; j < 4; j++)
  		{
  			p29point.copy(phi29_arm_points[j]);
  			p29point.applyAxisAngle(z_central_axis, i * TAU / 6 ); //or positive?
  			
  			setvirus_flatnet_vertices[1][ (2 + i*4+j) *3+0] = p29point.x;
  			setvirus_flatnet_vertices[1][ (2 + i*4+j) *3+1] = p29point.y;
  			setvirus_flatnet_vertices[1][ (2 + i*4+j) *3+2] = p29point.z;
  		}
  	}
	
	//HIV
	setvirus_flatnet_vertices[2] = new Float32Array([
 		0,0,0,
 		S3,-1,0,
 		
 		S3, 1, 0,
 		2*S3, 0,0,
 		4.5*S3,3.5,0,
 		5*S3,3,0,
 		
 		0,2,0,
 		1.5*S3,7.5,0,
 		S3,8,0,
 		1.5*S3,8.5,0,
 		
 		-S3,1,0,
 		-2.5*S3,6.5,0,
 		-3*S3,6,0,
 		-3*S3,7,0,
 		
 		-S3,-1,0,
 		-4.5*S3,0.5,0,
 		-4.5*S3,-0.5,0,
 		-5*S3,0,0,
 		
 		0,-2,0,
 		-3*S3,-6,0,
 		0,-4,0,
 		-3*S3,-7,0
 		]);
	for(var i = 0; i < setvirus_flatnet_vertices[2].length; i++)
		setvirus_flatnet_vertices[2][i] *= 0.3;
	//Herpes
	setvirus_flatnet_vertices[3] = new Float32Array(66);
	for(var i = 0; i < setvirus_flatnet_vertices[3].length; i++)
		setvirus_flatnet_vertices[3][i] = flatnet_vertices_numbers[i];
		
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
	
	for(var i = 0; i < net_triangle_vertex_indices.length; i++)
		alexandrov_triangle_vertex_indices[i] = polyhedron_index(net_triangle_vertex_indices[i]);
	
	polyhedron_edge_length = Array(12);
	for(var i = 0; i< polyhedron_edge_length.length; i++) {
		polyhedron_edge_length[i] = new Float32Array(12);
	}
	
	irreg_rope = new THREE.Line(new THREE.Geometry, new THREE.LineBasicMaterial({color: 0x000000}));
	irreg_rope.geometry.vertices.push(new THREE.Vector3(0,0,0),new THREE.Vector3(100,0,0.01));
	
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
		var surfacematerial = new THREE.MeshBasicMaterial({
			color: 0x1EFCF3,
			side:	THREE.DoubleSide,
			shading: THREE.FlatShading //TODO add light source or whatever you need
		});
		
		surface_vertices = new THREE.BufferAttribute( new Float32Array(22*3), 3 );
		
		surface_geometry = new THREE.BufferGeometry();
		surface_geometry.setIndex(new THREE.BufferAttribute( net_triangle_vertex_indices, 1 ) );
		surface_geometry.addAttribute( 'position', surface_vertices );

		surface = new THREE.Mesh( surface_geometry, surfacematerial );
//		surface.scale.x = 0.995;
//		surface.scale.y = 0.995;
//		surface.scale.z = 0.995;
		
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
			color:	0x0000ff,
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
		
		for(var i = 0; i < irreghighlight_progresses .length; i++)
			irreghighlight_progresses[i] = Math.random();
		var irreghighlight_geometry = new THREE.Geometry();
		var original_irreghighlight_vertex = new THREE.Vector3(0,varyingsurface_edges_default_radius * 4,0);
		for(var i = 0; i < 12; i++){
			var newvert = original_irreghighlight_vertex.clone();
			newvert.applyAxisAngle(z_central_axis,TAU/12*i);
			irreghighlight_geometry.vertices.push(newvert);
			
			var newvert2 = newvert.clone();
			newvert2.multiplyScalar(0.7);
			irreghighlight_geometry.vertices.push(newvert2);
		}
		for(var i = 0; i < 11; i++){
			irreghighlight_geometry.faces.push(new THREE.Face3(i*2,i*2+3,i*2+1));
			irreghighlight_geometry.faces.push(new THREE.Face3(i*2,i*2+2,i*2+3));
		}
		irreghighlight_geometry.faces.push(new THREE.Face3(22,1,23));
		irreghighlight_geometry.faces.push(new THREE.Face3(22,0,1));
		
		for(var i = 0; i<varyingsurface_spheres.length;i++){
			if( (i == 0 || i % 4 == 1) && i != 1)
				varyingsurface_spheres[i] = new THREE.Mesh( new THREE.SphereGeometry(varyingsurface_edges_default_radius,  8,4),varyingsurface_edgesmaterial);
			else
				varyingsurface_spheres[i] = new THREE.Mesh( new THREE.SphereGeometry(varyingsurface_edges_default_radius*7,8,4),spherehandles_material.clone());
		}
		varyingsurface = new THREE.Mesh( flatnet_geometry.clone(), surfacematerial );
		
		manipulation_surface = new THREE.Mesh( varyingsurface.geometry.clone(), surfacematerial );
//		filler_points
		
		var flatlatticematerial = new THREE.PointsMaterial({
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

		flatlattice = new THREE.Points( flatlattice_geometry, flatlatticematerial );
		flatlattice.position.x = flatlattice_center.x;
		//scene.add(flatlattice);
		
		
		surflattice_geometry = new THREE.BufferGeometry();
		surflattice_geometry.addAttribute( 'position', new THREE.BufferAttribute( surflattice_vertices_numbers, 3 ) );
		surflattice_geometry.addAttribute( 'color', new THREE.BufferAttribute(lattice_colors, 3) );

		surflattice = new THREE.Points( surflattice_geometry, flatlatticematerial );
		
		
		
		
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
		
		var indicatorblobmaterial = new THREE.MeshBasicMaterial({color: 0xf0f00f});
		for( var i = 0; i<indicatorblobs.length; i++){
			indicatorblobs[i] = new THREE.Mesh(new THREE.SphereGeometry(0.2,8,4), indicatorblobmaterial );
			indicatorblobs[i].position.set(100,100,100);
		}
	}
	
	CK_deduce_surface(capsidopenness);
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
	
	IsRoundedVertex = new Uint16Array(number_of_lattice_points);
	IsProblemVertex = new Uint16Array(number_of_lattice_points);
	ProblemClosests = Array(12);
	ProblemClosests[0] = new Uint16Array([0, 16, 14, 31, 51, 80, 12, 28, 47, 75, 10, 25, 43, 70, 8, 22, 39, 65, 18, 19, 59, 90]);
	ProblemClosests[1] = new Uint16Array([0, 14, 12, 28, 47, 75, 10, 25, 43, 70, 8, 22, 39, 65, 18, 19, 59, 90, 16, 34, 55, 85]);
	ProblemClosests[2] = new Uint16Array([0, 12, 10, 25, 43, 70, 8, 22, 39, 65, 18, 19, 59, 90, 16, 34, 55, 85, 14, 31, 51, 80]);
	ProblemClosests[3] = new Uint16Array([0, 10, 8, 22, 39, 65, 18, 19, 59, 90, 16, 34, 55, 85, 14, 31, 51, 80, 12, 28, 47, 75]);
	ProblemClosests[4] = new Uint16Array([0, 8, 18, 19, 59, 90, 16, 34, 55, 85, 14, 31, 51, 80, 12, 28, 47, 75, 10, 25, 43, 70]);
	ProblemClosests[5] = new Uint16Array([0, 18, 16, 34, 55, 85, 14, 31, 51, 80, 12, 28, 47, 75, 10, 25, 43, 70, 8, 22, 39, 65]);
	
	ProblemClosests[ 6] = new Uint16Array([0, 55, 51, 115, 197, 309, 47, 109, 189, 299, 43, 103, 181, 289, 39, 97, 173, 279, 59, 91, 213, 329]);
	ProblemClosests[ 7] = new Uint16Array([0, 51, 47, 109, 189, 299, 43, 103, 181, 289, 39, 97, 173, 279, 59, 91, 213, 329, 55, 121, 205, 319]);
	ProblemClosests[ 8] = new Uint16Array([0, 47, 43, 103, 181, 289, 39, 97, 173, 279, 59, 91, 213, 329, 55, 121, 205, 319, 51, 115, 197, 309]);
	ProblemClosests[ 9] = new Uint16Array([0, 43, 39, 97, 173, 279, 59, 91, 213, 329, 55, 121, 205, 319, 51, 115, 197, 309, 47, 109, 189, 299]);
	ProblemClosests[10] = new Uint16Array([0, 39, 59, 91, 213, 329, 55, 121, 205, 319, 51, 115, 197, 309, 47, 109, 189, 299, 43, 103, 181, 289]);
	ProblemClosests[11] = new Uint16Array([0, 59, 55, 121, 205, 319, 51, 115, 197, 309, 47, 109, 189, 299, 43, 103, 181, 289, 39, 97, 173, 279]);
	
	//speedup opportunity there are probably a bunch of places you could use this
	triangle_adjacent_triangles = Array(20);
	for(var i = 0; i < triangle_adjacent_triangles.length; i++)
	{
		triangle_adjacent_triangles[i] = new Uint16Array(3);
		
		for(var ic = 0; ic < 3; ic++)
		{
			triangle_adjacent_triangles[i][ic] = 666;
			
			for(var j = 0; j < 20; j++)
			{
				if(j === i) continue;
				
				for(var jc = 0; jc < 3; jc++)
				{
					if(( net_triangle_vertex_indices[i*3+   ic   ] === net_triangle_vertex_indices[j*3+   jc   ] &&
						 net_triangle_vertex_indices[i*3+(ic+1)%3] === net_triangle_vertex_indices[j*3+(jc+1)%3] ) ||
					   ( net_triangle_vertex_indices[i*3+   ic   ] === net_triangle_vertex_indices[j*3+(jc+1)%3] &&
						 net_triangle_vertex_indices[i*3+(ic+1)%3] === net_triangle_vertex_indices[j*3+   jc   ] ) )
					{
						triangle_adjacent_triangles[i][ic] = j;
						break;
					}
				}
			}
		}
	}
		
	{
		HexagonLattice = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({vertexColors:THREE.FaceColors,
	        polygonOffset: true,
	        polygonOffsetFactor: -1.0, //adding this stuff to get it imposed on the surface. There is this silly 0.995 solution you've used, get rid of that
	        polygonOffsetUnits: -4.0
//	        depthWrite: false, depthTest: false
	        }));
//	    HexagonLattice.renderOrder = 1; //yay, works
		squarelattice_hexagonvertices = Array(6 * 2 * number_of_lattice_points); //only 2 points per corner
		for(var i = 0; i < squarelattice_hexagonvertices.length; i++ )
			squarelattice_hexagonvertices[i] = new THREE.Vector3();
		
		HexagonLattice.geometry.vertices = Array(6 * 12 * number_of_lattice_points); //12 points per side, 6 sides per hexagon
		for(var i = 0; i < HexagonLattice.geometry.vertices.length; i++)
			HexagonLattice.geometry.vertices[i] = new THREE.Vector3();
		
		HexagonLattice.geometry.faces = Array(number_of_lattice_points * 6 * 4); //4 faces per side, 6 sides per hexagon
		
		for(var hexagon_i = 0; hexagon_i < number_of_lattice_points; hexagon_i++){
			for(var side_i = 0; side_i < 6; side_i++){
				for(var tri_i = 0; tri_i < 4; tri_i++){
					var triangleindex = hexagon_i * 6 * 4 + side_i * 4 + tri_i;
					HexagonLattice.geometry.faces[hexagon_i * 6 * 4 + side_i * 4 + tri_i] = new THREE.Face3(
							triangleindex * 3 + 0,
							triangleindex * 3 + 1,
							triangleindex * 3 + 2,
							new THREE.Vector3(1,0,0),//Face normal; unused
							new THREE.Color( 0xff0000 )
						);
				}
			}
		}
		
		//not sure what this was supposed to do
//		HexagonLattice.scale.x = LatticeScale;
//		HexagonLattice.scale.y = LatticeScale;
		
		var square_lattice_generator = Array(6);
		square_lattice_generator[0] = new THREE.Vector3(-1,  1,0);		//up
		square_lattice_generator[1] = new THREE.Vector3(1,  2,0);		//TR
		square_lattice_generator[2] = new THREE.Vector3(2,  1,0);		//BR
		square_lattice_generator[3] = new THREE.Vector3(1,-1,0);		//down
		square_lattice_generator[4] = new THREE.Vector3(-1,-2,0);		//BL
		square_lattice_generator[5] = new THREE.Vector3(-2,-1,0);		//TL
		
		//because integer lattice
		for(var i = 0; i < square_lattice_generator.length; i++)
			square_lattice_generator[i].multiplyScalar(100);
		
		var hexagon_generator = Array(6);
		hexagon_generator[0] = new THREE.Vector3(1,  1,0);		//up
		hexagon_generator[1] = new THREE.Vector3(1,  0,0);		//TR
		hexagon_generator[2] = new THREE.Vector3(0, -1,0);		//BR
		hexagon_generator[3] = new THREE.Vector3(-1,-1,0);		//down
		hexagon_generator[4] = new THREE.Vector3(-1, 0,0);		//BL
		hexagon_generator[5] = new THREE.Vector3(0,  1,0);		//TL
		
		var hexagon_major_Scalar = 83; //will get divided by 100.
		var hexagon_minor_Scalar = 61;
		
		

		var index = 0;
		var lowest_unused_HL_vertex = 0;
		for(var hexagon_ring = 0; hexagon_ring < number_of_hexagon_rings+1; hexagon_ring++) {
			for( var slice = 0; slice < 6 && !(hexagon_ring === 0 && slice > 0); slice++) {
				var square_slice_rightmost_point = square_lattice_generator[slice].clone();
				square_slice_rightmost_point.multiplyScalar(hexagon_ring);
				
				for( var length_along = 0; length_along < hexagon_ring || (hexagon_ring === 0 && length_along === 0); length_along++) {
					var ourpointsquare = square_lattice_generator[(slice + 2)%6].clone();
					ourpointsquare.multiplyScalar(length_along);				
					ourpointsquare.add(square_slice_rightmost_point );
					squarelattice_vertices[index] = ourpointsquare.clone();
					
					var ourpoint = ourpointsquare.clone();
					apply2Dmatrix(SquareToHexMatrix,ourpoint);
					
					flatlattice_default_vertices[index*3+0] = ourpoint.x; flatlattice_default_vertices[index*3+1] = ourpoint.y; flatlattice_default_vertices[index*3+2] = 0;
					surflattice_geometry.attributes.position.setXYZ(index, 0,0,0);
					squarelattice_vertices[index] = ourpointsquare.clone();
					
					for(var i = 0; i < 6; i++){
						insert_squareHexagon_corner(lowest_unused_HL_vertex,hexagon_generator[i],hexagon_major_Scalar,ourpointsquare);
						lowest_unused_HL_vertex++;
						
						insert_squareHexagon_corner(lowest_unused_HL_vertex,hexagon_generator[i],hexagon_minor_Scalar,ourpointsquare);
						lowest_unused_HL_vertex++;
					}
					
					index++;
				}
			}
		}
		
		for(var i = 0; i<20; i++)
			shear_matrix[i] = new Array(4);
		Update_net_variables();
	}
}

function insert_squareHexagon_corner(ourindex,ourgenerator,ourScalar,hexagoncenter){
	squarelattice_hexagonvertices[ourindex].copy(ourgenerator);
	squarelattice_hexagonvertices[ourindex].multiplyScalar(ourScalar);
	squarelattice_hexagonvertices[ourindex].add(hexagoncenter);
}