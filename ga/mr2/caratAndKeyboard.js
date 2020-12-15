function checkIfTokenIsInProgress(tokenEnd) {
    return  carat.positionInString === tokenEnd &&
            carat.indexOfLastTypedCharacter === tokenEnd - 1
}

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
    carat.position.x = -1000.
    carat.position.y = 1000.
    addRenderFunction(() => {
        let msSinceFlashingStart = Date.now() - carat.flashingStart
        if (Math.floor(msSinceFlashingStart / 500.) % 2 === 0)
            carat.renderFunction()

        carat.positionInStringOld = carat.positionInString
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

    let alreadModifiedThisFrame = false
    backgroundStringSplice = function (start, deleteCount, newString) {
        if (alreadModifiedThisFrame)
            console.error("only one modification allowed per frame")
        else {
            alreadModifiedThisFrame = true

            let distanceFromEnd = backgroundString.length - carat.positionInString

            backgroundString =
                backgroundString.substring(0, start) +
                newString +
                backgroundString.substring(start + deleteCount)

            if (carat.positionInString > start + deleteCount)
                carat.positionInString = backgroundString.length - distanceFromEnd
        }
    }

    addStringAtCarat = function (str) {
        backgroundStringSplice(carat.positionInString, 0, str)
        carat.moveAlongString(str.length)
    }

    let closestGridPosition = new ScreenPosition()
    let closestStringPosition = -1
    carat.preParseFunc = function()  {
        closestGridPosition.x = Infinity
        closestGridPosition.y = Infinity
    }

    carat.duringParseFunc = function (drawingPosition,drawingPositionInString) 
    {
        if (this.positionInString !== -1 && drawingPositionInString === this.positionInString) {
            if (this.position.x !== drawingPosition.x || this.position.y !== drawingPosition.y)
                this.flashingStart = Date.now()

            this.position.copy(drawingPosition)
            caratDw.verticalPositionToRenderFrom = carat.position.y
        }

        if (this.positionInString === -1) {
            let closestYDist = Math.abs(closestGridPosition.y - this.position.y)
            let closestXDist = Math.abs(closestGridPosition.x - this.position.x)
            let drawingYDist = Math.abs(drawingPosition.y - this.position.y)
            let drawingXDist = Math.abs(drawingPosition.x - this.position.x)
            if (drawingYDist < closestYDist || (drawingYDist === closestYDist && drawingXDist < closestXDist)) {
                closestStringPosition = drawingPositionInString
                closestGridPosition.copy(drawingPosition)
            }
        }
    }

    carat.postParseFunc = function()  {
        if (this.positionInString === -1) {
            this.positionInString = closestStringPosition
            this.position.copy(closestGridPosition)
        }
        this.lineNumber = Math.floor(-this.position.y)

        alreadModifiedThisFrame = false
    }
    
    carat.moveOutOfToken = (tokenStart, tokenEnd) => {
        if (tokenStart < carat.positionInString && carat.positionInString < tokenEnd) {
            let directionGoingIn = carat.positionInString - carat.positionInStringOld > 0
            carat.positionInString = directionGoingIn ? tokenEnd : tokenStart
        }
    }

    getNumLines = () => {
        let numLines = 1
        for (let i = 0, il = backgroundString.length; i < il; ++i)
            if (backgroundString[i] === "\n")
                ++numLines

        return numLines
    }

    bindButton("Enter", () => {
        addStringAtCarat("\n")
    })

    bindButton("1", () => {
        addStringAtCarat(getLowestUnusedName())
    })

    function removeFromString(start, end) {
        backgroundString =
            backgroundString.substring(0, start) +
            backgroundString.substring(end)
        if (carat.positionInString > start)
            carat.positionInString = start
    }
    
    //TODO these should fully remove mvs too. There's really very little reason to see the name after you've made it
    bindButton("Backspace", () => {
        if (carat.positionInString === 0)
            return

        let psLength = getPictogramStringLength(carat.positionInString, true)
        removeFromString(carat.positionInString - Math.max(psLength, 1), carat.positionInString)
    })
    bindButton("Delete", () => {
        if (carat.positionInString === backgroundString.length - 1)
            return

        let psLength = getPictogramStringLength(carat.positionInString, false)
        removeFromString(carat.positionInString, carat.positionInString + Math.max(psLength, 1))
    })
}

function initTypeableCharacters()
{
    let typeableCharacters = ""
    
    let initialCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ(){}+-=/ ,"
    for (let i = 0; i < initialCharacters.length; ++i) {
        let character = initialCharacters[i]

        typeableCharacters += character
        
        bindButton(character, () => {
            backgroundStringSplice(carat.positionInString, 0, character)
            carat.moveAlongString(1)

            carat.indexOfLastTypedCharacter = carat.positionInString - 1

            //could capitalize as a way of indicating differet names
        })
    }
    
    return typeableCharacters
}