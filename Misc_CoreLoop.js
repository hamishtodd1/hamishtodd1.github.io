/* QS images
 * camerastuff stuff
 * The QS comparison pic will be made by you, in the style of QS
 * 
 * ------Below the thing
 * Sheree must design
 * 		A "go to tree" button
 * 		Social media buttons
 * 		Links: Press kit, your page, Information for teachers
 * 		Press contact - bug reports
 * 		Outside links (SEO terms!): "more interactive teaching tools; more information on viruses; more information on mathematics in art; more information on spherical patterns and geodesic domes"
 * 		picture at the bottom, for style (and so that the fucking things appears)?
 * 		Border
 * 		animated gif at the bottom
 * 
 * ----Diego
 * "which felt awful... let down"
 * "much smarter than western artists"
 * Images for Diego. HPV fade to model via density map, and phi29 to real thing
 * Youtube version, from which you edit facebook version
 * 
 * --------"pictures come in" parts. Make an engine! The pattern for a "bring something in" animation appears to be: zoom out, move to make room, new ones move in
 * pentagon thing
 * 		pentagons appear around it
 * Golf balls that look like viruses, buildings that look like viruses - they all pile up
 * move in from side, come down from top, all the time?
 * Hepatitis
 * HIV cure stuff
 * darb e stuff?
 * "These are images of some other viruses". Sheree chooses composition?
 * zika, bluetongue, hpv
 * Pentagons and more shapes
 * 	 zoom in on the monkey down to one of its cells? Would need illustration 
 * 	 darb e pattern comes out of that place while fading? Ask Diego
 * 
 * -------------Video response stuff (easy)
 * 		irreg: line up initial state with your very icosahedral virus and spin it a bit
 *		Highlight the pentagons and hexagons on polio and hepatitis B when you say it (just make pics with different colors and fade)
 *		irreg trying different configurations for algorithm
 * 		models go haywire at the end
 * 		Camera closer on beginning of CK
 * 		the button flashes until you have opened AND closed it, with a change between
 * 		CK pentagons flashing like sirens. Circles around them appear?
 * 		Make difference between phi29 and t4 clearer by doing it with the flattened net
 * 		Flick between spherical projection and flat for "the patterns that appeared on these viruses"
 * 		Lattice disappears when closed, except when you're doing the pentagon-noticing part
 * 
 * 
 * --------Technical
 * Check it in a single browser... see about the memory...
 * Bug: pictures can end up on top
 * Get it on an amazon or google server
 * Check for required things like flash 10. 
 * touchscreen (test on Jessie's computer)
 * Sounds in .mp3 or 4
 * 	If webgl doesn't load (or etc), recommend a different browser... or refreshing the page
 *	-link to great big static version if page doesn't work in some way
 *  -test on different setups
		-Johan's Mac
		-Reidun's computer (probably just webgl)
	Something during qs appeared to make it want a state from 308 or something
 *  
 *  ---------Probably never to be solved
 *  Flicker on chapter start
 *  Dodeca on "create lots of symmetry"
 *  It would be nice to flatten CK's corners
 *  A bug may have caused things to be skipped. Hopefully that goes away with the new arrangement
 * 	-cite non-illustrated pictures
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
//			scene.add(surface);
			for( var i = 0; i < surfperimeter_cylinders.length; i++) {
//				scene.add(surfperimeter_spheres[i]);
				scene.add(surfperimeter_cylinders[i]);
			}
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