function add_virus_selection_to_scene()
{
	switch(MODE) //probably you want to have a "mode advanced" variable which, on top of these, adds some stuff
	{
		case CK_MODE:
			for(var i = 4; i < 8; i++)
				scene.add(clickable_viruses[i]);
			break;
			
		case IRREGULAR_MODE:
			for(var i = 12; i < 15; i++)
				scene.add(clickable_viruses[i]);
			break;
			
		case QC_SPHERE_MODE:
			for(var i = 8; i < 12; i++)
				scene.add(clickable_viruses[i]);
			break;
	}
}

function init_clickable_viruses()
{
	//------Clickable viruses
	//TODO later add their names as meshes to them as children
	var picturepanel_width = playing_field_dimension;
	var y_of_picturepanel_bottom = -0.5 * playing_field_dimension;
	
	for(var i = 0; i < clickable_viruses.length; i++){
		clickable_viruses[i] = new THREE.Mesh(
			new THREE.CubeGeometry(picturepanel_width / 4, picturepanel_width / 4, 0),
			new THREE.MeshBasicMaterial( { transparent:true,
		        polygonOffset: true,
		        polygonOffsetFactor: -2.0, //on top
		        polygonOffsetUnits: -6.0
				} ) );
	}
	
	for(var i = 1; i < clickable_viruses.length; i++){
		clickable_viruses[i].enabled = 0; //switch to 1 when clicked, switch all to 0 when player changes anything
		clickable_viruses[i].TimeThroughMovement = 100; //start at a place where you're settled
		
		clickable_viruses[i].default_position = new THREE.Vector3(0,0,0.01);
		clickable_viruses[ i ].default_position.x = -3/8 * picturepanel_width;
		clickable_viruses[ i ].default_position.x += (i%4) * picturepanel_width / 4;
		clickable_viruses[ i ].default_position.y = y_of_picturepanel_bottom + 0.5 * picturepanel_width / 4; //they are in the frame, right?
		if( 11 < i && i < 16 ) //needs to be in front of the surface
		{
			clickable_viruses[ i ].default_position.z *= -1;
			clickable_viruses[ i ].default_position.x += picturepanel_width / 8;
		}
		
		clickable_viruses[i].enabled_position = clickable_viruses[i].default_position.clone();
		clickable_viruses[i].enabled_position.y += 0.4; //maybe too much
		clickable_viruses[i].position.copy(clickable_viruses[i].default_position);
	}
	
	for(var i = 0; i < clickable_viruses.length; i++)
	{
		clickable_viruses[i].material.map = virus_textures[i];
	}
}

function Disable_virus_pictures(){
	for(var i = 1; i < 16; i++){
		if(clickable_viruses[i].enabled === 1){
			clickable_viruses[i].enabled = 0;
			clickable_viruses[i].TimeThroughMovement = 0;
		}
	}
}

function Update_pictures_in_scene(){
	for(var i = 0; i < clickable_viruses.length; i++){
		if( scene.getObjectById(clickable_viruses[i].id) !== undefined )
			Update_virus_picture(i);
	}
}

function Update_virus_picture(index){
	var MouseRelative = MousePosition.clone();
	MouseRelative.sub(clickable_viruses[index].position);
	/*
	 * Bluetongue is 8, boca is 2, zika is 9, hpv is 7.
	 */
	
	if( isMouseDown && !isMouseDown_previously ){
		var ClickWasInPicture = 0;
		if( Math.abs(MouseRelative.x) < clickable_viruses[index].geometry.vertices[0].x &&
		    Math.abs(MouseRelative.y) < clickable_viruses[index].geometry.vertices[0].y )
			ClickWasInPicture = 1;
		
		if(clickable_viruses[index].enabled == 0){
			if( ClickWasInPicture ){
				Disable_virus_pictures();
				
				clickable_viruses[index].enabled = 1;
				clickable_viruses[index].TimeThroughMovement = 0;
				
				if( 12 <= index && index < 16){
					for(var i = 0; i < flatnet_vertices.array.length; i++)
						flatnet_vertices.array[i] = setvirus_flatnet_vertices[index-12][i];
					correct_minimum_angles(flatnet_vertices.array);
					
					varyingsurface.quaternion.set(-0.6578069578152893, 0.0342665347729774, -0.021255836146900412, 0.7521063756267157);
					for( var i = 0; i < varyingsurface_cylinders.length; i++)
						varyingsurface_cylinders[i].quaternion.copy(varyingsurface.quaternion);
					for( var i = 0; i < varyingsurface_spheres.length; i++)
						varyingsurface_spheres[i].quaternion.copy(varyingsurface.quaternion);
					capsidopenness = 0;
					IrregButton.capsidopen = 0;
				}
				else if( 4 <= index && index < 8){
					//set colors too
					if( index === 4){ LatticeScale=0.577; LatticeAngle = 0.5236; surface.quaternion.set(-0.27913862156621866,-0.008697986583808425,-0.0009914485321027323, 0.9602109101699025); }
					if( index === 5){ LatticeScale = 0.5; LatticeAngle = 0;		 surface.quaternion.set( 0.28108625833954903, -0.018889054648123092, 0.04124498016240475, 0.9586097071272512); }
					if( index === 6){ LatticeScale=0.3779; LatticeAngle =0.714;	 surface.quaternion.set(-0.2534081693372068, 0.027135037557069655, 0.0840263953918781, 0.9633211065513979); }
					if( index === 7){ LatticeScale = 1/3; LatticeAngle = 0.5236; surface.quaternion.set(-0.27913862156621866,-0.008697986583808425,-0.0009914485321027323, 0.9602109101699025); }
					
					for(var i = 0; i < surfperimeter_cylinders.length; i++ )
						surfperimeter_cylinders[i].quaternion.copy(surface.quaternion);
				}
				else if(8 <= index && index < 12){
					if(index === 8){cutout_vector0.set(-0.5,1.2139220723547204,0); 				cutout_vector1.set(1,0.85065080835204,0); }
					if(index === 9){cutout_vector0.set( 0.309016994374947,1.801707324647194,0); cutout_vector1.set(1.809016994374948,0.2628655560595675,0); }
					if(index ===10){cutout_vector0.set(1.809016994374948, 1.4384360606445132,0);cutout_vector1.set(1.9270509831248428, 1.2759762125280603,0); }
					if(index ===11){cutout_vector0.set(0,3.47930636894770,0); 					cutout_vector1.set(3.309016994374948, 1.075164796641833,0); }
					
					cutout_vector0_player.copy(cutout_vector0);cutout_vector1_player.copy(cutout_vector1);
				}
			}
		}
	}
	else if( clickable_viruses[index].enabled === 0 && !isMouseDown && //pics can also be turned on by us being in the right place
	   ((stable_point_of_meshes_currently_in_scene === 2 && index === 8) ||
		(stable_point_of_meshes_currently_in_scene === 8 && index === 9) ||
		(stable_point_of_meshes_currently_in_scene === 9 && index === 10)||
		(stable_point_of_meshes_currently_in_scene === 7 && index === 11)) )
	{
		Disable_virus_pictures();
		clickable_viruses[index].enabled = 1;
		clickable_viruses[index].TimeThroughMovement = 0;
	}
	//TODO more of those
	
	clickable_viruses[index].TimeThroughMovement += delta_t;	
	var MovementTime = 0.65; //tweakable
	if(clickable_viruses[index].enabled){
		clickable_viruses[index].position.copy( move_smooth_vectors(
				clickable_viruses[index].default_position,
				clickable_viruses[index].enabled_position,
				MovementTime,
				clickable_viruses[index].TimeThroughMovement) );
	}
	else{
		clickable_viruses[index].position.copy( move_smooth_vectors(
				clickable_viruses[index].enabled_position,
				clickable_viruses[index].default_position,
				MovementTime,
				clickable_viruses[index].TimeThroughMovement) );
	}
}