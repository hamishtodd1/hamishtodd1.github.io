/*
For thursday:
	Ensure VR works on your laptop
	Get mouse position for daydream from another computer
	Get rid of all not in main chain?
	Remove logged out heads
	"Make me the master" button?
	Switch to single room
	
After
	Daydream/SSL urgh
	instead of id, you want to generate a bit.ly
	trackpad is best with zoom, have separate thing for that
	That chimera thing
	"make self master viewport"

	Show their frusta?

	Hmm, people waving their heads around may be distracting...


 */

function crossPlatformInitialize(socket, pdbWebAddress, roomKey)
{
	//ideally you don't have to wait, you just have callback functions when download is completed
	var launcher = {
		render:null,
		dataLoaded:{
			font: false,
			controllerGeometry0: false,
			controllerGeometry1: false
		},
		attemptLaunch: function()
		{
			for(var data in this.dataLoaded)
			{
				if( !this.dataLoaded[data] )
					return;
			}

			var roomSign = TextMesh( roomKey, 0.5);
			roomSign.position.z = -2;
			scene.add(roomSign);

			loadModel(pdbWebAddress, thingsToBeUpdated );

			var platform = getPlatform();
			if(!initializers[platform])
				console.error("no initializer for ", platform)
			initializers[platform](socket, pdbWebAddress, roomKey, launcher, visiBox, thingsToBeUpdated, renderer, userManager,
				controllerGeometries);

			this.render();
		}
	}

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.localClippingEnabled = true; //necessary if it's done in a shader you write?
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	console.log(renderer)

	model = new THREE.Object3D();
	model.scale.setScalar( 0.01 ); //0.028 is nice
	getAngstrom = function()
	{
		return model.scale.x;
	}
	model.position.z = -FOCALPOINT_DISTANCE;
	scene.add(model);

	var thingsToBeUpdated = {};
	thingsToBeUpdated.labels = [];

	{
		var controllerGeometries = Array(2);
		function loadControllerGeometry(i)
		{
			new THREE.OBJLoader().load( "data/external_controller01_" + (i===LEFT_CONTROLLER_INDEX?"left":"right") + ".obj",
				function ( object ) 
				{
					controllerGeometries[i] = object.children[0].geometry;
					controllerGeometries[i].applyMatrix( new THREE.Matrix4().makeRotationAxis(xAxis,0.5) );
					controllerGeometries[i].applyMatrix( new THREE.Matrix4().makeTranslation((i==LEFT_CONTROLLER_INDEX?1:-1)*0.002,0.036,-0.039) );
					console.log(controllerGeometries[i])
					
					launcher.dataLoaded["controllerGeometry"+i.toString()] = true;
					launcher.attemptLaunch();
				},
				function ( xhr ) {}, function ( xhr ) { console.error( "couldn't load OBJ" ); } );
		}
		loadControllerGeometry(0);
		loadControllerGeometry(1);
	}
	var userManager = initUserManager(controllerGeometries,socket);
	
	new THREE.FontLoader().load( "data/gentilis.js", 
		function ( gentilis ) {
			THREE.defaultFont = gentilis;
			
			launcher.dataLoaded.font = true;
			launcher.attemptLaunch();
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load font" ); }
	);
	
	scene.add( new THREE.PointLight( 0xFFFFFF, 1, FOCALPOINT_DISTANCE ) );
	
	window.addEventListener( 'resize', function(){
		console.log("resizing")
	    renderer.setSize( window.innerWidth, window.innerHeight ); //nothing about vr effect?
	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();
	}, false );

	makeScene(true);

	var visiBox = initVisiBox(thingsToBeUpdated);

	launcher.attemptLaunch();
}