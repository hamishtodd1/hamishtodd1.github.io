/*
 * 
 * Would be nice for the player to be able to mess around with time but still have it work. You want them to be able to come back
 * 
 * insane things can happen if the user goes to another tab and leaves it playing
 * 
 * Programming the triggers: make sure there’s no interdependence. 
 * Stuff can happen, but it’s a miniscule little thing that has no bearing on the deeper system beneath it
 * 
 * One deep bug is the fact that if they tab away and don't pause, the program isn't running so it can't be paused
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
		if( !EndingMusic.isPlaying)
			EndingMusic.play();
	
	if(Storypage !== -1) //first part of this function is all based on current state, which you don't have at the very start
	{
		if( Story_states[Storypage].prevent_playing )
			if(ytplayer.getPlayerState() === 1)// 1 means playing,not allowed (although maybe some people like to have order designated for them?)
				ytplayer.pauseVideo();
		
		if( Story_states[Storypage].unpause_on_vertex_knowledge && theyknowyoucanchangevertices && !isMouseDown )
			IrregButton.capsidopen = 0;
		
		if( Story_states[Storypage].unpause_on_vertex_knowledge && capsidopenness === 0 )
			ytplayer.playVideo();
		
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
			
			if( Story_states[Storypage].go_to_time !== -1 ) //want to catch the state immediately
			{
				ytplayer.seekTo( Story_states[Storypage].go_to_time );
				our_CurrentTime =Story_states[Storypage].go_to_time;
			}
			else
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
	
	if(Story_states[Storypage].close_up_badly)
		minimum_angle_crapifier = 0.965;
	else
		minimum_angle_crapifier = 1;
	
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
		correct_minimum_angles(flatnet_vertices.array);
	}
	
	//slide can be a video too maybe
	if(Story_states[Storypage].slide_number !== -1 )
	{
		VisibleSlide.material.map = slide_textures[ Story_states[Storypage].slide_number ];
		VisibleSlide.material.needsUpdate = true; //doesn't get there fast enough
	}
	//slide mode should really be an exceptional thing here
	if( Story_states[Storypage].MODE !== MODE )
		ChangeScene(Story_states[Storypage].MODE );
	
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
		unpause_after: -1, //but you only want it to unpause if it's the pause that YOU'VE done :P
		
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
		
		close_up_badly: 0,
		
		wedges_visible: false,
		
		CK_scale: 666,
		CK_angle: 666,
		
		unpause_on_rotation_knowledge: 0,
		
		enforced_cutout_vector0_player: new THREE.Vector3(-1,0,0),
		
		prevent_playing: 0 //could also use this to stop them from continuing if they haven't rotated bocavirus etc
	});
	
	ns = default_clone_story_state(1,0.1);
//	ns.go_to_time = 570; //skips to wherever you like 560 is HIV demo, 455.5 is CK
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,12.2); //hiv
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,21.6); //measles
	var Dad_slide = ns.slide_number;
	Story_states.push(ns);
	
	//---paragraph 2
	ns = default_clone_story_state(0,35.9); //bocavirus appears, then pause
	ns.MODE = BOCAVIRUS_MODE;
	Chapter_start_times[0] = ns.startingtime;
	ns.pause_at_end = 1; //TODO handle the assurance.
//	ns.unpause_after = 9.5; //want to 
	ns.unpause_on_rotation_knowledge = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,46.85); //bocavirus infects us
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,62.3); //color
	ns.pause_at_end = 1;
	flash_time = ns.startingtime;
	ns.unpause_after = 7.7;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,72.77); //click me when you want to continue
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	//-------TODO the designs comparison should look around the tree
	
	ns = default_clone_story_state(0,77.45); //other viruses
	cornucopia_start_time = ns.startingtime;
	Story_states.push(ns);
	
	//TODO picture of "ourselves", maybe assembling a dome
	
	ns = default_clone_story_state(1,101.1); //golf balls
	unflash_time = ns.startingtime;
	cornucopia_end_time = ns.startingtime;
	Story_states.push(ns);

	ns = default_clone_story_state(1,103); //that look like viruses
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,104.6); //todo buildings
	Story_states.push(ns);

	ns = default_clone_story_state(1,106.5); //that look like viruses
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,108.5); //religious art
	var islamic_dome_index = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1,113); //that look like viruses (HPV)
	Story_states.push(ns);
	
	
	
	//----Part 2
	ns = default_clone_story_state(0,127.9); //beginning of part 2, back to boca
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	movement_duration = 2.2;
	pullback_start_time = 133.9;
	cell_move_time = 147.2;
	boca_explosion_start_time = 152.2;
	whole_thing_finish_time = 160;
	new_pieces_appearance_time = 162;
	
	ns = default_clone_story_state(1,182.3); //cell with fluourescence
	Story_states.push(ns);

	whole_thing_finish_time = 188;
	
	ns = default_clone_story_state(0,193.1); //back to DNA. DNA mimics what you do?
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,282.7); //cell full of viruses
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,287.4); //lysis
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,294.5); //picture of boca
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,309.4); //Tree
	ns.MODE = TREE_MODE;
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,326.6);
	ns.prevent_playing = 1; //pause on here until they click
	Story_states.push(ns);
	
	//might need an assurance? Especially if they click on you
	
	//----------QS BEGINS!!!!!
	ns = default_clone_story_state(1,326.85); //zika virus
	var zika_slide = ns.slide_number; 
	Chapter_start_times[3] = ns.startingtime + 0.05;
	Story_states.push(ns);

	ns = default_clone_story_state(0,338.1); //QS, Try it out, (pause)
	ns.MODE = QC_SPHERE_MODE;
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,343.1); //may not seem like a virus
	Story_states.push(ns);

	ns = default_clone_story_state(1,350.3); //HPV
	Story_states.push(ns);

	ns = default_clone_story_state(1,357.6); //HPV xray
	Story_states.push(ns);

	ns = default_clone_story_state(1,361.2); //HPV blobs
	Story_states.push(ns);

	ns = default_clone_story_state(1,375.5); //HPV connections
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,381.4); //HPV connections
	Story_states.push(ns);

	ns = default_clone_story_state(0,386.8); //back to model
	ns.pause_at_end = 1;
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,392.2); //pause (at the beginning of this state) to play around with it
	Story_states.push(ns);

	ns = default_clone_story_state(0,402.1); //islamic holy building
	ns.slide_number = islamic_dome_index;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,405); //covered with patterns(square)
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,412.8); //triangle
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,416); //darb e imam shrine
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,423.05); //above entrance
	var inside_darb_e_pic_index = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,428); //inside
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,435.3); //inside with pentagons
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,437.8); //just pentagons
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,451.5); //rubbish pattern
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,459.4); //back to shrine
	ns.slide_number = inside_darb_e_pic_index;
	Story_states.push(ns);

	ns = default_clone_story_state(0,485.8); //back to model
	ns.pause_at_end = 1;
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,495.4); //pause to play around and see resemblence
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,506.6); //HPV in the model
	ns.enforced_cutout_vector0_player.set(0, 3.479306368947708, 0);
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,510.4); //drug
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,514.3); //back
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(0,521.7); //smaller HPV (zika)
	ns.enforced_cutout_vector0_player.set(1.809016994374948, 1.4384360606445132, 0);
	Story_states.push(ns);

	ns = default_clone_story_state(0,550.1); //pic of zika
	ns.slide_number = zika_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,552.1);
	var second_tree_advice_time = ns.startingtime;
	ns.go_to_time = 558.31;
	ns.pause_at_end = 1;
	//and come here after first chapter...
	ns.MODE = TREE_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,558.3);
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	//-----------IRREG BEGINS
	ns = default_clone_story_state(1,558.45); //irreg begins, HIV shown
	Chapter_start_times[2] = ns.startingtime;
	var HIV_slide = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1,571.2); //different HIVs
	var different_HIVs_index = ns.slide_number; 
	Story_states.push(ns);

	ns = default_clone_story_state(0,578.8); //irreg appears
	ns.MODE = IRREGULAR_MODE;
	ns.capsid_open_immediately = 0;
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,585.3); //open irreg then (pause)
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,586); //this is here so we can enforce quaternion during wrap-up during pause
	ns.pause_at_end = 1;
	ns.unpause_on_vertex_knowledge = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,590.2); //advice. If they move, we auto-unpause, go to irreg_firstnewshape_story_state. The others are not quite the same, we don't auto-unpause
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,596); //And we have a new shape!
	ns.enforced_irreg_quaternion.set( -0.7096985308398929, 0.0742111650138679, 0.07616885252857324, 0.6964330580574571 );
	irreg_firstnewshape_story_state = Story_states.length;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,600.9); //button appears
	ns.irreg_button_invisible = 0;
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,605.9); //One major source
	ns.slide_number = HIV_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,609.9); //monkeys
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,617.9); //very small (cone shaped hiv)
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,622.1); //back to model
	ns.irreg_button_invisible = 1;
	ns.enforced_irreg_state = 3;
	ns.capsid_open_immediately = 1;
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,626.9); //hiv in model
	ns.enforced_irreg_state = 2;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,630.8); //HIV wraps up
	ns.capsid_open = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,642.1); //other modellers might want to make these
	ns.slide_number = different_HIVs_index;
	ns.irreg_button_invisible = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,648.8); //potato virus
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,652); //emphasize corners
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,654); //abstract virus
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,658); //let them make it
	ns.pause_at_end = 1;
	ns.enforced_irreg_state = 3;
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,664); //show the representation
	ns.enforced_irreg_state = 1;
	ns.enforced_irreg_quaternion.set( -0.6708576855670457,0.08188608649696437,0.0028127601848788432,0.7370459427973053 ); 
	ns.capsid_open_immediately = 0; 
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,672); //we've noticed that when you open them out
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,674.2); //highlight cuts
	irreg_flash_time = ns.startingtime;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,678); //wedges appear
	ns.capsid_open = 1;
	ns.wedges_visible = true;
	Story_states.push(ns);
	
	//686 "move those corners around" TODO
	
	ns = default_clone_story_state(1,693); //T4
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,695); //T4 in model
	ns.irreg_button_invisible = 0;
	ns.enforced_irreg_quaternion.set( -0.5216554828631857,-0.40506237503583453,-0.44657300762976543,0.603632817711505 );
	ns.enforced_irreg_state = 0;
	ns.capsid_open_immediately = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,699.8); //before we move on (open up)
	ns.capsid_open = 1;
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	
	ns = default_clone_story_state(0,701.8); //story begins
	ns.irreg_button_invisible = 1;
	ns.wedges_visible = false;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,705.6); //open it out
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	//move corner around

	ns = default_clone_story_state(0,715.6); //bad angles, close
	ns.close_up_badly = 1;
	ns.capsid_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,735.7); //close up properly
	ns.close_up_badly = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,744.7); //christmas
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,747.1); //book
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,753.9); //book excerpt
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,762.1); //back to model
	ns.MODE = IRREGULAR_MODE;
	ns.capsid_open_immediately = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,766.9); //closes again
	ns.capsid_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,775.9); //tree, or time to skip back to tree
	ns.MODE = TREE_MODE;
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	
	//------CK BEGINS
	ns = default_clone_story_state(1,776.1); //polio
	Chapter_start_times[1] = ns.startingtime;
	var polio_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,781.7); //rhinovirus comparison
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,790.5); //hep A comparison
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,798.8); //hep B comparison
	Story_states.push(ns);

	ns = default_clone_story_state(1,821.3); //small polio to introduce model
	var small_polio_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,827.5); //polio in model, no lattice
	ns.MODE = CK_MODE;
	ns.CK_surface_color = new THREE.Color( 0.89411764705, 0.9725490196, 0.53725490196 );
	ns.enforced_CK_quaternion.set( -0.26994323284634125, -0.0024107795577928506, -0.000379635156398864, 0.9628731458813965 );
	//it's more than just this which is locking the surface in place
	ns.irreg_button_invisible = 1;
	ns.capsid_open = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,829.8); //back to small polio
	ns.slide_number = small_polio_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,832.3); //back to model
	ns.enforced_CK_quaternion.set( -0.26994323284634125, -0.0024107795577928506, -0.000379635156398864, 0.9628731458813965 );
	ns.MODE = CK_MODE;
	Story_states.push(ns);
	
	CK_showoff_time = 838.4; //polio shape turns a bit

	ns = default_clone_story_state(0,843); //open it up
	ns.capsid_open = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,850.55); //lattice appears
	ns.pause_at_end = 1;
	lattice_fadein_time = ns.startingtime;
	ns.unpause_on_hepatitis_scale = 1;
	ns.CK_scale_only = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,857.2); //advice TODO
	ns.go_to_time = 864.1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,864); //Now let us say that...
	ns.CK_surface_color = new THREE.Color( 0.11764705882352941, 0.9882352941176471, 0.9529411764705882 );
	ns.pentamers_color = new THREE.Color( 0 / 256, 13 / 256, 194 / 256 ),
	ns.hexamers_color = new THREE.Color( 0 / 256, 187 / 256, 253 / 256 ),
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,867.2); //we set it to precisely this size
	ns.CK_scale = 0.28867512192027667;
	ns.CK_angle = 5.75958653833226;
	Story_states.push(ns);

	ns = default_clone_story_state(0,870.1); //wrap it up
	ns.capsid_open = 0;
	ns.CK_scale_only = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(1,875.4); //rift valley fever pic
	Story_states.push(ns);

	ns = default_clone_story_state(0,879); //back to model
	ns.MODE = CK_MODE;
	ns.enforced_CK_quaternion.set( -0.21316178390455967, -0.4028820735877156, 0.385522836480786, 0.8022594538028792 );
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,883.8); //bring in button
	ns.capsid_open = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,889.5); //bring in button
	ns.irreg_button_invisible = 0;
	ns.pause_at_end = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,893.7); //the reason they look this way
	Story_states.push(ns);

	ns = default_clone_story_state(0,897.6); //hexagons are symmetrical TODO
	ns.MODE = HEXAGON_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(0,902.6); //hexagons can be made of pieces
	Hexagon_explosion_start_time = ns.startingtime;
	Story_states.push(ns);

	ns = default_clone_story_state(0,905.9); //hexagons tile
	hex_first_movement_start_time = ns.startingtime;
	Story_states.push(ns);

	ns = default_clone_story_state(0,911.6); //back to model. Or could have pentagons in demonstration?
	ns.MODE = CK_MODE;
	ns.capsid_open = 0;
	Story_states.push(ns);

	ns = default_clone_story_state(0,917); //pentagon flash
	ns.pentamers_color = new THREE.Color( 1, 0, 0 ),
	Story_states.push(ns);

	ns = default_clone_story_state(0,919); //pentagon flash back
	ns.pentamers_color = new THREE.Color( 0 / 256, 13 / 256, 194 / 256 ),
	ns.pause_at_end = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(1,930.3); //this is where we'd pause
	Story_states.push(ns);

	ns = default_clone_story_state(1,941.1); //ball
	var football_slide = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(0,946.5); //compare to polio
	ns.slide_number = polio_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,952.1); //compare to polio
	ns.slide_number = football_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(1,956.2); //geodesic building
	Story_states.push(ns);

	ns = default_clone_story_state(1,961.4); //Bucky
	var bucky_slide = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1,967.7); //thai basket
	Story_states.push(ns);

	ns = default_clone_story_state(1,970.8); //hairstyle
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,976.6); //first virus
	var first_virus_slide = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1,984.7); //hairstyle
	Story_states.push(ns);
	
	//TODO a dome and a virus side by side or whatever
	
	ns = default_clone_story_state(0,990.2); //back to model
	ns.MODE = CK_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,1001.1); //back to tree
	ns.MODE = TREE_MODE;
	ns.prevent_playing = 1;
	Story_states.push(ns);

	//------ENDING BEGINS!!!!
	//no canvas?
	//15:35
	ns = default_clone_story_state(1,1001.25); //Start of end
	Chapter_start_times[4] = ns.startingtime;
	var Measles_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,1012.9); //Tomoko Fuse
	var Tomoko_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,1071);
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,1104.6); //why an architect
	ns.slide_number = bucky_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,1106.7); //can help with polio
	ns.slide_number = polio_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,1109); //an origamist
	ns.slide_number = Tomoko_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,1111.1); //HIV
	ns.slide_number = HIV_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,1113.4); //islamic artist
	ns.slide_number = islamic_dome_index;
	Story_states.push(ns);

	ns = default_clone_story_state(0,1116.5); //zika
	ns.slide_number = zika_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,1123.8); //measles
	ns.slide_number = Measles_slide;
	Story_states.push(ns);

//	ns = default_clone_story_state(1,18*60+45); //all models
//	var all_models_slide = ns.slide_number; 
//	Story_states.push(ns);

	ns = default_clone_story_state(1,1139.3); //golden spiral
	Story_states.push(ns);

	ns = default_clone_story_state(1,1143.7); //nautilus
	Story_states.push(ns);

	ns = default_clone_story_state(1,1146.4); //combined
	Story_states.push(ns);

	ns = default_clone_story_state(0,1162.2); //first virus picture
	ns.slide_number = Measles_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,1170.9); //Dad
	ns.slide_number = Dad_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,1200.5); //back to measles
	ns.slide_number = Measles_slide;
	Story_states.push(ns);

	ns = default_clone_story_state(0,1224.7); //back to measles
	ns.slide_number = first_virus_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,1228.3); //irreg
	ns.MODE = IRREGULAR_MODE;
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,1235.3); //QS
	ns.MODE = QC_SPHERE_MODE;
	Story_states.push(ns);

	ns = default_clone_story_state(0,1243.6); //CK
	ns.MODE = CK_MODE;
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,1262.1); //dodecahedron
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