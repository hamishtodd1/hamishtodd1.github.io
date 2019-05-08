const TAU = Math.PI * 2;
const HS3 = Math.sqrt(3)/2;
const TETRAHEDRAL_ANGLE = 2 * Math.atan(Math.sqrt(2))

let zUnit = new THREE.Vector3(0,0,1); //also used as a placeholder normal
let yUnit = new THREE.Vector3(0,1,0);
let xUnit = new THREE.Vector3(1,0,0);
let zeroVector = new THREE.Vector3();

let clock = new THREE.Clock( true );
let frameDelta = 0;
let logged = 0;
let frameCount = 0;
const log = console.log
const debugging = 0;

let camera = new THREE.PerspectiveCamera( 30, //can be changed by VR effect
		window.innerWidth / window.innerHeight,
		0.02, 5);
let scene = new THREE.Scene().add(camera);
let renderer = new THREE.WebGLRenderer( { antialias: true } );

let mouse = null
let clickables = []

const RIGHT_CONTROLLER_INDEX = 0;
const LEFT_CONTROLLER_INDEX = 1-RIGHT_CONTROLLER_INDEX;
let handControllers = [new THREE.Object3D(),new THREE.Object3D()]
let imitationHand = null

let updateFunctions = [];
let alwaysUpdateFunctions = []
let holdables = [];

let chromiumRatherThanChrome = true
for(i in window.navigator.plugins)
{
	if(window.navigator.plugins[i].name === "Chrome PDF Viewer")
	{
		chromiumRatherThanChrome = false
		break;
	}
}