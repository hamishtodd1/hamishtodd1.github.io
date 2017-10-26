/*
 * Current thinking state is: Flip is ok, because it's what the neurons do.
 * This does mean having the discontinuity on the right
 * 		When you're moving the glider continuously, there will be a jump, and when you move the diamond continuously, there will be a flip
 * 			(unless you're going directly forward, which corresponds to lots of neurons firing)
 * 		And that's ok because the neurons are like that
 * 		Still doesn't feel very good
 * 
 * There should be angular momentum btw, and your state change gives you acceleration
 * How about when you have the flip, the glider contracts then expands.
 * "This flipping of the glider is obviously not something that happens in real life, but it does sort of happen in your brain."
 * 	but whyyyyy would it have an effect on how the neurons register travel direction?
 * That flip says: "a discontinuity just happened". So another flip and sound effect for moving the kb and having the directionarrow change
 * 
 * When you move the point around on the bottle, something is happenning that never happens in real life, which is the neurons are determining the sight they see
 * 
 * Hey Brady, ask me if it was hard to make this
 * 
 * Deffo use 20T, because you can say "the icosahedron is made of 20 triangles and we need to work out the number in one triangle"
 * Profundity note: maybe people make their own profundity from the story that matters to them, and you can't control that. So you make little things, and they make their own thing
 * 
 * But still you're not sure why the sight seems to correspond to T2 instead of RP1xS1
 * 
 * where's francesco?

	TODO
	maybe get high quality pictures for kb
	Find out which alg is the high dimensionality one
	Put all of them into powerpoint to organize them
	aperture problem animation?
	Make a t=1 out of sonobe
 */

function initKBSystem()
{
	var kbSystem = new THREE.Object3D();
	
	var minorTubeRadius = 0.026;
	var majorTubeRadius = minorTubeRadius * 3;
	var bendRadius = minorTubeRadius * 2;
	var neckHeight = bendRadius * 3;
	
	var kb = makeKB( minorTubeRadius, majorTubeRadius,bendRadius,neckHeight ); //repeat this line with whatever you like
	kbSystem.add(kb);
	
	var diamond = new THREE.Mesh(new THREE.CylinderGeometry(0.0034,0.0034,0.009,4), new THREE.MeshBasicMaterial({color:0x000000, side: THREE.DoubleSide}));
	kbSystem.diamond = diamond;
	for(var i =0; i < diamond.geometry.vertices.length; i++)
	{
		diamond.geometry.vertices[i].applyAxisAngle(xAxis,TAU/4)
	}
	kb.add(diamond)
	diamond.position.copy( kb.getPointOnKB( diamond.direction,diamond.orientation ) );
	diamond.flip = 1; //1 if right side up, -1 otherwise
	
	diamond.orientation = TAU / 8;
	diamond.direction = -TAU/8;
	
	var kbDestinationQuaternion = kb.quaternion.clone();
	var lastSpecifiedDiamondPosition = diamond.position.clone();
	var lastDiamondPosition = diamond.position.clone();
	
	//----arrow shit
	{
		var directionArrow = new THREE.Mesh( new THREE.Geometry(), new THREE.MeshBasicMaterial({color: 0xFF0000, side:THREE.DoubleSide}) );
		var full_length = 0.02;
		var head_length = full_length / 3;
		var head_width = head_length / (Math.sqrt(3) / 2);
		var body_width = head_width / 2.8;
		
		directionArrow.geometry.vertices.push(
			new THREE.Vector3( 0, full_length, 0 ),
			new THREE.Vector3( head_width / 2, full_length - head_length, 0 ),
			new THREE.Vector3(-head_width / 2, full_length - head_length, 0 )
		);
		directionArrow.geometry.faces.push(new THREE.Face3(0,2,1));
		
		directionArrow.geometry.vertices.push(
				new THREE.Vector3(-body_width / 2, full_length - head_length, 0 ),
				new THREE.Vector3( body_width / 2, full_length - head_length, 0 ),
				new THREE.Vector3(-body_width / 2, 0, 0 ),
				new THREE.Vector3( body_width / 2, 0, 0 )
			);
		directionArrow.geometry.faces.push(new THREE.Face3(3,6,4));
		directionArrow.geometry.faces.push(new THREE.Face3(5,6,3));
		directionArrow.position.z+=0.001
		
		diamond.add(directionArrow);
	}
	
	var trailCurrentSegment = 0;
	var trailSegments = 600;
	var trail;
	var trailThickness = 0;
	var trailCylinderSides = 16;
	if( trailThickness == 0)
	{
		trail = new THREE.LineSegments(new THREE.Geometry(), new THREE.LineBasicMaterial({color: 0x000000}) );
		for(var i = 0; i < trailSegments; i++)
			trail.geometry.vertices.push(
					diamond.position.clone(),
					diamond.position.clone() );
	}
	else
	{
		trail = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color: 0x000000}) );
		trail.geometry.vertices = Array(trailCylinderSides*2);
		trail.geometry.faces = Array(trailCylinderSides*2);
		var firstVertexIndex = 0;
		for(var i = 0; i < trailSegments; i++)
		{
			for( var j = 0; j < trailCylinderSides; j++)
			{
				trail.geometry.vertices[firstVertexIndex+j*2  ] = new THREE.Vector3();
				trail.geometry.vertices[firstVertexIndex+j*2+1] = new THREE.Vector3();
				
				trail.geometry.faces[firstVertexIndex+j*2 ] = new THREE.Face3(
					firstVertexIndex +  j*2+1,
					firstVertexIndex +  j*2+0,
					firstVertexIndex + (j*2+2) % (trailCylinderSides*2) );
				
				trail.geometry.faces[firstVertexIndex+j*2+1 ] = new THREE.Face3(
					firstVertexIndex +  j*2+1,
					firstVertexIndex + (j*2+2) % (trailCylinderSides*2),
					firstVertexIndex + (j*2+3) % (trailCylinderSides*2) );
			}
			firstVertexIndex += trailCylinderSides * 2;
		}
	}
	kbSystem.resetTrail = function()
	{
		for(var i = 0, il = trail.geometry.vertices.length; i < il; i++)
			trail.geometry.vertices[i].copy(diamond.position);
	}
	kb.add(trail);
	
	var oldXDirection = new THREE.Vector3(1,0,0);
	
	function setDiamondDirection(newDirection)
	{
		diamond.direction = newDirection;
		
		while(diamond.direction<0)
			diamond.direction += TAU;
		while(diamond.direction>=TAU)
			diamond.direction -= TAU;
	}
	
	function setDiamondOrientationAndFlipAndReturnFlipChange(newOrientation)
	{
		diamond.orientation = newOrientation;
		
		while(diamond.orientation<0)
			diamond.orientation += TAU;
		while(diamond.orientation>=TAU)
			diamond.orientation -= TAU;
		
		var oldFlip = diamond.flip;
		diamond.flip = diamond.orientation > Math.PI ? -1:1;
		return oldFlip !== diamond.flip;
	}
	
	kbSystem.update = function(direction,orientation)
	{
		/* change the trail to cylinders
		 * 
		 * ------Below might be useless!
		 * should the flip be necessary? Certainly if you didn't have ranging over full tau it shouldn't
		 * The flip should be a good thing, something that allows you to model the state correctly
		 * maybe holding control and rotating will rotate them simultaneously, which you see does nothing
		 * well so long as getPointOnKB maps it to the right place it's probably fine
		 * 
		 * Maybe the parachute should should flip, and that compensates for the direction flip
		 * 
		 * shouldn't a 180 of the glider be a closed loop? No, only if the *whole* situation is equal to its own mirror image
		 * 
		 * Go around a mobius strip and you'll only get back to where you began (without going left or right) if you were in the center
		 * There are 2 places on the KB where that happens
		 * 
		 * If you look at the mirror image, the direction will be mapped to points going in the opposite direction
		 * Possibly: direction is measured as an angle from the forward (makes sense as they generally believe forward is the neuron expectation).
		 * And somewhere between a state and its mirror image, a particular direction becomes the negative
		 * 
		 * Saying "I know which side of the bottle you're on" *is* the same as saying "I know the direction the paraglider is pointing in"
		 * And it is this "you can reach the other side" that is the argument for why we have a kb
		 * 
		 * When you grab the glider or bg, a red spot appears in the current diamond location
		 */
		
		if( typeof orientation !== 'undefined')
		{
			setDiamondOrientationAndFlipAndReturnFlipChange( orientation );
			
//			if( diamond.flip !== 1 )
//				setDiamondDirection( TAU / 2 - direction );
//			else
				setDiamondDirection( direction );
		}
		else if( kbPointGrabbed )
		{
			var stateAddition = new THREE.Vector2(clientPosition.x,clientPosition.y);
			stateAddition.x -= kbSystem.position.x * 2;
			stateAddition.y -= kbSystem.position.y * 2; //makes an assumption here
			var maxAddition = frameDelta/2;
			if(stateAddition.length()>maxAddition)
				stateAddition.setLength(maxAddition);
			
			if( setDiamondOrientationAndFlipAndReturnFlipChange( diamond.orientation + stateAddition.y ) ) 
				setDiamondDirection( TAU / 2 - diamond.direction + stateAddition.x * 5 * diamond.flip );
			else
				setDiamondDirection( diamond.direction + stateAddition.x * 5 * diamond.flip );
			
//			if(diamond.flip !== 1)
//				gliderSystem.update(TAU / 2 - diamond.direction,diamond.orientation)
//			else
				gliderSystem.update(diamond.direction,diamond.orientation);
		}
		
		//-----Responding to the above
		{
			directionArrow.visible = kbPointGrabbed;
			if( kbPointGrabbed )
				directionArrow.rotation.z = stateAddition.angle() - TAU/4;
			
			lastDiamondPosition.copy(diamond.position)
			diamond.position.copy( kb.getPointOnKB( diamond.direction,diamond.orientation ) );
			
			//are these always guaranteed to give you the points you want?
			var epsilon = 0.0001;
			var xDirection = kb.getPointOnKB( diamond.direction + epsilon * diamond.flip, diamond.orientation ).sub(diamond.position).normalize();
			var yDirection = kb.getPointOnKB( diamond.direction, diamond.orientation + epsilon ).sub(diamond.position).normalize();
			var zDirection = xDirection.clone().cross(yDirection).normalize();
			xDirection.crossVectors(yDirection,zDirection).normalize();
			
			var newQuat = new THREE.Quaternion().setFromRotationMatrix( new THREE.Matrix4().makeBasis(xDirection, yDirection, zDirection) );
			diamond.quaternion.copy( newQuat );
			
			if(kbPointGrabbed) //rotating kb. We do it this way because gamefeel and also don't want to jerk when you grab the glider
			{
				lastSpecifiedDiamondPosition.copy( diamond.position );
				kbDestinationQuaternion.copy(newQuat).inverse();
			}
			
			var currentKBPosition = kb.position.clone();
			kb.position.set(0,0,0);
			kb.updateMatrix();
			var kbDestination = lastSpecifiedDiamondPosition.clone().applyMatrix4(kb.matrix).negate();
			kb.position.lerpVectors( currentKBPosition,kbDestination,0.1 );
			
			kb.quaternion.slerp( kbDestinationQuaternion, frameDelta * 2.4 );
			
			{
				diamond.material.color.r -= frameDelta * 2;
				if( diamond.material.color.r < 0 )
					diamond.material.color.r = 0;
				diamond.material.color.setRGB(diamond.material.color.r,diamond.material.color.r,diamond.material.color.r);
				diamond.material.needsUpdate = true;
				
				diamond.scale.setScalar( 1 + diamond.material.color.r * 1.9 );
//				diamond.position.x += Math.sin(timeSinceStart / TAU) * diamond.material.color.r;
			}

			if( kbPointGrabbed || bgGrabbed || gliderGrabbed )
			{
				if(trailThickness === 0)
				{
					trail.geometry.vertices[trailCurrentSegment * 2 + 1].copy(diamond.position);
					trail.geometry.vertices[trailCurrentSegment * 2 + 0].copy( lastDiamondPosition );
				}
				else
				{
					insertCylindernumbers( diamond.position, lastDiamondPosition,
							trail.geometry.vertices, trailCylinderSides, trailCurrentSegment * trailCylinderSides * 2, trailThickness );
				}
				trail.geometry.verticesNeedUpdate = true;
				
				trailCurrentSegment++;
				if( trailCurrentSegment === trailSegments )
					trailCurrentSegment = 0;
			}
		}
	}
	
	return kbSystem;
}

function randomPerpVector(OurVector){
	var PerpVector = new THREE.Vector3();
	
	if( OurVector.equals(zAxis))
		PerpVector.crossVectors(OurVector, yAxis);
	else
		PerpVector.crossVectors(OurVector, zAxis);
	
	return PerpVector;
}
function insertCylindernumbers(A,B, verticesArray, cylinderSides, arrayStartpoint, radius ) {
	var aToB = new THREE.Vector3(B.x-A.x, B.y-A.y, B.z-A.z);
	aToB.normalize();
	var perp = randomPerpVector(aToB);
	perp.normalize(); 
	for( var i = 0; i < cylinderSides; i++)
	{
		var radiuscomponent = perp.clone();
		radiuscomponent.multiplyScalar(radius);
		radiuscomponent.applyAxisAngle(aToB, i * TAU / cylinderSides);
		
		verticesArray[arrayStartpoint + i*2 ].copy(radiuscomponent);
		verticesArray[arrayStartpoint + i*2 ].add(A);
		
		verticesArray[arrayStartpoint + i*2+1 ].copy(radiuscomponent);
		verticesArray[arrayStartpoint + i*2+1 ].add(B);
	}
}

function makeKB( minorTubeRadius, majorTubeRadius,bendRadius,neckHeight )
{
	var kb = new THREE.Mesh(
		new THREE.Geometry(), 
		new THREE.MeshPhongMaterial({
			transparent:true,
			opacity:0.9,
			color: 0xE0B7A3,
			shininess: 10,
			side:THREE.DoubleSide})
	);
	
	//elegant thing with both would be to specify arcLengthDivisions, but eh
	var controlLineLength = 0.06;
	kb.neckCurve = new THREE.CubicBezierCurve3(
		new THREE.Vector3( minorTubeRadius, 0, 0 ),
		new THREE.Vector3( minorTubeRadius, controlLineLength, 0 ),
		new THREE.Vector3( majorTubeRadius, neckHeight - controlLineLength, 0 ),
		new THREE.Vector3( majorTubeRadius, neckHeight, 0 )
	);
	kb.sweepCurve = new THREE.CubicBezierCurve3(
		new THREE.Vector3( 0, neckHeight, 0 ),
		new THREE.Vector3( 0, neckHeight - controlLineLength, 0 ),
		new THREE.Vector3( bendRadius * 2, controlLineLength, 0 ),
		new THREE.Vector3( bendRadius * 2, 0, 0 )
	);
	
	//how much distance the point experiences on each of these
	var lengths = Array(4);
	var NECK = 0,RIM=1,SWEEP=2,BEND = 3;
	lengths[NECK] = kb.neckCurve.getLength(); //comes first because it's an easy place to think about. You could add an extra little tube if the normals don't match
	lengths[RIM] = (majorTubeRadius - minorTubeRadius) / 2 * Math.PI;
	lengths[SWEEP] = kb.sweepCurve.getLength();
	lengths[BEND] = bendRadius * Math.PI;
	
	//wouldn't be too hard to "build" it by tweaking parameters
	
	var tubeLength = 0;
	for(var i = 0; i < lengths.length; i++)
		tubeLength += lengths[i];
	
	function postitionFromTubeCenterNearbyPointAndAngle(tubeCenter, nearbyPoint, angleAroundFromBackbone)
	{
		var positionOnTube = new THREE.Vector3();
		
		var tubeAxis = nearbyPoint.clone().sub(tubeCenter);
		if(tubeAxis.equals(zeroVector))
		{
			console.error("oh dear")
			return positionOnTube;
		}
		tubeAxis.normalize();
		
		positionOnTube.crossVectors(tubeAxis,zAxis);
		positionOnTube.setLength(minorTubeRadius)
		positionOnTube.applyAxisAngle(tubeAxis,angleAroundFromBackbone);
		positionOnTube.add(tubeCenter);
		
		return positionOnTube;
	}
	
	kb.getPointOnKB = function(direction, orientation)
	{
		while( orientation < 0 )
			orientation += Math.PI;
		while( orientation > Math.PI )
			orientation -= Math.PI;
		
		var angleAroundFromBackbone = direction;// + orientation; 
		while(angleAroundFromBackbone < 0)
			angleAroundFromBackbone += TAU;
		while(angleAroundFromBackbone > TAU)
			angleAroundFromBackbone -= TAU;
		
		var lengthSoFar = 0;
		var currentSegment = -1;
		var proportionThroughSegment = -1;
		var lengthAlongTotal = orientation / Math.PI * tubeLength;
		for(var i = 0; i < 4; i++)
		{
			lengthSoFar += lengths[i];
			if(lengthAlongTotal <= lengthSoFar)
			{
				currentSegment = i;
				proportionThroughSegment = (lengthAlongTotal - lengthSoFar + lengths[i] ) / lengths[i];
				break;
			}
		}
		
		var positionOnKB = new THREE.Vector3();
		var epsilon = 0.0001;
		var rimRadius = (majorTubeRadius-minorTubeRadius) / 2;
		
		//First two have symmetry about y and change radius, second two do not, so different methods
		switch(currentSegment)
		{
		case NECK:
			positionOnKB.copy( kb.neckCurve.getPointAt(proportionThroughSegment) );
			positionOnKB.applyAxisAngle(yAxis, angleAroundFromBackbone);
			break;
			
		case RIM:
			positionOnKB.set(rimRadius,0,0)
			positionOnKB.applyAxisAngle(zAxis,proportionThroughSegment * Math.PI);
			positionOnKB.y *= 1.4;
			positionOnKB.x += majorTubeRadius - rimRadius;
			positionOnKB.y += neckHeight;
			positionOnKB.applyAxisAngle(yAxis, angleAroundFromBackbone);
			break;
			
		case SWEEP:
			var tubeCenter = kb.sweepCurve.getPointAt( proportionThroughSegment );
			var nearbyPoint = kb.sweepCurve.getPointAt( proportionThroughSegment - epsilon ); //pointing up
			
			positionOnKB.copy( postitionFromTubeCenterNearbyPointAndAngle(tubeCenter, nearbyPoint, angleAroundFromBackbone) );
			break;
			
		case BEND:
			var tubeCenter = new THREE.Vector3(bendRadius, 0, 0).applyAxisAngle(zAxis,-proportionThroughSegment*Math.PI);
			var nearbyPoint = tubeCenter.clone().applyAxisAngle(zAxis,epsilon);
			tubeCenter.x += bendRadius;
			nearbyPoint.x += bendRadius;
			
			positionOnKB.copy( postitionFromTubeCenterNearbyPointAndAngle(tubeCenter, nearbyPoint, angleAroundFromBackbone) );
			break;
		}
		
		return positionOnKB;
	}
	
	var numRibs = 64;
	var numTubePoints = 80;
	kb.geometry.vertices = Array( (numTubePoints+1) * (numRibs+1) );
	kb.geometry.faces = Array( numTubePoints * numRibs * 2 );
	for( var i = 0; i < numTubePoints+1; i++)
	{
		for(var j = 0; j < numRibs+1; j++)
		{
			kb.geometry.vertices[i*numRibs+j] = new THREE.Vector3();
		}
	}
	
	function setKBVertices(lengthCompleteness,widthCompleteness) //change as you scroll down? And then when you click it goes back up. It's the mobius that people want to see
	{	
		for( var i = 0; i < numTubePoints+1; i++)
		{
			for(var j = 0; j < numRibs+1; j++)
			{
				kb.geometry.vertices[i*(numRibs+1)+j] = kb.getPointOnKB( j / numRibs * TAU * widthCompleteness, i / numTubePoints * Math.PI * lengthCompleteness )
				
				if(i<numTubePoints && j<numRibs)
				{
					var TL = i*(numRibs+1) + j;
					var TR = i*(numRibs+1) + (j+1);
					var BL = (i+1)*(numRibs+1) + j
					var BR = (i+1)*(numRibs+1) + (j+1);
					
					if(i / numTubePoints * Math.PI<1.6) //flip occurs in the part you can't see
					{
						kb.geometry.faces[ (i*numRibs+j)*2+0 ] = new THREE.Face3( TL, TR, BL );
						kb.geometry.faces[ (i*numRibs+j)*2+1 ] = new THREE.Face3( TR, BR, BL );
					}
					else
					{
						kb.geometry.faces[ (i*numRibs+j)*2+0 ] = new THREE.Face3( TL, BL, TR );
						kb.geometry.faces[ (i*numRibs+j)*2+1 ] = new THREE.Face3( TR, BL, BR );
					}
				}
			}
		}
		
		kb.geometry.computeFaceNormals();
		kb.geometry.computeVertexNormals();
	}
	
	setKBVertices(1,1);
	
	return kb;
}