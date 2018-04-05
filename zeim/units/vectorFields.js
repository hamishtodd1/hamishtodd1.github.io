/*
	An example is a circle that all points gravitate towards then start circulating
*/

function initVectorFields()
{
	var camera, tick = 0,
			scene, renderer, clock = new THREE.Clock(),
			controls, container, gui = new dat.GUI( { width: 350 } ),
			options, spawnerOptions, particleSystem;

	// The GPU Particle system extends THREE.Object3D, and so you can use it
	// as you would any other scene graph component.	Particle positions will be
	// relative to the position of the particle system, but you will probably only need one
	// system for your whole scene

	particleSystem = new THREE.GPUParticleSystem( {
		maxParticles: 250000
	} );
	scene.add( particleSystem );
	particleSystem.position.z = 0.6;
	options = {
		position: new THREE.Vector3(),
		positionRandomness: .3,
		velocity: new THREE.Vector3(),
		velocityRandomness: .5,
		color: 0xaa88ff,
		colorRandomness: .2,
		turbulence: .5,
		lifetime: 2,
		size: 5,
		sizeRandomness: 1
	};
	spawnerOptions = {
		spawnRate: 15000,
		horizontalSpeed: 1.5,
		verticalSpeed: 1.33,
		timeScale: 1
	};

	
	{
		if ( delta > 0 ) {
			options.position.x = Math.sin( tick * spawnerOptions.horizontalSpeed ) * 20;
			options.position.y = Math.sin( tick * spawnerOptions.verticalSpeed ) * 10;
			options.position.z = Math.sin( tick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed ) * 5;
			for ( var x = 0; x < spawnerOptions.spawnRate * delta; x++ ) {
				// Yep, that's really it.	Spawning particles is super cheap, and once you spawn them, the rest of
				// their lifecycle is handled entirely on the GPU, driven by a time uniform updated below
				particleSystem.spawnParticle( options );
			}
		}
		particleSystem.update( ourClock.elapsedTime );
	}
}