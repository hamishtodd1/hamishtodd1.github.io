function vec2_crossprod(a,b){
	return a.x*b.y-a.y*b.x;
}
function lineLineIntersection(startpointA,endpointA,startpointB,endpointB){
	var lineA = endpointA.clone();
	lineA.sub(startpointA);
	var lineB = endpointB.clone();
	lineB.sub(startpointB);
	return line_line_intersection_vecs(startpointA,startpointB,lineA,lineB);
}
//p connected to r, q connected to s.
function line_line_intersection_vecs(p,q,r,s) {
	var r_cross_s = vec2_crossprod( r, s ); //it's a scalar, representing z.
	if(r_cross_s === 0)
	{
		console.log("parallel?",r,s)
		return 0;
	}
	
	var r_over_r_cross_s = r.clone();
	var s_over_r_cross_s = s.clone();
	
	var p_to_q = q.clone();
	p_to_q.sub(p);
	
	var u = vec2_crossprod(p_to_q,r_over_r_cross_s);
	var t = vec2_crossprod(p_to_q,s_over_r_cross_s);
	
	u /= r_cross_s;
	t /= r_cross_s;
	
//	if( 0 <= u && u <= 1 
//	 && 0 <= t && t <= 1 ){
//		//answer is inside both line segments
//	}

	var answer = p.clone();
	answer.addScaledVector(r, t);
	return answer;
}

THREE.EfficientSphereGeometry = function(radius)
{
	return new THREE.IcosahedronBufferGeometry(radius, 2); //buffer is also available
}

THREE.Quaternion.prototype.distanceTo = function(q2)
{
	var theta = Math.acos(this.w*q2.w + this.x*q2.x + this.y*q2.y + this.z*q2.z);
	return theta;
}

THREE.Color.prototype.getComponent = function(index)
{
	switch(index)
	{
	case 0:
		return this.r;
		break;
	case 1:
		return this.g;
		break;
	case 2:
		return this.b;
		break;
	}
}
THREE.Color.prototype.setComponent = function(index,newValue)
{
	switch(index)
	{
	case 0:
		this.r = newValue;
		break;
	case 1:
		this.g = newValue;
		break;
	case 2:
		this.b = newValue;
		break;
	}
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
	
	return angleChange;
}

function sq(x)
{
	return x*x;
}

function randomPerpVector(ourVector){
	var perpVector = new THREE.Vector3();
	
	if( ourVector.equals(zAxis))
		perpVector.crossVectors(ourVector, yAxis);
	else
		perpVector.crossVectors(ourVector, zAxis);
	
	return perpVector;
}

function getRandomColor()
{
	return new THREE.Color(Math.random(),Math.random(),Math.random() );
}

function arrayOfArrays(length)
{
	var array = Array(length);
	for(var i = 0; i < length; i++)
	{
		array[i] = [];
	}
	return array;
}