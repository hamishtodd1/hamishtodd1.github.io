/*
	Technical
		At short notice, any appearance can change to any other
		So should react to its value at every frame really

	Maybe the right thing to do is to say what the units look like
		The unit vector is a vector, with unit length, in a given direction
		The unit bivector is a quadrilateral, with unit length, in a given direction
		The unit scalar looks like a circle
		The unit trivector is a paralellipied

	The trivector
		You could have the pseudoscalar be a rectangle of width (base) 1, therefore its height is its area (volume)
		Sphere of certain radius for magnitude, colored according to phase
		Or a horizontal line and a vertical line
		Naah, blue or red liquid just like bivector
		Transparent and glowy and smoky and reflective

	The scalar
		IS there any reason to not store the scalars in a line? More compact...
		circle implies no directionality, and distinguishes it nicely from the square which can be used for bivector
		Need to know the multiplicative identity is
		Probably better off as red five versus blue five if you're going to carry it

	Both the engineer and the flexibility-is-key Bret Victor would say it's context-dependent what viz you should use
		Because look, a bivector can also be considered an imaginary number
			This whole thing is just a point in space, *ideally* you'd be able to see in 8 dimensions
			It might even be that sometimes when working on a 3D problem you need to think 2D for a sec

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

	let scalarUnitGeometry = new THREE.CircleGeometry(.5, 32)

	let positiveColor = discreteViridis[0].hex
	let negativeColor = discreteViridis[2].hex

	let bivecMaterialClockwise = new THREE.MeshBasicMaterial({	color:positiveColor,transparent:true, opacity:1., side:THREE.FrontSide})
	let bivecMaterialCounter =  new THREE.MeshBasicMaterial({	color:negativeColor,transparent:true, opacity:1., side:THREE.BackSide})

	let trivectorGeometry = new THREE.SphereBufferGeometry(1.,32,16)
	let trivectorMaterial = new THREE.MeshStandardMaterial()

	MultivectorAppearance = function(externalOnClick,elements)
	{
		let multivec = new THREE.Group();
		scene.add(multivec) //the only point is to be a visualization

		//maaaaybe you shouldn't have this because it's stateful? Yeah no shut up
		multivec.elements = MathematicalMultivector() //identity
		if(elements !== undefined)
			copyMultivector(elements, multivec.elements)
		elements = multivec.elements

		multivec.getHeightWithPadding = function()
		{
			let biggestSoFar = 0.

			if(multivec.elements[0] !== 0.)
				biggestSoFar = 1.

			if( Math.abs(multivec.elements[2]) > biggestSoFar )
				biggestSoFar = Math.abs(multivec.elements[2])

			let bivectorArea = Math.sqrt(sq(multivec.elements[4])+sq(multivec.elements[5])+sq(multivec.elements[6]))
			let bivectorHeight = 2. * Math.sqrt( bivectorArea / Math.PI )
			if( bivectorHeight > biggestSoFar )
				biggestSoFar = bivectorHeight

			if(multivec.elements[7] !== 0.)
				log("no trivector size")

			let padding = .4
			return biggestSoFar + padding
		}

		{
			//how about they have a unit-size surroundings but are actually a little bean?
			let scalar = new THREE.Group()
			scalar.position.z = .001
			multivec.add(scalar)
			scalar.material = new THREE.MeshBasicMaterial()

			let newOne = null
			let maxUnits = 256
			for(let i = 0; i < maxUnits; i++)
			{
				if(i !== maxUnits-1)
					newOne = new THREE.Mesh(scalarUnitGeometry, scalar.material)
				else
				//coooould be diamonds
					newOne = new THREE.Mesh(new THREE.CircleGeometry(1., 32), scalar.material)

				newOne.intendedPosition = new THREE.Vector3()
				newOne.intendedPosition.x = .5 + i
				newOne.castShadow = true
				scalar.add(newOne)
			}
			let partial = scalar.children[maxUnits-1]

			//zigzag
			// if(0)
			{
				let currentLayer = 1 //layer n and all below it contain n^2 verts. vertex 0 is layer 1
				for (let i = 0; i < maxUnits; i++)
				{
					if (sq(currentLayer) <= i)
						currentLayer++;
						
					let rightDown = currentLayer % 2; // as opposed to upLeft
					let diagOfThisLayer = 2 * currentLayer * (currentLayer - 1) / 2
					let inSecondHalf = i > diagOfThisLayer

					scalar.children[i].intendedPosition
						.set(0.,0.,0.)
						.addScaledVector(rightDown? yUnit : xUnit,currentLayer-1) //get you to the start
						.addScaledVector(rightDown? xUnit : yUnit, inSecondHalf ? currentLayer-1 : i-sq(currentLayer-1))
					if(inSecondHalf)
						scalar.children[i].intendedPosition.addScaledVector(rightDown ? yUnit : xUnit, -1 * (i-diagOfThisLayer) )
				}
			}

			//this is the part where the threejs abstraction is maybe a bad idea
			multivec.updateScalarAppearance = function()
			{
				let s = this.elements[0]
				if (Math.abs(s) > maxUnits) console.error("not enough scalar units")
				for (let i = 0; i < maxUnits; i++)
					scalar.children[i].visible = i < Math.floor(Math.abs(s) )

				scalar.material.color.setHex(s > 0. ? discreteViridis[1].hex : discreteViridis[3].hex)

				if(s != Math.round(s))
				{
					partial.visible = true
					let horizontalChop = Math.abs(s - Math.round(s))
					let verticalChop = 1.
					for (let i = 0, il = partial.geometry.vertices.length; i < il; i++)
					{
						let v = scalarUnitGeometry.vertices[i]

						if (v.y + .5 < verticalChop)
							partial.geometry.vertices[i].y = v.y
						else
							partial.geometry.vertices[i].y = verticalChop - .5

						if (v.x + .5 < horizontalChop)
							partial.geometry.vertices[i].x = v.x
						else
							partial.geometry.vertices[i].x = horizontalChop - .5
					}
				}
			}
			let seen = false
			updateFunctions.push(function()
			{
				for(let i = 0; i < maxUnits; i++)
					scalar.children[i].position.lerp(scalar.children[i].intendedPosition, .1)
				seen = true
			})
			multivec.updateScalarAppearance()
		}

		{
			let vecAppearance = new THREE.Mesh( vectorGeometry, new THREE.MeshStandardMaterial() );
			vecAppearance.matrixAutoUpdate = false;
			vecAppearance.castShadow = true
			multivec.add(vecAppearance)

			multivec.updateVectorAppearance = function()
			{
				let vecPart = new THREE.Vector3(multivec.elements[1],multivec.elements[2],multivec.elements[3])

				var newX = randomPerpVector( vecPart ).normalize();
				var newZ = vecPart.clone().cross(newX).normalize().negate();

				vecAppearance.matrix.makeBasis( newX, vecPart, newZ );
				vecAppearance.matrix.setPosition(vecPart.multiplyScalar(-.5))

				if(vecPart.equals(zeroVector))
				{
					multivec.remove(vecAppearance)
				}
				else
				{
					multivec.add(vecAppearance)
				}
			}
			multivec.updateVectorAppearance();
		}

		{
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

			multivec.bivectorAppearance = new THREE.Object3D()
			multivec.add(multivec.bivectorAppearance)
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

			multivec.updateBivectorAppearance = function ()
			{
				//can change pair of vectors
				//orientation
			}

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

		{
			let trivector = new THREE.Mesh(trivectorGeometry,trivectorMaterial)
			multivec.updateTrivectorAppearance = function()
			{
				//maaaaybe unnecessary
				let radius = Math.pow( multivec.elements[7] * 3./4. / Math.PI, 1./3. )

				trivector.scale.setScalar( radius )
				if(multivec.elements[7] === 0.)
				{
					multivec.remove(trivector)
				}
				else
				{
					multivec.add(trivector)
				}
			}
			multivec.updateTrivectorAppearance()
		}

		function areAnyOthersNonZero(arr,elementsToIgnore)
		{
			for(let i = 0; i < arr.length; i++)
			{
				if(elementsToIgnore.indexOf(i) !== -1)
					continue;
				else if(arr[i] !== 0.)
					return true;
			}
			return false;
		}
		multivec.getGrade = function()
		{
			let e = multivec.elements;
			if( !areAnyOthersNonZero(e,[]) ) //only blades can have a grade?
				return -1;

			if( e[0] !== 0. && !areAnyOthersNonZero(e,[0]) )
				return 0;
			if((e[1] !== 0. || e[2] !== 0. || e[3] !== 0.) && !areAnyOthersNonZero(e,[1,2,3]) )
				return 1;
			if((e[4] !== 0. || e[5] !== 0. || e[6] !== 0.) && !areAnyOthersNonZero(e,[4,5,6]) )
				return 2;
			if( e[7] !== 0. && !areAnyOthersNonZero(e,[7]) )
				return 3;

			return "compound";
		}

		multivec.geometricProductMultivectors = function(multivecA,multivecB)
		{
			geometricProduct(multivecA.elements,multivecB.elements,multivec.elements)

			multivec.updateScalarAppearance()
			multivec.updateVectorAppearance()

			let aGrade = multivecA.getGrade()
			let bGrade = multivecB.getGrade()
			if( aGrade === 1 && bGrade === 1 ) //actually you should also check area not 0
				multivec.setParallelogram(multivecA,multivecB)
			else
				multivec.setCircle()
		}
		multivec.addMultivectors = function(multivecA,multivecB)
		{
			geometricAdd(multivecA.elements,multivecB.elements,multivec.elements)

			//could work out the parallelogram

			multivec.updateScalarAppearance()
			multivec.updateVectorAppearance()
			multivec.setCircle()
		}

		multivec.updateAppearance = function()
		{
			multivec.updateScalarAppearance()
			multivec.updateVectorAppearance()
			multivec.updateBivectorAppearance()
			multivec.updateTrivectorAppearance()

			multivec.boundingBox.scale.y = multivec.getHeightWithPadding()
		}

		multivec.copyElements = function(elementsToTakeOn)
		{
			for(let i = 0; i < 8; i++)
			multivec.elements[i] = elementsToTakeOn[i]
			multivec.updateAppearance()
		}

		for(let i = 0; i < multivec.children.length; i++)
		{
			if(multivec.children[i].matrix.equals(zeroMatrix))
			{
				debugger;
			}
		}

		if( externalOnClick !== undefined)
		{
			let boundingBox = new THREE.Mesh(new THREE.SphereBufferGeometry(.5),new THREE.MeshBasicMaterial({color:0x00FF00,transparent:true,opacity:.2}))
			boundingBox.visible = false
			multivec.boundingBox = boundingBox
			multivec.add(boundingBox)

			clickables.push(boundingBox)
			multivec.externalOnClick = externalOnClick
			boundingBox.onClick = function()
			{
				if(multivec.externalOnClick !== undefined)
					multivec.externalOnClick(multivec)
			}
		}

		let timer = 2.;
		updateFunctions.push(function()
		{
			if(multivec.animationOngoing)
			{
				timer -= frameDelta
				if(timer < 0.)
					multivec.animationOngoing = false
			}
		})

		return multivec
	}
}