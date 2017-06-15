/* 
 * Programming the triggers: make sure there�s no interdependence. 
 * 
 * One deep bug is the fact that if they tab away and don't pause, the program isn't running so it can't be paused
 * 
 * Possible bug report from khan academy andy: CK to end!!!!
 */

var Storypage = -1; //set to a silly number initially so we know that the first page will be triggered.
var Story_states = [];
var unpause_timer = 0;
var rotation_knowledge_time;
var reused_slide_indices = Array();
var lattice_fadein_time;
var cutout_vector0_interpolatingfrom = new THREE.Vector3();

var theyKnowYouCanOpenAndClose = false;

function Update_story()
{	
	if(Storypage !== -1) //first part of this function is all based on current state, which you don't have at the very start
	{
		if( Story_states[Storypage].slide_number !== -1 )
		{
			if( Story_states[Storypage].fadePicture )
			{
				slideObjects[ Story_states[Storypage].slide_number ].material.opacity += 0.02;
				if( slideObjects[ Story_states[Storypage].slide_number ].material.opacity > 1 )
					slideObjects[ Story_states[Storypage].slide_number ].material.opacity = 1;
			}	
			else
				slideObjects[ Story_states[Storypage].slide_number ].material.opacity = 1;
		}	
		
		if( Story_states[Storypage].varyingsurfaceZRotation )
		{
			varyingsurface.rotation.z += delta_t;
			for( var i = 0; i < varyingsurface_cylinders.length; i++)
				varyingsurface_cylinders[i].rotation.y += delta_t;
			varyingsurface.updateMatrixWorld();
		}
		
		if( Story_states[Storypage].CK_scale !== 999 )
			LatticeScale += (Story_states[Storypage].CK_scale - LatticeScale ) * 0.1;
		if( Story_states[Storypage].CK_angle !== 999 )
			LatticeAngle += (Story_states[Storypage].CK_angle - LatticeAngle ) * 0.1;
		
		if( Story_states[Storypage].prevent_playing )
			if(ytplayer.getPlayerState() === 1)// 1 means playing, not allowed (although maybe some people like to have order designated for them?)
				ytplayer.pauseVideo();
	
		for(var i = 0; i < Story_states[Storypage].CKPicStates.length; i++)
		{
			var positionToChange = movingPictures[ Story_states[Storypage].CKPicStates[i].virus ].position;
			positionToChange.x += ( Story_states[Storypage].CKPicStates[i].x - positionToChange.x ) * 0.1;
			positionToChange.y += ( Story_states[Storypage].CKPicStates[i].y - positionToChange.y ) * 0.1;
		}
		
		var currentScale = movingPictures["hepA"].scale.x;
		for( var virus in movingPictures)
			movingPictures[virus].scale.setScalar( currentScale + ( Story_states[Storypage].CKPicScale - currentScale ) * 0.1 );
		
		
		if( ( !Story_states[Storypage].rendererWidth && renderer.domElement.width !== 0 ) || ( Story_states[Storypage].rendererWidth && renderer.domElement.width !== renderer.domElement.height ) )
		{
			var newWidth = renderer.getSize().width / renderer.domElement.height;
			newWidth += (Story_states[Storypage].rendererWidth - newWidth ) / 10;
			
			if(newWidth>1)
				newWidth = 1;
			else if(newWidth < 0.001 )
				newWidth = 0;
			
			onWindowResizeExceptYoutube(newWidth);
		}
		
		if( Story_states[Storypage].unpauseOn() )
			ytplayer.playVideo();
		
		if( ytplayer.getPlayerState() === 2 )
			unpause_timer += delta_t;
		if( Story_states[Storypage].unpause_after !== -1 ) //TODO this will go down even if it's not the *correct* pause
		{
			if( unpause_timer >= Story_states[Storypage].unpause_after )
			{
				ytplayer.playVideo();
			}
		}
		
		if( MODE !== TREE_MODE && MODE !== QC_SPHERE_MODE && MODE !== BOCAVIRUS_MODE ) //under these possibilities we might not want the default camera position
			camera.position.z += ( Story_states[Storypage].cameraZ - camera.position.z ) * 0.1;
		
		//if you're about to move on from a state naturally
		if( Story_states[Storypage + 1].startingtime < our_CurrentTime && our_CurrentTime < Story_states[Storypage + 1].startingtime + 0.2 )
		{
			if( Story_states[Storypage].pause_at_end === 1 )
			{
				if( ytplayer.getPlayerState() === 2 ) //if you're paused, we don't let you past here
					Story_states[Storypage].used_up_pause = true;
				
				//we want to move on iff you've had the pause and you're no longer paused (i.e. the player unpaused you)
				if( !Story_states[Storypage].used_up_pause )
				{
					unpause_timer = 0;
					ytplayer.pauseVideo(); //this has a delayed reaction, we will continue asking for a pause until it has paused, hence the above
					return;
				}
			}
			
			if( !Story_states[Storypage].playerHasLearned() ) //we readvise if they unpause without fulfilling the condition, or if they wait
			{
				Story_states[Storypage].loopBackCountdown -= delta_t;
				if( Story_states[Storypage].loopBackCountdown < 0 || ytplayer.getPlayerState() === 1 ) //if we're not paused, the player did it.
				{
					Story_states[Storypage].loopBackCountdown = 25;
					ytplayer.seekTo( Story_states[Storypage].loopBackTo );
					ytplayer.playVideo();
					Story_states[Storypage].used_up_pause = false;
					return;
				}
			}
			
			if( ytplayer.getPlayerState() === 2 ) //we don't want to leave this state
				return;
		}
		
		if( Story_states[Storypage].enforced_cutout_vector0_player.x !== -1 )
		{
			var lerpedness = (our_CurrentTime - Story_states[Storypage].startingtime) / 0.8; //pic of pills!
			if(lerpedness < 0)
				lerpedness = 0;
			if(lerpedness>1)
				lerpedness = 1;
			
//			cutout_vector0_player.x += (Story_states[Storypage].enforced_cutout_vector0_player.x-cutout_vector0_player.x) * 0.1;
//			cutout_vector0_player.y += (Story_states[Storypage].enforced_cutout_vector0_player.y-cutout_vector0_player.x) * 0.1;
			
			cutout_vector0_player.lerpVectors(cutout_vector0_interpolatingfrom, Story_states[Storypage].enforced_cutout_vector0_player, lerpedness );
		}
		
//		if( Story_states[Storypage].pentagonsFlashing )
//		{
//			Story_states[Storypage].pentamers_color.set(0,0,0); //or your default color
//			Story_states[Storypage].pentamers_color.lerp(new THREE.Color(1,1,1), //your alt color
//					(Math.sin(our_CurrentTime)+1)/2 );
//		}
	}
	
	//potentially change state, and only continue with this function if there's state to be changed	
	for(var i = 0; i < Story_states.length; i++)
	{
		//if you're on the nose of the state's startingtime, you're in that state
		if(	Story_states[i].startingtime <= our_CurrentTime && Story_states[i].chapter === ytplayer.chapter &&
		  ( i === Story_states.length - 1 || our_CurrentTime < Story_states[i+1].startingtime ) )
		{
			if( Storypage === i ) //nothing need be done
				return;
			
			Storypage = i;
			
			if( Story_states[Storypage].go_to_time !== -1 ) //want to catch the state immediately
			{
				ytplayer.seekTo( Story_states[Storypage].go_to_time );
				our_CurrentTime =Story_states[Storypage].go_to_time;
			}
			else
				break;
		}
		
		if( i === Story_states.length - 1 )
			console.error("no story state found for current time, which is ", our_CurrentTime, " in chapter ", ytplayer.chapter )
	}
	
	//everything below here only happens once, at the start of the chapter.
	
	if( Story_states[Storypage].enforced_cutout_vector0_player.x !== -1 ) //note to self: you're screwed if you'd like it to be -1 as that is the "default"!
		cutout_vector0_interpolatingfrom.copy(cutout_vector0_player); //could choose it based on proximity to the destination modulo TAU / 5
	
	//only want this for sudden transitions, not wrapups - that is handled automatically.
	if( Story_states[Storypage].enforced_irreg_quaternion.x !== 5 ) //we want you either going towards closed or closed
	{
		varyingsurface.quaternion.copy( Story_states[Storypage].enforced_irreg_quaternion );
		for( var i = 0; i < varyingsurface_cylinders.length; i++)
			varyingsurface_cylinders[i].quaternion.copy(Story_states[Storypage].enforced_irreg_quaternion );
//		for( var i = 0; i < varyingsurface_spheres.length; i++)
//			varyingsurface_spheres[i].quaternion.copy(Story_states[Storypage].enforced_irreg_quaternion );
		
		varyingsurface.updateMatrixWorld();
	}
	
	if( Story_states[Storypage].enforced_CK_quaternion.x !== 5 )
	{
		surface.quaternion.copy( Story_states[Storypage].enforced_CK_quaternion );
		for(var i = 0; i < surfperimeter_cylinders.length; i++ )
			surfperimeter_cylinders[i].quaternion.copy( Story_states[Storypage].enforced_CK_quaternion );
	}
	
	if( Story_states[Storypage].enforced_irreg_state !== -1 )
	{
		console.log( Story_states[Storypage].enforced_irreg_state );
		for(var i = 0; i < flatnet_vertices.array.length; i++)
			flatnet_vertices.array[i] = setvirus_flatnet_vertices[Story_states[Storypage].enforced_irreg_state][i];
		if(Story_states[Storypage-1].MODE !== IRREGULAR_MODE) //we're flicking back - no need to see transition
			settle_manipulationsurface_and_flatnet(); 
		update_wedges();
		AO.correct_minimum_angles(flatnet_vertices.array);
	}
	
	if( Story_states[Storypage].MODE !== MODE )
		ChangeScene(Story_states[Storypage].MODE );
	
	for(var i = 0; i < slideObjects.length; i++)
	{
		if( typeof slideObjects[i] !== 'undefined' && slideObjects[i].parent === scene )
		{
			if( Story_states[Storypage].slide_number === i )
				continue;
			else if( Storypage-1 >= 0 && Story_states[Storypage-1].slide_number === i && Story_states[Storypage].slide_number !== -1 )
				continue; //the last slide can stay in, provided this state has a slide
			else
				scene.remove(slideObjects[i]);	
		}
	}

	if( Story_states[Storypage].slide_number !== -1 )
	{
		scene.add( slideObjects[ Story_states[Storypage].slide_number ] );
		slideObjects[ Story_states[Storypage].slide_number ].position.z = camera.position.z - min_cameradist;
		if( Storypage > 0 && Story_states[Storypage-1].slide_number !== -1) { //if there was a previous slide
			slideObjects[ Story_states[Storypage].slide_number ].position.z = slideObjects[ Story_states[Storypage-1].slide_number ].position.z + 0.001;
			slideObjects[ Story_states[Storypage].slide_number ].material.opacity = 0;
		}
		
		cursorIsHand = false;
		document.body.style.cursor = ''; //there might be some other situations in which you want this.
	}
	else
	{
		cursorIsHand = true;
		document.body.style.cursor = '-webkit-grab';
	}
	
	//If we've just ticked forward then of course we should be playing anyway, but if we just started a new chapter, having been on the tree, we might be paused
	if( !Story_states[Storypage].prevent_playing )
		ytplayer.playVideo();
	
	if( Story_states[Storypage].capsid_open !== -1 )
		IrregButton.capsidopen = Story_states[Storypage].capsid_open;
	
	if( Story_states[Storypage].capsid_open_immediately !== -1 )
	{
		IrregButton.capsidopen = Story_states[Storypage].capsid_open_immediately;
		capsidopenness = IrregButton.capsidopen;
	}
	
	if( Story_states[Storypage].irreg_button_invisible )
		IrregButton.visible = false;
	else
		IrregButton.visible = true;
	
	
	/*
	 * 
	 * Snap
	 * Line up Hepatitis?
	 * 
	 * -dodeca can appear on QS?
	 * -QS edges and vertices flash?
	 * -greenhouse etc in CK
	 * -DNA mimics what you do?
	 * -QS points and edges flash?
	 * -dodecahedron faces flash?
	 * 
	 */
}

function init_story()
{	
	var ns; //new state
	
	function defaultUnpauseOn() {return false;}
	function defaultPlayerHasLearned() {return true;}
	
	var default_minimum_angle_crapifiers = Array(22);
	for(var i = 0; i < default_minimum_angle_crapifiers.length; i++ )
		default_minimum_angle_crapifiers[i] = 1;
	
	var defaultPentamersColor = new THREE.Color( 147/255,0,8/255 );
	var defaultHexamersColor = new THREE.Color( 208/255,58/255,59/255 );
	
	Story_states.push({
		startingtime: -1, //this is just the prototype state, not really used!
		
		MODE: SLIDE_MODE,
		
		pause_at_end: 0, //at end because when you unpause it's usually a new thought
		unpause_after: -1, //but you only want it to unpause if it's the pause that YOU'VE done :P Currently
		
		slide_number: -1,
		
		go_to_time: -1,
		//The thing about go_to_time is that you can't have it take you to a place in the state in which it occurs
		
		enforced_irreg_state: -1,
		
		minimum_angle_crapifiers: default_minimum_angle_crapifiers,
		
		CKPicStates: [],
		CKPicScale: 1,
		
		enforced_CK_quaternion: new THREE.Quaternion(5,5,5,5),
		enforced_irreg_quaternion: new THREE.Quaternion(5,5,5,5),
		
		pentamers_color: defaultPentamersColor.clone(),
		hexamers_color: defaultHexamersColor.clone(),
		
		capsid_open: -1,
		irreg_button_invisible: 0,
		
		cameraZ: min_cameradist,
		
		playerHasLearned: defaultPlayerHasLearned,
		loopBackTo: -1, //If you don't do the thing, or try to unpause, it will loop back
		loopBackCountdown: 0,
		used_up_pause: false,
		
		varyingsurfaceZRotation: false,
		
		fadePicture: false,
		
		sphericality: 0,
		persistentLattice: false,
		
		chapter: 0,
		
		wedgesOpacity: 0,
		
		CK_scale: 999,
		CK_angle: 999,
		
		unpauseOn: defaultUnpauseOn,
		
		rendererWidth: 1,
		
		enforced_cutout_vector0_player: new THREE.Vector3(-1,0,0),
		
		pentagonsFlashing: false,
		
		prevent_playing: 0 //could also use this to stop them from continuing if they haven't rotated bocavirus etc
	});
	
	function default_clone_story_state( shows_a_slide, ST )
	{
		var default_page_duration = 1.2;
		
		var new_story_state = {};
		
		for(var propt in Story_states[Story_states.length - 1]){
		    new_story_state[propt] = Story_states[Story_states.length - 1][propt];
		}
		
		if( shows_a_slide === 1 )
		{
			new_story_state.slide_number = next_slide; //quite rare that you want to keep a slide
			next_slide++;
		}
		else
			new_story_state.slide_number = -1; //quite rare that you want to keep a slide
		
		new_story_state.sphericality = 0;
		new_story_state.persistentLattice = false;
		
		new_story_state.pentagonsFlashing = false;
		
		new_story_state.varyingsurfaceZRotation = false;
		
		new_story_state.startingtime += default_page_duration;
		
		new_story_state.minimum_angle_crapifiers = default_minimum_angle_crapifiers;
		
		new_story_state.capsid_open = -1;
		new_story_state.capsid_open_immediately = -1;
		
		new_story_state.fadePicture = false;
		
		new_story_state.CK_scale = 999;
		new_story_state.CK_angle = 999;
		
		new_story_state.CKPicStates = [];
		
		//make it unused
		new_story_state.enforced_cutout_vector0_player = new THREE.Vector3(-1,0,0);
		
		new_story_state.unpauseOn = defaultUnpauseOn;
		new_story_state.playerHasLearned = defaultPlayerHasLearned;
		new_story_state.loopBackTo = -1;
		
		new_story_state.go_to_time = -1;
		
		new_story_state.prevent_playing = 0;
		
		new_story_state.pause_at_end = 0;
		new_story_state.unpause_after = -1;
		
		new_story_state.enforced_irreg_state = -1;
		
		new_story_state.rendererWidth = 1;
		
		new_story_state.enforced_CK_quaternion = new THREE.Quaternion(5,5,5,5);
		new_story_state.enforced_irreg_quaternion = new THREE.Quaternion(5,5,5,5);
		
		new_story_state.startingtime = ST;
		
		return new_story_state;
	}
	
	//-----------------for testing touch
//	ns = default_clone_story_state(0,0.1);
//	ns.MODE = CK_MODE;
//	Story_states.push(ns);
//	ns = default_clone_story_state(0,2);
//	ns.MODE = QC_SPHERE_MODE;
//	Story_states.push(ns);
//	ns = default_clone_story_state(0,4);
//	ns.MODE = IRREGULAR_MODE;
//	Story_states.push(ns);
	
	//---------------Real thing
	
	ns = default_clone_story_state(1,0.01);
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,12.2); //hiv
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,21.6); //measles
	var Dad_slide = ns.slide_number;
	Story_states.push(ns);
	
	//---paragraph 2
	ns = default_clone_story_state(0,40.6); //bocavirus appears, then pause
	ns.MODE = BOCAVIRUS_MODE;
	ns.pause_at_end = 1; //TODO handle the assurance.
	ns.loopBackTo = 43.9;
	ns.loopBackCountdown = 7;
	ns.playerHasLearned = function() { if( rotation_understanding === 0 ) return false; else return true; }
	ns.unpauseOn = function() {if( rotation_understanding >= 4 || (rotation_understanding >= 2 && unpause_timer > 6.5 ) ) return true; else return false;}
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,49.2); //unpause
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,53.5); //harmless rash
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,58); //miscarriage
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,63); //back
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,70.8); //color
	ns.pause_at_end = 1;
	ns.unpause_after = 7.7;
	flash_time = ns.startingtime;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,85.3); //unpause advice
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,90.3); //images
	cornucopia_start_time = ns.startingtime + 0.5;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,103.7); //humaaaans
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,113.1); //golf ball
	var golfSlide = ns.slide_number;
	unflash_time = ns.startingtime;
	cornucopia_end_time = ns.startingtime;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,115.7); //rota
	var golfLikeVirusSlide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,117.6); //buildings
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,120.4); //phi29
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,123.5); //religious art
	var islamic_dome_index = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,127.1); //HPV
	Story_states.push(ns);

	ns = default_clone_story_state(0,140.5); //beginning of part 2, back to boca
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	pullback_start_time = 146.8;
	cell_appears_time = 148.9;
	cell_move_time = 156.8;
	boca_explosion_start_time = 162.3;
	boca_pieces_disappear_time = 165.6;
	start_reproducing_time = 171;
	
	ns = default_clone_story_state(1,182.9); //cell with fluourescence
	ns.MODE = SLIDE_MODE;
	whole_thing_finish_time = ns.startingtime;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,190); //back to boca
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,194.2); //retract canvas
	ns.rendererWidth = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,236.9); //humans
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,238.4); //canvas comes out again
	ns.rendererWidth = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,271.2); //cell full of viruses
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,276.9); //lysis
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,281.8); //spread to other cells
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,287.2); //picture of boca
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,294); //Tree
	ns.MODE = TREE_MODE;
	ns.pause_at_end = 1;
	ns.loopBackTo = 302.8;
	ns.loopBackCountdown = 8;
	ns.playerHasLearned = function() { return false;}
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,308.8);
	ns.loopBackTo = 302.8;
	ns.playerHasLearned = function() { return false;}
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,500);
	Story_states.push(ns);
	
	//------CK BEGINS
	ns = default_clone_story_state(1,0); //polio
	ns.chapter = 1;
	var polio_slide = ns.slide_number;
	ns.MODE = SLIDE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,0.1);
	ns.MODE = CKPICS_MODE;
	var halfVerticalSeparation = 1;
	ns.CKPicStates.push({virus:"hepA",x:0,y:0});
	ns.CKPicStates.push({virus:"hepB",x:0,y:-playing_field_dimension});
	ns.CKPicStates.push({virus:"aMimic1",x:-playing_field_dimension, y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"aMimic2",x:-playing_field_dimension, y:-halfVerticalSeparation});
	ns.CKPicStates.push({virus:"bMimic1",x:playing_field_dimension, y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"bMimic2",x:playing_field_dimension, y:-halfVerticalSeparation});
	ns.CKPicScale = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,1);
	ns.CKPicScale *= 2;
	ns.CKPicStates.push({virus:"hepA",x:0,y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"hepB",x:0,y:-halfVerticalSeparation});
	Story_states.push(ns);

	ns = default_clone_story_state(0,2);
	ns.CKPicStates.push({virus:"hepA",x:playing_field_dimension, y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"hepB",x:playing_field_dimension, y:-halfVerticalSeparation});
	ns.CKPicStates.push({virus:"aMimic1",x:0, y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"aMimic2",x:0, y:-halfVerticalSeparation});
	Story_states.push(ns);

	ns = default_clone_story_state(0,3);
	ns.CKPicStates.push({virus:"hepA",x:halfVerticalSeparation, y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"aMimic1",x:-halfVerticalSeparation, y:halfVerticalSeparation});
	Story_states.push(ns);

	ns = default_clone_story_state(0,4);
	ns.CKPicStates.push({virus:"hepB",x:halfVerticalSeparation, y:-halfVerticalSeparation});
	ns.CKPicStates.push({virus:"aMimic2",x:-halfVerticalSeparation, y:-halfVerticalSeparation});
	Story_states.push(ns);

	ns = default_clone_story_state(0,5);
	ns.CKPicStates.push({virus:"hepA",x:-playing_field_dimension, y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"hepB",x:-playing_field_dimension, y:-halfVerticalSeparation});
	ns.CKPicStates.push({virus:"aMimic1",x:-playing_field_dimension, y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"aMimic2",x:-playing_field_dimension, y:-halfVerticalSeparation});
	ns.CKPicStates.push({virus:"bMimic1",x:0, y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"bMimic2",x:0, y:-halfVerticalSeparation});
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,6.5);
	ns.CKPicStates.push({virus:"hepB",x:-halfVerticalSeparation, y:-halfVerticalSeparation});
	ns.CKPicStates.push({virus:"bMimic2",x:halfVerticalSeparation, y:-halfVerticalSeparation});
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,7.5);
	ns.CKPicStates.push({virus:"hepA",x:0, y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"hepB",x:0, y:-halfVerticalSeparation});
	ns.CKPicStates.push({virus:"bMimic1",x:playing_field_dimension, y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"bMimic2",x:playing_field_dimension, y:-halfVerticalSeparation});
	Story_states.push(ns);

	ns = default_clone_story_state(0,8.5);
	ns.CKPicStates.push({virus:"aMimic1",x:-halfVerticalSeparation*2, y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"aMimic2",x:-halfVerticalSeparation*2, y:-halfVerticalSeparation});
	ns.CKPicStates.push({virus:"bMimic1",x:halfVerticalSeparation*2, y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"bMimic2",x:halfVerticalSeparation*2, y:-halfVerticalSeparation});
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,9.5);
	ns.CKPicStates.push({virus:"aMimic1",x:-playing_field_dimension, y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"aMimic2",x:-playing_field_dimension, y:-halfVerticalSeparation});
	ns.CKPicStates.push({virus:"bMimic1",x:playing_field_dimension, y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"bMimic2",x:playing_field_dimension, y:-halfVerticalSeparation});
	ns.CKPicStates.push({virus:"hepA",x:0, y:0});
	ns.CKPicStates.push({virus:"hepB",x:0, y:-playing_field_dimension});
	Story_states.push(ns);

	ns = default_clone_story_state(1,44.7); //small polio to introduce model. Above is the moving around stuff
	var small_polio_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,48); //polio in model, no lattice
	ns.MODE = CK_MODE;
	ns.cameraZ = min_cameradist / 2;
	ns.enforced_CK_quaternion.set( -0.26994323284634125, -0.0024107795577928506, -0.000379635156398864, 0.9628731458813965 );
	ns.irreg_button_invisible = 1;
	ns.CK_scale = 0.5773502438405532;
	ns.CK_angle = -0.5235987753305861;
	ns.capsid_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,49); //back to small polio. TODO fade
	ns.slide_number = small_polio_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,50); //back to model
	ns.enforced_CK_quaternion.set( -0.26994323284634125, -0.0024107795577928506, -0.000379635156398864, 0.9628731458813965 );
	ns.MODE = CK_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,51); //back again
	ns.slide_number = small_polio_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,52); //back to model
	ns.enforced_CK_quaternion.set( -0.26994323284634125, -0.0024107795577928506, -0.000379635156398864, 0.9628731458813965 );
	ns.MODE = CK_MODE;
	ns.pause_at_end = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,63.3); //you might recognize this pattern 
	Story_states.push(ns);

	ns = default_clone_story_state(0,68.9); //pentagons
	ns.pentamers_color = new THREE.Color(0.2,0.1,0.8);
	Story_states.push(ns);

	ns = default_clone_story_state(0,69.7); //hexagons
	ns.pentamers_color = defaultPentamersColor.clone();
	ns.hexamers_color.set(0.6,0.1,0.1); 
	Story_states.push(ns);

	ns = default_clone_story_state(1,71.7); //football
//	ns.hexamers_color.copy(defaultHexamersColor);
//	ns.hexamers_color = defaultHexamersColor.clone();
	Story_states.push(ns);

	ns = default_clone_story_state(0,76.6); //back
	ns.enforced_CK_quaternion.set( -0.26994323284634125, -0.0024107795577928506, -0.000379635156398864, 0.9628731458813965 );
	Story_states.push(ns);

	ns = default_clone_story_state(0,84.6); //zoom out (at this time to distract from bad delivery
	ns.cameraZ = min_cameradist;
	Story_states.push(ns);

	ns = default_clone_story_state(0,85.9); //open it up
	ns.capsid_open = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,95); //lattice appears, try modifying
	lattice_fadein_time = ns.startingtime;
	ns.pause_at_end = 1;
	ns.loopBackTo = 102.2;
	ns.playerHasLearned = function(){return theyKnowYouCanAlter; }
	ns.loopBackCountdown = 7;
	Story_states.push(ns);

	ns = default_clone_story_state(0,106); //Now let us say that...
//	ns.pentamers_color = new THREE.Color( 0 / 256, 13 / 256, 194 / 256 ),
//	ns.hexamers_color = new THREE.Color( 0 / 256, 187 / 256, 253 / 256 ),
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,109.1); //this size
	ns.capsid_open = 1;
	ns.CK_scale = 0.5;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,110); //this orientation
	ns.CK_angle = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,113.5); //wrap it up
	ns.capsid_open = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(1,119.2); //hep B
	Story_states.push(ns);

	ns = default_clone_story_state(0,122.5); //back to model
	ns.MODE = CK_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(0,123.9); //unwrap
	ns.MODE = CK_MODE;
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,125.1); //hep A state
	ns.CK_scale = 0.5773502438405532;
	ns.CK_angle = -0.5235987753305861;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,126.7); //wrap up
	ns.capsid_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,129.3); //hep A
	ns.slide_number = small_polio_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,131.2); //back to model
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,136); //"this shape". Could do more here.
	ns.capsid_open = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,141.9); //bring in button
	ns.irreg_button_invisible = 0;
	ns.pause_at_end = 1;
	ns.loopBackTo = 139.4;
	ns.loopBackCountdown = 7;
	ns.playerHasLearned = function() { return theyKnowYouCanOpenAndClose; }
	Story_states.push(ns);

	ns = default_clone_story_state(0,144.2); //the reason they look this way
	ns.capsid_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,156.8); //pentagons
	ns.pentamers_color = new THREE.Color(0.2,0.1,0.8);
	Story_states.push(ns);

	ns = default_clone_story_state(0,157.7); //hexagons
	ns.pentamers_color = defaultPentamersColor.clone();
	ns.hexamers_color.set(0.6,0.1,0.1); 
	Story_states.push(ns);

	ns = default_clone_story_state(0,161.1); //spherical pattern
	ns.hexamers_color = defaultHexamersColor.clone();
	ns.capsid_open = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,163.7); //"just hexagons". Hexagons flash
	Story_states.push(ns);

	ns = default_clone_story_state(0,166.1); //"need a few pentagons". Pentagons flash
	ns.pentamers_color = new THREE.Color( 1, 0, 0 );
	Story_states.push(ns);

	ns = default_clone_story_state(0,167); //flash done
	Story_states.push(ns);

	ns = default_clone_story_state(0,168.6); //play around with it
	ns.capsid_open = 1;
	ns.pause_at_end = 1;
	ns.persistentLattice = true;
	Story_states.push(ns);

	ns = default_clone_story_state(1,189.4); //simple to assemble
	ns.MODE = SLIDE_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(1,194.4); //examples start
	var football_slide = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1,200.7); //geodesic example
	Story_states.push(ns);

	ns = default_clone_story_state(1,201.9); //geodesic building
	Story_states.push(ns);

	ns = default_clone_story_state(1,207.2); //epcot virus
	Story_states.push(ns);

	ns = default_clone_story_state(1,213.2); //bucky
	var bucky_slide = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1,220); //thai basket
	Story_states.push(ns);

	ns = default_clone_story_state(1,223); //hairstyle
	Story_states.push(ns);

	ns = default_clone_story_state(0,228.1); //bucky
	ns.slide_number = bucky_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,231); //first virus (Rayment haha)
	var first_virus_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,235.7); //magazines
	Story_states.push(ns);

	ns = default_clone_story_state(0,239.1); //patterns on viruses
	ns.MODE = CK_MODE;
	ns.CK_scale = 0.2773500870617064;
	ns.CK_angle = -0.24256388590718214;
	ns.capsid_open_immediately = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,241.7); //pop
	ns.sphericality = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,243.7); //back
	ns.sphericality = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,245.7); //pop
	ns.sphericality = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,248.5); //back to normal for final polio
	ns.sphericality = 0;
	ns.MODE = CK_MODE;
	ns.CK_scale = 0.5773502438405532;
	ns.CK_angle = -0.5235987753305861;
	ns.capsid_open = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,257.1); //fade to polio
	ns.slide_number = small_polio_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,258.5); //back to tree
	ns.MODE = TREE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,267);
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,500); //safety
	Story_states.push(ns);
	
	//-----------IRREG BEGINS
	ns = default_clone_story_state(1,0); //irreg begins, HIV shown
	ns.MODE = SLIDE_MODE;
	ns.chapter = 2;
	var HIV_slide = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1,12); //different HIVs
	var different_HIVs_index = ns.slide_number; 
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,17); //other uneven
	Story_states.push(ns);

	ns = default_clone_story_state(0,18.8); //irreg appears
//	ns.enforced_irreg_quaternion.set( -0.4744018551980526,0.024453317552284186,0.045298357905429784, 0.878802010589646 ); //symmetric style
	ns.enforced_irreg_quaternion.set( -0.7071067811545948, 0, 0, 0.7071067812184761 );
	ns.MODE = IRREGULAR_MODE;
	ns.capsid_open_immediately = 0;
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,21.2); //rotate
	ns.varyingsurfaceZRotation = true;
	Story_states.push(ns);

	ns = default_clone_story_state(0,24.9); //stop rotating
	Story_states.push(ns);

	ns = default_clone_story_state(1,25.4); //very icosahedron
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,29.8); //back
	ns.enforced_irreg_quaternion.set( -0.7071067811545948, 0, 0, 0.7071067812184761 );
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,30.4); //open
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,30.7); //this is here so we can enforce quaternion during wrap-up during pause. Er, what? Kinda guessing here
	ns.pause_at_end = 1;
	ns.loopBackTo = 33.14;
	ns.playerHasLearned = function() { return theyknowyoucanchangevertices; }
	ns.loopBackCountdown = 7;
	ns.unpauseOn = function()
	{
		console.log()
		if( theyknowyoucanchangevertices && !isMouseDown )
			return true;
		else return false;
	}
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,35.06); //And we have a new shape!
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,36.06); //wrap
	ns.capsid_open = 0;
	irreg_firstnewshape_story_state = Story_states.length;
	Story_states.push(ns);

	ns = default_clone_story_state(0,37.8); //rotate
	ns.varyingsurfaceZRotation = true;
	Story_states.push(ns);

	ns = default_clone_story_state(0,42.5); //stop rotating
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,46.3); //button appears
	ns.irreg_button_invisible = 0;
	ns.pause_at_end = 1;
	ns.loopBackTo = 43;
	ns.loopBackCountdown = 7;
	ns.playerHasLearned = function() { return theyKnowYouCanOpenAndClose; }
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,48.8); //One major source
	ns.slide_number = HIV_slide;
	ns.MODE = SLIDE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,52.4); //monkeys
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,55.6); //trim5
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,64); //drug TODO SYRINGE!!!!! Sheree
	var drugSlide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,69.8); //microscope image
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,74.4); //model of microscope image
	ns.fadePicture = true;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,77.3); //honesty
	ns.go_to_time = 89.9;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,89.9); //phi29
	var phi29Slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,94.2); //phi29 corners
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,95.6); //phi29 model
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,101.6); //let them make it
	ns.pause_at_end = 1;
	ns.enforced_irreg_state = 3;
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,107.9); //if you managed to make that virus 
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);
	
//	ns = default_clone_story_state(0,110.9); //open up? TODO
//	Story_states.push(ns);
	
	ns = default_clone_story_state(0,111.8); //mathematically exact version
	ns.enforced_irreg_state = 1;
	ns.enforced_irreg_quaternion.set( -0.6708576855670457,0.08188608649696437,0.0028127601848788432,0.7370459427973053 ); 
	ns.capsid_open_immediately = 0;
	Story_states.push(ns);
	
//	ns = default_clone_story_state(0,117.1); //back to virus TODO, requires quaternion
//	ns.slide_number = phi29Slide;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,119.6); //back to model
//	ns.MODE = IRREGULAR_MODE;
//	Story_states.push(ns);
	
	ns = default_clone_story_state(0,121.2); //we've noticed that when you open them out
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,124.1); //highlight cuts
	irreg_flash_time = ns.startingtime;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,128.7); //shit that lays it out for you, pointlessly
	ns.go_to_time = 143.5;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,143.4); //t4
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,146); //T4 in model
	ns.irreg_button_invisible = 0;
	ns.enforced_irreg_quaternion.set( -0.5216554828631857,-0.40506237503583453,-0.44657300762976543,0.603632817711505 );
	ns.enforced_irreg_state = 0;
	ns.capsid_open_immediately = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,153.7); //try!
	ns.capsid_open = 1;
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	
	ns = default_clone_story_state(0,155.7); //story begins
	ns.irreg_button_invisible = 1;
	ns.wedgesOpacity = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,158.8); //open it out
	ns.capsid_open = 1;
	Story_states.push(ns);

//	ns = default_clone_story_state(0,160.8); //move corner
//	Story_states.push(ns);
	
	var maxError = 0.2;

	ns = default_clone_story_state(0,171.1); //bad angles, close
	ns.minimum_angle_crapifiers = Array(22);
	for(var i = 0; i < ns.minimum_angle_crapifiers.length; i++)
		ns.minimum_angle_crapifiers[i] = 1 + (Math.random()-0.5) * 2 * maxError;
	ns.capsid_open = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,175); //open
	ns.capsid_open = 1;
	ns.minimum_angle_crapifiers = Story_states[Story_states.length-1].minimum_angle_crapifiers;
	Story_states.push(ns);

	ns = default_clone_story_state(0,176.5); //bad angles
	ns.minimum_angle_crapifiers = Array(22);
	for(var i = 0; i < ns.minimum_angle_crapifiers.length; i++)
		ns.minimum_angle_crapifiers[i] = 1 + (Math.random()-0.5) * 2 * maxError;
	ns.capsid_open = 0;
	Story_states.push(ns);

//	ns = default_clone_story_state(0,178); //open
//	ns.capsid_open = 1;
//	ns.minimum_angle_crapifiers = Story_states[Story_states.length-1].minimum_angle_crapifiers;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,179.5); //bad angles
//	ns.minimum_angle_crapifiers = Array(22);
//	for(var i = 0; i < ns.minimum_angle_crapifiers.length; i++)
//		ns.minimum_angle_crapifiers[i] = 1 + (Math.random()-0.5) * 2 * maxError;
//	ns.capsid_open = 0;
//	Story_states.push(ns);

	ns = default_clone_story_state(0,179); //open
	ns.capsid_open = 1;
	ns.minimum_angle_crapifiers = Story_states[Story_states.length-1].minimum_angle_crapifiers;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,182.5); //bad angles
	ns.minimum_angle_crapifiers = Array(22);
	for(var i = 0; i < ns.minimum_angle_crapifiers.length; i++)
		ns.minimum_angle_crapifiers[i] = 1 + (Math.random()-0.5) * 2 * maxError;
	ns.capsid_open = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,184); //open
	ns.capsid_open = 1;
	ns.minimum_angle_crapifiers = Story_states[Story_states.length-1].minimum_angle_crapifiers;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,186 ); //save us the sob story
	ns.go_to_time = 193.3;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,196.1); //close up properly
	ns.capsid_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,204.5); //christmas
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,207.6); //book
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,213.8); //book excerpt
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,222.5); //back to model
	ns.MODE = IRREGULAR_MODE;
	ns.enforced_irreg_state = 2;
	ns.capsid_open_immediately = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,226.4); //closes again
	ns.capsid_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,234); //HIV
	ns.slide_number = HIV_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,236.7); //tree, or time to skip back to tree. TODO they don't have to see this?
	ns.MODE = TREE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,243.9); //stop
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,500); //safety
	ns.capsid_open = 0;
	Story_states.push(ns);

//	//----------QS BEGINS!!!!!
	ns = default_clone_story_state(0,0); //zika virus
	var zika_slide = ns.slide_number; 
	ns.chapter = 3;
	ns.MODE = CKPICS_MODE;
	ns.CKPicStates.push({virus:"zika",x:0,y:0});
	ns.CKPicStates.push({virus:"bluetongue",x:playing_field_dimension, y:-playing_field_dimension});
	ns.CKPicStates.push({virus:"hpv",x:-playing_field_dimension, y:-playing_field_dimension});
	ns.CKPicScale = playing_field_dimension;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,4.7); //bluetongue, or group
	ns.CKPicStates.push({virus:"zika",x:0,y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"bluetongue",x:halfVerticalSeparation, y:-halfVerticalSeparation});
	ns.CKPicStates.push({virus:"hpv",x:-halfVerticalSeparation, y:-halfVerticalSeparation});
	ns.CKPicScale = playing_field_dimension * 0.28;
	Story_states.push(ns);

	ns = default_clone_story_state(0,9.4); //QS, Try it out, (pause)
	ns.MODE = QC_SPHERE_MODE;
	ns.loopBackTo = 10.4;
	ns.playerHasLearned = function() { return theyknowyoucanchangestate; };
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,14); //may not seem like a virus
	Story_states.push(ns);

	ns = default_clone_story_state(1,19.5); //HPV
	var HPV_slide = ns.slide_number; 
	ns.MODE = SLIDE_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(1,27.2); //HPV xray
	ns.fadePicture = true;
	Story_states.push(ns);

	ns = default_clone_story_state(1,30.1); //HPV blobs
	ns.fadePicture = true;
	Story_states.push(ns);

	ns = default_clone_story_state(1,44.5); //HPV connections
	ns.fadePicture = true;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,51.9); //colored
	ns.fadePicture = true;
	Story_states.push(ns);

	ns = default_clone_story_state(0,58.2); //back to model, then make hpv
	ns.enforced_cutout_vector0_player.set(1.809016994374948, 1.4384360606445132, 0); //zika... probably should be a smaller one
	ns.pause_at_end = 1;
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,60.8); //model was made 800 years ago
	Story_states.push(ns);

	ns = default_clone_story_state(0,69.5); //islamic art #1
	ns.MODE = SLIDE_MODE;
	ns.slide_number = islamic_dome_index;
	ns.fadePicture = false;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,73); //islamic art #2
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,75.6); //islamic art #3
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,77.7); //islamic art #4
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,80.3); //islamic art #5
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,83.5); //darb e imam shrine
	Story_states.push(ns);
	
//	ns = default_clone_story_state(1,84.8); //red box
//	Story_states.push(ns);
	
	ns = default_clone_story_state(1,91.9); //above entrance
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,95.4); //inside
	var inside_darb_e_pic_index = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,103.1);
	ns.MODE = HEXAGON_MODE;//QC_SPHERE_MODE IRREGULAR_MODE
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,136); //back to shrine
	ns.slide_number = inside_darb_e_pic_index;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,143.9); //pause to play around and see resemblence
	ns.go_to_time = 147.2;
	ns.pause_at_end = 1;
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,158.9); //so why do viruses use these patterns?
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,162.2); //HPV in model
	ns.enforced_cutout_vector0_player.set(0, 3.479306368947708, 0);
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,165.8); //drug
	ns.slide_number = drugSlide;
	ns.MODE = SLIDE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,170); //but hpv can evolve
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,174.6); //smaller HPV (zika)
	ns.enforced_cutout_vector0_player.set(1.809016994374948, 1.4384360606445132, 0);
	Story_states.push(ns);

	ns = default_clone_story_state(0,199.5); //pic of zika
	ns.MODE = SLIDE_MODE;
	ns.slide_number = zika_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,200.8);
	ns.pause_at_end = 1;
	ns.MODE = TREE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,202);
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,300);
	Story_states.push(ns);
	
	//------ENDING BEGINS!!!!
	ns = default_clone_story_state(1,0); //Start of end
	var Measles_slide = ns.slide_number;
	ns.MODE = SLIDE_MODE;
	ns.chapter = 4;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,13.7); //Tomoko Fuse
	var Tomoko_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,71.7);
	ns.MODE = BOCAVIRUS_MODE; //TODO super dodecahedral virus, a slide
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,113.6); //why an architect
	ns.slide_number = bucky_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,116); //can help with hepatitis. Demo!
	ns.slide_number = polio_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,118.2); //an origamist
	ns.slide_number = Tomoko_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,120.4); //HIV
	ns.slide_number = HIV_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,122.9); //islamic artist
	ns.slide_number = islamic_dome_index;
	Story_states.push(ns);

	ns = default_clone_story_state(0,126.4); //zika
	ns.slide_number = zika_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,130.3); //measles
	ns.slide_number = Measles_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,145.5); //real science is about real things
	Story_states.push(ns);

	ns = default_clone_story_state(1,148.9); //we like our pretty patterns, golden spiral
	Story_states.push(ns);

	ns = default_clone_story_state(1,154.7); //combined
	Story_states.push(ns);

	ns = default_clone_story_state(0,157.1); //measles
	ns.slide_number = Measles_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,219.9); //lots of viruses
//	ns.slide_number = Measles_slide;
	Story_states.push(ns);
	
	//So, we're going to have the cornucopia again. You could have that be the tree, save time. That means a lot going on the tree
	//You could take Sheree's tree design, space the rest of them in around it, and then zoom out and fade them in

	ns = default_clone_story_state(0,231.8); //complexity
	ns.MODE = IRREGULAR_MODE;
	ns.irreg_button_invisible = 1;
	ns.capsid_open_immediately = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,234.5); //arisen
	ns.capsid_open = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,239.6); //QS
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(0,242.9); //cover possibilities
	ns.enforced_cutout_vector0_player.set(0, 3.479306368947708, 0);
	Story_states.push(ns);

	ns = default_clone_story_state(0,248.1); //CK
	ns.capsid_open_immediately = 1;
	ns.MODE = CK_MODE;
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,252.2); //evolving
	ns.CK_scale = 0.5773502438405532;
	ns.CK_angle = -0.5235987753305861;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,253.7); //and evolving
	ns.CK_scale = 0.2773500870617064;
	ns.CK_angle = -0.24256388590718214;
	Story_states.push(ns);

	ns = default_clone_story_state(0,255); //evolving
	ns.CK_scale = 0.5773502438405532;
	ns.CK_angle = -0.5235987753305861;
	Story_states.push(ns);

	ns = default_clone_story_state(0,257.6); //coming back
	ns.capsid_open = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,259.2); //pentagons in same places
	ns.pentamers_color = new THREE.Color( 1, 0, 0 );
	Story_states.push(ns);

	ns = default_clone_story_state(0,263.3); //humans coming around to the same patterns, golf ball
	ns.slide_number = golfSlide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,273.6); //golf ball virus
	ns.slide_number = golfLikeVirusSlide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,279); //credits viruses
	ns.slide_number = polio_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,285);
	ns.slide_number = HIV_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,291);
	ns.slide_number = Measles_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,297);
	ns.slide_number = zika_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,303);
	ns.slide_number = first_virus_slide;
	Story_states.push(ns);
	

	ns = default_clone_story_state(0,500); //safety
	Story_states.push(ns);
	

//		if(Story_states[i].slide_number !== -1 )
//			Story_states[i].MODE = SLIDE_MODE;
	
	for(var i = 0; i < Story_states.length - 1; i++ )
		if( Story_states[i].chapter === Story_states[i+1].chapter && Story_states[i].startingtime >= Story_states[i+1].startingtime )
			console.error("bad starting time:", Story_states[i+1].startingtime);
}

var next_slide = 0;