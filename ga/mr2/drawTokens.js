/*
 * We distinguish between "draw" and "render": render is for-real, draw is registering what is to be rendered
 */

function initDrawTokens() {
    let toolbarHeight = 0.//1.5
    
    let drawingPosition = new ScreenPosition()

    let lineNumber = 0

    function drawTokenCharacters(tokenStart, tokenEnd) {
        for (let positionInString = tokenStart; positionInString < tokenEnd; ++positionInString) {
            if(positionInString >= tokenStart)
                carat.duringParseFunc(drawingPosition, positionInString,lineNumber)
            
            let currentCharacter = backgroundString[positionInString]
            if (proxyPairs.indexOf(currentCharacter) === -1)
                addCharacterToDraw(currentCharacter, 0., 0., 0., drawingPosition)
            else {
                let index = proxyPairs.indexOf(currentCharacter)
                index += 1-(index%2)
                addCharacterToDraw(proxyPairs[index], 0., 0., 0., drawingPosition)
            }
            drawingPosition.x += characterWidth
        }
    }
    
    let tokensWhoseCharactersDontGetDrawn = [
        "coloredName","\n"
    ]
    drawTokens = function (errorReportText) {
        lineNumber = 0

        const column0Position = mainCamera.rightAtZZero - 15.
        drawingPosition.x = column0Position
        drawingPosition.y = mainCamera.topAtZZero - .5 - toolbarHeight

        carat.preParseFunc()

        forEachToken((tokenIndex, tokenStart, tokenEnd, token, lexeme) => {
            if( tokenIndex === errorReportText.tokenIndex)
                errorReportText.position.copy(drawingPosition)

            if (tokensWhoseCharactersDontGetDrawn.indexOf(token) === -1) {
                drawTokenCharacters(tokenStart, tokenEnd)
                return
            }

            carat.duringParseFunc(drawingPosition, tokenStart,lineNumber)

            switch (token) {
                case "\n":
                    drawingPosition.y -= 1.
                    drawingPosition.x = column0Position

                    ++lineNumber

                    break

                case "coloredName":
                    if (checkIfTokenIsInProgress(tokenEnd))
                        drawTokenCharacters(tokenStart, tokenEnd)
                    else {
                        drawName(lexeme, drawingPosition.x + .5, drawingPosition.y)
                        // if(frameCount === 5)
                        //     log(lexeme)
                        // if(frameCount === 6)
                        //     debugger
                        drawingPosition.x += 1.

                        carat.moveOutOfToken(tokenStart, tokenEnd)
                    }
                    
                    break
            }
        })

        carat.postParseFunc()
    }
}