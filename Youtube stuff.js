var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onPlayerReady(event) {
	MODE = 0;
	init();
	render();
}

/* _MF2DVU8oB0: tall video
 * lDMaeDoSNvM: test video
 * 8JndSqOn9ac: Robin video
 * Xa_m6yggMdU: V2 video
 */
function onYouTubeIframeAPIReady(){
	ytplayer = new YT.Player('player', {
		videoId:'Xa_m6yggMdU',
		height: window_height,
		width: window_height / 9 * 16,//9:16 is probably pushing it too far, but you should try it
		events: {
	        'onReady': onPlayerReady
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

function react_to_video(){
	/* Note that it is *finishing* time
	 * the second one is the time that we want the break-apart to BEGIN
	 * the opening of the QC is also when that animation will begin
	 * 
	 * with both QC and DNA, if the player goes into any other section, we should reset their coords
	 */
	var section_finishing_time = new Uint16Array([34,182,300,553,743,914,99999999999]); //first three were 3,7,14.
	var pausing_times = new Uint16Array([6,9]);
	
	var secondsthroughvid = ytplayer.getCurrentTime();
	for(var i = 0; i < section_finishing_time.length /*or whichever mode is last*/; i++) {
		if( section_finishing_time[i-1] <= secondsthroughvid && secondsthroughvid < section_finishing_time[i] && MODE != i)
			ChangeScene(i);
	}
	for(var i = 0; i < pausing_times.length /*or whichever mode is last*/; i++) {
		if( pausing_times[i] <= secondsthroughvid && secondsthroughvid < pausing_times[i] + 1 ){
			ytplayer.pauseVideo();
			console.log("paused?")
			pausing_times.splice(i);
		}
	}
	
	var crystalformation_time = 1028;
	if( secondsthroughvid == crystalformation_time){
		/*
		 * We're going to need a function to be updating it of course. Could be this one.
		 * 
		 * TODO: enable pausing, at some point
		 */
	}
}