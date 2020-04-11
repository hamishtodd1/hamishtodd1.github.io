/*
	Scalar vector multiplication: one of the scalar units goes to the end of the vector, and the rest get spaced out too

	Possibly useful model: the operator combines with one of the operands to become a thing that is applied to the other operand
	A little cartoon character doing everything is surely the way to go. The pieces should be gotten rid of

	Technical
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

	Grouping / location
		Could have the different blades stacked in a column, or around in a circle
		It is contingent that this vector and this scalar are together
		This gets into philosophy :)
		What if you have some things that are enormously larger than others? That's why we have zooming in and out. But some things keep size

	Vector vector
		Sweep a along b to get a bivector. On is the sweeper, one is the thing it is swept along.
		Use this to make the addition too. This way, it is a surprise that addition is commutative, rather than a surprise that wedging is not
		Addition of codirectional vectors and bivectors probably is different from non conditional,
		and it's probably ok to encourage that idea. Early levels can be just about them. X vector, X vector, 3. You must make an X vector of length 6.

*/

function initMultivectorAppearances()
{
	let vectorRadius = .19
	let vectorGeometry = new THREE.CylinderBufferGeometry(0.,vectorRadius,1.,16,1,false);
	vectorGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.,.5,0.))

	let scalarUnitGeometry = new THREE.CircleGeometry(.5, 6)
	// for (let i = 0, il = scalarUnitGeometry.vertices.length / 2; i < il; i++)
	// 	scalarUnitGeometry.vertices[i*2].multiplyScalar(.7)

	let bivecMaterialClockwise = new THREE.MeshBasicMaterial({ color: discreteViridis[0].hex,transparent:true, opacity:1., side:THREE.FrontSide})
	let bivecMaterialCounter = new THREE.MeshBasicMaterial({ color: discreteViridis[2].hex,transparent:true, opacity:1., side:THREE.BackSide})

	MultivectorAppearance = function(externalOnClick,elements)
	{
		let multivec = new THREE.Group();
		scene.add(multivec) //the only point is to be a visualization

		function scalarBlockWidth()
		{
			let min = Infinity
			let max = -Infinity
			for (let i = 0, il = scalar.children.length; i < il; i++)
			{
				if(!scalar.children[i].visible)
					break
				min = Math.min(min, scalar.children[i].position.x)
				max = Math.max(max, scalar.children[i].position.x)
			}
			return max - min + 1.;
		}
		function scalarBlockHeight()
		{
			let min = Infinity
			let max = -Infinity
			for (let i = 0, il = scalar.children.length; i < il; i++)
			{
				if(!scalar.children[i].visible)
					break
				min = Math.min(min, scalar.children[i].position.y)
				max = Math.max(max, scalar.children[i].position.y)
			}
			return max - min + 1.;
		}

		multivec.elements = MathematicalMultivector() //identity
		if(elements !== undefined)
			copyMultivector(elements, multivec.elements)
		elements = multivec.elements

		//scalar
		{
			//how about they have a unit-size surroundings but are actually a little bean?
			var scalar = new THREE.Group()
			scalar.position.z = .001
			multivec.add(scalar)
			multivec.scalar = scalar
			scalar.material = new THREE.MeshBasicMaterial()

			let newOne = null
			let maxUnits = 256
			for(let i = 0; i < maxUnits; i++)
			{
				newOne = new THREE.Mesh(scalarUnitGeometry, scalar.material)

				newOne.intendedPosition = new THREE.Vector3(i,0.,0.) //just there as a default
				newOne.castShadow = true
				scalar.add(newOne)
			}

			scalar.setIntendedPositionsToSquare = function ()
			{
				let currentLayer = 1 //layer n and all below it contain n^2 verts. vertex 0 is layer 1

				/*
					456
					327
					018
				*/
				for (let i = 0, il = scalar.children.length; i < il; i++)
				{
					if (sq(currentLayer) <= i)
						currentLayer++;

					let rightDown = currentLayer % 2; // as opposed to upLeft
					let diagOfThisLayer = 2 * currentLayer * (currentLayer - 1) / 2
					let inSecondHalf = i > diagOfThisLayer

					scalar.children[i].intendedPosition
						.set(0.,0.,0.)
						.addScaledVector(rightDown ? yUnit : xUnit, currentLayer - 1) //get you to the start
						.addScaledVector(rightDown ? xUnit : yUnit, inSecondHalf ? currentLayer - 1 : i - sq(currentLayer - 1))
					if (inSecondHalf)
						scalar.children[i].intendedPosition.addScaledVector(rightDown ? yUnit : xUnit, -1 * (i - diagOfThisLayer))
				}

				let centerLocationX = scalarBlockWidth() / 2.
				let centerLocationY = scalarBlockHeight() / 2.
				for (let i = 0, il = scalar.children.length; i < il; i++)
				{
					scalar.children[i].intendedPosition.x -= centerLocationX - .5
					scalar.children[i].intendedPosition.y -= centerLocationY - .5
				}
			}

			if(scalar.children.length !== maxUnits)
				console.log("lots of infrastructure is based on something you just changed")
		}

		//vector
		{
			var vecAppearance = new THREE.Mesh( vectorGeometry, new THREE.MeshStandardMaterial() );
			vecAppearance.matrixAutoUpdate = false;
			vecAppearance.castShadow = true
			multivec.add(vecAppearance)

			var vecPart = new THREE.Vector3()
			var vecOrthX = new THREE.Vector3()
			var vecOrthZ = new THREE.Vector3()
		}

		//bivec
		{
			multivec.bivectorAppearance = new THREE.Object3D()
			multivec.add(multivec.bivectorAppearance)

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
			multivec.bivectorAppearance.add(clockwiseSide, counterSide)
			multivec.bivectorAppearance.piecesPositions = piecesPositions
			multivec.bivectorAppearance.piecesMoreClockwiseEdges = piecesMoreClockwiseEdges
			multivec.bivectorAppearance.piecesLessClockwiseEdges = piecesLessClockwiseEdges

			//alright so which way is it facing? the convention is that positive = clockwise if you're looking at it. OMFG IS THIS THE SAME THING
			//Therefore if you're looking at

			let style = "parallelogram"
			let moreClockwiseEdge = new THREE.Vector3(1., 0., 0.) //0 is "lower", clockwise of the second one, kinda like x axis and y
			let lessClockwiseEdge = new THREE.Vector3(0.,1., 0.)
			let position = new THREE.Vector3()

			updateFunctions.push(function ()
			{
				let bivectorMagnitude = Math.sqrt( sq(elements[4]) + sq(elements[5]) + sq(elements[6]) )
				let edgeLen = Math.sqrt(bivectorMagnitude)

				//TODO this only works because this element is the only one
				//and it is not clear which vector 
				if (elements[4] >= 0.)
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

					position.addVectors(moreClockwiseEdge,lessClockwiseEdge).multiplyScalar(-.5)

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
			})
		}

		multivec.skipAnimation = function()
		{
			for (let i = 0, il = scalar.children.length; i < il; i++)
				scalar.children[i].position.copy(scalar.children[i].intendedPosition)

			//bivector relaxes to a rectangle
			//scalar maybe becomes the other part of the complex number
			//trivector relaxes to cuboid
		}
		multivec.skipAnimation()

		let boundingBox = new THREE.Mesh(unchangingUnitSquareGeometry,new THREE.MeshBasicMaterial({color:0x00FF00,transparent:true,opacity:.4}))
		{
			boundingBox.visible = false
			multivec.boundingBox = boundingBox
			multivec.add(boundingBox)

			function updateBoundingBoxSize()
			{
				boundingBox.scale.x = scalarBlockWidth()
				boundingBox.scale.y = scalarBlockHeight()

				//vector
				boundingBox.scale.x = Math.max(boundingBox.scale.x,Math.abs(elements[1]) )
				boundingBox.scale.y = Math.max(boundingBox.scale.y,Math.abs(elements[2]) )

				//bivector. Terrible simplification.
				let minX = Infinity
				let maxX = -Infinity
				let minY = Infinity
				let maxY = -Infinity
				for (let i = 0., il = multivec.bivectorAppearance.children[0].geometry.vertices.length; i < il; i++)
				{
					minX = Math.min(minX,multivec.bivectorAppearance.children[0].geometry.vertices[i].x)
					maxX = Math.max(maxX,multivec.bivectorAppearance.children[0].geometry.vertices[i].x)
					minY = Math.min(minY,multivec.bivectorAppearance.children[0].geometry.vertices[i].y)
					maxY = Math.max(maxY,multivec.bivectorAppearance.children[0].geometry.vertices[i].y)
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

		function updateAppearance()
		{
			//scalar
			{
				// if (elements[0] != Math.round(elements[0]))
				// {
				// 	//cut radially
				// 	//do it in frag shader
				// }
				scalar.material.color.setHex(elements[0] > 0. ? discreteViridis[1].hex : discreteViridis[3].hex)
				if (Math.abs(elements[0]) > scalar.children.length)
					console.error("not enough scalar units")
				for (let i = 0, il = scalar.children.length; i < il; i++)
					scalar.children[i].visible = i < Math.floor(Math.abs(elements[0]))
				scalar.setIntendedPositionsToSquare()

				for (let i = 0, il = scalar.children.length; i < il; i++)
					scalar.children[i].position.lerp(scalar.children[i].intendedPosition, .1)
			}

			//vec
			{
				vecPart.set(multivec.elements[1], multivec.elements[2], multivec.elements[3])
				randomPerpVector(vecPart, vecOrthX)
				vecOrthX.normalize()
				vecOrthZ.copy(vecPart).cross(vecOrthX).normalize().negate();
				vecAppearance.matrix.makeBasis(vecOrthX, vecPart, vecOrthZ);
				vecAppearance.matrix.setPosition(vecPart.multiplyScalar(-.5))

				if (vecPart.equals(zeroVector))
					multivec.remove(vecAppearance)
				else
					multivec.add(vecAppearance)
			}
		}
		updateAppearance()
		updateBoundingBoxSize()

		updateFunctions.push(function()
		{
			if (multivec.elements[5] !== 0. || multivec.elements[6] !== 0. || multivec.elements[7] !== 0.)
				log("not 3D yet")

			if(multivec.animationOngoing)
			{
				multivec.animationOngoing = false
			}

			updateAppearance()

			updateBoundingBoxSize()

			for (let i = 0; i < multivec.children.length; i++)
			{
				if (multivec.children[i].matrix.equals(zeroMatrix))
				{
					debugger;
				}
			}
		})

		return multivec
	}
}