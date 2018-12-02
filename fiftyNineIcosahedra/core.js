/*
 * animation: their various face sets move out from the center(or scale down) until their corners are touching. For ico this does nothing but for many...
 * 
 * What nice transitions could you get?
 * 
 * https://www.uwgb.edu/dutchs/symmetry/stic0007.htm
 * 
 * email Jon Baez, ask about the lie algebra thing and the surfaces, can he get you the general form for the barth surface + barth decic + sarti surface, which surely have a connection
 * 
 * Muse on their beauty, how we like things to line up
 * 
 * Actually maybe the user should extend out the lines? start them on the first stellation. They can grab corners and lines come out?
 * 
 * You're drawing the corners out along at least one pre-existing line?
 * 
 *  This does lend itself to the puzzle where you have to get what is shown
 */
 
function init()
{
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor( 0xFFFFFF );
	renderer.sortObjects = false;
	document.body.appendChild( renderer.domElement );
	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 1,1,1,100); //both first arguments are irrelevant because of below
	camera.position.z = 16;
	
	var respondToResize = function() 
	{
		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect = renderer.domElement.width / renderer.domElement.height;
		
		//eg playing field is 1x1 square
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
	
	var ico = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0xFF0000, side:THREE.DoubleSide}));
	ico.scale.setScalar(0.1)
	scene.add( ico );
	
	ico.geometry.vertices.push(
		new THREE.Vector3(0,0,0),
		new THREE.Vector3(HS3,-0.5,0),
		
		new THREE.Vector3(HS3, 0.5, 0),
		new THREE.Vector3(2*HS3, 0,0),
		new THREE.Vector3(2*HS3,1,0),
		new THREE.Vector3(3*HS3,0.5,0),
		
		new THREE.Vector3(0,1,0),
		new THREE.Vector3(HS3,1.5,0),
		new THREE.Vector3(0,2,0),
		new THREE.Vector3(HS3,2.5,0),
		
		new THREE.Vector3(-HS3,0.5,0),
		new THREE.Vector3(-HS3,1.5,0),
		new THREE.Vector3(-2*HS3,1,0),
		new THREE.Vector3(-2*HS3,2,0),
		
		new THREE.Vector3(-HS3,-0.5,0),
		new THREE.Vector3(-2*HS3,0,0),
		new THREE.Vector3(-2*HS3,-1,0),
		new THREE.Vector3(-3*HS3,-0.5,0),
		
		new THREE.Vector3(0,-1,0),
		new THREE.Vector3(-HS3,-1.5,0),
		new THREE.Vector3(0,-2,0),
		new THREE.Vector3(-HS3,-2.5,0) );
	
	ico.geometry.faces.push(
		new THREE.Face3(2,1,0),
		new THREE.Face3(1,2,3),
		new THREE.Face3(4,3,2),
		new THREE.Face3(3,4,5),
		
		new THREE.Face3(6,2,0),
		new THREE.Face3(2,6,7),
		new THREE.Face3(8,7,6),
		new THREE.Face3(7,8,9),
		
		new THREE.Face3(10, 6, 0),
		new THREE.Face3(6, 10,11),
		new THREE.Face3(12,11,10),
		new THREE.Face3(11,12,13),
		
		new THREE.Face3(14,10, 0),
		new THREE.Face3(10,14,15),
		new THREE.Face3(16,15,14),
		new THREE.Face3(15,16,17),
		
		new THREE.Face3(18,14, 0),
		new THREE.Face3(14,18,19),
		new THREE.Face3(20,19,18),
		new THREE.Face3(19,20,21) );
	//----------BUSINESS
//	initArrangement();
	
	var edgeRadius = 0.034;
	var ourCylinderGeometry = new THREE.CylinderBufferGeometry( 1,1,1,15,1, true);
	for(var i = 0, il = ourCylinderGeometry.attributes.position.array.length / 3; i < il; i++)
	{
		ourCylinderGeometry.attributes.position.array[i*3+1] += 0.5;
	}
	
	var placeCylinder = function( start, end, newRadius )
	{
		if(!newRadius)
			newRadius = edgeRadius;
		
		var newY = end.clone().sub(start);
		var newX = randomPerpVector( newY );
		var newZ = newY.clone().cross(newX);
		newX.setLength(newRadius);
		newZ.setLength(newRadius);
		
		this.matrix.makeBasis(newX,newY,newZ);
		this.matrix.setPosition(start);
		this.matrixAutoUpdate = false;
		
		this.start.copy(start);
		this.end.copy(end);
	}
	var setCylinderRadius = function( newRadius )
	{
		this.place(this.start, this.end, newRadius )
	}
	function makePlaceableCylinder()
	{
		var ourPlaceableCylinder = new THREE.Mesh( ourCylinderGeometry, new THREE.MeshPhongMaterial({color:0x000000, side:THREE.DoubleSide}));
		ourPlaceableCylinder.place = placeCylinder;
		ourPlaceableCylinder.setRadius = setCylinderRadius;
		ourPlaceableCylinder.start = new THREE.Vector3();
		ourPlaceableCylinder.end = new THREE.Vector3(0,1,0);
		ourPlaceableCylinder.line3 = new THREE.Line3( ourPlaceableCylinder.start, ourPlaceableCylinder.end );
		return ourPlaceableCylinder;
	}
	
	var model = new THREE.Object3D();
	model.scale.setScalar(0.1); //because we want the edges to be 1
	
	{
		var centralFaceGeometry = new THREE.Geometry();
		centralFaceGeometry.vertices.push( new THREE.Vector3(0,PHI,1),new THREE.Vector3(PHI,1,0),new THREE.Vector3(1,0,PHI) );
		centralFaceGeometry.vertices[0].lerp( centralFaceGeometry.vertices[1].clone().lerp(centralFaceGeometry.vertices[2], 0.5), 2/3 );
		centralFaceGeometry.faces.push( new THREE.Face3(0,2,1) );
		centralFaceGeometry.computeFaceNormals();
		centralFaceGeometry.computeVertexNormals();
		
		var spindleAxis = new THREE.Vector3(0,PHI,1);
		spindleAxis.normalize();
		var layerGenerators = [
		                       new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,PHI).normalize(),0),
		                       new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,PHI).normalize(),-TAU/5),
		                       new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,PHI).normalize(),-2*TAU/5),
		                       new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,PHI).normalize(),-2*TAU/5).multiply( new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(PHI,-1,0).normalize(),-TAU/5) ),
		                       ];
		
		for(var i = 0; i < layerGenerators.length; i++)
		{
			for(var j = 0; j < 5; j++)
			{
				var planeQuaternion = layerGenerators[i].clone();
				planeQuaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(spindleAxis,TAU/5*j));
				
				var faceCentralAxis = centralFaceGeometry.vertices[0].clone().applyQuaternion(planeQuaternion);
				faceCentralAxis.normalize();
				
				var faceMaterial = new THREE.MeshPhongMaterial({side:THREE.DoubleSide})
				faceMaterial.color.setRGB(Math.random(),Math.random(),Math.random).getHex();
				
				for(var k = 0; k < 3; k++)
				{
					var fundamentalDomain = new THREE.Mesh( centralFaceGeometry, faceMaterial );
					fundamentalDomain.quaternion.copy( planeQuaternion );
					fundamentalDomain.quaternion.premultiply( new THREE.Quaternion().setFromAxisAngle(faceCentralAxis,TAU/3*k) );
					model.add(fundamentalDomain);
				}
			}
		}
		scene.add(model);
	}
	
	var grabbableEdges = [];
	var wholeGrabbed = false;
	var grabbedEdge = -1;
	
	for(var i = 0, il = model.children.length; i < il; i++ )
	{
		var newCylinder = makePlaceableCylinder();
		newCylinder.place(
				model.children[i].geometry.vertices[ 1 ], 
				model.children[i].geometry.vertices[ 2 ],
				edgeRadius);
		
		model.children[i].add(newCylinder);
		
		grabbableEdges.push(newCylinder)
	}
	
	indicatorSphere = new THREE.Mesh(new THREE.SphereGeometry(0.03), new THREE.MeshBasicMaterial({color:0x888888}));
	scene.add(indicatorSphere)
	
	function coreLoop()
	{
		frameDelta = ourclock.getDelta();
		timeSinceStart += frameDelta;
		
		asynchronousInput.read();
		
		//determination of selection
		indicatorSphere.position.copy(clientPosition)
		if( !wholeGrabbed && grabbedEdge === -1)
		{
			var hoveringEdge = -1;
			
			var hoveringEdgePlaneClientRayIntersectionZ = -Infinity;
			model.updateMatrixWorld();
			for(var i = 0; i < grabbableEdges.length; i++)
			{
				var clientRay = new THREE.Line3( camera.position.clone(), clientPosition.clone().sub(camera.position).multiplyScalar(2).add(camera.position) );
				grabbableEdges[i].parent.worldToLocal(clientRay.start);
				grabbableEdges[i].parent.worldToLocal(clientRay.end);
				
				//it lies in the plane orthogonal to the edge and in the z = 0 plane. Could also set from normal
				var pointInEdgePlane = grabbableEdges[i].line3.delta().cross(clientRay.start).add(grabbableEdges[i].start);
				
				var edgePlane = new THREE.Plane().setFromCoplanarPoints(grabbableEdges[i].start, grabbableEdges[i].end, pointInEdgePlane);
				
				var edgePlaneClientRayIntersection = edgePlane.intersectLine( clientRay );
				if( edgePlaneClientRayIntersection )
				{
					var closestPointOnEdgeLineParameter = grabbableEdges[i].line3.closestPointToPointParameter( edgePlaneClientRayIntersection );
					if( 0 < closestPointOnEdgeLineParameter && closestPointOnEdgeLineParameter < 1 &&
							edgeRadius * 3 > grabbableEdges[i].line3.at( closestPointOnEdgeLineParameter ).distanceTo( edgePlaneClientRayIntersection )
					)
					{
						var worldspaceIntersection = edgePlaneClientRayIntersection.clone();
						grabbableEdges[i].parent.localToWorld(worldspaceIntersection);
						if( worldspaceIntersection.z > hoveringEdgePlaneClientRayIntersectionZ )
						{
							hoveringEdge = i;
							hoveringEdgePlaneClientRayIntersectionZ = worldspaceIntersection.z;
							indicatorSphere.position.copy( edgePlaneClientRayIntersection )
							grabbableEdges[i].parent.localToWorld(indicatorSphere.position);
						}
					}
				}
			}
			
			for(var i = 0; i < grabbableEdges.length; i++)
			{
				if( i === hoveringEdge )
				{
					grabbableEdges[i].material.color.setRGB(0.6,0.6,0.6);
					grabbableEdges[i].setRadius( edgeRadius * 2 );
				}
				else
				{
					grabbableEdges[i].material.color.setRGB(0,0,0);
					grabbableEdges[i].setRadius( edgeRadius );
				}
				
				grabbableEdges[i].material.needsUpdate = true;
			}
		}

		if( clientClicking )
		{
			if( !oldClientClicking )
			{
				if( hoveringEdge !== -1)
				{
					grabbedEdge = hoveringEdge;
					grabbableEdges[ grabbedEdge ].material.color.setRGB(1,1,1);
					grabbableEdges[ grabbedEdge ].setRadius( edgeRadius * 1.5 );
					grabbableEdges[ grabbedEdge ].materialNeedsUpdate = true;
					
					var newSegmentGeometry = new THREE.Geometry();
					newSegmentGeometry.faces.push(new THREE.Face3(0,1,2));
					newSegmentGeometry.vertices.push(new THREE.Vector3(),grabbableEdges[ grabbedEdge ].start.clone(), grabbableEdges[ grabbedEdge ].end );
					
					for(var i = 0; i < 60; i++)
					{
						model.children[i].add( new THREE.Mesh(newSegmentGeometry, model.children[i].material) );
					}
				}
				else {
					wholeGrabbed = true;
				}
			}
			
			if( grabbedEdge !== -1 )
			{
				var clientRay = new THREE.Line3( camera.position.clone(), clientPosition.clone().sub(camera.position).multiplyScalar(2).add(camera.position) );
				grabbableEdges[grabbedEdge].parent.worldToLocal(clientRay.start);
				grabbableEdges[grabbedEdge].parent.worldToLocal(clientRay.end);
				
				var facePlane = new THREE.Plane().setFromCoplanarPoints(
						grabbableEdges[grabbedEdge].parent.geometry.vertices[0],
						grabbableEdges[grabbedEdge].parent.geometry.vertices[1],
						grabbableEdges[grabbedEdge].parent.geometry.vertices[2] );
				
				var facePlaneClientRayIntersection = facePlane.intersectLine( clientRay );
				
				grabbableEdges[ grabbedEdge ].parent.children[grabbableEdges[ grabbedEdge ].parent.children.length-1].geometry.vertices[0].copy(facePlaneClientRayIntersection);
				grabbableEdges[ grabbedEdge ].parent.children[grabbableEdges[ grabbedEdge ].parent.children.length-1].geometry.verticesNeedUpdate = true;
			}
			else
			{
				var rotationAmount = clientPosition.clone().sub(oldClientPosition).length() * 5;
				var rotationAxis = clientPosition.clone().sub(oldClientPosition).applyAxisAngle(zAxis,TAU/4);
				model.updateMatrixWorld();
				model.worldToLocal(rotationAxis)
				rotationAxis.normalize();
				var quaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAmount);
				model.quaternion.multiply(quaternion)
			}
		}
		else {
			wholeGrabbed = false;
			grabbedEdge = -1;
		}
		
		requestAnimationFrame( coreLoop );
		renderer.render( scene, camera );
	}
	
	coreLoop();
}

function initArrangement()
{
	var arrangementGeometry = new THREE.Geometry();
	
	function triplicateMostRecent()
	{
		for(var i = 1; i < 3; i++)
		{
			var newVertex = arrangementGeometry.vertices[arrangementGeometry.vertices.length-i].clone();
			newVertex.applyAxisAngle(zAxis,TAU/3*i);
			arrangementGeometry.vertices.push(newVertex)
		}
	}
	
	function addIntersectionAndTriplicate(a1Index,a2Index,b1Index,b2Index)
	{
		var newVertex = lineLineIntersection(arrangementGeometry.vertices[a1Index],arrangementGeometry.vertices[a2Index],arrangementGeometry.vertices[b1Index],arrangementGeometry.vertices[b2Index]);
		arrangementGeometry.vertices.push(newVertex);
		
		triplicateMostRecent();
	}
	
	arrangementGeometry.vertices[0] = new THREE.Vector3(0,HS3*2/3,0); //top of central triangle, edge length 1.
	triplicateMostRecent();
	
	var icosahedronDihedralAngle = 2 * Math.atan( PHI / (PHI-1) );
	var firstStellationTriangleBaseToPoint = HS3 / 3 / Math.cos( TAU / 2 - icosahedronDihedralAngle );
	
	arrangementGeometry.vertices[3] = new THREE.Vector3(0, -(HS3 / 3 + firstStellationTriangleBaseToPoint),0);
	triplicateMostRecent();
	
	addIntersectionAndTriplicate(0,1,2,4);
	addIntersectionAndTriplicate(1,5,0,2);
	addIntersectionAndTriplicate(7,10,8,11);
	addIntersectionAndTriplicate(9,11,6,7);
	addIntersectionAndTriplicate(7,8,10,11);
	
	addIntersectionAndTriplicate(7,8,4,12);
	addIntersectionAndTriplicate(5,12,10,11);
	
	addIntersectionAndTriplicate(8,14,10,11);
	addIntersectionAndTriplicate(9,12,10,13);
	addIntersectionAndTriplicate(9,11,10,6);
	addIntersectionAndTriplicate(6,7,8,9);
	
	function getRandomColor()
	{
		return new THREE.Color(Math.random(),Math.random(),Math.random());
	}
	
	function addColoredFace(a,b,c, color)
	{
		if(!color)
			color = getRandomColor();
		arrangementGeometry.faces.push(new THREE.Face3( a,b,c, new THREE.Vector3(0,0,1), color ));
	}
	
	function addFaceAndTriplicate(corners, duplicatePreviousColor)
	{
		var threeMultiples = Array(3);
		var remainders = Array(3);
		
		for(var i = 0; i < 3; i++)
		{
			remainders[i] = corners[i] % 3;
			threeMultiples[i] = Math.floor( corners[i] / 3 ) * 3;
		}
		
		
		var ourColor;
		if(duplicatePreviousColor)
			ourColor = arrangementGeometry.faces[arrangementGeometry.faces.length-1].color;
		else
			ourColor = getRandomColor()
		
		for(var i = 0; i < 3; i++)
		{
			addColoredFace(
					threeMultiples[0] + (remainders[0] + i) % 3,
					threeMultiples[1] + (remainders[1] + i) % 3,
					threeMultiples[2] + (remainders[2] + i) % 3,
					ourColor
			);
		}
	}
	
	addColoredFace( 0,1,2 );
	
	addFaceAndTriplicate([1,5,0])
	
	addFaceAndTriplicate([1,5,29])
	addFaceAndTriplicate([0,5,32],true)
	
	addFaceAndTriplicate([1,29,34])
	addFaceAndTriplicate([1,30,37],true)
	
	addFaceAndTriplicate([32,36,9])
	addFaceAndTriplicate([28,33,6],true)
	
	addFaceAndTriplicate([9,15,36])
	addFaceAndTriplicate([6,15,33],true)
	
	addFaceAndTriplicate([30,18,24])
	addFaceAndTriplicate([27,18,21],true)
	
	addFaceAndTriplicate([1,3,30])
	addFaceAndTriplicate([2,3,27],true)
	
	addFaceAndTriplicate([9,6,15])
	
	addFaceAndTriplicate([12,10,24])
	addFaceAndTriplicate([12,21,8],true)
	
	addFaceAndTriplicate([10,24,30])
	addFaceAndTriplicate([8,21,27],true)
	
	//quads
	addFaceAndTriplicate([12,24,18])
	addFaceAndTriplicate([12,21,18],true)
	
	addFaceAndTriplicate([18,3,30])
	addFaceAndTriplicate([18,27,3],true)
	
	addFaceAndTriplicate([0,36,15])
	addFaceAndTriplicate([0,33,15],true)
	
	var arrangement = new THREE.Mesh( arrangementGeometry, new THREE.MeshBasicMaterial({vertexColors:THREE.FaceColors, side: THREE.DoubleSide}) );
	arrangement.scale.setScalar(0.1);
	scene.add( arrangement );
	
	for(var i = 0; i < arrangementGeometry.vertices.length; i++)
	{
		var ind = new THREE.Mesh(new THREE.CircleGeometry(0.003), new THREE.MeshBasicMaterial({color:0x000000}));
		ind.position.copy(arrangementGeometry.vertices[i]);
		ind.position.multiplyScalar(0.1)
		scene.add( ind );
	}
}