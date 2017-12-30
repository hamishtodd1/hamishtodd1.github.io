//to be called every frame from the start
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

function getCameraLoookingDirection()
{
	return zAxis.clone().negate().applyQuaternion(camera.quaternion); //negate?
}

function frameDimensionsAtZDistance(z)
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