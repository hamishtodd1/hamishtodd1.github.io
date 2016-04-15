/*
 * TODO
 * -colors
 * -very minor jitter (?) on DNA and maybe protein
 */

/*
 * To make DNA springy, you put some vertices in the corners, and for every vertex, see which two they are closest to, and that's the edge
 * then get the length down the line connecting those two vertices, and its angle from the line point straight out of the center perpendicularly
 */

function update_bocavirus() {
	//if you're on DNA_CAGE_MODE then we unfold, if you're on STATIC_PROTEIN_MODE we fold.
	
	//Potential speedup: merge proteins
	
	if(isMouseDown) {
		bocavirus_MovementAngle = Mouse_delta.length() / 3;
		bocavirus_MovementAxis.set(-Mouse_delta.y, Mouse_delta.x, 0);
		bocavirus_MovementAxis.normalize();
	}
	else {
		bocavirus_MovementAngle *= 0.93;
	}
	
	var DNA_cage_axis = bocavirus_MovementAxis.clone();
	DNA_cage.worldToLocal(DNA_cage_axis);
	DNA_cage.rotateOnAxis(DNA_cage_axis, bocavirus_MovementAngle);
	DNA_cage.updateMatrixWorld();
	
	for(var i = 0; i<bocavirus_vertices.length; i++){
		initial_bocavirus_vertices[i].applyAxisAngle(bocavirus_MovementAxis,bocavirus_MovementAngle);
		bocavirus_vertices[i].copy(initial_bocavirus_vertices[i]);
	}
	if(MODE==STATIC_PROTEIN_MODE){
		capsidopenness=0;
		for(var i = 0; i<bocavirus_proteins.length; i++){
			bocavirus_proteins[i].material.opacity = 1;
		}
	}
	else if(MODE == STATIC_DNA_MODE){
		capsidopenness+=0.0115;
		if(capsidopenness > 1)
			capsidopenness = 1;
		var time_to_go_transparent = 0.42;
		for(var i = 0; i<bocavirus_proteins.length; i++){
			if(capsidopenness > time_to_go_transparent)
				bocavirus_proteins[i].material.opacity = 1 - (capsidopenness-time_to_go_transparent) / (1-time_to_go_transparent);
			
			var extension_vector = new THREE.Vector3();
			extension_vector.add(initial_bocavirus_vertices[i*3+0]);
			extension_vector.add(initial_bocavirus_vertices[i*3+1]);
			extension_vector.add(initial_bocavirus_vertices[i*3+2]);
			extension_vector.normalize();
			extension_vector.multiplyScalar(capsidopenness*capsidopenness*5);
			
			for(var j = 0; j<3; j++)
				bocavirus_vertices[i*3+j].add(extension_vector);
		}		
	}
	
	for(var i = 0; i<bocavirus_proteins.length; i++){
		fix_protein_to_anchors_vecs(
				bocavirus_vertices[i*3+0],
				bocavirus_vertices[i*3+1],
				bocavirus_vertices[i*3+2],
				bocavirus_proteins[i]);		
	}
}

//You could skew the proteins upwards, which might give clear protuberances. But those might be unnoticeable and unnecessary given nice colors
function init_static_capsid() {
	/*
	 * We have its first triangle as an "object", making it easily rotateable
	 * We deduce the surface every frame
	 */
	var bocavirus_surface = new THREE.Mesh(new THREE.BufferGeometry, new THREE.MeshBasicMaterial());
	bocavirus_surface.geometry.addAttribute('position',new THREE.BufferAttribute( new Float32Array( 22 * 3 ), 3 ));

	var bocavirus_firstriangle_vertices = Array(3);
	bocavirus_firstriangle_vertices[0] = new THREE.Vector3(0, 		1,   PHI);
	bocavirus_firstriangle_vertices[1] = new THREE.Vector3(0,		-1,  PHI);
	bocavirus_firstriangle_vertices[2] = new THREE.Vector3( PHI,	0, 	 1);
	for(var i = 0; i < bocavirus_firstriangle_vertices.length; i++){
		bocavirus_firstriangle_vertices[i].multiplyScalar(1.45);
		bocavirus_surface.geometry.attributes.position.setXYZ(i,bocavirus_firstriangle_vertices[i].x,bocavirus_firstriangle_vertices[i].y,bocavirus_firstriangle_vertices[i].z);
	}	
	deduce_most_of_surface_regular(0, bocavirus_surface.geometry.attributes.position);
	for(var i = 0; i<20; i++){
		for(var j = 0; j<3; j++){
			bocavirus_vertices[i*3+j] = new THREE.Vector3(
					bocavirus_surface.geometry.attributes.position.array[net_triangle_vertex_indices[i*3+j]*3+0],
					bocavirus_surface.geometry.attributes.position.array[net_triangle_vertex_indices[i*3+j]*3+1],
					bocavirus_surface.geometry.attributes.position.array[net_triangle_vertex_indices[i*3+j]*3+2]);
			initial_bocavirus_vertices[i*3+j] = bocavirus_vertices[i*3+j].clone();
		}
	}
	
	for(var i = 0; i<bocavirus_proteins.length; i++){
		bocavirus_proteins[i] = new THREE.Mesh( master_protein.geometry.clone(), master_protein.material.clone());
		
		fix_protein_to_anchors_vecs(
				bocavirus_vertices[i*3+0],
				bocavirus_vertices[i*3+1],
				bocavirus_vertices[i*3+2],
				bocavirus_proteins[i]);
	}
	
	{
		lights[0] = new THREE.PointLight( 0xffffff, 0.6 );
		lights[1] = new THREE.PointLight( 0xffffff, 0.6 );
		lights[2] = new THREE.PointLight( 0xffffff, 0.6 );
		lights[3] = new THREE.PointLight( 0xffffff, 0.6 );
		
		lights[0].position.set( 0, 100, 30 );
		lights[1].position.set( 100, 0, 30 );
		lights[2].position.set( -100, 0, 30 );
		lights[3].position.set( 0, -100, 30 );
	}
}

function init_DNA_cage(){
	DNA_cage = new THREE.LineSegments( new THREE.BufferGeometry(), new THREE.LineBasicMaterial({color: 0xf0f00f,vertexColors: THREE.VertexColors}), THREE.LineSegmentsPieces);
	 
	var avg = new THREE.Vector3();
	for(var i = 0; i<DNA_vertices_numbers.length / 3; i++){
		avg.x += DNA_vertices_numbers[i*3+0];
		avg.y += DNA_vertices_numbers[i*3+1];
		avg.z += DNA_vertices_numbers[i*3+2];
	}
	avg.multiplyScalar(3/DNA_vertices_numbers.length);
	var scaleFactor = 0.87*2.3/109; //chosen quite arbitrarily, can change a lot
	for(var i = 0; i<DNA_vertices_numbers.length / 3; i++){
		DNA_vertices_numbers[i*3+0] -= avg.x;
		DNA_vertices_numbers[i*3+1] -= avg.y;
		DNA_vertices_numbers[i*3+2] -= avg.z;
		
		DNA_vertices_numbers[i*3+0] *= scaleFactor;
		DNA_vertices_numbers[i*3+1] *= scaleFactor;
		DNA_vertices_numbers[i*3+2] *= scaleFactor;
	}
	
	
	var yaw_correction_rotation = -0.076; //gotten "heuristically"
	var pitch_correction_rotation = 0.07;
	for(var i = 0; i<60; i++){
		var strand_avg = new THREE.Vector3();
		for(var j = 0; j<50; j++){
			strand_avg.x += DNA_vertices_numbers[(i*50+j)*3+0];
			strand_avg.y += DNA_vertices_numbers[(i*50+j)*3+1];
			strand_avg.z += DNA_vertices_numbers[(i*50+j)*3+2];
		}
		strand_avg.multiplyScalar( 1 / 50);
		
		var yaw_correction_axis = strand_avg.clone();
		yaw_correction_axis.normalize(); //not a great way of doing it.
		for(var j = 0; j<50; j++){
			var ourpoint = new THREE.Vector3(DNA_vertices_numbers[(i*50+j)*3+0],DNA_vertices_numbers[(i*50+j)*3+1],DNA_vertices_numbers[(i*50+j)*3+2]);
			ourpoint.applyAxisAngle(yaw_correction_axis,yaw_correction_rotation);
			
			DNA_vertices_numbers[(i*50+j)*3+0] = ourpoint.x;
			DNA_vertices_numbers[(i*50+j)*3+1] = ourpoint.y;
			DNA_vertices_numbers[(i*50+j)*3+2] = ourpoint.z;
		}

		//so what would be nice would be to rotate them a bit so that you remove those kinks. Some cross product.
		var firstbackbonepoint_index = i * 50;
		var lastbackbonepoint_index = i * 50 + 48;
		var firstbackbonepoint_to_lastbackbonepoint = new THREE.Vector3(
			DNA_vertices_numbers[lastbackbonepoint_index*3+0]-DNA_vertices_numbers[firstbackbonepoint_index*3+0],
			DNA_vertices_numbers[lastbackbonepoint_index*3+1]-DNA_vertices_numbers[firstbackbonepoint_index*3+1],
			DNA_vertices_numbers[lastbackbonepoint_index*3+2]-DNA_vertices_numbers[firstbackbonepoint_index*3+2]);
		var pitch_axis_origin = firstbackbonepoint_to_lastbackbonepoint.clone();
		pitch_axis_origin.multiplyScalar(0.5);
		pitch_axis_origin.x += DNA_vertices_numbers[firstbackbonepoint_index*3+0];
		pitch_axis_origin.y += DNA_vertices_numbers[firstbackbonepoint_index*3+1];
		pitch_axis_origin.z += DNA_vertices_numbers[firstbackbonepoint_index*3+2];
		var pitch_axis = new THREE.Vector3();
		pitch_axis.crossVectors(pitch_axis_origin,firstbackbonepoint_to_lastbackbonepoint);
		pitch_axis.normalize();
		
		for(var j = 0; j<50; j++){
			var ourpoint = new THREE.Vector3(DNA_vertices_numbers[(i*50+j)*3+0],DNA_vertices_numbers[(i*50+j)*3+1],DNA_vertices_numbers[(i*50+j)*3+2]);
			ourpoint.sub(pitch_axis_origin);
			ourpoint.applyAxisAngle(pitch_axis,pitch_correction_rotation);
			ourpoint.add(pitch_axis_origin);
			
			DNA_vertices_numbers[(i*50+j)*3+0] = ourpoint.x;
			DNA_vertices_numbers[(i*50+j)*3+1] = ourpoint.y;
			DNA_vertices_numbers[(i*50+j)*3+2] = ourpoint.z;
		}
	}
	

	
	DNA_cage.geometry.addAttribute( 'position', new THREE.BufferAttribute( DNA_vertices_numbers, 3 ) );
	
	
	var DNA_colors = new Float32Array(DNA_vertices_numbers.length);
	var DNA_line_pairs = new Uint16Array(DNA_vertices_numbers.length / 3 * 2);
	
	for(var i = 0; i<60;i++){ //each of the 60 strands has 50 "atoms"
		for(var j = 0; j<50; j++){
			if(j==49){
				var closest_quadrance_so_far = 10000;
				var closest_index_so_far = 666;
				
				for( var k = 0; k < 60; k++){
					if(k==i)
						continue;
					
					if(quadrance_between_DNA_points(i*50+j,k*50) < closest_quadrance_so_far){
						closest_index_so_far = k*50;
						closest_quadrance_so_far = quadrance_between_DNA_points(i*50+j,k*50);
					}
					if(quadrance_between_DNA_points(i*50+j,k*50+48) < closest_quadrance_so_far){
						closest_index_so_far = k*50+48;
						closest_quadrance_so_far = quadrance_between_DNA_points(i*50+j,k*50+48);
					}
				}
				
				//imaginary backbone
				DNA_line_pairs[ 2*(i*50+j) ] = i*50+j-1;
				DNA_line_pairs[2*(i*50+j)+1] = closest_index_so_far;
				
				//color is a base
				DNA_colors[(i*50+j)*3+0] = 245/255; DNA_colors[(i*50+j)*3+1] = 220/255; DNA_colors[(i*50+j)*3+2] = 176/255;
			}
			else if(j%2==0) {//base
				DNA_line_pairs[ 2*(i*50+j) ] = i*50+j;
				DNA_line_pairs[2*(i*50+j)+1] = i*50+j+1;
				
				//color is backbone
				DNA_colors[(i*50+j)*3+0] = 208/255; DNA_colors[(i*50+j)*3+1] = 87/255; DNA_colors[(i*50+j)*3+2] = 106/255;
			}
			else {//backbone
				DNA_line_pairs[ 2*(i*50+j) ] = i*50+j-1;
				DNA_line_pairs[2*(i*50+j)+1] = i*50+j+1;
				
				//color is a base
				DNA_colors[(i*50+j)*3+0] = 245/255; DNA_colors[(i*50+j)*3+1] = 220/255; DNA_colors[(i*50+j)*3+2] = 176/255;
			}
		}
	}
	DNA_cage.geometry.addAttribute( 'color', new THREE.BufferAttribute(DNA_colors, 3) );
	DNA_cage.geometry.setIndex( new THREE.BufferAttribute( DNA_line_pairs, 1 ) );
	
	//because it ain't perfect
	DNA_cage.quaternion.set(-0.0028151799901586245, -0.03798590756432208, -0.09772936010824641, 0.9944838448969249);
}

function quadrance_between_DNA_points(index1,index2){
	var dX = DNA_cage.geometry.attributes.position.array[index1*3+0] - DNA_cage.geometry.attributes.position.array[index2*3+0];
	var dY = DNA_cage.geometry.attributes.position.array[index1*3+1] - DNA_cage.geometry.attributes.position.array[index2*3+1];
	var dZ = DNA_cage.geometry.attributes.position.array[index1*3+2] - DNA_cage.geometry.attributes.position.array[index2*3+2];
	
	return dX*dX + dY*dY + dZ*dZ;
}

