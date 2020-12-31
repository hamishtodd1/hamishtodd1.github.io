const canvas = document.createElement("CANVAS")
document.body.appendChild(canvas)
const gl = canvas.getContext("webgl2")
if (!gl)
    console.error("Failed to get WebGL context, browser or device may not support WebGL.")

const backgroundColor = [.5, .5, .5]

const characterWidth = 1. / 3.

const mouseResponses = []
const rightMouseResponses = []

const IDENTIFIER_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

//---------Varying state

const NUM_NAMES = 63 //7 choose 1 + 7 choose 2 + 7 choose 3
const coloredNamesAlphabetically = Array(NUM_NAMES)
const drawingDetailses = Array(NUM_NAMES)

const functionsWithIr = {}

const carat = {
    positionInString: -1,
    positionInStringOld: -1,
    lineNumber: -1,
    flashingStart: Date.now(),
}

const displayWindows = []

const errorHighlightTokenIndices = []

const LAMBDA_SYMBOL = String.fromCharCode("955") //you CAN write "function", but lots of kids don't know "function". In python it's "def"
const JOIN_SYMBOL = String.fromCharCode("8744") //could change to v. But that is a letter you need to type
const INNER_SYMBOL = String.fromCharCode("8226") //could change to v. But that is a letter you need to type
const DAGGER_SYMBOL = String.fromCharCode("8224")
const MEET_SYMBOL = "^" //String.fromCharCode("8743") //for some reason this symbol is wide!

let backgroundString = ""

const derivedNames = []


/*
    earth(0.5e032 + 0.9e013) //color

    earth //whole map == earth Ie032 + Ie013

    earth(0.2,I) //meridian line
    earth(line) //new function
    earth(line)(.5)

    You put a point next to it and it maps to a color
    An array of points

    Press "[" to create an array. n is adjustable by hovering
    in the string you could have "[6]" to indicate 0./6.,1./6.,2./6....

    Ie1 = series of points from origin to e1
    Or I guess e12 + Ie20...

    Outside texture map to 0?

    I = [0,1]

    whole map == earth Ie032 + Ie013
*/

// `bw op or
// ow = op`+ MEET_SYMBOL + `or

// oy

// y = bgo`+ DAGGER_SYMBOL + `
// ry = bgo`+ JOIN_SYMBOL + `p

// def stereographic(bp) {
//     bo = p
// }
// b = reflectHorizontally(bgo)
// br = reflectHorizontally(go)
// by = stereographic(bgo)
// // bo //projectionOrigin
// // bg //plane
// // o = bo`+ JOIN_SYMBOL + `p //line
// // projection = o meet bg
// // }

// bg w r
// o gp bgo
// p g

// `