/*
	TODO for slack / Cambridge demo
		More like a scripting environment / calculator
		make it so there are animations, so it is a good playground (and for your own understanding!)
		Some basic puzzle

		In a scripting-type situation you can still have more than one variable on screen

		So:
			You have your

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
		you want to put random things in the littlescene. That's how you make cool demoscene stuff
		Should be easy to make:
			the threejs demo with the parented cubes
			mandelbrot set
		Should be possible to model
			Dice with constant angular momentum spinning in zero gravity
			Some other real world footage
			Get in-plane component
			Make rotor from axis and angle

	Things that might have to change
		Line is there because if you change the parent you change the child. If you clone and there's no line, then what, is it a new object?
		Could have them stacked in a column, or around in a circle
		What if you have some things that are enormously larger than others? That's why we have zooming in and out. But some things keep size

	"Language"
		Should have good gamefeel, "the public" is the primary audience, yourself/GA users is secondary
			Functions as creatures that swallow and poop out
		Need copyable functions - LATER. MUCH CAN BE DONE MAKING JUST ONE FUNCTION. MORE LIKE EQUATIONS!
			Add and multiply are functions so should probably have same syntax
			The nice thing in comparison with other programming is that things get animated
			So you're making rectangles that wires go into
			You know those starting things? For a function, you must supply those and only those
		Inspiration
			programarbles
			dynamic diagrams
			blueprints
			Claude's thing
			Human Resource Machin
		How to represent variables
			Proooobably best for them to be immutable
			Wires or projectiles or falling programarbles, there's probably nothing else
			Serious mode is wires, fun mode is programarbles?
			Programarbles falling is nice. Arrows can go in any direction so harder to read. Natural "control flow"
				Programarbles has this "duplicate" thing. Fine. But with code you can refer to a variable in multiple places
		Could be more like Drawing Dynamic Visualizations, where you do stuff
			it's the difference between interactive scripting (which immediately gives you output) and writing into a text file
			Then you get a record of what you did
		You are NOT trying to make an arbitrary programming language as an end unto itself.
			You are trying to show what can be done with this data structure
			There are few things in scope
			There's only one kind of data
			Loops? urgh
		Try to bear in mind it might change =/ Work on level design!

	Justification
		This is about elegantly building up sophisticated things from minimal elements
		Levereging people's geometrical intuition
		It is about seeing mathematical structure in the world around you.
		GA is good because the things don't come out of nowhere, you see that they are emergent
			sin and cos come out of nowhere in your education too
		This is way better than Human Resource Machine, no symbols, things actually are what thtye represent
		Maybe this is even useful for you programming stuff?
			What the hell are summed bivectors?
			Trivector times bivector is presumably vector. 
			Trivector times trivector is presumably bivector.
		The idea of negative area and length is a nice balance of intuitive and surprising, and makes total sense in this context (no other?)
		You do want to model familiar, visible things in the real world, using this separate mathematical realm. That is applied maths.

	Aesthetics/non-design
		Names
			The Bivector
			The Beautiful bivector
			The Device
		Want nice lighting ofc
		But mostly can think of stuff as being in the background. Leave that to a game engine?
		Some of the puzzles are real-world?
		If it's all simple geometric shapes you can get explicit ray intersections -> good shadows etc

	Send to
		Pontus
		Andy Matushak (both for "here is the model" and "here is a tool for thinking")
		The slack
		Marc
		Jon/indie fund


	is there an elegant way to feed back into the scene?
	the "real" ones are frozen in place, when you click them they're cloned

	would be nice if there was something going on like 



	Yes it's top left. You can drag in a thing to multiply it by
	Thing goes underneath it

	Connection = "these things are the same", quite powerful and you probably need it anyway
	

	Do all equations have some order? No, you need to have multiple sources

	Ok you can pull stuff out, but it'll go somewhere automatically. Top 

	you have to put it somewhere though otherwise it disappears when you let go

	it's quite separate to pull something out of

	One possibility: you have your "multivector pot" - you can pull new (all 0) multivectors out, and dump away unneeded ones
	Well, "unneeded". If there's one floating in space it should be dumped immediately
	Making a new product creates one automatically
	Then you just set up connections

	Everything should move automatically in a nice way. Therefore moving one moves all. Therefore mov

	Can work backwards from the equals sign?


	If it's a root and it's clicked, duplicated, otherwise deleted
*/

function Connector(obj1,obj2)
{
	let connector = new THREE.Line(new THREE.Geometry(),new THREE.LineBasicMaterial({
		color:0x0F0FFF
	}))
	connector.geometry.vertices.push(new THREE.Vector3())
	connector.geometry.vertices.push(new THREE.Vector3(1.,1.,0.))
	scene.add(connector)

	updateFunctions.push(function()
	{
		obj1.getWorldPosition(connector.position)

		obj2.getWorldPosition(connector.scale)
		connector.scale.sub(connector.position)
		connector.scale.z = 1.
	})

	return connector
}

function initWheelScene()
{
	// let draggingMultivec = Multivector()

	// multivec.onClick = function()
	// {
	// 	//somehow draggingMultivec is made to take on multivec.elements
	// 	scene.add(draggingMultivec)

	// 	updateFunctions.push(function()
	// 	{
	// 		copy.position.copy(mouse.zZeroPosition)

	// 		if(!mouse.clicking)
	// 		{
	// 			scene.remove(draggingMultivec)

	// 			if() //there's some operation
	// 			{
	// 				let copy = Multivector(multivec.elements)
	// 				draggingMultivec
	// 			}
	// 		}
	// 	})
	// }

	function bestowConnectionPotential(obj, exchangeMultivectorValues,exchangeMultivectorValuesInitial)
	{
		clickables.push(obj)
		obj.onClick = function()
		{
			let multivec = Multivector()
			multivec.position.copy(mouse.zZeroPosition)

			if( exchangeMultivectorValuesInitial !== undefined )
				exchangeMultivectorValuesInitial(multivec)

			let connector = Connector(multivec,obj)
			scene.add(connector)
		}
	}

	let littleScene = new THREE.Object3D()
	littleScene.scale.setScalar(2)
	littleScene.position.y += 3.88
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
	hummingbird.material.depthTest = false
	new THREE.TextureLoader().load("data/hummingbird.png",function(texture){
		hummingbird.material.map = texture
		hummingbird.material.needsUpdate = true
	})
	littleScene.add(hummingbird)

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

	let placeStuckOnWheel = new THREE.Vector3(0.,wheelRadius*0.5,0.)

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

	littleScene.hummingbird = hummingbird

	return littleScene
}

async function initGeometricAlgebra()
{
	//when you bring a multivec over to a place WHERE ANOTHER MULTIVECTOR MAY BE FOUND IN FUTURE, we "run debug build" and break at the point where it would be there

	{
		var operatorSymbolGeometry = new THREE.PlaneGeometry(1.,1.)

		//The two things could come together inside the operation and the operation becomes the result. Then gets eaten.

		var operatorSymbolForConsidering = null
		var operatorSymbols = []

		//at first, people should just do the series of things. Only later do you get your visualization of what you did

		let operatorSymbolTexture = null
		let textureLoader = new THREE.TextureLoader();

		await new Promise(resolve => {
			textureLoader.load("data/squarePipe.png",function(texture)
			{
				operatorSymbolTexture = texture;
				resolve()
			})
		})

		let OperatorSymbol = function()
		{
			let operatorSymbol = new THREE.Mesh(operatorSymbolGeometry,new THREE.MeshBasicMaterial({
				map: operatorSymbolTexture,
				color: discreteViridis[0].hex,
				transparent:true
			}))

			operatorSymbols.push(operatorSymbol)

			return operatorSymbol
		}

		operatorSymbolForConsidering = OperatorSymbol()

		addOperatorOriginal = OperatorSymbol()

		rightMultiplyOperatorOriginal = OperatorSymbol()
		leftMultiplyOperatorOriginal = OperatorSymbol()

		let operatorOriginals = [addOperatorOriginal,rightMultiplyOperatorOriginal,leftMultiplyOperatorOriginal];

		for(let i = 0; i < operatorOriginals.length; ++i )
		{
			let o = operatorOriginals[i]

			o.material.color.setHex(discreteViridis[i].hex)

			o.rotation.z = TAU/8.

			o.position.y = -3.5
			o.position.x = (i-1) * 2.
			scene.add(o)

			clickables.push(o)
			o.onClick = function()
			{
				log("y")
			}
		}
	}

	let multivectors = []

	let vectorRadius = .07
	let vectorGeometry = new THREE.CylinderBufferGeometry(0.,vectorRadius,1.,16,1,false);
	vectorGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.,.5,0.))

	let parallelogramGeometry = new THREE.OriginCorneredPlaneBufferGeometry(1.,1.)
	let circleGeometry = new THREE.CircleBufferGeometry(1.,32)

	let bivecMaterialFront = new THREE.MeshStandardMaterial({color:0xFF0000,transparent:true,opacity:.4,side:THREE.FrontSide})
	let bivecMaterialBack = new THREE.MeshStandardMaterial({color:0x0000FF,transparent:true,opacity:.4,side:THREE.BackSide})

	function ConnectedMultivector(thingToConnectTo)
	{
		let newMultivec = Multivector(thingToConnectTo.elements)
		newMultivec.position.copy(mouse.zZeroPosition)
		newMultivec.root = thingToConnectTo

		mouse.lastClickedObject = newMultivec.children[0] // the scalar

		//this waits for when we're about making a record
		// let connector = Connector(newMultivec,thingToConnectTo)
		// newMultivec.connector = connector
		// scene.add(connector)
	}

	Multivector = function(elements)
	{
		let multivec = new THREE.Object3D();
		scene.add(multivec)
		multivectors.push(multivec)

		multivec.thingsThatCanBeDragged = []

		multivec.root = null
		multivec.connector = null

		//maaaaybe you shouldn't have this because it's stateful?
		if(elements === undefined)
			multivec.elements = new Float32Array(8);
		else
			multivec.elements = elements

		let onClick = function()
		{
			if( multivec.connector === null )
			{
				ConnectedMultivector(multivec)
			}
			else
			{
				//TODO delete aaaaaaaand remove from the array
				scene.remove(multivec)
				scene.remove(multivec.connector)
				removeSingleElementFromArray(multivectors,multivec)

				//and remove everything deriving from it? Or just don't do its operation?
			}
		}

		{
			let scalar = makeTextSign("",false,false,false)
			scalar.material.depthFunc = THREE.AlwaysDepth
			scalar.castShadow = true
			scalar.material.side = THREE.DoubleSide
			scalar.scale.multiplyScalar(0.3)
			multivec.add(scalar)

			scalar.onClick = onClick

			multivec.thingsThatCanBeDragged.push(scalar)

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

			vecMesh.onClick = onClick
			
			multivec.thingsThatCanBeDragged.push(vecMesh)

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

			front.onClick = onClick
			back.onClick = onClick

			multivec.thingsThatCanBeDragged.push(front)
			multivec.thingsThatCanBeDragged.push(back)

			multivec.setParallelogram = function(multivecA,multivecB)
			{
				parallelogram.visible = true
				circle.visible = false

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

			let circle = new THREE.Mesh(circleGeometry, bivecMaterialFront)
			multivec.add(circle)
			circle.visible = false
			multivec.setCircle = function()
			{
				parallelogram.visible = false
				circle.visible = true

				circle.scale.setScalar(multivec.elements[4])
				if(multivec.elements[5]!==0. || multivec.elements[6] !== 0.)
					log("not working yet")

				//Properly: convert to matrix I suppose
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
		multivec.addMultivectors = function(multivecA,multivecB)
		{
			geometricAdd(multivecA.elements,multivecB.elements,multivec.elements)

			multivec.updateScalarAppearance()
			multivec.updateVectorAppearance()
			multivec.setCircle()
		}

		for(let i = 0; i < multivec.thingsThatCanBeDragged.length; i++)
			clickables.push(multivec.thingsThatCanBeDragged[i])

		return multivec
	}

	//you may want to put stuff on the left or the right
	//Therefore, "result" needs to be able to switch to right or left
	//Therefore, little t-shaped things showing what results from what
	//There again, who says right- and left- multiplying is the right thing to do?
	//are left and right multiply the same as multiply by conjugate?

	Multivector()
	multivectors[0].setTo1Blade(yUnit.clone().multiplyScalar(1.))
	multivectors[0].position.x = -1.
	multivectors[0].root = multivectors[0]
	Multivector()
	multivectors[1].setTo1Blade(xUnit.clone().multiplyScalar(1.))
	multivectors[1].position.x = 1.
	multivectors[1].root = multivectors[1]

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

	// let indicator = new THREE.Mesh(new THREE.SphereGeometry(.2))
	// scene.add(indicator)

	updateFunctions.push(function()
	{
		// multivectors[1].updateVectorAppearance(new THREE.Vector3(.4,0,0).applyAxisAngle(zUnit,
		// 	.9//frameCount*.01
		// 	))

		if(mouse.clicking && mouse.lastClickedObject === null)
		{
			for(let i = 0; i < multivectors.length; i++)
			{
				multivectors[i].position.add(mouse.zZeroPosition).sub(mouse.oldZZeroPosition)
			}
			for(let i = 0; i < operatorSymbols.length; i++)
			{
				operatorSymbols[i].position.add(mouse.zZeroPosition).sub(mouse.oldZZeroPosition)
			}

			return
		}

		let multivec = null
		for(let i = 0; i < multivectors.length; i++)
		{
			if( (mouse.clicking||mouse.oldClicking) && multivectors[i].thingsThatCanBeDragged.indexOf(mouse.lastClickedObject) !== -1 )
			{
				multivec = multivectors[i]
			}
		}
		if(multivec === null)
			return

		multivec.position.add(mouse.zZeroPosition).sub(mouse.oldZZeroPosition)

		let closestObject = null
		let p = new THREE.Vector3()
		for(let i = 0; i < multivectors.length + 1; i++)
		{
			let thingToCheckDistanceTo = i < multivectors.length ? multivectors[i] : otherThingToCheckDistanceTo[i-multivectors.length]
			if( thingToCheckDistanceTo === multivec || thingToCheckDistanceTo === multivec.root)
				continue

			//no, don't want to check the ones we come from
			let dist = thingToCheckDistanceTo.getWorldPosition(p).distanceTo(multivec.position)

			if( (closestObject === null || dist < closestObject.position.distanceTo(multivec.position) ) )
			{
				closestObject = thingToCheckDistanceTo
			}
		}

		scene.remove(operatorSymbolForConsidering)

		if( multivectors.indexOf(closestObject) === -1 )
		{
			if(!mouse.clicking)
			{
				closestObject.position.x = multivec.elements[1]
				closestObject.position.y = multivec.elements[2]
				log(closestObject.position)

				scene.remove(multivec) //TODO and destroy
				scene.remove(multivec.connector)
				removeSingleElementFromArray(multivectors,multivec)

				Connector(closestObject,multivec.root)

				return;
			}
		}
		else
		{
			let multivectorToOperateOn = closestObject
			let placeWeWouldGo = multivectorToOperateOn.position.clone()
			placeWeWouldGo.x += 1.
			placeWeWouldGo.y -= 1.
			let dist = placeWeWouldGo.distanceTo(multivec.position)

			let operations = ["add","leftMultiply"] //wanna left multiply? move the other one
			let distances = [.5,.7]
			let operationIndex = -1

			for(let i = operations.length-1; i >= 0; --i)
			{
				if(dist < distances[i])
					operationIndex = i
			}

			if(operationIndex !== -1)
			{
				scene.add(operatorSymbolForConsidering)
				operatorSymbolForConsidering.position.copy(multivectorToOperateOn.position)
				operatorSymbolForConsidering.material.color.setHex(discreteViridis[operationIndex].hex)
				// operatorSymbolForConsidering.position.x += clearance;

				if(!mouse.clicking)
				{
					let newOperatorSymbol = OperatorSymbol()
					newOperatorSymbol.position.copy(operatorSymbolForConsidering.position)
					newOperatorSymbol.material.color.copy(operatorSymbolForConsidering.material.color)
					scene.remove(operatorSymbolForConsidering)
					scene.add(newOperatorSymbol)

					multivec.position.copy(multivectorToOperateOn.position)
					multivec.position.x += 1.;
					multivec.position.y -= 1.;

					//------

					let result = Multivector()

					if(operationIndex === operations.indexOf("add"))
						result.addMultivectors(multivectorToOperateOn, multivec)
					if(operationIndex === operations.indexOf("multiply"))
						result.geometricProductMultivectors(multivec, multivectorToOperateOn)

					result.position.copy( multivectorToOperateOn.position )
					result.position.y -= 2.;
					scene.add(result)

					//play animation

					return;
				}
			}
		}
		
		if( false /*mouse.clicking*/ )
		{
			let functionPlane = new THREE.Object3D()
			functionPlane.position.copy(multivec.position)
			functionPlane.position.x -= .5
			functionPlane.position.y += .5
			scene.add(functionPlane)

			let background = new THREE.Mesh(new THREE.PlaneGeometry(1.,1.), new THREE.MeshBasicMaterial({color:0x000000}))
			functionPlane.add(background)

			let spacing = 1.
			let numWide = 2.
			let numTall = 3.

			background.scale.set(numWide*spacing,numTall*spacing,0.)
			background.position.copy(background.scale).multiplyScalar(.5)
			background.position.y*= -1

			let grid = new THREE.LineSegments( new THREE.Geometry(), new THREE.MeshBasicMaterial({
				color:0x00FF00,
			}) )

			let verticalExtent = numTall/2*spacing
			let horizontalExtent = numWide/2*spacing
			for(let i = 0; i < numWide+1; i++)
			{
				let x = i*spacing
				grid.geometry.vertices.push(new THREE.Vector3(x,0.,0),new THREE.Vector3(x,-numTall*spacing,0))
			}
			for( let i = 0; i < numTall+1; i++)
			{
				let y =-i*spacing
				grid.geometry.vertices.push(new THREE.Vector3(0.,y,0),new THREE.Vector3(numWide*spacing,y,0))
			}

			functionPlane.add(grid)
		}

		//your actions you can understand. All the complexities of the circuit should just be a visual representation of them
	})

	var otherThingToCheckDistanceTo = []
	let littleScene = initWheelScene()
	otherThingToCheckDistanceTo.push(littleScene.hummingbird)
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