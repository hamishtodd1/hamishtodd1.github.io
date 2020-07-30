/* 
	TODO for demo to interested parties
		Compiling and executing basic instructions dude, putting stuff in that column
		comment-like bits of code that say what vectors should be in the render windows when (/where, heh)
		function copied into code from drawing in view
			fourier approximation. If you loop back it's a 2D function, if not 1D
		Stuff in renderwindow
		Functions
		altering inputs with mouse
		Basic Omicron reduction (omicron because if you can demonstrate)
			demo of making wedge product and "proving it is antisymmetric" by writing ab - ba
			Enough for basic integration and differentiation

	Interested parties
		steve der kenick, bivector discord
		Chris Deleon, Daniel Piker
		Alan, Meurig, Martin
		futureOfCoding slack
		EE slack
		Media Molecule

	TODO for programming / bootstrapping
		Fuller visualization of multivectors
		built in exp and division etc or implement yourself?
		Camera and mouse ray visualized and something you deal with
		Make names consistent
			One idea: record what names got attributed to what calculations
		Demos
			Pong
			Sphere
			Mandelbrot
		shift and arrow keys to highlight
			Cut and paste
		Output
			javascript/glm function containing threejs with its quaternions, vec3s, shaders, matrices
				detect which things will always be 0
			webgl/webpage/opengl
			Unity script?
			Probably want interface for turning the color code variable names into reasonable names

	TODO for physics course
		Arbitrary formulae from Geometric Algebra For Physicists
		Full omicron reduction
		input latex

	You can't visualize the multivector without some (theoretical values) for it
		Or can you? Little disk with colors?
		Both a blessing and a curse? Get people too used to a certain state, unable to think in the abstract?
		Heh how about making them meander randomly?
		Hey, it works for debuggers. It's a slice through possibility space
		Working with the function, maybe represented as an infinite line of mvs, is for the game

	integration and differentiation
		To do Inventing On Principle Style omniscient select-the-time debugging for non-trivial games:
			Consider the fact that they have a state s and an update function u
			smoothstep is your differentiable sigmoid
			If the update function depends on the current state you have a differential equation
				otherwise(?) just get its antiderivative and you'll
				Maybe all the current-state-dependent advancements can be socially enforced dynamicland/sport style. Examples of these:
					"last state was losing condition, so you have a game over screen"
					"Restart" button
					win, loss are specific binaries
			Ideally we can immediately get s given time since initialization and functions over time of what the controller input values were
			This is asking a lot from game developers... how much do you get from it?
				Can get super helpful omniscient debugger if everything is differentiable
				Maybe describe a bug situation then automatically solve the equation to see if it ever happens
				Gamedevs do want to make nice wobbly physics-y stuff, they should commit to it
			Maybe this is the difference between physics and games, you do get nice non-differential equations sometimes
			Ordinary: you have your state/frame s, and your update function u, next state/frame is u(s). S is an array of multivectors
				u'(s) is your differential
				Gonna have to simulate many frames forward to get full visualization of a reasonable game
				We definitely do have u(s,frameDelta), all games do. Can differentiate
					Are there any nasty differential equations in there? Blow would say yes
		Surely something very GA going on https://en.wikipedia.org/wiki/Integration_using_Euler%27s_formula
		They should call integration "accumulation". "Differentiation" is probably fine
		It needs built in derivatives because it's a language for physics course
		Bret integration https://youtu.be/oUaOucZRlmE?t=1266
		The epsilon of integration is directly linked to the scale at which you are looking at the thing. dt = width of a pixel
		You draw a graph (left to right bottom to top say) by evaluating the function at the left side of a pixel, then at the right, then drawing pixels accordingly
		In the evaluation system
			"differentiate(x*x,x)" -> "2*x"

	Algebraic deduction / reduction
		Is this "constraint programming"?
		You're defining properties of a thing without knowing the thing. Then you juggle til you have a function describing the thing. Funny way to program?
		You can use this stuff, simplified equations, to build the animations that get used for operations, see operators.js
		In addition to jugglings, you can have constraints
			"always equal", eg check associativity
			Maxwell's equations, newton's laws of motion
			What would be the system/thing you'd put into a function that would check constraints? Function strings? Good thing they're equivalent to shapes...
		This is a good idea, animating it too. If you want to animate everything in GA for physicists you must do this
			All these formulas, fundamentally they are about plugging numbers in and getting results; wanna have the possibility of doing that!
		Most of argumentation for math/phys is showing equalities. Our plan is, instead of a = b, output a - b which is 0
		Rearranging computer code into a simpler form... sounds like delta reduction?
		It's not always "reduction" in the sense of reducting the length of the string. Good to do ab -> a.b + a^b
		The kinds of algebraic manipulation you do are kinda like constant folding?
		You coooooooould have it be that highlighting a phrase gives you a dropdown of stuff you can turn it into
		Removing multiples that are 1 and leaving the thing it multiplies by, or completely removing things that are multiplied by 0
		integration and differentiation rules are examples
		The purpose of this is pedagogy, and hey, maybe more
		Is there any way of turning the subsitution rules into things helpful for the animations or where to put stuff in the pictures???
			Maybe this is how you say that difference vectors should be put not at the origin?

	reduction / partial evaluation syntax
		how to detect opportunities? Regex?
		Don't necessarily need names. Fuck names, of course
		if you do give them names then you may be able to spot analogies. Write some weird equation with no geometrical analogue and it pops up "linePlaneIntersection"
		How to animate the things? if they've got the same symbols can move them around
		function associativity(a,b,c)
		{
			return a*(b*c)
		}
		{
			return (a*b)*c
		}

		function differentiate(f,at)
		{
			let dt = 0.0000001
			return ( f(at) + f(at+dt) ) / dt
		}

		function integrate(f,at)
		{
			let dt = .0001 //the width of a pixel
			f()
			//for any approximation of integral of f with given dt, we can scale f such that you get that dt level precision
			//multiply final result by dt... but that is just a scalar multiple, only relevant if you put symbols on the y axis so to speak
		}
*/

function init()
{
	// initClickyVideo()
	initMultivectorAppearances()
	initOutputColumnAndDisplayWindows()

	initPad()
}