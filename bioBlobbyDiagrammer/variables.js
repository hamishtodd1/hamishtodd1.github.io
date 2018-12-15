//-----Mathematical
const TAU = Math.PI * 2;
const HS3 = Math.sqrt(3)/2
const zUnit = new THREE.Vector3(0,0,1);
const yUnit = new THREE.Vector3(0,1,0);
const xUnit = new THREE.Vector3(1,0,0);
const zeroVector = new THREE.Vector3();

//-----Fundamental
const clock = new THREE.Clock( true );
const debugging = 0;
let frameCount = 0;
let logged = 0;

//------global variables
const camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
camera.position.z = 1
const scene = new THREE.Scene().add(camera, camera);
let mouse = null;

const updatables = [];
const clickables = [];