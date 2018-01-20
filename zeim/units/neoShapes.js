function initToys(presentation)
{
	var edgeCylinderSides = 5;
	var edgeLength = 0.1;
	var edgeRadius = edgeLength / 40; //edge length is 1, but then they do get scaled down
	
	var sphereTemplateGeometry = new THREE.SphereGeometry(edgeRadius * 2);
	var sphereMaterial = new THREE.MeshPhongMaterial({
		color: 0xD4AF37,//gold
		shininess: 100
	});
	
	/*
	 * separate objects so that things are not affected by squashing
	 * TODO when turning this into a constructor, make it so that it can be cloned, and exported and imported for clusters
	 * The deal is that the whole object's position gets changed, but its orientation and scale are always the identity(!)
	 * It is the transform of the volume that gets changed - the three vectors that make up its matrix - then the points and edges follow
	 * The origin is the point that isn't going to change when you change the basis vectors. That should be a corner
	 */
	var tetToy = new THREE.Object3D();
	
	{
		tetToy.volume = new THREE.Mesh( //this is the object that gets its transform manipulated
				new THREE.Geometry(), 
				new THREE.MeshPhongMaterial({
					color: 0x880000, 
//					transparent: true, 
//					opacity:1, 
//					shading: THREE.FlatShading,
					side: THREE.DoubleSide
				})
			);
		tetToy.volume.updateMatrix();
		tetToy.add( tetToy.volume );
		
		tetToy.volume.geometry.vertices.push(
			new THREE.Vector3(-1/Math.sqrt(2)*edgeLength/2,-1*edgeLength/2,0),
			new THREE.Vector3( 1/Math.sqrt(2)*edgeLength/2,-1*edgeLength/2,0),
			new THREE.Vector3(0,1*edgeLength/2,-1/Math.sqrt(2)*edgeLength/2),
			new THREE.Vector3(0,1*edgeLength/2, 1/Math.sqrt(2)*edgeLength/2)
		);
		tetToy.volume.geometry.faces.push(
			new THREE.Face3(1,2,3),
			new THREE.Face3(0,1,2),
			new THREE.Face3(0,2,3),
			new THREE.Face3(0,3,4)
		);
	}
	
	//edges
	{
		tetToy.edges = new THREE.Mesh(
				new THREE.Geometry(), 
				new THREE.MeshPhongMaterial({
					color: 0x000000,
				})
			);
		tetToy.add( tetToy.edges );
		
		tetToy.edges.indices = [
		                       0,1,
		                       0,2,
		                       0,3,
		                       1,2,
		                       2,3,
		                       3,1];
		
		for(var i = 0; i < tetToy.edges.indices.length / 2; i++)
			insertCylinderVerticesAndFaces( tetToy.edges.geometry, edgeCylinderSides );
	}
	
	//Concern: lots of points might mean lots of draw calls
	//TODO "export to set of points for simulation"
	tetToy.points = Array(tetToy.volume.geometry.vertices.length);
	for(var i = 0; i < tetToy.points.length; i++)
	{
		tetToy.points[i] = new THREE.Mesh( sphereTemplateGeometry, sphereMaterial );
		tetToy.add( tetToy.points[i] );
	}
	
	closestTriangleToPoint = function(point, ourObject3D)
	{
		var trianglePosition = new THREE.Vector3();
		var closestTriangle = 0;
		var closestDistanceSoFar = 999999999999;
		
		for( var i = 0, il = ourObject3D.geometry.faces.length; i < il; i++ )
		{
			trianglePosition.set(0,0,0);
			for(var k = 0; k < 3; k++ )
			{
				trianglePosition.add( ourObject3D.geometry.vertices[ ourObject3D.geometry.faces[i].corner(k) ] );
			}
			trianglePosition.multiplyScalar( 1/3 );
			ourObject3D.localToWorld( trianglePosition );
			trianglePosition.add( ourObject3D.position );
			
			if( trianglePosition.distanceTo( point ) < closestDistanceSoFar )
			{
				closestTriangle = i;
				closestDistanceSoFar = trianglePosition.distanceTo( this.volume.boundingSphere.center );
			}
		}
		
		return closestTriangle;
	}
	
	tetToy.update = function()
	{
		for(var i = 0, il = tetToy.points.length; i < il; i++)
		{
			tetToy.points[i].position.copy(
					tetToy.volume.geometry.vertices[i]);
			tetToy.points[i].position.applyMatrix4( tetToy.volume.matrix ); //which may have been set by the things
		}
		for(var i = 0; i < tetToy.edges.indices.length / 2; i++)
		{
			insert_cylindernumbers(
					tetToy.points[ tetToy.edges.indices[i*2+0] ].position,
					tetToy.points[ tetToy.edges.indices[i*2+1] ].position, 
					tetToy.edges.geometry.vertices, edgeCylinderSides, i, edgeRadius );
		}
		
		tetToy.edges.geometry.computeFaceNormals();
		tetToy.edges.geometry.computeVertexNormals();
		
		//TODO button for this
		if( shapeViewingMode === "pointsOnly" )
		{
			tetToy.volume.visible = false;
			for(var i = 0; i < tetToy.edges.length; i++)
				tetToy.edges[i].visible = false;
		}
		else if( shapeViewingMode === "skeletal" )
		{
			tetToy.volume.visible = false;
			for(var i = 0; i < tetToy.edges.length; i++)
				tetToy.edges[i].visible = true;
		}
		else
		{
			tetToy.volume.visible = true;
			for(var i = 0; i < tetToy.edges.length; i++)
				tetToy.edges[i].visible = true;
		}
		
		//only do the below if you're being held. Probably?
		for(var i = 0, il = scene.children.length; i< il; i++)
		{
			if( typeof scene.children[i].volume !== 'undefined' )
			{
				var trianglePosition = new THREE.Vector3();
				var closestTriangle = 0;
				var closestDistanceSoFar = 999999999999;
				
				for( var j = 0, jl = scene.children[i].volume.geometry.faces.length; j < jl; j++ )
				{
					trianglePosition.set(0,0,0);
					for(var k = 0; k < 3; k++ )
					{
						trianglePosition.add( scene.children[i].volume.geometry.vertices[ scene.children[i].volume.geometry.faces[j].corner(k) ] );
					}
					trianglePosition.multiplyScalar( 1/3 );
					trianglePosition.applyMatrix( scene.children[i].volume.matrix );
					trianglePosition.add( scene.children[i].position );
					
					//we assume good centering
					if( trianglePosition.distanceTo( this.volume.boundingSphere.center ) < closestDistanceSoFar )
					{
						closestTriangle = j;
						closestDistanceSoFar = trianglePosition.distanceTo( this.volume.boundingSphere.center );
					}
				}
				
				if( closestDistanceSoFar <= scene.children[i].volume.boundingSphere.radius * 1.1 )
				{
					for( var j = 0, jl = this.volume.geometry.faces.length; j < jl; j++ )
					{
						trianglePosition.set(0,0,0);
						for( var k = 0; k < 3; k++ )
						{
							trianglePosition.add( scene.children[i].volume.geometry.vertices[ scene.children[i].volume.geometry.faces[j].corner(k) ] );
						}
						trianglePosition.multiplyScalar( 1/3 );
						trianglePosition.applyMatrix( scene.children[i].volume.matrix );
						
						//we assume good centering
						if( trianglePosition.distanceTo( this.volume.boundingSphere.center ) < closestDistanceSoFar )
						{
							closestTriangle = j;
							closestDistanceSoFar = trianglePosition.distanceTo( this.volume.boundingSphere.center );
						}
					}
					
				}
				
				//-------Snapping
				//go through triangles in shape B. Find the one closest to that triangle.
				//if you're within some minim distance, snap. Just multiply by that matrix, making sure that you have the clockwise shit right
				//maybe show a ghost first; all shapes have a ghost of their volumeume.
				//we are assuming all triangles on A and B are the same. Your tridecahedron would break that.
				//when a shape is ready to snap, a "ghost" version of it appears in the prospective place. Letting go causes the snap
				//note that so long as you have a teeny bit of depth, you can have snapping squares
			}
			else if( typeof scene.children[i].core !== 'undefined' )
			{
				//axis stuff
			}
		}
		
		/* TODO
		 * They are affected by axes
		 * 		When they are put in the scene, they search it for axes.
		 * 		Iff their origins are lined up
		 * 		So long as it has the right dimension
		 * 		And they'll gravitate over if they're close, and have their basis vectors slowly change to the graph's
		 * Can be made to fade away based on whether they're in front of a plane?
		 * 
		 * They duplicate when grabbed with two hands
		 * 
		 * Recolor them based on distance from center
		 */
	}
	
	

	
	function insertCylinderVerticesAndFaces(ourGeometry, cylinder_sides )
	{
		var firstVertexIndex = ourGeometry.vertices.length;
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
	
	presentation.createNewHoldable( "tetToy", tetToy ); //it doesn't want to be a holdable, you're doing this rotation thing
	
	/*
	 * They start out as squares. You can put them near some axes and that will make them right
	 * 
	 * The shapes you could pre-make... but alternatively could make when they come in the scene
	 * 		4 cube (/rhombic dod)
	 * 		4 cube lattice (Lattice of rhombic dod/amman beenker)
	 * 		3 cube lattice
	 * Not n-cubes:
	 * 		octa, tet
	 * 		half-cube pattern -> rhombille lattice, for the simple diamond-shaped crystal
	 * 		golden shapes
	 * 		Note: nothing with more than four vertices per face, eg no "interior" triangles needed
	 * 
	 * The way to present it: with two axes I can only have a 2D shape. With 3 I get 3D - but only if it's not in the plane
	 */
//	var cubeToy = new THREE.Object3D();
//	var cubeVertices = [];
//	for(var i = -0.5; i < 1; i += 1)
//		for(var j = -0.5; j < 1; j += 1)
//			for(var k = -0.5; k < 1; k += 1)
//				cubeVertices.push(new THREE.Vector3( i,j,k ) );
//	var cubePolygons = [];
//	
//	//Give them all the combinatorics for the whole thing. Doubling up the triangles on a quadrilateral face is fine, easier to snap
//	
//	for(var dimension = 0; dimension < 3; dimension++)
//	{
//		for(var value = -0.5; value < 1; value += 1)
//		{
//			cubePolygons.push([]);
//			for(var vertexIndex = 0, vertexIndexL = cubeVertices.length; vertexIndex < vertexIndexL; vertexIndex++)
//			{
//				if( cubeVertices[vertexIndex].getComponent( dimension ) === value )
//					cubePolygons[cubePolygons.length-1].push(vertexIndex); //unordered though
//			}
//			for(var i = 1; i < cubePolygons[cubePolygons.length-1].length; i++)
//			{
//				if( Math.abs( cubeVertices[ cubePolygons[ cubePolygons.length-1 ][ i ] ].distanceTo(
//					cubeVertices[ cubePolygons[ cubePolygons.length-1 ][i-1] ] ) - 1 ) > 0.000001 )
//					continue;
//				else for(var j = i; j < cubePolygons[cubePolygons.length-1].length; j++)
//					{
//						
//					}
//			}
//		}
//	}
//	
//	cubeToy.add
//	
//	presentation.createNewHoldable( "neoShape", cubeToy );
}

function initToyShape(virtualVertices)
{
	//put edges between vertices at unit distance from one another, put faces 
	
	var volumeume = new THREE.Mesh(
		new THREE.Geometry(), 
		new THREE.MeshPhongMaterial({color: 0xa3dfFF, transparent: true, opacity:1, shading: THREE.FlatShading })
	);
	volumeume.geometry.vertices = virtualVertices;
	
	console.log(volumeume.geometry.faces);//whatever it is prior to it being created, create it conditional on that
	//create edges. n^2
	for(var i = 0, il = volumeume.geometry.vertices.length; i < il; i++)
	{
		var indicesConnectedToThisOne = [];
		for(var j = i+1, jl = volumeume.geometry.vertices.length; j < jl; j++ )
		{
			if( Math.abs( volumeume.geometry.vertices[i].distanceTo(
					volumeume.geometry.vertices[j] ) - 1 ) > 0.000001 )
			{
				//get an edge between them
				
				indicesConnectedToThisOne.push(j);
				for(var k = 0, kl = indicesConnectedToThisOne.length; k < kl; k++)
					volumeume.geometry.faces.push(new THREE.Face3(i,j,indicesConnectedToThisOne[k]));
				//problem: doubles up the faces of, say, a square
			}
		}
	}
	
	var updatePoints = function()
	{
		for(var i = 0, il = this.virtualVertices.length; i < il; i++)
		{
			
		}
		this.virtualVertices
	}
	
	var shape = new THREE.Mesh(
			new THREE.Geometry(), 
			new THREE.MeshPhongMaterial({color: 0xa3dfFF, transparent: true, opacity:1})
		);
	shape.geometry.vertices = vertices;
	shape.geometry.faces = faces;
	
	
	toy.add()
}

function initNeoShapes()
{
	function makeBasis()
	{
		//probably a bad idea to "privelege" any of them.
		//but obviously the level needs to be able to define the basis
		//The handle goes wherever your hand goes, but 
		//	axes have a maximum length. When you let go the handle goes back
		//	you can't get it any closer to the center than the core radius
		//labels that appear are determined by how many axes there are from this basis. Could swap them though...
		//if the core is being grabbed, the next grab will get one of the axes. 
			//Might need to make it so that you *have* to be holding the core
			//they change color if you're about to grab them
		
		/* 
		 * Is there any other pattern that's nice when squashed down? You should try things, hell, you might even discover things.
		 * Best idea so far is a shark into a ray. How about a seashell?
		 * You are concerned about the large number of separate objects. But is drawcalls really about separate objects?
		 * 
		 * http://www.steelpillow.com/polyhedra/five_sf/five.htm
		 * 
		 * 14 gon in skin https://elifesciences.org/content/5/e19593
		 * 
		 * The graphs
		 * 		No silliness with y.
		 * 		They can snap to
					all: right-angles
					3: snowflake, 
					6: icosahedron corners
					4: 8-pointed compass
					4: cube corners
		 *		Can be held with two hands at a time
		 *		Your hand moves it but doesn't rotate the transform. When your hand rotates it rotates the axes.
		 *		Aren't destroyed by simple movement!
		 * 		The x, y, z axes pop up when it's long
		 * 		You can switch adornments on and off with a button
		 * 		It starts as a "seed".
		 * 		Probably axes are twice the length of edges, so you can see them sticking out and you think of the graph as more important
		 * 		Have little holders just to the side of a seed. The tip of the arrow will be just before that
		 * 		Rotating the things causes changes to transform as read
		 * 
		 * Emergent shadow
		 * set up a copy of the lattice with all the points and edges and meshes black, meshbasicmaterial
		 * the basis vectors are the same as the basis vectors of the actual thing, just with z = 0. Jesus!
		 * I mean, that is a very cool moment. It's about the connection between computer science and games, consistency
		 * It is a design realization that has come from this "unification" process.
				Not only is it easier to program even if you don't want to have a separate basis
				But this "separate basis" thing, if you have it, is a new way to illustrate something that has been born from contemplating the programming/mathematical design
				My interests are aligned. 
					As a programmer I want less code. 
					As a game designer I want a clean set of mechanics so I can think of new phenomena. 
					As a teacher I get a clever new illustration
				Conventional science presenters eg Brian Cox - "I'll explain my shit, maybe I'll have some animator do something for me"
				
			The basis vector copy should look like a shadow of the basis. "How many dimensions does a shadow have?" A trick:
				1. Hey what's that over there? A shadow of our basis. Move vectors - see?
				2. And if we bring over a pattern of ours, we see it has a shadow too (flick through representations)
				3. Stick them together, no surprise, the shadow of our pattern gets the same things applied to it
				4. But so actually this is a lie! Take the pattern away; its shadow doesn't move. Change the basis again - shadow pattern changes, "actual" one doesn't
				5. Change the lattice colors so now the shadow looks like a normal pattern. Maybe demonstrate it still moves normally
				6. Change the basis colors so now the shadow looks like a normal basis. 
				7. Modify flat basis - "all I've done is set up a simple relationship between these two bases",
				8. Overlap them (can do this because no rotation from hands!)
				9. "One is a squashed version of the other." And actually - that's what a shadow is. A shape with its basis squashed down"
				10. Modify "actual" basis into flat one and bring back "actual" pattern
		 */
		
		var basis = new THREE.Object3D();

		var axisLength = 1;
		var axisRadius = axisLength * 0.01;
		var axisRadialDetail = 32;
		var coreRadius = axisRadius * 4;
		
		var core = new THREE.Mesh( new THREE.SphereGeometry(coreRadius), new THREE.MeshPhongMaterial({color:0x000000}) );
		basis.add(core);
		
		var axisGeometry = new THREE.CylinderGeometry(axisRadius,axisRadius, axisLength, axisRadialDetail,1,true); //the length should be 2.
		var upArrowhead = new THREE.ConeGeometry(axisRadius * 2, axisLength / 12, axisRadialDetail);
		for(var i = 0; i < upArrowhead.vertices.length; i++)
			upArrowhead.vertices[i].y += axisLength / 2;
		axisGeometry.merge(upArrowhead, new THREE.Matrix4() );
		var downArrowhead = upArrowhead.clone();
		var downArrowhead_matrix = new THREE.Matrix4();
		downArrowhead_matrix.makeRotationAxis(xAxis, TAU / 2);
		axisGeometry.merge(downArrowhead, downArrowhead_matrix );
		
		basis.axes = Array(6);
		
		function updateAxis()
		{
			{
				if( this.handle.position.length() < coreRadius )
					this.handle.position.setLength( coreRadius );
				if( this.handle.position.length() > 1 + coreRadius )
					this.handle.position.setLength( 1 + coreRadius );
				
				//various other things to do with handle position here. Assuming it is fine after this
			}
			
			var characteristicVector = this.handle.position.clone();
			characteristicVector.setLength( characteristicVector.length() - coreRadius );
			
			this.matrix.makeRotationAxis( (new THREE.Vector3()).crossVectors( yAxis, this.handle.position ), yAxis.angleTo( this.handle.position ) ); //might need to negate axis
			this.scale.setScalar( characteristicVector.length() );
		}
		
		function updateBasis()
		{
			//if you grab a handle and it has the wrong label, we swap its position with the one with the right label
		}
		
		for(var i = 0; i < 6; i++)
		{
			basis.axes[i] = new THREE.Mesh(axisGeometry, new THREE.MeshPhongMaterial({color:0x000000}) );
			basis.axes[i].handle = new THREE.Mesh( new THREE.SphereGeometry( axisRadius * 2 ), new THREE.MeshPhongMaterial(
				{
					color:0x888888, //silver?
					shininess: 100
				} ) );
			basis.add( basis.axes[i] );
			basis.add( basis.axes[i].handle );
			
			var axisColor;
			var labelstring;
			if( i === 0 ) { axisColor = 0xFF0000; labelstring = "  x"; basis.axes[i].handle.position.set(1,0,0); }
			if( i === 1 ) { axisColor = 0x00FF00; labelstring = "  y"; basis.axes[i].handle.position.set(0,1,0); }
			if( i === 2 ) { axisColor = 0x0000FF; labelstring = "  z"; basis.axes[i].handle.position.set(0,0,1); }
			if( i === 3 ) { axisColor = 0x00FFFF; labelstring = "  u"; basis.axes[i].handle.position.set(-1/Math.sqrt(2),0,-1/Math.sqrt(2)); }
			if( i === 4 ) { axisColor = 0xFF00FF; labelstring = "  v"; basis.axes[i].handle.position.set( 1/Math.sqrt(2), 1/Math.sqrt(2),0); }
			if( i === 5 ) { axisColor = 0xFFFF00; labelstring = "  w"; basis.axes[i].handle.position.set(0, 1/Math.sqrt(2), 1/Math.sqrt(2)); }
			
			basis.axes[i].handle.position.setLength( coreRadius );
			
			if(typeof gentilis !== 'undefined')
				basis.axes[i].label = new THREE.Mesh(new THREE.TextGeometry( labelstring, {size: axisLength / 13, height: axisLength / 80, font: gentilis}),
															 new THREE.MeshPhongMaterial( { color: axisColor } ) );
			else
				basis.axes[i].label = new THREE.Mesh(new THREE.BoxGeometry( axisLength / 13,axisLength / 13, axisLength / 80 ),
															 new THREE.MeshPhongMaterial( { color: axisColor } ) );
			basis.add(basis.axes[i].label);
			
			basis.axes[i].update = updateAxis;
			
			//the label needs to change position and rotate to face you
			
		}
		
		
		return basis;
	}
}