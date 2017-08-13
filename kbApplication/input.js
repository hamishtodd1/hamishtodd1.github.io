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

document.addEventListener( 'mousemove', asynchronousInput.updateClientPosition = function(event)
{
	event.preventDefault();
	
	var canvasDimension = renderer.domElement.width;
	
	//the area you can see in the plane z=0 is either 2 by 1 or 1 by 2
	
	asynchronousInput.clientPosition.x = event.clientX - ( document.body.clientWidth / 2 );
	asynchronousInput.clientPosition.y = -event.clientY+ ( document.body.clientHeight/ 2 ) - document.body.scrollTop;
	
	if(renderer.domElement.width > renderer.domElement.height)
	{
		asynchronousInput.clientPosition.x *= 2 / renderer.domElement.width;
		asynchronousInput.clientPosition.y *= 1 / renderer.domElement.height;
	}
	else
	{
		asynchronousInput.clientPosition.x *= 1 / renderer.domElement.width;
		asynchronousInput.clientPosition.y *= 2 / renderer.domElement.height;
	}
	
	asynchronousInput.clientPosition.x += camera.position.x;
	asynchronousInput.clientPosition.y += camera.position.y;
}, false );

document.addEventListener( 'mousedown', function(event) 
{
	event.preventDefault();
	asynchronousInput.clientClicking = true;
}, false );

document.addEventListener( 'mouseup', function(event) 
{
	event.preventDefault();
	asynchronousInput.clientClicking = false;
}, false );