/* 
 * QS idea: set relevant face normals to be equal to each other
 * But how about the shapes that sit on dod edges? Well, there is a schema that lets you work out one from the other ;_;
 * Or don't, it doesn't look that much better
 * 
 * Screen shake on QS?
 * Shadows on irreg; a "floor" for the shadow. Different lights.
 * Shininess/Lighting on CK, it is a weird shape to look at
 * Depth material for QS?
 * 
 * ------------With Sheree
 * Social media buttons, press page links, at bottom
 * 2XFC or 1F15 for T=3. Wait what about cowpea? Not very straight lines but that might be ok if it's consistent across others
 * Go through demos with her and ask what colors should go where
 * 
 * ------------How to make nice pics of viruses: 
 * 	Chimera
 * 	clear out the things you don't want 
 * 	multiscale models, resolution 0 (i.e. surfaces)
 * 	if you want to color a chain, select one copy of it and click copies in the multiscale models window
 * 	actions>color>all options>tools>surface color>radius>get color person to choose
 * 
 * -------------When final cut is in
		Flick between spherical projection and flat for "the patterns that appeared on these viruses"
 * 		Golf balls that look like viruses, buildings that look like viruses - they all pile up
 * 		zoom in on the monkey down to one of its cells? Arrrrrgh need illustration
 * 		cell comes in and is same size as virus. They change size when you say so.
 * 		the virus pieces pop in by increasing size from zero
 * 		Highlight the pentagons and hexagons on polio and hepatitis B when you say it (just make pics with different colors and fade) 
 * 		Zoom in on darb e pattern
 *		"These are images of some other viruses". Sheree chooses composition, you animate
 * 		irreg trying different configurations for algorithm
 * 		things respond to your hand movements
 * 		models go haywire at the end
 * 		Camera closer on beginning of CK
 * 		the button flashes until you have opened AND closed it, with a change between
 * 		The whole hepatitis thing. They all come in.
 * 		Repetitions of advice
 * 		CK pentagons flashing like sirens
 * 		Show the crazy CK examples sequentially.
 * 
 * 
 * ----Misc
 *  -measuring stick on CK, srsly
 * 	-smoother open, not just linear
 *  -tweak scale/rotate speed stuff
 *  -all the effects in camerastuff
 * -everything listed in CKsurfacestuff, bocavirus, quasisphere, youtube stuff. There isn't much.
 *  
 *  
 * --------Technical
 * Bug found by Henry Segerman
 * touchscreen (test on Jessie's computer)
 * Sounds in .mp3 or 4
 * 	A bug may have caused things to be skipped. Hopefully that goes away with the new arrangement
 * 	If webgl doesn't load (or etc), recommend a different browser... or refreshing the page
 *	Custom domain. It won't need to be on Ed for ever; yes one day the link will stop working but that is maybe ok, just make sure people can google
 *	Loading wise, would it be faster with more than one loader?
 *  -prevent youtube playing until canvas is ready
 *  -link to great big static version if page doesn't load
 *  -make sure a good picture appears when shared on facebook and twitter. DEEPLY SUSPICIOUS: it gets the image on aboutme but not on recommendations.
 *  -optimize http://www.w3schools.com/js/js_performance.asp
 *  	-get rid of unused code
 *  	-search for missing "console.log"s, those are old debug things and may have wasteful ifs, alexandrov is chock-a-block
 *  -test on different setups
		-Johan's Mac
		-Reidun's computer (probably just webgl)
 * 		-Test with a low framerate to see what it's like and chase down remaining framerate dependence
 *  
 *  ---------Probably never to be solved
 * 	-cite non-illustrated pictures
 * Youtube fullscreen doubleclick problem
 * 
 */

var performance_checker = {
		frame_start_time: 0,
		sample_start_time: 0,
		sample_duration: 0,
		frame_duration: 0,
		last_sample_index: 0,
		
		samples: new Float32Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
};
performance_checker.get_samples_avg = function()
{
	var avg = 0;
	for(var i = 0, il = this.samples.length; i < il; i++)
		avg += this.samples[i];
	return avg / this.samples.length;
}
performance_checker.report_samples_avg = function()
{
	console.log( "sample average: ", performance_checker.get_samples_avg() );
}
performance_checker.report = function()
{
//	console.log(sample_duration / frame_duration);
}
performance_checker.begin_frame = function()
{
	this.frame_duration = 0;
	this.sample_duration = 0;
	this.frame_start_time = ourclock.getElapsedTime();
}
performance_checker.end_frame = function()
{
	this.frame_duration = ourclock.getElapsedTime() - this.frame_start_time;
	this.report();
}
performance_checker.begin_sample = function()
{
	this.sample_start_time = ourclock.getElapsedTime();
}
performance_checker.end_sample = function()
{
	this.sample_duration = ourclock.getElapsedTime() - this.sample_start_time;
	this.samples[ this.last_sample_index ] = this.sample_duration;
	this.last_sample_index++;
	if( this.last_sample_index > this.samples.length )
		this.last_sample_index = 0;
	this.report_samples_avg();
}

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
				scene.add( reproduced_proteins[i] );
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
			for(var i = 0; i< lights.length; i++)
				scene.add( lights[i] );
			break;
			
		case TREE_MODE:
			add_tree_stuff_to_scene();
			break;
			
		case HEXAGON_MODE:
			for(var i = 0; i < demonstration_hexagons.length; i++)
				scene.add(demonstration_hexagons[i]);
	}
}