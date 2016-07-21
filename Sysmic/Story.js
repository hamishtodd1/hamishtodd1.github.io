var Storypage = -1; //set to a silly number initially so we know that the first page will be triggered.

var Story_states = [];

var Camera_intended_position = new THREE.Vector3();

var pausetimer = 0;

function Update_story()
{	
	pausetimer += delta_t;
	if( Storypage !== -1
		&& Story_states[Storypage].TimeTilUnpause !== 0 
		&& Story_states[Storypage].TimeTilUnpause < pausetimer )
		video.play();
	
	for(var i = 0; i < Story_states.length; i++)
	{
		//if you're on the nose of the state's startingtime, you're in that state
		if(	Story_states[i].startingtime <= video.currentTime && 
		  ( i === Story_states.length-1 || video.currentTime < Story_states[i+1].startingtime ) )
		{
			if( Storypage === i ) //nothing need be done
				return;
			
			Storypage = i;
			break;
		}
		
		if( i === Story_states.length - 1 )
			console.error("no story state found for current time")
	}
	
	if(Story_states[Storypage].Pause_on_start)
	{
		video.pause();
		if(Story_states[Storypage].TimeTilUnpause)
			pausetimer = 0;
	}
		
	if(Story_states[Storypage].FacesLabelled)
		ComicZone.add(FacesLabelMesh);
	if(Story_states[Storypage].RecoveryLabelled)
		ParameterZone.add(RecoveryTimeLabelMesh);
	if(Story_states[Storypage].InfectiousnessLabelled)
		ParameterZone.add(InfectiousnessLabelMesh);
		
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
	

	for(var i = 0; i < PhaseZoneArrows.length; i++ )
		if( Story_states[Storypage].VectorFieldPresent )
			PhaseZone.add(PhaseZoneArrows[i])
		else
			PhaseZone.remove(PhaseZoneArrows[i]);
	
	
	
	if( Story_states[Storypage].Automaton_enforced_state !== 666)
		reset_CA( Story_states[Storypage].Automaton_enforced_state );
	
	if(Story_states[Storypage].AutomatonPresent)
		for(var i = 0; i < automaton_faces.length; i++)
			ComicZone.add( automaton_faces[i] );
	else
		for(var i = 0; i < automaton_faces.length; i++)
			ComicZone.remove( automaton_faces[i] );
	
	ParameterZone.slidermode = Story_states[Storypage].slidermode;
	
	if( Story_states[Storypage].Infected !== -1 )
		Infected = Story_states[Storypage].Infected;
	if( Story_states[Storypage].Resistant !== -1 )
		Resistant = Story_states[Storypage].Resistant;
	
	ComicFace.material.map = ourtextures[Story_states[Storypage].ComicFace];
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
		ComicPresent: 0,
		
		AutomatonPresent: 0,
		AutomatonRunning: 0,
		Automaton_people_die: 0,
		Automaton_enforced_state: 0,
		
		FacesLabelled: 0,
		RecoveryLabelled: 0,
		InfectiousnessLabelled: 0,
		
		GraphPresent: 0,
		GraphMoving: 0,
		
		Infected: -1,
		Resistant: -1,
		
		ParameterZonePresent: 0,
		slidermode: 1,
		
		PhaseZonePresent: 0,
		VectorFieldPresent: 0,
		
		Pause_on_start: 0,
		TimeTilUnpause: 0,
		
		startingtime: 0});
	
	
	//-------Paragraph 1
	newstate = default_clone_story_state();
	newstate.ComicPresent = 1;
	newstate.ComicFace = EMOJII_SICK;
	newstate.startingtime = 12;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.ComicFace = EMOJII_RESISTANT;
	newstate.startingtime = 18.47;
	Story_states.push(newstate);

	newstate = default_clone_story_state();
	newstate.ComicFace = EMOJII_SUSCEPTIBLE;
	newstate.startingtime = 30;
	Story_states.push(newstate);

	newstate = default_clone_story_state();
	newstate.ComicFace = EMOJII_SICK;
	newstate.startingtime = 44.5;
	Story_states.push(newstate);

	newstate = default_clone_story_state();
	newstate.ComicFace = EMOJII_RESISTANT;
	newstate.startingtime = 47.3;
	Story_states.push(newstate);
	
	//-------Paragraph 2,
	newstate = default_clone_story_state();
	newstate.ComicFace = 0;
	newstate.AutomatonPresent = 1;
	newstate.AutomatonRunning = 0;
	newstate.FacesLabelled = 1;
	newstate.startingtime = 54;
	Story_states.push(newstate);

	newstate = default_clone_story_state();
	newstate.Automaton_enforced_state = 1;
	newstate.startingtime = 60;
	Story_states.push(newstate);

	newstate = default_clone_story_state();
	newstate.Automaton_enforced_state = 2;
	newstate.startingtime = 71;
	Story_states.push(newstate);

	newstate = default_clone_story_state();
	newstate.Automaton_enforced_state = 3;
	newstate.startingtime = 77.5;
	Story_states.push(newstate);

	newstate = default_clone_story_state();
	newstate.AutomatonRunning = 1;
	newstate.TimeTilUnpause = 9.6;
	newstate.Pause_on_start = 1;
	newstate.startingtime = 95;
	Story_states.push(newstate);
	
	//--------Paragraph 3, 
	newstate = default_clone_story_state();
	newstate.AutomatonPresent = 1;
	newstate.AutomatonRunning = 0;
	newstate.startingtime = 102;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.AutomatonPresent = 0;
	newstate.ComicFace = EMOJII_RESISTANT;
	newstate.startingtime = 122;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.ComicFace = EMOJII_DEAD; //a person can die
	newstate.startingtime = 124;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.ComicFace = EMOJII_RESISTANT;
	newstate.startingtime = 137.5;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.ComicFace = EMOJII_SUSCEPTIBLE;
	newstate.startingtime = 145.5;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.AutomatonPresent = 1;
	newstate.ComicFace = 0;
	newstate.AutomatonRunning = 0;
	newstate.Automaton_enforced_state = 1;
	newstate.startingtime = 149;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.AutomatonRunning = 1;
	newstate.TimeTilUnpause = 20;
	newstate.Pause_on_start = 1;
	newstate.Automaton_people_die = 1;
	newstate.startingtime = 164;
	Story_states.push(newstate);
	
	//Paragraph 4, when a person gets a disease, how long do they have it for?
	newstate = default_clone_story_state();
	newstate.AutomatonPresent = 1;
	newstate.AutomatonRunning = 0;
	newstate.startingtime = 168;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.ParameterZonePresent = 1; //by using your mouse on that slider
	newstate.slidermode = 1;
	newstate.startingtime = 192.5;
	Story_states.push(newstate);
	
	//simulate. Then the line is "click on me when you want to proceed
	newstate = default_clone_story_state();
	newstate.AutomatonRunning = 1;
	newstate.Automaton_people_die = 1;
	newstate.startingtime = 202; //click on me when
	newstate.Pause_on_start = 1;
	newstate.TimeTilUnpause = 30;
	newstate.RecoveryLabelled = 1;
	Story_states.push(newstate);
	
	//exists purely to make a pause happen without changing the state from the previous one
	newstate = default_clone_story_state();
	newstate.startingtime = 208.7;
	newstate.Pause_on_start = 1;
	Story_states.push(newstate);
	
	//Paragraph 5 "Another important factor is infectiousness"
	newstate = default_clone_story_state();
	newstate.AutomatonRunning = 0;
	newstate.startingtime = 208.8;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.slidermode = 0;
	newstate.startingtime = 236;
	newstate.InfectiousnessLabelled = 1;
	Story_states.push(newstate);
	
	//another simulate then "click on me"
	newstate = default_clone_story_state();
	newstate.AutomatonRunning = 1;
	newstate.startingtime = 249;
	newstate.Pause_on_start = 1;
	newstate.TimeTilUnpause = 20;
	Story_states.push(newstate);
	
	newstate = default_clone_story_state();
	newstate.startingtime = 253;
	newstate.Pause_on_start = 1;
	Story_states.push(newstate);
	
	//Paragraph 6 "we're going to forget about the grid arrangement"
	newstate = default_clone_story_state();
	newstate.AutomatonRunning = 0;
	newstate.startingtime = 254.7;
	Story_states.push(newstate);

	newstate = default_clone_story_state();
	newstate.AutomatonPresent = 0;
	newstate.ParameterZonePresent = 0;
	newstate.startingtime = 276;
	Story_states.push(newstate);

	newstate = default_clone_story_state();
	newstate.GraphPresent = 1; //line everyone up
	newstate.startingtime += 1;
	newstate.startingtime = 278.7;
	Story_states.push(newstate);

	var population_varying_steps = 30;
	for(var i = 0; i < population_varying_steps; i++ )
	{
		newstate = default_clone_story_state();
		newstate.startingtime = 282 + i * 0.05; //this is just a "frame"
		
		if( i < population_varying_steps / 2 )
			newstate.Infected = i / population_varying_steps * Population / 1.5;
		else
			newstate.Infected = (population_varying_steps - i) / population_varying_steps * Population / 1.5;
		
		if( i < population_varying_steps / 2 )
			newstate.Resistant = i / population_varying_steps * Population;
		else
			newstate.Resistant = (population_varying_steps - i) / population_varying_steps * Population;
		
		Story_states.push(newstate);
	}
	
	newstate = default_clone_story_state();
	newstate.Resistant = -1;
	newstate.Infected = -1;
	newstate.GraphMoving = 1;
	newstate.Pause_on_start = 1;
	newstate.TimeTilUnpause = 11;
	newstate.startingtime = 295;
	Story_states.push(newstate);
	
	//Paragraph 7 "change the parameters again"
	newstate = default_clone_story_state();
	newstate.ParameterZonePresent = 1;
	newstate.startingtime += 3;
	newstate.Pause_on_start = 1;
	newstate.startingtime = 305.6;
	Story_states.push(newstate);
	
	//Paragraph 8 "this is a phase diagram"
	newstate = default_clone_story_state();
	newstate.startingtime = 305.7;
	Story_states.push(newstate);

	newstate = default_clone_story_state();
	newstate.PhaseZonePresent = 1;
	newstate.VectorFieldPresent = 0;
	newstate.startingtime = 311;
	Story_states.push(newstate);

	newstate = default_clone_story_state();
	newstate.Pause_on_start = 1;
	newstate.startingtime = 335.9;
	Story_states.push(newstate);
	
	//Paragraph 9 "vector field"
	newstate = default_clone_story_state();
	newstate.VectorFieldPresent = 1;
	newstate.startingtime = 335.91;
	Story_states.push(newstate);

	newstate = default_clone_story_state();
	newstate.Pause_on_start = 1;
	newstate.startingtime = 348;
	Story_states.push(newstate);
	
	//Paragraph 10 "bye"
	newstate = default_clone_story_state();
	newstate.startingtime = 350;
	Story_states.push(newstate);
	
	for(var i = 0; i < Story_states.length - 1; i++ )
		if( !Story_states[i].AutomatonPresent )
			Story_states[i].AutomatonRunning = 0;
	
	for(var i = 0; i < Story_states.length - 1; i++ )
		if( Story_states[i].startingtime >= Story_states[i+1].startingtime )
			console.error("bad ending time for number ", i);
}

var default_interval = 20;

// same as the previous, with a different time
function default_clone_story_state()
{
	var new_story_state = {};
	
	for(var propt in Story_states[Story_states.length - 1]){
	    new_story_state[propt] = Story_states[Story_states.length - 1][propt];
	}
	
	//for every variable, think "should this be cloned from the previous?"
	//a "pause on end" would be nice... maybe better always
	new_story_state.Pause_on_start = 0; //quite a rare thing to do
	new_story_state.TimeTilUnpause = 0;
	new_story_state.Automaton_enforced_state = 666; //we don't reset it every time
	
	new_story_state.startingtime += default_interval;
	
	return new_story_state;
}