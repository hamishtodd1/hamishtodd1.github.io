// No carat when you're recording, probably no names either

//prbably ctrl+

function initCarat()
{
	//these are what is precisely in front of the carat
	carat.positionInString = -1
	carat.lineNumber = -1
	carat.nextOrderedNameNumber = -1

	let oldY = Infinity
	carat.movedVerticallySinceLastFrame = false

	carat.renderOrder = 9999999
	carat.material.depthTest = false
	carat.geometry.translate(.5, 0., 0.)
	pad.add(carat)
	carat.scale.x = .1
	carat.flashingStart = 0.
	carat.teleport = function(x, y) {
		carat.position.set(x, y, carat.position.z)
		carat.flashingStart = clock.getElapsedTime()
		carat.positionInString = -1
	}
	carat.teleportToMousePosition = () => {
		mouse.getZZeroPosition(v1)
		pad.worldToLocal(v1)
		carat.teleport(v1.x, v1.y)
	}
	onClicks.push({
		z: () => mouse.areaIn() === "pad" ? 0. : -Infinity,
		start: () => carat.teleportToMousePosition()
	})
	carat.addToPosition = function(x, y) {
		carat.teleport(
			carat.position.x + x,
			carat.position.y + y)
	}
	let multivectorLiteralCharacters = "0123456789];." //decimal point, hmm
	carat.moveAlongString = function(amount) {
		carat.positionInString = clamp(carat.positionInString + amount, 0, backgroundString.length)
		
		while(multivectorLiteralCharacters.indexOf(backgroundString[carat.positionInString]) !== -1) {
			if(amount > 0)
				++carat.positionInString
			else
				--carat.positionInString
		}
	}
	bindButton("ArrowRight", () => carat.moveAlongString(1))
	bindButton("ArrowLeft", () => carat.moveAlongString(-1))

	bindButton("ArrowUp", () => carat.addToPosition(0., 1.))
	bindButton("ArrowDown", () => carat.addToPosition(0., -1.))
	bindButton("Home", () => carat.addToPosition(-999., 0.))
	bindButton("End", () => carat.addToPosition(999., 0.))

	//TODO scrolling down too
	function getNumLinesOnScreen() {
		return camera.topAtZZero * 2. / getWorldLineHeight()
	}
	bindButton("PageUp", () => {
		carat.addToPosition(0., Math.floor(getNumLinesOnScreen()))
	})
	bindButton("PageDown", () => {
		carat.addToPosition(0., -Math.floor(getNumLinesOnScreen()))
	})

	latterUpdateFunctions.push(() => {
		carat.visible = Math.floor((clock.getElapsedTime() - carat.flashingStart) * 2.) % 2 ? false : true
		if( oldY !== carat.position.y )
			mainDw.resetScene()
		oldY = carat.position.y
	})
}

function initTypeableCharacters(carat, maxCopiesOfALetter)
{
	let characters = {
		array: "",
		instancedMeshes: {}
	}
	addStringAtPosition = (str, position) =>
	{
		backgroundString =
			backgroundString.substring(0, position) +
			str +
			backgroundString.substring(position)
	}
	addStringAtCarat = function (str)
	{
		addStringAtPosition(str, carat.positionInString)
		carat.moveAlongString(str.length)
	}
	characters.add = function (character, displayedCharacter)
	{
		if (displayedCharacter === undefined)
			displayedCharacter = character

		let material = null
		if (character === "|") {
			material = new THREE.MeshBasicMaterial()
			new THREE.TextureLoader().load("data/integral.png", function (result) { material.map = result; material.needsUpdate = true })
			material.getAspect = () => { return 1. }
		}
		else material = text(displayedCharacter, true)

		if (colors[character] !== undefined) {
			material.color.r = colors[character].r * .7 + .3
			material.color.g = colors[character].g * .7 + .3
			material.color.b = colors[character].b * .7 + .3
		}

		let instancedMesh = new THREE.InstancedMesh(unchangingUnitSquareGeometry, material, maxCopiesOfALetter);
		instancedMesh.count = 0
		pad.add(instancedMesh)
		instancedMesh.aspect = material.getAspect()

		characters.instancedMeshes[character] = instancedMesh
		characters.array += character
		if (displayedCharacter !== character) {
			characters.instancedMeshes[displayedCharacter] = instancedMesh
			characters.array += displayedCharacter
		}

		bindButton(character, () => addStringAtCarat(character))
	}
	let initialCharacters = "abcdefghijklmnopqrstuvwxyz |,"
	for (let i = 0; i < initialCharacters.length; i++)
		characters.add(initialCharacters[i])

	bindButton("Tab", () => { for (let i = 0; i < 2; i++) addStringAtCarat(" ") })

	return characters
}