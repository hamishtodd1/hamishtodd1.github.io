/*
	For both sum and product of vectors, visualize the parallelogram

	Maybe for positive and negative vectors, could have something on one side of it, not the end.

	The trivector
		Sphere of certain radius for magnitude, colored according to phase
		Or a horizontal line and a vertical line

	The scalar
		The unit size should be clear, and the numeral does make that clear
		Numeral with positive or negative sign
		Numeral with color
		Spiral?
		Probably better off as red five versus blue five if you're going to carry it
		Opacity?
		Bunch of dots? To multiply, it makes that many copies of that thing then adds them together

	Scalar and trivector could be a single complex number
		visualized differently than the vector. 2D as opposed to 3D
		Maybe a nice pear shape
		Has the significant advantage that you get to see how complex numbers rotate each other
		But, the system we're talking about has so many damn dimensions
		related to the fact that all multivectors have an r e^i theta and cos theta + i sin theta decomposition

	The bivector
		A swarm of little blobs
		Addition
			So you get the unit vector in the intersection line (dare I ask, the positive or negative one?)

	Could use the minus sign for everything. Doesn't help you decide what's minus and what's plus though!

	Vectors
		Liquid too?
		The bivector situation is confusing and there's no way around that. So whatever confusion you think vector thing introduces, it's maybe already there
		Arrow
			Can be anywhere and so long as its length is the same you can think of it as the same thing
			Tells you which end is which. Useful for adding
		Centering
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

	Man, RP(n) is surely more fundamental than Rn

	

	A heavily alternative way of doing this is with discrete pieces - vectors and bivectors of unit length, and everything built of htose (looks jaggy)

	Could have the different blades stacked in a column, or around in a circle
	What if you have some things that are enormously larger than others? That's why we have zooming in and out. But some things keep size
*/

function initMultivectorAppearances()
{
	let vectorRadius = .07
	let vectorGeometry = new THREE.CylinderBufferGeometry(0.,vectorRadius,1.,16,1,false);
	vectorGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.,.5,0.))

	let parallelogramGeometry = new THREE.OriginCorneredPlaneBufferGeometry(1.,1.)
	let circleGeometry = new THREE.CircleBufferGeometry(1.,32)

	let bivecMaterialFront = new THREE.MeshStandardMaterial({color:0xFF0000,transparent:true,opacity:.4,side:THREE.DoubleSide})
	let bivecMaterialBack = new THREE.MeshStandardMaterial({color:0x0000FF,transparent:true,opacity:.4,side:THREE.DoubleSide})

	let trivectorGeometry = new THREE.SphereBufferGeometry(1.,32,16)
	let trivectorMaterial = new THREE.MeshStandardMaterial()

	MultivectorAppearance = function(externalOnClick,elements)
	{
		let multivec = new THREE.Object3D();
		scene.add(multivec)

		// multivec.root = null
		// multivec.connector = null

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

			return biggestSoFar + .2
		}

		//maaaaybe you shouldn't have this because it's stateful?
		if(elements === undefined)
			multivec.elements = new Float32Array(8);
		else
			multivec.elements = elements

		let scalarHeight = .7
		{
			let scalar = makeTextSign("",false,false,false)
			scalar.material.depthFunc = THREE.AlwaysDepth
			scalar.castShadow = true
			scalar.material.side = THREE.DoubleSide
			scalar.scale.multiplyScalar(scalarHeight)
			multivec.add(scalar)

			

			multivec.setScalar = function(newScalar)
			{
				multivec.elements[0] = newScalar
				multivec.updateScalarAppearance()
			}
			multivec.updateScalarAppearance = function(newScalar)
			{
				scalar.material.setText(multivec.elements[0])
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
			let parallelogram = new THREE.Object3D()
			let front = new THREE.Mesh(parallelogramGeometry, bivecMaterialFront);
			front.castShadow = true
			let back = new THREE.Mesh(parallelogramGeometry, bivecMaterialBack)
			back.castShadow = true

			multivec.add(parallelogram)

			parallelogram.add(front,back)
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

			let circle = new THREE.Mesh(circleGeometry, bivecMaterialFront)
			multivec.add(circle)
			
			multivec.setCircle = function()
			{
				let area = Math.abs(multivec.elements[4]) //yeah not really because negativity also other elements
				circle.scale.setScalar( Math.sqrt( area / Math.PI ) )
				if(multivec.elements[5]!==0. || multivec.elements[6] !== 0.)
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

		{
			let thingYouClick = new THREE.Mesh(new THREE.SphereBufferGeometry(.5),new THREE.MeshBasicMaterial({color:0x00FF00}))
			thingYouClick.visible = false
			multivec.thingYouClick = thingYouClick
			multivec.add(thingYouClick)

			clickables.push(thingYouClick)
			if( externalOnClick !== undefined)
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