/*
 * A little video, by the 14th. No need for hands.
 * Golden ratio
 * Have one extrude
 * Show the substitutions
 * They fit together ever so nicely
 * Fill up the sky with one, just by scaling
 * These things also have connections to the structure of viruses like hepatitis, to crystals, and there's a small possibility that they are connected to Islamic art, but that's a story for another time
 */

var goldenFaces = Array(4);
var powers_of_2 = Array(1,2,4,8,16,32,64);
var substitutionConstant = PHI*PHI*PHI;

var edge_length_of_golden_rhombus_with_short_diagonal_1 = Math.sqrt(10 + 2*Math.sqrt(5)) / 4;
//with edge length 1
var unitTriaCenterToFivefold = PHI / edge_length_of_golden_rhombus_with_short_diagonal_1 * Math.sin(TAU / 5);
var unitTriaCenterToThreefold = 1 / edge_length_of_golden_rhombus_with_short_diagonal_1 * HS3 * PHI;
var unitGico_height = unitTriaCenterToFivefold * 2 - 1;
var rhom_height; //defined later

var golden_colors = Array(6);
golden_colors[0] = new THREE.Color(228 / 255, 99 / 255, 75 / 255);
golden_colors[1] = new THREE.Color(116 / 255,190 / 255, 74 / 255);
golden_colors[2] = new THREE.Color(  0 / 255,170 / 255,231 / 255);
golden_colors[3] = new THREE.Color(137 / 255, 55 / 255,131 / 255);

var axis1D = new THREE.Object3D();
var axis2D = new THREE.Object3D();
var axis3D = new THREE.Object3D();
var axis4D = new THREE.Object3D();
var axis6D = new THREE.Object3D();

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

function init_golden_lattice()
{
	var golden_lattice = new THREE.Object3D();
	
	var lv0Shapes = Array(4);
	for(var i = 0; i < 4; i++ )
		lv0Shapes[i] = Array();
	
	//between the two, this has every shape
//	var start = new THREE.Vector3(0,0,0);
//	var end = new THREE.Vector3();
//	end.copy(dodVerticesNormalized[0]);
//	end.multiplyScalar(50);
//	var edgelen = 1;
//	insert_lineZ( start, end, lv0Shapes, edgelen);
//	end.copy(icoVerticesNormalized[10]);
//	end.multiplyScalar(50);
//	insert_lineX( start, end, lv0Shapes, edgelen );
//	var final_edgelen = edgelen;
	
	var start = new THREE.Vector3(0,0,0);
	var end = new THREE.Vector3();
	var edgelen = 1;
	for(var i = 0; i < dodVerticesNormalized.length; i++)
	{
		end.copy(dodVerticesNormalized[i]);
		insert_lineZ( start, end, lv0Shapes, edgelen );
	}
	var final_edgelen = edgelen;
	
	
	//we stem from black points for the rhom, dod, and ico. Tria stems from a white.
	
	//Dod vectors come out of the "front" bottom point. The two edges coming out of that point have purple arrows
	
	//how to work out, in each substitution, where lineZ's begin? Doesn't matter how far away end is.
	//easy in tria
	//in rhom, add bases together and set length to rhom_height + CenterToThreefold
	//in ico, take the NVIV that it is pointing toward and multiply by edglen * (1+triaFivefoldRadius) and add to stemming position
	//in dod, same basically
	
	//dod z ends from bases (length is ok?):
	//add all 4 together, get the back corner
	//add adjacent pairs, get the three others.
	
	//gico z ends from bases:
	//adjacent pairs around the circle added to the central one
	//adjacent pairs around the circle and minus the one on the opposite pole of the circle
	
	//or maybe think in terms of dod vertices?
	
	//Don't forget the extra x's
	
//	var lv0_edgelen = 2;
//	addTria(new THREE.Vector3(0,0,0), lv0_edgelen, lv0Shapes[3]);
//	
//	var final_edgelen = lv0_edgelen;
	
	//--------CALCULATE AND PROCESS SHAPE POSITIONS
	//you need to make sure that the vertices are given in the same order as the extrusion in the poly array function.
	//from what we have in poly arrays, this simply means the vectors lined up around a center
	
	//here, calculate the positions of all the shapes you have. Add together all basis vectors and divide by 2 (then multiply by edgelen)
	//Some get removed if you want to hollow it out or make it a perfect sphere
	//remove duplicate shapes
	//might be nasty to "splice" them out or whaver, just have a "use" array of binaries?

	for(var i = 0; i < lv0Shapes.length; i++)
		add_meshes(lv0Shapes[i], golden_lattice, final_edgelen);
	
	var outlineGeometry = new THREE.Geometry();
	
	var cylinder_sides = 5;
	var cylinder_radius = 0.025 * final_edgelen;
	//TODO make an array of pairs of explicit vertices to make edges between and you check them for duplicates. Very n^2 so yes save out array of x,y,z
	if(golden_lattice.children.length > 4) console.error("yo we might be about to make the outline wrongly")
	var cylinders_inserted = 0;
	for(var i = 0; i < golden_lattice.children.length; i++)
	{
		var volumeGeometry = golden_lattice.children[i].geometry;
		for(var j = 0, jl = volumeGeometry.faces.length * 2; j < jl; j++)
		{
			var face_index = (j-j%2)/2;
			var topVertexIndex = volumeGeometry.faces[face_index].a;
			var connectedVertexIndex = j%2 ? volumeGeometry.faces[face_index].b : volumeGeometry.faces[face_index].c;
			init_cylinder( outlineGeometry, cylinder_sides); //yo, there's way more geometry in there now
			insert_cylindernumbers(
					volumeGeometry.vertices[ topVertexIndex ],
					volumeGeometry.vertices[ connectedVertexIndex ],
					outlineGeometry.vertices, 
					cylinder_sides, cylinders_inserted * 2 * cylinder_sides, cylinder_radius );
			cylinders_inserted++;
		}
	}
	var shapesOutline = new THREE.Mesh( outlineGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }) );
	golden_lattice.add( shapesOutline );
	
	var lattice_scale = 0.09;
	golden_lattice.scale.set( lattice_scale, lattice_scale, lattice_scale );
	Protein.add(golden_lattice);
	//speedup opportunity: less "push"s, it would be easy to work out the number of vertices needed at the start of making the mesh
}

//very temporary, don't bother optimizing!
function add_meshes(shapes, golden_lattice, edgelen)
{
	if(shapes.length === 0)
		return;
	var shapesVolume = new THREE.Mesh( new THREE.Geometry(), new THREE.MeshPhongMaterial( { color: golden_colors[shapes[0].basis.length - 3], shading: THREE.FlatShading } ) );
	make_mesh(shapes, shapesVolume.geometry, edgelen );

	golden_lattice.add( shapesVolume );
}

function make_mesh(shapes, volumeGeometry, edgelen)
{
	var dimensionality = shapes[0].basis.length;
	var num_vertices_per_shape = powers_of_2[dimensionality];
	
	for(var i = 0, il = shapes.length; i < il; i++)
	{
		for(var j = 0; j < num_vertices_per_shape; j++)
			volumeGeometry.vertices.push( new THREE.Vector3() );
		extrude( volumeGeometry, shapes[i].basis, edgelen, dimensionality, i * num_vertices_per_shape, num_vertices_per_shape );
		for(var j = 0; j < num_vertices_per_shape; j++)
			volumeGeometry.vertices[ i * num_vertices_per_shape + j ].add( shapes[i].stemPosition );
		for(var j = 0; j < goldenFaces[ dimensionality - 3 ].length; j++ )
		{
			var newface = goldenFaces[ dimensionality - 3 ][j].clone();
			newface.a += i * num_vertices_per_shape;
			newface.b += i * num_vertices_per_shape;
			newface.c += i * num_vertices_per_shape;
			volumeGeometry.faces.push( newface );
		}
	}
	volumeGeometry.computeVertexNormals();
	volumeGeometry.computeFaceNormals();
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
	
	var mainStemPoint = dodVerticesNormalized[dodVectorIndex].clone();
	mainStemPoint.multiplyScalar(unitTriaCenterToThreefold * edgelen);
	
	for(var i = 0; i < 3; i++)
	{
		var newShapeIndex = dodes.length;
		dodes.push( {stemPosition: (mainStemPoint.clone()).add(start), basis: Array(4)} );//6017
		dodes[newShapeIndex].basis[0] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][(i%3)+6] ];
		dodes[newShapeIndex].basis[1] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][i] ];
		dodes[newShapeIndex].basis[2] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][(i+1)%3] ];
		dodes[newShapeIndex].basis[3] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][(i+1)%3+6] ];
	}
	
	var centralRhomIndex = rhoms.length;
	rhoms.push( {stemPosition: (mainStemPoint.clone()).add(start), basis: Array(3)} );
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
		rhoms.push( {stemPosition: new THREE.Vector3(), basis: Array(3)} );
		rhoms[newShapeIndex].basis[0] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][  i+3  ] ];
		rhoms[newShapeIndex].basis[1] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][   i   ] ];
		rhoms[newShapeIndex].basis[2] = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][(i+1)%3] ];
		
		for(var j = 0; j < 3; j++) rhoms[newShapeIndex].stemPosition.sub(rhoms[newShapeIndex].basis[j].clone());
		rhoms[newShapeIndex].stemPosition.multiplyScalar(edgelen);
		rhoms[newShapeIndex].stemPosition.add(topOfCentralRhom);
	}
	
	for(var i = 0; i < 3; i++)
	{
		var triaPosition = icoVerticesNormalized[ dodNearbyIVs[ dodVectorIndex ][i+3] ].clone();
		triaPosition.multiplyScalar(edgelen * unitTriaCenterToFivefold);
		triaPosition.add( topOfCentralRhom );
		addTria(triaPosition, edgelen, trias );
	}
}

//note that it DOES matter how far away end is, unlike the other two.
function insert_lineX(start, end, shapeArrays, edgelen )
{
	var rhoms = shapeArrays[0];
	var dodes = shapeArrays[1];
	var gicos = shapeArrays[2];
	var trias = shapeArrays[3];
	
	var lineDirection = (end.clone()).sub(start);
	var preciseEnd = (end.clone()).sub(start);
	preciseEnd.setLength(substitutionConstant * edgelen)
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
		rhoms.push( { stemPosition: start.clone(), basis: Array(3)} ); //speedup opportunity: constructor? Might get optimized
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
	gicos.push( {stemPosition: gicoPosition, basis: Array(5)} );
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
		rhoms.push( {stemPosition: start.clone(), basis: Array(3)} );
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
	trias.push( { stemPosition: SP, basis: Array(6) } );
	for(var j = 0; j < 5; j++)
		trias[newIndex].basis[j] = icoVerticesNormalized[ nearby_IVs[ 11 ][j] ];
	trias[newIndex].basis[5] = icoVerticesNormalized[ 11 ]; //speedup opportunity: they're all the same, no need for array
}

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
//	EP.children[0].visible = false; //skeletal
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
	rhom_height = rhomheightgetter.length();
	
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
			/*	  7  4  8
			 * 		1 2
			 * 	   3 0 5 //the (+1)%3 of the js below is sort of surprising, makes a bit of sense
			 * 		 6
			 */
			dodNearbyIVs[i][(j+1)%3  ] = nearby_IVs[ centerIndex ][(missedOut_IV+3)%5];
			dodNearbyIVs[i][(j+1)%3+6] = nearby_IVs[ centerIndex ][(missedOut_IV+4)%5];
		}
	}
}

//assumes center is at 0,0,0
function clockwise_on_polyhedronsurface(A,B,C)
{
	var ourcross = (new THREE.Vector3()).crossVectors( A, B );
	var clockwise = ( ourcross.dot( C ) < 0 );
	return clockwise;
}

//if it's in proximity to an axis and you activate the axis, it is affected by it
//the minilenses are yellow
//you don't need to do the interior ones... save 32 vertices for tria, 10 for ico, 2 for dod. But trias are rare
//but we're talking about vertices that have no faces attached here, they don't necessarily have a performance cost so shut up
function extrude(ourGeometry, axis_vectors, edgelen, extrusion_level, first_vertex, num_vertices_to_change)
{
	if( typeof extrusion_level === 'undefined')
		extrusion_level = axis_vectors.length;
	if( typeof first_vertex === 'undefined')
		first_vertex = 0;
	if( typeof num_vertices_to_change === 'undefined')
		num_vertices_to_change = ourGeometry.vertices.length;
	
	var axis_addition = new THREE.Vector3();
	for(var i = 0; i < num_vertices_to_change; i++)
		ourGeometry.vertices[first_vertex + i].set(0,0,0);
	
	for(var i = 0; i < axis_vectors.length; i++) //don't get any more axis vectors, don't get any more extrusion
	{
		axis_addition.copy( axis_vectors[i] );
		if( extrusion_level > i )
		{
			var addition_length = extrusion_level - i;
			if( addition_length > 1 ) addition_length = 1;
			addition_length *= edgelen;
			axis_addition.multiplyScalar(addition_length); //you could have it be setlength if you always want them to be the same length
		}
		else continue;
		
		for(var j = 0; j < num_vertices_to_change; j++)
			if( j & powers_of_2[i] )
				ourGeometry.vertices[first_vertex + j].add(axis_addition);
	}
	
	ourGeometry.verticesNeedUpdate = true;
}

function init_axes()
{
	var axisLength = 0.6;
	var axisRadius = 0.009;
	var base_axis = new THREE.CylinderGeometry(axisRadius,axisRadius, axisLength, 32,1,true);
	var up_arrow = new THREE.ConeGeometry(axisRadius * 2, axisLength / 12, 32);
	for(var i = 0; i < up_arrow.vertices.length; i++)
		up_arrow.vertices[i].y += axisLength / 2;
	base_axis.merge(up_arrow, new THREE.Matrix4() );
	var down_arrow = up_arrow.clone();
	var down_arrow_matrix = new THREE.Matrix4();
	down_arrow_matrix.makeRotationAxis(Central_X_axis, TAU / 2);
	base_axis.merge(down_arrow, down_arrow_matrix );
	
	function add_axis(axis_set, Y_rotation, Z_rotation)
	{
		var axis_index = axis_set.children.length;
		var axis_color;
		if(axis_index === 0) { axis_color = 0xFF0000; labelstring = "  y"; }
		if(axis_index === 2) { axis_color = 0x00FF00; labelstring = "  x"; }
		if(axis_index === 4) { axis_color = 0x0000FF; labelstring = "  z"; }
		if(axis_index === 6) { axis_color = 0x00FFFF; labelstring = "  w"; }
		if(axis_index === 8) { axis_color = 0xFF00FF; labelstring = "  u"; }
		if(axis_index === 10){ axis_color = 0x0000FF; labelstring = "  v"; }
		
		axis_set.add( new THREE.Mesh( base_axis.clone(), new THREE.MeshPhongMaterial({ color: axis_color }) ) );
		axis_set.children[axis_index].rotateOnAxis(Central_Y_axis, Y_rotation);
		axis_set.children[axis_index].rotateOnAxis(Central_Z_axis, Z_rotation);
		
		axis_set.add( new THREE.Mesh(
				new THREE.BoxGeometry(0.01,0.01,0.01),
				new THREE.TextGeometry( labelstring, {size: axisLength / 13, height: axisLength / 80, font: gentilis}),
				new THREE.MeshPhongMaterial( { color: axis_color,  shading: THREE.FlatShading } ) ) );
		axis_set.children[axis_index + 1].position.y = axisLength / 2;
		axis_set.children[axis_index + 1].position.applyAxisAngle(Central_Z_axis, Z_rotation);
		axis_set.children[axis_index + 1].position.applyAxisAngle(Central_Y_axis, Y_rotation);
	}
		
	add_axis( axis1D, 0,0 );
	axis1D.update = axis_update;
	
	add_axis( axis2D, 0,0 );
	add_axis( axis2D, 0, TAU / 4 );
	axis2D.update = axis_update;

	add_axis( axis3D, 0,0 );
	add_axis( axis3D, 0, TAU / 4 );
	add_axis( axis3D, TAU / 4, TAU / 4 );
	axis3D.update = axis_update;
	
	var adjacent_square_corner_angle = 2*Math.atan(1/Math.sqrt(2));
	add_axis( axis4D, 0,0 );
	for(var i = 0; i < 3; i++)
		add_axis( axis4D, i * TAU / 3, adjacent_square_corner_angle );
	axis4D.update = axis_update;
	
	var adjacent_ico_corner_angle = 2*Math.atan(1/PHI);
	for(var i = 0; i < 5; i++)
		add_axis( axis6D, i * TAU / 5, adjacent_ico_corner_angle );
	add_axis( axis6D, 0,0 ); //because the tria is extruded after the others
	axis6D.update = axis_update;
	
//	Protein.add(axis3D);
}

function axis_update()
{
	var welookat = new THREE.Vector3();
	this.updateMatrixWorld();
	this.worldToLocal(welookat);
	for(var i = 0; i < this.children.length; i++)
		if( this.children[i].geometry.type === "TextGeometry" )
			this.children[i].lookAt(welookat);
}

function Random_perp_vector(OurVector){
	var PerpVector = new THREE.Vector3();
	
	if( OurVector.equals(Central_Z_axis))
		PerpVector.crossVectors(OurVector, Central_Y_axis);
	else
		PerpVector.crossVectors(OurVector, Central_Z_axis);
	
	return PerpVector;
}
function init_cylinder(ourGeometry, cylinder_sides)
{
	var firstVertexIndex = ourGeometry.vertices.length;
	for(var k = 0; k < cylinder_sides; k++)
	{
		ourGeometry.vertices.push( new THREE.Vector3() );
		ourGeometry.vertices.push( new THREE.Vector3() );
		ourGeometry.faces.push(new THREE.Face3( firstVertexIndex + k*2+1, firstVertexIndex + k*2+0,                       firstVertexIndex + (k*2+2) % (cylinder_sides*2) ) );
		ourGeometry.faces.push(new THREE.Face3( firstVertexIndex + k*2+1, firstVertexIndex +(k*2+2) % (cylinder_sides*2), firstVertexIndex + (k*2+3) % (cylinder_sides*2) ) );
	}
}
function insert_cylindernumbers(A,B, vertices_array, cylinder_sides, array_startpoint, radius ) {
	var A_to_B = new THREE.Vector3(B.x-A.x, B.y-A.y, B.z-A.z);
	A_to_B.normalize();
	var perp = Random_perp_vector(A_to_B);
	perp.normalize(); 
	for( var i = 0; i < cylinder_sides; i++)
	{
		var radiuscomponent = perp.clone();
		radiuscomponent.multiplyScalar(radius);
		radiuscomponent.applyAxisAngle(A_to_B, i * TAU / cylinder_sides);
		
		vertices_array[array_startpoint + i*2 ].copy(radiuscomponent);
		vertices_array[array_startpoint + i*2 ].add(A);
		
		vertices_array[array_startpoint + i*2+1 ].copy(radiuscomponent);
		vertices_array[array_startpoint + i*2+1 ].add(B);
	}
}