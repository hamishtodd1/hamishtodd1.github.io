async function initBarkley()
{
	// let dimension = 128;
	// let threeDDimensions = new THREE.Vector3( dimension, dimension, dimension );
	// let textureDimensions = new THREE.Vector2(threeDDimensions.x,threeDDimensions.y*threeDDimensions.z);

	// let initialState = new Float32Array( textureDimensions.x * textureDimensions.y * 4 );

	// for ( let row = 0; row < threeDDimensions.y; row ++ )
	// for ( let column = 0; column < threeDDimensions.x; column ++ )
	// for ( let slice = 0; slice < threeDDimensions.z; slice ++ )
	// {
	// 	let firstIndex = ((row * threeDDimensions.x + column) * threeDDimensions.z + slice) * 4;

	// 	initialState[ firstIndex + 0 ] = 0.;//clamp(1 - 0.03 * new THREE.Vector3(row,column,slice).multiplyScalar(2.).distanceTo(threeDDimensions),0,1.);
	// 	initialState[ firstIndex + 1 ] = 0.;
	// 	initialState[ firstIndex + 2 ] = 0.;
	// 	initialState[ firstIndex + 3 ] = 0.;
	// }

	// let layersToExciteU = [dimension / 2 + 19,dimension / 2 + 20];
	// let layersToExciteV = [dimension / 2 + 21,dimension / 2 + 22,dimension / 2 + 23,dimension / 2 + 24];
	// for(var k = 0; k < 3*dimension/4; k++)
	// for(var i = 0; i < 3*dimension/4; i++)
	// {
	// 	initialState[4*(i + k*dimension*dimension + dimension*(layersToExciteU[0])) + 0] = 1.;
	// 	initialState[4*(i + k*dimension*dimension + dimension*(layersToExciteU[1])) + 0] = 1.;
		
	// 	initialState[4*(i + k*dimension*dimension + dimension*(layersToExciteV[0])) + 1] = 1.;
	// 	initialState[4*(i + k*dimension*dimension + dimension*(layersToExciteV[1])) + 1] = 1.;
	// 	initialState[4*(i + k*dimension*dimension + dimension*(layersToExciteV[2])) + 1] = 1.;
	// 	initialState[4*(i + k*dimension*dimension + dimension*(layersToExciteV[3])) + 1] = 1.;
	// }

	// let numStepsPerFrame = 9; //maaaaaybe worth making sure it's even
	// let extraUniforms = {}
	// extraUniforms.data2d = {value:null};
	// await Simulation( textureDimensions, "barkley3d", "clamped", initialState, numStepsPerFrame, 
	// 	extraUniforms.data2d,
	// 	{threeDDimensions:{value:threeDDimensions}},
	// 	THREE.LinearFilter )
	// // updateFunctions.push(function()
	// // {
	// // 	log(material.uniforms.data2d.value.minFilter, THREE.LinearFilter)
	// // })
	// extraUniforms.texture2dDimension = {value: dimension }

	await scalarFieldVisualization();
}