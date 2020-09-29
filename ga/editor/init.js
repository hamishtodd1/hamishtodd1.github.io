/* 
	Next
		Two display windows?
		
		Making functions
			so the function is named by colors, that's good
			But you want, probably, free variables in the inputs, and their colors come from, what, a new line?
			Could have {} surrounding the lot, or indents. The first few lines are your free parameters, they get filled in 
			Then when you leave the indents, those variable names are available again
			And need to have curve-drawing integrated

	Bret article http://worrydream.com/DrawingDynamicVisualizationsTalkAddendum/
	https://en.wikipedia.org/wiki/Binary_expression_tree

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
			More visualizations
				Vector fields
			Can be written
			made by drawing in view
				fourier approximation. If you loop back it's a 2D function, if not 1D
		Simple harmonic oscillator
			time evolution rule, harder on time function
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

	// https://www.geogebra.org/m/XzSAYB9D

	let material = new THREE.ShaderMaterial({});
	let shaderHeader = [
		'varying vec2 pDomain;',
		'varying vec3 pRange;',
		'void main() {'
	].join("\n")
	let vertexShaderFooter = [
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
		'	pRange = vec3(gl_Position);',
		'	pDomain = position.xy;',
		'}',
	].join("\n")
	let fragmentShaderFooter = [
		'	gl_FragColor = vec4(0., 0., 0., 1.);',
		'	float hexant = floor(hue * 6.);',
		'	float factor = hue * 6. - hexant;',
		'	if (hexant == 0.) {',
		'		gl_FragColor.r = 1.;',
		'		gl_FragColor.g = factor;',
		'		gl_FragColor.b = 0.;',
		'	}',
		'	else if (hexant == 1.) {',
		'		gl_FragColor.r = 1.-factor;',
		'		gl_FragColor.g = 1.;',
		'		gl_FragColor.b = 0.;',
		'	}',
		'	else if (hexant == 2.) {',
		'		gl_FragColor.b = factor;',
		'		gl_FragColor.r = 0.;',
		'		gl_FragColor.g = 1.;',
		'	}',
		'	else if (hexant == 3.) {',
		'		gl_FragColor.b = 1.;',
		'		gl_FragColor.r = 0.;',
		'		gl_FragColor.g = 1.-factor;',
		'	}',
		'	else if (hexant == 4.) {',
		'		gl_FragColor.b = 1.;',
		'		gl_FragColor.r = factor;',
		'		gl_FragColor.g = 0.;',
		'	}',
		'	else if (hexant == 5.) {',
		'		gl_FragColor.b = 1.-factor;',
		'		gl_FragColor.r = 1.;',
		'		gl_FragColor.g = 0.;',
		'	}',
		'}'
	].join("\n")
	material.vertexShader = [
		shaderHeader,
		'	vec3 mappedPosition = position;', //and here you put something interesting
		vertexShaderFooter
	].join("\n")
	material.fragmentShader = [
		shaderHeader,
		'	float hue = pDomain.y * pDomain.x;', //strictly less than 1
		fragmentShaderFooter
	].join("\n")

	let geo = new THREE.PlaneBufferGeometry(1., 1., 255, 255)
	geo.translate(.5,.5,0.)
	let plane = new THREE.Mesh( geo, material );
	scene.add(plane);

	return

	initFuncViz()

	initDisplayWindows()
	initMainDw()

	initMultivectorAppearances(characterMeshHeight)
	initOutputColumn()

	initPad(characterMeshHeight)

	//dw, then mainDw, then mv appearances, then pad

	// initClickyVideo()
}