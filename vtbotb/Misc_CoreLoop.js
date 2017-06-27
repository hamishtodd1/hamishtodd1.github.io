/* Youtube version, from which you edit facebook version
 * 		Spacebar to play
 * 		And one long youtube version for if the page doesn't load?
 * 			And on there normally, in case people steal? No, looks transparently clickbaity
 * 		Titles, (virus, object) Each gets a pic of the virus side by side with the object
 * 			Why do viruses have so much in common with human designs? (rota, golf ball)
 * 			What does zika virus have in common with Islamic art? (zika, dome)
 * 			What do Hepatitis viruses have in common with soccer balls? (hep a, soccer ball)
 * 			What does HIV have in common with origami? (phi29, origami)
 * 			And that's what viruses have in common with human designs (measles and super dodecahedral?)
 * 		Film with fraps on firefox. ~3GB per file
 * 
 * 
 * -------General
 * Take a picture of yourself with VR
 * Loading screen: fade in btv faces one by one
 * New button
 * Tree
 * Get it on an amazon or google server
 * Check for required things like flash 10, webgl, link to video if page doesn't work in some way. Or recommend a different browser
 * Test on different setups
		Johan's Mac
		http://browsershots.org/
   General bug testing
   Size snapping for the video and canvas was bullshit, correct it to whatever Sheree gives in her design
   Switch CK hex inflation to being when you click the close button
   So you've triggered a repetition... but you need pause again once it's done; bear in mind the player might have done the necessary thing
		
	Repetition trigger fired on use button?
Touch:
	tree went wrong
	went to youtube, fffffffffffffffffffff
	tablet but not phone. Phone is shite; it's ok for it to have anything at all. Jessie computer
	Jessie's computer: it seemed to think it was a mouse
		Or did it? You put the finger down, moved it, and it flicked. Even though it copies
		
		"images of some other viruses" tree
		reproduced virus proteins go in right places
		"perfectly icosahedral, like this one"
		sfx not on when video plays. Shape settles needs to be stoppable earl
		
		Got repetition of "you can do things with it"
		And "and using this button", particularly
		
		need lots of fades
		
		No second "next virus" cue?
		
		Really important that tree icons light up
		
		Google analytics
		
		Islamic art examples
		
		You do want a pentagon mode
		
		Virus patterns
		Virus beauty - sounds weird and you don't get .com
		virusdocumentary - sounds dry
	
----------Below the thing
 * Sheree must design
 * 		A "go to tree" button
 * 		Social media buttons
 * 		Links: Press kit, your page, Information for teachers
 * 		Press contact - bug reports
 * 		Outside links (SEO terms!): "more interactive teaching tools; more information on viruses; more information on mathematics in art; more information on spherical patterns and geodesic domes"
 * 		picture at the bottom, for style? Animated gif from imgur collection
 * 		Border
 *  
 *  ---------Probably never to be solved
 *  Incorporate youtube loading into loading bar
 *  Make difference between phi29 and t4 clearer by doing it with the flattened net
 *  QS shouldn't move when zooming in
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
			if( LatticeScale > 0.2) //min for one of the capsids we do. Minus a little grace
				Map_lattice();
			update_QS_center();
			break;
			
		case IRREGULAR_MODE:
			CheckIrregButton();
			manipulate_vertices();
			update_varyingsurface();
			update_wedges();
			//correct_minimum_angles();
			break;
			
		case QC_SPHERE_MODE:
			UpdateQuasiSurface();
			MoveQuasiLattice();
			Map_To_Quasisphere();
			update_QS_center();
			break;
			
		case TREE_MODE:
			update_tree();
			break;
			
		case HEXAGON_MODE:
			pentagonDemo.update();
			break;
	}
}

function render() {
	delta_t = ourclock.getDelta();
	
	if( PICTURES_LOADED && YOUTUBE_READY && INITIALIZED )
	{
		ReadInput();
		UpdateWorld();
		UpdateCamera();
	}
	
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
			scene.add(QS_measuring_stick);
			break;
			
		case IRREGULAR_MODE:
			for( var i = 0; i < varyingsurface_cylinders.length; i++)
				scene.add(varyingsurface_cylinders[i]);
			for( var i = 0; i < varyingsurface_spheres.length; i++)
				scene.add(varyingsurface_spheres[i]);
			for(var i = 0; i< lights.length; i++)
				scene.add( lights[i] );
			for(var i = 0; i < wedges.length; i++ )
				scene.add(wedges[i]);
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
			for(var i = 0; i < pentagonDemo.fullShapeArray.length; i++)
				scene.add(pentagonDemo.fullShapeArray[i])
			break;
			
		case CKPICS_MODE:
			for( var virus in movingPictures)
				scene.add( movingPictures[virus] );
			break;
	}
}