/*
	TODO for Cambridge
		Level progression to get you to the "inputs outputs" point and to say how you can learn
		Get the wheel in there. Animated
		And just some videos plus extracting pictures
		Tutorial levels
		AR https://jeromeetienne.github.io/AR.js/three.js/examples/basic.html
		Would be nice to at least have parallelogram liquid sim to show your ambition

	TODO for slack
		Every aspect of the multiplication and addition needs to be visualized. Well, for 2D!
			Coplanar bivector addition - easy and fun
			Vector addition - just do something
			Vector multiplication - need both scalar and bivector part
			Scalar multiplication - obvious, duplication then addition
			Coplanar bivector multiplication - complex multiplication!
			Bivector-vector multiplication
			Bivector multiplication???

	TODO sandbox / tool for thought
	Helping make shaders
		Parametric geometry - can feed in either line or grid
		Ideally you paste and it tells you what it thinks you pasted
		Spit out glsl?
		Heh, have it be possible for the input and output to be arranged in a rectangle with x and y smoothly varying, i.e. a framebuffer

	TODO for GDC
		A fast to access webpage
		With something that creates surprises and communicates its purpose in 45s
		And can show something quaternion-related in short order

	TODO for academic course (not much effort)
		record a bunch of videos in zeimlight style
		Link it to the ordinary way of visualizing things, brackets and numerals

	Long term
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
	// await initVideo()

	initOperationInterface()

	let modeChange = {}
	initPlayModes(modeChange)
	modeChange.campaign()

	await initMenu(modeChange)
}