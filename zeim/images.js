//images are always behind everything except each other?

function initImages(thingsToBeUpdated, clickables)
{
	var imageFileNames = [
		"murrays.png",
		"bluetongue.jpg",
	];

	thingsToBeUpdated.images = [];

	function Image(texture)
	{
		THREE.Mesh.call( this,
			new THREE.PlaneBufferGeometry( 
				texture.image.naturalWidth / 1000, 
				texture.image.naturalHeight / 1000 ), 
			new THREE.MeshBasicMaterial({ map: texture }) );

		this.grabbedPoint = null;
	}
	Image.prototype = Object.create(THREE.Mesh.prototype);

	Image.prototype.rotateToFaceCamera = function(image)
	{
		var currentForward = zAxis.clone().applyQuaternion(this.quaternion).normalize();
		var newForward = camera.getWorldDirection().negate();
		this.quaternion.multiply( new THREE.Quaternion().setFromUnitVectors( currentForward, newForward ));

		var currentUp = yAxis.clone().applyQuaternion(this.quaternion);
		var newUp = yAxis.clone().applyQuaternion(camera.quaternion);
		this.quaternion.multiply( new THREE.Quaternion().setFromUnitVectors( currentUp, newUp ));
	}

	//urgh there's a little jolt when you first click
	Image.prototype.onClick = function(grabbedPoint)
	{
		this.grabbedPoint = grabbedPoint;
	}

	Image.prototype.update = function()
	{
		if( mouse.clicking && mouse.lastClickedObject === this )
		{
			mouse.applyDrag(this);

			this.updateMatrixWorld();
			var displacementCausedByRotationToFaceCamera = this.grabbedPoint.clone();
			this.worldToLocal( displacementCausedByRotationToFaceCamera );
			// console.log(this.grabbedPoint.distanceTo(camera.position))

			// this.rotateToFaceCamera();

			this.updateMatrixWorld();
			this.localToWorld( displacementCausedByRotationToFaceCamera );
			displacementCausedByRotationToFaceCamera.sub(this.grabbedPoint);

			this.position.sub(displacementCausedByRotationToFaceCamera);
		}
		else
		{
			this.grabbedPoint = null;
			this.rotateToFaceCamera();
		}
	}

	var textureLoader = new THREE.TextureLoader();
	textureLoader.crossOrigin = true;

	function singleLoadLoop(i)
	{
		textureLoader.load( "/data/textures/" + imageFileNames[i], function(texture) 
		{
			var image = new Image(texture);
			image.position.set( -i * 0.5, 0, -1.8 );
			thingsToBeUpdated.images.push(image);
			clickables.push(image)
			scene.add(image);
		}, function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );} );
	}

	for(var i = 0, il = imageFileNames.length; i < il; i++)
	{
		singleLoadLoop(i);
	}
}