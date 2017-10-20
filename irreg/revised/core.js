function init()
{
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor( 0xFFFFFF );	
	document.getElementById("canvas").appendChild( renderer.domElement );
	
	scene = new THREE.Scene();
	camera = new THREE.OrthographicCamera( -0.5,0.5,0.5,-0.5, 1,20); //both first arguments are irrelevant
	camera.aspect = 1;
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
			camera.top = 0.5;
			camera.bottom = -0.5;
			camera.right = camera.top * camera.aspect;
			camera.left = camera.bottom * camera.aspect;
		}
		else
		{
			camera.right = 0.5;
			camera.left = -0.5;
			camera.top = camera.right * camera.aspect;
			camera.bottom = camera.left * camera.aspect;
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
	
	var ico = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial(
		{
			vertexColors:THREE.FaceColors, 
			side:THREE.DoubleSide
		}));
	ico.scale.setScalar(0.3)
	scene.add( ico );
	
	var fundamentalIcoVertices = [new THREE.Vector3(1,0,PHI),new THREE.Vector3(0,PHI,1),new THREE.Vector3(PHI,1,0)];
	for(var i = 0; i < 3; i++)
		fundamentalIcoVertices[i].setLength(Math.sqrt(PHI*Math.sqrt(5))/2);
	var coords = ["x","y","z"]
	for(var i = 0; i < 3; i++)
	{
		ico.geometry.vertices.push(fundamentalIcoVertices[i]);
		
		for(var j = 0; j < 3; j++)
		{
			if( ico.geometry.vertices[ ico.geometry.vertices.length-1 ][ coords[j] ] === 0 )
			{
				ico.geometry.vertices.push(fundamentalIcoVertices[i].clone());
				ico.geometry.vertices[ico.geometry.vertices.length-1][ coords[(j+1)%3] ] *= -1;
				
				ico.geometry.vertices.push(fundamentalIcoVertices[i].clone());
				ico.geometry.vertices[ ico.geometry.vertices.length-1 ][ coords[(j+2)%3] ] *= -1;
				
				ico.geometry.vertices.push(fundamentalIcoVertices[i].clone());
				ico.geometry.vertices[ ico.geometry.vertices.length-1 ].negate();
			}
		}
	}
	var triangleColor = new THREE.Color(1,0,0)
	for(var i = 0, il = ico.geometry.vertices.length; i < il; i++)
	{
		for(var j = i+1; j < il; j++)
		{
			if(ico.geometry.vertices[i].distanceTo(ico.geometry.vertices[j]) - 1 < 0.0001)
			{
				for(var k = j+1; k < il;k++)
				{
					if(ico.geometry.vertices[k].distanceTo(ico.geometry.vertices[i]) - 1 < 0.0001
					&& ico.geometry.vertices[k].distanceTo(ico.geometry.vertices[j]) - 1 < 0.0001 )
					{
						ico.geometry.faces.push( new THREE.Face3(i,j,k, new THREE.Vector3(), triangleColor.clone() ) );
					}
				}
			}
		}
	}
	ico.geometry.computeFaceNormals();
	
	var destinationQuaternion = ico.quaternion.clone();
	var destination = ico.position.clone();
	
	var edgeRadius = 0.034;
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

		ourPlaceableCylinder.start = ico.geometry.vertices[startIndex];
		ourPlaceableCylinder.end = ico.geometry.vertices[endIndex];
		
		ourPlaceableCylinder.place();
		
		ourPlaceableCylinder.line3 = new THREE.Line3( ourPlaceableCylinder.start, ourPlaceableCylinder.end );
		return ourPlaceableCylinder;
	}
	
	var grabbableEdges = [];
	var wholeGrabbed = false;
	var grabbedEdge = -1;
	var grabbedVertexIndex = -1;
	
	for(var i = 0, il = ico.geometry.vertices.length; i < il; i++ )
	{
		for(var j = i+1; j < ico.geometry.vertices.length; j++)
		{
			if( ico.geometry.vertices[i].distanceTo(ico.geometry.vertices[j]) - 1 < 0.0001)
			{
				grabbableEdges.push( makePlaceableCylinder( i, j) );
				
				ico.add(grabbableEdges[grabbableEdges.length-1]);
			}
		}
	}
	
	var getFirstTriangleConnectedToVertex = function(vertexIndex, apartFrom)
	{
		for(var i = 0, il = this.faces.length; i < il; i++)
		{
			if( this.faces[i].indexOfCorner(vertexIndex) !== -1 )
			{
//				if( apartFrom !== undefined)
//					console.log(apartFrom, this.faces[i])
				if( apartFrom === undefined || this.faces[i] !== apartFrom)
					return this.faces[i];
			}
		}
		console.error("no triangle connected to that vertex")
	}
	
	for(var i = 0, il = ico.geometry.vertices.length; i < il; i++)
	{
		ico.geometry.vertices[i].getFirstTriangleConnectedToVertex = getFirstTriangleConnectedToVertex;
		ico.geometry.vertices[i].faces = [];
		for(var j = 0, jl = ico.geometry.faces.length; j < jl; j++)
		{
			for(var k = 0; k < 3; k++)
			{
				if(ico.geometry.faces[j].cornerFromIndex(k) === i)
					ico.geometry.vertices[i].faces.push( ico.geometry.faces[j] );
			}
		}
	}
	
	var indicatorSphere = new THREE.Mesh(new THREE.SphereGeometry(0.09), new THREE.MeshBasicMaterial({color:0x888888}));
	ico.add(indicatorSphere)
	var indicatorSphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.09), new THREE.MeshBasicMaterial({color:0xFF00F0}));
	ico.add(indicatorSphere2)
	
	function coreLoop() {
		frameDelta = ourclock.getDelta();
		timeSinceStart += frameDelta;
		
		asynchronousInput.read();
		
		var hoveringEdge = -1;
		var hoveringVertexIndex = -1;
		
		//determination of selection
		if( !wholeGrabbed && grabbedEdge === -1)
		{
			var hoveringEdgePlaneClientRayIntersectionZ = -Infinity;
//			ico.updateMatrixWorld();
			for(var i = 0; i < grabbableEdges.length; i++)
			{
				var clientRay = getClientRay();
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
							if( edgePlaneClientRayIntersection.distanceTo(grabbableEdges[i].start) < 
								edgePlaneClientRayIntersection.distanceTo(grabbableEdges[i].end) )
								hoveringVertexIndex = grabbableEdges[i].startIndex;
							else
								hoveringVertexIndex = grabbableEdges[i].endIndex;
								
							hoveringEdgePlaneClientRayIntersectionZ = worldspaceIntersection.z;
							
							indicatorSphere.position.copy( edgePlaneClientRayIntersection )
							indicatorSphere2.position.copy( ico.geometry.vertices[ hoveringVertexIndex ] )
						}
					}
				}
			}
			
			for(var i = 0; i < grabbableEdges.length; i++)
			{
				if( i === hoveringEdge )
				{
					grabbableEdges[i].material.color.setRGB(0.6,0.6,0.6);
				}
				else
				{
					grabbableEdges[i].material.color.setRGB(0,0,0);
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
					grabbableEdges[ grabbedEdge ].materialNeedsUpdate = true;
					
					grabbedVertexIndex = hoveringVertexIndex;

					//get triangle that we'll see as flat
					{
						var ungrabbedVertexIndex = grabbedVertexIndex === grabbableEdges[ grabbedEdge ].startIndex ? grabbableEdges[ grabbedEdge ].endIndex : grabbableEdges[ grabbedEdge ].startIndex;
						var triangleAdjacentToGE = ico.geometry.vertices[grabbedVertexIndex].getFirstTriangleConnectedToVertex( 
								ungrabbedVertexIndex );
						
						var adjacentCorner = triangleAdjacentToGE.indexOfThirdCorner( 
								grabbableEdges[grabbedEdge].startIndex, 
								grabbableEdges[grabbedEdge].endIndex );
						var triangleAdjacentToTATGE = ico.geometry.vertices[grabbedVertexIndex].getFirstTriangleConnectedToVertex( 
								adjacentCorner, 
								triangleAdjacentToGE );
						
						var flattenedTriangleCornerA = triangleAdjacentToTATGE.indexOfThirdCorner(
								grabbedVertexIndex,
								adjacentCorner );
						var triangleOppositeGE = ico.geometry.vertices[grabbedVertexIndex].getFirstTriangleConnectedToVertex( 
								flattenedTriangleCornerA, 
								triangleAdjacentToTATGE );
						
						var flattenedTriangleCornerB = triangleOppositeGE.indexOfThirdCorner(
								grabbedVertexIndex,
								flattenedTriangleCornerA );

						var facePlane = new THREE.Plane().setFromCoplanarPoints(
								ico.geometry.vertices[ flattenedTriangleCornerA ],
								ico.geometry.vertices[ flattenedTriangleCornerB ],
								ico.geometry.vertices[ grabbedVertexIndex ] );
						if(facePlane.normal.angleTo( ico.geometry.vertices[ grabbedVertexIndex ] ) > TAU / 4 )
							facePlane.normal.negate();
						destinationQuaternion.setFromUnitVectors( facePlane.normal, zAxis );
						
						var edgeInIQ = grabbableEdges[ grabbedEdge ].line3.delta().applyQuaternion(ico.quaternion).setZ(0).normalize();
						var edgeInDQ = grabbableEdges[ grabbedEdge ].line3.delta().applyQuaternion(destinationQuaternion).setZ(0).normalize();
						destinationQuaternion.premultiply(new THREE.Quaternion().setFromUnitVectors( edgeInDQ,edgeInIQ ))
						
						var geWorld = ico.geometry.vertices[grabbedVertexIndex].clone().multiplyScalar(ico.scale.x).applyQuaternion(destinationQuaternion).add(ico.position);
						var movementToMouse = clientPosition.clone().sub(geWorld);
						destination.addVectors(ico.position,movementToMouse);
					}
				}
				else {
					wholeGrabbed = true;
				}
			}
			
			if( grabbedEdge !== -1 )
			{
				var clientRay = getClientRay();
				grabbableEdges[grabbedEdge].parent.worldToLocal(clientRay.start);
				grabbableEdges[grabbedEdge].parent.worldToLocal(clientRay.end);
				
				var facePlane = new THREE.Plane().setFromCoplanarPoints(
						grabbableEdges[grabbedEdge].parent.geometry.vertices[0],
						grabbableEdges[grabbedEdge].parent.geometry.vertices[1],
						grabbableEdges[grabbedEdge].parent.geometry.vertices[2] );
				
				var facePlaneClientRayIntersection = facePlane.intersectLine( clientRay );
				
				/* Increase the triangle's size
				 * 		at first ignore the angular defect thing
				 * 		so don't bother with AO
				 * 		That's it
				 * 
				 * Later
				 * Increase size
				 * deal with implications for other edge lengths
				 * send to AO, put vertices in our thing
				 * 
				 */
			}
			else
			{
				var rotationAmount = clientPosition.clone().sub(oldClientPosition).length() * 5;
				var rotationAxis = clientPosition.clone().sub(oldClientPosition).applyAxisAngle(zAxis,TAU/4);
				ico.updateMatrixWorld();
				ico.worldToLocal(rotationAxis)
				rotationAxis.normalize();
				var quaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAmount);
				ico.quaternion.multiply(quaternion)
				ico.matrixAutoUpdate = true;
			}
		}
		else {
			wholeGrabbed = false;
			grabbedEdge = -1;
		}
		
		ico.quaternion.slerp(destinationQuaternion, 0.12);
		ico.position.lerp(destination, 0.12);
		
		requestAnimationFrame( coreLoop );
		renderer.render( scene, camera );
	}
	coreLoop();
}