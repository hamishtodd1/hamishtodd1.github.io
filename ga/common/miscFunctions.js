function getCssVar(varName) {
	return getComputedStyle(document.body).getPropertyValue('--' + varName)
}

function keyOfProptInObject(propt,obj) {
	let keys = Object.keys(obj)
	return keys.find((key)=>propt===obj[key])
}

function forEachPropt(obj,func) {
	let keys = Object.keys(obj)
	keys.forEach((key)=>{
		func(obj[key], key)
	})
}

function otherFov(inputFov, aspectRatio, inputIsVertical) {
	var centerToFrameInput = centerToFrameDistanceAtOneUnitAway(inputFov, 1)
	var centerToFrameOutput = centerToFrameInput;
	if (inputIsVertical)
		centerToFrameOutput *= aspectRatio;
	else
		centerToFrameOutput /= aspectRatio;
	var outputFov = fovGivenCenterToFrameDistanceAtOneUnitAway(centerToFrameOutput)
	return outputFov;
}

function getWhereThisWasCalledFrom(depth) {
	let actualDepth = (depth || 0) + 3
	let splitIntoLines = Error().stack.split("\n")
	if(actualDepth >= splitIntoLines.length )
		actualDepth = splitIntoLines.length - 1
	let lineOfStackTrace = splitIntoLines[actualDepth]

	let splitBySlash = lineOfStackTrace.split("/")
	let stillGotColons = splitBySlash[splitBySlash.length - 1]
	let splitByColons = stillGotColons.split(":")
	return splitByColons[0] + ":" + splitByColons[1]
}

function centerToFrameDistanceAtOneUnitAway(fov) {
	return Math.tan(fov / 2. * (TAU / 360.))
}
function fovGivenCenterToFrameDistanceAtOneUnitAway(centerToFrame) {
	return 2. * Math.atan(centerToFrame) * (360. / TAU);
}

function otherFov(inputFov, aspectRatio, inputIsVertical) {
	var centerToFrameInput = centerToFrameDistanceAtOneUnitAway(inputFov, 1)
	var centerToFrameOutput = centerToFrameInput;
	if (inputIsVertical)
		centerToFrameOutput *= aspectRatio;
	else
		centerToFrameOutput /= aspectRatio;
	var outputFov = fovGivenCenterToFrameDistanceAtOneUnitAway(centerToFrameOutput)
	return outputFov;
}




//fixed length array
function fixedLengthArray(elementConstructor, elementDestructor) {
	let arr = []
	let usages = []

	return {
		arr,
		getNew: () => {
			log(usages)
			let lowestUnused = usages.indexOf(false)
			if(lowestUnused === -1) {
				let newEl = new elementConstructor()
				arr.push(newEl)
				usages.push(true)
				return newEl
			}
			else {
				usages[lowestUnused] = true
				return arr[lowestUnused]
			}
		},
		free: (el) => {
			usages[arr.indexOf(el)] = false
			elementDestructor(el)
		}
	}
}

lerp = (t,start,end) => start + t*(end-start)
intervalToRadians = (t) => -Math.PI + TAU * t

function getStepTowardDestination(currentValue, destination)
{
	let distanceFromDestination = destination - currentValue
	let sign = distanceFromDestination == 0. ? 0. : distanceFromDestination / Math.abs(distanceFromDestination)
	let speed = .01
	if (speed > Math.abs(distanceFromDestination))
		speed = Math.abs(distanceFromDestination)
	return sign * speed
}

function getMatrixYAxisScale(elements, matrixIndex)
{
	if(matrixIndex === undefined)
		matrixIndex = 0
	// debugger
	return Math.sqrt(
		sq(elements[16*matrixIndex + 4]) +
		sq(elements[16*matrixIndex + 5]) +
		sq(elements[16*matrixIndex + 6])
	)
}

function logMat4(mat4) {
	for (let i = 0; i < 4; ++i) {
		let row = ``
		for (let j = 0; j < 4; ++j)
			row += mat4.elements[i * 4 + j] + `,`
		log(row)
	}
}

THREE.Matrix4.prototype.multiplyScaleScalar = function(scalar) {
	for(let i = 0; i < 12; ++i)
		this.elements[i] *= scalar

	return this
}

function setRotationallySymmetricMatrix(yX, yY, yZ, target, radius)
{
	if(radius === undefined)
		radius = 1.

	v7.set(yX, yY, yZ)
	randomPerpVector(v7, v8)
	v8.normalize()
	v9.crossVectors(v7,v8).normalize().negate()
	target.makeBasis(v8, v7, v9)

	return target
}

function VideoScreen(filename)
{
	let video = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial())
	video.loaded = false

	video.$ = document.createElement('video')
	video.$.style = "display:none"
	video.$.crossOrigin = 'anonymous'
	video.$.loop = false
	video.$.muted = true
	video.$.src = "../common/data/videos/" + filename
	video.$.load()
	video.$.onloadeddata = () =>
	{
		video.loaded = true
		updateFunctions.push(() => { video.scale.y = video.scale.x * (video.$.videoHeight / video.$.videoWidth) })
	}

	video.material.map = new THREE.VideoTexture(video.$)
	video.material.map.minFilter = THREE.LinearFilter

	return video
}

THREE.Matrix4.prototype.setUniformScaleAssumingRigid = function (uniformScale)
{
	this.elements[0] = uniformScale
	this.elements[5] = uniformScale
	this.elements[10] = uniformScale

	return this
}

function checkAnagram(a,b)
{
	if(a.length !== b.length)
		return false

	let alreadyHadThatOne = Array(a.length)
	for (let i = 0, il = a.length; i < il; i++)
		alreadyHadThatOne[i] = false

	let j = 0
	for(let i = 0, il = a.length; i < il; i++)
	{
		for( j = 0; j < il; j++)
		{
			if ( !alreadyHadThatOne[j] && a[i] === b[j])
			{
				alreadyHadThatOne[j] = true
				break
			}
		}

		if(j === il)
			return false
	}

	return true
}

function digitGivenBase(num, base, digitNum)
{
	let nearbyIntegerPower = Math.pow(base, digitNum - 1)
	return Math.floor((num % (nearbyIntegerPower * base)) / nearbyIntegerPower)
}

function SuperEllipseGeometry()
{
	let radius = 1.
	let superEllipseGeometry = new THREE.CircleGeometry(1., 64)
	let norm = 3.;
	for (let i = 1; i < superEllipseGeometry.vertices.length; i++)
	{
		let ySign = superEllipseGeometry.vertices[i].y > 0. ? 1. : -1.;
		let yAbs = Math.pow(1 - Math.pow(Math.abs(superEllipseGeometry.vertices[i].x), norm), 1 / norm)

		superEllipseGeometry.vertices[i].set(superEllipseGeometry.vertices[i].x, ySign * yAbs, 0.)
		superEllipseGeometry.vertices[i].multiplyScalar(radius)
	}

	return superEllipseGeometry
}

function objectNotAppearingTest(obj)
{
	console.log("parent: ", obj.parent)
	console.log("visible: ", obj.visible)
	console.log("scale: ", obj.scale)
	console.log("position: ", obj.position)
	if (obj.isMesh)
	{
		console.log(obj.geometry.vertices)
		console.log("opacity: ", obj.material.opacity)
		console.log("sidedness: ", obj.material.side)
	}
	else
	{
		console.log("children: ", obj.children.length)
	}

	log("object in scene: ", checkIfObjectIsInScene(obj))
	console.log("camera position: ", camera.position)
	console.log("it's good to have camera here, prevents bad practice, everything needs to move around")
}

//can use this within a part of three.js
function checkIfObjectIsInScene(object)
{
	let thingWeWantToBecomeUltimateParent = object
	while(1)
	{
		if(thingWeWantToBecomeUltimateParent.parent !== null)
		{
			thingWeWantToBecomeUltimateParent = thingWeWantToBecomeUltimateParent.parent
		}
		else
		{
			return thingWeWantToBecomeUltimateParent === scene;
		}
	}

	return thingWeWantToBecomeUltimateParent
}

THREE.Raycaster.prototype.intersectZPlane = function(z,target)
{
	pl.set(zUnit,-z)
	return this.ray.intersectPlane(pl, target)
}

let urConnector = "uhhh, were you actually using this?"
// {
// 	let urConnector = new THREE.Line(new THREE.Geometry(),new THREE.LineBasicMaterial({color:0x0F0FFF}))
// 	urConnector.geometry.vertices.push(new THREE.Vector3())
// 	urConnector.geometry.vertices.push(new THREE.Vector3(1.,1.,0.))
// 	Connector = function(obj1,obj2)
// 	{
// 		let connector = new THREE.Line(urConnector.geometry,urConnector.material)
// 		scene.add(connector)

// 		updateFunctions.push(function()
// 		{
// 			obj1.getWorldPosition(connector.position)

// 			obj2.getWorldPosition(connector.scale)
// 			connector.scale.sub(connector.position)
// 			connector.scale.z = 1.
// 		})

// 		return connector
// 	}
// }

function randomSeeded(seed)
{
    var x = Math.sin(seed*TAU) * 10000;
    return x - Math.floor(x);
}

function RandomSequenceSeeded(seed)
{
	let generator = {
		lastValue:seed,
		getValue:function()
		{
			generator.lastValue = randomSeeded(generator.lastValue)
			return generator.lastValue
		}
	}

	return generator
}

function forEachVecInAttribute(arr, func) {
	for (let i = 0, il = arr.length / 3; i < il; ++i) {
		v1.set(arr[i * 3 + 0], arr[i * 3 + 1], arr[i * 3 + 2])
		func(v1, i)
		arr[i * 3 + 0] = v1.x; arr[i * 3 + 1] = v1.y; arr[i * 3 + 2] = v1.z;
	}
}

async function getTextFile(fileName) {
	let ret = null

	await new Promise(resolve => {
		let xhr = new XMLHttpRequest();
		xhr.open("GET", fileName, true);
		xhr.onload = function (e) {
			ret = xhr.response
			resolve();
		};
		xhr.onerror = function (e) {
			console.error(fileName, "didn't load",e);
		};
		xhr.send();
	})

	return ret
}

function assignShader(fileName, materialToReceiveAssignment, vertexOrFragment)
{
	let propt = vertexOrFragment + "Shader"
	let fullFileName = fileName + ".glsl"

	return new Promise(resolve =>
	{
		let xhr = new XMLHttpRequest();
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

function Grid(numWide,numTall,spacing)
{
	let grid = new THREE.LineSegments( new THREE.Geometry(), new THREE.MeshBasicMaterial({
		color:0x000000,
	}) )

	let verticalExtent = numTall/2*spacing
	let horizontalExtent = numWide/2*spacing
	for(let i = 0; i < numWide+1; i++)
	{
		let x = (i-numWide/2)*spacing
		grid.geometry.vertices.push(new THREE.Vector3(x,-verticalExtent,0),new THREE.Vector3(x,verticalExtent,0))
	}
	for( let i = 0; i < numTall+1; i++)
	{
		let y = (i-numTall/2)*spacing
		grid.geometry.vertices.push(new THREE.Vector3(-horizontalExtent,y,0),new THREE.Vector3(horizontalExtent,y,0))
	}

	return grid
}

function uniformRandomInRange(min,max)
{
	return min + (max-min)*Math.random()
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
				facesArray.push(new THREE.Face3(tl,bl,tr))
				facesArray.push(new THREE.Face3(bl,br,tr))
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

//better would be generating the vertices first then using them
//but that is barely any better. Really you want a different way of re-using the different arrays in drawing
function arrowGeometry2() {
	let shaftRadius = .06

	//ah no no, you want the end to always be the same size
	let headRadius = shaftRadius * 2.5
	let shaftLength = .75

	let vecGeometry = new THREE.Geometry()

	let radialSegments = 15
	let heightSegments = 30 //we want two between y = 0 and y = -shaftRadius
	vecGeometry.vertices = Array((radialSegments + 1) * (heightSegments + 1))
	vecGeometry.faces = Array(radialSegments * heightSegments)

	for (let j = 0; j <= heightSegments; j++) {
		for (let i = 0; i <= radialSegments; i++) {
			v1.y = j <= 8 ?
				shaftRadius * (-1. + j / 8.) :
				j / heightSegments

			v1.x = shaftRadius
			if (v1.y >= shaftLength) {
				let proportionAlongHead = 1. - (v1.y - shaftLength) / (1. - shaftLength)
				v1.x = headRadius * proportionAlongHead
			}
			else if (v1.y <= 0.)
				v1.x = Math.sqrt(sq(shaftRadius) - sq(v1.y))

			v1.z = 0.
			v1.applyAxisAngle(yUnit, i / radialSegments * TAU)
			vecGeometry.vertices[j * (radialSegments + 1) + i] = v1.clone()

			if (i < radialSegments && j < heightSegments) { // there are one fewer triangles along both axes
				vecGeometry.faces[(j * radialSegments + i) * 2 + 0] = new THREE.Face3(
					(j + 0) * (radialSegments + 1) + (i + 0),
					(j + 0) * (radialSegments + 1) + (i + 1),
					(j + 1) * (radialSegments + 1) + (i + 1),
					new THREE.Vector3()
				)
				vecGeometry.faces[(j * radialSegments + i) * 2 + 1] = new THREE.Face3(
					(j + 0) * (radialSegments + 1) + (i + 0),
					(j + 1) * (radialSegments + 1) + (i + 1),
					(j + 1) * (radialSegments + 1) + (i + 0),
					new THREE.Vector3()
				)
			}
		}
	}

	vecGeometry.computeFaceNormals()
	vecGeometry.computeVertexNormals()

	return vecGeometry
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
function getClosestObjectToPoint(point,objArray)
{
	var nearestIndex = null;
	var closestDistance = Infinity;
	let distSq = -1.
	for(var i = 0; i < objArray.length; i++ )
	{
		distSq = objArray[i].distanceToSquared(point)
		if( distSq < closestDistance)
		{
			nearestIndex = i;
			closestDistance = distSq;
		}
	}
	return nearestIndex;
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

function c(a)
{
	console.log(a)
}

function insertCylindernumbers(A,B, verticesArray, cylinderSides, arrayStartpoint, radius )
{
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

function CylinderBufferGeometryUncentered(radius, length, radiusSegments, capped)
{
	if(!radius)
		radius = 1;
	if(!length)
		length = 1;
	if( !radiusSegments )
		radiusSegments = 8;
	if(!capped)
		capped = false;
	var geometry = new THREE.CylinderBufferGeometry(radius, radius, length,radiusSegments,1,!capped);
	geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0,length/2,0))
	return geometry;
}


function randomPerpVector(ourVector,target)
{
	if(target === undefined)
		target = new THREE.Vector3()
	target.copy(ourVector)
	
	if( Math.abs(target.x) < 0.001 && Math.abs(target.y) < 0.001 )
		target.crossVectors(ourVector, yUnit);
	else
		target.crossVectors(ourVector, zUnit);
	
	return target;
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

if(THREE.Face3 !== undefined) {
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

	THREE.Face3.prototype.addOffset = function (offset) {
		this.a += offset;
		this.b += offset;
		this.c += offset;
	}

	THREE.Face3.prototype.cornerFromIndex = function (i) {
		switch (i) {
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

	THREE.Face3.prototype.indexOfCorner = function (vertexIndexYouWant) {
		for (var i = 0; i < 3; i++) {
			if (this.cornerFromIndex(i) === vertexIndexYouWant) {
				return i;
			}
		}
		return -1;
	}
	THREE.Face3.prototype.set = function (a, b, c) {
		this.a = a;
		this.b = b;
		this.c = c;
		return this;
	}

	THREE.Face3.prototype.indexOfThirdCorner = function (notThisOne, orThisOne) {
		for (var i = 0; i < 3; i++) {
			if (this.cornerFromIndex(i) !== notThisOne &&
				this.cornerFromIndex(i) !== orThisOne) {
				return this.cornerFromIndex(i);
			}
		}
		return -1;
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



function getStandardFunctionCallString(myFunc)
{
    return myFunc.toString().split("\n",1)[0].substring(9);
}

function clamp(value, min, max)
{
	if( min !== null && value < min)
	{
		return min;
	}

	if( max !== undefined && value > max )
	{
		return max;
	}

	return value;
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