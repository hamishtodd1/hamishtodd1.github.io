var goldenFaces = Array(4);
var powers_of_2 = Array(1,2,4,8,16,32);

var golden_colors = Array(6);
golden_colors[3] = new THREE.Color(228 / 255, 99 / 255, 75 / 255);
golden_colors[4] = new THREE.Color(116 / 255,190 / 255, 74 / 255);
golden_colors[5] = new THREE.Color(  0 / 255,170 / 255,231 / 255);
golden_colors[6] = new THREE.Color(137 / 255, 55 / 255,131 / 255);

var axis1D = new THREE.Object3D();
var axis2D = new THREE.Object3D();
var axis3D = new THREE.Object3D();
var axis4D = new THREE.Object3D();
var axis6D = new THREE.Object3D();

var normalized_virtualico_vertices = Array(12);
normalized_virtualico_vertices[0] = new THREE.Vector3(0, 	1, 	PHI);
normalized_virtualico_vertices[1] = new THREE.Vector3( PHI,	0, 	1);
normalized_virtualico_vertices[2] = new THREE.Vector3(0,	-1, PHI);
normalized_virtualico_vertices[3] = new THREE.Vector3(-PHI,	0, 	1);
normalized_virtualico_vertices[4] = new THREE.Vector3(-1, 	PHI,0);
normalized_virtualico_vertices[5] = new THREE.Vector3( 1, 	PHI,0);
normalized_virtualico_vertices[6] = new THREE.Vector3( PHI,	0,	-1);
normalized_virtualico_vertices[7] = new THREE.Vector3( 1,	-PHI,0);
normalized_virtualico_vertices[8] = new THREE.Vector3(-1,	-PHI,0);
normalized_virtualico_vertices[9] = new THREE.Vector3(-PHI,	0,	-1);
normalized_virtualico_vertices[10] = new THREE.Vector3(0, 	1,	-PHI);
normalized_virtualico_vertices[11] = new THREE.Vector3(0,	-1,	-PHI);
for(var i = 0; i < 12; i++)
	normalized_virtualico_vertices[i].normalize();

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

function init_golden_lattice()
{
	var edgelen = 1;
	
	var golden_lattice = new THREE.Object3D();
	
	var nearby_VIVs = Array(normalized_virtualico_vertices.length);
	for(var i = 0; i < normalized_virtualico_vertices.length; i++)
	{
		nearby_VIVs[i] = Array();
		for(var j = 0; j < normalized_virtualico_vertices.length; j++)
			if( i !== j && normalized_virtualico_vertices[i].angleTo(normalized_virtualico_vertices[j]) < TAU / 4 )
				nearby_VIVs[i].push( j ); //there appears to be a problem? below we get vertices that are separated from their first one by more than expected
		//we have[a,b,c,d,e], we want them in clockwise order
		for(var j = 1; j < 5; j++) //we choose a position to concentrate on. Must be one of the ones to the right or left of j-1, so we start at j=1
		{
			var rightful_nextindex = 999;
			var other_possibility = 999;
			for(var k = 0; k < 4; k++)
			{
				if( normalized_virtualico_vertices[ nearby_VIVs[i][j-1] ].angleTo(normalized_virtualico_vertices[ nearby_VIVs[i][(j+k)%5] ] ) < TAU / 4 )
				{
					if( rightful_nextindex !== 999 && other_possibility !== 999 ) console.log("more than 2")
					if( rightful_nextindex === 999 ) rightful_nextindex = (j+k)%5;
					else other_possibility = (j+k)%5;
				}
			}
			if( rightful_nextindex === 999 && other_possibility === 999) console.log("less than 2")
			if( clockwise_on_polyhedronsurface(
					normalized_virtualico_vertices[i], 
					normalized_virtualico_vertices[nearby_VIVs[i][j-1]], 
					normalized_virtualico_vertices[nearby_VIVs[i][rightful_nextindex]] ) )
				rightful_nextindex = other_possibility;
			
			var temp = nearby_VIVs[i][j];
			nearby_VIVs[i][j] = nearby_VIVs[i][rightful_nextindex];
			nearby_VIVs[i][rightful_nextindex] = temp;
		}
	}
	for(var i = 0; i < nearby_VIVs.length; i++)
	{
		for(var j = 0; j < nearby_VIVs[i].length; j++)
			if( TAU/4 < normalized_virtualico_vertices[ nearby_VIVs[i][j] ].angleTo(normalized_virtualico_vertices[ nearby_VIVs[i][(j+1)%5] ]))
				console.log(i);
	}
	
	var rhoms = Array();
	var selected_direction = 7;
	for(var i = 0; i < 5; i++)
	{
		rhoms.push( {position: new THREE.Vector3(), basis: Array(3)} );
		rhoms[i].basis[0] = normalized_virtualico_vertices[ selected_direction ];
		rhoms[i].basis[1] = normalized_virtualico_vertices[ nearby_VIVs[selected_direction][i] ];
		rhoms[i].basis[2] = normalized_virtualico_vertices[ nearby_VIVs[selected_direction][(i+1)%5] ]; //or perhaps you would prefer the reverse direction? Or maybe you'd like sometimes-clockwise-sometimes-not ;_;
	}
	
	//here is where you substitute
	
	var rhoms_volume = new THREE.Mesh( new THREE.Geometry(), new THREE.MeshPhongMaterial({ color: golden_colors[3] }) );
	golden_lattice.add( rhoms_volume );
	
	for(var i = 0, il = rhoms.length; i < il; i++)
	{
		for(var j = 0; j < 8; j++)
			rhoms_volume.geometry.vertices.push( new THREE.Vector3() );
		extrude( rhoms_volume.geometry, rhoms[i].basis, edgelen, 3, i * 8, 8 );
		for(var j = 0; j < 8; j++)
			rhoms_volume.geometry.vertices[i*8+j].add( rhoms[i].position );
		for(var j = 0; j < goldenFaces[ 0 ].length; j++ )
		{
			var newface = goldenFaces[ 0 ][j].clone()
			if(newface.a>=8||newface.b>=8||newface.c>=8)console.log("hmm")
			newface.a += i * 8;
			newface.b += i * 8;
			newface.c += i * 8;
			rhoms_volume.geometry.faces.push( newface );
		}
	}
	rhoms_volume.geometry.computeVertexNormals();
	rhoms_volume.geometry.computeFaceNormals();
	
	var rhoms_outline = new THREE.Mesh( new THREE.Geometry(), new THREE.MeshBasicMaterial({ color: 0x000000 }) );
	golden_lattice.add( rhoms_outline );
	
	var cylinder_sides = 5;
	var cylinder_radius = 0.04;
	for(var i = 0, il = rhoms_outline.geometry.faces.length * 2; i < il; i++)
	{
		var face_index = (i-i%2)/2;
		var topVertexIndex = rhoms_outline.geometry.faces[face_index].a;
		var connectVertexIndex = i%2 ? rhoms_outline.geometry.faces[face_index].b : rhoms_outline.geometry.faces[face_index].c;
		init_cylinder( rhoms_outline.geometry, cylinder_sides, i);
		insert_cylindernumbers(
				rhoms_outline.geometry.vertices[ topVertexIndex ],
				rhoms_outline.geometry.vertices[ connectedVertexIndex ],
				rhoms_outline.geometry.vertices, 
				cylinder_sides, cylinder_sides * 2 * i, cylinder_radius );
	}
	rhoms_outline.geometry.computeVertexNormals();
	rhoms_outline.geometry.computeFaceNormals();
	//first vertex is top point
	
	var lattice_scale = 0.16;
	golden_lattice.scale.set( lattice_scale, lattice_scale, lattice_scale );
	Protein.add(golden_lattice);
}

function create_extruding_polyhedron(axis_vectors)
{
	EP = new THREE.Object3D();
	
	EP.edgelen = 1;
	
	var Volume = new THREE.Mesh(new THREE.Geometry, new THREE.MeshPhongMaterial({color:golden_colors[axis_vectors.length]}) );
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
	
	//how to do this for the others?
	//And maybe THAT will be your undoing wrt different basis vectors messing things up
	//so make sure you can check what you put in
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
		for(var i = 0, il = Math.pow(2, axis_vectors2.length); i < il; i++)
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
		else
			continue;
		
		for(var j = 0; j < num_vertices_to_change; j++)
			if( j & Math.pow(2,i) )
				ourGeometry.vertices[first_vertex + j].add(axis_addition);
	}
	
	ourGeometry.verticesNeedUpdate = true;
}

/*
 * We're just making a static shape, you can poke your head in it
 * 
 * The data is: you have the "stemming" positions of shapes, and the basis vectors they're extruded on
 * 	 From that you can finish it by calling one function to stick the shapes themselves into a THREE.Geometry
 * 	 OR you can turn them into directed edges, and then substitute those into new shapes
 *     then make sure to check the shapes for duplicate positions. n^2 problem so maybe save out array 
 *     average their vertices to get these positions. two trias with different extrusion vectors and stemming positions may be the same
 * 
 * To decorate edge x or y, first get its start and end from a shape, then:
 * 1. check which normalized ico vertex it is aligned with
 * 2. go around the five vertices around that - each pair of those and the edge give you a rhomb
 * 3. Some other point on it gives you the tria, which just needs all the vertices
 * 4. Matching rules (i.e. edge direction) wise, 
 * 		the rhom needs to be told which end is which
 * 		the icosa and dod are always oriented the same way
 * 		the tria needs nothing
 * 
 * Note that in addition to extrusion, when adding a lattice shape you also add a bunch of extra, internal, vertices and edges
 * 
 * edge z is a bit harder as it is not aligned with an ico (it's a threefold), but they all have some vertex on it and they still use the same basis vectors
 */

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
		axis_set.add( new THREE.Mesh( new THREE.TextGeometry( labelstring, {size: axisLength / 13, height: axisLength / 80, font: gentilis}), new THREE.MeshPhongMaterial( { color: axis_color,  shading: THREE.FlatShading } ) ) );
		
		axis_set.children[axis_index].rotateOnAxis(Central_Y_axis, Y_rotation);
		axis_set.children[axis_index].rotateOnAxis(Central_Z_axis, Z_rotation);
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
	add_axis( axis6D, 0,0 );
	for(var i = 0; i < 5; i++)
		add_axis( axis6D, i * TAU / 5, adjacent_ico_corner_angle );
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
function init_cylinder(ourGeometry, cylinder_sides, num_added)
{
	for(var k = 0; k < EP.cylinder_sides; k++)
	{
		ourGeometry.vertices.push( new THREE.Vector3() );
		ourGeometry.vertices.push( new THREE.Vector3() );
		ourGeometry.faces.push(new THREE.Face3( EP.cylinder_sides*2*num_added + k*2+1, EP.cylinder_sides*2*num_added + k*2+0,                       	EP.cylinder_sides*2*num_added + (k*2+2) % (EP.cylinder_sides*2) ) );
		ourGeometry.faces.push(new THREE.Face3( EP.cylinder_sides*2*num_added + k*2+1, EP.cylinder_sides*2*num_added +(k*2+2) % (EP.cylinder_sides*2), EP.cylinder_sides*2*num_added + (k*2+3) % (EP.cylinder_sides*2) ) );
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

function insert_triangular_prism(A,B, vertices_array, array_startpoint, radius, up ) {
	var A_to_B = new THREE.Vector3(B.x-A.x, B.y-A.y, B.z-A.z);
	A_to_B.normalize();
	var perp = new THREE.Vector3();
	perp.crossVectors(A_to_B, up);
	perp.cross(A_to_B);
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