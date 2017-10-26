var clientPosition = new THREE.Vector3();
var oldClientPosition = new THREE.Vector3();
var clientClicking = false;
var oldClientClicking = false;

var asynchronousInput = { //only allowed to use this in this file, and maybe in init
	clientPosition: new THREE.Vector3(),
	clientClicking: false,
	read: function()
	{
		oldClientClicking = this.clientClicking;
		clientClicking = this.clientClicking;
		
		oldClientPosition.copy(clientPosition);
		clientPosition.copy(this.clientPosition);
	}
};

asynchronousInput.updateClientPosition = function(rawX,rawY)
{
	//the area you can see in the plane z=0 is either 2 by 1 or 1 by 2
	
	asynchronousInput.clientPosition.x = rawX - ( document.body.clientWidth / 2 );
	asynchronousInput.clientPosition.y = -rawY+ ( document.body.clientHeight/ 2 ) - document.body.scrollTop;
	
	asynchronousInput.clientPosition.x /= renderer.domElement.width;
	asynchronousInput.clientPosition.y /= renderer.domElement.height;
	
	if(renderer.domElement.width > renderer.domElement.height)
	{
		asynchronousInput.clientPosition.x *= 2;
	}
	else
	{
		asynchronousInput.clientPosition.y *= 2;
	}
	
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
	Sounds.grab.play();
	
	asynchronousInput.updateClientPosition( event.changedTouches[0].clientX, event.changedTouches[0].clientY );
	asynchronousInput.clientClicking = true;
}, false );
document.addEventListener( 'touchend', function(event)
{
	Sounds.release.play();
	asynchronousInput.clientClicking = false;
}, false );

document.addEventListener( 'mousedown', function(event) 
{
	Sounds.grab.play();
	asynchronousInput.clientClicking = true;
	kbSystem.resetTrail();
}, false );

document.addEventListener( 'mouseup', function(event) 
{
	Sounds.release.play();
	asynchronousInput.clientClicking = false;
}, false );