var Storypage = -1; //set to a silly number initially so we know that the first page will be triggered.

var Story_states = [];

var Camera_intended_position = new THREE.Vector3();

function Update_story()
{	
	for(var i = 0; i < Story_states.length; i++)
	{
		//if you're on the nose of the state's endingtime, you're in that state
		if(	video.currentTime <= Story_states[i].endingtime && 
		  ( i === 0 || Story_states[i-1].endingtime < video.currentTime ) )
		{
			if( Storypage === i ) //nothing need be done
				return;
			
			Storypage = i;
			break;
		}
		
		if( i === Story_states.length - 1 )
			console.error("no story state found for current time")
	}
		
	if(Story_states[Storypage].ComicPresent)
		Scene.add(ComicZone);
	else
		Scene.remove(ComicZone);
	
	if(Story_states[Storypage].GraphPresent)
		Scene.add(Graph);
	else
		Scene.remove(Graph);
	
	if(Story_states[Storypage].PhaseZonePresent)
		Scene.add(PhaseZone);
	else
		Scene.remove(PhaseZone);
	
	if(Story_states[Storypage].ParameterZonePresent)
		Scene.add(ParameterZone);
	else
		Scene.remove(ParameterZone);
	
	if(Story_states[Storypage].MoviePresent)
		Scene.add(movieScreen);
	else
		Scene.add(movieScreen);
	
	if( Story_states[Storypage].Automaton_enforced_state !== 666)
		reset_CA( Story_states[Storypage].Automaton_enforced_state );
	
	if(Story_states[Storypage].AutomatonPresent)
		for(var i = 0; i < automaton_width; i++)
			for(var j = 0; j < automaton_width; j++)
				ComicZone.add( automaton_faces[i*automaton_width+j] );
	else
		for(var i = 0; i < automaton_width; i++)
			for(var j = 0; j < automaton_width; j++)
				ComicZone.remove( automaton_faces[i*automaton_width+j] );
	
	ParameterZone.slidermode = Story_states[Storypage].slidermode;
	
	ComicFace.material.map = emojiitextures[Story_states[Storypage].ComicFace];
	if(Story_states[Storypage].ComicFace === 0)
		ComicFace.visible = false;
	else
		ComicFace.visible = true;
}

function init_story()
{	
	var newstate;
	
	//0
	Story_states.push({
		ComicFace:0, //nobody there
		ComicPresent: 1,
		AutomatonPresent: 0,
		AutomatonRunning: 0,
		Automaton_people_die: 0,
		Automaton_enforced_state: 0,
		GraphPresent: 0, 
		ParameterZonePresent: 0, 
		PhaseZonePresent: 0,
		MoviePresent: 1,
		slidermode: 1,
		endingtime: 1});
	
	
	//Have "clearance" at the start of every paragraph?
	//----paragraph 1
	
//	newstate = default_clone_story_state();
//	newstate.ComicFace = EMOJII_SICK;
//	Story_states.push(newstate);
//	
//	newstate = default_clone_story_state();
//	newstate.ComicFace = EMOJII_RESISTANT;
//	Story_states.push(newstate);
//
//	newstate = default_clone_story_state();
//	newstate.ComicFace = EMOJII_SUSCEPTIBLE;
//	Story_states.push(newstate);
//
//	newstate = default_clone_story_state();
//	newstate.ComicFace = EMOJII_SICK;
//	Story_states.push(newstate);
//
//	newstate = default_clone_story_state();
//	newstate.ComicFace = EMOJII_RESISTANT;
//	Story_states.push(newstate);
	
	//-------Paragraph 2
//	newstate = default_clone_story_state();
//	newstate.AutomatonPresent = 1;
//	newstate.AutomatonRunning = 0;
//	Story_states.push(newstate);
//
//	newstate = default_clone_story_state();
//	newstate.Automaton_enforced_state = 1;
//	Story_states.push(newstate);
//
//	newstate = default_clone_story_state();
//	newstate.Automaton_enforced_state = 2;
//	Story_states.push(newstate);
//
//	newstate = default_clone_story_state();
//	newstate.Automaton_enforced_state = 3;
//	Story_states.push(newstate);
//
//	newstate = default_clone_story_state();
//	newstate.Automaton_enforced_state = 666;
//	newstate.AutomatonRunning = 1;
//	Story_states.push(newstate);
	
	//--------Paragraph 3
	newstate = default_clone_story_state();
	newstate.AutomatonPresent = 0;
	newstate.AutomatonRunning = 0;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.ComicFace = EMOJII_RESISTANT;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.ComicFace = EMOJII_DEAD;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.ComicFace = EMOJII_RESISTANT;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.ComicFace = EMOJII_SUSCEPTIBLE;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.AutomatonPresent = 1;
	newstate.ComicFace = 0;
	newstate.AutomatonRunning = 0;
	newstate.Automaton_enforced_state = 1;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.AutomatonRunning = 1;
	newstate.Automaton_people_die = 1;
	newstate.endingtime = 30;
	Story_states.push(newstate);
	//haven't debugged the above yet
	
	
	
	
	//ending, everything except video and automaton
	newstate = default_clone_story_state();
	newstate.endingtime = 9999999;
	newstate.ComicFace = 0; 
	newstate.ComicPresent = 1;
	newstate.AutomatonPresent = 0;
	newstate.GraphPresent = 1; 
	newstate.ParameterZonePresent = 1;
	newstate.PhaseZonePresent = 1;
	newstate.slidermode = 1;
	newstate.MoviePresent = 0;
	Story_states.push(newstate);
	
	for(var i = 0; i < Story_states.length - 1; i++ )
		if( Story_states[i].endingtime >= Story_states[i+1].endingtime )
			console.error("bad ending time for number ", i);
}

// same as the previous, with a different time
function default_clone_story_state()
{
	var new_story_state = {};
	
	for(var propt in Story_states[Story_states.length - 1]){
	    new_story_state[propt] = Story_states[Story_states.length - 1][propt];
	}
	
	new_story_state.endingtime++; //by default it's one second after
	
	return new_story_state;
}