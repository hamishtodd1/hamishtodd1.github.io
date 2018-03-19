function initSnapShapesPresentation(allPolyhedra)
{
	// var octahedronVertices = [];
	// for(var i = 0; i < 3; i++)
	// {
	// 	for(var j = 0; j < 2; j++)
	// 	{
	// 		var a = [0,0,0];
	// 		if(j)
	// 		{
	// 			a[i] = -1;
	// 		}
	// 		else
	// 		{
	// 			a[i] = 1;
	// 		}
	// 		octahedronVertices.push(new THREE.Vector3().fromArray(a));
	// 	}
	// }
	// for(var i = 0; i < octahedronVertices.length; i++)
	// {
	// 	octahedronVertices[i].multiplyScalar(0.1);
	// }

	// var octahedronFacesData = JSON.parse( "[[2,1,4],[3,0,4],[2,4,0],[4,1,3],[1,5,3],[5,0,3],[1,2,5],[0,5,2]]" );
	// var octahedron = Shape(octahedronVertices, octahedronFacesData)
	// octahedron.position.z = -0.6
	// scene.add(octahedron);

	// //----------
	// // (±1, ±1, ±1); (±2, 0, 0), (0, ±2, 0) and (0, 0, ±2)

	// // var rhombicDodecahedronVertices = [];
	// // rhombicDodecahedronVertices.push()


	// //----------
	// var hendecahedronVertices = 
	// 	[
	// 	13 / 7, 3*Math.sqrt(3) / 7, 1, 
	// 	1, Math.sqrt(3), 0, 
	// 	2, Math.sqrt(3), 0.5, 
	// 	2.5, Math.sqrt(3) / 2, 0, 
	// 	2.25, Math.sqrt(3) / 4, 0.5, 
	// 	2, 0, 0, 
	// 	0, 0, 0.5, 
	// 	2, Math.sqrt(3), -0.5, 
	// 	2.25, Math.sqrt(3) / 4, -0.5, 
	// 	0, 0, -0.5, 
	// 	13 / 7, 3*Math.sqrt(3) / 7, -1
	// 	];

	// for(var i = 0; i < hendecahedronVertices.length; i++)
	// 	hendecahedronVertices[i] *= 0.1;

	// var hendecahedron = Shape(hendecahedronVertices)
	// scene.add(hendecahedron);
	// hendecahedron.position.z = -0.6;


	// //---------
	var firstHandedSnubCubeVertices = [];
	var secondHandedSnubCubeVertices = [];
	var tribonnaciConstant = 1.839286755214161132551852564;
	var firstHandSeed = [1, 1/tribonnaciConstant, tribonnaciConstant];
	var secondHandSeed = [-1,1/tribonnaciConstant, tribonnaciConstant];
	var firstHanded = true;

	function chiralOctahedralProbably(seed, array)
	{
		for(var i = 0; i < 4; i++)
		{
			var a = new THREE.Vector3().fromArray( seed );
			a.applyAxisAngle(zUnit, TAU/4*i);
			for(var j = 0; j < 4; j++)
			{
				var b = a.clone();
				b.applyAxisAngle(yUnit, TAU/4*j);
				array.push( b );
			}
			for(var k = 0; k < 2; k++)
			{
				var c = a.clone();
				c.applyAxisAngle(xUnit, TAU/4 + TAU/2 * k);
				array.push( c );
			}
		}
	}

	chiralOctahedralProbably( firstHandSeed, firstHandedSnubCubeVertices )
	chiralOctahedralProbably(secondHandSeed, secondHandedSnubCubeVertices)

	for(var i = 0; i < secondHandedSnubCubeVertices.length; i++)
		secondHandedSnubCubeVertices[i].multiplyScalar(0.1)

	var secondHandedSnubCubeFacesData = JSON.parse( "[[18,0,6,12],[1,18,12],[19,1,7,13],[2,13,8],[20,2,8,14],[3,14,9],[1,12,7],[12,22,7],[7,22,16],[12,6,22],[6,4,22],[21,3,9,15],[5,3,21],[0,15,6],[21,15,0],[11,21,0],[17,11,18],[11,0,18],[17,18,1],[17,1,19],[23,17,19],[23,19,2],[19,13,2],[23,2,20],[23,20,5],[17,23,5,11],[4,10,16,22],[4,9,10],[15,9,4],[9,14,10],[10,8,16],[14,8,10],[16,8,13],[16,13,7],[21,11,5],[3,5,20],[14,3,20],[4,6,15]]" );

	var secondHandedSnubCube = Shape(secondHandedSnubCubeVertices, secondHandedSnubCubeFacesData)
	scene.add(secondHandedSnubCube);
	secondHandedSnubCube.position.z = -0.6;

	//------------
	// var truncatedCuboctahedronVertices = [];
	// var possibleValues = [1,1 + Math.sqrt(2), 1 + 2*Math.sqrt(2)];
	// for(var i = 0; i < possibleValues.length; i++)
	// {
	// 	for(var j = 0; j < possibleValues.length; j++)
	// 	{
	// 		for(var k = 0; k < possibleValues.length; k++)
	// 		{
	// 			if(j===i || k===i||k===j)
	// 			{
	// 				continue;
	// 			}

	// 			//an order has been chosen. Now cycle the minuses

	// 			for(var copy = 0; copy < 8; copy++)
	// 			{
	// 				var a = [possibleValues[i],possibleValues[j],possibleValues[k]];
	// 				for(var l = 0; l < 3; l++)
	// 				{
	// 					if( copy & (1<<l))
	// 					{
	// 						a[l] *= -1;
	// 					}
	// 				}
	// 				truncatedCuboctahedronVertices.push(new THREE.Vector3().fromArray(a));
	// 			}
	// 		}
	// 	}
	// }
	// for(var i = 0; i < truncatedCuboctahedronVertices.length; i++)
	// {
	// 	truncatedCuboctahedronVertices[i].multiplyScalar(0.03)
	// }

	// var truncatedCuboctahedronFacesData = JSON.parse( "[[16,18,34,32],[2,3,11,10],[1,17,19,3,2,18,16,0],[17,33,35,19],[8,9,1,0],[28,24,40,44],[40,24,8,0,16,32]]" );

	// var truncatedCuboctahedron = Shape(truncatedCuboctahedronVertices,truncatedCuboctahedronFacesData)
	// scene.add(truncatedCuboctahedron);
	// truncatedCuboctahedron.position.z = -0.6;

	//-----------all the (0,1,2)s whoah
	// var truncatedOctahedronVertices = [];
	// for(var i = 0; i < 3; i++)
	// {
	// 	for(var j = 0; j < 8; j++)
	// 	{
	// 		var a = [0,0,0];
	// 		var oneIndex = null;
	// 		var twoIndex = null;
	// 		if(j>3)
	// 		{
	// 			oneIndex = (i+1)%3;
	// 			twoIndex = (i+2)%3;
	// 		}
	// 		else
	// 		{
	// 			oneIndex = (i+2)%3;
	// 			twoIndex = (i+1)%3;
	// 		}
	// 		a[oneIndex] = 1;
	// 		a[twoIndex] = 2;
	// 		if(j&1)
	// 		{
	// 			a[oneIndex] *= -1;
	// 		}
	// 		if(j&2)
	// 		{
	// 			a[twoIndex] *= -1;
	// 		}
	// 		truncatedOctahedronVertices.push(new THREE.Vector3().fromArray(a));
	// 	}
	// }

	// for(var i = 0; i < truncatedOctahedronVertices.length; i++)
	// 	truncatedOctahedronVertices[i].multiplyScalar(0.1)

	// var truncatedOctahedron = Shape(truncatedOctahedronVertices)
	// scene.add(truncatedOctahedron);
	// truncatedOctahedron.position.z = -0.6

	

	// //-------------
	// var truncatedCubeVertices = [];
	// var exceptionalCoord = Math.sqrt(2)-1;
	// for(var i = 0; i < 3; i++)
	// {
	// 	for(var j = 0; j < 8; j++)
	// 	{
	// 		var a = [1,1,1];
	// 		a[i] = exceptionalCoord;
	// 		for(var k = 0; k < 3; k++ )
	// 		{
	// 			if( j & (1 << k) )
	// 			{
	// 				a[k] *= -1;
	// 			}
	// 		}
	// 		truncatedCubeVertices.push(new THREE.Vector3().fromArray(a));
	// 	}
	// }
	// for(var i = 0; i < truncatedCubeVertices.length; i++)
	// 	truncatedCubeVertices[i].multiplyScalar(0.1)

	// var truncatedCube = Shape(truncatedCubeVertices)
	// scene.add(truncatedCube);
	// truncatedCube.position.z = -0.6

	// //------------
	// {
	// 	var cubeCoords = [
	// 		0,0,0,
	// 		1,0,0,
	// 		0,1,0,
	// 		1,1,0,

	// 		0,0,-1,
	// 		1,0,-1,
	// 		0,1,-1,
	// 		1,1,-1,
	// 		];

	// 	for(var i = 0; i < cubeCoords.length; i++)
	// 	{
	// 		// cubeCoords[i] += 0.25;// * (i%3)
	// 		cubeCoords[i] *= 0.1
	// 	}

	// 	var cubeA = Shape(cubeCoords);
	// 	var cubeB = Shape(cubeCoords);

	// 	// cubeA.addFace([1,3,7,5]);
	// 	// cubeB.addFace([1,3,7,5]);
	// 	cubeA.addFace([1,5,7,3]);
	// 	cubeB.addFace([1,5,7,3]);

	// 	scene.add(cubeA,cubeB)
	// 	cubeB.position.x = 0.12
	// 	cubeB.position.z = -0.6
	// 	cubeB.rotation.y = TAU/4

	// 	cubeA.position.z = -0.5
	// 	cubeA.position.x = -0.12

	// 	// cubeB.scale.setScalar(0.1)
	// 	// cubeA.scale.setScalar(0.1)
	// }
}





// var triakisTruncatedTetrahedronVertices = [];
// for(var i = 0; i < 3; i++)
// {
// 	var a = [1,1,1];
// 	a[i] = 3;
// 	triakisTruncatedTetrahedronVertices.push(new THREE.Vector3().fromArray(a));
// 	for(var j = 0; j < 3; j++)
// 	{
// 		var a = [-1,-1,-1];
// 		a[i] = -3;
// 		a[j] *= -1;
// 		triakisTruncatedTetrahedronVertices.push(new THREE.Vector3().fromArray(a));
// 	}
// }
// triakisTruncatedTetrahedronVertices
//that extra vertex: tet face to center is edgelen/Math.sqrt(24)
//( 1+2/3*2, 3-2/3*2, 0 )
//alternate corners, you can just inspect which one


//so you're swapping, and getting every combination

/*
	Need a way to rotate them

	Quasicrystals!

	icosahedron - you've got them somewhere

	octagonal prism - (1,0,0) and rotate

	doggy - mirror symmetry but nothing else

	Weaire–Phelan
		"3.1498   0        6.2996
		-3.1498   0        6.2996
		 4.1997   4.1997   4.1997
		 0        6.2996   3.1498
		-4.1997   4.1997   4.1997
		-4.1997  -4.1997   4.1997
		 0       -6.2996   3.1498
		 4.1997  -4.1997   4.1997
		 6.2996   3.1498   0
		-6.2996   3.1498   0
		-6.2996  -3.1498   0
		 6.2996  -3.1498   0
		 4.1997   4.1997  -4.1997
		 0        6.2996  -3.1498
		-4.1997   4.1997  -4.1997
		-4.1997  -4.1997  -4.1997
		 0       -6.2996  -3.1498
		 4.1997  -4.1997  -4.1997
		 3.1498   0       -6.2996
		-3.1498   0       -6.2996"

		"3.14980   3.70039   5
		-3.14980   3.70039   5
		-5         0         5
		-3.14980  -3.70039   5
		 3.14980  -3.70039   5
		 5         0         5
		 4.19974   5.80026   0.80026
		-4.19974   5.80026   0.80026
		-6.85020   0         1.29961
		-4.19974  -5.80026   0.80026
		 4.19974  -5.80026   0.80026
		 6.85020   0         1.29961
		 5.80026   4.19974  -0.80026
		 0         6.85020  -1.29961
		-5.80026   4.19974  -0.80026
		-5.80026  -4.19974  -0.80026
		 0        -6.85020  -1.29961
		 5.80026  -4.19974  -0.80026
		 3.70039   3.14980  -5
		 0         5        -5
		-3.70039   3.14980  -5
		-3.70039  -3.14980  -5
		 0        -5        -5
		 3.70039  -3.14980  -5"
*/