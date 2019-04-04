/*
	Slides.net
		The teacher can make a presentation, import whatever they like
		There's a set of webpages, not just one per lesson but one per exercise
		you copy their links, "teacher links". The server detects that someone is accessing a teacher link and flicks the student webpages to that

	Facilitate a real conversation between 1 person and many
		Would be nice to have a thing above every kid's head saying how they're doing
		Kinda want the teacher to choose win/loss conditions. They don't get "how well you did", they just get your answer
		Teacher could make sure that a non-troublemaker wins the competitions?
		Teacher sets a puzzle they all try to do it, one who gets it has their solution recorded and shown on the master? Or they’re superimposed?	
*/

function init( packing )
{
	var renderer = new THREE.WebGLRenderer({ antialias: true });
	document.body.appendChild( renderer.domElement );

	function render()
	{
		{
			frameDelta = clock.getDelta();
			
			mouse.updateFromAsyncAndCheckClicks();

			for(var i = 0; i < updatables.length; i++)
			{
				updatables[i].update();
			}

			frameCount++;
		}

		requestAnimationFrame( render );
		renderer.render( scene, camera );
	}

	initStage();
	initCameraAndRendererResizeSystem(renderer);
	initChapters()
	initMouse();

	packing ? initPacking() : initClt()

	finishSettingUpChapters()

	render();
}