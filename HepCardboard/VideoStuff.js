function initVideo()
{	
	// create the video element
	video = document.createElement( 'video' );
	video.src = "Data/vid.mp4";
	video.crossOrigin = "anonymous";
	
	video.id = 'video';
	
	// video.load(); // must call after setting/changing source 
	
	
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