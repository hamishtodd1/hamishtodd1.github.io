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