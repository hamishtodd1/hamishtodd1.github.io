'use strict';
/*
	TODO
		display method for partitioning
		partitioning algorithm https://idea-instructions.com/graph-scan/

	Introducing n-partite graphs (without words!)
		Assemble the n sets on a circle
		Show a bunch of examples
		Want to hover your mouse over the partitions 
			an oval appears around them
			those edges connected to them highlight
			Clicking gets you a new point in that partion. Necessary, given the graph? Whatever
		Show a crazy one and say "try to guess the n-partition of this graph"
			An easyish one would be such that you could easily count the degrees of nodes
			Or one where you could see which ones were not connected to each other
			Let people move them around

	Introducing n-cycles (without words!)
		Show a bunch of examples
		Can click a series of edges to find an n-cycle
		Could make some difficult puzzles, not necessarily in the partite environment
		Want to be able to color a decomposition

	3D graph of tripartite, er, graphs
		Visualize her conditions
			all even or all odd
			5 | rs + rt + st
			t <= 4rs/(r+s) "each 5-cycle uses at least one edge and at most three edges from between any two parts of K"
		Mirzakhani and her collaborator conjectured that these conditions were sufficient
			But in spite of a lot of effort, nobody has proven this yet!
			You could be the one to prove it!
			All you have to do is either find a single point in this set that doesn't have a decomposition, or show that there aren't any

		Puzzle: give a graph that can be made 5-decomposable by the addition or subtraction of a single point

		Hover over one and the displayed graph becomes that. Tap it again and the 5-cycles highlight?
		Color it in such that x y and z are clockwise
*/

function initGraphTheory()
{
	// var disjointSets = [];
	// function addDisjointSet()
	// {
	// 	var colorAsNumber = disjointSets.length+1;
	// 	disjointSets.push([]);
	// 	var min = 0.2;
	// 	disjointSets[disjointSets.length-1].color = new THREE.Color( min + (1-min) * Math.random(), min + (1-min) * Math.random(), min + (1-min) * Math.random() );
	// 	disjointSets[disjointSets.length-1].color.multiplyScalar(0.8)
	// 	disjointSets[disjointSets.length-1].position = new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,-10);
	// }
	// for(var i = 0; i < 3; i++)
	// {
	// 	addDisjointSet();
	// }
	// disjointSets[0].length = 2;
	// disjointSets[1].length = 2;
	// disjointSets[2].length = 3;

	var nodes = [];
	
	var edgeRadius = 0.002;
	var nodeRadius = edgeRadius * 12;
	var nodeGeometry = new THREE.EfficientSphereGeometry(nodeRadius);
	var smallSpringIdealLength = edgeRadius * 80;
	var largeSpringIdealLength = smallSpringIdealLength * 2;

	function Node(putAtMousePosition)
	{
		var node = new THREE.Mesh(nodeGeometry, new THREE.MeshPhongMaterial());
		nodes.push(node);

		node.velocity = new THREE.Vector3();
		scene.add(node);
		
		node.disjointSet = -1;
		
		// for(var i = 0; i < disjointSets.length; i++)
		// {
		// 	for(var j = 0; j < disjointSets[i].length; j++)
		// 	{
		// 		if( disjointSets[i][j] === undefined )
		// 		{
		// 			node.disjointSet = i;
		// 			disjointSets[i][j] = node;
		// 			break;
		// 		}
		// 	}
		// 	if( node.disjointSet !== -1 )
		// 	{
		// 		break;
		// 	}
		// }

		//do something with position and color, possibly involving the disjoint set's color, possibly taking account of putAtMousePosition
		node.position.set(Math.random()-0.5,Math.random()-0.5,-10)

		node.update = function updateNode()
		{
			var acceleration = new THREE.Vector3()
			
			for(var i = 0; i < nodes.length; i++)
			{
				if(this === nodes[i])
				{
					continue;
				}
				
				var addition = new THREE.Vector3().subVectors(nodes[i].position, this.position);
				
				if(nodes[i].disjointSet === this.disjointSet)
				{
					var magnitude = (smallSpringIdealLength - addition.length()) * -0.03;
				}
				else
				{
					var magnitude = (0.6 - addition.length()) * -0.06;
				}
				
				addition.setLength( magnitude );
				
				acceleration.add(addition);
			}
			
			acceleration.add(this.position.clone().setComponent(2,0).multiplyScalar(-0.08))
			// console.log(acceleration)
			
			this.velocity.set(0,0,0); //can remove this severe damping for bounciness
			this.velocity.add(acceleration);
			this.position.add(this.velocity);
		}
		
		return node;
	}

	Node();
	Node();
	
// 	for(var i = 0,il = disjointSets[0].length+disjointSets[1].length+disjointSets[2].length; i < il; i++)
// 	{
// 		Node(false);
// 	}
	
	var edgeGeometry = THREE.CylinderBufferGeometryUncentered(0.01,1,15)
	function PlaceableCylinder(startIndex,endIndex)
	{
		var ourPlaceableCylinder = new THREE.Mesh( edgeGeometry, new THREE.MeshPhongMaterial({color:0x000000, side:THREE.DoubleSide}));
		scene.add(ourPlaceableCylinder)
		ourPlaceableCylinder.place = function()
		{
			this.position.copy(this.start)
			pointCylinder(this, ourPlaceableCylinder.end)
		}
		
		ourPlaceableCylinder.startIndex = startIndex;
		ourPlaceableCylinder.endIndex = endIndex;

		ourPlaceableCylinder.start = nodes[startIndex].position;
		ourPlaceableCylinder.end = nodes[endIndex].position;
		ourPlaceableCylinder.place();
		
		return ourPlaceableCylinder;
	}

	var edges = [];
	for(var i = 0; i < nodes.length; i++)
	{
		for(var j = i+1; j < nodes.length; j++)
		{
			// if( nodes[i].disjointSet === nodes[j].disjointSet )
			// {
			// 	continue;
			// }
				
			edges.push( PlaceableCylinder( i, j ) );
		}
	}
	
/*
 * 2,2,4
 * 
 * 3,5,5 is also possible
 * 
 * 5,5,5
 * 
 * [a2, b5, c1, b1, c5], [b2, c5, a1, c1, a5], [c2, a5, b1, a1, b5]
 * 
 * decompose into all cycles
forget those not of length 5
Try all combinations of them

Can be ruled out if there's an odd number of edges
	Or #edges is not a multiple of 5

for each edge, do a search

To divide a graph with n nodes into c-cycles,
	First check if all nodes have an even degree
		If not, can't be decomposed
	Find all s c-cycles that exist in the graph. The same edge can appear in multiple cycles
	go through every possible set of them of magnitude n/c.
		for each edge, check that it appears once and only once
 */	
	
	// var decomposition;
	// function findEdge(startNode,endNode)
	// {
	// 	var edgeIndex = -1;
	// 	for(var i = 0, il = edges.length; i < il; i++)
	// 	{
	// 		if( ( nodes[edges[i].startIndex] === startNode && nodes[edges[i].endIndex] === endNode ) ||
	// 			( nodes[edges[i].startIndex] === endNode && nodes[edges[i].endIndex] === startNode ) )
	// 		{
	// 			return edges[i];
	// 		}
	// 	}
	// 	console.error("no such edge found ", startNode.disjointSet,endNode.disjointSet, edges)
	// 	return 0;
	// }
// 	function findCycles(edgesInCycle)
// 	{
// 		if( edges.length % edgesInCycle )
// 			console.error("can't decompose");
		
// //		var decomposition = Array( edges.length / edgesInCycle );
// //		for(var i = 0, il = decomposition.length; i < il; i++)
// //		{
// //			decomposition[i] = Array(edgesInCycle);
// //		}
		
// 		console.log(disjointSets)
		
// 		if(disjointSets.length === 3)
// 		{
// 			for(var i = 0; i < 3; i++)
// 			{
// 				if(disjointSets[i].length === 4 && disjointSets[(i+1)%3].length === 2 && disjointSets[(i+2)%3].length === 2 )
// 				{
// 					console.log("ok")
// 					var a = disjointSets[ i ];
// 					var b = disjointSets[(i+1)%3];
// 					var c = disjointSets[(i+2)%3];
					
// 					var raw = [ [b[0], a[0], c[1], a[2], c[0]], [b[1], a[0], c[0], a[3], c[1]], [c[1], a[1], b[1], a[2], b[0]], [c[0], a[1], b[0], a[3], b[1]] ];
// 					decomposition = Array(raw.length);
// 					for(var i = 0, il = raw.length; i < il; i++)
// 					{
// 						decomposition[i] = Array(5);
// 						for(var j = 0; j < 5; j++)
// 						{
// 							decomposition[i][j] = findEdge( raw[i][j], raw[i][(j+1)%5] );
// 						}
// 					}
// 					return;
// 				}
				
// //				if(disjointSets[i].length === 5 && disjointSets[(i+1)%3].length === 5 && disjointSets[(i+2)%3].length === 5 )
// //				{
// //					a0615 a1726 a2837 a3948 a4509 b5291 c5364 c6b70 b9c80 c3b47 b2c18
// //					return;
// //				}
// 			}
// 		}
		
// 		var decompositionSize = 2 + Math.round(Math.random() * 2.499);
// 		decomposition = Array( decompositionSize );
// 		for(var i = 0; i < decomposition.length; i++)
// 			decomposition[i] = [];
// 		console.log(decompositionSize)
// 		for(var i = 0; i < edges.length; i++)
// 		{
// 			var index = Math.round( i/edges.length * (decomposition.length-1))
// 			decomposition[index].push(edges[i]);
// 		}
// 	}
// 	findCycles(1);
	
	var decompose = false;
	var decomposedness = 1;
	document.addEventListener( 'keydown', function(event)
	{
		var spacebarKeyCode = 32;
		if( event.keyCode === spacebarKeyCode )
		{
			decompose = !decompose;
		}
	}, false );
	
	var graphGame = {};
	markedThingsToBeUpdated.push(graphGame)
	graphGame.update = function()
	{
		if(decompose)
		{
			decomposedness = decomposedness + (1-decomposedness)*0.1;
		}
		else
		{
			decomposedness = decomposedness + (0-decomposedness)*0.1;
		}
		
		// var highlightedNode = -1;
		for(var i = 0,il = nodes.length; i < il; i++)
		{
			nodes[i].update();
			
			// if(nodes[i].position.distanceTo( clientPosition ) < nodeRadius )
			// {
			// 	highlightedNode = i;
			// }
		}
		// for(var j = 0, jl = edges.length; j < jl; j++)
		// {
		// 	if(edges[j].startIndex === highlightedNode || edges[j].endIndex === highlightedNode )
		// 	{
		// 		edges[j].material.color.setRGB(1,0,0)
		// 	}
		// 	else
		// 	{
		// 		edges[j].material.color.setRGB(0,0,0)
		// 	}
		// }
		
		if(mouse.Clicking && !mouse.oldClicking )
		{
			// if(highlightedNode !== -1)
			// {
			// 	scene.remove( nodes[ highlightedNode ] );
			// 	disjointSets[ nodes[ highlightedNode ].disjointSet ].splice( disjointSets.indexOf( nodes[ highlightedNode ] ),1 );
				
			// 	if(disjointSets[nodes[ highlightedNode ].disjointSet].length === 0)
			// 		disjointSets.splice(nodes[ highlightedNode ].disjointSet, 1);
			// 	nodes.splice(highlightedNode, 1);
			// 	for(var i = 0; i < edges.length; i++)
			// 	{
			// 		if( edges[i].startIndex === highlightedNode || edges[i].endIndex === highlightedNode )
			// 		{
			// 			console.log("removing")
			// 			scene.remove( edges[ i ] );
			// 			edges.splice(i,1);
			// 			i--;
			// 		}
			// 		else
			// 		{
			// 			if( edges[i].startIndex > highlightedNode)
			// 				edges[i].startIndex--;
			// 			if( edges[i].endIndex > highlightedNode)
			// 				edges[i].endIndex--;
			// 		}
			// 	}
				
			// 	findCycles(1)
			// }
			// else
			// {
			// 	var closestNode = -1;
			// 	var closestDistance = smallSpringIdealLength;
			// 	for(var i = 0; i < nodes.length; i++)
			// 	{
			// 		if(nodes[i].position.distanceTo(clientPosition) < closestDistance)
			// 		{
			// 			closestDistance = nodes[i].position.distanceTo(clientPosition );
			// 			closestNode = i;
			// 		}
			// 	}
				
			// 	if(closestNode === -1)
			// 	{
			// 		console.log("adding set")
			// 		addDisjointSet();
			// 		disjointSets[ disjointSets.length-1 ].length = 1;
			// 	}
			// 	else
			// 	{
			// 		disjointSets[ nodes[ closestNode ].disjointSet ].length += 1; 
			// 	}
				
			// 	var nodeIndex = nodes.length;
			// 	MakeNode( true );
				
			// 	for(var i = 0; i < nodes.length; i++)
			// 	{
			// 		if( nodes[i].disjointSet === nodes[nodeIndex].disjointSet )
			// 			continue;
						
			// 		edges.push( PlaceableCylinder( i, nodeIndex ) );
			// 		scene.add( edges[ edges.length - 1 ] );
			// 	}
			// 	findCycles(1)
			// }
		}
		
		for(var i = 0, il = edges.length; i < il; i++ )
		{
			edges[i].place(edges[i].start,edges[i].end);
		}
		
		// for(var i = 0; i < decomposition.length; i++)
		// {
		// 	var cycleDirection = xUnit.clone().applyAxisAngle(zUnit, i / decomposition.length * TAU ).setLength(0.5);
		// 	for(var j = 0; j < decomposition[i].length; j++)
		// 	{
		// 		decomposition[i][j].position.addScaledVector(cycleDirection, decomposedness );
		// 	}
		// }
	}
}