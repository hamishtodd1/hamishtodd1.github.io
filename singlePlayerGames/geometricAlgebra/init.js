/*
	TODO for Cambridge
		Input output thing
			In sandbox
			Start with numbers
			ideally differential geometry, like corkscrew

		Scope updating would be nice

		Building your own functions is important, it's how you deduce the rest of geometry

		The clown
		Click and drag on the inputs would be nice

		then use maryam mirzakhani vid and Human Resource Machine to illustrate

	TODO for slack
		More aspects of 2D multiplication and addition needs to be visualized
			Coplanar bivector addition - easy and fun
			Vector addition - just do something
			Vector multiplication - need both scalar and bivector part
			Scalar multiplication - obvious, duplication then addition
			Coplanar bivector multiplication - complex multiplication!
			Bivector-vector multiplication
			Bivector multiplication???

	TODO for GDC
		IT HAS TO BE VERY FUCKING FUN
			Sound effects / juice
			level design
		Webpage loads faaaaaast
		Communicates its fun, creates nice surprises, in 45s
		And can show something quaternion-related in short order

	TODO sandbox / tool for thought
	AR https://jeromeetienne.github.io/AR.js/three.js/examples/basic.html
	Helping make shaders
		Parametric geometry - can feed in either line or grid
		Ideally you paste and it tells you what it thinks you pasted
		Spit out glsl and vertex array
		Heh, have it be possible for the input and output to be arranged in a rectangle with x and y smoothly varying, i.e. a framebuffer
	A nice thing to do at a live coding event if nothing else
		Folks can see what you're doing
		Your hand covers a small surface and your hand is big
		Music
			https://www.youtube.com/watch?v=R_Rfkhg7s_M 
			https://www.youtube.com/watch?v=EtEOl-xJTg8

	TODO for academic course (not much effort)
		record a bunch of videos in zeimlight style
		Link it to the ordinary way of visualizing things, brackets and numerals

	Long term
		You should play all those games like opus magnum
			Stream them
			Can you tolerate ending up like that? cluttered UI, confusing to start with, a zillion words and icons?
		Oculus quest / hololens thing where you record a video, and it automatically takes the frames
		They should be able to rearrange multivectorScope, and delete bits of it
		Have a "superimpose everything so it's in the same coord system" button
		Zoom out every time multivectorScope gets big
		Bootstrapping!
			Maybe you should use GA for your camera projection and that should be considered part of the system
			After all, if you pick up a vector and rotate it it can be rotated to become its negative
			Rotating the basis vectors rotates eeeeverything
			If you rotate a vector, well, it is a different vector
		So how about when you have too many multivectors in your multivectorScope?
			Could rearrange to put recent ones at top
			Could pack rectangles
			Scrollbar
*/

async function init()
{
	// await initBivectorAppearance()
	// return

	initMultivectorAppearances()
	await initOperatorAppearances()

	// initWheelScene()
	// return

	{
		let restartButtonObj = makeTextSign("Restart")
		var restartButton = restartButtonObj.children[0]
		restartButton.scale.copy(restartButtonObj.scale)
		restartButton.scale.multiplyScalar(.4)
	}

	initOperationInterface(restartButton)

	let modeChange = {}
	initGoals(modeChange,restartButton)
	modeChange.sandbox()

	await initMenu(modeChange)
}