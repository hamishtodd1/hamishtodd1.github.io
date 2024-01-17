const zUnit = new THREE.Vector3(0, 0, 1)
const yUnit = new THREE.Vector3(0, 1, 0)
const xUnit = new THREE.Vector3(1, 0, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
const scene = new THREE.Scene()

//quest 2 is 96 degrees, we lop a bit off
function defaultCamera() {
    return new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100)
}
let camera = defaultCamera()
let container = document.createElement('div')
document.body.appendChild(container)

const zeroVector = new THREE.Vector3(0., 0., 0.)
const zeroMatrix = new THREE.Matrix4().set(0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.)

let textureLoader = new THREE.TextureLoader()
let objLoader = new THREE.OBJLoader()

const clock = new THREE.Clock(true)

const v0 = new THREE.Vector3()
const v1 = new THREE.Vector3()
const v2 = new THREE.Vector3()
const v3 = new THREE.Vector3()
const v4 = new THREE.Vector3()
const m1 = new THREE.Matrix4()
const m2 = new THREE.Matrix4()
const q1 = new THREE.Quaternion()
const q2 = new THREE.Quaternion()

const unchangingUnitSquareGeometry = new THREE.PlaneGeometry(1., 1.)

const outOfSightVec3 = new THREE.Vector3(999., 999., 999.)
const discreteViridis = [
	{ hex: 0xFCE51E, color: new THREE.Color(0.984375, 0.89453125, 0.1171875) },
	{ hex: 0x49BE54, color: new THREE.Color(0.28515625, 0.7421875, 0.328125) },
	{ hex: 0x2A477A, color: new THREE.Color(0.1640625, 0.27734375, 0.4765625) },
	{ hex: 0x340042, color: new THREE.Color(0.203125, 0., 0.2578125) }]

const spandrelGeo = new THREE.ShapeGeometry(
	new THREE.Shape()
		.bezierCurveTo(1., 0., 0., 1., 1., 1.)
		.lineTo(1., 0.)
		.lineTo(0., 0.)).translate(0., -.5, 0.)

var debugSphere = new THREE.Mesh(new THREE.SphereGeometry(.0431),new THREE.MeshBasicMaterial({color:0xCCCCCC}))
scene.add(debugSphere)
debugSphere.position.copy(outOfSightVec3)

THREE.Matrix4.prototype.log = function() {
	let order = [
		0, 4, 8,12,
		1, 5, 9,13,
		2, 6,10,14,
		3, 7,11,15
	]
	let str = ``
	order.forEach((index,i)=>{
		if(i<14&& i!==0 && i%4===0)
			str+=`\n`
		str += (this.elements[index] < 0. ? `` : ` `) + this.elements[index].toFixed(1) + `, `
	})
	log(str)
}

function updateBoxHelper(bbHelper, bb) {
	const array = bbHelper.geometry.attributes.position.array;

	let max = bb.max
	let min = bb.min
	array[0] = max.x; array[1] = max.y; array[2] = max.z;
	array[3] = min.x; array[4] = max.y; array[5] = max.z;
	array[6] = min.x; array[7] = min.y; array[8] = max.z;
	array[9] = max.x; array[10] = min.y; array[11] = max.z;
	array[12] = max.x; array[13] = max.y; array[14] = min.z;
	array[15] = min.x; array[16] = max.y; array[17] = min.z;
	array[18] = min.x; array[19] = min.y; array[20] = min.z;
	array[21] = max.x; array[22] = min.y; array[23] = min.z;

	bbHelper.geometry.attributes.position.needsUpdate = true
}