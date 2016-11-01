function map_hex_point(squarelattice_position, nettriangle, hexagonlattice_index, LatticeRotationAndScaleMatrix, non_surface_hexamers_multiplier)
{	
	HexagonLattice.geometry.vertices[hexagonlattice_index].copy(squarelattice_position);
	
	apply2Dmatrix( SquareToHexMatrix, 
			HexagonLattice.geometry.vertices[hexagonlattice_index] );
		
	if( nettriangle === 666){
		HexagonLattice.geometry.vertices[hexagonlattice_index].multiplyScalar(non_surface_hexamers_multiplier);
		return;
	}
	
	apply2Dmatrix(LatticeRotationAndScaleMatrix,
			HexagonLattice.geometry.vertices[hexagonlattice_index]);
	map_from_lattice_to_surface( HexagonLattice.geometry.vertices[hexagonlattice_index], nettriangle );
}

var rounded_net = new THREE.BufferAttribute( new Float32Array(22*3), 3 );

function Update_net_variables() {
	var old_net_vertices_closest_lattice_vertex = Array(net_vertices_closest_lattice_vertex.length);
	for(var i = 0, il = net_vertices_closest_lattice_vertex.length; i < il; i++)
		old_net_vertices_closest_lattice_vertex[i] = net_vertices_closest_lattice_vertex[i];
	
	//we're integrating this. Need to apply transformation to first vertex, get nearest, use that as the first vertex.
	for(var i = 0; i < 9; i++) //the first three vertices
		rounded_net.array[i] = setvirus_flatnet_vertices[3][i];
	
	for( var i = 0; i < 3; i++) {
		var netvertex = new THREE.Vector3(rounded_net.array[ i*3+0 ],rounded_net.array[ i*3+1 ],0);
		netvertex.multiplyScalar(1/LatticeScale);
		netvertex.applyAxisAngle(z_central_axis,-LatticeAngle);
		
		var rounded_index = index_of_closest_default_lattice_vertex(netvertex.x,netvertex.y);
		netvertex.copy(squarelattice_vertices[ rounded_index ] );
		apply2Dmatrix(SquareToHexMatrix,netvertex);
		
		rounded_net.array[ i*3+0 ] = netvertex.x;
		rounded_net.array[ i*3+1 ] = netvertex.y;		
	}
	
	deduce_most_of_surface_regular(1, rounded_net);
	
	for( var i = 0; i < 22; i++){
		net_vertices_closest_lattice_vertex[i] = index_of_closest_default_lattice_vertex(rounded_net.array[i*3+0],rounded_net.array[i*3+1]);
	}
	
	//speedup opportunity: this part only exists for one situation, where LatticeScale is very low and such. Could be more specific
	for(var i = 0, il = net_triangle_vertex_indices.length / 3; i < il; i++){
		if(		net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+0]] == net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+1]]
			 || net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+0]] == net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+2]]
			 || net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+1]] == net_vertices_closest_lattice_vertex[net_triangle_vertex_indices[i*3+2]] ) {
			for(var i = 0, il = net_vertices_closest_lattice_vertex.length; i < il; i++)
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
				setvirus_flatnet_vertices[3][side0vertex_index*3 + 0] - setvirus_flatnet_vertices[3][(i+2)*3 + 0],
				setvirus_flatnet_vertices[3][side0vertex_index*3 + 1] - setvirus_flatnet_vertices[3][(i+2)*3 + 1]			
			);
		var flatnet_triangle_side_unit_vector1 = new THREE.Vector2(
				setvirus_flatnet_vertices[3][side1vertex_index*3 + 0] - setvirus_flatnet_vertices[3][(i+2)*3 + 0],
				setvirus_flatnet_vertices[3][side1vertex_index*3 + 1] - setvirus_flatnet_vertices[3][(i+2)*3 + 1]
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

function map_XY_from_lattice_to_surface(x,y, net_triangle_index) {
	var mappedpoint = new THREE.Vector3(x,y,0);
	map_from_lattice_to_surface(mappedpoint, net_triangle_index);	
	return mappedpoint;
}

function map_from_lattice_to_surface(vec, net_triangle_index) {
	//you could have an "if net_triangle_index === 666 return x y"?
	vec.x -= setvirus_flatnet_vertices[3][(net_triangle_index+2)*3 + 0];
	vec.y -= setvirus_flatnet_vertices[3][(net_triangle_index+2)*3 + 1];
	
	var side0_component_length = vec.x * shear_matrix[net_triangle_index][0] + vec.y * shear_matrix[net_triangle_index][1];
	var side1_component_length = vec.x * shear_matrix[net_triangle_index][2] + vec.y * shear_matrix[net_triangle_index][3];
	
	var side0_component = surface_triangle_side_unit_vectors[net_triangle_index][0].clone();
	var side1_component = surface_triangle_side_unit_vectors[net_triangle_index][1].clone();
	side0_component.multiplyScalar(side0_component_length);
	side1_component.multiplyScalar(side1_component_length);
	
	side0_component.multiplyScalar(Lattice_ring_density_factor/LatticeScale);
	side1_component.multiplyScalar(Lattice_ring_density_factor/LatticeScale);
	
	vec.addVectors(side0_component,side1_component);
	var stickon_vector = new THREE.Vector3(
		surface_vertices.array[(net_triangle_index+2) * 3 + 0],
		surface_vertices.array[(net_triangle_index+2) * 3 + 1],
		surface_vertices.array[(net_triangle_index+2) * 3 + 2] );
	surface.localToWorld( stickon_vector );
//	stickon_vector.multiplyScalar(1/0.995);
	
	vec.add( stickon_vector );
	
//	if(capsidopenness === 0 ) vec.setLength(1/LatticeScale);
}

//obviously, much speedup opportunities
function locate_in_net() {
	//potential optimization: put these in a tree so you only need to make like 5 checks, not 20.
	//Would need reconciliation with irregularity. Though in that situation you'd probably have a smaller lattice
	for(var i = 0; i < 20; i++ ) {			
		if( point_in_triangle(
				x,y,
				setvirus_flatnet_vertices[3][net_triangle_vertex_indices[i*3+0] * 3 + 0], setvirus_flatnet_vertices[3][net_triangle_vertex_indices[i*3+0] * 3 + 1],
				setvirus_flatnet_vertices[3][net_triangle_vertex_indices[i*3+1] * 3 + 0], setvirus_flatnet_vertices[3][net_triangle_vertex_indices[i*3+1] * 3 + 1],
				setvirus_flatnet_vertices[3][net_triangle_vertex_indices[i*3+2] * 3 + 0], setvirus_flatnet_vertices[3][net_triangle_vertex_indices[i*3+2] * 3 + 1],
				true) )
			return i;
	}
	
	return 666;
}

function locate_in_squarelattice_net(vec) {
	for(var i = 0, il = net_triangle_vertex_indices.length / 3; i < il; i++ ) {
		if( point_in_triangle_vecs(
				vec.x,vec.y,
				squarelatticevertex_rounded_triangle_vertex(i, 0),
				squarelatticevertex_rounded_triangle_vertex(i, 1),
				squarelatticevertex_rounded_triangle_vertex(i, 2),
				true) )
			return i;
	}
	
	return 666;
}

function triangle_bordering_exterior(ourtriangle)
{
	if( ourtriangle === 4 || ourtriangle === 8 || ourtriangle === 12 )
		return false;
	else return true; //and what if it's 666?
}

function double_locate_in_squarelattice_net(vec, ourArray, startingindex) {
	var num_found_so_far = 0;
	for(var i = 0, il = net_triangle_vertex_indices.length / 3; i < il; i++ ) {
		if( point_in_triangle_vecs(
				vec.x,vec.y,
				squarelatticevertex_rounded_triangle_vertex(i, 0),
				squarelatticevertex_rounded_triangle_vertex(i, 1),
				squarelatticevertex_rounded_triangle_vertex(i, 2),
				true) )
		{
			ourArray[startingindex + num_found_so_far] = i;
			num_found_so_far++;
		}
	}
	
	if(num_found_so_far === 1)
	{
		if( point_on_triangle_boundaries(
				vec.x,vec.y,
				squarelatticevertex_rounded_triangle_vertex(ourArray[startingindex], 0),
				squarelatticevertex_rounded_triangle_vertex(ourArray[startingindex], 1),
				squarelatticevertex_rounded_triangle_vertex(ourArray[startingindex], 2),
				true ) 
			)
		{
			ourArray[startingindex + num_found_so_far] = 666; 
			num_found_so_far++;
		}
	}
	
	if(num_found_so_far === 0)
		ourArray[startingindex + num_found_so_far] = 666;
	
//	while(num_found_so_far < 2){ //if you're having this then there's no point in the check above 
//		ourArray[startingindex + num_found_so_far] = 666;
//		num_found_so_far++;
//	}
}

function squarelatticevertex_rounded_triangle_vertex(triangleindex, corner){
	return squarelattice_vertices[  net_vertices_closest_lattice_vertex[  net_triangle_vertex_indices[triangleindex*3+corner]  ] ];
}