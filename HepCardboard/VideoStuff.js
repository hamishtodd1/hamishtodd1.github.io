function initVideo()
{	
	// create the video element
	video = document.createElement( 'video' );
	video.src = "http://hamishtodd1.github.io/HepCardboard/Data/vid.mp4";
	video.crossOrigin = "anonymous";
	
	video.id = 'video';
//	video.type = 'video/ogg; codecs="theora, vorbis" ';
//	video.loop = true;
	
	video.load(); // must call after setting/changing source
	video.play();
	
//	video.currentTime = 24;
	
	// alternative method -- 
	// create DIV in HTML:
	// <video id="myVideo" autoplay style="display:none">
	//		<source src="videos/sintel.ogv" type='video/ogg; codecs="theora, vorbis"'>
	// </video>
	// and set JS variable:
	// video = document.getElementById( 'myVideo' );
	
	var videoImage = document.createElement( 'canvas' );
	videoImage.width = 1920;
	videoImage.height = 960;

	videoImageContext = videoImage.getContext( '2d' );
	// background color if no video present
	videoImageContext.fillStyle = '#000000';
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

	videoTexture = new THREE.Texture( videoImage );
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;
	
	var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
	// the geometry on which the movie will be displayed;
	// 		movie image will be scaled to fit these dimensions.
//	var movieScreen = new THREE.Mesh( new THREE.PlaneGeometry( 1.6 * 0.8,0.9 * 0.8,4, 4 ), movieMaterial );
	movieScreen = new THREE.Mesh( new THREE.SphereGeometry( 100, 50,50 ), movieMaterial );
	movieScreen.position.set(0,0,0);
	movieScreen.rotation.y = TAU / 4 * 2;
	movieScreen.scale.x = -1; //coz you're inside it
	Scene.add(movieScreen);
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

