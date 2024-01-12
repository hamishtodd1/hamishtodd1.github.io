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

const debugUpdates = []

let spectatorMode = null

const obj3dsWithOnBeforeRenders = []

const socket = io()

let simulatingPaintingHand = false //true

const snappables = []
const sclptables = []

const eps = .0001 //not been tweaked for much yet so have at it

let inVr = false

let operators = [
	`mul`, `mulReverse`, `add`, `sandwich`,
    //copy to! Very important, this is how you make many things move at once
	//`sqrt`,//`logarithm`
	//later: wedge, join, projection, sandwich
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
//possibly you should just have "reverse", not mulReverse, and make it two-step