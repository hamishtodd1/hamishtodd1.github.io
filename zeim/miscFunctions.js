//to be called every frame from the start. Must be called at the veeeery top
function checkForNewGlobals()
{
	if( typeof numGlobalVariables === 'undefined')
	{
		numGlobalVariables = Object.keys(window).length + 1;
	}
	else if( numGlobalVariables > Object.keys(window).length)
	{
		console.log("new global variable(s): ")
		for(var i = numGlobalVariables; i < Object.keys(window).length; i++ )
		{
			if( Object.keys(window)[i] !== location && //these ones are ok
				Object.keys(window)[i] !== name &&
				Object.keys(window)[i] !== window &&
				Object.keys(window)[i] !== self &&
				Object.keys(window)[i] !== document )
				console.log( Object.keys(window)[i] );
		}
		numGlobalVariables = Object.keys(window).length + 1;
	}	
}

function moduloWithNegatives(a,n)
{
	if(n<=0)
	{
		console.log("errrm")
		return a;
	}
	while( a < 0 ) a += n;
	return a % n;
}

function ArrowGeometry()
{
	var geo = new THREE.Geometry();
	var fullLength = 0.02;
	var headLength = fullLength / 3;
	var headWidth = headLength / (Math.sqrt(3) / 2);
	var bodyWidth = headWidth / 2.8;
	
	geo.vertices.push(
		new THREE.Vector3( 0, fullLength, 0 ),
		new THREE.Vector3( headWidth / 2, fullLength - headLength, 0 ),
		new THREE.Vector3(-headWidth / 2, fullLength - headLength, 0 )
	);
	geo.faces.push(new THREE.Face3(0,2,1));
	
	geo.vertices.push(
			new THREE.Vector3(-bodyWidth / 2, fullLength - headLength, 0 ),
			new THREE.Vector3( bodyWidth / 2, fullLength - headLength, 0 ),
			new THREE.Vector3(-bodyWidth / 2, 0, 0 ),
			new THREE.Vector3( bodyWidth / 2, 0, 0 )
		);
	geo.faces.push(new THREE.Face3(3,6,4));
	geo.faces.push(new THREE.Face3(5,6,3));
	
	diamond.add(geo);
}

function getRandomColor()
{
	return new THREE.Color(Math.random(),Math.random(),Math.random())
}

function getHighestValueInArray(array)
{
	var highestValue = -Infinity;
	var index = null;
	for(var i = 0, il = array.length; i<il;i++)
	{
		if(array[i]>highestValue)
		{
			highestValue = array[i];
			index = i;
		}
	}
	return index;
}
function getHighestFunctionCallResult()
{
	console.error("switch to extreme")
}
function getClosestPointToPoint(point,array)
{
	var nearestVertexIndex = null;
	var closestDistance = Infinity;
	for(var i = 0; i < array.length; i++ )
	{
		if(array[i].distanceToSquared(point) < closestDistance)
		{
			nearestVertexIndex = i;
			closestDistance = array[i].distanceToSquared(point);
		}
	}
	return nearestVertexIndex;
}
//look, it's just about closeness
function getExtremeFunctionCallResult(array, functionName,lowest)
{
	var extremeValue = lowest ? Infinity : -Infinity;
	var index = null;
	for(var i = 0, il = array.length; i<il;i++)
	{
		var result = array[i][functionName]();
		if( 	( lowest && result < extremeValue ) 
			|| 	(!lowest && result > extremeValue ) )
		{
			extremeValue = result;
			index = i;
		}
	}
	return index;
}

function pointCylinder(cylinderMesh, end)
{
	var endLocal = end.clone();
	cylinderMesh.parent.worldToLocal(endLocal)
	var startToEnd = endLocal.clone().sub(cylinderMesh.position);
	cylinderMesh.scale.set(1,startToEnd.length(),1);
	cylinderMesh.quaternion.setFromUnitVectors(yUnit,startToEnd.normalize());
	cylinderMesh.quaternion.normalize();
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

function basicallyEqual(a,b)
{
	return Math.abs(a-b) <= 0.0000001;
}

THREE.CylinderBufferGeometryUncentered = function(radius, length, radiusSegments, capped)
{
	if(!radius)
	{
		radius = 1;
	}
	if(!length)
	{
		length = 1;
	}
	if( !radiusSegments )
	{
		radiusSegments = 8;
	}
	if(!capped)
	{
		capped = false;
	}
	var geometry = new THREE.CylinderBufferGeometry(radius, radius, length,radiusSegments,1,!capped);
	for(var i = 0, il = geometry.attributes.position.array.length / 3; i < il; i++)
	{
		geometry.attributes.position.array[i*3+1] += length / 2;
	}
	return geometry;
}

function randomPerpVector(ourVector)
{
	var perpVector = ourVector.clone();
	perpVector.clone().normalize();
	
	if( Math.abs(perpVector.dot(zUnit)-1) < 0.001 || Math.abs(perpVector.dot(zUnit)+1) < 0.001 )
	{
		perpVector.crossVectors(ourVector, yUnit);
	}
	else
	{
		perpVector.crossVectors(ourVector, zUnit);
	}
	
	return perpVector;
}

function frameDimensionsAtZDistance(camera,z)
{
	var cameraFovRadians = camera.fov*TAU/360;
	var dimensions = {
		height: 2 * Math.tan(cameraFovRadians/2) * z,
		width: 	2 * Math.tan(cameraFovRadians/2) * z * camera.aspect,
	}
	return dimensions;
}

THREE.Quaternion.prototype.distanceTo = function(q2)
{
	var theta = Math.acos(this.w*q2.w + this.x*q2.x + this.y*q2.y + this.z*q2.z);
	if (theta>Math.PI/2) theta = Math.PI - theta;
	return theta;
}
THREE.Quaternion.prototype.multiplyScalar = function(s)
{
	this.x *= s;
	this.y *= s;
	this.z *= s;
	this.w *= s;
	return this;
}
THREE.Quaternion.prototype.sub = function(q)
{
	this.x -= q.x;
	this.y -= q.y;
	this.z -= q.z;
	this.w -= q.w;
	return this;
}
THREE.Quaternion.prototype.add = function(q)
{
	this.x += q.x;
	this.y += q.y;
	this.z += q.z;
	this.w += q.w;
	return this;
}
THREE.Quaternion.prototype.ToVector4 = function(q2)
{
	return new THREE.Vector4(this.x,this.y,this.z,this.w);
}
THREE.Vector4.prototype.fromQuaternion = function(q)
{
	this.x = q.x;
	this.y = q.y;
	this.z = q.z;
	this.w = q.w;
}

THREE.Face3.prototype.getCorner = function(i)
{
	switch(i)
	{
	case 0:
		return this.a;
	case 1:
		return this.b;
	case 2:
		return this.c;
	}
}

function sq(x)
{
	return x*x;
}

THREE.EfficientSphereBufferGeometry = function(radius, sphericality)
{
	if(sphericality === undefined)
	{
		sphericality = 1;
	}
	return new THREE.IcosahedronBufferGeometry(radius, sphericality);
}
THREE.EfficientSphereGeometry = function(radius, sphericality)
{
	if(sphericality === undefined)
	{
		sphericality = 1;
	}
	return new THREE.IcosahedronGeometry(radius, sphericality);
}
THREE.Vector3.prototype.addArray = function(array)
{
	this.x += array[0];
	this.y += array[1];
	this.z += array[2];
}

THREE.Vector3.prototype.localToWorld = function(object)
{
	object.localToWorld(this);
}
THREE.Vector3.prototype.worldToLocal = function(object)
{
	object.worldToLocal(this);
}

THREE.Face3.prototype.addOffset = function(offset)
{
	this.a += offset;
	this.b += offset;
	this.c += offset;
}

function getStandardFunctionCallString(myFunc)
{
    return myFunc.toString().split("\n",1)[0].substring(9);
}

function clamp(value, min, max)
{
	if(value < min)
	{
		return min;
	}
	else if(value > max )
	{
		return max;
	}
	else
	{
		return value;
	}
}

function getPlatform()
{
	var platform = "desktop";
			
	if( ((function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))return true})(navigator.userAgent||navigator.vendor||window.opera)) )
		platform = "mobile";

	else if( ((function(a){if(/ipad|android.+\d safari|tablet/i.test(a))return true})(navigator.userAgent||navigator.vendor||window.opera)) )
		platform = "tablet";

	return platform;
}

function tetrahedronTop(P1,P2,P3, r1,r2,r3) {
	P3.sub(P1);
	P2.sub(P1);
	var cos_P3_P2_angle = P3.dot(P2)/P2.length()/P3.length();
	var sin_P3_P2_angle = Math.sqrt(1-cos_P3_P2_angle*cos_P3_P2_angle);
	
	var P1_t = new THREE.Vector3(0,0,0);
	var P2_t = new THREE.Vector3(P2.length(),0,0);
	var P3_t = new THREE.Vector3(P3.length() * cos_P3_P2_angle, P3.length() * sin_P3_P2_angle,0);
	
	var cp_t = new THREE.Vector3(0,0,0);
	cp_t.x = ( r1*r1 - r2*r2 + P2_t.x * P2_t.x ) / ( 2 * P2_t.x );
	cp_t.y = ( r1*r1 - r3*r3 + P3_t.x * P3_t.x + P3_t.y * P3_t.y ) / ( P3_t.y * 2 ) - ( P3_t.x / P3_t.y ) * cp_t.x;
	if(r1*r1 - cp_t.x*cp_t.x - cp_t.y*cp_t.y < 0) {
		console.error("Impossible tetrahedron");
		return false;			
	}
	cp_t.z = Math.sqrt(r1*r1 - cp_t.x*cp_t.x - cp_t.y*cp_t.y);
	
	var cp = new THREE.Vector3(0,0,0);
	
	var z_direction = new THREE.Vector3();
	z_direction.crossVectors(P2,P3);
	z_direction.normalize(); 
	z_direction.multiplyScalar(cp_t.z);
	cp.add(z_direction);
	
	var x_direction = P2.clone();
	x_direction.normalize();
	x_direction.multiplyScalar(cp_t.x);
	cp.add(x_direction);
	
	var y_direction = new THREE.Vector3();
	y_direction.crossVectors(z_direction,x_direction);
	y_direction.normalize();
	y_direction.multiplyScalar(cp_t.y);
	cp.add(y_direction);		
	cp.add(P1);
	
	P2.add(P1);
	P3.add(P1);
	
	return cp;
}

THREE.OriginCorneredPlaneGeometry = function(width,height)
{
	var g = new THREE.PlaneGeometry(1,1);
	g.applyMatrix(new THREE.Matrix4().makeTranslation(0.5,0.5,0))

	if(width)
	{
		g.applyMatrix(new THREE.Matrix4().makeScale(width,1,1))
	}
	if(height)
	{
		g.applyMatrix(new THREE.Matrix4().makeScale(1,height,1))
	}

	return g;
}
THREE.OriginCorneredPlaneBufferGeometry = function(width,height)
{
	var g = new THREE.PlaneBufferGeometry(1,1);
	g.applyMatrix(new THREE.Matrix4().makeTranslation(0.5,0.5,0))

	if(width)
	{
		g.applyMatrix(new THREE.Matrix4().makeScale(width,1,1))
	}
	if(height)
	{
		g.applyMatrix(new THREE.Matrix4().makeScale(1,height,1))
	}

	return g;
}

THREE.Face3.prototype.cornerFromIndex = function(i)
{
	switch(i)
	{
	case 0:
		return this.a;
		break;
	case 1:
		return this.b;
		break;
	case 2:
		return this.c;
		break;
	}
}

THREE.Face3.prototype.indexOfCorner = function(vertexIndexYouWant)
{
	for(var i = 0; i < 3; i++)
	{
		if( this.cornerFromIndex(i) === vertexIndexYouWant)
		{
			return i;
		}
	}
	return -1;
}
THREE.Face3.prototype.set = function(a,b,c)
{
	this.a = a;
	this.b = b;
	this.c = c;
	return this;
}

THREE.Face3.prototype.indexOfThirdCorner = function(notThisOne,orThisOne)
{
	for(var i = 0; i < 3; i++)
	{
		if( this.cornerFromIndex(i) !== notThisOne && 
			this.cornerFromIndex(i) !== orThisOne )
		{
			return this.cornerFromIndex(i);
		}
	}
	return -1;
}

function getSignedAngleBetween(a,b)
{	
	var aN = a.clone().normalize();
	var bN = b.clone().normalize();
	var crossProd = new THREE.Vector3().crossVectors(aN,bN);
	var angleChange = Math.asin(crossProd.z );
}

function worldClone(vecToBeCloned,object)
{
	object.updateMatrixWorld();
	var vec = vecToBeCloned.clone();
	object.localToWorld(vec);
	return vec;
}

function rotateToFaceCamera()
{
	camera.updateMatrix();
	var cameraUp = yUnit.clone().applyQuaternion(camera.quaternion);
	cameraUp.add(this.parent.getWorldPosition())
	this.parent.worldToLocal(cameraUp)
	this.up.copy(cameraUp);

	this.parent.updateMatrixWorld()
	var localCameraPosition = camera.position.clone()
	this.parent.worldToLocal(localCameraPosition);
	this.lookAt(localCameraPosition);
}