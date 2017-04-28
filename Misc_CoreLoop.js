/* Do everything listed in camerastuff
 * Sounds
 * 
 * Sheree's cell illustration must be compatible with all others and must have a gap for the viruse
 * Images for Sheree. Discuss with Sheree what should go beneath
 * Go through demos with Sheree and ask what colors should go where
 * Images for Diego
 *  
 * 
 * Shadows on irreg; a "floor" for the shadow. Different lights.
 * Depth material for QS?
 * 
 * ------Below the thing
 * Sheree must design
 * 		A "go to tree" button
 * 		Social media buttons
 * 		Press kit
 * 		Contact
 * 		Information for teachers
 * 		SEO terms; maybe transcript (i.e. script). Click to expand
 * 		Maybe picture so the fucking thing appears
 * 
 * 
 * -------------When final cut is in / video response stuff
 * 		irreg: line up initial state with your very icosahedral virus and spin it a bit
		Flick between spherical projection and flat for "the patterns that appeared on these viruses"
 * 		Golf balls that look like viruses, buildings that look like viruses - they all pile up
 * 		Lattice disappears when closed, except when you're doing the pentagon-noticing part
 * 		Will have that "closing" sound effect but will probably also have a pop when it's shut
 * 		zoom in on the monkey down to one of its cells? Arrrrrgh need illustration
 * 		cell comes in and is same size as virus. They change size when you say so.
 * 		the virus pieces pop in by increasing size from zero
 * 		Highlight the pentagons and hexagons on polio and hepatitis B when you say it (just make pics with different colors and fade) 
 * 		darb e pattern comes out of that place while fading? Ask Diego
 *		"These are images of some other viruses". Sheree chooses composition, you animate
 * 		irreg trying different configurations for algorithm
 * 		things respond to your hand movements
 * 		models go haywire at the end
 * 		Camera closer on beginning of CK
 * 		the button flashes until you have opened AND closed it, with a change between
 * 		The whole hepatitis thing. They all come in.
 * 		CK pentagons flashing like sirens
 * 		angle measurers fade in
 * 		Show the crazy CK examples sequentially.
 * 
 * 
 * 
 * --------Technical
 * Flash 10 etc is required,  check for that
 * Bug: CK can get stuck trying to close
 * touchscreen (test on Jessie's computer)
 * Sounds in .mp3 or 4
 * 	If webgl doesn't load (or etc), recommend a different browser... or refreshing the page
 *	Loading wise, would it be faster with more than one loader?
 *  -link to great big static version if page doesn't work in some way
 *  -make sure a good picture appears when shared on facebook and twitter. DEEPLY SUSPICIOUS: it gets the image on aboutme but not on recommendations.
 *  -test on different setups
		-Johan's Mac
		-Reidun's computer (probably just webgl)
 *  
 *  ---------Probably never to be solved
 *  A bug may have caused things to be skipped. Hopefully that goes away with the new arrangement
 * 	-cite non-illustrated pictures
 * Youtube fullscreen doubleclick problem
 * QS normals:
 * 		For all triangles with an unmarked edge on a dod edge, set their face normals to the normalized midpoint of the two corners they have on that edge
 * 		Then for all triangles in some shared shape, decide on a normal. Eg for the hexagon get it from that normal
 * 		But this is for your next life. It does increase the processing required and meshBasicMaterial looks fine and anyway this is a sophisticated abstract shape
 * Irreg: While moving vertices back in place, you can sort of check for convergence "for free"
 * 		This requires checking angular defects, but many things are based on whether vertex_tobechanged is defined
 */

function UpdateWorld()
{
//	performance_checker.begin_frame();
	
	switch(MODE)
	{	
		case BOCAVIRUS_MODE:
			update_bocavirus();
			break;
			
		case CK_MODE:
			CheckIrregButton();
			
			HandleNetMovement();
			
			UpdateCapsid();
			update_surfperimeter();

			Update_net_variables();
//			performance_checker.begin_sample();
			if( LatticeScale > 0.2) //min for one of the capsids we do. Minus a little grace
				Map_lattice();
//			performance_checker.end_sample();
			update_QS_center();
			break;
			
		case IRREGULAR_MODE:
			CheckIrregButton();
			manipulate_vertices();
			update_varyingsurface();
			//correct_minimum_angles();
			update_wedges();
			break;
			
		case QC_SPHERE_MODE:
			UpdateQuasiSurface();
			UpdateGrabbableArrow();
			MoveQuasiLattice();
			Map_To_Quasisphere();
			update_QS_center();
			break;
			
		case TREE_MODE:
			update_tree();
			break;
			
		case HEXAGON_MODE:
			update_hexagon_demo();
			break;
	}
	
//	performance_checker.end_frame();
}

function render() {
	delta_t = ourclock.getDelta();
//	console.log(delta_t)
//	if(delta_t > 0.1) delta_t = 0.1;
	//delta_t = 0.01;
	
	if( PICTURES_LOADED && YOUTUBE_READY && INITIALIZED )
	{
		ReadInput();
		UpdateWorld();
		UpdateCamera();
	}
	
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
			//slide added automatically
			break;
	
		case BOCAVIRUS_MODE:
			for(var i = 0; i < 60; i++)
				scene.add(neo_bocavirus_proteins[i]);
			for(var i = 0; i< lights.length; i++)
				scene.add( lights[i] );
			for(var i = 0; i< reproduced_proteins.length; i++)
				EggCell.add( reproduced_proteins[i] );
			scene.add( stmvHider );
			scene.add(EggCell);
			scene.add(Cornucopia);
			break;
			
		case CK_MODE:
			scene.add(IrregButton);
			
			scene.add(CKHider); //can remove this if you have no internet
			scene.add(HexagonLattice);
			scene.add(surface);
//			scene.add(surflattice);
			for( var i = 0; i < surfperimeter_cylinders.length; i++) {
//				scene.add(surfperimeter_spheres[i]);
				scene.add(surfperimeter_cylinders[i]);
			}
//			for( var i = 0; i < blast_cylinders.length; i++)
//				scene.add(blast_cylinders[i]);
			for(var i = 0; i< lights.length; i++)
				scene.add( lights[i] );
			scene.add(QS_measuring_stick);
			break;
			
		case IRREGULAR_MODE:
			scene.add(manipulation_surface);
//			scene.add(varyingsurface);
			for( var i = 0; i < varyingsurface_cylinders.length; i++)
				scene.add(varyingsurface_cylinders[i]);
			for( var i = 0; i < varyingsurface_spheres.length; i++)
				scene.add(varyingsurface_spheres[i]);
			for( var i = 0; i < wedges.length; i++ )
				scene.add( wedges[i] );
			for(var i = 0; i< lights.length; i++)
				scene.add( lights[i] );
			scene.add(IrregButton);
			break;
			
		case QC_SPHERE_MODE:
			scene.add(dodeca);
			if(stable_point_of_meshes_currently_in_scene !== 999) //if it is equal to this, it has yet to be derived from the cutout vectors
				dodeca.add(quasicutout_meshes[stable_point_of_meshes_currently_in_scene]);
			scene.add(QS_center);
			scene.add(QS_measuring_stick);
			break;
			
		case TREE_MODE:
			add_tree_stuff_to_scene();
			break;
			
		case HEXAGON_MODE:
			for(var i = 0; i < demonstration_hexagons.length; i++)
				scene.add(demonstration_hexagons[i]);
	}
}