//you ought to make it so that no chapter's objects are referenced in any other chapter's functions

//--------------Mathematically fundamental
var HS3 = Math.sqrt(3)/2;
var PHI = (Math.sqrt(5) + 1) / 2;
var TAU = Math.PI * 2;
var icosahedron_dihedral_angle = Math.acos(-Math.sqrt(5) / 3);

//--------------Structurally fundamental
var NOTHING_MODE = 0;
var STATIC_PROTEIN_MODE = 1;
var STATIC_DNA_MODE = 2; 
var CK_MODE = 3;
var IRREGULAR_MODE = 4;
var QC_SPHERE_MODE = 5;
var CUBIC_LATTICE_MODE = 6;
var FINAL_FORMATION_MODE = 7;
	
var MODE = 3;

//--------------Technologically fundamental
var playing_field_width = 7*HS3;
var playing_field_height = 6;
var window_height = 540;
var window_width = window_height * playing_field_width / playing_field_height;
var min_cameradist = 10; //get any closer and the perspective is weird
var vertical_fov = 2 * Math.atan(playing_field_height/(2*min_cameradist));

var camera = new THREE.CombinedCamera(playing_field_width, playing_field_height, vertical_fov * 360 / TAU, 0.1, 1000, 0.1, 1000);
//var camera = new THREE.PerspectiveCamera( vertical_fov * 360 / TAU, window_width / window_height, 0.1, 1000 );
camera.position.z = MODE == CUBIC_LATTICE_MODE ? 3*min_cameradist : min_cameradist;
var camera_comparing_position = -1.56;

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window_width, window_height );
renderer.setClearColor( 0xffffff, 1);
document.body.appendChild( renderer.domElement );
var ytplayer;

var INITIALIZED = 0;
var PICTURES_LOADED = 0;

THREE.TextureLoader.prototype.crossOrigin = '';

//----------------Static
var FLATNET = 0;
var SURFACE = 1;
var POLYHEDRON = 2;

var showdebugstuff = 1;
var net_warnings = 1;

var z_central_axis = new THREE.Vector3(0,0,1);

var surfperimeter_default_radius = 0.02;
var varyingsurface_edges_default_radius = 0.012;

//Not including the central vertex
//Max T number of 49, to show the interesting ambiguity. That means a radius of 7*sqrt(7), anything larger than that isn't in there
//21 rings are needed for that, but some points can be hidden
//Maybe it should be a circle? intuitive connection. But that might make the edges look crap with the proteins. You could have a white plane with a circular cutout obscuring only parts of the proteins
//for time being we are making a nice, understandable number for irreg snapping
var number_of_hexagon_rings = 11;
var number_of_proteins_in_lattice = number_of_hexagon_rings * number_of_hexagon_rings * 6;
var lattice_scalefactor = playing_field_width / 2 / number_of_hexagon_rings; //TODO there is a more intuitive representation of this (maybe all of it)
var number_of_lattice_points = 1 + 3 * number_of_hexagon_rings*(number_of_hexagon_rings+1);

//in the limited environment we will end up with (and might do well to be going with) a circle of existence for lattice pts is prb. best

//----------------Initialized, then static
var squarelattice_vertices = Array(number_of_lattice_points*2);
var flatlattice_default_vertices = Array(number_of_lattice_points*3);
var latticevertex_nettriangle = new Uint16Array(number_of_lattice_points);

var backgroundtexture;
var viruspicture_scales = Array(1,0.577,0.5,0.3779,1/3,0.28867,0.27735);
var camera_movementspeed = 0;

var net_triangle_vertex_indices;
var line_index_pairs = new Uint16Array(60 * 2);
var cylinder_triangle_indices = new Uint16Array(6 * 8); //YO, YOU CAN'T QUITE PUT ANY NUMBER OF SEGMENTS IN THERE 
var prism_triangle_indices = new Uint16Array(12);

//--------------Varying, fundamental
var logged = 0;

var ourclock = new THREE.Clock( true );
var delta_t = 0;

var textures_loaded = 0;

var indicatorblobs = Array(10);

//--------------Varying
var vertex_tobechanged = 666;

var theyknowyoucanchangevertices = 0;
var theyknowyoucanslidetheslider = 0;

var capsidopenness = 0; //much depends on this, but we should have as few sharp changes as possible
var capsidclock = 0;
var capsidopeningspeed = 0;

var surfaceangle = 0.63;

//-----QS
var dodeca;
var dodeca_vertices_numbers = new Float32Array(47 * 3);
var dodeca_geometry;
var dodeca_openness = 0;
var dodeca_faceflatness = 0;
var dodeca_angle = 0;
var dodeca_triangle_vertex_indices;
var back_hider;
var quasilattice_default_vertices = Array(8*5+1);
var cutout_vector0; //these lie on the lattice
var cutout_vector1;
var cutout_vector0_player;
var cutout_vector1_player;
var quasi_shear_matrix = Array(4);
var quasicutout_intermediate_vertices = Array(quasilattice_default_vertices.length* 2 );
var quasicutouts_vertices_components = Array(quasilattice_default_vertices.length * 2 * 3 );
var quasicutout_line_pairs = new Uint16Array(quasilattice_default_vertices.length * 2 * 2 * 2); //TODO work out how many there should be in here really.
var quasicutouts = Array(60);
var quasicutout_meshes; //TODO MASSIVE speedup opportunity: merge
var stable_points = Array(345);
var triangleindices_for_stablepoints = Array(stable_points.length);
var lowest_unused_stablepoint = 0;
var quasiquasilattice;
var stablepointslattice;
var nearby_quasicutouts;
var set_stable_point = 666;
var Guide_quasilattice;
var stable_point_of_meshes_currently_in_scene = 666;
var modulated_CSP;
var NUM_QS_VERTICES_FOR_EDGES = 180; //reserved for edges. Must be divisible by 6

//------------3D penrose stuff
var animation_playing_automatically = true;

var Quasi_meshes = Array(5);
var meshes_original_numbers = Array(5);
var outlines_original_numbers = Array(5);
var Quasi_outlines = Array(5);
var prism_triangle_indices = new Uint16Array([0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3]);
var normalized_virtualdodeca_vertices = Array(20);
var normalized_virtualico_vertices = Array(20);

var icosahedra_directions = Array(12);


var golden_rhombohedra = Array(20);
var goldenicos = Array(12);
var golden_triacontahedra = Array(20);
var golden_stars = Array(12);
var ico_stars = Array(12);
var animation_progress = 0;
var previous_animation_progress = animation_progress; 
var progress_bar;
var slider;
var slider_grabbed = false;

//-----------formationatom stuff
var QC_atoms = Array(2000);
var QCatom_positions;
var outermost_QCatom_indices = Array(0,0,0,	0,0,0,	0,0,0,	0,0,0);
var animation_beginning_second = 17*60+3; //or whatever
var formation_animation_numbers = new Float32Array(23 * 60 * 3);

//-----------no longer formation atom stuff

var flatnet;
var flatnet_vertices_numbers;
var flatnet_vertices;
var flatnet_geometry;

var varyingsurface;
var varyingsurface_orientingradius = new Float32Array([0.95,0.95,0.95]);
var manipulation_surface;
var filler_points;

var surface;
var surface_vertices_numbers = new Float32Array(22*3);
var surface_vertices;
var surface_geometry;

var surfperimeter_line_index_pairs = new Uint16Array(22 * 2);
var surfinterior_line_index_pairs;
var surfperimeter_cylinders = Array(22);
var surfperimeter_spheres = Array(22);
var blast_cylinders = Array(10);

var groovepoints = Array(
	[21,5,20,3,18,1,0,0],
	[5,9,4,7,2,2],
	[9,13,8,11,6,6],
	[13,17,12,15,10,10],
	[17,21,16,19,14,14]);

var surface_triangle_side_unit_vectors = new Array();
var shear_matrix = new Array(20);

//initial values chosen rather randomly. Potential speedup by decreasing this? Does algorithm ever increase them? Probably easy to work out a better bound.
var radii = new Float32Array([100,100,100, 100,100,100, 100,100,100, 100,100,100]);
var alexandrov_triangle_vertex_indices = new Uint16Array( 3 * 20);
var polyhedron_edge_length;

var lattice_colors = new Float32Array(number_of_lattice_points * 3);

var flatlattice;
var flatlattice_vertices;
var flatlattice_geometry;
var flatlattice_center = new THREE.Vector2(0,0);
var flatlattice_vertices_numbers = new Float32Array(3 * number_of_lattice_points);
var flatlattice_vertices_velocities = new Float32Array(3 * number_of_lattice_points);

var net_vertices_closest_lattice_vertex = Array(22);

var surflattice;
var surflattice_vertices_numbers = new Float32Array(3 * number_of_lattice_points);
var surflattice_vertices;
var surflattice_geometry;

var LatticeScale = 1;//1/3 nice size //10/3 * HS3 / number_of_hexagon_rings; maybe the largest?
var LatticeAngle = 0; //TAU/12;
var LatticeGrabbed = false;

var vertices_derivations;
var minimum_angles = new Array(22); //between these two, we derive the polyhedron and surface

var circle;

//-----------------------Buttons
var VARYINGSURFACE_OPENMODE_BUTTON = 0;
var BOCAVIRUS_BUTTON = 1;
var T4_BUTTON = 2;
var Button = Array(2);
var setvirus_flatnet_vertices = Array(4);

//---------------------------buttons no more

var varyingsurface_cylinders = Array(41);
var varyingsurface_spheres = Array(22);
var irreghighlight_progresses = Array(22);

var vertex_identifications = new Array();
var W_triangle_indices = new Array();
var W_vertex_indices = new Array();
var W_surrounding_angles = new Float32Array([0,0,0,0,0,0]);
var V_vertex_indices = new Array();
var V_triangle_indices = new Array();
var V_angles = new Array(22);
var associated_vertices;

var V_squasher;

var CENTRAL_TRIANGLE = 6;
var CENTRAL_TRIANGLE_CORNER = 12;
var RIGHT_DEFECT = 13;
var CORE = 0;
var ASSOCIATED = 1;

var InputObject = {};
InputObject.mousex = window_width/2+30;
InputObject.mousey = window_height/2+30;
InputObject.isMouseDown = false;

var isMouseDown = false;
var isMouseDown_previously = false;

var raycaster = new THREE.Raycaster();
var MousePosition = new THREE.Vector2(0,0);
var OldMousePosition = new THREE.Vector2(0,0);
var Mouse_delta = new THREE.Vector2(0,0);

//----protein and bocavirus stuff
var proteinlattice;
var protein_vertex_indices = Array(number_of_proteins_in_lattice);

var number_of_vertices_in_protein;
var master_protein = new THREE.Mesh( new THREE.BufferGeometry(), new THREE.MeshLambertMaterial({color:0xf0f00f, transparent:true}) );
var atom_vertices_components;
var bocavirus_vertices = Array(20*3);
var initial_bocavirus_vertices = Array(20*3);
var bocavirus_proteins = Array(20);
var lights = [];

var DNA_cage;

var bocavirus_MovementAngle = 0;
var bocavirus_MovementAxis = new THREE.Vector3(1,0,0);