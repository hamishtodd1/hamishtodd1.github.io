let displayCamera = new THREE.PerspectiveCamera(90., 1., .01)
displayCamera.position.z = 8.5
displayCamera.rotation.order = "YXZ"

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

const outputColumn = new THREE.Mesh(new THREE.PlaneBufferGeometry(1., 9999999.), new THREE.MeshBasicMaterial({ color: 0x1F1F1F }))
outputColumn.renderOrder = 0
outputColumn.material.depthTest = false

const displayWindows = []

const pad = new THREE.Group()
pad.position.y = -Infinity //updated later
function getWorldLineHeight(){return pad.scale.y}
scene.add(pad)

let backgroundString = " b g o\n\n w\n r\n\n b  g  +\n b  g  *\n p  b  +\n i*(j+k)=i*j+i*k\n"

let thingMouseIsOn = "left"