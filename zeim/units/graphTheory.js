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
	
	var nodeRadius = 0.024;
	var edgeRadius = nodeRadius * 0.1;
	var nodeGeometry = new THREE.EfficientSphereGeometry(nodeRadius);
	var smallSpringIdealLength = 0.6;
	var largeSpringIdealLength = smallSpringIdealLength * 1.2;
	var highlightedColor = new THREE.Color().setHex(0xFF0000)
	var unhighlightedColor = new THREE.Color().setHex(0xFFFFFF)
	var z = -10;

	function Node(putAtMousePosition)
	{
		var node = new THREE.Mesh(nodeGeometry, new THREE.MeshPhongMaterial({color:unhighlightedColor.clone()}));
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
		node.position.set(Math.random()-0.5,Math.random()-0.5,z)

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
			this.position.z = z;
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
		for(var i = 0; i < partitionLengths.length; i++)
		{
			partitions[i] = Array(partitionLengths[i])
			var partitionAngle = i*TAU/partitionLengths.length;

			for(var j = 0; j < partitions[i].length; j++)
			{
				partitions[i][j] = Node()
				partitions[i][j].partition = partitions[i]
				partitions[i][j].position.set(0,0.56,z).applyAxisAngle( zUnit, partitionAngle + j*TAU/partitionLengths.length/partitions[i].length/2 )

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
	
	//formerly we had "findEdge"

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

		var fiveCycles = [];
		function pathIteration(cycleNodes)
		{
			var currentNode = cycleNodes[cycleNodes.length-1];

			if(cycleNodes.length === 5)
			{
				if( currentNode.adjacentNodes.indexOf(cycleNodes[0]) !== -1 )
				{
					var duplicateFound = false;
					for(var i = 0, il = fiveCycles.length; i < il; i++)
					{
						var fiveCycleToCompare = fiveCycles[i];
						for(var cyclicOffset = 1; cyclicOffset < 5; cyclicOffset++)
						{
							duplicateFound = true;
							for(var k = 0; k < 5; k++)
							{
								if( cycleNodes[k] !== fiveCycleToCompare[(k+cyclicOffset)%5] )
								{
									duplicateFound = false;
									break;
									//reverse order is theoretically possible, but appears not to be a problem!
								}
							}
							if(duplicateFound)
							{
								break;
							}
						}
						if(duplicateFound)
						{
							break;
						}
					}
					if(!duplicateFound)
					{
						// console.log(cycleNodes.map(function(n){return nodes.indexOf(n)}))
						fiveCycles.push(cycleNodes)
					}
				}
				return;
			}
			else
			{
				for(var i = 0; i < currentNode.adjacentNodes.length; i++)
				{
					var possibleNextNode = currentNode.adjacentNodes[i];

					if( cycleNodes.indexOf(possibleNextNode) === -1 )
					{
						var newCycleNodes = cycleNodes.slice();
						newCycleNodes.push(possibleNextNode)
						pathIteration(newCycleNodes)
					}
				}
			}
		}
		for(var i = 0, il = nodes.length; i < il; i++ )
		{
			//we might have already checked for every cycle that could contain this node?
			pathIteration([nodes[i]])
		}

		var numCyclesInDecomposition = edges.length / 5;
		console.log(numCyclesInDecomposition)
		var len = fiveCycles.length;
		console.log(fiveCycles.length)
		for(var i = 0; i < len; i++)
		{
			var numExcluded = 0;
			fiveCycles[i].skipList = Array(len);
			for(var j = 0; j < len; j++)
			{
				fiveCycles[i].skipList[j] = false;
				for(var k = 0; k < 5; k++)
				{
					for(var l = 0; l < 5; l++)
					{
						if( fiveCycles[i][k] === fiveCycles[j][l] &&
						  (	fiveCycles[i][(k+1)%5] === fiveCycles[j][(l+1)%5] ||
							fiveCycles[i][(k+1)%5] === fiveCycles[j][(l+4)%5] )
						)
						{
							fiveCycles[i].skipList[j] = true;
							numExcluded++;
							break;
						}
					}
					if(l!==5)
					{
						break;
					}
				}
			}
		}
		console.log(numExcluded/len)

		function decompositionSearchIteration( decomposition, skipList, indexToStartAt )
		{
			for(var i = indexToStartAt; i < len; i++)
			{
				if( skipList[i] )
				{
					continue;
				}

				var possibleNewFiveCycle = fiveCycles[i];

				var newDecomposition = decomposition.slice();
				newDecomposition.push(possibleNewFiveCycle)
				
				if( newDecomposition.length === numCyclesInDecomposition)
				{
					return newDecomposition;
				}
				else
				{
					var newSkiplist = Array(len)
					for(var j = 0; j < len; j++)
					{
						newSkiplist[j] = skipList[j] || possibleNewFiveCycle.skipList[j]
					}

					var finalDecomposition = decompositionSearchIteration( newDecomposition, newSkiplist, i+1 )
					if(finalDecomposition !== undefined)
					{
						return finalDecomposition
					}
				}
			}
		}
		var startSkipList = Array(len);
		for(var i = 0; i < len; i++)
		{
			startSkipList[i] = false;
		}
		// return decompositionSearchIteration([],startSkipList,0)
	}
	// makePartiteGraph( [2,2,4] )
	makePartiteGraph( [3,5,5] )
	// makePartiteGraph( [5,5,5] )
	var decomposition = findFiveCyclesInTripartiteGraph()
	
	var decompose = false;
	var decomposedness = 1;
	document.addEventListener( 'keydown', function(event)
	{
		var enterKeyCode = 13;
		if( event.keyCode === enterKeyCode )
		{
			decompose = !decompose;
		}
	}, false );
	
	var graphGame = {}; //"update functions to be called"?
	markedThingsToBeUpdated.push(graphGame)
	graphGame.update = function()
	{
		var clientPosition = mouse.rayIntersectionWithZPlaneInCameraSpace(nodes[0].position.z)
		
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

		//ought to be in node.update?
		// for(var i = 0; i < decomposition.length; i++)
		// {
		// 	var cycleDirection = xUnit.clone().applyAxisAngle(zUnit, i / decomposition.length * TAU ).setLength(0.5);
		// 	for(var j = 0; j < decomposition[i].length; j++)
		// 	{
		// 		decomposition[i][j].position.addScaledVector( cycleDirection, decomposedness * 0.1 );
		// 	}
		// }

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
	}
}

/**
 * This bit: Copyright 2012 Akseli Palén.
 * Created 2012-07-15.
 * Licensed under the MIT license.
**/
function kCombinations(set, k)
{
	var i, j, combs, head, tailcombs;
	
	// There is no way to take e.g. sets of 5 elements from
	// a set of 4.
	if (k > set.length || k <= 0)
	{
		return [];
	}
	
	// K-sized set has only one K-sized subset.
	if (k == set.length)
	{
		return [set];
	}
	
	// There is N 1-sized subsets in a N-sized set.
	if (k == 1)
	{
		combs = [];
		for (i = 0; i < set.length; i++) {
			combs.push([set[i]]);
		}
		return combs;
	}
	
	// Assert {1 < k < set.length}
	
	// Algorithm description:
	// To get k-combinations of a set, we want to join each element
	// with all (k-1)-combinations of the other elements. The set of
	// these k-sized sets would be the desired result. However, as we
	// represent sets with lists, we need to take duplicates into
	// account. To avoid producing duplicates and also unnecessary
	// computing, we use the following approach: each element i
	// divides the list into three: the preceding elements, the
	// current element i, and the subsequent elements. For the first
	// element, the list of preceding elements is empty. For element i,
	// we compute the (k-1)-computations of the subsequent elements,
	// join each with the element i, and store the joined to the set of
	// computed k-combinations. We do not need to take the preceding
	// elements into account, because they have already been the i:th
	// element so they are already computed and stored. When the length
	// of the subsequent list drops below (k-1), we cannot find any
	// (k-1)-combs, hence the upper limit for the iteration:
	combs = [];
	for (i = 0; i < set.length - k + 1; i++)
	{
		// head is a list that includes only our current element.
		head = set.slice(i, i + 1);
		// We take smaller combinations from the subsequent elements
		tailcombs = kCombinations(set.slice(i + 1), k - 1);
		// For each (k-1)-combination we join it with the current
		// and store it to the set of k-combinations.
		for (j = 0; j < tailcombs.length; j++)
		{
			combs.push(head.concat(tailcombs[j]));
		}
	}
	return combs;
}