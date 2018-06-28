/*
	want to be able to put mosue over a picture on the internet,
		press a keyboard shortcut, see it appear

	save file to the directory is easy, you'll want to "save as"
*/

function initImages()
{
	var imageFileNames = [
		"murrays.png",
		"bluetongue.jpg",
	];

	function GrabbableImage(texture)
	{
		THREE.Mesh.call( this,
			new THREE.PlaneBufferGeometry( 
				texture.image.naturalWidth / 1000, 
				texture.image.naturalHeight / 1000 ), 
			new THREE.MeshBasicMaterial({ map: texture }) );
	}
	GrabbableImage.prototype = Object.create(THREE.Mesh.prototype);

	bestowDefaultMouseDragProperties(GrabbableImage.prototype)

	var textureLoader = new THREE.TextureLoader();
	textureLoader.crossOrigin = true;

	function singleLoadLoop(i)
	{
		textureLoader.load( "./data/textures/" + imageFileNames[i], function(texture) 
		{
			var image = new GrabbableImage(texture);
			image.position.set( -i * 0.5, 0, -18 );
			objectsToBeUpdated.push(image);
			clickables.push(image)
			camera.add(image);
		}, function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );} );
	}

	for(var i = 0, il = imageFileNames.length; i < il; i++)
	{
		singleLoadLoop(i);
	}

	// loadRecentlyAddedImage = function(filename)
	// {
	// 	socket.send("wantRecentlyAddedFile")
	// }
	// socket.onmessage = blah
}