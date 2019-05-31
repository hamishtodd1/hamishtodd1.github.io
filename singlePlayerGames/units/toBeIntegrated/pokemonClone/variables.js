//-----Mathematical constants
var TAU = Math.PI * 2;
var PHI = (1+Math.sqrt(5)) / 2;
var HS3 = Math.sqrt(3)/2;
var zAxis = new THREE.Vector3(0,0,1); //also used as a placeholder normal
var yAxis = new THREE.Vector3(0,1,0);
var xAxis = new THREE.Vector3(1,0,0);
var zeroVector = new THREE.Vector3();

//-----Fundamental, varying
var ourclock = new THREE.Clock( true ); //.getElapsedTime ()
var frameDelta = 0.000001;
var logged = 0;
var debugging = 0;
var timeSinceStart = 0;

var camera = new THREE.OrthographicCamera( -0.5,0.5,0.5,-0.5, 1,20); //both first arguments are irrelevant
var scene = new THREE.Scene().add(camera);