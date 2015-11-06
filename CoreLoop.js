/*	EGW todo
 * -film, edit
 * -protein capsid at beginning
 * -DNA at beginning
 * -penrose tiling breakup demo? Urgh. Can be done with just images
 * -integration into webpage... http://stackoverflow.com/questions/29401407/return-embed-youtube-current-time   https://developers.google.com/youtube/v3/code_samples/javascript
 * -If you can't integrate with video, could have links to each chapter
 * -random walking atom?
 * -protein models in CK?
 * 
 * 
 * So what can you do before the 12th
 * proper atoms
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

function check_arrows(){
	var ourscalar;
	if(MODE==CUBIC_LATTICE_MODE)
		ourscalar = 4.5;
	else ourscalar = 1;
	if(point_in_triangle(	(MousePosition.x*ourscalar-forwardbutton.position.x),(MousePosition.y*ourscalar-forwardbutton.position.y),
			forwardbutton.geometry.vertices[0].x*ourscalar, forwardbutton.geometry.vertices[0].y*ourscalar, 
			forwardbutton.geometry.vertices[1].x*ourscalar, forwardbutton.geometry.vertices[1].y*ourscalar, 
			forwardbutton.geometry.vertices[2].x*ourscalar, forwardbutton.geometry.vertices[2].y*ourscalar, 
			1) ) {
		forwardbutton.material.color.b = 0;
		forwardbutton.material.color.g = 1;
		
		if(isMouseDown && !isMouseDown_previously){
			ChangeScene(MODE+1);
		}
	}
	else{
		forwardbutton.material.color.b = 1;
		forwardbutton.material.color.g = 0;
	}
	if(point_in_triangle(	(MousePosition.x*ourscalar-backwardbutton.position.x),(MousePosition.y*ourscalar-backwardbutton.position.y),
			backwardbutton.geometry.vertices[0].x*ourscalar, backwardbutton.geometry.vertices[0].y*ourscalar, 
			backwardbutton.geometry.vertices[1].x*ourscalar, backwardbutton.geometry.vertices[1].y*ourscalar, 
			backwardbutton.geometry.vertices[2].x*ourscalar, backwardbutton.geometry.vertices[2].y*ourscalar, 
			1) ) {
		backwardbutton.material.color.b = 0;
		backwardbutton.material.color.g = 1;
		
		if(isMouseDown && !isMouseDown_previously){
			ChangeScene(MODE-1);
		}
	}
	else{
		backwardbutton.material.color.b = 1;
		backwardbutton.material.color.g = 0;
	}
}

function UpdateWorld() {
	update_mouseblob();
	check_arrows();
	
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
			logged = 1;
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
function ChangeScene(new_mode) {
	if(new_mode==CUBIC_LATTICE_MODE){
		forwardbutton.position.multiplyScalar(4.5);
		backwardbutton.position.multiplyScalar(4.5);
		forwardbutton.scale.set(4.5,4.5,4.5);
		backwardbutton.scale.set(4.5,4.5,4.5);
	}
	else if(MODE==CUBIC_LATTICE_MODE){
		forwardbutton.position.multiplyScalar(1/4.5);
		backwardbutton.position.multiplyScalar(1/4.5);
		forwardbutton.scale.set(1,1,1);
		backwardbutton.scale.set(1,1,1);
	}
	
	MODE = new_mode;
	
	for( var i = scene.children.length - 1; i >= 0; i--){
		var obj = scene.children[i];
		scene.remove(obj);
	}
	scene.add(forwardbutton);
	scene.add(backwardbutton);
	scene.add( circle );
	
//	if(showdebugstuff){
//		for(var i = 0; i<indicatorblobs.length; i++)
//			scene.add(indicatorblobs[i]);
//	}
	
	//this is the one variable that seems to be conserved; at least if it isn't, then make it so.
	capsidopenness = 0;
	
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
			break;
			
		case IRREGULAR_MODE:
			scene.add(varyingsurface);
			scene.add(Button);
			for( var i = 0; i < varyingsurface_cylinders.length; i++)
				scene.add(varyingsurface_cylinders[i]);
			for( var i = 0; i < varyingsurface_spheres.length; i++)
				scene.add(varyingsurface_spheres[i]);
			break;
			
		case QC_SPHERE_MODE:
			for( var i = 0; i < quasicutouts.length; i++)
				scene.add(quasicutouts[i]);
			scene.add(dodeca);
			scene.add(back_hider);
			break;
		
		case CUBIC_LATTICE_MODE:
			scene.add(slider);
			scene.add(progress_bar);
			break;
	}
}