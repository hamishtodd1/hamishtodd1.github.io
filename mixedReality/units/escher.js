/*
	The size of the scaling is what makes escher's version weirder than most
	What happens if you make it REALLY small? Close up the singularity?

	You are holding a rectangle on which you see a duplicate of the whole video
	But then you can grab the frame and connect it to the frame of your real video
	(and the copy of you does it to the one it is holding, etc)

	Explain the omission of the singularity

	Hah, move it all the way towards the camera and it looks normal. And if you move it off screen?

	The picture frame is a funny thing, it is a portal into another world.
	It's extraordinary that our minds buy it, but we don't appreciate that when we walk around and look at pictures
	I think escher wanted to heighten that appreciation 
*/

function initEscher()
{
	let loader = new THREE.TextureLoader().setCrossOrigin(true)
	loader.load("data/fish.png",function(png)
	{
		let bottomLeftISuppose = new THREE.Vector2(0,0)

		let params = {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			format: THREE.RGBAFormat,
			stencilBuffer: false,
			depthBuffer: false,
			premultiplyAlpha: false,
			type: THREE.FloatType // THREE.HalfFloat for speed
		};
		let textureRenderTarget = new THREE.WebGLRenderTarget( renderer.domElement.width, renderer.domElement.height, params );
		let texture = textureRenderTarget.texture

		let closedMouthMesh = new THREE.Mesh(new THREE.PlaneGeometry(.1,.1),new THREE.MeshBasicMaterial({map:texture}) )
		scene.add(closedMouthMesh)
		closedMouthMesh.position.copy(rightHand.position)

		// let otherScene = new THREE.Scene()
		// let otherCam = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, 1, 10 );
		// renderer.render( scene, camera );


		updateFunctions.push(function()
		{
			let nonSimulationRenderTarget = renderer.getRenderTarget();
			renderer.setRenderTarget( textureRenderTarget )
			renderer.render( scene, camera );
			renderer.setRenderTarget( nonSimulationRenderTarget );
		})
	},function(){},function(e){console.error(e)})
}

// {
// 	cameraOrtho = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, 1, 10 );
// 	cameraOrtho.position.z = 10;

// 	var width = window.innerWidth;
// 	var height = window.innerHeight;
// 	camera = new THREE.PerspectiveCamera( 70, width / height, 1, 1000 );
// 	camera.position.z = 20;
// 	scene = new THREE.Scene();
// 	scene.background = new THREE.Color( 0x20252f );
	
// 	var geometry = new THREE.TorusKnotBufferGeometry( 3, 1, 256, 32 );
// 	var material = new THREE.MeshStandardMaterial( { color: 0x6083c2 } );
// 	mesh = new THREE.Mesh( geometry, material );
// 	scene.add( mesh );
// 	//
// 	var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
// 	scene.add( ambientLight );
// 	var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
// 	camera.add( pointLight );
// 	scene.add( camera );
// 	//
// 	var data = new Uint8Array( textureSize * textureSize * 3 );
// 	texture = new THREE.DataTexture( data, textureSize, textureSize, THREE.RGBFormat );
// 	texture.minFilter = THREE.NearestFilter;
// 	texture.magFilter = THREE.NearestFilter;
// 	//
// 	{
// 		var halfWidth = window.innerWidth / 2;
// 		var halfHeight = window.innerHeight / 2;
// 		var halfImageWidth = textureSize / 2;
// 		var halfImageHeight = textureSize / 2;
// 		sprite.position.set( - halfWidth + halfImageWidth, halfHeight - halfImageHeight, 1 );
// 	}
// 	var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
// 	sprite = new THREE.Sprite( spriteMaterial );
// 	sprite.scale.set( textureSize, textureSize, 1 );
// 	scene.add( sprite );
// 	updateSpritePosition();
// 	//
// 	renderer = new THREE.WebGLRenderer( { antialias: true } );
// 	renderer.setPixelRatio( window.devicePixelRatio );
// 	renderer.setSize( window.innerWidth, window.innerHeight );
// 	renderer.autoClear = false;
// 	document.body.appendChild( renderer.domElement );
// 	//
// 	var overlay = document.getElementById( 'overlay' );
// 	var controls = new OrbitControls( camera, overlay );
// 	controls.enablePan = false;
// 	//
// 	window.addEventListener( 'resize', onWindowResize, false );
// }

// function animate() {
// 	requestAnimationFrame( animate );
// 	mesh.rotation.x += 0.005;
// 	mesh.rotation.y += 0.01;
// 	renderer.clear();
// 	renderer.render( scene, camera );
// 	// calculate start position for copying data
// 	vector.x = ( window.innerWidth * dpr / 2 ) - ( textureSize / 2 );
// 	vector.y = ( window.innerHeight * dpr / 2 ) - ( textureSize / 2 );
// 	renderer.copyFramebufferToTexture( vector, texture );
// 	renderer.clearDepth();
// 	renderer.render( sceneOrtho, cameraOrtho );
// }