//var placeholderprotein = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( {color: 0x00ff00} ) );
//placeholderprotein.position.set(0,0,3);


function ReadInput()
{
	if(typeof OurVRControls !== 'undefined')
		OurVRControls.update();
	
	Camera.position.set(0,0,0); //we're doing this to simulate a cardboard.
	
	PointOfFocus.set(0,0,-1);
	Camera.localToWorld(PointOfFocus);
	
//	appauling_hacky_model_loader();
}

document.addEventListener( 'mousedown', function(event) 
{
	event.preventDefault();
	
	placeholder_interpret_ngl();
}, false );

document.addEventListener( 'keydown', function(event)
{
	if(event.keyCode === 190 )
	{
		event.preventDefault();
		VRMODE = 1; //once you're in I guess you're not coming out!
		OurVREffect.setFullScreen( true );
		
		//bug if we do this earlier(?)
		for(var i = 0; i < 6; i++)
			OurVREffect.scale *= 0.66666666;
		
		return;
	}
});