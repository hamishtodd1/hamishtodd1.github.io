// normal sphere can be rotated in normal way
// Make sure everything can easily be made visible and invisible
// monitoring

function initTwoSphereExploration(fish, visiBox)
{
	imitationHand.position.x = 1.2
	imitationHand.grippingTop = true

	// camera.position.multiplyScalar(10)

	let assemblage = new THREE.Group()
	assemblage.updateMatrixWorld()
	scene.add(assemblage)

	assemblage.add(fish)
	visiBox.scale.z *= 0.001
	assemblage.add(visiBox)

	//this fucks you
	// assemblage.position.x += 0.2
	// assemblage.position.y += 0.2
	// assemblage.position.z += 0.2

	let s2 = new THREE.Group()
	s2.radius = 0.1
	s2.scale.setScalar(s2.radius)
	s2.position.z = -s2.radius
	s2.add( new THREE.Mesh(new THREE.SphereGeometry(0.98,64,64), new THREE.MeshBasicMaterial(
	{
		color:0xCCCCCC,
		transparent:true,
		opacity:0.93
		// side:THREE.BackSide
	} ) ) )
	scene.add(s2)
	meshesWithProjections = []
	makeProjectableSpheres( meshesWithProjections )

	let extraRotationMatrix = new THREE.Matrix4()

	let bulb = new THREE.Group()
	bulb.position.z = -2 * s2.radius
	scene.add(bulb)

	//maybe better: stereographically unproject the fish's location, 
	let projectionIndicators = new THREE.LineSegments(new THREE.Geometry(),new THREE.MeshBasicMaterial({
		color: 0x00FF00,
		clippingPlanes: visiBox.planes
	}))
	projectionIndicators.geometry.vertices.push(new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3())
	assemblage.add( projectionIndicators )

	new THREE.OBJLoader().load("data/Lamp_Fluorescent_Illuminated.obj",function(obj)
	{
		bulb.scale.multiplyScalar(0.0007)

		let bottom = obj.children[0]
		bulb.add(new THREE.Mesh(bottom.geometry,new THREE.MeshStandardMaterial({
			color:0x000000
		})))

		let bowlGeo = new THREE.Geometry().fromBufferGeometry(obj.children[1].geometry)
		bowlGeo.mergeVertices()
		bowlGeo.computeFaceNormals()
		bowlGeo.computeVertexNormals()
		bulb.add(new THREE.Mesh(bowlGeo,new THREE.MeshLambertMaterial({
			color:0xFFFFFF
		})))

		let screw = obj.children[4]
		bulb.add(new THREE.Mesh(screw.geometry,new THREE.MeshStandardMaterial({
			color:0xCCCCCC
		})))

		let lightBits = [obj.children[2],obj.children[3]]
		for(let i =  0; i < lightBits.length; i++)
		{
			lightBits[i].material = new THREE.MeshLambertMaterial({
				color: 0xFFFFA0, emissive:0xFFFF80, emissiveIntensity:0.5} )
			bulb.add(lightBits[i])
		}

		for(let i = 0; i < bulb.children.length; i++)
		{
			bulb.children[i].position.y -= 90
		}
	},function(){},function(e){console.log(e)})

	updateFunctions.push(function()
	{
		let t = frameCount*0.03

		// fish.position.y = 0.6*Math.sin(t*1.3)
		// fish.position.x -= 0.003
		// fish.rotation.z = 0.6*Math.sin(t*1.3)

		// fish.position.set( 2*0.2*Math.sin(t), 2*0.1*Math.cos(t),camera.position.z/2 + 2*0.3*Math.sin(t))
		// fish.rotation.set(
		// 	0,//0.4*Math.sin(t*1.0),
		// 	0,//0.1*Math.sin(t*1.6),
		// 	t
		// 	)

		let s2Destination = new THREE.Vector3(0,0,-s2.radius)
		assemblage.localToWorld(s2Destination)
		// if(s2.position.distanceTo(s2Destination) < s2.radius )
		{
			s2.position.lerp(s2Destination,1)
			s2.matrix.setPosition( s2.position )
		}

		let bulbDestination = assemblage.localToWorld( new THREE.Vector3(0,0,-s2.radius*2) )
		// if(bulb.position.distanceTo(bulbDestination) < s2.radius )
		{
			bulb.position.lerp(bulbDestination,1)
		}

		if( imitationHand.grippingTop )
		{
			let justGripped = (s2.matrixAutoUpdate !== false)
			s2.matrixAutoUpdate = false

			let newBasis = getHandBasis2D()
			if(newBasis !== null)
			{
				newBasis.setPosition( s2.position )

				if(justGripped)
				{
					s2.updateMatrix()
					//CURRENTLY: newBasis * extraRotationMatrix = s2.matrix, therefore
					extraRotationMatrix.getInverse(newBasis).multiply(s2.matrix)
				}
				newBasis.multiply(extraRotationMatrix)

				s2.matrix.copy(newBasis)
			}
		}
		else
		{
			if(imitationHand.grippingTopOld)
			{
				s2.matrix.decompose(s2.position,s2.quaternion,s2.scale)
				s2.matrixAutoUpdate = true
			}
		}

		// log(new THREE.Quaternion().setFromRotationMatrix(s2.matrix))

		// s2.updateMatrixWorld()
		for(let i = 0; i < meshesWithProjections.length; i++)
		{
			let mesh = meshesWithProjections[i]
			if(mesh.visible === false)
			{
				mesh.projection.visible = false
				continue
			}
			mesh.projection.visible = true

			let plane = new THREE.Plane()
			plane.setFromNormalAndCoplanarPoint( new THREE.Vector3(0,0,1), new THREE.Vector3(1,0,assemblage.position.z) )
			
			let line = new THREE.Line3(bulb.position.clone(), new THREE.Vector3())
			for(let i = 0; i < mesh.projection.geometry.vertices.length; i++)
			{
				line.end.copy(mesh.geometry.vertices[i])
				line.end.applyMatrix4(s2.matrix)

				plane.intersectLine(line,mesh.projection.geometry.vertices[i])
				assemblage.worldToLocal(mesh.projection.geometry.vertices[i])
			}
			// console.log(mesh.projection.geometry.vertices[4])
			mesh.projection.geometry.verticesNeedUpdate = true
		}

		{
			for(let i = 0; i < 2; i++)
			{
				projectionIndicators.geometry.vertices[i*2].copy(bulb.position)
				assemblage.worldToLocal(projectionIndicators.geometry.vertices[i*2])

				let v = projectionIndicators.geometry.vertices[1+i*2].set(0.03,0,0)
				if(i)
				{
					v.x *= -1
				}
				fish.updateMatrix()
				v.applyMatrix4(fish.matrix)
			}
			projectionIndicators.geometry.verticesNeedUpdate = true
		}
	})

	function stereographicallyUnproject2D(worldV)
	{
		let s2Position = new THREE.Vector3().setFromMatrixPosition(s2.matrix)
		let sphereIntersections = sphereLineIntersection(bulb.position, worldV, s2Position, s2.radius )
		if(sphereIntersections.length === 0)
		{
			return null
		}
		else
		{
			let index = sphereIntersections[0].distanceToSquared(bulb.position) < sphereIntersections[1].distanceToSquared(bulb.position) ? 1:0
			let pointInSphereSpace = sphereIntersections[ index ].sub(s2Position)
			//not exactly in sphere space because scale
			return pointInSphereSpace
		}
	}

	function getHandBasis2D(target)
	{
		if(target === undefined)
		{
			target = new THREE.Matrix4()
		}

		//may wanna do some projecting

		fish.updateMatrix()
		fish.updateMatrixWorld()

		let worldPosition = fish.localToWorld( new THREE.Vector3() ) 
		let unprojectedHandPosition = stereographicallyUnproject2D( worldPosition )
		if( unprojectedHandPosition === null)
		{
			return null
		}

		{
			let unitVector = new THREE.Vector3(0.00001,0,0)
			fish.localToWorld(unitVector)
			let curvedAwayUnitVector = stereographicallyUnproject2D( unitVector )
			if( curvedAwayUnitVector === null)
			{
				return null
			}

			let orth = unprojectedHandPosition.clone().cross(curvedAwayUnitVector)
			let basisVector = orth.clone().cross(unprojectedHandPosition).setLength(s2.radius)

			target.setBasisVector(0,basisVector)

			let otherBasisVector = basisVector.clone().cross(unprojectedHandPosition).setLength(s2.radius)
			target.setBasisVector(1,otherBasisVector)
		}
		target.setBasisVector(2,unprojectedHandPosition)

		// for(let i = 0; i < vecs.length; i++)
		// {
		// 	for(let j = i+1; j < vecs.length; j++)
		// 	{
		// 		if(!basicallyEqual(vecs[i].dot(vecs[j]),0))
		// 		{
		// 			log(vecs[i].dot(vecs[j]))
		// 		}
		// 	}
		// }

		return target
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

	function makeProjectableSpheres(meshesWithProjections)
	{
		let mat = new THREE.LineBasicMaterial({color:0x0F0CC0})
		let projectionMat = new THREE.LineBasicMaterial({color:0x000000})
		projectionMat.clippingPlanes = visiBox.planes 

		function addProjectableSphere(geo)
		{
			let mesh = new THREE.LineSegments(geo, mat)
			s2.add(mesh)

			mesh.projection = new THREE.LineSegments(geo.clone(),projectionMat)
			assemblage.add(mesh.projection)
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
}