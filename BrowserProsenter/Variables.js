//Avoid global state!
//Avoid allocations during iteration!



//-----Mathematical constants
var TAU = Math.PI * 2;
var Central_Z_axis = new THREE.Vector3(0,0,1); //also used as a placeholder normal

var Central_Y_axis = new THREE.Vector3(0,1,0);

//-----Fundamental things
var ourclock = new THREE.Clock( true );
var delta_t = 0;
var logged = 0;

var Scene;
var Camera;

var ModelZero;

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

/*
 * Hopefully 3Dmol can get you vertices from atom coords.
 */

/* For the benefit of people who don't realize how simple it is, the headset should probably glow 
 * So they realize that the random object in the corner that they might have missed is their connected phon
 */

/* You could have a website with a short URL (showmeprotein), have them type the serial number, or just name, into the bar 
 * Then get that from pdb.
 * But that might make the networking less elegant. You should talk to someone about networking
 */


//Since it'll take a while to set up surface and so on, only the first person to enter the lobby gets everything called

//Or maybe GearVR will have a "broadcast to nearby computer" thing. Harder to use than your plan

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
 * Their stereo effect is horseshit, it would give you more control to do the fuckers separately yourself.
 * Should probably check if they've got any speedup though
 */