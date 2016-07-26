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
var reused_slide_indices = [];

function Update_story()
{	
	//first part of this function is all based on current state, which you don't have at the very start
	if(Storypage !== -1)
	{
		//could just give a million pause tokens, but this is pretty simple.
		if( Story_states[Storypage].prevent_playing )
			if(ytplayer.getPlayerState() === 1)// 1 means playing,not allowed (although maybe some people like to have order designated for them?)
				ytplayer.pauseVideo();
		
		if( Story_states[Storypage].unpause_on_vertex_knowledge && theyknowyoucanchangevertices && !isMouseDown )
			IrregButton.capsidopen = 0;
		if( Story_states[Storypage].unpause_on_vertex_knowledge && capsidopenness === 0 )
			ytplayer.playVideo();
		
		if( Story_states[Storypage].skip_on_rotation_knowledge && rotation_understanding >= 3 && !isMouseDown )
		{
			ytplayer.seekTo( 49 );
			our_CurrentTime = 49;
			ytplayer.playVideo();
		}
		
		if( Story_states[Storypage].unpause_after !== -1)
		{
			unpause_timer += delta_t;
			if( unpause_timer >= Story_states[Storypage].unpause_after )
			{
				unpause_timer = 0;
				ytplayer.playVideo();
			}
		}
		
		console.log(Story_states[Storypage].pause_at_end)
		//if you're about to move on from a state that wants to be paused
		if( Story_states[Storypage].pause_at_end === 1 )
		{
			
			if( !used_up_pause && Story_states[Storypage + 1].startingtime < our_CurrentTime && our_CurrentTime < Story_states[Storypage + 2].startingtime )
			{
				ytplayer.pauseVideo();
				used_up_pause = 1;
				return;
			}
			if( ytplayer.getPlayerState() === 2 ) //we don't allow continuing
				return;
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
			
			if( Storypage > 0 && Story_states[Storypage - 1].pause_at_end === 1 && !used_up_pause )
				console.error("previous state had a pause that we didn't use");
			used_up_pause = 0; //reset with every page turned
			
			if( Story_states[Storypage].skip_ahead_to !== -1 ) //want to catch the state immediately
			{
				ytplayer.seekTo( Story_states[Storypage].skip_ahead_to );
				our_CurrentTime =Story_states[Storypage].skip_ahead_to;
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
	
	if( Story_states[Storypage].irreg_open === 1 )
		IrregButton.capsidopen = 1;
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

	//ytplayer.pauseVideo();
	//ytplayer.seekTo();
	
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
	
	if( Story_states[Storypage].MODE !== MODE )
		ChangeScene(Story_states[Storypage].MODE );
}

function init_story()
{	
	var ns; //new state
	
	Story_states.push({
		startingtime: -1, //this is just the prototype state, not really used!
		
		MODE: SLIDE_MODE,
		
		pause_at_end: 0, //at end because when you unpause it's usually a new thought
		unpause_after: -1,
		
		slide_number: -1,
		
		//TODO use this on, for example, transition from part 1 to 2
		skip_ahead_to: -1, //alternatively just edit the video. Don't skip back, we ascend through the states
		
		offer_virus_selection: 0,
		
		irreg_open: -1,
		irreg_button_invisible: 0,
		unpause_on_vertex_knowledge: 0,
		
		CK_scale_only: 0,
		
		skip_on_rotation_knowledge: 0,
		
		prevent_playing: 0 //could also use this to stop them from continuing if they haven't rotated bocavirus etc
	});
	
	ns = default_clone_story_state(1);
	ns.startingtime = 0.1; //zika virus
//	ns.skip_ahead_to = 455.5;//skips to wherever you like. Change the location of the button!
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 9.8; //hiv
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 19.4; //measles
	Story_states.push(ns);
	
	//---paragraph 2
	ns = default_clone_story_state(0);
	ns.startingtime = 34.5; //bocavirus appears, then pause
	ns.MODE = BOCAVIRUS_MODE;
	ns.pause_at_end = 1; //TODO handle the assurance.
	ns.skip_on_rotation_knowledge = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 40.2; //we sort of just want to skip this part
	ns.skip_ahead_to = 49;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 41.6; //assurance occurs
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	//----
	ns = default_clone_story_state(0);
	ns.startingtime = 49; //pneumonia
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 76.7; //Flash
	Story_states.push(ns);
	
	//-------TODO the designs comparison should look around the tree
//	ns = default_clone_story_state(0);
//	ns.startingtime = 93.7; //pause again?
//	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 104.8; //golf balls TODO footballs
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 106.25; //that look like viruses
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 107.7; //origami is weak, should take something more useful. Greenhouse is the other thing you mention
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 109.7; //that look like viruses
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 112.2; //religious art
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 114.8; //that look like viruses (HPV)
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 135.6; //end of part 1
	ns.skip_ahead_to = 140.6;
	Story_states.push(ns);
	
	//----Part 2. Much will happen, in another function
	ns = default_clone_story_state(0);
	ns.startingtime = 140.6; //beginning of part 2
	ns.MODE = BOCAVIRUS_MODE;
	ns.pause_at_end = 1;
	ns.unpause_after = 9.5;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 163.6; //you'll need to unpause me manually
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 168.15; //further description of cell
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 196.1; //cell with fluourescence
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 220.3; //back to DNA. DNA mimics what you do?
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 254.8; //cell full of viruses
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 259.3; //lysis
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 265.8; //back to DNA
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
//	ns = default_clone_story_state(0);
//	ns.startingtime = 276.2; //twelve pentagons flash?
//	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 289.4; //Tree
	ns.MODE = TREE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 298; //pause on here until they click
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	//-----------IRREG BEGINS
	ns = default_clone_story_state(1);
	ns.startingtime = 302.9; //irreg begins, HIV shown
	Chapter_start_times[0] = ns.startingtime + 0.01;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 321.7; //monkeys. then picture of a molecule?
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 338.7; //different HIVs
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 348.3; //irreg appears
	ns.MODE = IRREGULAR_MODE;
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 354.7; //open irreg then (pause)
	ns.irreg_open = 1;
	ns.pause_at_end = 1;
	ns.irreg_button_invisible = 1;
	ns.unpause_on_vertex_knowledge = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 358.6; //try changing it further using...
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 361.7; //...this switch. Try making this virus, then (pause)
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 370.5; //other viruses come in then (pause)
	ns.offer_virus_selection = 1;
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 382.1; //stuff about model
	ns.offer_virus_selection = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 417.3; //open, prove me wrong
	ns.offer_virus_selection = 1;
	ns.irreg_open = 1;
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 429.8; //tree
	ns.offer_virus_selection = 1;
	ns.MODE = TREE_MODE;
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	//------CK BEGINS
	ns = default_clone_story_state(1);
	ns.startingtime = 434.6; //start of CK - hepatitis TODO line up CK with it
	Chapter_start_times[1] = ns.startingtime + 0.01;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 445.7; //bring in CK then (pause)
	ns.MODE = CK_MODE;
	ns.pause_at_end = 1;
	ns.CK_scale_only = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 455.6; //suggest the rotation and making cauliomaviridae then (pause)
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 473.5; //chat about golf ball
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 497.2; //greenhouse
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 510; //other CK example. May want, say, electroncephalogram for the "so were these designs inspired?"
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 524.6; //Bucky
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 531.5; //earlier sources
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 535.5; //first image of a virus
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 545.7; //back to CK
	ns.MODE = CK_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 555.1; //pics appear in CK then (pause)
	ns.offer_virus_selection = 1;
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 560; //tree
	ns.MODE = TREE_MODE;
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	//----------QS BEGINS!!!!!
	ns = default_clone_story_state(1);
	ns.startingtime = 565; //zika virus
	Chapter_start_times[2] = ns.startingtime + 0.01;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 578.4; //QS, Try it out, (pause)
	ns.MODE = QC_SPHERE_MODE;
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0); //the proteins go on the corners
	ns.startingtime = 581.5;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 589.4; //corners flash
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 591.3; //edges flash then try making HPV (pause) You know it'll only be through trial and error :(
	ns.pause_at_end = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 612.2; //just QS
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 622.3; //darb e imam shrine
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 628.1; //above its entrance
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 632.7; //more inside (2?)
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 638.3; //pentagons added
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 643.5; //triangles
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 644.4; //squares
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 645.1; //hexagons
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 646.5; //pentagons don't fit together
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 652.6; //unsatisfying pattern
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 658.9; //Back to Darb e inside
	ns.slide_number = reused_slide_indices[0];
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 674.7; //QS back. Compare it with this pattern, then (pause)
	ns.MODE = QC_SPHERE_MODE;
	ns.pause_at_end = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 682.5; //QS back
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 683.3;
	ns.MODE = TREE_MODE;
	ns.prevent_playing = 1;
	Story_states.push(ns);

	//------ENDING BEGINS!!!!
	ns = default_clone_story_state(0);
	ns.startingtime = 687.7; //Start of end - keep the tree?
	Chapter_start_times[3] = ns.startingtime + 0.01;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 693; //irreg
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 752.7; //origami is a good analogy
	Story_states.push(ns);

	//maaaassive gap
	ns = default_clone_story_state(1);
	ns.startingtime = 795.6; //super dodecahedral virus
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 838.9; //Bucky
	ns.slide_number = 18;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 840.8; //back to religious art
	ns.slide_number = 22;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 843.4; //back to Semliki
	ns.slide_number = 15;
	Story_states.push(ns);

	//------dark side
	ns = default_clone_story_state(1);
	ns.startingtime = 849.6; //Golden spiral
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 859.3; //mona lisa
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 867.8; //back to oldest picture of a virus
	ns.slide_number = 20;
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 880.2; //measles
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 890; //canvas retract
	ns.MODE = SLIDE_MODE;
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
	
	new_story_state.skip_ahead_to = -1;
	
	new_story_state.prevent_playing = 0;
	
	new_story_state.pause_at_end = 0;
	new_story_state.unpause_after = -1;
	
	new_story_state.startingtime += default_page_duration;
	
	new_story_state.irreg_open = -1;
	new_story_state.irreg_button_invisible = 0;
	new_story_state.unpause_on_vertex_knowledge = 0;
	
	new_story_state.skip_ahead_to = -1;
	
	new_story_state.skip_on_rotation_knowledge = 0;
	
	new_story_state.CK_scale_only = 0;
	
	return new_story_state;
}

/*
 * 0
 * 9.8
 * 19.4
 * 
 * 34.5 bocavirus appears
 * 41.6 pause to let them rotate
 * 45.8 assurance
 * 
 * 53.1 Pneumonia
 * 80.9 Flash
 * 
 * 93.7 pause again
 *    Also show zika measles hiv hepatitis 
 * 108.9 golf balls
 * 111.8 origami
 * 115.9 religious art
 * 
 * 139.5 end of part 1
 * 144.5 beginning of part 2
 * 146 start shrinking
 * 163.6 zoom in on cell 
 * 171 polymerase
 * 174 random protein
 * 177 MC1R
 * 
 * 186.5 fade back to viruses
 * 188.8 absorb (?)
 * 192.8 zoom in on bocavirus
 * 195 proteins dissolve
 * 
 * 210.4 (pause) then "you'll need to unpause me manually" 
 * 
 * 215 (pause) then polymerase and transcriptase
 * 229.7 back to boca
 * 237 back to enzymes
 * 253.2 cell with fluourescence
 * 
 * 287.2 back to DNA. DNA mimics what you do?
 * 
 * 311.6 cell full of viruses
 * 316.4 lysis
 * 
 * 325.5 back to DNA
 * 
 * 333.1 twelve pentagons flash?
 * 
 * 340.2 Tree
 * 350.5 Tree clickable
 * 357 pause on here until they click
 * 
 * 360 irreg begins
 * 
 * 378.3 monkeys
 * picture of a molecule?
 * 396.9 different HIVs
 * 
 * 405.8 irreg appears
 * 412.3 open irreg
 * 415.95 (pause) then try changing it again using
 * 418.6 switch appears
 * 427.65 (pause) then other viruses come in
 * 
 * 439.3 (pause)
 * 
 * 487 pause on this white
 * 
 * 492 start of CK - hepatitis
 * 508.2 replace (lined up!) with CK
 * 512.8 (pause)
 * 530.6 pause
 * 
 * 553.6 greenhouse
 * 566.5 other CK examples
 * 
 * 583.4 Bucky
 * 588.6 earlier sources
 * 592.8 first image of a virus
 * 603.1 back to CK
 * 613.8 pics appear in CK
 * 621.6(pause) let player play
 * 621.7(pause again) tree
 * 
 * 621.8 zika virus
 * 635.8 QS
 * 646.5 corners flash?
 * 648.5 edges flash?
 * 669.4 (pause) just QS
 * 
 * 679.4 Whichever shrine you use
 * 684.7 above its entrance
 * 690 more inside (2?) 
 * 693.7 freeze on whichever pic you've finished with
 * 699.5 patterns made of squares and triangles
 * 703.6 pentagons don't fit together
 * 708.6 unsatisfying pattern
 * 715.8 The shrine's pattern
 * 731.3 QS back
 * 
 * 745 Start of end (the three models)
 * 750.1 irreg
 * 855.4 phi29 next to the nanotube
 * 862.9 super dodecahedral virus
 * 895.8 Bucky
 * 898 islamic art
 * 900.3 HPV x-ray
 * 906.9 Golden spiral
 * 915.7 some crappy example, mona lisa maybe
 * 924.9 back to oldest picture of a virus
 * 937.3 measles
 * 947.2 canvas retracts
 */