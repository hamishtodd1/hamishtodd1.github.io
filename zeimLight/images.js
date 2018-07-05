/*
	want to be able to put mosue over a picture on the internet,
		press a keyboard shortcut, see it appear

	save file to the directory is easy, you'll want to "save as"

	TODO copy and paste to make a new one appear

	You do need to convert all videos to power-of-2
*/

function initImagesAndVideos()
{
	var textureFileNames = [
		"jupiterJpl.jpg",
		"bluetongue.jpg",
		// "interview.mp4",
		"Seoul ICM2014 Opening Ceremony (0).mp4",
		// "Seoul ICM2014 Opening Ceremony (1).mp4",
		// "Seoul ICM2014 Opening Ceremony (2).mp4",
		// "clips.mov"
	];

	var everythingGeometry = new THREE.PlaneGeometry( 1,1 );

	var textureLoader = new THREE.TextureLoader();
	textureLoader.crossOrigin = true;

	var displayMesh = new THREE.Mesh( everythingGeometry, new THREE.MeshBasicMaterial());
	displayMesh.material.visible = false;
	displayMesh.position.z = camera.position.z - camera.near - 0.001
	scene.add( displayMesh )

	var scaleThatFillsScreen = new THREE.Vector3(1,1,1);
	function setScaleThatFillsScreen(aspectRatio)
	{
		var viewerScreenHeightAtZ0 = AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0 * 2 / AUDIENCE_ASPECT_RATIO;
		var viewerScreenHeightAtZ = viewerScreenHeightAtZ0 * displayMesh.position.distanceTo( camera.position) / camera.position.z;
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

	objectsToBeUpdated.push( displayMesh )
	displayMesh.update = function()
	{
		var mostRecentClickWasOnAThumbnailWeAreReflecting = 
				mouse.lastClickedObject !== null && 
				mouse.lastClickedObject.material.map === this.material.map
		if( mostRecentClickWasOnAThumbnailWeAreReflecting )
		{
			this.scale.copy(scaleThatFillsScreen)
			if(this.material.map.video === undefined)
			{
				this.scale.multiplyScalar(1+zoomProgress);
				zoomProgress += 0.0003
			}
		}
		else
		{
			if( this.material.map !== null )
			{
				this.material.visible = false;
				this.material.map = null;
			}
		}
	}

	function Thumbnail( i, texture, video )
	{
		var width = 0.15;
		var thumbnail = new THREE.Mesh(
			everythingGeometry,
			new THREE.MeshBasicMaterial({depthTest:false,map:texture}) );
		scene.add(thumbnail)
		mouseables.push(thumbnail)
		thumbnail.scale.set( width, width, 1 )

		thumbnail.position.y = AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0 * 1.02 + 0.5 * width;
		var numWeCanSqueezeIn = AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0 * 2 / width;
		var rowPosition = i;
		if( rowPosition >= numWeCanSqueezeIn )
		{
			rowPosition -= numWeCanSqueezeIn
			thumbnail.position.y *= -1
		}
		thumbnail.position.x = (rowPosition - (numWeCanSqueezeIn-1)/2) * width;

		thumbnail.onClick = function()
		{
			setScaleThatFillsScreen(this.scale.x / this.scale.y)
			displayMesh.material.map = this.material.map;
			displayMesh.material.needsUpdate = true;
			displayMesh.material.visible = true;
			if( texture.video !== undefined )
			{
				texture.video.play();
			}
			else
			{
				zoomProgress = 0;
			}
		}
		
		return thumbnail;
	}

	function loadImage(i)
	{
		textureLoader.load( "./data/textures/" + textureFileNames[i], function(texture) 
		{
			var thumbnail = Thumbnail( i, texture );
			var aspectRatio = texture.image.naturalWidth / texture.image.naturalHeight;
			thumbnail.scale.set(thumbnail.scale.x,thumbnail.scale.x / aspectRatio,1)
		}, function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );} );
	}

	function loadVideo(i)
	{
		var video = document.createElement( 'video' )
		video.loop = true
		video.muted = true
		video.style = "display:none"
		video.src = "./data/textures/" + textureFileNames[i]
		video.currentTime = 0.05; //first frame is often no good

		var videoImage = document.createElement( 'canvas' );
		var videoTexture = new THREE.Texture( videoImage );
		console.log(video, video === videoTexture.image, videoTexture)
		videoTexture.video = video;
		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.magFilter = THREE.LinearFilter;
		var videoImageContext = videoImage.getContext( '2d' );
		videoImageContext.fillStyle = '#FFFFFF';
		videoImageContext.fillRect( 0, 0, 1280, 720 );

		var thumbnail = Thumbnail( i, videoTexture )

		objectsToBeUpdated.push(videoTexture)
		videoTexture.update = function()
		{
			if(thumbnail.scale.y === thumbnail.scale.x)
			{
				if( video.videoHeight === 0 )
				{
					return
				}

				videoImage.width = video.videoWidth;
				videoImage.height = video.videoHeight;
				var aspectRatio = video.videoWidth / video.videoHeight;
				thumbnail.scale.set(thumbnail.scale.x,thumbnail.scale.x/aspectRatio,1)
			}

			var mayBeTryingToHover = (displayMesh.material.map !== this && !mouse.clicking)
			// console.log(mayBeTryingToHover)
			if( mayBeTryingToHover )
			{
				var intersections = mouse.rayCaster.intersectObject( thumbnail ); //we're changing the name of that...
				if( intersections.length !== 0 )
				{
					var frameLimitLeft =  thumbnail.geometry.vertices[0].clone().applyMatrix4( thumbnail.matrix ).x;
					var frameLimitRight = thumbnail.geometry.vertices[1].clone().applyMatrix4( thumbnail.matrix ).x;
					var hoveredTime = video.duration * (intersections[0].point.x - frameLimitLeft) / (frameLimitRight-frameLimitLeft)

					//we check because currentTime needs a chance to get set. Also, useful looping effect
					if( Math.abs( video.currentTime - hoveredTime ) > 0.05 )
					{
						video.currentTime = hoveredTime
						if(video.paused)
						{
							video.play()
						}
					}
				}
				else
				{
					if(!video.paused)
					{
						video.pause()
					}
				}
			}

			if( video.readyState === video.HAVE_ENOUGH_DATA )
			{
				videoImageContext.drawImage( video, 0, 0 );
				videoTexture.needsUpdate = true;
			}
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