/*
 * A little video, by the 14th. No need for hands.
 * Golden ratio
 * Have one extrude
 * Show the substitutions
 * They fit together ever so nicely
 * Fill up the sky with one, just by scaling
 * These things also have connections to the structure of viruses like hepatitis, to crystals, and there's a small possibility that they are connected to Islamic art, but that's a story for another time
 * 
 * If you're improving on this someday: the basis shouldn't be normalized, it should just be the length of the edgelen
 */

var goldenFaces = Array(4);
var powers_of_2 = Array(1,2,4,8,16,32,64);
var substitutionConstant = PHI*PHI*PHI;

var edge_length_of_golden_rhombus_with_short_diagonal_1 = Math.sqrt(10 + 2*Math.sqrt(5)) / 4;
//with edge length 1
var unitTriaCenterToFivefold = PHI / edge_length_of_golden_rhombus_with_short_diagonal_1 * Math.sin(TAU / 5);
var unitTriaCenterToThreefold = 1 / edge_length_of_golden_rhombus_with_short_diagonal_1 * HS3 * PHI;
var unitGico_height = unitTriaCenterToFivefold * 2 - 1;
var unitRhomHeight; //defined later
var unitLineZLength;

var golden_colors = Array(6);
golden_colors[0] = new THREE.Color(228 / 255, 99 / 255, 75 / 255);
golden_colors[1] = new THREE.Color(116 / 255,190 / 255, 74 / 255); //the minilenses might be nicer yellow
golden_colors[2] = new THREE.Color(  0 / 255,170 / 255,231 / 255);
golden_colors[3] = new THREE.Color(137 / 255, 55 / 255,131 / 255);

var icoVerticesNormalized = Array(12);
icoVerticesNormalized[0] = new THREE.Vector3(0, 	1, 	PHI);
icoVerticesNormalized[1] = new THREE.Vector3( PHI,	0, 	1);
icoVerticesNormalized[2] = new THREE.Vector3(0,	-1, PHI);
icoVerticesNormalized[3] = new THREE.Vector3(-PHI,	0, 	1);
icoVerticesNormalized[4] = new THREE.Vector3(-1, 	PHI,0);
icoVerticesNormalized[5] = new THREE.Vector3( 1, 	PHI,0);
icoVerticesNormalized[6] = new THREE.Vector3( PHI,	0,	-1);
icoVerticesNormalized[7] = new THREE.Vector3( 1,	-PHI,0);
icoVerticesNormalized[8] = new THREE.Vector3(-1,	-PHI,0);
icoVerticesNormalized[9] = new THREE.Vector3(-PHI,	0,	-1);
icoVerticesNormalized[10] = new THREE.Vector3(0, 	1,	-PHI);
icoVerticesNormalized[11] = new THREE.Vector3(0,	-1,	-PHI);

var dodVerticesNormalized = Array(20);
dodVerticesNormalized[0] = new THREE.Vector3( 1/PHI,0, PHI);
dodVerticesNormalized[1] = new THREE.Vector3( 1/PHI,0,-PHI);
dodVerticesNormalized[2] = new THREE.Vector3(-1/PHI,0, PHI);
dodVerticesNormalized[3] = new THREE.Vector3(-1/PHI,0,-PHI);

dodVerticesNormalized[4] = new THREE.Vector3( PHI, 1/PHI, 0);
dodVerticesNormalized[5] = new THREE.Vector3(-PHI, 1/PHI, 0);
dodVerticesNormalized[6] = new THREE.Vector3( PHI,-1/PHI, 0);
dodVerticesNormalized[7] = new THREE.Vector3(-PHI,-1/PHI, 0);

dodVerticesNormalized[ 8] = new THREE.Vector3( 0, PHI, 1/PHI);
dodVerticesNormalized[ 9] = new THREE.Vector3( 0,-PHI, 1/PHI);
dodVerticesNormalized[10] = new THREE.Vector3( 0, PHI,-1/PHI);
dodVerticesNormalized[11] = new THREE.Vector3( 0,-PHI,-1/PHI);

dodVerticesNormalized[12] = new THREE.Vector3( 1, 1, 1);
dodVerticesNormalized[13] = new THREE.Vector3( 1,-1, 1);
dodVerticesNormalized[14] = new THREE.Vector3( 1, 1,-1);
dodVerticesNormalized[15] = new THREE.Vector3( 1,-1,-1);

dodVerticesNormalized[16] = new THREE.Vector3(-1, 1, 1);
dodVerticesNormalized[17] = new THREE.Vector3(-1,-1, 1);
dodVerticesNormalized[18] = new THREE.Vector3(-1, 1,-1);
dodVerticesNormalized[19] = new THREE.Vector3(-1,-1,-1);
var nearby_IVs = Array(icoVerticesNormalized.length);
var dodNearbyIVs = Array(dodVerticesNormalized.length);


function shape(stemPosition, basis)
{
	this.stemPosition = stemPosition;
	this.basis = basis;
	this.ignore = false;
}

function init_golden_lattice()
{
	/*
	 * The next optimization would be to, 
	 *   for each shape that gets turned into a set of X and Z edges, 
	 *     make an array of the edge substitutions whose resultant shapes should be compared (the nearby ones)
	 *     
	 *  Hmm... dodes only exist inside shapes
	 */
	
	var preMakeTime = ourclock.getElapsedTime();
	var golden_lattice = generate_lattice(3, 2);
	console.log("Total time: ", ourclock.getElapsedTime() - preMakeTime );
	
	//fuck, 30MB download created from ONE substitution
//	var exporter = new THREE.OBJExporter();
//	var blob = new Blob([exporter.parse( golden_lattice )], {type: "text/plain;charset=utf-8"});
//	saveAs(blob, "goldenLattice.obj");
	
	var lattice_scale = 0.09;
	golden_lattice.scale.set( lattice_scale, lattice_scale, lattice_scale );
	Protein.add(golden_lattice);
}

function generate_lattice(startingShape, numSubstitutions)
{
	if(numSubstitutions > 2) console.error("seriously?")
	var levels = Array(numSubstitutions);
	levels[0] = {
			edgesToBeInserted:Array(Array(),Array()),//x and z. There used to be y
			shapes: Array(Array(),Array(),Array(),Array()),
			edgelen: 2.5 };
	
	if(startingShape === 0) //rhomb
	{
		levels[0].shapes[0].push( new shape( new THREE.Vector3(), Array(3)) );
		levels[0].shapes[0][0].basis[0] = icoVerticesNormalized[ 0 ];
		levels[0].shapes[0][0].basis[1] = icoVerticesNormalized[ 1 ];
		levels[0].shapes[0][0].basis[2] = icoVerticesNormalized[ 5 ];
	}
	if(startingShape === 1) //dode
	{
		levels[0].shapes[1].push( new shape( new THREE.Vector3(), Array(4)) );
		levels[0].shapes[1][0].basis[0] = icoVerticesNormalized[ nearby_IVs[ 0 ][0] ];
		levels[0].shapes[1][0].basis[1] = icoVerticesNormalized[ nearby_IVs[ 0 ][1] ];
		levels[0].shapes[1][0].basis[2] = icoVerticesNormalized[ nearby_IVs[ 0 ][2] ];
		levels[0].shapes[1][0].basis[3] = icoVerticesNormalized[ nearby_IVs[ 0 ][3] ];
	}
	if(startingShape === 2) //gico
	{
		levels[0].shapes[2].push( new shape( new THREE.Vector3(), Array(5)) );
		levels[0].shapes[2][0].basis[0] = icoVerticesNormalized[ nearby_IVs[ 0 ][0] ];
		levels[0].shapes[2][0].basis[1] = icoVerticesNormalized[ nearby_IVs[ 0 ][1] ];
		levels[0].shapes[2][0].basis[2] = icoVerticesNormalized[ nearby_IVs[ 0 ][2] ];
		levels[0].shapes[2][0].basis[3] = icoVerticesNormalized[ nearby_IVs[ 0 ][3] ];
		levels[0].shapes[2][0].basis[4] = icoVerticesNormalized[ nearby_IVs[ 0 ][4] ];
	}
	if(startingShape === 3)	//tria
		addTria(new THREE.Vector3(), levels[0].edgelen, levels[0].shapes[3]);
	if(startingShape === 4)	//star
	{
		for(var i = 0; i < icoVerticesNormalized.length; i++)
		{
			for(var j = 0; j < nearby_IVs[i].length; j++)
			{
				levels[0].shapes[0].push( new shape( new THREE.Vector3(), Array(3)) );
				levels[0].shapes[0][i*5+j].basis[0] = icoVerticesNormalized[ i ];
				levels[0].shapes[0][i*5+j].basis[1] = icoVerticesNormalized[ nearby_IVs[i][j] ];
				levels[0].shapes[0][i*5+j].basis[2] = icoVerticesNormalized[ nearby_IVs[i][(j+1)%5] ];
			}
		}
	}
	if(startingShape === 5)	//tria, half adorned with dodes. Can put a rhomb in between them
	{
		addTria(new THREE.Vector3(), levels[0].edgelen, levels[0].shapes[3]);
		for(var i = 0; i < dodVerticesNormalized.length; i++)
		{
			if( dodVerticesNormalized[i].x < 0)
				continue;
			
			var triaThreefoldStemPoint = dodVerticesNormalized[i].clone();
			triaThreefoldStemPoint.multiplyScalar( unitTriaCenterToThreefold * levels[0].edgelen );
			for( var j = 0; j < 3; j++)
			{
				var newShapeIndex = levels[0].shapes[1].length;
				levels[0].shapes[1].push( new shape( triaThreefoldStemPoint.clone(), Array(4)) );
				levels[0].shapes[1][newShapeIndex].basis[0] = icoVerticesNormalized[ dodNearbyIVs[ i ][(j%3)+6] ];
				levels[0].shapes[1][newShapeIndex].basis[1] = icoVerticesNormalized[ dodNearbyIVs[ i ][j] ];
				levels[0].shapes[1][newShapeIndex].basis[2] = icoVerticesNormalized[ dodNearbyIVs[ i ][(j+1)%3] ];
				levels[0].shapes[1][newShapeIndex].basis[3] = icoVerticesNormalized[ dodNearbyIVs[ i ][(j+1)%3+6] ];
			}
		}
	}
	//could have some rhombs and gicos, that's a nice one to see. Look for other examples of nice matchups
	
	
	for(var i = 0; i < numSubstitutions; i++)
	{
		levels[i+1] = {
			edgesToBeInserted:Array(Array(),Array(),Array()),
			shapes: Array(Array(),Array(),Array(),Array()), 
			edgelen: levels[i].edgelen / substitutionConstant };
		deduce_substitution_edges(levels[i].shapes, levels[i+1] );
		
//		removeDuplicateEdges(); //to become a separate function, because mesh building
		{
			for(var j = 0; j < levels[i+1].edgesToBeInserted.length; j++)
			{
				var numIgnores = 0;
				var edgesArray = levels[i+1].edgesToBeInserted[j];
				for(var u = 0, ul = edgesArray.length; u < ul; u++)
					if(!edgesArray[u].ignore)
					{
						for(var v = u+1, vl = edgesArray.length; v < vl; v++)
							if(!edgesArray[v].ignore)
							{
								if( edgesArray[u].start.distanceToSquared(edgesArray[v].start) < 0.0001 &&
									edgesArray[u].end.distanceToSquared(edgesArray[v].end) < 0.0001 ) //also try to see if you get anything at all with the end!
								{
									edgesArray[v].ignore = true;
									numIgnores++;
								}
							}
					}
			}
		}
		
		for(var j = 0, jl = levels[i+1].edgesToBeInserted[0].length; j < jl; j++ )
			if(!levels[i+1].edgesToBeInserted[0][j].ignore)
				insert_lineX( levels[i+1].edgesToBeInserted[0][j].start, levels[i+1].edgesToBeInserted[0][j].end, levels[i+1].shapes, levels[i+1].edgelen );
		for(var j = 0, jl = levels[i+1].edgesToBeInserted[1].length; j < jl; j++ )
			if(!levels[i+1].edgesToBeInserted[1][j].ignore)
				insert_lineZ( levels[i+1].edgesToBeInserted[1][j].start, levels[i+1].edgesToBeInserted[1][j].end, levels[i+1].shapes, levels[i+1].edgelen );
		
		if( i > 0 )
			removeDuplicateShapes(levels[i+1], true);
		else
			removeDuplicateShapes(levels[i+1], false);
	}
	
	var golden_lattice = new THREE.Object3D();
	
	var preMeshTime = ourclock.getElapsedTime();
	add_meshes(levels[ numSubstitutions ], golden_lattice);
	console.log("Making meshes took: ", ourclock.getElapsedTime() - preMeshTime );
	
	return golden_lattice;
}

function removeDuplicateShapes(level, reduce)
{
	var num_removed = 0;
	var centerConstant = level.edgelen / 2;
	var radius = 3.7;
	var radiusSq = radius*radius;
	var cavityRadius = radius - 0.5;
	var cavityRadiusSq = cavityRadius * cavityRadius;
	for(var i = 0; i < level.shapes.length; i++)
	{
		var shapePositions = Array(level.shapes[i].length);
		for(var j = 0, jl = level.shapes[i].length; j < jl; j++)
		{
			shapePositions[j] = new THREE.Vector3();
			for(var k = 0, kl = level.shapes[i][j].basis.length; k < kl; k++)
				shapePositions[j].add(level.shapes[i][j].basis[k]);
			shapePositions[j].multiplyScalar(centerConstant);
			shapePositions[j].add( level.shapes[i][j].stemPosition );
		}
		//can hollow out or make smooth sphere here
		for(var j = 0, jl = level.shapes[i].length; j < jl; j++)
		{
			if( level.shapes[i][j].ignore )
				continue; //we've already eliminated all shapes with this position.
			var lengthSq = shapePositions[j].lengthSq();
			if( reduce && ( lengthSq < cavityRadiusSq || radiusSq < lengthSq ) )
				level.shapes[i][j].ignore = true;
			else for(var k = j+1, kl = level.shapes[i].length; k < kl; k++)
			{
				if( shapePositions[j].distanceToSquared(shapePositions[k]) < 0.00000001 )
				{
					level.shapes[i][k].ignore = true;
					num_removed++;
				}
			}
		}
	}
	console.log("removed ", num_removed, " shapes out of ", level.shapes[0].length+level.shapes[1].length+level.shapes[2].length+level.shapes[3].length, " and it took ", ourclock.getDelta());
}

function add_meshes(level, golden_lattice)
{
	for(var i = 0; i < 4; i++)
	{
		var shapeGeometry = make_mesh_of_shapeArray(level.shapes[i], level.edgelen );
		var shapesVolume = new THREE.Mesh( shapeGeometry, new THREE.MeshPhongMaterial( { color: golden_colors[i], shading: THREE.FlatShading } ) );

		golden_lattice.add( shapesVolume );
	}
	
	var cylinder_sides = 5;
	var cylinder_radius = 0.07 * level.edgelen;
	
	if(golden_lattice.children.length > 4) console.error("yo we might be about to make the outline wrongly")
	
	var numElements = 0; //both vertices and faces
	for(var i = 0; i < 4; i++ )
		numElements += golden_lattice.children[i].geometry.faces.length * 2 * cylinder_sides * 2;
	
	var outlineGeometry = new THREE.BufferGeometry();
	outlineGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( numElements * 3 ), 3 ) );
	outlineGeometry.setIndex( new THREE.BufferAttribute( new Uint32Array( numElements * 3 ), 1 ) );
	
	var cylinders_inserted = 0;
	var radiusComponent = new THREE.Vector3();
	var A_to_B = new THREE.Vector3();
	for(var i = 0; i < 4; i++)
	{
		var volumeGeometry = golden_lattice.children[i].geometry;
		for(var j = 0, jl = volumeGeometry.faces.length * 2; j < jl; j++)
		{
			var face_index = (j-j%2)/2;
			var topVertexIndex = volumeGeometry.faces[face_index].a;
			var connectedVertexIndex = j%2 ? volumeGeometry.faces[face_index].b : volumeGeometry.faces[face_index].c;
			
			var firstVertexIndex = cylinders_inserted * cylinder_sides * 2;
			for(var k = 0; k < cylinder_sides; k++)
			{
				outlineGeometry.index.setXYZ( (firstVertexIndex + k * 2 + 0)*3,
					firstVertexIndex + k*2+1,
					firstVertexIndex + k*2+0,
					firstVertexIndex + (k*2+2) % (cylinder_sides*2) );
				
				outlineGeometry.index.setXYZ( (firstVertexIndex + k * 2 + 1)*3,
					firstVertexIndex + k*2+1,
					firstVertexIndex + (k*2+2) % (cylinder_sides*2),
					firstVertexIndex + (k*2+3) % (cylinder_sides*2) );
			}
			
			A_to_B.set(
					volumeGeometry.vertices[ connectedVertexIndex ].x - volumeGeometry.vertices[ topVertexIndex ].x, 
					volumeGeometry.vertices[ connectedVertexIndex ].y - volumeGeometry.vertices[ topVertexIndex ].y, 
					volumeGeometry.vertices[ connectedVertexIndex ].z - volumeGeometry.vertices[ topVertexIndex ].z );
			A_to_B.normalize();
			radiusComponent.crossVectors(A_to_B, yAxis);
			radiusComponent.setLength(cylinder_radius); 
			for( var k = 0; k < cylinder_sides; k++)
			{
				radiusComponent.applyAxisAngle(A_to_B, TAU / cylinder_sides);
				
				outlineGeometry.attributes.position.setXYZ(firstVertexIndex + k*2+0,
						radiusComponent.x + volumeGeometry.vertices[ topVertexIndex ].x,
						radiusComponent.y + volumeGeometry.vertices[ topVertexIndex ].y,
						radiusComponent.z + volumeGeometry.vertices[ topVertexIndex ].z );
				
				outlineGeometry.attributes.position.setXYZ(firstVertexIndex + k*2+1,
						radiusComponent.x + volumeGeometry.vertices[ connectedVertexIndex ].x,
						radiusComponent.y + volumeGeometry.vertices[ connectedVertexIndex ].y,
						radiusComponent.z + volumeGeometry.vertices[ connectedVertexIndex ].z );
			}

			cylinders_inserted++;
		}
	}
	var shapesOutline = new THREE.Mesh( outlineGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }) );
	golden_lattice.add( shapesOutline );
}

function make_mesh_of_shapeArray(shapes, edgelen)
{
	var volumeGeometry = new THREE.Geometry();
	if(shapes.length === 0) return volumeGeometry;
	var dimensionality = shapes[0].basis.length;
	
	var num_vertices_per_shape = powers_of_2[dimensionality];
	var num_faces_per_shape = goldenFaces[ dimensionality - 3 ].length;
	var num_vertices = 0;
	var num_faces = 0;
	var num_ignored = 0;
	for(var i = 0, il = shapes.length; i < il; i++)
	{
		if(shapes[i].ignore)
		{
			num_ignored++;
			continue;
		}
		num_vertices += num_vertices_per_shape;
		num_faces += num_faces_per_shape;
	}
	
	//we tried speeding this up with typed arrays, made things worse. The initialization of faces and vertices, determined by testing, doesn't take long
	volumeGeometry.vertices = Array(num_vertices);
	volumeGeometry.faces = Array(num_faces);
	
	var num_shapes = 0;
	for(var i = 0, il = shapes.length; i < il; i++)
	{
		if(shapes[i].ignore) 
			continue;
		for(var j = 0; j < num_vertices_per_shape; j++)
			volumeGeometry.vertices[ num_shapes * num_vertices_per_shape + j ] = new THREE.Vector3();
		extrude( volumeGeometry, shapes[i].basis, edgelen, dimensionality, num_shapes * num_vertices_per_shape, num_vertices_per_shape );
		for(var j = 0; j < num_vertices_per_shape; j++)
			volumeGeometry.vertices[ num_shapes * num_vertices_per_shape + j ].add( shapes[i].stemPosition );
		for(var j = 0, jl = num_faces_per_shape; j < jl; j++ )
		{
			volumeGeometry.faces[ num_shapes * num_faces_per_shape + j ] = goldenFaces[ dimensionality - 3 ][j].clone();
			volumeGeometry.faces[ num_shapes * num_faces_per_shape + j ].a += num_shapes * num_vertices_per_shape;
			volumeGeometry.faces[ num_shapes * num_faces_per_shape + j ].b += num_shapes * num_vertices_per_shape;
			volumeGeometry.faces[ num_shapes * num_faces_per_shape + j ].c += num_shapes * num_vertices_per_shape;
		}
		
		num_shapes++;
	}
	volumeGeometry.computeVertexNormals();
	volumeGeometry.computeFaceNormals();

	return volumeGeometry;
}

function deduce_substitution_edges(oldShapes, newLevel)
{
	for( var i = 0, il = oldShapes[0].length; i < il; i++ )
		rhomToEdgeInsertions( oldShapes[0][i], newLevel );
	for( var i = 0, il = oldShapes[1].length; i < il; i++ )
		dodeToEdgeInsertions( oldShapes[1][i], newLevel );
	for( var i = 0, il = oldShapes[2].length; i < il; i++ )
		gicoToEdgeInsertions( oldShapes[2][i], newLevel );
	for( var i = 0, il = oldShapes[3].length; i < il; i++ )
		triaToEdgeInsertions( oldShapes[3][i], newLevel );
}

function rhomToEdgeInsertions( ourRhom, newLevel )
{
	var rhomEdgelen = newLevel.edgelen * substitutionConstant;
	
	var zEnd = ourRhom.stemPosition.clone();
	var zStart = new THREE.Vector3();
	for(var i = 0; i < ourRhom.basis.length; i++)
		zStart.add(ourRhom.basis[i]);
	var distance_down = unitRhomHeight * rhomEdgelen - newLevel.edgelen * ( unitRhomHeight + unitTriaCenterToThreefold );
	zStart.setLength( distance_down );
	zStart.add(ourRhom.stemPosition);
	newLevel.edgesToBeInserted[1].push( {start:zStart, end: zEnd, ignore:false} );
	
	for(var i = 0; i < 3; i++)
	{
		var purpleCorner = ourRhom.basis[i].clone();
		purpleCorner.multiplyScalar( rhomEdgelen );
		purpleCorner.add( ourRhom.stemPosition );
		
		var redCorner1 = ourRhom.basis[(i+1)%3].clone();
		var redCorner2 = ourRhom.basis[(i+2)%3].clone();
		redCorner1.multiplyScalar( rhomEdgelen );
		redCorner2.multiplyScalar( rhomEdgelen );
		redCorner1.add(purpleCorner);
		redCorner2.add(purpleCorner);
		newLevel.edgesToBeInserted[0].push( {start:redCorner1, end: purpleCorner, ignore:false} );
		newLevel.edgesToBeInserted[0].push( {start:redCorner2, end: purpleCorner, ignore:false} );
		
		var farCorner = ourRhom.basis[(i+2)%3].clone();
		farCorner.multiplyScalar( rhomEdgelen );
		farCorner.add(redCorner1);
		newLevel.edgesToBeInserted[0].push( {start:redCorner1, end: farCorner, ignore:false} );
	}
}

//we stem from black points for the rhom, dod, and ico. Tria stems from a white. This is important for substitution matching rules
function triaToEdgeInsertions( ourTria, newLevel )
{
	var triaEdgelen = newLevel.edgelen * substitutionConstant;
	var center = ourTria.basis[5].clone();
	center.setLength( triaEdgelen * unitTriaCenterToFivefold );
	center.add( ourTria.stemPosition );
	for(var i = 0; i < dodVerticesNormalized.length; i++)
		newLevel.edgesToBeInserted[1].push( {start:center, end: (dodVerticesNormalized[i].clone()).add(center), ignore:false} );
	for(var i = 0, il = icoVerticesNormalized.length; i < il; i++)
	{
		var end = (icoVerticesNormalized[i].clone()).multiplyScalar(unitTriaCenterToFivefold * triaEdgelen);
		var start = icoVerticesNormalized[i].clone();
		start.multiplyScalar(newLevel.edgelen * (1+unitTriaCenterToFivefold));
		
		start.add(center);
		end.add(center);
		
		newLevel.edgesToBeInserted[0].push( {start:start, end: end, ignore:false} );
	}
	for(var i = 0, il = dodVerticesNormalized.length; i < il; i++)
	{
		var start = dodVerticesNormalized[i].clone();
		start.multiplyScalar( triaEdgelen * unitTriaCenterToThreefold );
		start.add(center);
		for(var j = 0; j < 3; j++)
		{
			var end = icoVerticesNormalized[ dodNearbyIVs[i][j] ].clone();
			end.multiplyScalar( unitTriaCenterToFivefold * triaEdgelen );
			end.add(center);
			newLevel.edgesToBeInserted[0].push( {start:start, end: end, ignore:false} );
		}
	}
	//speedup opportunity: look for duplicates right now, since this is the only opportunity for duplication of the dods we've just added
	//You could also look for duplicates among the edges that you're going to "insert", and that would completely stop their duplication
	//array of X insertions, Y insertions, again with explicit vertices...
	//Hmm, but you'd still have to compare the positions of, eg, rhoms inside this tria.
}

//Dod vectors come out of the "front" bottom point. The two edges coming out of that point have purple arrows
function dodeToEdgeInsertions( ourDode, newLevel )
{
	var dodeEdgelen = newLevel.edgelen * substitutionConstant;
	
	var unitTriaCenterToFace = Math.sqrt(1+2/Math.sqrt(5));
	var zCenterUpcomponent = (ourDode.basis[1].clone()).add( ourDode.basis[2] );
	zCenterUpcomponent.setLength(unitTriaCenterToFace * newLevel.edgelen);
	var zCenter = (ourDode.basis[0].clone() ).add( ourDode.basis[3] );
	zCenter.multiplyScalar( 0.5 * dodeEdgelen );
	zCenter.add(zCenterUpcomponent);
	zCenter.add(ourDode.stemPosition);
	
	var dodeCorners = Array(4); //the first three each point to the tip of one of the three rhoms on its "front". Last is opposite corner to origin
	for( var i = 0; i < 4; i++ )
	{
		dodeCorners[i] = ourDode.basis[i].clone();
		dodeCorners[i].add( ourDode.basis[(i+1)%4] );
		if(i === 3)
		{
			dodeCorners[i].add( ourDode.basis[(i+2)%4] );
			dodeCorners[i].add( ourDode.basis[(i+3)%4] );
		}
		dodeCorners[i].multiplyScalar(dodeEdgelen);
		dodeCorners[i].add(ourDode.stemPosition);
		
		newLevel.edgesToBeInserted[1].push( {start:zCenter, end: dodeCorners[i], ignore:false} );
	}
	
	for(var i = 0; i < 2; i++)
	{
		var ourFivefold = (ourDode.basis[1].clone()).add(ourDode.basis[2]);
		ourFivefold.add(ourDode.basis[i*3]);
		ourFivefold.multiplyScalar(dodeEdgelen);
		ourFivefold.add(ourDode.stemPosition);
		
		var interiorXorigin = ourFivefold.clone();
		interiorXorigin.sub(zCenter);
		interiorXorigin.setLength( newLevel.edgelen * ( 1 + unitTriaCenterToFivefold ) );
		interiorXorigin.add(zCenter);
		newLevel.edgesToBeInserted[0].push( {start:interiorXorigin, end: ourFivefold, ignore:false} );
		
		newLevel.edgesToBeInserted[0].push( {start:dodeCorners[1], end: ourFivefold, ignore:false} );
		newLevel.edgesToBeInserted[0].push( {start:dodeCorners[3], end: ourFivefold, ignore:false} );
		newLevel.edgesToBeInserted[0].push( {start:dodeCorners[i*2], end: ourFivefold, ignore:false} );
	}
	
	for(var i = 0; i < 2; i++)
	{
		var Xorigin = new THREE.Vector3();
		if(i)
		{
			Xorigin.add( ourDode.basis[0] );
			Xorigin.add( ourDode.basis[3] );
			Xorigin.multiplyScalar(dodeEdgelen);
		}
		Xorigin.add( ourDode.stemPosition );
		for(var j = 0; j < 4; j++)
		{
			var Xdestination = ourDode.basis[j].clone();
			if( i && !(j % 3) ) Xdestination.negate();
			Xdestination.multiplyScalar(newLevel.edgelen);
			Xdestination.add(Xorigin);
			newLevel.edgesToBeInserted[0].push( {start:Xorigin, end: Xdestination, ignore:false} );
		}
	}
}

function gicoToEdgeInsertions( ourGico, newLevel )
{
	var gicoEdgelen = newLevel.edgelen * substitutionConstant;
	
	var zCenter = new THREE.Vector3();
	for(var i = 0; i < ourGico.basis.length; i++)
		zCenter.add( ourGico.basis[i] );
	zCenter.setLength(newLevel.edgelen * (1+unitTriaCenterToFivefold) );
	var zCenterToFivefold = newLevel.edgelen * (1+unitTriaCenterToFivefold) + gicoEdgelen;
	var facingDirection = zCenter.clone();
	facingDirection.normalize();
	zCenter.add(ourGico.stemPosition);
	
	var topFivefold = new THREE.Vector3();
	
	for(var i = 0; i < 6; i++)
	{
		var start = i === 5 ? facingDirection.clone() : ourGico.basis[i].clone();
		start.multiplyScalar(newLevel.edgelen * (1+unitTriaCenterToFivefold));
		var end = start.clone();
		end.setLength( zCenterToFivefold );
		
		start.add(zCenter);
		end.add(zCenter);
		
		newLevel.edgesToBeInserted[0].push( {start:start, end: end, ignore:false} );
		
		if( i === 5 ) topFivefold.copy(end);
	}
	
	for(var i = 0; i < 5; i++)
	{
		//adjacent pairs around the circle added to the central one
		//adjacent pairs around the circle and minus the one on the opposite pole of the circle
		var prolateFaceCenter = new THREE.Vector3();
		prolateFaceCenter.add( ourGico.basis[   i   ] );
		prolateFaceCenter.add( ourGico.basis[(i+1)%5] );
		
		var innerThreefold = prolateFaceCenter.clone();
		innerThreefold.add(facingDirection);
		innerThreefold.setLength( newLevel.edgelen * unitLineZLength );
		innerThreefold.add(zCenter);
		newLevel.edgesToBeInserted[1].push( {start:zCenter, end: innerThreefold, ignore:false} );
		
		var outerThreefold = prolateFaceCenter.clone();
		outerThreefold.sub( ourGico.basis[ (i+3)%5 ] );
		outerThreefold.setLength( newLevel.edgelen * unitLineZLength );
		outerThreefold.add(zCenter);
		newLevel.edgesToBeInserted[1].push( {start:zCenter, end: outerThreefold, ignore:false} );
		
		var nearbyFiveFold1 = ourGico.basis[   i   ].clone();
		nearbyFiveFold1.multiplyScalar( zCenterToFivefold );
		nearbyFiveFold1.add(zCenter);
		var nearbyFiveFold2 = ourGico.basis[(i+1)%5].clone();
		nearbyFiveFold2.multiplyScalar( zCenterToFivefold );
		nearbyFiveFold2.add(zCenter);
		newLevel.edgesToBeInserted[0].push( {start:innerThreefold, end: topFivefold, ignore:false} );
		newLevel.edgesToBeInserted[0].push( {start:innerThreefold, end: nearbyFiveFold1, ignore:false} );
		newLevel.edgesToBeInserted[0].push( {start:innerThreefold, end: nearbyFiveFold2, ignore:false} );
		newLevel.edgesToBeInserted[0].push( {start:outerThreefold, end: nearbyFiveFold1, ignore:false} );
		newLevel.edgesToBeInserted[0].push( {start:outerThreefold, end: nearbyFiveFold2, ignore:false} );
		
		
		//another way to check if you've violated matching rules is to make a list of edges and see if any of the ones overlapping are going in the wrong direction
	}
	
	for(var i = 0; i < 5; i++)
	{
		var start = ourGico.stemPosition.clone();
		var end = ourGico.basis[i].clone();
		end.add(start);
		
		newLevel.edgesToBeInserted[0].push( {start:start, end: end, ignore:false} );
	}
}

function insert_lineZ( start, end, shapeArrays, edgelen)
{
	var rhoms = shapeArrays[0];
	var dodes = shapeArrays[1];
	var gicos = shapeArrays[2];
	var trias = shapeArrays[3];
	
	var lineDirection = (end.clone()).sub(start);
	var dodVectorIndex;
	var closestAngle = 10000;
	for(var i = 0, il = dodVerticesNormalized.length; i < il; i++)
	{
		var thisAngle = dodVerticesNormalized[i].angleTo( lineDirection );
		if( thisAngle < closestAngle)
		{
			closestAngle = thisAngle;
			dodVectorIndex = i;
		}
	}
	if(closestAngle > 0.01)
		console.error("not near dod vertex?", closestAngle);
	
	addTria(start, edgelen, trias);
	
	var triaThreefoldStemPoint = dodVerticesNormalized[dodVectorIndex].clone();
	triaThreefoldStemPoint.multiplyScalar(unitTriaCenterToThreefold * edgelen);
	
	for(var i = 0; i < 3; i++)
	{
		var newShapeIndex = dodes.length;
		dodes.push( new shape( (triaThreefoldStemPoint.clone()).add(start), Array(4)) );//6017
		dodes[newShapeIndex].basis[0] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][(i%3)+6] ];
		dodes[newShapeIndex].basis[1] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][i] ];
		dodes[newShapeIndex].basis[2] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][(i+1)%3] ];
		dodes[newShapeIndex].basis[3] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][(i+1)%3+6] ];
		
		//the purpose of the below is the dode. that j=1 continue can be removed because it just seems to create duplicates
		var outward = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][(i+0)%3+3] ]; //might not be 0 in there
		for(var j = 0; j < 3; j++)
		{
			if(j===1)continue;
			var newRhomIndex = rhoms.length;
			rhoms.push( new shape( new THREE.Vector3(), Array(3)) );
			rhoms[newRhomIndex].basis[0] = dodes[newShapeIndex].basis[j];
			rhoms[newRhomIndex].basis[1] = dodes[newShapeIndex].basis[j+1];
			rhoms[newRhomIndex].basis[2] = outward;
			rhoms[newRhomIndex].stemPosition.add( dodes[newShapeIndex].basis[(j+2)%4] );
			rhoms[newRhomIndex].stemPosition.add( dodes[newShapeIndex].basis[(j+3)%4] );
			rhoms[newRhomIndex].stemPosition.multiplyScalar(edgelen);
			rhoms[newRhomIndex].stemPosition.add( dodes[newShapeIndex].stemPosition );
		}
	}
	
	var centralRhomIndex = rhoms.length;
	rhoms.push( new shape((triaThreefoldStemPoint.clone()).add(start), Array(3)) );
	var topOfCentralRhom = new THREE.Vector3();
	for(var i = 0; i < 3; i++ )
	{
		rhoms[centralRhomIndex].basis[i] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][2-i] ];
		topOfCentralRhom.add( rhoms[centralRhomIndex].basis[i] );
	}
	topOfCentralRhom.multiplyScalar(edgelen);
	topOfCentralRhom.add( rhoms[centralRhomIndex].stemPosition );
	for(var i = 0; i < 3; i++ )
	{	
		var newShapeIndex = rhoms.length;
		rhoms.push( new shape( new THREE.Vector3(), Array(3)) );
		rhoms[newShapeIndex].basis[0] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][  i+3  ] ];
		rhoms[newShapeIndex].basis[1] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][   i   ] ];
		rhoms[newShapeIndex].basis[2] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][(i+1)%3] ];
		
		for(var j = 0; j < 3; j++)
			rhoms[newShapeIndex].stemPosition.sub(rhoms[newShapeIndex].basis[j].clone());
		rhoms[newShapeIndex].stemPosition.multiplyScalar(edgelen);
		rhoms[newShapeIndex].stemPosition.add(topOfCentralRhom);
	}
	var lastRhomIndex = rhoms.length;
	rhoms.push( new shape( new THREE.Vector3(), Array(3)) );
	for(var i = 0; i < 3; i++ )
	{
		rhoms[lastRhomIndex].basis[i] = rhoms[centralRhomIndex].basis[2-i].clone();
		rhoms[lastRhomIndex].stemPosition.add(rhoms[lastRhomIndex].basis[i]);
		rhoms[lastRhomIndex].basis[i].negate();
	}
	rhoms[lastRhomIndex].stemPosition.multiplyScalar(edgelen);
	rhoms[lastRhomIndex].stemPosition.add(topOfCentralRhom);
	
	for(var i = 0; i < 3; i++)
	{
		var triaPosition = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][i+3] ].clone();
		triaPosition.multiplyScalar(edgelen * unitTriaCenterToFivefold);
		triaPosition.add( topOfCentralRhom );
		addTria(triaPosition, edgelen, trias );
	}
}

function insert_lineX(start, end, shapeArrays, edgelen )
{
	var rhoms = shapeArrays[0];
	var dodes = shapeArrays[1];
	var gicos = shapeArrays[2];
	var trias = shapeArrays[3];
	
	var lineDirection = (end.clone()).sub(start);
	var preciseEnd = (end.clone()).sub(start);
	preciseEnd.setLength(substitutionConstant * edgelen);
	preciseEnd.add(start);
	var icoVectorIndex;
	var oppositeVectorIndex;
	var closestAngle = 10000;
	var furthestAngle = 0;
	for(var i = 0, il = icoVerticesNormalized.length; i < il; i++)
	{
		var thisAngle = icoVerticesNormalized[i].angleTo( lineDirection );
		if( thisAngle < closestAngle)
		{
			closestAngle = thisAngle;
			icoVectorIndex = i;
		}
		if( thisAngle > furthestAngle)
		{
			furthestAngle = thisAngle;
			oppositeVectorIndex = i;
		}
	}
	if(closestAngle > 0.01)
		console.error("not near ico vertex?", closestAngle);
	
	for(var i = 0; i < 10; i++)
	{
		var newShapeIndex = rhoms.length;
		rhoms.push( new shape(start.clone(), Array(3)) ); //speedup opportunity: constructor? Might get optimized
		rhoms[newShapeIndex].basis[0] = icoVerticesNormalized[ icoVectorIndex ];
		rhoms[newShapeIndex].basis[1] = icoVerticesNormalized[ nearby_IVs[icoVectorIndex][i%5] ];
		rhoms[newShapeIndex].basis[2] = icoVerticesNormalized[ nearby_IVs[icoVectorIndex][(i+1)%5] ];
		if( i >= 5 ) //because matching rules
		{
			rhoms[newShapeIndex].stemPosition.set(0,0,0);
			for( var j = 0; j < 3; j++)
				rhoms[newShapeIndex].stemPosition.sub(rhoms[newShapeIndex].basis[j]);
			rhoms[newShapeIndex].stemPosition.multiplyScalar(edgelen);
			rhoms[newShapeIndex].stemPosition.add(preciseEnd);
		}
	}
	
	var gicoIndex = gicos.length;
	var gicoPosition = (icoVerticesNormalized[ icoVectorIndex ].clone()).multiplyScalar(edgelen*(1+unitGico_height));
	gicoPosition.add(start);
	gicos.push( new shape(gicoPosition, Array(5)) );
	for(var j = 0; j < gicos[gicoIndex].basis.length; j++)
		gicos[gicoIndex].basis[j] = icoVerticesNormalized[ nearby_IVs[ oppositeVectorIndex ][j] ];
	
	//it may be worth marking the side of the ico in some way so you can tell orientation
}

function insert_lineY( start, end, shapeArrays, edgelen )
{
	var rhoms = shapeArrays[0];
	var dodes = shapeArrays[1];
	var gicos = shapeArrays[2];
	var trias = shapeArrays[3];
	
	var lineDirection = (end.clone()).sub(start);
	var icoVectorIndex;
	var closestAngle = 10000;
	for(var i = 0, il = icoVerticesNormalized.length; i < il; i++)
	{
		var thisAngle = icoVerticesNormalized[i].angleTo( lineDirection );
		if( thisAngle < closestAngle)
		{
			closestAngle = thisAngle;
			icoVectorIndex = i;
		}
	}
	if(closestAngle > 0.01)
		console.error("not near ico vertex?", closestAngle);
	
	for(var i = 0; i < 5; i++)
	{
		var newShapeIndex = rhoms.length;
		rhoms.push( new shape(start.clone(), Array(3) ) );
		rhoms[newShapeIndex].basis[0] = icoVerticesNormalized[ icoVectorIndex ];
		rhoms[newShapeIndex].basis[1] = icoVerticesNormalized[ nearby_IVs[icoVectorIndex][i%5] ];
		rhoms[newShapeIndex].basis[2] = icoVerticesNormalized[ nearby_IVs[icoVectorIndex][(i+1)%5] ];
	}
	
	var triaPosition = ( icoVerticesNormalized[ icoVectorIndex ].clone() ).multiplyScalar(edgelen * (1 + unitTriaCenterToFivefold) );
	triaPosition.add(start);
	addTria(triaPosition, edgelen, trias);
}

function addTria(centerPosition, edgelen, trias)
{
	var SP = icoVerticesNormalized[ 0 ].clone(); //0 and 11 are opposite (right?)
	SP.multiplyScalar(unitTriaCenterToFivefold * edgelen);
	SP.add(centerPosition);
	
	var newIndex = trias.length;
	trias.push( new shape( SP, Array(6) ) );
	for(var j = 0; j < 5; j++)
		trias[newIndex].basis[j] = icoVerticesNormalized[ nearby_IVs[ 11 ][j] ];
	trias[newIndex].basis[5] = icoVerticesNormalized[ 11 ]; //speedup opportunity: they're all the same, no need for array
}

function init_poly_arrays()
{	
	for( var i = 0; i < 12; i++ )
		icoVerticesNormalized[i].normalize();
	for( var i = 0; i < dodVerticesNormalized.length; i++ )
		dodVerticesNormalized[i].normalize();
	
	var rhomheightgetter = icoVerticesNormalized[0].clone();
	rhomheightgetter.add(icoVerticesNormalized[1]);
	rhomheightgetter.add(icoVerticesNormalized[5]);
	unitRhomHeight = rhomheightgetter.length();
	unitLineZLength = 2 * unitRhomHeight + unitTriaCenterToThreefold;
	
	var triaGeometry = new THREE.Geometry();
	
	for(var i = 0; i < 64; i++)
		triaGeometry.vertices.push( new THREE.Vector3() );
	
	var axis_vectors = Array(6);
	for(var i = 0; i < 6; i++)
	{
		axis_vectors[i] = new THREE.Vector3(0,1,0);
		axis6D.children[i*2].updateMatrixWorld();
		axis6D.children[i*2].localToWorld(axis_vectors[i]);
	}
	
	var edgelen = 1;
	var rhombus_width = edgelen / (Math.sqrt(1+PHI*PHI)/2);
	
	//create and center
	extrude(triaGeometry, axis_vectors,edgelen);
	var triaCenter = new THREE.Vector3();
	for(var i = 0; i < triaGeometry.vertices.length; i++)
		triaCenter.add(triaGeometry.vertices[i]);
	triaCenter.multiplyScalar(1/triaGeometry.vertices.length);
	for(var i = 0; i < triaGeometry.vertices.length; i++)
		triaGeometry.vertices[i].sub(triaCenter);
	
	var fivefold_indices = Array();
	var threefold_indices = Array();
	var fivefold_radius = 1.6;
	for( var i = 0; i < 64; i++ )
	{
		if( triaGeometry.vertices[i].length() > fivefold_radius )
			fivefold_indices.push(i);
		else if( triaGeometry.vertices[i].length() > fivefold_radius - 0.5 )
			threefold_indices.push(i);
	}
	
	edge_labels = Array(4);
	for(var i = 0; i < edge_labels.length; i++)
	{
		edge_labels[i] = {};
		edge_labels[i].Xlabels = Array(); //list of them in the order going from [whatever] point to white point. Does that work for z?
		edge_labels[i].Ylabels = Array();
		edge_labels[i].Zlabels = Array();
	}
	
	for(var i = 0; i < fivefold_indices.length; i++)
	{
		var nearby_threefolds = Array();
		for(var j = 0; j < threefold_indices.length; j++)
		{
			if( Math.abs( triaGeometry.vertices[fivefold_indices[i]].distanceTo( triaGeometry.vertices[ threefold_indices[j] ] ) - edgelen ) < 0.0001 )
			{
				edge_labels[3].Xlabels.push(fivefold_indices[i]);
				edge_labels[3].Xlabels.push(threefold_indices[j]);
				nearby_threefolds.push(threefold_indices[j]);
			}
		}
		var num_tris_added = 0;
		for(var k = 0; k < nearby_threefolds.length; k++)
		for(var l = k+1; l < nearby_threefolds.length; l++)
		{
			if( Math.abs( triaGeometry.vertices[nearby_threefolds[k]].distanceTo(triaGeometry.vertices[nearby_threefolds[l] ] ) - rhombus_width ) < 0.0001 )
			{
				var trianglesideK = (triaGeometry.vertices[nearby_threefolds[k]].clone()).sub( triaGeometry.vertices[ fivefold_indices[ i ] ] );
				var trianglesideL = (triaGeometry.vertices[nearby_threefolds[l]].clone()).sub( triaGeometry.vertices[ fivefold_indices[ i ] ] );
				if( clockwise_on_polyhedronsurface(trianglesideK,trianglesideL,triaGeometry.vertices[ fivefold_indices[ i ] ]) )
					triaGeometry.faces.push( new THREE.Face3(fivefold_indices[i],nearby_threefolds[l],nearby_threefolds[k] ) );
				else
					triaGeometry.faces.push( new THREE.Face3(fivefold_indices[i],nearby_threefolds[k],nearby_threefolds[l] ) );
				
				num_tris_added++;
			}
		}
	}
	
	for(var j = 0; j < 4; j++ ) //face arrays
	{
		var reducedTriaGeometry = triaGeometry.clone(); //we start out with the same number of vertices
		var axis_vectors2 = Array(j+3);
		for(var i = 0; i < axis_vectors2.length; i++)
		{
			axis_vectors2[i] = new THREE.Vector3(0,1,0);
			axis6D.children[i*2].updateMatrixWorld();
			axis6D.children[i*2].localToWorld(axis_vectors2[i]);
		}
		extrude(reducedTriaGeometry, axis_vectors2,edgelen);
		
		for(var i = 0; i < reducedTriaGeometry.faces.length; i++)
		{
			if( reducedTriaGeometry.vertices[reducedTriaGeometry.faces[i].a ].distanceTo( reducedTriaGeometry.vertices[reducedTriaGeometry.faces[i].b] ) < 0.0001 ||
				reducedTriaGeometry.vertices[reducedTriaGeometry.faces[i].b ].distanceTo( reducedTriaGeometry.vertices[reducedTriaGeometry.faces[i].c] ) < 0.0001 ||
				reducedTriaGeometry.vertices[reducedTriaGeometry.faces[i].c ].distanceTo( reducedTriaGeometry.vertices[reducedTriaGeometry.faces[i].a] ) < 0.0001 )
			{
				reducedTriaGeometry.faces[i].copy(reducedTriaGeometry.faces[reducedTriaGeometry.faces.length - 1 ] );
				reducedTriaGeometry.faces.pop();
				i--;
			}
		}
		
		var shapeGeometry = new THREE.Geometry();
		for(var i = 0, il = powers_of_2[axis_vectors2.length]; i < il; i++)
			shapeGeometry.vertices.push( new THREE.Vector3() );
		extrude( shapeGeometry, axis_vectors2, edgelen );
		for(var i = 0; i < reducedTriaGeometry.faces.length; i++)
			shapeGeometry.faces.push( reducedTriaGeometry.faces[i].clone() );
		
		var num_conversions = 0;
		for(var i = 0; i < shapeGeometry.vertices.length; i++ )
			for(var k = 0; k < reducedTriaGeometry.vertices.length; k++ )
				if( reducedTriaGeometry.vertices[k].distanceTo( shapeGeometry.vertices[i] ) < 0.0001 )
				{
					num_conversions++;
					for(var l = 0; l < shapeGeometry.faces.length; l++)
					{
						if(shapeGeometry.faces[l].a === k) shapeGeometry.faces[l].a = i;
						if(shapeGeometry.faces[l].b === k) shapeGeometry.faces[l].b = i;
						if(shapeGeometry.faces[l].c === k) shapeGeometry.faces[l].c = i;
					}
				}
		goldenFaces[j] = shapeGeometry.faces; //would it be better to copy them all? Will this mean the garbage collector won't get rid of the geometry?
	}
	
	for(var i = 0; i < icoVerticesNormalized.length; i++)
	{
		nearby_IVs[i] = Array();
		for(var j = 0; j < icoVerticesNormalized.length; j++)
			if( i !== j && icoVerticesNormalized[i].angleTo(icoVerticesNormalized[j]) < TAU / 4 )
				nearby_IVs[i].push( j ); //there appears to be a problem? below we get vertices that are separated from their first one by more than expected
		//we have[a,b,c,d,e], we want them in clockwise order
		for(var j = 1; j < 5; j++) //we choose a position to concentrate on. Must be one of the ones to the right or left of j-1, so we start at j=1
		{
			var rightful_nextindex = 999;
			var other_possibility = 999;
			for(var k = 0; k < 4; k++)
			{
				if( icoVerticesNormalized[ nearby_IVs[i][j-1] ].angleTo(icoVerticesNormalized[ nearby_IVs[i][(j+k)%5] ] ) < TAU / 4 )
				{
					if( rightful_nextindex !== 999 && other_possibility !== 999 ) console.log("more than 2")
					if( rightful_nextindex === 999 ) rightful_nextindex = (j+k)%5;
					else other_possibility = (j+k)%5;
				}
			}
			if( rightful_nextindex === 999 && other_possibility === 999) console.log("less than 2")
			if( clockwise_on_polyhedronsurface(
					icoVerticesNormalized[i], 
					icoVerticesNormalized[nearby_IVs[i][j-1]], 
					icoVerticesNormalized[nearby_IVs[i][rightful_nextindex]] ) )
				rightful_nextindex = other_possibility;
			
			var temp = nearby_IVs[i][j];
			nearby_IVs[i][j] = nearby_IVs[i][rightful_nextindex];
			nearby_IVs[i][rightful_nextindex] = temp;
		}
	}
	
	for(var i = 0; i < dodVerticesNormalized.length; i++)
	{
		dodNearbyIVs[i] = Array(3); //the near three, the second nearest three, the third. First and third must be "same angle round". Second must be TAU/6 round
		var centers_so_far = 0;
		for(var j = 0; j < icoVerticesNormalized.length; j++)
		{
			var angle = dodVerticesNormalized[i].angleTo(icoVerticesNormalized[j]);
			if(TAU/5 < angle && angle < TAU/4)
			{
				dodNearbyIVs[i][3+centers_so_far] = j;
				centers_so_far++;
			}
		}
		
		if( !clockwise_on_polyhedronsurface(icoVerticesNormalized[dodNearbyIVs[i][3]],icoVerticesNormalized[dodNearbyIVs[i][4]],icoVerticesNormalized[dodNearbyIVs[i][5]]) )
		{
			var temp = dodNearbyIVs[i][3];
			dodNearbyIVs[i][3] = dodNearbyIVs[i][4];
			dodNearbyIVs[i][4] = temp;
		}
		
		//the above appears to be correct
		
		for(var j = 0; j < 3; j++)
		{
			var centerIndex = dodNearbyIVs[i][3+j];
			var furthest_angle = 0;
			var missedOut_IV = 666;
			for(var k = 0; k < 5; k++)
			{
				var angle = dodVerticesNormalized[i].angleTo( icoVerticesNormalized[ nearby_IVs[ centerIndex ][k] ] );
				if( angle > furthest_angle )
				{
					furthest_angle = angle;
					missedOut_IV = k;
				}
			}
			/* THE NEARBY ICO DOD POSITIONS
			 *    7  4  8
			 * 		1 2
			 * 	   3 0 5 //the (+1)%3 of the js below is sort of surprising, makes a bit of sense
			 * 		 6
			 */
			dodNearbyIVs[i][(j+1)%3  ] = nearby_IVs[ centerIndex ][(missedOut_IV+3)%5];
			dodNearbyIVs[i][(j+1)%3+6] = nearby_IVs[ centerIndex ][(missedOut_IV+4)%5];
		}
	}
}