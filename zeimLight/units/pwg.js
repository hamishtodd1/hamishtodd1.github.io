/*
	Picture making functions. Eg closest point on plane to other point. You get the inputs, that is your start. Just picture reaching out and doing shit to them. Everything in scope you have a list of in the order it gets created. And a bunch of tools on your panel from which you pick dot product, bivector, etc

	Making vertex shades is the perfect thing for this. Maybe try making that stack of cubes with infinite area but finite volume

	Frame by frame updating with balls shut back and forth. Sped up into blur


	Lots of functions, each a black box. Click on the black box and you see what it does with inputs and outputs as an animation. You can do chalk talk style concatenation with arrows. Then all the animations can be compiled into one.

	Drawing in phase space might go a long way. It's a wide input space and it defines a relationship between two variables.

	Normal code is like a notebook, sequential. This can be like a canvas

	Probably you do want things executing in some direction. Time is down, as in programarbles

	Any equation can be animated. It'll be constructing those animations with your hand

	The main point of this is to make something that visualizes how your shit works, show it to the audience, and it's not code, all geometrical
		The way you show things should be similar to the way you program them; otherwise illustrating how they were made is extra work
	Another point is to let you make geometries with specific behaviour
		You want to be able to do things gesturally, at runtime, changing values
		Could just use a 3D software package

	Possibly there could be some type inference, you do something vague like conenct one object to another and it works out based on types what you want. Kiiiinda like at text editor

	Would *like* the bret thing of changing initial conditions and having it simulate forward with the same input you just gave to get to current position

	The only "real" objects in the scene are meshes, which are a geometry and a material
		How do they actually interact?
		A line connecting a property to its object (if it has a visualization)
			The dots eg object.property in javascript
			No, nothing extra to add here, because that is the point - if you want to see what it affects, see it do things
			Or maybe this is a good idea? Don't want the object itself minimized to be in those balls

	A position as a set of three arrow lengths, like in eugene kutoryansky
		It's always there, sitting on the tip of the last arrow
	
	Forget about the contents of object.geometry and material properties beyond color
		What that leaves for 3D objects is the matrix and RGB
		The object is not what you normally think, this is not the game itself.
			Its position is separate from it, and you update that. Then that updates it.
		the object is a set of triangles. It just gets the balls shot at at.
			And we don't imagine its matrix, that's for "the programmer", like assembly language

	"position" shooting its ball at it could do the equivalent of applyMatrix(makeTranslation)

	TODO
		Focus on positions, and making animations
		Want to snap to the nearest receptacle
			Receptacles should be made by clicking empty space
		The location of the things should be decided automatically =/ moving shit around in blueprints was bad, like indenting
*/

function initPwg()
{
	// primitiveValueRepresentations.number = new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xFF0000}))
	//tanh(actual value) is what you want
	//or maybe the symbols are wanted

	let editingMode = true
	dataAbstractions = []
	bindButton("space",function()
	{
		editingMode = !editingMode
		for(let i = 0; i < dataAbstractions.length; i++)
		{
			dataAbstractions[i].visible = editingMode
		}
	},"editor mode")

	let radius = 0.1;
	let stickOnRadius = radius * 0.9;
	let barrelRadius = radius / 3;
	{
		let barrelThickness = barrelRadius / 10;
		let barrelExtendTo = radius * 2;
		let barrelPoints = [
			new THREE.Vector2(barrelRadius-barrelThickness,stickOnRadius
				),
			new THREE.Vector2(barrelRadius,stickOnRadius
				),
			new THREE.Vector2(barrelRadius,barrelExtendTo),
			new THREE.Vector2(barrelRadius-barrelThickness,barrelExtendTo),
			new THREE.Vector2(barrelRadius-barrelThickness,stickOnRadius
				),
		];
		var barrelGeometry = new THREE.LatheGeometry( barrelPoints, 31 )
		barrelGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(TAU/4))
	}

	let booleanGeometry = new THREE.BoxGeometry(radius/2,radius/2,radius/2)

	{
		let trumpetRadius = radius / 3;
		let trumpetThickness = trumpetRadius / 10;
		let trumpetPoints = [];
		let neckRadius = barrelRadius;
		let fanningCenter = new THREE.Vector2(radius*2,stickOnRadius)
		let fanFullAngle = 0.65;
		let numPoints = 14;
		for(let i = 0; i < numPoints; i++)
		{
			let newPoint = new THREE.Vector2(neckRadius,stickOnRadius,0);
			newPoint.rotateAround(fanningCenter, -i * fanFullAngle / numPoints);
			trumpetPoints.push(newPoint);
		}
		var trumpetGeometry  = new THREE.LatheGeometry( trumpetPoints, 31 )
		trumpetGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(TAU/4));
	}

	function DataAbstraction(value)
	{
		let dataAbstraction = new THREE.Mesh(new THREE.EfficientSphereGeometry(radius), new THREE.MeshPhongMaterial( { transparent:true, opacity: 0.6 } ) );

		let type = typeof value;
		dataAbstraction.type = type
		if(type === "object")
		{
			if( THREE.Vector3.prototype.isPrototypeOf(value) )
			{
				//put it in there, right? But shouldn't it stay in place? =/ maybe have a little represenation of the scene?
			}
			else if( THREE.Object3D.prototype.isPrototypeOf(value) )
			{
				//again little version of the scene?
			}
			else if( THREE.Quaternion.prototype.isPrototypeOf(value) )
			{
				//er, the object that it is a quaternion of in that orientation?
				//if it has no assigned object use the stanford teapot
				//Only works in VR
			}
			else
			{
				//text I guess?
			}
		}

		console.assert(type === "boolean")
		{
			dataAbstraction.valueRepresentation = new THREE.Mesh( booleanGeometry )
			dataAbstraction.add(dataAbstraction.valueRepresentation)

			dataAbstraction.setValue = function(newValue)
			{
				dataAbstraction.valueRepresentation.material.color.setHex( newValue ? 0xFFFFFF : 0x000000 )
			}
			dataAbstraction.setValue(value)

			dataAbstraction.getValue = function()
			{
				return dataAbstraction.valueRepresentation.material.color.r === 1.0 && dataAbstraction.valueRepresentation.material.color.g === 1.0 && dataAbstraction.valueRepresentation.material.color.b === 1.0;
			}
		}

		dataAbstraction.target = null;
		dataAbstraction.setTarget = function(newTarget)
		{
			if(newTarget.type !== type)
			{
				console.error("Type error")
				return
			}
			target = newTarget
		}

		let barrel = new THREE.Mesh( barrelGeometry, new THREE.MeshPhongMaterial( { color: 0x808080 } ) );
		dataAbstraction.add( barrel );

		let trumpet = new THREE.Mesh( trumpetGeometry, 
			new THREE.MeshPhongMaterial( { 
				color: 0x808080, 
				/*transparent:true, opacity:0.6 */ 
			} ) );
		trumpet.rotation.x = -TAU/4;
		dataAbstraction.add(trumpet)

		updateFunctions.push(function()
		{
			if(dataAbstraction.visible)
			{
				if(dataAbstraction.target !== null)
				{
					let targetPositionLocal = dataAbstraction.target.position.clone();
					dataAbstraction.worldToLocal(targetPositionLocal);
					barrel.lookAt(targetPositionLocal)
				}

				let cameraPositionLocal = camera.position.clone();
				dataAbstraction.worldToLocal(cameraPositionLocal);
				dataAbstraction.valueRepresentation.lookAt(cameraPositionLocal)
			}

			//definitely happenning in wrong order
			if( dataAbstraction.target !== null )
			{
				dataAbstraction.target.setValue(value)
			}
		})

		return dataAbstraction;
	}

	let dataAbstractionA = DataAbstraction(true);
	dataAbstractionA.position.set(-0.5,0,-0.5)
	scene.add(dataAbstractionA)

	let dataAbstractionB = DataAbstraction(false);
	dataAbstractionB.position.set(0.5,0,-0.5)
	scene.add(dataAbstractionB)

	dataAbstractionA.target = dataAbstractionB;

	dataAbstractions.push(dataAbstractionA,dataAbstractionB)

	let actualObject = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.2,0.3), new THREE.MeshPhongMaterial({color:0xFF0000}))
	actualObject.position.y = -0.3
	scene.add(actualObject)

	return;

	//two trumpets one gun
	let multiplier = new THREE.Object3D();
	let adder = new THREE.Object3D();
	let pow = new THREE.Object3D();

	//one, one, can make the first three yourself
	let sqrt = new THREE.Object3D();
	let sin = new THREE.Object3D();
	let cos = new THREE.Object3D();
	let tan = new THREE.Object3D();
	let asin = new THREE.Object3D();
	let acos = new THREE.Object3D();
	let atan = new THREE.Object3D();

	//one trumpet on top of the other because that's the convention (there's no logic to it probably)
	let divider = new THREE.Object3D(); 
	let subtractor = new THREE.Object3D();

	//0 trumpets, 1 gun
	let random = new THREE.Object3D();
	let frameStarter = new THREE.Object3D(); //aimed at the first object to be updated

	//Two trumpets but what comes out is a boolean. Construct others out of these. There's probably a compiler optimization for <= but it serves as a good example
	let conditional = new THREE.Object3D(); 
	let and = new THREE.Object3D(); 
	let or = new THREE.Object3D();
	let not = new THREE.Object3D();
	let equalTo = new THREE.Object3D(); 
	let greaterThan = new THREE.Object3D();
	let lessThan = new THREE.Object3D();

	//one trumpet in, an array. Three guns: loop body, index, onComplete
	let forLoop = new THREE.Object3D();

	//array goes in, number comes out 
	let min = new THREE.Object3D();
	let max = new THREE.Object3D();

	//to bootstrap: increment, decrement, absolute value, greaterThanOrEqualTo, lessThanOrEqualTo
}