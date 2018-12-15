/*
	Quasicrystals!
	icosahedron for snub cube lattice - you've got them somewhere
	rhombicuboctahedrons for runcic
	doggy - mirror symmetry but nothing else
*/

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
	// 	octahedronVertices[i].multiplyScalar(0.03);
	// }

	// var octahedronFacesData = JSON.parse( "[[2,1,4],[3,0,4],[2,4,0],[4,1,3],[1,5,3],[5,0,3],[1,2,5],[0,5,2]]" );
	// var octahedron = Shape(octahedronVertices, octahedronFacesData)
	// octahedron.position.z = -0.6
	// scene.add(octahedron);

	// //----------
	// var rhombicDodecahedronVertices = [];
	// for(var i = 0; i < 3; i++)
	// {
	// 	var a = new THREE.Vector3();
	// 	a.setComponent(i,2);
	// 	rhombicDodecahedronVertices.push(a);
	// 	var b = a.clone().negate();
	// 	rhombicDodecahedronVertices.push(b);
	// }
	// for(var i = 0; i < 8; i++)
	// {
	// 	var c = new THREE.Vector3(1,1,1);
	// 	if( i&1 ) c.x *= -1;
	// 	if( i&2 ) c.y *= -1;
	// 	if( i&4 ) c.z *= -1;
	// 	rhombicDodecahedronVertices.push(c);
	// }

	// for(var i = 0; i < rhombicDodecahedronVertices.length; i++)
	// {
	// 	rhombicDodecahedronVertices[i].multiplyScalar(0.02)
	// }
	// var rhombicDodecahedronFacesData = JSON.parse( "[[2,7,4,6],[4,9,3,8],[6,4,8,0],[7,1,9,4],[2,10,5,11],[3,13,5,12],[10,0,12,5],[11,5,13,1],[2,11,1,7],[1,13,3,9],[2,6,0,10],[0,8,3,12]]" );
	// var rhombicDodecahedron = Shape(rhombicDodecahedronVertices, rhombicDodecahedronFacesData, 6)
	// rhombicDodecahedron.position.z = -0.6
	// scene.add(rhombicDodecahedron);

	//------Weire Phelan
	// var wp1Vertices = [
	// 	3.1498,0,6.2996,
	// 	-3.1498,0,6.2996,
	// 	 4.1997,4.1997,4.1997,
	// 	 0,6.2996,3.1498,
	// 	-4.1997,4.1997,4.1997,
	// 	-4.1997,-4.1997,4.1997,
	// 	 0,-6.2996,3.1498,
	// 	 4.1997,-4.1997,4.1997,
	// 	 6.2996,3.1498,0,
	// 	-6.2996,3.1498,0,
	// 	-6.2996,-3.1498,0,
	// 	 6.2996,-3.1498,0,
	// 	 4.1997,4.1997,-4.1997,
	// 	 0,6.2996,-3.1498,
	// 	-4.1997,4.1997,-4.1997,
	// 	-4.1997,-4.1997,-4.1997,
	// 	 0,-6.2996,-3.1498,
	// 	 4.1997,-4.1997,-4.1997,
	// 	 3.1498,0,-6.2996,
	// 	-3.1498,0,-6.2996
	// ];
	// var wp2Vertices = [
	// 	3.14980,3.70039,5,
	// 	-3.14980,3.70039,5,
	// 	-5,0,5,
	// 	-3.14980,-3.70039,5,
	// 	 3.14980,-3.70039,5,
	// 	 5,0,5,
	// 	 4.19974,5.80026,0.80026,
	// 	-4.19974,5.80026,0.80026,
	// 	-6.85020,0,1.29961,
	// 	-4.19974,-5.80026,0.80026,
	// 	 4.19974,-5.80026,0.80026,
	// 	 6.85020,0,1.29961,
	// 	 5.80026,4.19974,-0.80026,
	// 	 0,6.85020,-1.29961,
	// 	-5.80026,4.19974,-0.80026,
	// 	-5.80026,-4.19974,-0.80026,
	// 	 0,-6.85020,-1.29961,
	// 	 5.80026,-4.19974,-0.80026,
	// 	 3.70039,3.14980,-5,
	// 	 0,5,-5,
	// 	-3.70039,3.14980,-5,
	// 	-3.70039,-3.14980,-5,
	// 	 0,-5,-5,
	// 	 3.70039,-3.14980,-5,
	// ];

	// for(var i = 0; i < wp1Vertices.length; i++)
	// {
	// 	wp1Vertices[i] *= 0.005;
	// }
	// var wp1FacesData = JSON.parse( "[[3,4,1,0,2],[1,5,6,7,0],[9,10,5,1,4],[14,19,15,10,9],[5,10,15,16,6],[6,16,17,11,7],[8,2,0,7,11],[11,17,18,12,8],[12,13,3,2,8],[13,14,9,4,3],[18,19,14,13,12],[17,16,15,19,18]]" );
	// var wp1 = Shape(wp1Vertices, wp1FacesData, 6)
	// wp1.position.z = -0.6
	// scene.add(wp1);

	// for(var i = 0; i < wp2Vertices.length; i++)
	// {
	// 	wp2Vertices[i] *= 0.005;
	// }
	// var wp2FacesData = JSON.parse( "[[13,7,1,0,6],[6,0,5,11,12],[11,5,4,10,17],[4,3,9,16,10],[3,2,8,15,9],[2,1,7,14,8],[7,13,19,20,14],[14,20,21,15,8],[21,22,16,9,15],[22,23,17,10,16],[23,18,12,11,17],[18,19,13,6,12],[5,0,1,2,3,4],[23,22,21,20,19,18]]" );
	// var wp2 = Shape(wp2Vertices, wp2FacesData, 6)
	// wp2.position.z = -0.6
	// scene.add(wp2);


	//----------
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

	// var hendecahedronFacesData = JSON.parse( "[[1,6,0,2],[10,9,1,7],[9,6,1],[7,1,2],[5,8,3,4],[9,5,6],[5,9,10,8],[0,6,5,4],[7,2,3],[7,3,8,10],[2,0,4,3]]" );
	// var hendecahedron = Shape(hendecahedronVertices,hendecahedronFacesData,4);
	// scene.add(hendecahedron);
	// hendecahedron.position.z = -3.9


	//----------triakis tetrahedron
	// var triakisTruncatedTetrahedronVertices = [];
	// var halfEdgeLen = 0.05;
	// for(var i = 0; i < 3; i++)
	// {
	// 	var a = [halfEdgeLen / Math.sqrt(2),halfEdgeLen / Math.sqrt(2),halfEdgeLen / Math.sqrt(2)];
	// 	a[i] *= 3;
	// 	triakisTruncatedTetrahedronVertices.push(new THREE.Vector3().fromArray(a));
	// 	for(var j = 0; j < 3; j++)
	// 	{
	// 		var a = [-halfEdgeLen / Math.sqrt(2),-halfEdgeLen / Math.sqrt(2),-halfEdgeLen / Math.sqrt(2)];
	// 		a[i] *= 3;
	// 		a[j] *= -1;
	// 		triakisTruncatedTetrahedronVertices.push(new THREE.Vector3().fromArray(a));
	// 	}
	// }
	// //that extra vertex: tet face to center is edgelen/Math.sqrt(24)
	// var cornerToCenterUnitTetrahedron = Math.sqrt(6)/4;

	// var extendedTetEdgeLen = halfEdgeLen * 6;
	// var extendedTetCornerToCenter = extendedTetEdgeLen * cornerToCenterUnitTetrahedron;

	// var chippedTetEdgeLen = halfEdgeLen * 2;
	// var chippedTetCornerToCenter = chippedTetEdgeLen * cornerToCenterUnitTetrahedron;

	// var extraVertexLength = extendedTetCornerToCenter - chippedTetCornerToCenter;
	// var extraVertex = new THREE.Vector3(1,1,1).setLength(extraVertexLength);
	// triakisTruncatedTetrahedronVertices.push( extraVertex );
	// for(var i = 0; i < 3; i++)
	// {
	// 	var a = extraVertex.clone().negate();
	// 	a.setComponent(i,-a.getComponent(i));
	// 	triakisTruncatedTetrahedronVertices.push( a );
	// }

	// var triakisTruncatedTetrahedronFacesData = JSON.parse( "[[8,0,12],[12,4,8],[12,0,4],[1,13,9],[1,5,13],[9,13,5],[14,10,2],[10,14,6],[14,2,6],[3,15,11],[15,3,7],[11,15,7]]" );
	// var triakisTruncatedTetrahedron = Shape(triakisTruncatedTetrahedronVertices,triakisTruncatedTetrahedronFacesData, 4);
	// scene.add(triakisTruncatedTetrahedron);
	// triakisTruncatedTetrahedron.position.z = -3


	//---------Snub cube
	// var firstHandedSnubCubeVertices = [];
	// var secondHandedSnubCubeVertices = [];
	// var tribonnaciConstant = 1.839286755214161132551852564;
	// var firstHandSeed = [1, 1/tribonnaciConstant, tribonnaciConstant];
	// var secondHandSeed = [-1,1/tribonnaciConstant, tribonnaciConstant];
	// var firstHanded = true;

	// function chiralOctahedralProbably(seed, array)
	// {
	// 	for(var i = 0; i < 4; i++)
	// 	{
	// 		var a = new THREE.Vector3().fromArray( seed );
	// 		a.applyAxisAngle(zUnit, TAU/4*i);
	// 		for(var j = 0; j < 4; j++)
	// 		{
	// 			var b = a.clone();
	// 			b.applyAxisAngle(yUnit, TAU/4*j);
	// 			array.push( b );
	// 		}
	// 		for(var k = 0; k < 2; k++)
	// 		{
	// 			var c = a.clone();
	// 			c.applyAxisAngle(xUnit, TAU/4 + TAU/2 * k);
	// 			array.push( c );
	// 		}
	// 	}
	// }

	// chiralOctahedralProbably( firstHandSeed, firstHandedSnubCubeVertices )
	// chiralOctahedralProbably(secondHandSeed, secondHandedSnubCubeVertices)

	// for(var i = 0; i < secondHandedSnubCubeVertices.length; i++)
	// {
	// 	secondHandedSnubCubeVertices[i].multiplyScalar(0.1)
	// }

	// var secondHandedSnubCubeFacesData = JSON.parse( "[[18,0,6,12],[1,18,12],[19,1,7,13],[2,13,8],[20,2,8,14],[3,14,9],[1,12,7],[12,22,7],[7,22,16],[12,6,22],[6,4,22],[21,3,9,15],[5,3,21],[0,15,6],[21,15,0],[11,21,0],[17,11,18],[11,0,18],[17,18,1],[17,1,19],[23,17,19],[23,19,2],[19,13,2],[23,2,20],[23,20,5],[17,23,5,11],[4,10,16,22],[4,9,10],[15,9,4],[9,14,10],[10,8,16],[14,8,10],[16,8,13],[16,13,7],[21,11,5],[3,5,20],[14,3,20],[4,6,15]]" );

	// var secondHandedSnubCube = Shape(secondHandedSnubCubeVertices, secondHandedSnubCubeFacesData)
	// scene.add(secondHandedSnubCube);
	// secondHandedSnubCube.position.z = -3.4;

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
	// 	truncatedCuboctahedronVertices[i].multiplyScalar(0.009)
	// }

	// var truncatedCuboctahedronFacesData = JSON.parse( "[[16,18,34,32],[2,3,11,10],[1,17,19,3,2,18,16,0],[17,33,35,19],[8,9,1,0],[28,24,40,44],[40,24,8,0,16,32],[9,25,41,33,17,1],[13,29,25,9,8,24,28,12],[4,5,13,12],[19,35,43,27,11,3],[18,2,10,26,42,34],[32,34,42,46,38,36,44,40],[22,20,36,38],[14,6,22,38,46,30],[30,46,42,26],[15,14,30,26,10,11,27,31],[44,36,20,4,12,28],[13,5,21,37,45,29],[29,45,41,25],[31,27,43,47],[6,14,15,7],[21,23,39,37],[7,23,21,5,4,20,22,6],[15,31,47,39,23,7],[35,33,41,45,37,39,47,43]]" );

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
	// 	truncatedOctahedronVertices[i].multiplyScalar(0.02)

	// var truncatedOctahedronFacesData = JSON.parse( "[[4,9,5,8],[0,4,8,12,16,20],[21,0,20,1],[16,12,17,13],[13,17,22,3,7,10],[10,7,11,6],[15,19,14,18],[18,14,9,4,0,21],[2,23,3,22],[19,15,11,7,3,23],[6,1,20,16,13,10],[15,18,21,1,6,11],[23,2,5,9,14,19],[2,22,17,12,8,5]]" );
	// var truncatedOctahedron = Shape(truncatedOctahedronVertices, truncatedOctahedronFacesData)
	// scene.add(truncatedOctahedron);
	// truncatedOctahedron.position.z = -0.6;

	

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
	// 	truncatedCubeVertices[i].multiplyScalar(0.03)

	// var truncatedCubeFacesData = JSON.parse( "[[0,8,16],[17,9,1],[4,20,12],[13,21,5],[21,17,1,0,16,20,4,5],[21,13,15,23,19,11,9,17],[0,1,9,11,3,2,10,8],[10,2,18],[22,6,14],[7,23,15],[11,19,3],[3,19,23,7,6,22,18,2],[18,22,14,12,20,16,8,10],[15,13,5,4,12,14,6,7]]" );
	// var truncatedCube = Shape(truncatedCubeVertices,truncatedCubeFacesData,4);
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