/*
	Speeds
		Top speed is "normal game mode"!
		Next one down is “one object at a time”, maybe even press to advance
		Then "one line/assignment at a time"
		Then you're controlling the speed of the gumball animation
		Do it with proper parabolas so they aim down a bit when you increase the speed
	You also want Bret Victor time extrusion. But that's over many frames
	A tool you have with you always is "time along frame", the equivalent of the scrollbar in a text editor

	"popping": a variable has been changed, the ball gets flung back to... hmm there needs to be memory.
		Well, something which flung a ball needs to be aware of when there's nothing left to be done
		If everything CAN be done with onchangecallbacks, then the only time that needs to happen is when the frame is done
		But probably there are smaller "pops" you need to do

	Names are bad - if you detach the name and think of "the variable that has this behavior" it is better

	Like you're going to have so much like this anyway, and you were going to have "intermediate render" debugging anyway

	Need to encapsulate it, that's what might make this useful for cootVR and other software, the possibility

	Returning control flow to the gun that fired... is not a problem. You just stop the behaviour

	To debug a particular behavior, you could... show a "frame" ("set of states of the objects"

	From blueprints
		Drag out of the gun without dragging into a thing "creates a new variable"
		You probably need to collect up behaviour and title it. Necessary though, if you have clever hiding and revealing?

	There may well be times in zeim when you want two things to communicate, this could work perfectly well as a generic way to represent that

	Probably do want to separate behaviour you've written into reusable "functions". Instead of having names though, they have shapes

	The "main loop" is an object. Maybe you do just have to position things within it, oh well! Or we'll say that for the time being, maybe "onVariableChange" will handle all.
	
	How to say “I want the reception of this ball to cause the shooting of this ball”?
		Ehhhh… that’s not how it’s working… the programming is not “function triggers function” (it isn’t in javascript either) it’s “we are reassigning the color of a pixel here”.
		Order has to be worked out sorta separately… But you deffo want “shoot at this thing conditional on THIS”.
	Hmm, the way updating normally works in super complex games is such that in principle,
		something that looked to be “right at the end” could still go another way and cause a huge number of updates to other objects.
		This is what you were about to start struggling with with everything’s separate “update” being a constraint. So, “things shoot until they’re all done”?
	"onScaleChange" is a thing. This is kinda concurrent then. Eeeeverything being done with the equivalent of onScaleChange?
	If you have to resort to a menu, there's no point in this, because ordering it would precisely be programming :P

	Receptacles are trumpet shaped and if you shoot into one with one already there then the previous one falls out. The trumpet and the gun are attached
	Can contain a "pointer"? Problematic because the object is actually there in the world. Only alternative is sending all its data? Not so bad maybe...
		or hey, wouldn't a pointer be "the behaviour of guns POINTING towards these things?"

	Conditionals. Hmm, having everything be "onVariableChange" maybe gets rid of this?
		Like there's a pile of behaviour (curly braces below if statement) that will happen if... well, if a variable has changed
		And if our model is "there's some state and over time parts of it need to be updated",
			then in principle everything in curly braces below ever if statement ever is responding to some state change.
			Ok so that's what we're going on

	When you grab a gun, the horns of equal type everywhere appear and turn to face it

	No variable names, you just see the objects. Comments, yes

	entity component system

	First try to program a javascript thing using only "onChange"s

	You would need copy and paste

	"Go to the space of that thing". Heh, that's more like old opengl

	You can use this as an EE about graphics

	Forget about colors for a bit, just initialize everything to random colors

	What's a "for" in this context? "var"? Probably buttons on your controller

	Imperative, statically typed, wysiwig
	Tighten write->compile->test cycle

	First focus on position

	bootstrapping might help you build much of this. Even making the representations of local transform

	As in games, collisions cause function calls with the two objects as inputs
		There is stupid philosophy about whether it should be bunnyA.collideWithTeapot(teapotB) vs teapotB.collideWithBunny(bunnyA). There is only: collideTeapotWithBunny(teapotB,bunnyA)
		The projectiles are objects
		The horns and guns are physically attached to a thing representing the variable, say a number
*/

//Press a button to enter “editor mode”. Only when that is triggered do you actually construct all the meshes necessary for this.
function initPwg()
{
	//projective line, infinity at top, 0 at bottom. Had idea about recording highest value that number has taken on either side. Extra state, not sure you want that
	//it rotates and scales to face you, its position has no meaning
	//but you don't HAVE to have this visualization, you can just have the trumpet, and this appears if you're debugging
	function pwgNumber()
	{
		THREE.Mesh.call(this, new THREE.TorusBufferGeometry( 10, 3, 16, 100 ), new THREE.MeshPhongMaterial({color:0xFFFFFF}));
		this.add()
	}
	//Hah, parabolas. When you move a trumpet, all the guns aiming at it (eg that can trigger "onChange") shift.

	//only one of each operator! Probably you are only going to have a few things be visualized at a time. So they'll come with you
	//also all of these *wait* until they have two inputs. Is this what "lazy execution" is?

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
	var rng = new THREE.Object3D();
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

	//to make yourself: increment, decrement, absolute value, greaterThanOrEqualTo, lessThanOrEqualTo

	//I need a visual debugger anyway, you need to see the frame's intermediate situation

	//Look at everything you do with TAU. Can you replace it with Wildberger style 1? Might let you do angles with increment, decrement, 

	//Forget about the contents of object.geometry and material properties beyond color
		//What that leaves for 3D objects is position, RGB, and local basis vectors.
		//The object is not what you normally think, this is not the game itself. Its position is separate from it, and you update that. Then that updates it.
		//the object is a set of triangles. It just gets the balls shot at at. And we don't imagine its matrix, that's for "the programmer", just like the assembly language
		//"position" shooting its ball at it does the equivalent of "for each vertex, tak
		//For a point, all you need is the position
		//3D objects shouldn't be extraordinary. The rabbit has its data, the position/scale/rotation/color is a "transform".
		//DO bring in geometry though, that is the use this thing has for you.

	//most programming is just with numbers. Just these floating projective lines. Or characters. Screw that though
}