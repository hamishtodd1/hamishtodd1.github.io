//-----Mathematical constants
TAU = Math.PI * 2;
PHI = (1+Math.sqrt(5)) / 2;
HS3 = Math.sqrt(3)/2;
zAxis = new THREE.Vector3(0,0,1); //also used as a placeholder normal
yAxis = new THREE.Vector3(0,1,0);
xAxis = new THREE.Vector3(1,0,0);
zeroVector = new THREE.Vector3();

//-----Fundamental, varying
ourclock = new THREE.Clock( true ); //.getElapsedTime ()
frameDelta = 0.000001;
logged = 0;
debugging = 0;
timeSinceStart = 0;

var ourTextureLoader = new THREE.TextureLoader();