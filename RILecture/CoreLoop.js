function UpdateWorld(Models,Hands)
{	
	update_ourobject_position();
	
//	if( typeof attractedAtom !== 'undefined' )
//		attractedAtom.update();
	for(var i = 0, il = OurObject.children.length; i < il; i++)
		if( typeof OurObject.children[i].update !== 'undefined' )
			OurObject.children[i].update();
	//we're heading towards a sense of core loop just being if(thing in scene), thing.update();
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
