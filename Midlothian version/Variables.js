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

var indicatorsphere = new THREE.Mesh(new THREE.SphereGeometry(0.008), new THREE.MeshBasicMaterial({color:0xff0000}));

//Static. At least in some sense.
var socket = io();

var gentilis;

var Scene;
var Camera;

var INITIAL_CAMERA_POSITION = new THREE.Vector3(0,0,0.6);

var Master;

var OurVREffect;
var OurVRControls;

var OurOBJLoader = new THREE.OBJLoader();
var OurDAELoader = new THREE.ColladaLoader();

var VRMODE = 0;

var video;
var videoTexture;
var videoImageContext;

var Grain_of_sand;
var Ourface;

var rubps_colors = Array(76);

rubps_colors[0] = new THREE.Color(0,0,0);
rubps_colors[1] = new THREE.Color(0,0,0);
rubps_colors[2] = new THREE.Color(0,0,0);
rubps_colors[3] = new THREE.Color(0,0,0);
rubps_colors[4] = new THREE.Color(0,0,0);
rubps_colors[5] = new THREE.Color(1,0,0);
rubps_colors[6] = new THREE.Color(1,0,0);
rubps_colors[7] = new THREE.Color(1,0,0);
rubps_colors[8] = new THREE.Color(1,0,0);
rubps_colors[9] = new THREE.Color(1,0,0);
rubps_colors[10] = new THREE.Color(1,153/255,0);
rubps_colors[11] = new THREE.Color(1,153/255,0);
rubps_colors[12] = new THREE.Color(1,0,0);
rubps_colors[13] = new THREE.Color(1,0,0);
rubps_colors[14] = new THREE.Color(1,0,0);
rubps_colors[15] = new THREE.Color(1,0,0);
rubps_colors[16] = new THREE.Color(1,0,0);
rubps_colors[17] = new THREE.Color(1,0,0);
rubps_colors[18] = new THREE.Color(0,1,0);
rubps_colors[19] = new THREE.Color(0,0,0);
rubps_colors[20] = new THREE.Color(0,0,0);
rubps_colors[21] = new THREE.Color(0,0,0);
rubps_colors[22] = new THREE.Color(0,0,0);
rubps_colors[23] = new THREE.Color(0,0,0);
rubps_colors[24] = new THREE.Color(1,0,0);
rubps_colors[25] = new THREE.Color(1,0,0);
rubps_colors[26] = new THREE.Color(1,0,0);
rubps_colors[27] = new THREE.Color(1,0,0);
rubps_colors[28] = new THREE.Color(1,0,0);
rubps_colors[29] = new THREE.Color(1,153/255,0);
rubps_colors[30] = new THREE.Color(1,153/255,0);
rubps_colors[31] = new THREE.Color(1,0,0);
rubps_colors[32] = new THREE.Color(1,0,0);
rubps_colors[33] = new THREE.Color(1,0,0);
rubps_colors[34] = new THREE.Color(1,0,0);
rubps_colors[35] = new THREE.Color(1,0,0);
rubps_colors[36] = new THREE.Color(1,0,0);
rubps_colors[37] = new THREE.Color(0,1,0);
rubps_colors[38] = new THREE.Color(0,0,0);
rubps_colors[39] = new THREE.Color(0,0,0);
rubps_colors[40] = new THREE.Color(0,0,0);
rubps_colors[41] = new THREE.Color(0,0,0);
rubps_colors[42] = new THREE.Color(0,0,0);
rubps_colors[43] = new THREE.Color(1,0,0);
rubps_colors[44] = new THREE.Color(1,0,0);
rubps_colors[45] = new THREE.Color(1,0,0);
rubps_colors[46] = new THREE.Color(1,0,0);
rubps_colors[47] = new THREE.Color(1,0,0);
rubps_colors[48] = new THREE.Color(1,153/255,0);
rubps_colors[49] = new THREE.Color(1,153/255,0);
rubps_colors[50] = new THREE.Color(1,0,0);
rubps_colors[51] = new THREE.Color(1,0,0);
rubps_colors[52] = new THREE.Color(1,0,0);
rubps_colors[53] = new THREE.Color(1,0,0);
rubps_colors[54] = new THREE.Color(1,0,0);
rubps_colors[55] = new THREE.Color(1,0,0);
rubps_colors[56] = new THREE.Color(0,1,0);
rubps_colors[57] = new THREE.Color(0,0,0);
rubps_colors[58] = new THREE.Color(0,0,0);
rubps_colors[59] = new THREE.Color(0,0,0);
rubps_colors[60] = new THREE.Color(0,0,0);
rubps_colors[61] = new THREE.Color(0,0,0);
rubps_colors[62] = new THREE.Color(1,0,0);
rubps_colors[63] = new THREE.Color(1,0,0);
rubps_colors[64] = new THREE.Color(1,0,0);
rubps_colors[65] = new THREE.Color(1,0,0);
rubps_colors[66] = new THREE.Color(1,0,0);
rubps_colors[67] = new THREE.Color(1,153/255,0);
rubps_colors[68] = new THREE.Color(1,153/255,0);
rubps_colors[69] = new THREE.Color(1,0,0);
rubps_colors[70] = new THREE.Color(1,0,0);
rubps_colors[71] = new THREE.Color(1,0,0);
rubps_colors[72] = new THREE.Color(1,0,0);
rubps_colors[73] = new THREE.Color(1,0,0);
rubps_colors[74] = new THREE.Color(1,0,0);
rubps_colors[75] = new THREE.Color(0,1,0);

var rubps_positions = Array(76);

rubps_positions[0] = new THREE.Vector3(-37.730, 33.292, 30.128 );
rubps_positions[1] = new THREE.Vector3(-36.881, 33.068, 31.384 );
rubps_positions[2] = new THREE.Vector3(-36.775, 34.298, 32.373 );
rubps_positions[3] = new THREE.Vector3(-38.074, 34.642, 33.101 );
rubps_positions[4] = new THREE.Vector3(-37.906, 35.786, 34.119 );
rubps_positions[5] = new THREE.Vector3(-37.698, 32.316, 29.052 );
rubps_positions[6] = new THREE.Vector3(-36.271, 31.996, 31.576 );
rubps_positions[7] = new THREE.Vector3(-35.819, 34.030, 33.335 );
rubps_positions[8] = new THREE.Vector3(-39.047, 35.015, 32.182 );
rubps_positions[9] = new THREE.Vector3(-38.904, 35.961, 35.139 );
rubps_positions[10] = new THREE.Vector3(-38.623, 32.507, 27.754 );
rubps_positions[11] = new THREE.Vector3(-39.270, 37.429, 35.765 );
rubps_positions[12] = new THREE.Vector3(-38.520, 31.306, 26.926 );
rubps_positions[13] = new THREE.Vector3(-37.877, 33.705, 26.992 );
rubps_positions[14] = new THREE.Vector3(-39.936, 32.983, 28.177 );
rubps_positions[15] = new THREE.Vector3(-40.574, 37.292, 36.515 );
rubps_positions[16] = new THREE.Vector3(-39.513, 38.316, 34.473 );
rubps_positions[17] = new THREE.Vector3(-38.063, 37.966, 36.453 );
rubps_positions[18] = new THREE.Vector3(-35.034, 31.603, 33.507 );
rubps_positions[19] = new THREE.Vector3( -4.438, 75.268, 30.130 );
rubps_positions[20] = new THREE.Vector3( -4.658, 74.417, 31.386 );
rubps_positions[21] = new THREE.Vector3( -3.424, 74.311, 32.371 );
rubps_positions[22] = new THREE.Vector3( -3.079, 75.610, 33.099 );
rubps_positions[23] = new THREE.Vector3( -1.932, 75.441, 34.114 );
rubps_positions[24] = new THREE.Vector3( -5.418, 75.236, 29.057 );
rubps_positions[25] = new THREE.Vector3( -5.729, 73.806, 31.581 );
rubps_positions[26] = new THREE.Vector3( -3.689, 73.354, 33.333 );
rubps_positions[27] = new THREE.Vector3( -2.710, 76.584, 32.180 );
rubps_positions[28] = new THREE.Vector3( -1.755, 76.439, 35.134 );
rubps_positions[29] = new THREE.Vector3( -5.232, 76.163, 27.760 );
rubps_positions[30] = new THREE.Vector3( -0.285, 76.805, 35.756 );
rubps_positions[31] = new THREE.Vector3( -6.435, 76.060, 26.935 );
rubps_positions[32] = new THREE.Vector3( -4.035, 75.419, 26.993 );
rubps_positions[33] = new THREE.Vector3( -4.755, 77.476, 28.183 );
rubps_positions[34] = new THREE.Vector3( -0.421, 78.108, 36.508 );
rubps_positions[35] = new THREE.Vector3(  0.598, 77.050, 34.462 );
rubps_positions[36] = new THREE.Vector3(  0.255, 75.598, 36.441 );
rubps_positions[37] = new THREE.Vector3( -6.114, 72.567, 33.512 );
rubps_positions[38] = new THREE.Vector3( 37.542, 41.943, 29.820 );
rubps_positions[39] = new THREE.Vector3( 36.704, 42.167, 31.083 );
rubps_positions[40] = new THREE.Vector3( 36.606, 40.938, 32.073 );
rubps_positions[41] = new THREE.Vector3( 37.911, 40.594, 32.790 );
rubps_positions[42] = new THREE.Vector3( 37.752, 39.450, 33.810 );
rubps_positions[43] = new THREE.Vector3( 37.501, 42.918, 28.744 );
rubps_positions[44] = new THREE.Vector3( 36.096, 43.239, 31.279 );
rubps_positions[45] = new THREE.Vector3( 35.658, 41.206, 33.043 );
rubps_positions[46] = new THREE.Vector3( 38.877, 40.220, 31.863 );
rubps_positions[47] = new THREE.Vector3( 38.758, 39.276, 34.822 );
rubps_positions[48] = new THREE.Vector3( 38.415, 42.727, 27.438 );
rubps_positions[49] = new THREE.Vector3( 39.130, 37.808, 35.445 );
rubps_positions[50] = new THREE.Vector3( 38.305, 43.927, 26.610 );
rubps_positions[51] = new THREE.Vector3( 37.663, 41.528, 26.683 );
rubps_positions[52] = new THREE.Vector3( 39.732, 42.251, 27.850 );
rubps_positions[53] = new THREE.Vector3( 40.440, 37.945, 36.184 );
rubps_positions[54] = new THREE.Vector3( 39.362, 36.920, 34.151 );
rubps_positions[55] = new THREE.Vector3( 37.928, 37.271, 36.143 );
rubps_positions[56] = new THREE.Vector3( 34.875, 43.633, 33.221 );
rubps_positions[57] = new THREE.Vector3(  4.244,  0.000, 30.018 );
rubps_positions[58] = new THREE.Vector3(  4.473,  0.847, 31.274 );
rubps_positions[59] = new THREE.Vector3(  3.248,  0.950, 32.269 );
rubps_positions[60] = new THREE.Vector3(  2.909, -0.350, 32.997 );
rubps_positions[61] = new THREE.Vector3(  1.769, -0.185, 34.021 );
rubps_positions[62] = new THREE.Vector3(  5.215,  0.034, 28.937 );
rubps_positions[63] = new THREE.Vector3(  5.545,  1.458, 31.462 );
rubps_positions[64] = new THREE.Vector3(  3.519,  1.905, 33.231 );
rubps_positions[65] = new THREE.Vector3(  2.533, -1.323, 32.078 );
rubps_positions[66] = new THREE.Vector3(  1.600, -1.185, 35.040 );
rubps_positions[67] = new THREE.Vector3(  5.019, -0.889, 27.639 );
rubps_positions[68] = new THREE.Vector3(  0.136, -1.554, 35.672 );
rubps_positions[69] = new THREE.Vector3(  6.216, -0.783, 26.806 );
rubps_positions[70] = new THREE.Vector3(  3.816, -0.144, 26.884 );
rubps_positions[71] = new THREE.Vector3(  4.547, -2.203, 28.062 );
rubps_positions[72] = new THREE.Vector3(  0.278, -2.859, 36.420 );
rubps_positions[73] = new THREE.Vector3( -0.757, -1.796, 34.384 );
rubps_positions[74] = new THREE.Vector3( -0.399, -0.349, 36.365 );
rubps_positions[75] = new THREE.Vector3(  5.946,  2.693, 33.393 );


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