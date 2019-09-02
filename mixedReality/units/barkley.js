async function initBarkley()
{
	var dimension = 128; //still kinda works at 180, but uh, best not to go there, and
	let textureDimensions = new THREE.Vector2(dimension,dimension*dimension);

	let initialState = new Float32Array( textureDimensions.x * textureDimensions.y * 4 );

	let layersToExciteU = [dimension / 2 + 10,dimension / 2 + 11];
	let layersToExciteV = [dimension / 2 + 12,dimension / 2 + 13,dimension / 2 + 14,dimension / 2 + 15];
	function ijkToI(i,j,k)
	{
		return i + k*dimension*dimension + dimension*j;
	}
	for(var i = 0; i < dimension; i++)
	for(var j = 0; j < dimension; j++)
	for(var k = 0; k < dimension; k++)
	{
		if( sq(i) + sq(k) >= sq(3*dimension/4) )
		// if( sq(i-dimension/2) + sq(k-dimension/2) >= sq(7*dimension/16) )
			continue;

		if( layersToExciteU.indexOf(j) !== -1 ) 
			initialState[ 4 * ijkToI(i,j,k) + 0] = 1.;

		if( layersToExciteV.indexOf(j) !== -1 ) 
			initialState[ 4 * ijkToI(i,j,k) + 1] = 1.;
	}

	let numStepsPerFrame = 10;
	var data2d = {value:null};
	await Simulation( textureDimensions, "barkley3d", "clamped", initialState, numStepsPerFrame, 
		data2d,
		{threeDDimensions:{value:new THREE.Vector3( dimension, dimension, dimension )}},
		THREE.LinearFilter )

	let scalarField = await scalarFieldVisualization(data2d,dimension);
	updateFunctions.push(function()
	{
		scalarField.rotation.y += 0.01
		// scalarField.rotation.x += 0.01
	})
}