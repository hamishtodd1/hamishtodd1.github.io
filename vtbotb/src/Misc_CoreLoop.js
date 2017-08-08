/* Youtube version, from which you edit facebook version
 * 		960 tall
 * 		Spacebar to play
 * 		Mouse visible but get it out of the way
 * 		Titles, (virus, object) Each gets a pic of the virus side by side with the object
 * 			Why do viruses have so much in common with human designs? (rota, golf ball)
 * 			What does zika virus have in common with Islamic art? (zika, dome)
 * 			What do Hepatitis viruses have in common with soccer balls? (hep a, soccer ball)
 * 			What does HIV have in common with origami? (phi29, origami)
 * 			And that's what viruses have in common with human designs (measles and super dodecahedral?)
 * 		Can stop once you've got a still tree
 * 		Set resolution very high
 * 		black background
 * 		No tree, but yes to "now you can choose
 * 		960 resolution
 * 		Wait til after you've released it, so you know you're not tempted to make another version
 * 
 * -------General
 * 
 * Do need to stop because of end of prompt...
 * Tablet
 * 
 * 
 * 
	Animations in animated gifs, changes in systems / games. Both of these allow your brain to perform the same procedures better. = training. Your brain works over time, it's interesting how... in some sense all we do with systems is "put things in the time dimension"

Maybe you could prove platonic sharks by finding a godel's incompleteness theorem for biology?


	
Touch:
	tree went wrong
	went to youtube, fffffffffffffffffffff
	tablet but not phone. Phone is shite; it's just an advert for the desktop. Jessie computer
	Jessie's computer: it seemed to think it was a mouse
		Or did it? You put the finger down, moved it, and it flicked. Even though it copies
	
 *  ---------Probably never to be solved
 *  So you've triggered a repetition... but you need pause again once it's done; bear in mind the player might have done the necessary thing
 *  Stop player from playing on prompt
 *  Pop
 *  CK doesn't lose pentamer colors the first time it opens
 *  smooth qs transitions?
 *  Incorporate youtube loading into loading bar
 *  Flicker on chapter start. Could keep chapter start on the tree?
 *  Dodeca on "create lots of symmetry"
 * 	QS normals:
 * 		For all triangles with an unmarked edge on a dod edge, set their face normals to the normalized midpoint of the two corners they have on that edge
 * 		Then for all triangles in some shared shape, decide on a normal. Eg for the hexagon get it from that normal
 * 		But this is for your next life. It does increase the processing required and meshBasicMaterial looks fine and anyway this is a sophisticated abstract shape
 * 	Irreg: While moving vertices back in place, you can sort of check for convergence "for free"
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

var everySoOftenTimer = 0;

function render() {
	delta_t = ourclock.getDelta();
	
//	console.log(YOUTUBE_READY)
//	if(ytplayer && typeof ytplayer.getPlayerState === 'function' && ytplayer.getPlayerState() === -1)
//		console.log('"unstarted"')
	
	everySoOftenTimer += delta_t;
	if( everySoOftenTimer > 1 )
	{
		everySoOftenTimer = 0;
		
		if( document.body.style.cursor === '' && cursorIsHand )
		{
			document.body.style.cursor = '-webkit-grab';
		}
		if( document.body.style.cursor === '-webkit-grab' && !cursorIsHand)
			document.body.style.cursor = '';
	}
	
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
	
	camera_changes_for_mode_switch();
	
	switch(MODE) //probably you want to have a "mode advanced" variable which, on top of these, adds some stuff
	{
		case SLIDE_MODE:
			//slide added automatically
			break;
	
		case BOCAVIRUS_MODE:
			for(var i = 0; i < 60; i++)
				scene.add(neo_bocavirus_proteins[i]);
			for(var i = 0; i< reproduced_proteins.length; i++)
				EggCell.children[0].add( reproduced_proteins[i] );
			scene.add( stmvHider );
			scene.add(EggCell);
			scene.add(Cornucopia);
			break;
			
		case CK_MODE:
			capsidopenness = 0;
			
			scene.add(IrregButton);
			
			scene.add(CKHider); //can remove this if you have no internet
			scene.add(HexagonLattice);
//			scene.add(surface);
			for( var i = 0; i < surfperimeter_cylinders.length; i++) {
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