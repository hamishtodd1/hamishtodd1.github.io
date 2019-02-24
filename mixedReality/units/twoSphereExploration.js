/*
	How to "advance?" Depends on what the advancement is
		Make something appear
		Take things out of a box, and while they're inside the box they ain't updated?
		Ideally advancement
*/

function initTwoSphereExploration()
{
	imitationHand.position.x = 2

	let generalSphereRadius = 0.2

	let ourBulb = new THREE.Group()
	scene.add(ourBulb)
	updateFunctions.push(function()
	{
		ourBulb.position.lerp(new THREE.Vector3(0,0,generalSphereRadius),0.1)
	})

	new THREE.OBJLoader().load("data/Lamp_Fluorescent_Illuminated.obj",function(obj)
	{
		ourBulb.scale.multiplyScalar(0.0007)

		let bottom = obj.children[0]
		ourBulb.add(new THREE.Mesh(bottom.geometry,new THREE.MeshStandardMaterial({
			color:0x000000
		})))

		let bowlGeo = new THREE.Geometry().fromBufferGeometry(obj.children[1].geometry)
		bowlGeo.mergeVertices()
		bowlGeo.computeFaceNormals()
		bowlGeo.computeVertexNormals()
		ourBulb.add(new THREE.Mesh(bowlGeo,new THREE.MeshLambertMaterial({
			color:0xFFFFFF
		})))

		let screw = obj.children[4]
		console.log(obj.children.length)
		ourBulb.add(new THREE.Mesh(screw.geometry,new THREE.MeshStandardMaterial({
			color:0xCCCCCC
		})))

		let lightBits = [obj.children[2],obj.children[3]]
		for(let i =  0; i < lightBits.length; i++)
		{
			lightBits[i].material = new THREE.MeshLambertMaterial({
				color: 0xFFFFA0, emissive:0xFFFF80, emissiveIntensity:0.5} )
			ourBulb.add(lightBits[i])
		}

		for(let i = 0; i < ourBulb.children.length; i++)
		{
			ourBulb.children[i].position.y -= 90
		}
	},function(){},function(e){console.log(e)})

	function addProjection(mesh)
	{
		let mat = mesh.material.clone() //TODO, nice rectangle clipping planes
		mat.clippingPlanes = visiBox.planes
		mesh.projection = new THREE.LineSegments(mesh.geometry.clone(),mat)

		updateFunctions.push(function()
		{
			//somewhat ambiguous!
			// mesh.projection.position.copy(mesh.position)

			mesh.projection.updateMatrixWorld()
			let plane = new THREE.Plane()
			let normal = new THREE.Vector3(0,0,1).applyMatrix4( mesh.projection.matrixWorld ).normalize()
			let arbitraryPointOnPlane = new THREE.Vector3().applyMatrix4(mesh.projection.matrixWorld)
			plane.setFromNormalAndCoplanarPoint(normal,arbitraryPointOnPlane)
			
			mesh.updateMatrixWorld()
			let line = new THREE.Line3(ourBulb.position, new THREE.Vector3())
			for(let i = 0; i < mesh.geometry.vertices.length; i++)
			{
				line.end.copy(mesh.geometry.vertices[i])
				line.end.applyMatrix4(mesh.matrixWorld)
				plane.intersectLine(line,mesh.projection.geometry.vertices[i])

				if(Math.abs( mesh.projection.geometry.vertices[i].z ) > 0.0001)
				{
					// debugger
				}
			}
			// console.log(mesh.projection.geometry.vertices[4])
			mesh.projection.geometry.verticesNeedUpdate = true
		})
		scene.add(mesh.projection)
	}

	let latitudesAndLontitudes = new THREE.LineSegments(new THREE.Geometry())
	for(let i = 0; i < 24; i++)
	{
		let longtitude = TAU * i / 24
		for(let j = 0; j < 12; j++)
		{
			let latitude = j / 12 * TAU / 2
			let p = new THREE.Vector3(0,1,0).applyAxisAngle(xUnit,latitude).applyAxisAngle(yUnit,longtitude)
			latitudesAndLontitudes.geometry.vertices.push(p)

			let nextLatitude = (j+1) / 12 * TAU / 2
			let q = new THREE.Vector3(0,1,0).applyAxisAngle(xUnit,nextLatitude).applyAxisAngle(yUnit,longtitude)
			latitudesAndLontitudes.geometry.vertices.push(q)

			if(j)
			{
				latitudesAndLontitudes.geometry.vertices.push(p)
				let nextLongtitude = TAU * (i+1) / 24
				let r = new THREE.Vector3(0,1,0).applyAxisAngle(xUnit,latitude).applyAxisAngle(yUnit,nextLongtitude)
				latitudesAndLontitudes.geometry.vertices.push(r)
			}
		}
	}
	// scene.add(latitudesAndLontitudes)
	// addProjection(latitudesAndLontitudes)

	let sphericalOctahedron = new THREE.LineSegments(new THREE.Geometry())
	let radialSegements = 128
	for(let i = 0; i < 3; i++)
	{
		let start = new THREE.Vector3().setComponent(i,1)
		let axis = new THREE.Vector3().setComponent((i+1)%3,1)
		for(let j = 0; j < radialSegements; j++)
		{
			let latitude = j / radialSegements * TAU
			let p = start.clone().applyAxisAngle(axis,latitude)
			sphericalOctahedron.geometry.vertices.push(p)

			let nextLatitude = (j+1) / radialSegements * TAU
			let q = start.clone().applyAxisAngle(axis,nextLatitude)
			sphericalOctahedron.geometry.vertices.push(q)
		}
	}
	// scene.add(sphericalOctahedron)
	// updateFunctions.push(function(){sphericalOctahedron.rotation.y+=0.01;sphericalOctahedron.rotation.x+=0.01})
	// addProjection(sphericalOctahedron)

	{
		let sourceGeo = new THREE.IcosahedronGeometry(1,2 )
		let goldberg = new THREE.LineSegments(new THREE.Geometry())
		for(let i = 0; i < sourceGeo.faces.length; i++)
		{
			let f = sourceGeo.faces[i]
			for(let j = 0; j < 3; j++)
			{
				goldberg.geometry.vertices.push(sourceGeo.vertices[ f.getCorner(j) ])
				goldberg.geometry.vertices.push(sourceGeo.vertices[ f.getCorner((j+1)%3) ])
			}
		}
		// scene.add(goldberg)
		// addProjection(goldberg)
	}

	//want normal sphere, AND world map, AND icosahedron buffer geometry

	let globe = null
	new THREE.OBJLoader().load("data/worldMap.obj",function(obj)
	{
		let transform = new THREE.Matrix4().makeRotationX(-TAU/4)
		// transform.elements[0] *= -1 //mirror
		let geo = obj.children[0].geometry.applyMatrix(transform)
		
		new THREE.FileLoader().load("data/coastlineIndices.txt", function(coastlineTxt)
		{
			let newGeo = new THREE.Geometry()
			let coastlineIndices = JSON.parse(coastlineTxt)

			for(let i = 0; i < coastlineIndices.length; i += 2)
			{
				let index = coastlineIndices[i]
				let otherIndex = coastlineIndices[i] % 3 === 2 ? coastlineIndices[i] - 2 : coastlineIndices[i] + 1

				newGeo.vertices.push( geo.attributes.position.getXYZ(index).setLength(1), geo.attributes.position.getXYZ(otherIndex).setLength(1) )
			}

			globe = new THREE.LineSegments(newGeo)
			globe.matrixAutoUpdate = false
			scene.add(globe)
			addProjection(globe)
		})
	})

	function stereographicallyUnproject2D(x,y)
	{
		let v = new THREE.Vector3(x,y,0)

		let projectionLengthSq = v.lengthSq()
		let unprojectedPointDistanceAlongOriginSpindle = 1 + (1-projectionLengthSq)/(1+projectionLengthSq) //algebra

		let rayDirection = v.clone().sub( ourBulb.position )

		let unprojected = rayDirection.clone()
		unprojected.multiplyScalar(unprojectedPointDistanceAlongOriginSpindle)
		unprojected.add(ourBulb.position)

		return unprojected
	}

	let sphereBackHider = new THREE.Mesh(new THREE.SphereGeometry(0.97*generalSphereRadius,64,64), new THREE.MeshBasicMaterial({
		color:0x000000,
		// side:THREE.BackSide
	}))
	scene.add(sphereBackHider)

	function getHandBasis2D(target)
	{
		if(target === undefined)
		{
			target = new THREE.Matrix4()
		}

		//may wanna do some projecting

		imitationHand.updateMatrixWorld()

		let unprojectedHandPosition = stereographicallyUnproject2D(imitationHand.position.x,imitationHand.position.y)
		indicators[2].position.copy(unprojectedHandPosition)
		target.setBasisVector(0,unprojectedHandPosition)
		// console.log(unprojectedHandPosition)

		for(let i = 0; i < 2; i++)
		{
			let unitVector = new THREE.Vector3().setComponent(i,0.00001)
			imitationHand.localToWorld(unitVector)
			unitVector.z = 0
			let curvedAwayUnitVector = stereographicallyUnproject2D( unitVector.x,unitVector.y )

			let orth = unprojectedHandPosition.clone().cross(curvedAwayUnitVector)
			let basisVector = orth.clone().cross(unprojectedHandPosition).normalize()
			if(i)
				indicators[0].position.copy(basisVector)
			else
				indicators[1].position.copy(basisVector)

			target.setBasisVector(i,basisVector)

			// if(i===0)
			// 	console.log( unitVector.y, basisVector )
		}
		target.setBasisVector(2,unprojectedHandPosition)

		return target
	}

	let indicators = []
	for(let i = 0; i < 3; i++)
	{
		indicators[i] = new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.2))
		scene.add(indicators[i])
	}

	//"you grabbed it when you were in the middle"
	imitationHand.position.set(1.5,0,0)
	scene.add(imitationHand)

	updateFunctions.push(function()
	{
		let t = frameCount*0.03

		// imitationHand.position.y = 0.6*Math.sin(t*1.3)
		imitationHand.position.x -= 0.01
		// imitationHand.rotation.z = 0.6*Math.sin(t*1.3)

		if(globe !== null)
		{
			let newBasis = getHandBasis2D()
			newBasis.setPosition(globe.position)
			globe.matrix.copy(newBasis)

			for(let i = 0; i < 3; i++)
			{
				let basisVector = globe.matrix.getBasisVector(i)
				basisVector.setLength(generalSphereRadius)
				globe.matrix.setBasisVector(i,basisVector)
			}
		}

		// imitationHand.position.set( 2*0.2*Math.sin(t), 2*0.1*Math.cos(t),camera.position.z/2 + 2*0.3*Math.sin(t))
		// imitationHand.rotation.set(
		// 	0.4*Math.sin(t*1.0),
		// 	0.1*Math.sin(t*1.6),
		// 	0.6*Math.sin(t*1.3)
		// 	)
	})
}