const spreadsheets = []
const cellHeight = 0.11
const meshVizes = []
let userMeshesData = {}

let allCellsVisible = false //false: meshes, selected cell, and selected cell's dependencies; true: everything visible

let gotVr = false

const layerWidth = .001

//enum
const NO_VIZ_TYPE = 0
const SPHERE = 1
const ROTOR = 2 //grade wise that's more like a circle but this will do for now
const PP = 3
const CONFORMAL_POINT = 4
const MESH = 5
const vizTypes = [NO_VIZ_TYPE, SPHERE, ROTOR, PP, CONFORMAL_POINT, MESH]
//want a mesh type, and a curve type

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
let mouse = null

let lowerPenButtonProfile = { button: 5, buttons: 32 }
let upperPenButtonProfile = { button: 2, buttons: 2 }


const socket = io()

const VOXEL_WIDTH = .03

let selectorRayCone = null

let simulatingPaintingHand = false //true

const snappables = []
const sculptables = []