/*
 * Can't distinguish it from its own mirror image
 * So maybe have the direction change with the parachute?
 * 
 * A little diamond that turns around with some delay to look at your mouse and goes in that direction
 * And a little trail behind it
 * Keep it centerd
 * 
 * To position the camera:
 * 	Look at point's position
 * 	Get the position of two close by points cross product
 * 	Then lookAt. Might result in weirdness
 * Glider and field are children of camera
 * 
 * When you move around the kb purposefully, camera follows. If it's responding to glider system, not.
 * 
 * Touch somewhere on the glider side and a line will appear in the direction of travel.
	Move your mouse and it will change the direction.
 * So long as your mouse/finger is down, the glider will slowly turn in that direction
 */

function initKBSystem()
{
	var kbSystem = new THREE.Object3D();
	
	var minorTubeRadius = 0.026;
	var majorTubeRadius = minorTubeRadius * 3;
	var bendRadius = minorTubeRadius * 2;
	var neckHeight = bendRadius * 3;
	
	kb = makeKB( minorTubeRadius, majorTubeRadius,bendRadius,neckHeight ); //repeat this line with whatever you like
	kbSystem.add(kb);
	
	var diamond = new THREE.Mesh(new THREE.CylinderGeometry(0.0034,0.0034,0.004,4), new THREE.MeshBasicMaterial({color:0x000000, side: THREE.DoubleSide}));
	kbSystem.diamond = diamond;
	for(var i =0; i < diamond.geometry.vertices.length; i++)
	{
		diamond.geometry.vertices[i].applyAxisAngle(xAxis,TAU/4)
	}
	kb.add(diamond)
	diamond.orientation = 0;
	diamond.direction = 7/8*TAU;
	diamond.position.copy( kb.getPointOnKB( diamond.direction,diamond.orientation ) );
	diamond.flip = 1; //1 if right side up, -1 otherwise
	
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
	var trail = new THREE.LineSegments(new THREE.Geometry(), new THREE.LineBasicMaterial({color: 0x000000}) );
	for(var i = 0; i < trailSegments; i++)
		trail.geometry.vertices.push(
				diamond.position.clone(),
				diamond.position.clone() );
	kbSystem.resetTrail = function()
	{
		for(var i = 0, il = trail.geometry.vertices.length; i < il; i++)
			trail.geometry.vertices[i].copy(diamond.position);
	}
	kb.add(trail);
	
	var oldXDirection = new THREE.Vector3(1,0,0);
	
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
		 * The flip is what's causing the mapping of mirror images to not be the same.
		 * 
		 * Go around a mobius strip and you'll only get back to where you began (without going left or right) if you were in the center
		 * There are 2 places on the KB where that happens
		 * 
		 * Maybe you should just try and map it to the torus
		 * 
		 * You do have something wrong, rotating the glider 180 should bring you back to where you started
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
		
		if(!kbPointGrabbed)
			directionArrow.visible = false;
		
		if( typeof orientation !== 'undefined')
		{
			diamond.orientation = orientation;
			
			while( diamond.orientation > TAU )
				diamond.orientation -= TAU;
			while( diamond.orientation < 0 )
				diamond.orientation += TAU;
			
			diamond.flip = diamond.orientation > Math.PI ? -1:1;
			
			if( diamond.flip === 1 )
				diamond.direction = direction;
			else
				diamond.direction = TAU / 4 - (direction-TAU/4); 
		}
		else if( kbPointGrabbed )
		{
			var stateAddition = new THREE.Vector2(clientPosition.x,clientPosition.y);
			stateAddition.x -= kbSystem.position.x * 2;
			stateAddition.y -= kbSystem.position.y * 2; //makes an assumption here
			stateAddition.setLength(frameDelta/2); //distance doesn't matter
			
			directionArrow.rotation.z = stateAddition.angle() - TAU/4;
			directionArrow.visible = true;
			
			diamond.orientation += stateAddition.y;
			
			while( diamond.orientation > TAU )
				diamond.orientation -= TAU;
			while( diamond.orientation < 0 )
				diamond.orientation += TAU;
			
			var oldFlip = diamond.flip;
			diamond.flip = diamond.orientation > Math.PI ? -1:1;
			if( oldFlip !== diamond.flip ) 
				diamond.direction = TAU / 2 - diamond.direction;
			
			diamond.direction += stateAddition.x * 5 * diamond.flip;
		}
		else return;
		
		while(diamond.direction<0)
			diamond.direction += TAU;
		while(diamond.direction>=TAU)
			diamond.direction -= TAU;
		
		{
			diamond.position.copy( kb.getPointOnKB( diamond.direction,diamond.orientation ) );
			
			var epsilon = 0.0001;
			var xDirection = kb.getPointOnKB( diamond.direction + epsilon * diamond.flip, diamond.orientation ).sub(diamond.position).normalize();
			var yDirection = kb.getPointOnKB( diamond.direction, diamond.orientation + epsilon ).sub(diamond.position).normalize();
			var zDirection = xDirection.clone().cross(yDirection).normalize();
			xDirection.crossVectors(yDirection,zDirection).normalize();
			
			var newQuat = new THREE.Quaternion().setFromRotationMatrix( new THREE.Matrix4().makeBasis(xDirection, yDirection, zDirection) );;
			diamond.quaternion.copy( newQuat );
		}
		
		{
			trail.geometry.vertices[trailCurrentSegment * 2 + 1].copy(diamond.position);
			if( trailCurrentSegment !== 0)
				trail.geometry.vertices[trailCurrentSegment * 2 + 0].copy(trail.geometry.vertices[trailCurrentSegment * 2 - 1]);
			else
				trail.geometry.vertices[trailCurrentSegment * 2 + 0].copy(trail.geometry.vertices[trail.geometry.vertices.length - 1]);
			trail.geometry.verticesNeedUpdate = true;
			
			trailCurrentSegment++;
			if( trailCurrentSegment === trailSegments )
				trailCurrentSegment = 0;
		}
		
		if(kbPointGrabbed)
		{
			kb.quaternion.copy( newQuat );
			kb.quaternion.inverse();
			
			kb.position.set(0,0,0);
			kb.updateMatrix();
			var diamondPosition = (diamond.position.clone()).applyMatrix4(kb.matrix);
			kb.position.copy( diamondPosition.negate() );
		}
		
		if(kbPointGrabbed)
		{
			if(diamond.flip === 1)
				gliderSystem.update(diamond.direction,diamond.orientation)
			else
				gliderSystem.update(TAU / 2 - diamond.direction,diamond.orientation)
		}
	}
	
	return kbSystem;
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