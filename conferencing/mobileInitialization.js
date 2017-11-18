/*
 * Note: you have to be in image transferring mode and you may need to run "adb devices"
 * 
 * NEED TO TALK TO KYLE ABOUT COMPILING COOT WITH KYLE Stevenson
 * 
 * blue lines need to be one pixel, or thinner, or shiny, and more neutral/pastel
 */

/* 	People should be able to grab you in coot and move you towards a part of the molecule. But that actually moves that part of the molecule closer to you on the client, muhahaha
 * Seeing your partner's cursor... it's a disembodied object... you could do it as a ray but better would be if it went to whichever atom it was on.
 * 	And it is attached to the camera or whatever representing their head. So you can grab their camera and move it so that their cursor overlaps the right thing
 * 
 * Refine/regularize, minimize, optimize
 * 
 * Fundamentally: add, delete, move
 * 	Rigid body refinement
 * 
 * For building into low-rez alpha helices in EM, want the fast building of new backbone
 * 
 * Soon: handles on the "visible part" - both the contour area and the area in which the molecule is visible
 * 
 */

/*
 * Paul: "you have to decide whether to wag the tail or the dog". This is a major part of model building
 * 		It is fine for things to become detatched from the "next" amino acid.
 * 		Working out phipsi is easier
 * 		How does coot do it?
			However, you probably don't want to worry about the effect rippling up
			Sad: we could try to do it ourselves but that would probably create reproduction issues
		The argument in favour of atom parenting *would* be that it's terribly easy to change everything "beyond" a modified AA with one transformation (of its matrix)
			But that's a bad argument because at least a few things above will be transformed god-knows-how. Yeah a bunch of it will end up being a matrix but still. Is Paul aware of this?
		Look, it's about transformations. Yeah, you can manipulate things directly through vertices, but you'll want to use transformations applied to the whole lot. You already have some of these!

	Shader idea (ask George)
		Note the number of atoms and bonds you need can change, maybe undermining shader
		Ohhh, could group according to color? But in the case of sphere refine you'd be updating many colors.
		One instinct: surely multiplying by modelViewMatrix is something, right? If you shift all the atom positions into a separate thing in the shader, you're kinda doing something already handled by that?
		Either way, we are going to have a single object3D with all that data, can get to work on that.
		
	George notes transparency solutions: "weighted blended order independent transparency" "dual depth peeling"
 */

function mobileInitialize()
{
	var labels = [];
	
	var launcher = {
		socketOpened: false,
		fontLoaded: false,
		attemptLaunch: function()
		{
			/*
			 * tutModelWithLigand
			 * 
			 * ribosome.txt
			 * oneAtomOneBond.txt
			 * 3C0.lst
			 */
			
			if(!this.socketOpened || !this.fontLoaded)
				return;
			else
			{
				//rename when it's more than model and map. "the workspace" or something
				modelAndMap = new THREE.Object3D();
				modelAndMap.scale.setScalar(0.01); //angstrom
				modelAndMap.position.z = -FOCALPOINT_DISTANCE;
				scene.add(modelAndMap);
				
				getAngstrom = function()
				{
					return modelAndMap.scale.x;
				}
				
//				initMutator();
				
				loadModel("data/tutModelWithLigand.txt", labels);
				loadMap("data/try-2-map-fragment.tab.txt");
				
				mobileLoop( socket, cursor, labels );
			}
		}
	}
	
	new THREE.FontLoader().load(  "data/gentilis.js", 
		function ( gentilis ) {
			THREE.defaultFont = gentilis;
			
			launcher.fontLoaded = true;
			launcher.attemptLaunch();
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load font" ); }
	);
	
	//initializing cursor
	{
		var coneHeight = 0.1;
		var coneRadius = coneHeight * 0.4;
		var cursorGeometry = new THREE.ConeGeometry(coneRadius, coneHeight,31);
		cursorGeometry.computeFaceNormals();
		cursorGeometry.computeVertexNormals();
		cursorGeometry.merge( new THREE.CylinderGeometry(coneRadius / 4, coneRadius / 4, coneHeight / 2, 31 ), (new THREE.Matrix4()).makeTranslation(0, -coneHeight/2, 0) );
		cursorGeometry.applyMatrix( (new THREE.Matrix4()).makeTranslation(0, -coneHeight / 2, 0) );
		cursorGeometry.applyMatrix( (new THREE.Matrix4()).makeRotationZ(TAU/8) );
		var cursor = new THREE.Mesh(
				cursorGeometry, 
				new THREE.MeshLambertMaterial({color:0x888888, side: THREE.DoubleSide })
		);
		
		cursor.grabbing = false;
		
		cursor.followers = [];
		cursor.oldWorldPosition = new THREE.Vector3();
		//if bugs appear that can be addressed with synchronous updating, you will probably notice them!
		
		camera.add(cursor);
	}
	
	scene.add( new THREE.PointLight( 0xFFFFFF, 1, FOCALPOINT_DISTANCE ) );
	
	ourOrientationControls = new THREE.DeviceOrientationControls(camera);
	
	ourStereoEffect = new THREE.StereoEffect( renderer );
	ourStereoEffect.stereoCamera.eyeSep = 0.0065;
	
	//this is for the fairphone in the daydream, and would need to be changed with eyeSep
//	ourStereoEffect.stereoCamera.cameraR.projectionMatrix.elements[8] = 0.442;
	
	document.addEventListener( 'mousedown', function(event)
	{
		console.log("hmm?")
		if( THREEx.FullScreen.activated() )
			return;
		
		THREEx.FullScreen.request(renderer.domElement);
	}, false );

	window.addEventListener( 'resize', function(event)
	{
		renderer.setSize( window.innerWidth, window.innerHeight );
		ourStereoEffect.setSize( window.innerWidth, window.innerHeight );

		camera.aspect = renderer.domElement.width / renderer.domElement.height;
		camera.updateProjectionMatrix();
	}, false );
	
	makeStandardScene(true);
	
//	initSphereSelector(cursor);

	//socket crap
	{
		socket = initSocket();
		
		socket.onopen = function( )
		{
			launcher.socketOpened = true;
			launcher.attemptLaunch();
		}
		
		socket.messageResponses["mousePosition"] = function(messageContents)
		{
			cursor.oldWorldPosition.copy(cursor.getWorldPosition());
			
			cursor.position.z = parseFloat( messageContents[2] ) - 1;
			var maxZ = 2; //maybe this should be about that clip plane thing
			cursor.position.z *= FOCALPOINT_DISTANCE * 2;
			
			cameraFrustum = (new THREE.Frustum()).setFromMatrix(camera.projectionMatrix);
			
			var frustumWidthAtZ = renderer.domElement.width / renderer.domElement.height * 2 * Math.tan( camera.fov / 360 * TAU / 2 ) * -cursor.position.z;
			frustumWidthAtZ /= 2; //coz there's two
			cursor.position.x = (parseFloat( messageContents[1] ) - 0.5) * frustumWidthAtZ;
		}
		
		socket.messageResponses["lmb"] = function(messageContents)
		{
			if( parseInt( messageContents[1] ) )
				cursor.grabbing = true;
			else
				cursor.grabbing = false;
		}
		
		socket.messageResponses["This is the server"] = function(messageContents)
		{}
		
		//A solution to narrow screens. Works fine but we can't record it!
		//siiiiigh, it would introduce complexity for the user anyway
//		else if( messageContents[0] === "o" && parseInt( messageContents[1] ) )
//		{
//			ourStereoEffect.stereoCamera.cameraL.projectionMatrix.elements[8] -= 0.01;
//			ourStereoEffect.stereoCamera.cameraR.projectionMatrix.elements[8] += 0.01;
//			console.log(ourStereoEffect.stereoCamera.cameraL.projectionMatrix.elements[8])
//			console.log(ourStereoEffect.stereoCamera.cameraR.projectionMatrix.elements[8])
//		}
//		else if( messageContents[0] === "l" && parseInt( messageContents[1] ) )
//		{
//			ourStereoEffect.stereoCamera.cameraL.projectionMatrix.elements[8] += 0.01;
//			ourStereoEffect.stereoCamera.cameraR.projectionMatrix.elements[8] -= 0.01;
//			console.log(ourStereoEffect.stereoCamera.cameraL.projectionMatrix.elements[8])
//			console.log(ourStereoEffect.stereoCamera.cameraR.projectionMatrix.elements[8])
//		}
	}
}