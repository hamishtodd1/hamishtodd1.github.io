
/* Tony Hyun Kim
 * 2014 04 16: Following Stemkoski's Three.js examples
 */

// Standard global variables
var container, scene, camera, renderer, controls, stats;
var clock = new THREE.Clock();
var keyboard = new KeyboardState();

// Custom global variables
var axialAnim;
var axial;

init();
animate();

// Initialization function
function init()
{
    scene = new THREE.Scene();

    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;

    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(300,300,400);
    camera.lookAt(scene.position);

    // Renderer
    if (Detector.webgl)
        renderer = new THREE.WebGLRenderer({antialias: true});
    else
        renderer = new THREE.CanvasRenderer();

    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container = document.getElementById('ThreeJS');
    container.appendChild(renderer.domElement);

    // Events
    THREEx.WindowResize(renderer, camera);
    THREEx.FullScreen.bindKey({charCode: 'm'.charCodeAt(0)});

    // Controls
    controls = new THREE.OrbitControls( camera, renderer.domElement);

    // Stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );

    // Set up scene
    //------------------------------------------------------------

    // Light
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,250,0);
    scene.add(light);

    // Skybox
    var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
    var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
    var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial);
    scene.add(skyBox);

    // MRI slices
    //------------------------------------------------------------

    // Axial -- movable
    var axialTexture = new THREE.ImageUtils.loadTexture('images/brainmosaic_axial_16x16.png');
    axialAnim = new TextureAnimator( axialTexture, 16, 16, 256, 25);

    var axialMaterial = new THREE.MeshBasicMaterial( { map: axialTexture, side: THREE.DoubleSide } );
    var axialGeometry = new THREE.PlaneGeometry(178, 256, 1, 1);
    axial = new THREE.Mesh(axialGeometry, axialMaterial);
    axial.position.set(0, 0, 0);
    axial.rotateOnAxis(new THREE.Vector3(1,0,0), Math.PI/2.0);
    scene.add(axial);

    // Sagittal -- fixed
    var sagittalTexture = new THREE.ImageUtils.loadTexture('images/sagittal_slice96.png');
    var sagittalMaterial = new THREE.MeshBasicMaterial( { map: sagittalTexture, side: THREE.DoubleSide, transparent: true, opacity: 0.85} );
    var sagittalGeometry = new THREE.PlaneGeometry(256, 256, 1, 1);
    var sagittal = new THREE.Mesh(sagittalGeometry, sagittalMaterial);
    sagittal.position.set(+89-96,0,0);
    sagittal.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI/2.0);
    scene.add(sagittal);

    // Coronal -- fixed
    var coronalTexture = new THREE.ImageUtils.loadTexture('images/coronal_slice158.png');
    var coronalMaterial = new THREE.MeshBasicMaterial( { map: coronalTexture, side: THREE.DoubleSide, transparent: true, opacity: 0.85} );
    var coronalGeometry = new THREE.PlaneGeometry(178, 256, 1, 1);
    coronal = new THREE.Mesh(coronalGeometry, coronalMaterial);
    coronal.position.set(0,0,128-158);
    scene.add(coronal);
}

// Loop
function animate()
{
    requestAnimationFrame( animate );
    render();
    update();
}

function render()
{
    renderer.render(scene, camera);
}

function update()
{
    keyboard.update();

    var delta = clock.getDelta(); // Time between calls in seconds

    axialAnim.updateTimeout(1000*delta); // Convert to ms
    if (keyboard.pressed("W"))
        axialAnim.update(-1);
    if (keyboard.pressed("S"))
        axialAnim.update(1);
    axial.position.set(0,128-axialAnim.currentTile,0);

    controls.update();
    stats.update();
}

function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, timeoutDuration)
{
    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    this.numberOfTiles = numTiles;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical );

    // Debouncing mechanism
    this.timeoutDuration = timeoutDuration; // Time in ms
    this.timeout = 0.0;
    this.updateTimeout = function( milliSec )
    {
        this.timeout -= milliSec;
        if (this.timeout < 0)
            this.timeout = 0;
    };

    // Method to update frame
    this.currentTile = 0;
    this.update = function(offset)
    {
        if (this.timeout == 0)
        {
            this.timeout = this.timeoutDuration;
            this.currentTile += offset;
            this.currentTile = mod(this.currentTile, this.numberOfTiles);

            var currentColumn = this.currentTile % this.tilesHorizontal;
            texture.offset.x = currentColumn / this.tilesHorizontal;
            var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
            texture.offset.y = currentRow / this.tilesVertical;
        }
    };
}

function mod(m, n)
{
    return ((m % n) + n) % n;
}

