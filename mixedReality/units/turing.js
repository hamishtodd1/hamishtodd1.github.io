/*
	TODO for boston
		Transfer to zeimLight
		flat simulation
		recording works ok
		just pictures is fine
*/

async function initTuring(gl)
{
	// await initPics([
	// 	"dappled.png",
	// 	"fish.png",
	// 	// "sintel.mp4"
	// ],"turing")

	// await initGrayScottSimulation(gl)

	//3d
	{
		var dimension = 128; //still kinda works at 180, but uh, best not to go there, and
		let textureDimensions = new THREE.Vector2(dimension,dimension*dimension);

		let initialState = new Float32Array( textureDimensions.x * textureDimensions.y * 4 );

		let layersToExciteU = [dimension / 2 + 10,dimension / 2 + 11];
		let layersToExciteV = [dimension / 2 + 12,dimension / 2 + 13,dimension / 2 + 14,dimension / 2 + 15];

		//try it as a blob!
		function ijkToI(i,j,k)
		{
			return i + k*dimension*dimension + dimension*j;
		}
		let center = new THREE.Vector3(Math.floor(dimension/2),Math.floor(dimension/2),Math.floor(dimension/2));
		let a = new THREE.Vector3();
		for(let i = 0; i < dimension; i++)
		for(let j = 0; j < dimension; j++)
		for(let k = 0; k < dimension; k++) {
			if( j > dimension / 2. ) {
				let t = (i + .2 * k - dimension / 2 ) * .1;

				initialState[ 4 * ijkToI(i,j,k) + 0] =    Math.exp(-sq( t ));
				initialState[ 4 * ijkToI(i,j,k) + 1] = .5*Math.exp(-sq(t-2));
			}

			// a.set(i,j,k);
			// let t = .12 * a.distanceTo(center);

			// initialState[ 4 * ijkToI(i,j,k) + 1] = Math.exp(-sq( t ));
			// initialState[ 4 * ijkToI(i,j,k) + 0] = Math.exp(-sq(t-2));
		}

		let numStepsPerFrame = 4;
		var data2d = {value:null};
		await Simulation( textureDimensions, "fitzHughNagumo", "clamped", initialState, numStepsPerFrame, 
			data2d,
			{threeDDimensions:{value:new THREE.Vector3( dimension, dimension, dimension )}},
			THREE.LinearFilter )

		let scalarField = await scalarFieldVisualization({data2d,dimension});
		updateFunctions.push(function()
		{
			// scalarField.rotation.y += 0.01
			// scalarField.rotation.x += 0.01
		})
	}
}
