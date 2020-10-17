/*

*/

async function initPad() {
    let carat = initCarat()
    initTypeableCharacters(carat)

    let drawingPosition = new ScreenPosition()
    let positionInStringClosestToCaratPosition = new ScreenPosition()
    updateFunctions.push(() => {   
        let drawingPositionInString = 0
        let spaceWidth = 1./3.

        let positionInStringClosestToCaratPositionInString = -1
        positionInStringClosestToCaratPosition.x = Infinity
        positionInStringClosestToCaratPosition.y = Infinity
        
        drawingPosition.x = 0.
        let yPositionOfVerticalCenterOfTopLine = -.5
        drawingPosition.y = yPositionOfVerticalCenterOfTopLine
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
                drawingPosition.x += spaceWidth
            else if (currentCharacter === "\n") {
                drawingPosition.x = 0.
                drawingPosition.y -= 1.
            }
        }

        if (carat.positionInString === -1) {
            carat.positionInString = positionInStringClosestToCaratPositionInString
            carat.position.copy(positionInStringClosestToCaratPosition)
        }
        carat.lineNumber = Math.floor(-carat.position.y)
    })
}

