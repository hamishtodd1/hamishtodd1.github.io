/*
	TODO calculator (Andy/slack/pontus/alan kay/Steven Der Kenick/Chris Doran/Joan Lasenby)
		Animations

	Grab and drag little monster with your finger
	Drag over to mv, little monster picks it up. Could have dragged
	Whatever mv you put it on, it applies that function to that mv

	Switch between orthogonal and isometric view

	Keeping to R -> CL(2) might be good
		Equivalence between shapes and actions of a kind that you frequently see in the world around you
		If you want spec rel, make a level where a rocket is moving around or whatever and they have to program something to follow it

	TODO for showing to Jon Blow / funders
		Multiple fun levels
			Try doodling with the scalar input and see what you get
		Proof of concept for video
		If nothing good, try introducing the feedback differential-making thing
		Don't go 3d, and for now the craziness can be a nice surprise

	Others to send to: Roger Penrose, Robin Green, Casey
*/


async function init()
{
	// await initMultivectorAppearances_()
	// return

	await initOperatorAppearances()
	await initMultivectorAppearances()

	initWheelScene()
	return

	// initTankScene()
	// return

	{
		var restartButton = text("Restart (r)")
		restartButton.scale.multiplyScalar(.4)
	}

	initOperationInterface(restartButton)

	let modeChange = {}
	initInputAndOutputGroups()
	initGoals(modeChange,restartButton)
	1?modeChange.campaign(): modeChange.calculator()

	await initMenu(modeChange)
}