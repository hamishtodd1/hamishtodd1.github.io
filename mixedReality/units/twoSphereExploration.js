// pair of lines showing projection points from fish?
// automate 2-sphere placement
// unify fish universe and projections
// normal sphere can be rotated in normal way

// Make sure everything can easily be made visible and invisible
// monitoring

function initTwoSphereExploration()
{
	imitationHand.position.x = 0.39

	meshesWithProjections = []
	makeProjectableSpheres(meshesWithProjections)

	let generalSphereRadius = 1
	let sphereBackHider = new THREE.Mesh(new THREE.SphereGeometry(0.97*generalSphereRadius,64,64), new THREE.MeshBasicMaterial({
		color:0xCCCCCC,
		transparent:true,
		opacity:0.93
		// side:THREE.BackSide
	}))
	scene.add(sphereBackHider)

	let ourBulb = new THREE.Group()
	scene.add(ourBulb)
	updateFunctions.push(function()
	{
		ourBulb.position.lerp(new THREE.Vector3(0,0,-generalSphereRadius),0.1)
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

	updateFunctions.push(function()
	{
		//somewhat ambiguous!
		// mesh.projection.position.copy(mesh.position)

		for(let i = 0; i < meshesWithProjections.length; i++)
		{
			let mesh = meshesWithProjections[i]
			if(mesh.visible === false)
			{
				mesh.projection.visible = false
				continue
			}

			mesh.projection.visible = true
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

			let newBasis = getHandBasis2D()
			newBasis.setPosition(mesh.position)
			for(let i = 0; i < 3; i++)
			{
				let basisVector = newBasis.getBasisVector(i)
				basisVector.setLength(generalSphereRadius)
				newBasis.setBasisVector(i,basisVector)
			}
			
			mesh.matrix.copy(newBasis)
		}
	})

	//kay so really you'd like arbitrary light location, arbitrary sphere location
	//but of the two points where to put it? Whichever is further from light


	function stereographicallyUnproject2D(x,y)
	{
		let v = new THREE.Vector3(x,y,0)

		let sphereIntersections = sphereLineIntersection(ourBulb.position, v, sphereBackHider.position, generalSphereRadius )
		if(sphereIntersections.length === 0)
		{
			return null
		}
		else
		{
			let index = sphereIntersections[0].distanceToSq(ourBulb.position) < sphereIntersections[1].distanceToSq(ourBulb.position) ? 1:0
			return sphereIntersections[ index ]
		}
	}

	function getHandBasis2D(target)
	{
		if(target === undefined)
		{
			target = new THREE.Matrix4()
		}

		//may wanna do some projecting

		imitationHand.updateMatrixWorld()

		let unprojectedHandPosition = stereographicallyUnproject2D(imitationHand.position.x,imitationHand.position.y)
		console.assert( unprojectedHandPosition !== null)

		indicators[2].position.copy(unprojectedHandPosition)
		target.setBasisVector(0,unprojectedHandPosition)
		// console.log(unprojectedHandPosition)

		for(let i = 0; i < 2; i++)
		{
			let unitVector = new THREE.Vector3().setComponent(i,0.00001)
			imitationHand.localToWorld(unitVector)
			unitVector.z = 0
			let curvedAwayUnitVector = stereographicallyUnproject2D( unitVector.x,unitVector.y )
			console.assert( unprojectedHandPosition !== null )

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

	for(let i = 0; i < meshesWithProjections.length; i++ )
	{
		meshesWithProjections[i].visible = false
	}
	bindButton( "c", function()
	{
		let visibleIndex = 0
		for(let i = 0; i < meshesWithProjections.length; i++)
		{
			if( meshesWithProjections[i].visible )
			{
				visibleIndex = i
				break;
			}
		}

		visibleIndex++
		if(visibleIndex >=meshesWithProjections.length)
		{
			visibleIndex = 0
		}

		for(let i = 0; i < meshesWithProjections.length; i++)
		{
			meshesWithProjections[i].visible = (i===visibleIndex)
		}
	}, "cycle 2-sphere textures" )

	updateFunctions.push(function()
	{
		let t = frameCount*0.03

		// imitationHand.position.y = 0.6*Math.sin(t*1.3)
		imitationHand.position.x -= 0.006
		// imitationHand.rotation.z = 0.6*Math.sin(t*1.3)

		// imitationHand.position.set( 2*0.2*Math.sin(t), 2*0.1*Math.cos(t),camera.position.z/2 + 2*0.3*Math.sin(t))
		// imitationHand.rotation.set(
		// 	0.4*Math.sin(t*1.0),
		// 	0.1*Math.sin(t*1.6),
		// 	0.6*Math.sin(t*1.3)
		// 	)
	})
}

function makeProjectableSpheres(meshesWithProjections)
{
	let mat = new THREE.LineBasicMaterial({color:0x0F0CC0})
	mat.clippingPlanes = visiBox.planes
	function addProjectableSphere(geo)
	{
		let mesh = new THREE.LineSegments(geo, mat)
		scene.add(mesh)
		mesh.matrixAutoUpdate = false

		mesh.projection = new THREE.LineSegments(geo.clone(),mat)
		scene.add(mesh.projection)
		meshesWithProjections.push(mesh)
	}

	let latitudesAndLontitudesGeo = new THREE.Geometry()
	for(let i = 0; i < 24; i++)
	{
		let longtitude = TAU * i / 24
		for(let j = 0; j < 12; j++)
		{
			let latitude = j / 12 * TAU / 2
			let p = new THREE.Vector3(0,1,0).applyAxisAngle(xUnit,latitude).applyAxisAngle(yUnit,longtitude)
			latitudesAndLontitudesGeo.vertices.push(p)

			let nextLatitude = (j+1) / 12 * TAU / 2
			let q = new THREE.Vector3(0,1,0).applyAxisAngle(xUnit,nextLatitude).applyAxisAngle(yUnit,longtitude)
			latitudesAndLontitudesGeo.vertices.push(q)

			if(j)
			{
				latitudesAndLontitudesGeo.vertices.push(p)
				let nextLongtitude = TAU * (i+1) / 24
				let r = new THREE.Vector3(0,1,0).applyAxisAngle(xUnit,latitude).applyAxisAngle(yUnit,nextLongtitude)
				latitudesAndLontitudesGeo.vertices.push(r)
			}
		}
	}
	addProjectableSphere(latitudesAndLontitudesGeo)

	let sphericalOctahedronGeo = new THREE.Geometry()
	let radialSegements = 128
	for(let i = 0; i < 3; i++)
	{
		let start = new THREE.Vector3().setComponent(i,1)
		let axis = new THREE.Vector3().setComponent((i+1)%3,1)
		for(let j = 0; j < radialSegements; j++)
		{
			let latitude = j / radialSegements * TAU
			let p = start.clone().applyAxisAngle(axis,latitude)
			sphericalOctahedronGeo.vertices.push(p)

			let nextLatitude = (j+1) / radialSegements * TAU
			let q = start.clone().applyAxisAngle(axis,nextLatitude)
			sphericalOctahedronGeo.vertices.push(q)
		}
	}
	addProjectableSphere(sphericalOctahedronGeo)

	let sourceGeo = new THREE.IcosahedronGeometry(1,2 )
	let goldbergGeo = new THREE.Geometry()
	for(let i = 0; i < sourceGeo.faces.length; i++)
	{
		let f = sourceGeo.faces[i]
		for(let j = 0; j < 3; j++)
		{
			goldbergGeo.vertices.push(sourceGeo.vertices[ f.getCorner(j) ])
			goldbergGeo.vertices.push(sourceGeo.vertices[ f.getCorner((j+1)%3) ])
		}
	}
	addProjectableSphere(goldbergGeo)

	new THREE.OBJLoader().load("data/worldMap.obj",function(obj)
	{
		let transform = new THREE.Matrix4().makeRotationX(-TAU/4)
		// transform.elements[0] *= -1 //mirror
		let geo = obj.children[0].geometry.applyMatrix(transform)
		
		new THREE.FileLoader().load("data/coastlineIndices.txt", function(coastlineTxt)
		{
			let globeGeo = new THREE.Geometry()
			let coastlineIndices = JSON.parse(coastlineTxt)

			for(let i = 0; i < coastlineIndices.length; i += 2)
			{
				let index = coastlineIndices[i]
				let otherIndex = coastlineIndices[i] % 3 === 2 ? coastlineIndices[i] - 2 : coastlineIndices[i] + 1

				globeGeo.vertices.push( geo.attributes.position.getXYZ(index).setLength(1), geo.attributes.position.getXYZ(otherIndex).setLength(1) )
			}

			addProjectableSphere(globeGeo)
		})
	})
}