/*
	Look through "record", lots of stuff in there and things you've done

	TODO calculator (Andy/slack/pontus)
		Finish scalar and imaginary number stuff
		Generally get all animations in
		Then you have calculator, interesting tool for thought to impress slack/andy/GA folks
		Then can move back to nice input and output stuff
		Unify the various "generating" approaches

	TODO Jon
		Just some levels
		Ideally an input/output one

	TODO for live coding / input output sandbox / level editor
		Differential geometry / turtle
		Specify inputs using mouse or VR?
		Building your own functions is important, it's how you deduce the rest of geometry

	TODO for single player tutorial / puzzle documentary that is probably a bad idea
		levels.js

	TODO for showing to Jon Blow / funders
		Multiple fun levels
			Try doodling with the scalar input and see what you get
		Proof of concept for video
		If nothing good, try introducing the feedback differential-making thing
		Don't go 3d, and for now the craziness can be a nice surprise

	Send to
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
	// await initMultivectorAppearances_()
	// return

	await initMultivectorAppearances()
	await initOperatorAppearances()

	initSound()

	// initTankScene()
	// return

	{
		let restartButtonObj = makeTextSign("Restart (r)")
		var restartButton = restartButtonObj.children[0]
		restartButton.scale.copy(restartButtonObj.scale)
		restartButton.scale.multiplyScalar(.4)
	}

	initOperationInterface(restartButton)

	let modeChange = {}
	initInputAndOutputGroups()
	initGoals(modeChange,restartButton)
	modeChange.campaign()

	await initMenu(modeChange)
}