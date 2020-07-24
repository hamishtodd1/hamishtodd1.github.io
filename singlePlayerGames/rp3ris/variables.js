const log = console.log

//Reasons this is a good idea: don't have to load in frames or video; can do mockVrInput
const VR_TESTING_MODE = 0;
const NONVR_TESTING_MODE = 1; //if you want switching to this to be automatic, you need to start with some kind of callback

const MODE = 0;
log("Mode: ", MODE===VR_TESTING_MODE?"VR testing":"Non VR testing")

const TAU = Math.PI * 2;
const HS3 = Math.sqrt(3)/2;
const sqrt2 = Math.sqrt(2);
const TETRAHEDRAL_ANGLE = 2 * Math.atan(Math.sqrt(2))

let zUnit = new THREE.Vector3(0,0,1); //also used as a placeholder normal
let yUnit = new THREE.Vector3(0,1,0);
let xUnit = new THREE.Vector3(1,0,0);
let zeroVector = new THREE.Vector3();

let clock = new THREE.Clock( true );
let frameDelta = 0;
let logged = 0;
let frameCount = 0;
const debugging = 0;

let renderer = null
let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera( 40.1, //the shorter fov of the samsung galaxy S8 selfie camera, determined by experiment
		window.innerWidth / window.innerHeight,
		0.02, 10);
camera.position.y = 1.6
camera.updateMatrixWorld()
scene.add(camera)
let ourRender = function()
{
	renderer.render( scene, camera );
}

let objectsToBeLookedAtByHelmet = [camera]

const RIGHT_CONTROLLER_INDEX = 0;
const LEFT_CONTROLLER_INDEX = 1-RIGHT_CONTROLLER_INDEX;
let hands = [new THREE.Object3D(),new THREE.Object3D()]
let rightHand = hands[RIGHT_CONTROLLER_INDEX]
let leftHand = hands[LEFT_CONTROLLER_INDEX]

let updateFunctions = [];
let holdables = [];

let realityVideoDomElement = document.createElement( 'video' )
realityVideoDomElement.style = "display:none"
realityVideoDomElement.crossOrigin = 'anonymous';

const discreteViridis = [
	{hex:0xFCE51E, color:new THREE.Color(0.984375,0.89453125,0.1171875)},
	{hex:0x49BE54, color:new THREE.Color(0.28515625,0.7421875,0.328125)},
	{hex:0x2A477A, color:new THREE.Color(0.1640625,0.27734375,0.4765625)},
	{hex:0x340042, color:new THREE.Color(0.203125,0.,0.2578125)}];