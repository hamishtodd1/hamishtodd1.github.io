

/* TODO ideally
 * Things extrude one axis at a time, in proximity
 * That axis changes color
 * The edges that are currently extruding are a different color
 * maybe wait until extrusion is full before putting in new edges
 * 
 * You want axes to be able to create EPs. need a toggle for whether it's a factory. 
 * If it's a factory, it keeps making them so long as there isn't one nearby. Little pauses between extrusions
 * And they're extruded more whenever they're brought anywhere near the thing?
 */
function init_extruding_polyhedra_and_house( presentation )
{
	var house = presentation.createNewHoldable("house");
	
	var loader = new THREE.OBJLoader();
	loader.load(
		'http://hamishtodd1.github.io/RILecture/Data/editedHouse.obj',
		function ( houseOBJ ) {
			house.add( new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({side:THREE.DoubleSide, color:0xCC4444}) ) );
			house.children[0].castShadow = true;
			house.children[0].receiveShadow = true;
			house.children[0].geometry.fromBufferGeometry( houseOBJ.children[0].geometry);
			house.children[0].originalVerticesNumbers = houseOBJ.children[0].geometry.attributes.position.array;
			house.children[0].scale.multiplyScalar( 0.0017 );
			
			house.associatedAxis = presentation.holdables.axis3D;			
			house.update = updateAxisAffectedShape;
		}
	);
	
	var ep2D = create_extruding_polyhedron( presentation.holdables.axis2D );
	presentation.createNewHoldable("ep2D", ep2D);
	
	var ep3D = create_extruding_polyhedron( presentation.holdables.axis3D );
	presentation.createNewHoldable("ep3D", ep3D);

	var ep4D = create_extruding_polyhedron( presentation.holdables.axis4D );
	presentation.createNewHoldable("ep4D", ep4D);
	
	var ep6D = create_extruding_polyhedron( presentation.holdables.axis6D );
	presentation.createNewHoldable("ep6D", ep6D);
	
	{
		var squashableCubic = presentation.createNewHoldable("squashableCubic" );
		squashableCubic.associatedAxis = presentation.holdables.axis3D;
		squashableCubic.update = updateAxisAffectedShape;
		var cubesWide = 5;
		var cubeWidth = 0.02;
		squashableCubic.add( new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({color:0xFF0000, side: THREE.DoubleSide}) ) );
		squashableCubic.add( new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({color:0x00FF00, side: THREE.DoubleSide}) ) );
		squashableCubic.add( new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({color:0x0000FF, side: THREE.DoubleSide}) ) );
		
		var facePlanes = Array(3);
		facePlanes[0] = new THREE.PlaneGeometry(cubeWidth,cubeWidth); //forward facing
		facePlanes[1] = new THREE.PlaneGeometry(cubeWidth,cubeWidth); //up facing
		for(var i = 0; i < facePlanes[1].vertices.length; i++)
		{
			facePlanes[1].vertices[i].z = facePlanes[1].vertices[i].y;
			facePlanes[1].vertices[i].y = 0;
		}
		facePlanes[2] = new THREE.PlaneGeometry(cubeWidth,cubeWidth);  //left facing
		for(var i = 0; i < facePlanes[2].vertices.length; i++)
		{
			facePlanes[2].vertices[i].z = facePlanes[2].vertices[i].x;
			facePlanes[2].vertices[i].x = 0;
		}
		var facePositions = Array(3);
		facePositions[0] = new THREE.Vector3(0,0,cubeWidth/2);
		facePositions[1] = new THREE.Vector3(0,cubeWidth/2,0);
		facePositions[2] = new THREE.Vector3(cubeWidth/2,0,0);
		
		var newPlaneGeometry = new THREE.Geometry();
		function insertCubeFaces(faceType, cubePosition, backFace )
		{
			newPlaneGeometry.copy(facePlanes[faceType]);
			for(var i = 0; i < newPlaneGeometry.vertices.length; i++)
				if(backFace)
					newPlaneGeometry.vertices[i].sub( facePositions[faceType] );
				else
					newPlaneGeometry.vertices[i].add( facePositions[faceType] );
			for(var i = 0; i < newPlaneGeometry.vertices.length; i++)
				newPlaneGeometry.vertices[i].add( cubePosition );
			
			squashableCubic.children[faceType].geometry.merge(newPlaneGeometry);
		}
		var indexSum = (cubesWide-1)*3/2;
		for(var i = 0; i < cubesWide; i++ )
		{
			for(var j = 0; j < cubesWide; j++)
			{
				for(var k = 0; k < cubesWide; k++)
				{
					if( i+j+k === indexSum )
					{
						var cubePosition = new THREE.Vector3(i*cubeWidth,j*cubeWidth,k*cubeWidth);
						for(var u = 0; u < 3; u++)
						{
							insertCubeFaces(u, cubePosition, 0 ); //you could have something conditional on whether it's a side thing or a front thing
//							insertCubeFaces(u, cubePosition, 1 );
						}
					}
				}
			}
		}
		
		for(var j = 0; j < 3; j++)
		{
			squashableCubic.children[j].originalVerticesNumbers = new Float32Array( squashableCubic.children[0].geometry.vertices.length * 3 );
			for(var i = 0, il = squashableCubic.children[j].geometry.vertices.length; i < il; i++)
			{
				squashableCubic.children[j].originalVerticesNumbers[i*3+0] = squashableCubic.children[j].geometry.vertices[i].x;
				squashableCubic.children[j].originalVerticesNumbers[i*3+1] = squashableCubic.children[j].geometry.vertices[i].y;
				squashableCubic.children[j].originalVerticesNumbers[i*3+2] = squashableCubic.children[j].geometry.vertices[i].z;
			}
		}
	}
}

function updateAxisAffectedShape()
{
	var basis = getallBasisVectors( this.associatedAxis );
	var basisMatrix = new THREE.Matrix4();
	for(var i = 0; i < 3; i++)
	{
		var column = i === 2 ? 2 : 1-i; //x and y are reversed
		basisMatrix.elements[0+i*4] = basis[column].x;
		basisMatrix.elements[1+i*4] = basis[column].y;
		basisMatrix.elements[2+i*4] = basis[column].z;
	}
	
	for(var i = 0; i < this.children.length; i++)
	{
		for(var j = 0, jl = this.children[i].geometry.vertices.length; j < jl; j++)
		{
			this.children[i].geometry.vertices[j].set(
					this.children[i].originalVerticesNumbers[j*3+0],
					this.children[i].originalVerticesNumbers[j*3+1],
					this.children[i].originalVerticesNumbers[j*3+2]
				);
			
			this.children[i].geometry.vertices[j].applyMatrix4(basisMatrix);
		}
		this.children[i].geometry.verticesNeedUpdate = true;
	}
}

function create_extruding_polyhedron(axisToAssociate)//search for this function in the source
{
	var EP = new THREE.Object3D();
	
	EP.frustumCulled = false;
	
	EP.edgelen = 1;
	
	EP.extrusionInProgress = false;

	EP.associatedAxis = axisToAssociate;
	var axis_vectors = getallBasisVectors(EP.associatedAxis);
	EP.extrusionLevel = axis_vectors.length; //needs to start out this way so we can make the faces
	
	var Volume = new THREE.Mesh(new THREE.Geometry, new THREE.MeshPhongMaterial({color:golden_colors[axis_vectors.length-3], side: THREE.DoubleSide}) );
	var Outline = new THREE.Mesh(new THREE.Geometry, new THREE.MeshPhongMaterial({color:0x888888}) );
	Volume.frustumCulled = false;
	Outline.frustumCulled = false;
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
	
	//if it's in proximity to an axis and you activate the axis, it is affected by it
	//you don't need to do the interior ones... save 32 vertices for tria, 10 for ico, 2 for dod. But trias are rare
	//but we're talking about vertices that have no faces attached here, they don't necessarily have a performance cost so shut up
	EP.update = function()
	{
		var axis_vectors = getallBasisVectors( this.associatedAxis );
		
		if(this.extrusionInProgress)
		{
			var prevIntegralEL = Math.floor( this.extrusionLevel );
			this.extrusionLevel += 0.009;
			if( this.extrusionLevel > axis_vectors.length ||
				Math.floor( this.extrusionLevel ) > prevIntegralEL ) //finished this round
			{
				this.extrusionLevel = Math.floor( this.extrusionLevel );
				this.extrusionInProgress = false;
			}
		}
		
//		this.extrusionLevel += 0.009;
//		if(this.extrusionLevel > axis_vectors.length)
//			this.extrusionLevel = axis_vectors.length;
		
		extrude( this.children[0].geometry, axis_vectors, this.edgelen, this.extrusionLevel );
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
						this.cylinder_sides, num_added, this.cylinder_radius );
				
				num_added++;
			}
		}
		this.children[1].geometry.verticesNeedUpdate = true;
		this.children[0].geometry.verticesNeedUpdate = true;
		this.children[1].geometry.computeFaceNormals();
		this.children[0].geometry.computeFaceNormals();
		this.children[1].geometry.computeVertexNormals();
		this.children[0].geometry.computeVertexNormals();
		
		if(this.extrusionLevel >= 3)
		{
			var ourColor = golden_colors[Math.floor( this.extrusionLevel ) - 3 ].clone();
			ourColor.lerp( golden_colors[Math.ceil( this.extrusionLevel ) - 3 ], this.extrusionLevel - Math.floor( this.extrusionLevel ) );
			this.children[0].material.color.copy(ourColor);
		}
		else
			this.children[0].material.color.copy(golden_colors[0]);
		this.children[0].material.needsUpdate = true;
	}
	EP.update();
	
	EP.reset = function()
	{
		this.position.copy(this.associatedAxis.position)
		this.quaternion.copy(this.associatedAxis.quaternion)
	}
	
	{
		if( axis_vectors.length > 4 )
			for(var i = 0; i < goldenFaces[ axis_vectors.length - 3 ].length; i++ )
				Volume.geometry.faces.push( goldenFaces[ axis_vectors.length - 3 ][i] ); //you don't extrude on 5
		else if( axis_vectors.length === 3 )
		{
			Volume.geometry.faces.push( new THREE.Face3(0,2,1) );
			Volume.geometry.faces.push( new THREE.Face3(2,3,1) );
			
			Volume.geometry.faces.push( new THREE.Face3(6,7,3) );
			Volume.geometry.faces.push( new THREE.Face3(2,6,3) );
			
			Volume.geometry.faces.push( new THREE.Face3(3,7,1) );
			Volume.geometry.faces.push( new THREE.Face3(1,7,5) );
			
			Volume.geometry.faces.push( new THREE.Face3(0,1,4) );
			Volume.geometry.faces.push( new THREE.Face3(4,1,5) );
			
			Volume.geometry.faces.push( new THREE.Face3(0,4,2) );
			Volume.geometry.faces.push( new THREE.Face3(2,4,6) );
			
			Volume.geometry.faces.push( new THREE.Face3(4,7,6) );
			Volume.geometry.faces.push( new THREE.Face3(4,5,7) );
		}
		else if( axis_vectors.length === 2 )
		{
			Volume.geometry.faces.push( new THREE.Face3(0,2,1) );
			Volume.geometry.faces.push( new THREE.Face3(2,3,1) );
		}
		else //4
		{
			var faceWidth = EP.edgelen / HS3;

			var weIgnore1 = 14;
			var weIgnore2 = 1;
			
			var numVerticesNeeded = powers_of_2[axis_vectors.length];
			
			var center = new THREE.Vector3();
			for(var i = 0; i < numVerticesNeeded; i++ )
				center.add(Volume.geometry.vertices[i]);
			center.multiplyScalar( 1 / Volume.geometry.vertices.length );
			for(var i = 0; i < numVerticesNeeded; i++ )
				Volume.geometry.vertices[i].sub(center);

			for(var i = 0; i < numVerticesNeeded; i++ )
			{
				if(i === weIgnore1 || i === weIgnore2) continue;
				for(var j = 0; j < numVerticesNeeded; j++)
				{
					if(j === weIgnore1 || j === weIgnore2) continue;
					if( Math.abs( Volume.geometry.vertices[i].distanceTo(Volume.geometry.vertices[j]) - EP.edgelen ) < 0.00001 )
					{
						for(var k = 0; k < numVerticesNeeded; k++)
						{
							if(k === weIgnore1 || k === weIgnore2) continue;
							if( Math.abs( Volume.geometry.vertices[i].distanceTo(Volume.geometry.vertices[k]) - EP.edgelen ) < 0.00001 )
							{
								if( Math.abs( Volume.geometry.vertices[j].distanceTo(Volume.geometry.vertices[k]) - faceWidth ) < 0.00001 )
								{
									if(!clockwise_on_polyhedronsurface( Volume.geometry.vertices[i], Volume.geometry.vertices[j], Volume.geometry.vertices[k]))
										Volume.geometry.faces.push( new THREE.Face3(i,j,k) ); //the center isn't there dummy!
								}
							}
						}
					}
				}
			}
			for(var i = 0; i < numVerticesNeeded; i++ )
				Volume.geometry.vertices[i].add(center);
		}
	}
	
	EP.scale.setScalar(0.16);
	return EP;
}





//you need to make sure that the vertices are given in the same order as the extrusion in the poly array function.
//from what we have in poly arrays, this simply means the vectors lined up around a center
function extrude(ourGeometry, axis_vectors, edgelen, extrusionLevel, first_vertex, num_vertices_to_change)
{
	if( typeof extrusionLevel === 'undefined')
		extrusionLevel = axis_vectors.length;
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
		if( extrusionLevel > i )
		{
			var addition_length = extrusionLevel - i;
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

function init_axes(presentation)
{
	var axis1D = presentation.createNewHoldable("axis1D");
	var axis2D = presentation.createNewHoldable("axis2D");
	var axis3D = presentation.createNewHoldable("axis3D");
	var axis4D = presentation.createNewHoldable("axis4D");
	var axis6D = presentation.createNewHoldable("axis6D");
	
	axis1D.type = "axis";
	axis2D.type = "axis";
	axis3D.type = "axis";
	axis4D.type = "axis";
	axis6D.type = "axis";
		
	var axisLength = 1;
	var axisRadius = axisLength * 0.01;
	var base_axis = new THREE.CylinderGeometry(axisRadius,axisRadius, axisLength, 32,1,true);

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
		axis_set.children[axis_index].geometry.type = "axisGeometry"
		axis_set.children[axis_index].rotateOnAxis(yAxis, Y_rotation);
		axis_set.children[axis_index].rotateOnAxis(zAxis,-Z_rotation);
		
		var labelGeometry;
		if(typeof gentilis !== 'undefined')
			labelGeometry = new THREE.TextGeometry( labelstring, {size: axisLength / 13, height: axisLength / 80, font: gentilis});
		else
			labelGeometry = new THREE.BoxGeometry( axisLength / 13,axisLength / 13, axisLength / 80 );
		axis_set.add( new THREE.Mesh(
				labelGeometry,
				new THREE.MeshPhongMaterial( { color: 0x888888,  shading: THREE.FlatShading } ) ) );
		axis_set.children[axis_index].updateMatrixWorld();
		axis_set.children[axis_index + 1].position.y = axisLength / 2;
		axis_set.children[axis_index].localToWorld(axis_set.children[axis_index + 1].position);
	}
	
	
		
	add_axis( axis1D, 0,0 );
	axis1D.update = axis_update;
	
	add_axis( axis2D, 0,0 );
	add_axis( axis2D, 0, TAU / 4 );
	axis2D.update = axis_update;

	
	
	var alterAxis = function(axisNum, destination)
	{
		var currentAxis = getBasisVector(this, axisNum);
		var alterationAxis = (currentAxis.clone()).cross(destination);
		alterationAxis.applyMatrix4( new THREE.Matrix4().getInverse(this.children[axisNum*2].matrix) );
		alterationAxis.normalize();
		var alterationAngle = currentAxis.angleTo(destination);
		this.children[axisNum*2].rotateOnAxis(alterationAxis,alterationAngle);
	}
	
	add_axis( axis3D, 0,0 );
	add_axis( axis3D, 0, TAU / 4 );
	add_axis( axis3D, TAU / 4,-TAU / 4 );
	axis3D.xAxisDestination = getBasisVector(axis3D,1);
	axis3D.zAxisDestination = getBasisVector(axis3D,2);
	axis3D.alterAxis = alterAxis;
	axis3D.update = axis_update;
	
	var adjacent_square_corner_angle = 2*Math.atan(1/Math.sqrt(2));
	add_axis( axis4D, 0,0 );
	for(var i = 0; i < 3; i++)
		add_axis( axis4D, i * TAU / 3, adjacent_square_corner_angle );
	axis4D.xAxisDestination = getBasisVector(axis4D,1);
	axis4D.zAxisDestination = getBasisVector(axis4D,2);
	axis4D.wAxisDestination = getBasisVector(axis4D,3);
	axis4D.update = axis_update;
	axis4D.alterAxis = alterAxis;
	
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
		
		function addPlayer(fileNum, number)
		{
			function makeSlide(url)
			{
				var slide = new THREE.Mesh( new THREE.PlaneGeometry(16/10, 9/10), new THREE.MeshBasicMaterial({side:THREE.DoubleSide}) );
				loadpic(url, slide.material);
				return slide;
			}
			
			var maxValue = 90;
			var minValue = 0;
			
			var datapoint = new THREE.Mesh( new THREE.PlaneGeometry(0.7,0.7), new THREE.MeshBasicMaterial({side:THREE.DoubleSide, transparent:true}) );
			loadpic( "http://hamishtodd1.github.io/RILectureVR/Data/Footballers/" + fileNum + ".png", datapoint.material);
			datapoint.material.transparent = true;
			
			datapoint.position.y = number / (maxValue-minValue) - 0.5;
			datapoint.position.x = 0.4;
			axis1D.children[0].updateMatrixWorld();
			axis1D.children[0].localToWorld(datapoint.position);
			
			axis1D.add( datapoint );
		}
		addPlayer("4",82);
		addPlayer("3",77);
		addPlayer("2",37);
		addPlayer("1",26);
		addPlayer("0",0);
		//no, do xkcd's global warming thing
	}
	
//	document.addEventListener( 'keydown', function(event)
//	{
//		changeBasis(axis3D.xAxisDestination, 37,38,39,40);
//		changeBasis(axis3D.zAxisDestination, 65,87,68,83);
//		
//		changeBasis(axis4D.xAxisDestination, 37,38,39,40);
//		changeBasis(axis4D.zAxisDestination, 65,87,68,83);
//		changeBasis(axis4D.wAxisDestination, 70,84,72,71);
//	}, false );
	
	var updateAxisGrabber = function()
	{
		this.ourAxis.updateMatrixWorld();
		
		this.ourAxis.worldToLocal(this.position);
		this.position.setLength( 0.45 );
		this.ourAxis.localToWorld(this.position);
		
		var newAxisPosition = this.position.clone();
		this.ourAxis.worldToLocal( newAxisPosition );
		this.ourAxis.alterAxis( this.axisNum, newAxisPosition );
	}
	
	var resetAxisGrabber = function()
	{
		if( typeof this.defaultPosition === 'undefined' )
			this.defaultPosition = getBasisVector( this.ourAxis, this.axisNum );
		
		this.position.copy(this.defaultPosition);
		this.ourAxis.updateMatrixWorld();
		this.ourAxis.localToWorld( this.position );
	}
	
	var axisGrabbers = Array(2);
	for(var i = 0; i < 2; i++) //the axes
	{
		axisGrabbers[i] = Array(i+2);
		for(var j = 0; j < axisGrabbers[i].length; j++)
		{
			var axisWeAffect = "";
			if(j===0) axisWeAffect += "x";
			if(j===1) axisWeAffect += "z";
			if(j===2) axisWeAffect += "w";
			
			axisGrabbers[i][j] = presentation.createNewHoldable(axisWeAffect + "AxisGrabber" + (i+3) + "D");
			axisGrabbers[i][j].add(new THREE.Mesh(new THREE.SphereGeometry(0.01) ));
			axisGrabbers[i][j].ourAxis = eval( "axis" + (i+3) + "D");
			axisGrabbers[i][j].axisNum = j+1;
			axisGrabbers[i][j].update = updateAxisGrabber;
			axisGrabbers[i][j].reset = resetAxisGrabber;
			
			if( WEBVR.isAvailable() !== true )
				axisGrabbers[i][j].visible = false;
		}
	}
	
	axis1D.scale.multiplyScalar(0.2);
	axis2D.scale.multiplyScalar(0.2);
	axis3D.scale.multiplyScalar(0.2);
	axis4D.scale.multiplyScalar(0.2);
	axis6D.scale.multiplyScalar(0.2);

	init_poly_arrays( presentation, axis1D, axis2D, axis3D, axis4D, axis6D );
}

function getallBasisVectors(axis)
{
	var axis_vectors = [];
	for(var i = 0; i < axis.children.length; i++)
	{
		if( typeof axis.children[i].geometry !== 'undefined' && 
				axis.children[i].geometry.type === "axisGeometry")
		{
			axis_vectors.push( new THREE.Vector3(0,1,0) );
			axis.children[i].updateMatrix();
			axis_vectors[axis_vectors.length-1].applyMatrix4(axis.children[i].matrix);
			axis_vectors[axis_vectors.length-1].normalize();
		}
	}
	return axis_vectors;
}

function getBasisVector(axis, index)
{
	var basisVector = new THREE.Vector3(0,1,0);
	axis.children[index*2].updateMatrix();
	basisVector.applyMatrix4(axis.children[index*2].matrix);
	return basisVector;
}

function changeBasis(vectorToBeChanged, leftNumber, upNumber, rightNumber, downNumber)
{
	var latitudeAxis = vectorToBeChanged.clone();
	latitudeAxis.cross( yAxis );
	latitudeAxis.normalize();
	var rotationAmount = 0.01;
	if(event.keyCode === leftNumber)
		vectorToBeChanged.applyAxisAngle(yAxis, -rotationAmount);
	if(event.keyCode === upNumber)
		vectorToBeChanged.applyAxisAngle(latitudeAxis, rotationAmount);
	if(event.keyCode === rightNumber)
		vectorToBeChanged.applyAxisAngle(yAxis, rotationAmount);
	if(event.keyCode === downNumber)
		vectorToBeChanged.applyAxisAngle(latitudeAxis,-rotationAmount);
}

function axis_update()
{
	var welookat = Camera.position.clone();
	this.updateMatrixWorld();
	this.worldToLocal(welookat);
	for(var i = 0; i < this.children.length; i++)
		if( this.children[i].geometry.type === "TextGeometry" && this.children[i-1].geometry.type === "axisGeometry" )
		{
			this.children[i].position.set(0,0.5,0)
			this.children[i-1].updateMatrix();
			this.children[i].position.applyMatrix4( this.children[i-1].matrix );
			
			this.children[i].lookAt(welookat);
		}
	
	//it extrudes a level when you press a button on it
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
//			OurObject.add(merged); 
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
//	OurObject.add(merged);
}