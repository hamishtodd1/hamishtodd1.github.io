/*
	Centering
		Quite interesting actually. Gets you to think about vectors in a bivector like way
		You picture a vector as an arrow. But where is that arrow located? Has to originate at origin
		The claim is that your "quantity of directed, positive or negative, mass" is a better way of thinking of vectors than arrows
			Certainly it generalizes better to higher dimensions
		It's a little surprising that adding arrows in any order gets the same result
			This tells you that it is best to think of them all, equally, being taken away from the origin

	The trivector
		scalar and trivector could be a single complex number
			visualized differently than the vector, maybe a nice pear shape
		Sphere of certain radius for magnitude, colored according to phase
		Or a horizontal line and a vertical line

	The scalar
		Numeral with positive or negative sign
		

	Aesthetics/non-design
		But mostly can think of stuff as being in the background. Leave that to a game engine?
		If it's all simple geometric shapes you can get explicit ray intersections -> good shadows etc

	So liquids for vectors?
		The bivector situation is confusing and there's no way around that. So whatever confusion you think vector thing introduces, it's maybe already there




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

		thingsThatCanBeDragged = []

		multivec.root = null
		multivec.connector = null

		//maaaaybe you shouldn't have this because it's stateful?
		if(elements === undefined)
			multivec.elements = new Float32Array(8);
		else
			multivec.elements = elements

		function onClick()
		{
			externalOnClick(multivec)
		}

		{
			let scalar = makeTextSign("",false,false,false)
			scalar.material.depthFunc = THREE.AlwaysDepth
			scalar.castShadow = true
			scalar.material.side = THREE.DoubleSide
			scalar.scale.multiplyScalar(0.3)
			multivec.add(scalar)

			thingsThatCanBeDragged.push(scalar)

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
			
			thingsThatCanBeDragged.push(vecMesh)

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

			thingsThatCanBeDragged.push(front)
			thingsThatCanBeDragged.push(back)

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
			thingsThatCanBeDragged.push(circle)
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

		for(let i = 0; i < thingsThatCanBeDragged.length; i++)
		{
			clickables.push(thingsThatCanBeDragged[i])
			thingsThatCanBeDragged[i].onClick = onClick
		}

		return multivec
	}
}