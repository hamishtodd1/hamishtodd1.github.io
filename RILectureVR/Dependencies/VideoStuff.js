function initVideos(presentation)
{	
	var videosInfo = [];
	videosInfo.push( {
		fileName: "diffraction_rotating",
		actualName: "diffraction",
		pixelsWide: 1920,
		pixelsTall: 1080
	});
	videosInfo.push( {
		fileName: "Sagittal-T2-of-the-Brain-_from-Imaging-Anatomy-of-the-Human-Brain_",
		actualName: "mri",
		pixelsWide: 720,
		pixelsTall: 720
	});
	videosInfo.push( {
		fileName: "Crystal_Structure_and_the_Laws_of_Thermodynamics",
		actualName: "crystalGrowth",
		pixelsWide: 1920,
		pixelsTall: 1080
	});
	videosInfo.push( {
		fileName: "Microscopic_Time-Lapse_of_Growing_Snowflake_-_Vyac",
		actualName: "snowflakeGrowth",
		pixelsWide: 1280,
		pixelsTall: 720
	});
	
	screenWidth = 0.5;
	var videoMeshes = Array(videosInfo.length);
	for(var i = 0; i < videoMeshes.length; i++)
	{
		videoMeshes[i] = new THREE.Mesh( 
				new THREE.PlaneGeometry( screenWidth, screenWidth / videosInfo[i].pixelsWide * videosInfo[i].pixelsTall ),
				new THREE.MeshBasicMaterial( { overdraw: true, side:THREE.DoubleSide } ) );
		
		// create the video element
		videoMeshes[i].documentElement = document.createElement( 'video' );
		videoMeshes[i].documentElement.src = "http://hamishtodd1.github.io/RILecture/Data/Slides/" + videosInfo[i].fileName + ".ogv";
		videoMeshes[i].documentElement.setAttribute('crossorigin', 'anonymous');
		videoMeshes[i].documentElement.load(); // must call after setting/changing source
		videoMeshes[i].documentElement.loop = true;
		
		var videoImage = document.createElement( 'canvas' );
		videoImage.width = videosInfo[i].pixelsWide;
		videoImage.height = videosInfo[i].pixelsTall;

		videoMeshes[i].context = videoImage.getContext( '2d' );
		// background color if no video present
		videoMeshes[i].context.fillStyle = '#000000';
		videoMeshes[i].context.fillRect( 0, 0, videoImage.width, videoImage.height );

		videoMeshes[i].material.map = new THREE.Texture( videoImage ); //for some reason this needs to be a separate variable, urgh!
		videoMeshes[i].material.map.minFilter = THREE.LinearFilter;
		videoMeshes[i].material.map.magFilter = THREE.LinearFilter;

		videoMeshes[i].update = function()
		{
			if( typeof this.documentElement !== 'undefined' && this.documentElement.readyState === this.documentElement.HAVE_ENOUGH_DATA)
			{
				this.context.drawImage( this.documentElement, 0, 0 );
				if( this.material.map ) 
					this.material.map.needsUpdate = true;
				
				if(this.documentElement.paused)
					this.documentElement.play();
			}
		}
		
		presentation.createNewHoldable( videosInfo[i].actualName + "Video", videoMeshes[i] );
	}
	
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