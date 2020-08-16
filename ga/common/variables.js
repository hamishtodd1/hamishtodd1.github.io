const TAU = Math.PI * 2
const HS3 = Math.sqrt(3)/2
const zUnit = new THREE.Vector3(0,0,1)
const yUnit = new THREE.Vector3(0,1,0)
const xUnit = new THREE.Vector3(1,0,0)

const zeroVector = new THREE.Vector3(0.,0.,0.)
const zeroMatrix = new THREE.Matrix4().set(0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.)

const clock = new THREE.Clock( true )
var frameCount = 0
var frameDelta = 1. / 60.

const log = console.log

const v1 = new THREE.Vector3()
const v2 = new THREE.Vector3()
const v3 = new THREE.Vector3()
const v4 = new THREE.Vector3()
const m1 = new THREE.Matrix4()
const m2 = new THREE.Matrix4()
const q1 = new THREE.Quaternion()
const pl = new THREE.Plane()

const unchangingUnitSphereGeometry = new THREE.EfficientSphereGeometry(1.)
const unchangingUnitSquareGeometry = new THREE.PlaneGeometry(1., 1.)

const updateFunctions = []

//----Below here is no longer shared with Mathigon
const clickables = []
var bindButton = () => { }

const debugging = 0
var logged = 0

const RIGHT_CONTROLLER_INDEX = 0
const LEFT_CONTROLLER_INDEX = 1-RIGHT_CONTROLLER_INDEX

const camera = new THREE.PerspectiveCamera( 0.,0.,.1, 10.)
// new THREE.OrthographicCamera( -1.,1.,1.,-1.,0.01, 10)
const renderer = new THREE.WebGLRenderer({ antialias: true })
const scene = new THREE.Scene().add(camera)
var mouse = null

const discreteViridis = [
	{hex:0xFCE51E, color:new THREE.Color(0.984375,0.89453125,0.1171875)},
	{hex:0x49BE54, color:new THREE.Color(0.28515625,0.7421875,0.328125)},
	{hex:0x2A477A, color:new THREE.Color(0.1640625,0.27734375,0.4765625)},
	{hex:0x340042, color:new THREE.Color(0.203125,0.,0.2578125)}]