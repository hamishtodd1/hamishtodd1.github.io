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
		
		if( Story_states[Storypage].prevent_playing )
			if(ytplayer.getPlayerState() === 1)// 1 means playing, not allowed (although maybe some people like to have order designated for them?)
				ytplayer.pauseVideo();
		
		if( Story_states[Storypage].unpause_on_vertex_knowledge && theyknowyoucanchangevertices && !isMouseDown )
			IrregButton.capsidopen = 0;
		
		if( Story_states[Storypage].unpause_on_vertex_knowledge && capsidopenness === 0 )
		{
			ytplayer.seekTo( vertex_knowledge_time );
			ytplayer.playVideo();
			//and loop back if they don't?
		}
		
		if( ( !Story_states[Storypage].rendererWidth && renderer.domElement.width !== 0 ) || ( Story_states[Storypage].rendererWidth && renderer.domElement.width !== renderer.domElement.height ) )
		{
			var newWidth = renderer.getSize().width / renderer.domElement.height;
			if( !Story_states[Storypage].rendererWidth )
				newWidth -= 0.1;
			else
				newWidth += 0.1;
			
			if(newWidth>1)
				newWidth = 1;
			else if(newWidth < 0 )
				newWidth = 0;
			
			onWindowResizeExceptYoutube(newWidth);
		}
		
		if( Story_states[Storypage].unpauseOn() )
			ytplayer.playVideo();
		
		if( Story_states[Storypage].loopBackTo !== -1 && ytplayer.getPlayerState() === 2 && Story_states[Storypage].shouldWeLoopBack() )
		{
			Story_states[Storypage].loopBackCountdown -= delta_t;
			if( Story_states[Storypage].loopBackCountdown < 0)
			{
				Story_states[Storypage].loopBackCountdown = 25;
				ytplayer.seekTo( Story_states[Storypage].loopBackTo );
				ytplayer.playVideo();
				Story_states[Storypage].used_up_pause = false;
				return;
			}
		}
		
		if( Story_states[Storypage].unpause_after !== -1 && ytplayer.getPlayerState() === 2)
		{
			unpause_timer += delta_t;
			if( unpause_timer >= Story_states[Storypage].unpause_after )
			{
				unpause_timer = 0;
				ytplayer.playVideo();
			}
		}
		
		//if you're about to move on from a state naturally
		if( Story_states[Storypage + 1].startingtime < our_CurrentTime && our_CurrentTime < Story_states[Storypage + 1].startingtime + 0.2 )
		{
			if( Story_states[Storypage].pause_at_end === 1 )
			{
				if( ytplayer.getPlayerState() === 2 ) //if you're paused, we don't let you past here
				{
					Story_states[Storypage].used_up_pause = true;
					return;
				}
				
				//we want to move on iff you've had the pause and you're no longer paused (i.e. the player paused you)
				if( !Story_states[Storypage].used_up_pause )
				{
					ytplayer.pauseVideo(); //this has a delayed reaction, we will continue asking for a pause until it has paused!
					return;
				}
			}
			
			//the player unpaused without doing what we wanted!
			if( Story_states[Storypage].shouldWeLoopBack() && ytplayer.getPlayerState() === 1 )
			{
				console.log("it's because we think they unpaused")
				Story_states[Storypage].loopBackCountdown = 0;
				ytplayer.seekTo( Story_states[Storypage].loopBackTo );
				ytplayer.playVideo();
				Story_states[Storypage].used_up_pause = false;
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
	
	surface.material.color.copy( Story_states[Storypage].CK_surface_color );
	
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
	
	if( Story_states[Storypage].CK_scale !== 666 )
		LatticeScale = Story_states[Storypage].CK_scale;
	if( Story_states[Storypage].CK_angle !== 666 )
		LatticeAngle = Story_states[Storypage].CK_angle;
	
	minimum_angle_crapifier = Story_states[Storypage].minimum_angle_crapifier;
	
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

	if(Story_states[Storypage].slide_number !== -1 )
	{
		scene.add( slideObjects[ Story_states[Storypage].slide_number ] );
		if( Storypage > 0 && Story_states[Storypage-1].slide_number !== -1) {
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
	//we're going to force ourselves into the situation we expect
	if( Story_states[Storypage].unpause_on_vertex_knowledge )
	{
		theyknowyoucanchangevertices = 0; //suuuuure about doing that?
		if(capsidopenness === 0 )
			capsidopenness += 0.0001;
	}
	
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
	function defaultshouldWeLoopBack() {return false;}
	
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
		
		shouldWeLoopBack: defaultshouldWeLoopBack,
		loopBackTo: -1, //If you don't do the thing, or try to unpause, it will loop back
		loopBackCountdown: 0,
		used_up_pause: false,
		
		CK_scale_only: 0,
		
		fadePicture: false,
		
		sphericality: 0,
		persistentLattice: false,
		
		chapter: 0,
		
		minimum_angle_crapifier: 1,
		
		wedgesOpacity: 0,
		
		CK_scale: 666,
		CK_angle: 666,
		
		unpauseOn: defaultUnpauseOn,
		
		rendererWidth: 1,
		
		enforced_cutout_vector0_player: new THREE.Vector3(-1,0,0),
		
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
		
		new_story_state.offer_virus_selection = 0; //in general
		
		new_story_state.go_to_time = -1;
		
		new_story_state.prevent_playing = 0;
		
		new_story_state.sphericality = 0;
		new_story_state.persistentLattice = false;
		
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
		
		new_story_state.unpause_on_hepatitis_scale = 0;
		
		new_story_state.unpauseOn = defaultUnpauseOn;
		new_story_state.shouldWeLoopBack = defaultshouldWeLoopBack;
		new_story_state.loopBackTo = -1;
		
		new_story_state.enforced_irreg_state = -1;
		
		new_story_state.rendererWidth = 1;
		
		new_story_state.enforced_CK_quaternion = new THREE.Quaternion(5,5,5,5);
		new_story_state.enforced_irreg_quaternion = new THREE.Quaternion(5,5,5,5);
		
		new_story_state.startingtime = ST;
		
		return new_story_state;
	}
	
//	ns = default_clone_story_state(0,0.1);
//	ns.MODE = CK_MODE;//QC_SPHERE_MODE IRREGULAR_MODE
////	ns.persistentLattice = true;
//	ns.prevent_playing = true;
//	Story_states.push(ns);
	
	//for testing touch
//	ns = default_clone_story_state(0,0.1);
//	ns.MODE = CK_MODE;
//	Story_states.push(ns);
//	ns = default_clone_story_state(0,2);
//	ns.MODE = QC_SPHERE_MODE;
//	Story_states.push(ns);
//	ns = default_clone_story_state(0,4);
//	ns.MODE = IRREGULAR_MODE;
//	Story_states.push(ns);
	
	//only by clicking on the tree do you change chapter
	ns = default_clone_story_state(1,0.1);
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,12.2); //hiv
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,21.6); //measles
	var Dad_slide = ns.slide_number;
	Story_states.push(ns);
	
	//---paragraph 2
	ns = default_clone_story_state(0,40.6); //bocavirus appears, then pause
	ns.MODE = BOCAVIRUS_MODE;
	Chapter_start_times[0] = ns.startingtime;
	ns.pause_at_end = 1; //TODO handle the assurance.
	ns.loopBackTo = 43.9;
	ns.loopBackCountdown = 7;
	ns.shouldWeLoopBack = function() {if( rotation_understanding === 0 ) return true; else return false }
	ns.unpauseOn = function() {if( rotation_understanding >= 2 && !isMouseDown ) return true; else return false;}
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,49.2); //unpause
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,51.5); //harmless rash
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,58); //miscarriage
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,63); //back
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,70); //color
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
	unflash_time = ns.startingtime;
	cornucopia_end_time = ns.startingtime;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,115.7); //rota
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
	Story_states.push(ns);

	whole_thing_finish_time = 188;
	
	ns = default_clone_story_state(0,190); //back to boca
	ns.MODE = BOCAVIRUS_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,194.2); //retract canvas
	ns.rendererWidth = 0;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,236.9); //canvas comes out again
	ns.rendererWidth = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,238.4); //human
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,271.2); //cell full of viruses
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,276.9); //lysis
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,287.2); //picture of boca
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,294); //Tree
	ns.MODE = TREE_MODE;
	ns.pause_at_end = 1;
	ns.loopBackTo = 302.8;
	ns.loopBackCountdown = 8;
	ns.shouldWeLoopBack = function() { return true;}
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,308.8);
	ns.loopBackTo = 302.8;
	ns.shouldWeLoopBack = function() { return true;}
	Story_states.push(ns);
	
	//------CK BEGINS
	ns = default_clone_story_state(1,0); //polio
	Chapter_start_times[1] = ns.startingtime;
	ns.chapter = 1;
	var polio_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,3); //rhinovirus comparison
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,6); //hep A comparison
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,9); //hep B comparison
	Story_states.push(ns);

	ns = default_clone_story_state(1,44.7); //small polio to introduce model. Above is the moving around stuff
	var small_polio_slide = ns.slide_number;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,48); //polio in model, no lattice
	ns.MODE = CK_MODE;
	ns.CK_surface_color = new THREE.Color( 0.89411764705, 0.9725490196, 0.53725490196 );
	ns.enforced_CK_quaternion.set( -0.26994323284634125, -0.0024107795577928506, -0.000379635156398864, 0.9628731458813965 );
	ns.irreg_button_invisible = 1;
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

	ns = default_clone_story_state(1,71.7); //football
	Story_states.push(ns);

	ns = default_clone_story_state(0,76.6); //back
	ns.enforced_CK_quaternion.set( -0.26994323284634125, -0.0024107795577928506, -0.000379635156398864, 0.9628731458813965 );
	Story_states.push(ns);

	ns = default_clone_story_state(0,85.9); //open it up
	ns.capsid_open = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,95.5); //lattice appears
	ns.pause_at_end = 1;
	lattice_fadein_time = ns.startingtime;
	ns.CK_scale_only = 1;
	ns.unpause_after = 16;
	Story_states.push(ns);

	ns = default_clone_story_state(0,106.5); //advice TODO
	ns.go_to_time = 864.1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,109); //Now let us say that...
	ns.CK_surface_color = new THREE.Color( 0.11764705882352941, 0.9882352941176471, 0.9529411764705882 );
	ns.pentamers_color = new THREE.Color( 0 / 256, 13 / 256, 194 / 256 ),
	ns.hexamers_color = new THREE.Color( 0 / 256, 187 / 256, 253 / 256 ),
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,109); //separate orientation and scale?
	ns.CK_scale = 0.28867512192027667;
	ns.CK_angle = 5.75958653833226;
	Story_states.push(ns);

	ns = default_clone_story_state(0,113.5); //wrap it up
	ns.capsid_open = 0;
	ns.CK_scale_only = 0;
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
	
	ns = default_clone_story_state(0,136); //"this shape". Could do more here.
	ns.capsid_open = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,141.9); //bring in button
	ns.irreg_button_invisible = 0;
	ns.pause_at_end = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(0,144.2); //the reason they look this way
	Story_states.push(ns);

	ns = default_clone_story_state(0,161.1); //spherical pattern
	Story_states.push(ns);

	ns = default_clone_story_state(0,163.7); //"just hexagons". Hexagons flash
	Story_states.push(ns);

	ns = default_clone_story_state(0,166.1); //"need a few pentagons". Pentagons flash
	ns.pentamers_color = new THREE.Color( 1, 0, 0 );
	Story_states.push(ns);

	ns = default_clone_story_state(0,163.7); //always nee
	ns.capsid_open = 1;
	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,189.4); //pentagon flash back
//	ns.pentamers_color = new THREE.Color( 0 / 256, 13 / 256, 194 / 256 ),
//	ns.pause_at_end = 1;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(1,191.2); //simple to assemble
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(1,194.4); //examples start
//	var football_slide = ns.slide_number;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(1,200.7); //geodesic building
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(1,207.2); //epcot virus
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(1,211.5); //bucky
//	var bucky_slide = ns.slide_number;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(1,220); //thai basket
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(1,223); //hairstyle
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,226.3); //bucky
//	ns.slide_number = bucky_slide;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,228.3); //first virus (Rayment haha)
//	var first_virus_slide = ns.slide_number;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,239.1); //patterns on viruses
	ns.MODE = CK_MODE;
//	Story_states.push(ns);
	
	ns = default_clone_story_state(0,241.7); //instantly recognized
	ns.sphericality = 1;
//	Story_states.push(ns);
//	
//	//TODO a dome and a virus side by side or whatever
//	
//	ns = default_clone_story_state(0,248.5); //back to normal for final polio
//	ns.MODE = CK_MODE;
	ns.CK_scale = 0.5773502438405532;
	ns.CK_angle = -0.5235987753305861;
//	ns.capsid_open = 0;
//	Story_states.push(ns);

//	ns = default_clone_story_state(1,253); //fade to polio
	ns.slide_number = small_polio_slide;
//	Story_states.push(ns);
	
	ns = default_clone_story_state(0,258.5); //back to tree
	ns.MODE = TREE_MODE;
	ns.prevent_playing = 1;
	Story_states.push(ns);
	
	//-----------IRREG BEGINS
	ns = default_clone_story_state(1,0); //irreg begins, HIV shown 
	ns.chapter = 2;
	var HIV_slide = ns.slide_number;
	Story_states.push(ns);

	ns = default_clone_story_state(1,12); //different HIVs
	var different_HIVs_index = ns.slide_number; 
	Story_states.push(ns);

	ns = default_clone_story_state(0,18.8); //irreg appears
	ns.enforced_irreg_quaternion.set( 
			-0.4744018551980526,0.024453317552284186,0.045298357905429784, 0.878802010589646 );
	ns.MODE = IRREGULAR_MODE;
	ns.capsid_open_immediately = 0;
	ns.irreg_button_invisible = 1;
	Story_states.push(ns);

	ns = default_clone_story_state(1,25.4); //very icosahedron
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,29.8); //back
	ns.enforced_irreg_quaternion.set( -0.4744018551980526,0.024453317552284186,0.045298357905429784, 0.878802010589646 );
	ns.MODE = IRREGULAR_MODE;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,30.4); //open irreg then (pause)
	ns.capsid_open = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,30.7); //this is here so we can enforce quaternion during wrap-up during pause. Er, what? Kinda guessing here
	ns.pause_at_end = 1;
	ns.unpause_on_vertex_knowledge = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,35.06); //And we have a new shape!
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,36.06); //wrap. Er... hopefully... TODO serious hack
	vertex_knowledge_time = ns.startingtime;
	ns.enforced_irreg_quaternion.set( -0.7096985308398929, 0.0742111650138679, 0.07616885252857324, 0.6964330580574571 );
	irreg_firstnewshape_story_state = Story_states.length;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,46.3); //button appears
	ns.irreg_button_invisible = 0;
	ns.pause_at_end = 1;
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,48.8); //One major source
	ns.slide_number = HIV_slide;
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,52.4); //monkeys
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,55.6); //protein
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,64); //drug
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,69.8); //microscope image
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,74.4); //model of microscope image
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,89.9); //phi29
	Story_states.push(ns);
	
	ns = default_clone_story_state(1,94.2); //phi29 model. TODO intermediate with highlighted corners
	Story_states.push(ns);
	
	ns = default_clone_story_state(0,64); //back to model
	ns.irreg_button_invisible = 1;
	ns.enforced_irreg_state = 3;
	ns.capsid_open_immediately = 1;
//	ns.MODE = IRREGULAR_MODE;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,69.8); //hiv in model
//	ns.enforced_irreg_state = 2;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,630.8); //HIV wraps up
//	ns.capsid_open = 0;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,642.1); //other modellers might want to make these
//	ns.slide_number = different_HIVs_index;
//	ns.irreg_button_invisible = 0;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,648.8); //potato virus
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,652); //emphasize corners
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,654); //abstract virus
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,658); //let them make it
//	ns.pause_at_end = 1;
//	ns.enforced_irreg_state = 3;
//	ns.MODE = IRREGULAR_MODE;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,664); //show the representation
//	ns.enforced_irreg_state = 1;
//	ns.enforced_irreg_quaternion.set( -0.6708576855670457,0.08188608649696437,0.0028127601848788432,0.7370459427973053 ); 
//	ns.capsid_open_immediately = 0; 
//	ns.irreg_button_invisible = 1;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,672); //we've noticed that when you open them out
//	ns.capsid_open = 1;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,674.2); //highlight cuts
//	irreg_flash_time = ns.startingtime;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,678); //wedges appear
//	ns.capsid_open = 1;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,686); //move a single corner... undefined behaviour?
//	ns.enforced_irreg_state = 4;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,691); //correct
//	ns.enforced_irreg_state = 5;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,693); //T4
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,695); //T4 in model
//	ns.irreg_button_invisible = 0;
//	ns.enforced_irreg_quaternion.set( -0.5216554828631857,-0.40506237503583453,-0.44657300762976543,0.603632817711505 );
//	ns.enforced_irreg_state = 0;
//	ns.capsid_open_immediately = 0;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,699.8); //before we move on (open up)
//	ns.capsid_open = 1;
//	ns.pause_at_end = 1;
//	Story_states.push(ns);
//	
//	
//	ns = default_clone_story_state(0,701.8); //story begins
//	ns.irreg_button_invisible = 1;
//	ns.wedgesOpacity = 0;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,705.6); //open it out
//	ns.capsid_open = 1;
//	Story_states.push(ns);
//	
//	//move corner around
//
//	ns = default_clone_story_state(0,715.6); //bad angles, close
//	ns.minimum_angle_crapifier = 0.965;
//	ns.capsid_open = 0;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,735.7); //close up properly
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,744.7); //christmas
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,747.1); //book
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,753.9); //book excerpt
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,762.1); //back to model
//	ns.MODE = IRREGULAR_MODE;
//	ns.capsid_open_immediately = 1;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,766.9); //closes again
//	ns.capsid_open = 0;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,775.9); //tree, or time to skip back to tree
//	ns.MODE = TREE_MODE;
//	ns.prevent_playing = 1;
//	Story_states.push(ns);
//
//	//----------QS BEGINS!!!!!
//	ns = default_clone_story_state(1,-0.1); //zika virus
//	var zika_slide = ns.slide_number; 
//	ns.chapter = 3;
//	Chapter_start_times[3] = ns.startingtime + 0.05;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,4.7); //bluetongue, or group
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,9.4); //QS, Try it out, (pause)
//	ns.MODE = QC_SPHERE_MODE;
////	10.4; //TODO loopbackto dependent on changed state
//	ns.pause_at_end = 1;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,14); //may not seem like a virus
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(1,19.5); //HPV
//	var HPV_slide = ns.slide_number; 
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(1,27.2); //HPV xray
//	ns.fadePicture = true;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(1,30.1); //HPV blobs
//	ns.fadePicture = true;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(1,44.5); //HPV connections
//	ns.fadePicture = true;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,51.9); //colored
//	ns.fadePicture = true;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,58.2); //back to model, then make hpv
//	ns.enforced_cutout_vector0_player.set(1.809016994374948, 1.4384360606445132, 0); //zika... probably should be a smaller one
//	ns.pause_at_end = 1;
//	ns.MODE = QC_SPHERE_MODE;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,60.8); //model was made 800 years ago
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,69.5); //islamic art #1
//	ns.slide_number = islamic_dome_index;
//	ns.fadePicture = false;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,73); //islamic art #2
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,75.6); //islamic art #3
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,77.7); //islamic art #4
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,80.3); //islamic art #5
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,83.5); //darb e imam shrine
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,84.8); //red box
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,91.9); //above entrance
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,95.4); //inside
//	var inside_darb_e_pic_index = ns.slide_number;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,103.1); //inside with pentagons
//	Story_states.push(ns);	
//	
//	ns = default_clone_story_state(1,105.4); //just pentagons
//	Story_states.push(ns);
//	
//	//TODO stuff here
//	
//	ns = default_clone_story_state(1,117.3); //rubbish pattern
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,123.2); //back to shrine
//	ns.slide_number = inside_darb_e_pic_index;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,143.9); //pause to play around and see resemblence
//	ns.go_to_time = 147.2;
//	ns.pause_at_end = 1;
//	ns.MODE = QC_SPHERE_MODE;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,158.9); //so why do viruses use these patterns?
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,162.2); //HPV in model
//	ns.enforced_cutout_vector0_player.set(0, 3.479306368947708, 0);
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,165.8); //drug
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,170); //but hpv can evolve
//	ns.MODE = QC_SPHERE_MODE;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,174.6); //smaller HPV (zika)
//	ns.enforced_cutout_vector0_player.set(1.809016994374948, 1.4384360606445132, 0);
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,199.5); //pic of zika
//	ns.slide_number = zika_slide;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,200.8);
//	ns.pause_at_end = 1;
//	ns.MODE = TREE_MODE;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,202);
//	ns.prevent_playing = 1;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,300);
//	Story_states.push(ns);
//	
////	//------ENDING BEGINS!!!!
////	//no canvas?
////	//15:35
////	ns = default_clone_story_state(1,1001.25); //Start of end
////	Chapter_start_times[4] = ns.startingtime;
////	var Measles_slide = ns.slide_number;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(1,1012.9); //Tomoko Fuse
//	var Tomoko_slide = ns.slide_number;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,1071);
//	ns.MODE = BOCAVIRUS_MODE;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,1104.6); //why an architect
//	ns.slide_number = bucky_slide;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,1106.7); //can help with polio
//	ns.slide_number = polio_slide;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,1109); //an origamist
//	ns.slide_number = Tomoko_slide;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,1111.1); //HIV
//	ns.slide_number = HIV_slide;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,1113.4); //islamic artist
//	ns.slide_number = islamic_dome_index;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,1116.5); //zika
//	ns.slide_number = zika_slide;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,1123.8); //measles
//	ns.slide_number = Measles_slide;
//	Story_states.push(ns);
//
////	ns = default_clone_story_state(1,18*60+45); //all models
////	var all_models_slide = ns.slide_number; 
////	Story_states.push(ns);
//
//	ns = default_clone_story_state(1,1139.3); //golden spiral
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(1,1143.7); //nautilus
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(1,1146.4); //combined
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,1162.2); //first virus picture
//	ns.slide_number = Measles_slide;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,1170.9); //Dad
//	ns.slide_number = Dad_slide;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,1200.5); //back to measles
//	ns.slide_number = Measles_slide;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,1224.7); //back to measles
//	ns.slide_number = first_virus_slide;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,1228.3); //irreg
//	ns.MODE = IRREGULAR_MODE;
//	ns.irreg_button_invisible = 1;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,1235.3); //QS
//	ns.MODE = QC_SPHERE_MODE;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,1243.6); //CK
//	ns.MODE = CK_MODE;
//	ns.irreg_button_invisible = 1;
//	Story_states.push(ns);
//
//	ns = default_clone_story_state(0,1262.1); //dodecahedron
//	ns.MODE = BOCAVIRUS_MODE;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,1276.7);
//	ns.slide_number = polio_slide;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,1286.7);
//	ns.slide_number = HIV_slide;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,1296.7);
//	ns.slide_number = Measles_slide;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,1306.7);
//	ns.slide_number = zika_slide;
//	Story_states.push(ns);
//	
//	ns = default_clone_story_state(0,1316.7);
//	ns.slide_number = first_virus_slide;
//	Story_states.push(ns);
	

	
	ns = default_clone_story_state(0,10000); //color
	Story_states.push(ns);
	ns = default_clone_story_state(0,20000); //color
	Story_states.push(ns);
	

	for(var i = 0; i < Story_states.length; i++ )
		if(Story_states[i].slide_number !== -1 )
			Story_states[i].MODE = SLIDE_MODE;
	
	for(var i = 0; i < Story_states.length - 1; i++ )
		if( Story_states[i].chapter === Story_states[i+1].chapter && Story_states[i].startingtime >= Story_states[i+1].startingtime )
			console.error("bad starting time for number ", i);
}

var next_slide = 0;
//clone the previous state and give it a different time
