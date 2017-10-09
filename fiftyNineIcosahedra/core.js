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
 */



function init()
{
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor( 0xFFFFFF );
	renderer.sortObjects = false;
	document.getElementById("canvas").appendChild( renderer.domElement );
	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 1,1,1,100); //both first arguments are irrelevant because of below
	camera.position.z = 16;
	
	var respondToResize = function() 
	{
		renderer.setSize( document.documentElement.clientWidth,window.innerHeight ); //different because we do expect a scrollbar. Bullshit that you can't use both in the same way but whatever
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
	
	//----------BUSINESS
//	initArrangement();
	
	var edgeRadius = 0.06;
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
	
	var model = new THREE.Mesh( new THREE.Geometry(), new THREE.MeshPhongMaterial({side:THREE.DoubleSide, color:0xFF0000}) );
	model.scale.setScalar(0.1)
	var baseVertices = [ new THREE.Vector3(0,PHI,1),new THREE.Vector3(PHI,1,0),new THREE.Vector3(1,0,PHI) ];
	
	//rotations
	{
		var spindleAxis = new THREE.Vector3(0,PHI,1);
		spindleAxis.normalize();
		var layerGenerators = [
		                       new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,PHI).normalize(),0),
		                       new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,PHI).normalize(),-TAU/5),
		                       new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,PHI).normalize(),-2*TAU/5),
		                       new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,PHI).normalize(),-2*TAU/5).multiply( new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(PHI,-1,0).normalize(),-TAU/5) ),
		                       ]
		
		function faceFromQuaternion(ourQuaternion)
		{
			var lowestVertexIntroduced = model.geometry.vertices.length;
			for(var l = 0; l < 3; l++)
			{
				var newVertex = baseVertices[l].clone();
				newVertex.applyQuaternion(ourQuaternion);
				
				model.geometry.vertices.push(newVertex)
			}
			
			model.geometry.faces.push( new THREE.Face3(lowestVertexIntroduced,lowestVertexIntroduced+1,lowestVertexIntroduced+2) )
		}
		for(var i = 0; i < layerGenerators.length; i++)
		{
			for(var j = 0; j < 5; j++)
			{
				var ourQuaternion = layerGenerators[i].clone().premultiply(new THREE.Quaternion().setFromAxisAngle(spindleAxis,TAU/5*j))
				faceFromQuaternion(ourQuaternion);
			}
		}
		model.geometry.computeFaceNormals();
		model.geometry.computeVertexNormals();
		scene.add(model);
	}
	
	var grabbableEdges = [];
	var wholeGrabbed = false;
	var grabbedEdge = -1;
	
	for(var i = 0, il = model.geometry.faces.length; i < il; i++ )
	{
		for(var j = 0; j < 3; j++ )
		{
			var newCylinder = makePlaceableCylinder();
			newCylinder.place(
					model.geometry.vertices[model.geometry.faces[i].getCorner(j)], 
					model.geometry.vertices[model.geometry.faces[i].getCorner((j+1)%3)],
					edgeRadius);
			scene.add(newCylinder);
			
			model.add(newCylinder);
			
			grabbableEdges.push(newCylinder)
		}
	}
	
	indicatorSphere = new THREE.Mesh(new THREE.SphereGeometry(0.3), new THREE.MeshBasicMaterial({color:0x888888}));
	model.add(indicatorSphere)
	
	function coreLoop()
	{
		frameDelta = ourclock.getDelta();
		timeSinceStart += frameDelta;
		
		asynchronousInput.read();
		
		//determination of selection
		if( !wholeGrabbed && grabbedEdge === -1)
		{
			var hoveringEdge = -1;
			
//			if( clientPosition.length() < 0.3)
//				hoveringEdge = 0;
			
			var hoveringEdgePlaneClientRayIntersectionZ = -Infinity;
			model.updateMatrixWorld();
			var mouseRay = new THREE.Line3( camera.position.clone(), clientPosition.clone().sub(camera.position).multiplyScalar(2).add(camera.position) );
			model.worldToLocal(mouseRay.start);
			model.worldToLocal(mouseRay.end);
			indicatorSphere.position.copy( mouseRay.at(0.5) );
			for(var i = 0; i < grabbableEdges.length; i++)
			{
				//it lies in the plane orthogonal to the edge and in the z = 0 plane. Could also set from normal
				var pointInEdgePlane = grabbableEdges[i].line3.delta().cross(mouseRay.start).add(grabbableEdges[i].start);
				
				var edgePlane = new THREE.Plane().setFromCoplanarPoints(grabbableEdges[i].start, grabbableEdges[i].end, pointInEdgePlane);
				
//				if(!logged)
//					console.log(edgePlane)
				
				var edgePlaneClientRayIntersection = edgePlane.intersectLine( mouseRay );
				if( edgePlaneClientRayIntersection )
				{
					var closestPointOnEdgeLineParameter = grabbableEdges[i].line3.closestPointToPointParameter( edgePlaneClientRayIntersection );
					if( 0 < closestPointOnEdgeLineParameter && closestPointOnEdgeLineParameter < 1 &&
							edgeRadius * 3 > grabbableEdges[i].line3.at( closestPointOnEdgeLineParameter ).distanceTo( edgePlaneClientRayIntersection )
					)
					{
						var worldspaceIntersection = edgePlaneClientRayIntersection.clone();
						model.localToWorld(worldspaceIntersection);
						if( worldspaceIntersection.z > hoveringEdgePlaneClientRayIntersectionZ )
						{
							hoveringEdge = i;
							hoveringEdgePlaneClientRayIntersectionZ = worldspaceIntersection.z;
							indicatorSphere.position.copy( edgePlaneClientRayIntersection )
						}
					}
				}
			}
			logged = 1;
			
			for(var i = 0; i < grabbableEdges.length; i++)
			{
				if( i === hoveringEdge )
				{
					grabbableEdges[i].material.color.setRGB(1,1,1);
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
					grabbableEdges[ grabbedEdge ].material.color.set(0,0,1);
					grabbableEdges[ grabbedEdge ].materialNeedsUpdate = true;
				}
				else {
					wholeGrabbed = true;
				}
			}
			
			if( wholeGrabbed )
			{
				var rotationAmount = clientPosition.clone().sub(oldClientPosition).length() * 5;
				var rotationAxis = clientPosition.clone().sub(oldClientPosition).applyAxisAngle(zAxis,TAU/4);
				model.updateMatrixWorld();
				model.worldToLocal(rotationAxis)
				rotationAxis.normalize();
				var quaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAmount);
				model.quaternion.multiply(quaternion)
			}
			else
			{
				//the business of morphing grabbableEdges[ grabbedEdge ]
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