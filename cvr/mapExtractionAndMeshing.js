'use strict';

var mapMirrors = []; //if a map gets spliced out you're in trouble.

var typeColors = {
	map_den: 0x4372D2,
	map_pos: 0x298029,
	map_neg: 0x8B2E2E,
}

const defaultBlockRadius = 8;
const megaContouringBlockRadius = 50;
let blockRadius = 0?megaContouringBlockRadius:defaultBlockRadius;

var centerOffsets = null;
function generateCenterOffsets()
{
	centerOffsets = []
	if(blockRadius === megaContouringBlockRadius)
	{
		centerOffsets.push([ 0, 0, 0]);
	}
	else
	{
		for(var i = -1; i <= 1; i++) {
		for(var j = -1; j <= 1; j++) {
		for(var k = -1; k <= 1; k++) {
			centerOffsets.push([ i*blockRadius*2, j*blockRadius*2, k*blockRadius*2]);
		}
		}
		}
	}
	centerOffsets.sort(function (vec1,vec2)
	{
		return vecLengthSq(vec1) - vecLengthSq(vec2);
	});
}
generateCenterOffsets()

var centerOnGridsToBeSent = [];

function logExtremes(array,indexToInspect)
{
	var lowest = Infinity;
	var highest = -Infinity;
	for(var i = 0; i < array.length; i++)
	{
		if(array[i][indexToInspect] < lowest)
		{
			lowest = array[i][indexToInspect];
		}
		if(array[i][indexToInspect] > highest)
		{
			highest = array[i][indexToInspect];
		}
	}
	console.log(lowest,highest)
}

onmessage = function(event)
{
	var msg = event.data;

	if(event.data.toggleMegaContouring )
	{
		blockRadius = (blockRadius === defaultBlockRadius)?megaContouringBlockRadius:defaultBlockRadius;
		generateCenterOffsets()
	}

	if(mapMirrors[ msg.mapIndex ] === undefined)
	{
		var mapMirror = mapMirrors[ msg.mapIndex ] = new MapMirror();
		mapMirror.from_ccp4(msg.arrayBuffer); //pdbe and dsn9 exist

		mapMirror.userCenterOnGrid = [Infinity,Infinity,Infinity];
		mapMirror.isolevel = Infinity;
		mapMirror.chickenWire = null;

		mapMirror.postMessageConcerningSelf({ orthogonalMatrix:	mapMirror.unit_cell.orth });
	}

	if(msg.userCenterOffGrid)
	{
		var mapMirror = mapMirrors[msg.mapIndex];

		if(msg.isDiffMap)
		{
			mapMirror.displayTypes = ['map_pos', 'map_neg'];
		}
		else
		{
			mapMirror.displayTypes = ['map_den'];
		}

		var possiblyNewUserCenterOnGrid = mapMirror.getPointOnGrid(msg.userCenterOffGrid);
		for(var i = 0; i < 3; i++)
		{
			possiblyNewUserCenterOnGrid[i] = blockRadius*2 * Math.round( possiblyNewUserCenterOnGrid[i] / (blockRadius*2) );
			//urgh, don't know about the wrapping effect; maybe you want to make sure they get closer to 0? Seems fine
		}

		if(	mapMirror.isolevel !== msg.isolevel ||
			mapMirror.chickenWire !== msg.chickenWire ||
			!vecsEqual( mapMirror.userCenterOnGrid, possiblyNewUserCenterOnGrid ) )
		{
			copyVec(mapMirror.userCenterOnGrid,possiblyNewUserCenterOnGrid);
			mapMirror.isolevel = msg.isolevel;
			mapMirror.chickenWire = msg.chickenWire;

			centerOnGridsToBeSent.length = 0;

			centerOffsets.forEach( function(centerOffset)
			{
				var possiblyUnneededCenterOnGridToBeSent = sumOfVecs( mapMirror.userCenterOnGrid, centerOffset );
				var needed = true;

				for(var i = 0, il = msg.currentCenterOnGrids.length; i < il; i++)
				{
					if( vecsEqual( msg.currentCenterOnGrids[i], possiblyUnneededCenterOnGridToBeSent ) )
					{
						needed = false;
						break;
					}
				}
				if( needed )
				{
					centerOnGridsToBeSent.push( possiblyUnneededCenterOnGridToBeSent );
				}
			});
		}

		var msg = {userCenterOnGrid: mapMirror.userCenterOnGrid}
		if( centerOnGridsToBeSent.length === 0 )
		{
			mapMirror.postMessageConcerningSelf(msg)
		}
		else
		{
			msg.centerOnGrid = centerOnGridsToBeSent[0]
			centerOnGridsToBeSent.splice(0,1);

			msg.meshData = Array( mapMirror.displayTypes.length );
			
			for(var i = 0; i < mapMirror.displayTypes.length; i++)
			{
				var meshDatum = msg.meshData[i] = {};

				meshDatum.color = typeColors[mapMirror.displayTypes[i]];

				meshDatum.relativeIsolevel = mapMirror.displayTypes[i] === 'map_neg'? -mapMirror.isolevel : mapMirror.isolevel;
				var absoluteIsolevel = meshDatum.relativeIsolevel * mapMirror.stats.rms + mapMirror.stats.mean;

				mapMirror.extract_block( msg.centerOnGrid );
				meshDatum.wireframeGeometricPrimitives = wireframeMarchingCubes(
					mapMirror.block._size[0],	mapMirror.block._size[1],	mapMirror.block._size[2],
					mapMirror.block._values,	mapMirror.block._points,	absoluteIsolevel );
				
				if( !mapMirror.chickenWire )
				{
					var additionForEncompassment = mapMirror.displayTypes[i] === 'map_neg' ? -0.02 : 0.08;
					var nonWireframeAbsoluteIsolevel = ( meshDatum.relativeIsolevel + additionForEncompassment ) * mapMirror.stats.rms + mapMirror.stats.mean;

					mapMirror.extract_block( msg.centerOnGrid,true );
					meshDatum.nonWireframeGeometricPrimitives = solidMarchingCubes(
						mapMirror.block._size[0],	mapMirror.block._size[1],	mapMirror.block._size[2],
						mapMirror.block._values,	mapMirror.block._points,	nonWireframeAbsoluteIsolevel );
				}
			}

			mapMirror.postMessageConcerningSelf(msg);
		}
	}
}

function wireframeMarchingCubes(size_x,size_y,size_z, values, points, isolevel)
{
	if(values == null || points == null)
	{
		return;
	}

	var method = "squarish";
	var cubeVerts = [[0,0,0], [1,0,0], [1,1,0], [0,1,0],
					 [0,0,1], [1,0,1], [1,1,1], [0,1,1]];
	
	var cubeOffsets = [];
	for (var i = 0; i < 8; ++i)
	{
		var v = cubeVerts[i]
		cubeOffsets.push(v[0] + size_z * (v[1] + size_y * v[2]));
	}

	var seg_table = (method === 'notSquarish' ? segTable : segTable2);
	var vertexIndicesForThisCube = new Array(12);
	var p0 = [0, 0, 0];
	var cornerPositions = [p0, p0, p0, p0, p0, p0, p0, p0];
	var cornerValues = new Float32Array(8);

	var vertices = [];
	var segments = [];
	var faces = [];
	var vertex_count = 0;
	for (var x = 0; x < size_x - 1; x++) {
	for (var y = 0; y < size_y - 1; y++) {
	for (var z = 0; z < size_z - 1; z++) {

		var offset0 = z + size_z * (y + size_y * x);

		var i = (void 0);
		var j = (void 0);
		var cubeindex = 0;
		for (i = 0; i < 8; ++i)
		{
			j = offset0 + cubeOffsets[i];
			cornerPositions[i] = points[j];
			cornerValues[i] = values[j];
			cubeindex |= (cornerValues[i] < isolevel) ? 1 << i : 0;
		}
		if (cubeindex === 0 || cubeindex === 255) { continue; }


		// 12 bit number, indicates which edges are crossed by the isosurface
		var edge_mask = edgeTable[cubeindex];

		// check which edges are crossed, and estimate the point location
		// using a weighted average of scalar values at edge endpoints.
		for (i = 0; i < 12; ++i) 
		{
			if ((edge_mask & (1 << i)) !== 0)
			{
				var e = edgeIndex[i];
				var mu = (isolevel - cornerValues[e[0]]) /
						 (cornerValues[e[1]] - cornerValues[e[0]]);
				var p1 = cornerPositions[e[0]];
				var p2 = cornerPositions[e[1]];

				vertices.push(	p1[0] + (p2[0] - p1[0]) * mu,
								p1[1] + (p2[1] - p1[1]) * mu,
								p1[2] + (p2[2] - p1[2]) * mu);
				vertexIndicesForThisCube[i] = vertex_count++;
			}
		}
		var t = seg_table[cubeindex];
		for (i = 0; i < t.length; i++) {
			segments.push(vertexIndicesForThisCube[t[i]]);
		}
	}
	}
	}

	return {vertices:vertices,segments:segments};
}

function solidMarchingCubes(size_x,size_y,size_z, values, points, isolevel)
{
	if (values == null || points == null)
	{
		return;
	}

	let maxVerticesInCube = 12 //3 in threejsMC, but that overflowed! They may have known something
	solidMcScope.positionArray = new Float32Array( size_x * size_y * size_z * maxVerticesInCube );
	solidMcScope.normalArray   = new Float32Array( size_x * size_y * size_z * maxVerticesInCube );
	solidMcScope.normalCache   = new Float32Array( size_x * size_y * size_z * maxVerticesInCube );
	solidMcScope.count = 0;
	solidMcScope.values = values;

	var cubeVerts = [[0,0,0], [1,0,0], [1,1,0], [0,1,0],
					 [0,0,1], [1,0,1], [1,1,1], [0,1,1]];	
	solidMcScope.cubeOffsets = [];
	for (var i = 0; i < 8; ++i)
	{
		var v = cubeVerts[i]
		solidMcScope.cubeOffsets.push(v[0] + size_z * (v[1] + size_y * v[2]));
	}

	// var sample = 3;
	// for (var x = 3; x < sample+1; x++) {
	// for (var y = 0; y < 1; y++) {
	// for (var z = 0; z < 1; z++) {
	for (var x = 1; x < size_x - 2; x++) {
	for (var y = 1; y < size_y - 2; y++) {
	for (var z = 1; z < size_z - 2; z++) {
		var offset0 = z + size_z * (y + size_y * x);

		polygonize( 
			offset0 + solidMcScope.cubeOffsets[0], offset0 + solidMcScope.cubeOffsets[4],
			offset0 + solidMcScope.cubeOffsets[7], offset0 + solidMcScope.cubeOffsets[3],
			offset0 + solidMcScope.cubeOffsets[1], offset0 + solidMcScope.cubeOffsets[5],
			offset0 + solidMcScope.cubeOffsets[6], offset0 + solidMcScope.cubeOffsets[2],
			points, isolevel );
	}
	}
	}

	for ( var i = solidMcScope.count * 3, il = solidMcScope.positionArray.length; i < il; i ++ )
	{
		solidMcScope.positionArray[ i ] = 0.0;
	}

	return {
		count:solidMcScope.count,
		positionArray:solidMcScope.positionArray,
		normalArray:solidMcScope.normalArray
	}
}

function vecLengthSq(vec)
{
	return vec[0]*vec[0]+vec[1]*vec[1]+vec[2]*vec[2];
}
function vecsEqual(v1,v2)
{
	return v1[0] === v2[0] && v1[1] === v2[1] && v1[2] === v2[2];
}
function sumOfVecs(v1,v2)
{
	return [
		v1[0] + v2[0],
		v1[1] + v2[1],
		v1[2] + v2[2]
	];
}
function copyVec(to,from)
{
	to[0] = from[0];
	to[1] = from[1];
	to[2] = from[2];
}

var MapMirror = function()
{
	this.unit_cell = null;
	this.grid = null;
	this.stats = { mean: 0.0, rms: 1.0 };
	this.block = new Block();
};
MapMirror.prototype.postMessageConcerningSelf = function(msg)
{
	msg.mapIndex = mapMirrors.indexOf(this);
	postMessage(msg);
}

MapMirror.prototype.getPointOnGrid = function(point)
{
	var fc = multiply([point[0],point[1],point[2]], this.unit_cell.frac);
	return this.grid.frac2grid([fc[0], fc[1], fc[2]]);
}
MapMirror.prototype.getPointOffGrid = function(ijk)
{
	var frac = this.grid.grid2frac(ijk[0],ijk[1],ijk[2]);
	return multiply( frac, this.unit_cell.orth );
}

// Extract a block of density for calculating an isosurface using the
// separate marching cubes implementation.
MapMirror.prototype.extract_block = function extract_block ( centerOnGrid, extraForNormals )
{
	if (this.grid == null || this.unit_cell == null) { return; }

	/*
		frac2grid and grid2frac is just multiplying and dividing by dims
		So those dimensions are probably the resolution, the distance between measurements
		.orth and .frac are matrices
	*/
	var grid = this.grid;
	var unit_cell = this.unit_cell;

	var extractedRadius = extraForNormals === undefined ? blockRadius:blockRadius+1
	var grid_min = [ centerOnGrid[0] - extractedRadius, centerOnGrid[1] - extractedRadius, centerOnGrid[2] - extractedRadius];
	var grid_max = [ centerOnGrid[0] + extractedRadius, centerOnGrid[1] + extractedRadius, centerOnGrid[2] + extractedRadius];
	
	//could easily have array lengths...
	var points = [];
	var values = [];
	for (var i = grid_min[0]; i <= grid_max[0]; i++) {
	for (var j = grid_min[1]; j <= grid_max[1]; j++) {
	for (var k = grid_min[2]; k <= grid_max[2]; k++) {
		var frac = grid.grid2frac(i, j, k);
		
		var orth = multiply( frac, unit_cell.orth );
		points.push(orth);

		var map_value = grid.get_grid_value(i, j, k);
		values.push(map_value);
	}
	}
	}

	var size = [grid_max[0] - grid_min[0] + 1,
				grid_max[1] - grid_min[1] + 1,
				grid_max[2] - grid_min[2] + 1];
	if (size[0] <= 0 || size[1] <= 0 || size[2] <= 0) {
		throw Error('Grid dimensions are zero along at least one edge');
	}
	var len = size[0] * size[1] * size[2];
	if (values.length !== len || points.length !== len) {
		throw Error('isosurface: array size mismatch');
	}

	this.block._points = points;
	this.block._values = values;
	this.block._size = size;
};



function polygonize( 
	q,q1,q1y,qy,qz,q1z,q1yz,qyz,
	points,isolevel )
{
	var fx = points[q][0],
		fy = points[q][1],
		fz = points[q][2],
		fx2 = points[q1][0],
		fy2 = points[qy][1],
		fz2 = points[qz][2];

	//ok so, don't assume you can just add shit! have to use whole cube!

	// if(q === 0) console.log(fx) 

	var cubeindex = 0,
		field0 = solidMcScope.values[ q ],
		field1 = solidMcScope.values[ q1 ],
		field2 = solidMcScope.values[ qy ],
		field3 = solidMcScope.values[ q1y ],
		field4 = solidMcScope.values[ qz ],
		field5 = solidMcScope.values[ q1z ],
		field6 = solidMcScope.values[ qyz ],
		field7 = solidMcScope.values[ q1yz ];

	if ( field0 < isolevel ) cubeindex |= 1;
	if ( field1 < isolevel ) cubeindex |= 2;
	if ( field2 < isolevel ) cubeindex |= 8;
	if ( field3 < isolevel ) cubeindex |= 4;
	if ( field4 < isolevel ) cubeindex |= 16;
	if ( field5 < isolevel ) cubeindex |= 32;
	if ( field6 < isolevel ) cubeindex |= 128;
	if ( field7 < isolevel ) cubeindex |= 64;

	var bits = solidMcScope.edgeTable[ cubeindex ];

	if ( bits === 0 ) return 0; // cube is entirely in/out of the surface - bail, nothing to draw

	//now doing one edge at a time

	// top of the cube

	if ( bits & 1 )
	{
		compNorm( q );
		compNorm( q1 );
		insertVertexInterpolatedOverX( q * 3, 0, isolevel, points[q], points[q1], field0, field1 );

	}

	if ( bits & 2 )
	{
		compNorm( q1 );
		compNorm( q1y );
		insertVertexInterpolatedOverY( q1 * 3,q1y*3, 3, isolevel, points[q1], points[q1y], field1, field3 );

	}

	if ( bits & 4 )
	{
		compNorm( qy );
		compNorm( q1y );
		insertVertexInterpolatedOverX( qy * 3, 6, isolevel, points[qy], points[q1y], field2, field3 );

	}

	if ( bits & 8 )
	{
		compNorm( q );
		compNorm( qy );
		insertVertexInterpolatedOverY( q * 3,qy*3, 9, isolevel, points[q], points[qy], field0, field2 );

	}

	// bottom of the cube

	if ( bits & 16 )
	{
		compNorm( qz );
		compNorm( q1z );
		insertVertexInterpolatedOverX( qz * 3, 12, isolevel, points[qz], points[q1z], field4, field5 );

	}

	if ( bits & 32 )
	{
		compNorm( q1z );
		compNorm( q1yz );
		insertVertexInterpolatedOverY( q1z * 3,q1yz*3, 15, isolevel, points[q1z], points[q1yz], field5, field7 );

	}

	if ( bits & 64 )
	{
		compNorm( qyz );
		compNorm( q1yz );
		insertVertexInterpolatedOverX( qyz * 3, 18, isolevel, points[qyz], points[q1yz], field6, field7 );

	}

	if ( bits & 128 )
	{
		compNorm( qz );
		compNorm( qyz );
		insertVertexInterpolatedOverY( qz * 3,qyz*3, 21, isolevel, points[qz], points[qyz], field4, field6 );

	}

	// vertical lines of the cube

	if ( bits & 256 )
	{
		compNorm( q );
		compNorm( qz );
		insertVertexInterpolatedOverZ( q * 3, qz*3,24, isolevel, points[q], points[qz], field0, field4 );

	}

	if ( bits & 512 )
	{
		compNorm( q1 );
		compNorm( q1z );
		insertVertexInterpolatedOverZ( q1 * 3, q1z*3,27, isolevel, points[q1], points[q1z], field1, field5 );

	}

	if ( bits & 1024 )
	{
		compNorm( q1y );
		compNorm( q1yz );
		insertVertexInterpolatedOverZ( q1y * 3, q1yz*3,30, isolevel, points[q1y], points[q1yz], field3, field7 );

	}

	if ( bits & 2048 )
	{
		compNorm( qy );
		compNorm( qyz );
		insertVertexInterpolatedOverZ( qy * 3, qyz*3,33, isolevel, points[qy], points[qyz], field2, field6 );

	}

	// now create stuff

	cubeindex <<= 4;  // re-purpose cubeindex into an offset in triTable

	var o1, o2, o3, numtris = 0, i = 0;

	while ( solidMcScope.triTable[ cubeindex + i ] != - 1 )
	{
		o1 = 3 * solidMcScope.triTable[ cubeindex + i ];
		o2 = 3 * solidMcScope.triTable[ cubeindex + i + 1 ];
		o3 = 3 * solidMcScope.triTable[ cubeindex + i + 2 ];

		var c = solidMcScope.count * 3;

		solidMcScope.positionArray[ c + 0 ] = solidMcScope.vlist[ o1 ];
		solidMcScope.positionArray[ c + 1 ] = solidMcScope.vlist[ o1 + 1 ];
		solidMcScope.positionArray[ c + 2 ] = solidMcScope.vlist[ o1 + 2 ];

		solidMcScope.positionArray[ c + 3 ] = solidMcScope.vlist[ o2 ];
		solidMcScope.positionArray[ c + 4 ] = solidMcScope.vlist[ o2 + 1 ];
		solidMcScope.positionArray[ c + 5 ] = solidMcScope.vlist[ o2 + 2 ];

		solidMcScope.positionArray[ c + 6 ] = solidMcScope.vlist[ o3 ];
		solidMcScope.positionArray[ c + 7 ] = solidMcScope.vlist[ o3 + 1 ];
		solidMcScope.positionArray[ c + 8 ] = solidMcScope.vlist[ o3 + 2 ];

		solidMcScope.normalArray[ c + 0 ] = solidMcScope.nlist[ o1 ];
		solidMcScope.normalArray[ c + 1 ] = solidMcScope.nlist[ o1 + 1 ];
		solidMcScope.normalArray[ c + 2 ] = solidMcScope.nlist[ o1 + 2 ];

		solidMcScope.normalArray[ c + 3 ] = solidMcScope.nlist[ o2 ];
		solidMcScope.normalArray[ c + 4 ] = solidMcScope.nlist[ o2 + 1 ];
		solidMcScope.normalArray[ c + 5 ] = solidMcScope.nlist[ o2 + 2 ];

		solidMcScope.normalArray[ c + 6 ] = solidMcScope.nlist[ o3 ];
		solidMcScope.normalArray[ c + 7 ] = solidMcScope.nlist[ o3 + 1 ];
		solidMcScope.normalArray[ c + 8 ] = solidMcScope.nlist[ o3 + 2 ];

		solidMcScope.count += 3;

		i += 3;
		numtris ++;
	}

	return numtris;
}

function insertVertexInterpolatedOverX( q, offset, isol, p, p2, valp1, valp2 )
{
	var mu = ( isol - valp1 ) / ( valp2 - valp1 ),
		nc = solidMcScope.normalCache;

	solidMcScope.vlist[ offset + 0 ] = lerp( p[0], p2[0], mu );
	solidMcScope.vlist[ offset + 1 ] = lerp( p[1], p2[1], mu );
	solidMcScope.vlist[ offset + 2 ] = lerp( p[2], p2[2], mu );

	solidMcScope.nlist[ offset + 0 ] = lerp( nc[ q + 0 ], nc[ q + 3 ], mu );
	solidMcScope.nlist[ offset + 1 ] = lerp( nc[ q + 1 ], nc[ q + 4 ], mu );
	solidMcScope.nlist[ offset + 2 ] = lerp( nc[ q + 2 ], nc[ q + 5 ], mu );
}

function insertVertexInterpolatedOverY( q, q2, offset, isol, p, p2, valp1, valp2 )
{
	var mu = ( isol - valp1 ) / ( valp2 - valp1 ),
		nc = solidMcScope.normalCache;

	solidMcScope.vlist[ offset + 0 ] = lerp( p[0], p2[0], mu );
	solidMcScope.vlist[ offset + 1 ] = lerp( p[1], p2[1], mu );
	solidMcScope.vlist[ offset + 2 ] = lerp( p[2], p2[2], mu );

	solidMcScope.nlist[ offset + 0 ] = lerp( nc[ q + 0 ], nc[ q2 + 0 ], mu );
	solidMcScope.nlist[ offset + 1 ] = lerp( nc[ q + 1 ], nc[ q2 + 1 ], mu );
	solidMcScope.nlist[ offset + 2 ] = lerp( nc[ q + 2 ], nc[ q2 + 2 ], mu );

}

function insertVertexInterpolatedOverZ( q, q2, offset, isol, p, p2, valp1, valp2 )
{
	var mu = ( isol - valp1 ) / ( valp2 - valp1 ),
		nc = solidMcScope.normalCache;

	solidMcScope.vlist[ offset + 0 ] = lerp( p[0], p2[0], mu );
	solidMcScope.vlist[ offset + 1 ] = lerp( p[1], p2[1], mu );
	solidMcScope.vlist[ offset + 2 ] = lerp( p[2], p2[2], mu );

	solidMcScope.nlist[ offset + 0 ] = lerp( nc[ q + 0 ], nc[ q2 + 0 ], mu );
	solidMcScope.nlist[ offset + 1 ] = lerp( nc[ q + 1 ], nc[ q2 + 1 ], mu );
	solidMcScope.nlist[ offset + 2 ] = lerp( nc[ q + 2 ], nc[ q2 + 2 ], mu );

}

function compNorm( q )
{
	var q3 = q * 3;

	if ( solidMcScope.normalCache[ q3 ] === 0.0 )
	{
		var q3 = q*3;
		solidMcScope.normalCache[ q3 + 0 ] = solidMcScope.values[ q - solidMcScope.cubeOffsets[1] ] - solidMcScope.values[ q + solidMcScope.cubeOffsets[1] ];
		solidMcScope.normalCache[ q3 + 1 ] = solidMcScope.values[ q - solidMcScope.cubeOffsets[3] ] - solidMcScope.values[ q + solidMcScope.cubeOffsets[3] ];
		solidMcScope.normalCache[ q3 + 2 ] = solidMcScope.values[ q - solidMcScope.cubeOffsets[4] ] - solidMcScope.values[ q + solidMcScope.cubeOffsets[4] ];
	}
}

function lerp( a, b, t )
{
	return a + ( b - a ) * t;
}

var solidMcScope = 
{
	values: null,
	normalCache: null,
	count: 0,
	positionArray: null,
	normalArray: null,
	vlist: new Float32Array( 12 * 3 ),
	nlist: new Float32Array( 12 * 3 ),
	cubeOffsets: null
}

solidMcScope.edgeTable = new Int32Array( [
0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c,
0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac,
0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c,
0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc,
0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c,
0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc,
0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460,
0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0,
0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230,
0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190,
0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0 ] );

solidMcScope.triTable = new Int32Array( [
- 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 8, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 1, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 8, 3, 9, 8, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 2, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 8, 3, 1, 2, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 2, 10, 0, 2, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
2, 8, 3, 2, 10, 8, 10, 9, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
3, 11, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 11, 2, 8, 11, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 9, 0, 2, 3, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 11, 2, 1, 9, 11, 9, 8, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
3, 10, 1, 11, 10, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 10, 1, 0, 8, 10, 8, 11, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
3, 9, 0, 3, 11, 9, 11, 10, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 8, 10, 10, 8, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
4, 7, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
4, 3, 0, 7, 3, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 1, 9, 8, 4, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
4, 1, 9, 4, 7, 1, 7, 3, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 2, 10, 8, 4, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
3, 4, 7, 3, 0, 4, 1, 2, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 2, 10, 9, 0, 2, 8, 4, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, - 1, - 1, - 1, - 1,
8, 4, 7, 3, 11, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
11, 4, 7, 11, 2, 4, 2, 0, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 0, 1, 8, 4, 7, 2, 3, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, - 1, - 1, - 1, - 1,
3, 10, 1, 3, 11, 10, 7, 8, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, - 1, - 1, - 1, - 1,
4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, - 1, - 1, - 1, - 1,
4, 7, 11, 4, 11, 9, 9, 11, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 5, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 5, 4, 0, 8, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 5, 4, 1, 5, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
8, 5, 4, 8, 3, 5, 3, 1, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 2, 10, 9, 5, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
3, 0, 8, 1, 2, 10, 4, 9, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
5, 2, 10, 5, 4, 2, 4, 0, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, - 1, - 1, - 1, - 1,
9, 5, 4, 2, 3, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 11, 2, 0, 8, 11, 4, 9, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 5, 4, 0, 1, 5, 2, 3, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, - 1, - 1, - 1, - 1,
10, 3, 11, 10, 1, 3, 9, 5, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, - 1, - 1, - 1, - 1,
5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, - 1, - 1, - 1, - 1,
5, 4, 8, 5, 8, 10, 10, 8, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 7, 8, 5, 7, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 3, 0, 9, 5, 3, 5, 7, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 7, 8, 0, 1, 7, 1, 5, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 5, 3, 3, 5, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 7, 8, 9, 5, 7, 10, 1, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, - 1, - 1, - 1, - 1,
8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, - 1, - 1, - 1, - 1,
2, 10, 5, 2, 5, 3, 3, 5, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
7, 9, 5, 7, 8, 9, 3, 11, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, - 1, - 1, - 1, - 1,
2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, - 1, - 1, - 1, - 1,
11, 2, 1, 11, 1, 7, 7, 1, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, - 1, - 1, - 1, - 1,
5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, - 1,
11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, - 1,
11, 10, 5, 7, 11, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
10, 6, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 8, 3, 5, 10, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 0, 1, 5, 10, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 8, 3, 1, 9, 8, 5, 10, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 6, 5, 2, 6, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 6, 5, 1, 2, 6, 3, 0, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 6, 5, 9, 0, 6, 0, 2, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, - 1, - 1, - 1, - 1,
2, 3, 11, 10, 6, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
11, 0, 8, 11, 2, 0, 10, 6, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 1, 9, 2, 3, 11, 5, 10, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, - 1, - 1, - 1, - 1,
6, 3, 11, 6, 5, 3, 5, 1, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, - 1, - 1, - 1, - 1,
3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, - 1, - 1, - 1, - 1,
6, 5, 9, 6, 9, 11, 11, 9, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
5, 10, 6, 4, 7, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
4, 3, 0, 4, 7, 3, 6, 5, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 9, 0, 5, 10, 6, 8, 4, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, - 1, - 1, - 1, - 1,
6, 1, 2, 6, 5, 1, 4, 7, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, - 1, - 1, - 1, - 1,
8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, - 1, - 1, - 1, - 1,
7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, - 1,
3, 11, 2, 7, 8, 4, 10, 6, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, - 1, - 1, - 1, - 1,
0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, - 1, - 1, - 1, - 1,
9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, - 1,
8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, - 1, - 1, - 1, - 1,
5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, - 1,
0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, - 1,
6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, - 1, - 1, - 1, - 1,
10, 4, 9, 6, 4, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
4, 10, 6, 4, 9, 10, 0, 8, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
10, 0, 1, 10, 6, 0, 6, 4, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, - 1, - 1, - 1, - 1,
1, 4, 9, 1, 2, 4, 2, 6, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, - 1, - 1, - 1, - 1,
0, 2, 4, 4, 2, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
8, 3, 2, 8, 2, 4, 4, 2, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
10, 4, 9, 10, 6, 4, 11, 2, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, - 1, - 1, - 1, - 1,
3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, - 1, - 1, - 1, - 1,
6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, - 1,
9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, - 1, - 1, - 1, - 1,
8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, - 1,
3, 11, 6, 3, 6, 0, 0, 6, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
6, 4, 8, 11, 6, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
7, 10, 6, 7, 8, 10, 8, 9, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, - 1, - 1, - 1, - 1,
10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, - 1, - 1, - 1, - 1,
10, 6, 7, 10, 7, 1, 1, 7, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, - 1, - 1, - 1, - 1,
2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, - 1,
7, 8, 0, 7, 0, 6, 6, 0, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
7, 3, 2, 6, 7, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, - 1, - 1, - 1, - 1,
2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, - 1,
1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, - 1,
11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, - 1, - 1, - 1, - 1,
8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, - 1,
0, 9, 1, 11, 6, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, - 1, - 1, - 1, - 1,
7, 11, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
7, 6, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
3, 0, 8, 11, 7, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 1, 9, 11, 7, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
8, 1, 9, 8, 3, 1, 11, 7, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
10, 1, 2, 6, 11, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 2, 10, 3, 0, 8, 6, 11, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
2, 9, 0, 2, 10, 9, 6, 11, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, - 1, - 1, - 1, - 1,
7, 2, 3, 6, 2, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
7, 0, 8, 7, 6, 0, 6, 2, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
2, 7, 6, 2, 3, 7, 0, 1, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, - 1, - 1, - 1, - 1,
10, 7, 6, 10, 1, 7, 1, 3, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, - 1, - 1, - 1, - 1,
0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, - 1, - 1, - 1, - 1,
7, 6, 10, 7, 10, 8, 8, 10, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
6, 8, 4, 11, 8, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
3, 6, 11, 3, 0, 6, 0, 4, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
8, 6, 11, 8, 4, 6, 9, 0, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, - 1, - 1, - 1, - 1,
6, 8, 4, 6, 11, 8, 2, 10, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, - 1, - 1, - 1, - 1,
4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, - 1, - 1, - 1, - 1,
10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, - 1,
8, 2, 3, 8, 4, 2, 4, 6, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 4, 2, 4, 6, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, - 1, - 1, - 1, - 1,
1, 9, 4, 1, 4, 2, 2, 4, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, - 1, - 1, - 1, - 1,
10, 1, 0, 10, 0, 6, 6, 0, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, - 1,
10, 9, 4, 6, 10, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
4, 9, 5, 7, 6, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 8, 3, 4, 9, 5, 11, 7, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
5, 0, 1, 5, 4, 0, 7, 6, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, - 1, - 1, - 1, - 1,
9, 5, 4, 10, 1, 2, 7, 6, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, - 1, - 1, - 1, - 1,
7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, - 1, - 1, - 1, - 1,
3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, - 1,
7, 2, 3, 7, 6, 2, 5, 4, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, - 1, - 1, - 1, - 1,
3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, - 1, - 1, - 1, - 1,
6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, - 1,
9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, - 1, - 1, - 1, - 1,
1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, - 1,
4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, - 1,
7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, - 1, - 1, - 1, - 1,
6, 9, 5, 6, 11, 9, 11, 8, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, - 1, - 1, - 1, - 1,
0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, - 1, - 1, - 1, - 1,
6, 11, 3, 6, 3, 5, 5, 3, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, - 1, - 1, - 1, - 1,
0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, - 1,
11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, - 1,
6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, - 1, - 1, - 1, - 1,
5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, - 1, - 1, - 1, - 1,
9, 5, 6, 9, 6, 0, 0, 6, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, - 1,
1, 5, 6, 2, 1, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, - 1,
10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, - 1, - 1, - 1, - 1,
0, 3, 8, 5, 6, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
10, 5, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
11, 5, 10, 7, 5, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
11, 5, 10, 11, 7, 5, 8, 3, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
5, 11, 7, 5, 10, 11, 1, 9, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, - 1, - 1, - 1, - 1,
11, 1, 2, 11, 7, 1, 7, 5, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, - 1, - 1, - 1, - 1,
9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, - 1, - 1, - 1, - 1,
7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, - 1,
2, 5, 10, 2, 3, 5, 3, 7, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, - 1, - 1, - 1, - 1,
9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, - 1, - 1, - 1, - 1,
9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, - 1,
1, 3, 5, 3, 7, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 8, 7, 0, 7, 1, 1, 7, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 0, 3, 9, 3, 5, 5, 3, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 8, 7, 5, 9, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
5, 8, 4, 5, 10, 8, 10, 11, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, - 1, - 1, - 1, - 1,
0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, - 1, - 1, - 1, - 1,
10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, - 1,
2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, - 1, - 1, - 1, - 1,
0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, - 1,
0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, - 1,
9, 4, 5, 2, 11, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, - 1, - 1, - 1, - 1,
5, 10, 2, 5, 2, 4, 4, 2, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, - 1,
5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, - 1, - 1, - 1, - 1,
8, 4, 5, 8, 5, 3, 3, 5, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 4, 5, 1, 0, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, - 1, - 1, - 1, - 1,
9, 4, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
4, 11, 7, 4, 9, 11, 9, 10, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, - 1, - 1, - 1, - 1,
1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, - 1, - 1, - 1, - 1,
3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, - 1,
4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, - 1, - 1, - 1, - 1,
9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, - 1,
11, 7, 4, 11, 4, 2, 2, 4, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, - 1, - 1, - 1, - 1,
2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, - 1, - 1, - 1, - 1,
9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, - 1,
3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, - 1,
1, 10, 2, 8, 7, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
4, 9, 1, 4, 1, 7, 7, 1, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, - 1, - 1, - 1, - 1,
4, 0, 3, 7, 4, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
4, 8, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 10, 8, 10, 11, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
3, 0, 9, 3, 9, 11, 11, 9, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 1, 10, 0, 10, 8, 8, 10, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
3, 1, 10, 11, 3, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 2, 11, 1, 11, 9, 9, 11, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, - 1, - 1, - 1, - 1,
0, 2, 11, 8, 0, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
3, 2, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
2, 3, 8, 2, 8, 10, 10, 8, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
9, 10, 2, 0, 9, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, - 1, - 1, - 1, - 1,
1, 10, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
1, 3, 8, 9, 1, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 9, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
0, 3, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1,
- 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1 ] );



var edgeTable = new Int32Array([
	0x0  , 0x0  , 0x202, 0x302, 0x406, 0x406, 0x604, 0x704,
	0x804, 0x805, 0xa06, 0xa06, 0xc0a, 0xd03, 0xe08, 0xf00,
	0x90 , 0x98 , 0x292, 0x292, 0x496, 0x49e, 0x694, 0x694,
	0x894, 0x894, 0xa96, 0xa96, 0xc9a, 0xc92, 0xe91, 0xe90,
	0x230, 0x230, 0x33 , 0x13a, 0x636, 0x636, 0x434, 0x43c,
	0xa34, 0xa35, 0x837, 0x936, 0xe3a, 0xf32, 0xc31, 0xd30,
	0x2a0, 0x2a8, 0xa3 , 0xaa , 0x6a6, 0x6af, 0x5a4, 0x4ac,
	0xaa4, 0xaa4, 0x9a6, 0x8a6, 0xfaa, 0xea3, 0xca1, 0xca0,
	0x460, 0x460, 0x662, 0x762, 0x66 , 0x66 , 0x265, 0x364,
	0xc64, 0xc65, 0xe66, 0xe66, 0x86a, 0x863, 0xa69, 0xa60,
	0x4f0, 0x4f8, 0x6f2, 0x6f2, 0xf6 , 0xfe , 0x2f5, 0x2fc,
	0xcf4, 0xcf4, 0xef6, 0xef6, 0x8fa, 0x8f3, 0xaf9, 0xaf0,
	0x650, 0x650, 0x453, 0x552, 0x256, 0x256, 0x54 , 0x154,
	0xe54, 0xf54, 0xc57, 0xd56, 0xa5a, 0xb52, 0x859, 0x950,
	0x7c0, 0x6c1, 0x5c2, 0x4c2, 0x3c6, 0x2ce, 0xc5 , 0xc4 ,
	0xfc4, 0xec5, 0xdc6, 0xcc6, 0xbca, 0xac2, 0x8c1, 0x8c0,
	0x8c0, 0x8c0, 0xac2, 0xbc2, 0xcc6, 0xcc6, 0xec4, 0xfcc,
	0xc4 , 0xc5 , 0x2c6, 0x3c6, 0x4c2, 0x5c2, 0x6c1, 0x7c0,
	0x950, 0x859, 0xb52, 0xa5a, 0xd56, 0xc57, 0xe54, 0xe5c,
	0x154, 0x54 , 0x25e, 0x256, 0x552, 0x453, 0x658, 0x650,
	0xaf0, 0xaf0, 0x8f3, 0x8fa, 0xef6, 0xef6, 0xcf4, 0xcfc,
	0x2f4, 0x3f5, 0xff , 0x1f6, 0x6f2, 0x6f3, 0x4f9, 0x5f0,
	0xa60, 0xa69, 0x863, 0x86a, 0xe66, 0xe67, 0xd65, 0xc6c,
	0x364, 0x265, 0x166, 0x66 , 0x76a, 0x663, 0x460, 0x460,
	0xca0, 0xca0, 0xea2, 0xfa2, 0x8a6, 0x8a6, 0xaa4, 0xba4,
	0x4ac, 0x5a4, 0x6ae, 0x7a6, 0xaa , 0xa3 , 0x2a8, 0x2a0,
	0xd30, 0xc31, 0xf32, 0xe3a, 0x936, 0x837, 0xb35, 0xa34,
	0x43c, 0x434, 0x73e, 0x636, 0x13a, 0x33 , 0x339, 0x230,
	0xe90, 0xe90, 0xc92, 0xc9a, 0xa96, 0xa96, 0x894, 0x89c,
	0x694, 0x695, 0x49f, 0x496, 0x292, 0x392, 0x98 , 0x90 ,
	0xf00, 0xe08, 0xd03, 0xc0a, 0xa06, 0xa0e, 0x805, 0x804,
	0x704, 0x604, 0x506, 0x406, 0x302, 0x202, 0x0  , 0x0]);

var triTable = [
      [],
      [0, 8, 3],
      [0, 1, 9],
      [1, 8, 3, 9, 8, 1],
      [1, 2, 10],
      [0, 8, 3, 1, 2, 10],
      [9, 2, 10, 0, 2, 9],
      [2, 8, 3, 2, 10, 8, 10, 9, 8],
      [3, 11, 2],
      [0, 11, 2, 8, 11, 0],
      [1, 9, 0, 2, 3, 11],
      [1, 11, 2, 1, 9, 11, 9, 8, 11],
      [3, 10, 1, 11, 10, 3],
      [0, 10, 1, 0, 8, 10, 8, 11, 10],
      [3, 9, 0, 3, 11, 9, 11, 10, 9],
      [9, 8, 10, 10, 8, 11],
      [4, 7, 8],
      [4, 3, 0, 7, 3, 4],
      [0, 1, 9, 8, 4, 7],
      [4, 1, 9, 4, 7, 1, 7, 3, 1],
      [1, 2, 10, 8, 4, 7],
      [3, 4, 7, 3, 0, 4, 1, 2, 10],
      [9, 2, 10, 9, 0, 2, 8, 4, 7],
      [2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4],
      [8, 4, 7, 3, 11, 2],
      [11, 4, 7, 11, 2, 4, 2, 0, 4],
      [9, 0, 1, 8, 4, 7, 2, 3, 11],
      [4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1],
      [3, 10, 1, 3, 11, 10, 7, 8, 4],
      [1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4],
      [4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3],
      [4, 7, 11, 4, 11, 9, 9, 11, 10],
      [9, 5, 4],
      [9, 5, 4, 0, 8, 3],
      [0, 5, 4, 1, 5, 0],
      [8, 5, 4, 8, 3, 5, 3, 1, 5],
      [1, 2, 10, 9, 5, 4],
      [3, 0, 8, 1, 2, 10, 4, 9, 5],
      [5, 2, 10, 5, 4, 2, 4, 0, 2],
      [2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8],
      [9, 5, 4, 2, 3, 11],
      [0, 11, 2, 0, 8, 11, 4, 9, 5],
      [0, 5, 4, 0, 1, 5, 2, 3, 11],
      [2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5],
      [10, 3, 11, 10, 1, 3, 9, 5, 4],
      [4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10],
      [5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3],
      [5, 4, 8, 5, 8, 10, 10, 8, 11],
      [9, 7, 8, 5, 7, 9],
      [9, 3, 0, 9, 5, 3, 5, 7, 3],
      [0, 7, 8, 0, 1, 7, 1, 5, 7],
      [1, 5, 3, 3, 5, 7],
      [9, 7, 8, 9, 5, 7, 10, 1, 2],
      [10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3],
      [8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2],
      [2, 10, 5, 2, 5, 3, 3, 5, 7],
      [7, 9, 5, 7, 8, 9, 3, 11, 2],
      [9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11],
      [2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7],
      [11, 2, 1, 11, 1, 7, 7, 1, 5],
      [9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11],
      [5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0],
      [11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0],
      [11, 10, 5, 7, 11, 5],
      [10, 6, 5],
      [0, 8, 3, 5, 10, 6],
      [9, 0, 1, 5, 10, 6],
      [1, 8, 3, 1, 9, 8, 5, 10, 6],
      [1, 6, 5, 2, 6, 1],
      [1, 6, 5, 1, 2, 6, 3, 0, 8],
      [9, 6, 5, 9, 0, 6, 0, 2, 6],
      [5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8],
      [2, 3, 11, 10, 6, 5],
      [11, 0, 8, 11, 2, 0, 10, 6, 5],
      [0, 1, 9, 2, 3, 11, 5, 10, 6],
      [5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11],
      [6, 3, 11, 6, 5, 3, 5, 1, 3],
      [0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6],
      [3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9],
      [6, 5, 9, 6, 9, 11, 11, 9, 8],
      [5, 10, 6, 4, 7, 8],
      [4, 3, 0, 4, 7, 3, 6, 5, 10],
      [1, 9, 0, 5, 10, 6, 8, 4, 7],
      [10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4],
      [6, 1, 2, 6, 5, 1, 4, 7, 8],
      [1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7],
      [8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6],
      [7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9],
      [3, 11, 2, 7, 8, 4, 10, 6, 5],
      [5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11],
      [0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6],
      [9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6],
      [8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6],
      [5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11],
      [0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7],
      [6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9],
      [10, 4, 9, 6, 4, 10],
      [4, 10, 6, 4, 9, 10, 0, 8, 3],
      [10, 0, 1, 10, 6, 0, 6, 4, 0],
      [8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10],
      [1, 4, 9, 1, 2, 4, 2, 6, 4],
      [3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4],
      [0, 2, 4, 4, 2, 6],
      [8, 3, 2, 8, 2, 4, 4, 2, 6],
      [10, 4, 9, 10, 6, 4, 11, 2, 3],
      [0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6],
      [3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10],
      [6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1],
      [9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3],
      [8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1],
      [3, 11, 6, 3, 6, 0, 0, 6, 4],
      [6, 4, 8, 11, 6, 8],
      [7, 10, 6, 7, 8, 10, 8, 9, 10],
      [0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10],
      [10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0],
      [10, 6, 7, 10, 7, 1, 1, 7, 3],
      [1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7],
      [2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9],
      [7, 8, 0, 7, 0, 6, 6, 0, 2],
      [7, 3, 2, 6, 7, 2],
      [2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7],
      [2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7],
      [1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11],
      [11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1],
      [8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6],
      [0, 9, 1, 11, 6, 7],
      [7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0],
      [7, 11, 6],
      [7, 6, 11],
      [3, 0, 8, 11, 7, 6],
      [0, 1, 9, 11, 7, 6],
      [8, 1, 9, 8, 3, 1, 11, 7, 6],
      [10, 1, 2, 6, 11, 7],
      [1, 2, 10, 3, 0, 8, 6, 11, 7],
      [2, 9, 0, 2, 10, 9, 6, 11, 7],
      [6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8],
      [7, 2, 3, 6, 2, 7],
      [7, 0, 8, 7, 6, 0, 6, 2, 0],
      [2, 7, 6, 2, 3, 7, 0, 1, 9],
      [1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6],
      [10, 7, 6, 10, 1, 7, 1, 3, 7],
      [10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8],
      [0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7],
      [7, 6, 10, 7, 10, 8, 8, 10, 9],
      [6, 8, 4, 11, 8, 6],
      [3, 6, 11, 3, 0, 6, 0, 4, 6],
      [8, 6, 11, 8, 4, 6, 9, 0, 1],
      [9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6],
      [6, 8, 4, 6, 11, 8, 2, 10, 1],
      [1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6],
      [4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9],
      [10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3],
      [8, 2, 3, 8, 4, 2, 4, 6, 2],
      [0, 4, 2, 4, 6, 2],
      [1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8],
      [1, 9, 4, 1, 4, 2, 2, 4, 6],
      [8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1],
      [10, 1, 0, 10, 0, 6, 6, 0, 4],
      [4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3],
      [10, 9, 4, 6, 10, 4],
      [4, 9, 5, 7, 6, 11],
      [0, 8, 3, 4, 9, 5, 11, 7, 6],
      [5, 0, 1, 5, 4, 0, 7, 6, 11],
      [11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5],
      [9, 5, 4, 10, 1, 2, 7, 6, 11],
      [6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5],
      [7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2],
      [3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6],
      [7, 2, 3, 7, 6, 2, 5, 4, 9],
      [9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7],
      [3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0],
      [6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8],
      [9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7],
      [1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4],
      [4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10],
      [7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10],
      [6, 9, 5, 6, 11, 9, 11, 8, 9],
      [3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5],
      [0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11],
      [6, 11, 3, 6, 3, 5, 5, 3, 1],
      [1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6],
      [0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10],
      [11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5],
      [6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3],
      [5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2],
      [9, 5, 6, 9, 6, 0, 0, 6, 2],
      [1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8],
      [1, 5, 6, 2, 1, 6],
      [1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6],
      [10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0],
      [0, 3, 8, 5, 6, 10],
      [10, 5, 6],
      [11, 5, 10, 7, 5, 11],
      [11, 5, 10, 11, 7, 5, 8, 3, 0],
      [5, 11, 7, 5, 10, 11, 1, 9, 0],
      [10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1],
      [11, 1, 2, 11, 7, 1, 7, 5, 1],
      [0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11],
      [9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7],
      [7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2],
      [2, 5, 10, 2, 3, 5, 3, 7, 5],
      [8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5],
      [9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2],
      [9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2],
      [1, 3, 5, 3, 7, 5],
      [0, 8, 7, 0, 7, 1, 1, 7, 5],
      [9, 0, 3, 9, 3, 5, 5, 3, 7],
      [9, 8, 7, 5, 9, 7],
      [5, 8, 4, 5, 10, 8, 10, 11, 8],
      [5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0],
      [0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5],
      [10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4],
      [2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8],
      [0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11],
      [0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5],
      [9, 4, 5, 2, 11, 3],
      [2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4],
      [5, 10, 2, 5, 2, 4, 4, 2, 0],
      [3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9],
      [5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2],
      [8, 4, 5, 8, 5, 3, 3, 5, 1],
      [0, 4, 5, 1, 0, 5],
      [8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5],
      [9, 4, 5],
      [4, 11, 7, 4, 9, 11, 9, 10, 11],
      [0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11],
      [1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11],
      [3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4],
      [4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2],
      [9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3],
      [11, 7, 4, 11, 4, 2, 2, 4, 0],
      [11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4],
      [2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9],
      [9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7],
      [3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10],
      [1, 10, 2, 8, 7, 4],
      [4, 9, 1, 4, 1, 7, 7, 1, 3],
      [4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1],
      [4, 0, 3, 7, 4, 3],
      [4, 8, 7],
      [9, 10, 8, 10, 11, 8],
      [3, 0, 9, 3, 9, 11, 11, 9, 10],
      [0, 1, 10, 0, 10, 8, 8, 10, 11],
      [3, 1, 10, 11, 3, 10],
      [1, 2, 11, 1, 11, 9, 9, 11, 8],
      [3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9],
      [0, 2, 11, 8, 0, 11],
      [3, 2, 11],
      [2, 3, 8, 2, 8, 10, 10, 8, 9],
      [9, 10, 2, 0, 9, 2],
      [2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8],
      [1, 10, 2],
      [1, 3, 8, 9, 1, 8],
      [0, 9, 1],
      [0, 3, 8],
      []];

// generated from classical triTable by tools/isolut.py
var segTable = [
	[],
	[],
	[1, 9],
	[1, 8, 1, 9],
	[2, 10, 10, 1],
	[2, 10, 10, 1],
	[9, 2, 2, 10, 10, 9],
	[2, 8, 2, 10, 10, 8, 10, 9],
	[11, 2],
	[0, 11, 11, 2],
	[1, 9, 11, 2],
	[1, 11, 11, 2, 1, 9, 9, 11],
	[3, 10, 10, 1, 11, 10],
	[0, 10, 10, 1, 8, 10, 11, 10],
	[3, 9, 11, 9, 11, 10, 10, 9],
	[8, 10, 10, 9, 11, 10],
	[4, 7],
	[4, 3, 4, 7],
	[1, 9, 4, 7],
	[4, 1, 1, 9, 4, 7, 7, 1],
	[2, 10, 10, 1, 4, 7],
	[3, 4, 4, 7, 2, 10, 10, 1],
	[9, 2, 2, 10, 10, 9, 4, 7],
	[2, 10, 10, 9, 9, 2, 9, 7, 7, 2, 4, 7],
	[4, 7, 11, 2],
	[11, 4, 4, 7, 11, 2, 2, 4],
	[1, 9, 4, 7, 11, 2],
	[4, 7, 11, 4, 11, 9, 11, 2, 2, 9, 1, 9],
	[3, 10, 10, 1, 11, 10, 4, 7],
	[1, 11, 11, 10, 10, 1, 1, 4, 4, 11, 4, 7],
	[4, 7, 0, 11, 11, 9, 11, 10, 10, 9],
	[4, 7, 11, 4, 11, 9, 11, 10, 10, 9],
	[9, 5, 5, 4],
	[9, 5, 5, 4],
	[0, 5, 5, 4, 1, 5],
	[8, 5, 5, 4, 3, 5, 1, 5],
	[2, 10, 10, 1, 9, 5, 5, 4],
	[2, 10, 10, 1, 9, 5, 5, 4],
	[5, 2, 2, 10, 10, 5, 5, 4, 4, 2],
	[2, 10, 10, 5, 5, 2, 5, 3, 5, 4, 4, 3],
	[9, 5, 5, 4, 11, 2],
	[0, 11, 11, 2, 9, 5, 5, 4],
	[0, 5, 5, 4, 1, 5, 11, 2],
	[1, 5, 5, 2, 5, 8, 8, 2, 11, 2, 5, 4],
	[10, 3, 11, 10, 10, 1, 9, 5, 5, 4],
	[9, 5, 5, 4, 8, 1, 8, 10, 10, 1, 11, 10],
	[5, 4, 0, 5, 0, 11, 11, 5, 11, 10, 10, 5],
	[5, 4, 8, 5, 8, 10, 10, 5, 11, 10],
	[9, 7, 5, 7, 9, 5],
	[9, 3, 9, 5, 5, 3, 5, 7],
	[0, 7, 1, 7, 1, 5, 5, 7],
	[1, 5, 5, 3, 5, 7],
	[9, 7, 9, 5, 5, 7, 10, 1, 2, 10],
	[10, 1, 2, 10, 9, 5, 5, 0, 5, 3, 5, 7],
	[2, 8, 2, 5, 5, 8, 5, 7, 10, 5, 2, 10],
	[2, 10, 10, 5, 5, 2, 5, 3, 5, 7],
	[7, 9, 9, 5, 5, 7, 11, 2],
	[9, 5, 5, 7, 7, 9, 7, 2, 2, 9, 11, 2],
	[11, 2, 1, 8, 1, 7, 1, 5, 5, 7],
	[11, 2, 1, 11, 1, 7, 1, 5, 5, 7],
	[9, 5, 5, 8, 5, 7, 10, 1, 3, 10, 11, 10],
	[5, 7, 7, 0, 0, 5, 9, 5, 11, 0, 0, 10, 10, 1, 11, 10],
	[11, 10, 10, 0, 0, 11, 10, 5, 5, 0, 0, 7, 5, 7],
	[11, 10, 10, 5, 5, 11, 5, 7],
	[10, 6, 6, 5, 5, 10],
	[5, 10, 10, 6, 6, 5],
	[1, 9, 5, 10, 10, 6, 6, 5],
	[1, 8, 1, 9, 5, 10, 10, 6, 6, 5],
	[1, 6, 6, 5, 5, 1, 2, 6],
	[1, 6, 6, 5, 5, 1, 2, 6],
	[9, 6, 6, 5, 5, 9, 0, 6, 2, 6],
	[5, 9, 8, 5, 8, 2, 2, 5, 2, 6, 6, 5],
	[11, 2, 10, 6, 6, 5, 5, 10],
	[11, 0, 11, 2, 10, 6, 6, 5, 5, 10],
	[1, 9, 11, 2, 5, 10, 10, 6, 6, 5],
	[5, 10, 10, 6, 6, 5, 1, 9, 9, 2, 9, 11, 11, 2],
	[6, 3, 11, 6, 6, 5, 5, 3, 5, 1],
	[11, 0, 11, 5, 5, 0, 5, 1, 11, 6, 6, 5],
	[11, 6, 6, 3, 6, 0, 6, 5, 5, 0, 5, 9],
	[6, 5, 5, 9, 9, 6, 9, 11, 11, 6],
	[5, 10, 10, 6, 6, 5, 4, 7],
	[4, 3, 4, 7, 6, 5, 5, 10, 10, 6],
	[1, 9, 5, 10, 10, 6, 6, 5, 4, 7],
	[10, 6, 6, 5, 5, 10, 1, 9, 9, 7, 7, 1, 4, 7],
	[6, 1, 2, 6, 6, 5, 5, 1, 4, 7],
	[2, 5, 5, 1, 2, 6, 6, 5, 4, 3, 4, 7],
	[4, 7, 0, 5, 5, 9, 0, 6, 6, 5, 2, 6],
	[3, 9, 9, 7, 4, 7, 2, 9, 5, 9, 9, 6, 6, 5, 2, 6],
	[11, 2, 4, 7, 10, 6, 6, 5, 5, 10],
	[5, 10, 10, 6, 6, 5, 4, 7, 7, 2, 2, 4, 11, 2],
	[1, 9, 4, 7, 11, 2, 5, 10, 10, 6, 6, 5],
	[9, 2, 1, 9, 9, 11, 11, 2, 4, 11, 4, 7, 5, 10, 10, 6, 6, 5],
	[4, 7, 11, 5, 5, 3, 5, 1, 11, 6, 6, 5],
	[5, 1, 1, 11, 11, 5, 11, 6, 6, 5, 0, 11, 11, 4, 4, 7],
	[0, 5, 5, 9, 0, 6, 6, 5, 3, 6, 11, 6, 4, 7],
	[6, 5, 5, 9, 9, 6, 9, 11, 11, 6, 4, 7, 7, 9],
	[10, 4, 9, 10, 6, 4, 10, 6],
	[4, 10, 10, 6, 6, 4, 9, 10],
	[10, 0, 1, 10, 10, 6, 6, 0, 6, 4],
	[1, 8, 1, 6, 6, 8, 6, 4, 1, 10, 10, 6],
	[1, 4, 9, 1, 2, 4, 2, 6, 6, 4],
	[2, 9, 9, 1, 2, 4, 2, 6, 6, 4],
	[2, 4, 2, 6, 6, 4],
	[2, 8, 2, 4, 2, 6, 6, 4],
	[10, 4, 9, 10, 10, 6, 6, 4, 11, 2],
	[8, 2, 11, 2, 9, 10, 10, 4, 10, 6, 6, 4],
	[11, 2, 1, 6, 6, 0, 6, 4, 1, 10, 10, 6],
	[6, 4, 4, 1, 1, 6, 1, 10, 10, 6, 8, 1, 1, 11, 11, 2],
	[9, 6, 6, 4, 9, 3, 3, 6, 9, 1, 11, 6],
	[11, 1, 1, 8, 11, 6, 6, 1, 9, 1, 1, 4, 6, 4],
	[11, 6, 6, 3, 6, 0, 6, 4],
	[6, 4, 8, 6, 11, 6],
	[7, 10, 10, 6, 6, 7, 8, 10, 9, 10],
	[0, 7, 0, 10, 10, 7, 9, 10, 6, 7, 10, 6],
	[10, 6, 6, 7, 7, 10, 1, 10, 7, 1, 8, 1],
	[10, 6, 6, 7, 7, 10, 7, 1, 1, 10],
	[2, 6, 6, 1, 6, 8, 8, 1, 9, 1, 6, 7],
	[2, 6, 6, 9, 9, 2, 9, 1, 6, 7, 7, 9, 9, 3],
	[0, 7, 0, 6, 6, 7, 2, 6],
	[2, 7, 6, 7, 2, 6],
	[11, 2, 10, 6, 6, 8, 8, 10, 9, 10, 6, 7],
	[0, 7, 7, 2, 11, 2, 9, 7, 6, 7, 7, 10, 10, 6, 9, 10],
	[1, 8, 1, 7, 1, 10, 10, 7, 6, 7, 10, 6, 11, 2],
	[11, 2, 1, 11, 1, 7, 10, 6, 6, 1, 1, 10, 6, 7],
	[9, 6, 6, 8, 6, 7, 9, 1, 1, 6, 11, 6, 6, 3],
	[9, 1, 11, 6, 6, 7],
	[0, 7, 0, 6, 6, 7, 11, 0, 11, 6],
	[11, 6, 6, 7],
	[7, 6, 6, 11],
	[7, 6, 6, 11],
	[1, 9, 7, 6, 6, 11],
	[8, 1, 1, 9, 7, 6, 6, 11],
	[10, 1, 2, 10, 6, 11, 7, 6],
	[2, 10, 10, 1, 6, 11, 7, 6],
	[2, 9, 2, 10, 10, 9, 6, 11, 7, 6],
	[6, 11, 7, 6, 2, 10, 10, 3, 10, 8, 10, 9],
	[7, 2, 6, 2, 7, 6],
	[7, 0, 7, 6, 6, 0, 6, 2],
	[2, 7, 7, 6, 6, 2, 1, 9],
	[1, 6, 6, 2, 1, 8, 8, 6, 1, 9, 7, 6],
	[10, 7, 7, 6, 6, 10, 10, 1, 1, 7],
	[10, 7, 7, 6, 6, 10, 1, 7, 10, 1, 1, 8],
	[7, 0, 7, 10, 10, 0, 10, 9, 6, 10, 7, 6],
	[7, 6, 6, 10, 10, 7, 10, 8, 10, 9],
	[6, 8, 4, 6, 6, 11],
	[3, 6, 6, 11, 0, 6, 4, 6],
	[8, 6, 6, 11, 4, 6, 1, 9],
	[4, 6, 6, 9, 6, 3, 3, 9, 1, 9, 6, 11],
	[6, 8, 4, 6, 6, 11, 2, 10, 10, 1],
	[2, 10, 10, 1, 0, 11, 0, 6, 6, 11, 4, 6],
	[4, 11, 4, 6, 6, 11, 2, 9, 2, 10, 10, 9],
	[10, 9, 9, 3, 3, 10, 2, 10, 4, 3, 3, 6, 6, 11, 4, 6],
	[8, 2, 4, 2, 4, 6, 6, 2],
	[4, 2, 4, 6, 6, 2],
	[1, 9, 3, 4, 4, 2, 4, 6, 6, 2],
	[1, 9, 4, 1, 4, 2, 4, 6, 6, 2],
	[8, 1, 8, 6, 6, 1, 4, 6, 6, 10, 10, 1],
	[10, 1, 0, 10, 0, 6, 6, 10, 4, 6],
	[4, 6, 6, 3, 3, 4, 6, 10, 10, 3, 3, 9, 10, 9],
	[10, 9, 4, 10, 6, 10, 4, 6],
	[9, 5, 5, 4, 7, 6, 6, 11],
	[9, 5, 5, 4, 7, 6, 6, 11],
	[5, 0, 1, 5, 5, 4, 7, 6, 6, 11],
	[7, 6, 6, 11, 3, 4, 3, 5, 5, 4, 1, 5],
	[9, 5, 5, 4, 10, 1, 2, 10, 7, 6, 6, 11],
	[6, 11, 7, 6, 2, 10, 10, 1, 9, 5, 5, 4],
	[7, 6, 6, 11, 5, 4, 4, 10, 10, 5, 4, 2, 2, 10],
	[3, 4, 3, 5, 5, 4, 2, 5, 10, 5, 2, 10, 7, 6, 6, 11],
	[7, 2, 7, 6, 6, 2, 5, 4, 9, 5],
	[9, 5, 5, 4, 8, 6, 6, 0, 6, 2, 7, 6],
	[3, 6, 6, 2, 7, 6, 1, 5, 5, 0, 5, 4],
	[6, 2, 2, 8, 8, 6, 7, 6, 1, 8, 8, 5, 5, 4, 1, 5],
	[9, 5, 5, 4, 10, 1, 1, 6, 6, 10, 1, 7, 7, 6],
	[1, 6, 6, 10, 10, 1, 1, 7, 7, 6, 0, 7, 9, 5, 5, 4],
	[0, 10, 10, 4, 10, 5, 5, 4, 3, 10, 6, 10, 10, 7, 7, 6],
	[7, 6, 6, 10, 10, 7, 10, 8, 5, 4, 4, 10, 10, 5],
	[6, 9, 9, 5, 5, 6, 6, 11, 11, 9],
	[3, 6, 6, 11, 0, 6, 0, 5, 5, 6, 9, 5],
	[0, 11, 0, 5, 5, 11, 1, 5, 5, 6, 6, 11],
	[6, 11, 3, 6, 3, 5, 5, 6, 1, 5],
	[2, 10, 10, 1, 9, 5, 5, 11, 11, 9, 5, 6, 6, 11],
	[0, 11, 0, 6, 6, 11, 9, 6, 5, 6, 9, 5, 2, 10, 10, 1],
	[8, 5, 5, 11, 5, 6, 6, 11, 0, 5, 10, 5, 5, 2, 2, 10],
	[6, 11, 3, 6, 3, 5, 5, 6, 2, 10, 10, 3, 10, 5],
	[5, 8, 9, 5, 5, 2, 2, 8, 5, 6, 6, 2],
	[9, 5, 5, 6, 6, 9, 6, 0, 6, 2],
	[1, 5, 5, 8, 8, 1, 5, 6, 6, 8, 8, 2, 6, 2],
	[1, 5, 5, 6, 6, 1, 6, 2],
	[3, 6, 6, 1, 6, 10, 10, 1, 8, 6, 5, 6, 6, 9, 9, 5],
	[10, 1, 0, 10, 0, 6, 6, 10, 9, 5, 5, 0, 5, 6],
	[5, 6, 6, 10, 10, 5],
	[10, 5, 5, 6, 6, 10],
	[11, 5, 5, 10, 10, 11, 7, 5],
	[11, 5, 5, 10, 10, 11, 7, 5],
	[5, 11, 7, 5, 5, 10, 10, 11, 1, 9],
	[10, 7, 7, 5, 5, 10, 10, 11, 8, 1, 1, 9],
	[11, 1, 2, 11, 7, 1, 7, 5, 5, 1],
	[2, 7, 7, 1, 7, 5, 5, 1, 2, 11],
	[9, 7, 7, 5, 5, 9, 9, 2, 2, 7, 2, 11],
	[7, 5, 5, 2, 2, 7, 2, 11, 5, 9, 9, 2, 2, 8],
	[2, 5, 5, 10, 10, 2, 3, 5, 7, 5],
	[8, 2, 8, 5, 5, 2, 7, 5, 10, 2, 5, 10],
	[1, 9, 5, 10, 10, 3, 3, 5, 7, 5, 10, 2],
	[8, 2, 2, 9, 1, 9, 7, 2, 10, 2, 2, 5, 5, 10, 7, 5],
	[3, 5, 5, 1, 7, 5],
	[7, 0, 7, 1, 7, 5, 5, 1],
	[3, 9, 3, 5, 5, 9, 7, 5],
	[7, 9, 5, 9, 7, 5],
	[5, 8, 4, 5, 5, 10, 10, 8, 10, 11],
	[5, 0, 4, 5, 5, 11, 11, 0, 5, 10, 10, 11],
	[1, 9, 4, 10, 10, 8, 10, 11, 4, 5, 5, 10],
	[10, 11, 11, 4, 4, 10, 4, 5, 5, 10, 3, 4, 4, 1, 1, 9],
	[2, 5, 5, 1, 2, 8, 8, 5, 2, 11, 4, 5],
	[4, 11, 11, 0, 4, 5, 5, 11, 2, 11, 11, 1, 5, 1],
	[2, 5, 5, 0, 5, 9, 2, 11, 11, 5, 4, 5, 5, 8],
	[4, 5, 5, 9, 2, 11],
	[2, 5, 5, 10, 10, 2, 3, 5, 3, 4, 4, 5],
	[5, 10, 10, 2, 2, 5, 2, 4, 4, 5],
	[3, 10, 10, 2, 3, 5, 5, 10, 8, 5, 4, 5, 1, 9],
	[5, 10, 10, 2, 2, 5, 2, 4, 4, 5, 1, 9, 9, 2],
	[4, 5, 5, 8, 5, 3, 5, 1],
	[4, 5, 5, 0, 5, 1],
	[4, 5, 5, 8, 5, 3, 0, 5, 5, 9],
	[4, 5, 5, 9],
	[4, 11, 7, 4, 9, 11, 9, 10, 10, 11],
	[9, 7, 7, 4, 9, 11, 9, 10, 10, 11],
	[1, 10, 10, 11, 11, 1, 11, 4, 4, 1, 7, 4],
	[1, 4, 4, 3, 1, 10, 10, 4, 7, 4, 4, 11, 10, 11],
	[4, 11, 7, 4, 9, 11, 9, 2, 2, 11, 9, 1],
	[9, 7, 7, 4, 9, 11, 9, 1, 1, 11, 2, 11],
	[7, 4, 4, 11, 4, 2, 2, 11],
	[7, 4, 4, 11, 4, 2, 2, 11, 3, 4],
	[2, 9, 9, 10, 10, 2, 2, 7, 7, 9, 7, 4],
	[9, 10, 10, 7, 7, 9, 7, 4, 10, 2, 2, 7, 7, 0],
	[7, 10, 10, 3, 10, 2, 7, 4, 4, 10, 1, 10, 10, 0],
	[1, 10, 10, 2, 7, 4],
	[9, 1, 1, 4, 1, 7, 7, 4],
	[9, 1, 1, 4, 1, 7, 7, 4, 8, 1],
	[3, 4, 7, 4],
	[7, 4],
	[9, 10, 10, 8, 10, 11],
	[9, 3, 9, 11, 9, 10, 10, 11],
	[1, 10, 10, 0, 10, 8, 10, 11],
	[1, 10, 10, 3, 10, 11],
	[2, 11, 11, 1, 11, 9, 9, 1],
	[9, 3, 9, 11, 2, 9, 9, 1, 2, 11],
	[2, 11, 11, 0],
	[2, 11],
	[8, 2, 8, 10, 10, 2, 9, 10],
	[9, 10, 10, 2, 2, 9],
	[8, 2, 8, 10, 10, 2, 1, 8, 1, 10],
	[1, 10, 10, 2],
	[8, 1, 9, 1],
	[9, 1],
	[],
	[]];

var segTable2 = [
	[],
	[],
	[1, 9],
	[1, 9],
	[2, 10, 10, 1],
	[2, 10, 10, 1],
	[2, 10, 10, 9],
	[2, 10, 10, 9],
	[11, 2],
	[11, 2],
	[1, 9, 11, 2],
	[11, 2, 1, 9],
	[10, 1, 11, 10],
	[10, 1, 11, 10],
	[11, 10, 10, 9],
	[10, 9, 11, 10],
	[4, 7],
	[4, 7],
	[1, 9, 4, 7],
	[1, 9, 4, 7],
	[2, 10, 10, 1, 4, 7],
	[4, 7, 2, 10, 10, 1],
	[2, 10, 10, 9, 4, 7],
	[2, 10, 10, 9, 4, 7],
	[4, 7, 11, 2],
	[4, 7, 11, 2],
	[1, 9, 4, 7, 11, 2],
	[4, 7, 11, 2, 1, 9],
	[10, 1, 11, 10, 4, 7],
	[11, 10, 10, 1, 4, 7],
	[4, 7, 11, 10, 10, 9],
	[4, 7, 11, 10, 10, 9],
	[9, 5, 5, 4],
	[9, 5, 5, 4],
	[5, 4, 1, 5],
	[5, 4, 1, 5],
	[2, 10, 10, 1, 9, 5, 5, 4],
	[2, 10, 10, 1, 9, 5, 5, 4],
	[2, 10, 10, 5, 5, 4],
	[2, 10, 10, 5, 5, 4],
	[9, 5, 5, 4, 11, 2],
	[11, 2, 9, 5, 5, 4],
	[5, 4, 1, 5, 11, 2],
	[1, 5, 11, 2, 5, 4],
	[11, 10, 10, 1, 9, 5, 5, 4],
	[9, 5, 5, 4, 10, 1, 11, 10],
	[5, 4, 11, 10, 10, 5],
	[5, 4, 10, 5, 11, 10],
	[5, 7, 9, 5],
	[9, 5, 5, 7],
	[1, 5, 5, 7],
	[1, 5, 5, 7],
	[9, 5, 5, 7, 10, 1, 2, 10],
	[10, 1, 2, 10, 9, 5, 5, 7],
	[5, 7, 10, 5, 2, 10],
	[2, 10, 10, 5, 5, 7],
	[9, 5, 5, 7, 11, 2],
	[9, 5, 5, 7, 11, 2],
	[11, 2, 1, 5, 5, 7],
	[11, 2, 1, 5, 5, 7],
	[9, 5, 5, 7, 10, 1, 11, 10],
	[5, 7, 9, 5, 10, 1, 11, 10],
	[11, 10, 10, 5, 5, 7],
	[11, 10, 10, 5, 5, 7],
	[10, 6, 6, 5, 5, 10],
	[5, 10, 10, 6, 6, 5],
	[1, 9, 5, 10, 10, 6, 6, 5],
	[1, 9, 5, 10, 10, 6, 6, 5],
	[6, 5, 5, 1, 2, 6],
	[6, 5, 5, 1, 2, 6],
	[6, 5, 5, 9, 2, 6],
	[5, 9, 2, 6, 6, 5],
	[11, 2, 10, 6, 6, 5, 5, 10],
	[11, 2, 10, 6, 6, 5, 5, 10],
	[1, 9, 11, 2, 5, 10, 10, 6, 6, 5],
	[5, 10, 10, 6, 6, 5, 1, 9, 11, 2],
	[11, 6, 6, 5, 5, 1],
	[5, 1, 11, 6, 6, 5],
	[11, 6, 6, 5, 5, 9],
	[6, 5, 5, 9, 11, 6],
	[5, 10, 10, 6, 6, 5, 4, 7],
	[4, 7, 6, 5, 5, 10, 10, 6],
	[1, 9, 5, 10, 10, 6, 6, 5, 4, 7],
	[10, 6, 6, 5, 5, 10, 1, 9, 4, 7],
	[2, 6, 6, 5, 5, 1, 4, 7],
	[5, 1, 2, 6, 6, 5, 4, 7],
	[4, 7, 5, 9, 6, 5, 2, 6],
	[4, 7, 5, 9, 6, 5, 2, 6],
	[11, 2, 4, 7, 10, 6, 6, 5, 5, 10],
	[5, 10, 10, 6, 6, 5, 4, 7, 11, 2],
	[1, 9, 4, 7, 11, 2, 5, 10, 10, 6, 6, 5],
	[1, 9, 11, 2, 4, 7, 5, 10, 10, 6, 6, 5],
	[4, 7, 5, 1, 11, 6, 6, 5],
	[5, 1, 11, 6, 6, 5, 4, 7],
	[5, 9, 6, 5, 11, 6, 4, 7],
	[6, 5, 5, 9, 11, 6, 4, 7],
	[9, 10, 6, 4, 10, 6],
	[10, 6, 6, 4, 9, 10],
	[1, 10, 10, 6, 6, 4],
	[6, 4, 1, 10, 10, 6],
	[9, 1, 2, 6, 6, 4],
	[9, 1, 2, 6, 6, 4],
	[2, 6, 6, 4],
	[2, 6, 6, 4],
	[9, 10, 10, 6, 6, 4, 11, 2],
	[11, 2, 9, 10, 10, 6, 6, 4],
	[11, 2, 6, 4, 1, 10, 10, 6],
	[6, 4, 1, 10, 10, 6, 11, 2],
	[6, 4, 9, 1, 11, 6],
	[11, 6, 9, 1, 6, 4],
	[11, 6, 6, 4],
	[6, 4, 11, 6],
	[10, 6, 6, 7, 9, 10],
	[9, 10, 6, 7, 10, 6],
	[10, 6, 6, 7, 1, 10],
	[10, 6, 6, 7, 1, 10],
	[2, 6, 9, 1, 6, 7],
	[2, 6, 9, 1, 6, 7],
	[6, 7, 2, 6],
	[6, 7, 2, 6],
	[11, 2, 10, 6, 9, 10, 6, 7],
	[11, 2, 6, 7, 10, 6, 9, 10],
	[1, 10, 6, 7, 10, 6, 11, 2],
	[11, 2, 10, 6, 1, 10, 6, 7],
	[6, 7, 9, 1, 11, 6],
	[9, 1, 11, 6, 6, 7],
	[6, 7, 11, 6],
	[11, 6, 6, 7],
	[7, 6, 6, 11],
	[7, 6, 6, 11],
	[1, 9, 7, 6, 6, 11],
	[1, 9, 7, 6, 6, 11],
	[10, 1, 2, 10, 6, 11, 7, 6],
	[2, 10, 10, 1, 6, 11, 7, 6],
	[2, 10, 10, 9, 6, 11, 7, 6],
	[6, 11, 7, 6, 2, 10, 10, 9],
	[6, 2, 7, 6],
	[7, 6, 6, 2],
	[7, 6, 6, 2, 1, 9],
	[6, 2, 1, 9, 7, 6],
	[7, 6, 6, 10, 10, 1],
	[7, 6, 6, 10, 10, 1],
	[10, 9, 6, 10, 7, 6],
	[7, 6, 6, 10, 10, 9],
	[4, 6, 6, 11],
	[6, 11, 4, 6],
	[6, 11, 4, 6, 1, 9],
	[4, 6, 1, 9, 6, 11],
	[4, 6, 6, 11, 2, 10, 10, 1],
	[2, 10, 10, 1, 6, 11, 4, 6],
	[4, 6, 6, 11, 2, 10, 10, 9],
	[10, 9, 2, 10, 6, 11, 4, 6],
	[4, 6, 6, 2],
	[4, 6, 6, 2],
	[1, 9, 4, 6, 6, 2],
	[1, 9, 4, 6, 6, 2],
	[4, 6, 6, 10, 10, 1],
	[10, 1, 6, 10, 4, 6],
	[4, 6, 6, 10, 10, 9],
	[10, 9, 6, 10, 4, 6],
	[9, 5, 5, 4, 7, 6, 6, 11],
	[9, 5, 5, 4, 7, 6, 6, 11],
	[1, 5, 5, 4, 7, 6, 6, 11],
	[7, 6, 6, 11, 5, 4, 1, 5],
	[9, 5, 5, 4, 10, 1, 2, 10, 7, 6, 6, 11],
	[6, 11, 7, 6, 2, 10, 10, 1, 9, 5, 5, 4],
	[7, 6, 6, 11, 5, 4, 10, 5, 2, 10],
	[5, 4, 10, 5, 2, 10, 7, 6, 6, 11],
	[7, 6, 6, 2, 5, 4, 9, 5],
	[9, 5, 5, 4, 6, 2, 7, 6],
	[6, 2, 7, 6, 1, 5, 5, 4],
	[6, 2, 7, 6, 5, 4, 1, 5],
	[9, 5, 5, 4, 10, 1, 6, 10, 7, 6],
	[6, 10, 10, 1, 7, 6, 9, 5, 5, 4],
	[10, 5, 5, 4, 6, 10, 7, 6],
	[7, 6, 6, 10, 5, 4, 10, 5],
	[9, 5, 5, 6, 6, 11],
	[6, 11, 5, 6, 9, 5],
	[1, 5, 5, 6, 6, 11],
	[6, 11, 5, 6, 1, 5],
	[2, 10, 10, 1, 9, 5, 5, 6, 6, 11],
	[6, 11, 5, 6, 9, 5, 2, 10, 10, 1],
	[5, 6, 6, 11, 10, 5, 2, 10],
	[6, 11, 5, 6, 2, 10, 10, 5],
	[9, 5, 5, 6, 6, 2],
	[9, 5, 5, 6, 6, 2],
	[1, 5, 5, 6, 6, 2],
	[1, 5, 5, 6, 6, 2],
	[6, 10, 10, 1, 5, 6, 9, 5],
	[10, 1, 6, 10, 9, 5, 5, 6],
	[5, 6, 6, 10, 10, 5],
	[10, 5, 5, 6, 6, 10],
	[5, 10, 10, 11, 7, 5],
	[5, 10, 10, 11, 7, 5],
	[7, 5, 5, 10, 10, 11, 1, 9],
	[7, 5, 5, 10, 10, 11, 1, 9],
	[2, 11, 7, 5, 5, 1],
	[7, 5, 5, 1, 2, 11],
	[7, 5, 5, 9, 2, 11],
	[7, 5, 2, 11, 5, 9],
	[5, 10, 10, 2, 7, 5],
	[7, 5, 10, 2, 5, 10],
	[1, 9, 5, 10, 7, 5, 10, 2],
	[1, 9, 10, 2, 5, 10, 7, 5],
	[5, 1, 7, 5],
	[7, 5, 5, 1],
	[5, 9, 7, 5],
	[5, 9, 7, 5],
	[4, 5, 5, 10, 10, 11],
	[4, 5, 5, 10, 10, 11],
	[1, 9, 10, 11, 4, 5, 5, 10],
	[10, 11, 4, 5, 5, 10, 1, 9],
	[5, 1, 2, 11, 4, 5],
	[4, 5, 2, 11, 5, 1],
	[5, 9, 2, 11, 4, 5],
	[4, 5, 5, 9, 2, 11],
	[5, 10, 10, 2, 4, 5],
	[5, 10, 10, 2, 4, 5],
	[10, 2, 5, 10, 4, 5, 1, 9],
	[5, 10, 10, 2, 4, 5, 1, 9],
	[4, 5, 5, 1],
	[4, 5, 5, 1],
	[4, 5, 5, 9],
	[4, 5, 5, 9],
	[7, 4, 9, 10, 10, 11],
	[7, 4, 9, 10, 10, 11],
	[1, 10, 10, 11, 7, 4],
	[1, 10, 7, 4, 10, 11],
	[7, 4, 2, 11, 9, 1],
	[7, 4, 9, 1, 2, 11],
	[7, 4, 2, 11],
	[7, 4, 2, 11],
	[9, 10, 10, 2, 7, 4],
	[9, 10, 7, 4, 10, 2],
	[10, 2, 7, 4, 1, 10],
	[1, 10, 10, 2, 7, 4],
	[9, 1, 7, 4],
	[9, 1, 7, 4],
	[7, 4],
	[7, 4],
	[9, 10, 10, 11],
	[9, 10, 10, 11],
	[1, 10, 10, 11],
	[1, 10, 10, 11],
	[2, 11, 9, 1],
	[9, 1, 2, 11],
	[2, 11],
	[2, 11],
	[10, 2, 9, 10],
	[9, 10, 10, 2],
	[10, 2, 1, 10],
	[1, 10, 10, 2],
	[9, 1],
	[9, 1],
	[],
	[]];

var edgeIndex = [[0,1], [1,2], [2,3], [3,0], [4,5], [5,6],
				[6,7], [7,4], [0,4], [1,5], [2,6], [3,7]];

/*
 * UglyMol v0.5.7. Macromolecular Viewer for Crystallographers.
 * Copyright 2014 Nat Echols
 * Copyright 2016 Diamond Light Source Ltd
 * Copyright 2016 Marcin Wojdyr
 * Released under the MIT License.
 * Modified by Hamish Todd
 */


MapMirror.prototype.unit = 'e/\u212B\u00B3';




// http://www.ccp4.ac.uk/html/maplib.html#description
// eslint-disable-next-line complexity
MapMirror.prototype.from_ccp4 = function from_ccp4 (buf /*:ArrayBuffer*/)
{
	var expand_symmetry = true;

	if (buf.byteLength < 1024) { throw Error('File shorter than 1024 bytes.'); }
	//console.log('buf type: ' + Object.prototype.toString.call(buf));
	// for now we assume both file and host are little endian
	var iview = new Int32Array(buf, 0, 256);
	// word 53 - character string 'MAP ' to identify file type
	if (iview[52] !== 0x2050414d) { throw Error('not a CCP4 map'); }
	// map has 3 dimensions referred to as columns (fastest changing), rows
	// and sections (c-r-s)
	var n_crs = [iview[0], iview[1], iview[2]];
	var mode = iview[3];
	var nb;
	if (mode === 2) { nb = 4; }
	else if (mode === 0) { nb = 1; }
	else { throw Error('Only Mode 2 and Mode 0 of CCP4 map is supported.'); }
	var start = [iview[4], iview[5], iview[6]];
	var n_grid = [iview[7], iview[8], iview[9]];
	var nsymbt = iview[23]; // size of extended header in bytes
	if (1024 + nsymbt + nb*n_crs[0]*n_crs[1]*n_crs[2] !== buf.byteLength) {
		throw Error('ccp4 file too short or too long');
	}
	var fview = new Float32Array(buf, 0, buf.byteLength >> 2);
	this.unit_cell = new UnitCell(fview[10], fview[11], fview[12],
																fview[13], fview[14], fview[15]);
	// MAPC, MAPR, MAPS - axis corresp to cols, rows, sections (1,2,3 for X,Y,Z)
	var map_crs = [iview[16], iview[17], iview[18]];
	var ax = map_crs.indexOf(1);
	var ay = map_crs.indexOf(2);
	var az = map_crs.indexOf(3);

	var min = fview[19];
	var max = fview[20];
	//const sg_number = iview[22];
	//const lskflg = iview[24];
	var grid = new GridArray(n_grid);
	if (nsymbt % 4 !== 0) {
		throw Error('CCP4 map with NSYMBT not divisible by 4 is not supported.');
	}
	var data_view;
	if (mode === 2) { data_view = fview; }
	else /* mode === 0 */ { data_view = new Int8Array(buf); }
	var idx = (1024 + nsymbt) / nb | 0;

	// We assume that if DMEAN and RMS from the header are not clearly wrong
	// they are what the user wants. Because the map can cover a small part
	// of the asu and its rmsd may be different than the total rmsd.
	this.stats.mean = fview[21];
	this.stats.rms = fview[54];
	if (this.stats.mean < min || this.stats.mean > max || this.stats.rms <= 0) {
		this.stats = calculate_stddev(data_view, idx);
	}
	var b1 = 1;
	var b0 = 0;
	// if the file was converted by mapmode2to0 - scale the data
	if (mode === 0 && iview[39] === -128 && iview[40] === 127) {
		// scaling f(x)=b1*x+b0 such that f(-128)=min and f(127)=max
		b1 = (max - min) / 255.0;
		b0 = 0.5 * (min + max + b1);
	}

	var end = [start[0] + n_crs[0], start[1] + n_crs[1], start[2] + n_crs[2]];
	var it = [0, 0, 0];
	for (it[2] = start[2]; it[2] < end[2]; it[2]++) { // sections
		for (it[1] = start[1]; it[1] < end[1]; it[1]++) { // rows
			for (it[0] = start[0]; it[0] < end[0]; it[0]++) { // cols
				grid.set_grid_value(it[ax], it[ay], it[az], b1 * data_view[idx] + b0);
				idx++;
			}
		}
	}
	if (expand_symmetry && nsymbt > 0) {
		var u8view = new Uint8Array(buf);
		for (var i = 0; i+80 <= nsymbt; i += 80) {
			var j = (void 0);
			var symop = '';
			for (j = 0; j < 80; ++j) {
				symop += String.fromCharCode(u8view[1024 + i + j]);
			}
			if (/^\s*x\s*,\s*y\s*,\s*z\s*$/i.test(symop)) { continue; }// skip x,y,z
			//console.log('sym ops', symop.trim());
			var mat = parse_symop(symop);
			// Note: we apply here symops to grid points instead of coordinates.
			// In the cases we came across it is equivalent, but in general not.
			for (j = 0; j < 3; ++j) {
				mat[j][3] = Math.round(mat[j][3] * n_grid[j]) | 0;
			}
			idx = (1024 + nsymbt) / nb | 0;
			var xyz = [0, 0, 0];
			for (it[2] = start[2]; it[2] < end[2]; it[2]++) { // sections
				for (it[1] = start[1]; it[1] < end[1]; it[1]++) { // rows
					for (it[0] = start[0]; it[0] < end[0]; it[0]++) { // cols
						for (j = 0; j < 3; ++j) {
							xyz[j] = it[ax] * mat[j][0] + it[ay] * mat[j][1] +
											 it[az] * mat[j][2] + mat[j][3];
						}
						grid.set_grid_value(xyz[0], xyz[1], xyz[2],
																b1 * data_view[idx] + b0);
						idx++;
					}
				}
			}
		}
	}
	this.grid = grid;
};

// DSN6 MAP FORMAT
// http://www.uoxray.uoregon.edu/tnt/manual/node104.html
// Density values are stored as bytes.
MapMirror.prototype.from_dsn6 = function from_dsn6 (buf /*: ArrayBuffer*/) {
	//console.log('buf type: ' + Object.prototype.toString.call(buf));
	var u8data = new Uint8Array(buf);
	var iview = new Int16Array(u8data.buffer);
	if (iview[18] !== 100) {
		var len = iview.length;// or only header, 256?
		for (var n = 0; n < len; n++) {
			// swapping bytes with Uint8Array like this:
			// var tmp=u8data[n*2]; u8data[n*2]=u8data[n*2+1]; u8data[n*2+1]=tmp;
			// was slowing down this whole function 5x times (!?) on V8.
			var val = iview[n];
			iview[n] = ((val & 0xff) << 8) | ((val >> 8) & 0xff);
		}
	}
	if (iview[18] !== 100) {
		throw Error('Endian swap failed');
	}
	var origin = [iview[0], iview[1], iview[2]];
	var n_real = [iview[3], iview[4], iview[5]];
	var n_grid = [iview[6], iview[7], iview[8]];
	var cell_mult = 1.0 / iview[17];
	this.unit_cell = new UnitCell(cell_mult * iview[9],
																cell_mult * iview[10],
																cell_mult * iview[11],
																cell_mult * iview[12],
																cell_mult * iview[13],
																cell_mult * iview[14]);
	var grid = new GridArray(n_grid);
	var prod = iview[15] / 100;
	var plus = iview[16];
	//var data_scale_factor = iview[15] / iview[18] + iview[16];
	// bricks have 512 (8x8x8) values
	var offset = 512;
	var n_blocks = [Math.ceil(n_real[0] / 8),
										Math.ceil(n_real[1] / 8),
										Math.ceil(n_real[2] / 8)];
	for (var zz = 0; zz < n_blocks[2]; zz++) {
		for (var yy = 0; yy < n_blocks[1]; yy++) {
			for (var xx = 0; xx < n_blocks[0]; xx++) { // loop over bricks
				for (var k = 0; k < 8; k++) {
					var z = 8 * zz + k;
					for (var j = 0; j < 8; j++) {
						var y = 8 * yy + j;
						for (var i = 0; i < 8; i++) { // loop inside brick
							var x = 8 * xx + i;
							if (x < n_real[0] && y < n_real[1] && z < n_real[2]) {
								var density = (u8data[offset] - plus) / prod;
								offset++;
								grid.set_grid_value(origin[0] + x,
																		origin[1] + y,
																		origin[2] + z, density);
							} else {
								offset += 8 - i;
								break;
							}
						}
					}
				}
			}
		}
	}
	this.stats = calculate_stddev(grid.values, 0);
	this.grid = grid;
	//this.show_debug_info();
};

var UnitCell = function UnitCell(a /*:number*/, b /*:number*/, c /*:number*/,
						alpha /*:number*/, beta /*:number*/, gamma /*:number*/) {
	if (a <= 0 || b <= 0 || c <= 0 || alpha <= 0 || beta <= 0 || gamma <= 0) {
		throw Error('Zero or negative unit cell parameter(s).');
	}
	this.parameters = [a, b, c, alpha, beta, gamma];
	var deg2rad = Math.PI / 180.0;
	var cos_alpha = Math.cos(deg2rad * alpha);
	var cos_beta = Math.cos(deg2rad * beta);
	var cos_gamma = Math.cos(deg2rad * gamma);
	var sin_alpha = Math.sin(deg2rad * alpha);
	var sin_beta = Math.sin(deg2rad * beta);
	var sin_gamma = Math.sin(deg2rad * gamma);
	if (sin_alpha === 0 || sin_beta === 0 || sin_gamma === 0) {
		throw Error('Impossible angle - N*180deg.');
	}
	var cos_alpha_star_sin_beta = (cos_beta * cos_gamma - cos_alpha) /
																	sin_gamma;
	var cos_alpha_star = cos_alpha_star_sin_beta / sin_beta;
	var s1rca2 = Math.sqrt(1.0 - cos_alpha_star * cos_alpha_star);
	// The orthogonalization matrix we use is described in ITfC B p.262:
	// "An alternative mode of orthogonalization, used by the Protein
	// Data Bank and most programs, is to align the a1 axis of the unit
	// cell with the Cartesian X_1 axis, and to align the a*_3 axis with the
	// Cartesian X_3 axis."
	//
	// Zeros in the matrices below are kept to make matrix multiplication
	// faster: they make Extract_block() 2x (!) faster on V8 4.5.103,
	// no difference on FF 50.
	/* eslint-disable no-multi-spaces, comma-spacing */
	this.orth = [a, b * cos_gamma,c * cos_beta,
							 0.0, b * sin_gamma, -c * cos_alpha_star_sin_beta,
							 0.0, 0.0        ,c * sin_beta * s1rca2];
	// based on xtal.js which is based on cctbx.uctbx
	this.frac = [
		1.0 / a,
		-cos_gamma / (sin_gamma * a),
		-(cos_gamma * cos_alpha_star_sin_beta + cos_beta * sin_gamma) /
				(sin_beta * s1rca2 * sin_gamma * a),
		0.0,
		1.0 / (sin_gamma * b),
		cos_alpha_star / (s1rca2 * sin_gamma * b),
		0.0,
		0.0,
		1.0 / (sin_beta * s1rca2 * c) ];
};

// This function is only used with matrices frac and orth, which have 3 zeros.
// We skip these elements, but it doesn't affect performance (on FF50 and V8).
function multiply(xyz, mat) {
	return [mat[0] * xyz[0]  + mat[1] * xyz[1]  + mat[2] * xyz[2],
		  /*mat[3] * xyz[0]*/+ mat[4] * xyz[1]  + mat[5] * xyz[2],
		  /*mat[6] * xyz[0]  + mat[7] * xyz[1]*/+ mat[8] * xyz[2]];
}

var Block = function Block() {
	this._points = null;
	this._values = null;
	this._size = [0, 0, 0];
};

Block.prototype.clear = function clear () {
	this._points = null;
	this._values = null;
};

// @flow

function modulo(a, b) {
	var reminder = a % b;
	return reminder >= 0 ? reminder : reminder + b;
}

var GridArray = function GridArray(dim) {
	this.dim = dim; // dimensions of the grid for the entire unit cell
	this.values = new Float32Array(dim[0] * dim[1] * dim[2]);
};

GridArray.prototype.grid2index = function grid2index (i, j, k) {
	i = modulo(i, this.dim[0]);
	j = modulo(j, this.dim[1]);
	k = modulo(k, this.dim[2]);
	return this.dim[2] * (this.dim[1] * i + j) + k;
};

GridArray.prototype.grid2frac = function grid2frac (i, j, k) {
	return [i / this.dim[0], j / this.dim[1], k / this.dim[2]];
};

// return grid coordinates (rounded down) for the given fractional coordinates
GridArray.prototype.frac2grid = function frac2grid (xyz)
{
	return [Math.floor(xyz[0] * this.dim[0]) | 0,
			Math.floor(xyz[1] * this.dim[1]) | 0,
			Math.floor(xyz[2] * this.dim[2]) | 0];
};

GridArray.prototype.set_grid_value = function set_grid_value (i, j, k, value) {
	var idx = this.grid2index(i, j, k);
	this.values[idx] = value;
};

GridArray.prototype.get_grid_value = function get_grid_value (i, j, k) {
	var idx = this.grid2index(i, j, k);
	return this.values[idx];
};

function calculate_stddev(a, offset) {
	var sum = 0;
	var sq_sum = 0;
	var alen = a.length;
	for (var i = offset; i < alen; i++) {
		sum += a[i];
		sq_sum += a[i] * a[i];
	}
	var mean = sum / (alen - offset);
	var variance = sq_sum / (alen - offset) - mean * mean;
	return {mean: mean, rms: Math.sqrt(variance)};
}

// symop -> matrix ([x,y,z] = matrix * [x,y,z,1])
function parse_symop(symop) {
	var ops = symop.toLowerCase().replace(/\s+/g, '').split(',');
	if (ops.length !== 3) { throw Error('Unexpected symop: ' + symop); }
	var mat = [];
	for (var i = 0; i < 3; i++) {
		var terms = ops[i].split(/(?=[+-])/);
		var row = [0, 0, 0, 0];
		for (var j = 0; j < terms.length; j++) {
			var term = terms[j];
			var sign = (term[0] === '-' ? -1 : 1);
			var m = terms[j].match(/^[+-]?([xyz])$/);
			if (m) {
				var pos = {x: 0, y: 1, z: 2}[m[1]];
				row[pos] = sign;
			} else {
				m = terms[j].match(/^[+-]?(\d)\/(\d)$/);
				if (!m) { throw Error('What is ' + terms[j] + ' in ' + symop); }
				row[3] = sign * Number(m[1]) / Number(m[2]);
			}
		}
		mat.push(row);
	}
	return mat;
}