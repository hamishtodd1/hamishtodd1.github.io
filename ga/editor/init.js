/* 
	New plan
		origin point
		interval
		unit square
		functions on the above
		The ability to change representations of things
		Parse as javascript, glsl, or elm
		"We are making this simulation" as a motivator, close the gap

	Next
		Two display windows?
			One where the mouse is and one where the carat is. Hover an mv anywhere and you get the displaywindow and can put your mouse in it
		remove the "vector" "rotor" "curve" labels
		Backspace deletes whole mv
		Bug with names still

		What you want is a function/mesh that you then transform with your nice things
		mesh: You want to give the unit square, which is a set of points, to a function, and see the fuckers mapped
			Or the unit line, that's nice too

		To sell to brilliant
			Plot various different things
			Lots of examples

	Make videos about
		visualization of complex functions
			Donut
				How far around ring is input phase, ring radius is input amplitude
				How far around tube is output phase,
			Tube
				how far up is amplitude, how far around is phase
				How far out is output amplitude, color is output phase
		Segerman.mp4
		elliptic curve cryptography
		quantum computing
			Show 2+2 compiled to electricity on a circuit
			versus some qisket compiled to wavefunction
		maps
		quaternions and complex numbers
			For demonstrational purposes, parametric geometry is fine
		Lunar lander/simple harmonic oscillator?
			velocity space or differential space
			Footage though

	Unreal add-on
		Want to know C++ and Unreal, so an add on of some kind
			Things to hook up
				dual quaternions -> matrices
				scalars -> floats
				vectors -> vectors
				*sigh* -> cross product
				parametric functions -> arrays
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