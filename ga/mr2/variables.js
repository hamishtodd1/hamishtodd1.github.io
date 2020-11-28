const canvas = document.createElement("CANVAS")
document.body.appendChild(canvas)
const gl = canvas.getContext("webgl2")
if (!gl)
    console.error("Failed to get WebGL context, browser or device may not support WebGL.")

const backgroundColor = [127, 127, 127];

const characterWidth = 1. / 3.

const mouseResponses = []
const rightMouseResponses = []

const IDENTIFIER_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

//---------Varying state

const coloredNamesAlphabetically = Array(63)  //7 choose 1 + 7 choose 2 + 7 choose 3
const transpiledFunctions = {}

const pictogramDrawers = {}

const carat = {
    positionInString: -1,
    lineNumber: -1,
    flashingStart: Date.now(),
}

const displayWindows = []

const LAMBDA_SYMBOL = String.fromCharCode("955") //you CAN write "function", but lots of kids don't know "function". In python it's "def"
const JOIN_SYMBOL = String.fromCharCode("8744")

let backgroundString = 
`bg w
r gp
// b o
bgo p

y = reverse(bgo)
ry = bgo`+JOIN_SYMBOL+`p

by = alternatingProj(pg)
// by = alternatingProj(reflect(pg))






`
//    0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,1.,1.,0.,
//    0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,1.,0.,1.,0.,

//dbl(0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,.5,0.,0.,)
//   a + a

// `
//    0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,.4,0.,1.,0.,color //colored

//    join(g,b)
//    g+b

//    0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,.5,0.,1.,0.,
//    inner(p,w)p
//    p


// `
// `
//    0.,0.,0.,0.,0.,0.,0.,0.,0.,1.,0.,0.,0.,0.,0.,0.,

//    earth(0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,-.3,0.,0.,)
// color



//    I0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,1.,0.,1.,0., //should be a series of points from center to there

// `
//it's more that "earth" gets replaced with the picture. Apply that to
//a 2D plane is a 3D plane with everything mapped to 0

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