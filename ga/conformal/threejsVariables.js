const zUnit = new THREE.Vector3(0, 0, 1)
const yUnit = new THREE.Vector3(0, 1, 0)
const xUnit = new THREE.Vector3(1, 0, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
let container = document.createElement('div')
document.body.appendChild(container)

const zeroVector = new THREE.Vector3(0., 0., 0.)
const zeroMatrix = new THREE.Matrix4().set(0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.)

const clock = new THREE.Clock(true)

const v1 = new THREE.Vector3()
const v2 = new THREE.Vector3()
const v3 = new THREE.Vector3()
const v4 = new THREE.Vector3()
const m1 = new THREE.Matrix4()
const m2 = new THREE.Matrix4()
const q1 = new THREE.Quaternion()
const q2 = new THREE.Quaternion()

const unchangingUnitSquareGeometry = new THREE.PlaneGeometry(1., 1.)

var debugSphere = new THREE.Mesh(new THREE.SphereGeometry(.0431),new THREE.MeshBasicMaterial({color:0xCCCCCC}))
scene.add(debugSphere)
debugSphere.position.copy(outOfSightVec3)

THREE.Matrix4.prototype.log = function() {
	let order = [
		0, 4, 8,12,
		1, 5, 9,13,
		2, 6,10,14,
		3, 7,11,15
	]
	let str = ``
	order.forEach((index,i)=>{
		if(i<14&& i!==0 && i%4===0)
			str+=`\n`
		str += (this.elements[index] < 0. ? `` : ` `) + this.elements[index].toFixed(1) + `, `
	})
	log(str)
}

let textureLoader = new THREE.TextureLoader()