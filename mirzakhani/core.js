function init()
{
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor( 0xFFFFFF );	
	document.getElementById("canvas").appendChild( renderer.domElement );
	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 1,1,1, 100); //both first arguments are irrelevant
	camera.position.z = 50;
	
	var respondToResize = function() 
	{
		renderer.setSize( document.documentElement.clientWidth,window.innerHeight ); //different because we do expect a scrollbar. Bullshit that you can't use both in the same way but whatever
		camera.aspect = renderer.domElement.width / renderer.domElement.height;
		
		var minimumCenterToFrameVertical = 0.5;
		var minimumCenterToFrameHorizontal = 0.5;
		
		if( camera.aspect >= 1 )
		{
			camera.fov = 2 * Math.atan( minimumCenterToFrameVertical / camera.position.z ) * 360 / TAU;
		}
		else
		{
			var horizontalFov = 2 * Math.atan( minimumCenterToFrameHorizontal / camera.position.z ) * 360 / TAU;
			camera.fov = horizontalFov / camera.aspect;
		}
		
		camera.updateProjectionMatrix();
		
		var sideToCenter = renderer.domElement.width / 2;
		var topToCenter = renderer.domElement.height / 2;
		renderer.domElement.style.margin = "-" + topToCenter.toString() + "px 0 0 -" + sideToCenter.toString() + "px";
		
		{
			var extras = document.getElementById("extras");
			var halfExtrasWidth = extras.offsetWidth / 2;
			extras.style.margin = "0 0 0 -" + halfExtrasWidth.toString() + "px";
		}
	}
	respondToResize();
	window.addEventListener( 'resize', respondToResize, false );
	
	var lights = Array(2);
	lights[0] = new THREE.AmbientLight( 0xffffff, 0.82 );
	lights[1] = new THREE.PointLight( 0xffffff, 0.5 );
	lights[1].position.set(1,0.5,1);
	lights[1].position.setLength( 100 );
	scene.add(lights[0]);
	scene.add(lights[1]);
	
	//---------SOUND
	Sounds = {};
	var soundInfoArray = [
		"change0",
		"change1",
		"grab",
		"release",
		"pop1",
		"pop2",
		"pop3"
	];
	for(var i = 0; i < soundInfoArray.length; i++)
		Sounds[soundInfoArray[i]] = new Audio( "data/" + soundInfoArray[i] + ".mp3" );
	
	var asynchronousInput = initInputSystem();
	
//	var octagonScene = initOctagonScene();
//	octagonScene.setUpScene();
	
	var disjointSets = [];
	function addDisjointSet()
	{
		var colorAsNumber = disjointSets.length+1;
		disjointSets.push([]);
		var min = 0.2;
		disjointSets[disjointSets.length-1].color = new THREE.Color( min + (1-min) * Math.random(), min + (1-min) * Math.random(), min + (1-min) * Math.random(), );
		disjointSets[disjointSets.length-1].color.multiplyScalar(0.8)
		disjointSets[disjointSets.length-1].position = new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,0);
	}
	for(var i = 0; i < 3; i++)
	{
		addDisjointSet();
	}
	disjointSets[0].length = 2;
	disjointSets[1].length = 2;
	disjointSets[2].length = 3;
	var nodes = [];
	
	var edgeRadius = 0.002;
	var nodeRadius = edgeRadius * 12;
	var nodeGeometry = new THREE.EfficientSphereGeometry(nodeRadius);
	var smallSpringIdealLength = edgeRadius * 80;
	var largeSpringIdealLength = smallSpringIdealLength * 6;
	
	function updateNode()
	{
		var acceleration = new THREE.Vector3()
		
		for(var i = 0; i < nodes.length; i++)
		{
			if(this === nodes[i])
				continue;
			
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
		
		acceleration.add(this.position.clone().multiplyScalar(-0.08))
		
		this.velocity.set(0,0,0); //can remove this severe damping for bounciness
		this.velocity.add(acceleration);
		this.position.add(this.velocity);
	}
	
	function makeNode(copyMouse)
	{
		var nodeIndex = nodes.length;
		nodes[nodeIndex] = new THREE.Mesh(nodeGeometry, new THREE.MeshPhongMaterial());
		nodes[nodeIndex].velocity = new THREE.Vector3();
		nodes[nodeIndex].update = updateNode;
		scene.add(nodes[nodeIndex]);
		
		nodes[nodeIndex].disjointSet = -1;
		
		for(var i = 0; i < disjointSets.length; i++)
		{
			for(var j = 0; j < disjointSets[i].length; j++)
			{
				if( disjointSets[i][j] === undefined )
				{
					nodes[nodeIndex].disjointSet = i;
					disjointSets[i][j] = nodes[nodeIndex];
					break;
				}
			}
			if( nodes[nodeIndex].disjointSet !== -1 )
				break;
		}
		
//		if( nodes[nodeIndex].disjointSet === -1 )
//			console.log(disjointSets)
		if( !copyMouse )
			nodes[nodeIndex].position.copy( disjointSets[nodes[nodeIndex].disjointSet].position );
		else
			nodes[nodeIndex].position.copy( clientPosition );
		
		nodes[nodeIndex].material.color.copy( disjointSets[nodes[nodeIndex].disjointSet].color );
//		nodes[nodeIndex].material.color.multiplyScalar( 0.2 + Math.random() * 0.6);
		
		return nodes[nodeIndex];
	}
	
	for(var i = 0,il = disjointSets[0].length+disjointSets[1].length+disjointSets[2].length; i < il; i++)
	{
		makeNode(false);
	}
	
	var ourCylinderGeometry = new THREE.CylinderBufferGeometry( 1,1,1,15,1, true);
	for(var i = 0, il = ourCylinderGeometry.attributes.position.array.length / 3; i < il; i++)
	{
		ourCylinderGeometry.attributes.position.array[i*3+1] += 0.5;
	}
	
	var placeCylinder = function()
	{
		this.scale.set(edgeRadius,this.end.distanceTo(this.start),edgeRadius);
		this.position.copy(this.start);
		this.quaternion.setFromUnitVectors(yAxis,this.end.clone().sub(this.start).normalize());
	}
	function makePlaceableCylinder(startIndex,endIndex)
	{
		var ourPlaceableCylinder = new THREE.Mesh( ourCylinderGeometry, new THREE.MeshPhongMaterial({color:0x000000, side:THREE.DoubleSide}));
		ourPlaceableCylinder.place = placeCylinder;
		
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
			if( nodes[i].disjointSet === nodes[j].disjointSet )
				continue;
				
			edges.push( makePlaceableCylinder( i, j ) );
			scene.add( edges[edges.length-1] );
		}
	}
	
/*
 * 2,2,4
 * 
 * 
 * 3,5,5 is also possible
 * 
 * 5,5,5
 * 
 * [a2, b5, c1, b1, c5], [b2, c5, a1, c1, a5], [c2, a5, b1, a1, b5]
 * 
 * 
 * decompose into all cycles
forget those not of length 5
Try all combinations of them

Can be ruled out if there's an odd number of edges
	Or #edges is not a multiple of 5

for each edge, do a search
 */	
	
	var decomposition;
	var decompositionDisplayState = 1;
	function findEdge(startNode,endNode)
	{
		var edgeIndex = -1;
		for(var i = 0, il = edges.length; i < il; i++)
		{
			if( ( nodes[edges[i].startIndex] === startNode && nodes[edges[i].endIndex] === endNode ) ||
				( nodes[edges[i].startIndex] === endNode && nodes[edges[i].endIndex] === startNode ) )
			{
				return edges[i];
			}
		}
		console.error("no such edge found ", startNode.disjointSet,endNode.disjointSet, edges)
		return 0;
	}
	function findCycles(edgesInCycle)
	{
		if( edges.length % edgesInCycle )
			console.error("can't decompose");
		
//		var decomposition = Array( edges.length / edgesInCycle );
//		for(var i = 0, il = decomposition.length; i < il; i++)
//		{
//			decomposition[i] = Array(edgesInCycle);
//		}
		
		console.log(disjointSets)
		
		if(disjointSets.length === 3)
		{
			for(var i = 0; i < 3; i++)
			{
				if(disjointSets[i].length === 4 && disjointSets[(i+1)%3].length === 2 && disjointSets[(i+2)%3].length === 2 )
				{
					console.log("ok")
					var a = disjointSets[ i ];
					var b = disjointSets[(i+1)%3];
					var c = disjointSets[(i+2)%3];
					
					var raw = [ [b[0], a[0], c[1], a[2], c[0]], [b[1], a[0], c[0], a[3], c[1]], [c[1], a[1], b[1], a[2], b[0]], [c[0], a[1], b[0], a[3], b[1]] ];
					decomposition = Array(raw.length);
					for(var i = 0, il = raw.length; i < il; i++)
					{
						decomposition[i] = Array(5);
						for(var j = 0; j < 5; j++)
						{
							decomposition[i][j] = findEdge( raw[i][j], raw[i][(j+1)%5] );
						}
					}
					return;
				}
				
//				if(disjointSets[i].length === 5 && disjointSets[(i+1)%3].length === 5 && disjointSets[(i+2)%3].length === 5 )
//				{
//					a0615 a1726 a2837 a3948 a4509 b5291 c5364 c6b70 b9c80 c3b47 b2c18
//					return;
//				}
			}
		}
		
		var decompositionSize = 2 + Math.round(Math.random() * 2.499);
		decomposition = Array( decompositionSize );
		for(var i = 0; i < decomposition.length; i++)
			decomposition[i] = [];
		console.log(decompositionSize)
		for(var i = 0; i < edges.length; i++)
		{
			var index = Math.round( i/edges.length * (decomposition.length-1))
			console.log(index)
			decomposition[index].push(edges[i]);
		}
	}
	findCycles(1);
	
	var decompose = false;
	document.addEventListener( 'keydown', function(event)
	{
		//arrow keys
		if( 32 === event.keyCode )
		{
			if( decompose )
				decompose = false;
			else
				decompose = true;
		}
	}, false );
	
	function coreLoop() {
		frameDelta = ourclock.getDelta();
		timeSinceStart += frameDelta;
		
		if(decompose)
			decompositionDisplayState = decompositionDisplayState + (1-decompositionDisplayState)*0.1;
		else
			decompositionDisplayState = decompositionDisplayState + (0-decompositionDisplayState)*0.1;
			
		console.log(edges.length);
		
		asynchronousInput.read();
		
//		octagonScene.update();
		
		var highlightedNode = -1;
		for(var i = 0,il = nodes.length; i < il; i++)
		{
			nodes[i].update();
			
			if(nodes[i].position.distanceTo( clientPosition ) < nodeRadius )
				highlightedNode = i;
		}
		for(var j = 0, jl = edges.length; j < jl; j++)
		{
			if(edges[j].startIndex === highlightedNode || edges[j].endIndex === highlightedNode )
			{
				edges[j].material.color.setRGB(1,0,0)
			}
			else
			{
				edges[j].material.color.setRGB(0,0,0)
			}
		}
		
		if(clientClicking && !oldClientClicking )
		{
			if(highlightedNode !== -1)
			{
				scene.remove( nodes[ highlightedNode ] );
				disjointSets[ nodes[ highlightedNode ].disjointSet ].splice( disjointSets.indexOf( nodes[ highlightedNode ] ),1 );
				
				if(disjointSets[nodes[ highlightedNode ].disjointSet].length === 0)
					disjointSets.splice(nodes[ highlightedNode ].disjointSet, 1);
				nodes.splice(highlightedNode, 1);
				for(var i = 0; i < edges.length; i++)
				{
					if( edges[i].startIndex === highlightedNode || edges[i].endIndex === highlightedNode )
					{
						console.log("removing")
						scene.remove( edges[ i ] );
						edges.splice(i,1);
						i--;
					}
					else
					{
						if( edges[i].startIndex > highlightedNode)
							edges[i].startIndex--;
						if( edges[i].endIndex > highlightedNode)
							edges[i].endIndex--;
					}
				}
				
				findCycles(1)
			}
			else
			{
				var closestNode = -1;
				var closestDistance = smallSpringIdealLength;
				for(var i = 0; i < nodes.length; i++)
				{
					if(nodes[i].position.distanceTo(clientPosition) < closestDistance)
					{
						closestDistance = nodes[i].position.distanceTo(clientPosition );
						closestNode = i;
					}
				}
				
				if(closestNode === -1)
				{
					console.log("adding set")
					addDisjointSet();
					disjointSets[ disjointSets.length-1 ].length = 1;
				}
				else
				{
					disjointSets[ nodes[ closestNode ].disjointSet ].length += 1; 
				}
				
				var nodeIndex = nodes.length;
				makeNode( true );
				
				for(var i = 0; i < nodes.length; i++)
				{
					if( nodes[i].disjointSet === nodes[nodeIndex].disjointSet )
						continue;
						
					edges.push( makePlaceableCylinder( i, nodeIndex ) );
					scene.add( edges[ edges.length - 1 ] );
				}
				findCycles(1)
			}
		}
		
		for(var i = 0, il = edges.length; i < il; i++ )
		{
			edges[i].place(edges[i].start,edges[i].end);
		}
		
		for(var i = 0; i < decomposition.length; i++)
		{
			var cycleDirection = xAxis.clone().applyAxisAngle(zAxis, i / decomposition.length * TAU ).setLength(0.5);
			for(var j = 0; j < decomposition[i].length; j++)
			{
				decomposition[i][j].position.addScaledVector(cycleDirection, decompositionDisplayState );
			}
		}
		
		requestAnimationFrame( coreLoop );
		renderer.render( scene, camera );
	}
	coreLoop();
}