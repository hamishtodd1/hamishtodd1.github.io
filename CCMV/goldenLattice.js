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
for( var i = 0; i < 12; i++ )
	icoVerticesNormalized[i].normalize();
var nearby_IVs = Array(icoVerticesNormalized.length);

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
for( var i = 0; i < dodVerticesNormalized.length; i++ )
	dodVerticesNormalized[i].normalize();
var dodNearbyIVs = Array(dodVerticesNormalized.length);

function shape(stemPosition, basis)
{
	this.stemPosition = stemPosition;
	this.basis = basis;
	this.ignore = false;
}

function init_golden_lattice()
{
	//To check you're following the matching rules: make those arrays of X Y Z edges and see if any are in the wrong direction
	
	var lv0 = {shapes: Array(Array(),Array(),Array(),Array()), edgelen: 2.5};
	
	//example tria
	addTria(new THREE.Vector3(), lv0.edgelen, lv0.shapes[3]);
	
	//example rhom
//	lv0.shapes[0].push( new shape( new THREE.Vector3(), Array(3)) );
//	lv0.shapes[0][0].basis[0] = icoVerticesNormalized[ 0 ];
//	lv0.shapes[0][0].basis[1] = icoVerticesNormalized[ 1 ];
//	lv0.shapes[0][0].basis[2] = icoVerticesNormalized[ 5 ];
	
	//example dode
//	lv0.shapes[1].push( new shape( new THREE.Vector3(), Array(4)) );
//	lv0.shapes[1][0].basis[0] = icoVerticesNormalized[ nearby_IVs[ 0 ][0] ];
//	lv0.shapes[1][0].basis[1] = icoVerticesNormalized[ nearby_IVs[ 0 ][1] ];
//	lv0.shapes[1][0].basis[2] = icoVerticesNormalized[ nearby_IVs[ 0 ][2] ];
//	lv0.shapes[1][0].basis[3] = icoVerticesNormalized[ nearby_IVs[ 0 ][3] ];
	
	//example gico
//	lv0.shapes[2].push( new shape( new THREE.Vector3(), Array(4)) );
//	lv0.shapes[2][0].basis[0] = icoVerticesNormalized[ nearby_IVs[ 0 ][0] ];
//	lv0.shapes[2][0].basis[1] = icoVerticesNormalized[ nearby_IVs[ 0 ][1] ];
//	lv0.shapes[2][0].basis[2] = icoVerticesNormalized[ nearby_IVs[ 0 ][2] ];
//	lv0.shapes[2][0].basis[3] = icoVerticesNormalized[ nearby_IVs[ 0 ][3] ];
//	lv0.shapes[2][0].basis[4] = icoVerticesNormalized[ nearby_IVs[ 0 ][4] ];
	
	var lv1 = {shapes: Array(Array(),Array(),Array(),Array()), edgelen: lv0.edgelen / substitutionConstant};
	substitute(lv0, lv1);
	removeDuplicateShapes(lv1, false);
	var lv2 = {shapes: Array(Array(),Array(),Array(),Array()), edgelen: lv1.edgelen / substitutionConstant};
	substitute(lv1, lv2);
	removeDuplicateShapes(lv2, true); //27 seconds; some optimization is required!

	var golden_lattice = new THREE.Object3D();
	add_meshes(lv2, golden_lattice);
	
	//speedup opportunity: typed arrays
	
	var lattice_scale = 0.09;
	golden_lattice.scale.set( lattice_scale, lattice_scale, lattice_scale );
	Protein.add(golden_lattice);
	//speedup opportunity: less "push"s, it would be easy to work out the number of vertices needed at the start of making the mesh
}

function add_meshes(level, golden_lattice)
{
	for(var i = 0; i < 4; i++)
	{
		if(level.shapes[i].length === 0)
			continue;
		var shapeGeometry = make_mesh_of_shapeArray(level.shapes[i], level.edgelen );
		var shapesVolume = new THREE.Mesh( shapeGeometry, new THREE.MeshPhongMaterial( { color: golden_colors[level.shapes[i][0].basis.length - 3], shading: THREE.FlatShading } ) );

		golden_lattice.add( shapesVolume );
	}
	
	ourclock.getDelta();
	
	//none of this until you get rid of those pushes in init_cylinder
	var outlineGeometry = new THREE.Geometry();
	
	var cylinder_sides = 5;
	var cylinder_radius = 0.07 * level.edgelen;
	//TODO make an array of pairs of explicit vertices to make edges between and you check them for duplicates. Very n^2 so yes save out array of x,y,z
	if(golden_lattice.children.length > 4) console.error("yo we might be about to make the outline wrongly")
	
	var numElements = 0; //both vertices and faces
	for(var i = 0; i < 4; i++ )
		numElements += golden_lattice.children[i].geometry.faces.length * 2 * cylinder_sides * 2;
	console.log(numElements)
	
	outlineGeometry.vertices = Array( numElements );
	outlineGeometry.faces = Array( numElements );
	
	var cylinders_inserted = 0;
	var radiusComponent = new THREE.Vector3();
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
				outlineGeometry.vertices[firstVertexIndex + k * 2 + 0] = new THREE.Vector3();
				outlineGeometry.vertices[firstVertexIndex + k * 2 + 1] = new THREE.Vector3();
				
				outlineGeometry.faces[firstVertexIndex + k * 2 + 0] = new THREE.Face3(
					firstVertexIndex + k*2+1,
					firstVertexIndex + k*2+0,
					firstVertexIndex + (k*2+2) % (cylinder_sides*2) );
				
				outlineGeometry.faces[firstVertexIndex + k * 2 + 1] = new THREE.Face3(
					firstVertexIndex + k*2+1,
					firstVertexIndex + (k*2+2) % (cylinder_sides*2),
					firstVertexIndex + (k*2+3) % (cylinder_sides*2) );
			}
			
			var array_startpoint = cylinders_inserted * 2 * cylinder_sides;
			var A_to_B = new THREE.Vector3(
					volumeGeometry.vertices[ connectedVertexIndex ].x - volumeGeometry.vertices[ topVertexIndex ].x, 
					volumeGeometry.vertices[ connectedVertexIndex ].y - volumeGeometry.vertices[ topVertexIndex ].y, 
					volumeGeometry.vertices[ connectedVertexIndex ].z - volumeGeometry.vertices[ topVertexIndex ].z );
			A_to_B.normalize();
			radiusComponent.copy(Random_perp_vector(A_to_B) );
			radiusComponent.setLength(cylinder_radius); 
			for( var k = 0; k < cylinder_sides; k++)
			{
				radiusComponent.applyAxisAngle(A_to_B, TAU / cylinder_sides);
				
				outlineGeometry.vertices[array_startpoint + k*2+0 ].copy(radiusComponent);
				outlineGeometry.vertices[array_startpoint + k*2+0 ].add(volumeGeometry.vertices[ topVertexIndex ]);
				
				outlineGeometry.vertices[array_startpoint + k*2+1 ].copy(radiusComponent);
				outlineGeometry.vertices[array_startpoint + k*2+1 ].add(volumeGeometry.vertices[ connectedVertexIndex ]);
			}

			cylinders_inserted++;
		}
	}
	var shapesOutline = new THREE.Mesh( outlineGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }) );
	golden_lattice.add( shapesOutline );
	
	console.log("adding edges took: ", ourclock.getDelta())
}

function make_mesh_of_shapeArray(shapes, edgelen)
{
	ourclock.getDelta();
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
	console.log("ignoring ", num_ignored, " shapes out of ", shapes.length);
	
	var volumeGeometry = new THREE.Geometry();
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
	console.log("shape meshes made: ", num_shapes)
	volumeGeometry.computeVertexNormals();
	volumeGeometry.computeFaceNormals();

	console.log("making mesh took: ", ourclock.getDelta())
	return volumeGeometry;
}

function removeDuplicateShapes(level, reduce)
{
	ourclock.getDelta();
	
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
			if( reduce && lengthSq < cavityRadiusSq || radiusSq < lengthSq )
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
	console.log("removed ", num_removed, " shapes out of ", level.shapes[0].length+level.shapes[1].length+level.shapes[2].length+level.shapes[3].length);
	console.log("YOYO removing duplicate shapes took: ", ourclock.getDelta());
}

function substitute(oldLevel, newLevel)
{
	ourclock.getDelta();
	for( var i = 0, il = oldLevel.shapes[0].length; i < il; i++ )
		substituteRhom( oldLevel.shapes[0][i], newLevel );
	for( var i = 0, il = oldLevel.shapes[1].length; i < il; i++ )
		substituteDode( oldLevel.shapes[1][i], newLevel );
	for( var i = 0, il = oldLevel.shapes[2].length; i < il; i++ )
		substituteGico( oldLevel.shapes[2][i], newLevel );
	for( var i = 0, il = oldLevel.shapes[3].length; i < il; i++ )
		substituteTria( oldLevel.shapes[3][i], newLevel );
	console.log("substitution took: ", ourclock.getDelta());
}

function substituteRhom( ourRhom, newLevel )
{
	var rhomEdgelen = newLevel.edgelen * substitutionConstant;
	
	var zEnd = ourRhom.stemPosition.clone();
	var zStart = new THREE.Vector3();
	for(var i = 0; i < ourRhom.basis.length; i++)
		zStart.add(ourRhom.basis[i]);
	var distance_down = unitRhomHeight * rhomEdgelen - newLevel.edgelen * ( unitRhomHeight + unitTriaCenterToThreefold );
	zStart.setLength( distance_down );
	zStart.add(ourRhom.stemPosition);
	insert_lineZ( zStart, zEnd, newLevel.shapes, newLevel.edgelen );
	
	for(var i = 0; i < 3; i++)
	{
		var purpleCorner = ourRhom.basis[i].clone();
		purpleCorner.multiplyScalar( rhomEdgelen );
		purpleCorner.add( ourRhom.stemPosition );
		insert_lineY( ourRhom.stemPosition, purpleCorner, newLevel.shapes, newLevel.edgelen );
		
		var redCorner1 = ourRhom.basis[(i+1)%3].clone();
		var redCorner2 = ourRhom.basis[(i+2)%3].clone();
		redCorner1.multiplyScalar( rhomEdgelen );
		redCorner2.multiplyScalar( rhomEdgelen );
		redCorner1.add(purpleCorner);
		redCorner2.add(purpleCorner);
		insert_lineX( redCorner1, purpleCorner, newLevel.shapes, newLevel.edgelen );
		insert_lineX( redCorner2, purpleCorner, newLevel.shapes, newLevel.edgelen );
		
		var farCorner = ourRhom.basis[(i+2)%3].clone();
		farCorner.multiplyScalar( rhomEdgelen );
		farCorner.add(redCorner1);
		insert_lineX( redCorner1, farCorner, newLevel.shapes, newLevel.edgelen );
	}
}

//we stem from black points for the rhom, dod, and ico. Tria stems from a white. This is important for substitution matching rules
function substituteTria( ourTria, newLevel )
{
	var triaEdgelen = newLevel.edgelen * substitutionConstant;
	var center = ourTria.basis[5].clone();
	center.setLength( triaEdgelen * unitTriaCenterToFivefold );
	center.add( ourTria.stemPosition );
	for(var i = 0; i < dodVerticesNormalized.length; i++)
		insert_lineZ( center, (dodVerticesNormalized[i].clone()).add(center), newLevel.shapes, newLevel.edgelen );
	for(var i = 0, il = icoVerticesNormalized.length; i < il; i++)
	{
		var end = (icoVerticesNormalized[i].clone()).multiplyScalar(unitTriaCenterToFivefold * triaEdgelen);
		var start = icoVerticesNormalized[i].clone();
		start.multiplyScalar(newLevel.edgelen * (1+unitTriaCenterToFivefold));
		
		start.add(center);
		end.add(center);
		
		insert_lineX( start, end, newLevel.shapes, newLevel.edgelen );
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
			insert_lineX( start, end, newLevel.shapes, newLevel.edgelen );
		}
	}
	//speedup opportunity: look for duplicates right now, since this is the only opportunity for duplication of the dods we've just added
	//You could also look for duplicates among the edges that you're going to "insert", and that would completely stop their duplication
	//array of X insertions, Y insertions, again with explicit vertices...
	//Hmm, but you'd still have to compare the positions of, eg, rhoms inside this tria.
}

//Dod vectors come out of the "front" bottom point. The two edges coming out of that point have purple arrows
function substituteDode( ourDode, newLevel )
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
		
		insert_lineZ( zCenter, dodeCorners[i], newLevel.shapes, newLevel.edgelen );
	}
	
	for(var i = 0; i < 2; i++)
	{
		var ourFivefold = (ourDode.basis[1].clone()).add(ourDode.basis[2]);
		ourFivefold.add(ourDode.basis[i*3]);
		ourFivefold.multiplyScalar(dodeEdgelen);
		ourFivefold.add(ourDode.stemPosition);
		
		var Xorigin = ourFivefold.clone();
		Xorigin.sub(zCenter);
		Xorigin.setLength( newLevel.edgelen * ( 1 + unitTriaCenterToFivefold ) );
		Xorigin.add(zCenter);
		insert_lineX( Xorigin, ourFivefold, newLevel.shapes, newLevel.edgelen );
		
		insert_lineX( dodeCorners[1], ourFivefold, newLevel.shapes, newLevel.edgelen );
		insert_lineX( dodeCorners[3], ourFivefold, newLevel.shapes, newLevel.edgelen );
		insert_lineX( dodeCorners[i*2], ourFivefold, newLevel.shapes, newLevel.edgelen );
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
			insert_lineX( Xorigin, Xdestination, newLevel.shapes, newLevel.edgelen );
		}
	}
}

function substituteGico( ourGico, newLevel )
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
		
		insert_lineX( start, end, newLevel.shapes, newLevel.edgelen );
		
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
		insert_lineZ( zCenter, innerThreefold, newLevel.shapes, newLevel.edgelen );
		
		var outerThreefold = prolateFaceCenter.clone();
		outerThreefold.sub( ourGico.basis[ (i+3)%5 ] );
		outerThreefold.setLength( newLevel.edgelen * unitLineZLength );
		outerThreefold.add(zCenter);
		insert_lineZ( zCenter, outerThreefold, newLevel.shapes, newLevel.edgelen );
		
		var nearbyFiveFold1 = ourGico.basis[   i   ].clone();
		nearbyFiveFold1.multiplyScalar( zCenterToFivefold );
		nearbyFiveFold1.add(zCenter);
		var nearbyFiveFold2 = ourGico.basis[(i+1)%5].clone();
		nearbyFiveFold2.multiplyScalar( zCenterToFivefold );
		nearbyFiveFold2.add(zCenter);
		insert_lineX( innerThreefold, topFivefold, newLevel.shapes, newLevel.edgelen );
		insert_lineX( innerThreefold, nearbyFiveFold1, newLevel.shapes, newLevel.edgelen );
		insert_lineX( innerThreefold, nearbyFiveFold2, newLevel.shapes, newLevel.edgelen );
		insert_lineX( outerThreefold, nearbyFiveFold1, newLevel.shapes, newLevel.edgelen );
		insert_lineX( outerThreefold, nearbyFiveFold2, newLevel.shapes, newLevel.edgelen );
		
		
		//another way to check if you've violated matching rules is to make a list of edges and see if any of the ones overlapping are going in the wrong direction
	}
	
	for(var i = 0; i < 5; i++)
	{
		var start = ourGico.stemPosition.clone();
		var end = ourGico.basis[i].clone();
		end.add(start);
		
		insert_lineX( start, end, newLevel.shapes, newLevel.edgelen );
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

/* TODO
 * Things extrude one axis at a time, on button press in proximity
 * That axis changes color
 * You can take things off the axis
 * You can put things on the axis. Move it around and it changes how it's flattened?
 * You can grab an axis and move it
 */
function init_extruding_polyhedron()
{
	var initial_extrusion_level = 5; //but it will always have the resources for the whole thing
	var axis_vectors = Array(initial_extrusion_level);
	for(var i = 0; i < initial_extrusion_level; i++)
	{
		axis_vectors[i] = new THREE.Vector3(0,1,0);
		axis6D.children[i*2].updateMatrixWorld();
		axis6D.children[i*2].localToWorld(axis_vectors[i]);
	}
	var EP = create_extruding_polyhedron(axis_vectors, true);
	EP.children[0].visible = false; //skeletal
	Protein.add(EP);
}

function create_extruding_polyhedron(axis_vectors)
{
	EP = new THREE.Object3D();
	
	EP.edgelen = 1;
	
	var Volume = new THREE.Mesh(new THREE.Geometry, new THREE.MeshPhongMaterial({color:golden_colors[axis_vectors.length-3]}) );
	var Outline = new THREE.Mesh(new THREE.Geometry, new THREE.MeshPhongMaterial({color:0x888888}) );
	EP.add( Volume );
	EP.add( Outline );
	
	EP.cylinder_sides = 32;
	EP.cylinder_radius = 0.04;
	var num_added = 0;
	for(var i = 0; i < 64; i++ )
	{
		var flipper = 1;
		for(var j = 0; j < 6; j++)
		{
			var partner = i ^ flipper; //try turning each bit
			flipper *= 2;
			if( partner > i )
				continue;
			
			init_cylinder(Outline.geometry, EP.cylinder_sides, num_added);
			
			num_added++;
		}
	}
	
	for( var i = 0; i < 64; i++ )
		Volume.geometry.vertices.push( new THREE.Vector3() );
	EP.update = update_extruding_polyhedron;
	EP.update(axis_vectors);
	
	for(var i = 0; i < goldenFaces[ axis_vectors.length - 3 ].length; i++ )
		Volume.geometry.faces.push( goldenFaces[ axis_vectors.length - 3 ][i] );
	Volume.geometry.computeFaceNormals();
	
	var EPscale = 0.16;
	EP.scale.set(EPscale,EPscale,EPscale);
	return EP;
}

//if it's in proximity to an axis and you activate the axis, it is affected by it
//you don't need to do the interior ones... save 32 vertices for tria, 10 for ico, 2 for dod. But trias are rare
//but we're talking about vertices that have no faces attached here, they don't necessarily have a performance cost so shut up
function update_extruding_polyhedron(axis_vectors, extrusion_level)
{
	if( typeof extrusion_level === 'undefined')
		extrusion_level = axis_vectors.length;
	extrude( this.children[0].geometry, axis_vectors, this.edgelen, extrusion_level );
	var num_added = 0;
	for(var i = 0; i < 64; i++ )
	{
		var flipper = 1;
		for(var j = 0; j < 6; j++)
		{
			var partner = i ^ flipper;
			flipper *= 2;
			if( partner > i )
				continue;
		
			insert_cylindernumbers(
					this.children[0].geometry.vertices[ i ],
					this.children[0].geometry.vertices[ partner ],
					this.children[1].geometry.vertices, 
					this.cylinder_sides, this.cylinder_sides * 2 * num_added, this.cylinder_radius );
			
			num_added++;
		}
	}
	this.children[1].geometry.verticesNeedUpdate = true;
	this.children[1].geometry.computeVertexNormals();
}

function init_poly_arrays()
{	
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