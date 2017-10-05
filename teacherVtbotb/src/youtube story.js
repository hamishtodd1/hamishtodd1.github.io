/* 
 * Programming the triggers: make sure there�s no interdependence.
 */

var our_CurrentTime = 0;

var last_timeupdate = 0;

var rolling_sum = 0;

var Storypage = -1;
var Story_states = [];
var unpause_timer = 0;
var rotation_knowledge_time;
var reused_slide_indices = Array();
var lattice_fadein_time;
var cutout_vector0_interpolatingfrom = new THREE.Vector3();

var theyKnowYouCanOpenAndClose = false;

function Update_story()
{
	console.log(Storypage)
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
		if(	Story_states[i].startingtime <= our_CurrentTime &&
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
			console.error("no story state found for current time, which is ", our_CurrentTime )
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
	
	if( Story_states[Storypage].MODE !== MODE )
		
	
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
	ns = default_clone_story_state(0,-0.1);
	ns.MODE = CK_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(0,500); //safety
	Story_states.push(ns);
	
	for(var i = 0; i < Story_states.length - 1; i++ )
	{
		if( Story_states[i].startingtime >= Story_states[i+1].startingtime )
			console.error("bad starting time:", Story_states[i+1].startingtime);
	}
}

var next_slide = 0;