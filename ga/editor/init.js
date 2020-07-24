/* 
	TODO for demo to steve der kenick, futureOfCoding, Alan, and Meurig, Martin
		Functions
		Draw in the preview window. Get eg array of vectors back, array is immediately in editor
		visualizing multivectors
		altering the things with mouse
		windows with previews, i.e. superimposed multivectors
		demo of making wedge product and "proving it is antisymmetric" by writing ab - ba
		Basic Omicron reduction
			Enough for basic integration and differentiation
			
	TODO for physics course
		Arbitrary formulae from Geometric Algebra For Physicists
		Full omicron reduction
		input latex

	TODO for serious programming / bootstrapping
		shift and arrow keys to highlight
			Cut and paste
		Input
			latex
		Output
			Spit out glsl and vertex array, maybe webgl/threejs with its quaternions, vec3s, shaders, matrices
			Unity script?
			Need to name the variables somehow

	You can't visualize the multivector without some theoretical values for it
		Both a blessing and a curse? Get people too used to a certain state, unable to think in the abstract?
		
	For all variables in mathematical formulae, would be good to state what level of abstraction they are at
		constant (pi)
		unknown constant
		function
		unknown function
		Talk to Matt Hare or Ivan or the Slack or Martin about this, there's surely a hierarchy well established
		Whenever a physicist talks about a function, surely they want it, i.e. they're going through a process that eventually establishes it? Making a library?

	surfaces are parametric, functions from R2
	If the vertices of a mesh are in a funky order with respect to triangles, they are probably imported from an outside program. That program should put them in a good order.
	Except that you want to compute vertex normals.
		Though in order to do that you do have to iterate an array to find

	Phys vs CS
		Physicists can write eg min( f(x) ) when finding the min is NP hard or whatever. You can't just evaluate things
		Physics equations are declarative? But a lot of the concern stuff changing over time. They are constraints on the block universe
			Shaders also declarative, pure functions. That's why this works and why you can expect a useful result
		If you have a system containing 3 vectors and you show one of them can be derived from the other 2, you've shown your system has one less degree of freedom than might have been thought. Heh, information compression. Derivation is key in algebra too; you show equivalences. Talk to Joel about this, what do physicists want out of algebra? Well maybe you're more interested in engineers...
		Is it easier to see simplification opportunities in physics notation?
		Physicists don't really have arrays, only functions? On fields?
		Notation
			CS		Phys
			let		yes, every operation makes a new thing
			for		either map or integral
			if		kronecker delta
				branches: do both then assign one to a vector at the end with result = condition * optionA + (1-condition) * optionB
				The exception-free thing where you'll get a point or a line depending on what the answer is with no extra code may be analogous to this conditionals thing?
				condition is kronecker delta! There's an expression for it https://en.wikipedia.org/wiki/Kronecker_delta#Properties

	If you want to solve them analytically, it's about using your symbol juggling abilities
	But that is only because integration and differentiation are defined as infinite serieses. Maybe even unrigorous?

	Algebraic deduction / reduction
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

	integration and differentiation
		It needs built in derivatives because it's a language for physics course
		Bret integration https://youtu.be/oUaOucZRlmE?t=1266
		The epsilon of integration is directly linked to the scale at which you are looking at the thing. dt = width of a pixel
		You draw a graph (left to right bottom to top say) by evaluating the function at the left side of a pixel, then at the right, then drawing pixels accordingly
		In the evaluation system
			"differentiate(x*x,x)" -> "2*x"
		Analogy: take a surface, f:R2->R2. Fill it up underneath, i.e. consider the integral. Look at it from above. That is a single colour channel.
*/

//reduction / partial evaluation syntax
//how to detect opportunities? Regex?
//Don't necessarily need names. Fuck names, of course
//if you do give them names then you may be able to spot analogies. Write some weird equation with no geometrical analogue and it pops up "linePlaneIntersection"
//How to animate the things? if they've got the same symbols can move them around
// function associativity(a,b,c)
// {
// 	return a*(b*c)
// }
// {
// 	return (a*b)*c
// }

// function differentiate(f,at)
// {
// 	let dt = 0.0000001
// 	return ( f(at) + f(at+dt) ) / dt
// }

// function integrate(f,at)
// {
// 	let dt = .0001 //the width of a pixel
// 	f()
// 	//for any approximation of integral of f with given dt, we can scale f such that you get that dt level precision
// 	//multiply final result by dt... but that is just a scalar multiple, only relevant if you put symbols on the y axis so to speak
// }

function init()
{
	// initClickyVideo()
	initMultivectorAppearances()
	initOutputColumnAndRenderWindows()

	initPad()
}