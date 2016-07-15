//A live fish


function UpdateWorld()
{	
	//should these be the same?
	Update_story();	
	update_video();
	
	update_parameterzone();
	update_Phasezone();
	if( !Story_states[Storypage].GraphMoving )
		reset_graph();
	update_graph();
	
	update_Cellular_Automaton();
}

function Render() 
{
	delta_t = ourclock.getDelta();
//	if(delta_t > 0.1) delta_t = 0.1;
	
	ReadInput();
	UpdateWorld();
	
	//setTimeout( function() { requestAnimationFrame( render );}, 100 ); //debugging only
	requestAnimationFrame( Render );
	Renderer.render( Scene, Camera );
}

pre_download_init();