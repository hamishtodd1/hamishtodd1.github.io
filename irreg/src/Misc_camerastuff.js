function UpdateCamera() 
{
	{
		//z is the time through
		var displacementAtZero = 0.1;
		var amplitudeEnvelope = Math.pow( 2, -camera.directionalShake.z * 6 ) * displacementAtZero; //can make it "sharper" by changing 2
		//0.5 is just about noticeable, 
		if( amplitudeEnvelope < 0.0001 ) //finished
		{
			amplitudeEnvelope = 0;
			camera.directionalShake.x = 0;
			camera.directionalShake.y = 0;
		}
		
		var frequency = 5;
		var amplitude = Math.sin( camera.directionalShake.z * TAU * frequency );
		amplitude *= amplitudeEnvelope;
		
		camera.position.sub( camera.directionalShakeContribution );
		
		camera.directionalShakeContribution.copy( camera.directionalShake );
		camera.directionalShakeContribution.z = 0;
		camera.directionalShakeContribution.setLength(amplitude); //magnitude of the directionalShake x and y are irrelevant
		
		camera.position.add( camera.directionalShakeContribution );
		
		camera.directionalShake.z += delta_t;
	}
	
	if( camera.randomShake != 0)
	{
		var randomTheta = Math.random() * TAU;
		var randomLength = Math.random() * camera.randomShake; //probably times something
		var shakeVector = new THREE.Vector3( randomLength * Math.sin(randomTheta), randomLength * math.cos(randomTheta), 0 );

		camera.position.x = shakeVector.x;
		camera.position.y = shakeVector.y;
		
		camera.randomShake -= delta_t;
		if(camera.randomShake < 0)
			camera.randomShake = 0;
	}
	
	camera.updateMatrix();
	camera.updateMatrixWorld();
}