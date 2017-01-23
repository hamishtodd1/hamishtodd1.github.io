//Avoid global state!
//Avoid allocations during iteration!

//-----Mathematical constants
var TAU = Math.PI * 2;
var PHI = (1+Math.sqrt(5)) / 2;
var Central_Z_axis = new THREE.Vector3(0,0,1); //also used as a placeholder normal
var Central_Y_axis = new THREE.Vector3(0,1,0);
var Central_X_axis = new THREE.Vector3(1,0,0);
var zero_vector = new THREE.Vector3();

//-----Fundamental, varying
var ourclock = new THREE.Clock( true ); //.getElapsedTime ()
var delta_t = 0;
var logged = 0;
var debugging = 0;

//Static or initialized and then static
var keycodeArray = "0123456789abcdefghijklmnopqrstuvwxyz";
var socket = io();
var gentilis;
var VRMODE = 0;
var RIGHT_CONTROLLER_INDEX = 0;
var LEFT_CONTROLLER_INDEX = 1-RIGHT_CONTROLLER_INDEX;

//var INITIAL_CAMERA_POSITION = new THREE.Vector3(0,0,0.6);

var OurVREffect;
var OurVRControls;

//Other
var Scene;
var Camera;
var stage = new NGL.Stage();

var video;
var videoTexture;
var videoImageContext;

//----variables that "get picked up", quite hacky
var loose_surface;

//The use case we consider is one VR, others are static screens. Not even stereoscopic screens because your orientation is determined by the lecturer
//Forget about master, just: if someone updates the position of the hands, it updates everyone's. That person can also update the orientation of the camera

//get rid of the distortion already

//each person logging in sends their viewport, you're looking at the smallest width by the smallest height

/*
 * there should be a texture with the link of the page on it, on the wall across from the camera
 * You should try and get a super short url, then think of an acronym to go with it.
 * If it involves a B or M can turn it to biomolecule
 */

/*
 * When you twist an AA, a ramachandran plot should appear
 * Does the whole donut spin or does it turn inside out?
 */

/*
 * have a readout of the current stresses on the protein? hard sphers might get you it
 */

/*
 * They're on the surface of a sphere. Normal rotation.
 * can use it to practice code for VALC >;)
 * Can the VRer control your pitch though?
 */

/*
 * should be able to highlight the backbone by having something shoot down it.
 */

/*
 * Might be nice to have the Vive's video input, but only when you're looking at the audience. 
 * Like there's a sort of window just behind the camera
 */

/*
 * Every lecturer has an "account". Give spectators no way of alerting them, so that they can't be griefed
 */

/* You should only be transmitting one set of values: the position and orientation of the hands and headset of the player
 * If your headset position gets close to the headset position of the other person in the space, that's fine and
 * 	their headset should disappear, so you can get a view of precisely what their hands are doing
 */

/* You should keep the code agnostic: make it easily modifiable to do any number of objects of any type, not just proteins
 * 
 */

/* Maybe don't expect position tracking for the head.
 * It depends on whether it comes before hand tracking/rink stuff.
 * If before, you can use it
 * If after, there will be headsets that only give hand coordinates relative to the head.
 * 	That's fine: lock the spectator to be directly in front of your face.
 */

/* For the benefit of people who don't realize how simple it is, the headset should probably glow 
 * So they realize that the random object in the corner that they might have missed is their connected phon
 */

/* You could have a website with a short URL (showmeprotein), have them type the serial number, or just name, into the bar 
 * Then get that from pdb.
 * But that might make the networking less elegant. You should talk to someone about networking
 */


//Since it'll take a while to set up surface and so on, only the first person to enter the lobby gets everything called

//Or maybe GearVR will have a "broadcast to nearby computer" thing. Harder to use than your plan and less likely to work

//One thing you can do right now is those videos. Could even get mathematicians in

/* Roll your own vive code?
 * Stereo: two viewports, offset, easy
 * Hand controllers: look up how to get peripheral data
 * Head orientation setup: you shouldn't be trying to avoid this
 */

//IF there's an HMD we use it, if not, then no stereo effect
//how to detect that? GearVR will use a special browser, but PC connected HMDs won't.
//	They will be running fullscreen though, you could detect that
//Hopefully this will be implemented by someone else

/* We're not going to bring in orientation getters and stereo effect processors etc until there's something with
 * support for controllers. Because at that point you'll probably have one thing to do everything
 * 
 * It would give you more control to do the stereo separately yourself.
 * Should probably check if they've got any speedup though
 */