var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var our_CurrentTime = 0;

var last_timeupdate = 0;

var rolling_sum = 0;
var num_samples_taken = 0;

function react_to_video()
{
	//seems to work, although if you've selected a special speed, then woe betide you frankly
	var probable_time_elapsed_in_video = delta_t * ytplayer.getPlaybackRate();
	
	var timeupdate = ytplayer.getCurrentTime();
	if( timeupdate === last_timeupdate)
	{
		if( ytplayer.getPlayerState() === 1 ) //it's playing. Problem though: we might need to wait longer than one frame for timeupdate to catch up
			our_CurrentTime += probable_time_elapsed_in_video;
	}
	else
	{	
		//A situation can happen like: their last update to that number was actually just after the last time you checked
		//then they update just before you check again. So they have a whole frame over you, and the reverse might put them a frame under you.
		var potential_new_STV = timeupdate;
		if( ytplayer.getPlayerState() === 1 )
			potential_new_STV += probable_time_elapsed_in_video / 2; //it probably reached this time in the middle of the last frame
		
		var jolt_size = potential_new_STV - (our_CurrentTime + probable_time_elapsed_in_video);
		rolling_sum += jolt_size;
		num_samples_taken++;
//		console.log( rolling_sum / num_samples_taken );
		
		if( potential_new_STV > our_CurrentTime || potential_new_STV < our_CurrentTime - 1 ) //we don't want to step back, unless maybe the player has!
			our_CurrentTime = potential_new_STV;
		
		last_timeupdate = timeupdate;
	}
	
	Update_story();
}

function onYouTubeIframeAPIReady()
{
	
	ytplayer = new YT.Player('player', 
	{
		width: window_width,
	    height: window_height,
	    videoId:'2a56CJ6J99w',
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
			} 
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
	ytplayer.chapterIDs = ['2a56CJ6J99w', '8GucPOjuR-I','8JndSqOn9ac','8JndSqOn9ac','8JndSqOn9ac'];
	ytplayer.changeChapter = function( newChapterIndex )
	{
		this.chapter = newChapterIndex;
		this.loadVideoById( this.chapterIDs[this.chapter]);
	}
//	ytplayer.changeChapter(1);
	
	/* _MF2DVU8oB0: tall video
	 * 8JndSqOn9ac: v1 (Robin)
	 * 7JlMIJKTUVc: v2
	 * N5StSZEnoQs: SOWN excerpt
	 * YJ7ROqawZNI: v3
	 * i5zjFIZYmr0: v4
	 * bhIIPgM5E4Q: v4.5
	 * qMyLxxHKags: rough cut 1
	 * zFLcpmOi1Hw: rough cut 2
	 * 
	 * Zika 8GucPOjuR-I
	 * Measles kXo0vsDGOoc
	 * intro 2a56CJ6J99w
	 */
}