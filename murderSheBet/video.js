function initVideo()
{
	let id = "dc_V-OcQ5IA"

	//hmm ideally can have something local. So what, playing arbitrary video files? No thanks
	var div = document.createElement( 'div' );
	div.style.width = '480px';
	div.style.height = '360px';
	div.style.backgroundColor = '#000';

	var iframe = document.createElement( 'iframe' );
	iframe.style.width = div.style.width
	iframe.style.height = div.style.height
	iframe.style.border = '0px';
	iframe.src = [ 'https://www.youtube.com/embed/', id, '?rel=0' ].join( '' );

	div.appendChild( iframe );
	var object = new THREE.CSS3DObject( div );
	object.scale.multiplyScalar(0.004)

	scene.add(object)
}

function initSelectors()
{
	let selector = new THREE.Mesh( new THREE.PlaneGeometry(0.1,0.1) )
	scene.add(selector)

	selector.bets = []

	// var buttonIndexGivenName = {
	// 	"enter":13,
	// 	"alt":18,
	// 	"shift":16,

	// 	"left":37,
	// 	"up":38,
	// 	"right":39,
	// 	"down":12,
	// 	"space":32,

	// 	"[":219,
	// 	"]":221
	// }
	// var keycodeArray = "0123456789abcdefghijklmnopqrstuvwxyz";
	// //don't use ctrl or other things that conflict
	// document.addEventListener( 'keydown', function(event)
	// {
	// 	for( var buttonName in buttonBindings )
	// 	{
	// 		if( event.keyCode === buttonIndexGivenName[buttonName] )
	// 		{
	// 			buttonBindings[buttonName]();
	// 		}
	// 	}

	// 	var arrayposition;
	// 	if( 48 <= event.keyCode && event.keyCode <= 57 )
	// 	{
	// 		arrayposition = event.keyCode - 48;
	// 	}
	// 	if( 65 <= event.keyCode && event.keyCode <= 90 )
	// 	{
	// 		arrayposition = event.keyCode - 55;
	// 	}
	// 	if( buttonBindings[ keycodeArray[arrayposition] ] !== undefined )
	// 	{
	// 		buttonBindings[ keycodeArray[arrayposition] ]();
	// 	}
	// }, false );
}