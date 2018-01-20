/*
	Man, could you do it without talking? Like the handymen

	Maybe the dignified thing is to have the same interface as the users. mousewheel to z, and rotate as they do

	Probably the pilotCamera "sits on your lap", it is not your face. Yeah, show frustum
	Make it so events can propagate back in time?
		For example, a goose is to pick up an object, but it turns its head to it first
	At some point may want to do black hole effects, eg something that will want to render for a long time, so timestep should be slowable
	Put links to your work at the end. It's just confusing to have a scrollbar
	avoid things being affected by pilotCamera movement, because that will be smoothed out
	As soon as there's a hololens like thing with hand controllers, be the first to do a good hand enabled VR lecture!
	If you're not running from a server (i.e. you're not intending to save things i.e. you're being run by a user), have some stuff come up in the console for the benefit of people who'd like to play around with it
	Theoretically possible: Video is always at an angle such that pilotCamera is looking at the same place that you in webcam video appear to be looking?

	To fork for every video or to not fork? Fork. Backwards compatibility shouldn't be a concern

	Make that 3D pong thing and a rotation thing.
		Maybe: there's a transparent sphere with a series of balls on it. the balls are dropping off one by one. 
		You must keep them above a hold that is in front of you

	Probably you will want to simulate the mouse with a controller sometimes

	Must follow simple principle: if I can do or change a thing, so can you.
		Probably impossible! You do want lots of points in 3d space
		Can we determine anything from this?
		Eg: proximity to the pilotCamera should never be an input to a function.
		Can make it so they can rotate stuff
		How about hands move in x and y only, and don't rotate at all, unless you hold in the analogue stick?
			That's an alternative way of doing this hand-binding thing
			If you do this, probably the pilotCamera thing will need to move back and forth as hand moves in z

	One proposal is to not actually have the pilotCamera move for the client, things just move relative to it
		Possibly bad because everything would be moving the whole time
		Could be great because with a blank background it would look like 3b1b et al
		Possibly better than alternative because people are just not used to seeing shit from a person's point of view
		Could average the position of your hands and have everything onscreen, and the pilotCamera, float around them
		Wallace and gromit inspired

	Try to make it so that the objects could work together. Build up a library that allows you to string things together.

	Puzzles go at the end

	Visualize the frustum

	Send to haxiomic, get "make it nicer looking for free by doing this:"

	TODO for slack demo:
		-59 icos object
			-A puzzle
		-Finish geese?
		-Working on tablets. Phones get embed, no need to worry about address bar
		-editing suite?
		-Funkiness in which you move your head and hand around and pilotCamera is in right place
		-aspect ratio crap. 16:9
		-Would be nice if people could spectate in monoscopic

	TODO for factorial tree
		-zoomable tree
		-sets
		-"interleaving"?
*/

(function init()
{
	var platform = getPlatform()
	if(platform === "phone")
	{
		var iframe = document.createElement("iframe");
	    iframe.setAttribute("src","https://www.youtube.com/embed/agOdP2Bmieg"); 
	    iframe.style.width  = window.innerWidth;
	    iframe.style.height = window.innerHeight;

	    document.body.appendChild(iframe);
	    return;
	}

	{
		var launcher = {
			initCompleted:false,
			dataLoaded:{
				controllerModel0: false,
				controllerModel1: false,
				recordedFrames:false,
			},
			attemptLaunch: function()
			{
				for(var data in this.dataLoaded)
				{
					if( !this.dataLoaded[data] )
					{
						return;
					}
				}

				//because the recorder data has to load before monitorer is ready
				initWindowResizeSystem(monitorer, renderer, spectatorCameraRepresentation);

				render();
			}
		}

		var renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio( window.devicePixelRatio );
		document.body.appendChild( renderer.domElement );

		var ourVrEffect = new THREE.VREffect( renderer );

		var loopCallString = getStandardFunctionCallString(loop);
		function render()
		{
			eval(loopCallString);
			ourVrEffect.requestAnimationFrame( function()
			{
				if( ourVrEffect.isPresenting ) //you're in vr. Hopefully this will work
				{
					ourVrEffect.render( scene, pilotCamera );
				}
				else
				{
					ourVrEffect.render( scene, spectatorCamera );
				}

				render();
			} );
		}
		
		var controllers = Array(2);
		var vrInputSystem = initVrInputSystem(controllers, launcher, ourVrEffect, renderer);
		
		makeScene(true);

		thingsToBeUpdated = [];
		holdables = {};
	}

	// var goose = new Goose();
	// goose.position.z = -0.1
	// scene.add(goose);
	// thingsToBeUpdated.goose = goose;

	var clickables = [];

	var monitorer = initMonitorer(clickables, launcher);

	// monitorer.monitorPositionAndQuaternion(controllers[0]);
	// monitorer.monitorPositionAndQuaternion(controllers[1]);

	{
		var spectatorCameraRepresentation = new THREE.Mesh(new THREE.CylinderGeometry(Math.sqrt(2)/2,Math.sqrt(2)/4,1,4), new THREE.MeshLambertMaterial({color:0xA0A0A0, side:THREE.DoubleSide}));
		spectatorCameraRepresentation.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-0.5,0))
		spectatorCameraRepresentation.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-TAU/4))
		spectatorCameraRepresentation.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ( TAU/8))

		var lineMaterial = new THREE.LineBasicMaterial({ color: 0xA0A0A0 });
		for(var i = 0; i < 4; i++)
		{
			spectatorCameraRepresentation.add(new THREE.Line(new THREE.Geometry(),lineMaterial));
			spectatorCameraRepresentation.children[i].geometry.vertices.push(spectatorCameraRepresentation.geometry.vertices[i].clone());
			spectatorCameraRepresentation.children[i].geometry.vertices.push(spectatorCameraRepresentation.geometry.vertices[i].clone().setZ(1));
		}

		scene.add(spectatorCameraRepresentation)

		spectatorCameraRepresentation.position.copy(spectatorCamera.position);
		// spectatorCameraRepresentation.position.z -= 1

		//you're going to git push
		//then you're going to turn it into a perspectivecamera because you want to be able to make things bigger and smaller!
	}

	{
		testObject = new THREE.Mesh( new THREE.SphereGeometry(0.01), new THREE.MeshLambertMaterial( {} ) );
		pilotCamera.add(testObject);
		testObject.position.z = -0.1;
		// testObject.update = function()
		// {
		// 	this.position.y = 0.01*Math.sin(frameTime*4);
		// 	this.rotation.z = Math.sin(frameTime*4.1);
		// }
		bestowDefaultMouseDragProperties(testObject);
		thingsToBeUpdated.push(testObject);
		clickables.push(testObject);
		monitorer.monitorPositionAndQuaternion(testObject);
	}

	initImages(thingsToBeUpdated, clickables);

	mouse = initMouse(renderer, clickables, monitorer);

	launcher.initCompleted = true;
	launcher.attemptLaunch();
})();