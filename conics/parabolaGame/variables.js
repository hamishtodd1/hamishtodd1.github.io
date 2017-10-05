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

//THREE.ArrowGeometry(fullLength,bodyWidth,headLength,headWidth)
//{
//	var full_length = 0.02;
//	var head_length = full_length / 3;
//	var head_width = head_length / (Math.sqrt(3) / 2);
//	if( typeof bodyWidth === 'undefined')
//	var body_width = head_width / 2.8;
//	
//	var arrowGeometry = new THREE.Geometry();
//	
//	directionArrow.geometry.vertices.push(
//		new THREE.Vector3( 0, full_length, 0 ),
//		new THREE.Vector3( head_width / 2, full_length - head_length, 0 ),
//		new THREE.Vector3(-head_width / 2, full_length - head_length, 0 )
//	);
//	directionArrow.geometry.faces.push(new THREE.Face3(0,2,1));
//	
//	directionArrow.geometry.vertices.push(
//			new THREE.Vector3(-body_width / 2, full_length - head_length, 0 ),
//			new THREE.Vector3( body_width / 2, full_length - head_length, 0 ),
//			new THREE.Vector3(-body_width / 2, 0, 0 ),
//			new THREE.Vector3( body_width / 2, 0, 0 )
//		);
//	directionArrow.geometry.faces.push(new THREE.Face3(3,6,4));
//	directionArrow.geometry.faces.push(new THREE.Face3(5,6,3));
//	
//	return arrowGeometry;
//}

var ourTextureLoader = new THREE.TextureLoader();