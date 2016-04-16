/* TODO
 * Every quasicutout has a set of lines that "grow" over to its partner.
 * Hopefully you can deduce which ones based on the shapes.
 * For every edge the numbers are worked out in realtime
 * 
 * Is there some way you could change the way you spherically project so that the fat rhombs on the smallest ones aren't so squashed?
 * The ones where you inserted something aren't so hot either. Could have special cases.
 * 
 * One virus in each corner. Boca, Zika, LA, HPV. There are a few more pics like HPV, there was some pdf you saved. Or google "density map" virus, there are one or two
 * Might be hard to have a nice transition to them, so could just flash or something
 * 
 * Remove stitchup, quasicutouts, and everything that uses them, when you know there's no work left to be done on this.
 * 
 * Fix that problem where you can't change while the deflation is occurring. Might be you start within that small non-responsive part?
 * 
 * Clearly, you should be able to click viruses and see them, and also drag the lattice to make them yourself and have it indicated that you've got it
 * 
 * So probably ALL should have the four viruses along the bottom
 * 
 */

//Bug in web version: quasisphere didn't appear initially
//Make pentagons flash when you say "based on pentagonal symmetry"
//separate out scaling and rotation like on CK

//HMMMM COULD JUST HAVE BLOCKERS AROUND THE PENTAGON. When you fade back, is there any way for them to continue obscure, but not obscure the parts that are fading in?

/* And you can reduce the number of extra vertices required by half. You could probably work out all the edge positions using the triangles
 * 
 * You don't need to deduce the dodecahedron any more...
 */

//TODO make the points on quasiquasilattice larger
//TODO shapes fill the whole pentagon. Wouldn't need the guidequasilattice!

/*
 * So what's Konevtsova's logic? He certainly can't argue for that trimer on the corner without a trimer on HPV. He could try to find a virus with no trimer there
 * At the very least he needs a "no crossings allowed" thing
 * The simple thing to say is "edgelengths are all the same, angles are all divisible by TAU/10"
 * If it's that, there may be some proof to do to see if we got everything. There could be very funny shaped topological defects.
 * He claims that there aren't quite trimers on the T=4 and T=3 too! "Idealized", he's full of shit!
 */

/* Shouldn't there be a stable point allowing for the fat rhomb and pentagon to rest on the top?
 * Should points on the corners be in stable points?
 */



function UpdateQuasiSurface(){
	var atanphi = Math.atan(PHI);
	
	var dodeca_openingspeed = 0.029;
	var dodeca_squashingspeed = 0.022;
	if(isMouseDown) {
		if(dodeca_angle === 0 || dodeca_angle === 2*atanphi-TAU/2 ) 
//		if(dodeca_faceflatness == 1) //TODO change to this at some point, the stitchup can look nasty
			dodeca_openness += dodeca_openingspeed;
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
	
	dodeca.material.opacity = dodeca_faceflatness; //(dodeca_faceflatness + dodeca_openness) / 2;
	if(dodeca.material.opacity === 0)
		scene.remove(dodeca);
	else
		scene.add(dodeca)
	var quasicutout_opacity = 1 - dodeca.material.opacity;
	
	if(stable_point_of_meshes_currently_in_scene !== 666){
		//done one, done all
		quasicutout_meshes[stable_point_of_meshes_currently_in_scene].material.materials[1].opacity = quasicutout_opacity;
	}
	
	deduce_dodecahedron(0);
	
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
	//bug: by stretching it and then putting your mouse in the deadzone, you can freeze it in a crazy place
	if( isMouseDown) {
		var Mousedist = MousePosition.length();
		var OldMousedist = OldMousePosition.length(); //unless the center is going to change?
//		if(	Mousedist > 0.47 &&
//			OldMousePosition.x != MousePosition.x && OldMousePosition.y != MousePosition.y)
		{
			var scalefactor = Mousedist / OldMousedist;
			scalefactor = (scalefactor - 1) * 0.685 +1; //0.685 is the drag
			
			if(scalefactor !== 1 )
				Disable_pictures();
			
			cutout_vector0_player.multiplyScalar(scalefactor);
			cutout_vector1_player.multiplyScalar(scalefactor);
			var veclength = cutout_vector0_player.length();
			
			var maxlength = 3.53; // 3.48 is minimum but that makes it hard to get to HPV
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
			var newQuasiLatticeAngle = QuasiLatticeAngle - LatticeAngleChange;
			cutout_vector0_player.x = veclength * Math.cos(newQuasiLatticeAngle);
			cutout_vector0_player.y = veclength * Math.sin(newQuasiLatticeAngle);
			cutout_vector1_player.x = veclength * Math.cos(newQuasiLatticeAngle - TAU / 5);
			cutout_vector1_player.y = veclength * Math.sin(newQuasiLatticeAngle - TAU / 5);
		}
	}
	
	//Quite a few speedup opportunities here
	//to do it generatively it is a question of either... 
	//find every possible two-fold symmetry on the lattice that gets any kind of rhomb...
	//or make things attract each other? Yeah, right. Might be interesting offline.
	
	var closest_stable_point_dist = 666;
	var closest_stable_point_index = 666;
	for( var i = 0; i < stable_points.length; i++){
		if(	stable_points[i].distanceTo(cutout_vector0_player) < closest_stable_point_dist ) //so you sort of need to make sure that the one in the array is as low as possible
		{
			closest_stable_point_index = i;
			closest_stable_point_dist = stable_points[i].distanceTo(cutout_vector0_player);
		}
	}
	
	var modulated_CSP = closest_stable_point_index % (stable_points.length / 5);
	var anglechange = stable_points[closest_stable_point_index].angleTo(stable_points[modulated_CSP]);
	cutout_vector0_player.applyAxisAngle(z_central_axis, anglechange);
	cutout_vector1_player.applyAxisAngle(z_central_axis, anglechange);
	
	if( set_stable_point !== 666 ){
		if(!isMouseDown && isMouseDown_previously){
			set_stable_point++;
			if(set_stable_point >= stable_points.length / 5)
				set_stable_point = 0;
			console.log(set_stable_point);
		}
		modulated_CSP = set_stable_point;
	}
	
	cutout_vector0.copy(stable_points[modulated_CSP]);
	cutout_vector1.copy(stable_points[modulated_CSP]);
	
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
	
	//we want to remove the one that was previously in there, and add
	if(stable_point_of_meshes_currently_in_scene != modulated_CSP ){
		dodeca_faceflatness = 1; //skip to the faces being gone
		if(stable_point_of_meshes_currently_in_scene !== 666 )
			scene.remove(quasicutout_meshes[stable_point_of_meshes_currently_in_scene]);
		scene.add(quasicutout_meshes[modulated_CSP]);
		
		stable_point_of_meshes_currently_in_scene = modulated_CSP;
	}
	
	var cameraquaternion = new THREE.Quaternion();
	cameraquaternion.setFromAxisAngle(z_central_axis,Math.atan2(cutout_vector0_displayed.y,cutout_vector0_displayed.x) -  0.9424777960769378);
	quasicutout_meshes[stable_point_of_meshes_currently_in_scene].quaternion.copy(cameraquaternion);
	dodeca.quaternion.copy(cameraquaternion);
	
	var old_version_camera_dist = 20 / cutout_vector0_displayed.length() + 0.5*Math.sqrt(5/2+11/10*Math.sqrt(5));
	dodeca.position.z = -old_version_camera_dist + camera.position.z;
	quasicutout_meshes[stable_point_of_meshes_currently_in_scene].position.z = -old_version_camera_dist + camera.position.z;
	Guide_quasilattice.position.z = -old_version_camera_dist + 1.1134163644116069 + camera.position.z;
	
	Guide_quasilattice.scale.x = 0.85 / cutout_vector0_displayed.length();
	Guide_quasilattice.scale.y = Guide_quasilattice.scale.x;
	Guide_quasilattice.scale.z = Guide_quasilattice.scale.x;
	if(dodeca_angle < Math.atan(PHI) - TAU/4)
		Guide_quasilattice.rotateOnAxis(z_central_axis,Math.PI);
	Guide_quasilattice.material.opacity = dodeca_openness;
}

function deduce_dodecahedron(openness) {	
	var elevation = 0.5*Math.sqrt(5/2+11/10*Math.sqrt(5));
	
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
				if(i < unwanted_index){
					console.log(unwanted_index,i)
					console.log(stable_points[i].length());
					console.log(stable_points[unwanted_index].length());
				}
				
				stable_points.splice(i,1);
				number_removed++;
			}
		}
	}
	if(number_removed != 5)
		console.log("stable point had a number of copies not equal to 5? Number removed: " + number_removed);
}