var InputObject = { //only allowed to use this in this file, and maybe in init
	MousePosition: new THREE.Vector3(),
	isMouseDown: 0
};

function ReadInput(Users, ControllerModel,Models)
{
	isMouseDown_previously = isMouseDown;
	isMouseDown = InputObject.isMouseDown;
	
	MousePosition.copy(InputObject.MousePosition);
}

document.addEventListener( 'mousemove', function(event)
{
	event.preventDefault();
	
	var vector = new THREE.Vector3(
		  ( event.clientX / window.innerWidth ) * 2 - 1,
	    - ( event.clientY / window.innerHeight) * 2 + 1,
	    0.5 );
	vector.unproject( Camera );
	var dir = vector.sub( Camera.position ).normalize();
	var distance = - Camera.position.z / dir.z;
	var finalposition = Camera.position.clone();
	finalposition.add( dir.multiplyScalar( distance ) );
	
	InputObject.MousePosition.copy(finalposition);
}, false );


document.addEventListener( 'mousedown', function(event) 
{
	event.preventDefault();
	
	InputObject.isMouseDown = 1;
}, false );

document.addEventListener( 'mouseup', function(event) 
{
	event.preventDefault();
	
	InputObject.isMouseDown = 0;
}, false );

//not document? ok, whatever
window.addEventListener( 'resize', Resize, false );

function Resize() 
{	
	var min_height = (VIEWBOX_HEIGHT + VIEWBOX_SPACING ) * 2;
	var corresponding_width = min_height / window.innerHeight * window.innerWidth;
	var min_width = (VIEWBOX_WIDTH + VIEWBOX_SPACING ) * 2;
	
	//the part of the plane z = 0 that the camera can see
	var playing_field_width;
	var playing_field_height;

	if( min_width > corresponding_width)
	{
		playing_field_width = min_width;
		playing_field_height = min_width / window.innerWidth * window.innerHeight;
	}
	else
	{
		playing_field_height = min_height; //world units
		playing_field_width = min_height / window.innerHeight * window.innerWidth;
	}

	
	var vertical_fov = 2 * Math.atan( (playing_field_height/2) / cameradist );
	
	Camera.fov = vertical_fov * 360 / TAU;
	
	Camera.aspect = window.innerWidth / window.innerHeight;
	Camera.updateProjectionMatrix();
	Renderer.setSize( window.innerWidth, window.innerHeight );
}