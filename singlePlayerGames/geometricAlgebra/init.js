/*
	TODO for Cambridge
		Input output thing
			In sandbox
			Start with numbers
			ideally differential geometry, like 

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
		needs to be a programming game, inputs and out, with multiple fun levels and a video
		Try doodling with the scalar input and see what you get
		If nothing good, try introducing the feedback differential-making thing
		Don't go 3d, and for now the craziness can be a nice surprise

		IT HAS TO BE VERY FUCKING FUN
			Sound effects / juice
			level design
		Webpage loads faaaaaast
		Communicates its fun, creates nice surprises, in 45s
		And can show something quaternion-related in short order

	Send to
		Andy Matushak (both for "here is the model for teaching" and "here is a tool for thinking")
		The slack
		Marc
		Daniel Piker once you have vertex shaders
		Jon
		indie fund
		The bivector discord

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
	
	Misc
		What is the difference between an object and an operator? Arguably a bivector or quaternion is an operator. Here we do make a distinction but we class a quaternion as an object. This is probably fine and no more need to philosophize
		Product of operators, not of objects
		Can we show people why neg times neg = pos
		Compute shader collision detection conformal GA
		one layer in a NN to another possibly only needs the blade of that dimension in the higher dimension
*/

async function init()
{
	// return

	initMultivectorAppearances()
	await initOperatorAppearances()

	initSound()

	// initTankScene()
	// return



	{
		let restartButtonObj = makeTextSign("Restart")
		var restartButton = restartButtonObj.children[0]
		restartButton.scale.copy(restartButtonObj.scale)
		restartButton.scale.multiplyScalar(.4)
	}

	initOperationInterface(restartButton)

	let modeChange = {}
	initInputAndOutputGroups()
	initGoals(modeChange,restartButton)
	modeChange.calculator()

	await initMenu(modeChange)
}