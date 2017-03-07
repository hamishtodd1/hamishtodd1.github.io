/* 
 * Programming the triggers: make sure there�s no interdependence. 
 * Stuff can happen, but it�s a miniscule little thing that has no bearing on the deeper system beneath it
 * 
 * One deep bug is the fact that if they tab away and don't pause, the program isn't running so it can't be paused
 * 
 * Would be nice for the player to be able to mess around with time but still have it work. You want them to be able to come back
 */

var Storypage = -1; //set to a silly number initially so we know that the first page will be triggered.
var Story_states = [];
var used_up_pause = 0;
var unpause_timer = 0;
var rotation_knowledge_time;
var reused_slide_indices = Array();
var lattice_fadein_time;
var cutout_vector0_interpolatingfrom = new THREE.Vector3();

function Update_story()
{
//	console.log( our_CurrentTime );
	
	//if you skip to a time, then the thing might not be in the state to demonstrate precisely what you want. And that is ok.
	
	if(our_CurrentTime >= 21*60+16)
		if( !Sounds.endingMusic.isPlaying)
			Sounds.endingMusic.play();
	
	if(Storypage !== -1) //first part of this function is all based on current state, which you don't have at the very start
	{
		if(Story_states[Storypage].slide_number !== -1 && slideObjects[ Story_states[Storypage].slide_number ].material.opacity < 1 )
		{
			slideObjects[ Story_states[Storypage].slide_number ].material.opacity += 0.02;
		}
		
		if(Story_states[Storypage].cameraCloseup)
		{
			camera.position.z = 5.5;
		}
		else
		{
			camera.position.z += 0.2;
			if( camera.position.z > min_cameradist)
				camera.position.z = min_cameradist;
		}
		camera.position.x = camera.position.z * -playing_field_dimension/min_cameradist/2;
		slideObjects[ 0 ].position.x = camera.position.x * 2;
//		slideObjects[ 1 ].position.x = camera.position.x * 2;
		
		if( Story_states[Storypage].unpause_on_vertex_knowledge && theyknowyoucanchangevertices && !isMouseDown )
			IrregButton.capsidopen = 0;	
		
		if( Story_states[Storypage].enforced_cutout_vector0_player.x !== -1 ) //note to self: you're screwed if you'd like it to be -1 as that is the "default"!
		{
			var lerpedness = (our_CurrentTime - Story_states[Storypage].startingtime) / 0.8; //pic of pills!
			if(lerpedness < 0)
				lerpedness = 0;
			if(lerpedness>1)
				lerpedness = 1;
			
			cutout_vector0_player.lerpVectors(cutout_vector0_interpolatingfrom, Story_states[Storypage].enforced_cutout_vector0_player, lerpedness );
		}
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
			
			used_up_pause = 0; //reset with every page turned
			
			break;
		}
		
		if( i === Story_states.length - 1 )
			console.error("no story state found for current time, which is ", our_CurrentTime)
	}
	
	//everything below here only happens once, at the start of the chapter.
	
	if( Story_states[Storypage].enforced_cutout_vector0_player.x !== -1 ) //note to self: you're screwed if you'd like it to be -1 as that is the "default"!
		cutout_vector0_interpolatingfrom.copy(cutout_vector0_player); //could choose it based on proximity to the destination modulo TAU / 5
	
	surface.material.color.copy( Story_states[i].CK_surface_color );
	
	//only want this for sudden transitions, not wrapups - that is handled automatically.
	if( Story_states[Storypage].enforced_irreg_quaternion.x !== 5 ) //we want you either going towards closed or closed
	{
		varyingsurface.quaternion.copy( Story_states[Storypage].enforced_irreg_quaternion );
		for( var i = 0; i < varyingsurface_cylinders.length; i++)
			varyingsurface_cylinders[i].quaternion.copy(Story_states[Storypage].enforced_irreg_quaternion );
		for( var i = 0; i < varyingsurface_spheres.length; i++)
			varyingsurface_spheres[i].quaternion.copy(Story_states[Storypage].enforced_irreg_quaternion );
		
		varyingsurface.updateMatrixWorld();
	}
	
	if( Story_states[Storypage].CK_scale !== 666 )
		LatticeScale = Story_states[Storypage].CK_scale;
	if( Story_states[Storypage].CK_angle !== 666 )
		LatticeAngle = Story_states[Storypage].CK_angle;
	
	minimum_angle_crapifier = Story_states[Storypage].minimum_angle_crapifier;
	
	for(var i = 0; i < wedges.length; i++)
		wedges[i].visible = Story_states[Storypage].wedges_visible;
	
	if( Story_states[Storypage].enforced_CK_quaternion.x !== 5 )
	{
		surface.quaternion.copy( Story_states[Storypage].enforced_CK_quaternion );
		for(var i = 0; i < surfperimeter_cylinders.length; i++ )
			surfperimeter_cylinders[i].quaternion.copy( Story_states[Storypage].enforced_CK_quaternion );
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
		ChangeScene(Story_states[Storypage].MODE );

	if(Story_states[Storypage].slide_number !== -1 )
	{
		scene.add( slideObjects[ Story_states[Storypage].slide_number ] );
		slideObjects[ Story_states[Storypage].slide_number ].position.x = -playing_field_dimension;
		if( Storypage > 0 && Story_states[Storypage-1].slide_number !== -1) {
			slideObjects[ Story_states[Storypage].slide_number ].position.z = slideObjects[ Story_states[Storypage-1].slide_number ].position.z + 0.001;
			slideObjects[ Story_states[Storypage].slide_number ].material.opacity = 0;
		}
	}
	
	//If we've just ticked forward then of course we should be playing anyway, but if we just started a new chapter, having been on the tree, we might be paused
	
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
	//we're going to force ourselves into the situation we expect
	if( Story_states[Storypage].unpause_on_vertex_knowledge )
	{
		theyknowyoucanchangevertices = 0; //suuuuure about doing that?
		if(capsidopenness === 0 )
			capsidopenness += 0.0001;
	}
	
	/*
	 * List of things:
	 * -you do need to bring in the arrow into CK and QS too
	 * -auto-unpause with triggers (bocavirus)
	 * CK less flexible
	 * -names beneath viruses
	 * 
	 * Snap
	 * Line up Hepatitis?
	 * 
	 * -canvas shrinks away?
	 * -dodeca can appear on QS?
	 * -QS edges and vertices flash?
	 * -greenhouse etc in CK
	 * -DNA mimics what you do?
	 * -QS points and edges flash?
	 * -dodecahedron faces flash?
	 * 
	 */
	
	//TODO doesn't happen if you skip there
	if(Story_states[Storypage].offer_virus_selection)
		add_virus_selection_to_scene();
	else
		for( var i = 0; i < clickable_viruses.length; i++ )
			scene.remove(clickable_viruses[i]);
}

function init_story()
{	
	var ns; //new state
	
	Story_states.push({
		startingtime: -1, //this is just the prototype state, not really used!
		
		MODE: SLIDE_MODE,
		
		pause_at_end: 0, //at end because when you unpause it's usually a new thought
		unpause_after: -1, //but you only want it to unpause if it's the pause that YOU'VE done :P Currently
		
		slide_number: -1,
		
		//TODO use this on, for example, transition from part 1 to 2
		go_to_time: -1, //alternatively just edit the video. Don't skip back, we ascend through the states
		//The thing about go_to_time is that you can't have it take you to a place in the state in which it occurs
		
		offer_virus_selection: 0,
		
		enforced_irreg_state: -1,
		
		enforced_CK_quaternion: new THREE.Quaternion(5,5,5,5),
		enforced_irreg_quaternion: new THREE.Quaternion(5,5,5,5),
		
		CK_surface_color: new THREE.Color( 0.11764705882352941, 0.9882352941176471, 0.9529411764705882 ),
		pentamers_color: new THREE.Color( 147/255,0,8/255 ),
		hexamers_color: new THREE.Color( 208/255,58/255,59/255 ),
		
		capsid_open: -1,
		irreg_button_invisible: 0,
		unpause_on_vertex_knowledge: 0,
		
		unpause_on_hepatitis_scale: 0,
		
		CK_scale_only: 0,
		
		cameraCloseup: 0,
		
		minimum_angle_crapifier: 1,
		
		wedges_visible: false,
		
		CK_scale: 666,
		CK_angle: 666,
		
		unpause_on_rotation_knowledge: 0,
		
		enforced_cutout_vector0_player: new THREE.Vector3(-1,0,0),
		
		prevent_playing: 0 //could also use this to stop them from continuing if they haven't rotated bocavirus etc
	});
	
	Chapter_start_times[0] = 1;
	Chapter_start_times[1] = 1;
	Chapter_start_times[2] = 1;
	Chapter_start_times[3] = 1;
	
	//------CK BEGINS
	
	//Camera z is 6. Camera x is such that you are on the line connecting the default position and CK's center
	//Also, the picture's x is 2x the camera's x.
	
	ns = default_clone_story_state(1,3);
	ns.CK_surface_color = new THREE.Color( 0.11764705882352941, 0.9882352941176471, 0.9529411764705882 );
	ns.pentamers_color = new THREE.Color( 0 / 256, 13 / 256, 194 / 256 ),
	ns.hexamers_color = new THREE.Color(  0 / 256, 13 / 256, 194 / 256 ),
	ns.MODE = CK_MODE;
//	ns.irreg_button_invisible = 1;
	ns.cameraCloseup = 1;
	ns.capsid_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,6);
	ns.cameraCloseup = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,9);
	lattice_fadein_time = ns.startingtime;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,12); //RVF
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,15); //hep b
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,18); //irreg appears, white
	ns.MODE = IRREGULAR_MODE;
	ns.capsid_open_immediately = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,21); //phi29
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,24); //phi29 abstract
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,27); //ck hider
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,30); //ck hider
	ns.enforced_irreg_state = 2;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,33); //hiv
	Story_states.push(ns);
	

	
	
	//-----------IRREG BEGINS

	ns = default_clone_story_state(0,578.8); //irreg appears
	ns.enforced_irreg_quaternion.set( 
			-0.4744018551980526,0.024453317552284186,0.045298357905429784, 0.878802010589646 );
	ns.MODE = IRREGULAR_MODE;
	ns.capsid_open_immediately = 0;
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(1,581.7); //very icosahedron
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,584.3); //back
	ns.enforced_irreg_quaternion.set( -0.4744018551980526,0.024453317552284186,0.045298357905429784, 0.878802010589646 );
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,585.6); //open irreg then (pause)
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,586); //this is here so we can enforce quaternion during wrap-up during pause
	ns.pause_at_end = 1;
	ns.unpause_on_vertex_knowledge = 1;
	Story_states.push(ns);
	
	
	
	for(var i = 0; i < Story_states.length - 1; i++ )
		if( Story_states[i].startingtime >= Story_states[i+1].startingtime )
			console.error("bad starting time for number ", i);
}

var next_slide = 0;
//clone the previous state and give it a different time
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
	
	new_story_state.offer_virus_selection = 0; //in general
	
	new_story_state.go_to_time = -1;
	
	new_story_state.prevent_playing = 0;
	
	new_story_state.pause_at_end = 0;
	new_story_state.unpause_after = -1;
	
	new_story_state.startingtime += default_page_duration;
	
	new_story_state.capsid_open = -1;
	new_story_state.capsid_open_immediately = -1;
	new_story_state.unpause_on_vertex_knowledge = 0;
	
	new_story_state.minimum_angle_crapifier = 1;
	
	new_story_state.CK_scale = 666;
	new_story_state.CK_angle = 666;
	
	//make it unused
	new_story_state.enforced_cutout_vector0_player = new THREE.Vector3(-1,0,0);
	
	new_story_state.unpause_on_rotation_knowledge = 0;
	
	new_story_state.unpause_on_hepatitis_scale = 0;
	
	new_story_state.enforced_irreg_state = -1;
	
	new_story_state.enforced_CK_quaternion = new THREE.Quaternion(5,5,5,5);
	new_story_state.enforced_irreg_quaternion = new THREE.Quaternion(5,5,5,5);
	
	new_story_state.startingtime = ST;
	
	return new_story_state;
}