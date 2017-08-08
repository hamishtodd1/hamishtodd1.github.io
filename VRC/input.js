var clientClicking = false;
var oldClientClicking = false;

var asynchronousInput = { //only allowed to use this in this file, and maybe in init
	clientClicking: false,
	read: function()
	{
		oldClientClicking = this.clientClicking;
		clientClicking = this.clientClicking;
	}
};

document.addEventListener( 'mousemove', asynchronousInput.updateClientPosition = function(event)
{
	event.preventDefault();
	
	//something
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