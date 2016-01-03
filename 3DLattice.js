/*
 * Might be nice to have points on sharp corners only? Most shapes combine them though
 * 
 * So maybe things should scale a little, or indeed indefinitely
 * 
 * Speedup: Remove the lines and faces from the sides of the shapes that you can't see. This is trivial, just need a separate material
 * 
 * Ok probably what we want here is a set of points that can very convincingly be laid on pariacoto, and which plausibly derive from the tiling that you have, maybe one layer more or less.
 * 
 * In the meantime a point that ends up on a fivefold corner will be quite alright
 * 
 * But do you want something about merging points together?
 */



function rotate_layer(index,MovementAxis,movementangle){
	var myaxis = MovementAxis.clone();
	Quasi_meshes[index].updateMatrixWorld();
	Quasi_meshes[index].worldToLocal(myaxis);
	var myquaternion = new THREE.Quaternion();
	myquaternion.setFromAxisAngle( myaxis, movementangle );
	Quasi_meshes[index].quaternion.multiply(myquaternion);
	Quasi_meshes[index].updateMatrixWorld();
	
	myquaternion = new THREE.Quaternion();
	myquaternion.setFromAxisAngle( myaxis, movementangle );
	Quasi_outlines[index].quaternion.multiply(myquaternion);
	Quasi_outlines[index].updateMatrixWorld();
}

function sphere_array_rotate(shape_array, MovementAxis,movementangle,quaternion){
	for(var i = 0; i < shape_array.length; i++){		
		shape_array[i].position.applyQuaternion(quaternion);
	}	
}

function attempt_quasiatom_addition_and_return_next_index(ourposition, lowest_unused_index ){
	var multfactor = 1.147;
	QC_atoms.geometry.attributes.position.setXYZ(lowest_unused_index, ourposition.x * multfactor, ourposition.y * multfactor, ourposition.z * multfactor );
	
	for(var k = 0; k < lowest_unused_index; k++){
		var separationX = QC_atoms.geometry.attributes.position.array[k*3+0] - ourposition.x;
		var separationY = QC_atoms.geometry.attributes.position.array[k*3+1] - ourposition.y;
		var separationZ = QC_atoms.geometry.attributes.position.array[k*3+2] - ourposition.z;
		
		if(separationX*separationX+separationY*separationY+separationZ*separationZ < 0.5 ){ //if there's one anywhere near you, we want to overwrite you.
			return lowest_unused_index;
		}		
	}
	
	var wavelength = ourposition.lengthSq();
	wavelength /= 10.9; //apparently as large as we get
	wavelength *= (781-380);
	wavelength += 380;
	if((wavelength >= 380) && (wavelength<440)){
        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	-(wavelength - 440) / (440 - 380),	0,	1);
    }else if((wavelength >= 440) && (wavelength<490)){
        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	0,	(wavelength - 440) / (490 - 440),	1);
    }else if((wavelength >= 490) && (wavelength<510)){
        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	0,	1,	-(wavelength - 510) / (510 - 490));
    }else if((wavelength >= 510) && (wavelength<580)){
        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	(wavelength - 510) / (580 - 510),	1,	0);
    }else if((wavelength >= 580) && (wavelength<645)){
        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	1,	-(wavelength - 645) / (645 - 580),	0);
    }else if((wavelength >= 645) && (wavelength<781)){
    	QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	1,	0,	0);
    }else{
    	QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	0,	0,	0);
    };
		
	return lowest_unused_index + 1; //quasiatom successfully installed!
}

function update_animationprogress(){
	previous_animation_progress = animation_progress;

	if(isMouseDown ){
		var AbsoluteBarLeft = progress_bar.geometry.vertices[0].clone();
		AbsoluteBarLeft.add(progress_bar.geometry.vertices[1]);
		AbsoluteBarLeft.multiplyScalar(0.5);
		AbsoluteBarLeft.add(progress_bar.position);
		var AbsoluteBarRight = progress_bar.geometry.vertices[2].clone();
		AbsoluteBarRight.add(progress_bar.geometry.vertices[3]);
		AbsoluteBarRight.multiplyScalar(0.5);
		AbsoluteBarRight.add(progress_bar.position);
		
		if( !isMouseDown_previously && minimum_distance(AbsoluteBarRight,AbsoluteBarLeft,circle.geometry.vertices[0]) <= 0.8 ) 
			slider_grabbed = true;
	}
	else slider_grabbed = false;
	if(slider_grabbed){
		slider.position.x = circle.geometry.vertices[0].x;
		if(slider.position.x > progress_bar.geometry.vertices[0].x)
			slider.position.x = progress_bar.geometry.vertices[0].x;
		if(slider.position.x < progress_bar.geometry.vertices[3].x)
			slider.position.x = progress_bar.geometry.vertices[3].x;
		
		animation_progress = ( slider.position.x - progress_bar.geometry.vertices[3].x ) / (progress_bar.geometry.vertices[0].x - progress_bar.geometry.vertices[3].x);
	}
}

function update_3DLattice() {
	var rhombohedra_startfadein_time = 0.0001; //arbitrarily low number, just here so it can start itself
	var rhombohedra_convergence_time = 1/6;
	var icosahedra_startfadein_time = rhombohedra_convergence_time;
	var icosahedra_convergence_time = 2/6;
	var triacontahedra_startfadein_time = icosahedra_convergence_time;
	var triacontahedra_convergence_time = 3/6;
	var star_startfadein_time = triacontahedra_convergence_time;
	var star_convergence_time = 4/6;
	var ico_star_startfadein_time = star_convergence_time;
	var ico_star_convergence_time = 5/6;
	var allshape_fadeout_start_time = ico_star_convergence_time;
	var star_bunch_time = triacontahedra_convergence_time + (star_convergence_time - triacontahedra_convergence_time ) * 0.5;
	
	if(animation_progress >= allshape_fadeout_start_time && previous_animation_progress < allshape_fadeout_start_time){
		scene.add(QC_atoms);
	}
	
	
	if(animation_progress < allshape_fadeout_start_time && previous_animation_progress >= allshape_fadeout_start_time){		
		scene.remove(QC_atoms);
	}
	
	update_shape_layer(rhombohedra_startfadein_time, rhombohedra_convergence_time, allshape_fadeout_start_time, icosahedra_convergence_time, Quasi_meshes[0], meshes_original_numbers[0], 0 );
	update_shape_layer(rhombohedra_startfadein_time, rhombohedra_convergence_time, allshape_fadeout_start_time, icosahedra_convergence_time, Quasi_outlines[0], outlines_original_numbers[0], 0 );
	
	update_shape_layer(rhombohedra_convergence_time, icosahedra_convergence_time, allshape_fadeout_start_time, star_convergence_time, Quasi_meshes[1], meshes_original_numbers[1], 1 );
	update_shape_layer(rhombohedra_convergence_time, icosahedra_convergence_time, allshape_fadeout_start_time, star_convergence_time, Quasi_outlines[1], outlines_original_numbers[1], 1 );
	
	update_shape_layer(icosahedra_convergence_time, triacontahedra_convergence_time, allshape_fadeout_start_time, 1, Quasi_meshes[2], meshes_original_numbers[2], 0 );
	update_shape_layer(icosahedra_convergence_time, triacontahedra_convergence_time, allshape_fadeout_start_time, 1, Quasi_outlines[2], outlines_original_numbers[2], 0 );
	
	update_shape_bunch_layer(triacontahedra_convergence_time, star_convergence_time, allshape_fadeout_start_time, ico_star_convergence_time, star_bunch_time, Quasi_meshes[3], meshes_original_numbers[3], 0 );
	update_shape_bunch_layer(triacontahedra_convergence_time, star_convergence_time, allshape_fadeout_start_time, ico_star_convergence_time, star_bunch_time, Quasi_outlines[3], outlines_original_numbers[3], 0 );
	
	update_shape_bunch_layer(ico_star_startfadein_time, ico_star_convergence_time, allshape_fadeout_start_time, 1, ico_star_convergence_time, Quasi_meshes[4], meshes_original_numbers[4], 1 );
	update_shape_bunch_layer(ico_star_startfadein_time, ico_star_convergence_time, allshape_fadeout_start_time, 1, ico_star_convergence_time, Quasi_outlines[4], outlines_original_numbers[4], 1 );
	
	
	if(isMouseDown && !slider_grabbed ) {
		var MovementAxis = new THREE.Vector3(-Mouse_delta.y, Mouse_delta.x, 0);
		MovementAxis.normalize();
		var MovementAngle = Mouse_delta.length() / 3;
		
		rotate_3DPenrose_entirety(MovementAxis,MovementAngle);
	}
}

function rotate_3DPenrose_entirety(MovementAxis,MovementAngle){
	rotate_layer(0,MovementAxis, MovementAngle);
	rotate_layer(1,MovementAxis, MovementAngle);
	rotate_layer(2,MovementAxis, MovementAngle);
	rotate_layer(3,MovementAxis, MovementAngle);
	rotate_layer(4,MovementAxis, MovementAngle);
	
	var atoms_axis = MovementAxis.clone();
	QC_atoms.updateMatrixWorld();
	QC_atoms.worldToLocal(atoms_axis);
	atoms_axis.normalize();
	var atoms_quaternion = new THREE.Quaternion();
	atoms_quaternion.setFromAxisAngle( atoms_axis, MovementAngle );
	QC_atoms.quaternion.multiply(atoms_quaternion);
}

function clamp(val, minval){
	if( val > minval) return val;
	else return minval;
}

var rhombohedron_r = 4/Math.sqrt(10+2*Math.sqrt(5))/Math.sqrt(3);
var rhombohedron_s = rhombohedron_r * HS3;
var rhombohedron_h = Math.sqrt(1-rhombohedron_r*rhombohedron_r);

//the triaconta requires that we actually be point along a 3-fold
function orient_piece(vector_to_point_down, vector_to_line_up_with, myobject){
	var first_rotation_axis = new THREE.Vector3(0,0,1);
	var first_rotation_angle = Math.acos(vector_to_point_down.dot(first_rotation_axis));
	first_rotation_axis.cross(vector_to_point_down);
	first_rotation_axis.normalize();
	var first_rotation_quaternion = new THREE.Quaternion();
	myobject.rotateOnAxis( first_rotation_axis, first_rotation_angle );
	myobject.updateMatrixWorld();
	
	var corner_to_origin = vector_to_point_down.clone();
	corner_to_origin.negate();
	var corner_spindle = vector_to_line_up_with.clone();
	corner_spindle.cross(corner_to_origin);
	var desired_object_Y = corner_to_origin.clone();
	desired_object_Y.cross(corner_spindle);
	myobject.worldToLocal(desired_object_Y);
	
	var Y = new THREE.Vector3(0,1,0); //of course this isn't at a right angle to cornertoorigin
	var second_rotation_axis = desired_object_Y.clone();
	second_rotation_axis.cross(Y);
	second_rotation_axis.normalize();
	var second_rotation_angle = Math.acos(desired_object_Y.dot(Y) / desired_object_Y.length());

	myobject.rotateOnAxis( second_rotation_axis, -second_rotation_angle );
	
	var displacement_vec = vector_to_point_down.clone();
	displacement_vec.normalize();
	myobject.position.copy(displacement_vec);
	myobject.updateMatrixWorld();
}

function init_cubicLattice_stuff() {
	for(var i = 0; i< 12; i++)
		icosahedra_directions[i] = new Uint16Array([0,0,0, 0,0,0, ]);
	
	progress_bar = new THREE.Mesh( new THREE.BoxGeometry( 16, 0.6, 0 ), new THREE.MeshBasicMaterial({color: 0xBBBBBB}) );
	progress_bar.position.y = -12;
	slider = new THREE.Mesh( new THREE.CircleGeometry( 0.8 ), new THREE.MeshBasicMaterial({color: 0x888888}) );
	slider.position.x = progress_bar.geometry.vertices[3].x;
	slider.position.y = progress_bar.position.y;
	slider.position.z = 0.01;

	var number_of_QC_atoms = 177;
	var QC_atoms_geometry = new THREE.BufferGeometry();
	QC_atoms_geometry.addAttribute( 'position', new THREE.BufferAttribute(new Float32Array(number_of_QC_atoms * 3), 3) );
	QC_atoms_geometry.addAttribute( 'color', new THREE.BufferAttribute(new Float32Array(number_of_QC_atoms * 3), 3) );
	QC_atoms = new THREE.Points( QC_atoms_geometry,new THREE.PointCloudMaterial({size: 0.4,vertexColors: THREE.VertexColors}));
	QC_atoms.scale.set(2,2,2);
	
	normalized_virtualdodeca_vertices[0] = new THREE.Vector3(1,-1,1);
	normalized_virtualdodeca_vertices[1] = new THREE.Vector3(0,-1/PHI, PHI);
	normalized_virtualdodeca_vertices[2] = new THREE.Vector3(-1,-1,1);
	normalized_virtualdodeca_vertices[3] = new THREE.Vector3(-PHI,0, 1/PHI);
	normalized_virtualdodeca_vertices[4] = new THREE.Vector3(-PHI,0,-1/PHI);
	normalized_virtualdodeca_vertices[5] = new THREE.Vector3(-1,1,-1);
	normalized_virtualdodeca_vertices[6] = new THREE.Vector3(0, 1/PHI,-PHI);
	normalized_virtualdodeca_vertices[7] = new THREE.Vector3(1,1,-1);
	normalized_virtualdodeca_vertices[8] =  new THREE.Vector3( 1/PHI, PHI,0);
	normalized_virtualdodeca_vertices[9] =  new THREE.Vector3(-1/PHI, PHI,0);
	normalized_virtualdodeca_vertices[10] = new THREE.Vector3(-1,1,1);
	normalized_virtualdodeca_vertices[11] = new THREE.Vector3(0, 1/PHI, PHI);
	normalized_virtualdodeca_vertices[12] = new THREE.Vector3(1,1,1);
	normalized_virtualdodeca_vertices[13] = new THREE.Vector3( PHI,0, 1/PHI);
	normalized_virtualdodeca_vertices[14] = new THREE.Vector3( PHI,0,-1/PHI); //problem with triacontahedra...
	normalized_virtualdodeca_vertices[15] = new THREE.Vector3(1,-1,-1);
	normalized_virtualdodeca_vertices[16] = new THREE.Vector3(0,-1/PHI,-PHI);
	normalized_virtualdodeca_vertices[17] = new THREE.Vector3(-1,-1,-1);
	normalized_virtualdodeca_vertices[18] = new THREE.Vector3(-1/PHI,-PHI,0);
	normalized_virtualdodeca_vertices[19] = new THREE.Vector3( 1/PHI,-PHI,0);
	for(var i = 0; i< normalized_virtualdodeca_vertices.length; i++)
		normalized_virtualdodeca_vertices[i].normalize();
	normalized_virtualico_vertices = Array(12);
	normalized_virtualico_vertices[0] = new THREE.Vector3(0, 		1, 	PHI);
	normalized_virtualico_vertices[1] = new THREE.Vector3( PHI,	0, 	1);
	normalized_virtualico_vertices[2] = new THREE.Vector3(0,		-1, PHI);
	normalized_virtualico_vertices[3] = new THREE.Vector3(-PHI,	0, 	1);
	normalized_virtualico_vertices[4] = new THREE.Vector3(-1, 	PHI,0);
	normalized_virtualico_vertices[5] = new THREE.Vector3( 1, 	PHI,0);
	normalized_virtualico_vertices[6] = new THREE.Vector3( PHI,	0,	-1);
	normalized_virtualico_vertices[7] = new THREE.Vector3( 1,		-PHI,0);
	normalized_virtualico_vertices[8] = new THREE.Vector3(-1,		-PHI,0);
	normalized_virtualico_vertices[9] = new THREE.Vector3(-PHI,	0,	-1);
	normalized_virtualico_vertices[10] = new THREE.Vector3(0, 	1,	-PHI);
	normalized_virtualico_vertices[11] = new THREE.Vector3(0,		-1,	-PHI);
	virtual_icosahedron_axis = new THREE.Vector3(0,0,1);
	for(var i = 0; i < normalized_virtualico_vertices.length; i++) {
		normalized_virtualico_vertices[i].applyAxisAngle(virtual_icosahedron_axis, TAU/4);
		normalized_virtualico_vertices[i].normalize();
	}
	
	var rhombohedron_material = new THREE.MeshBasicMaterial({ //could make lambert if this doesn't work
		color: 0xD56252,
		//shading: THREE.FlatShading, //light sources didn't seem to do anything
		side:THREE.BackSide,
		transparent: true,
		opacity: 0
	});
	var star_material = rhombohedron_material.clone();
	var goldenico_material = new THREE.MeshBasicMaterial({
		color: 0x6ADEFF,
		//shading: THREE.FlatShading,
		side:THREE.BackSide,
		transparent: true,
		opacity: 0
	});
	var ico_star_material = goldenico_material.clone();
	var triacontahedron_material = new THREE.MeshBasicMaterial({
		color: 0xAC83FF,
		//shading: THREE.FlatShading,
		side:THREE.BackSide,
		transparent: true,
		opacity: 0
	});
	var shapes_edgesmaterial = new THREE.MeshBasicMaterial({color:0x000000,transparent:true});
	
	{
		var rhombohedron_h = Math.sqrt(1/3+2/(3*Math.sqrt(5)));
		var rhombohedron_r = 2*Math.sqrt(2/(15+Math.sqrt(5)));
		var rhombohedron_s = 4/Math.sqrt(10+2*Math.sqrt(5));
		
		var rhombohedron_line_pairs = new Uint32Array([
	       0,1,		0,2,	0,3,
	       1,4,		1,5,	2,5,	2,6,	3,6,	3,4,
	       7,4,		7,5,	7,6]);
		var rhombohedron_face_triangles = new Uint32Array([
	       0,1,2,	0,2,3,	0,3,1,
	       2,1,5,	1,3,4,	3,2,6,
	       2,5,6,	1,4,5,	3,6,4,
	       4,6,7,	6,5,7,	5,4,7]);
		var rhombohedron_vertices_numbers = new Float32Array(3*8);
		fill_buffer_with_rhombohedron(new THREE.Vector3(0,0,1), new THREE.Vector3(0,1,0),rhombohedron_vertices_numbers,0);
		
		var center = new THREE.Vector3(0,0,0);
		for(var i = 0; i < 8; i++){
			center.x += rhombohedron_vertices_numbers[i*3+0];
			center.y += rhombohedron_vertices_numbers[i*3+1];
			center.z += rhombohedron_vertices_numbers[i*3+2];
		}
		center.multiplyScalar(1/8);
		for(var i = 0; i < 8; i++){
			rhombohedron_vertices_numbers[i*3+0] -= center.x;
			rhombohedron_vertices_numbers[i*3+1] -= center.y;
			rhombohedron_vertices_numbers[i*3+2] -= center.z;
		}
		//var rightingrotationaxis
		
		var GR_outline_indices = new Uint16Array(12*12*20);
		for(var i = 0; i < 20; i++){
			for(var j = 0; j<12; j++){
				for(var k = 0; k < 12; k++){
					GR_outline_indices[i*12*12 + j*12 + k] = prism_triangle_indices[k] + i*12*6 + j*6;
				}
			}
		}
		
		var golden_rhombohedra_edgematerial = shapes_edgesmaterial.clone();
		
		var golden_rhombohedra_edge_radius = 0.04;
		var corners_for_edge = Array(1,2,3,1,3,7,1,7,2,2,7,3);
		
		for( var i = 0; i < golden_rhombohedra.length; i++) { 
			golden_rhombohedra[i] = new THREE.Mesh( new THREE.BufferGeometry(), rhombohedron_material );
			golden_rhombohedra[i].geometry.addAttribute( 'position', new THREE.BufferAttribute( rhombohedron_vertices_numbers, 3 ) );
			golden_rhombohedra[i].geometry.addAttribute( 'index', new THREE.BufferAttribute( rhombohedron_face_triangles, 1 ) );
			golden_rhombohedra[i].updateMatrixWorld();
			
			for( var j = 0; j < 12; j++) {
				var mycylinder_vertices_numbers = new Float32Array(6*3);
				var corner_index1 = j < 3 ? 0 : Math.floor(j / 3) + 3;
				var corner_index2 = corners_for_edge[j];
				var endA = new THREE.Vector3(
						golden_rhombohedra[i].geometry.attributes.position.array[corner_index1*3+0],
						golden_rhombohedra[i].geometry.attributes.position.array[corner_index1*3+1],
						golden_rhombohedra[i].geometry.attributes.position.array[corner_index1*3+2]);
				var endB = new THREE.Vector3(
						golden_rhombohedra[i].geometry.attributes.position.array[corner_index2*3+0],
						golden_rhombohedra[i].geometry.attributes.position.array[corner_index2*3+1],
						golden_rhombohedra[i].geometry.attributes.position.array[corner_index2*3+2]);
				var peak = new THREE.Vector3();
				peak.addVectors(endA,endB);
				peak.setLength(golden_rhombohedra_edge_radius);
				put_unbased_triangularprism_in_buffer(
						endA,endB,
						mycylinder_vertices_numbers, peak);
				
				var mycylinder_geometry = new THREE.BufferGeometry();
				mycylinder_geometry.addAttribute( 'index', new THREE.BufferAttribute( prism_triangle_indices, 1 ) );
				mycylinder_geometry.addAttribute( 'position', new THREE.BufferAttribute( mycylinder_vertices_numbers, 3 ) );
				
				mycylinder = new THREE.Mesh( mycylinder_geometry, golden_rhombohedra_edgematerial );
				THREE.SceneUtils.attach(mycylinder, scene, golden_rhombohedra[i]);
			}
			
			var dodecahedron_edge = normalized_virtualdodeca_vertices[(i+1)%20].clone();
			dodecahedron_edge.sub(normalized_virtualdodeca_vertices[i]);
			orient_piece(normalized_virtualdodeca_vertices[i], dodecahedron_edge, golden_rhombohedra[i]);
			golden_rhombohedra[i].position.setLength(1.2);
			golden_rhombohedra[i].updateMatrixWorld();
		}
	}
	
	var p = 2*((1+Math.sqrt(5))/Math.sqrt(10+2*Math.sqrt(5)));
	var q = 4/Math.sqrt(10+2*Math.sqrt(5));	
	{
		var triacontahedron_face_indices = new Uint32Array([
			0,1,2,	0,2,3,	0,3,4,	0,4,5,	0,5,1,
			1,6,7,	2,7,8,	3,8,9,	4,9,10,	5,10,6,
			7,2,1,	8,3,2,	9,4,3,	10,5,4,	6,1,5,
			11,7,6,	12,8,7,	13,9,8,	14,10,9,15,6,10, //problem
			
			11,25,7,	7,20,12,	12,24,8,	8,19,13,	13,23,9,
			9,18,14,	14,22,10,	10,17,15,	15,21,6,	6,16,11,
			20,7,25,	24,12,20,	19,8,24,	23,13,19,	18,9,23,
			22,14,18,	17,10,22,	21,15,17,	16,6,21,	25,11,16,
	
			31,30,26,	31,26,27,	31,27,28,	31,28,29,	31,29,30,
			25,26,30,	21,27,26,	22,28,27,	23,29,28,	24,30,29,
			16,21,25,	17,22,21,	18,23,22,	19,24,23,	20,25,24,
			26,25,21,	27,21,22,	28,22,23,	29,23,24,	30,24,25,
		]);
		
		var triacontahedron_line_pairs = new Uint32Array([
		   0,1,		0,2,	0,3,	0,4,	0,5,
		   1,6,		1,7,	2,7,	2,8,	3,8,	3,9,	4,9,	4,10,	5,10,	5,6,
		   6,15,	6,11,	7,11,	7,12,	8,12,	8,13,	9,13,	9,14,	10,14,	10,15,
		   
		   6,16,	11,25,	7,20,	12,24,	8,19,	13,23,	9,18,	14,22,	10,17,	15,21,
		   
		   16,25,	16,21,	17,21,	17,22,	18,22,	18,23,	19,23,	19,24,	20,24,	20,25,
		   21,26,	21,27,	22,27,	22,28,	23,28,	23,29,	24,29,	24,30,	25,30,	25,26,
		   31,26,	31,27,	31,28,	31,29,	31,30]);
		var triacontahedron_r = q/Math.sin(TAU/10)/2;
		var h = Math.sqrt(1-triacontahedron_r*triacontahedron_r);
		var triacontahedron_vertices_numbers = new Float32Array(32*3);
		triacontahedron_vertices_numbers[0] = 0;
		triacontahedron_vertices_numbers[1] = 0;
		triacontahedron_vertices_numbers[2] = 3*h+(1-h)/2;
		triacontahedron_vertices_numbers[31*3+0] = 0;
		triacontahedron_vertices_numbers[31*3+1] = 0;
		triacontahedron_vertices_numbers[31*3+2] = -(3*h+(1-h)/2);
		assign_triaconta_vertices(0,triacontahedron_r,													1,	2*h+(1-h)/2,triacontahedron_vertices_numbers);
		assign_triaconta_vertices(-Math.sin(TAU/10)*PHI*triacontahedron_r, PHI*PHI/2*triacontahedron_r,	6,	 h+(1-h)/2,	triacontahedron_vertices_numbers);
		assign_triaconta_vertices(0,PHI * triacontahedron_r,											11,	  (1-h)/2,	triacontahedron_vertices_numbers);
		
		var corner1 = new THREE.Vector3(triacontahedron_vertices_numbers[0],triacontahedron_vertices_numbers[1],triacontahedron_vertices_numbers[2]);
		var corner2 = new THREE.Vector3(triacontahedron_vertices_numbers[3],triacontahedron_vertices_numbers[4],triacontahedron_vertices_numbers[5]);
		var rotationaxis = corner1.clone();
		rotationaxis.cross(corner2);
		rotationaxis.normalize();
		var rotationangle = Math.acos(corner1.dot(corner2) / corner1.length() / corner2.length());
		for(var i = 0; i < triacontahedron_vertices_numbers.length / 3; i++){
			corner = new THREE.Vector3(triacontahedron_vertices_numbers[i*3+0],triacontahedron_vertices_numbers[i*3+1],triacontahedron_vertices_numbers[i*3+2]);
			corner.applyAxisAngle(rotationaxis,-rotationangle);
			triacontahedron_vertices_numbers[i*3+0] = corner.x;
			triacontahedron_vertices_numbers[i*3+1] = corner.y;
			triacontahedron_vertices_numbers[i*3+2] = corner.z;
		}	
		
//		var virtual_dodeca_rotation_axis = new THREE.Vector3(0,0,-1);
//		for(var i = 0; i<normalized_virtualdodeca_vertices.length; i++)
//			normalized_virtualdodeca_vertices[i].applyAxisAngle(virtual_dodeca_rotation_axis, TAU / 4);
		
		var golden_triacontahedra_edgematerial = shapes_edgesmaterial.clone();
		for( var i = 0; i < golden_triacontahedra.length; i++) { 
			golden_triacontahedra[i] = new THREE.Mesh( new THREE.BufferGeometry(), triacontahedron_material );
			golden_triacontahedra[i].geometry.addAttribute( 'position', new THREE.BufferAttribute( triacontahedron_vertices_numbers, 3 ) );
			golden_triacontahedra[i].geometry.addAttribute( 'index', new THREE.BufferAttribute( triacontahedron_face_indices, 1 ) );
			
			for( var j = 0; j < 60; j++) {
				var mycylinder_vertices_numbers = new Float32Array(16*3);
				var corner_index1 = triacontahedron_line_pairs[j*2];
				var corner_index2 = triacontahedron_line_pairs[j*2+1];
				var endA =new THREE.Vector3(
						golden_triacontahedra[i].geometry.attributes.position.array[corner_index1*3+0],
						golden_triacontahedra[i].geometry.attributes.position.array[corner_index1*3+1],
						golden_triacontahedra[i].geometry.attributes.position.array[corner_index1*3+2]);
				var endB = new THREE.Vector3(
						golden_triacontahedra[i].geometry.attributes.position.array[corner_index2*3+0],
						golden_triacontahedra[i].geometry.attributes.position.array[corner_index2*3+1],
						golden_triacontahedra[i].geometry.attributes.position.array[corner_index2*3+2]);
				var peak = new THREE.Vector3();
				peak.addVectors(endA,endB);
				peak.setLength(golden_rhombohedra_edge_radius);
				put_unbased_triangularprism_in_buffer(
						endA,endB,
						mycylinder_vertices_numbers, peak);
				
				var mycylinder_geometry = new THREE.BufferGeometry();
				mycylinder_geometry.addAttribute( 'index', new THREE.BufferAttribute( cylinder_triangle_indices, 1 ) );
				mycylinder_geometry.addAttribute( 'position', new THREE.BufferAttribute( mycylinder_vertices_numbers, 3 ) );
				
				mycylinder = new THREE.Mesh( mycylinder_geometry, golden_triacontahedra_edgematerial );
				THREE.SceneUtils.attach(mycylinder, scene, golden_triacontahedra[i]);
			}
			
			var dodecahedron_edge;
			if(i==13)
				dodecahedron_edge = normalized_virtualdodeca_vertices[12].clone(); //TODO this is a hack
			else
				dodecahedron_edge = normalized_virtualdodeca_vertices[(i+1)%20].clone();
			dodecahedron_edge.sub(normalized_virtualdodeca_vertices[i]);
			
			orient_piece(normalized_virtualdodeca_vertices[i], dodecahedron_edge, golden_triacontahedra[i]);
			
			var triacontahedra_final_position = rhombohedron_h*3+Math.sqrt(3/10*(5+Math.sqrt(5)));
			golden_triacontahedra[i].position.setLength(triacontahedra_final_position);
			golden_triacontahedra[i].updateMatrixWorld();
		}
	}
	
	{
		var icosahedra_final_position = (PHI-1/2) + 1;
		
		var goldenico_face_indices = new Uint32Array([
			0,1,2,	0,2,3,	0,3,4,	0,4,5,	0,5,1,
			1,6,7,	2,7,8,	3,8,9,	4,9,10,	5,10,6,
			7,2,1,	8,3,2,	9,4,3,	10,5,4,	6,1,5,
			15,7,6,	14,8,7,	13,9,8,	12,10,9,11,6,10,
	
			21,16,17,	21,17,18,	21,18,19,	21,19,20,	21,20,16,
			6,11,15,	10,12,11,	9,13,12,	8,14,13,	7,15,14,
			15,16,20,	11,17,16,	12,18,17,	13,19,18,	14,20,19,
			20,14,15,	16,15,11,	17,11,12,	18,12,13,	19,13,14
			]);
		
		var goldenico_line_pairs = new Uint32Array([
	   	   0,1,		0,2,	0,3,	0,4,	0,5,
	   	   1,6,		1,7,	2,7,	2,8,	3,8,	3,9,	4,9,	4,10,	5,10,	5,6,
	   	   6,11,	6,15,	7,15,	7,14,	8,14,	8,13,	9,13,	9,12,	10,12,	10,11,
	   	   
	   	   15,16,	15,20,	14,20,	14,19,	13,19,	13,18,	12,18,	12,17,	11,17,	11,16,
	   	   21,20,	21,19,	21,18,	21,17,	21,16]);
		
		var goldenico_vertices_numbers = new Float32Array(32*3);
	   	goldenico_vertices_numbers[0] = 0;
	   	goldenico_vertices_numbers[1] = 0;
	   	goldenico_vertices_numbers[2] = 2.5*h;
	   	goldenico_vertices_numbers[21*3+0] = 0;
	   	goldenico_vertices_numbers[21*3+1] = 0;
	   	goldenico_vertices_numbers[21*3+2] = -2.5*h;
	   	assign_goldenico_vertices(0,triacontahedron_r,													1,	1.5*h,	goldenico_vertices_numbers);
	   	assign_goldenico_vertices(-Math.sin(TAU/10)*PHI*triacontahedron_r, PHI*PHI/2*triacontahedron_r,	6,	h/2,	goldenico_vertices_numbers);
	   	
	   	var goldenicos_edgematerial = shapes_edgesmaterial.clone();
	   	
	   	for( var i = 0; i < goldenicos.length; i++) { 
	   		goldenicos[i] = new THREE.Mesh( new THREE.BufferGeometry(), goldenico_material );
	   		goldenicos[i].geometry.addAttribute( 'position', new THREE.BufferAttribute( goldenico_vertices_numbers, 3 ) );
	   		goldenicos[i].geometry.addAttribute( 'index', new THREE.BufferAttribute( goldenico_face_indices, 1 ) );
	   		
	   		for( var j = 0; j < 40; j++) {
				var mycylinder_vertices_numbers = new Float32Array(16*3);
				var corner_index1 = goldenico_line_pairs[j*2];
				var corner_index2 = goldenico_line_pairs[j*2+1];
				var endA =new THREE.Vector3(
						goldenicos[i].geometry.attributes.position.array[corner_index1*3+0],
						goldenicos[i].geometry.attributes.position.array[corner_index1*3+1],
						goldenicos[i].geometry.attributes.position.array[corner_index1*3+2]);
				var endB = new THREE.Vector3(
						goldenicos[i].geometry.attributes.position.array[corner_index2*3+0],
						goldenicos[i].geometry.attributes.position.array[corner_index2*3+1],
						goldenicos[i].geometry.attributes.position.array[corner_index2*3+2]);
				var peak = new THREE.Vector3();
				peak.addVectors(endA,endB);
				peak.setLength(golden_rhombohedra_edge_radius);
				put_unbased_triangularprism_in_buffer(
						endA,endB,
						mycylinder_vertices_numbers, peak);
				
				var mycylinder_geometry = new THREE.BufferGeometry();
				mycylinder_geometry.addAttribute( 'index', new THREE.BufferAttribute( cylinder_triangle_indices, 1 ) );
				mycylinder_geometry.addAttribute( 'position', new THREE.BufferAttribute( mycylinder_vertices_numbers, 3 ) );
				
				mycylinder = new THREE.Mesh( mycylinder_geometry, goldenicos_edgematerial );
				THREE.SceneUtils.attach(mycylinder, scene, goldenicos[i]);
			}
	   		
	   		var icosahedron_edge;
	   		if(i>9)
	   			icosahedron_edge = normalized_virtualico_vertices[i-1].clone();
	   		else
	   			icosahedron_edge = normalized_virtualico_vertices[(i+1)%12].clone();
	   		icosahedron_edge.sub(normalized_virtualico_vertices[i]);
	   		icosahedron_edge.negate();
	   		
	   		orient_piece(normalized_virtualico_vertices[i], icosahedron_edge, goldenicos[i]);
	   		goldenicos[i].position.setLength(icosahedra_final_position);
	   		goldenicos[i].updateMatrixWorld();
	   	}
	}
	
	{
		golden_stars[0] = new THREE.Object3D();
		var golden_star_edgesmaterial = shapes_edgesmaterial.clone();
		for(var j = 0; j < golden_rhombohedra.length; j++) {
			var myrhomb = golden_rhombohedra[j].clone();
			myrhomb.material = star_material;
			for(k = 0; k < myrhomb.children.length; k++)
				myrhomb.children[k].material = golden_star_edgesmaterial;
			myrhomb.position.setLength(1.2); 
			myrhomb.updateMatrixWorld();
			
			THREE.SceneUtils.attach(myrhomb, scene, golden_stars[0]);
		}
		for(var i = 1; i<golden_stars.length; i++)
			golden_stars[i] = golden_stars[0].clone();
		var star_final_position = icosahedra_final_position * 2;
		for(var i = 0; i<golden_stars.length; i++){
			golden_stars[i].position.copy(normalized_virtualico_vertices[i]);
	   		golden_stars[i].position.setLength(star_final_position);
	   		golden_stars[i].updateMatrixWorld();
	   		for(var j = 0; j<golden_stars[i].children.length; j++)
	   			golden_stars[i].children[j].updateMatrixWorld();
		}
	}
	
	{
	   	ico_stars[0] = new THREE.Object3D();
		var ico_star_edgesmaterial = shapes_edgesmaterial.clone();
		for(var j = 0; j < goldenicos.length; j++) {
			if(j > 5) continue; //or 6 others
			var myico = goldenicos[j].clone();
			myico.material = ico_star_material;
			for(k = 0; k < myico.children.length; k++)
				myico.children[k].material = ico_star_edgesmaterial;
			myico.position.setLength((PHI-1/2) + 1);
			myico.updateMatrixWorld();
			
			THREE.SceneUtils.attach(myico, scene, ico_stars[0]);
		}
		var ico_star_final_position = star_final_position;
		for(var i = 0; i<ico_stars.length; i++){
			if(i!=0){
				ico_stars[i] = ico_stars[0].clone();
				
				var myrotation_axis = new THREE.Vector3();
				var myrotation_angle = 0;
				if(i!=ico_stars.length-1) {
					ico_stars[i].rotateOnAxis(normalized_virtualico_vertices[i], TAU / 10);
					myrotation_axis.crossVectors(normalized_virtualico_vertices[i],normalized_virtualico_vertices[0]);
					myrotation_axis.normalize();
					myrotation_angle = Math.acos(normalized_virtualico_vertices[i].dot(normalized_virtualico_vertices[0]));
				} else {
					myrotation_axis.set(0,1,0);
					myrotation_angle = TAU / 2;
				}
				ico_stars[i].rotateOnAxis(myrotation_axis,-myrotation_angle);
			}
			
			ico_stars[i].position.copy(normalized_virtualico_vertices[i]);
	   		ico_stars[i].position.setLength(ico_star_final_position);
	   		ico_stars[i].updateMatrixWorld();
	   		for(var j = 0; j<ico_stars[i].children.length; j++)
	   			ico_stars[i].children[j].updateMatrixWorld();
		}
	}
	
	for(var i = 0; i < 12; i++){
		icosahedra_directions[i][0] = i;
		for(var j = 1; j < 6; j++){
			icosahedra_directions[i][j] = j;
			
			if(i==11){
				if(j==1) icosahedra_directions[i][j] = 6;
				if(j==2) icosahedra_directions[i][j] = 10;
				if(j==3) icosahedra_directions[i][j] = 9;
				if(j==4) icosahedra_directions[i][j] = 8;
				if(j==5) icosahedra_directions[i][j] = 7;
			}
			if(i==1){
				if(j==1) icosahedra_directions[i][j] = 6;
				if(j==2) icosahedra_directions[i][j] = 7;
				if(j==3) icosahedra_directions[i][j] = 2;
				if(j==4) icosahedra_directions[i][j] = 0;
				if(j==5) icosahedra_directions[i][j] = 5;
			}
			if(i==2){
				if(j==1) icosahedra_directions[i][j] = 1;
				if(j==2) icosahedra_directions[i][j] = 7;
				if(j==3) icosahedra_directions[i][j] = 8;
				if(j==4) icosahedra_directions[i][j] = 3;
				if(j==5) icosahedra_directions[i][j] = 0;
			}
			if(i==3){
				if(j==1) icosahedra_directions[i][j] = 0;
				if(j==2) icosahedra_directions[i][j] = 2;
				if(j==3) icosahedra_directions[i][j] = 8;
				if(j==4) icosahedra_directions[i][j] = 9;
				if(j==5) icosahedra_directions[i][j] = 4;
			}
			if(i==4){
				if(j==1) icosahedra_directions[i][j] = 5;
				if(j==2) icosahedra_directions[i][j] = 0;
				if(j==3) icosahedra_directions[i][j] = 3;
				if(j==4) icosahedra_directions[i][j] = 9;
				if(j==5) icosahedra_directions[i][j] = 10;
			}
			if(i==5){
				if(j==1) icosahedra_directions[i][j] = 6;
				if(j==2) icosahedra_directions[i][j] = 1;
				if(j==3) icosahedra_directions[i][j] = 0;
				if(j==4) icosahedra_directions[i][j] = 4;
				if(j==5) icosahedra_directions[i][j] = 10;
			}
			if(i==9){
				if(j==2) icosahedra_directions[i][j] = 3;
				if(j==3) icosahedra_directions[i][j] = 8;
				if(j==4) icosahedra_directions[i][j] = 11;
				if(j==5) icosahedra_directions[i][j] = 10;
				if(j==1) icosahedra_directions[i][j] = 4;
			}
			if(i==6){
				if(j==1) icosahedra_directions[i][j] = 11;
				if(j==2) icosahedra_directions[i][j] = 7;
				if(j==3) icosahedra_directions[i][j] = 1;
				if(j==4) icosahedra_directions[i][j] = 5;
				if(j==5) icosahedra_directions[i][j] = 10;
			}
			if(i==7){
				if(j==1) icosahedra_directions[i][j] = 6;
				if(j==2) icosahedra_directions[i][j] = 11;
				if(j==3) icosahedra_directions[i][j] = 8;
				if(j==4) icosahedra_directions[i][j] = 2;
				if(j==5) icosahedra_directions[i][j] = 1;
			}
			if(i==8){
				if(j==5) icosahedra_directions[i][j] = 3;
				if(j==1) icosahedra_directions[i][j] = 2;
				if(j==2) icosahedra_directions[i][j] = 7;
				if(j==3) icosahedra_directions[i][j] = 11;
				if(j==4) icosahedra_directions[i][j] = 9;
			}
			if(i==10){
				if(j==5) icosahedra_directions[i][j] = 11;
				if(j==1) icosahedra_directions[i][j] = 6;
				if(j==2) icosahedra_directions[i][j] = 5;
				if(j==3) icosahedra_directions[i][j] = 4;
				if(j==4) icosahedra_directions[i][j] = 9;
			}
			
		}
	}
	
	//not doing this in order causes bullshit alpha bugs.
	put_into_two_objects(0,golden_rhombohedra);
   	put_into_two_objects(1,goldenicos);
   	put_into_two_objects(2,golden_triacontahedra);
   	put_bunch_into_two_objects(3,golden_stars);
   	put_bunch_into_two_objects(4,ico_stars);
   	
   	//QC_atoms
   	var lowest_unused_index = 0;
	for(var i = 0; i < golden_rhombohedra.length; i++) {
		for(var j = 0; j<golden_rhombohedra[i].geometry.attributes.position.length/3; j++){
			var new_position = new THREE.Vector3(
					golden_rhombohedra[i].geometry.attributes.position.array[j*3+0],
					golden_rhombohedra[i].geometry.attributes.position.array[j*3+1],
					golden_rhombohedra[i].geometry.attributes.position.array[j*3+2]);
			golden_rhombohedra[i].localToWorld(new_position);
			
			lowest_unused_index = attempt_quasiatom_addition_and_return_next_index(new_position, lowest_unused_index );
		}
	}
	for(var i = 0; i < goldenicos.length; i++) {
		for(var j = 0; j<goldenicos[i].geometry.attributes.position.length/3; j++){
			var new_position = new THREE.Vector3(
					goldenicos[i].geometry.attributes.position.array[j*3+0],
					goldenicos[i].geometry.attributes.position.array[j*3+1],
					goldenicos[i].geometry.attributes.position.array[j*3+2]);
			goldenicos[i].localToWorld(new_position);
			
			lowest_unused_index = attempt_quasiatom_addition_and_return_next_index(new_position, lowest_unused_index );
		}
	}
}

//shape_array -> shape_bunch_array[0]
//shape_array[i] -> shape_bunch_array[0].children[i] - those are the shapes. Their children are their edges.
//shape_array.length -> num_shapes
function put_bunch_into_two_objects(index,shape_bunch_array){
	var num_triangle_indices = shape_bunch_array[0].children[0].geometry.index.array.length;
	var num_edges = shape_bunch_array[0].children[0].children.length;
	var num_vertices = shape_bunch_array[0].children[0].geometry.attributes.position.array.length/3;
	var num_shapes = shape_bunch_array.length * shape_bunch_array[0].children.length;
	
	Quasi_meshes[index] = new THREE.Mesh( new THREE.BufferGeometry(), shape_bunch_array[0].children[0].material.clone() );	
	Quasi_meshes[index].geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(num_shapes * num_vertices * 3), 3 ) );
	Quasi_meshes[index].geometry.addAttribute( 'index', new THREE.BufferAttribute( new Uint16Array(num_triangle_indices*num_shapes), 1 ) );
	meshes_original_numbers[index] = new Float32Array(num_shapes * num_vertices * 3);
	
	Quasi_outlines[index] = new THREE.Mesh(new THREE.BufferGeometry(), shape_bunch_array[0].children[0].children[0].material.clone() );
	Quasi_outlines[index].geometry.addAttribute('position',new THREE.BufferAttribute( new Float32Array(num_shapes*num_edges*6*3), 3 ));
	Quasi_outlines[index].geometry.addAttribute('index',new THREE.BufferAttribute(new Uint16Array(num_shapes*num_edges*12), 1));
	outlines_original_numbers[index] = new Float32Array(num_shapes * num_edges * 6 * 3);
	
	for(var h = 0; h < shape_bunch_array.length; h++){
		for(var i = 0; i<shape_bunch_array[h].children.length; i++){
			var shape_index = h * shape_bunch_array[h].children.length + i;
			for(var j = 0; j<num_vertices; j++){
				var vertindex = shape_index * num_vertices + j;
				var absolute_vertex = new THREE.Vector3(
					shape_bunch_array[h].children[i].geometry.attributes.position.array[j*3+0],
					shape_bunch_array[h].children[i].geometry.attributes.position.array[j*3+1],
					shape_bunch_array[h].children[i].geometry.attributes.position.array[j*3+2]);
				var oldAV = absolute_vertex.clone();
				shape_bunch_array[h].children[i].localToWorld(absolute_vertex);
				Quasi_meshes[index].geometry.attributes.position.array[vertindex*3+0] = absolute_vertex.x;
				Quasi_meshes[index].geometry.attributes.position.array[vertindex*3+1] = absolute_vertex.y;
				Quasi_meshes[index].geometry.attributes.position.array[vertindex*3+2] = absolute_vertex.z;
				meshes_original_numbers[index][vertindex*3+0] = absolute_vertex.x;
				meshes_original_numbers[index][vertindex*3+1] = absolute_vertex.y;
				meshes_original_numbers[index][vertindex*3+2] = absolute_vertex.z;
			}
			for(var j = 0; j < num_triangle_indices; j++){
				Quasi_meshes[index].geometry.index.array[shape_index*num_triangle_indices + j] = shape_bunch_array[h].children[i].geometry.index.array[j] + shape_index * num_vertices;
			}
			
			for(var j = 0; j < num_edges; j++){
				for(var k = 0; k < 6; k++){
					var edge_vertex_index = (shape_index*num_edges+j)*6+k;
					var absolute_vertex = new THREE.Vector3(
							shape_bunch_array[h].children[i].children[j].geometry.attributes.position.array[k*3+0],
							shape_bunch_array[h].children[i].children[j].geometry.attributes.position.array[k*3+1],
							shape_bunch_array[h].children[i].children[j].geometry.attributes.position.array[k*3+2]);
					shape_bunch_array[h].children[i].localToWorld(absolute_vertex);
					Quasi_outlines[index].geometry.attributes.position.array[edge_vertex_index*3+0] = absolute_vertex.x;
					Quasi_outlines[index].geometry.attributes.position.array[edge_vertex_index*3+1] = absolute_vertex.y;
					Quasi_outlines[index].geometry.attributes.position.array[edge_vertex_index*3+2] = absolute_vertex.z;
					outlines_original_numbers[index][edge_vertex_index*3+0] = absolute_vertex.x;
					outlines_original_numbers[index][edge_vertex_index*3+1] = absolute_vertex.y;
					outlines_original_numbers[index][edge_vertex_index*3+2] = absolute_vertex.z;
				}

				for(var k = 0; k < 12; k++){
					var edge_index = shape_index * num_edges + j; 
					Quasi_outlines[index].geometry.index.array[edge_index*12 + k] = prism_triangle_indices[k] + edge_index*6;
				}
			}
		}
	}
}

function put_into_two_objects(index,shape_array){
	var num_triangle_indices = shape_array[0].geometry.index.array.length;
	var num_edges = shape_array[0].children.length;
	var num_vertices = shape_array[0].geometry.attributes.position.array.length/3;
	
	Quasi_meshes[index] = new THREE.Mesh( new THREE.BufferGeometry(), shape_array[0].material.clone() );	
	Quasi_meshes[index].geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(shape_array.length * num_vertices * 3), 3 ) );
	Quasi_meshes[index].geometry.addAttribute( 'index', new THREE.BufferAttribute( new Uint16Array(num_triangle_indices*shape_array.length), 1 ) );
	meshes_original_numbers[index] = new Float32Array(shape_array.length * num_vertices * 3);
	
	Quasi_outlines[index] = new THREE.Mesh(new THREE.BufferGeometry(), shape_array[0].children[0].material.clone() );
	Quasi_outlines[index].geometry.addAttribute('position',new THREE.BufferAttribute( new Float32Array(shape_array.length*num_edges*6*3), 3 ));
	Quasi_outlines[index].geometry.addAttribute('index',new THREE.BufferAttribute(new Uint16Array(shape_array.length*num_edges*12), 1));
	outlines_original_numbers[index] = new Float32Array(shape_array.length*num_edges*6*3);
	
	for(var i = 0; i<shape_array.length; i++){
		for(var j = 0; j<num_vertices; j++){
			var absolute_vertex = new THREE.Vector3(
				shape_array[i].geometry.attributes.position.array[j*3+0],
				shape_array[i].geometry.attributes.position.array[j*3+1],
				shape_array[i].geometry.attributes.position.array[j*3+2]);
			var oldAV = absolute_vertex.clone();
			shape_array[i].localToWorld(absolute_vertex);
			Quasi_meshes[index].geometry.attributes.position.array[(i*num_vertices+j)*3+0] = absolute_vertex.x;
			Quasi_meshes[index].geometry.attributes.position.array[(i*num_vertices+j)*3+1] = absolute_vertex.y;
			Quasi_meshes[index].geometry.attributes.position.array[(i*num_vertices+j)*3+2] = absolute_vertex.z;
			meshes_original_numbers[index][(i*num_vertices+j)*3+0] = absolute_vertex.x;
			meshes_original_numbers[index][(i*num_vertices+j)*3+1] = absolute_vertex.y;
			meshes_original_numbers[index][(i*num_vertices+j)*3+2] = absolute_vertex.z;
		}
		for(var j = 0; j < num_triangle_indices; j++)
			Quasi_meshes[index].geometry.index.array[i*num_triangle_indices + j] = shape_array[i].geometry.index.array[j] + i * num_vertices;
		for(var j = 0; j < num_edges; j++){
			for(var k = 0; k < 6; k++){
				var absolute_vertex = new THREE.Vector3(
						shape_array[i].children[j].geometry.attributes.position.array[k*3+0],
						shape_array[i].children[j].geometry.attributes.position.array[k*3+1],
						shape_array[i].children[j].geometry.attributes.position.array[k*3+2]);
				shape_array[i].localToWorld(absolute_vertex);
				Quasi_outlines[index].geometry.attributes.position.array[(i*num_edges*6+j*6+k)*3+0] = absolute_vertex.x;
				Quasi_outlines[index].geometry.attributes.position.array[(i*num_edges*6+j*6+k)*3+1] = absolute_vertex.y;
				Quasi_outlines[index].geometry.attributes.position.array[(i*num_edges*6+j*6+k)*3+2] = absolute_vertex.z;
				outlines_original_numbers[index][(i*num_edges*6+j*6+k)*3+0] = absolute_vertex.x;
				outlines_original_numbers[index][(i*num_edges*6+j*6+k)*3+1] = absolute_vertex.y;
				outlines_original_numbers[index][(i*num_edges*6+j*6+k)*3+2] = absolute_vertex.z;
			}
		}
		for(var j = 0; j<num_edges; j++){
			for(var k = 0; k < 12; k++){
				Quasi_outlines[index].geometry.index.array[i*num_edges*12 + j*12 + k] = prism_triangle_indices[k] + i*num_edges*6 + j*6;
			}
		}
	}
}

//long axis points down long diagonal, short axis from the center to a vertex. Short axis we think of as y, long as z.
function fill_buffer_with_rhombohedron(long_axis, short_axis,array, starting_index){
	var x_axis = short_axis.clone(); 
	x_axis.cross(long_axis);
	long_axis.normalize();
	short_axis.normalize();
	x_axis.normalize();
	
	var vectors = Array(8);
	vectors[0] = long_axis.clone();
	vectors[0].multiplyScalar(rhombohedron_h*1.5);
	vectors[1] = short_axis.clone();
	vectors[1].multiplyScalar(rhombohedron_r);
	vectors[1].addScaledVector( long_axis, 0.5*rhombohedron_h );
	vectors[2] = short_axis.clone();
	vectors[2].multiplyScalar(-rhombohedron_r/2);
	vectors[2].addScaledVector( x_axis, rhombohedron_s );
	vectors[2].addScaledVector( long_axis, 0.5*rhombohedron_h );
	vectors[3] = short_axis.clone();
	vectors[3].multiplyScalar(-rhombohedron_r/2);
	vectors[3].addScaledVector( x_axis, -rhombohedron_s );
	vectors[3].addScaledVector( long_axis, 0.5*rhombohedron_h );
	vectors[4] = short_axis.clone();
	vectors[4].multiplyScalar( rhombohedron_r/2);
	vectors[4].addScaledVector( x_axis, -rhombohedron_s );
	vectors[4].addScaledVector( long_axis, -0.5*rhombohedron_h );
	vectors[5] = short_axis.clone();
	vectors[5].multiplyScalar( rhombohedron_r/2);
	vectors[5].addScaledVector( x_axis, rhombohedron_s );
	vectors[5].addScaledVector( long_axis, -0.5*rhombohedron_h );
	vectors[6] = short_axis.clone();
	vectors[6].multiplyScalar(-rhombohedron_r);
	vectors[6].addScaledVector( long_axis, -0.5*rhombohedron_h );
	vectors[7] = long_axis.clone();
	vectors[7].multiplyScalar(-rhombohedron_h*1.5);

	for(var i = 0; i<vectors.length; i++){
		array[starting_index+i*3+0] = vectors[i].x;
		array[starting_index+i*3+1] = vectors[i].y;
		array[starting_index+i*3+2] = vectors[i].z;
	}
}
 
function update_shape_layer(start_fadein_time, convergence_time, start_fadeout_time, removal_time, ourmesh, original_vertices_numbers, icosahedron_vertices_style ){
	var vertices_in_shape = ourmesh.geometry.attributes.position.array.length / 3; 
	if(icosahedron_vertices_style)
		vertices_in_shape /= 12;
	else
		vertices_in_shape /= 20;
	
	
	if(	start_fadein_time <= animation_progress && animation_progress <= removal_time ){
		if(	previous_animation_progress < start_fadein_time || removal_time < previous_animation_progress ) {
			scene.add(ourmesh);
		}
	} else {
		if(	start_fadein_time <= previous_animation_progress && previous_animation_progress <= removal_time ) {
			scene.remove(ourmesh);
		}
		return;
	}
	
	var finish_fadein_time = (convergence_time + start_fadein_time ) / 2;
	
	//change 160 if you like - formerly known as "shape_accel"
	var dist = 160 * (animation_progress-convergence_time) * (animation_progress-convergence_time);
	if(animation_progress >= convergence_time)
		dist = 0;
	if( icosahedron_vertices_style ){
		for(var i = 0; i < 12; i++) {
			for( var j = 0; j < vertices_in_shape; j++){
				ourmesh.geometry.attributes.position.array[(i * vertices_in_shape + j) * 3 + 0 ] = original_vertices_numbers[(i * vertices_in_shape + j) * 3 + 0 ] + normalized_virtualico_vertices[i].x * dist;
				ourmesh.geometry.attributes.position.array[(i * vertices_in_shape + j) * 3 + 1 ] = original_vertices_numbers[(i * vertices_in_shape + j) * 3 + 1 ] + normalized_virtualico_vertices[i].y * dist;
				ourmesh.geometry.attributes.position.array[(i * vertices_in_shape + j) * 3 + 2 ] = original_vertices_numbers[(i * vertices_in_shape + j) * 3 + 2 ] + normalized_virtualico_vertices[i].z * dist;
			}
		}
	}
	else {
		for(var i = 0; i< 20; i++){
			for( var j = 0; j < vertices_in_shape; j++){
				ourmesh.geometry.attributes.position.array[(i * vertices_in_shape + j) * 3 + 0 ] = original_vertices_numbers[(i * vertices_in_shape + j) * 3 + 0 ] + normalized_virtualdodeca_vertices[i].x * dist;
				ourmesh.geometry.attributes.position.array[(i * vertices_in_shape + j) * 3 + 1 ] = original_vertices_numbers[(i * vertices_in_shape + j) * 3 + 1 ] + normalized_virtualdodeca_vertices[i].y * dist;
				ourmesh.geometry.attributes.position.array[(i * vertices_in_shape + j) * 3 + 2 ] = original_vertices_numbers[(i * vertices_in_shape + j) * 3 + 2 ] + normalized_virtualdodeca_vertices[i].z * dist;
			}
		}
	}
	ourmesh.geometry.attributes.position.needsUpdate = true;
	
	var our_opacity = 0;
	if( finish_fadein_time < animation_progress && animation_progress < start_fadeout_time)
		our_opacity = 1;
	if( start_fadein_time < animation_progress && animation_progress < finish_fadein_time )
		our_opacity = (animation_progress - start_fadein_time) / (finish_fadein_time-start_fadein_time);
	if( start_fadeout_time < animation_progress && animation_progress < 1 )
		our_opacity = 1 - (animation_progress - start_fadeout_time ) / (1 - start_fadeout_time);
	
	ourmesh.material.opacity = our_opacity;	
}

function update_shape_bunch_layer(start_fadein_time, convergence_time, start_fadeout_time, removal_time, bunch_time, ourmesh, original_vertices_numbers, icosahedra ){
	var vertices_in_shape_bunch = ourmesh.geometry.attributes.position.array.length / 3;
	vertices_in_shape_bunch /= 12;
	var bunch_size = 0;
	if( icosahedra )
		bunch_size = 6;
	else
		bunch_size = 20;
	var vertices_in_shape = vertices_in_shape_bunch / bunch_size;
	
	if(	start_fadein_time <= animation_progress && animation_progress <= removal_time ){
		if(	previous_animation_progress < start_fadein_time || removal_time < previous_animation_progress ) {
			scene.add(ourmesh);
		}
	} else {
		if(	start_fadein_time <= previous_animation_progress && previous_animation_progress <= removal_time ) {
			scene.remove(ourmesh);
		}
		return;
	}
	
	var finish_fadein_time = (convergence_time + start_fadein_time ) / 2;
	
	//change 160 if you like - formerly known as "shape_accel"
	var accel = 160;
	var dist = accel * (animation_progress-convergence_time) * (animation_progress-convergence_time);
	if(animation_progress >= convergence_time)
		dist = 0;
	
	for(var i = 0; i < 12; i++) {
		for( var j = 0; j < vertices_in_shape_bunch; j++){
			var vertindex = i * vertices_in_shape_bunch + j;
			ourmesh.geometry.attributes.position.array[vertindex * 3 + 0 ] = original_vertices_numbers[vertindex * 3 + 0 ] + normalized_virtualico_vertices[i].x * dist;
			ourmesh.geometry.attributes.position.array[vertindex * 3 + 1 ] = original_vertices_numbers[vertindex * 3 + 1 ] + normalized_virtualico_vertices[i].y * dist;
			ourmesh.geometry.attributes.position.array[vertindex * 3 + 2 ] = original_vertices_numbers[vertindex * 3 + 2 ] + normalized_virtualico_vertices[i].z * dist;
		}
	}
	
	var bunch_accel;
	if(icosahedra)
		bunch_accel = accel;
	else
		bunch_accel = accel * 2;
	var bunch_dist = 0.5 * bunch_accel * (animation_progress-bunch_time) * (animation_progress-bunch_time);
	if(animation_progress >= bunch_time)
		bunch_dist = 0;	
	
	for(var h = 0; h < 12; h++){
		for(var i = 0; i<bunch_size; i++){
			for(var j = 0; j < vertices_in_shape; j++){
				var vertindex = h * vertices_in_shape_bunch + i * vertices_in_shape + j;
				if(!icosahedra){
					ourmesh.geometry.attributes.position.array[vertindex * 3 + 0 ] += normalized_virtualdodeca_vertices[i].x * bunch_dist;
					ourmesh.geometry.attributes.position.array[vertindex * 3 + 1 ] += normalized_virtualdodeca_vertices[i].y * bunch_dist;
					ourmesh.geometry.attributes.position.array[vertindex * 3 + 2 ] += normalized_virtualdodeca_vertices[i].z * bunch_dist;
				}
				else {
					//may well have to be smarter about the virtualico vertex that is used. Maybe check angle of them against angle of bunch position and discard
					ourmesh.geometry.attributes.position.array[vertindex * 3 + 0 ] += normalized_virtualico_vertices[ icosahedra_directions[h][i] ].x * bunch_dist;
					ourmesh.geometry.attributes.position.array[vertindex * 3 + 1 ] += normalized_virtualico_vertices[ icosahedra_directions[h][i] ].y * bunch_dist;
					ourmesh.geometry.attributes.position.array[vertindex * 3 + 2 ] += normalized_virtualico_vertices[ icosahedra_directions[h][i] ].z * bunch_dist;
				}
				
//				if(h != 0)
//					{ourmesh.geometry.attributes.position.array[vertindex * 3 + 0 ] = 0; ourmesh.geometry.attributes.position.array[vertindex * 3 + 1 ] = 0; ourmesh.geometry.attributes.position.array[vertindex * 3 + 2 ] = 0;}
//				if(i > 1)
//					{ourmesh.geometry.attributes.position.array[vertindex * 3 + 0 ] = 0; ourmesh.geometry.attributes.position.array[vertindex * 3 + 1 ] = 0; ourmesh.geometry.attributes.position.array[vertindex * 3 + 2 ] = 0;}
			}
		}
	}
	ourmesh.geometry.attributes.position.needsUpdate = true;
	
	var our_opacity = 0;
	if( finish_fadein_time < animation_progress && animation_progress < start_fadeout_time)
		our_opacity = 1;
	if( start_fadein_time < animation_progress && animation_progress < finish_fadein_time )
		our_opacity = (animation_progress - start_fadein_time) / (finish_fadein_time-start_fadein_time);
	if( start_fadeout_time < animation_progress && animation_progress < 1 )
		our_opacity = 1 - (animation_progress - start_fadeout_time ) / (1 - start_fadeout_time);
	
	ourmesh.material.opacity = our_opacity;	
}

function assign_triaconta_vertices(initialX,initialY,initial_index, height, array){
	for(var i = 0; i< 5; i++){
		var theta = i*TAU/5;
		
		array[(initial_index+i)*3+0] =  Math.cos(theta) * initialX + Math.sin(theta) * initialY;
		array[(initial_index+i)*3+1] = -Math.sin(theta) * initialX + Math.cos(theta) * initialY;
		array[(initial_index+i)*3+2] = height;
		
		array[((31-initial_index-i)*3)+0] =  Math.cos(theta+TAU/10) * initialX + Math.sin(theta+TAU/10) * initialY;
		array[((31-initial_index-i)*3)+1] = -Math.sin(theta+TAU/10) * initialX + Math.cos(theta+TAU/10) * initialY;
		array[((31-initial_index-i)*3)+2] = -height;
	}
}

function assign_goldenico_vertices(initialX,initialY,initial_index, height, array){
	for(var i = 0; i< 5; i++){
		var theta = i*TAU/5;
		
		array[(initial_index+i)*3+0] =  Math.cos(theta) * initialX + Math.sin(theta) * initialY;
		array[(initial_index+i)*3+1] = -Math.sin(theta) * initialX + Math.cos(theta) * initialY;
		array[(initial_index+i)*3+2] = height;
		
		array[((21-initial_index-i)*3)+0] =  Math.cos(theta+TAU/10) * initialX + Math.sin(theta+TAU/10) * initialY;
		array[((21-initial_index-i)*3)+1] = -Math.sin(theta+TAU/10) * initialX + Math.cos(theta+TAU/10) * initialY;
		array[((21-initial_index-i)*3)+2] = -height;
	}
}