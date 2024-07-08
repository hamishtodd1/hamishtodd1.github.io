const TAU = Math.PI * 2.

const eps = .0001 //not been tweaked for anything yet, so feel free to change
const randomPt = new Fl().point(0.2448657087518873, 0.07640275431752674, 0.360207610338215, 0.)
const notchSpacing = .1 //a decimeter. Very natural, fight me!
const RIGHT = 0
const LEFT = 1
const passThroughMode = false

let gameMode = true
const designMode = false//!gameMode ? false :  true

const axesInvisible = true

let spectatorMode = null
let vrSession = null

const hands = [null,null]
const snappables = []
const vizes = []
const obj3dsWithOnBeforeRenders = []
const grabbees = [null, null]
const sclptables = []

//spreadsheet copypastes
    const spreadsheets = []
    let selectedSpreadsheet = null
    let selectedRow = 0
    const cellHeight = 0.03
    var allCellsVisible = false //false: meshes, selected cell, and selected cell's dependencies; true: everything visible
    const layerWidth = .001

    const NO_VIZ_TYPE = 0
    const PLANE = 1
    const ROTOR = 2
    const POINT = 3
    const MESH = 5
    const ROTOREFLECTION = 6
    const TRANSFLECTION = 7
    const vizTypes = [NO_VIZ_TYPE, PLANE, ROTOR]

let frameDelta = 0.
let frameCount = 0
const log = console.log
const debugUpdates = []
const socket = io()
let debuggerTrigger = false

const operators = [
    //2-argument
    `mul`,
    // `dqTo`,
    // `joinPt`, //could have "plus" sign for join, or "union"
    // `sandwich`,
    // `projectOn`,

    //requires specific types!
    // `userPow`, 
    // `velocityUnder`, `add`

    //1-argument
    // `copyTo`, `reverse`, `negate`, `userLogarithm`, `getDist`, `invariantDecomposition`
    //`hasDistance` ("if" statement! Returns 0 if it is)
    
	//distances, angles
	//direction-headed-in, eg derivitive, eg commutator
	//commutator will be very fun. Remember to take it with the logs of things
	//add with alpha and (1-alpha)

	/*	could be words?
		"compose", "invert", "average", "meet", "join", "apply", "project"
		this shows you might have lost something. Your goal was to communicate algebraic behaviour
		How ya gonna do that?
			FOR A GIVEN BUNCH OF EXAMPLES, show things
			Grade selection as "breaking apart"
			Those terms all "compile" to recognizably larger sets of boxes and wires
			Could show "apply" and "project"
			"Make orthogonal" and "select orthogonal"
	*/
]