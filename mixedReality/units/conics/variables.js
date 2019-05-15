//-----Mathematical
var TAU = Math.PI * 2;
var zAxis = new THREE.Vector3(0,0,1); //also used as a placeholder normal
var yAxis = new THREE.Vector3(0,1,0);
var xAxis = new THREE.Vector3(1,0,0);

THREE.Quaternion.prototype.distanceTo = function(q2)
{
	var theta = Math.acos(this.w*q2.w + this.x*q2.x + this.y*q2.y + this.z*q2.z);
	if (theta>Math.PI/2) theta = Math.PI - theta;
	return theta;
}

//-----Fundamental
var ourclock = new THREE.Clock( true ); //.getElapsedTime ()
var delta_t = 0;
var logged = 0;
var debugging = 0;

//------We enforce these to be static

var FOCALPOINT_DISTANCE = 0.7;
var RIGHT_CONTROLLER_INDEX = 0;
var LEFT_CONTROLLER_INDEX = 1-RIGHT_CONTROLLER_INDEX;

var scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera( 70, //can be changed by VR effect
		window.innerWidth / window.innerHeight,
		0.001, 700);
scene.add(camera);

var gentilis;
new THREE.FontLoader().load(  "data/gentilis.js", 
	function ( reponse ) {
		gentilis = reponse;
	},
	function ( xhr ) {}, //progression function
	function ( xhr ) { console.error( "couldn't load font" ); }
);

//------renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );