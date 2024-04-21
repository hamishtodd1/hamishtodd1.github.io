function sq(a) {
	return a * a
}
const TAU = Math.PI * 2.
const HS3 = Math.sqrt(3.) / 2.
const PHI = (1. + Math.sqrt(5.)) / 2.
const smallerInLarger = {}

var frameDelta = 0.
var frameCount = 0
const log = console.log

const obj3dsWithOnBeforeRenders = []

var simulatingPaintingHand = false

const socket = io()

var inVr = false

let debugUpdates = []

let limitsLower = new THREE.Vector3().set(-2.2,-1.3, 0.)
let limitsUpper = new THREE.Vector3().set( 2.2, 1.3, .1)