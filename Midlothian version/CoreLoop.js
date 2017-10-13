//A live fish

function UpdateWorld(Models,Hands)
{
	UpdateHands(Models,Hands);
	
	for(var i = 0; i < Models.length; i++)
		Models[i].children[0].BoundingBoxAppearance.update(Models[i]);
	
	update_video();
	updateRubiscoGame( Hands );
	
	update_sand();
}

function Render(Models,Users, ControllerModel) {
	delta_t = ourclock.getDelta();
//	if(delta_t > 0.1) delta_t = 0.1;
	
	ReadInput(Users, ControllerModel,Models);
	UpdateWorld(Models, Users);
	
	//setTimeout( function() { requestAnimationFrame( render );}, 100 ); //debugging only
	requestAnimationFrame( function(){
		Render(Models,Users,ControllerModel);
	} );
	OurVREffect.render( Scene, Camera ); //will be fine if VR is not enabled
}
