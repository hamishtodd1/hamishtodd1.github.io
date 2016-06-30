/*
 * The rule is: the pure version has all the capabilities. This file, and maybe others, is where things become organized.
 * 
 * Flash 10 is required, TODO check for that
 * 
 */

//----------youtube stuff
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var section_finishing_time = Array(6000,6000,6000,6000,6000,6000,6000,99999999999);
var pausing_times = Array(62,75,321.3,550,747.9,931);
var secondsthroughvid = 0;

function react_to_video()
{
	var timeupdate = ytplayer.getCurrentTime();
	if(timeupdate != Math.floor(secondsthroughvid) ){
		var discrepancy = timeupdate - Math.floor(secondsthroughvid);
		if(discrepancy == 1) //a very normal update
			secondsthroughvid = timeupdate;
		else if(discrepancy > 1 ) //either our framerate is completely hopeless or they skipped ahead
			secondsthroughvid = timeupdate;
		else if(discrepancy == -1) //we've gone a full second ahead, so maybe they've paused or our delta_t's are more than the sum of their parts. Hopefully they'll catch up
			secondsthroughvid = Math.floor(secondsthroughvid);
		else if(discrepancy < -1) //they've gone back, we should follow
			secondsthroughvid = timeupdate;
		//if it's 0 then things are as normal
		//there are much better ways of checking for a pause but this is not hugely important
	}
	secondsthroughvid += delta_t;
	
	for(var i = 0; i < pausing_times.length /*or whichever mode is last*/; i++) {
		if( pausing_times[i] <= secondsthroughvid && secondsthroughvid < pausing_times[i] + 1 ){
			pausing_times[i] = -1; //won't need that again
			ytplayer.pauseVideo();
		}
	}
}

/* _MF2DVU8oB0: tall video
 * lDMaeDoSNvM: test video
 * 8JndSqOn9ac: Robin video
 * Xa_m6yggMdU: V2 video
 * D_DkCTT8azI: V2 resized
 * 7JlMIJKTUVc: final v2
 * N5StSZEnoQs: SOWN excerpt
 * FfhbOvtlNds: v3 video
 */
function onYouTubeIframeAPIReady()
{
	ytplayer = new YT.Player('player', {
		videoId:'FfhbOvtlNds',
		height: window_height,
		width: window_height,
		events: {
	        'onReady': function() { YOUTUBE_READY = 1; attempt_launch(); }
	    },
		playerVars: {
			autoplay: 1,
//			controls: 0,
			fs: 0,
			rel: 0,
			showinfo: 0,
			modestbranding: 1,
		}
	});
}