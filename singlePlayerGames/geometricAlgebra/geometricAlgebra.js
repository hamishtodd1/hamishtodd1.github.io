/*
	TODO
		Grab and move it around: everything else comes with it
		Grab it with two fingers (right mouse button? ctrl+click?) and pull apart to make a free-moving clone which is connected by a line
		
		Scalar is a line instead? =/ an opacity?
		Should be able to make the alg even as things move
		In the playground you probably want a slidey scalar / number that counts up and up until you click it
			And maybe a vector or orthonormal basis you can play around with?
		Wanna grab and rotate the whole scene
			Hmm, nice unity: rotating the basis vectors rotates eeeeverything
		Every aspect of the multiplication and addition needs to be visualized
			Probably want circles to morph into parallelograms
			Bring two bivectors together, they snap

	Ideas
		This could be your AR-modelling-from-footage thing. Make it AR.
		Functions that you may want to create:
			Get in-plane component
			Make rotor from axis and angle
		Analogies: balloons, which can be inflated, or deflated all the way to the point that they are turned inside out ("negative volume")
		Squishy bubbles in wallpaper. Can move bubbles around in the same plane and add them.

	Things that might have to change
		Line is there because if you change the parent you change the child. If you clone and there's no line, then what, is it a new object?
		Could have them stacked in a column, or around in a circle

	Justification
		This is about elegantly building up sophisticated things from minimal elements
		Levereging people's geometrical intuition
		It is about seeing mathematical structure in the world around you.
		GA is good because the things don't come out of nowhere, you see that they are emergent
		This is way better than Human Resource Machine, no symbols, things actually are what thtye represent
		Maybe this is even useful for you programming stuff?
			What the hell are summed bivectors?
			Trivector times bivector is presumably vector. 
			Trivector times trivector is presumably bivector.
		The idea of negative area and length is a nice balance of intuitive and surprising, and makes total sense in this context (no other?)

	Aesthetics/non-design
		Names
			Bivector
			The beautiful bivector
			The Device
		Want nice lighting ofc
		But mostly can think of stuff as being in the background. Leave that to a game engine?
		Some of the puzzles are real-world?

	Send to
		Pontus
		Andy Matushak (both for "here is the model" and "here is a tool for thinking")
		The slack
		Marc
		Jon/indie fund
*/

function initWheelScene()
{
	//is there an elegant way to feed back into the scene?
	//the "real" ones are frozen in place, when you click them they're cloned

	//you have to put it somewhere though otherwise it disappears when you let go

	function bestowConnectionPotential(obj, exchangeMultivectorValues,exchangeMultivectorValuesInitial)
	{
		clickables.push(obj)
		obj.onClick = function()
		{
			let multivec = Multivector(new THREE.Vector3())
			multivec.position.copy(mouse.zZeroPosition)

			let connector = new THREE.Line(new THREE.Geometry(),new THREE.LineBasicMaterial({
				color:0x0F0FFF
			}))
			connector.geometry.vertices.push(new THREE.Vector3())
			connector.geometry.vertices.push(new THREE.Vector3(1.,1.,0.))
			scene.add(connector)

			if( exchangeMultivectorValuesInitial !== undefined )
				exchangeMultivectorValuesInitial(multivec)

			updateFunctions.push(function()
			{
				exchangeMultivectorValues(multivec)
				connector.position.copy(obj.position)
				littleScene.localToWorld(connector.position)

				connector.scale.copy(multivec.position).sub(connector.position)
				connector.scale.z = 1.
			})
		}
	}

	let littleScene = new THREE.Object3D()
	littleScene.scale.setScalar(.7)
	littleScene.position.y += .65
	scene.add(littleScene)

	let background = new THREE.Mesh(new THREE.PlaneGeometry(2.5,.9), new THREE.MeshBasicMaterial({color:0x00AAAA}))
	background.position.z -= .01
	littleScene.add(background)

	let muddyTrail = new THREE.Mesh(new THREE.OriginCorneredPlaneBufferGeometry(),new THREE.MeshBasicMaterial({color:0x65370E}))
	muddyTrail.scale.y = .035
	muddyTrail.scale.x = .001
	littleScene.add(muddyTrail)
	muddyTrail.position.x -= .9
	muddyTrail.position.y -= .37

	// littleScene.visible = false

	bestowConnectionPotential(muddyTrail,function(multivec)
	{
		multivec.setScalar(muddyTrail.scale.x)
	} )

	let wheelRadius = .11
	let wheel = new THREE.Mesh(new THREE.PlaneGeometry(wheelRadius*6*2.,wheelRadius*6*2.),new THREE.MeshBasicMaterial({transparent:true}))
	new THREE.TextureLoader().load("data/wheel.png",function(texture){
		wheel.material.map = texture
		wheel.material.needsUpdate = true
	})
	wheel.position.copy(muddyTrail.position)
	wheel.position.y += wheelRadius
	littleScene.add(wheel)

	//https://imgbin.com/png/gNnWnJyC/clown-unicycle-png
	let clown = new THREE.Mesh(new THREE.PlaneGeometry(wheelRadius*6*2.,wheelRadius*6*2.),new THREE.MeshBasicMaterial({transparent:true}))
	new THREE.TextureLoader().load("data/clown.png",function(texture){
		clown.material.map = texture
		clown.material.needsUpdate = true
	})
	littleScene.add(clown)

	let flowerRadius = wheelRadius * .5
	let flower = new THREE.Mesh(new THREE.PlaneGeometry(flowerRadius*2.,flowerRadius*2.),new THREE.MeshBasicMaterial({transparent:true}))
	new THREE.TextureLoader().load("data/flower.png",function(texture){
		flower.material.map = texture
		flower.material.needsUpdate = true
	})
	littleScene.add(flower)

	let hummingbirdRadius = flowerRadius * 3.
	let hummingbird = new THREE.Mesh(new THREE.PlaneGeometry(hummingbirdRadius*2.,hummingbirdRadius*2.),new THREE.MeshBasicMaterial({transparent:true}))
	hummingbird.position.set(.1,.1,0.)
	new THREE.TextureLoader().load("data/hummingbird.png",function(texture){
		hummingbird.material.map = texture
		hummingbird.material.needsUpdate = true
	})
	littleScene.add(hummingbird)

	bestowConnectionPotential(hummingbird,function(multivec)
	{
		hummingbird.position.x = multivec.elements[1]
		hummingbird.position.y = multivec.elements[2]
	},function(multivec)
	{
		multivec.updateVectorAppearance(hummingbird.position)
	} )

	//the basis vectors should be inside the scene

	// {
	//	let s = new THREE.Scene()
	
	// 	var texture = new THREE.DataTexture( data, renderer.domElement.width, renderer.domElement.height, THREE.RGBFormat );
	// 	texture.minFilter = THREE.LinearFilter;
	// 	texture.magFilter = THREE.LinearFilter;

	// 	let displayPlane = new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:texture}))
	// 	displayPlane.scale.y = .4;
	// 	displayPlane.scale.x = camera.aspect * displayPlane.scale.y;
	// 	scene.add(displayPlane)

	//	renderer.render( s, camera );
	// }

	let placeStuckOnWheel = new THREE.Vector3(wheelRadius*0.5,0,0)

	let playing = false

	clickables.push(background)
	background.onClick = function()
	{
		if(playing === false)
		{
			playing = true
			wheel.position.x = muddyTrail.position.x
		}
	}

	{	
		let signSize = .14

		var winSign = makeTextSign("Yum!",false,false,true)
		winSign.scale.multiplyScalar(signSize)
		littleScene.add(winSign)
		winSign.depthTest
		winSign.visible = false

		var loseSign = makeTextSign("I'm thirsty!",false,false,true)
		loseSign.scale.multiplyScalar(signSize)
		littleScene.add(loseSign)
		loseSign.depthTest
		loseSign.visible = false
	}

	updateFunctions.push( function()
	{
		{
			if(wheel.position.x > -muddyTrail.position.x)
			{
				playing = false
			}

			let rotationAmount = 0.;
			if(playing)
			{
				rotationAmount += .04
			}
			wheel.rotation.z -= rotationAmount
			let arcLength = rotationAmount * wheelRadius
			wheel.position.x += arcLength
			wheel.updateMatrix()

			flower.position.copy(placeStuckOnWheel)
			flower.rotation.copy(wheel.rotation)
			flower.position.applyMatrix4(wheel.matrix)

			muddyTrail.scale.x = wheel.position.x - muddyTrail.position.x
			muddyTrail.visible = muddyTrail.scale.x !== 0.

			clown.position.copy(wheel.position)

			//DEBUG
			// hummingbird.position.copy(flower.position)

			if(hummingbird.position.distanceTo(flower.position) > .03)
			{
				loseSign.visible = true
				loseSign.position.copy(hummingbird.position)
				hummingbird.material.color.b = Math.sin(frameCount*.1)
				hummingbird.material.color.g = hummingbird.material.color.b
			}
			else
			{
				if(loseSign.visible === false)
				{
					winSign.visible = true
					winSign.position.copy(hummingbird.position)
					winSign.material.color.r = Math.sin(frameCount*.1)
					winSign.material.color.b = Math.sin(frameCount*.1)
				}
			}
		}
	})
}

function initGeometricAlgebra()
{
	// initWheelScene()

	let multivectors = []

	let vectorRadius = .07
	let vectorGeometry = new THREE.CylinderBufferGeometry(0.,vectorRadius,1.,16,1,false);
	vectorGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.,.5,0.))

	let parallelogramGeometry = new THREE.OriginCorneredPlaneBufferGeometry(1.,1.)
	let circleGeometry = new THREE.CircleBufferGeometry(1.,32)

	let bivecMaterialFront = new THREE.MeshStandardMaterial({color:0xFF0000,transparent:true,opacity:.4,side:THREE.FrontSide})
	let bivecMaterialBack = new THREE.MeshStandardMaterial({color:0x0000FF,transparent:true,opacity:.4,side:THREE.BackSide})

	Multivector = function()
	{
		let multivec = new THREE.Object3D();
		scene.add(multivec)
		multivectors.push(multivec)

		//maaaaybe you shouldn't have this because it's stateful?
		multivec.elements = new Float32Array(8);

		function onClick(intersection)
		{
			clickedPoint.copy(intersection.point)
		}

		{
			let scalar = makeTextSign("",false,false,false)
			scalar.material.depthTest = false
			scalar.castShadow = true
			scalar.material.side = THREE.DoubleSide
			scalar.scale.multiplyScalar(0.3)
			multivec.add(scalar)

			clickables.push(scalar)
			scalar.onClick = onClick

			multivec.setScalar = function(newScalar)
			{
				multivec.elements[0] = newScalar
				multivec.updateScalarAppearance()
			}
			multivec.updateScalarAppearance = function(newScalar)
			{
				scalar.material.setText(multivec.elements[0].toFixed(1))
			}
			multivec.updateScalarAppearance()
		}

		{
			let vecMesh = new THREE.Mesh( vectorGeometry, new THREE.MeshStandardMaterial() );
			vecMesh.matrixAutoUpdate = false;
			vecMesh.castShadow = true
			multivec.add(vecMesh)
			
			clickables.push(vecMesh)
			vecMesh.onClick = onClick

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

				vecMesh.visible = (vecMesh.matrix.determinant() !== 0. )
			}
			multivec.updateVectorAppearance();
		}

		{
			let parallelogram = new THREE.Object3D()
			let front = new THREE.Mesh(parallelogramGeometry, bivecMaterialFront);
			front.castShadow = true
			let back = new THREE.Mesh(parallelogramGeometry, bivecMaterialBack)
			back.castShadow = true

			//TODO THIS IS NOT WORKING, THE BACK IS NOT SHOWING IN THE CASE WHERE IT'S NEGATIVE

			multivec.add(parallelogram)

			parallelogram.add(front,back)
			parallelogram.matrix.elements[0] = .0001
			parallelogram.matrix.elements[5] = .0001
			parallelogram.matrixAutoUpdate = false;

			clickables.push(front)
			front.onClick = onClick
			clickables.push(back)
			back.onClick = onClick

			multivec.setParallelogram = function(multivecA,multivecB)
			{
				parallelogram.visible = true

				let a = multivecA.elements
				let b = multivecB.elements

				parallelogram.matrix.set(
					a[1], b[1], 0., (a[1] + b[1]) / -2.,
					a[2], b[2], 0., (a[2] + b[2]) / -2.,
					a[3], b[3], 1., (a[3] + b[3]) / -2.,
					0.,0.,0.,1.
					)

				parallelogram.visible = (parallelogram.matrix.determinant() !== 0. )

				//TODO is it the case that when it goes around the para gets "turned inside out"?

			}

			multivec.setCircle = function()
			{
				// parallelogram.visible = false

				// let circle = new THREE.Mesh(circleGeometry, bivecMaterialFront)
				// circle.scale.setScalar(multivec.elements[4])
				// multivec.add(circle)

				// //convert to matrix I suppose
				// randomPerpVector(zAxis)
			}
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

		let clickedPoint = zeroVector.clone()
		updateFunctions.push(function()
		{
			if(!clickedPoint.equals(zeroVector))
			{
				let newClickedPoint = mouse.rayIntersectionWithZPlane(clickedPoint.z)
				multivec.position.sub(clickedPoint).add(newClickedPoint)
				clickedPoint.copy(newClickedPoint)

				for(let i = 0; i < multivectors.length; i++)
				{
					if( multivectors[i] === multivec )
						continue
					
					if( multivectors[i].position.distanceTo(multivec.position) < 1.2 )
					{
						//symbol goes here

						symbol.position.copy( multivec.position).lerp(multivectors[i].position,.5)

						let onscreenDisplacement = new THREE.Vector2().copy(multivectors[i].position).sub(multivec.position)
						let intendedZRotation = onscreenDisplacement.angle()
						if( multivectors[i].position.distanceTo(multivec.position) < .8 )
						{
							intendedZRotation += TAU/8.
							symbol.material.color.r = 1.
						}
						else
						{
							symbol.material.color.r = 0.
						}
						symbol.rotation.z = intendedZRotation

						if(!mouse.clicking)
						{
							let a = Multivector()
							a.position.set(-.6,0,0)
							a.geometricProductMultivectors(multivectors[i], multivec)

							log("y")

							break;
						}
					}
				}
			}

			if(!mouse.clicking)
				clickedPoint.copy(zeroVector)
		})

		return multivec
	}

	let symbol = new THREE.Mesh(new THREE.PlaneGeometry(.3,.06),new THREE.MeshBasicMaterial({color:0x0F0FFF}))
	symbol.geometry.merge(new THREE.PlaneGeometry(.06,.3))
	scene.add(symbol)

	Multivector()
	multivectors[0].setTo1Blade(yUnit.clone().multiplyScalar(1.))
	Multivector()
	multivectors[1].setTo1Blade(xUnit.clone().multiplyScalar(1.))
	multivectors[1].position.set(1.,0.,0.)

	function geometricProduct(a,b,target)
	{
		//from ganja.js

		target[0]=b[0]*a[0]+b[1]*a[1]+b[2]*a[2]+b[3]*a[3]-b[4]*a[4]-b[5]*a[5]-b[6]*a[6]-b[7]*a[7];

		target[1]=b[1]*a[0]+b[0]*a[1]-b[4]*a[2]-b[5]*a[3]+b[2]*a[4]+b[3]*a[5]-b[7]*a[6]-b[6]*a[7];
		target[2]=b[2]*a[0]+b[4]*a[1]+b[0]*a[2]-b[6]*a[3]-b[1]*a[4]+b[7]*a[5]+b[3]*a[6]+b[5]*a[7];
		target[3]=b[3]*a[0]+b[5]*a[1]+b[6]*a[2]+b[0]*a[3]-b[7]*a[4]-b[1]*a[5]-b[2]*a[6]-b[4]*a[7];

		target[4]=b[4]*a[0]+b[2]*a[1]-b[1]*a[2]+b[7]*a[3]+b[0]*a[4]-b[6]*a[5]+b[5]*a[6]+b[3]*a[7];
		target[5]=b[5]*a[0]+b[3]*a[1]-b[7]*a[2]-b[1]*a[3]+b[6]*a[4]+b[0]*a[5]-b[4]*a[6]-b[2]*a[7];
		target[6]=b[6]*a[0]+b[7]*a[1]+b[3]*a[2]-b[2]*a[3]-b[5]*a[4]+b[4]*a[5]+b[0]*a[6]+b[1]*a[7];

		target[7]=b[7]*a[0]+b[6]*a[1]-b[5]*a[2]+b[4]*a[3]+b[3]*a[4]-b[2]*a[5]+b[1]*a[6]+b[0]*a[7];

		log(target)

		return target;
	}
	function geometricAdd(a,b,target)
	{
		for(let i = 0; i < target.length; i++)
			target[i] = a[i] + b[i];

		return target;
	}

	updateFunctions.push(function()
	{
		// multivectors[1].updateVectorAppearance(new THREE.Vector3(.4,0,0).applyAxisAngle(zUnit,
		// 	.9//frameCount*.01
		// 	))
	})
}

function NO_initGeometricAlgebra()
{
	let multivector = new THREE.Group()
	scene.add(multivector)

	let vector = new THREE.Group()
	let vectorRadius = 0.1
	let body = new THREE.Mesh(CylinderBufferGeometryUncentered(vectorRadius, 1, 32, true),new THREE.MeshLambertMaterial())
	// let bottom = new THREE.Mesh(new THREE.CircleBufferGeometry(1,32),new THREE.MeshLambertMaterial({color:0xC84D58}))
	vector.add(body)
	vector.scale.multiplyScalar(0.2)
	multivector.add(vector)
	let arrowHeadGeometry = null
	{
		let arrowHeadHeight = nodeRadius * 2
		arrowHeadGeometry = new THREE.CylinderBufferGeometry(0,vectorRadius*2,arrowHeadHeight,12)
		arrowHeadGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-arrowHeadHeight/2,0))
	}

	let biVector = new THREE.Group()
	let top = new THREE.Mesh(new THREE.CircleBufferGeometry(1,32),new THREE.MeshLambertMaterial({color:0x484369}))
	let bottom = new THREE.Mesh(new THREE.CircleBufferGeometry(1,32),new THREE.MeshLambertMaterial({color:0xC84D58}))
	biVector.add(top,bottom)
	biVector.scale.multiplyScalar(0.2)
	multivector.add(biVector)

	let triVector = new THREE.Group()
	let triVectorGeo = new THREE.BoxBufferGeometry(1,1,1)
	let outer = new THREE.Mesh(triVectorGeo,new THREE.MeshLambertMaterial({color:0x9A2D73, transparent:true, opacity:0.8}))
	let inner = new THREE.Mesh(triVectorGeo,new THREE.MeshLambertMaterial({color:0xF1C54A, side:THREE.BackSide}))
	triVector.add(inner)
	triVector.scale.multiplyScalar(0.5)
	multivector.add(triVector)

	let scalar = makeTextSign("3")
	console.log(scalar)
	scalar.children[0].material.depthTest = false
	scalar.children[1].material.depthTest = false
	scalar.scale.multiplyScalar(0.1)
	multivector.add(scalar)


	//you take the wedge of them which gives you a multivector, and the dot of them which gives you a scalar

	updateFunctions.push(function()
	{
		if(mouse.lastClickedObject === null)
		{
			mouse.rotateObjectByGesture(vector)
			mouse.rotateObjectByGesture(biVector)
			mouse.rotateObjectByGesture(triVector)
		}
	})
}