/* 
	Next
		Can make exp into a pic!
		Most important is editing vectors
		Fix bug in naming, "wr" not equal to "rw"?

		Superimposed things should be visible. Whichever thing is smaller. Easy peasy if you use webgl
		Making functions
			so the function is named by colors, that's good
			But you want, probably, free variables in the inputs, and their colors come from, what, a new line?
			Could have {} surrounding the lot, or indents. The first few lines are your free parameters, they get filled in 
			Then when you leave the indents, those variable names are available again
			And need to have curve-drawing integrated
		Naming system should apply to functions. But how to color them...

	Bret article http://worrydream.com/DrawingDynamicVisualizationsTalkAddendum/
	https://en.wikipedia.org/wiki/Binary_expression_tree

	TODO demo
		shadows
		Functions
			More visualizations
				Vector fields
			Can be written
			made by drawing in view
				fourier approximation. If you loop back it's a 2D function, if not 1D
		differentiation
			Differentiation in time is just flipbooks of slices of differentiation in spaces
			automatic differentiation/epsilon business?
		Basic Omicron reduction
			Describe properties of a variable or function then make function
			differentiate/integrate polynomials
			a proof that two things are equal
				making wedge product and "proving it is antisymmetric" by writing ab - ba
				
		What to demonstrate
			Lunar lander/simple harmonic oscillator?
			velocity space or differential space
			Footage though
		Interested parties
			Language people: Alan, Meurig, Martin, futureOfCoding, Yoshiki, Cynthia Solomon, Andy Matuschak, Katherine Ye
			GAists: bivector discord, Cam folks, Charles Gunn, Steven Der kenick, Pierre Philipp Denchant, Jonathan Cameron, David Hestenes, Paul Simeon
			Graphics/gamedev: Keenan Crane, Albert Chern, Fabrice, inigo quilez, Haxiomic, Dan Holden, Daniel Piker, Ian and Norgg, Media Molecule, Chris Deleon
			Math/physicist: Ivan and Nina, Florian, Eric stansifer, Matt Hare
			Misc: London Rationalish, Ben Eater, Coding Train guy, Grant sanderson

	TODO for a few one-off videos. Let's say it's on even subalgebra/quaternions and complex numbers.
		integrated with mixedReality
			Surely you can adjust picture automatically? three points on the controller maybe?
		Interaction
			Hand tracking input in displayWindows
		Setup/desk
			Glass
			Camera
			Mic

	TODO for programming games/shaders
		Camera and mouse ray visualized and something you deal with
		Demos
			Pong
			Sphere
			Mandelbrot
		shift and arrow keys to highlight
			Cut and paste
		Output
			hmm, could you compile to the subset of C used by glsl?
			javascript/glm function containing threejs with its quaternions, vec3s, shaders, matrices
				detect which things will always be 0
			webgl/webpage/opengl
			Unity script?
			Probably want interface for turning the color code variable names into reasonable names

	TODO for physics course
		Arbitrary formulae from Geometric Algebra For Physicists
		Full omicron reduction
		input latex
		More function visualizations

	An array of vectors is a matrix. Therefore... f:R->R2 sampled at two points is a matrix?

	You can't visualize the multivector without some theoretical values for it, programming by example
		A slice through possibility space

	y = x^2
	y' = 2x
	y'(1) = 2
	implicit: f(t) = (t,t^2) (the above is a "constraint upon the points", whereas this has some "there exitsts t such that")
	consider (t,t^2) vs (2t,(2t)^2). They'll look the same
	Same with (-t,t^2).
	(1,2t) vs (2,4t). These are the same at the same point though. Implicit functions are not unique
	vector tangent to f: f'(t) = (1,2x)
	An implicit function just means it's a curve in a higher dimension

	Calculus
		Possibly integration is an example of something with multiple inputs, i.e. currying parts of it might not help?
		Picture a curve
			Smoosh it down to a line, i.e. look at it from above. you might see value along the line represented as transparency
			Take that line and look at it dead-on. The color you're seeing is proportional to the integral
		For a given vector field, is there some surface for which it is the grad?
		The "right" way to visualize a derivative wrt one variable (implicit or explicit) is
			the height of the right angled triangle of base 1 whose hypotenuse is tangent to that
		"Behaviour" is about responses to changes. Changes happen over time. To study changes over time you need calculus
		Because you can do slicing, should be able to think of all derivatives as spatial derivatives instead of time
		Stuff about dual numbers in siggraph course notes?
			sq(ei) =-1 => exp(a*ei) = cos(a) + sin(a) * ei
			sq(ej) = 0 => exp(a*ej) = 1 + a*e0
			sq(ek) = 1 => exp(a*ej) = ?
		Jon https://www.youtube.com/watch?v=fdAOPHgW7qM&t=16s Sean https://www.youtube.com/watch?v=jTzIDmjkLQo
		Don't forget strogatz style. Particle on the line, the curve above it tells it whether to go left or right. f:R->R is a vector field too
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
		The derivative of the area function is the function on top of it. That's a 2D -> 1D thing. Can you think about nth derivatives in any other dimensional-kind of way?
		The more terms you have in a taylor series, the better your numerical approximation will be
		In the evaluation system
			"differentiate(x*x,x)" -> "2*x"
			
	Algebraic deduction / omicron reduction
		Maybe worth calling them "conjectures", because mightn't they be false?
		Cauchy Riemann is a nice example of something you can put in reductions
		the fundamental axioms are e1^2 = e2^2= 1 and e1e2 = -e2e1
		Ivan sutherland had it. You have your algebraic properties (all statements of the form f(...) = 0), but they're applied to pictures and applied gesturally
		As joel says, sometimes you want to write a*b = b/a but it's some bunch of things that just cannot be rarranged into a = or b = 
		Call it inlining and outlining
		Isn't it kind of arbitrary what we label as definitions and theorems?
			Can't you take the theorems and then backsolve to the definitions, meaning that the definitions were kinda theorems?
			Maybe put in euclidean geometry, intuitive "axioms" describing geometric product like angle(a->b) = -angle(b->a)
		Can you have counterfactual reasoning? Maybe there's some function f. You have not evaluated f but you assert that f() = 2.
		Suppose you don't know how to integrate f. but you can *write* / assert that integrate(f) - suspectedValue = 0.
		Might be very useful for transitioning between coarse grain things and non course grain. Compile-time approximation of a function by a series
		It's kinda like assertions
		You want to see if the things you have written are simple geometric operations
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

	reduction / partial evaluation / function syntax
		//you don't get to name functions, the thing does it for you. write a => b with a being free...
		how to detect opportunities? Regex?
		Don't necessarily need names. Fuck names, of course
		if you do give them names then you may be able to spot analogies. Write some weird equation with no geometrical analogue and it pops up "linePlaneIntersection"
		How to animate the things? if they've got the same symbols can move them around
		(a,b,c) -> a*(b*c) = (a*b)*c

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
	let characterMeshHeight = .4

	initFuncViz()

	initDisplayWindows()
	mainDw = initMainDw()

	initMultivectorAppearances(characterMeshHeight)
	initOutputColumn()

	initGrabber()

	initPad(characterMeshHeight)

	//dw, then mainDw, then mv appearances, then pad

	// initClickyVideo()
}