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
		videoId:'lDMaeDoSNvM',
		width: 640,
		height: 480,
	    events: {
	        'onReady': onPlayerReady
	    },
		playerVars: {
			autoplay: 1,
			controls: 0
		}
	});
}