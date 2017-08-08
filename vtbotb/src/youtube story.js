/* 
 * Programming the triggers: make sure there�s no interdependence.
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
		if( Story_states[Storypage].fadePicture )
		{
			var fadingMaterialSlide = null;
			var opacityChangeRate = 1.8;
			
			if( Story_states[Storypage].slide_number !== -1 ) //fade in, this one
			{
				slideObjects[ Story_states[Storypage].slide_number ].material.opacity += opacityChangeRate * delta_t;
				if( slideObjects[ Story_states[Storypage].slide_number ].material.opacity > 1 )
					slideObjects[ Story_states[Storypage].slide_number ].material.opacity = 1;
				
				//we also need our current one to be in front of the previous, fading out, slide
			}
			else //fade out, previous
			{
				if( Story_states[Storypage-1].slide_number === -1)
					console.log("asking for fade?", Story_states[Storypage].startingtime)
				else
				{
					slideObjects[ Story_states[Storypage-1].slide_number ].material.opacity -= opacityChangeRate * delta_t;
					if( slideObjects[ Story_states[Storypage-1].slide_number ].material.opacity < 0 )
						slideObjects[ Story_states[Storypage-1].slide_number ].material.opacity = 0;
				}
			}
		}
		else if( Story_states[Storypage].slide_number !== -1 )
			slideObjects[ Story_states[Storypage].slide_number ].material.opacity = 1;
		
		if( Story_states[Storypage].slide_number !== -1 )
		{
			slideObjects[ Story_states[Storypage].slide_number ].position.z = camera.position.z - min_cameradist;
			if( Storypage > 0 && Story_states[Storypage-1].slide_number !== -1) { //if there was a previous slide
				slideObjects[ Story_states[Storypage].slide_number ].position.z = slideObjects[ Story_states[Storypage-1].slide_number ].position.z + 0.001;
			}
		}
			
		if( Story_states[Storypage].varyingsurfaceZRotation )
		{
			varyingsurface.rotation.z += delta_t;
			for( var i = 0; i < varyingsurface_cylinders.length; i++)
				varyingsurface_cylinders[i].rotation.z += delta_t;
			varyingsurface.updateMatrixWorld();
		}
		
		if( Story_states[Storypage].surfaceZRotation )
		{
			surface.rotation.z += delta_t;
			surface.updateMatrixWorld();
		}
		
		if( Story_states[Storypage].CK_scale !== 999 )
		{
			if( Story_states[Storypage-1].MODE !== CK_MODE )
				LatticeScale = Story_states[Storypage].CK_scale;
			else //needs to change gradually
				LatticeScale += (Story_states[Storypage].CK_scale - LatticeScale ) * 0.1;
		}
		if( Story_states[Storypage].CK_angle !== 999 )
		{
			if( Story_states[Storypage-1].MODE !== CK_MODE )
				LatticeAngle = Story_states[Storypage].CK_angle;
			else
				LatticeAngle += (Story_states[Storypage].CK_angle - LatticeAngle ) * 0.1;
		}
		
		
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
		
		if( Story_states[Storypage].slerpIrregQuaternion.x !== 5 )
		{
			varyingsurface.quaternion.slerp( Story_states[Storypage].slerpIrregQuaternion,0.1 );
			for( var i = 0; i < varyingsurface_cylinders.length; i++)
				varyingsurface_cylinders[i].quaternion.copy( varyingsurface.quaternion );
			varyingsurface.updateMatrixWorld();
		}
		
		if( Story_states[Storypage].enforced_CK_quaternion.x !== 5 )
		{
			if( Story_states[Storypage-1].MODE !== CK_MODE )
				surface.quaternion.copy( Story_states[Storypage].enforced_CK_quaternion );
			else
				surface.quaternion.slerp( Story_states[Storypage].enforced_CK_quaternion, 0.1 );
			for(var i = 0; i < surfperimeter_cylinders.length; i++ )
				surfperimeter_cylinders[i].quaternion.copy( Story_states[Storypage].enforced_CK_quaternion );
		}
		
		if( Story_states[Storypage].unpauseOn() )
		{
			ytplayer.playVideo();
		}
		
		if( ytplayer.getPlayerState() === 2 )
			unpause_timer += delta_t;
		if( Story_states[Storypage].unpause_after !== -1 ) //TODO this will go down even if it's not the *correct* pause
		{
			if( unpause_timer >= Story_states[Storypage].unpause_after )
			{
				ytplayer.playVideo();
			}
		}
		
		if( MODE === CK_MODE )
			camera.position.z += ( Story_states[Storypage].cameraZ - camera.position.z ) * 0.1;
		
		//if you're about to move on from a state naturally
		if( Story_states[Storypage + 1].startingtime < our_CurrentTime && our_CurrentTime < Story_states[Storypage + 1].startingtime + 0.2 )
		{
			if( Story_states[Storypage].pause_at_end === 1 )
			{
				if( ytplayer.getPlayerState() === 2 ) //if we've managed to pause, we don't go past here
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
				if( Story_states[Storypage].loopBackCountdown < 0  
//						|| ytplayer.getPlayerState() === 1 //we want to loop back if the PLAYER (who has not learned) tried to unpause us. Bug: it might be our fault that we're not paused
					)
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
	
	if( Story_states[Storypage].fadePicture && Story_states[Storypage].slide_number !== -1 )
		slideObjects[ Story_states[Storypage].slide_number ].material.opacity = 0;
	
	if( Story_states[Storypage].enforced_cutout_vector0_player.x !== -1 ) //note to self: you're screwed if you'd like it to be -1 as that is the "default"!
		cutout_vector0_interpolatingfrom.copy(cutout_vector0_player); //could choose it based on proximity to the destination modulo TAU / 5
	
	if( Story_states[Storypage].enforced_qs_quaternion.x !== 5 ) //we want you either going towards closed or closed
	{
		dodeca.quaternion.copy( Story_states[Storypage].enforced_qs_quaternion );
		dodeca.updateMatrixWorld();
	}
	
	//only want this for sudden transitions, not wrapups - that is handled automatically.
	if( Story_states[Storypage].enforced_irreg_quaternion.x !== 5 ) //we want you either going towards closed or closed
	{
		varyingsurface.quaternion.copy( Story_states[Storypage].enforced_irreg_quaternion );
		for( var i = 0; i < varyingsurface_cylinders.length; i++)
			varyingsurface_cylinders[i].quaternion.copy(Story_states[Storypage].enforced_irreg_quaternion );
		
		varyingsurface.updateMatrixWorld();
	}
	
	if( Story_states[Storypage].enforced_irreg_state !== -1 )
	{
		for(var i = 0; i < flatnet_vertices.array.length; i++)
			flatnet_vertices.array[i] = setvirus_flatnet_vertices[Story_states[Storypage].enforced_irreg_state][i];
		if(Story_states[Storypage-1].MODE !== IRREGULAR_MODE) //we're flicking back - no need to see transition
			settle_manipulationsurface_and_flatnet(); 
		update_wedges();
		AO.correct_minimum_angles(flatnet_vertices.array);
	}
	
	for(var i in movingPictures )
	{
		if(movingPictures[i].chapter === QC_SPHERE_MODE)
			movingPictures[i].visible = Story_states[Storypage].qsPicsVisibility;
		if(movingPictures[i].chapter === CK_MODE)
			movingPictures[i].visible = Story_states[Storypage].hepPicsVisibility;
		if(movingPictures[i].chapter === IRREGULAR_MODE)
			movingPictures[i].visible = Story_states[Storypage].hivPicsVisibility;
		if(movingPictures[i].chapter === BOCAVIRUS_MODE)
			movingPictures[i].visible = Story_states[Storypage].introPicsVisibility;
		if(movingPictures[i].chapter === ENDING_MODE)
			movingPictures[i].visible = Story_states[Storypage].endingPicsVisibility;
	}
	
	if( Story_states[Storypage].MODE !== MODE )
		ChangeScene(Story_states[Storypage].MODE );
	
	if( MODE === CK_MODE && Story_states[Storypage-1].MODE !== CK_MODE) //if we've just gone to this state, we don't want a zoom
		camera.position.z = Story_states[Storypage].cameraZ;
	
	for(var i = 0; i < slideObjects.length; i++)
	{
		if( typeof slideObjects[i] !== 'undefined' && slideObjects[i].parent === scene )
		{
			if( Story_states[Storypage].slide_number === i )
				continue;
			else if( Storypage-1 >= 0 && Story_states[Storypage-1].slide_number === i && (Story_states[Storypage].slide_number !== -1 || Story_states[Storypage].fadePicture) )
				continue; //the last slide can stay in, provided this state has a slide or it's fading
			else
				scene.remove(slideObjects[i]);	
		}
	}

	if( Story_states[Storypage].slide_number !== -1 )
	{
		scene.add( slideObjects[ Story_states[Storypage].slide_number ] );
		slideObjects[ Story_states[Storypage].slide_number ].position.z = camera.position.z - min_cameradist;
		if( Storypage > 0 && Story_states[Storypage-1].slide_number !== -1
			&& Story_states[Storypage].slide_number !== Story_states[Storypage-1].slide_number) { //if there was a previous slide. Note this can screw up if we skipped to this page. 
			slideObjects[ Story_states[Storypage].slide_number ].position.z = slideObjects[ Story_states[Storypage-1].slide_number ].position.z + 0.001;
			slideObjects[ Story_states[Storypage].slide_number ].material.opacity = 0;
		}
	}
	
	if( Story_states[Storypage].slide_number !== -1 || Story_states[Storypage].MODE === HEXAGON_MODE || Story_states[Storypage].MODE === CKPICS_MODE )
	{	
		cursorIsHand = false;
	}
	else
	{
		cursorIsHand = true;
	}
	
	//If we've just ticked forward then of course we should be playing anyway, but if we just started a new chapter, having been on the tree, we might be paused
	if( !Story_states[Storypage].prevent_playing )
	{
		ytplayer.playVideo(); //this is what was starting it initially
	}
	
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
	
	var defaultPentamersColor = new THREE.Color( 115/255,126/255,151/255 );
	var defaultHexamersColor = new THREE.Color( 225/255,182/255,163/255 );
	
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
		hepPicsVisibility: false,
		qsPicsVisibility: false,
		hivPicsVisibility: false,
		introPicsVisibility:false,
		endingPicsVisibility:false,
		
		enforced_CK_quaternion: new THREE.Quaternion(5,5,5,5),
		enforced_irreg_quaternion: new THREE.Quaternion(5,5,5,5),
		slerpIrregQuaternion: new THREE.Quaternion(5,5,5,5),
		enforced_qs_quaternion: new THREE.Quaternion(5,5,5,5),
		
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
		surfaceZRotation:false,
		
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
		new_story_state.surfaceZRotation = false;

		new_story_state.pentamers_color = defaultPentamersColor.clone(),
		new_story_state.hexamers_color = defaultHexamersColor.clone(),
		
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
		
		new_story_state.enforced_CK_quaternion = Story_states[0].enforced_CK_quaternion.clone();
		new_story_state.enforced_irreg_quaternion = Story_states[0].enforced_irreg_quaternion.clone();
		new_story_state.enforced_qs_quaternion = Story_states[0].enforced_qs_quaternion.clone();
		new_story_state.slerpIrregQuaternion = Story_states[0].slerpIrregQuaternion.clone();
		
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
	ns = default_clone_story_state(1,0);
	ns.fadePicture = true;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,0.01); //really we want bluetongue first
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,12.2); //hiv
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,21.6); //measles
	var Dad_slide = ns.slide_number;
	Story_states.push(ns);
	
	//---paragraph 2
	ns = default_clone_story_state(0,39.7); //bocavirus appears, then pause
	ns.MODE = BOCAVIRUS_MODE;
	ns.pause_at_end = 1;
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
	
	ns = default_clone_story_state(1,90.3); //images
	cornucopia_start_time = ns.startingtime + 0.5;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,103.7); //humaaaans
	ns.CKPicScale = playing_field_dimension;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,113.1); //rota
	unflash_time = ns.startingtime;
	cornucopia_end_time = ns.startingtime;
	ns.MODE = CKPICS_MODE;
	ns.hepPicsVisibility = false;
	ns.introPicsVisibility = true;
	ns.endingPicsVisibility = false;
	ns.qsPicsVisibility = false;
	ns.hivPicsVisibility = false;
	ns.CKPicScale = playing_field_dimension;
	ns.CKPicStates.push({virus:"golf",x:0,y:0});
	ns.CKPicStates.push({virus:"golfVirus",x:playing_field_dimension*2,y:0});
	ns.CKPicStates.push({virus:"building",x:playing_field_dimension, y:0});
	ns.CKPicStates.push({virus:"buildingVirus",x:playing_field_dimension*2, y:0});
	ns.CKPicStates.push({virus:"art",x:playing_field_dimension, y:0});
	ns.CKPicStates.push({virus:"artVirus",x:playing_field_dimension*2, y:0});
	Story_states.push(ns);
	
	var standardSep = playing_field_dimension/4.2;
	
	ns = default_clone_story_state(0,115.7); //rota
	ns.CKPicScale *= 0.5;
	ns.CKPicStates.push({virus:"golf",x:-standardSep,y:0});
	ns.CKPicStates.push({virus:"golfVirus",x:standardSep,y:0});
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,117.6); //buildings
	ns.CKPicScale = playing_field_dimension;
	ns.CKPicStates.push({virus:"building",x:0,y:0});
	ns.CKPicStates.push({virus:"golf",x:-playing_field_dimension*2,y:standardSep*1.3});
	ns.CKPicStates.push({virus:"golfVirus",x:-playing_field_dimension*2,y:standardSep*1.3});
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,120.1); //phi29
	ns.CKPicScale *= 0.5;
	ns.CKPicStates.push({virus:"building",x:-standardSep,y:0});
	ns.CKPicStates.push({virus:"buildingVirus",x:standardSep,y:0});
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,123.5); //religious art
	ns.CKPicScale = playing_field_dimension;
	ns.CKPicStates.push({virus:"art",x:0,y:0});
	ns.CKPicStates.push({virus:"building",x:-playing_field_dimension*2,y:standardSep*-1.3});
	ns.CKPicStates.push({virus:"buildingVirus",x:-playing_field_dimension*2,y:standardSep*-1.3});
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,127.1); //HPV
	ns.CKPicScale *= 0.5;
	ns.CKPicStates.push({virus:"art",x:-standardSep,y:0});
	ns.CKPicStates.push({virus:"artVirus",x:standardSep,y:0});
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,130.3); //all together
	ns.CKPicScale *= 0.6;
	ns.CKPicStates.push({virus:"golf",x:-standardSep,y:standardSep*1.3});
	ns.CKPicStates.push({virus:"golfVirus",x:standardSep,y:standardSep*1.3});
	ns.CKPicStates.push({virus:"art",x:-standardSep, y:0});
	ns.CKPicStates.push({virus:"artVirus",x:standardSep, y:0});
	ns.CKPicStates.push({virus:"building",x:-standardSep, y:standardSep*-1.3});
	ns.CKPicStates.push({virus:"buildingVirus",x:standardSep, y:standardSep*-1.3});
	Story_states.push(ns);
	
//	ns = default_clone_story_state(0,132.3);
//	ns.CKPicStates.push({virus:"golf",x:0,y:standardSep*1.2});
//	ns.CKPicStates.push({virus:"golfVirus",x:playing_field_dimension,y:standardSep*1.2});
//	ns.CKPicStates.push({virus:"art",x:0, y:0});
//	ns.CKPicStates.push({virus:"artVirus",x:playing_field_dimension, y:0});
//	ns.CKPicStates.push({virus:"building",x:0, y:standardSep*-1.2});
//	ns.CKPicStates.push({virus:"buildingVirus",x:playing_field_dimension, y:standardSep*-1.2});
//	Story_states.push(ns);
	
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
	
	ns = default_clone_story_state(1,237.25); //canvas comes out again
	ns.MODE = SLIDE_MODE; 
	ns.rendererWidth = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,243.6); //viruses
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,264.5); //cell full of viruses
	ns.MODE = SLIDE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,269.3); //lysis
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,274.7); //spread to other cells
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,279.6); //picture of boca
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,287); //Tree
	ns.MODE = TREE_MODE;
	ns.CKPicScale = playing_field_dimension;
	ns.pause_at_end = 1;
	ns.loopBackTo = 296.06;
	ns.loopBackCountdown = 8;
	ns.playerHasLearned = function() { return false;}
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,301.3);
	ns.loopBackTo = 296.06;
	ns.playerHasLearned = function() { return false;}
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,1000);
	Story_states.push(ns);
	
	//------CK BEGINS
	var halfVerticalSeparation = 1;
	
	ns = default_clone_story_state(1,0); //hep A
	ns.enforced_CK_quaternion.set( -0.5795583117792323,0.2592476704069174, 0.31482085241857005,0.7055427974575411 );
	ns.CK_scale = 0.5773502438405532;
	ns.CK_angle = -0.5235987753305861;
	ns.chapter = 1;
	var hepASlide = ns.slide_number;
	ns.MODE = SLIDE_MODE;
	ns.CKPicStates.push({virus:"hepA",x:0,y:0});
	ns.CKPicStates.push({virus:"hepB",x:0,y:-playing_field_dimension});
	ns.CKPicStates.push({virus:"aMimic2",x:-playing_field_dimension, y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"aMimic1",x:-playing_field_dimension, y:-halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"bMimic1",x:playing_field_dimension, y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"bMimic2",x:playing_field_dimension, y:-halfVerticalSeparation*1.2});
	ns.CKPicScale = playing_field_dimension;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,4.3);
	ns.MODE = CKPICS_MODE;
	ns.CKPicScale = 2;
	ns.hepPicsVisibility = true;
	ns.introPicsVisibility = false;
	ns.endingPicsVisibility = false;
	ns.qsPicsVisibility = false;
	ns.hivPicsVisibility = false;
	Story_states.push(ns);

	ns = default_clone_story_state(0,6.2);
	ns.CKPicStates.push({virus:"hepA",x:0,y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"hepB",x:0,y:-halfVerticalSeparation*1.2});
	Story_states.push(ns);

	ns = default_clone_story_state(0,13.4);
	ns.CKPicStates.push({virus:"hepA",x:playing_field_dimension, y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"hepB",x:playing_field_dimension, y:-halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"aMimic2",x:0, y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"aMimic1",x:0, y:-halfVerticalSeparation*1.2});
	Story_states.push(ns);

	ns = default_clone_story_state(0,18.9);
	ns.CKPicStates.push({virus:"hepA",x:halfVerticalSeparation*1.4, y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"aMimic2",x:-halfVerticalSeparation*1.4, y:halfVerticalSeparation*1.2});
	Story_states.push(ns);

	ns = default_clone_story_state(0,21.9);
	ns.CKPicStates.push({virus:"hepA",x:-playing_field_dimension, y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"hepB",x:-playing_field_dimension, y:-halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"aMimic2",x:-playing_field_dimension, y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"aMimic1",x:-playing_field_dimension, y:-halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"bMimic1",x:0, y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"bMimic2",x:0, y:-halfVerticalSeparation*1.2});
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,29.4);
	ns.CKPicStates.push({virus:"hepB",x:-halfVerticalSeparation*1.4, y:-halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"bMimic2",x:halfVerticalSeparation*1.4, y:-halfVerticalSeparation*1.2});
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,32.6);
	ns.CKPicStates.push({virus:"hepA",x:0, y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"hepB",x:0, y:-halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"bMimic1",x:playing_field_dimension, y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"bMimic2",x:playing_field_dimension, y:-halfVerticalSeparation*1.2});
	Story_states.push(ns);

	ns = default_clone_story_state(0,37.1);
	ns.CKPicStates.push({virus:"aMimic2",x:-halfVerticalSeparation*2, y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"aMimic1",x:-halfVerticalSeparation*2, y:-halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"bMimic1",x:halfVerticalSeparation*2, y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"bMimic2",x:halfVerticalSeparation*2, y:-halfVerticalSeparation*1.2});
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,40.9);
	ns.CKPicStates.push({virus:"aMimic2",x:-playing_field_dimension, y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"aMimic1",x:-playing_field_dimension, y:-halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"bMimic1",x:playing_field_dimension, y:halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"bMimic2",x:playing_field_dimension, y:-halfVerticalSeparation*1.2});
	ns.CKPicStates.push({virus:"hepA",x:0, y:0});
	ns.CKPicStates.push({virus:"hepB",x:0, y:-playing_field_dimension});
	ns.CKPicScale = playing_field_dimension;
	Story_states.push(ns);
	
	var zoomedInDistance = min_cameradist / 4.8;

	ns = default_clone_story_state(0,44.7); //small polio to introduce model. Above is the moving around stuff
	ns.slide_number = hepASlide;
	ns.cameraZ = zoomedInDistance;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,48); //polio in model
	ns.MODE = CK_MODE;
	ns.fadePicture = true;
	ns.cameraZ = zoomedInDistance;
	ns.irreg_button_invisible = 1;
	ns.capsid_open = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,51.5); //we're done with that enforced quaternion
	ns.surfaceZRotation = true;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,55.5); //it looks
	ns.pause_at_end = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,63.3); //you might recognize this pattern 
	Story_states.push(ns);
	
	var hexamerPentamerHighlightColor = new THREE.Color(0x2B455E);

	ns = default_clone_story_state(0,68.9); //pentagons
	ns.pentamers_color.copy(hexamerPentamerHighlightColor);
	Story_states.push(ns);

	ns = default_clone_story_state(0,69.4); //unflash 
	Story_states.push(ns);

	ns = default_clone_story_state(0,69.7); //hexagons
	ns.hexamers_color.copy(hexamerPentamerHighlightColor); 
	Story_states.push(ns);

	ns = default_clone_story_state(0,70.2); //unflash 
	Story_states.push(ns);

	ns = default_clone_story_state(0,70.7); //position for ball
	ns.enforced_CK_quaternion.set( -0.5676121554735792, 0.39319587732878697, 0.6593917849494116, 0.2973481401944473 );
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,71.7); //football
	var footballSlide = ns.slide_number;
	ns.fadePicture = true;
	Story_states.push(ns);

	ns = default_clone_story_state(0,76.6); //back
	ns.fadePicture = true;
	ns.enforced_CK_quaternion.set( -0.5676121554735792, 0.39319587732878697, 0.6593917849494116, 0.2973481401944473 );
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
	
	ns = default_clone_story_state(0,110.6); //this orientation
	ns.CK_angle = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,113.5); //wrap it up
	ns.capsid_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,117.2); //position for hep B
	ns.enforced_CK_quaternion.set( -0.4716767396188101, 0.6024940327573115, -0.10118578165427694, 0.635832864348344 );
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
	
	ns = default_clone_story_state(0,128.5); //position for hep A
	ns.enforced_CK_quaternion.set( -0.39385087398805785, 0.8591868794637348, -0.2624847764288336, 0.19437370542162127 );
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,129.4); //hep a. Not a repetition though because it's a different size
	ns.MODE = SLIDE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,132.2); //thousands
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,138.6); //back
	ns.MODE = CK_MODE;
	ns.capsid_open_immediately = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,141.9); //bring in button
	ns.irreg_button_invisible = 0;
	ns.pause_at_end = 1;
	ns.loopBackTo = 139.4;
	ns.loopBackCountdown = 7;
	ns.playerHasLearned = function() { return theyKnowYouCanOpenAndClose; }
	Story_states.push(ns);

	ns = default_clone_story_state(0,144.2); //the reason they look this way
	ns.irreg_button_invisible = 1;
	ns.capsid_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,156.8); //pentagons
	ns.pentamers_color.copy(hexamerPentamerHighlightColor);
	Story_states.push(ns);

	ns = default_clone_story_state(0,157.1); //back
	Story_states.push(ns);

	ns = default_clone_story_state(0,157.4); //hexagons
	ns.hexamers_color.copy(hexamerPentamerHighlightColor);
	Story_states.push(ns);

	ns = default_clone_story_state(0,157.7); //back. It's impossible, by the way, to make a...
	Story_states.push(ns);

	ns = default_clone_story_state(0,166.2); //spherical pattern
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,170.8); //want to show lots of hexagons
	ns.CK_scale = 0.2773500870617064;
	ns.CK_angle = -0.24256388724793862;
	Story_states.push(ns);

	ns = default_clone_story_state(0,172.7); //always need
	ns.capsid_open = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,178); //play around with it
	ns.capsid_open = 1;
	ns.irreg_button_invisible = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,183); //closer resemblance to hk97
	ns.pentamers_color.copy(new THREE.Color(0xA54D5B));
	ns.pause_at_end = 1;
	ns.persistentLattice = true;
	Story_states.push(ns);

	ns = default_clone_story_state(1,193.2); //simple to assemble
	ns.MODE = SLIDE_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(1,196.45); //example
	Story_states.push(ns);

	ns = default_clone_story_state(1,199.7); //geodesic example
	Story_states.push(ns);

	ns = default_clone_story_state(1,202.95); //geodesic example
	Story_states.push(ns);

	ns = default_clone_story_state(1,206.2); //geodesic building
	var epcotSlide = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1,211.3); //epcot virus
	Story_states.push(ns);

	ns = default_clone_story_state(1,217.2); //bucky
	var bucky_slide = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1,223.9); //thai basket
	ns.enforced_CK_quaternion.set( -0.5795583117792323,0.2592476704069174, 0.31482085241857005,0.7055427974575411 );
	Story_states.push(ns);

	ns = default_clone_story_state(1,226.9); //hairstyle
	Story_states.push(ns);

	ns = default_clone_story_state(0,232.2); //bucky
	ns.slide_number = bucky_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,234.9); //first virus (Rayment haha)
	var first_virus_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,239.9); //magazines
	Story_states.push(ns);

	ns = default_clone_story_state(0,243); //patterns on viruses
	ns.MODE = CK_MODE;
	ns.irreg_button_invisible = 1;
	ns.CK_scale = 0.2773500870617064;
	ns.CK_angle = -0.24256388590718214;
	ns.capsid_open_immediately = 0;
//	ns.surfaceZRotation = true;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,245.7); //pop
	ns.sphericality = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,246.9); //pop
	ns.sphericality = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,247.3); //rotating
	ns.surfaceZRotation = true;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,248.2); //pop
	ns.surfaceZRotation = true;
	ns.sphericality = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,249.4); //pop
	ns.surfaceZRotation = true;
	ns.sphericality = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,250.6); //pop
	ns.surfaceZRotation = true;
	ns.sphericality = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,251.8); //pop
	ns.surfaceZRotation = false;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,252); //this model
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,256.5); //final polio
	ns.CK_scale = 0.5773502438405532;
	ns.CK_angle = -0.5235987753305861;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,258);
	ns.capsid_open = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,260); //polio position
	ns.enforced_CK_quaternion.set( -0.5795583117792323,0.2592476704069174, 0.31482085241857005,0.7055427974575411 );
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,261); //fade to polio
	ns.fadePicture = true;
	ns.slide_number = hepASlide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,263.3); //back to tree
	ns.MODE = TREE_MODE;
	ns.CKPicScale = playing_field_dimension;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,270);
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,1000); //safety
	Story_states.push(ns);
	
	//-----------IRREG BEGINS
	ns = default_clone_story_state(1,0); //irreg begins, HIV shown
	ns.MODE = SLIDE_MODE;
	ns.chapter = 2;
	var HIV_slide = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1,12); //different HIVs
	var different_HIVs_index = ns.slide_number;
	ns.CKPicScale = playing_field_dimension; 
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,15.3); //It
	ns.MODE = CKPICS_MODE;
	ns.CKPicStates.push({virus:"hiv",x:0,y:0});
	ns.CKPicStates.push({virus:"pp2",x:playing_field_dimension, y:-playing_field_dimension});
	ns.CKPicStates.push({virus:"amv",x:-playing_field_dimension, y:-playing_field_dimension});
	ns.CKPicStates.push({virus:"uneven",x:0, y:-playing_field_dimension});
	ns.hepPicsVisibility = false;
	ns.introPicsVisibility = false;
	ns.qsPicsVisibility = false;
	ns.endingPicsVisibility = false;
	ns.hivPicsVisibility = true;
	ns.CKPicScale = playing_field_dimension;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,16.65); //other uneven
	ns.CKPicStates.push({virus:"hiv",x:0,y:playing_field_dimension/4});
	ns.CKPicStates.push({virus:"pp2",x:playing_field_dimension/3.2, y:-playing_field_dimension/4.3});
	ns.CKPicStates.push({virus:"amv",x:-playing_field_dimension/3.2, y:-playing_field_dimension/4.3});
	ns.CKPicStates.push({virus:"uneven",x:0, y:-playing_field_dimension/4.3});
	ns.CKPicScale = playing_field_dimension * 0.47;
	Story_states.push(ns);

	ns = default_clone_story_state(0,19.8); //irreg appears
//	ns.enforced_irreg_quaternion.set( -0.4744018551980526,0.024453317552284186,0.045298357905429784, 0.878802010589646 ); //symmetric style
	ns.enforced_irreg_quaternion.set( -0.7071067811545948, 0, 0, 0.7071067812184761 );
	ns.MODE = IRREGULAR_MODE;
	ns.capsid_open_immediately = 0;
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,21.2); //rotate
	ns.varyingsurfaceZRotation = true;
	Story_states.push(ns);

	ns = default_clone_story_state(0,24.6); //stop rotating
	ns.slerpIrregQuaternion.set( -0.1517462204461533, 0.4720398575641219, -0.1626009207873419, 0.8530606087290002 );
	Story_states.push(ns);

	ns = default_clone_story_state(1,25.4); //very icosahedron
	ns.fadePicture = true;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,29.15); //back
	ns.fadePicture = true;
	ns.enforced_irreg_quaternion.set( -0.1517462204461533, 0.4720398575641219, -0.1626009207873419, 0.8530606087290002 );
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,30.4); //open
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,30.7); //this is here so we can enforce quaternion during wrap-up during pause. Er, what? Kinda guessing here
	ns.pause_at_end = 1;
	ns.loopBackTo = 33.14;
	var vertexKnowledgeCountdown = 0;
	ns.playerHasLearned = function() 
	{
		if( theyknowyoucanchangevertices && !isMouseDown )
			vertexKnowledgeCountdown += delta_t;
		if( vertexKnowledgeCountdown < 1)
			return false;
		else return true;
	}
	ns.loopBackCountdown = 7;
	ns.unpauseOn = function()
	{
		if( vertexKnowledgeCountdown < 1)
			return false;
		else return true;
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
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,50.5); //HIV
	ns.slide_number = HIV_slide;
	ns.MODE = SLIDE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,52.6); //monkeys
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
	
	ns = default_clone_story_state(1,79); //with trim5
	ns.fadePicture = true;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,82.1); //corners emphasized
	ns.fadePicture = true;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,89.9); //t4
	var phi29Slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,94.2); //t4 corners
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,95.6); //t4 model
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,102.1); //let them make it
	ns.pause_at_end = 1; 
	ns.enforced_irreg_state = 3;
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,107.9); //if you managed to make that virus 
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,112); //open up
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,113); //mathematically exact
	ns.enforced_irreg_state = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,113.6); //version of it 
	ns.capsid_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,121.2); //we've noticed that when you open them out
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	irreg_flash_time = 124.1; //highlight cuts

	ns = default_clone_story_state(0,127.9); //wedges
	ns.irreg_button_invisible = 1;
	ns.wedgesOpacity = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,129.4); //phi29
	ns.enforced_irreg_quaternion.set( -0.6474512636267394, 0.09959006634153321, -0.014453333803084903, 0.7554335030990861 );
	ns.MODE = SLIDE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,131.3); //T4 TODO quaternion, fade
	ns.MODE = IRREGULAR_MODE;
	ns.enforced_irreg_quaternion.set( -0.6474512636267394, 0.09959006634153321, -0.014453333803084903, 0.7554335030990861 );
	ns.enforced_irreg_state = 1;
	ns.capsid_open_immediately = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,139.2); //try!
	ns.capsid_open = 1;
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,141); //story begins
	ns.irreg_button_invisible = 1;
	ns.wedgesOpacity = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,144); //this model
	ns.enforced_irreg_state = 3;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,146.85); //move
	ns.enforced_irreg_state = 5;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,148.2); //new shape
	ns.capsid_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,153); //otherwise
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	function createTry(openTime, closeTime)
	{
		var maxError = 0.2;
		
		ns = default_clone_story_state(0,openTime); //open
		ns.capsid_open = 1;
		ns.minimum_angle_crapifiers = Story_states[Story_states.length-1].minimum_angle_crapifiers;
		Story_states.push(ns);

		ns = default_clone_story_state(0,closeTime); //bad angles
		ns.minimum_angle_crapifiers = Array(22);
		for(var i = 0; i < ns.minimum_angle_crapifiers.length; i++)
			ns.minimum_angle_crapifiers[i] = 1 + (Math.random()-0.5) * 2 * maxError;
		ns.capsid_open = 0;
		Story_states.push(ns);
	}
	
	createTry(156, 156.1);
	createTry(160.7, 163.1); //calculating is extremely tricky
	createTry(166.1, 167.15); //I spent months trying to do it
	createTry(168.6, 169.9); //not one idea ever worked
	createTry(171.45, 172.8); //eventually
	createTry(174.8, 176.9); //awful, letting downs
	createTry(179.5, 181.5); //however, lucky
	
	ns = default_clone_story_state(1,189.5); //christmas
	ns.minimum_angle_crapifiers = Story_states[Story_states.length-1].minimum_angle_crapifiers;
	ns.MODE = SLIDE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,192.6); //book
	ns.minimum_angle_crapifiers = Story_states[Story_states.length-1].minimum_angle_crapifiers;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,199.3); //book excerpt
	ns.minimum_angle_crapifiers = Story_states[Story_states.length-1].minimum_angle_crapifiers;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,204.5); //back to model
	ns.minimum_angle_crapifiers = Story_states[Story_states.length-1].minimum_angle_crapifiers;
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,206); //open
	ns.minimum_angle_crapifiers = Story_states[Story_states.length-1].minimum_angle_crapifiers;
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,208.2); //close, but nice!
	ns.capsid_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,210.3); //and so
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,211.7); //that is now running
	ns.enforced_irreg_state = 2;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,216.8); //turned out to be useful
	ns.capsid_open = 0;
	Story_states.push(ns); 
	
	ns = default_clone_story_state(0,217.8); //for modelling
	ns.slerpIrregQuaternion = new THREE.Quaternion(-0.5098475072845515, -0.5458187060946302, 0.4320558357051994, -0.5054356643196629);
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,219.8); //HIV
	ns.slide_number = HIV_slide;
	ns.fadePicture = true;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,221.7); //tree, or time to skip back to tree. TODO they don't have to see this?
	ns.MODE = TREE_MODE;
	ns.CKPicScale = playing_field_dimension;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,228.9); //stop
	ns.prevent_playing = 1;
	ns.CKPicScale = playing_field_dimension;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,1000); //safety
	ns.capsid_open = 0;
	Story_states.push(ns);

//	//----------QS BEGINS
	ns = default_clone_story_state(0,0); //zika virus
	ns.chapter = 3;
	ns.MODE = CKPICS_MODE;
	ns.CKPicStates.push({virus:"zika",x:0,y:0});
	ns.CKPicStates.push({virus:"bluetongue",x:playing_field_dimension, y:-playing_field_dimension});
	ns.CKPicStates.push({virus:"hpv",x:-playing_field_dimension, y:-playing_field_dimension});
	ns.hepPicsVisibility = false;
	ns.endingPicsVisibility = false;
	ns.introPicsVisibility = false;
	ns.qsPicsVisibility = true;
	ns.hivPicsVisibility = false;
	ns.CKPicScale = playing_field_dimension;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,3.5); //bluetongue, or group
	ns.CKPicStates.push({virus:"zika",x:0,y:halfVerticalSeparation});
	ns.CKPicStates.push({virus:"bluetongue",x:halfVerticalSeparation, y:-halfVerticalSeparation});
	ns.CKPicStates.push({virus:"hpv",x:-halfVerticalSeparation, y:-halfVerticalSeparation});
	ns.CKPicScale = playing_field_dimension * 0.28;
	Story_states.push(ns);

	ns = default_clone_story_state(0,9.4); //QS, Try it out, (pause)
	ns.MODE = QC_SPHERE_MODE;
//	ns.loopBackTo = 10.4;
//	ns.playerHasLearned = function() { return theyknowyoucanchangestate; };
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,12.35); //may not seem like a virus
	Story_states.push(ns);

	ns = default_clone_story_state(1,17.9); //HPV
	ns.MODE = SLIDE_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(1,25.6); //HPV xray
	ns.fadePicture = true;
	Story_states.push(ns);

	ns = default_clone_story_state(1,28.5); //HPV blobs
	ns.fadePicture = true;
	Story_states.push(ns);

	ns = default_clone_story_state(1,42.9); //HPV connections
	ns.fadePicture = true;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,50.3); //colored
	ns.fadePicture = true;
	Story_states.push(ns);

	ns = default_clone_story_state(0,56.6); //back to model, then make hpv
//	ns.enforced_cutout_vector0_player.set(1.809016994374948, 1.4384360606445132, 0); //zika... probably should be a smaller one
	ns.pause_at_end = 1;
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,59.2); //model was made 800 years ago
	Story_states.push(ns);

	ns = default_clone_story_state(1,67.9); //standard dome
	ns.MODE = SLIDE_MODE;
	var islamic_dome_index = ns.slide_number;
	ns.slide_number = islamic_dome_index;
	ns.fadePicture = false;
	Story_states.push(ns);
	
	var numIslamicExamples = 4;
	for(var i = 0; i < numIslamicExamples; i++)
	{
		ns = default_clone_story_state(1, 72.9 + i*(83.2-72.9)/numIslamicExamples );
		Story_states.push(ns);
	}
	
	ns = default_clone_story_state(1,83.2); //darb e imam shrine
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,90.3); //above entrance
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,93.8); //inside
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,101.5); //with pentagons
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,104); //demo
	ns.MODE = HEXAGON_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,134.4); //back to shrine
	ns.enforced_qs_quaternion.set( 0,0,1,0 );
	ns.enforced_cutout_vector0_player.set(2.618033988749895, 0.8506508083520401, 0);
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,143); //pause to play around and see resemblence
	ns.pause_at_end = 1;
	ns.enforced_qs_quaternion.set( 0,0,1,0 );
	ns.enforced_cutout_vector0_player.set(2.618033988749895, 0.8506508083520401, 0);
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,154.5); //so why do viruses use these patterns?
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,158); //HPV in model
	ns.enforced_cutout_vector0_player.set(0, 3.479306368947708, 0);
	//siiiigh, want it smooth really
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,161.4); //drug
	ns.MODE = SLIDE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,165.6); //hpv can evolve
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,170); //smaller HPV
	ns.enforced_cutout_vector0_player.set(1.118033988749895, 2.389492576939667, 0);
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,179.8); //lots
	ns.enforced_cutout_vector0_player.set( 1, 2.752763840942347, 0 );
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,180.4); //of different
	ns.enforced_cutout_vector0_player.set( 1.5, 2.389492576939667, 0 );
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,180.6); //states
	ns.enforced_cutout_vector0_player.set( 2.3090169943749475, 0.6261368200622472, 0 );
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,189.8); //zika
	ns.enforced_cutout_vector0_player.set(1.809016994374948, 1.4384360606445132, 0);
	Story_states.push(ns);

	ns = default_clone_story_state(1,195.04); //pic of zika
	ns.MODE = SLIDE_MODE;
	var zika_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,196.5);
	ns.pause_at_end = 1;
	ns.MODE = TREE_MODE;
	ns.CKPicScale = playing_field_dimension;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,197.5);
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,1000);
	Story_states.push(ns);
	
	//------ENDING BEGINS!!!!
	ns = default_clone_story_state(1,0); //Start of end
	var Measles_slide = ns.slide_number;
	ns.MODE = SLIDE_MODE;
	ns.chapter = 4;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,12.1); //Tomoko Fuse
	var Tomoko_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,71.7); //super dodecahedral
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,113.6); //why an architect
	ns.slide_number = bucky_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,116); //can help with hepatitis. Demo!
	ns.slide_number = hepASlide;
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

	ns = default_clone_story_state(0,128.5); //measles
	ns.slide_number = Measles_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,145.5); //real science is about real things
	var shellSlide = ns.slide_number;
	ns.CKPicScale = 4.75;
	ns.CKPicStates.push({virus:"spiral",x:0,y:0});
	Story_states.push(ns);

	ns = default_clone_story_state(0,149.1); //we like our pretty patterns, golden spiral
	ns.MODE = CKPICS_MODE;
	ns.hepPicsVisibility = false;
	ns.introPicsVisibility = false;
	ns.endingPicsVisibility = true;
	ns.qsPicsVisibility = false;
	ns.hivPicsVisibility = false;
	ns.CKPicScale = 4.75;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,153.4); //shell appears
	ns.slide_number = shellSlide;
	ns.fadePicture = true;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,155.6); //trying
	ns.slide_number = shellSlide;
	ns.CKPicScale = 4.3;
	ns.CKPicStates.push({virus:"spiral",x:0.43,y:-0.2});
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,156.3); //trying
	ns.slide_number = shellSlide;
	ns.CKPicScale = 7;
	ns.CKPicStates.push({virus: "spiral", x: 0.26, y: -1.12});
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,157); //trying
	ns.slide_number = shellSlide;
	ns.CKPicScale = 1.6;
	ns.CKPicStates.push({virus: "spiral", x: -0.2, y: 0.45});
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,159.3); //go away
	ns.slide_number = shellSlide;
	ns.CKPicStates.push({virus: "spiral", x: -0.2, y: -playing_field_dimension});
	Story_states.push(ns);

	ns = default_clone_story_state(0,160.8); //measles
	ns.slide_number = Dad_slide;
	ns.MODE = SLIDE_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(0,168); //measles
	ns.slide_number = Measles_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(1,219.9); //lots of viruses
	Story_states.push(ns);

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

	ns = default_clone_story_state(0,256.3); //coming back
	ns.CK_scale = 0.2773500870617064;
	ns.CK_angle = -0.24256388590718214;
	Story_states.push(ns);

	ns = default_clone_story_state(0,257.7); //coming back
	ns.capsid_open = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,259.2); //pentagons in same places
	ns.pentamers_color.copy(hexamerPentamerHighlightColor);
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,261); //and back
	Story_states.push(ns);

	ns = default_clone_story_state(0,263.3); //humans coming around to the same patterns, golf ball
	ns.MODE = SLIDE_MODE;
	ns.slide_number = footballSlide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,271.7); //HK97
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,279); //credits viruses
	ns.slide_number = hepASlide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,285);
	ns.slide_number = zika_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,291);
	ns.slide_number = Measles_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,297);
	ns.slide_number = first_virus_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,303);
	ns.slide_number = epcotSlide;
	Story_states.push(ns);
	

	ns = default_clone_story_state(0,500); //safety
	Story_states.push(ns);
	

//		if(Story_states[i].slide_number !== -1 )
//			Story_states[i].MODE = SLIDE_MODE;
	
	for(var i = 0; i < Story_states.length - 1; i++ )
	{
		if( Story_states[i].chapter === Story_states[i+1].chapter && Story_states[i].startingtime >= Story_states[i+1].startingtime )
			console.error("bad starting time:", Story_states[i+1].startingtime);
	}
}

var next_slide = 0;