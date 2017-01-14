var axis1D = new THREE.Object3D();
var axis2D = new THREE.Object3D();
var axis3D = new THREE.Object3D();
var axis4D = new THREE.Object3D();
var axis6D = new THREE.Object3D();

/* TODO
 * Things extrude one axis at a time, on button press in proximity
 * That axis changes color
 * The edges that are currently extruding are a different color
 * You can take things off the axis
 * You can put things on the axis. Move it around and it changes how it's flattened?
 * You can grab an axis and move it
 * maybe wait until extrusion is full before putting in new edges
 */
function init_extruding_polyhedra_and_house()
{
	var loader = new THREE.OBJLoader();
	loader.load(
		'http://hamishtodd1.github.io/RILecture/Data/editedHouse.obj',
		function ( houseOBJ ) {
			
			var house = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({shading: THREE.FlatShading, color:0xFF0000, side: THREE.DoubleSide}));
			house.geometry.fromBufferGeometry(houseOBJ.children[0].geometry);
			
			house.originalVerticesNumbers = houseOBJ.children[0].geometry.attributes.position.array;
			
			house.scale.set( 0.01,0.01,0.01 );
			
			house.update = function()
			{
				var finalMatrix = new THREE.Matrix4();
				/* the house's rotation matrix,
				 * a matrix made out of the three vectors from the axis
				 * then the problem is that you'd like it to not actually be rotated by your hand movements, so the inverse of the rotation matrix. Seems weird but is there anything more elegant?
				 * But does the hand necessarily interface with the things it is holding through matrices?
				 */
//				house.rotateOnAxis(yAxis, TAU / 60); //test
				house.updateMatrixWorld();
				var houseRotation = new THREE.Matrix4().extractRotation(house.matrixWorld);
				finalMatrix.getInverse(houseRotation);
				
				for(var i = 0, il = this.geometry.vertices.length; i < il; i++)
				{
					this.geometry.vertices[i].set(
							this.originalVerticesNumbers[i*3+0],
							this.originalVerticesNumbers[i*3+1],
							this.originalVerticesNumbers[i*3+2]
						);
					
					this.geometry.vertices[i].applyMatrix4(finalMatrix);
				}
				this.geometry.verticesNeedUpdate = true;
			}
			
			Protein.add( house );
		}
	);
	
//	var initial_extrusion_level = 5; //but it will always have the resources for the whole thing
//	var axis_vectors = Array(initial_extrusion_level);
//	for(var i = 0; i < initial_extrusion_level; i++)
//	{
//		axis_vectors[i] = new THREE.Vector3(0,1,0);
//		axis6D.children[i*2].updateMatrixWorld();
//		axis6D.children[i*2].localToWorld(axis_vectors[i]);
//	}
//	var EP = create_extruding_polyhedron(axis_vectors, true);
//	EP.children[0].visible = false; //skeletal
//	Protein.add(EP);
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
	EP.update = function(){};
	
	for(var i = 0; i < goldenFaces[ axis_vectors.length - 3 ].length; i++ )
		Volume.geometry.faces.push( goldenFaces[ axis_vectors.length - 3 ][i] );
	Volume.geometry.computeFaceNormals();
	
	var EPscale = 0.16;
	EP.scale.set(EPscale,EPscale,EPscale);
	return EP;
}

function init_cylinder(ourGeometry, cylinder_sides, num_added)
{
	var firstVertexIndex = num_added * cylinder_sides * 2;
	for(var i = 0; i < cylinder_sides; i++)
	{
		ourGeometry.vertices.push(new THREE.Vector3());
		ourGeometry.vertices.push(new THREE.Vector3());
		ourGeometry.faces.push( new THREE.Face3(
			firstVertexIndex + i*2+1,
			firstVertexIndex + i*2+0,
			firstVertexIndex + (i*2+2) % (cylinder_sides*2)
				) );
		ourGeometry.faces.push( new THREE.Face3(
			firstVertexIndex + i*2+1,
			firstVertexIndex + (i*2+2) % (cylinder_sides*2),
			firstVertexIndex + (i*2+3) % (cylinder_sides*2)
				) );
	}
}



//you need to make sure that the vertices are given in the same order as the extrusion in the poly array function.
//from what we have in poly arrays, this simply means the vectors lined up around a center
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
	var axisLength = 1;
	var axisRadius = axisLength * 0.01;
	var base_axis = new THREE.CylinderGeometry(axisRadius,axisRadius, axisLength, 32,1,true);
	console.log(base_axis)
	var up_arrow = new THREE.ConeGeometry(axisRadius * 2, axisLength / 12, 32);
	for(var i = 0; i < up_arrow.vertices.length; i++)
		up_arrow.vertices[i].y += axisLength / 2;
	base_axis.merge(up_arrow, new THREE.Matrix4() );
	var down_arrow = up_arrow.clone();
	var down_arrow_matrix = new THREE.Matrix4();
	down_arrow_matrix.makeRotationAxis(xAxis, TAU / 2);
	base_axis.merge(down_arrow, down_arrow_matrix );
	
	function add_axis(axis_set, Y_rotation, Z_rotation)
	{
		var axis_index = axis_set.children.length;
		var axis_color;
		var labelstring;
		if(axis_index === 0) { axis_color = 0xFF0000; labelstring = "  y"; }
		if(axis_index === 2) { axis_color = 0x00FF00; labelstring = "  x"; }
		if(axis_index === 4) { axis_color = 0x0000FF; labelstring = "  z"; }
		if(axis_index === 6) { axis_color = 0x00FFFF; labelstring = "  w"; }
		if(axis_index === 8) { axis_color = 0xFF00FF; labelstring = "  u"; }
		if(axis_index === 10){ axis_color = 0x0000FF; labelstring = "  v"; }
		
		axis_set.add( new THREE.Mesh( base_axis.clone(), new THREE.MeshPhongMaterial({ color: axis_color }) ) );
		axis_set.children[axis_index].rotateOnAxis(yAxis, Y_rotation);
		axis_set.children[axis_index].rotateOnAxis(zAxis,-Z_rotation);
		
		var labelGeometry;
		if(typeof gentilis !== 'undefined')
			labelGeometry = new THREE.TextGeometry( labelstring, {size: axisLength / 13, height: axisLength / 80, font: gentilis});
		else
			labelGeometry = new THREE.BoxGeometry( axisLength / 13,axisLength / 13, axisLength / 80 );
		axis_set.add( new THREE.Mesh(
				labelGeometry,
				new THREE.MeshPhongMaterial( { color: axis_color,  shading: THREE.FlatShading } ) ) );
		axis_set.children[axis_index].updateMatrixWorld();
		axis_set.children[axis_index + 1].position.y = axisLength / 2;
		axis_set.children[axis_index].localToWorld(axis_set.children[axis_index + 1].position);
	}
	
	function getBasis()
	{
		var axis_vectors = Array();
		for(var i = 0; i < this.children.length; i++)
		{
			if( this.children[i].type !== "CylinderGeometry" )
				continue;
			var basisVector = new THREE.Vector3(0,1,0);
			this.children[i*2].updateMatrixWorld();
			this.children[i*2].localToWorld(basisVector);
			axis_vectors.push(basisVector);
			//assumes the order is x, y, z, etc.
		}
		return axis_vectors;
	}
		
	add_axis( axis1D, 0,0 );
	axis1D.update = axis_update;
	
	add_axis( axis2D, 0,0 );
	add_axis( axis2D, 0, TAU / 4 );
	axis2D.update = axis_update;

	add_axis( axis3D, 0,0 );
	add_axis( axis3D, 0, TAU / 4 );
	add_axis( axis3D, TAU / 4,-TAU / 4 );
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
	
	//adornments
	{
		var curveFunction = THREE.Curve.create(
			function ( scale ) {
				this.scale = ( scale === undefined ) ? 1 : scale;
			},
			function ( t ) { //getPoint: t is between 0-1
				var tx = t - 0.5; //somewhat confusingly it goes from -0.5 to 0.5 on x and y
				
				var maxNoise = 0.11;
				var beforeCrash = 0.43;
				var afterCrash = 0.1;
				var crashStart = 0;
				var crashEnd = 0.19;
				var avg;
				if(tx < crashStart )
					avg = beforeCrash;
				else if( tx < crashEnd)
					avg = beforeCrash - tx * 3;
				else
					avg = afterCrash;
				
				var ty = avg + Math.random() * maxNoise;
				var tz = 0;
				return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );
			}
		);
		var num_datapoints = 43;
		var curve2D = new THREE.Mesh( 
				new THREE.TubeGeometry( new curveFunction(), num_datapoints, 0.01, 8, false ), 
				new THREE.MeshBasicMaterial( { color: 0xFFA300 } ) );
		axis2D.add(curve2D);
		
		var width = 100;
		var plottedSurface = new THREE.Mesh( 
				new THREE.PlaneGeometry( width,width,width,width ), 
				new THREE.MeshPhongMaterial( { color: 0xFFA300, side:THREE.DoubleSide } ) );
		plottedSurface.scale.set(1/width,1/width,1/width);
		plottedSurface.rotation.x =-TAU / 4;
		var maxNoiseSurface = 2.2;
		var localMax = new THREE.Vector3(50,20,0);
		for(var i = 0; i < width+1; i++)
		{
			for(var j = 0; j < width+1; j++)
			{
				var displacementFromMax = new THREE.Vector3(i-localMax.x,j-localMax.y,0);
				plottedSurface.geometry.vertices[i*width+j].z = -Math.pow(displacementFromMax.lengthSq(), 1.6) * 0.02;
				plottedSurface.geometry.vertices[i*width+j].z += 30;
				if(plottedSurface.geometry.vertices[i*width+j].z < 0)
					plottedSurface.geometry.vertices[i*width+j].z = 0;
				plottedSurface.geometry.vertices[i*width+j].z += Math.random() * maxNoiseSurface;
			}
		}
		//placeholder idea is two ingredients in a cake
		plottedSurface.geometry.computeFaceNormals();
		plottedSurface.geometry.computeVertexNormals();
		axis3D.add(plottedSurface);
		
		function addPlayer(nameString, number)
		{
			var labelGeometry;
			if(typeof gentilis !== 'undefined')
				labelGeometry = new THREE.TextGeometry( "- " + number.toString() + " " + nameString, {size: axisLength / 13, height: axisLength / 80, font: gentilis});
			else
				labelGeometry = new THREE.BoxGeometry( axisLength / 13,axisLength / 13, axisLength / 80 );
			
			var datapoint = new THREE.Mesh(
					labelGeometry,
					new THREE.MeshPhongMaterial( { color: axis1D.children[0].material.color,  shading: THREE.FlatShading } ) );
			var maxValue = 90;
			var minValue = 0;
			datapoint.position.y = number / (maxValue-minValue) - 0.5;
			axis1D.children[0].updateMatrixWorld();
			axis1D.children[0].localToWorld(datapoint.position);
			
			axis1D.add( datapoint );
		}
		addPlayer("Messi",82);
		addPlayer("Ronaldo",77);
		addPlayer("Ibrahimovic",37);
		addPlayer("Wayne Rooney",26);
		addPlayer("Average UK",0.026);
		addPlayer("",0);
		//no, do xkcd's global warming thing
	}
	
	Protein.add(axis3D);
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
	
	if( OurVector.equals(zAxis))
		PerpVector.crossVectors(OurVector, yAxis);
	else
		PerpVector.crossVectors(OurVector, zAxis);
	
	return PerpVector;
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

//assumes center is at 0,0,0
function clockwise_on_polyhedronsurface(A,B,C)
{
	var ourcross = (new THREE.Vector3()).crossVectors( A, B );
	var clockwise = ( ourcross.dot( C ) < 0 );
	return clockwise;
}

function init_hexacross()
{
	var Hexacross = new THREE.Object3D();
	
	var edge_radius = 0.015;
	
	ico_radius = 0.4;
	var ico_edgelen = ico_radius / Math.sin(TAU / 5);
	var ico_interior_edgelen = ico_edgelen * PHI;
	for(var i = 0; i < 12; i++)
	{
		var vertex = new THREE.Mesh(
				new THREE.SphereGeometry(edge_radius),
				new THREE.MeshPhongMaterial({}) );
		
		vertex.position.copy(icoVerticesNormalized[i])
		vertex.position.setLength(ico_radius)
		
		Hexacross.add( vertex );
	}
	for(var i = 0; i < 12; i++)
	{
		for(var j = 0; j < 12; j++)
		{
			if( Math.abs( Hexacross.children[i].position.distanceTo(Hexacross.children[j].position) - ico_edgelen ) < 0.001 ||
				Math.abs( Hexacross.children[i].position.distanceTo(Hexacross.children[j].position) - ico_interior_edgelen ) < 0.001
				)
			{
				var edge = new THREE.Mesh(
						new THREE.CylinderGeometry(edge_radius * 0.9,edge_radius * 0.9, 1, 31, 1, true),
						new THREE.MeshPhongMaterial({}) );
				
				edge.end1 = i;
				edge.end2 = j;
				
				edge.update_ends = function()
				{
					this.position.copy(Hexacross.children[this.end1].position);
					this.position.add(Hexacross.children[this.end2].position);
					this.position.multiplyScalar(0.5);
					
					this.up.copy(Hexacross.children[this.end1].position);
					this.up.sub(Hexacross.children[this.end2].position);
					this.scale.y = Hexacross.children[this.end1].position.distanceTo(Hexacross.children[this.end2].position)
					
					var lookhere = Random_perp_vector(this.up);
					lookhere.add(this.position);
					this.lookAt(lookhere);
				}
				
				edge.update_ends();
				
				Hexacross.add( edge );
			}
		}
	}
	
	
	
	/* now where do you put the vertices to get them not overlapping in the middle?
	 * get them into groups and enlarge
	 * of three vertices on a triangle, two will need to be moved
	 * 
	 * Try natural things? thinking of the ico as golden rectangles, decrease or increase the long side?
	 * 
	 * But what you really want is the weird overlap thing
	 * 
	 * Hmm, you should maybe think in terms of the planar pentagrams. You can maybe prove that something with octahedral symmetry doesn't get planes like that
	 * 
	 * Get the four triangles of the tetrahedron and enlarge them?
	 * 
	 * Alternatively maybe you should highlight the cells when they're looked at or something?
	 * 
	 * maybe color all the decagons that would actually be "flat" in 6D?
	 */
	
//	var OurOBJLoader = new THREE.OBJLoader();
//	OurOBJLoader.crossOrigin = '';
//	OurOBJLoader.load( "http://hamishtodd1.github.io/OBJmaker/myobj.obj",
//		function ( object ) {
//			var merged = new THREE.Mesh(new THREE.BufferGeometry(), object.material);
//			for(var i = 0; i < object.children.length; i++)
//				merged.geometry.merge(object.children[i].geometry, object.children[i].matrix);
//				
//			Protein.add(merged); 
//		},
//		function ( xhr ) {}, function ( xhr ) { console.error( "couldn't load OBJ" ); }
//	);
	
	var merged = new THREE.Mesh(new THREE.Geometry(), Hexacross.children[0].material);
	for(var i = 0; i < Hexacross.children.length; i++)
	{
		Hexacross.children[i].updateMatrix();
		merged.geometry.merge(Hexacross.children[i].geometry, Hexacross.children[i].matrix);
	}
	merged.rotateOnAxis(new THREE.Vector3(1,0,0), (90-138.19/2)/360 * TAU );
	merged.scale.set(4,4,4);
	//could turn it on it on its side. Turn by 90 - 138.19/2 assuming it's sitting on an edge
//	Protein.add(merged);
}