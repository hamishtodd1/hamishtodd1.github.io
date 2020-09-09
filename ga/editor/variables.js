let colorCharacters = ""
const colors = {
    "b": new THREE.Color(0., 0., 0.),
    "g": new THREE.Color(.4, .4, .4),
    "o": new THREE.Color(.9, .5, .2),
    "p": new THREE.Color(.5, 0., .5),
    "r": new THREE.Color(1., 0., 0.),
    "w": new THREE.Color(1., 1., 1.),
    "y": new THREE.Color(1., 1., 0.)
}
for (let color in colors) colorCharacters += color

let backgroundString = "b g o\n\nw\nr\n\n  b  +g  \n  b  *g  \n  p  +b  \n\n  i*(j+k)=i*j+i*k\n\ntor\n\n  "

const carat = new THREE.Mesh(new THREE.PlaneBufferGeometry(1., 1.), new THREE.MeshBasicMaterial({ color: 0xF8F8F0 }))
const variables = []
let numFreeParameterMultivectors = 0

const pad = new THREE.Group()
pad.position.y = -Infinity //updated later
function getWorldLineHeight() { return pad.scale.y }
scene.add(pad)

const outputColumn = new THREE.Mesh(new THREE.PlaneBufferGeometry(1., 9999999.), new THREE.MeshBasicMaterial({ color: 0x1F1F1F }))

const displayWindows = []
const displayRotation = new THREE.Euler()
displayRotation.q = new THREE.Quaternion()
let displayDistance = 10.

const onClicks = []

const renderFunctions = []