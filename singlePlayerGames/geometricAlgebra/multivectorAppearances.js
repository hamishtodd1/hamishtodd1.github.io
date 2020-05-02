/*

	Scalar vector multiplication: one of the scalar units goes to the end of the vector, and the rest get spaced out too

	General
		Possibly useful model: the operator combines with one of the operands to become a thing that is applied to the other operand
		A little cartoon character doing everything is surely the way to go. The pieces should be gotten rid of.

	Technical
		Best not to have the question of the existence of a multivector at all!
		There is a question about what you should be parented to but that is tooooo philosophical
		At short notice, any appearance can change to any other
		So should react to its value at every frame really

	Maybe the right thing to do is to say what the units look like
		The unit vector is a vector, with unit length, in a given direction
		The unit bivector is a quadrilateral, with unit length, in a given plane
		The unit scalar looks like a circle
		The unit trivector is a paralellipied

	The trivector
		You could have the pseudoscalar be a rectangle of width (base) 1, therefore its height is its area (volume)
		Sphere of certain radius for magnitude, colored according to phase
		Or a horizontal line and a vertical line
		Naah, blue or red liquid just like bivector
		Transparent and glowy and smoky and reflective

	The scalar
		how about they have a unit-size surroundings but are actually a little bean?
		A circle that can bulge very slightly for when you want to multiply it by a vector
		For unit circle it will be less than one
		IS there any reason to not store the scalars in a line? More compact...
		circle implies no directionality, and distinguishes it nicely from the square which can be used for bivector
		Need to know the multiplicative identity is
		Probably better off as red five versus blue five if you're going to carry it

	Scalar and trivector could be a single complex number
		How about, IF both scalar and trivector are nonzero you get the complex number, otherwise just the one
		Possibly trivector should be a numeral, with different colors
		How about
			a numeral equal to the argument, 
			the numeral/box around the numeral is a certain color
			And there is a color wheel around it so it is easy to read off the direction
		visualized differently than the vector. 2D as opposed to 3D

	Vectors
		Maybe for positive and negative vectors, could have something on one side of it, not the end.
		The bivector situation is confusing and there's no way around that. So whatever confusion you think vector thing introduces, it's maybe already there
		Arrow
			Can be anywhere and so long as its length is the same you can think of it as the same thing
			Tells you which end is which. Useful for adding
		Centering
			Don't worry about this. The point is that they can move around.
			Gets you to think about vectors in a bivector like way
			You picture a vector as an arrow. But where is that arrow located? Has to originate at origin
			"Quantity of directed, positive or negative, mass" may be a better way of thinking of vectors than arrows
				Certainly it generalizes better to higher dimensions
			It's a little surprising that adding arrows in any order gets the same result
				This tells you that it is best to think of them all, equally, being taken away from the origin

	Bivectors
		Along with scalar, could gently rock from side to side
		bivector-scalar: the scalar units go into a square, disperse, the bivectors get copied, then merge
		bivector bivector multiplication: just rotate 90 deg
		Bivector-bivector wedge - do you make the triangle as well?
		So you get the unit vector in the intersection line (dare I ask, the positive or negative one?)
		Make them rectangles with unit length on side that is the shared line
		Attach them along that side
		They "Snap" to the hypotenuse

	Vector addition and multiplication
		For both sum and product of vectors, visualize the parallelogram
	Vector addition: always one on left and one above. And when they come together the red ends can melt each other or whatever it is, just like bivectors

	Sweep a along b to get a bivector. On is the sweeper, one is the thing it is swept along.
		Use this to make the addition too. This way, it is a surprise that addition is commutative, rather than a surprise that wedging is not
		Addition of codirectional vectors and bivectors probably is different from non conditional,
		and it's probably ok to encourage that idea. Early levels can be just about them. X vector, X vector, 3. You must make an X vector of length 6.

	Grouping / location
		Could have the different blades stacked in a column, or around in a circle
		What if you have some things that are enormously larger than others? That's why we have zooming in and out. But some things keep size

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
				
				for (let i = 0, il = scalar.children.length; i < il; i++)
				{
					if (!scalar.children[i].visible)
						break
					scalar.children[i].intendedPosition.x = zigzagPositions[i].x - center.x
					scalar.children[i].intendedPosition.y = zigzagPositions[i].y - center.y
				}

				delete center
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
		let vectorRadius = .19
		let vectorGeometry = new THREE.CylinderBufferGeometry(0., vectorRadius, 1., 16, 1, false);
		vectorGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0., .5, 0.))
		let vectorMaterial = new THREE.MeshStandardMaterial()

		let vecPart = new THREE.Vector3()
		let vecOrthX = new THREE.Vector3()
		let vecOrthZ = new THREE.Vector3()
		function VectorAppearance()
		{
			let m = new THREE.Mesh(vectorGeometry, vectorMaterial);
			m.matrixAutoUpdate = false;
			m.castShadow = true

			m.setVec = function (x, y, z)
			{
				vecPart.set(x, y, z)
				randomPerpVector(vecPart, vecOrthX)
				vecOrthX.normalize()
				vecOrthZ.copy(vecPart).cross(vecOrthX).normalize().negate();
				m.matrix.makeBasis(vecOrthX, vecPart, vecOrthZ);
				m.matrix.setPosition(vecPart.multiplyScalar(-.5))

				m.visible = !vecPart.equals(zeroVector)
			}

			return m
		}
	}

	{
		let bivecMaterialClockwise = new THREE.MeshBasicMaterial({ color: discreteViridis[0].hex, transparent: true, opacity: 1., side: THREE.FrontSide })
		let bivecMaterialCounter   = new THREE.MeshBasicMaterial({ color: discreteViridis[2].hex, transparent: true, opacity: 1., side: THREE.BackSide })
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
					tempVector.copy(piecesPositions[i])
					geo.vertices[i * 4 + 0].lerp(tempVector, 1.)
					tempVector.copy(piecesPositions[i]).add(piecesMoreClockwiseEdges[i])
					geo.vertices[i * 4 + 1].lerp(tempVector, 1.)
					tempVector.copy(piecesPositions[i]).add(piecesLessClockwiseEdges[i])
					geo.vertices[i * 4 + 2].lerp(tempVector, 1.)
					tempVector.copy(piecesPositions[i]).add(piecesMoreClockwiseEdges[i]).add(piecesLessClockwiseEdges[i])
					geo.vertices[i * 4 + 3].lerp(tempVector, 1.)
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

		let vectorAppearance = VectorAppearance()
		multivec.add(vectorAppearance)

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
			vectorAppearance.setVec(multivec.elements[1], multivec.elements[2], multivec.elements[3])
			bivectorAppearance.updateAppearance(multivec.elements[4],multivec.elements[5],multivec.elements[6])

			updateBoundingBoxSize()
		}
		
		updateFunctions.push(multivec.updateAppearance)

		return multivec
	}

	{
		//singleton, and it's ok for that to be a global
		let group = new THREE.Group()

		let positiveScalar = ScalarAppearance()
		positiveScalar.positive.value = true
		let negativeScalar = ScalarAppearance()
		negativeScalar.positive.value = false

		// let vectorAppearance = VectorAppearance()
		// group.add(vectorAppearance)
		// let bivectorAppearance = BivectorAppearance()
		// group.add(bivectorAppearance)

		let scalarAdditionProgress = -1.

		let scalarAdditionDuration = .8
		let admiringDuration = .8

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

				console.assert(scalarAdditionProgress !== 0.)
				scalarAdditionProgress = 0.
			}
		}

		updateFunctions.push(function ()
		{
			if (!multivectorAnimation.ongoing())
				return

			scalarAdditionProgress += frameDelta
			let scalarAdditionProgressEased = easingFunctions.easeInOutQuad( Math.min(1.,scalarAdditionProgress / scalarAdditionDuration) )

			scene.remove(operands[0], operands[1], activeOperator)

			if (activeOperator.function === geometricSum)
			{
				//shouldn't be too hard to have fractional parts
				if (operands[0].elements[0] > 0. && operands[1].elements[0] > 0.)
				{
					group.add(positiveScalar)
					group.remove(negativeScalar)

					for (let i = 0; i < maxScalarUnits; i++)
						positiveScalar.children[i].visible = false
					for (let i = 0; i < maxScalarUnits; i++)
						negativeScalar.children[i].visible = false

					let ourUnitIndex = 0;
					for (let i = 0, il = operands[1].scalar.children.length; i < il; i++)
					{
						if (!operands[1].scalar.children[i].visible) break
						positiveScalar.children[ourUnitIndex].visible = true
						positiveScalar.children[ourUnitIndex].position.copy(operands[1].scalar.children[i].position).add(operands[1].position)
						++ourUnitIndex
					}
					for (let i = 0, il = operands[0].scalar.children.length; i < il; i++)
					{
						if (!operands[0].scalar.children[i].visible) break
						positiveScalar.children[ourUnitIndex].visible = true
						positiveScalar.children[ourUnitIndex].position.copy(operands[0].scalar.children[i].position).add(operands[0].position)
						++ourUnitIndex
					}

					positiveScalar.setIntendedPositionsToCenteredSquare()
					for (let i = 0; i < maxScalarUnits; i++)
					{
						if (!positiveScalar.children[i].visible) break
						positiveScalar.children[i].position.lerp(positiveScalar.children[i].intendedPosition,scalarAdditionProgressEased)
						// log(positiveScalar.children[i].position)
					}
				}
			}

			if ( scalarAdditionProgress > scalarAdditionDuration + admiringDuration )
				multivectorAnimation.finish()
		})
	}
}