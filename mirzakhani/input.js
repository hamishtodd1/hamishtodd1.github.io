var clientPosition = new THREE.Vector3();
var oldClientPosition = new THREE.Vector3();
var clientClicking = false;
var oldClientClicking = false;

function initInputSystem()
{
	var asynchronousInput = { //only allowed to use this in this file, and maybe in init
		clientPosition: new THREE.Vector3(),
		clientClicking: false,
		read: function()
		{
			oldClientClicking = clientClicking;
			clientClicking = this.clientClicking;
			
			oldClientPosition.copy(clientPosition);
			clientPosition.copy(this.clientPosition);
		}
	};

	//We assume that you are looking directly at the xy plane, and that the renderer is the view dimensions
	asynchronousInput.updateClientPosition = function(rawX,rawY)
	{
		//center
		this.clientPosition.x = ( rawX / window.innerWidth  ) * 2 - 1;
		this.clientPosition.y =-( rawY / window.innerHeight ) * 2 + 1;

		var centerToFrameVertical = Math.tan( camera.fov * TAU / 360 / 2 ) * camera.position.z;
		var centerToFrameHorizontal = centerToFrameVertical * camera.aspect;
		
		asynchronousInput.clientPosition.x *= centerToFrameHorizontal;
		asynchronousInput.clientPosition.y *= centerToFrameVertical;

		asynchronousInput.clientPosition.x += camera.position.x;
		asynchronousInput.clientPosition.y += camera.position.y;
	}

	document.addEventListener( 'mousemove', function(event)
	{
		event.preventDefault();
		
		asynchronousInput.updateClientPosition(event.clientX,event.clientY);
	}, false );
	document.addEventListener( 'touchmove', function( event )
	{
		asynchronousInput.updateClientPosition( event.changedTouches[0].clientX, event.changedTouches[0].clientY );
	}, { passive: false } );

	document.addEventListener( 'touchstart', function(event)
	{
//		Sounds.grab.play();
		
		asynchronousInput.updateClientPosition( event.changedTouches[0].clientX, event.changedTouches[0].clientY );
		asynchronousInput.clientClicking = true;
	}, false );
	document.addEventListener( 'mousedown', function(event) 
	{
//		Sounds.grab.play();
		asynchronousInput.clientClicking = true;
	}, false );

	return asynchronousInput;
}