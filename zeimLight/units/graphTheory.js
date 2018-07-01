'use strict';
/*
	TODO
		display method for partitioning

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

	Introducing n-cycles
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
	// var partitions = [];
	// function addDisjointSet()
	// {
	// 	var colorAsNumber = partitions.length+1;
	// 	partitions.push([]);
	// 	var min = 0.2;
	// 	partitions[partitions.length-1].color = new THREE.Color( min + (1-min) * Math.random(), min + (1-min) * Math.random(), min + (1-min) * Math.random() );
	// 	partitions[partitions.length-1].color.multiplyScalar(0.8)
	// 	partitions[partitions.length-1].position = new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,-10);
	// }
	// for(var i = 0; i < 3; i++)
	// {
	// 	addDisjointSet();
	// }
	// partitions[0].length = 2;
	// partitions[1].length = 2;
	// partitions[2].length = 3;

	var nodes = [];
	
	var nodeRadius = 0.01;
	var edgeRadius = nodeRadius * 0.1;
	var nodeGeometry = new THREE.EfficientSphereGeometry(nodeRadius);
	var smallSpringIdealLength = 0.2;
	var largeSpringIdealLength = smallSpringIdealLength * 1.2;
	var highlightedColor = new THREE.Color().setHex(0xFF0000)
	var unhighlightedColor = new THREE.Color().setHex(0xFFFFFF)

	function Node(putAtMousePosition)
	{
		var node = new THREE.Mesh(nodeGeometry, new THREE.MeshPhongMaterial({color:unhighlightedColor.clone()}));
		node.castShadow = true
		node.velocity = new THREE.Vector3();
		nodes.push(node);
		scene.add(node);

		node.adjacentNodes = [];
		
		// for(var i = 0; i < partitions.length; i++)
		// {
		// 	for(var j = 0; j < partitions[i].length; j++)
		// 	{
		// 		if( partitions[i][j] === undefined )
		// 		{
		// 			node.partition = i;
		// 			partitions[i][j] = node;
		// 			break;
		// 		}
		// 	}
		// 	if( node.partition !== -1 )
		// 	{
		// 		break;
		// 	}
		// }

		//do something with position and color, possibly involving the disjoint set's color, possibly taking account of putAtMousePosition
		node.position.set(Math.random()-0.5,Math.random()-0.5,0)

		node.update = function()
		{
			var acceleration = new THREE.Vector3()
			
			for(var i = 0; i < nodes.length; i++)
			{
				if(this === nodes[i])
				{
					continue;
				}
				
				var accelerationComponent = new THREE.Vector3().subVectors(nodes[i].position, this.position);
				
				if( this.partition !== undefined && nodes[i].partition === this.partition)
				{
					var magnitude = (smallSpringIdealLength - accelerationComponent.length()) * -0.03;
				}
				else
				{
					var magnitude = (largeSpringIdealLength - accelerationComponent.length()) * -0.06;
				}
				// magnitude = 0;
				
				accelerationComponent.setLength( magnitude );
				
				acceleration.add(accelerationComponent);
			}
			
			//attraction to center
			acceleration.add(this.position.clone().setComponent(2,0).multiplyScalar(-0.08))
			
			this.velocity.set(0,0,0); //severe damping - can remove for bounciness
			this.velocity.add(acceleration);
			this.position.add(this.velocity);
			this.position.z = 0;
		}
		
		return node;
	}
	
	var edgeGeometry = THREE.CylinderBufferGeometryUncentered(edgeRadius,1,15)
	function addNewEdge(startNode,endNode)
	{
		if( startNode.adjacentNodes.indexOf( endNode) !== -1 )
		{
			return;
		}

		startNode.adjacentNodes.push(endNode);
		endNode.adjacentNodes.push(startNode);

		var edge = new THREE.Mesh( edgeGeometry, new THREE.MeshPhongMaterial({color:0x000000, side:THREE.DoubleSide}));
		edge.castShadow = true;
		scene.add(edge)
		edge.startNode = startNode;
		edge.endNode = endNode;

		edge.place = function()
		{
			this.position.copy(startNode.position)
			pointCylinder(this, endNode.position)
		}
		edge.place();
		
		edges.push(edge)
	}

	var edges = [];
	var partitions = [];

	function makePartiteGraph(partitionLengths)
	{
		var partitionSpacing = TAU/partitionLengths.length;

		var extraAngleForAlignment = 0;
		for(var i = 0; i < partitionLengths.length; i++)
		{
			for(var j = i+1, jl = partitionLengths.length; j < jl; j++)
			{
				if(partitionLengths[i] === partitionLengths[j])
				{
					var angleBetweenEndOfIAndStartOfJ = partitionSpacing * (j-i-1)
					var partitionStartingAngleForJ = j*partitionSpacing;
					extraAngleForAlignment = angleBetweenEndOfIAndStartOfJ / 2 - partitionStartingAngleForJ;
					break;
				}
			}
			if(j !== jl)
			{
				break;
			}
		}

		for(var i = 0; i < partitionLengths.length; i++)
		{
			partitions[i] = Array(partitionLengths[i])
			var partitionStartingAngle = i*partitionSpacing + extraAngleForAlignment;

			for(var j = 0; j < partitions[i].length; j++)
			{
				partitions[i][j] = Node()
				partitions[i][j].partition = partitions[i]
				partitions[i][j].position.set(0,0.56,0).applyAxisAngle( zUnit, partitionStartingAngle + (j+0.5)/partitions[i].length*partitionSpacing )

				for(var k = 0; k < i; k++)
				{
					for(var l = 0, ll = partitions[k].length; l < ll; l++ )
					{
						addNewEdge( partitions[i][j], partitions[k][l] )
						//could keep track of these
						//you should store the index if you need to know wehre in the array something is
					}
				}
			}
		}
	}

	function makeRandomGraph(numNodes, maxEdges)
	{
		for(var i = 0; i < numNodes; i++)
		{
			Node();
		}
		for(var i = 0; i < maxEdges; i++)
		{
			var nodeA = nodes[clamp(Math.round(Math.random()*numNodes),0,numNodes-1)]
			var nodeB = nodes[clamp(Math.round(Math.random()*numNodes),0,numNodes-1)]

			for(var j = 0; j < edges.length; j++)
			{
				if( edges[j].startNode === nodeA && edges[j].endNode === nodeB &&
					edges[j].startNode === nodeB && edges[j].endNode === nodeA )
				{
					break;
				}
			}
			if(j === edges.length && nodeA !== nodeB)
			{
				addNewEdge( nodeA,nodeB )
			}
		}
	}
	// makeRandomGraph(14,20)

	function findNCyclesInKPartiteGraph(edgesInCycle)
	{
		console.log(partitions.length, edgesInCycle)
		if(partitions.length === 3 && edgesInCycle===5)
		{
			return findFiveCyclesInTripartiteGraph()
		}
		else
		{
			console.error("no.")
		}
	}
	function mirzakhaniConditions(r,s,t)
	{
		console.assert( r<=s && s<=t )
		return 	(
					(  r % 2  &&  s % 2  &&  t % 2 ) ||
					(!(r % 2) &&!(s % 2) &&!(t % 2))
				) &&
				r*s + s*t + t*r % 5 &&
				t <= 4 * r * s / (r+s)
	}
	function findFiveCyclesInTripartiteGraph()
	{
		var r = partitions[0].length, s = partitions[1].length, t = partitions[2].length;
		if( !mirzakhaniConditions(r,s,t) )
		{
			console.error("can't decompose")
		}

		var decomposition = [];

		if( r === 1 && s === 3 && t === 3 )
		{
			var indexPartitions = [[0],[1,2,3],[4,5,6]]
			for(var i = 0; i < 3; i++)
			{
				decomposition.push([0,indexPartitions[1][i],indexPartitions[2][i],indexPartitions[1][(i+1)%3],indexPartitions[2][(i+2)%3]])
			}
		}

		if( r===2 && s===2 && t===4 )
		{
			decomposition = [
				[0,2,4,1,5,],
				[0,3,5,2,6,],
				[0,4,3,1,7,],
				[1,2,7,3,6,]
			]
		}

		if( r === 3 && s === 5 && t === 5 )
		{
			var mToI = {
				a:0,
				b:1,
				c:2
			}
			for(var i = 0; i < 10; i++)
			{
				mToI[i.toString()] = i+3
			}
			var mirzakhaniString = "a0615 a1726 a2837 a3948 a4509 b5291 c5364 c6b70 b9c80 c3b47 b2c18"
			var mirzakhaniCycles = mirzakhaniString.split(" ")
			for(var i = 0; i < mirzakhaniCycles.length; i++)
			{
				var cycle = [];
				for(var j = 0; j < 5; j++)
				{
					cycle.push( mToI[ mirzakhaniCycles[i][j] ] )
				}
				decomposition.push( cycle )
			}		
		}

		if( r === 4 && s === 10 && t === 10 )
		{
			var mToI = {
				a:0,
				b:1,
				c:2,
				d:3
			}
			for(var i = 0; i < 20; i++)
			{
				mToI[i.toString()] = i+4
			}
			var mirzakhaniString = "a1¯12¯2 a2¯31¯4 a3¯14¯3 a4¯21¯5 a5¯26¯1 a6¯33¯6 a7¯76¯0 a8¯60¯8 b1¯62¯4 b2¯53¯7 b3¯40¯5 b4¯65¯3 b5¯56¯6 b6¯47¯8 b7¯29¯1 b8¯10¯2 c1¯70¯9 c¯01¯86 c3¯99¯3 c¯15¯79 c¯69¯54 c2¯78¯8 c5¯83¯2 d1¯94¯8 d3¯09¯4 d¯05¯96 d7¯04¯7 d2¯08¯3 d¯67¯58 d¯17¯30 d¯92¯89 d5¯48¯2 ¯0b9a0 ¯9b0c8 7c¯7a¯9 4d¯5c¯4"
			var mirzakhaniCycles = mirzakhaniString.split(" ")
			for(var i = 0; i < mirzakhaniCycles.length; i++)
			{
				var cycle = [];
				for(var j = 0; j < mirzakhaniCycles[i].length; j++)
				{
					if(mirzakhaniCycles[i][j] === "¯")
					{
						cycle.push( mToI[ (eval(mirzakhaniCycles[i][j+1]) + 10).toString() ] )
						j++
					}
					else
					{
						cycle.push( mToI[ mirzakhaniCycles[i][j] ] )
					}
				}
				decomposition.push( cycle )
			}	
		}

		//"integer multiples" thing?
		return decomposition;
	}

	// makePartiteGraph( [1,3,3] )
	makePartiteGraph( [2,2,4] )
	// makePartiteGraph( [3,5,5] )
	// makePartiteGraph( [4,10,10] )

	var decomposition = findFiveCyclesInTripartiteGraph()
	
	var decompose = false;
	var decomposedness = 0;

	buttonBindings["enter"] = function()
	{
		decompose = !decompose;
	}
	
	var graphGame = {}; //"update functions to be called"?
	objectsToBeUpdated.push(graphGame)
	graphGame.update = function()
	{
		var clientPosition = mouse.rayIntersectionWithZPlane(nodes[0].position.z)
		
		// if(mouse.Clicking && !mouse.oldClicking )
		// {
			// if( highlightedNode )
			// {
			// 	scene.remove( nodes[ highlightedNode ] );
			// 	partitions[ nodes[ highlightedNode ].partition ].splice( partitions.indexOf( nodes[ highlightedNode ] ),1 );
				
			// 	if(partitions[nodes[ highlightedNode ].partition].length === 0)
			// 		partitions.splice(nodes[ highlightedNode ].partition, 1);
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
			// 		partitions[ partitions.length-1 ].length = 1;
			// 	}
			// 	else
			// 	{
			// 		partitions[ nodes[ closestNode ].partition ].length += 1; 
			// 	}
				
			// 	var nodeIndex = nodes.length;
			// 	MakeNode( true );
				
			// 	for(var i = 0; i < nodes.length; i++)
			// 	{
			// 		if( nodes[i].partition === nodes[nodeIndex].partition )
			// 			continue;
						
			// 		edges.push( Edge( i, nodeIndex ) );
			// 		scene.add( edges[ edges.length - 1 ] );
			// 	}
			// 	findCycles(1)
			// }
		// }
		
		if(decompose)
		{
			decomposedness = decomposedness + (1-decomposedness)*0.1;
		}
		else
		{
			decomposedness = decomposedness + (0-decomposedness)*0.1;
		}

		var highlightedNode = null;
		for(var i = 0,il = nodes.length; i < il; i++)
		{
			nodes[i].update();
			
			if(nodes[i].position.distanceTo( clientPosition ) < nodeRadius )
			{
				highlightedNode = nodes[i];
				nodes[i].material.color.copy(highlightedColor)
			}
			else
			{
				if(nodes[i].material.color.equals(highlightedColor) )
				{
					nodes[i].material.color.copy(unhighlightedColor)
				}
			}
		}
		for(var i = 0, il = edges.length; i < il; i++)
		{
			if(edges[i].startNode === highlightedNode || edges[i].endNode === highlightedNode )
			{
				edges[i].material.color.copy(highlightedColor)
			}
			else
			{
				edges[i].material.color.set(0,0,0)
			}
		}

		for(var i = 0, il = edges.length; i < il; i++ )
		{
			edges[i].place();
		}

		//ought to be in node.update?
		var edgeInQuestion = 0;
		var dist = ( STARTING_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0 - largeSpringIdealLength * 0.6 ) * decomposedness
		for(var i = 0; i < decomposition.length; i++)
		{
			var displacement = new THREE.Vector3(dist,0,0).applyAxisAngle(zUnit, i / decomposition.length * TAU );
			for(var j = 0; j < decomposition[i].length; j++)
			{
				for(var k = 0, kl = edges.length; k < kl; k++)
				{
					if( edges[k].startNode === nodes[decomposition[i][j]] && edges[k].endNode === nodes[decomposition[i][(j+1)%5]] ||
						edges[k].endNode === nodes[decomposition[i][j]] && edges[k].startNode === nodes[decomposition[i][(j+1)%5]] )
					{
						edges[k].position.add( displacement );
						break;
					}
				}
			}
		}
	}
}