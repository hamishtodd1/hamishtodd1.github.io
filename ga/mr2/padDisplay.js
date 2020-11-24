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
    
    drawTokens = function () {
        drawingPosition.x = -mainCamera.rightAtZZero
        drawingPosition.y = mainCamera.topAtZZero - .5

        carat.preParseFunc()

        forEachToken((tokenIndex, tokenStart, tokenEnd, token, lexeme) => {

            carat.duringParseFunc(drawingPosition, tokenStart)

            switch (token) {
                case "\n":
                    drawingPosition.y -= 1.
                    drawingPosition.x = -mainCamera.rightAtZZero

                    break

                case "coloredName":
                    let inProgress =
                        carat.positionInString === tokenEnd &&
                        carat.indexOfLastTypedCharacter === tokenEnd - 1

                    if (inProgress)
                        drawTokenCharacters(tokenStart, tokenEnd)
                    else {
                        drawName(lexeme, drawingPosition.x + .5, drawingPosition.y)
                        drawingPosition.x += 1.

                        carat.moveOutOfToken(tokenStart, tokenEnd)
                    }
                    
                    break

                case "uncoloredName":
                    drawTokenCharacters(tokenStart, tokenEnd)
                    break

                case "comment":
                    drawTokenCharacters(tokenStart, tokenEnd)
                    break

                case "separator":
                    drawTokenCharacters(tokenStart, tokenEnd)
                    break

                case "infixSymbol":
                    drawTokenCharacters(tokenStart, tokenEnd)
                    break

                case "def":
                    drawTokenCharacters(tokenStart, tokenEnd)
                    break

                case " ":
                    drawingPosition.x += characterWidth
                    break

                default:
                    console.error("haven't dealt with this token category: ",token )
            }
        })

        carat.postParseFunc()
    }
}