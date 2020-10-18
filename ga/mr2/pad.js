/*

*/

async function initPad() {

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
                let outputColumnName = orderedNames[nextOrderedNameNumber]
                addFrameToDraw(-mainCamera.rightAtZZero + .5, drawingPosition.y, outputColumnName)

                ++nextOrderedNameNumber
                
                drawingPosition.x = -mainCamera.rightAtZZero + 1.
                drawingPosition.y -= 1.
            }
            else if (typeableCharacters.indexOf(currentCharacter) !== -1) {
                addCharacterToDraw(currentCharacter, drawingPosition)
                drawingPosition.x += characterWidth
            }
            else
                console.error("uncaught character")
        }

        if (carat.positionInString === -1) {
            carat.positionInString = positionInStringClosestToCaratPositionInString
            carat.position.copy(positionInStringClosestToCaratPosition)
        }
        carat.lineNumber = Math.floor(-carat.position.y)
    })
}