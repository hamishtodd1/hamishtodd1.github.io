//images are always behind everything except each other?

function initPictures(thingsToBeUpdated,grabbables)
{
	var textureLoader = new THREE.TextureLoader();
	textureLoader.crossOrigin = true;

	var imageFileNames = [
		"murrays.png",
		"bluetongue.jpg",
	];

	thingsToBeUpdated.images = [];

	function rotateImageToFaceCamera(image)
	{
		var currentForward = zAxis.clone().applyQuaternion(image.quaternion).normalize();
		var newForward = getCameraLoookingDirection().negate();
		image.quaternion.multiply( new THREE.Quaternion().setFromUnitVectors( currentForward, newForward ));

		var currentUp = yAxis.clone().applyQuaternion(image.quaternion);
		var newUp = yAxis.clone().applyQuaternion(camera.quaternion);
		image.quaternion.multiply( new THREE.Quaternion().setFromUnitVectors( currentUp, newUp ));
	}

	function postDragFunction(pointToKeepInPlace)
	{
		this.updateMatrixWorld();
		var displacementCausedByRotation = pointToKeepInPlace.clone();
		this.worldToLocal( displacementCausedByRotation );

		rotateImageToFaceCamera(this);
		this.updateMatrixWorld();
		this.localToWorld( displacementCausedByRotation );
		displacementCausedByRotation.sub(pointToKeepInPlace);

		this.position.add(displacementCausedByRotation);
	}

	function singleLoop(i)
	{
		textureLoader.load( "/data/textures/" + imageFileNames[i], function(texture) 
		{
			var image = new THREE.Mesh( new THREE.PlaneBufferGeometry( texture.image.naturalWidth / 1000, texture.image.naturalHeight / 1000 ), new THREE.MeshBasicMaterial({ map: texture }) );
			image.position.set( -i * 0.5, 0, -1 );

			grabbables.push(image);
			image.postDragFunction = postDragFunction;
			thingsToBeUpdated.images.push(image);
			image.update = function()
			{
				rotateImageToFaceCamera(this);
			}

			scene.add(image);
		}, function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );} );
	}

	for(var i = 0, il = imageFileNames.length; i < il; i++)
	{
		singleLoop(i);
	}
}