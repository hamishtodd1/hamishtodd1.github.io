//-----Mathematical constants
TAU = Math.PI * 2;
PHI = (1+Math.sqrt(5)) / 2;
HS3 = Math.sqrt(3)/2;
zAxis = new THREE.Vector3(0,0,1); //also used as a placeholder normal
yAxis = new THREE.Vector3(0,1,0);
xAxis = new THREE.Vector3(1,0,0);
zeroVector = new THREE.Vector3();

//-----Fundamental, varying
ourclock = new THREE.Clock( true ); //.getElapsedTime ()
frameDelta = 0.000001;
logged = 0;
debugging = 0;

THREE.Quaternion.prototype.distanceTo = function(q2)
{
	var theta = Math.acos(this.w*q2.w + this.x*q2.x + this.y*q2.y + this.z*q2.z);
	return theta;
}

function getSignedAngleBetween(a,b)
{	
	var aN = a.clone().normalize();
	var bN = b.clone().normalize();
	var crossProd = new THREE.Vector3().crossVectors(aN,bN);
	var angleChange = Math.asin(crossProd.length());
	if( crossProd.z < 0 )
		angleChange *= -1;
	
	return angleChange;
}
