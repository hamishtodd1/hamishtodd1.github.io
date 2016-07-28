/*	
 * Long term To Do
 * 	-you're not able to do profound in tone, only (maybe) in ideas.
 *  -everything listed in CKsurfacestuff, bocavirus, alexandrov, quasisphere
 *  -get new form of video in (?)
 *  -get a person with a sense of color to look at everything
 *  -how about everything rotates to face your mouse when you're not clicking. 
 *  	But touchscreens? How about there's a little object they can grab to make the mouse follow them? Could train them on the bocavirus part
 *  -lighting on everything?
 *  -no 666s, you don't want pearl-clutchers. Easiest is change it to 665, -1?
 *  -Framerate independence, and maybe the detection of speed that makes things nicer or simpler
 *  -loading. You may need to stagger inits.
 *  -watch people a lot and tweak the zooming and rotating code, just because it is simple doesn't mean that it is good
 *  -loading screen
 *  -nicer design for button
 *  -If webgl doesn’t load, recommend a different browser
 *  
 *  -so our plan for integrating rotation and touch controls is to have a separate object which, when grabbed, opens up the things
 *  -no increase in ontological parsimony since you have the button for irreg anyway.
 *  -the problem with them all following your mouse is that you can't turn them around completely.
 *  
 *  You still have interaction between irreg and CK, what the hell!
 *  
 *  
 *  -make it feel good
 *  	-optimize
 *  		-reduce latency?
 *  		-loops should not evaluate array lengths every time
 *  		-could generate some things once, then not again
 *  		-search for missing "console.log"s, those are old debug things and may have wasteful ifs.
 *  	-all the effects in camerastuff
 *  	-test on different setups
 *  	-make work in different resolutions/respond to resize.
 */

function UpdateWorld() {
	circle.position.copy(MousePosition);
	
	switch(MODE)
	{	
		case BOCAVIRUS_MODE:
			update_bocavirus();
			break;
			
		case CK_MODE:
			UpdateGrabbableArrow();
			HandleNetMovement();
			
			UpdateCapsid();
			update_surfperimeter();

			Update_net_variables();			
			Map_lattice();
			break;
			
		case IRREGULAR_MODE:
			CheckIrregButton();
			Update_pictures_in_scene();
			manipulate_vertices();
			update_varyingsurface();
			//correct_minimum_angles();
			break;
			
		case QC_SPHERE_MODE:
			UpdateQuasiSurface();
			UpdateGrabbableArrow();
			MoveQuasiLattice();
			Map_To_Quasisphere();
			break;
			
		case TREE_MODE:
			update_tree();
			break;
	}
	
	//this only does anything if it needs to
	Update_pictures_in_scene();
}

function render() {
	delta_t = ourclock.getDelta();
//	if(delta_t > 0.1) delta_t = 0.1;
	//delta_t = 0.01;
	
	ReadInput();
	UpdateWorld();
	UpdateCamera();
	
//	if(logged ){
////		setTimeout( function() { requestAnimationFrame( render ); }, 1000 );
//		logged = 0;
//	}
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}

//eventually we'll add some trigger to this that makes it reasonable to call every frame
//should probably not have scene.add or scene.remove anywhere outside this. It probably doesn't affect performance
function ChangeScene(new_mode) {
	//don't go changing this outside of here.
	MODE = new_mode;
	
	
	//everyone out
	for( var i = scene.children.length - 1; i >= 0; i--){
		var obj = scene.children[i];
		scene.remove(obj);
	}
	
	if(showdebugstuff){
		for(var i = 0; i<indicatorblobs.length; i++)
			scene.add(indicatorblobs[i]);
	}
	
	camera_changes_for_mode_switch();
	
	//this is the one variable that seems to be conserved; at least if it isn't, then make it so. But thaaaaat is why you get weird jitters when you change mode!
	capsidopenness = 0;
	
	switch(MODE) //probably you want to have a "mode advanced" variable which, on top of these, adds some stuff
	{
		case SLIDE_MODE:
			scene.add(VisibleSlide);
			break;
	
		case BOCAVIRUS_MODE:
			for(var i = 0; i < neo_bocavirus_proteins.length; i++)
				scene.add(neo_bocavirus_proteins[i]);
			for(var i = 0; i< lights.length; i++)
				scene.add( lights[i] );
			scene.add(DNA_cage);
			scene.add(EggCell);
			scene.add(Transcriptase);
			break;
			
		case CK_MODE:
			scene.add(CKHider);
			scene.add(HexagonLattice);
			scene.add(surface);
//			scene.add(surflattice);
			for( var i = 0; i < surfperimeter_cylinders.length; i++) {
//				scene.add(surfperimeter_spheres[i]);
				scene.add(surfperimeter_cylinders[i]);
			}
//			for( var i = 0; i < blast_cylinders.length; i++)
//				scene.add(blast_cylinders[i]);
			scene.add(GrabbableArrow);
			break;
			
		case IRREGULAR_MODE:
			scene.add(manipulation_surface);
//			scene.add(varyingsurface);
			for( var i = 0; i < varyingsurface_cylinders.length; i++)
				scene.add(varyingsurface_cylinders[i]);
			for( var i = 0; i < varyingsurface_spheres.length; i++)
				scene.add(varyingsurface_spheres[i]);
			scene.add(IrregButton);
			break;
			
		case QC_SPHERE_MODE:
			scene.add(dodeca);
			if(stable_point_of_meshes_currently_in_scene !== 666) //if it is equal to this, it has yet to be derived from the cutout vectors
				dodeca.add(quasicutout_meshes[stable_point_of_meshes_currently_in_scene]);
			scene.add(GrabbableArrow);
			break;
			
		case TREE_MODE:
			add_tree_stuff_to_scene();
	}
}