v0 = new THREE.Vector3()

// const camera = new THREE.OrthographicCamera(-1., 1., 1., -1., 0.01, 10)
const camera = new THREE.PerspectiveCamera(-1., 1., 1., -1., 0.01, 10)

const cursor = new THREE.Mesh(new THREE.BoxGeometry(.02, .3, 0.), new THREE.MeshBasicMaterial({ color: 0x000000 }))
cursor.position.z = .01
scene.add(cursor)

const dwArea = new THREE.Object3D()

//important apparently otherwise you get stupidly laid out initial canvases
const initialString = `                     `

let cursorRing = null

const rings = []
let focussedRing = null