/*	
 * Long term To Do
 *  -everything listed in CKsurfacestuff, bocavirus, alexandrov, quasisphere
 *  -get new form of video in (?)
 *  -your tuned round-off error compensators might be different on different CPUs.
 *  -get a person with a sense of color to look at everything
 *  -sure you want things to be rotating in the way they are? Quasisphere, and perhaps CK as well, might feel better with buttons
 *  
 *  -make it feel good
 *  	-reduce latency
 *  	-all the effects in camerastuff
 *  	-test on different setups
 *  	-make work in different resolutions
 */

function UpdateWorld() {
	update_mouseblob();
	switch(MODE){
		case STATIC_PROTEIN_MODE:
			update_bocavirus();
			break;
		
		case STATIC_DNA_MODE:
			update_bocavirus();
			break;
			
		case CK_MODE:
			HandleNetMovement();
			
			UpdateCapsid();
			update_surfperimeter();

			Update_net_variables();			
			Map_lattice();
			
			Update_picture(1);
			if(!logged)
				console.log(camera.quaternion);
			logged = 1;
			break;
			
		case IRREGULAR_MODE:
			CheckButton(0);
			CheckButton(1);
			manipulate_vertices();
			update_varyingsurface();
			//correct_minimum_angles();
			break;
			
		case QC_SPHERE_MODE:
			UpdateQuasiSurface();
			MoveQuasiLattice();
			Map_To_Quasisphere();
			break;
			
		case CUBIC_LATTICE_MODE:
			update_animationprogress();
			update_3DLattice();
			break;
			
		case FINAL_FORMATION_MODE:
			update_3DLattice();
			update_formation_atom();
			update_Pariacoto();
	}
}

function render() {
	delta_t = ourclock.getDelta();
	if(delta_t > 0.1) delta_t = 0.1;
	//delta_t = 0.01;
	
	ReadInput();
	UpdateWorld();
	UpdateCamera();
	
//	if(delta_t < 1 / 60 )
//		setTimeout( function() { requestAnimationFrame( render ); }, 100 );
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}

//eventually we'll add some trigger to this that makes it reasonable to call every frame
function ChangeScene(new_mode) {	
	MODE = new_mode;
	
	for( var i = scene.children.length - 1; i >= 0; i--){
		var obj = scene.children[i];
		scene.remove(obj);
	}
//	scene.add( circle );
	
//	if(showdebugstuff){
//		for(var i = 0; i<indicatorblobs.length; i++)
//			scene.add(indicatorblobs[i]);
//	}
	
	camera_changes_for_mode_switch();
	
	//this is the one variable that seems to be conserved; at least if it isn't, then make it so.
	capsidopenness = 0;
	
	switch(MODE){
		case STATIC_PROTEIN_MODE:
			for(var i = 0; i<bocavirus_proteins.length; i++)
				scene.add(bocavirus_proteins[i]);
			for(var i = 0; i< lights.length; i++)
				scene.add( lights[i] );
			break;
		
		case STATIC_DNA_MODE:
			for(var i = 0; i<bocavirus_proteins.length; i++)
				scene.add(bocavirus_proteins[i]);
			for(var i = 0; i< lights.length; i++)
				scene.add( lights[i] );
			scene.add(DNA_cage);
			break;
			
		case CK_MODE:
			scene.add(surface);
			scene.add(surflattice);
			for( var i = 0; i < surfperimeter_cylinders.length; i++) {
//				scene.add(surfperimeter_spheres[i]);
				scene.add(surfperimeter_cylinders[i]);
			}
			for( var i = 0; i < blast_cylinders.length; i++)
				scene.add(blast_cylinders[i]);
			put_picture_in_place();
			break;
			
		case IRREGULAR_MODE:
			scene.add(manipulation_surface);
//			scene.add(varyingsurface);
			scene.add(Button[0]);
			scene.add(Button[1]);
			for( var i = 0; i < varyingsurface_cylinders.length; i++)
				scene.add(varyingsurface_cylinders[i]);
			for( var i = 0; i < varyingsurface_spheres.length; i++)
				scene.add(varyingsurface_spheres[i]);
			break;
			
		case QC_SPHERE_MODE:
			scene.add(dodeca);
			scene.add(Guide_quasilattice);
//			scene.add(quasiquasilattice);
//			scene.add(stablepointslattice);
			break;
		
		case CUBIC_LATTICE_MODE:
			scene.add(slider);
			scene.add(progress_bar);
			break;
			
		case FINAL_FORMATION_MODE:
			animation_progress = 1;
			for(var i = 0; i< lights.length; i++)
				scene.add( lights[i] );
			scene.add(QC_atoms);
			for(var i = 0; i< Paria_models.length; i++)
				scene.add(Paria_models[i]);
			break;
	}
}