/*
For thursday:
	Get rid of all in main chain?
	"Make me the master" button?
	Remove logged out heads

Go in there and set up
	You want the server in there so you can change things
	Record? Paper?
	
After
	Daydream/SSL urgh
	instead of id, you want to generate a bit.ly
	trackpad is best with zoom, have separate thing for that
	That chimera thing

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
			console.log(platform)
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

	makeScene(true);

	var visiBox = initVisiBox(thingsToBeUpdated);

	launcher.attemptLaunch();
}

function initPoiSphereAndButtonMonitorerAndMovementSystem()
{
	var poiSphere = makePoiSphere();
	scene.add(poiSphere);

	var buttonsHeld = {
		forward:false,
		backward:false,
		left:false,
		right:false
	}

	function moveCamera()
	{
		var forward = poiSphere.getPoi(camera).sub(camera.position).multiplyScalar(0.05);
		if(buttonsHeld.forward)
		{
			camera.position.add(forward);
		}
		else if(buttonsHeld.backward)
		{
			camera.position.sub(forward);
		}
		else if(buttonsHeld.left)
		{
			camera.position.add( new THREE.Vector3(-0.003,0,0).applyEuler(camera.rotation) );
		}
		else if(buttonsHeld.right)
		{
			camera.position.add( new THREE.Vector3(0.003,0,0).applyEuler(camera.rotation) );
		}
		// else
		// {
		// 	return;
		// }
		// camera.updateMatrix();
		// socket.emit("cameraPosition",camera.matrix);
	}

	return {poiSphere:poiSphere,buttonsHeld:buttonsHeld,moveCamera:moveCamera};
}

function makePoiSphere()
{
	var poiSphere = new THREE.Object3D();

	poiSphere.getPoi = function(nominalCamera)
	{
		var pointOfInterestInModel = new THREE.Vector3(0,0,-0.1)
		nominalCamera.localToWorld( pointOfInterestInModel );
		return pointOfInterestInModel;
	}

	for(var i = 0; i < 3; i++)
	{
		poiSphere.add(new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({color:0xFFFFFF})));
		var numVertices = 32;
		for(var j = 0; j < numVertices+1; j++)
		{
			var a = new THREE.Vector3().setComponent((i+1)%3,0.004);
			a.applyAxisAngle(new THREE.Vector3().setComponent(i,1), j/numVertices * TAU);
			poiSphere.children[i].geometry.vertices.push(a)
		}
	}
	return poiSphere;
}