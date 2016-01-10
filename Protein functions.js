function fix_protein_to_anchors_vecs(desired_corner0,desired_corner1,desired_corner2, myprotein)
{
	fix_protein_to_anchors(
			desired_corner0.x,desired_corner0.y,desired_corner0.z,
			desired_corner1.x,desired_corner1.y,desired_corner1.z,
			desired_corner2.x,desired_corner2.y,desired_corner2.z,
			myprotein);
}

//this function won't alter the passed vectors
function fix_protein_to_anchors(
		desired_corner0x,desired_corner0y,desired_corner0z,
		desired_corner1x,desired_corner1y,desired_corner1z,
		desired_corner2x,desired_corner2y,desired_corner2z,
		myprotein)
{
	var basis_vec1 = new THREE.Vector3(desired_corner1x - desired_corner0x,desired_corner1y - desired_corner0y,desired_corner1z - desired_corner0z);
	var basis_vec2 = new THREE.Vector3(desired_corner2x - desired_corner0x,desired_corner2y - desired_corner0y,desired_corner2z - desired_corner0z);
	var basis_vec0 = new THREE.Vector3();
	//not normalizing (or anything like normalizing) this causes a kind of distortion in "z", but that is probably ok
	basis_vec0.crossVectors(basis_vec1, basis_vec2);
	
	for(var i = 0; i < master_protein.geometry.attributes.position.array.length / 3; i++){
		myprotein.geometry.attributes.position.array[i*3+0] = atom_vertices_components[i*3+0] * basis_vec0.x + atom_vertices_components[i*3+1] * basis_vec1.x + atom_vertices_components[i*3+2] * basis_vec2.x;
		myprotein.geometry.attributes.position.array[i*3+1] = atom_vertices_components[i*3+0] * basis_vec0.y + atom_vertices_components[i*3+1] * basis_vec1.y + atom_vertices_components[i*3+2] * basis_vec2.y;
		myprotein.geometry.attributes.position.array[i*3+2] = atom_vertices_components[i*3+0] * basis_vec0.z + atom_vertices_components[i*3+1] * basis_vec1.z + atom_vertices_components[i*3+2] * basis_vec2.z;
	}
	
	myprotein.position.set(desired_corner0x,desired_corner0y,desired_corner0z);
    myprotein.updateMatrixWorld();
    myprotein.geometry.attributes.position.needsUpdate = true;
}

//this function won't alter the passed vectors
function fix_meshprotein_to_anchors(
		desired_corner0x,desired_corner0y,desired_corner0z,
		desired_corner1x,desired_corner1y,desired_corner1z,
		desired_corner2x,desired_corner2y,desired_corner2z,
		proteinindex)
{
	var basis_vec1 = new THREE.Vector3(desired_corner1x - desired_corner0x,desired_corner1y - desired_corner0y,desired_corner1z - desired_corner0z);
	var basis_vec2 = new THREE.Vector3(desired_corner2x - desired_corner0x,desired_corner2y - desired_corner0y,desired_corner2z - desired_corner0z);
	var basis_vec0 = new THREE.Vector3();
	//not normalizing (or anything like normalizing) this causes a kind of distortion in "z", but that is probably ok
	basis_vec0.crossVectors(basis_vec1, basis_vec2);
	
	for(var i = 0; i < master_protein.geometry.attributes.position.array.length / 3; i++) {
		proteinlattice.geometry.attributes.position.array[(number_of_vertices_in_protein * proteinindex + i )*3+0] = atom_vertices_components[i*3+0] * basis_vec0.x + atom_vertices_components[i*3+1] * basis_vec1.x + atom_vertices_components[i*3+2] * basis_vec2.x + desired_corner0x;
		proteinlattice.geometry.attributes.position.array[(number_of_vertices_in_protein * proteinindex + i )*3+1] = atom_vertices_components[i*3+0] * basis_vec0.y + atom_vertices_components[i*3+1] * basis_vec1.y + atom_vertices_components[i*3+2] * basis_vec2.y + desired_corner0y;
		proteinlattice.geometry.attributes.position.array[(number_of_vertices_in_protein * proteinindex + i )*3+2] = atom_vertices_components[i*3+0] * basis_vec0.z + atom_vertices_components[i*3+1] * basis_vec1.z + atom_vertices_components[i*3+2] * basis_vec2.z + desired_corner0z;
	}
}

function fix_meshprotein_to_anchors_vecs(desired_corner0,desired_corner1,desired_corner2, myprotein)
{
	fix_meshprotein_to_anchors(
			desired_corner0.x,desired_corner0.y,desired_corner0.z,
			desired_corner1.x,desired_corner1.y,desired_corner1.z,
			desired_corner2.x,desired_corner2.y,desired_corner2.z,
			myprotein);
}

function initialize_protein(){
	number_of_vertices_in_protein = protein_vertices_numbers.length / 3;
	
	for(var i = 0; i < protein_vertices_numbers.length; i++){
		protein_vertices_numbers[i] /= 32; 
	}
	
	var threefold_axis = new THREE.Vector3(1,1,1);
	threefold_axis.normalize();
	for(var i = 0; i < protein_vertices_numbers.length / 3 / 3; i++){
		var point = new THREE.Vector3(	protein_vertices_numbers[i*3+0],
										protein_vertices_numbers[i*3+1],
										protein_vertices_numbers[i*3+2]);
		point.applyAxisAngle(threefold_axis, TAU / 3);
		protein_vertices_numbers[i*3 + 0 + protein_vertices_numbers.length / 3] = point.x;
		protein_vertices_numbers[i*3 + 1 + protein_vertices_numbers.length / 3] = point.y;
		protein_vertices_numbers[i*3 + 2 + protein_vertices_numbers.length / 3] = point.z;
		point.applyAxisAngle(threefold_axis, TAU / 3);
		protein_vertices_numbers[i*3 + 0 + 2*protein_vertices_numbers.length / 3] = point.x;
		protein_vertices_numbers[i*3 + 1 + 2*protein_vertices_numbers.length / 3] = point.y;
		protein_vertices_numbers[i*3 + 2 + 2*protein_vertices_numbers.length / 3] = point.z;
	}
	master_protein.geometry.addAttribute( 'position', new THREE.BufferAttribute( protein_vertices_numbers, 3 ) );
	
	for(var i = coarse_protein_triangle_indices.length / 3; i<coarse_protein_triangle_indices.length * 2 / 3; i++){
		coarse_protein_triangle_indices[i] += protein_vertices_numbers.length / 3 / 3;
	}
	for(var i = coarse_protein_triangle_indices.length * 2 / 3; i<coarse_protein_triangle_indices.length; i++){
		coarse_protein_triangle_indices[i] += protein_vertices_numbers.length / 3 / 3 * 2;
	}
	master_protein.geometry.addAttribute( 'index', new THREE.BufferAttribute( coarse_protein_triangle_indices, 1 ) );
	master_protein.geometry.computeFaceNormals();
	master_protein.geometry.computeVertexNormals();
	
	/* for vector (x,y,z), perp distance from the plane perp to the vector (1,1,1) through the origin = abs(x+y+z) / sqrt(3)
	 * It is somewhat arbitrary to define that as the center though. It is a spherical sort of thing after all
	 * In theory you should be able to multiply the below by a scalar without changing bocavirus.
	 * You may want to do this in order to make larger viruses more contiguous.
	 */
	var protein_vertical_center = 0;
	for(var i = 0; i < protein_vertices_numbers.length / 9; i++)
		protein_vertical_center += Math.abs( protein_vertices_numbers[i*3] + protein_vertices_numbers[i*3+1] + protein_vertices_numbers[i*3+2] );
	protein_vertical_center /= (protein_vertices_numbers.length / 9);
	protein_vertical_center /= Math.sqrt(3);
	
	var anchorpointpositions = Array(3);
	for(var i = 0; i< anchorpointpositions.length; i++){
		anchorpointpositions[i] = new THREE.Vector3();
		if(i==0) anchorpointpositions[i].set(1,PHI,0);
		if(i==1) anchorpointpositions[i].set(PHI,0,1);
		if(i==2) anchorpointpositions[i].set(0,1,PHI);
		anchorpointpositions[i].normalize();
		anchorpointpositions[i].multiplyScalar(protein_vertical_center * Math.sin(TAU/5) / (Math.sqrt(3)/12*(3+Math.sqrt(5))));
	}
	
	//to get the components, we need the inverse of the matrix of its current basis vectors
	var basis_vec1 = anchorpointpositions[1].clone();
	basis_vec1.sub(anchorpointpositions[0]);
	var basis_vec2 = anchorpointpositions[2].clone();
	basis_vec2.sub(anchorpointpositions[0]);
	var basis_vec0 = new THREE.Vector3();
	basis_vec0.crossVectors(basis_vec1, basis_vec2);
	var basis_matrix = new THREE.Matrix4();
	basis_matrix.set(	basis_vec0.x,basis_vec1.x,basis_vec2.x,	0,
						basis_vec0.y,basis_vec1.y,basis_vec2.y,	0,
						basis_vec0.z,basis_vec1.z,basis_vec2.z,	0,
						0,0,0,1);
	var conversion_matrix = new THREE.Matrix3();
	conversion_matrix.getInverse(basis_matrix,1);
	
	master_protein.position.copy(anchorpointpositions[0]);
	for(var i = 0; i < master_protein.geometry.attributes.position.array.length / 3; i++){
		master_protein.geometry.attributes.position.array[i*3+0] -= master_protein.position.x; 
		master_protein.geometry.attributes.position.array[i*3+1] -= master_protein.position.y;
		master_protein.geometry.attributes.position.array[i*3+2] -= master_protein.position.z;
	}
	
	atom_vertices_components = new Float32Array( master_protein.geometry.attributes.position.array.length );
	for(var i = 0; i<atom_vertices_components.length; i++){
		atom_vertices_components[i*3+0] = master_protein.geometry.attributes.position.array[i*3+0] * conversion_matrix.elements[0] + master_protein.geometry.attributes.position.array[i*3+1] * conversion_matrix.elements[3] + master_protein.geometry.attributes.position.array[i*3+2] * conversion_matrix.elements[6];
		atom_vertices_components[i*3+1] = master_protein.geometry.attributes.position.array[i*3+0] * conversion_matrix.elements[1] + master_protein.geometry.attributes.position.array[i*3+1] * conversion_matrix.elements[4] + master_protein.geometry.attributes.position.array[i*3+2] * conversion_matrix.elements[7];
		atom_vertices_components[i*3+2] = master_protein.geometry.attributes.position.array[i*3+0] * conversion_matrix.elements[2] + master_protein.geometry.attributes.position.array[i*3+1] * conversion_matrix.elements[5] + master_protein.geometry.attributes.position.array[i*3+2] * conversion_matrix.elements[8];
	}
	
	proteinlattice = new THREE.Mesh( new THREE.BufferGeometry(), master_protein.material.clone());
	proteinlattice.geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(protein_vertices_numbers.length * number_of_proteins_in_lattice), 3 ) );
	proteinlattice.geometry.addAttribute( 'index', new THREE.BufferAttribute( new Uint16Array(coarse_protein_triangle_indices.length * number_of_proteins_in_lattice ), 1 ) );
	for(var i = 0; i < number_of_proteins_in_lattice; i++){
		for(var j = 0; j < coarse_protein_triangle_indices.length; j++){
			proteinlattice.geometry.index[i*coarse_protein_triangle_indices.length + j] = coarse_protein_triangle_indices[j] + number_of_vertices_in_protein * i; 
		}
	}
	
	for(var i = 0; i < protein_vertex_indices.length; i++){
		protein_vertex_indices[i] = new Uint16Array(3);
	}
	var rightmost_index = 0;
	var lowest_unused_protein_index = 0;
	for(var layer = 0; layer < number_of_hexagon_rings; layer++){
		var original_slicelayer_rightmostindex = rightmost_index;
		for(var slice = 0; slice < 6; slice++){
			var nextslicelayer_rightmostindex = original_slicelayer_rightmostindex + 6 * layer + slice * (layer+1); //this is fine
			if(layer == 0) nextslicelayer_rightmostindex += 1;
			for(var tri = 0; tri <= layer; tri++){	
				protein_vertex_indices[lowest_unused_protein_index][0] = rightmost_index + tri;
				protein_vertex_indices[lowest_unused_protein_index][1] = nextslicelayer_rightmostindex + tri;
				protein_vertex_indices[lowest_unused_protein_index][2] = nextslicelayer_rightmostindex + tri + 1;
				
				if(tri == layer && slice == 5){//it connects back to the first
					protein_vertex_indices[lowest_unused_protein_index][0] -= layer * 6;
					protein_vertex_indices[lowest_unused_protein_index][2] -= (layer+1) * 6;
				}
				lowest_unused_protein_index++;

				if(tri != layer ){
					protein_vertex_indices[lowest_unused_protein_index][0] = rightmost_index + tri;
					protein_vertex_indices[lowest_unused_protein_index][1] = nextslicelayer_rightmostindex + tri + 1;
					protein_vertex_indices[lowest_unused_protein_index][2] = rightmost_index + tri + 1;
					
					if(tri == layer-1 && slice == 5) protein_vertex_indices[lowest_unused_protein_index][2] -= layer * 6; //it connects back to the first
					
					lowest_unused_protein_index++;
				}
			}
			rightmost_index += layer;
		}
		if(layer == 0)rightmost_index++;
	}
}