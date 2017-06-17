function irreg_deduce_surface(openness ){
	//ok what we REALLY want is to rotate it so that the central vertex has the same x and y as the eventual 3D center
	//we deduce the surface, get the 3Dcenter-to-centralvertex vector
	//length of that vector * (1-openness) is the z of the central vertex
	//get the angle between the edge connecting vertices 0 and 1 and the plane through vertex 0 perp to that previous vector. Call the angle theta 
	//TAU/4 - theta is the angle between that edge and the plane parallel to the camera's plane
	//do same thing for edge connecting 0 and 2.
	//at capsidopenness = 1 we must have first vertex = flatnet first vertex 
	
	//Stick the flatnet vertices into the first three. Deduce the rest.
	//Using three radii, get the location of the center.
	//Rotate such that center is in middle of screen (as it was before), as is vertex 0.
	//get angle between vector connecting vertices 1 and 0 and 18 and 0 in 2D
	//rotate such that that is on either side of the line between them on flatnet's gap.
	
	var central_rotationaxis = new THREE.Vector3(0,0,1);
	
	var vertex0 = new THREE.Vector3(flatnet_vertices.array[0*3+0],flatnet_vertices.array[0*3+1],flatnet_vertices.array[0*3+2]);
	var vertex1 = new THREE.Vector3(flatnet_vertices.array[1*3+0],flatnet_vertices.array[1*3+1],flatnet_vertices.array[1*3+2]);
	var vertex2 = new THREE.Vector3(flatnet_vertices.array[2*3+0],flatnet_vertices.array[2*3+1],flatnet_vertices.array[2*3+2]);
	
//	console.log(vertex0,vertex1,vertex2)
	
	var flatnet_midgap = vertex1.clone();
	flatnet_midgap.applyAxisAngle(central_rotationaxis, -TAU/12 );
	
	var center = tetrahedron_top( //new THREE.Vector3(0.5773502640084176, 0, 0.7544313421376697);
			vertex0, vertex1, vertex2,
			varyingsurface_orientingradius[0],varyingsurface_orientingradius[1],varyingsurface_orientingradius[2]);
	if(center.z>0) center.z *= -1;
	//TODO make it so there is a catch for the possibility that center isn't a vector
	var desired_center_location = new THREE.Vector3(0,0,-center.length());
	
	var first_rotationaxis = center.clone();
	first_rotationaxis.cross(desired_center_location);
	first_rotationaxis.normalize();
	var first_rotationangle = (1-openness) * Math.acos(center.dot(desired_center_location) / center.lengthSq()); //you may want a smaller or larger quantity of this
	vertex0.applyAxisAngle(first_rotationaxis, first_rotationangle);
	vertex1.applyAxisAngle(first_rotationaxis, first_rotationangle);
	vertex2.applyAxisAngle(first_rotationaxis, first_rotationangle);
	vertex0.z += (1-openness) * varyingsurface_orientingradius[0]; //nooo
	vertex1.z += (1-openness) * varyingsurface_orientingradius[0];
	vertex2.z += (1-openness) * varyingsurface_orientingradius[0];
	
	varyingsurface.geometry.attributes.position.array[0] = vertex0.x;
	varyingsurface.geometry.attributes.position.array[1] = vertex0.y;
	varyingsurface.geometry.attributes.position.array[2] = vertex0.z;
	varyingsurface.geometry.attributes.position.array[3] = vertex1.x;
	varyingsurface.geometry.attributes.position.array[4] = vertex1.y;
	varyingsurface.geometry.attributes.position.array[5] = vertex1.z;
	varyingsurface.geometry.attributes.position.array[6] = vertex2.x;
	varyingsurface.geometry.attributes.position.array[7] = vertex2.y;
	varyingsurface.geometry.attributes.position.array[8] = vertex2.z;
	
	deduce_most_of_surface(openness, varyingsurface.geometry.attributes.position); //Speedup opportunity: only work out vertex 18
	
	var vertex18flattened = new THREE.Vector3(varyingsurface.geometry.attributes.position.array[18*3+0],varyingsurface.geometry.attributes.position.array[18*3+1], 0);
	var vertex1flattened = vertex1.clone();
	vertex1flattened.z = 0;
	var gapangle = vertex18flattened.angleTo(vertex1flattened);
	var angle_offby = vertex1flattened.angleTo(flatnet_midgap) - gapangle / 2;
	
	vertex1.applyAxisAngle(central_rotationaxis, -angle_offby);
	vertex2.applyAxisAngle(central_rotationaxis, -angle_offby);
	
	varyingsurface.geometry.attributes.position.array[0] = vertex0.x;
	varyingsurface.geometry.attributes.position.array[1] = vertex0.y;
	varyingsurface.geometry.attributes.position.array[2] = vertex0.z;
	varyingsurface.geometry.attributes.position.array[3] = vertex1.x;
	varyingsurface.geometry.attributes.position.array[4] = vertex1.y;
	varyingsurface.geometry.attributes.position.array[5] = vertex1.z;
	varyingsurface.geometry.attributes.position.array[6] = vertex2.x;
	varyingsurface.geometry.attributes.position.array[7] = vertex2.y;
	varyingsurface.geometry.attributes.position.array[8] = vertex2.z;
	
	deduce_most_of_surface(openness, varyingsurface.geometry.attributes.position);
	
	varyingsurface.geometry.computeVertexNormals();
}

function CheckIrregButton(){
	//maybe it should flash/glow, not scale?
	//TODO change this if button size changes
//	console.log()
	
	if(!IrregButton.visible)
		return;
	
	if(isMouseDown && !isMouseDown_previously && MousePosition.distanceTo(IrregButton.position) < IrregButton.radius ){
		var squashed_size = 0.925;
		IrregButton.scale.setScalar(squashed_size);

		Sounds.buttonPressed.play();
		
		IrregButton.pulsing = 0;
	}
	if(!isMouseDown && (IrregButton.scale.x < 1 && !IrregButton.pulsing ) ) //released
	{
		Sounds.buttonReleased.play();
		
		if(IrregButton.capsidopen)
		{
			if( !Sounds.shapeClose.isPlaying )
				Sounds.shapeClose.play();
			IrregButton.capsidopen = 0;
		}
		else
		{
			if( !Sounds.shapeOpen.isPlaying )
				Sounds.shapeOpen.play();
			IrregButton.capsidopen = 1;
		}
		
		IrregButton.scale.setScalar(1);
	}
	
	if( isMouseDown && !isMouseDown_previously && MousePosition.distanceTo(IrregButton.position) < IrregButton.radius && IrregButton.capsidopen === 1 )
		theyKnowYouCanOpenAndClose = true; //well really you want it twice TODO
	
	if( IrregButton.pulsing ) 
	{
		IrregButton.pulse += delta_t;
		var buttonscale = 1;
		var maxSwell = 0.65;
		var startSwellTime = 4;
		var stopSwellTime = startSwellTime + 0.5;
		if( IrregButton.pulse < startSwellTime )
			{}
		else if( IrregButton.pulse < stopSwellTime )
			buttonscale += (IrregButton.pulse - startSwellTime) * maxSwell;
		else if( IrregButton.pulse < stopSwellTime + (stopSwellTime-startSwellTime) )
			buttonscale += (stopSwellTime - startSwellTime - (IrregButton.pulse-stopSwellTime) ) * maxSwell;
		else
			IrregButton.pulse = 0;
		IrregButton.scale.setScalar(buttonscale);
	}
	
	//Untested
	{
		IrregButton.logoFaces[0].quaternion.copy( IrregButton.logoFaces[0].closedQuaternion );
		IrregButton.logoFaces[0].quaternion.slerp( IrregButton.logoFaces[0].openQuaternion, capsidopenness );
		IrregButton.logoFaces[1].rotation.x = (1-capsidopenness) *-TAU / 4;
		IrregButton.logoFaces[2].rotation.y = (1-capsidopenness) * TAU / 4; //or possibly the reverse
	}
}

function update_varyingsurface() {
	
	var irreg_flash = 0;
	var flash_increase_length = 0.7;
	var irreg_unflash_time = irreg_flash_time + 5.3;
	if(our_CurrentTime > irreg_flash_time && our_CurrentTime < irreg_flash_time + flash_increase_length )
		irreg_flash = ( our_CurrentTime - irreg_flash_time ) / flash_increase_length;
	else if(our_CurrentTime > irreg_flash_time && our_CurrentTime < irreg_unflash_time )
		irreg_flash = 1;
	else if(our_CurrentTime > irreg_unflash_time && our_CurrentTime < irreg_unflash_time + flash_increase_length )
		irreg_flash = 1 - ( our_CurrentTime - irreg_unflash_time ) / flash_increase_length;
	if( irreg_flash > 1 )
		irreg_flash = 1;
	if( irreg_flash < 0 )
		irreg_flash = 0;
	
	varyingsurface_cylinders[0].material.color.setRGB(	0.1568627450980392,0.26666666666666,0.3607843137254902);
	varyingsurface_cylinders[0].material.color.r = 0.1568627450980392 + (1-0.1568627450980392)*irreg_flash;
	for( var i = 4; i < 20; i++)
		if( i % 4 === 0 || i % 4 === 1)
			varyingsurface_cylinders[i].material.color.copy( varyingsurface_cylinders[0].material.color );
	varyingsurface_cylinders[21].material.color.copy( varyingsurface_cylinders[0].material.color );
		
	//untested TODO
	{
		if(capsidopenness === 1 || capsidopenness === 0)
			capsidopennessParameter = capsidopenness;
		
		if( IrregButton.capsidopen )
		{
			capsidopennessParameter += delta_t*0.9;
			if(capsidopennessParameter>1)
				capsidopennessParameter = 1;
		}
		else {
			capsidopennessParameter -= delta_t*0.9;
			if(capsidopennessParameter<0)
				capsidopennessParameter = 0;
		}
		
		capsidopenness = move_smooth(1, capsidopennessParameter);
	}
	
	var wedgesopacity = (capsidopenness - 1 ) * 4 + 1;
	if( wedgesopacity < 0 ) wedgesopacity = 1;
	for( var i = 0; i < wedges.length; i++ )
		wedges[i].material.opacity = wedgesopacity;
	
	if(capsidopenness > 1) {
		capsidopenness = 1;
		capsidopeningspeed = 0;
	}
	if(capsidopenness < 0) {
		capsidopenness = 0;
		capsidopeningspeed = 0;
	}
	
	if( capsidopenness == 1){
		scene.add(manipulation_surface);
		scene.remove(varyingsurface);
	}
	else {
		scene.add(varyingsurface);
		scene.remove(manipulation_surface);
	}

	irreg_deduce_surface(capsidopenness, varyingsurface.geometry.attributes.position);
	
	//we rotate by a quaternion if user moves
	if(capsidopenness == 0 ){
		var MovementAxis = new THREE.Vector3(-Mouse_delta.y, Mouse_delta.x, 0);
		MovementAxis.normalize();
		
		varyingsurface.worldToLocal(MovementAxis);
		var extraquaternion = new THREE.Quaternion();
		extraquaternion.setFromAxisAngle( MovementAxis, Mouse_delta.length() * 0.9 );
		
		varyingsurface.quaternion.multiply(extraquaternion);
	}
	else {
		var destination_quaternion = varyingsurface.quaternion.clone();
		var interpolationfactor = 1;
		if( IrregButton.capsidopen )
		{
			destination_quaternion.set(0,0,0,1);
			//if capsidopenness = 1 we want it to be entirely the base quaternion, i.e. t = 1
			
			//TODO there is an equation to be solved that will bring you closer to it by
			interpolationfactor = 0.03 + 0.97 * Math.pow(capsidopenness,10); //may want to massively reduce this power
		}
		else if( capsidopenness !== 0 ) //if you're *in the process of* closing
		{
			destination_quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0),-TAU / 4);
			interpolationfactor = 0.03 + 0.97 * Math.pow(1-capsidopenness,10); //may want to massively reduce this power
		}
			
		varyingsurface.quaternion.slerp(destination_quaternion, interpolationfactor);
		
		//mouse movement has put it into whatever situation it is. The above gets it back in time for complete openness. Going back the other way, it doesn't change
	}
	
	varyingsurface.updateMatrixWorld();
	for( var i = 0; i < varyingsurface_cylinders.length; i++)
		varyingsurface_cylinders[i].quaternion.copy(varyingsurface.quaternion);
//	for( var i = 0; i < varyingsurface_spheres.length; i++)
//		varyingsurface_spheres[i].quaternion.copy(varyingsurface.quaternion);
	
	
	for(var i = 0; i < surfperimeter_line_index_pairs.length / 2; i++) {
		var Aindex = surfperimeter_line_index_pairs[i*2];
		var Bindex = surfperimeter_line_index_pairs[i*2+1];
		
		surfperimeter_spheres[i].position.set(
				flatnet_vertices.array[surfperimeter_line_index_pairs[i*2]*3+0],
				flatnet_vertices.array[surfperimeter_line_index_pairs[i*2]*3+1],
				flatnet_vertices.array[surfperimeter_line_index_pairs[i*2]*3+2]
		);
		
		if(capsidopenness === 1 ){
			A = new THREE.Vector3(
					manipulation_surface.geometry.attributes.position.array[Aindex*3+0],
					manipulation_surface.geometry.attributes.position.array[Aindex*3+1],
					manipulation_surface.geometry.attributes.position.array[Aindex*3+2]);
			B = new THREE.Vector3(
					manipulation_surface.geometry.attributes.position.array[Bindex*3+0],
					manipulation_surface.geometry.attributes.position.array[Bindex*3+1],
					manipulation_surface.geometry.attributes.position.array[Bindex*3+2]);
		}
		else{
			A = new THREE.Vector3(
					varyingsurface.geometry.attributes.position.array[Aindex*3+0],
					varyingsurface.geometry.attributes.position.array[Aindex*3+1],
					varyingsurface.geometry.attributes.position.array[Aindex*3+2]);
			B = new THREE.Vector3(
					varyingsurface.geometry.attributes.position.array[Bindex*3+0],
					varyingsurface.geometry.attributes.position.array[Bindex*3+1],
					varyingsurface.geometry.attributes.position.array[Bindex*3+2]);
		}
		
		put_tube_in_buffer(A,B, varyingsurface_cylinders[i].geometry.attributes.position.array, varyingsurface_edges_default_radius);
		varyingsurface_cylinders[i].geometry.attributes.position.needsUpdate = true;
	}
	for(var i = 0; i < surfinterior_line_index_pairs.length / 2; i++) {
		var Aindex = surfinterior_line_index_pairs[i*2];
		var Bindex = surfinterior_line_index_pairs[i*2+1];
		
		if(capsidopenness === 1 ){
			A = new THREE.Vector3( //TODO when you're level there appears to be a divide by zero or something and the cylinder disappears
					manipulation_surface.geometry.attributes.position.array[Aindex*3+0],
					manipulation_surface.geometry.attributes.position.array[Aindex*3+1],
					manipulation_surface.geometry.attributes.position.array[Aindex*3+2]);
			B = new THREE.Vector3(
					manipulation_surface.geometry.attributes.position.array[Bindex*3+0],
					manipulation_surface.geometry.attributes.position.array[Bindex*3+1],
					manipulation_surface.geometry.attributes.position.array[Bindex*3+2]);
		}
		else{
			A = new THREE.Vector3(
					varyingsurface.geometry.attributes.position.array[Aindex*3+0],
					varyingsurface.geometry.attributes.position.array[Aindex*3+1],
					varyingsurface.geometry.attributes.position.array[Aindex*3+2]);
			B = new THREE.Vector3(
					varyingsurface.geometry.attributes.position.array[Bindex*3+0],
					varyingsurface.geometry.attributes.position.array[Bindex*3+1],
					varyingsurface.geometry.attributes.position.array[Bindex*3+2]);
		}
		
		//TODO radius appears to change??
		put_tube_in_buffer(A,B, varyingsurface_cylinders[surfperimeter_line_index_pairs.length / 2 + i].geometry.attributes.position.array, varyingsurface_edges_default_radius);
		varyingsurface_cylinders[surfperimeter_line_index_pairs.length / 2 + i].geometry.attributes.position.needsUpdate = true;
	}
	
	for(var i = 0; i < varyingsurface_spheres.length; i++) {
		if( (i == 0 || i % 4 == 1) && i != 1)
			continue;
		
		varyingsurface_spheres[i].scale.setScalar( getVaryingSurfaceSphereScale(i) );
	}
	
	for(var i = 0; i<varyingsurface_spheres.length; i++){
		if(capsidopenness !== 1 )
			varyingsurface_spheres[i].position.set(varyingsurface.geometry.attributes.position.array[i*3+0],varyingsurface.geometry.attributes.position.array[i*3+1],varyingsurface.geometry.attributes.position.array[i*3+2]);
		else //actually it needs to be manipulation surface, unless
		{
			if(i === vertex_tobechanged)
			{
//				varyingsurface_spheres[i].position.set(flatnet_vertices.array[i*3+0],flatnet_vertices.array[i*3+1],flatnet_vertices.array[i*3+2]);
				varyingsurface_spheres[i].position.set(MousePosition.x,MousePosition.y,0);
			}
			else
			//change to mouse's position?
				varyingsurface_spheres[i].position.set(
						manipulation_surface.geometry.attributes.position.array[i*3+0],
						manipulation_surface.geometry.attributes.position.array[i*3+1],
						manipulation_surface.geometry.attributes.position.array[i*3+2]);
		}
		varyingsurface.localToWorld(varyingsurface_spheres[i].position);
	}

	varyingsurface.geometry.attributes.position.needsUpdate = true;
}