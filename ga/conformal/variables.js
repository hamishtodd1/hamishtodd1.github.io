let selectedSpreadsheet = null
const grabbables = []
const spreadsheets = []
const cellHeight = 0.11
const meshVizes = []

//enum
const spandrelGeo = new THREE.ShapeGeometry(
	new THREE.Shape()
		.bezierCurveTo(1., 0., 0., 1., 1., 1.)
		.lineTo(1., 0.)
		.lineTo(0., 0.)).translate(0.,-.5,0.)
const layerWidth = .001
const NO_VIZ_TYPE = 0
const SPHERE = 1
const ROTOR = 2 //grade wise that's more like a circle but this will do for now
const PP = 3
const CONFORMAL_POINT = 4
const MESH = 5
const vizTypes = [NO_VIZ_TYPE, SPHERE, ROTOR, PP, CONFORMAL_POINT, MESH]
//want a mesh type, and a curve type

const obj3dsWithOnBeforeRenders = []
const outOfSightVec3 = new THREE.Vector3(999., 999., 999.)
let mouse = null
const discreteViridis = [
	{ hex: 0xFCE51E, color: new THREE.Color(0.984375, 0.89453125, 0.1171875) },
	{ hex: 0x49BE54, color: new THREE.Color(0.28515625, 0.7421875, 0.328125) },
	{ hex: 0x2A477A, color: new THREE.Color(0.1640625, 0.27734375, 0.4765625) },
	{ hex: 0x340042, color: new THREE.Color(0.203125, 0., 0.2578125) }]