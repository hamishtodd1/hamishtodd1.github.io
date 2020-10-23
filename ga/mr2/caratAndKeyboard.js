function initCarat() {
    const caratVerticesBuffer = new Float32Array(quadBuffer.length)
    for (let i = 0; i < quadBuffer.length; ++i)
    {
        caratVerticesBuffer[i] = quadBuffer[i]
        if (i % 4 === 0)
        {
            caratVerticesBuffer[i] *= .1
            if (caratVerticesBuffer[i] < 0.)
                caratVerticesBuffer[i] = 0.
        }
    }
    Object.assign(carat, verticesDisplayWithPosition(caratVerticesBuffer, gl.TRIANGLES,1.,1.,1.))
    addRenderFunction(() =>
    {
        let msSinceFlashingStart = Date.now() - carat.flashingStart
        if (Math.floor(msSinceFlashingStart / 500.) % 2 === 0)
        {
            //turn off depth test?
            carat.renderFunction()
        }
    },"end")

    carat.moveAlongString = function (amount) {
        carat.positionInString = clamp(carat.positionInString + amount, 0, backgroundString.length)
    }
    bindButton("ArrowRight", () => carat.moveAlongString(1))
    bindButton("ArrowLeft", () => carat.moveAlongString(-1))

    mouseResponses.push({
        z: () => 0., //if it's in the pad
        start: () => { carat.teleport(mouse.position.x, mouse.position.y) }
    })

    carat.teleport = function (x, y) {
        carat.position.set(x, y)
        carat.flashingStart = Date.now()
        carat.positionInString = -1
    }
    carat.addToPosition = function (x, y) {
        carat.teleport(
            carat.position.x + x,
            carat.position.y + y)
    }
    bindButton("ArrowUp", () => carat.addToPosition(0., 1.))
    bindButton("ArrowDown", () => carat.addToPosition(0., -1.))
    bindButton("Home", () => carat.addToPosition(-999., 0.))
    bindButton("End", () => carat.addToPosition(999., 0.))

    addStringAtCarat = function (str)
    {
        backgroundStringSplice(carat.positionInString, 0, str)
        carat.moveAlongString(str.length)
    }
}
function backgroundStringSplice(start, deleteCount, newString)
{
    let distanceFromEnd = backgroundString.length - carat.positionInString

    backgroundString =
        backgroundString.substring(0, start) +
        newString +
        backgroundString.substring(start + deleteCount)

    if(carat.positionInString > start + deleteCount)
        carat.positionInString = backgroundString.length - distanceFromEnd
}

function initTypeableCharacters()
{
    let typeableCharacters = ""
    function makeCharacterTypeable(character) {
        typeableCharacters += character
        bindButton(character, () => addStringAtCarat(character))
    }

    let initialCharacters = "abcdefghijklmnopqrstuvwxyz()=+-/I "
    for (let i = 0; i < initialCharacters.length; ++i)
        makeCharacterTypeable(initialCharacters[i])
    initCharacterTexture(typeableCharacters)

    return typeableCharacters
}