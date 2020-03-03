/*
	What this is for
		Showing you a certain goal
		Showing frames of footage/animation
		Showing results of a vertex shader

	ideas
		corkscrew
		sphere
		tornado particle effect
		That sea wave thing where each point on the surface is a point on a circle

	TODO sandbox / tool for thought / live coding / shader programming / quantum computing sandbox
	Helping make shaders
		This is how you doodle the things that will become goals
		Inputs
			linear sequence of numbers
			2D bunch of vectors in a square - fragment shader
			Maybe a circle
			random cloud of points in unit cube?
		fragment too, just need standard complex plane mapping
		Parametric geometry - can feed in either line or grid
		Ideally you paste and it tells you what it thinks you pasted
		Spit out glsl and vertex array
		Heh, have it be possible for the input and output to be arranged in a rectangle with x and y smoothly varying, i.e. a framebuffer
		A nice thing to do at a live coding event
			Folks can see what you're doing
			Your hand covers a small surface and your hand is big
			Music
				https://www.youtube.com/watch?v=R_Rfkhg7s_M
				https://www.youtube.com/watch?v=EtEOl-xJTg8
*/

function initShaderProgramming(inputGroup,outputGroup)
{
	var line = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({ color: 0x0000FF }));
	lineVertices = line.geometry.vertices
	for (let i = 0; i < 3; i++)
		lineVertices.push(new THREE.Vector3(i));
	outputGroup.line = line
}