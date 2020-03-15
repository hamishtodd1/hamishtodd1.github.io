/*
	Maybe the right thing to do is to say what the units look like
		The unit vector is a vector, with unit length, in a given direction
		The unit bivector is a quadrilateral, with unit length, in a given direction
		The unit scalar looks like a circle
		The unit trivector is a paralellipied

	It should be the case that if you turn the whole thing upside down it should feel ok
		so fretting about whether up, down, left, right is positive and negative (except relatively) is silly

	You could have the pseudoscalar be a rectangle of width (base) 1, therefore its height is its area (volume)
	Aaaaand, the scalar pushes that shape to the right or left

	Vector
		Maybe for positive and negative vectors, could have something on one side of it, not the end.

	The trivector
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

	The bivector
		Addition
			So you get the unit vector in the intersection line (dare I ask, the positive or negative one?)

	Vectors
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

	Bivector addition
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
	let vectorRadius = .07
	let vectorGeometry = new THREE.CylinderBufferGeometry(0.,vectorRadius,1.,16,1,false);
	vectorGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.,.5,0.))

	let parallelogramGeometry = new THREE.OriginCorneredPlaneBufferGeometry(1.,1.)
	let circleGeometry = new THREE.CircleBufferGeometry(1.,32)

	//surely frontside?
	let bivecMaterialFront = new THREE.MeshStandardMaterial({color:0xFF0000,transparent:true,opacity:.6,side:THREE.FrontSide})
	let bivecMaterialBack = new THREE.MeshStandardMaterial({color:0x0000FF,transparent:true,opacity:.6,side:THREE.BackSide})

	let trivectorGeometry = new THREE.SphereBufferGeometry(1.,32,16)
	let trivectorMaterial = new THREE.MeshStandardMaterial()

	MultivectorAppearance = function(externalOnClick,elements)
	{
		let multivec = new THREE.Group();
		scene.add(multivec)

		//maaaaybe you shouldn't have this because it's stateful? Yeah no shut up
		multivec.elements = new Float32Array(8);
		multivec.elements[0] = 1. //identity
		if(elements !== undefined)
			for(let i = 0; i < 8; i++)
				multivec.elements[i] = elements[i]

		multivec.getHeightWithPadding = function()
		{
			let biggestSoFar = 0.

			if(multivec.elements[0] !== 0.)
				biggestSoFar = scalarHeight

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

		let scalarHeight = .6
		{
			let scalar = makeTextSign("",false,false,false)
			//TODO it doesn't need a box around it, just a colored outline
			// scalar.material.depthFunc = THREE.AlwaysDepth
			scalar.castShadow = true
			scalar.material.side = THREE.DoubleSide
			scalar.scale.multiplyScalar(scalarHeight)
			scalar.position.z = .001
			multivec.add(scalar)			

			multivec.setScalar = function(newScalar)
			{
				multivec.elements[0] = newScalar
				multivec.updateScalarAppearance()
			}
			multivec.updateScalarAppearance = function(newScalar)
			{
				let value2sf = multivec.elements[0].toPrecision(2)
				let finalValue = (value2sf * 1.).toString() //already a string but this gets rid of trailing zeroes!
				scalar.material.setText(finalValue)
				if(multivec.elements[0] === 0.)
				{
					multivec.remove(scalar)
				}
				else
				{
					multivec.add(scalar)
				}
			}
			multivec.updateScalarAppearance()
		}

		{
			let vecMesh = new THREE.Mesh( vectorGeometry, new THREE.MeshStandardMaterial() );
			vecMesh.matrixAutoUpdate = false;
			vecMesh.castShadow = true
			multivec.add(vecMesh)

			multivec.setTo1Blade = function(newY)
			{
				multivec.elements[0] = 0.

				multivec.elements[1] = newY.x
				multivec.elements[2] = newY.y
				multivec.elements[3] = newY.z

				multivec.elements[4] = 0.
				multivec.elements[5] = 0.
				multivec.elements[6] = 0.

				multivec.elements[7] = 0.

				multivec.updateAppearance();
			}

			multivec.updateVectorAppearance = function()
			{
				let vecPart = new THREE.Vector3(multivec.elements[1],multivec.elements[2],multivec.elements[3])

				var newX = randomPerpVector( vecPart ).normalize();
				var newZ = vecPart.clone().cross(newX).normalize().negate();

				vecMesh.matrix.makeBasis( newX, vecPart, newZ );
				vecMesh.matrix.setPosition(vecPart.multiplyScalar(-.5))

				if(vecPart.equals(zeroVector))
				{
					multivec.remove(vecMesh)
				}
				else
				{
					multivec.add(vecMesh)
				}
			}
			multivec.updateVectorAppearance();
		}

		{
			let parallelogram = new THREE.Group()
			parallelogram.front = new THREE.Mesh(parallelogramGeometry, bivecMaterialFront);
			parallelogram.front.castShadow = true
			parallelogram.back = new THREE.Mesh(parallelogramGeometry, bivecMaterialBack)
			parallelogram.back.castShadow = true
			parallelogram.add(parallelogram.front,parallelogram.back)
			parallelogram.matrixAutoUpdate = false;

			multivec.setParallelogram = function(multivecA,multivecB)
			{
				let a = multivecA.elements
				let b = multivecB.elements
				parallelogram.matrix.set(
					a[1], b[1], 0., (a[1] + b[1]) / -2.,
					a[2], b[2], 0., (a[2] + b[2]) / -2.,
					a[3], b[3], 1., (a[3] + b[3]) / -2.,
					0.,0.,0.,1.
					)
				log(parallelogram.matrix)

				// if(parallelogram.matrix.determinant() < 0.)
				// {
				// 	//switch
				// }

				multivec.remove(circle)
				if(multivec.elements[4] !== 0. || multivec.elements[5] !== 0. || multivec.elements[6] !== 0. )
					multivec.add(parallelogram)
				else
					multivec.remove(parallelogram)
			}

			let circle = new THREE.Group()
			circle.front = new THREE.Mesh(circleGeometry, bivecMaterialFront)
			circle.front.castShadow = true
			circle.back = new THREE.Mesh(circleGeometry, bivecMaterialBack)
			circle.back.castShadow = true
			circle.add(circle.front,circle.back)
			
			multivec.setCircle = function()
			{
				let area = Math.abs(multivec.elements[4]) //yeah not really because negativity also other elements
				circle.scale.setScalar( Math.sqrt( area / Math.PI ) )
				if(multivec.elements[4] < 0.)
					circle.rotation.y = Math.PI
				else
					circle.rotation.y = 0.

				if(multivec.elements[5] !== 0. || multivec.elements[6] !== 0.)
					log("not working yet")

				multivec.remove(parallelogram)
				if(multivec.elements[4] !== 0. || multivec.elements[5] !== 0. || multivec.elements[6] !== 0. )
					multivec.add(circle)
				else
					multivec.remove(circle)

				//Properly: convert to matrix I suppose
				// randomPerpVector(zAxis)
			}
			multivec.setCircle()
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
			log(multivec.elements)

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
			multivec.setCircle()
			multivec.updateTrivectorAppearance()

			multivec.thingYouClick.scale.y = multivec.getHeightWithPadding()
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
			let thingYouClick = new THREE.Mesh(new THREE.SphereBufferGeometry(.5),new THREE.MeshBasicMaterial({color:0x00FF00}))
			thingYouClick.visible = false
			multivec.thingYouClick = thingYouClick
			multivec.add(thingYouClick)

			clickables.push(thingYouClick)
			multivec.externalOnClick = externalOnClick
			thingYouClick.onClick = function()
			{
				if(multivec.externalOnClick !== undefined)
					multivec.externalOnClick(multivec)
			}
		}

		return multivec
	}
}