/*
	The trivector
		Sphere of certain radius for magnitude, colored according to phase
		Or a horizontal line and a vertical line

	The scalar
		The unit size should be clear, and the numeral does make that clear
		Numeral with positive or negative sign
		Spiral?
		Probably better off as red five versus blue five if you're going to carry it
		Opacity?

	Scalar and trivector could be a single complex number
		visualized differently than the vector. 2D as opposed to 3D
		Maybe a nice pear shape
		Has the significant advantage that you get to see how complex numbers rotate each other
		But, the system we're talking about has so many damn dimensions
		related to the fact that all multivectors have an r e^i theta and cos theta + i sin theta decomposition

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
		So you get the unit vector in the intersection line (dare I ask, the positive or negative one?)

	Man, RP(n) is surely more fundamental than Rn

	Which bivectors are positive, which negative?
		Whatever you decide distinguishes clockwise and anticlockwise (positive and negative) bivectors, that surely applies to vectors
			Maybe you can even deduce it from the trivectors
		Choose a plane:
			y=0
				People do think of "up" as being special
			x+y+z=0
				It seems like for vectors on the x,y,z axes you definitely know which are positive, like this is embedded in your system
			z=0
				This may be just a question of perspective
		It seems like turning the plane around actually DOES turn red into blue?
		Surely it is arbitary, same as right hand/left hand. The important thing is that for a given plane, 
			whichever ones you decide are positive are all a positive multiple of one another and
			whichever ones you decide are negative are all a positive multiple of one another
		So:
			get the normal vector to that plane
			check its dot product with the vector(float_min,0.,1.)
			If it's positive your bivectors are one way, negative another
			Ideally a vector such that dot product is never 0. If it is sometimes 0 you need to divide that plane in half too

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

		{
			let thingYouClick = new THREE.Mesh(new THREE.SphereBufferGeometry(.5),new THREE.MeshBasicMaterial({color:0x00FF00,transparent:true,opacity:0.0001}))
			multivec.add(thingYouClick)

			clickables.push(thingYouClick)
			thingYouClick.onClick = function()
			{
				externalOnClick(multivec)
			}
		}

		multivec.root = null
		multivec.connector = null

		//maaaaybe you shouldn't have this because it's stateful?
		if(elements === undefined)
			multivec.elements = new Float32Array(8);
		else
			multivec.elements = elements

		{
			let scalar = makeTextSign("",false,false,false)
			scalar.material.depthFunc = THREE.AlwaysDepth
			scalar.castShadow = true
			scalar.material.side = THREE.DoubleSide
			scalar.scale.multiplyScalar(0.3)
			multivec.add(scalar)

			

			multivec.setScalar = function(newScalar)
			{
				multivec.elements[0] = newScalar
				multivec.updateScalarAppearance()
			}
			multivec.updateScalarAppearance = function(newScalar)
			{
				scalar.material.setText(multivec.elements[0].toFixed(1))
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

				multivec.updateVectorAppearance();
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

			log(front.uuid)
			
			

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
				circle.scale.setScalar(Math.abs(multivec.elements[4])) // no, not abs because negativity! Also area! Yeesh
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
		}

		multivec.copyElements = function(elementsToTakeOn)
		{
			for(let i = 0; i < 8; i++)
				multivec.elements[i] = elementsToTakeOn[i]
			multivec.updateAppearance()
		}

		return multivec
	}
}