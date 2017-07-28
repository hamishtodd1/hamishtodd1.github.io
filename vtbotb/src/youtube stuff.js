var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var our_CurrentTime = 0;

var last_timeupdate = 0;

var rolling_sum = 0;

function react_to_video()
{
	//seems to work, although if you've selected a special speed, then woe betide you frankly
	var probable_time_elapsed_in_video = delta_t * ytplayer.getPlaybackRate();
	
	var timeupdate = ytplayer.getCurrentTime();
	if( timeupdate === last_timeupdate)
	{
		if( ytplayer.getPlayerState() === 1 || ytplayer.getPlayerState() === 3 ) //it's playing. Problem though: we might need to wait longer than one frame for timeupdate to catch up
			our_CurrentTime += probable_time_elapsed_in_video;
	}
	else
	{	
		//A situation can happen like: their last update to that number was actually just after the last time you checked
		//then they update just before you check again. So they have a whole frame over you, and the reverse might put them a frame under you.
		var potential_new_STV = timeupdate;
		if( ytplayer.getPlayerState() === 1 )
			potential_new_STV += probable_time_elapsed_in_video / 2; //we guess it reached this time in the middle of the last frame
		
		if( potential_new_STV > our_CurrentTime || potential_new_STV < our_CurrentTime - 1 ) //we don't want to step back, unless maybe the player has!
			our_CurrentTime = potential_new_STV;
		
		last_timeupdate = timeupdate;
	}
	
	Update_story();
}

function onYouTubeIframeAPIReady()
{
	var idArray = ['FCJawbntQVw', 'ruw8txSn8NM','gBqI7RxUjNk','zNLVleB5cJ4','8hRsRlLPkCw']; //intro, polio, hiv, zika, measles
	ytplayer = new YT.Player('player', 
	{
		width: renderer.domElement.width,
	    height: renderer.domElement.height,
	    videoId:idArray[0],
		events: 
		{
			'onReady': function() 
			{
				onWindowResize();
				YOUTUBE_READY = 1;
				ytplayer.seekTo( 0 );
				ytplayer.pauseVideo();
				
				var ourYT = document.getElementById('player');
				ourYT.allowFullscreen = false;
				ourYT.addEventListener( 'mouseleave', function(event) {
					justLeftiFrame = true;
				}, false);
				
				attempt_launch(); 
			},
		},
		playerVars: 
		{
			autoplay: 0,
			fs: 0,
			rel: 0,
			showinfo: 0,
			modestbranding: 1,
		}
	});
	
	ytplayer.chapter = 0;
	ytplayer.chapterIDs = idArray;
	ytplayer.changeChapter = function( newChapterIndex )
	{
		this.chapter = newChapterIndex;
		this.loadVideoById( this.chapterIDs[this.chapter]);
	}
//	ytplayer.changeChapter(3);
	
	/* 8JndSqOn9ac: v1 (Robin)
	 * 7JlMIJKTUVc: v2
	 * N5StSZEnoQs: SOWN excerpt
	 * YJ7ROqawZNI: v3
	 * i5zjFIZYmr0: v4
	 * bhIIPgM5E4Q: v4.5
	 * qMyLxxHKags: rough cut 1
	 * zFLcpmOi1Hw: rough cut 2
	 * '2a56CJ6J99w', 'bd3QdDBalds','2g_i7RTVAYE','8GucPOjuR-I','6iq3JNT7jAc'
	 */
}