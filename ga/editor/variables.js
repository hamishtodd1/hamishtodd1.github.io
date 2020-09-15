let backgroundString = "b g o\n\nw  r\n\nw +w\nb  +g  \ng  *b  \np  +b  \nb *b \nexp w\nrev bw\n\ni*(j+k)=i*j+i*k\ntor\n"

let SHAFT_RADIUS = .06 //how thick an "infinitely thin" thing is, so vectors, lines, scalars

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

const onClicks = []

const latterUpdateFunctions = []

let mainDw = null