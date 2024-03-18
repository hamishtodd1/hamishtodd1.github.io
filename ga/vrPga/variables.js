const TAU = Math.PI * 2.

let vizBeingModified = null
let spectatorMode = null
const snappables = []
let vrSession = null
const passThroughMode = true

const RIGHT = 0
const LEFT = 1
const hands = Array(2)
let debuggerTrigger = false

let frameDelta = 0.
let frameCount = 0
const log = console.log
const debugUpdates = []
const obj3dsWithOnBeforeRenders = []
const socket = io()
const eps = .0001 //not been tweaked for anything yet, so feel free to change

const randomPt = new Fl().point(0.2448657087518873, 0.07640275431752674, 0.360207610338215, 0.)

const translucentOpacity = .65

const operators = [
    `mul`,
    `dqTo`,
    `joinPt`,
    `sandwich`,
    // `copyTo`,
    
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