/*
	want to be able to put mosue over a picture on the internet,
		press a keyboard shortcut, see it appear

	save file to the directory is easy, you'll want to "save as"

	TODO copy and paste to make a new one appear
*/

function initImagesAndVideos()
{
	var textureFileNames = [
		"Seoul ICM2014 Opening Ceremony (0).mp4",
		"jupiterJpl.jpg",
		"bluetongue.jpg",
		// "Seoul ICM2014 Opening Ceremony (1).mp4",
		// "Seoul ICM2014 Opening Ceremony (2).mp4",
		// "interview.mp4",
		// "clips.mov"
	];

	var everythingGeometry = new THREE.PlaneGeometry( 1,1 );

	var textureLoader = new THREE.TextureLoader();
	textureLoader.crossOrigin = true;

	var blankMaterial = new THREE.MeshBasicMaterial();
	blankMaterial.visible = false;
	var imageMesh = new THREE.Mesh( everythingGeometry, blankMaterial);
	imageMesh.position.z = camera.position.z - camera.near - 0.001
	scene.add( imageMesh )

	var videoMesh = new THREE.Mesh( everythingGeometry, blankMaterial );
	videoMesh.position.copy(imageMesh.position)
	scene.add( videoMesh )

	var scaleThatFillsScreen = new THREE.Vector3(1,1,1);
	function setScaleThatFillsScreen(aspectRatio)
	{
		var viewerScreenHeightAtZ0 = AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0 * 2 / AUDIENCE_ASPECT_RATIO;
		var viewerScreenHeightAtZ = viewerScreenHeightAtZ0 * imageMesh.position.distanceTo( camera.position) / camera.position.z;
		if(aspectRatio > AUDIENCE_ASPECT_RATIO)
		{
			scaleThatFillsScreen.set( viewerScreenHeightAtZ * aspectRatio, viewerScreenHeightAtZ, 1 );
		}
		else
		{
			var viewerScreenWidthAtZ = viewerScreenHeightAtZ * AUDIENCE_ASPECT_RATIO;
			scaleThatFillsScreen.set( viewerScreenWidthAtZ, viewerScreenWidthAtZ / aspectRatio, 1 );
		}
	}
	var zoomProgress = 0;

	objectsToBeUpdated.push( imageMesh )
	imageMesh.update = function()
	{
		if(	mouse.lastClickedObject !== null && 
			mouse.lastClickedObject.material === this.material )
		{
			this.scale.copy(scaleThatFillsScreen)
			this.scale.multiplyScalar(1+zoomProgress);
			zoomProgress += 0.0003;
		}
		else
		{
			if(this.material !== blankMaterial)
			{
				this.material = blankMaterial;
			}
		}
	}

	objectsToBeUpdated.push( videoMesh )
	videoMesh.update = function()
	{
		if(	mouse.lastClickedObject !== null && 
			mouse.lastClickedObject.material === this.material )
		{
			this.material.makeSureImageIsChanged()
		}
		else
		{
			if(this.material !== blankMaterial)
			{
				this.material.documentElement.pause();
				this.material = blankMaterial;
			}
		}
	}

	function Thumbnail( aspectRatio, i, textureMaterial )
	{
		var width = 0.15;
		var height = width / aspectRatio;
		var thumbnail = new THREE.Mesh(
			everythingGeometry,
			textureMaterial );
		scene.add(thumbnail)
		clickables.push(thumbnail)
		thumbnail.scale.set( width, height, 1 )

		thumbnail.position.y = AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0 * 1.02 + 0.5 * width;
		var numWeCanSqueezeIn = AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0 * 2 / width;
		var rowPosition = i;
		if( rowPosition >= numWeCanSqueezeIn )
		{
			rowPosition -= numWeCanSqueezeIn
			thumbnail.position.y *= -1
		}
		thumbnail.position.x = (rowPosition - (numWeCanSqueezeIn-1)/2) * width;
		
		return thumbnail;
	}

	function loadImage(i)
	{
		textureLoader.load( "./data/textures/" + textureFileNames[i], function(texture) 
		{
			var aspectRatio = texture.image.naturalWidth / texture.image.naturalHeight;
			var textureMaterial = new THREE.MeshBasicMaterial({map:texture})
			var thumbnail = Thumbnail( aspectRatio, i, textureMaterial );
			thumbnail.onClick = function()
			{
				setScaleThatFillsScreen(aspectRatio) 

				zoomProgress = 0;
				imageMesh.material = textureMaterial;

				/*
					Could allow panning too
					You have one thumbnail space for clicking when you want to clear
					Could have a starting position and
				*/
			}
		}, function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );} );
	}

	function loadVideo(i)
	{	
		// var video = document.createElement( "video" );
		// video.id = "videoWhoseTextureIndexIs" + i.toString();
		// video.type = ' video/mp4; codecs="theora, vorbis" ';
		// video.src = "./data/textures/" + textureFileNames[i];
		// video.crossOrigin = "anonymous";
		// video.load();
		// // video.play();
		// if(video.videoHeight === 0)
		// {
		// 	console.error("video not loaded?")
		// 	return
		// }
		// var aspectRatio = video.videoWidth / video.videoHeight;
		// you need to get rid of the below
		var aspectRatio = 1;
		
		// var videoImage = document.createElement( 'canvas' );
		// videoImage.width = video.videoWidth;
		// videoImage.height = video.videoHeight;
		// var videoImageContext = videoImage.getContext( '2d' );
		// videoImageContext.fillStyle = '#ffffff'; // background color if no video present
		// videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

		var videoMaterial = new THREE.MeshBasicMaterial(
		{
			// overdraw: true,
			// map: new THREE.Texture( videoImage ) 
		})
		// videoMaterial.documentElement = video;
		// videoMaterial.map.minFilter = THREE.LinearFilter;
		// videoMaterial.map.magFilter = THREE.LinearFilter;

		videoMaterial.makeSureImageIsChanged = function()
		{
			// if( video !== null && video.readyState === video.HAVE_ENOUGH_DATA )
			// {
			// 	videoImageContext.drawImage( video, 0, 0 )
			// 	this.map.needsUpdate = true;
			// 	this.needsUpdate = true;
			// }
		}

		var thumbnail = Thumbnail( aspectRatio, i, videoMaterial );
		thumbnail.onHover = function(hoveredPoint)
		{
			var frameLimitLeft =  this.geometry.vertices[0].clone().applyMatrix4( this.matrix ).x;
			var frameLimitRight = this.geometry.vertices[1].clone().applyMatrix4( this.matrix ).x;
			//if there's a massive bit of it you don't want at the beginning, could add something
			// video.currentTime = (hoveredPoint.x - frameLimitLeft) / (frameLimitRight-frameLimitLeft)

			videoMaterial.makeSureImageIsChanged()
		}
		thumbnail.onClick = function()
		{
			videoMesh.material = videoMaterial;
			setScaleThatFillsScreen(aspectRatio)
			// video.play();
		}
	}

	for(var i = 0, il = textureFileNames.length; i < il; i++)
	{
		var fileExtension = textureFileNames[i].slice(textureFileNames[i].length-3);
		if( fileExtension === "mp4" || fileExtension === "mov")
		{
			loadVideo(i);
		}
		else
		{
			loadImage(i);
		}
	}
}