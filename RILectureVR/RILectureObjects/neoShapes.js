/*
 * You want to have the amman beenker thing too though. Proooobably
 * 
 * They start out as squares. You can stick them on and de-extrude them, but that is how they start
 * Their corners are available (not their centers, that's complex and silly and unnecessary)
 * 		They cast shadows, with cylindrical volumes
 * 		They can be exported to a set of positions for a lattice of atoms
 * 		They can be seen alone, for various uses
 * 		The points are multicolored, based on distance from center
 * 		Not affected by squashing
 * They have edges
 * 		Not affected by squashing
 * 		They can be seen alone so you can see the star-in-octagon and the 
 * They have faces, that's the central shape
 * They can snap together. 
 * 		Ideally the thing they snap into is affected by axes too, all at once 
 * 		Can you snap 2D ones together? No
 * They are affected by axes
 * 		Iff their origins are lined up
 * 		So long as it has the right dimension
 * 		And they'll gravitate over if they're close and get into the same quaternion. And maybe have their basis vectors slowly change to the graph's
 * For the sake of slicing
 * 		Can be made to fade and disappear based on proximity to a plane
 * You have a data structure that puts cubes together into the right thing
 * You have a button that lets you switch between volume, edges+points, points, and all simultaneously
 * ?The origin of the whole object is the middle, but the origin of the points is one of the corners
 * They duplicate when grabbed with two hands
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
 * The origin is the point that isn't going to change when you change the basis vectors. That should be a 
 * 
 * The shapes you will have:
 * 		Rhombic dod
 * 		Lattice of rhombic dod
 * 		4D lattice
 * 		The lattice of cubes
 * 		Not n-cubes:
 * 			octa, tet
 * 			half-cube pattern -> rhombille lattice, for the simple diamond-shaped crystal
 * 			golden shapes
 * 			Note: nothing with more than four vertices per face, eg no "interior" triangles needed
 * 		A house?
 * 
 * Don't do the tree or sliceable cube, that will make them look worse.
 * 		
 */

function initToys()
{
	var edgesSides = 5;
	var edgeRadius = 0.03; //assuming side length of 1
	
	var tetToy = new THREE.Object3D();
	var tetVolGeo = new THREE.Geometry();
	tetToy.add(new THREE.Mesh( //this is the object that gets its transform manipulated
		tetVolGeo, 
		new THREE.MeshPhongMaterial({
			color: 0xa3dfFF, 
//			transparent: true, 
//			opacity:1, 
			shading: THREE.FlatShading,
			side: THREE.DoubleSide
		})
	);
	tetVolGeo.vertices.push(
		new THREE.Vector3(0,0,0),
		new THREE.Vector3(1,0,0),
		new THREE.Vector3(0,1,0),
		new THREE.Vector3(0,0,1)
	);
	tetVolGeo.faces.push(
		new THREE.Face3(1,2,3),
		new THREE.Face3(0,1,2),
		new THREE.Face3(0,2,3),
		new THREE.Face3(0,3,4)
	);
	
	//Biggest concern: lots of points might mean lots of draw calls
	var tetEdgesGeo = new THREE.Geometry();
	tetToy.add(new THREE.Mesh(
			tetEdgesGeo, 
		new THREE.MeshPhongMaterial({
			color: 0xFFFFFF,
		})
	);
	
	tetToy.edgesIndices = [
	                       0,1,
	                       0,2,
	                       0,3,
	                       1,2,
	                       2,3,
	                       3,1];
	
	for(var i = 0; i < tetToy.edgesIndices.length / 2; i++)
		insertCylinderVerticesAndFaces( tetEdgesGeo, edgesSides );
	for(var i = 0; i < tetVolGeo.vertices.length; i++)
		tetToy.add(new THREE.Mesh(
				sphereTemplateGeometry, 
			new THREE.MeshPhongMaterial({
				color: 0xD4AF37,//gold
				shininess: 100
			})
		);
	
	tetToy.update = function()
	{
		for(var i = 0, il = tetToy.children[0].geometry.vertices.length; i < il; i++)
		{
			tetToy.children[2+i].position.copy(
					tetToy.children[0].geometry.vertices[i]);
			tetToy.children[2+i].position.applyMatrix( tetToy.children[0].matrix );
		}
		for(var i = 0; i < tetToy.edgesIndices.length / 2; i++)
			insert_cylindernumbers(A,B, vertices_array, cylinder_sides, array_startpoint, radius )
		//speedup opportunity: make it so we don't have to compute normals every time
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
	
	
	
	
	
	var cubeToy = new THREE.Object3D();
	var cubeVertices = [];
	for(var i = -0.5; i < 1; i += 1)
		for(var j = -0.5; j < 1; j += 1)
			for(var k = -0.5; k < 1; k += 1)
				cubeVertices.push(new THREE.Vector3( i,j,k ) );
	var cubePolygons = [];
	
	//silly boy! give them all the combinatorics that they need for the maximum thing!
	
	for(var dimension = 0; dimension < 3; dimension++)
	{
		for(var value = -0.5; value < 1; value += 1)
		{
			cubePolygons.push([]);
			for(var vertexIndex = 0, vl = cubeVertices.length; vertexIndex < vl; vertexIndex++)
			{
				if( cubeVertices[vertexIndex].getComponent( dimension ) === value )
					cubePolygons[cubePolygons.length-1].push(vertexIndex); //unordered though
			}
			for(var i = 1; i < cubePolygons[cubePolygons.length-1].length; i++)
			{
				if( Math.abs( cubeVertices[ cubePolygons[ cubePolygons.length-1 ][ i ] ].distanceTo(
					cubeVertices[ cubePolygons[ cubePolygons.length-1 ][i-1] ] ) - 1 ) > 0.000001 )
					continue;
				else for(var j = i; j < cubePolygons[cubePolygons.length-1].length; j++)
					{
						
					}
			}
		}
	}
	
	cubeToy.add
}

function initToyShape(virtualVertices)
{
	//put edges between vertices at unit distance from one another, put faces 
	
	var volume = new THREE.Mesh(
		new THREE.Geometry(), 
		new THREE.MeshPhongMaterial({color: 0xa3dfFF, transparent: true, opacity:1, shading: THREE.FlatShading })
	);
	volume.geometry.vertices = virtualVertices;
	
	console.log(volume.geometry.faces);//whatever it is prior to it being created, create it conditional on that
	//create edges. n^2
	for(var i = 0 il = volume.geometry.vertices.length; i < il; i++)
	{
		var indicesConnectedToThisOne = [];
		for(var j = i+1, jl = volume.geometry.vertices.length; j < jl; j++ )
		{
			if( Math.abs( volume.geometry.vertices[i].distanceTo(
					volume.geometry.vertices[j] ) - 1 ) > 0.000001 )
			{
				//get an edge between them
				
				indicesConnectedToThisOne.push(j);
				for(var k = 0, kl = indicesConnectedToThisOne.length; k < kl; k++)
					volume.geometry.faces.push(new THREE.Face3(i,j,indicesConnectedToThisOne[k]));
				//problem: doubles up the faces of, say, a square
			}
		}
	}
	
	var updatePoints = function()
	{
		for(var i = 0, il = this.virtualVertices.length; i < il)
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
	for
	
	
	toy.add()
}

