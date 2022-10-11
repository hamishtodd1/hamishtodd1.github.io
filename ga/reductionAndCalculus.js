/*
	Algebraic deduction / omicron reduction
		In an ordinary editor, one problem you'd encounter with an automatic inliner is that if you had any variables with same name...
		Not such a problem for us because auto-renaming, you really don't give a shit about the name, it's just the shit you type
		law of sines proof, doable with reduction: https://slides.com/labs810/ga4science#/28/0/4
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
		Proving stuff in the course
			To demonstrate equality you can just plot things. Or you could use omicron reduction to reduce to 0
			Proof by contradiction? Could put a dumb thing into the omicron reduction and, haha, look for bugs

	reduction / partial evaluation / function syntax
		//you don't get to name functions, the thing does it for you. write a => b with a being free...
		how to detect opportunities? Regex?
		Don't necessarily need names. Fuck names, of course
		if you do give them names then you may be able to spot analogies. Write some weird equation with no geometrical analogue and it pops up "linePlaneIntersection"
		How to animate the things? if they've got the same symbols can move them around
		(a,b,c) -> a*(b*c) = (a*b)*c

		integrate and differentiate are both functions from the space of functions to the space of functions, fairly simple

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