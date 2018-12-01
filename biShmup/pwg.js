/*
	Extreme democratization: I am programming the game as you play it, but you can reprogram it, maybe even me

	The way you show things should be similar to the way you program them; otherwise illustrating how they were made is extra work

	Maybe don't open source this, lest people make demands of you. Better that they implement it better than you. Or hire you to do it well!

	The first purpose it serves is as the default "relationship between two objects transferrer". Eg between that sphere and slider
	The projectiles are the objects themselves

	If you have an "actual" object affected by "actual" things,
		have them be joined by a line (hanging wire?) to the variable whose visibility can be off or on. That part is declarative!

	Next focus on positions, and making animations
	
	Forget about the contents of object.geometry and material properties beyond color
		What that leaves for 3D objects is position, RGB, and local basis vectors.
		The object is not what you normally think, this is not the game itself.
			Its position is separate from it, and you update that. Then that updates it.
		the object is a set of triangles. It just gets the balls shot at at.
			And we don't imagine its matrix, that's for "the programmer", just like the assembly language
		"position" shooting its ball at it does the equivalent of "for each vertex, tak
		For a point, all you need is the position
		3D objects shouldn't be extraordinary. The rabbit has its data, the position/scale/rotation/color is a "transform".

	A gun is a single line of code? It comes into exi

	We do seem to think in terms of "variable contains value"
	If you WERE to visualize the whole thing at once, you could have things like "bring all stuff relevant to this close to me"

	The sphere is the generalized idea of the variable.
		It contains a value - true, false, number

	A function is an object of course. A couple of arguments attached, an output

	The DOTS in javascript representing object.property are lines

	"event driven programming"

	Make something then show Alan Kay

	Could show it to mathematica, they could give you a job
*/

//Press a button to enter “editor mode”. Only when that is triggered do you actually construct all the meshes necessary for this.
function initPwg()
{
	function DataAbstraction(value)
	{
		var radius = 0.05;
		var stickOnRadius = radius * 0.9;

		var dataAbstraction = new THREE.Mesh(new THREE.EfficientSphereGeometry(radius), new THREE.MeshPhongMaterial( { transparent:true, opacity: 0.6 } ) );
		dataAbstraction.material.color.setRGB(Math.random(),Math.random(),Math.random());
		dataAbstraction.value = value;

		var valueRepresentation = makeTextSign(dataAbstraction.value.toString())
		valueRepresentation.scale.multiplyScalar(radius/2)
		dataAbstraction.add(valueRepresentation)

		dataAbstraction.target = null;

		var barrelRadius = radius / 3;
		var barrelThickness = barrelRadius / 10;
		var barrelExtendTo = radius * 2;
		var barrelPoints = [
			new THREE.Vector2(barrelRadius-barrelThickness,stickOnRadius
				),
			new THREE.Vector2(barrelRadius,stickOnRadius
				),
			new THREE.Vector2(barrelRadius,barrelExtendTo),
			new THREE.Vector2(barrelRadius-barrelThickness,barrelExtendTo),
			new THREE.Vector2(barrelRadius-barrelThickness,stickOnRadius
				),
		];
		var barrel = new THREE.Mesh( new THREE.LatheGeometry( barrelPoints, 31 ), new THREE.MeshPhongMaterial( { color: 0x808080 } ) );
		barrel.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(TAU/4))
		dataAbstraction.add(barrel);

		var trumpetRadius = radius / 3;
		var trumpetThickness = trumpetRadius / 10;
		var trumpetExtendTo = radius * 2;
		var trumpetPoints = [];
		var neckRadius = barrelRadius;
		var fanningCenter = new THREE.Vector2(0.1,stickOnRadius)
		var fanFullAngle = ( barrelExtendTo - stickOnRadius ) / (fanningCenter.x-neckRadius);
		var numPoints = 14;
		for(var i = 0; i < numPoints; i++)
		{
			var newPoint = new THREE.Vector2(neckRadius,stickOnRadius,0);
			newPoint.rotateAround(fanningCenter, -i * fanFullAngle / numPoints);
			trumpetPoints.push(newPoint);
		}
		var trumpet = new THREE.Mesh( 
			new THREE.LatheGeometry( trumpetPoints, 31 ), 
			new THREE.MeshPhongMaterial( { color: 0x808080, 
			/*transparent:true, opacity:0.6 */ } ) );
		trumpet.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(TAU/4));
		trumpet.rotation.x = -TAU/4;
		dataAbstraction.add(trumpet)

		objectsToBeUpdated.push(dataAbstraction)

		dataAbstraction.update = function()
		{
			if(this.visible)
			{
				if(this.target !== null)
				{
					var targetPositionLocal = this.target.position.clone();
					this.worldToLocal(targetPositionLocal);
					barrel.lookAt(targetPositionLocal)
				}
				var cameraPositionLocal = camera.position.clone();
				this.worldToLocal(cameraPositionLocal);
				valueRepresentation.lookAt(cameraPositionLocal)
			}
		}

		return dataAbstraction;

		//A line connecting it to the visualization of its parent (if it has a visualization)
		//of course the only "real" objects in the scene are meshes, which are a geometry and a material
	}

	var dataAbstractionA = DataAbstraction(true);
	dataAbstractionA.position.set(-0.13,0,-0.5)
	scene.add(dataAbstractionA)

	var dataAbstractionB = DataAbstraction(false);
	dataAbstractionB.position.set(0.13,0,-0.5)
	scene.add(dataAbstractionB)

	dataAbstractionA.target = dataAbstractionB;

	//two trumpets one gun
	var multiplier = new THREE.Object3D();
	var adder = new THREE.Object3D();
	var pow = new THREE.Object3D();

	//one, one, can make the first three yourself
	var sqrt = new THREE.Object3D();
	var sin = new THREE.Object3D();
	var cos = new THREE.Object3D();
	var tan = new THREE.Object3D();
	var asin = new THREE.Object3D();
	var acos = new THREE.Object3D();
	var atan = new THREE.Object3D();

	//one trumpet on top of the other
	var divider = new THREE.Object3D(); 
	var subtractor = new THREE.Object3D();

	//0 trumpets, 1 gun
	var random = new THREE.Object3D();
	var frameStarter = new THREE.Object3D(); //aimed at the first object to be updated

	//Two trumpets but what comes out is a boolean. Construct others out of these. There's probably a compiler optimization for <= but it serves as a good example
	var conditional = new THREE.Object3D(); 
	var and = new THREE.Object3D(); 
	var or = new THREE.Object3D();
	var not = new THREE.Object3D();
	var equalTo = new THREE.Object3D(); 
	var greaterThan = new THREE.Object3D();
	var lessThan = new THREE.Object3D();

	//one trumpet in, an array. Three guns: loop body, index, onComplete
	var forLoop = new THREE.Object3D();

	//array goes in, number comes out 
	var min = new THREE.Object3D();
	var max = new THREE.Object3D();

	//to bootstrap: increment, decrement, absolute value, greaterThanOrEqualTo, lessThanOrEqualTo
}