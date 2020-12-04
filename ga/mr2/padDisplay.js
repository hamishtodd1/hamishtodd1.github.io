function initPadDisplay() {
    let drawingPosition = new ScreenPosition()

    function drawTokenCharacters(tokenStart, tokenEnd) {
        for (let positionInString = tokenStart; positionInString < tokenEnd; ++positionInString) {
            if(positionInString > tokenStart)
                carat.duringParseFunc(drawingPosition, positionInString)
            
            let currentCharacter = backgroundString[positionInString]
            if (currentCharacter !== " ")
                addCharacterToDraw(currentCharacter, drawingPosition)
            drawingPosition.x += characterWidth
        }
    }
    
    let tokensWhoseCharactersGetDrawn = [
        "uncoloredName","comment","separator","infixSymbol","def","=","postfixSymbol"
    ]
    drawTokens = function () {
        drawingPosition.x = -mainCamera.rightAtZZero
        drawingPosition.y = mainCamera.topAtZZero - .5

        carat.preParseFunc()

        forEachToken((tokenIndex, tokenStart, tokenEnd, token, lexeme) => {

            if(errorHighlightTokenIndices.indexOf(tokenIndex) !== -1)
                placeErrorHighlight(drawingPosition)

            carat.duringParseFunc(drawingPosition, tokenStart)

            if (tokensWhoseCharactersGetDrawn.indexOf(token) !== -1) {
                drawTokenCharacters(tokenStart, tokenEnd)
                return
            }

            switch (token) {
                case " ":
                    drawingPosition.x += characterWidth
                    break
                case "\n":
                    drawingPosition.y -= 1.
                    drawingPosition.x = -mainCamera.rightAtZZero

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

                default:
                    console.error("haven't dealt with this token category: ",token )
            }
        })

        carat.postParseFunc()
    }
}