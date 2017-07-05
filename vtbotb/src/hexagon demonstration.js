pentagonDemo = {};

pentagonDemo.init = function()
{
	var numStates = 8;
	var edgeLen = 0.4/42*30;
	var numSymmetryCopies = 8;
	
	var decagonVertices = Array(10);
	decagonVertices[0] = new THREE.Vector3(0,1,0);
	for(var i = 1; i < decagonVertices.length; i++)
	{
		decagonVertices[i] = decagonVertices[0].clone();
		decagonVertices[i].applyAxisAngle(z_central_axis, -TAU / 10 * i);
	}
	for(var i = 0; i < decagonVertices.length; i++)
		decagonVertices[i].applyAxisAngle(z_central_axis, -TAU / 20 );
	var decagonEdges = Array(10);
	for(var i = 0; i < decagonEdges.length; i++)
	{
		decagonEdges[i] = decagonVertices[(i+1)%10].clone();
		decagonEdges[i].sub( decagonVertices[i] );
		decagonEdges[i].setLength(edgeLen);
	}
	var pointingUpDecagonEdges = Array( decagonEdges.length );
	for(var i = 0; i < decagonEdges.length; i++)
	{
		pointingUpDecagonEdges[i] = decagonEdges[i].clone();
		pointingUpDecagonEdges[i].applyAxisAngle(z_central_axis, TAU / 20 );
	}
	
	//The outlines are bigger versions of the things, behind them
	var basePentagon = new THREE.Object3D();
	basePentagon.shape = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0x5DA7DF,side:THREE.DoubleSide}) );
	
	basePentagon.shape.geometry.vertices = Array(5);
	basePentagon.shape.geometry.vertices[0] = new THREE.Vector3(); //the top point
	for(var i = 1; i < 5; i++)
	{
		basePentagon.shape.geometry.vertices[i] = basePentagon.shape.geometry.vertices[i-1].clone();
		basePentagon.shape.geometry.vertices[i].add( decagonEdges[(4+i*2)%10] );
	}
	basePentagon.shape.geometry.faces = [new THREE.Face3(0,1,2),new THREE.Face3(0,2,3),new THREE.Face3(0,3,4)];
	
	var baseHexagon = new THREE.Object3D();
	baseHexagon.shape = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0xD7F3FD,side:THREE.DoubleSide}) );
	baseHexagon.shape.geometry.vertices = Array(6);
	baseHexagon.shape.geometry.vertices[0] = new THREE.Vector3();
	for(var i = 1; i < 6; i++)
	{
		baseHexagon.shape.geometry.vertices[i] = baseHexagon.shape.geometry.vertices[i-1].clone();
		var decagonEdge = i < 4 ? 6+i : i - 2;
		baseHexagon.shape.geometry.vertices[i].add( decagonEdges[ decagonEdge ] );
	}
	baseHexagon.shape.geometry.faces = [ new THREE.Face3(0,1,2),new THREE.Face3(0,2,3),new THREE.Face3(0,3,4),new THREE.Face3(0,4,5) ];
	
	var baseThick = new THREE.Object3D();
	baseThick.shape = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0xA7C7DE,side:THREE.DoubleSide}) );
	baseThick.shape.geometry.vertices = Array(4);
	baseThick.shape.geometry.vertices[0] = new THREE.Vector3();
	for( var i = 1; i < 4; i++ )
	{
		baseThick.shape.geometry.vertices[i] = baseThick.shape.geometry.vertices[i-1].clone();
		var decagonEdge = i < 3 ? i*2 + 5 : 2;
		baseThick.shape.geometry.vertices[i].add( decagonEdges[ decagonEdge ] );
	}
	baseThick.shape.geometry.faces = [ new THREE.Face3(0,1,2),new THREE.Face3(0,2,3)];
	
	var baseThin = new THREE.Object3D();
	baseThin.shape = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0x4874A0,side:THREE.DoubleSide}) );
	baseThin.shape.geometry.vertices = Array(4);
	baseThin.shape.geometry.vertices[0] = new THREE.Vector3();
	for( var i = 1; i < 4; i++ )
	{
		baseThin.shape.geometry.vertices[i] = baseThin.shape.geometry.vertices[i-1].clone();
		var decagonEdge = i < 3 ? 7+i : 3;
		baseThin.shape.geometry.vertices[i].add( decagonEdges[ decagonEdge ] );
	}
	baseThin.shape.geometry.faces = [ new THREE.Face3(0,1,2),new THREE.Face3(0,2,3)];
	
	var baseShapeArray = [basePentagon, baseHexagon, baseThick, baseThin];
	var outlineProportion = 0.12;
	for(var i = 0; i < baseShapeArray.length; i++ )
	{	
		baseShapeArray[i].shape.scale.setScalar(1-outlineProportion/2);
		baseShapeArray[i].add( baseShapeArray[i].shape );
		
		baseShapeArray[i].outline = new THREE.Mesh( baseShapeArray[i].shape.geometry, new THREE.MeshBasicMaterial({color:0x000000,side:THREE.DoubleSide}) );
		baseShapeArray[i].outline.position.z -= 0.01;
		baseShapeArray[i].outline.scale.setScalar(1+outlineProportion/2);
		
		baseShapeArray[i].shape.geometry.computeBoundingSphere();
		var recenterMovement = baseShapeArray[i].shape.geometry.boundingSphere.center.clone();
		recenterMovement.multiplyScalar(outlineProportion / 2);
		baseShapeArray[i].shape.position.add(recenterMovement)
		recenterMovement.negate();
		baseShapeArray[i].outline.position.add(recenterMovement)
		
		baseShapeArray[i].add(baseShapeArray[i].outline);
	}
	
	function makeShapes(baseShape, numShapes)
	{
		var shapeArray = Array(numShapes);
		for(var i = 0; i < shapeArray.length; i++)
		{
			shapeArray[i] = baseShape.clone();
			
			shapeArray[i].positions = Array(numStates);
			shapeArray[i].rotations = new Float32Array(numStates);
			for(var j = 0; j < numStates; j++)
			{
				shapeArray[i].positions[j] = new THREE.Vector3(0,playing_field_dimension*1.1,0);
				shapeArray[i].rotations[j] = 0;
			}
		}
		
		return shapeArray;
	}
	
	var numThinsInFundamentalDomain = 4;
	
	this.pentagons = makeShapes(basePentagon, 8 * (numSymmetryCopies+1) );
	this.hexagons = makeShapes(baseHexagon, 5);
	this.thicks = makeShapes(baseThick, 5);
	this.thins = makeShapes(baseThin, numThinsInFundamentalDomain*(numSymmetryCopies+1) );
	
	this.fullShapeArray = [];
	for( var i = 0; i < this.pentagons.length; i++)
		this.fullShapeArray.push(this.pentagons[i]);
	for( var i = 0; i < this.hexagons.length; i++)
		this.fullShapeArray.push(this.hexagons[i]);
	for( var i = 0; i < this.thins.length; i++)
		this.fullShapeArray.push(this.thins[i]);
	for( var i = 0; i < this.thicks.length; i++)
		this.fullShapeArray.push(this.thicks[i]);
	
	function justOffScreen(nearbyVector)
	{
		var shapeRadius = 5; //assumption. It's big because a hexagon might be pointing in a bad direction. Make it smaller once you're done
		var distanceFromCenter = shapeRadius + Math.sqrt(2) / 2 * playing_field_dimension;
		return nearbyVector.clone().setLength( distanceFromCenter );
	}
	
	for(var i = 0; i < this.fullShapeArray.length; i++)
	{
		this.fullShapeArray[i].positions[0].copy( justOffScreen( this.fullShapeArray[i].positions[1] ) )
		for(var j = 1; j < this.fullShapeArray[i].positions.length; j++)
			this.fullShapeArray[i].positions[j].copy( this.fullShapeArray[i].positions[0] );
//		this.fullShapeArray[i].positions[numStates-1].copy( justOffScreen( this.fullShapeArray[i].positions[ numStates-2 ] ) )
	}
	
	//--------------0
	for( var i = 0; i < 8; i++ )
	{
		this.pentagons[i].positions[0].set(0,77.2/28*edgeLen,0);
		if( i < 4 )
		{
			this.pentagons[i].positions[0].applyAxisAngle( z_central_axis, TAU / 10 * (i+1) );
			this.pentagons[i].rotations[0] = -(8-i)*TAU/10;
			
			this.pentagons[i].rotations[1] = this.pentagons[i].rotations[0] - TAU / 20;
		}
		else
		{
			this.pentagons[i].positions[0].applyAxisAngle( z_central_axis, TAU / 10 * -(i-3) );
			this.pentagons[i].rotations[0] = (4-i)*TAU/10;
			
			this.pentagons[i].rotations[1] = this.pentagons[i].rotations[0] + TAU / 20;
		}
		
		this.pentagons[i].positions[1].set(0,0,0)
	}
	
	//--------------1
	this.pentagons[3].positions[1].x = 0;
	this.pentagons[7].positions[1].x = 0;
	this.pentagons[2].positions[1].add( pointingUpDecagonEdges[5] );
	this.pentagons[6].positions[1].sub( pointingUpDecagonEdges[4] );
	
	this.pentagons[1].positions[1].add( pointingUpDecagonEdges[5] );
	this.pentagons[1].positions[1].add( pointingUpDecagonEdges[9] );
	this.pentagons[5].positions[1].add( pointingUpDecagonEdges[5] );
	this.pentagons[5].positions[1].add( pointingUpDecagonEdges[9] );
	
	this.pentagons[0].positions[1].add( pointingUpDecagonEdges[5] );
	this.pentagons[0].positions[1].add( pointingUpDecagonEdges[6] );
	this.pentagons[4].positions[1].sub( pointingUpDecagonEdges[3] );
	this.pentagons[4].positions[1].sub( pointingUpDecagonEdges[4] );
	
	//--------------2
	for(var i = 0; i < 8; i++)
	{
		this.pentagons[i].positions[2].copy( this.pentagons[i].positions[1] );
		this.pentagons[i].rotations[2] = this.pentagons[i].rotations[1];
	}
	
	this.thins[0].positions[2].copy( this.pentagons[2].positions[1] );
	this.thins[0].rotations[2] = -TAU / 20;
	
	//--------------3
	for(var i = 0; i < 8; i++)
	{
		this.pentagons[i].positions[3].copy( this.pentagons[i].positions[1] );
		this.pentagons[i].rotations[3] = this.pentagons[i].rotations[1];
	}
	
	var copyUp = this.pentagons[1].positions[1].clone();
	copyUp.multiplyScalar(2);
	copyUp.y += edgeLen * 2;
	var copyAcross = this.pentagons[0].positions[1].clone();
	copyAcross.add( this.pentagons[2].positions[1] );
	copyAcross.y = 0;
	copyAcross.x *= 2;
	
	var symmetryCopyVectors = Array(numSymmetryCopies);
	for(var i = 0; i < symmetryCopyVectors.length; i++ )
	{
		symmetryCopyVectors[i] = new THREE.Vector3();
		if( i !== 3 && i !== 4 )
			symmetryCopyVectors[i].add(copyAcross);
		if( i < 4 )
			symmetryCopyVectors[i].negate();
		if( i !== 6 && i !== 1 )
			symmetryCopyVectors[i].add(copyUp);
		if( i !== 0 && i !== 3 && i !== 5)
			symmetryCopyVectors[i].y *= -1;
	}
	
	this.thins[0].positions[3].copy( this.thins[0].positions[2] );
	this.thins[0].rotations[3] = this.thins[0].rotations[2];
	this.thins[1].positions[3].copy( this.pentagons[4].positions[1] );
	this.thins[1].rotations[3] = -TAU / 20;
	this.thins[2].positions[3].copy( this.pentagons[0].positions[1] );
	this.thins[2].positions[3].y -= edgeLen * PHI;
	this.thins[2].rotations[3] = -TAU / 20 - TAU / 2;
	this.thins[3].positions[3].copy( this.pentagons[2].positions[1] );
	this.thins[3].positions[3].y += edgeLen * PHI;
	this.thins[3].rotations[3] = -TAU / 20;
	for(var i = numThinsInFundamentalDomain; i < this.thins.length; i++)
	{
		this.thins[i].positions[3].copy( this.thins[i%numThinsInFundamentalDomain].positions[3] );
		this.thins[i].positions[3].add( symmetryCopyVectors[ (i-numThinsInFundamentalDomain-i%numThinsInFundamentalDomain) / numThinsInFundamentalDomain ] )
		this.thins[i].rotations[3] = this.thins[i%numThinsInFundamentalDomain].rotations[3];
	}
	
	for(var i = 0; i < 8; i++)
		this.pentagons[i].positions[3].copy( this.pentagons[i].positions[2] );
	for(var i = 8; i < this.pentagons.length; i++)
	{
		this.pentagons[i].positions[3].copy( this.pentagons[i%8].positions[1] );
		this.pentagons[i].positions[3].add( symmetryCopyVectors[ (i-8-i%8) / 8 ] )
		this.pentagons[i].rotations[3] = this.pentagons[i%8].rotations[1];
	}
	
	//--------------4
	var horizontalSpacing = 0.9;
	var verticalSpacing = 0.8;
	
	for(var i = 0; i < 5; i++)
	{
		this.thicks[i].positions[4].x = horizontalSpacing * (i-2);
		this.thicks[i].positions[4].y = verticalSpacing * 3;
		this.thicks[i].rotations[4] = -TAU / 20 * 7;
		
		this.hexagons[i].positions[4].x = horizontalSpacing * (i-2);
		this.hexagons[i].positions[4].y = verticalSpacing * 1.5;
		this.hexagons[i].rotations[4] = -TAU / 20 * 7;
		
		this.thins[i].positions[4].x = horizontalSpacing * (i-2);
		this.thins[i].positions[4].y = -verticalSpacing * 0.7;
		this.thins[i].rotations[4] = -TAU / 10 * 3;
	}
	for(var i = 0; i < 6; i++)
	{
		this.pentagons[i].positions[4].x = horizontalSpacing * (i-2.5);
		this.pentagons[i].positions[4].y = -verticalSpacing * 2.2;
		this.pentagons[i].rotations[4] = -TAU / 10 * 4;
	}
	
	/*
	 * 0. "Pentagons are an unusual shape to see in a pattern": Eight pentagons, which replace the pentagons in the lovely picture that has the tree's shade.
	 * 1. "Fit together": the configuration in the picture
	 * 2. A few little ones in their gaps
	 * 3. Get a pattern like this one: the rest of the pattern comes in
	 * 4. after "that much symmetry", most of the pattern comes away leaving six pentagons and five thin rhombs, and some hexagons and thicks come in
	 * 5. "then arranged": thicks in a five
	 * 6. "to create ": hexagons in five
	 * 7. "Pentagonal symmetry": pentagons and thins in penrose tiling middle
	 */
	
	function copyPreviousStates( shapeArray, newState )
	{
		for(var i = 0; i < shapeArray.length; i++)
		{
			shapeArray[i].positions[newState].copy( shapeArray[i].positions[newState-1] );
			shapeArray[i].rotations[newState] = shapeArray[i].rotations[newState-1];
		}
	}
	
	
	//--------------5
	this.thicks[0].positions[5].copy(this.thicks[0].positions[4])
	this.thicks[0].positions[5].x = 0;
	this.thicks[0].rotations[5] = TAU / 20;
	for(var i = 1; i < 5; i++)
	{
		this.thicks[i].positions[5].copy(this.thicks[0].positions[5]);
		this.thicks[i].rotations[5] = this.thicks[0].rotations[5] + TAU / 5 * i;
	}
	
	copyPreviousStates( this.pentagons, 5 );
	copyPreviousStates( this.thins, 5 );
	copyPreviousStates( this.hexagons, 5 );
	
	//--------------6
	this.hexagons[0].positions[6].copy(this.hexagons[0].positions[5])
	this.hexagons[0].positions[6].x = 0;
	this.hexagons[0].positions[6].y -= 0.6;
	this.hexagons[0].rotations[6] = TAU / 20;
	for(var i = 1; i < 5; i++)
	{
		this.hexagons[i].positions[6].copy(this.hexagons[0].positions[6]);
		this.hexagons[i].rotations[6] = this.hexagons[0].rotations[6] + TAU / 5 * i;
	}
	
	copyPreviousStates( this.pentagons, 6 );
	copyPreviousStates( this.thins, 6 );
	copyPreviousStates( this.thicks, 6 );
	
	//--------------7
	this.pentagons[0].positions[7].copy( this.pentagons[0].positions[6] );
	this.pentagons[0].positions[7].x = -edgeLen / 2;
	this.pentagons[0].positions[7].y -= 0.4;
	this.pentagons[0].rotations[7] = 0;
	for(var i = 0; i < 5; i++)
	{
		this.pentagons[i+1].positions[7].copy( this.pentagons[0].positions[7] );
		this.pentagons[i+1].positions[7].add( basePentagon.shape.geometry.vertices[i] )
		this.pentagons[i+1].rotations[7] = 3/10*TAU-TAU / 5 * i;
		
		this.thins[i].positions[7].copy( this.pentagons[i+1].positions[7] );
		this.thins[i].rotations[7] = -TAU*4/10 - TAU / 5 * i;
	}
	
	copyPreviousStates( this.hexagons, 7 );
	copyPreviousStates( this.thicks, 7 );
}

pentagonDemo.update = function()
{
	var timePoints = [102,108,112.3,115,121.2,126.1,127.7, 131]; //these are the times when it is in that state
	var shapeMovementTime = 1.4;
	for(var i = 0; i < timePoints.length-1; i++)
		timePoints[i] += shapeMovementTime;
	
	for(var i = 0; i < timePoints.length-1; i++)
	{
		if( ( timePoints[i] <= our_CurrentTime && our_CurrentTime < timePoints[i+1] ) || i === timePoints.length-2 ) //go for the last one if you've run out
		{
//			console.log(i)
			for(var j = 0; j < this.fullShapeArray.length; j++ )
			{
				this.fullShapeArray[j].position.copy( move_smooth_vectors( this.fullShapeArray[j].positions[i], this.fullShapeArray[j].positions[i+1], shapeMovementTime, our_CurrentTime - (timePoints[i+1] - shapeMovementTime) ) );
				
				//siiigh, could have angle difficulty. Make sure you only ever <pi to the previous one
				var angleDifference = this.fullShapeArray[j].rotations[i+1] - this.fullShapeArray[j].rotations[i];
				this.fullShapeArray[j].rotation.z = this.fullShapeArray[j].rotations[i] + angleDifference * move_smooth( shapeMovementTime, our_CurrentTime - (timePoints[i+1] - shapeMovementTime) );
			}
			break;
		}
	}
}