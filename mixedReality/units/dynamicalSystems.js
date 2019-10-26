/*
	Slicing probably
*/

function initDynamicalSystems()
{
	let axes = [];
	for(let i = 0; i < 3; i++)
	{
		axes[i] = new THREE.Mesh(new THREE.CylinderBufferGeometry(.002,.002,.2,16))
		scene.add(axes[i])
		axes[i].position.copy(rightHand.position)
	}
	axes[0].rotation.x = TAU/4;
	axes[1].rotation.z = TAU/4;

	let numArrows = 10;

	let arrowGeometry = new THREE.ConeGeometry(.1,.1)
	let mesh = new THREE.InstancedMesh( arrowGeometry,new THREE.MeshNormalMaterial(), numArrows );
	mesh.position.copy(rightHand.position)
	scene.add( mesh );

	let dummy = new THREE.Object3D();
	for ( var i = 0; i < numArrows; i ++ )
	{
		dummy.position.set(Math.random()-.5,Math.random()-.5,Math.random()-.5)
		dummy.position.multiplyScalar(.1)

		dummy.quaternion.set(Math.random()-.5,Math.random()-.5,Math.random()-.5,Math.random()-.5)
		dummy.quaternion.normalize()

		dummy.updateMatrix();
		mesh.setMatrixAt( i, dummy.matrix );
	}

	mesh.instanceMatrix.needsUpdate = true;
}





// {
// 	var vector = new THREE.Vector4();
// 	var instances = 50000;
// 	var positions = [];
// 	var offsets = [];
	
// 	var orientationsStart = [];
// 	var orientationsEnd = [];
// 	positions.push( 0.025, - 0.025, 0 );
// 	positions.push( - 0.025, 0.025, 0 );
// 	positions.push( 0, 0, 0.025 );
// 	// instanced attributes
// 	for ( var i = 0; i < instances; i ++ ) {
// 		// offsets
// 		offsets.push( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
// 		// orientation start
// 		vector.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
// 		vector.normalize();
// 		orientationsStart.push( vector.x, vector.y, vector.z, vector.w );
// 		// orientation end
// 		vector.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
// 		vector.normalize();
// 		orientationsEnd.push( vector.x, vector.y, vector.z, vector.w );
// 	}
// 	var geometry = new THREE.InstancedBufferGeometry();
// 	geometry.maxInstancedCount = instances; // set so its initalized for dat.GUI, will be set in first draw otherwise
// 	geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
// 	geometry.addAttribute( 'offset', new THREE.InstancedBufferAttribute( new Float32Array( offsets ), 3 ) );
// 	geometry.addAttribute( 'orientationStart', new THREE.InstancedBufferAttribute( new Float32Array( orientationsStart ), 4 ) );
// 	geometry.addAttribute( 'orientationEnd', new THREE.InstancedBufferAttribute( new Float32Array( orientationsEnd ), 4 ) );
// 	// material
// 	var material = new THREE.RawShaderMaterial( {
// 		uniforms: {
// 			"time": { value: 1.0 },
// 			"sineTime": { value: 1.0 }
// 		},
// 		vertexShader: document.getElementById( 'vertexShader' ).textContent,
// 		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
// 		side: THREE.DoubleSide,
// 		transparent: true
// 	} );
// 	//
// 	var mesh = new THREE.Mesh( geometry, material );
// 	scene.add( mesh );
// 	//
// 	renderer = new THREE.WebGLRenderer();
// 	renderer.setPixelRatio( window.devicePixelRatio );
// 	renderer.setSize( window.innerWidth, window.innerHeight );
// 	container.appendChild( renderer.domElement );
// 	if ( renderer.extensions.get( 'ANGLE_instanced_arrays' ) === null ) {
// 		document.getElementById( 'notSupported' ).style.display = '';
// 		return;
// 	}
// 	//
// 	var gui = new GUI( { width: 350 } );
// 	gui.add( geometry, 'maxInstancedCount', 0, instances );
// 	//
// 	stats = new Stats();
// 	container.appendChild( stats.dom );
// 	//
// 	window.addEventListener( 'resize', onWindowResize, false );
// }
// function onWindowResize() {
// 	camera.aspect = window.innerWidth / window.innerHeight;
// 	camera.updateProjectionMatrix();
// 	renderer.setSize( window.innerWidth, window.innerHeight );
// }
// //
// function animate() {
// 	requestAnimationFrame( animate );
// 	render();
// 	stats.update();
// }
// function render() {
// 	var time = performance.now();
// 	var object = scene.children[ 0 ];
// 	object.rotation.y = time * 0.0005;
// 	object.material.uniforms[ "time" ].value = time * 0.005;
// 	object.material.uniforms[ "sineTime" ].value = Math.sin( object.material.uniforms[ "time" ].value * 0.05 );
// 	renderer.render( scene, camera );
// }