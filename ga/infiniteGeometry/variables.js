const TAU = Math.PI * 2;
const zAxis = new THREE.Vector3(0,0,1); //also used as a placeholder normal
const yAxis = new THREE.Vector3(0,1,0);
const xAxis = new THREE.Vector3(1,0,0);
const zeroVector = new THREE.Vector3();

var ourClock = new THREE.Clock( true ); //.getElapsedTime ()
var frameDelta = 0;
var frameCount = 0;

const log = console.log

const clock = new THREE.Clock()

const scene = new THREE.Scene()

let unitSquareGeo = new THREE.PlaneBufferGeometry()

let ufs = []

let camera, renderer;
let initXr;
let orbitControls