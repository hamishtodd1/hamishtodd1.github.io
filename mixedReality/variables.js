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

let renderer = null
let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera( 40.1, //the shorter fov of the samsung galaxy S8 selfie camera, determined by experiment
		window.innerWidth / window.innerHeight,
		0.02, 10);
camera.position.y = 1.6
camera.updateMatrixWorld()
scene.add(camera)

let objectsToBeLookedAtByHelmet = [camera]

const RIGHT_CONTROLLER_INDEX = 0;
const LEFT_CONTROLLER_INDEX = 1-RIGHT_CONTROLLER_INDEX;
let handControllers = [new THREE.Object3D(),new THREE.Object3D()]
let rightHand = handControllers[RIGHT_CONTROLLER_INDEX]
let leftHand = handControllers[LEFT_CONTROLLER_INDEX]

let updateFunctions = [];
let alwaysUpdateFunctions = []
let holdables = [];

let chromiumRatherThanChrome = true
for( let i in window.navigator.plugins)
{
	if(window.navigator.plugins[i].name === "Chrome PDF Viewer")
	{
		chromiumRatherThanChrome = false
		break;
	}
}

let videoDomElement = document.createElement( 'video' )
videoDomElement.style = "display:none"
videoDomElement.crossOrigin = 'anonymous';