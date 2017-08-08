/*
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
	
	var minorTubeRadius = 0.03;
	var majorTubeRadius = minorTubeRadius * 3;
	var bendRadius = minorTubeRadius * 2;
	var neckHeight = bendRadius * 3;
	
	kbSystem.kb = makeKB( minorTubeRadius, majorTubeRadius,bendRadius,neckHeight ); //repeat this line with whatever you like
	kbSystem.add(kbSystem.kb);
	
	kbSystem.diamond = new THREE.Mesh(new THREE.CylinderGeometry(0.0034,0.0034,0.01,4), new THREE.MeshBasicMaterial({color:0x000000, side: THREE.DoubleSide}));
	for(var i =0; i < kbSystem.diamond.geometry.vertices.length; i++)
	{
		kbSystem.diamond.geometry.vertices[i].applyAxisAngle(xAxis,TAU/4)
	}
	kbSystem.kb.add(kbSystem.diamond)
	kbSystem.diamond.orientation = 0;
	kbSystem.diamond.direction = 7/8*TAU;
	
	var oldXDirection = new THREE.Vector3(1,0,0);
	
	kbSystem.update = function(direction,orientation)
	{
		if( typeof orientation !== 'undefined')
		{
			this.diamond.orientation = orientation;
			this.diamond.direction = direction;
		}
		
//		console.log(this.diamond.orientation,this.diamond.direction)
		//the LOCATION of the diamond is the important thing. Its other features, eh. So you could be a bit fakey and have it range over 360
		
		if( kbPointGrabbed )
		{
			var stateAddition = clientPosition.clone();
			stateAddition.x -= kbSystem.position.x * 2;
			stateAddition.y -= kbSystem.position.y * 2; //makes an assumption here
			stateAddition.z = 0;
			stateAddition.setLength(0.007); //distance doesn't matter
			this.diamond.orientation += stateAddition.y;
			this.diamond.direction += stateAddition.x * 5; //much thinner
			
			if( this.diamond.orientation > Math.PI )
			{
				this.diamond.orientation -= Math.PI;
				this.diamond.direction = TAU / 4 - (this.diamond.direction-TAU/4);
			}
			if( this.diamond.orientation < 0 )
			{
				this.diamond.orientation += Math.PI;
				this.diamond.direction = TAU / 4 - (this.diamond.direction-TAU/4);
			}
			if(this.diamond.direction<0)
				this.diamond.direction += TAU;
			if(this.diamond.direction>=TAU)
				this.diamond.direction -= TAU;
		}
		
		if( this.diamond.position.distanceTo( kbSystem.kb.getPointOnKB( this.diamond.direction,this.diamond.orientation ) ) > 0.0025 )
			console.log( this.diamond.position.distanceTo( kbSystem.kb.getPointOnKB( this.diamond.direction,this.diamond.orientation ) ) )
		this.diamond.position.copy( kbSystem.kb.getPointOnKB( this.diamond.direction,this.diamond.orientation ) );
		
		var epsilon = 0.0001;
		var xDirection = this.kb.getPointOnKB( this.diamond.direction + epsilon, this.diamond.orientation ).sub(this.diamond.position).normalize();
		//The way it's cashed out is that there comes a point where this flips
		var yDirection = this.kb.getPointOnKB( this.diamond.direction, this.diamond.orientation + epsilon ).sub(this.diamond.position).normalize();
		var zDirection = xDirection.clone().cross(yDirection).normalize();
		xDirection.crossVectors(yDirection,zDirection).normalize();
		
		var newQuat = new THREE.Quaternion().setFromRotationMatrix( new THREE.Matrix4().makeBasis(xDirection, yDirection, zDirection) );;
		this.diamond.quaternion.copy( newQuat );
		
		var newQuatInverse = newQuat.clone().inverse();
		if( Math.abs( newQuatInverse.distanceTo( this.kb.quaternion ) - Math.PI/2 ) < 0.1 )
		{
			this.kb.quaternion.copy( newQuatInverse );
			var rotationAxis = yAxis.clone();
			this.kb.updateMatrix();
			var kbRotationMatrix = new THREE.Matrix4().extractRotation( this.kb.matrix );
			rotationAxis.applyMatrix4( kbRotationMatrix );
			this.kb.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(rotationAxis,Math.PI));
		}
		else
			this.kb.quaternion.copy( newQuatInverse );
		this.kb.position.set(0,0,0);
		this.kb.updateMatrix();
		var diamondPosition = (this.diamond.position.clone()).applyMatrix4(this.kb.matrix);
		this.kb.position.copy( diamondPosition.negate() );
	}
	
	return kbSystem;
}

function makeKB( minorTubeRadius, majorTubeRadius,bendRadius,neckHeight )
{
	var kb = new THREE.Mesh(
		new THREE.Geometry(), 
		new THREE.MeshPhongMaterial({
			transparent:true,
			opacity:0.7,
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
	kb.geometry.vertices = Array( (numTubePoints+1) * numRibs );
	kb.geometry.faces = Array( numTubePoints * numRibs * 2 );
	for( var i = 0; i < numTubePoints+1; i++)
	{
		for(var j = 0; j < numRibs; j++)
		{
			kb.geometry.vertices[i*numRibs+j] = kb.getPointOnKB( j / numRibs * TAU, i / numTubePoints * Math.PI )
			
			if(i<numTubePoints)
			{
				var TL = i*numRibs + j;
				var TR = i*numRibs + (j+1)%numRibs;
				var BL = (i+1)*numRibs + j
				var BR = (i+1)*numRibs + (j+1)%numRibs;
				
				//TODO at some point in the KB this flips, probably half way down the neck
				
				if(i / numTubePoints * Math.PI<1.6)
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
	
	return kb;
}