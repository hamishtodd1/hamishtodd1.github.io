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
		videoId:'i6mvoib9kYo',
		width: 480,
		height: 640,
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