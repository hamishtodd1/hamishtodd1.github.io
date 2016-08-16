/*
 * 
 * Would be nice for the player to be able to mess around with time but still have it work. You want them to be able to come back
 * 
 * Programming the triggers: make sure there’s no interdependence. 
 * Stuff can happen, but it’s a miniscule little thing that has no bearing on the deeper system beneath it
 * 
 * 
 */

var Storypage = -1; //set to a silly number initially so we know that the first page will be triggered.
var Story_states = [];
var used_up_pause = 0;
var unpause_timer = 0;
var rotation_knowledge_time;
var reused_slide_indices = Array();

function Update_story()
{
	console.log( our_CurrentTime );
	
	//first part of this function is all based on current state, which you don't have at the very start
	if(Storypage !== -1)
	{
		if( Story_states[Storypage].prevent_playing )
			if(ytplayer.getPlayerState() === 1)// 1 means playing,not allowed (although maybe some people like to have order designated for them?)
				ytplayer.pauseVideo();
		
		if( Story_states[Storypage].unpause_on_vertex_knowledge && theyknowyoucanchangevertices && !isMouseDown )
			IrregButton.capsidopen = 0;
		if( Story_states[Storypage].unpause_on_vertex_knowledge && capsidopenness === 0 )
		{
			ytplayer.playVideo();
			console.log("unpausing on vertex knowledge");
		}
		
		if( Story_states[Storypage].unpause_on_hepatitis_scale && LatticeScale <= 0.28867512192027667 && ytplayer.getPlayerState() === 2 )
		{
			//what if they get it before you've paused?
			LatticeScale = 0.28867512192027667;
			ytplayer.playVideo();
		}
		
		if( Story_states[Storypage].unpause_on_rotation_knowledge && rotation_understanding >= 2 && !isMouseDown )
		{
			rotation_understanding = 0;
			ytplayer.playVideo();
		}
		
		if( Story_states[Storypage].unpause_after !== -1)
		{
			unpause_timer += delta_t;
			if( unpause_timer >= Story_states[Storypage].unpause_after )
			{
				unpause_timer = 0;
				console.log("unpause after read?");
				ytplayer.playVideo();
			}
		}
		
		//if you're about to move on from a state that wants to be paused
		if( Story_states[Storypage].pause_at_end === 1 && Story_states[Storypage + 1].startingtime < our_CurrentTime && our_CurrentTime < Story_states[Storypage + 2].startingtime )
		{
			if( ytplayer.getPlayerState() === 2 ) //if you're paused, we don't let you past here
			{
				used_up_pause = 1;
				return;
			}
			
			//we want to move on iff you've had the pause and you're no longer paused (i.e. the player paused you)
			if( !used_up_pause )
			{
				ytplayer.pauseVideo(); //this has a delayed reaction, we will continue asking for a pause until it has paused!
				return;
			}
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
			
			if( Storypage > 0 && i === Storypage + 1 && Story_states[Storypage - 1].pause_at_end === 1 && !used_up_pause )
				console.error("we're moving to the next state without having used a pause!");
			
			Storypage = i;
			
			used_up_pause = 0; //reset with every page turned
			
			if( Story_states[Storypage].go_to_time !== -1 ) //want to catch the state immediately
			{
				ytplayer.seekTo( Story_states[Storypage].go_to_time );
				our_CurrentTime =Story_states[Storypage].go_to_time;
			}
			else
				break;
		}
		
		if( i === Story_states.length - 1 )
			console.error("no story state found for current time")
	}
	
	//slide can be a video too maybe
	if(Story_states[Storypage].slide_number !== -1 )
	{
		VisibleSlide.material.map = slide_textures[ Story_states[Storypage].slide_number ];
		VisibleSlide.material.needsUpdate = true;
	}
	//slide mode should really be an exceptional thing here
	if( Story_states[Storypage].MODE !== MODE )
		ChangeScene(Story_states[Storypage].MODE );
	
	//If we've just ticked forward then of course we should be playing anyway, but if we just started a new chapter, having been on the tree, we might be paused
	if( !Story_states[Storypage].prevent_playing )
		ytplayer.playVideo();
	
	if( Story_states[Storypage].irreg_open !== -1 )
		IrregButton.capsidopen = Story_states[Storypage].irreg_open;
	
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
	
	console.log(Story_states[Storypage].enforced_cutout_vector0_player.x)
	if( Story_states[Storypage].enforced_cutout_vector0_player.x !== -1 ) //note to self: you're screwed if you'd like it to be -1.
	{
		cutout_vector0_player.copy( Story_states[Storypage].enforced_cutout_vector0_player );
		console.log( cutout_vector0_player );
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
		unpause_after: -1, //but you only want it to unpause if it's the pause that YOU'VE done :P
		
		slide_number: -1,
		
		//TODO use this on, for example, transition from part 1 to 2
		go_to_time: -1, //alternatively just edit the video. Don't skip back, we ascend through the states
		
		offer_virus_selection: 0,
		
		irreg_open: -1,
		irreg_button_invisible: 0,
		unpause_on_vertex_knowledge: 0,
		
		unpause_on_hepatitis_scale: 0,
		
		CK_scale_only: 0,
		
		unpause_on_rotation_knowledge: 0,
		
		enforced_cutout_vector0_player: new THREE.Vector3(-1,0,0),
		
		prevent_playing: 0 //could also use this to stop them from continuing if they haven't rotated bocavirus etc
	});
	
	ns = default_clone_story_state(1);
	ns.startingtime = 0.1;
	ns.go_to_time = 570; //skips to wherever you like 560 is HIV demo, 455.5 is CK
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 11; //hiv
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 21; //measles
	var Dad_slide = ns.slide_number;
	Story_states.push(ns);
	
	//---paragraph 2
	ns = default_clone_story_state(0);
	ns.startingtime = 34.5; //bocavirus appears, then pause
	ns.MODE = BOCAVIRUS_MODE;
	ns.pause_at_end = 1; //TODO handle the assurance.
//	ns.unpause_after = 9.5; //want to 
	ns.unpause_on_rotation_knowledge = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 42.2; //You looking at the camera
	ns.go_to_time = 50;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 43.4; //assurance occurs, the previous part is just you looking at the camera
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 50; //pneumonia
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 65.8; //Flash, then pause
	ns.pause_at_end = 1;
	flash_time = ns.startingtime;
	ns.unpause_on_rotation_knowledge = 1;
	Story_states.push(ns);
	
	//TODO they need to be able to unpause again
	
	ns = default_clone_story_state(1);
	ns.startingtime = 77; //other viruses
	Story_states.push(ns);
	
	//-------TODO the designs comparison should look around the tree
	ns = default_clone_story_state(1);
	ns.startingtime = 97; //golf balls  
	unflash_time = ns.startingtime;
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 99; //that look like viruses
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 101; //todo buildings
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 103; //that look like viruses
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 106; //religious art
	var islamic_dome_index = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 109; //that look like viruses (HPV)
	Story_states.push(ns);
	
	
	
	//----Part 2
	ns = default_clone_story_state(0);
	ns.startingtime = 124; //beginning of part 2, back to boca
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
//	var movement_duration = 2.2;
//	var pullback_start_time = 142.8;
//	var cell_move_time = 145.6;
//	var zoomin_start_time = 149.8;
//	var cell_fadeout_start_time = zoomin_start_time + movement_duration / 2;
//	var fade_starting_time = 152;
//	var Transcriptase_ogling_time = 169.5;
//	var second_pullback_start_time = 179.4;
//	var whole_thing_finish_time = 197;

	ns = default_clone_story_state(0);
	ns.startingtime = 127; //camera pulls back
	pullback_start_time = ns.startingtime;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 139; //absorb
	cell_move_time = ns.startingtime;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 146; //zoom in
	zoomin_start_time = ns.startingtime;
	cell_fadeout_start_time = zoomin_start_time + movement_duration / 2;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 149.5; //break up
	fade_starting_time = ns.startingtime;
	ns.pause_at_end = 1;
	ns.unpause_after = 9.5;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 162.8; //you'll need to unpause me manually
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 168.4; //transcriptase
	Transcriptase_ogling_time = ns.startingtime;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 179; //comparison to virus
	second_pullback_start_time = ns.startingtime;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 201; //cell with fluourescence
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 211; //back to DNA. DNA mimics what you do?
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 291; //cell full of viruses
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 296.8; //lysis
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 302.7; //back to DNA
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
//	ns = default_clone_story_state(0);
//	ns.startingtime = 276.2; //twelve pentagons flash? Proteins come back? 
//	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 310; //Tree
	ns.MODE = TREE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 328;
	ns.prevent_playing = 1; //pause on here until they click
	Story_states.push(ns);
	
	//might need an assurance? Especially if they click on you
	
	//----------QS BEGINS!!!!!
	ns = default_clone_story_state(1);
	ns.startingtime = 329; //zika virus
	var zika_slide = ns.slide_number; 
	Chapter_start_times[2] = ns.startingtime + 0.05;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 337; //QS, Try it out, (pause)
	ns.MODE = QC_SPHERE_MODE;
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0); //may not seem like a virus
	ns.startingtime = 343;
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 347.2; //HPV
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 354; //HPV xray
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 358; //HPV blobs
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 368.4; //HPV connections
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 375.5; //back to model
	ns.pause_at_end = 1;
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 379; //pause to play around with it
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 6*60+26.3; //islamic holy building
	ns.slide_number = islamic_dome_index;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 6*60+31; //covered with patterns(triangle)
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 6*60+35; //square
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 6*60+38; //darb e imam shrine
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 6*60+45; //above entrance
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 411.3; //inside
	var inside_darb_e_pic_index = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 6*60+58; //inside with pentagons
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 7*60+4; //just pentagons
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 7*60+12; //rubbish pattern
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 7*60+19.9; //back to shrine
	ns.slide_number = inside_darb_e_pic_index;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 7*60 + 49; //back to model
	ns.pause_at_end = 1;
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 479.8; //here's where things will change when you have the pic in the vid
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 8*60 + 16.8; //HPV in the model
	ns.enforced_cutout_vector0_player.set(0, 3.479306368947708, 0);
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 8*60 + 32; //smaller HPV (zika)
	ns.enforced_cutout_vector0_player.set(1.809016994374948, 1.4384360606445132, 0);
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 8*60 + 55; //pic of zika
	ns.slide_number = zika_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 537.9;
	var second_tree_advice_time = ns.startingtime; 
	//and come here after first chapter...
	ns.MODE = TREE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 542;
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	//-----------IRREG BEGINS
	ns = default_clone_story_state(1);
	ns.startingtime = 9*60 + 2.8; //irreg begins, HIV shown
	Chapter_start_times[0] = ns.startingtime;
	var HIV_slide = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 561.2; //different HIVs
	var different_HIVs_index = ns.slide_number; 
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 568.7; //irreg appears
	ns.MODE = IRREGULAR_MODE;
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 575.1; //open irreg then (pause)
	ns.irreg_open = 1;
	ns.pause_at_end = 1;
	ns.irreg_button_invisible = 1;
	ns.unpause_on_vertex_knowledge = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 578.3; //just to make button appear
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 578.5; //prompt to click button (skip for time being)
	ns.go_to_time = 582.5;
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 582.5; //monkeys
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 588; //have a protein
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 597.6; //very small (cone shaped hiv)
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 606.6; //hiv in model(?) TODO
	ns.irreg_open = 1;
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 614.6; //might want to make these
	ns.slide_number = different_HIVs_index;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 623.9; //potato virus
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 630.5; //let them make it
	ns.pause_at_end = 1;
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 634.6; //show the representation TODO
	ns.irreg_open = 0; 
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 643.8; //we've noticed that when you open them out
	ns.irreg_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 646; //highlight cuts
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 663; //offer viruses
	ns.offer_virus_selection = 1;
	ns.pause_at_end = 1;
	ns.irreg_open = 1;
	Story_states.push(ns);
	
	//angle indicators come in? Could be now, "prove me wrong", or it could be earlier.
	
	ns = default_clone_story_state(0);
	ns.startingtime = 60*11 + 14.5; //story begins
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 60*11+18.5; //open it out
	ns.irreg_open = 1;
	Story_states.push(ns);
	
	//move corner around, close up badly

	ns = default_clone_story_state(0);
	ns.startingtime = 60*11+30; //bad angles, close
	ns.irreg_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 60*11+51; //christmas
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 60*12+7; //book
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 60*12+13; //book excerpt
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 60*12+21; //back to model
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 60*12+25; //closes again
	ns.irreg_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 60*12+31.6; //tree, or time to skip back to tree
	ns.MODE = TREE_MODE;
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	
	//------CK BEGINS
	ns = default_clone_story_state(1);
	ns.startingtime = 60*12+32.2; //polio
	Chapter_start_times[1] = ns.startingtime;
	ns.CK_scale_only = 1;
	var polio_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 60*12+58.1; //hep B comparison
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 60*13+11; //back to polio to introduce model
	ns.slide_number = polio_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 60*13+16; //polio in model, no lattice
	ns.MODE = CK_MODE;
	ns.irreg_button_invisible = 1;
	ns.irreg_open = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 60*13+24; //open it up
	ns.irreg_open = 1;
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 60*13+28; //lattice appears
	ns.pause_at_end = 1;
	ns.irreg_button_invisible = 1;
	ns.unpause_on_hepatitis_scale = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 60*13+36.8; //They've gotten to rift valley fever, let me stop you there
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 60*13+44; //close it up
	ns.irreg_open = 0;
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 60*13+51; //rift valley fever
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 60*13+59; //back to model
	ns.CK_scale_only = 0;
	ns.MODE = CK_MODE;
	ns.pause_at_end = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 60*14+6; //tell them to rotate TODO
	ns.go_to_time = 60*14+9;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 60*14+9; //try making this virus
	ns.pause_at_end = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 60*14+19; //they look this way because of symmetry
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 60*14+24.5; //hexagons are symmetrical
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 60*14+28; //hexagons can be made of pieces
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 60*14+31; //hexagons tile  
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 60*14+36; //model contains pentagons
	ns.MODE = CK_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 60*15+2; //geodesic example
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 60*15+8; //geodesic building
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 60*15+12; //Bucky
	var bucky_slide = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 60*15+25; //thai basket
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 60*15+29.8; //hairstyle
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 60*15+36.7; //first virus
	var first_virus_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 60*15+53.8; //this is what he sent them
	ns.MODE = CK_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 60*16 + 4; //here's a few viruses you can see in it
	ns.offer_virus_selection = 1;
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 60*16 + 10; //back to tree
	ns.offer_virus_selection = 1;
	ns.MODE = TREE_MODE;
	ns.prevent_playing = 1;
	Story_states.push(ns);

	//------ENDING BEGINS!!!!
	//no canvas?
	ns = default_clone_story_state(0);
	ns.startingtime = 16*60+11; //Start of end
	ns.MODE = TREE_MODE;
	Chapter_start_times[3] = ns.startingtime;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 17*60+7; //Tomoko Fuse
	var Tomoko_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 17*60+17.6;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 18*60+4; //why an architect
	ns.slide_number = bucky_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 18*60+6; //can help with polio
	ns.slide_number = polio_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 18*60+8; //an origamist
	ns.slide_number = Tomoko_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 18*60+10; //HIV
	ns.slide_number = HIV_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 18*60+13; //islamic artist
	ns.slide_number = islamic_dome_index;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 18*60+17; //zika
	ns.slide_number = zika_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 18*60+19.7; //measles
	var Measles_slide = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 18*60+45; //all models
	var all_models_slide = ns.slide_number; 
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 19*60+5; //golden spiral
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 19*60+9.8; //nautilus
	Story_states.push(ns);

//	ns = default_clone_story_state(1);
//	ns.startingtime = 19*60+12; //combined
//	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 19*60+26; //first virus picture
	ns.slide_number = first_virus_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 19*60+34; //Dad
	ns.slide_number = Dad_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 20*60+17.6; //back to measles
	ns.slide_number = Measles_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 20*60+31; //virus patterns
	ns.slide_number = all_models_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 20*60+34; //QS
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 20*60+42.4; //irreg
	ns.MODE = IRREGULAR_MODE;
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 20*60+49; //CK
	ns.MODE = CK_MODE;
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 21*60+5; //dodecahedron
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	
	
	
	

	for(var i = 0; i < Story_states.length; i++ )
		if(Story_states[i].slide_number !== -1 )
			Story_states[i].MODE = SLIDE_MODE;
	
	for(var i = 0; i < Story_states.length - 1; i++ )
		if( Story_states[i].startingtime >= Story_states[i+1].startingtime )
			console.error("bad starting time for number ", i);
}

var next_slide = 0;
//clone the previous state and give it a different time
function default_clone_story_state( shows_a_slide )
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
	
	new_story_state.irreg_open = -1;
	new_story_state.irreg_button_invisible = 0;
	new_story_state.unpause_on_vertex_knowledge = 0;
	
	//make it unused
	new_story_state.enforced_cutout_vector0_player = new THREE.Vector3(-1,0,0);
	
	new_story_state.unpause_on_rotation_knowledge = 0;
	
	new_story_state.irreg_open = -1;
	
	new_story_state.unpause_on_hepatitis_scale = 0;
	
	return new_story_state;
}