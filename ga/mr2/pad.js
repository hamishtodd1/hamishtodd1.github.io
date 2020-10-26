/*
    Surely if you can have infinities visualized you can have infinitesimals
    Look out for what happens to them when you have your disc model

    z = x*x + 2*x*y

    want a debug mode where you just see the characters
    And it goes along and highlights the parts of the text you care about
*/

const freeVariableCharacters = "0123456789.,-e"
const freeVariableStartCharacters = "0123456789.-"
function getLiteralLength(literalStart) {
    let literalLength = 0
    let numCommasSoFar = 0
    for (literalLength; 
        literalStart + literalLength < backgroundString.length && 
        freeVariableCharacters.indexOf(backgroundString[literalStart + literalLength]) !== -1 &&
        numCommasSoFar < 16;
        ++literalLength) {
        if (backgroundString[literalStart + literalLength] === "," )
            ++numCommasSoFar
    }

    return literalLength
}
function parseMv(str,target) {
    let valuesArr = str.split(",")
    for (let i = 0; i < 16; ++i)
        target[i] = parseFloat(valuesArr[i])
}

async function initPad() {

    //more generic way to do it is probably render to a 1x1 pixel offscreen canvas that you read from
    //unperformant but probably the same as this
    {
        const $earthImage = new Image();
        await (new Promise(resolve => {
            $earthImage.src = "data/earthColor.png"
            $earthImage.onload = resolve
        }))
        let earthImageWidth = $earthImage.width;
        let earthImageHeight = $earthImage.height;

        let $earthCanvas = document.createElement('canvas');
        $earthCanvas.width = earthImageWidth;
        $earthCanvas.height = earthImageHeight;
        let ctx = $earthCanvas.getContext('2d')
        ctx.drawImage($earthImage, 0, 0, earthImageWidth, earthImageHeight)
        let earthPixels = ctx.getImageData(0, 0, earthImageWidth, earthImageHeight).data
        
        earth = function(u,v, mv) {
            if (u < 0. || 1. < u ||
                v < 0. || 1. < v )
            {
                zeroMv(mv)
            }
            else {
                let column = Math.floor(u * earthImageWidth)
                let row = Math.floor(v * earthImageHeight)
                let index = row * earthImageWidth + column

                let r = earthPixels[index * 4 + 0] / 255.
                let g = earthPixels[index * 4 + 1] / 255.
                let b = earthPixels[index * 4 + 2] / 255.

                //extract hue
                //and fuck the rest
            }

            return mv
        }
    }

    let lineStack = []
    function clearStack() {
        while(lineStack.length !== 0) {
            let thing = lineStack.pop()
            if (isMv(thing))
                delete thing
        }
        lineStack.length = 0
    }

    initCarat()
    let typeableCharacters = initTypeableCharacters()

    let pointsBuffer = new Float32Array(quadBuffer.length)
    for(let i = 0; i < quadBuffer.length; ++i) {
        pointsBuffer[i] = quadBuffer[i]
        if (i % 4 === 0)
            pointsBuffer[i] -= .5
        if (i % 4 === 1 && pointsBuffer[i] < 0.)
            pointsBuffer[i] = -999999.
        if (i % 4 === 2)
            pointsBuffer[i] = mainCamera.frontAndBackZ //positive number, so weird
    }
    let columnBackground = verticesDisplayWithPosition(pointsBuffer, gl.TRIANGLES, .22, .22, .22)
    addRenderFunction(columnBackground.renderFunction)

    let drawingPosition = new ScreenPosition()
    let gridPositionClosestToCaratPosition = new ScreenPosition()
    let compile = () => {   
        let drawingPositionInString = 0

        let positionInStringClosestToCaratPosition = -1
        gridPositionClosestToCaratPosition.x = Infinity
        gridPositionClosestToCaratPosition.y = Infinity
        
        drawingPosition.x =-mainCamera.rightAtZZero + 1.
        drawingPosition.y = mainCamera.topAtZZero - .5
        columnBackground.position.copy(drawingPosition)

        let drawingPositionInOrderedNames = 0
        carat.positionInOrderedNames = 0

        let namesInLine = []

        //bit memory-leaky
        literalsPositionsInString = {}
        declarationPositionsInString = {}

        let lineNumber = 0

        function drawMv(name) {
            namesInLine.push(name)

            let endOfFirstOcurrence = -1
            if (literalsPositionsInString[name] !== undefined)
                endOfFirstOcurrence = literalsPositionsInString[name] + getLiteralLength(literalsPositionsInString[name])
            else
                endOfFirstOcurrence = declarationPositionsInString[name] + 1
            colorPointValues[name] = backgroundString.substr(endOfFirstOcurrence, 5) === "color"

            if (mouse.inBounds(drawingPosition.x, drawingPosition.x + 1., drawingPosition.y + .5, drawingPosition.y - .5)) {
                mouseDw.respondToHover(drawingPosition.x + .5, drawingPosition.y, lineNumber, name)

                if (mouse.rightClicking && !mouse.rightClickingOld) {
                    if (backgroundString.substr(endOfFirstOcurrence, 5) !== "color" ) {
                        backgroundStringSplice(endOfFirstOcurrence, 0, "color")
                        if( drawingPositionInString >= endOfFirstOcurrence )
                            drawingPositionInString += 5
                    }
                    else {
                        backgroundStringSplice(endOfFirstOcurrence, 5, "")
                        if( drawingPositionInString >= endOfFirstOcurrence )
                            drawingPositionInString -= 5
                    }
                    backgroundStringLength = backgroundString.length
                }
            }

            addMvToRender(name, drawingPosition.x + .5, drawingPosition.y, .5, true)

            drawingPosition.x += 1.
        }

        let backgroundStringLength = backgroundString.length
        for (drawingPositionInString; drawingPositionInString <= backgroundStringLength; ++drawingPositionInString) {
            
            //-------- Carat position

            {
                if (carat.positionInString !== -1 && drawingPositionInString === carat.positionInString) {
                    if (carat.position.x !== drawingPosition.x || carat.position.y !== drawingPosition.y)
                        carat.flashingStart = Date.now()

                    carat.position.copy(drawingPosition)
                    carat.positionInOrderedNames = drawingPositionInOrderedNames
                    caratDw.lineToRenderMvsFrom = lineNumber
                }

                if (carat.positionInString === -1) {
                    let closestYDist = Math.abs(gridPositionClosestToCaratPosition.y - carat.position.y)
                    let closestXDist = Math.abs(gridPositionClosestToCaratPosition.x - carat.position.x)
                    let drawingYDist = Math.abs(drawingPosition.y - carat.position.y)
                    let drawingXDist = Math.abs(drawingPosition.x - carat.position.x)
                    if (drawingYDist < closestYDist || (drawingYDist === closestYDist && drawingXDist < closestXDist) ) {
                        positionInStringClosestToCaratPosition = drawingPositionInString
                        gridPositionClosestToCaratPosition.copy(drawingPosition)
                    }
                }
                if (drawingPositionInString >= backgroundStringLength)
                    break
            }

            //-------Bifuricate!

            let currentCharacter = backgroundString[drawingPositionInString]
            
            if (currentCharacter === " ")
                drawingPosition.x += characterWidth
            else if (currentCharacter === "\n") {

                //---------End of line

                drawingPosition.x = -mainCamera.rightAtZZero

                if(lineStack.length !== 0) {
                    let result = lineStack.pop()
                    clearStack()

                    if (isMv(result) ) { //if it's just a name you don't want it
                        let name = orderedNames[drawingPositionInOrderedNames]
                        ++drawingPositionInOrderedNames
                        declarationPositionsInString[name] = drawingPositionInString

                        drawMv(name)
                        if (backgroundString.substr(drawingPositionInString + 1, 5) === "color")
                            drawingPositionInString += 5

                        copyMv(result, namedMvs[name])
                    }
                }

                drawingPosition.y -= 1.
                drawingPosition.x = -mainCamera.rightAtZZero + 1.

                for(let i = 0; i < displayWindows.length; ++i) {
                    if(lineNumber === displayWindows[i].lineToRenderMvsFrom) {
                        displayWindows[i].numMvs = 0
                        for (let j = 0; j < namesInLine.length; ++j) {
                            if (orderedNames.indexOf(namesInLine[j]) !== -1)
                                displayWindows[i].addMv(namesInLine[j])
                        }
                    }
                }
                namesInLine.length = 0

                ++lineNumber
            }
            else if (freeVariableStartCharacters.indexOf(currentCharacter) !== -1) {

                //---------Free variable
                
                let name = orderedNames[drawingPositionInOrderedNames]
                ++drawingPositionInOrderedNames
                
                literalsPositionsInString[name] = drawingPositionInString
                let literalLength = getLiteralLength(drawingPositionInString)
                parseMv(backgroundString.substr(drawingPositionInString, literalLength), namedMvs[name])
                drawingPositionInString += literalLength - 1 //-1 because the loop does a +1
                lineStack.push(name)

                drawMv(name)
                if (backgroundString.substr(drawingPositionInString + 1, 5) === "color")
                    drawingPositionInString += 5
            }
            else if(currentCharacter === "I") {

                //---------Interval

                addCharacterToDraw("I", drawingPosition)
                lineStack.push("I")
                drawingPosition.x += characterWidth
            }
            else if( currentCharacter === ")") {

                //---------Function application
                //yeah this would be better parsed out and turned into reverse polish

                let argumentName = lineStack.pop()
                let func = lineStack.pop()
                if ( namedMvs[argumentName] !== undefined ) {
                    let argument = namedMvs[argumentName]
                    if (func === "earth") {
                        let mv = new Float32Array(16)
                        pointY(mv, -.2)
                        pointW(mv, 1.)
                        lineStack.push(mv)

                        //somehow make earth(namedMvs[argument])
                        //it maps points to positions
                    }
                    if(func === "dual") {
                        let mv = new Float32Array(16)
                        copyMv(argument,mv)
                        dual(mv)
                        lineStack.push(mv)
                    }
                }

                addCharacterToDraw(")", drawingPosition)
                drawingPosition.x += characterWidth
            }
            else if (typeableCharacters.indexOf(currentCharacter) !== -1) {

                //---------Normal character

                if (backgroundString.substr(drawingPositionInString, 2) === "b ")
                // if (colorCharacters.indexOf(currentCharacter) !== -1 )
                {
                    let name = "b";
                    namesInLine.push(name)
                    lineStack.push(name)

                    drawMv(name)
                }
                else
                {
                    if (backgroundString.substr(drawingPositionInString, 6) === "earth(")
                        lineStack.push("earth")
                    if (backgroundString.substr(drawingPositionInString, 5) === "dual(")
                        lineStack.push("dual")

                    addCharacterToDraw(currentCharacter, drawingPosition)
                    drawingPosition.x += characterWidth
                }
            }
            else {
                console.error("uncaught character: ", currentCharacter)
            }
        }

        if (carat.positionInString === -1) {
            carat.positionInString = positionInStringClosestToCaratPosition
            carat.position.copy(gridPositionClosestToCaratPosition)
        }
        carat.lineNumber = Math.floor(-carat.position.y)

        clearStack()
    }
    updateFunctions.splice(0,0,compile)
}

function isMv(thing) {
    return thing instanceof Float32Array && thing.length === 16
}