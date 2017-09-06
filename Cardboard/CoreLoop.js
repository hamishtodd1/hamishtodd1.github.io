function UpdateWorld(Models,Hands)
{	
	OurObject.position.copy(PointOfFocus);
	update_signs();
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
	if(isMobileOrTablet)
		OurStereoEffect.render( Scene, Camera );
	else
		Renderer.render( Scene, Camera );
}
