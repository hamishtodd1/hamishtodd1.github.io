//-----Mathematical
var TAU = Math.PI * 2;
var zAxis = new THREE.Vector3(0,0,1); //also used as a placeholder normal
var yAxis = new THREE.Vector3(0,1,0);
var xAxis = new THREE.Vector3(1,0,0);
var zeroVector = new THREE.Vector3();

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

//-----Fundamental
var ourClock = new THREE.Clock( true ); //.getElapsedTime ()
var frameDelta = 0;
var logged = 0;
var debugging = 0;

var atomColors;

//------We enforce these to be static

var FOCALPOINT_DISTANCE = 0.1;
var RIGHT_CONTROLLER_INDEX = 0;
var LEFT_CONTROLLER_INDEX = 1-RIGHT_CONTROLLER_INDEX;

var scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera( 70, //can be changed by VR effect
		window.innerWidth / window.innerHeight,
		0.01, 700);
scene.add(camera);

//------renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.localClippingEnabled = true; //necessary if it's done in a shader you write?
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//------varying
//mousePosition = new THREE.Vector2(); //[0,1],[0,1]

var mutator;