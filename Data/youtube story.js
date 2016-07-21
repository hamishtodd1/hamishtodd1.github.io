/*
 * Todo
 * Get video in
 * whole great big list of pages
 * 
 * Programming the triggers: make sure there’s no interdependence. 
 * Stuff can happen, but it’s a miniscule little thing that has no bearing on the deeper system beneath it
 */

var Storypage = -1; //set to a silly number initially so we know that the first page will be triggered.
var Story_states = [];

function Update_story()
{	
	//could just give a million pause tokens, but this is pretty simple.
	if( Storypage !== -1 && Story_states[Storypage].prevent_playing )
		if(ytplayer.getPlayerState() === 1)// 1 means playing,not allowed (although maybe some people like to have order designated for them?)
			ytplayer.pauseVideo();
	
	//if you're about to finish a state that wants to be paused. Number at the end is how close you want to be
	if( Storypage !== -1 && Storypage < Story_states.length - 1 
		&& Story_states[Storypage].pause_tokens > 0 && Story_states[Storypage + 1].startingtime - our_CurrentTime < 0.05 )
	{
		ytplayer.pauseVideo();
		Story_states[Storypage].pause_tokens--;
		return;
	}
	
	for(var i = 0; i < Story_states.length; i++)
	{
		//if you're on the nose of the state's startingtime, you're in that state
		if(	Story_states[i].startingtime <= our_CurrentTime && 
		  ( i === Story_states.length - 1 || our_CurrentTime < Story_states[i+1].startingtime ) )
		{
			if( Storypage === i ) //nothing need be done
				return;
			
			Storypage = i; //we change this now. The below may look confusing but it protects us in the case where the user is seeking.
			
			if( Storypage > 0 && Story_states[Storypage - 1].pause_tokens === 1 )
				console.error("previous state had a pause that we didn't use");
			
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
		

	//ytplayer.pauseVideo();
	//ytplayer.seekTo();
	
	/*
	 * List of things:
	 * -capsomer fadeout and flash are time-dependent
	 * -virus gets small and egg is next to it
	 * -virus goes into egg?
	 * -dodecahedron faces flash?
	 * 
	 * -trigger the closing of the surface and the appearance of the button
	 * 
	 * -canvas shrinks away?
	 * 
	 * -QS edges and vertices flash?
	 * -dodeca can appear on QS?
	 * 
	 * -you do need to bring in the arrow into CK and QS too
	 * -more objects in CK
	 *
	 * todo: 
	 * -auto-unpause with triggers
	 * -"absorb"
	 * -DNA mimics what you do?
	 * -QS points and edges flash?
	 * 
	 */
	
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
		
		pause_tokens: 0, //at end because when you unpause it's usually a new thought
		unpause_after: -1,
		
		slide_number: -1,
		
		skip_ahead_to: -1,
		
		offer_virus_selection: 0,
		
		prevent_playing: 0 //could also use this to stop them from continuing if they haven't rotated bocavirus etc
	});
	
	ns = default_clone_story_state(1);
	ns.startingtime = 0.1; //zika virus
	ns.skip_ahead_to = 146;//skips to wherever you like.
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
	ns.pause_tokens = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 40.2;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 45.8; //this is when the assurance occurs
	Story_states.push(ns);
	
	//----
	ns = default_clone_story_state(0);
	ns.startingtime = 53.1; //pneumonia
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 80.9; //Flash
	Story_states.push(ns);
	
	//----
	ns = default_clone_story_state(0);
	ns.startingtime = 93.7; //pause again
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 108.9; //golf balls
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 110.2; //that look like viruses
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 111.8; //origami, nanotube and phi29
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 113.3; //that look like viruses
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 115.9; //religious art
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 118.9; //that look like viruses (HPV)
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 139.5; //end of part 1. TODO skip ahead
	Story_states.push(ns);
	
	//----Part 2	
	ns = default_clone_story_state(0);
	ns.startingtime = 144.5; //beginning of part 2
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 146; //start shrinking
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 163.6; //zoom in on cell 
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 171; //polymerase
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 174; //random protein
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 177; //MC1R
	Story_states.push(ns);
	
	//------TODO EVERYTHING HERE!!!!!!!
	ns = default_clone_story_state(0);
	ns.startingtime = 186.5; //back to virus and cell
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 188.8; //absorb (?)
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 192.8; //zoom in on bocavirus
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 195; //proteins dissolve, then (pause)
	ns.pause_tokens = 1;
	Story_states.push(ns);
	
	//----
	ns = default_clone_story_state(0);
	ns.startingtime = 210.4; //Grab the DNA
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 215; //polymerase and transcriptase
	Story_states.push(ns);
	
//	ns = default_clone_story_state(0);
//	ns.startingtime = 229.7; //back to boca
//	ns.MODE = BOCAVIRUS_MODE;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0);
//	ns.startingtime = 237; //back to enzymes
//	ns.slide_number = next_slide - 1;
//	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 253.2; //cell with fluourescence
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 287.2; //back to DNA. DNA mimics what you do?
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 311.6; //cell full of viruses
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 316.4; //lysis
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 325.5; //back to DNA
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 333.1; //twelve pentagons flash?
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 340.2; //Tree
	ns.MODE = TREE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 357; //pause on here until they click
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	//-----------IRREG BEGINS
	ns = default_clone_story_state(1);
	ns.startingtime = 360; //irreg begins, HIV shown
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 378.3; //monkeys. then picture of a molecule?
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 396.9; //different HIVs
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 405.8; //irreg appears TODO sort out this
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 412.3; //open irreg then (pause)
	ns.pause_tokens = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 415.95; //bring in switch
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 418.6; //try making this virus (pause)
	ns.pause_tokens = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 427.65; //other viruses come in then (pause)
	ns.offer_virus_selection = 1;
	ns.pause_tokens = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 439.3; //stuff about model
	ns.offer_virus_selection = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 487; //tree
	ns.MODE = TREE_MODE;
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	//------CK BEGINS
	ns = default_clone_story_state(1);
	ns.startingtime = 492; //start of CK - hepatitis TODO line up CK with it
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 508.2; //bring in CK then (pause)
	ns.MODE = CK_MODE;
	ns.pause_tokens = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 512.8; //suggest the rotation and making cauliomaviridae then (pause)
	ns.pause_tokens = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 530.6; //chat about golf ball
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 553.6; //greenhouse
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 566.5; //other CK examples
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 583.4; //Bucky
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 588.6; //earlier sources
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 592.8; //first image of a virus
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 603.1; //back to CK
	ns.MODE = CK_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 613.6; //pics appear in CK then (pause)
	ns.offer_virus_selection = 1;
	ns.pause_tokens = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 617.5; //tree
	ns.MODE = TREE_MODE;
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	//----------QS BEGINS!!!!!
	ns = default_clone_story_state(1);
	ns.startingtime = 621.8; //zika virus
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 635.8; //QS, Try it out, (pause)
	ns.MODE = QC_SPHERE_MODE;
	ns.pause_tokens = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 638.5;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 646.5; //corners flash
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 648.5; //edges flash then try making HPV (pause)
	ns.pause_tokens = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 669.4; //just QS
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 679.4; //darb e imam shrine
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 684.7; //above its entrance
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 690; //more inside (2?)
	Story_states.push(ns);

//	ns = default_clone_story_state(0);
//	ns.startingtime = 693.7; //freeze the video (?) on whichever pic you've finished with
//	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 699.5; //triangles
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 701.5; //squares
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 702.2; //hexagons
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 703.6; //pentagons don't fit together
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 708.6; //unsatisfying pattern
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 715.8; //The shrine's pattern, back to Darb e inside
	ns.slide_number = 28;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 731.3; //QS back
	ns.MODE = QC_SPHERE_MODE;
	ns.pause_tokens = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 741;
	ns.MODE = TREE_MODE;
	ns.prevent_playing = 1;
	Story_states.push(ns);

	//------ENDING BEGINS!!!!
	ns = default_clone_story_state(0);
	ns.startingtime = 745; //Start of end (the three models)
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 750.1; //irreg
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 810; //origami is a good analogy
	Story_states.push(ns);

	//maaaassive gap
	ns = default_clone_story_state(1);
	ns.startingtime = 862.8; //super dodecahedral virus
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 895.8; //Bucky
	ns.slide_number = 22;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 898; //back to religious art
	ns.slide_number = 26;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 900.3; //back to Semliki
	ns.slide_number = 19;
	Story_states.push(ns);

	//------dark side
	ns = default_clone_story_state(1);
	ns.startingtime = 906.9; //Golden spiral
	console.log(ns.slide_number)
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 915.7; //mona lisa
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 924.9; //back to oldest picture of a virus
	Story_states.push(ns);

	ns = default_clone_story_state(1);
	ns.startingtime = 937.3; //measles
	ns.slide_number = 24;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 947.2; //canvas retract
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
	
	new_story_state.pause_tokens = 0;
	new_story_state.unpause_after = -1;
	
	new_story_state.startingtime += default_page_duration;
	
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