//we shift based on the location of the corner of your cutout pentagon, the "radius".
//If it's smaller than the radius of the green, you start to fade in the second layer.
//If it's  equal   to  the radius of the blue, the second layer is in and the first is out, because the first can have been made to vanish
//If it's smaller than the radius of the blue, you start to fade in the third layer.
//If it's smaller than the radius of the red, the third layer is in and second is out.

//you could find and fill in every trinity of points with a triangle.
//problem: leaves a hold in the pentagons
//Maybe quadrilaterals. This may screw up on a curved surface and would cover everything 4 times
//could try having a flatshaded dodecahedron in there
//or could have an extra thing for all the pentagons
//it would be best to detect what kind of shape you have there, as you may want to colour shapes differently

/*
 * Shouldn't there be one allowing for the fat rhomb and pentagon to rest on the top? Or that simple one allowing bowties? 
 * 
 * Points on the corners should be in.
 */

/*
 * So we could have the square (triangle, and hexagon) lattice be interactive too
 * You could have something clever happen with color wherein two squares side by side will have their colors get closer as they get smaller
 * Argument for is that it justifies the quasisphere coming on, it gets you ready for the controls, and it lets you talk about things in a better order
 * Argument against is that it'd be extremely simple. What would it tell you? Might be a nice demonstration of infinity
 * So: PLAYTEST, ONCE YOU'VE SUBMITTED EGW
 */

function UpdateQuasiSurface(){
	var atanphi = Math.atan(PHI);
	
	var dodeca_openingspeed = 0.029;
	var dodeca_squashingspeed = 0.022;
	if(isMouseDown) {
		if(dodeca_angle === 0 || dodeca_angle === 2*atanphi-TAU/2 ) dodeca_openness += dodeca_openingspeed;
		dodeca_faceflatness += dodeca_squashingspeed; //should really be determined by the difference between dodeca_angle and 0 or
	}
	else {
		dodeca_openness -= dodeca_openingspeed;
		dodeca_faceflatness -= dodeca_squashingspeed;
	}
	
	if(dodeca_openness > 1)
		dodeca_openness = 1;
	if(dodeca_openness < 0)
		dodeca_openness = 0;
	if(dodeca_faceflatness > 1)
		dodeca_faceflatness = 1;
	if(dodeca_faceflatness < 0)
		dodeca_faceflatness = 0;
	
	if(dodeca_openness !== 0 ){
		for(var i = 0; i < quasicutouts.length; i++)
			if((i + 5)%11 < 5 || i > 54) scene.remove(quasicutouts[i]); //hopefully this is fine to happen if it's already in there
		back_hider.position.z = -3;
	}
	if(dodeca_openness === 0){
		for(var i = 0; i < quasicutouts.length; i++)
			if((i + 5)%11 < 5 || i > 54) scene.add(quasicutouts[i]);
		back_hider.position.z = -0.01;
	}
	
	dodeca.material.opacity = (dodeca_faceflatness + dodeca_openness) / 2;	
	deduce_dodecahedron(dodeca_openness);
	
	{
		var normalturningspeed = TAU/5/2; //this is the amount you want to do in a second
		normalturningspeed *= delta_t;
		
		if( !isMouseDown && dodeca_openness === 0) {
			dodeca_angle += normalturningspeed;
		}
		else {
			var dist_from_desired_angle = 666;
			if( atanphi - TAU/4 < dodeca_angle && dodeca_angle < atanphi ) dist_from_desired_angle = Math.abs(dodeca_angle);
			else dist_from_desired_angle = Math.abs(dodeca_angle - (atanphi - TAU/4));
			
			if( atanphi-TAU/2 < dodeca_angle && dodeca_angle < 2*atanphi-TAU/2 )
				dodeca_angle += normalturningspeed * 1.45;
			if( 2*atanphi-TAU/2 < dodeca_angle && dodeca_angle < atanphi - TAU/4 )
				dodeca_angle -= normalturningspeed * 1.45;
			if( atanphi - TAU/4 < dodeca_angle && dodeca_angle < 0 )
				dodeca_angle += normalturningspeed * 1.45;
			if( 0 < dodeca_angle && dodeca_angle < atanphi )
				dodeca_angle -= normalturningspeed * 1.45;
			
			if( Math.abs(dodeca_angle) < normalturningspeed * 1.45 )
				dodeca_angle = 0;
			if( Math.abs(dodeca_angle - (2*atanphi-TAU/2) )  < normalturningspeed * 1.45 )
				dodeca_angle = 2*atanphi-TAU/2;
		}
		
		//we turn you upside-down if you're far off-center
		if( dodeca_angle > atanphi)
			dodeca_angle -= TAU/2;
		
		var inverted = 0;
		if(dodeca_angle < atanphi - TAU/4) {
			for( var i = 0; i < dodeca_vertices_numbers.length / 3; i++) {
				dodeca_vertices_numbers[i*3+0] *= -1;
				dodeca_vertices_numbers[i*3+1] *= -1;
			}
			inverted = 1;
		}
		
		var axis = new THREE.Vector3( 	(dodeca_vertices_numbers[5*3+0] + dodeca_vertices_numbers[6*3+0]) / 2,
										(dodeca_vertices_numbers[5*3+1] + dodeca_vertices_numbers[6*3+1]) / 2,
										(dodeca_vertices_numbers[5*3+2] + dodeca_vertices_numbers[6*3+2]) / 2);
		axis.normalize();
		
		for( var i = 0; i < dodeca_vertices_numbers.length / 3; i++){
			var d = new THREE.Vector3(dodeca_vertices_numbers[i*3+0],dodeca_vertices_numbers[i*3+1],dodeca_vertices_numbers[i*3+2]);
			if(!inverted)
				d.applyAxisAngle(axis, dodeca_angle);
			else d.applyAxisAngle(axis, 2*atanphi - dodeca_angle - TAU/2 );
			dodeca_vertices_numbers[i*3+0] = d.x;
			dodeca_vertices_numbers[i*3+1] = d.y;
			dodeca_vertices_numbers[i*3+2] = d.z;
		}
	}
	
	dodeca.geometry.attributes.position.needsUpdate = true;
}

function MoveQuasiLattice(){
	//might do rotation whatevers here
	if( isMouseDown) {
		var Mousedist = MousePosition.length();
		var OldMousedist = OldMousePosition.length(); //unless the center is going to change?
		if(Mousedist > 0.47){
			var scalefactor = OldMousedist / Mousedist;
			scalefactor = (scalefactor - 1) * 0.685 +1; //0.685 is the drag
			
			cutout_vector0_player.multiplyScalar(scalefactor);
			cutout_vector1_player.multiplyScalar(scalefactor);
			var veclength = cutout_vector0_player.length();
			
			var maxlength = 3.48; //3.48 to make it exact
			if(veclength > maxlength) {
				veclength -= 0.028;
				if(veclength < maxlength)
					veclength = maxlength;
				
				cutout_vector0_player.setLength(veclength);
				cutout_vector1_player.setLength(veclength);
			}
			var minlength = 1.313;
			if(veclength < minlength) {
				veclength += 0.02;
				if(veclength > minlength)
					veclength = minlength;
				
				cutout_vector0_player.setLength(veclength);
				cutout_vector1_player.setLength(veclength);
			}
			
			var MouseAngle = Math.atan2(MousePosition.y, MousePosition.x );
			if(MousePosition.x === 0 && MousePosition.y === 0)
				MouseAngle = 0; //well, undefined
			
			var OldMouseAngle = Math.atan2( OldMousePosition.y, OldMousePosition.x );
			if(OldMousePosition.x === 0 && OldMousePosition.y === 0)
				OldMouseAngle = 0;
			
			var LatticeAngleChange = OldMouseAngle - MouseAngle;
			
			var QuasiLatticeAngle = Math.atan2(cutout_vector0_player.y, cutout_vector0_player.x);
			var newQuasiLatticeAngle = QuasiLatticeAngle + LatticeAngleChange;
			cutout_vector0_player.x = veclength * Math.cos(newQuasiLatticeAngle);
			cutout_vector0_player.y = veclength * Math.sin(newQuasiLatticeAngle);
			cutout_vector1_player.x = veclength * Math.cos(newQuasiLatticeAngle - TAU / 5);
			cutout_vector1_player.y = veclength * Math.sin(newQuasiLatticeAngle - TAU / 5);
		}
	}
	//Quite a few speedup opportunities here
	//to do it generatively it is a question of either... 
	//find every possible two-fold symmetry on the lattice that gets any kind of rhomb...
	//or make things attract each other? Yeah, right.
	
	var closest_stable_point_dist = 666;
	var closest_stable_point_index = 666;
	for( var i = 0; i < stable_points.length; i++){
		if(	stable_points[i].distanceTo(cutout_vector0_player) < closest_stable_point_dist ) //so you sort of need to make sure that the one in the array is as low as possible
		{
			closest_stable_point_index = i;
			closest_stable_point_dist = stable_points[i].distanceTo(cutout_vector0_player);
		}
	}
//	console.log(closest_stable_point_index);
	
	cutout_vector0.copy(stable_points[closest_stable_point_index]);
	cutout_vector1.copy(stable_points[closest_stable_point_index]);
	if(!isMouseDown&&isMouseDown_previously)
		set_stable_point++;
//	cutout_vector0.copy(stable_points[set_stable_point]);
//	cutout_vector1.copy(stable_points[set_stable_point]);	
	cutout_vector1.applyAxisAngle(z_central_axis, -TAU/5);
	
//	console.log("current stable point: " + set_stable_point);
	
	var interpolation_factor = (1-dodeca_openness);
	if(interpolation_factor == 1){ //if they've allowed it to close up, it's now officially snapped
		cutout_vector0_player.copy(cutout_vector0);
		cutout_vector1_player.copy(cutout_vector1);
	}
	
	var cutout_vector0_displayed = new THREE.Vector3();
	var cutout_vector1_displayed = new THREE.Vector3();
	cutout_vector0_displayed.lerpVectors(cutout_vector0_player, cutout_vector0, interpolation_factor);
	cutout_vector1_displayed.lerpVectors(cutout_vector1_player, cutout_vector1, interpolation_factor);
	var factor = cutout_vector1_displayed.y * cutout_vector0_displayed.x - cutout_vector1_displayed.x * cutout_vector0_displayed.y;
	quasi_shear_matrix[0] = cutout_vector1_displayed.y / factor;
	quasi_shear_matrix[1] = cutout_vector1_displayed.x /-factor;
	quasi_shear_matrix[2] = cutout_vector0_displayed.y /-factor;
	quasi_shear_matrix[3] = cutout_vector0_displayed.x / factor;
	
//	if(dodeca_faceflatness != 0 && dodeca_faceflatness < 0.018) 
//		console.log(cutout_vector0_displayed,cutout_vector1_displayed);
//	console.log(cutout_vector0.length(), Math.acos(cutout_vector0.x / cutout_vector0.length()) / TAU);
}

//base goes from c0 to c1
function mirror_point_along_base(ourpoint, c0,c1, lowest_unused_vertex){
	var c0_to_1 = c1.clone();
	c0_to_1.sub(c0);
	var c0_c1_summed_unit = c0.clone();
	c0_c1_summed_unit.add(c1);
	c0_c1_summed_unit.normalize();
	
	var c0_to_point = ourpoint.clone();
	c0_to_point.sub(c0);
	var c1_to_point = ourpoint.clone();
	c1_to_point.sub(c1);
	
	var dist_from_bottom = ourpoint.distanceTo(c0) * get_sin_Vector2(c0_to_point, c0_to_1);
	
//	if(dist_from_bottom < 1) //see we COULD test for this and only do the below if it's true but we wouldn't have the convenient expectations of the indices of inserted points
	var horizontal_dist_from_c0 = Math.sqrt(c0_to_point.lengthSq() - dist_from_bottom * dist_from_bottom );
	var closest_point_on_bottom = c0_to_1.clone();
	closest_point_on_bottom.setLength(c0_to_1.length() - horizontal_dist_from_c0 ); //mirrored
	closest_point_on_bottom.add(c0);
	
	quasicutout_intermediate_vertices[lowest_unused_vertex].copy(c0_c1_summed_unit);
	quasicutout_intermediate_vertices[lowest_unused_vertex].multiplyScalar(dist_from_bottom);
	quasicutout_intermediate_vertices[lowest_unused_vertex].add(closest_point_on_bottom);
	
	quasicutouts_vertices_components[lowest_unused_vertex][0] = quasicutout_intermediate_vertices[lowest_unused_vertex].x * quasi_shear_matrix[0] + quasicutout_intermediate_vertices[lowest_unused_vertex].y * quasi_shear_matrix[1];
	quasicutouts_vertices_components[lowest_unused_vertex][1] = quasicutout_intermediate_vertices[lowest_unused_vertex].x * quasi_shear_matrix[2] + quasicutout_intermediate_vertices[lowest_unused_vertex].y * quasi_shear_matrix[3];
}



function deduce_dodecahedron(openness) {	
	var elevation = (1-openness)*0.5*Math.sqrt(5/2+11/10*Math.sqrt(5));
	
	dodeca_vertices_numbers[0*3+0] = 0;
	dodeca_vertices_numbers[0*3+1] = 0;
	dodeca_vertices_numbers[0*3+2] = elevation;
	
	dodeca_vertices_numbers[1*3+0] = 0;
	dodeca_vertices_numbers[1*3+1] = 0.5/Math.sin(TAU/10);
	dodeca_vertices_numbers[1*3+2] = elevation;
	
	dodeca_vertices_numbers[2*3+0] = PHI/2;
	dodeca_vertices_numbers[2*3+1] = 0.5/Math.sin(TAU/10) - Math.cos(3/20*TAU);
	dodeca_vertices_numbers[2*3+2] = elevation;
	
	var dihedral_angle = 2 * Math.atan(PHI);
	for( var i = 3; i < 46; i++) {
		var theta = TAU / 2;
		if( ((i - 3) % 9 === 0 && i <= 30) ||
			((i - 7) % 9 === 0 && i <= 34) ||
			i === 38 || i === 42
		   )
			theta = dihedral_angle + openness * (TAU/2 - dihedral_angle);
		
		var a_index = dodeca_derivations[i][0];
		var b_index = dodeca_derivations[i][1];
		var c_index = dodeca_derivations[i][2];
		
		var a = new THREE.Vector3( //this is our origin
			dodeca_vertices_numbers[a_index * 3 + 0],
			dodeca_vertices_numbers[a_index * 3 + 1],
			dodeca_vertices_numbers[a_index * 3 + 2]);
		
		var crossbar_unit = new THREE.Vector3(
			dodeca_vertices_numbers[b_index * 3 + 0],
			dodeca_vertices_numbers[b_index * 3 + 1],
			dodeca_vertices_numbers[b_index * 3 + 2]);
		crossbar_unit.sub(a);			
		crossbar_unit.normalize();
	
		var c = new THREE.Vector3(
			dodeca_vertices_numbers[c_index * 3 + 0],
			dodeca_vertices_numbers[c_index * 3 + 1],
			dodeca_vertices_numbers[c_index * 3 + 2]);
		c.sub(a);
		var hinge_origin_length = c.length() * get_cos(crossbar_unit, c);		
		var hinge_origin = new THREE.Vector3(
			crossbar_unit.x * hinge_origin_length,
			crossbar_unit.y * hinge_origin_length,
			crossbar_unit.z * hinge_origin_length);
		
		var c_hinge = new THREE.Vector3();
		c_hinge.subVectors( c, hinge_origin);
		var hinge_length = c_hinge.length();
		var hinge_component = c_hinge.clone();
		hinge_component.multiplyScalar( Math.cos(theta));
			
		var downward_vector_unit = new THREE.Vector3();		
		downward_vector_unit.crossVectors(crossbar_unit, c);
		downward_vector_unit.normalize();
		var downward_component = downward_vector_unit.clone();
		downward_component.multiplyScalar(Math.sin(theta) * hinge_length);
		
		var d = new THREE.Vector3();
		d.addVectors(downward_component, hinge_component);
		d.add( hinge_origin );
		d.add( a );
		
		dodeca_vertices_numbers[i*3+0] = d.x;
		dodeca_vertices_numbers[i*3+1] = d.y;
		dodeca_vertices_numbers[i*3+2] = d.z;
	}
	
	dodeca_vertices_numbers[46*3+0] = -dodeca_vertices_numbers[0];
	dodeca_vertices_numbers[46*3+1] = -dodeca_vertices_numbers[1];
	dodeca_vertices_numbers[46*3+2] = -dodeca_vertices_numbers[2];
}

function initialize_QS_stuff() {
	cutout_vector0 = new THREE.Vector3(0,0.5/Math.sin(TAU/10),0);
	cutout_vector1 = new THREE.Vector3(PHI/2,0.5/Math.sin(TAU/10)-Math.cos(3/20*TAU),0);
	cutout_vector0_player = cutout_vector0.clone();
	cutout_vector1_player = cutout_vector1.clone();
	
	for(var i = 0; i < quasicutout_intermediate_vertices.length; i++ )
		quasicutout_intermediate_vertices[i] = new THREE.Vector3(0,0,0);	
	for(var i = 0; i < quasicutouts_vertices_components.length; i++)
		quasicutouts_vertices_components[i] = new Array(0,0,1);

	var materialx = new THREE.LineBasicMaterial({
 		color: 0x0000ff
 	});
	
 	for( var i = 0; i < quasicutouts.length; i++) { 
 		quasicutouts[i] = new THREE.Line( new THREE.BufferGeometry(), materialx, THREE.LinePieces );
 		quasicutouts[i].geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(quasilattice_default_vertices.length * 6), 3 ) );
 		quasicutouts[i].geometry.setIndex( new THREE.BufferAttribute( quasicutout_line_pairs, 1 ) );
 		for( var j = 0; j < 3; j++){
 			quasicutouts[i].geometry.attributes.position.array[j*3] = (j % 2) * 0.05; 
 			quasicutouts[i].geometry.attributes.position.array[j*3+1] = (Math.floor(j/2)+i) * 0.05;
 	 	}
	}
 	
 	stitchup = new THREE.Line( new THREE.BufferGeometry(), materialx, THREE.LinePieces );
 	stitchup.geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(3000*3), 3 ) );
 	stitchup.geometry.setIndex( new THREE.BufferAttribute( stitchup_line_pairs, 1 ) );
 	
 	var materialf = new THREE.MeshBasicMaterial({color: 0xffff00});
	back_hider = new THREE.Mesh( new THREE.PlaneBufferGeometry( playing_field_width * 2,playing_field_width * 2 ), materialf );
	back_hider.position.z = -0.01;
 	
 	var materialy = new THREE.LineBasicMaterial({
 		color: 0x00ffff,
 		transparent: true,
 		opacity: 0.5
 	});
 	var dodeca_line_pairs = new Uint16Array([
 	    2,1,	1,11,	11,20,	20,29,	29,2,
 	    2,4,	4,5,	5,6,	6,1,
 	    1,13,	13,14,	14,15,	15,11,
 	    11,22,	22,23,	23,24,	24,20,
 	    20,31,	31,32,	32,33,	33,29,
 	    29,39,	39,40,	40,41,	41,2,
 	    
// 	    0,1,0,2 //useful for seeing a triangle
 	    
// 	    4,8,	8,9,	9,10,	10,5,
// 	    13,17,	17,18,	18,19,	19,14,
// 	    22,26,	26,27,	27,28,	28,23,
// 	    31,35,	35,36,	36,37,	37,32,
// 	    39,43,	43,44,	44,45,	45,40
 		]);
 	
 	nearby_quasicutouts = new Array(
 		[45,1,12],
 		[13,0,49],
 		[0,49,6],
 		[49,6,18],
 		[6,18,13],
 		[18,13,0],
 		
 		[19,3,48],
 		[3,48,54],
 		[48,54,666],
 		[54,666,19],
 		[666,19,3],
 		
 		[1,12,23],
 		[24,11,5],
 		[11,5,17],
 		[5,17,29],
 		[17,29,24],
 		[29,24,11],
 		
 		[30,14,4],
 		[14,4,10],
 		[4,10,666],
 		[10,666,30],
 		[666,30,14],
 		
 		[12,23,34],
 		[35,22,16],
 		[22,16,28],
 		[16,28,40],
 		[28,40,35],
 		[40,35,22],
 		
 		[41,25,15],
 		[25,15,21],
 		[15,21,666],
 		[21,666,41],
 		[666,41,25],
 		
 		[23,34,45],
 		[46,33,27],
 		[33,27,39],
 		[27,39,51],
 		[39,51,46],
 		[51,46,33],
 		
 		[52,36,26],
 		[36,26,32],
 		[26,32,666],
 		[32,666,52],
 		[666,52,36],
 		
 		[34,45,1],
 		[2,44,38],
 		[44,38,50],
 		[38,50,7],
 		[50,7,2],
 		[7,2,44],
 		
 		[8,47,37],
 		[47,37,43],
 		[37,43,666],
 		[43,666,8],
 		[666,8,47]
 	);
 	
 	dodeca_geometry = new THREE.BufferGeometry();
 	dodeca_geometry.addAttribute( 'position', new THREE.BufferAttribute( dodeca_vertices_numbers, 3 ) );
 	dodeca_geometry.setIndex( new THREE.BufferAttribute( dodeca_line_pairs, 1 ) );
 	dodeca = new THREE.Line( dodeca_geometry, materialy, THREE.LinePieces );
 	
 	var axis = new THREE.Vector3(0,0,-1);
	var pentagon = Array(5);
	pentagon[0] = new THREE.Vector3(0,0.5/Math.sin(TAU/10),0);
	for(var i = 1; i < 5; i++) {
		pentagon[i] = pentagon[0].clone();
		pentagon[i].applyAxisAngle(axis, i*TAU/5);
	}
	
	var quasilattice_generator = Array(5);
	for(var i = 0; i < 5; i++) {
		quasilattice_generator[i] = pentagon[(i+1)%5].clone();
		quasilattice_generator[i].sub( pentagon[i] );
	}
	
	quasilattice_default_vertices[0] = pentagon[0].clone();
	quasilattice_default_vertices[1] = quasilattice_default_vertices[0].clone(); 	quasilattice_default_vertices[1].add(quasilattice_generator[3]); quasilattice_default_vertices[1].sub(quasilattice_generator[1]);
	quasilattice_default_vertices[2] = quasilattice_default_vertices[0].clone(); 	quasilattice_default_vertices[2].add(quasilattice_generator[3]); quasilattice_default_vertices[2].add(quasilattice_generator[0]);
	quasilattice_default_vertices[4] = quasilattice_default_vertices[2].clone(); 	quasilattice_default_vertices[4].add(quasilattice_generator[4]);
	quasilattice_default_vertices[3] = quasilattice_default_vertices[4].clone(); 	quasilattice_default_vertices[3].sub(quasilattice_generator[3]);
	quasilattice_default_vertices[5] = quasilattice_default_vertices[4].clone(); 	quasilattice_default_vertices[5].sub(quasilattice_generator[2]);
	quasilattice_default_vertices[6] = quasilattice_default_vertices[4].clone(); 	quasilattice_default_vertices[6].add(quasilattice_generator[3]);
//	quasilattice_default_vertices[9] = quasilattice_default_vertices[7].clone(); 	quasilattice_default_vertices[9].add(quasilattice_generator[4]);
//	quasilattice_default_vertices[10] =quasilattice_default_vertices[9].clone();	quasilattice_default_vertices[10].add(quasilattice_generator[0]);
//	quasilattice_default_vertices[7] = quasilattice_default_vertices[3].clone();	quasilattice_default_vertices[7].sub(quasilattice_generator[2]); quasilattice_default_vertices[7].sub(quasilattice_generator[1]);
//	quasilattice_default_vertices[8] = quasilattice_default_vertices[1].clone(); 	quasilattice_default_vertices[8].add(quasilattice_generator[4]);
//	quasilattice_default_vertices[11] = quasilattice_default_vertices[6].clone();	quasilattice_default_vertices[11].sub(quasilattice_generator[2]);
//	quasilattice_default_vertices[12] = quasilattice_default_vertices[8].clone(); 	quasilattice_default_vertices[12].add(quasilattice_generator[3]);
//	quasilattice_default_vertices[13] = quasilattice_default_vertices[12].clone();	quasilattice_default_vertices[13].add(quasilattice_generator[4]);
//	quasilattice_default_vertices[14] = quasilattice_default_vertices[9].clone(); 	quasilattice_default_vertices[14].sub(quasilattice_generator[1]);
//	quasilattice_default_vertices[15] = quasilattice_default_vertices[14].clone(); 	quasilattice_default_vertices[15].sub(quasilattice_generator[2]);
//	quasilattice_default_vertices[16] = quasilattice_default_vertices[15].clone(); 	quasilattice_default_vertices[16].sub(quasilattice_generator[3]);
//	quasilattice_default_vertices[17] = quasilattice_default_vertices[16].clone(); 	quasilattice_default_vertices[17].add(quasilattice_generator[0]);
	
	//the number found in one-fifth of the lattice
	var num_points = 7;
	
	for( var i = 1; i < 5; i++){
		for(var j = 0; j < num_points; j++) {
			quasilattice_default_vertices[i*num_points+j] = quasilattice_default_vertices[j].clone();
			quasilattice_default_vertices[i*num_points+j].applyAxisAngle(axis, i*TAU/5);
		}
	}
	
	var spoke_to_side_angle = 3 * TAU / 20;
	
	var second_hand = new THREE.Vector3(1,0,0); //d
	
	var hour_hand = second_hand.clone(); //a,b,c
	hour_hand.setLength(PHI-1);
	
	var minute_hand = second_hand.clone(); //e,f
	minute_hand.setLength(Math.tan(TAU/10));
	minute_hand.applyAxisAngle(z_central_axis, TAU / 20);
	
	for(var i = 0; i < stable_points.length; i++)
		stable_points[i] = new THREE.Vector3();
	
//	console.log(lowest_unused_stablepoint)
//	for(var ourvertex = 0; ourvertex < 7; ourvertex++){
//		//quasilattice_default_vertices.length; i++){
//		var stablepoint_first_recording = lowest_unused_stablepoint;
//		
//		deduce_stable_points_from_fanning_vertex(hour_hand, ourvertex, spoke_to_side_angle);
//		deduce_stable_points_from_fanning_vertex(minute_hand, ourvertex, spoke_to_side_angle);
//		deduce_stable_points_from_fanning_vertex(second_hand, ourvertex, spoke_to_side_angle);
//		
//		var desired_segment_addition = lowest_unused_stablepoint - stablepoint_first_recording;
////		console.log(desired_segment_addition);
//		console.log(lowest_unused_stablepoint)
//		for(var turn = 1; turn < 5; turn++){
//			var stablepoint_recording = lowest_unused_stablepoint;
//			
//			var segmentvertex = ourvertex+turn*7;
//			
//			deduce_stable_points_from_fanning_vertex(hour_hand, segmentvertex, spoke_to_side_angle);
//			deduce_stable_points_from_fanning_vertex(minute_hand, segmentvertex, spoke_to_side_angle);
//			deduce_stable_points_from_fanning_vertex(second_hand, segmentvertex, spoke_to_side_angle);
//			
//			var stablepoint_addition = lowest_unused_stablepoint - stablepoint_recording;
//			
////			console.log(stablepoint_addition);
////			if(stablepoint_addition != desired_segment_addition)
////				console.log(ourvertex, turn);
//			
//		}
//		console.log(lowest_unused_stablepoint)
//	}
	for(var i = 0; i < quasilattice_default_vertices.length; i++){
		deduce_stable_points_from_fanning_vertex(hour_hand, i, spoke_to_side_angle);
		deduce_stable_points_from_fanning_vertex(minute_hand, i, spoke_to_side_angle);
		deduce_stable_points_from_fanning_vertex(second_hand, i, spoke_to_side_angle);
	}
	for(var i = 0; i<stable_points.length; i++){
		for(var j = i+1; j<stable_points.length; j++){
			if(stable_points[i].distanceTo(stable_points[j]) < 0.0001){
				console.log("culled some stable points: ", i,j,stable_points[j],stable_points[i])
				stable_points.splice(j,1);
				j--;
			}
		}
	}
	for(var i = 0; i<stable_points.length; i++){
		if(stable_points[i].length() > 3.48 ){ //the length of HPV's cutouts
			stable_points.splice(i,1);
			i--
		}	
	}
	remove_stable_point_and_its_rotations(4);
	remove_stable_point_and_its_rotations(5);
	remove_stable_point_and_its_rotations(9);
	remove_stable_point_and_its_rotations(10);
	remove_stable_point_and_its_rotations(14); //Crossovers - Konevtsova's fault!
	remove_stable_point_and_its_rotations(15); 
	remove_stable_point_and_its_rotations(15); 
	remove_stable_point_and_its_rotations(15);
	remove_stable_point_and_its_rotations(21); 
	remove_stable_point_and_its_rotations(21);
	remove_stable_point_and_its_rotations(21);
	remove_stable_point_and_its_rotations(30);
	remove_stable_point_and_its_rotations(30);
	remove_stable_point_and_its_rotations(31);
	remove_stable_point_and_its_rotations(31);
	remove_stable_point_and_its_rotations(35);
	remove_stable_point_and_its_rotations(38);
	remove_stable_point_and_its_rotations(41); //Sort of our fault for wanting points on dodeca vertices. Which is arguably bad because are there really rotationally symmetric proteins?
	
	var quasiquasilattice_geometry = new THREE.Geometry();
	quasiquasilattice = new THREE.Points( quasiquasilattice_geometry,new THREE.PointsMaterial({size: 0.2, color: 0x000000}));
	quasiquasilattice.scale.set(0.6,0.6,0.6);
	for(var i = 0; i < quasilattice_default_vertices.length; i++)
		quasiquasilattice.geometry.vertices.push(quasilattice_default_vertices[i]);
	var stablepointslattice_geometry = new THREE.Geometry();
	stablepointslattice = new THREE.Points( stablepointslattice_geometry,new THREE.PointsMaterial({size: 0.1, color: 0xf00f00}));
	stablepointslattice.scale.copy(quasiquasilattice.scale);
	stablepointslattice.position.z += 0.01;
	for(var i = 0; i < stable_points.length; i++)
		stablepointslattice.geometry.vertices.push(stable_points[i]);
	
	
	//we're just going to try all the blue points.
	//Next thing to try would be gravitating you to the circle around each point 
//	stable_points[0] = quasilattice_default_vertices[2].clone(); stable_points[0].add(quasilattice_default_vertices[0]); stable_points[0].multiplyScalar(0.5);
//	stable_points[1] = quasilattice_default_vertices[5].clone(); stable_points[1].add(quasilattice_default_vertices[6]); stable_points[1].multiplyScalar(0.5);
//	stable_points[0] = quasilattice_default_vertices[2].clone(); stable_points[0].add(quasilattice_default_vertices[num_points]); stable_points[0].multiplyScalar(0.5);
//	stable_points[0] = quasilattice_default_vertices[2].clone(); stable_points[0].add(quasilattice_default_vertices[num_points]); stable_points[0].multiplyScalar(0.5);
//	stable_points[0] = quasilattice_default_vertices[2].clone(); stable_points[0].add(quasilattice_default_vertices[num_points]); stable_points[0].multiplyScalar(0.5);
	
	var midpoint = quasilattice_default_vertices[0].clone();
	midpoint.lerp(quasilattice_default_vertices[2], 0.5);
	var midpoint2 = midpoint.clone();
	midpoint2.applyAxisAngle(axis, TAU/5);
	midpoint.lerp(midpoint2, 0.5);
	var additionallength = midpoint.distanceTo(midpoint2) * Math.tan(TAU/10);
	midpoint.multiplyScalar(1+additionallength/midpoint.length());
	cutout_vector0.copy(midpoint);
	midpoint.applyAxisAngle(axis, TAU/5);
	cutout_vector1.copy(midpoint);
	
	cutout_vector0.set(1.1172738319468614, -0.6887854926593675);
	cutout_vector1.set(-0.30981732968125997, -1.275436981069784);
	/* 
	 * 1.3090169943749475, -0.10040570794311371, 0.30901699437494745, -1.27597621252806 //so this one is bad. More thinking needed. For some rotations it fails, probably just round off errors
	 */
	cutout_vector0_player = cutout_vector0.clone();
	cutout_vector1_player = cutout_vector1.clone();
	
	//first one is right corner, second is left corner, last is top
	dodeca_triangle_vertex_indices = new Array(
	    [1,2,0],
	    
	    [2,1,3],
	    [4,2,3],
	    [5,4,3],
	    [6,5,3],
	    [1,6,3],
	    
	    [4,5,7],
	    [8,4,7],
	    [9,8,7],
	    [10,9,7],
	    [5,10,7],
	    
	    [11,1,0],
	    
	    [1,11,12],
	    [13,1,12],
	    [14,13,12],
	    [15,14,12],
	    [11,15,12],
	    
	    [13,14,16],
	    [17,13,16],
	    [18,17,16],
	    [19,18,16],
	    [14,19,16],
	    
	    [20,11,0],
	    
	    [11,20,21],
	    [22,11,21],
	    [23,22,21],
	    [24,23,21],
	    [20,24,21],
	    
	    [22,23,25],
	    [26,22,25],
	    [27,26,25],
	    [28,27,25],
	    [23,28,25],
	    
	    [29,20,0],
	    
	    [20,29,30],
	    [31,20,30],
	    [32,31,30],
	    [33,32,30],
	    [29,33,30],
	    
	    [31,32,34],
	    [35,31,34],
	    [36,35,34],
	    [37,36,34],
	    [32,37,34],
	    
	    [2,29,0],
	    
	    [29,2,38],
	    [39,29,38],
	    [40,39,38],
	    [41,40,38],
	    [2,41,38],
	    
	    [39,40,42],
	    [43,39,42],
	    [44,43,42],
	    [45,44,42],
	    [40,45,42],
	    
		[9,18,46],
		[44,9,46],
		[36,44,46],
		[27,36,46],
		[18,27,46]
		);
	
	dodeca_derivations = new Array(
			[666,666,666],
			[666,666,666],
			[666,666,666],
			
			[1,2,0],
			[3,2,1],
			[3,4,2],
			[3,5,4],
			
			[5,4,3],
			[7,4,5],
			[7,8,4],
			[7,9,8],
			
			[0,1,2],
			
			[11,1,0],
			[12,1,11],
			[12,13,1],
			[12,14,13],
			
			[14,13,12],
			[16,13,14],
			[16,17,13],
			[16,18,17],
			
			[0,11,1],
			
			[20,11,0],
			[21,11,20],
			[21,22,11],
			[21,23,22],
			
			[23,22,21],
			[25,22,23],
			[25,26,22],
			[25,27,26],
			
			[0,20,11],
			
			[29,20,0],
			[30,20,29],
			[30,31,20],
			[30,32,31],
			
			[32,31,30],
			[34,31,32],
			[34,35,31],
			[34,36,35],
			
			[2,29,0],
			[38,29,2],
			[38,39,29],
			[38,40,39],
			
			[40,39,38],
			[42,39,40],
			[42,43,39],
			[42,44,43]);
	
	deduce_dodecahedron(0);
}

function remove_stable_point_and_its_rotations(unwanted_index){
	var rotations = Array(5);
	rotations[0] = stable_points[unwanted_index].clone();
	for(var i = 1; i < 5; i++){
		rotations[i] = rotations[0].clone();
		rotations[i].applyAxisAngle(z_central_axis,TAU/5 * i);
	}
	var number_removed = 0;
	for(var j = 0; j < 5; j++){
		for(var i = stable_points.length-1; i >= 0; i--){
			if(	Math.abs(rotations[j].x - stable_points[i].x) < 0.00001 &&
				Math.abs(rotations[j].y - stable_points[i].y) < 0.00001 ) {
				stable_points.splice(i,1);
				number_removed++;
			}
		}
	}
	if(number_removed != 5)
		console.log("stable point had a number of copies not equal to 5? Number removed: " + number_removed);
}