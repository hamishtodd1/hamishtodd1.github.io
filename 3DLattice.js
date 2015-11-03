/*
 * What we're planning is 20 rhomohedra, then 12 icosahedra, then 20 triacontahedra,
 * then 20*12=240 rhombohedra. Maybe just get them in as hexecontahedra
 * Then 5x12=60 icosahedra, then (sigh, violation) 20 triacontahedra AND 12 icosahedra. Then perhaps 20*30 = 360 rhombohedra
 * 
 * So maybe things should scale a little, or indeed indefinitely
 * You can perhaps turn it on one axis which also makes it generate
 * 
 * Remove the lines and faces from the sides of the shapes that you can't see. This is trivial, just need a separate material
 * The most worthwhile deletions would be what you can't see when the stars are in
 * 
 * the random walk: forces are ionic and hydrogen bonds vs electrostatics
 */

function rotate_every_shape_in_array(shape_array, MovementAxis,movementangle,quaternion){
	for(var i = 0; i < shape_array.length; i++){		
		shape_array[i].position.applyQuaternion(quaternion);
		
		var myaxis = MovementAxis.clone();
		shape_array[i].updateMatrixWorld();
		myaxis.add(shape_array[i].position);
		shape_array[i].worldToLocal(myaxis);
		var myquaternion = new THREE.Quaternion();
		myquaternion.setFromAxisAngle( myaxis, movementangle );
		shape_array[i].quaternion.multiply(myquaternion);
		shape_array[i].updateMatrixWorld();
	}	
}

function sphere_array_rotate(shape_array, MovementAxis,movementangle,quaternion){
	for(var i = 0; i < shape_array.length; i++){		
		shape_array[i].position.applyQuaternion(quaternion);
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
	
	previous_animation_progress = animation_progress;
	
	if(	isMouseDown && !isMouseDown_previously && circle.geometry.vertices[0].distanceTo(slider.position) <= 0.8 )
		slider_grabbed = true;
	if(!isMouseDown )
		slider_grabbed = false;
	if(slider_grabbed){
		slider.position.x = circle.geometry.vertices[0].x;
		if(slider.position.x > progress_bar.geometry.vertices[0].x)
			slider.position.x = progress_bar.geometry.vertices[0].x;
		if(slider.position.x < progress_bar.geometry.vertices[3].x)
			slider.position.x = progress_bar.geometry.vertices[3].x;
		
		animation_progress = ( slider.position.x - progress_bar.geometry.vertices[3].x ) / (progress_bar.geometry.vertices[0].x - progress_bar.geometry.vertices[3].x);
	}
	
	if(animation_progress >= allshape_fadeout_start_time && previous_animation_progress < allshape_fadeout_start_time){
		//so you're putting points on vertices of all the icosahedra, except not duplicates...
		//there are vertices that connect:
		/*	5 rhombohedra, 1 icosahedron
		 * 	2 icosahedra, 2 rhomhohedra
		 * 	3 icosahedra, 1 triacontahedra
		 * 	icosahedra, stars
		 * 	stars, triacontahedra
		 * 
		 * The icosas, the triacontas, the 
		 * 
		 * you can get the triacontahedra-only ones withjust the virtual dodecahedron vertices with setlength phi + triacontahedra final position
		 * 
		 * Ahh fuck it, you don't need this. Certainly not for a while
		 */
		
		
		for(var i = 0; i < golden_rhombohedra.length; i++)
			for(var j = 0; j<golden_rhombohedra[i].geometry.attributes.position.length/3; j++){
				QC_atoms[i* (golden_rhombohedra[i].geometry.attributes.position.length/3)+j].position.set(
						golden_rhombohedra[i].geometry.attributes.position.array[j*3+0],
						golden_rhombohedra[i].geometry.attributes.position.array[j*3+1],
						golden_rhombohedra[i].geometry.attributes.position.array[j*3+2]);
				golden_rhombohedra[i].localToWorld(QC_atoms[i* (golden_rhombohedra[i].geometry.attributes.position.length/3)+j].position);
			}
		for(var i = 0; i < goldenicos.length; i++)
			quasiatoms[1][i].position.copy(goldenicos[i].position);
		for(var i = 0; i < golden_triacontahedra.length; i++)
			quasiatoms[2][i].position.copy(golden_triacontahedra[i].position);
		for(var i = 0; i < golden_stars.length; i++)
			quasiatoms[3][i].position.copy(golden_stars[i].position);
		
//		for(var i = 0; i<quasiatoms.length; i++)
//			for(var j = 0; j < quasiatoms[i].length; j++)
//				scene.add(quasiatoms[i][j]);
		for(var i = 0; i<QC_atoms.length; i++)
			scene.add(QC_atoms[i]);
	}
	if(animation_progress < allshape_fadeout_start_time && previous_animation_progress >= allshape_fadeout_start_time){
		for(var i = 0; i<quasiatoms.length; i++)
			for(var j = 0; j < quasiatoms[i].length; j++)
				scene.remove(quasiatoms[i][j]);
		
		for(var i = 0; i<QC_atoms.length; i++)
			scene.remove(QC_atoms[i]);
	}
	logged = 1
	
	var shape_accel = 160;
	
	var rhombohedra_final_position = 1.2;
	update_shape(shape_accel, rhombohedra_startfadein_time, rhombohedra_convergence_time, rhombohedra_final_position, golden_rhombohedra, allshape_fadeout_start_time, icosahedra_convergence_time );
	
	var icosahedra_final_position = (PHI-1/2) + 1;
	update_shape(shape_accel, rhombohedra_convergence_time, icosahedra_convergence_time, icosahedra_final_position, goldenicos, allshape_fadeout_start_time, star_convergence_time );
	
	var triacontahedra_final_position = rhombohedron_h*3+Math.sqrt(3/10*(5+Math.sqrt(5)));
	update_shape(shape_accel, icosahedra_convergence_time, triacontahedra_convergence_time, triacontahedra_final_position, golden_triacontahedra, allshape_fadeout_start_time, 1 );
	
	var star_finishfadein_time = triacontahedra_convergence_time + (star_convergence_time - triacontahedra_convergence_time ) / 4;
	var star_bunch_time = triacontahedra_convergence_time + (star_convergence_time - triacontahedra_convergence_time ) * 0.5;
	var star_final_position = icosahedra_final_position * 2;
	update_shape_bunch(shape_accel, triacontahedra_convergence_time, star_convergence_time, star_final_position, golden_stars, allshape_fadeout_start_time, ico_star_convergence_time,
		rhombohedra_final_position, star_finishfadein_time, star_bunch_time );
	
	var ico_star_final_position = star_final_position;
	var ico_star_finishfadein_time = ico_star_startfadein_time + (ico_star_convergence_time - ico_star_startfadein_time) /  2;
	update_shape_bunch(shape_accel, ico_star_startfadein_time, ico_star_convergence_time, ico_star_final_position, ico_stars, allshape_fadeout_start_time, 1,
		icosahedra_final_position, ico_star_finishfadein_time, ico_star_convergence_time);
	
	
	if(isMouseDown && !slider_grabbed ) {
		var MovementAxis = new THREE.Vector3(-Mouse_delta.y, Mouse_delta.x, 0);
		MovementAxis.normalize();
		var MovementAngle = Mouse_delta.length() / 3;
		var extraquaternion = new THREE.Quaternion();
		extraquaternion.setFromAxisAngle( MovementAxis, MovementAngle );
		
		rotate_every_shape_in_array(golden_rhombohedra, MovementAxis, MovementAngle,extraquaternion);
		rotate_every_shape_in_array(goldenicos, MovementAxis, MovementAngle,extraquaternion);
		rotate_every_shape_in_array(golden_triacontahedra, MovementAxis, MovementAngle,extraquaternion);
		rotate_every_shape_in_array(golden_stars, MovementAxis, MovementAngle,extraquaternion);
		rotate_every_shape_in_array(ico_stars, MovementAxis, MovementAngle,extraquaternion);
		
		sphere_array_rotate(quasiatoms[0], MovementAxis, MovementAngle,extraquaternion);
		sphere_array_rotate(quasiatoms[1], MovementAxis, MovementAngle,extraquaternion);
		sphere_array_rotate(quasiatoms[2], MovementAxis, MovementAngle,extraquaternion);
		sphere_array_rotate(quasiatoms[3], MovementAxis, MovementAngle,extraquaternion);
		
		sphere_array_rotate(QC_atoms, MovementAxis, MovementAngle,extraquaternion);
	}
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
	progress_bar = new THREE.Mesh( new THREE.BoxGeometry( 16, 0.6, 0 ), new THREE.MeshBasicMaterial({color: 0xBBBBBB}) );
	progress_bar.position.y = -12;
	slider = new THREE.Mesh( new THREE.CircleGeometry( 0.8 ), new THREE.MeshBasicMaterial({color: 0x888888}) );
	slider.position.x = progress_bar.geometry.vertices[3].x;
	slider.position.y = progress_bar.position.y;
	slider.position.z = 0.01;
	
	var quasiatom_radius = 0.12;
	//var quasiatom_material = new THREE.MeshBasicMaterial({color: 0x00FFFF});
	quasiatoms[0] = Array(golden_rhombohedra.length);
	quasiatoms[1] = Array(goldenicos.length);
	quasiatoms[2] = Array(golden_triacontahedra.length);
	quasiatoms[3] = Array(golden_stars.length);
	for(var i = 0; i < quasiatoms[0].length; i++)
		quasiatoms[0][i] = new THREE.Mesh( (new THREE.BufferGeometry).fromGeometry(new THREE.SphereGeometry(quasiatom_radius,8,4)),new THREE.MeshBasicMaterial({color: 0xD56252}));
	for(var i = 0; i < quasiatoms[1].length; i++)
		quasiatoms[1][i] = new THREE.Mesh( (new THREE.BufferGeometry).fromGeometry(new THREE.SphereGeometry(quasiatom_radius,8,4)),new THREE.MeshBasicMaterial({color: 0x6ADEFF}));
	for(var i = 0; i < quasiatoms[2].length; i++)
		quasiatoms[2][i] = new THREE.Mesh( (new THREE.BufferGeometry).fromGeometry(new THREE.SphereGeometry(quasiatom_radius,8,4)),new THREE.MeshBasicMaterial({color: 0xAC83FF}));
	for(var i = 0; i < quasiatoms[3].length; i++)
		quasiatoms[3][i] = new THREE.Mesh( (new THREE.BufferGeometry).fromGeometry(new THREE.SphereGeometry(quasiatom_radius,8,4)),new THREE.MeshBasicMaterial({color: 0xD56252}));
	
	for(var i = 0; i < QC_atoms.length; i++)
		QC_atoms[i] = new THREE.Mesh( (new THREE.BufferGeometry).fromGeometry(new THREE.SphereGeometry(quasiatom_radius,8,4)),new THREE.MeshBasicMaterial({color: 0xD56252}));
	
	var virtual_dodecahedron_vertices = Array(20);
	virtual_dodecahedron_vertices[0] = new THREE.Vector3(1,-1,1);
	virtual_dodecahedron_vertices[1] = new THREE.Vector3(0,-1/PHI, PHI);
	virtual_dodecahedron_vertices[2] = new THREE.Vector3(-1,-1,1);
	virtual_dodecahedron_vertices[3] = new THREE.Vector3(-PHI,0, 1/PHI);
	virtual_dodecahedron_vertices[4] = new THREE.Vector3(-PHI,0,-1/PHI);
	virtual_dodecahedron_vertices[5] = new THREE.Vector3(-1,1,-1);
	virtual_dodecahedron_vertices[6] = new THREE.Vector3(0, 1/PHI,-PHI);
	virtual_dodecahedron_vertices[7] = new THREE.Vector3(1,1,-1);
	virtual_dodecahedron_vertices[8] =  new THREE.Vector3( 1/PHI, PHI,0);
	virtual_dodecahedron_vertices[9] =  new THREE.Vector3(-1/PHI, PHI,0);
	virtual_dodecahedron_vertices[10] = new THREE.Vector3(-1,1,1);
	virtual_dodecahedron_vertices[11] = new THREE.Vector3(0, 1/PHI, PHI);
	virtual_dodecahedron_vertices[12] = new THREE.Vector3(1,1,1);
	virtual_dodecahedron_vertices[13] = new THREE.Vector3( PHI,0, 1/PHI);
	virtual_dodecahedron_vertices[14] = new THREE.Vector3( PHI,0,-1/PHI); //problem with triacontahedra...
	virtual_dodecahedron_vertices[15] = new THREE.Vector3(1,-1,-1);
	virtual_dodecahedron_vertices[16] = new THREE.Vector3(0,-1/PHI,-PHI);
	virtual_dodecahedron_vertices[17] = new THREE.Vector3(-1,-1,-1);
	virtual_dodecahedron_vertices[18] = new THREE.Vector3(-1/PHI,-PHI,0);
	virtual_dodecahedron_vertices[19] = new THREE.Vector3( 1/PHI,-PHI,0);
	for(var i = 0; i< virtual_dodecahedron_vertices.length; i++)
		virtual_dodecahedron_vertices[i].normalize();
	var virtual_icosahedron_vertices = Array(12);
	virtual_icosahedron_vertices[0] = new THREE.Vector3(0, 		1, 	PHI);
	virtual_icosahedron_vertices[1] = new THREE.Vector3( PHI,	0, 	1);
	virtual_icosahedron_vertices[2] = new THREE.Vector3(0,		-1, PHI);
	virtual_icosahedron_vertices[3] = new THREE.Vector3(-PHI,	0, 	1);
	virtual_icosahedron_vertices[4] = new THREE.Vector3(-1, 	PHI,0);
	virtual_icosahedron_vertices[5] = new THREE.Vector3( 1, 	PHI,0);
	virtual_icosahedron_vertices[6] = new THREE.Vector3( PHI,	0,	-1);
	virtual_icosahedron_vertices[7] = new THREE.Vector3( 1,		-PHI,0);
	virtual_icosahedron_vertices[8] = new THREE.Vector3(-1,		-PHI,0);
	virtual_icosahedron_vertices[9] = new THREE.Vector3(-PHI,	0,	-1);
	virtual_icosahedron_vertices[10] = new THREE.Vector3(0, 	1,	-PHI);
	virtual_icosahedron_vertices[11] = new THREE.Vector3(0,		-1,	-PHI);
	virtual_icosahedron_axis = new THREE.Vector3(0,0,1);
	for(var i = 0; i < virtual_icosahedron_vertices.length; i++) {
		virtual_icosahedron_vertices[i].applyAxisAngle(virtual_icosahedron_axis, TAU/4);
		virtual_icosahedron_vertices[i].normalize();
	}
	
	var quasicrystalmaterial_line = new THREE.LineBasicMaterial({
		size: 0.065,
		color: 0x0000ff
	});
	var rhombohedron_material = new THREE.MeshBasicMaterial({ //could make lambert if this doesn't work
		color: 0xD56252,
		//shading: THREE.FlatShading, //light sources didn't seem to do anything
		side:THREE.BackSide,
		transparent: true
	});
	var star_material = rhombohedron_material.clone();
	var goldenico_material = new THREE.MeshBasicMaterial({
		color: 0x6ADEFF,
		//shading: THREE.FlatShading,
		side:THREE.BackSide,
		transparent: true
	});
	var ico_star_material = goldenico_material.clone();
	var triacontahedron_material = new THREE.MeshBasicMaterial({
		color: 0xAC83FF,
		//shading: THREE.FlatShading,
		side:THREE.BackSide,
		transparent: true
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
		fill_buffer_with_rhombohedron(new THREE.Vector3(0,0,1), new THREE.Vector3(0,1,0),rhombohedron_vertices_numbers);
		
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
		
		var golden_rhombohedra_edgematerial = shapes_edgesmaterial.clone();
		
		for( var i = 0; i < golden_rhombohedra.length; i++) { 
			golden_rhombohedra[i] = new THREE.Mesh( new THREE.BufferGeometry(), rhombohedron_material );
			golden_rhombohedra[i].geometry.addAttribute( 'position', new THREE.BufferAttribute( rhombohedron_vertices_numbers, 3 ) );
			golden_rhombohedra[i].geometry.addAttribute( 'index', new THREE.BufferAttribute( rhombohedron_face_triangles, 1 ) );
			golden_rhombohedra[i].updateMatrixWorld();
			
			/* We have a vector C which points to your dodecahedron corner, and E, pointing along the edge that your Y axis should end up on
			 * 
			 * 1: point towards your dodecahedron corner by rotating about the axis that is the cross product of C and (0,0,1)
			 * 2: apply that same rotation to the vector (0,1,0), call the result Y
			 * 3: get the vector that is at a right angle to C and in the same plane as C and E, using cross product, call that vector A
			 * 4: get the angle between A and Y
			 * 5: align by rotating around C by that angle
			 * 6: move some amount along C.
			 * 
			 * Going to need to make it a "fill a buffer with this"
			 */
			
			var golden_rhombohedra_edge_radius = 0.03;
			var corners_for_edge = Array(1,2,3,1,3,7,1,7,2,2,7,3);
			for( var j = 0; j < 12; j++) {
				var mycylinder_vertices_numbers = new Float32Array(16*3);
				var corner_index1 = j < 3 ? 0 : Math.floor(j / 3) + 3;
				var corner_index2 = corners_for_edge[j];
				var endA =new THREE.Vector3(
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
				mycylinder_geometry.addAttribute( 'index', new THREE.BufferAttribute( cylinder_triangle_indices, 1 ) );
				mycylinder_geometry.addAttribute( 'position', new THREE.BufferAttribute( mycylinder_vertices_numbers, 3 ) );
				
				mycylinder = new THREE.Mesh( mycylinder_geometry, golden_rhombohedra_edgematerial );
				THREE.SceneUtils.attach(mycylinder, scene, golden_rhombohedra[i]);
			}
			
			var dodecahedron_edge = virtual_dodecahedron_vertices[(i+1)%20].clone();
			dodecahedron_edge.sub(virtual_dodecahedron_vertices[i]);

			orient_piece(virtual_dodecahedron_vertices[i], dodecahedron_edge, golden_rhombohedra[i]);
		}
		
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
		for(var i = 0; i<golden_stars.length; i++){
			golden_stars[i].position.copy(virtual_icosahedron_vertices[i]);
	   		golden_stars[i].position.multiplyScalar(10);
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
		
		//we actually want the threefold axis to rule
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
//		for(var i = 0; i<virtual_dodecahedron_vertices.length; i++)
//			virtual_dodecahedron_vertices[i].applyAxisAngle(virtual_dodeca_rotation_axis, TAU / 4);
		
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
				dodecahedron_edge = virtual_dodecahedron_vertices[12].clone(); //TODO this is a hack
			else
				dodecahedron_edge = virtual_dodecahedron_vertices[(i+1)%20].clone();
			dodecahedron_edge.sub(virtual_dodecahedron_vertices[i]);
			
			orient_piece(virtual_dodecahedron_vertices[i], dodecahedron_edge, golden_triacontahedra[i]);
		}
		
//		var virtual_dodeca_rotation_axis = new THREE.Vector3(0,0,-1);
//		for(var i = 0; i<virtual_dodecahedron_vertices.length; i++)
//			virtual_dodecahedron_vertices[i].applyAxisAngle(virtual_dodeca_rotation_axis, -TAU / 4);
	}
	
	{
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
	   			icosahedron_edge = virtual_icosahedron_vertices[i-1].clone();
	   		else
	   			icosahedron_edge = virtual_icosahedron_vertices[(i+1)%12].clone();
	   		icosahedron_edge.sub(virtual_icosahedron_vertices[i]);
	   		icosahedron_edge.negate();
	   		
	   		orient_piece(virtual_icosahedron_vertices[i], icosahedron_edge, goldenicos[i]);
	   	}
	   	
	   	//same position as the golden stars
	   	ico_stars[0] = new THREE.Object3D();
		var ico_star_edgesmaterial = shapes_edgesmaterial.clone();
		for(var j = 0; j < goldenicos.length; j++) {
			if(j > 5)continue; //or 6 others
			var myico = goldenicos[j].clone();
			myico.material = ico_star_material;
			for(k = 0; k < myico.children.length; k++)
				myico.children[k].material = ico_star_edgesmaterial;
			myico.position.setLength((PHI-1/2) + 1);
			myico.updateMatrixWorld();
			
			THREE.SceneUtils.attach(myico, scene, ico_stars[0]);
		}
		for(var i = 0; i<ico_stars.length; i++){
			if(i!=0){
				ico_stars[i] = ico_stars[0].clone();
				
				var myrotation_axis = new THREE.Vector3();
				var myrotation_angle = 0;
				if(i!=ico_stars.length-1) {
					ico_stars[i].rotateOnAxis(virtual_icosahedron_vertices[i], TAU / 10);
					myrotation_axis.crossVectors(virtual_icosahedron_vertices[i],virtual_icosahedron_vertices[0]);
					myrotation_axis.normalize();
					myrotation_angle = Math.acos(virtual_icosahedron_vertices[i].dot(virtual_icosahedron_vertices[0]));
				} else {
					myrotation_axis.set(0,1,0);
					myrotation_angle = TAU / 2;
				}
				ico_stars[i].rotateOnAxis(myrotation_axis,-myrotation_angle);
			}
	   		
			ico_stars[i].position.copy(virtual_icosahedron_vertices[i]);
	   		ico_stars[i].position.multiplyScalar(10);
		}
	}
}

//long axis points down long diagonal, short axis from the center to a vertex. Short axis we think of as y, long as z.
function fill_buffer_with_rhombohedron(long_axis, short_axis,array){
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
		array[i*3+0] = vectors[i].x;
		array[i*3+1] = vectors[i].y;
		array[i*3+2] = vectors[i].z;
	}
}

function update_shape(accel, start_fadein_time, convergence_time, final_position, shape_array, start_fadeout_time, removal_time ){
	if(	start_fadein_time <= animation_progress && animation_progress <= removal_time ){
		if(	previous_animation_progress < start_fadein_time || removal_time < previous_animation_progress ) {
			for(var i = 0; i < shape_array.length; i++) {
				scene.add(shape_array[i]);
			}
		}
	} else {
		if(	start_fadein_time <= previous_animation_progress && previous_animation_progress <= removal_time ) {
			for(var i = 0; i < shape_array.length; i++) {
				scene.remove(shape_array[i]);
			}
		}
		return;
	}
	
	var finish_fadein_time = (convergence_time + start_fadein_time ) / 2;
	
	var dist = accel * (animation_progress-convergence_time) * (animation_progress-convergence_time);
	if(animation_progress >= convergence_time)
		dist = 0;
	dist += final_position;
	for(var i = 0; i < shape_array.length; i++) {
		shape_array[i].position.setLength(dist);
		shape_array[i].updateMatrixWorld();
	}
	
	var our_opacity = 0;
	if( finish_fadein_time < animation_progress && animation_progress < start_fadeout_time)
		our_opacity = 1;
	if( start_fadein_time < animation_progress && animation_progress < finish_fadein_time )
		our_opacity = (animation_progress - start_fadein_time) / (finish_fadein_time-start_fadein_time);
	if( start_fadeout_time < animation_progress && animation_progress < 1 )
		our_opacity = 1 - (animation_progress - start_fadeout_time ) / (1 - start_fadeout_time);
	
	shape_array[0].material.opacity = our_opacity;
	shape_array[0].children[0].material.opacity = our_opacity;
}

function update_shape_bunch(accel, start_fadein_time, convergence_time, final_position, shape_bunch, start_fadeout_time, removal_time,
							bunch_position, finish_fadein_time, bunch_time ){
	if(	start_fadein_time <= animation_progress && animation_progress <= removal_time ){
		if(	previous_animation_progress < start_fadein_time || removal_time < previous_animation_progress ) {
			for(var i = 0; i < shape_bunch.length; i++) {
				scene.add(shape_bunch[i]);
			}
		}
	} else {
		if(	start_fadein_time <= previous_animation_progress && previous_animation_progress <= removal_time ) {
			for(var i = 0; i < shape_bunch.length; i++) {
				scene.remove(shape_bunch[i]);
			}
		}
		return;
	}
	
	var dist = accel * (animation_progress-convergence_time) * (animation_progress-convergence_time);
	if(animation_progress >= convergence_time)
		dist = 0;
	dist += final_position;
	for(var i = 0; i < golden_stars.length; i++) {
		shape_bunch[i].position.setLength(dist);
		shape_bunch[i].updateMatrixWorld();
	}
	
	var bunch_dist = 0.5 * accel * (animation_progress-bunch_time) * (animation_progress-bunch_time);
	if(animation_progress >= bunch_time)
		bunch_dist = 0;
	bunch_dist += bunch_position;
	for(var i = 0; i< shape_bunch.length; i++) {
		for(var j = 0; j< shape_bunch[i].children.length; j++){
			shape_bunch[i].children[j].position.setLength(bunch_dist);
			shape_bunch[i].children[j].updateMatrixWorld();
		}
	}
	
	var our_opacity = 0;
	if( finish_fadein_time < animation_progress && animation_progress < start_fadeout_time)
		our_opacity = 1;
	if( start_fadein_time < animation_progress && animation_progress < finish_fadein_time )
		our_opacity = (animation_progress - start_fadein_time) / (finish_fadein_time-start_fadein_time);
	if( start_fadeout_time < animation_progress && animation_progress < 1 )
		our_opacity = 1 - (animation_progress - start_fadeout_time ) / (1 - start_fadeout_time);
	
	shape_bunch[0].children[0].material.opacity = our_opacity;
	shape_bunch[0].children[0].children[0].material.opacity = our_opacity;
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