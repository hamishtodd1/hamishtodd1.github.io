//assumes homogeneous
function eigenvector(m)
{
	let e = m.elements

	let v = new THREE.Vector3()
	v.x = e[0] * e[12] + e[0] * e[12] + e[0] * e[12]
	v.y = e[0] * e[12] + e[0] * e[12] + e[0] * e[12]
	v.z = e[0] * e[12] + e[0] * e[12] + e[0] * e[12]
}
//binary search: view a, view b, permanently enter a, permanently enter b

function getClosestAtomToWorldPosition(p, condition)
{
	if(condition === undefined)
	{
		condition = true
	}

	var closestAtom = null;
	var closestDistSq = Infinity;
	for(var i = 0; i < models.length; i++)
	{
		var localPosition = models[i].worldToLocal(p.clone());

		for(var j = 0, jl = models[i].atoms.length; j < jl; j++)
		{
			let distSq = models[i].atoms[j].position.distanceToSquared( localPosition )
			if( distSq < closestDistSq && condition(models[i].atoms[j]) )
			{
				closestAtom = models[i].atoms[j];
				closestDistSq = distSq
			}
		}
	}
	return closestAtom;
}

function padLeft(str, desiredLength)
{
	if(str.length >= desiredLength)
	{
		return str
	}

	let paddingAmt = desiredLength - str.length
	for(let i = 0; i < paddingAmt; i++)
	{
		str = " " + str
	}
	return str
}
function padRight(str, desiredLength)
{
	if(str.length >= desiredLength)
	{
		return str
	}

	let paddingAmt = desiredLength - str.length
	for(let i = 0; i < paddingAmt; i++)
	{
		str = str + " "
	}
	return str
}

function objectNotAppearingTest(obj)
{
	console.log("parent: ",obj.parent)
	console.log("visible: ",obj.visible)
	console.log("scale: ",obj.scale)
	console.log("position: ",obj.position)
	if(obj.isMesh)
	{
		console.log(obj.geometry.vertices)
		console.log("opacity: ",obj.material.opacity)
		console.log("sidedness: ",obj.material.side)
	}
	else
	{
		console.log("children: ",obj.children.length)
	}
}

//to be called every frame from the start
function checkForNewGlobals()
{
	var previouslyLoggedGlobals = Object.keys(window);
	console.error("if you want to use this, make the above global")
	if( previouslyLoggedGlobals.length < Object.keys(window).length)
	{
		var errorMessagePrinted = false;
		var currentGlobals = Object.keys(window);
		for(var i = 0, il = currentGlobals.length; i < il; i++ )
		{
			var alreadyKnewAboutThisOne = false;
			for(var j = 0, jl = previouslyLoggedGlobals.length; j < jl; j++)
			{
				if(currentGlobals[i] === previouslyLoggedGlobals[j])
				{
					alreadyKnewAboutThisOne = true;
				}
			}
			if(alreadyKnewAboutThisOne)
			{
				continue;
			}

			if( currentGlobals[i] !== "location" && //these ones are ok
				currentGlobals[i] !== "name" &&
				currentGlobals[i] !== "window" &&
				currentGlobals[i] !== "self" &&
				currentGlobals[i] !== "document" )
			{
				if(!errorMessagePrinted)
				{
					console.error("new global variable(s): ")
					errorMessagePrinted = true;
				}
				console.log( currentGlobals[i] );
			}
		}
		previouslyLoggedGlobals = currentGlobals;
	} 
}
//also nice would be "check for unused variables"

function logExtremes(array,indexToInspect)
{
	var lowest = Infinity;
	var highest = -Infinity;
	for(var i = 0; i < array.length; i++)
	{
		if(array[i][indexToInspect] < lowest)
			lowest = array[i][indexToInspect];
		if(array[i][indexToInspect] > highest)
			highest = array[i][indexToInspect];
	}
	console.log(lowest,highest)
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

function findHighestElementInArray(arr)
{
	var highestValue = -Infinity;
	var index = null;
	for(var i = 0, il = arr.length; i < il; i++)
	{
		if(arr[i]>highestValue)
		{
			highestValue = arr[i]
			index = i;
		}
	}
	return index;
}

function DottedLineGeometry(numDots, radius)
{
	var geo = new THREE.Geometry();

	var radiusSegments = 15;
	geo.vertices = Array(numDots*radiusSegments*2);
	geo.faces = Array(numDots*radiusSegments*2);
	for(var i = 0; i < numDots; i++)
	{
		for( var j = 0; j < radiusSegments; j++)
		{
			var bottomRightVertex = i*radiusSegments*2+j;
			geo.vertices[bottomRightVertex]   			   = new THREE.Vector3(radius,2*i,   0).applyAxisAngle(yVector,TAU*j/radiusSegments);
			geo.vertices[bottomRightVertex+radiusSegments] = new THREE.Vector3(radius,2*i+1, 0).applyAxisAngle(yVector,TAU*j/radiusSegments);

			geo.faces[i*radiusSegments*2+j*2]   = new THREE.Face3(
				bottomRightVertex+radiusSegments,
				bottomRightVertex,
				i*radiusSegments*2+(j+1)%radiusSegments)
			geo.faces[i*radiusSegments*2+j*2+1] = new THREE.Face3(
				bottomRightVertex+radiusSegments,
				i*radiusSegments*2+(j+1)%radiusSegments,
				i*radiusSegments*2+(j+1)%radiusSegments+radiusSegments );
		}
	}
	geo.computeFaceNormals();
	geo.computeVertexNormals();

	return geo;
}

THREE.Object3D.prototype.getUnitVectorInObjectSpace = function(axis)
{
	return axis.clone().applyMatrix4(this.matrixWorld).sub(this.getWorldPosition()).normalize();
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

function ArrayOfThisValueAndThisLength(value,length)
{
	var array = Array(length);
	for(var i = 0; i < length; i++)
	{
		array[i] = value;
	}
	return array;
}

function removeSingleElementFromArray(array, element)
{
	var index = array.indexOf(element);
	if (index > -1)
	{
	    array.splice(index, 1);
	    return;
	}
	else console.error("no such element");
}

THREE.CylinderBufferGeometryUncentered = function(radius, length, radiusSegments)
{
	if( !radiusSegments )
	{
		radiusSegments = 8;
	}
	var geometry = new THREE.CylinderBufferGeometry(radius, radius, length,radiusSegments,1,true);
	for(var i = 0, il = geometry.attributes.position.array.length / 3; i < il; i++)
	{
		geometry.attributes.position.array[i*3+1] += length / 2;
	}
	return geometry;
}

function refreshCylinderCoordsAndNormals(A,B, firstVertexIndex, bufferGeometry, cylinderSides, radius )
{
	var aToB = new THREE.Vector3().subVectors(B,A);
	aToB.normalize();
	var tickVector = randomPerpVector(aToB);
	tickVector.normalize(); 
	for( var i = 0; i < cylinderSides; i++)
	{
		bufferGeometry.attributes.position.setXYZ(  firstVertexIndex + i*2, tickVector.x*radius + A.x,tickVector.y*radius + A.y,tickVector.z*radius + A.z );
		bufferGeometry.attributes.position.setXYZ(firstVertexIndex + i*2+1, tickVector.x*radius + B.x,tickVector.y*radius + B.y,tickVector.z*radius + B.z );
		
		bufferGeometry.attributes.normal.setXYZ(  firstVertexIndex + i*2, tickVector.x,tickVector.y,tickVector.z );
		bufferGeometry.attributes.normal.setXYZ(firstVertexIndex + i*2+1, tickVector.x,tickVector.y,tickVector.z );
		
		tickVector.applyAxisAngle(aToB, TAU / cylinderSides);
	}
}

function insertCylinderFaceIndices(bufferGeometry,cylinderSides, cylinderFirstFaceIndex, cylinderFirstVertexIndex)
{
	for(var k = 0; k < cylinderSides; k++)
	{
		bufferGeometry.index.setABC(cylinderFirstFaceIndex+k*2,
			(k*2+1) + cylinderFirstVertexIndex,
			(k*2+0) + cylinderFirstVertexIndex,
			(k*2+2) % (cylinderSides*2) + cylinderFirstVertexIndex );
		
		bufferGeometry.index.setABC(cylinderFirstFaceIndex+k*2 + 1,
			(k*2+1) + cylinderFirstVertexIndex,
			(k*2+2) % (cylinderSides*2) + cylinderFirstVertexIndex,
			(k*2+3) % (cylinderSides*2) + cylinderFirstVertexIndex );
	}
}

THREE.Vector4.prototype.distanceTo = function(v)
{
	let sq = v.x*this.x + v.y*this.y + v.z*this.z + v.w*this.w;
	return Math.sqrt(sq)
}

THREE.Quaternion.prototype.distanceTo = function(q2)
{
	var theta = Math.acos(this.w*q2.w + this.x*q2.x + this.y*q2.y + this.z*q2.z);
	if (theta>Math.PI/2) theta = Math.PI - theta;
	return theta;
}
THREE.Quaternion.prototype.getAxisWithAngleAsLength = function()
{
	var scaleFactor = Math.sqrt(1-this.w*this.w);
	var axis = new THREE.Vector3(
		this.x / scaleFactor,
		this.y / scaleFactor,
		this.z / scaleFactor
		);
	axis.setLength(2 * Math.acos(this.w));
	return axis;
}
THREE.Quaternion.prototype.getInverse = function(scalar)
{
	return this.clone().conjugate()
}
THREE.Quaternion.prototype.multiplyScalar = function(scalar)
{
	this.x *= scalar;
	this.y *= scalar;
	this.z *= scalar;
	this.w *= scalar;

	return this;
}
THREE.Quaternion.prototype.add = function(q2)
{
	this.x += q2.x;
	this.y += q2.y;
	this.z += q2.z;
	this.w += q2.w;

	return this;
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

THREE.EfficientSphereBufferGeometry = function(radius)
{
	return new THREE.IcosahedronBufferGeometry(radius, 1);
}
THREE.EfficientSphereGeometry = function(radius)
{
	return new THREE.IcosahedronGeometry(radius, 1);
}
THREE.Vector3.prototype.addArray = function(array)
{
	this.x += array[0];
	this.y += array[1];
	this.z += array[2];
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

function redirectCylinder(cylinder, start, newY)
{
	var newX = randomPerpVector( newY ).normalize();
	var newZ = newY.clone().cross(newX).normalize().negate();
	
	cylinder.matrix.makeBasis( newX, newY, newZ );
	cylinder.matrix.setPosition( start );
	cylinder.matrixAutoUpdate = false;
}
function randomPerpVector(ourVector){
	var perpVector = new THREE.Vector3();
	
	if( ourVector.equals(zVector))
	{
		perpVector.crossVectors(ourVector, yVector);
	}
	else
	{
		perpVector.crossVectors(ourVector, zVector);
	}
	
	return perpVector;
}

function removeAndRecursivelyDispose(obj)
{
	while( obj.children.length )
	{
		removeAndRecursivelyDispose(obj.children[0])
	}
	
	if(obj.parent)
	{
		obj.parent.remove(obj);
	}
	if (obj.geometry) { obj.geometry.dispose(); }
	if (obj.material) { obj.material.dispose(); }
}

function tetrahedronTops(P1,P2,P3, r1,r2,r3)
{
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
	if(r1*r1 - cp_t.x*cp_t.x - cp_t.y*cp_t.y < 0)
	{
		return false;
	}
	cp_t.z = Math.sqrt(r1*r1 - cp_t.x*cp_t.x - cp_t.y*cp_t.y);
	
	let solutions = [new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0)]
	
	var z_direction = new THREE.Vector3();
	z_direction.crossVectors(P2,P3);
	z_direction.normalize(); 
	z_direction.multiplyScalar(cp_t.z);
	solutions[0].add(z_direction)
	solutions[1].sub(z_direction)
	
	var x_direction = P2.clone();
	x_direction.normalize();
	x_direction.multiplyScalar(cp_t.x);
	solutions[0].add(x_direction);
	solutions[1].add(x_direction);
	
	var y_direction = new THREE.Vector3();
	y_direction.crossVectors(z_direction,x_direction);
	y_direction.normalize();
	y_direction.multiplyScalar(cp_t.y);
	solutions[0].add(y_direction);		
	solutions[1].add(y_direction);		
	solutions[0].add(P1);
	solutions[1].add(P1);
	
	P2.add(P1);
	P3.add(P1);
	
	return solutions
}