/* 
	Next
		Two display windows? 
			One where the mouse is and one where the carat is. Hover an mv anywhere and you get the displaywindow and can put your mouse in it
		remove the "vector" "rotor" "curve" labels
		Backspace deletes whole mv
		Bug with names still

		Alright so you have the origin, what happens if you apply your elements to it?
		What you want is a function/mesh that you then transform with your nice things
		mesh: You want to give the unit square, which is a set of points, to a function, and see the fuckers mapped
			Or the unit line, that's nice too
		
		Making functions
			so the function is named by colors, that's good
			But you want, probably, free variables in the inputs, and their colors come from, what, a new line?
			Could have {} surrounding the lot, or indents. The first few lines are your free parameters, they get filled in 
			Then when you leave the indents, those variable names are available again
			And need to have curve-drawing integrated

	Make videos about
		maps
		quaternions and complex numbers
			For this... a function from points to vectors would be fucking fine

	For a worthwhile 6 months
		Want to know C++ and Unreal, so an add on of some kind
			Things to hook up
				dual quaternions -> matrices
				scalars -> floats
				vectors -> vectors
				*sigh* -> cross product
				parametric functions -> arrays
		UE is for professionals
		If you want to target youth, unity is probably the way to go

	TODO demo
		Functions
			Can be written
			made by drawing in view
		Increasing complexity
			Simple harmonic oscillator
				time evolution rule
			Double pendulum
				Need numerical simulation
			Heat on a rod, Schrodinger equation
				Need to compute on a texture
		Evolution on fields
		Basic Omicron reduction
			You highlight
			Axioms of GA:
				bb = gg = oo = 1
				bg = -gb, etc
			Describe properties of a variable or function then make function
			differentiate/integrate polynomials
			a proof that two things are equal
				making wedge product and "proving it is antisymmetric" by writing ab - ba
		differentiation
			Differentiation in time is just flipbooks of slices of differentiation in spaces
			automatic differentiation/epsilon business?
		shadows
		Superimposed things should be visible. Whichever thing is smaller. Easy peasy if you use webgl
				
		What to demonstrate
			Lunar lander/simple harmonic oscillator?
			velocity space or differential space
			Footage though
		Interested parties
			Language people: Alan, Meurig, Martin, futureOfCoding, Yoshiki, Cynthia Solomon, Andy Matuschak, Katherine Ye, Glench, Ken Perlin, Josh Horowitz
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
*/

async function init()
{
	let characterMeshHeight = .4

	//lawson klein https://www.geogebra.org/m/XzSAYB9D

	initFuncViz()

	initDisplayWindows()
	initMainDw()

	initMultivectorAppearances(characterMeshHeight)
	initOutputColumn()

	initPad(characterMeshHeight)

	//dw, then mainDw, then mv appearances, then pad

	// initClickyVideo()
}