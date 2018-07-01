//-----Mathematical
const TAU = Math.PI * 2;
const HS3 = Math.sqrt(3)/2
const zUnit = new THREE.Vector3(0,0,1); //also used as a placeholder normal
const yUnit = new THREE.Vector3(0,1,0);
const xUnit = new THREE.Vector3(1,0,0);
const zeroVector = new THREE.Vector3();

//-----Fundamental
const clock = new THREE.Clock( true );
const debugging = 0;
var frameCount = 0;
var logged = 0;

const RIGHT_CONTROLLER_INDEX = 0;
const LEFT_CONTROLLER_INDEX = 1-RIGHT_CONTROLLER_INDEX;

var buttonBindings = {};

//------global variables
const camera = new THREE.PerspectiveCamera( 0,0,0.01, 10);
const scene = new THREE.Scene().add(camera, camera);
var mouse = null;

const objectsToBeUpdated = [];

const holdables = [];
const mouseables = [];

const STARTING_ASPECT_RATIO = 16/9; //because that's YOUR screen. It's also the youtube screen; that on it's own wouldn't necessarily mean you want it, but it's easy/simple to think of them as the same
const STARTING_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0 = 1;
const STARTING_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0 = STARTING_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0 / STARTING_ASPECT_RATIO;