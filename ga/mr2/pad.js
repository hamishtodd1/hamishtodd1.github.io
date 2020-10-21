/*
    Surely if you can have infinities visualized you can have infinitesimals
    Look out for what happens to them when you have your disc model

    z = x*x + 2*x*y
*/

async function initPad(freeVariableCharacters) {

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
        
        earth = function(u,v) {
            let column = Math.floor(u*earthImageWidth)
            let row = Math.floor(v*earthImageHeight)
            let index = row * earthImageWidth + column

            earthPixels[index * 4 + 0] / 255.
            earthPixels[index * 4 + 1] / 255.
            earthPixels[index * 4 + 2] / 255.
        }
    }
    
    let stack = []
    function clearStack() {
        while(stack.length !== 0) {
            let thing = stack.pop()
            if (isMv(thing))
                delete thing
        }
        stack.length = 0
    }

    let carat = initCarat()
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

    let testPoint = new Float32Array(16)
    pointX(testPoint, .3)
    pointW(testPoint, 1.)

    let drawingPosition = new ScreenPosition()
    let positionInStringClosestToCaratPosition = new ScreenPosition()
    updateFunctions.push(() => {   
        let drawingPositionInString = 0

        let positionInStringClosestToCaratPositionInString = -1
        positionInStringClosestToCaratPosition.x = Infinity
        positionInStringClosestToCaratPosition.y = Infinity
        
        drawingPosition.x =-mainCamera.rightAtZZero + 1.
        drawingPosition.y = mainCamera.topAtZZero - .5
        columnBackground.position.copy(drawingPosition)

        let nextOrderedNameNumber = 0

        let backgroundStringLength = backgroundString.length
        for (drawingPositionInString; drawingPositionInString <= backgroundStringLength; ++drawingPositionInString) {
            //carat position
            {
                if (carat.positionInString !== -1 && drawingPositionInString === carat.positionInString) {
                    if (carat.position.x !== drawingPosition.x || carat.position.y !== drawingPosition.y)
                        carat.flashingStart = Date.now()
                    carat.position.copy(drawingPosition)
                }

                if (carat.positionInString === -1) {
                    let closestYDist = Math.abs(positionInStringClosestToCaratPosition.y - carat.position.y)
                    let closestXDist = Math.abs(positionInStringClosestToCaratPosition.x - carat.position.x)
                    let drawingYDist = Math.abs(drawingPosition.y - carat.position.y)
                    let drawingXDist = Math.abs(drawingPosition.x - carat.position.x)
                    if (drawingYDist < closestYDist || (drawingYDist === closestYDist && drawingXDist < closestXDist) ) {
                        positionInStringClosestToCaratPositionInString = drawingPositionInString
                        positionInStringClosestToCaratPosition.copy(drawingPosition)
                    }
                }
                if (drawingPositionInString >= backgroundStringLength)
                    break
            }

            let currentCharacter = backgroundString[drawingPositionInString]
            if (currentCharacter === " ")
                drawingPosition.x += characterWidth
            else if (currentCharacter === "\n") {
                if(stack.length !== 0) {
                    let result = stack.pop()
                    clearStack()

                    if (isMv(result) ) { //if it's just a name you don't want it
                        let name = orderedNames[nextOrderedNameNumber]
                        let outputMv = namedMvs[name]
                        copyMv(result, outputMv)
                        
                        let x = -mainCamera.rightAtZZero + .5
                        addMvToRender(name, x, drawingPosition.y)
                        addFrameToDraw(x, drawingPosition.y, name)
                        ++nextOrderedNameNumber
                    }
                }
                drawingPosition.x = -mainCamera.rightAtZZero + 1.
                drawingPosition.y -= 1.
            }
            else if (freeVariableCharacters.indexOf(currentCharacter) !== -1) {
                let tokenStart = drawingPositionInString
                while (freeVariableCharacters.indexOf(backgroundString[drawingPositionInString + 1]) !== -1)
                    ++drawingPositionInString
                let tokenEnd = drawingPositionInString
                let valuesString = backgroundString.substr(tokenStart, tokenEnd - tokenStart + 1)
                let valuesArr = valuesString.split(",")

                let name = orderedNames[nextOrderedNameNumber]
                let outputMv = namedMvs[name]
                for(let i = 0; i < 16; ++i)
                    outputMv[i] = parseFloat(valuesArr[i])

                stack.push(name)
                    
                let x = drawingPosition.x + .5
                addMvToRender(name, x, drawingPosition.y)
                addFrameToDraw(x, drawingPosition.y, name)
                ++nextOrderedNameNumber
                
                drawingPosition.x += 1.
            }
            else if(currentCharacter === "I") {
                addCharacterToDraw("I", drawingPosition)
                stack.push("I")
                drawingPosition.x += characterWidth
            }
            else if( currentCharacter === ")") {
                let argument = stack.pop()
                let func = stack.pop()
                if ( namedMvs[argument] !== undefined && func === "earth") {
                    let mv = new Float32Array(16)
                    pointX(mv,-.2)
                    pointW(mv,1.)
                    stack.push(mv)

                    //somehow make earth(namedMvs[argument])
                }

                addCharacterToDraw(")", drawingPosition)
                drawingPosition.x += characterWidth
            }
            else if (typeableCharacters.indexOf(currentCharacter) !== -1) {
                if(backgroundString.substr(drawingPositionInString,6) === "earth(")
                    stack.push("earth")

                addCharacterToDraw(currentCharacter, drawingPosition)
                drawingPosition.x += characterWidth
            }
            else
                console.error("uncaught character: ", currentCharacter)
        }

        if (carat.positionInString === -1) {
            carat.positionInString = positionInStringClosestToCaratPositionInString
            carat.position.copy(positionInStringClosestToCaratPosition)
        }
        carat.lineNumber = Math.floor(-carat.position.y)

        clearStack()

        // if (0)
        // {
        //     addFrameToDraw(0., 0., orderedNames[nextOrderedNameNumber])
        //     addMvToRender(testPoint, orderedNames[nextOrderedNameNumber], 0., 0.)
        //     ++nextOrderedNameNumber

        //     addFrameToDraw(3., 3., orderedNames[nextOrderedNameNumber])
        //     addMvToRender(testPoint, orderedNames[nextOrderedNameNumber], 3., 3.)
        //     ++nextOrderedNameNumber
        // }
    })
}

function isMv(thing) {
    return thing instanceof Float32Array && thing.length === 16
}