/* bug where it seems to vibrate?
 * 
 * Ones that look crap:
 * -HPV: need to stick a singularity-colored triangle in one place and a fat-rhomb-colored triangles between the fat rhomb
 * -18, three pents at a corner. Stick singularity colors in the gap
 * -11, three pents at a corner. In addition to the above, you put a pentagon-colored triangle in there, done.
 * -alternatively for all of them you have the corner of the dodeca as a point
 * 
 * Change colors, you've not adjusted to the fact that they are allowed to jump around. There's a brown hexagon and pink fat rhombs
 * 
 * Probably best to let Grabbable arrow go all the way to the middle and have the scale be: 
 * minimum + GrabbableArrow.position.length / max_GA_position * (maximum - minimum)
 * Take the mouse outside the zone and you're still holding it, but screw you if you think it makes a difference. 
 * 
 * Fix that problem where you can't change while the deflation is occurring. Might be you start within that small non-responsive part?
 * Actually it seems to sometimes just not respond to a held down mouse
 * 
 * Probably wouldn't be that hard to flatten the pentagons
 */

/* You can reduce the number of extra vertices required by half. You could probably work out all the edge positions using the triangles
 * 
 * There may still be things happenning that you don't need
 * 
 */



function UpdateQuasiSurface()
{
	//-------Rotation
	//TODO saw it vibrate weirdly once?
	if(!isMouseDown) {
		QS_rotationangle = Mouse_delta.length() / 2.5;
		
		QS_rotationaxis.set(-Mouse_delta.y, Mouse_delta.x, 0);
		dodeca.worldToLocal(QS_rotationaxis);
		QS_rotationaxis.normalize();
	}
	else {
		QS_rotationangle *= 0.93;
	}
	
	dodeca.rotateOnAxis(QS_rotationaxis,QS_rotationangle);
	dodeca.updateMatrixWorld();
	
	//avoid the back face showing
	{
		var forwardvector = new THREE.Vector3(0,0,1);
		dodeca.worldToLocal( forwardvector );
		
		var face_centers_indices = Array(3,7,12,16,21,25,30,34,38,42);
		var closest_angle = dodeca.geometry.vertices[ 0 ].angleTo( forwardvector );
		var closest_index = 0;
		
		//0 is the one you swap with
		for(var i = 0; i < face_centers_indices.length; i++)
		{
			var potential_angle = dodeca.geometry.vertices[ face_centers_indices[i] ].angleTo( forwardvector );
			if( potential_angle < closest_angle )
			{
				closest_angle = potential_angle;
				closest_index = face_centers_indices[i];
			}
		}
		
		if(closest_index !== 0 )
		{
			var swap_axis = dodeca.geometry.vertices[ closest_index ].clone();
			swap_axis.add( dodeca.geometry.vertices[ 0 ] );
			swap_axis.normalize();
			dodeca.rotateOnAxis( swap_axis, Math.PI );
		}
	}
	
	//TODO to help hide the problem. 
	//maybe take the vector of the closest pentagon face to the actual front and rotationg so that you swap with the one that should be there
	//
//	var dodeca_indicator_direction = new THREE.Vector3(0,0,1);
//	dodeca.localToWorld(dodeca_indicator_direction);
	
	//-----inflation
	var dodeca_squashingspeed = 0.022 * delta_t / 0.016;
	if(isMouseDown)
		dodeca_faceflatness += dodeca_squashingspeed;
	else
		dodeca_faceflatness -= dodeca_squashingspeed;
	
	if(dodeca_faceflatness > 1)
		dodeca_faceflatness = 1;
	if(dodeca_faceflatness < 0)
		dodeca_faceflatness = 0;
	
//	deduce_dodecahedron(0);
}

function update_QS_center()
{
	QS_center.position.z = camera.position.z - 6;
	
	var opacitychangerate = 0.035 * delta_t / 0.016;
	if(isMouseDown)
	{
		QS_center.material.opacity += opacitychangerate;
		if(QS_center.material.opacity > 1)
			QS_center.material.opacity = 1;
	}
	else {
		QS_center.material.opacity -= 0.02;
		if(QS_center.material.opacity < 0)
			QS_center.material.opacity = 0;
	}
}

function MoveQuasiLattice()
{
	//somewhere in here is the "ignoring input while inflating" bug
	//might do rotation whatevers here
	if( isMouseDown ) {
		var Mousedist = MousePosition.length();
		var OldMousedist = OldMousePosition.length(); //unless the center is going to change?
		{
			var oldmouse_to_center = new THREE.Vector3(0 - OldMousePosition.x,0 - OldMousePosition.y,0);
			var oldmouse_to_newmouse = new THREE.Vector3(   MousePosition.x - OldMousePosition.x,     MousePosition.y - OldMousePosition.y,0);
			var ourangle = oldmouse_to_center.angleTo(oldmouse_to_newmouse);
			
			var veclength;
			
			if(Math.abs(ourangle) < TAU / 8 || Math.abs(ourangle) > TAU / 8 * 3 )
			{
				var scalefactor = Mousedist / OldMousedist;
				scalefactor = (scalefactor - 1) * 0.685 +1; //0.685 is the drag
				
				if(scalefactor !== 1 )
					Disable_virus_pictures();
				
				cutout_vector0_player.multiplyScalar(scalefactor);
				cutout_vector1_player.multiplyScalar(scalefactor);
				veclength = cutout_vector0_player.length();
				
				var hardmaxlength = 4;
				if(veclength > hardmaxlength) {
					veclength = hardmaxlength;
				}
				var softmaxlength = 3.53; // 3.48 is minimum but that makes it hard to get to HPV
				if(veclength > softmaxlength) {
					veclength -= 0.028;
					if(veclength < softmaxlength)
						veclength = softmaxlength;
				}
				var minlength = 1.313;
				if(veclength < minlength) {
//					veclength += 0.02;
//					if(veclength > minlength)
						veclength = minlength;
				}
				cutout_vector0_player.setLength(veclength);
				cutout_vector1_player.setLength(veclength);
			}
			else
			{
				veclength = cutout_vector0_player.length();
				
				var MouseAngle = Math.atan2(MousePosition.y, MousePosition.x );
				if(MousePosition.x === 0 && MousePosition.y === 0)
					MouseAngle = 0; //well, undefined
				
				var OldMouseAngle = Math.atan2( OldMousePosition.y, OldMousePosition.x );
				if(OldMousePosition.x === 0 && OldMousePosition.y === 0)
					OldMouseAngle = 0;
				
				var LatticeAngleChange = OldMouseAngle - MouseAngle;
				QS_center.rotation.z -= LatticeAngleChange;
				
				var QuasiLatticeAngle = Math.atan2(cutout_vector0_player.y, cutout_vector0_player.x);
				var newQuasiLatticeAngle = QuasiLatticeAngle + LatticeAngleChange;

				cutout_vector0_player.x = veclength * Math.cos(newQuasiLatticeAngle);
				cutout_vector0_player.y = veclength * Math.sin(newQuasiLatticeAngle);
				cutout_vector1_player.x = veclength * Math.cos(newQuasiLatticeAngle - TAU / 5);
				cutout_vector1_player.y = veclength * Math.sin(newQuasiLatticeAngle - TAU / 5);
			}
		}
	}
	
	var closest_stable_point_dist = 666;
	var closest_stable_point_index = 666;
	for( var i = 0; i < stable_points.length; i++){
		if( i % one_fifth_stablepoints < 2)
			continue; //These are the two distorted ones. They don't look so different from 0 so nobody will want them. Er, don't they have copies?
		if(	stable_points[i].distanceTo(cutout_vector0_player) < closest_stable_point_dist ) //so you sort of need to make sure that the one in the array is as low as possible
		{
			closest_stable_point_index = i;
			closest_stable_point_dist = stable_points[i].distanceTo(cutout_vector0_player);
			
			//you should be able to work out, here, how much to rotate cutout_vector0_player to get it close
		}
	}
	
	var modulated_CSP = closest_stable_point_index % (stable_points.length / 5);
	var closest_i = 666;
	var closest_dist = 1000;
	var testcutout = new THREE.Vector3();
	for(var i = 0; i < 5; i++)
	{
		testcutout.copy(cutout_vector0_player);
		testcutout.applyAxisAngle(z_central_axis, i * TAU/5);
		if(	testcutout.distanceTo(stable_points[modulated_CSP]) < closest_dist )
		{
			closest_i = i;
			closest_dist = testcutout.distanceTo(stable_points[modulated_CSP]);
		}
	}
	//this changes their location such that a different modulated_CSP is close! You need to do something such that it is not changed.
	cutout_vector0_player.applyAxisAngle(z_central_axis, closest_i * TAU/5);
	cutout_vector1_player.copy(cutout_vector0_player);
	cutout_vector1_player.applyAxisAngle(z_central_axis, -TAU/5);
	
	if( set_stable_point !== 666 )
	{
		if(!isMouseDown && isMouseDown_previously){
			set_stable_point++;
			if(set_stable_point >= stable_points.length / 5)
				set_stable_point = 0;
			console.log(set_stable_point);
		}
		modulated_CSP = set_stable_point;
	}
	
	cutout_vector0.copy(stable_points[modulated_CSP]);
	cutout_vector1.copy(cutout_vector0);
	cutout_vector1.applyAxisAngle(z_central_axis, -TAU/5);
	
	var interpolation_factor = 1 - dodeca_faceflatness;
	if(interpolation_factor == 1){ //if they've allowed it to expand, it's now officially snapped
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
	if( stable_point_of_meshes_currently_in_scene != modulated_CSP ){
		dodeca_faceflatness = 1; //skip to the faces being gone
		if(stable_point_of_meshes_currently_in_scene !== 666 )
			dodeca.remove(quasicutout_meshes[stable_point_of_meshes_currently_in_scene]);
		dodeca.add(quasicutout_meshes[modulated_CSP]);
		
		stable_point_of_meshes_currently_in_scene = modulated_CSP;
	}
	
	//This will rotate the dodeca to make it look as much as possible like the pattern - if it's oriented correctly
//	dodeca.quaternion.setFromAxisAngle(z_central_axis,Math.atan2(cutout_vector0_displayed.y,cutout_vector0_displayed.x) - 0.9424777960769378);
	
	//TODO, you may not understand this. Actually you should be moving the camera.
	//note you are keeping the fov constant, so in some sense the size of the playing field changes
	var contrived_dist = 30 / cutout_vector0_displayed.length() + 0.5*Math.sqrt(5/2+11/10*Math.sqrt(5)); //pretty sure this is the z coord of a face-down dodecahedron's center
	camera.position.z = contrived_dist;
}

function deduce_dodecahedron(openness) {	
	var elevation = 0.5*Math.sqrt(5/2+11/10*Math.sqrt(5));
	
	dodeca.geometry.vertices[0].set(0,0,elevation);
	dodeca.geometry.vertices[1].set(0,0.5/Math.sin(TAU/10),elevation);
	dodeca.geometry.vertices[2].set(PHI/2,0.5/Math.sin(TAU/10) - Math.cos(3/20*TAU),elevation);
	
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
		
		var a = dodeca.geometry.vertices[a_index].clone(); //this is our origin
		
		var crossbar_unit = dodeca.geometry.vertices[b_index].clone();
		crossbar_unit.sub(a);			
		crossbar_unit.normalize();
	
		var c = dodeca.geometry.vertices[c_index].clone();
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
		
		dodeca.geometry.vertices[i].addVectors(downward_component, hinge_component);
		dodeca.geometry.vertices[i].add( hinge_origin );
		dodeca.geometry.vertices[i].add( a );
	}
	
	dodeca.geometry.vertices[46].copy(dodeca.geometry.vertices[0]);
	dodeca.geometry.vertices[46].negate();
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