function initImages(thingsToBeUpdated, clickables)
{
	var imageFileNames = [
		"murrays.png",
		"bluetongue.jpg",
	];

	thingsToBeUpdated.images = [];

	function GrabbableImage(texture)
	{
		THREE.Mesh.call( this,
			new THREE.PlaneBufferGeometry( 
				texture.image.naturalWidth / 1000, 
				texture.image.naturalHeight / 1000 ), 
			new THREE.MeshBasicMaterial({ map: texture }) );

		this.clickedPoint = null;
	}
	GrabbableImage.prototype = Object.create(THREE.Mesh.prototype);

	GrabbableImage.prototype.onControllerGrab = function()
	{
		//stuff about whether it was grabbed with side button
		//either way it stays in camera space, hurgh
	}
	GrabbableImage.prototype.onClick = function(cameraSpaceClickedPoint)
	{
		this.clickedPoint = cameraSpaceClickedPoint;
	}
	GrabbableImage.prototype.update = function()
	{
		if( mouse.lastClickedObject === this && mouse.clicking )
		{
			mouse.applyDrag(this);
		}
		else
		{
			this.clickedPoint = null;
		}
	}
	// bestowDefaultMouseDragProperties(GrabbableImage.prototype)

	var textureLoader = new THREE.TextureLoader();
	textureLoader.crossOrigin = true;

	function singleLoadLoop(i)
	{
		textureLoader.load( "/data/textures/" + imageFileNames[i], function(texture) 
		{
			var image = new GrabbableImage(texture);
			image.position.set( -i * 0.5, 0, -1.8 );
			thingsToBeUpdated.images.push(image);
			clickables.push(image)
			camera.add(image); //sigh, maybe better added to camera
		}, function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );} );
	}

	for(var i = 0, il = imageFileNames.length; i < il; i++)
	{
		singleLoadLoop(i);
	}
}