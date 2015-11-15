var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onPlayerReady(event) {
	init();
	render();
}

function onYouTubeIframeAPIReady(){
	ytplayer = new YT.Player('player', {
		videoId:'_MF2DVU8oB0',
		height: window_height,
		width: window_height / 4 * 3,//9:16 may be pushing it too far, but you should try it
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

function get_time(){
	ytplayer.getCurrentTime();
}