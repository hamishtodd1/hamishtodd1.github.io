const zUnit = new THREE.Vector3(0, 0, 1)
const yUnit = new THREE.Vector3(0, 1, 0)
const xUnit = new THREE.Vector3(1, 0, 0)

const zeroVector = new THREE.Vector3(0., 0., 0.)
const zeroMatrix = new THREE.Matrix4().set(0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.)

const v1 = new THREE.Vector3()
const v2 = new THREE.Vector3()
const v3 = new THREE.Vector3()
const v4 = new THREE.Vector3()
const m1 = new THREE.Matrix4()
const m2 = new THREE.Matrix4()
const q1 = new THREE.Quaternion()
const q2 = new THREE.Quaternion()
const pl = new THREE.Plane()

const unchangingUnitSphereGeometry = new THREE.EfficientSphereGeometry(1.)
const unchangingUnitSquareGeometry = new THREE.PlaneGeometry(1., 1.)

const debugging = 0
let logged = 0

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvas3d })
renderer.shadowMap.enabled = true
let camera = null
let mouse = null

const discreteViridis = [
	{ hex: 0xFCE51E, color: new THREE.Color(0.984375, 0.89453125, 0.1171875) },
	{ hex: 0x49BE54, color: new THREE.Color(0.28515625, 0.7421875, 0.328125) },
	{ hex: 0x2A477A, color: new THREE.Color(0.1640625, 0.27734375, 0.4765625) },
	{ hex: 0x340042, color: new THREE.Color(0.203125, 0., 0.2578125) }]
randomToViridis = (rand) =>{
	rand *= 3.
	let dv0 = discreteViridis[Math.floor(rand)].color
	let dv1 = discreteViridis[Math.ceil(rand)].color
	let t = rand-Math.floor(rand)
	return [lerp(t,dv0.r,dv1.r),lerp(t,dv0.g,dv1.g),lerp(t,dv0.b,dv1.b)]
}