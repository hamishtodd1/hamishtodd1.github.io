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
timeSinceStart = 0;

THREE.EfficientSphereGeometry = function(radius)
{
	return new THREE.IcosahedronBufferGeometry(radius, 1); //buffer is also available
}

THREE.Quaternion.prototype.distanceTo = function(q2)
{
	var theta = Math.acos(this.w*q2.w + this.x*q2.x + this.y*q2.y + this.z*q2.z);
	return theta;
}

var gliderGrabbed = false;
var bgGrabbed = false;
var kbPointGrabbed = false;

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

THREE.ArrowGeometry = function(fullLength,bodyWidth,headLength,headWidth)
{
	if( !headLength )
		headLength = fullLength / 3;
	if( !headWidth )
		headWidth = headLength / (Math.sqrt(3) / 2);
	if( !bodyWidth )
		bodyWidth = headWidth / 2.8;
	
	var arrowGeometry = new THREE.Geometry();
	
	arrowGeometry.vertices.push(
		new THREE.Vector3( 0, fullLength, 0 ),
		new THREE.Vector3( headWidth / 2, fullLength - headLength, 0 ),
		new THREE.Vector3(-headWidth / 2, fullLength - headLength, 0 )
	);
	arrowGeometry.faces.push(new THREE.Face3(0,2,1));
	
	arrowGeometry.vertices.push(
			new THREE.Vector3(-bodyWidth / 2, fullLength - headLength, 0 ),
			new THREE.Vector3( bodyWidth / 2, fullLength - headLength, 0 ),
			new THREE.Vector3(-bodyWidth / 2, 0, 0 ),
			new THREE.Vector3( bodyWidth / 2, 0, 0 )
		);
	arrowGeometry.faces.push(new THREE.Face3(3,6,4));
	arrowGeometry.faces.push(new THREE.Face3(5,6,3));
	
	return arrowGeometry;
}

var ourTextureLoader = new THREE.TextureLoader();