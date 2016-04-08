//A living fish

function UpdateWorld(){
//	ModelZero.rotateOnAxis(Central_Z_axis, TAU / 60 / 8);
	ModelZero.rotateOnAxis(Central_Y_axis, TAU / 60 / 8);
}

function ReadInput(){
}

function Render() {
	delta_t = ourclock.getDelta();
//	if(delta_t > 0.1) delta_t = 0.1;
	
	ReadInput();
	UpdateWorld();
	
	//setTimeout( function() { requestAnimationFrame( render );}, 100 ); //debugging only
	requestAnimationFrame( Render );
	Renderer.render( Scene, Camera );
}
Init();