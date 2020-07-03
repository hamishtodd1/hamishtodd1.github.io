/*
	Have it on a square snap-to grid like text
	As you know from pwg, it is important to show and hide stuff (as it is with text!)
	Need to have an idea of scope that auto hides/shows. Maybe there are certain arrows that only appear when you reach out?

	Brackets are control flow
	do you need if statements if you have sigmoid and tanh?
	Could have some vector in scope that always follows your mouse? Eh, better to have a grabbable tip. Humm, bootstrap
	Currying: instead of 2 you can have "the function that multiplies by 2" and "the function that adds 2"
	You may be tempted to make visualizations and animations for the other datatypes. Nice that you can but you probably shouldn'ts
	Fragment shaders are nice but fuck them for now, need to focus, do vertex shaders
	Vertex shaders are the special case where the input is any amount of crap and the output is specifically a vertex. Hmm, except for geometry

	With making tools, good to have one foot in the mathematical elegance room, and one in the pragmatic "languages are underspecified, here is how you set the icon" room

	As usual part of the purpose of making this is to see some small amount of cool patterns behaviour, it is not necessarily the end of the world if you can't make arbitrary complex shaders

	It is kinda cumbersome to take derivatives in normal languages, so don't beat yourself up about not building it in

	Even if you do end up with a convoluted toolbar with all the things a normal game engine has, the unification of them all is still very useful; it makes all the elementscompatible in a predictable way

	Probably switches that are a single scalar, 0 or 1, are sufficient for input with just multiplication

	2D stuff is super important. Webpages, etc. 2D PGA could be really really useful. The null vector is obv pointing towards you. 2D PGA may be enough for lots of useful comp geo. Could maybe have Cl 3,1,1 and never allow more than 3-blades. Including not allowing z to interact with the null or neg vector.

	What this is for
		Showing players of the puzzle game a certain goal
		Showing frames of footage/animation
		Showing results of a vertex shader
		Programming VR interactions? Molecule constraints?

	It would be good to be able to convert say threejs code, with its quaternions and vectors and scalars, into an animation
	Can you convert matrix algebra into that? homogeneous matrices with just rotation and position, surely yes

	ideas
		fire poi throwing sparks!
		corkscrew
		sphere
		tornado particle effect
		That sea wave thing where each point on the surface is a point on a circle

	TODO sandbox / tool for thought / live coding / shader programming / quantum computing sandbox
	Wanna move mouse/vr controller around area continuously and it updates
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

function initShaderProgramming(modeChange,inputGroup,outputGroup)
{
	
}