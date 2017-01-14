function ReadInput()
{	
	if(isMobileOrTablet)
		OurOrientationControls.update();
	
	update_PointOfFocus();
}

function update_PointOfFocus()
{
	PointOfFocus.set(0,0,-1);
	Camera.updateMatrixWorld();
	Camera.localToWorld(PointOfFocus);
	/*
	 * Could try to smooth it.
	 * But your phone is probably unusually bad so it won't affect many
	 * Disadvantage: people might want to do the movement that your phone simulates
	 * 
	 * var OldPointOfFocus = PointOfFocus.clone();
	PointOfFocus.set(0,0,-1);
	Camera.localToWorld(PointOfFocus);
	if(PointOfFocus.angleTo(OldPointOfFocus) > TAU / 100 ) //revert to make it smooth
		PointOfFocus.copy(OldPointOfFocus);
	 */
}

//document.addEventListener( 'mousedown', go_fullscreen_and_init_object, false );
document.addEventListener('touchstart', go_fullscreen_and_init_object, false );
function go_fullscreen_and_init_object(event) 
{
	event.preventDefault();
	
	if( THREEx.FullScreen.activated() )
		return;
	
	THREEx.FullScreen.request(Renderer.domElement);
	
	OurObject.remove(FullScreenSign);
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
	if(event.keyCode === 37 )
	{
		event.preventDefault();
		VRMODE = 1; //once you're in I guess you're not coming out!
		OurVREffect.setFullScreen( true );
		
		//bug if we do this earlier(?)
		for(var i = 0; i < 6; i++)
			OurVREffect.scale *= 0.66666666;
		
		return;
	}
	
	var sortachange = 0.01;
	if(event.keyCode === 81 )
	{
		var sorta = new THREE.Vector3(default_rightvector.x,default_rightvector.y,0,0);
		sorta.applyAxisAngle(Central_Z_axis, sortachange);
		default_rightvector.set(sorta.x,sorta.y,0,0);
	}
	if(event.keyCode === 87 )
	{
		var sorta = new THREE.Vector3(default_rightvector.x,default_rightvector.y,0,0);
		sorta.applyAxisAngle(Central_Z_axis, -sortachange);
		default_rightvector.set(sorta.x,sorta.y,0,0);
	}
	if(event.keyCode === 81 )
	{
		Camera.rotateOnAxis()
		var sorta = new THREE.Vector3(default_rightvector.x,default_rightvector.y,0,0);
		sorta.applyAxisAngle(Central_Z_axis, sortachange);
		default_rightvector.set(sorta.x,sorta.y,0,0);
	}
	if(event.keyCode === 87 )
	{
		var sorta = new THREE.Vector3(default_rightvector.x,default_rightvector.y,0,0);
		sorta.applyAxisAngle(Central_Z_axis, -sortachange);
		default_rightvector.set(sorta.x,sorta.y,0,0);
	}
});

document.addEventListener( 'mousemove', function(event) {
	if(!isMobileOrTablet)
	{
		Camera.rotation.y = (event.clientX - Renderer.domElement.offsetLeft) / Renderer.domElement.offsetWidth  * TAU;
		Camera.rotation.x = ( (event.clientY - Renderer.domElement.offsetTop ) / Renderer.domElement.offsetHeight * TAU / 2 - TAU / 4 );
	} 
}, false );