/*
	want to be able to put mosue over a picture on the internet,
		press a keyboard shortcut, see it appear

	save file to the directory is easy, you'll want to "save as"
*/

function initImagesAndVideos()
{
	var imageFileNames = [
		"jupiterJpl.jpg",
		"bluetongue.jpg",
	];
	var videoFileNames = [
		"Seoul ICM2014 Opening Ceremony (0)",
		"Seoul ICM2014 Opening Ceremony (1)",
		"Seoul ICM2014 Opening Ceremony (2)",
		"interview.mp4",
		"clips.mov"
	];

	var textureLoader = new THREE.TextureLoader();
	textureLoader.crossOrigin = true;

	var onscreenImage = new THREE.Mesh(new THREE.PlaneBufferGeometry(1,1), new THREE.MeshBasicMaterial());
	onscreenImage.visible = false;
	scene.add( onscreenImage )
	objectsToBeUpdated.push( onscreenImage )
	var scaleThatFillsScreen = new THREE.Vector3(1,1,1);
	var zoomProgress = 0;
	onscreenImage.update = function()
	{
		this.scale.copy(scaleThatFillsScreen)
		this.scale.multiplyScalar(1+zoomProgress);
		zoomProgress += 0.0003;
	}

	var thumbnailWidth = 0.4;
	function singleLoadLoop(i)
	{
		textureLoader.load( "./data/textures/" + imageFileNames[i], function(texture) 
		{
			var aspectRatio = texture.image.naturalWidth / texture.image.naturalHeight;
			var thumbnail = new THREE.Mesh(
				new THREE.PlaneBufferGeometry( thumbnailWidth, thumbnailWidth / aspectRatio ), 
				new THREE.MeshBasicMaterial({ map: texture }) );
			scene.add(thumbnail)
			thumbnail.position.y = -2;
			thumbnail.position.x = i * thumbnailWidth;
			clickables.push(thumbnail)
			thumbnail.onClick = function()
			{
				onscreenImage.visible = true;
				zoomProgress = 0;
				onscreenImage.material.map = texture
				onscreenImage.material.needsUpdate = true;

				if(aspectRatio > 16/9)
				{
					var screenHeight = 2/(16/9);
					scaleThatFillsScreen.set( screenHeight * aspectRatio, screenHeight, 1 );
				}
				else
				{
					var screenWidth = 2;
					scaleThatFillsScreen.set( screenWidth, screenWidth / aspectRatio, 1 );
				}

				/*
					Appears in center
					Sets scale so that it fills
					starts zooming. Can set it to pan?
					You have one thumbnail space for clicking when you want to clear
					Could have a starting position and
				*/
			}
		}, function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );} );
	}

	for(var i = 0, il = imageFileNames.length; i < il; i++)
	{
		singleLoadLoop(i);
	}
}