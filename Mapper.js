/* No protein gets cut up, they merely overlap?
 * And you should have the translational net for the irreg
 */ 

function Update_net_variables() {
	var old_net_vertices_closest_lattice_vertex = Array(net_vertices_closest_lattice_vertex.length);
	for(var i = 0; i<net_vertices_closest_lattice_vertex.length; i++)
		old_net_vertices_closest_lattice_vertex[i] = net_vertices_closest_lattice_vertex[i];
	var centralaxis = new THREE.Vector3(0, 0, 1);
	for( var i = 0; i < 22; i++) {
		var netvertex = new THREE.Vector3(flatnet_vertices.array[ i*3+0 ],flatnet_vertices.array[ i*3+1 ],0);
		netvertex.multiplyScalar(1/LatticeScale);
		netvertex.applyAxisAngle(centralaxis,-LatticeAngle);

		net_vertices_closest_lattice_vertex[i] = index_of_closest_default_lattice_vertex(netvertex.x,netvertex.y);
	}
	
	//speedup opportunity: this part only exists for one situation, where LatticeScale is very low and such. Could be more specific
	for(var i = 0; i<net_triangle_vertex_indices.length / 3; i++){
		if(		net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+0]] == net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+1]]
			 || net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+0]] == net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+2]]
			 || net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+1]] == net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+2]] ) {
			for(var i = 0; i<net_vertices_closest_lattice_vertex.length; i++)
				net_vertices_closest_lattice_vertex[i] = old_net_vertices_closest_lattice_vertex[i];
			break;
		}
	}
	
	for(var i = 0; i < 20; i++) {
		var side0vertex_index = vertices_derivations[i+2][0];
		var side1vertex_index = vertices_derivations[i+2][1]; //always counter-clockwise
		
		var origincorner = get_vector(i+2,SURFACE);
		var corner0 = get_vector(side0vertex_index,SURFACE);
		var corner1 = get_vector(side1vertex_index,SURFACE);
		
		surface.localToWorld(origincorner);
		surface.localToWorld(corner0);
		surface.localToWorld(corner1);
		
		surface_triangle_side_unit_vectors[i][0].subVectors(corner0,origincorner);
		surface_triangle_side_unit_vectors[i][1].subVectors(corner1,origincorner);
		surface_triangle_side_unit_vectors[i][0].normalize();
		surface_triangle_side_unit_vectors[i][1].normalize();
		
		var flatnet_triangle_side_unit_vector0 = new THREE.Vector2(
				flatnet_vertices.array[side0vertex_index*3 + 0] - flatnet_vertices.array[(i+2)*3 + 0],
				flatnet_vertices.array[side0vertex_index*3 + 1] - flatnet_vertices.array[(i+2)*3 + 1]			
			);
		var flatnet_triangle_side_unit_vector1 = new THREE.Vector2(
				flatnet_vertices.array[side1vertex_index*3 + 0] - flatnet_vertices.array[(i+2)*3 + 0],
				flatnet_vertices.array[side1vertex_index*3 + 1] - flatnet_vertices.array[(i+2)*3 + 1]
			);
		flatnet_triangle_side_unit_vector0.normalize();
		flatnet_triangle_side_unit_vector1.normalize();
		
		var factor = flatnet_triangle_side_unit_vector1.y * flatnet_triangle_side_unit_vector0.x - flatnet_triangle_side_unit_vector1.x * flatnet_triangle_side_unit_vector0.y;
		shear_matrix[i][0] = flatnet_triangle_side_unit_vector1.y / factor;
		shear_matrix[i][1] = flatnet_triangle_side_unit_vector1.x /-factor;
		shear_matrix[i][2] = flatnet_triangle_side_unit_vector0.y /-factor;
		shear_matrix[i][3] = flatnet_triangle_side_unit_vector0.x / factor;
	}
}

function map_from_lattice_to_surface(x,y, net_triangle_index) {
	x -= flatnet_vertices.array[(net_triangle_index+2)*3 + 0];
	y -= flatnet_vertices.array[(net_triangle_index+2)*3 + 1];
	
	var side0_component_length = x * shear_matrix[net_triangle_index][0] + y * shear_matrix[net_triangle_index][1];
	var side1_component_length = x * shear_matrix[net_triangle_index][2] + y * shear_matrix[net_triangle_index][3];
	
	var side0_component = surface_triangle_side_unit_vectors[net_triangle_index][0].clone();
	var side1_component = surface_triangle_side_unit_vectors[net_triangle_index][1].clone();
	side0_component.multiplyScalar(side0_component_length);
	side1_component.multiplyScalar(side1_component_length);
	
	side0_component.multiplyScalar(lattice_scalefactor/LatticeScale);
	side1_component.multiplyScalar(lattice_scalefactor/LatticeScale);
	
	var mappedpoint = new THREE.Vector3();
	mappedpoint.addVectors(side0_component,side1_component);
	mappedpoint.x += surface_vertices.array[(net_triangle_index+2) * 3 + 0];
	mappedpoint.y += surface_vertices.array[(net_triangle_index+2) * 3 + 1];
	mappedpoint.z += surface_vertices.array[(net_triangle_index+2) * 3 + 2];
	
	return mappedpoint;
}

function locate_in_net(x,y) {
	//potential optimization: put these in a tree so you only need to make like 5 checks, not 20.
	//Would need reconciliation with irregularity. Though in that situation you'd probably have a smaller lattice
	for(var i = 0; i < 20; i++ ) {			
		if( point_in_triangle(
				x,y,
				flatnet_vertices.array[net_triangle_vertex_indices[i*3+0] * 3 + 0], flatnet_vertices.array[net_triangle_vertex_indices[i*3+0] * 3 + 1],
				flatnet_vertices.array[net_triangle_vertex_indices[i*3+1] * 3 + 0], flatnet_vertices.array[net_triangle_vertex_indices[i*3+1] * 3 + 1],
				flatnet_vertices.array[net_triangle_vertex_indices[i*3+2] * 3 + 0], flatnet_vertices.array[net_triangle_vertex_indices[i*3+2] * 3 + 1],
				true) )
			return i;
	}
	
	return 666;
}

//a nasty problem causes the 
function locate_in_squarelattice_net(x,y) {
	//so this merits use when net vertices are close to lattice vertices
	//when the capsid isn't closed, it doesn't really matter what lattice vertices are considered to be within it
	//may as well continue using it for the whole lattice at all times, so it's easier.
	for(var i = 0; i < 20; i++ ) {			
		if( point_in_triangle(
				x,y, //yeah, the below is pretty crazy. Think it through and you get it though.
				squarelattice_vertices[  net_vertices_closest_lattice_vertex[  net_triangle_vertex_indices[i*3+0]  ]  *2+0], squarelattice_vertices[net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+0]] * 2 + 1],
				squarelattice_vertices[  net_vertices_closest_lattice_vertex[  net_triangle_vertex_indices[i*3+1]  ]  *2+0], squarelattice_vertices[net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+1]] * 2 + 1],
				squarelattice_vertices[  net_vertices_closest_lattice_vertex[  net_triangle_vertex_indices[i*3+2]  ]  *2+0], squarelattice_vertices[net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+2]] * 2 + 1],
				true) )
			return i;
	}
	
	return 666;
}