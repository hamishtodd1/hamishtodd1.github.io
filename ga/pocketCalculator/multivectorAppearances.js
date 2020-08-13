/*
	More aspects of 2D multiplication and addition needs to be visualized
		Coplanar bivector addition - easy and fun
		Vector addition - just do something
		Vector multiplication - need both scalar and bivector part
		Scalar multiplication - obvious, duplication then addition
		Coplanar bivector multiplication - complex multiplication!
		Bivector-vector multiplication
		Bivector multiplication???

	You WILL have many iterations, you need to speed up iteration time

	Just like scalar, bivec divides into unit length pieces before multiplication? vec as well? Maybe only think about unit sized things multiplying?

	General
		vector should just come from the origin, and in order to pack them, the origin should be in the corner, no biggie
		Possibly you should always visualize the hodge dual, it's what you use in the geometric product
		Possibly useful model: the operator combines with one of the operands to become a thing that is applied to the other operand
		Cartoon character doing movements
		Things not bound in place like scalars, bivectors, trivectors could gently rock around the axes that don't constrain them
		Grouping / location: fundamentally we just want them to be compact. Could have the different blades stacked in a column, or around in a circle, but it has no significance

	Both scalar and bivec can rotate

	multiplication
		scalar scalar
		scalar vector
		scalar bivector
		bivector bivector multiplication
		vector bivector multiplication
		vector vector multiplication
		(scalar bivector) vector

	The scalar
		Use 1 as your scalar picture. Can have it fill up vertically for fractionals
		Or Spheres? Jesus christ
		Scalar-anything multiplication: all the scalars transform into the thing they're going to be, then "repeated addition"
		how about they have a unit-size surroundings but are actually a little bean?
		Need to know the multiplicative identity size, hence discrete units
		Because dot product, they can end up taking up an area, hence having some area. Volume too probably...

	Scalar and pseudoscalar (whether bivec or tri...?) together = complex number, rectangle and beans viz

	Vectors
		Can be anywhere and so long as its length is the same you can think of it as the same thing
		Tells you which end is which. Useful for adding
		Maybe better to have stuff going along it, chevrons?
		Vector addition: always one on left and one above. And when they come together the red ends can melt each other or whatever it is, just like bivectors
		vector vector mult
			Sweep a along b to get a bivector. On is the sweeper, one is the thing it is swept along.
			Use this to make the addition too. This way, it is a surprise that addition is commutative, rather than a surprise that wedging is not
			Addition of codirectional vectors and bivectors probably is different from non conditional,
			and it's probably ok to encourage that idea. Early levels can be just about them. X vector, X vector, 3. You must make an X vector of length 6.

	Trivector is probably that blade bivector thing extruded out of the plane

	Bivectors
		bivector bivector multiplication: just rotate 90 deg
		Bivector-bivector addition in 3D - do you make the triangle as well?
		little ripples going diagonally?
		Possibly the positive and negative bivector should have the same color as the positive and negative scalar. Yeah, they are kinda discrete things
		Hmm in what sense is it positive? Try it as the last thing, see which feeds your intuitions better
*/

async function initMultivectorAppearances()
{
	{
		let scalarUnitGeometry = new THREE.CircleGeometry(.5, 8)
		// for (let i = 0, il = scalarUnitGeometry.vertices.length / 2; i < il; i++)
		// 	scalarUnitGeometry.vertices[i*2].multiplyScalar(.7)
		let scalarShaderMaterial = new THREE.ShaderMaterial({
			uniforms: {
				theta1: { value: 0. },
				r1: { value: 1000. },
				theta2: { value: 0. },
				r2: { value: 1000. },
			}
		});
		await assignShader("scalarVertex",   scalarShaderMaterial, "vertex")
		await assignShader("scalarFragment", scalarShaderMaterial, "fragment")

		function scalarBlockWidth(scalar)
		{
			let min = Infinity
			let max =-Infinity
			for (let i = 0, il = scalar.children.length; i < il; i++)
			{
				if (!scalar.children[i].visible)
					break
				min = Math.min(min, scalar.children[i].intendedPosition.x)
				max = Math.max(max, scalar.children[i].intendedPosition.x)
			}
			let size = max - min + 1.
			return Math.abs(size) < Infinity ? size : 0.
		}
		function scalarBlockHeight(scalar)
		{
			let min = Infinity
			let max =-Infinity
			for (let i = 0, il = scalar.children.length; i < il; i++)
			{
				if (!scalar.children[i].visible)
					break
				min = Math.min(min, scalar.children[i].intendedPosition.y)
				max = Math.max(max, scalar.children[i].intendedPosition.y)
			}
			let size = max - min + 1.
			return Math.abs(size) < Infinity ? size : 0.
		}

		var maxScalarUnits = 256
		var zigzagPositions = Array(256) 
		{
			// 4 5 6
			// 3 2 7
			// 0 1 8
			let currentLayer = 1 //layer n and all below it contain n^2 verts. vertex 0 is layer 1
			for (let i = 0; i < maxScalarUnits; i++)
			{
				if (sq(currentLayer) <= i)
					currentLayer++;

				let rightDown = currentLayer % 2; // as opposed to upLeft
				let diagOfThisLayer = 2 * currentLayer * (currentLayer - 1) / 2
				let inSecondHalf = i > diagOfThisLayer

				zigzagPositions[i] = new THREE.Vector3()
					.addScaledVector(rightDown ? yUnit : xUnit, currentLayer - 1) //get you to the start
					.addScaledVector(rightDown ? xUnit : yUnit, inSecondHalf ? currentLayer - 1 : i - sq(currentLayer - 1))
				if (inSecondHalf)
					zigzagPositions[i].addScaledVector(rightDown ? yUnit : xUnit, -1 * (i - diagOfThisLayer))
			}
		}

		function ScalarAppearance()
		{
			let scalar = new THREE.Group()
			scalar.position.z = .001 //in front of bivector I guess
			scalar.positive = { value: false }

			let newOne = null
			for (let i = 0; i < maxScalarUnits; i++)
			{
				newOne = new THREE.Mesh(scalarUnitGeometry, scalarShaderMaterial.clone())

				newOne.intendedPosition = new THREE.Vector3() //just there as a default
				newOne.castShadow = true
				newOne.intendedPosition.set(i, 0., 0.)
				newOne.material.uniforms.positive = scalar.positive
				scalar.add(newOne)
			}

			function getZigzagCenter(scalar,target)
			{
				let minX = Infinity
				let minY = Infinity
				let maxX = -Infinity
				let maxY = -Infinity
				for (let i = 0, il = zigzagPositions.length; i < il; i++)
				{
					if (!scalar.children[i].visible)
						break
					minX = Math.min(minX, zigzagPositions[i].x)
					minY = Math.min(minY, zigzagPositions[i].y)
					maxX = Math.max(maxX, zigzagPositions[i].x)
					maxY = Math.max(maxY, zigzagPositions[i].y)
				}

				target.x = Math.abs(maxX) === Infinity ? 0. : (maxX - minX) * .5
				target.y = Math.abs(maxY) === Infinity ? 0. : (maxY - minY) * .5
				return target
			}

			scalar.setIntendedPositionsToCenteredSquare = function ()
			{
				let center = getZigzagCenter(scalar, { x: 0., y: 0. })
				
				for (let i = 0; i < maxScalarUnits; i++)
				{
					if (!scalar.children[i].visible)
						break
					scalar.children[i].intendedPosition.x = zigzagPositions[i].x - center.x
					scalar.children[i].intendedPosition.y = zigzagPositions[i].y - center.y
				}

				delete center
			}
			scalar.setIntendedPositionsToLine = function ()
			{
				for (let i = 0; i < maxScalarUnits; i++)
				{
					scalar.children[i].intendedPosition.x = .5 + i
					scalar.children[i].intendedPosition.y = 0.
				}
			}

			scalar.updateAppearance = function (value)
			{
				scalar.positive.value = value >= 0.

				if (Math.abs(value) > scalar.children.length)
					console.error("not enough scalar units")

				let flooredAbs = Math.floor(Math.abs(value))
				for (let i = 0, il = scalar.children.length; i < il; i++)
				{
					if (i < flooredAbs)
						scalar.children[i].visible = true
					else if (i === flooredAbs && value != Math.round(value))
					{
						scalar.children[i].material.uniforms.r1.value = Math.abs(value) - flooredAbs - .5
						scalar.children[i].visible = true
					}
					else
						scalar.children[i].visible = false
				}

				scalar.setIntendedPositionsToCenteredSquare() //TODO it could just be an array, and multivecs may not need intendedPosition

				for (let i = 0, il = scalar.children.length; i < il; i++)
					scalar.children[i].position.copy(scalar.children[i].intendedPosition)
			}

			return scalar
		}
	}

	{
		let vectorRadius = .11
		let vectorGeometry = new THREE.CylinderBufferGeometry(0., vectorRadius, 1., 16, 1, false);
		vectorGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0., .5, 0.))
		//that is the right way to do it, remove this centering crap
		let vectorMaterial = new THREE.MeshStandardMaterial()

		function VectorAppearance()
		{
			let mesh = new THREE.Mesh(vectorGeometry, vectorMaterial);
			mesh.matrixAutoUpdate = false;
			mesh.castShadow = true

			mesh.setVec = function (x, y, z)
			{
				if(y === undefined)
				{
					if(x.isVector)
					{
						y = x.y
						z = x.z
						x = x.x
					}
					else
					{
						y = x[2]
						z = x[3]
						x = x[1]
					}
				}

				setRotationallySymmetricMatrix(x,y,z,mesh.matrix)
				mesh.matrix.setPosition(v1.set(x,y,z).multiplyScalar(-.5))

				mesh.visible = (x!==0.||y!==0. || z !== 0.)
			}

			return mesh
		}
	}

	{
		let bivecMaterialClockwise = new THREE.MeshBasicMaterial({ color: discreteViridis[0].hex, transparent: true, opacity: 1., side: THREE.FrontSide })
		let bivecMaterialCounter   = new THREE.MeshBasicMaterial({ color: discreteViridis[2].hex, transparent: true, opacity: 1., side: THREE.BackSide })

		let bivecGeometry = new THREE.PlaneBufferGeometry(1.,1.) //yeah centered works
		{
			let bivectorAppearance = new THREE.Group()
			bivectorAppearance.add(
				new THREE.Mesh(bivecGeometry, bivecMaterialClockwise),
				new THREE.Mesh(bivecGeometry, bivecMaterialCounter),
			)

			bivectorAppearance.setEdge = function(newLength)
			{
				bivectorAppearance.scale.set( newLength, magnitude/newLength, 1. )
			}
		}

		function BivectorAppearance()
		{
			let bivectorAppearance = new THREE.Object3D()

			let numPieces = 60;
			let piecesPositions = Array(numPieces)
			let piecesMoreClockwiseEdges = Array(numPieces)
			let piecesLessClockwiseEdges = Array(numPieces)
			//TODO vertex attributes
			for (let i = 0; i < numPieces; i++)
			{
				piecesPositions[i] = new THREE.Vector3(i * 2., 0., 0.)
				piecesMoreClockwiseEdges[i] = new THREE.Vector3(1., 0., 0.)
				piecesLessClockwiseEdges[i] = new THREE.Vector3(0., 1., 0.)
			}

			let geo = new THREE.Geometry()
			geo.vertices = Array(numPieces * 4)
			geo.faces = Array(numPieces * 2)
			for (let i = 0; i < numPieces; i++)
			{
				geo.vertices[i * 4 + 0] = new THREE.Vector3()
				geo.vertices[i * 4 + 1] = new THREE.Vector3()
				geo.vertices[i * 4 + 2] = new THREE.Vector3()
				geo.vertices[i * 4 + 3] = new THREE.Vector3()

				geo.faces[i * 2 + 0] = new THREE.Face3(i * 4 + 0, i * 4 + 1, i * 4 + 2)
				geo.faces[i * 2 + 1] = new THREE.Face3(i * 4 + 1, i * 4 + 3, i * 4 + 2)
			}

			let clockwiseSide = new THREE.Mesh(geo, bivecMaterialClockwise)
			let counterSide = new THREE.Mesh(geo, bivecMaterialCounter)
			clockwiseSide.castShadow = true
			counterSide.castShadow = true
			bivectorAppearance.add(clockwiseSide, counterSide)
			bivectorAppearance.piecesPositions = piecesPositions
			bivectorAppearance.piecesMoreClockwiseEdges = piecesMoreClockwiseEdges
			bivectorAppearance.piecesLessClockwiseEdges = piecesLessClockwiseEdges

			//alright so which way is it facing? the convention is that positive = clockwise if you're looking at it. OMFG IS THIS THE SAME THING
			//Therefore if you're looking at

			let style = "parallelogram"
			let moreClockwiseEdge = new THREE.Vector3(1., 0., 0.) //0 is "lower", clockwise of the second one, kinda like x axis and y
			let lessClockwiseEdge = new THREE.Vector3(0., 1., 0.)
			let position = new THREE.Vector3()

			bivectorAppearance.updateAppearance = function (a,b,c)
			{
				let bivectorMagnitude = Math.sqrt(sq(a) + sq(b) + sq(c))
				let edgeLen = Math.sqrt(bivectorMagnitude)

				//TODO this only works because this element is the only one
				//and it is not clear which vector 
				if (a >= 0.)
				{
					moreClockwiseEdge.set(edgeLen, 0., 0.)
					lessClockwiseEdge.set(0., edgeLen, 0.)
				}
				else
				{
					moreClockwiseEdge.set(0., edgeLen, 0.)
					lessClockwiseEdge.set(edgeLen, 0., 0.)
				}

				// if (frameCount === 41)
				// {
				// 	style = "slice"

				// 	//problem: not enough of the things, probably. Subdivide? Urgh
				// 	//you would want to make them smaller than unit area
				// 	//better with uneven quadrilaterals really, fuck area preserving
				// }

				if (style === "parallelogram" || style === "square")
				{
					let pieceLessClockwiseEdgeProportion = moreClockwiseEdge.length() / bivectorMagnitude //because algebra you did
					let pieceLessClockwiseEdge = lessClockwiseEdge.clone().multiplyScalar(pieceLessClockwiseEdgeProportion)
					let pieceMoreClockwiseEdge = moreClockwiseEdge.clone().normalize()

					position.addVectors(moreClockwiseEdge, lessClockwiseEdge).multiplyScalar(-.5)

					let pieceIndex = 0;
					for (let i = 0., il = moreClockwiseEdge.length(); i < il; i++)
					{
						let bottomEdgeShortener = i + 1. > il ? il - i : 1.
						for (let j = 0., jl = 1. / pieceLessClockwiseEdgeProportion; j < jl; j++)
						{
							let pieceLessClockwiseEdgeShortener = j + 1. > jl ? jl - j : 1.

							piecesPositions[pieceIndex].copy(position) // cooooould give it a position
							piecesPositions[pieceIndex].addScaledVector(pieceMoreClockwiseEdge, i)
							piecesPositions[pieceIndex].addScaledVector(pieceLessClockwiseEdge, j)

							piecesMoreClockwiseEdges[pieceIndex].copy(pieceMoreClockwiseEdge).multiplyScalar(bottomEdgeShortener)
							piecesLessClockwiseEdges[pieceIndex].copy(pieceLessClockwiseEdge).multiplyScalar(pieceLessClockwiseEdgeShortener)
							pieceIndex++
							if (pieceIndex >= numPieces)
							{
								console.error("more pieces needed")
								break
							}
						}
					}

					for (let i = pieceIndex; i < numPieces; i++)
					{
						piecesPositions[i].set(0., 0., 0.)
						piecesMoreClockwiseEdges[i].set(0., 0., 0.)
						piecesLessClockwiseEdges[i].set(0., 0., 0.)
					}
				}

				for (let i = 0; i < numPieces; i++)
				{
					v1.copy(piecesPositions[i])
					geo.vertices[i * 4 + 0].lerp(v1, 1.)
					v1.copy(piecesPositions[i]).add(piecesMoreClockwiseEdges[i])
					geo.vertices[i * 4 + 1].lerp(v1, 1.)
					v1.copy(piecesPositions[i]).add(piecesLessClockwiseEdges[i])
					geo.vertices[i * 4 + 2].lerp(v1, 1.)
					v1.copy(piecesPositions[i]).add(piecesMoreClockwiseEdges[i]).add(piecesLessClockwiseEdges[i])
					geo.vertices[i * 4 + 3].lerp(v1, 1.)
				}
				geo.verticesNeedUpdate = true
			}

			return bivectorAppearance
		}
	}

	MultivectorAppearance = function(externalOnClick,elements)
	{
		let multivec = new THREE.Group();
		scene.add(multivec) //the only point is to be a visualization

		multivec.elements = MathematicalMultivector() //identity
		if(elements !== undefined)
			copyMultivector(elements, multivec.elements)

		let scalar = ScalarAppearance()
		multivec.add(scalar)
		multivec.scalar = scalar

		multivec.vectorAppearance = VectorAppearance()
		multivec.add(multivec.vectorAppearance)

		let bivectorAppearance = BivectorAppearance()
		multivec.add(bivectorAppearance)

		let boundingBox = new THREE.Mesh(unchangingUnitSquareGeometry,new THREE.MeshBasicMaterial({color:0x00FF00,transparent:true,opacity:.4}))
		{
			boundingBox.visible = false
			multivec.boundingBox = boundingBox
			multivec.add(boundingBox)

			function updateBoundingBoxSize()
			{
				boundingBox.scale.x = scalarBlockWidth(scalar)
				boundingBox.scale.y = scalarBlockHeight(scalar)

				//vector
				boundingBox.scale.x = Math.max(boundingBox.scale.x,Math.abs(multivec.elements[1]) )
				boundingBox.scale.y = Math.max(boundingBox.scale.y,Math.abs(multivec.elements[2]) )

				//bivector. Terrible simplification.
				let minX = Infinity
				let maxX = -Infinity
				let minY = Infinity
				let maxY = -Infinity
				for (let i = 0., il = bivectorAppearance.children[0].geometry.vertices.length; i < il; i++)
				{
					minX = Math.min(minX,bivectorAppearance.children[0].geometry.vertices[i].x)
					maxX = Math.max(maxX,bivectorAppearance.children[0].geometry.vertices[i].x)
					minY = Math.min(minY,bivectorAppearance.children[0].geometry.vertices[i].y)
					maxY = Math.max(maxY,bivectorAppearance.children[0].geometry.vertices[i].y)
				}
				boundingBox.scale.x = Math.max(boundingBox.scale.x, maxX - minX)
				boundingBox.scale.y = Math.max(boundingBox.scale.y, maxY - minY)

				let minSize = Math.min(camera.topAtZZero, camera.rightAtZZero) * 2. / 20.
				boundingBox.scale.x = Math.max(minSize, boundingBox.scale.x)
				boundingBox.scale.y = Math.max(minSize, boundingBox.scale.y)
			}

			if (externalOnClick !== undefined)
			{
				clickables.push(boundingBox)
				multivec.externalOnClick = externalOnClick
				boundingBox.onClick = function ()
				{
					if (multivec.externalOnClick !== undefined)
						multivec.externalOnClick(multivec)
				}
			}
		}

		//more like a "render" really, if you can make it so they get done last
		multivec.updateAppearance = function()
		{
			if (multivec.elements[5] !== 0. || multivec.elements[6] !== 0. || multivec.elements[7] !== 0.)
				log("not 3D yet")

			scalar.updateAppearance(multivec.elements[0])
			multivec.vectorAppearance.setVec(multivec.elements[1], multivec.elements[2], multivec.elements[3])
			bivectorAppearance.updateAppearance(multivec.elements[4],multivec.elements[5],multivec.elements[6])

			updateBoundingBoxSize()
		}
		
		updateFunctions.push(multivec.updateAppearance)

		return multivec
	}

	//fuck this shit about looking at the children. You should deduce it purely from the values of the elements, that's the only "state"
	//the scalar multiplication animation is just duplicate followed by add animation
	{
		//singleton, and it's ok for that to be a global
		let group = new THREE.Group()

		let positiveScalar = ScalarAppearance()
		positiveScalar.positive.value = true
		group.add(positiveScalar)
		let negativeScalar = ScalarAppearance()
		negativeScalar.positive.value = false
		group.add(negativeScalar)

		let vec0 = VectorAppearance()
		group.add(vec0)
		let vec1 = VectorAppearance()
		group.add(vec1)

		let bivector0 = BivectorAppearance()
		group.add(bivector0)
		let bivector1 = BivectorAppearance()
		group.add(bivector1)
		
		// let vectorAppearance = VectorAppearance()
		// group.add(vectorAppearance)
		// let bivectorAppearance = BivectorAppearance()
		// group.add(bivectorAppearance)

		let nhProgress = -1. //non homogeneous

		let SCALAR_ADDITION_SECTION = 0
		let VECTOR_ADDITION_SECTION = 1 + SCALAR_ADDITION_SECTION
		let BIVECTOR_ADDITION_SECTION = 1 + VECTOR_ADDITION_SECTION
		let ADMIRING_SECTION = 1 + BIVECTOR_ADDITION_SECTION
		let END = 1+ADMIRING_SECTION

		let SCALAR_SCALAR_MULTIPLICATION_SECTION = 1
		let SCALAR_VECTOR_MULTIPLICATION_SECTION = 1 + SCALAR_SCALAR_MULTIPLICATION_SECTION
		let SCALAR_BIVECTOR_MULTIPLICATION_SECTION = 1 + SCALAR_VECTOR_MULTIPLICATION_SECTION
		let SCALAR_TRIVECTOR_MULTIPLICATION_SECTION = 1 + SCALAR_BIVECTOR_MULTIPLICATION_SECTION
		let VECTOR_VECTOR_MULTIPLICATION_SECTION = 1 + SCALAR_TRIVECTOR_MULTIPLICATION_SECTION
		let VECTOR_BIVECTOR_MULTIPLICATION_SECTION = 1 + VECTOR_VECTOR_MULTIPLICATION_SECTION
		let VECTOR_TRIVECTOR_MULTIPLICATION_SECTION = 1 + VECTOR_BIVECTOR_MULTIPLICATION_SECTION
		let BIVECTOR_VECTOR_MULTIPLICATION_SECTION = 1 + VECTOR_TRIVECTOR_MULTIPLICATION_SECTION
		let BIVECTOR_BIVECTOR_MULTIPLICATION_SECTION = 1 + BIVECTOR_VECTOR_MULTIPLICATION_SECTION
		let BIVECTOR_TRIVECTOR_MULTIPLICATION_SECTION = 1 + BIVECTOR_BIVECTOR_MULTIPLICATION_SECTION
		let TRIVECTOR_VECTOR_MULTIPLICATION_SECTION = 1 + BIVECTOR_TRIVECTOR_MULTIPLICATION_SECTION
		let TRIVECTOR_BIVECTOR_MULTIPLICATION_SECTION = 1 + TRIVECTOR_VECTOR_MULTIPLICATION_SECTION
		let TRIVECTOR_TRIVECTOR_MULTIPLICATION_SECTION = 1 + TRIVECTOR_BIVECTOR_MULTIPLICATION_SECTION

		function inSection(querySection)
		{
			return Math.floor(nhProgress) === querySection
		}
		function goToStartOfNextSection()
		{
			nhProgress = 1. + Math.floor(nhProgress)
		}
		// function incrementProgress(semiHomogeneousProgress,subSectionDurations)
		// {
		// 	let wayThroughCurrentPart = nhProgress
		// 	for(let i = 0, il = subSectionDurations.length; i < il; i++)
		// 	{
		// 		if(nhProgress)
		// 	}
		// }
		function progressClampedEased(homogeneousSectionStart,duration)
		{
			if (homogeneousSectionStart === undefined) homogeneousSectionStart = Math.floor(nhProgress)
			if(duration === undefined) duration = 1.
			let clamped = (nhProgress - homogeneousSectionStart) / duration
			clamped = Math.min(Math.max(0., clamped), 1.)
			return easingFunctions.easeInOutQuad( clamped )
		}

		//alright so one little bit of state, which is the time since commencement
		//you consider the maximum with all the frills, then skip over them if they're not necessary
		//buuuuut previous state affects current

		//so depending on a bunch of stuff, it can take any amount of time
		//some things need to follow others
		//what's the simplest thing that could possibly work?

		{
			var activeOperator = OperatorAppearance()
			var operands = [
				MultivectorAppearance(function () { }),
				MultivectorAppearance(function () { })]
			scene.remove(operands[0], operands[1])

			multivectorAnimation = {
				ongoing: function () { return group.parent === scene },
				finish: function () { scene.remove(group) },
				operands,
				activeOperator
			}
			//in long term it's more like "reassign", because you want to be able to do it at any stage
			multivectorAnimation.start = function ()
			{
				scene.add(group)

				console.assert(nhProgress !== 0.)
				nhProgress = 0.
			}
		}

		function copyScalarPart(operand, positiveOrNegativeScalar,indexToStartAt)
		{
			for (let i = 0; i < maxScalarUnits; i++)
			{
				if (!operand.scalar.children[i].visible) break
				positiveOrNegativeScalar.children[indexToStartAt].visible = true
				positiveOrNegativeScalar.children[indexToStartAt].position.copy(operand.scalar.children[i].position).add(operand.position)
				++indexToStartAt
			}
			return indexToStartAt
		}

		let result = new Float32Array(8)

		let generalMovementDuration = .9

		updateFunctions.push(function ()
		{
			if (!multivectorAnimation.ongoing())
				return

			if(nhProgress>0.)
				scene.remove(operands[0], operands[1], activeOperator)

			vec0.visible = false
			vec1.visible = false
			//bivector done a bit differently

			if (activeOperator.function === geometricProduct)
			{
				let hasVecPart0 = (operands[0].elements[1] !== 0. || operands[0].elements[2] !== 0. || operands[0].elements[3] !== 0.)
				let hasVecPart1 = (operands[1].elements[1] !== 0. || operands[1].elements[2] !== 0. || operands[1].elements[3] !== 0.)

				let hasBivecPart0 = (operands[0].elements[4] !== 0. || operands[0].elements[5] !== 0. || operands[0].elements[6] !== 0.)
				let hasBivecPart1 = (operands[1].elements[4] !== 0. || operands[1].elements[5] !== 0. || operands[1].elements[6] !== 0.)
				log(nhProgress)

				if(inSection(VECTOR_BIVECTOR_MULTIPLICATION_SECTION))
				{
					if (hasVecPart0 && hasBivecPart1 )
					{
						log("y")
						nhProgress += frameDelta
						if (nhProgress > 1.2)
							goToStartOfNextSection()

						vec0.visible = true
						vec0.setVec(operands[0].elements)
						v1.copy(operands[0].position)
						v1.x -= operands[0].elements[1] * .5
						v1.y -= operands[0].elements[2] * .5
						v1.z -= operands[0].elements[3] * .5

						let lerpValue = progressClampedEased(VECTOR_BIVECTOR_MULTIPLICATION_SECTION, generalMovementDuration)
						v1.lerp(zeroVector, lerpValue)

						vec0.matrix.setPosition(v1)

						nhProgress += frameDelta * generalMovementDuration
					}
					else
					{
						goToStartOfNextSection()
					}
				}
				else goToStartOfNextSection()
			}
			else if (activeOperator.function === geometricSum)
			{
				if ( inSection(SCALAR_ADDITION_SECTION))
				{
					for (let i = 0; i < maxScalarUnits; i++)
						positiveScalar.children[i].visible = false
					for (let i = 0; i < maxScalarUnits; i++)
						negativeScalar.children[i].visible = false

					let scalarCoalescingDuration = .8

					if (operands[0].elements[0] === 0. && operands[1].elements[0] === 0.)
					{
						//no scalar
						goToStartOfNextSection()
					}
					else if((operands[0].elements[0] > 0. && operands[1].elements[0] > 0.) ||
							(operands[0].elements[0] < 0. && operands[1].elements[0] < 0.))
					{
						//both +ve or -ve
						//partial ones: I guess you have to add together the partial bits, potentially making a whole

						let oneToUse = (operands[0].elements[0] < 0. && operands[1].elements[0] < 0.) ? negativeScalar : positiveScalar

						let ourUnitIndex = 0;
						ourUnitIndex = copyScalarPart(operands[1], oneToUse, ourUnitIndex)
						ourUnitIndex = copyScalarPart(operands[0], oneToUse, ourUnitIndex)

						oneToUse.setIntendedPositionsToCenteredSquare()
						for (let i = 0; i < maxScalarUnits; i++)
							oneToUse.children[i].position.lerp(oneToUse.children[i].intendedPosition, progressClampedEased())

						nhProgress += frameDelta / scalarCoalescingDuration
					}
					else if (operands[0].elements[0] !== 0. ^ operands[1].elements[0] !== 0.)
					{
						//one nonzero, one zero

						let nonzeroOperand = operands[0].elements[0] === 0. ? operands[1] : operands[0]
						let oneToUse = nonzeroOperand.elements[0] < 0. ? negativeScalar : positiveScalar

						copyScalarPart(nonzeroOperand, oneToUse, 0)
						oneToUse.setIntendedPositionsToCenteredSquare()
						for (let i = 0; i < maxScalarUnits; i++)
							oneToUse.children[i].position.lerp(oneToUse.children[i].intendedPosition, progressClampedEased())

						nhProgress += frameDelta / scalarCoalescingDuration
					}
					else if (operands[0].elements[0] !== 0. || operands[1].elements[0] !== 0.)
					{
						goToStartOfNextSection()

						//it's more like:
						// let progressThroughSubsection = totalSectionTime * (nhProgress-Math.floor(nhProgress))

						//one +ve and one -ve
						//whichever is shorter, that gets cut out of the other with a pop
						//leaving potentially a ɔoc or something, but then we slide the hiders along

						// let liningUpDuration = .9
						// let cutAnticipatingDuration = .3
						// let cutAdmiringDuration = .4
						// let totalSectionTime = liningUpDuration + cutAnticipatingDuration + cutAdmiringDuration + scalarCoalescingDuration
						// let CUT_ANTICIPATING_SECTION = SCALAR_ADDITION_SECTION + liningUpDuration / totalSectionTime
						// let CUT_ADMIRATION_SECTION = CUT_ANTICIPATING_SECTION + cutAnticipatingDuration / totalSectionTime
						// let SCALAR_COALESCING_SECTION = CUT_ADMIRATION_SECTION + cutAdmiringDuration / totalSectionTime

						// let result = operands[0].elements[0] + operands[1].elements[0]

						// // let sectionArray = [
						// // 	"liningUp", .9,
						// // 	"cutAnticipating", .3,
						// // 	"cutAdmiring", .4
						// // ]
						// // let section = querySectionAndAdvanceTimeAppropriately(sections)
						// // delete sections

						// // function getSection(sectionsAndTimes)
						// // {
						// // 	Math.floor(nhProgress)


						// // 	let totalSectionTime = 0.
						// // 	for (let i = 0, il = sectionsAndTimes.length / 2; i < il; i++)
						// // 		totalSectionTime += sectionsAndTimes[i * 2 + 1]

						// // 	let i = 0
						// // 	let thisSectionBeginning = 0.
						// // 	for (i; i < sectionsAndTimes.length / 2; i++)
						// // 	{
						// // 		if (nhProgress < thisSectionBeginning + sectionsAndTimes[i * 2 + 1] )
						// // 			break;
						// // 		thisSectionBeginning += sectionsAndTimes[i * 2 + 1] / totalSectionTime
						// // 	}

						// // 	nhProgress += frameDelta / totalSectionTime * (sectionsAndTimes[i * 2 + 1]  * sectionsAndTimes.length)
						// // 	return sectionsAndTimes[i * 2]
						// // }
						// // function advanceTimeAppropriately( sectionsAndTimes, section)
						// // {
						// // 	let totalSectionTime = 0.
						// // 	for (let i = 0, il = sectionsAndTimes.length / 2; i < il; i++)
						// // 		totalSectionTime += sectionsAndTimes[i * 2 + 1]

						// // 	let time = sectionsAndTimes[sectionsAndTimes.indexOf(section)+1]

						// // 	.3,.3,.4
						// // 	frameDelta: .2,.2,.2,.2,.2,.
						// // 	.2
						// // 	//want the total time to take 1.
						// // 	nhProgress += frameDelta / totalSectionTime * (sectionsAndTimes[i * 2 + 1] * sectionsAndTimes.length)
						// // }

						// if (nhProgress < CUT_ANTICIPATING_SECTION )
						// {
						// 	copyScalarPart(operands[0].elements[0] > 0.?operands[0]:operands[1], positiveScalar, 0)
						// 	copyScalarPart(operands[0].elements[0] < 0.?operands[0]:operands[1], negativeScalar, 0)
						// 	positiveScalar.setIntendedPositionsToLine()
						// 	negativeScalar.setIntendedPositionsToLine()

						// 	let oneOnTop = positiveScalar.children[0].position.y > negativeScalar.children[0].position.y ? positiveScalar : negativeScalar
						// 	for (let i = 0; i < maxScalarUnits; i++)
						// 		oneOnTop.children[i].intendedPosition.y += 1.
						// 	let oneToDisappearCompletely = result < 0. ? positiveScalar : negativeScalar
						// 	for (let i = 0; i < maxScalarUnits; i++)
						// 		oneToDisappearCompletely.children[i].intendedPosition.x += Math.abs(result)

						// 	let lerpAmount = progressClampedEased(SCALAR_ADDITION_SECTION, liningUpDuration / totalSectionTime )
						// 	for (let i = 0; i < maxScalarUnits; i++)
						// 	{
						// 		positiveScalar.children[i].position.lerp(positiveScalar.children[i].intendedPosition, lerpAmount)
						// 		negativeScalar.children[i].position.lerp(negativeScalar.children[i].intendedPosition, lerpAmount)
						// 	}

						// 	nhProgress += frameDelta / liningUpDuration / 4.
						// }
						// else if (nhProgress < CUT_ADMIRATION_SECTION)
						// {
						// 	copyScalarPart(operands[0].elements[0] > 0. ? operands[0] : operands[1], positiveScalar, 0)
						// 	copyScalarPart(operands[0].elements[0] < 0. ? operands[0] : operands[1], negativeScalar, 0)
						// 	positiveScalar.setIntendedPositionsToLine()
						// 	negativeScalar.setIntendedPositionsToLine()

						// 	let oneOnTop = positiveScalar.children[0].position.y > negativeScalar.children[0].position.y ? positiveScalar : negativeScalar
						// 	for (let i = 0; i < maxScalarUnits; i++)
						// 		oneOnTop.children[i].intendedPosition.y += 1.
						// 	let oneToDisappearCompletely = result < 0. ? positiveScalar : negativeScalar
						// 	for (let i = 0; i < maxScalarUnits; i++)
						// 		oneToDisappearCompletely.children[i].intendedPosition.x += Math.abs(result)

						// 	for (let i = 0; i < maxScalarUnits; i++)
						// 	{
						// 		positiveScalar.children[i].position.copy(positiveScalar.children[i].intendedPosition)
						// 		negativeScalar.children[i].position.copy(negativeScalar.children[i].intendedPosition)
						// 	}

						// 	nhProgress += frameDelta / cutAnticipatingDuration / 4.
						// 	if (nhProgress >= CUT_ADMIRATION_SECTION)
						// 		playRandomPop()
						// }
						// else if (nhProgress < SCALAR_COALESCING_SECTION)
						// {
						// 	let oneRemaining = result > 0. ? positiveScalar : negativeScalar
						// 	for (let i = 0; i < maxScalarUnits; i++)
						// 	{
						// 		if (i >= Math.abs(result) ) break
						// 		oneRemaining.children[i].visible = true
						// 		oneRemaining.children[i].position.x = .5 + i
						// 		oneRemaining.children[i].position.y = 0.
						// 	}

						// 	nhProgress += frameDelta / cutAdmiringDuration / 4.
						// }
						// else
						// {
						// 	let oneRemaining = result > 0. ? positiveScalar : negativeScalar
						// 	for (let i = 0; i < maxScalarUnits; i++)
						// 	{
						// 		if (i >= Math.abs(result) ) break
						// 		oneRemaining.children[i].visible = true
						// 		oneRemaining.children[i].position.x = .5 + i
						// 		oneRemaining.children[i].position.y = 0.
						// 	}

						// 	oneRemaining.setIntendedPositionsToCenteredSquare()

						// 	let lerpAmount = progressClampedEased(SCALAR_COALESCING_SECTION, scalarCoalescingDuration / totalSectionTime)
						// 	for (let i = 0; i < maxScalarUnits; i++)
						// 		oneRemaining.children[i].position.lerp(oneRemaining.children[i].intendedPosition, lerpAmount)

						// 	nhProgress += frameDelta / scalarCoalescingDuration / 4.
						// }
					}
				}

				if (inSection(VECTOR_ADDITION_SECTION))
				{
					geometricSum(operands[0].elements, operands[1].elements, result)

					//this also happens when you scalar multiply vectors

					//stick them end to end, new one pops in, not rocket science

					//seriously going to need instanced geometry at some point

					let noVector0 = (operands[0].elements[1] === 0. && operands[0].elements[2] === 0. && operands[0].elements[3] === 0.)
					let noVector1 = (operands[1].elements[1] === 0. && operands[1].elements[2] === 0. && operands[1].elements[3] === 0.)

					if (noVector0 && noVector1)
					{
						goToStartOfNextSection()
					}
					else if ((noVector0 && !noVector1) || (!noVector0 && noVector1) )
					{
						//don't have the "operand" multivectors

						let oneItIs = noVector0 ? operands[1] : operands[0]

						vec0.visible = true
						vec0.setVec(oneItIs.elements)

						v1.copy(oneItIs.position)
						v1.lerp(zeroVector, progressClampedEased(VECTOR_ADDITION_SECTION, generalMovementDuration))
						v1.y -= oneItIs.elements[2] / 2.
						v1.x -= oneItIs.elements[1] / 2.
						v1.z -= oneItIs.elements[3] / 2.
						vec0.matrix.setPosition(v1)

						nhProgress += frameDelta / generalMovementDuration
					}
					else
					{
						let addDuration = 1.
						let positionedAdmiringDuration = .8
						let resultAdmiringDuration = .7
						let totalSectionTime = addDuration + positionedAdmiringDuration + resultAdmiringDuration

						if (nhProgress-Math.floor(nhProgress) < (totalSectionTime - resultAdmiringDuration) / totalSectionTime ) 
						{
							vec0.visible = true
							vec1.visible = true

							vec0.setVec(operands[0].elements)
							vec1.setVec(operands[1].elements)

							v2.copy(zeroVector) //destination
							v2.x -= operands[1].elements[1] / 2.
							v2.y -= operands[1].elements[2] / 2.
							v2.z -= operands[1].elements[3] / 2.

							v1.copy(operands[0].position)
							v1.lerp(v2, progressClampedEased(VECTOR_ADDITION_SECTION, addDuration/totalSectionTime))
							v1.x -= operands[0].elements[1] / 2.
							v1.y -= operands[0].elements[2] / 2.
							v1.z -= operands[0].elements[3] / 2.
							vec0.matrix.setPosition(v1)

							v2.copy(zeroVector) //destination
							v2.x += operands[0].elements[1] / 2.
							v2.y += operands[0].elements[2] / 2.
							v2.z += operands[0].elements[3] / 2.

							v1.copy(operands[1].position)
							v1.lerp(v2, progressClampedEased(VECTOR_ADDITION_SECTION, addDuration/totalSectionTime))
							v1.x -= operands[1].elements[1] / 2.
							v1.y -= operands[1].elements[2] / 2.
							v1.z -= operands[1].elements[3] / 2.
							vec1.matrix.setPosition(v1)
						}
						else
						{
							// playRandomPop()

							vec0.visible = true

							v1.x = operands[0].elements[1] + operands[1].elements[1]
							v1.y = operands[0].elements[2] + operands[1].elements[2]
							v1.z = operands[0].elements[3] + operands[1].elements[3]

							vec0.setVec(v1.x, v1.y, v1.z)
						}

						nhProgress += frameDelta / totalSectionTime
					}
				}

				if ( inSection(BIVECTOR_ADDITION_SECTION) )
				{
					//just unit rectangles, stick them together
					//maybe you wanna slide them in an area conserving way into being unit rectangles?
					//ahah, and they have the addition and subtraction thing too
					//just need two rectangles

					for(let i = 4; i < 7; i++)
						if (operands[0].elements[i] !== 0. && operands[1].elements[i] !== 0.)
							log("no bivectors like that yet!")

					let noBivector0 = (operands[0].elements[4] === 0. && operands[0].elements[5] === 0. && operands[0].elements[6] === 0.)
					let noBivector1 = (operands[1].elements[4] === 0. && operands[1].elements[5] === 0. && operands[1].elements[6] === 0.)

					if (noBivector0 && noBivector1)
					{
						//no bivector
						goToStartOfNextSection()
					}
					else if (!noBivector0 && !noBivector1)
					{
						goToStartOfNextSection()
					}
					else
					{
						//just move into place
						//can do this at the same time as vector moving into place
						let oneItIs = noBivector0 ? operands[1] : operands[0]
						let oneToUse = noBivector0 ? bivector1 : bivector0

						group.add(oneToUse)
						oneToUse.position.copy( oneItIs.position )
						oneToUse.position.lerp(zeroVector, easingFunctions.easeInOutQuad(nhProgress - BIVECTOR_ADDITION_SECTION))
						oneToUse.updateAppearance(oneItIs.elements[4], oneItIs.elements[5], oneItIs.elements[6])

						nhProgress += frameDelta

						// goToStartOfNextSection()
					}
				}
				else if(nhProgress < BIVECTOR_ADDITION_SECTION)
				{
					if (operands[0].elements[4] === 0. && operands[0].elements[5] === 0. && operands[0].elements[6] === 0.)
						bivector0.visible = false
					else
					{
						bivector0.visible = true
						bivector0.updateAppearance(operands[0].elements[4], operands[0].elements[5], operands[0].elements[6])
						bivector0.position.copy(operands[0].position)
					}

					if (operands[1].elements[4] === 0. && operands[1].elements[5] === 0. && operands[1].elements[6] === 0.)
						bivector1.visible = false
					else
					{
						bivector1.visible = true
						bivector1.updateAppearance(operands[1].elements[4], operands[1].elements[5], operands[1].elements[6])
						bivector1.position.copy(operands[1].position)
					}
				}
			}
			
			if (inSection(ADMIRING_SECTION) )
			{
				let admiringDuration = .8
				nhProgress += frameDelta / admiringDuration
			}

			if(inSection(END))
				multivectorAnimation.finish()
		})
	}
}