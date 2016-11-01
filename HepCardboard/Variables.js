//Avoid global state!
//Avoid allocations during iteration!

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

THREE.TextureLoader.prototype.crossOrigin = '';

var gentilis;

var Scene;
var Camera;

var INITIAL_CAMERA_POSITION = new THREE.Vector3(0,0,0.6);

var Master;

var OurVREffect;
var OurVRControls;

var VRMODE = 0;

var video;
var videoTexture;
var videoImageContext;

stage = new NGL.Stage();

//get rid of the distortion already

//We have a "protein of interest" that the non-VR folks are looking at. When the VRer picks up a new one, their focus snaps to that

//Probably it's the case that iff there's a person in VR, you want the non-VRers to be merged into one camera

//Want to see the link on the wall behind the camera

/*
 * When you twist an AA, a ramachandran plot should appear
 * Does the whole donut spin or does it turn inside out?
 */

/*
 * Question for mr molecular simulation: can you have a readout of the current stresses on the protein? Can that be done in realtime?
 */

/*
 * GearVR: turn your head and the protein will stay where you're looking, this allows you to see it from every angle
 * maybe only follow them if you're the master?
 * Or maybe don't move the protein, move them. Too jarring? You probably won't have multiple rotation-tracking-only users.
 */

/*
 * In advance of symposium, see about and calibrate the sensors for you standing in front of your laptop
 */

/*
 * Very simple thing to add that can be claimed as the beginnings of an integrated environment:
 * 	import pile of jpegs (which in powerpoint is just "save as") and display them on a pad.
 * but how to get them in?
 * Could point at a folder and start downloads of "SlideX.JPG" for every value of X until you get an error
 */

/*
 * there should be a texture with the link of the page on it.
 * You should try and get a super short url, then think of an acronym to go with it.
 * If it involves a B or M can turn it to biomolecule
 */

/*
 * give touch controls to people on phones. Could have a fun game about swatting flies
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


//360 panorama is a little orb. That's what it is - it's just a case of changing its scale

/*
 * Open up a protein, and if you're the first it creates a websocket connecting to a uniquely identified server.
 * There's some logic to the ID of that server so that the next person to go to it gets the same one
 * 
 * For now, just use the one server
 */

/*
 * You probably want to make it so people can upload their own. That creates a lobby and gives a tinyurl
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