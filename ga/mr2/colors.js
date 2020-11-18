/*
    Colors
        lambda a b c . [function body]
        string of letters = function name
	    you are expecting function, variable, variable. Get anything else puts an error sign in the column
        Colorblindness
            https://www.reddit.com/r/ColorBlind/comments/hjw6ie/i_am_making_a_game_and_i_want_to_use_a_large/
            https://personal.sron.nl/~pault/
            viridis folks https://www.youtube.com/watch?v=xAoljeRJ3lU
			mark brown https://www.youtube.com/watch?v=xrqdU4cZaLw

	Temporary:
	a ?auburn (red)
	b ?black blue? brown
	c cyan (blue)
	d
	e ?emerald (green)
	f ?fuscia (purple)
	g green gray
	h
	i ?indigo (purple)
	j
	k
	l ?lilac ?lemon
	m magenta (technical people should know. Colorblindness though. But so many will call it purple)
	n
	o orange
	p pink ("fuck purple") purple
	q
	r red
	s
	t turquoise or teal. People just call it blue or green
	u ultramarine
	v ?violet ?viridian
	w white
	x x axis
	y y axis yellow? cream? lemon?
	z z axis

	x,y,z
*/

let colorCharacters = ""
const colors = {
    "b": new Float32Array([0., 0., 1.]),
    "g": new Float32Array([.3, .3, .3]),
    "o": new Float32Array([.9, .5, .2]),
    "p": new Float32Array([.5, 0., .5]),
    "r": new Float32Array([1., 0., 0.]),
    "w": new Float32Array([1., 1., 1.]),
    "y": new Float32Array([1., 1., 0.])
}
for (let color in colors) colorCharacters += color

function projectPointOnPlane(point,plane,target) {
	wNormalizePoint(point)
	let planeDotPoint = mv0
	inner(point, plane, planeDotPoint)
	gp(planeDotPoint, plane, target)
	wNormalizePoint(target)
	return target
}

function drawColorWheel()
{
	const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
		attribute vec4 vertA;
		varying vec2 p;

		void main(void) {
			p = vertA.xy;
			
			gl_Position = vertA;
			gl_Position.xy *= rightAtZZero * 2.;
		`
		+ cameraAndFrameCountShaderStuff.footer
	const fsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
		varying vec2 p;

		void main(void) {
			if( .5 < length(p) )
				discard;
			float hue = .5 + .5 * atan(p.y,p.x) / PI;
			
			` + hueToFragColorChunk + `
			
			// gl_FragColor.rgb -= 1. * (1.-length(p.xy)*2.);
			gl_FragColor.rgb *= length(p.xy) * 2.;
		}`

	const program = new Program(vsSource, fsSource)
	program.addVertexAttribute("vert", quadBuffer, 4, false)

	cameraAndFrameCountShaderStuff.locateUniforms(program)

	addRenderFunction(() => {
		gl.useProgram(program.glProgram);

		cameraAndFrameCountShaderStuff.transfer(program)

		program.prepareVertexAttribute("vert")

		gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4);
	})
}