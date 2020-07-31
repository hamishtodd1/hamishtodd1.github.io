const generalMatrix = new THREE.Matrix4() //3 is sufficient
//to be applied to visualized vectors

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
const displayWindows = []

const pad = new THREE.Group()
scene.add(pad)