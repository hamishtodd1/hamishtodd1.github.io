//var placeholderprotein = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( {color: 0x00ff00} ) );
//placeholderprotein.position.set(0,0,3);


function ReadInput()
{	
//	OurOrientationControls.update();
	
	update_PointOfFocus();
	
	appauling_hacky_model_loader();
}

function update_PointOfFocus()
{
	PointOfFocus.set(0,0,-1);
	Camera.localToWorld(PointOfFocus);
	/*
	 * Could try to smooth it.
	 * But your phone is probably unusually bad
	 * Disadvantage: people might want to do the movement that your phone simulates
	 * 
	 * var OldPointOfFocus = PointOfFocus.clone();
	PointOfFocus.set(0,0,-1);
	Camera.localToWorld(PointOfFocus);
	if(PointOfFocus.angleTo(OldPointOfFocus) > TAU / 100 ) //revert to make it smooth
		PointOfFocus.copy(OldPointOfFocus);
	 */
}

document.addEventListener( 'mousedown', go_fullscreen_and_init_object, false );
document.addEventListener('touchstart', go_fullscreen_and_init_object, false );
function go_fullscreen_and_init_object(event) 
{
	event.preventDefault();
	
	THREEx.FullScreen.request(Renderer.domElement);
	
	if( OurObject.children.length !== 0 )
		OurObject.remove(OurObject.children[0]); //the fullscreen sign
	OurObject.add(Protein);
}

window.addEventListener( 'resize', function(event)
{
	Renderer.setSize( window.innerWidth, window.innerHeight );
	Camera.aspect = Renderer.domElement.width / Renderer.domElement.height;
	Camera.updateProjectionMatrix();
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