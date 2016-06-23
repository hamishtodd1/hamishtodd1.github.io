//-----Mathematical constants
var TAU = Math.PI * 2;
var PHI = (1+Math.sqrt(5)) / 2;
var Central_Z_axis = new THREE.Vector3(0,0,1); //also used as a placeholder normal
var Central_Y_axis = new THREE.Vector3(0,1,0);
var Central_X_axis = new THREE.Vector3(1,0,0);

//-----Fundamental
var ourclock = new THREE.Clock( true ); //.getElapsedTime ()
var delta_t = 0;
var logged = 0;
var debugging = 0;

//Static. At least in some sense.
var gentilis;

var Scene;
var Camera;

var OurVREffect;
var OurVRControls;

var OurObject = new THREE.Object3D();

stage = new NGL.Stage();

var PointOfFocus = new THREE.Vector3(); //where the user is looking

/*
 * Don't rush it out with a bad fov or whatever
 * 
 * you probably want a floor
 * 
 * Coooooould look into basic collaboration with GearVR. Two people in there could talk to one another, they could have a cursor that's just on the protein
 * 
 * We would like a loading model a sign saying "loading", that throbs or something, until the protein arrives, and rotates to face you
 * 
 * Let's see about a nice translucent surface around a ribbon
 */

