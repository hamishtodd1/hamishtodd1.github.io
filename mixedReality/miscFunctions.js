function assignShader(fileName, materialToReceiveAssignment, vertexOrFragment)
{
	var propt = vertexOrFragment + "Shader"
	var fullFileName = "units/shaders/" + fileName + ".glsl"

	return new Promise(resolve => {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", fullFileName, true);
		xhr.onload = function(e)
		{
			materialToReceiveAssignment[propt] = xhr.response
			resolve();
		};
		xhr.onerror = function ()
		{
			console.error(fullFileName, "didn't load");
		};
		xhr.send();
	})
}

//	a - therefore normal is x
//	
//		b  c //origin and x=1
//
//	a - therefore normal is ⊙

function centerOfCircleThroughThreePoints(a,b,c)
{
	let ba = a.clone().sub(b)
	let bc = c.clone().sub(b)
	let bcNormal = bc.clone().normalize()

	let normal = ba.clone().cross(bc).normalize()
	let bcPerp = bcNormal.clone().cross(normal)

	let aInPlane = new THREE.Vector2(ba.dot(bcNormal),ba.dot(bcPerp))

	let baBisectorDirectionInPlane = new THREE.Vector2(aInPlane.y,-aInPlane.x)
	let baBisectorMidpointInPlane = aInPlane.clone().multiplyScalar(0.5)

	//ofRightTriangleWhoseGradientIsBisectorAndBottomLeftCornerIsA
	let midpointTobcBisectorHorizontal = bc.length() * 0.5 - baBisectorMidpointInPlane.x
	let midpointTobcBisectorVertical = midpointTobcBisectorHorizontal * baBisectorDirectionInPlane.y / baBisectorDirectionInPlane.x

	let bcMidpointToCenterDistance = midpointTobcBisectorVertical + baBisectorMidpointInPlane.y

	let bcMidpoint = bc.clone().multiplyScalar(0.5)
	let center = bcPerp.clone().multiplyScalar(bcMidpointToCenterDistance).add(bcMidpoint).add(b)

	console.assert(
		basicallyEqual(center.distanceTo(a),center.distanceTo(b)) && 
		basicallyEqual(center.distanceTo(b),center.distanceTo(c)) )
	return center
}

function basicallyEqual(a,b)
{
	return Math.abs(a-b) < 0.00001
}

function insertPatchworkFaces(verticesWide, facesArray, startingIndex, colorFaces)
{
	var colors = [new THREE.Color(0,0,0),new THREE.Color(1,1,1)];

	if(startingIndex === undefined)
	{
		startingIndex = 0
	}

	for(var i = 1; i < verticesWide; i++)
	{
		for(var j = 1; j < verticesWide; j++)
		{
			var tl = (i-1)*verticesWide + (j-1) + startingIndex;
			var tr = (i-1)*verticesWide + j + startingIndex;
			var bl = i*verticesWide + (j-1) + startingIndex;
			var br = i*verticesWide + j + startingIndex;

			if( colorFaces === undefined )
			{
				facesArray.push(new THREE.Face3(tl,tr,bl))
				facesArray.push(new THREE.Face3(bl,tr,br))	
			}
			else
			{
				if( !(i%2) ) //row!
				{
					if(!(j%2))
					{
						facesArray.push(new THREE.Face3(tl,tr,bl, new THREE.Vector3(), colors[0]))
						facesArray.push(new THREE.Face3(bl,tr,br, new THREE.Vector3(), colors[1]))
					}
					else
					{
						facesArray.push(new THREE.Face3(tl,tr,br, new THREE.Vector3(), colors[0]))
						facesArray.push(new THREE.Face3(bl,tl,br, new THREE.Vector3(), colors[1]))
					}
				}
				else
				{
					if(!(j%2))
					{
						facesArray.push(new THREE.Face3(tl,tr,br, new THREE.Vector3(), colors[1]))
						facesArray.push(new THREE.Face3(bl,tl,br, new THREE.Vector3(), colors[0]))
					}
					else
					{
						facesArray.push(new THREE.Face3(tl,tr,bl, new THREE.Vector3(), colors[1]))
						facesArray.push(new THREE.Face3(bl,tr,br, new THREE.Vector3(), colors[0]))
					}
				}
			}
		}
	}
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

function jonSlerp(q0,q1,t)
{
	// debugger;
	let cosAngle = q0.dot(q1) / Math.sqrt( q0.lengthSq()*q1.lengthSq() )
	var theta0 = Math.acos(cosAngle)
	var theta = t * theta0;
	var toSubtract = q0.clone().multiplyScalar( q0.dot(q1) );
	var q2 = q1.clone().sub( toSubtract ).normalize();

	return q0.clone().multiplyScalar(Math.cos(theta)).add( q2.clone().multiplyScalar(Math.sin(theta)) );
}

//bit costly
THREE.Vector4.prototype.slerp = function(v,t)
{
	this.copy( jonSlerp(this,v,t) )

	return this
}

THREE.Vector4.prototype.angleTo = function(v)
{
	let theta = this.dot( v ) / ( Math.sqrt( this.lengthSq() * v.lengthSq() ) );

	// clamp, to handle numerical problems

	return Math.acos( clamp( theta, - 1, 1 ) );
}

THREE.Matrix4.prototype.basicallyEqual = function(m)
{
	for(let i = 0; i < 16; i++)
	{
		if(!basicallyEqual(this.elements[i],m.elements[i]))
		{
			return false
		}
	}
	
	return true
}

THREE.Matrix4.prototype.setBasisVector = function(index,vec)
{
	let te = this.elements;
	let start = index*4

	te[ start+0 ] = vec.x;
	te[ start+1 ] = vec.y;
	te[ start+2 ] = vec.z;

	if(vec.w)
	{
		te[ start+3 ] = vec.w;
	}

	return this;
}

THREE.TubeBufferGeometry.prototype.updateFromCurve = function()
{
	let tubularSegments = this.parameters.tubularSegments
	let radialSegments = this.parameters.radialSegments
	let radius = this.parameters.radius

	let path = this.parameters.path

	let frames = this.parameters.path.computeFrenetFrames( tubularSegments, this.parameters.closed );

	let P = new THREE.Vector3()
	let normal = new THREE.Vector3()
	let vertex = new THREE.Vector3()

	let vertexIndex = 0

	let normalArray = this.attributes.normal
	let vertexArray = this.attributes.position

	let num = 0

	function generateSegment(i)
	{
		P = path.getPointAt( i / tubularSegments, P );
		// if(!logged)console.log(P)

		var N = frames.normals[ i ];
		var B = frames.binormals[ i ];

		for ( j = 0; j <= radialSegments; j ++ )
		{
			var theta = j / radialSegments * TAU

			var sin = Math.sin( theta );
			var cos = - Math.cos( theta );

			normal.x = ( cos * N.x + sin * B.x );
			normal.y = ( cos * N.y + sin * B.y );
			normal.z = ( cos * N.z + sin * B.z );
			normal.normalize();

			normalArray.setXYZ(vertexIndex,normal.x, normal.y, normal.z)

			vertex.x = P.x + radius * normal.x;
			vertex.y = P.y + radius * normal.y;
			vertex.z = P.z + radius * normal.z;

			vertexArray.setXYZ(vertexIndex,vertex.x, vertex.y, vertex.z)

			vertexIndex++
		}
	}

	for(let i = 0; i < tubularSegments; i++)
	{
		generateSegment(i)
	}
	generateSegment( ( this.parameters.closed === false ) ? tubularSegments : 0 );
	// console.log(vertexIndex, vertexArray.length / 3)

	this.attributes.position.needsUpdate = true
	this.attributes.normal.needsUpdate = true
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

THREE.Quaternion.prototype.getComponent = function(component)
{
	if(component === 0) return this.x
	if(component === 1) return this.y
	if(component === 2) return this.z
	if(component === 3) return this.w
}
THREE.Quaternion.prototype.setComponent = function(component, value)
{
	if(component === 0) this.x = value
	if(component === 1) this.y = value
	if(component === 2) this.z = value
	if(component === 3) this.w = value
}

THREE.Quaternion.prototype.distanceTo = function(q2)
{
	var theta = Math.acos(this.w*q2.w + this.x*q2.x + this.y*q2.y + this.z*q2.z);
	if (theta>Math.PI/2) theta = Math.PI - theta;
	return theta;
}
THREE.Quaternion.prototype.getAxisWithAngleAsLength = function()
{
	var scaleFactor = Math.sqrt(1-qw*qw);
	var axis = new THREE.Vector3(
		this.x / scaleFactor,
		this.y / scaleFactor,
		this.z / scaleFactor
		);
	axis.setLength(2 * Math.acos(this.w));
	return axis;
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
THREE.Quaternion.prototype.sub = function(q2)
{
	this.x -= q2.x;
	this.y -= q2.y;
	this.z -= q2.z;
	this.w -= q2.w;

	return this;
}

function presentJsonFile(obj, filename)
{
	let download = document.createElement('a');
	download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj)));
	download.setAttribute('download', filename);
	download.style.display = 'none';
	document.body.appendChild(download);
	download.click();
	document.body.removeChild(download);
}

THREE.BufferAttribute.prototype.getXYZ = function(i, target)
{
	if(target === undefined)
	{
		return new THREE.Vector3(
			this.array[ i * this.itemSize + 0 ],
			this.array[ i * this.itemSize + 1 ],
			this.array[ i * this.itemSize + 2 ] )
	}
	else
	{
		target.set(
			this.array[ i * this.itemSize + 0 ],
			this.array[ i * this.itemSize + 1 ],
			this.array[ i * this.itemSize + 2 ])
	}
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
function randomPerpVector(ourVector)
{
	var perpVector = new THREE.Vector3();
	
	if( Math.abs( Math.abs( ourVector.dot(zUnit) ) - 1 ) < 0.0001 )
	{
		perpVector.crossVectors(ourVector, yUnit);
	}
	else
	{
		perpVector.crossVectors(ourVector, zUnit);
	}
	
	return perpVector;
}

function removeAndRecursivelyDispose(obj)
{
	obj.parent.remove(obj);
	if (obj.geometry) { obj.geometry.dispose(); }
	if (obj.material) { obj.material.dispose(); }
	for(var i = 0; i < obj.children.length; i++)
	{
		removeAndRecursivelyDispose(obj.children[i])
	}
}

function tetrahedronTop(P1,P2,P3, r1,r2,r3)
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