/*	EGW todo
 * -protein capsid at beginning
 * -DNA at beginning
 * -random walking atom
 * -get it ON a webpage. If you can't integrate with video, could have links to each chapter
 * -integration into webpage... http://stackoverflow.com/questions/29401407/return-embed-youtube-current-time   https://developers.google.com/youtube/v3/code_samples/javascript
 * -protein models in CK
 * -everything sequential
 * -penrose tiling breakup demo? Urgh
 * 
 * 
 * Long term To Do
 * 
 *  -working on atoms doing random walks will make the one here easy
 *  -same for reading atomic data
 * 
 *  -implement protein models
 *  -implement look-inside
 *  -make it feel good
 *  -make video
 *  -integrate video; it must read only one variable, the time you are into the video.
 *  -test
 *  -iterate (maybe add puzzles)
 */



function UpdateWorld() {
	update_mouseblob();
	
	switch(MODE){
		case STATIC_PROTEIN_MODE:
			break;
		
		case STATIC_DNA_MODE:
			break;
			
		case CK_MODE:
			UpdateCapsid();
			update_surfperimeter();
			
			HandleLatticeMovement();
			Update_net_variables();
			
			Map_lattice();
			break;
			
		case CUBIC_LATTICE_MODE:
			update_3DLattice();
			break;
			
		case QC_SPHERE_MODE:
			UpdateQuasiSurface();
			MoveQuasiLattice();
			Map_To_Quasisphere();
			break;
			
		case IRREGULAR_MODE:
			CheckButton();
			HandleVertexRearrangement();
			update_varyingsurface();
			//correct_minimum_angles();
			break;
	}
}

function render() {
	delta_t = ourclock.getDelta();
	if(delta_t > 0.1) delta_t = 0.1;
	//delta_t = 0.01;
	
	ReadInput();
	UpdateWorld();
	UpdateCamera();
	
	//setTimeout( function() { requestAnimationFrame( render );}, 100 );
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}

init();
render();

//eventually we'll add some trigger to this that makes it reasonable to call every frame
function ChangeScene() {
	
	
	//this is the one variable that seems to be conserved; at least if it isn't, then make it so.
//	capsidopenness = 0;
	
	switch(MODE){
		case STATIC_PROTEIN_MODE:
			break;
		
		case STATIC_DNA_MODE:
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
			scene.add( circle );
			break;
			
		case CUBIC_LATTICE_MODE:
			scene.add( circle );
			scene.add(slider);
			scene.add(progress_bar);
			break;
			
		case QC_SPHERE_MODE:
			//scene.add(dodeca);
			for( var i = 0; i < quasicutouts.length; i++)
				scene.add(quasicutouts[i]);
			scene.add(dodeca);
			scene.add(back_hider);		
			scene.add( circle );	
			break;
			
		case IRREGULAR_MODE:
			scene.add(varyingsurface);
			scene.add(Button);
			for( var i = 0; i < varyingsurface_cylinders.length; i++)
				scene.add(varyingsurface_cylinders[i]);
			for( var i = 0; i < varyingsurface_spheres.length; i++)
				scene.add(varyingsurface_spheres[i]);
			scene.add( circle );
			break;
	}
}