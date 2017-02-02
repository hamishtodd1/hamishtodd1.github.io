function initVideos( presentation )
{
	var videosInfo = [];
	videosInfo.push( {
		fileName: "diffraction_rotating",
		actualName: "diffraction",
		pixelsWide: 1920,
		pixelsTall: 1080
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
	videosInfo.push( {
		fileName: "Sagittal-T2-of-the-Brain-_from-Imaging-Anatomy-of-the-Human-Brain_",
		actualName: "mri",
		pixelsWide: 720,
		pixelsTall: 720
	});
	
	var updateVideo = function()
	{
		if( this.documentElement.readyState === this.documentElement.HAVE_ENOUGH_DATA )
		{
			if( this.documentElement.paused )
				this.documentElement.play();
			
			this.imageContext.drawImage( this.documentElement, 0, 0 );
			if ( this.material.map ) 
				this.material.map.needsUpdate = true;			
		}
	}
	
	var screenWidth = 0.5;
	for( var i = 0; i < videosInfo.length; i++ )
	{
		var video = new THREE.Mesh( //movie image will be scaled to fit these dimensions.
				new THREE.PlaneGeometry( screenWidth, screenWidth / videosInfo[i].pixelsWide * videosInfo[i].pixelsTall ),
				new THREE.MeshBasicMaterial( { overdraw: true, side:THREE.DoubleSide } ) );
		
		video.documentElement = document.createElement( "video" );
		// video.type = ' video/ogg; codecs="theora, vorbis" ';
		video.documentElement.src = "http://hamishtodd1.github.io/RILecture/Data/Slides/" + videosInfo[i].fileName + ".ogv";
		video.documentElement.loop = true;
//		video.documentElement.muted = true;
		video.documentElement.setAttribute('crossorigin', 'anonymous');
		
		video.documentElement.load(); //AFTER setting source
		
		var videoImage = document.createElement( "canvas" );
		videoImage.width = videosInfo[i].width;
		videoImage.height = videosInfo[i].height;

		video.imageContext = videoImage.getContext( '2d' );
		video.imageContext.fillStyle = '#000000';
		video.imageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

		video.material.map = new THREE.Texture( videoImage );
		video.material.map.minFilter = THREE.LinearFilter;
		video.material.map.magFilter = THREE.LinearFilter;
		
		video.update = updateVideo;
		
		presentation.createNewHoldable( videosInfo[i].actualName + "Video", video );
	}
}