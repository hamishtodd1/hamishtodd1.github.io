function initVideo()
{	
	// create the video element
	video = document.createElement( 'video' );
	video.src = "http://hamishtodd1.github.io/Sysmic/Data/dfwe.mp4";
	video.crossOrigin = "anonymous";
	
//	 video.id = 'video';
//	 video.type = ' video/ogg; codecs="theora, vorbis" ';
	
	video.load(); // must call after setting/changing source
	video.play();
	
	var videoImage = document.createElement( 'canvas' );
	videoImage.width = 480;
	videoImage.height = 360;

	videoImageContext = videoImage.getContext( '2d' );
	// background color if no video present
	videoImageContext.fillStyle = '#000000';
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

	videoTexture = new THREE.Texture( videoImage );
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;
	
	movieScreen = new THREE.Mesh( 
			new THREE.PlaneGeometry( VIEWBOX_WIDTH,VIEWBOX_HEIGHT ),
			new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } ) );
	movieScreen.position.set(0,0,0);

	movieScreen.add(boundingbox.clone());
}

function update_video()
{
	if( typeof video !== 'undefined' && video.readyState === video.HAVE_ENOUGH_DATA)
	{
		videoImageContext.drawImage( video, 0, 0 );
		if ( videoTexture ) 
			videoTexture.needsUpdate = true;
	}
	
	//video.pause();
	//video.play();
	//video.paused
}

//
//function update()
//{
//	if ( keyboard.pressed("p") )
//		video.play();
//		
//	if ( keyboard.pressed("space") )
//		video.pause();
//
//	if ( keyboard.pressed("s") ) // stop video
//	{
//		video.pause();
//		video.currentTime = 0;
//	}
//	
//	if ( keyboard.pressed("r") ) // rewind video
//		video.currentTime = 0;
//}
	
	