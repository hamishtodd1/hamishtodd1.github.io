function UpdateWorld(Models,Hands)
{	
	update_ourobject();
	update_loadingsign();
}

function Render() {
	delta_t = ourclock.getDelta();
//	if(delta_t > 0.1) delta_t = 0.1;
	
	ReadInput();
	UpdateWorld();
	
	//setTimeout( function() { requestAnimationFrame( render );}, 100 ); //debugging only
	requestAnimationFrame( function(){
		Render();
	} );
	OurVREffect.render( Scene, Camera ); //will be fine if VR is not enabled
}
