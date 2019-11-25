/*
	Generate a bunch that cover the gamut of the operation them randomly, combine them, that's interesting enough to show the folks

	The scalar is probably a line, probably horizontal

	You want people to make their own "toolboxes", starting them off with only the vectors
		Eg they make the bivectors

	Probably bivectors is interesting enough
	Show they can all be made from the 3 basis bivectors

	Bring two bivectors together, they snap

	Probably want circles to morph into parallelograms

	Want orthogonal

	Infinity - yellow
	1 - red
	0 - black
	-1 - green
	-Infinity - cyan

	So it's like the countdown numbers game, just tryna make stuff

	One problem is you can't put everything at the origin

	What the hell are summed bivectors?
	Trivector times bivector is presumably vector. 
	Trivector times trivector is presumably bivector.

	Ideally there's some way of showing how they get multiplied

	probably wanna grab and rotate all simultaneously

	Based on examples, you're trying to make a machine (equation) out of adds and multiplies
		that takes in a set of inputs and gives certain outputs
		And the relation is one that is, well, potentially useful, maybe appears IRL so can have ordinary meshes attached

	Aesthetics
		Want nice lighting ofc
		But mostly can think of stuff as being in the background. Leave that to a game engine?
		Some of the puzzles are real-world?

	This is about elegantly building up sophisticated things from minimal elements
	Levereging people's geometrical intuition
	It is about seeing mathematical structure in the world around you.
	GA is good because the things don't come out of nowhere, you see that they are emergent


	Send to
		Pontus
		Andy (both for "here is the model" and "here is a tool for thinking")
*/

let Multivector = null

function initWheelScene()
{
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
		multivec.setVector(hummingbird.position)
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

	let vectorRadius = .02
	let vectorGeometry = new THREE.CylinderBufferGeometry(0.,vectorRadius,1.,16,1,false);
	vectorGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.,.5,0.))

	let parallelogramGeometry = new THREE.OriginCorneredPlaneBufferGeometry(1.,1.)
	let circleGeometry = new THREE.CircleBufferGeometry(1.,32)

	let bivecMaterialFront = new THREE.MeshStandardMaterial({color:0xFF0000,transparent:true,opacity:.4,side:THREE.FrontSide})
	let bivecMaterialBack = new THREE.MeshStandardMaterial({color:0x0000FF,transparent:true,opacity:.4,side:THREE.BackSide})

	Multivector = function( startingPosition, elements )
	{
		let multivec = new THREE.Object3D();
		multivec.position.copy(startingPosition)
		scene.add(multivec)
		multivectors.push(multivec)

		if(elements === undefined)
		{
			multivec.elements = new Float32Array(8);
			for(let i = 0; i < multivec.elements.length; i++)
				multivec.elements[i] = 0.;
		}

		let scalar = makeTextSign("",false,false,false)
		scalar.material.depthTest = false
		scalar.scale.multiplyScalar(0.1)
		multivec.add(scalar)

		multivec.setParallelogram = function(a,b)
		{
			let bivecMesh = new THREE.Mesh(parallelogramGeometry, bivecMaterialFront);
			bivecMesh.castShadow = true
			bivecMesh.add(	new THREE.Mesh(parallelogramGeometry, bivecMaterialBack))
			bivecMesh.children[0].castShadow = true
			multivec.add(bivecMesh)

			bivecMesh.matrixAutoUpdate = false;
			a.toArray(bivecMesh.matrix.elements,0);
			b.toArray(bivecMesh.matrix.elements,4);

			clickables.push(bivecMesh)
			bivecMesh.onClick = onClick
		}
		multivec.setCircle = function()
		{
			if( multivec.elements[5] !== 0 && multivec.elements[6] !== 0 )
			{
				log("can't deal with ones out of plane yet", multivec.elements[5] !== 0, multivec.elements[6])
			}
			else
			{
				let circleRadius = .2;
				let circle = new THREE.Mesh(circleGeometry, bivecMaterialFront)
				circle.scale.setScalar(multivec.elements[4])
				multivec.add(circle)
			}
		}

		multivec.getVector = function(target)
		{
			target.set(multivec.elements[1],multivec.elements[2],multivec.elements[3])
			return target
		}
		multivec.setVector = function(newY)
		{
			if(newY===undefined)
			{
				newY = new THREE.Vector3()
				newY.x = multivec.elements[1]
				newY.y = multivec.elements[2]
				newY.z = multivec.elements[3]
			}
			else
			{
				multivec.elements[1] = newY.x
				multivec.elements[2] = newY.y
				multivec.elements[3] = newY.z
			}

			if(multivec.elements[1] === 0. && multivec.elements[2] === 0. && multivec.elements[3] === 0.)
				return

			var newX = randomPerpVector( newY ).normalize();
			var newZ = newY.clone().cross(newX).normalize().negate();

			let vecMesh = new THREE.Mesh( vectorGeometry, new THREE.MeshStandardMaterial() );
			vecMesh.castShadow = true
			multivec.add(vecMesh)
			
			vecMesh.matrix.makeBasis( newX, newY, newZ );
			vecMesh.matrixAutoUpdate = false;

			clickables.push(vecMesh)
			vecMesh.onClick = onClick
		}
		multivec.setVector();

		multivec.setScalar = function(newScalar)
		{
			if(newScalar === undefined)
			{
				newScalar = multivec.elements[0]
			}
			else
			{
				multivec.elements[0] = newScalar
			}
			scalar.material.setText(newScalar.toFixed(3).toString())
		}
		multivec.setScalar(multivec.elements[0]);

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
			let aGrade = multivecA.getGrade()
			let bGrade = multivecB.getGrade()

			if( aGrade === 1 && bGrade === 1 )
			{
				multivec.setParallelogram(multivecA.getVector(new THREE.Vector3()),multivecB.getVector(new THREE.Vector3()))
			}
			else
			{
				multivec.setCircle()
			}

			multivec.setScalar()
			multivec.setVector()
		}

		let clickedPoint = zeroVector.clone()
		updateFunctions.push(function()
		{
			if(!clickedPoint.equals(zeroVector))
			{
				let newClickedPoint = mouse.rayIntersectionWithZPlane(clickedPoint.z)
				multivec.position.sub(clickedPoint).add(newClickedPoint)
				clickedPoint.copy(newClickedPoint)

				if(!mouse.clicking)
				{
					clickedPoint.copy(zeroVector)

					for(let i = 0; i < multivectors.length; i++)
					{
						if( multivectors[i] !== multivec )
						{
							if( multivectors[i].position.distanceTo(multivec.position) < .2 )
							{
								let a = Multivector(new THREE.Vector3(-.6,0,0))
								a.geometricProductMultivectors(multivectors[i], multivec)
								log(a.getGrade())

								// let val = multivectors[i].getVector(new THREE.Vector3()).add(multivec.getVector(new THREE.Vector3()));
								// a.setVector(val)
							}
						}
					}
				}
			}
		})

		function onClick(intersection)
		{
			clickedPoint.copy(intersection.point)
		}

		clickables.push(scalar)
		scalar.onClick = onClick

		return multivec
	}

	Multivector(zeroVector)
	multivectors[0].setVector(yUnit.clone().multiplyScalar(.4))
	Multivector(new THREE.Vector3(.4,0))
	multivectors[1].setVector(xUnit.clone().multiplyScalar(.4))

	function geometricProduct(a,b,target)
	{
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

	log(geometricProduct(
		[2.,0.,0.,0.,0.,0.,0.,0.],
		[0.,3.,4.,5.,0.,0.,0.,0.],
		[]))

	updateFunctions.push(function()
	{
		// multivectors[1].setVector(new THREE.Vector3(.4,0,0).applyAxisAngle(zUnit,
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