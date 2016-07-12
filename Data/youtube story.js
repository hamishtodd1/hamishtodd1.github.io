/*
 * Todo
 * Get video in
 * whole great big list of pages
 */

var Storypage = -1; //set to a silly number initially so we know that the first page will be triggered.
var Story_states = [];

function Update_story()
{	
	for(var i = 0; i < Story_states.length; i++)
	{
		//if you're on the nose of the state's endingtime, you're in that state
		if(	our_CurrentTime <= Story_states[i].endingtime && 
		  ( i === 0 || Story_states[i-1].endingtime < our_CurrentTime ) )
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
		VisibleSlide.material.map = slides[ Story_states[Storypage].slide_number ];
		
//	if(Story_states[Storypage].ComicPresent)
//		Scene.add(ComicZone);
//	else
//		Scene.remove(ComicZone);
	
	if( Story_states[Storypage].MODE !== MODE )
		ChangeScene(Story_states[Storypage].MODE);
}

function init_story()
{	
	var newstate;
	
	//0
	Story_states.push({
		endingtime: 1;
		});
	
	
	//----paragraph 1
//	newstate = default_clone_story_state();
//	newstate.ComicFace = EMOJII_SICK;
//	Story_states.push(newstate);
	
	//we will be switching to NOTHING_MODE for single slides
	
	
	newstate = default_clone_story_state();
	newstate.endingtime = 9999999;
	Story_states.push(newstate);
	
	for(var i = 0; i < Story_states.length - 1; i++ )
		if( Story_states[i].endingtime >= Story_states[i+1].endingtime )
			console.error("bad ending time for number ", i);
}


// same as the previous, with a different time
function default_clone_story_state()
{
	var default_page_duration = 1.2;
	
	var new_story_state = {};
	
	for(var propt in Story_states[Story_states.length - 1]){
	    new_story_state[propt] = Story_states[Story_states.length - 1][propt];
	}
	
	new_story_state.endingtime += default_page_duration;
	
	return new_story_state;
}