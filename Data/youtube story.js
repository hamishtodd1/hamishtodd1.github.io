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
//	console.log(our_CurrentTime)
	for(var i = 0; i < Story_states.length; i++)
	{
		//if you're on the nose of the state's startingtime, you're in that state
		if(	Story_states[i].startingtime <= our_CurrentTime && 
		  ( i === Story_states.length - 1 || our_CurrentTime < Story_states[i+1].startingtime ) )
		{
			if( Storypage === i ) //nothing need be done
				return;
			
			Storypage = i;
			break;
		}
		
		if( i === Story_states.length - 1 )
			console.error("no story state found for current time")
	}
	
	//slide can be a video or an image
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
	 * -dodecahedron faces flash
	 * -tree
	 * 
	 * -trigger the closing of the surface and the appearance of the button
	 * 
	 * -canvas shrinks away
	 * 
	 * -QS edges and vertices flash?
	 * -dodeca can appear on QS?
	 * 
	 * -you do need to bring in the arrow into CK and QS too
	 * -more objects in CK
	 */
	
	offer_virus_selection = Story_states[Storypage].offer_virus_selection;
	if( Story_states[Storypage].MODE !== MODE )
		ChangeScene(Story_states[Storypage].MODE );
}

function init_story()
{	
	var ns;
	
	Story_states.push({
		startingtime: -1, //this is just the prototype state, not really used!
		
		MODE: SLIDE_MODE,
		
		pause_at_end: 0, //at end because when you unpause it's usually a new thought
		unpause_after: -1,
		
		slide_number: -1,
		
		offer_virus_selection: 0,
	});
	
	//we will be switching to NOTHING_MODE for single slides
	
	ns = default_clone_story_state(1);
	ns.startingtime = 0; //zika virus
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 9.8; //hiv
	Story_states.push(ns);
	
	ns = default_clone_story_state(1);
	ns.startingtime = 19.4; //measles
	Story_states.push(ns);
	
	//---paragraph 2
	ns = default_clone_story_state(0);
	ns.startingtime = 34.5; //bocavirus appears
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 41.6; //pause to let them rotate
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 45.8; //assurance
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
	ns.startingtime = 139.5; //end of part 1
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
	
	//------
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
	ns.startingtime = 195; //proteins dissolve
	Story_states.push(ns);
	
	//----
	ns = default_clone_story_state(0);
	ns.startingtime = 210.4; //(pause)
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
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 350.5; //Tree clickable
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 357; //pause on here until they click
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
	ns.startingtime = 405.8; //irreg appears
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 412.3; //open irreg
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 415.95; //(pause) then try changing it again using
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 418.6; //switch appears
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 427.65; //(pause) then other viruses come in
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 439.3; //(pause) then 
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 487; //pause on this white
	Story_states.push(ns);
	
	//------CK BEGINS
	ns = default_clone_story_state(1);
	ns.startingtime = 492; //start of CK - hepatitis TODO get it
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 508.2; //TODO line up CK with it
	ns.MODE = CK_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 512.8; //(pause)
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 530.6; //pause
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
	ns.startingtime = 613.8; //pics appear in CK
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 621.6; //(pause) let player play
	Story_states.push(ns);
	
	ns = default_clone_story_state(0);
	ns.startingtime = 621.7; //(pause again) tree
	Story_states.push(ns);
	
	//----------QS BEGINS!!!!!
	ns = default_clone_story_state(1);
	ns.startingtime = 621.8; //zika virus
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 635.8; //QS
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 646.5; //corners flash
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 648.5; //edges flash
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 669.4; //(pause) just QS
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
	Story_states.push(ns);

	ns = default_clone_story_state(0);
	ns.startingtime = 947.2; //canvas retract
	Story_states.push(ns);
	
	/*
	 * todo: 
	 * -auto-unpause with triggers
	 * -"absorb"
	 * -zoom in, out on bocavirus, and move it
	 * -DNA mimics what you do?
	 * -twelve pentagons flash?
	 * -QS points and edges flash?
	 * -fuckin' tree. Though you don't precisely need it to be a tree yet, just hepa zika hiv measles clickable
	 * 
	 */
	

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