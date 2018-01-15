//-----Mathematical
var TAU = Math.PI * 2;
var zAxis = new THREE.Vector3(0,0,1); //also used as a placeholder normal
var yAxis = new THREE.Vector3(0,1,0);
var xAxis = new THREE.Vector3(1,0,0);
var zeroVector = new THREE.Vector3();

//-----Fundamental
var logged = 0;
var debugging = 0;

var ourClock = new THREE.Clock( true );
var frameDelta = 0;
var frameTime = 0;

//------We enforce these to be static
var RIGHT_CONTROLLER_INDEX = 0;
var LEFT_CONTROLLER_INDEX = 1-RIGHT_CONTROLLER_INDEX;

//------Honest to god global variables
//Probably an orthographic for thingy
var camera = new THREE.PerspectiveCamera( 70,
		window.innerWidth / window.innerHeight,
		0.01, 700);
var scene = new THREE.Scene().add(camera);
var mouse = null;