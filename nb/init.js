/*
	The "context"
		Slides.net
			The teacher can make a presentation, import whatever they like
			There's a set of webpages, not just one per lesson but one per exercise
			you copy their links, "teacher links". The server detects that someone is accessing a teacher link and flicks the student webpages to that

	If a kid's computer crashes, they should instantly be returned

	Would be nice to have a thing above every kid's head saying how they're doing

	Kinda want the teacher to choose win/loss conditions. They don't get "how well you did", they just get your answer

	Facilitate a real conversation between 1 person and many

	The goal is to get them to invent the terms themselves

	We assume only one classroom is ever being used for this

	Could have pinch to zoom if you want navigation... but not really, should be single-screen

	Teacher can just "advance simulation", same as powerpoint
 
	It looks like Evolution of Trust. Kids can go backwards but not forwards.
		But not while teacher is demonstrating. There, you see everything on your own computer

	Teacher could make sure that a non-troublemaker wins the competitions?

	First person to start a session (picked from a bunch on the website) has that session. The url changes to 

	Teacher sets a puzzle they all try to do it, one who gets it has their solution recorded and shown on the master? Or they’re superimposed?

	“Teacher is currently demonstrating” mode and “free interaction” mode?

	Various ways teachers could be “pranked”. One problem is you don’t know which kids have which laptops.
*/

function init( ourID )
{
	var renderer = new THREE.WebGLRenderer({ antialias: true });
	document.body.appendChild( renderer.domElement );

	function render()
	{
		{
			frameDelta = clock.getDelta();
			
			mouse.updateFromAsyncAndCheckClicks();

			for(var i = 0; i < objectsToBeUpdated.length; i++)
			{
				objectsToBeUpdated[i].update();
			}

			frameCount++;
		}

		requestAnimationFrame( render );
		renderer.render( scene, camera );
	}

	initStage();
	initCameraAndRendererResizeSystem(renderer);
	initMouse();

	// initPacking()
	initClt();

	render();
}