function makeTextSign(initialText)
{
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	var material = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) });

	let currentText = ""
	material.setText = function (text)
	{
		if (currentText === text)
			return

		currentText = text

		var font = "Trebuchet"
		var backgroundMargin = 50;
		var textSize = 100;
		context.font = textSize + "pt " + font;
		var textWidth = context.measureText(text).width;
		canvas.width = textWidth + backgroundMargin;
		canvas.height = textSize + backgroundMargin;

		context.font = textSize + "pt " + font;
		context.textAlign = "center";
		context.textBaseline = "middle";

		var backGroundColor = "#3F3D3F"
		context.fillStyle = backGroundColor;
		context.fillRect(
			canvas.width / 2 - textWidth / 2 - backgroundMargin / 2,
			canvas.height / 2 - textSize / 2 - backgroundMargin / 2,
			textWidth + backgroundMargin,
			textSize + backgroundMargin);

		var textColor = "#D3D1D3"
		context.fillStyle = textColor;
		context.fillText(text, canvas.width / 2, canvas.height / 2);

		this.map.needsUpdate = true;

		sign.scale.x = canvas.width / canvas.height * sign.scale.y;

		//the geometry isn't affected ofc
	}

	var geo = new THREE.PlaneBufferGeometry(1., 1.)
	var sign = new THREE.Mesh(geo, material);

	sign.scale.x = canvas.width / canvas.height * sign.scale.y;

	material.setText(initialText);

	return sign;
}

let clickThereSign = makeTextSign("<- Click there to play and pause!")
clickThereSign.scale.multiplyScalar(.3)
clickThereSign.position.x = 4.2

function initVideo()
{	
	// create the video element
	video = document.createElement( 'video' );
	video.src = "http://hamishtodd1.github.io/interactiveEpidemiology/Data/Movie_0002.mp4";
	video.crossOrigin = "anonymous";
	
	 video.id = 'video';
	 video.type = ' video/mp4; codecs="theora, vorbis" ';
	
	video.load(); // must call after setting/changing source
	video.play();
	
//	video.currentTime = 290; //don't worry about the first column
	
	var videoImage = document.createElement( 'canvas' );
	videoImage.width = 640;
	videoImage.height = 480;

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
	
	Scene.add(movieScreen);

	Scene.add(clickThereSign)
}

function update_video()
{
	if( typeof video !== 'undefined' && video.readyState === video.HAVE_ENOUGH_DATA)
	{
		videoImageContext.drawImage( video, 0, 0 );
		if ( videoTexture ) 
			videoTexture.needsUpdate = true;
	}
	
	if( Math.abs(MousePosition.x) < VIEWBOX_WIDTH / 2
		&& Math.abs(MousePosition.y) < VIEWBOX_HEIGHT / 2 
		&& isMouseDown && !isMouseDown_previously)
	{
		if( video.paused && !video.ended )
			video.play();
		else
			video.pause();
	}

	if(video.currentTime > 2.)
		Scene.remove(clickThereSign)
}