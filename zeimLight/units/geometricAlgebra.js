/*
	Infinity - yellow
	1 - red
	0 - black
	-1 - green
	-Infinity - cyan

	So it's like the countdown numbers game, just tryna make stuff

	One problem is you can't put everything at the origin

	What the hell are summed bivectors?
	Trivector times bivector is presumably vector. 
	Trivector times trivector is presumably bivector.

	Trivector is a sphere that is blue on inside

	Juuuuust think about 3D

	Ideally there's some way of showing how they get multiplied

	probably wanna grab and rotate all simultaneously
*/

function initGeometricAlgebra()
{
	let multiVector = new THREE.Group()
	scene.add(multiVector)

	let vector = new THREE.Group()
	let vectorRadius = 0.1
	let body = new THREE.Mesh(CylinderBufferGeometryUncentered(vectorRadius, 1, 32, true),new THREE.MeshLambertMaterial())
	// let bottom = new THREE.Mesh(new THREE.CircleBufferGeometry(1,32),new THREE.MeshLambertMaterial({color:0xC84D58}))
	vector.add(body)
	vector.scale.multiplyScalar(0.2)
	multiVector.add(vector)
	let arrowHeadGeometry = null
	{
		let arrowHeadHeight = nodeRadius * 2
		arrowHeadGeometry = new THREE.CylinderBufferGeometry(0,vectorRadius*2,arrowHeadHeight,12)
		arrowHeadGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-arrowHeadHeight/2,0))
	}

	let biVector = new THREE.Group()
	let top = new THREE.Mesh(new THREE.CircleBufferGeometry(1,32),new THREE.MeshLambertMaterial({color:0x484369}))
	let bottom = new THREE.Mesh(new THREE.CircleBufferGeometry(1,32),new THREE.MeshLambertMaterial({color:0xC84D58}))
	biVector.add(top,bottom)
	biVector.scale.multiplyScalar(0.2)
	multiVector.add(biVector)

	let triVector = new THREE.Group()
	let triVectorGeo = new THREE.BoxBufferGeometry(1,1,1)
	let outer = new THREE.Mesh(triVectorGeo,new THREE.MeshLambertMaterial({color:0x9A2D73, transparent:true, opacity:0.8}))
	let inner = new THREE.Mesh(triVectorGeo,new THREE.MeshLambertMaterial({color:0xF1C54A, side:THREE.BackSide}))
	triVector.add(inner)
	triVector.scale.multiplyScalar(0.5)
	multiVector.add(triVector)

	let scalar = makeTextSign("3")
	console.log(scalar)
	scalar.children[0].material.depthTest = false
	scalar.children[1].material.depthTest = false
	scalar.scale.multiplyScalar(0.1)
	multiVector.add(scalar)


	//you take the wedge of them which gives you a multivector, and the dot of them which gives you a scalar

	updateFunctions.push(function()
	{
		if(mouse.lastClickedObject === null)
		{
			mouse.rotateObjectByGesture(vector)
			mouse.rotateObjectByGesture(biVector)
			mouse.rotateObjectByGesture(triVector)
		}
	})
}