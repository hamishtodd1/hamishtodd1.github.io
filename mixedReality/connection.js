/*
	AWS server
		https://console.aws.amazon.com/elasticbeanstalk/home?region=us-east-1#/newApplication
	Send page to Helen to check she can enable video in background
	Calibration
		Hmm, there will be a delay from the web
		You put the camera in place as usual
	Urgh how to "connect". You almost certainly can't have it come off your own laptop because no HDMI!
	Yeah, test! Have it come through server
	Check it at the venue, VR and all
	"see from my point of view" button
*/

const socket = io();
socket.on('yesYouAreConnectedToAServer', function(msg)
{
	socket.on('hey, I am a connected browser window', function(msg)
	{
		log("Ahh, someone else is connected");
	});

	socket.emit('hey, I am a connected browser window', {} );
})
console.error("Don't worry about the above")