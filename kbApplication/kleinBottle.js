/*
 * A little car that turns around with some delay to look at your mouse and goes in that direction
 * And a little trail behind it
 * Car must be kept centered -> kb moves around it
 * 
 * To position the camera:
 * 	Look at point's position
 * 	Get the position of two close by points cross product
 * 	Then lookAt. Might result in weirdness
 * Glider and field are children of camera
 * 
 * Touch somewhere on the glider side and a line will appear in the direction of travel.
	Move your mouse and it will change the direction.
 * So long as your mouse/finger is down, the glider will slowly turn in that direction
 */

var minorTubeRadius = 1;
var majorTubeRadius = minorTubeRadius * 3;
var bendRadius = majorTubeRadius - minorTubeRadius;
var neckHeight = bendRadius * 2;
var kb = initKB( minorTubeRadius, majorTubeRadius,bendRadius,neckHeight );

function initKB( minorTubeRadius, majorTubeRadius,bendRadius,neckHeight)
{
	var kb = new THREE.Mesh(
		new THREE.Geometry(), 
		new THREE.MeshPhongMaterial({
			transparent:true,
			opacity:0.7,
			side:THREE.DoubleSide})
	);
	
	//elegant thing with both would be to specify arcLengthDivisions, but eh
	neckCurve = new THREE.CubicBezierCurve3(
		new THREE.Vector3( minorTubeRadius, 0, 0 ),
		new THREE.Vector3( minorTubeRadius, 1, 0 ),
		new THREE.Vector3( majorTubeRadius, neckHeight - 1, 0 ),
		new THREE.Vector3( majorTubeRadius, neckHeight, 0 )
	);
	sweepCurve = new THREE.CubicBezierCurve3(
		new THREE.Vector3( 0, neckHeight, 0 ),
		new THREE.Vector3( 0, neckHeight - 1, 0 ),
		new THREE.Vector3( bendRadius * 2, 1, 0 ),
		new THREE.Vector3( bendRadius * 2, 0, 0 )
	);

	var geometry = new THREE.Geometry();
	geometry.vertices = curve.getPoints( 50 );
	
	//how much distance the point experiences on each of these
	var lengths = Array(4);
	var NECK = 0,RIM=1,SWEEP=2,BEND = 3;
	lengths[NECK] = neckCurve.getLength(); //comes first because it's an easy place to think about. You could add an extra little tube if the normals don't match
	lengths[RIM] = (majorTubeRadius - minorTubeRadius) / 2 * Math.PI;
	lengths[SWEEP] = sweepCurve.getLength();
	lengths[BEND] = bendRadius * Math.PI;
	
	tubeLength = 0;
	for(var i = 0; i < lengths.length; i++)
		tubeLength += lengths[i];
	
//	function postitionFromTubeCenterNearbyPointAndAngle(tubeCenter, nearbyPoint, angleAroundFromBackbone)
//	{
//		var positionOnTube = new THREE.Vector3();
//		
//		var tubeAxis = nearbyPoint.clone().sub(tubeCenter);
//		if(tubeAxis.equals(zeroVector))
//		{
//			console.error("oh dear")
//			return positionOnTube;
//		}
//		tubeAxis.normalize();
//		
//		positionOnTube.crossVectors(zAxis,tubeAxis);
//		positionOnTube.setLength(minorTubeRadius)
//		positionOnTube.applyAxisAngle(tubeAxis,angleAroundFromBackbone);
//		positionOnTube.add(tubeCenter);
//	}
//	
//	kb.getPointOnKB = function(direction, orientation)
//	{
//		while(orientation < 0)
//			orientation += Math.PI;
//		while(orientation > Math.PI)
//			orientation -= Math.PI;
//		
//		var angleAroundFromBackbone = direction + orientation;
//		while(angleAroundFromBackbone < 0)
//			angleAroundFromBackbone += TAU;
//		while(angleAroundFromBackbone > TAU)
//			angleAroundFromBackbone -= TAU;
//		
//		var lengthSoFar = 0;
//		var currentSegment = -1;
//		var proportionThroughSegment = -1;
//		var lengthAlongTotal = orientation / Math.PI * tubeLength;
//		for(var i = 0; i < 4; i++)
//		{
//			lengthSoFar += lengths[i]
//			if(lengthAlongTotal < lengthSoFar)
//			{
//				currentSegment = i;
//				proportionThroughSegment = (lengthAlongTotal - lengthSoFar)/lengths[i];
//				break;
//			}
//		}
////		if(currentSegment === -1 || 0>proportionThroughSegment || proportionThroughSegment>1 )
////			console.error("yo");
//		
//		var positionOnKB = new THREE.Vector3();
//		var epsilon = 0.0001;
//		var rimRadius = (majorTubeRadius-minorTubeRadius) / 2;
//		
//		//First two have symmetry about y and change radius, second two do not, so different methods
//		switch(currentSegment)
//		{
//		case NECK:
//			positionOnKB.copy( this.neckCurve.getPointAt(proportionThroughSegment) );
//			positionOnKB.applyAxisAngle(yAxis, direction);
//			break;
//			
//		case RIM:
//			positionOnKB.set(kb.rimRadius,0,0)
//			positionOnKB.applyAxisAngle(zAxis,-proportionThroughSegment * Math.PI);
//			positionOnKB.x += kb.majorTubeRadius - kb.rimRadius;
//			positionOnKB.y += kb.neckHeight;
//			positionOnKB.applyAxisAngle(yAxis, direction);
//			break;
//			
//		case SWEEP:
//			var tubeCenter = this.sweepCurve.getPointAt( proportionThroughSegment );
//			var nearbyPoint = this.sweepCurve.getPointAt( proportionThroughSegment - epsilon ); //pointing up
//			
//			positionOnKB.copy( postitionFromTubeCenterNearbyPointAndAngle(tubeCenter, nearbyPoint, angleAroundFromBackbone) );
//			break;
//			
//		case BEND:
//			var tubeCenter = new THREE.Vector3(bendRadius, 0, 0).applyAxisAngle(zAxis,-proportionThroughSegment*Math.PI);
//			var nearbyPoint = tubeCenter.clone().applyAxisAngle(zAxis,epsilon);
//			
//			positionOnKB.copy( postitionFromTubeCenterNearbyPointAndAngle(tubeCenter, nearbyPoint, angleAroundFromBackbone) );
//			break;
//		}
//		
//		return positionOnKB;
//	}
	
	var numRibs = 16;
	var numTubePoints = 300;
	kb.geometry.vertices = Array( (numTubePoints+1) * numRibs );
	kb.geometry.faces = Array( numTubePoints * numRibs * 2 );
	for( var i = 0; i < numTubePoints+1; i++)
	{
		for(var j = 0; j < numRibs; j++)
		{
			kb.geometry.vertices[i*numRibs+j] = getPointOnKB( j / numRibs * TAU, i / numTubePoints * Math.PI )
			
			if(i<numTubePoints)
			{
				kb.geometry.faces[ (i*numRibs+j)*2+0 ] = new THREE.Face3(
						i*numRibs + j,
						i*numRibs + (j+1)%numRibs,
						(i+1)*numRibs + j
				);
				kb.geometry.faces[ (i*numRibs+j)*2+0 ] = new THREE.Face3(
						i*numRibs + (j+1)%numRibs,
						(i+1)*numRibs + (j+1)%numRibs,
						(i+1)*numRibs + j
				);
			}
		}
	}
	
	return kb;
}