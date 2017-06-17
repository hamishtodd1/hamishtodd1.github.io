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

var VIEWBOX_HEIGHT = 3;
var VIEWBOX_WIDTH = 4;
var VIEWBOX_SPACING = 0.2;

//---------Static. At least in some sense.
var gentilis;

var Renderer;
var Scene;
var Camera;

var boundingbox;

var isMouseDown_previously = 0;
var isMouseDown = 0;
var MousePosition = new THREE.Vector3();

var video;
var videoTexture;
var videoImageContext;
var movieScreen;

var EMOJII_SICK;
var EMOJII_SUSCEPTIBLE;
var EMOJII_RESISTANT;
var EMOJII_DEAD;

var boundingbox_additional_width = 0.016;

var ourtextures = Array(5);

var cameradist = 10;

//TODO work out a cameradist that would give us a precise vertical position
var FOURBOX_CAMERAPOSITION = new THREE.Vector3((VIEWBOX_WIDTH + VIEWBOX_SPACING)/ 2,(VIEWBOX_HEIGHT + VIEWBOX_SPACING)/ 2, cameradist);

//------variable
var Infectiousness = 1; //Beta
var RecoveryTime = 1; // 1 / Nu

var Infected = 0;
var Resistant = 0;
var Population = 100;