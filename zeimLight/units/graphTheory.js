'use strict';
/*
	Introducing complete n-partite graphs
		Show a bunch of examples
		Show a crazy one and say "try to guess the n-partition of this graph"
			An easyish one would be such that you could easily count the degrees of nodes
			Or one where you could see which ones were not connected to each other
			Let people move them around

	Introducing n-cycles
		Show a bunch of examples
		Can click a series of edges to find an n-cycle
		Could make some difficult puzzles
		Want to be able to color a decomposition

	3D graph of tripartite, er, graphs
		Visualize her conditions
			every node must have an even number of edges = all even or all odd
			the total number of edges must be divisible by 5 =  5 | rs + rt + st
			each 5-cycle uses at least one edge and at most three edges from between any two parts of K = t <= 4rs/(r+s)
		Mirzakhani and her collaborator conjectured that these conditions were sufficient
			But in spite of a lot of effort, nobody has proven this yet!
			You could be the one to prove it!
			All you have to do is either find a single point in this set that doesn't have a decomposition, or show that there aren't any

		Puzzle: give a graph that can be made 5-decomposable by the addition or subtraction of a single point

		Hover over one and the displayed graph becomes that
		Color it in such that x y and z are clockwise
*/

var shouldBeDecomposed = false;
var Graph = null;
var RandomGraph = null;
var PartiteGraph = null;

var mirzakhaniConditions;

var graphs = [];

//move to mirzakhani.js
function initMirzakhaniGraphTheory()
{
	var conditionsVisualization = initConditionsVisualization()
	conditionsVisualization.position.x = -0.5

	initGraphTheory()

	bindButton("n",function()
	{
		var graph = Graph();
		graph.position.copy(mouse.rayIntersectionWithZPlane(0))
		graph.addNewNode(true)
		scene.add(graph)
	}, "Makes new graph")

	bindButton("enter", function()
	{
		shouldBeDecomposed = !shouldBeDecomposed;
	}, "Decomposes and un-decomposes graph")

	bindButton("r", function()
	{
		var numNodes = Math.ceil(Math.random()*15)
		var graph = RandomGraph(numNodes,Math.floor(Math.random()*numNodes)+2);
		graph.position.copy(mouse.rayIntersectionWithZPlane(0))
		scene.add(graph)
	}, "Decomposes and un-decomposes graph")

	bindButton("c", function()
	{
		var clientPosition = mouse.rayIntersectionWithZPlane(0)
		var closestGraph = null
		var closestDist = Infinity;
		for(var i = 0; i < graphs.length; i++)
		{
			if(graphs[i].position.distanceTo(clientPosition) < closestDist)
			{
				closestGraph = graphs[i]
				closestDist = graphs[i].position.distanceTo(clientPosition)
			}
		}
		if(closestGraph!== null)
		{
			closestGraph.complete()
		}
	}, "complete graphc")

	var mirzakhaniExamples = [
		[1,3,3],
		[2,2,4],
		[3,5,5],
		[4,10,10],
	]
	for(var i = 0; i < mirzakhaniExamples.length; i++)
	{
		var graph = PartiteGraph( mirzakhaniExamples[i] );
		toysToBeArranged.push(graph)
	}
	// graphs[0].position.x = 0.5
	// var otherGraph = PartiteGraph( [3,5,5] );
	// var otherGraph = PartiteGraph( [4,10,10] );

	//could click on a graph's edges and drag them apart?
	//want
}

function initConditionsVisualization()
{
	function evenCondition(i,j,k)
	{
		var allEven = ( i%2 === 0 && j%2 === 0 && k%2 === 0 );
		var allOdd  = ( i%2 === 1 && j%2 === 1 && k%2 === 1 );
		return allEven || allOdd;
	}
	function divisibilityCondition(i,j,k)
	{
		var interestingSum = i*j + j*k + k*i;
		return interestingSum % 5 === 0;
	}
	function weirdCondition(i,j,k)
	{
		var array = [i,j,k].sort();
		var r = array[0], s = array[1], t = array[2];
		return t <= 4*r*s/(r+s);
	}
	mirzakhaniConditions = function(i,j,k)
	{
		return evenCondition(i,j,k) && weirdCondition(i,j,k) && divisibilityCondition(i,j,k);
	}

	var gridDimension = 12;
	var conditionsVisualization = new THREE.Mesh(
		new THREE.BoxGeometry(gridDimension,gridDimension,gridDimension), 
		new THREE.MeshBasicMaterial({visible:false})
	);
	conditionsVisualization.scale.setScalar(0.5 * 1/gridDimension)
	conditionsVisualization.rotation.y += TAU / 4

	objectsToBeUpdated.push(conditionsVisualization)
	toysToBeArranged.push(conditionsVisualization)
	conditionsVisualization.update = function()
	{
		if( mouse.clicking && mouse.lastClickedObject === null )
		{
			mouse.rotateObjectByGesture(this)
		}
	}

	var pointGeometry = efficientSphereGeometryWithRadiusOne;
	var points = new THREE.Group()
	conditionsVisualization.add(points)
	points.position.setScalar(-(gridDimension-1) / 2)

	function Point(i,j,k)
	{
		var point = new THREE.Mesh(pointGeometry, new THREE.MeshPhongMaterial({color:0x444444}))
		point.position.set(i,j,k);
		point.scale.setScalar(0.33)
		points.add(point)

		point.add( new THREE.Mesh(pointGeometry, new THREE.MeshBasicMaterial({color:0x000000, side:THREE.BackSide}) ) )
		point.children[0].scale.multiplyScalar(1.35)
		point.children[0].castShadow = true

		clickables.push(point)
		point.onClick = function()
		{
			var graph = PartiteGraph( this.position.toArray() );
			scene.add(graph)
			graph.position.x = 0.5
		}
	}

	for(var i = 1; i < gridDimension; i++){
	for(var j = 1; j < gridDimension; j++){
	for(var k = 1; k < gridDimension; k++){
		Point(i,j,k)
	}
	}
	}

	function toggleCondition(conditionFunction,col)
	{
		for(var i = 0, il = points.children.length; i < il; i++)
		{
			if(conditionFunction(points.children[i].position.x,points.children[i].position.y,points.children[i].position.z))
			{
				points.children[i].material.color[col] = 1-points.children[i].material.color[col]
			}
		}
	}

	bindButton("1",
		function()
		{
			toggleCondition(evenCondition,"r")
		},
		"toggle visual of even condition"
	);
	bindButton("2",
		function()
		{
			toggleCondition(divisibilityCondition,"g")
		},
		"toggle visual of divisibility condition"
	);
	bindButton("3",
		function()
		{
			toggleCondition(weirdCondition,"b")
		},
		"toggle visual of weird condition"
	);
	bindButton("4",
		function()
		{
			for( var i = 0, il = points.children.length; i < il; i++ )
			{
				if( !mirzakhaniConditions(points.children[i].position.x,points.children[i].position.y,points.children[i].position.z) )
				{
					points.children[i].visible = !points.children[i].visible;
				}
			}
		},
		"toggle visual of non mirzakhani points"
	);

	//probably you want inflation AND color change
	return conditionsVisualization
}

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

var nodeRadius = 0.02;
var edgeRadius = nodeRadius * 0.25;
var nodeGeometry = new THREE.EfficientSphereGeometry(nodeRadius);
var edgeGeometry = THREE.CylinderBufferGeometryUncentered(edgeRadius,1,15)
var smallSpringIdealLength = 0.2;
var largeSpringIdealLength = smallSpringIdealLength * 1.2;
var highlightedColor = new THREE.Color().setHex(0xFF0000)
var unhighlightedColor = new THREE.Color().setHex(0xFFFFFF)

var edgeBeingModified = new THREE.Mesh( edgeGeometry, new THREE.MeshPhongMaterial({color:0x000000, side:THREE.DoubleSide}));

edgeBeingModified.castShadow = true;
edgeBeingModified.startNode = null;
objectsToBeUpdated.push(edgeBeingModified)
edgeBeingModified.update = function()
{
	if(this.parent !== null)
	{
		this.position.copy(this.startNode.position)
		var localClientPosition = mouse.rayIntersectionWithZPlane(0)
		this.parent.worldToLocal(localClientPosition)
		pointCylinder(this, localClientPosition)

		if( !mouse.clicking )
		{
			if( this.parent.highlightedNode !== null )
			{
				this.parent.addNewEdge(this.startNode,this.parent.highlightedNode)
			}
			this.parent.remove(this)
		}
	}
}

Graph = function()
{
	var graph = new THREE.Mesh(new THREE.CircleBufferGeometry(1/7,4), new THREE.MeshBasicMaterial({transparent:true,opacity:0.0001}));
	graphs.push(graph)
	toysToBeArranged.push(graph)
	var nodes = [];
	var edges = [];
	graph.nodes = nodes
	graph.edges = edges
	graph.cycles = [];

	var decomposedness = 0;

	graph.highlightedNode = null;
	graph.highlightedEdge = null;

	clickables.push(graph)
	graph.onClick = function()
	{
		if(this.highlightedEdge === null)
		{
			this.addNewNode(true)
		}
	}

	objectsToBeUpdated.push(graph)
	graph.update = function()
	{
		var clientPosition = mouse.rayIntersectionWithZPlane(nodes[0].position.z)
		this.worldToLocal(clientPosition)
		
		graph.highlightedNode = null;
		graph.highlightedEdge = null;
		for(var i = 0,il = nodes.length; i < il; i++)
		{
			nodes[i].update();
			if(nodes[i].material.color.equals(highlightedColor) )
			{
				nodes[i].material.color.copy(unhighlightedColor)
			}
		}
		var intersections = mouse.rayCaster.intersectObjects( nodes );
		if(intersections.length !==0)
		{
			graph.highlightedNode = intersections[0].object
			graph.highlightedNode.material.color.copy(highlightedColor)
		}
		
		for(var i = 0, il = edges.length; i < il; i++)
		{
			edges[i].place();
			
			if( edges[i].startNode === graph.highlightedNode || 
				edges[i].endNode === graph.highlightedNode )
			{
				edges[i].material.color.r = 0
			}
			else
			{
				edges[i].material.color.r = 0;
			}
		}

		if(intersections.length === 0)
		{
			intersections = mouse.rayCaster.intersectObjects( edges );
			if(intersections.length !==0)
			{
				graph.highlightedEdge = intersections[0].object;
				graph.highlightedEdge.material.color.r = 1;

				if(mouse.clicking && !mouse.oldClicking)
				{
					graph.highlightedEdge.material.color.b = 1;
				}
			}
		}

		if(this.cycles.length !== 0)
		{
			if(shouldBeDecomposed)
			{
				decomposedness = decomposedness + (1-decomposedness)*0.1;
			}
			else
			{
				decomposedness = decomposedness + (0-decomposedness)*0.1;
			}

			//ought to be in node.update?
			var edgeInQuestion = 0;
			var dist = ( AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0 - largeSpringIdealLength * 0.6 ) * decomposedness
			var decomposition = this.cycles
			for(var i = 0; i < decomposition.length; i++)
			{
				var cycle = decomposition[i]
				var displacement = new THREE.Vector3(dist,0,0).applyAxisAngle(zUnit, i / decomposition.length * TAU );
				for(var j = 0; j < cycle.length; j++)
				{
					for(var k = 0, kl = edges.length; k < kl; k++)
					{
						if( (edges[k].startNode === nodes[cycle[j]] && edges[k].endNode === nodes[cycle[(j+1)%5]]) ||
							(edges[k].endNode === nodes[cycle[j]] && edges[k].startNode === nodes[cycle[(j+1)%5]]) )
						{
							edges[k].position.add( displacement );
							break;
						}
					}
				}
			}
		}
	}

	graph.addNewEdge = function(startNode,endNode)
	{
		if( startNode.adjacentNodes.indexOf( endNode) !== -1 )
		{
			return;
		}

		startNode.adjacentNodes.push(endNode);
		endNode.adjacentNodes.push(startNode);

		var edge = new THREE.Mesh( edgeGeometry, new THREE.MeshPhongMaterial({color:0x000000, side:THREE.DoubleSide}));
		edge.castShadow = true;
		graph.add(edge)
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

	graph.complete = function()
	{
		for(var i = 0; i < nodes.length; i++)
		{
			for(var j = i+1; j < nodes.length; j++)
			{
				if(nodes[i].adjacentNodes.indexOf(nodes[j] === -1))
				{
					graph.addNewEdge(nodes[i],nodes[j])
				}
			}
		}
	}

	graph.addNewNode = function( putAtMousePosition )
	{
		var node = new THREE.Mesh(nodeGeometry, new THREE.MeshPhongMaterial({color:unhighlightedColor.clone()}));
		node.castShadow = true
		node.velocity = new THREE.Vector3();
		node.adjacentNodes = [];

		nodes.push(node);
		graph.add(node);

		clickables.push(node)
		node.onClick = function()
		{
			graph.add(edgeBeingModified)
			edgeBeingModified.startNode = this
		}

		//do something with position and color, possibly involving the disjoint set's color, possibly taking account of putAtMousePosition
		if(putAtMousePosition)
		{
			var localClientPosition = mouse.rayIntersectionWithZPlane(0)
			graph.updateMatrixWorld()
			graph.worldToLocal(localClientPosition)
			node.position.copy( localClientPosition )
		}
		else
		{
			node.position.set(Math.random()-0.5,Math.random()-0.5,0)
		}

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

	return graph
}

function pointCylinder(cylinderMesh, end)
{
	var startToEnd = end.clone().sub(cylinderMesh.position);
	cylinderMesh.scale.set(1,startToEnd.length(),1);
	cylinderMesh.quaternion.setFromUnitVectors(yUnit,startToEnd.normalize());
	cylinderMesh.quaternion.normalize();
}

RandomGraph = function(numNodes, maxEdges)
{
	var randomGraph = Graph();
	var edges = randomGraph.edges
	for(var i = 0; i < numNodes; i++)
	{
		randomGraph.addNewNode()
	}
	for(var i = 0; i < maxEdges; i++)
	{
		var nodeA = randomGraph.nodes[clamp(Math.round(Math.random()*numNodes),0,numNodes-1)]
		var nodeB = randomGraph.nodes[clamp(Math.round(Math.random()*numNodes),0,numNodes-1)]

		for(var j = 0, jl = edges.length; j < jl; j++)
		{
			if( edges[j].startNode === nodeA && edges[j].endNode === nodeB &&
				edges[j].startNode === nodeB && edges[j].endNode === nodeA )
			{
				break;
			}
		}
		if( j === edges.length && nodeA !== nodeB )
		{
			randomGraph.addNewEdge( nodeA,nodeB )
		}
	}

	return randomGraph;
}

PartiteGraph = function(partitionSizes)
{
	var graph = Graph();
	var partitions = []
	graph.partitions = partitions;

	var partitionSpacing = TAU/partitionSizes.length;
	var extraAngleForAlignment = 0;
	for(var i = 0; i < partitionSizes.length; i++)
	{
		for(var j = i+1, jl = partitionSizes.length; j < jl; j++)
		{
			if(partitionSizes[i] === partitionSizes[j])
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

	for(var i = 0; i < partitionSizes.length; i++)
	{
		partitions[i] = Array(partitionSizes[i])
		var partitionStartingAngle = i*partitionSpacing + extraAngleForAlignment;

		for(var j = 0; j < partitions[i].length; j++)
		{
			partitions[i][j] = graph.addNewNode()

			partitions[i][j].partition = partitions[i]
			partitions[i][j].position.set(0,0.56,0).applyAxisAngle( zUnit, partitionStartingAngle + (j+0.5)/partitions[i].length*partitionSpacing )

			for(var k = 0; k < i; k++)
			{
				for(var l = 0, ll = partitions[k].length; l < ll; l++ )
				{
					graph.addNewEdge( partitions[i][j], partitions[k][l] )
					//could keep track of these
					//you should store the index if you need to know wehre in the array something is
				}
			}
		}
	}

	graph.cycles = findNCyclesInKPartiteGraph(partitions, 5)

	return graph
}

// var warningSign = makeTextSign( "COULDN'T DECOMPOSE", false, false, false)
// warningSign.position.y = 0.5
// warningSign.material.opacity = 0
// warningSign.scale.multiplyScalar(0.094)
// scene.add(warningSign)
// warningSign.material.transparent = true
// warningSign.update = function()
// {
// 	this.material.opacity -= 0.08
// 	this.material.opacity = clamp(this.material.opacity,0,1)
// }
// objectsToBeUpdated.push(warningSign)

function findNCyclesInKPartiteGraph(partitions,edgesInCycle)
{
	if(partitions.length === 3 && edgesInCycle===5)
	{
		return findFiveCyclesInTripartiteGraph(partitions)
	}
	else
	{
		// warningSign.material.opacity = 1
	}
}
function findFiveCyclesInTripartiteGraph(partitions)
{
	var r = partitions[0].length, s = partitions[1].length, t = partitions[2].length;
	if( !mirzakhaniConditions(r,s,t) )
	{
		// warningSign.material.opacity = 1
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
	// if(decomposition.length === 0)
	// {
	// 	warningSign.material.opacity = 1
	// }

	return decomposition;
}
}