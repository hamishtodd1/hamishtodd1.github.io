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
    
    drawTokens = function (errorNewLines) {
        drawingPosition.x = -mainCamera.rightAtZZero
        drawingPosition.y = mainCamera.topAtZZero - .5

        carat.preParseFunc()

        forEachToken((tokenIndex, tokenStart, tokenEnd, token, lexeme) => {

            carat.duringParseFunc(drawingPosition, tokenStart)

            switch (token) {
                case "\n":
                    if (errorNewLines.indexOf(tokenIndex) !== -1)
                        placeErrorHighlight(drawingPosition)

                    drawingPosition.y -= 1.
                    drawingPosition.x = -mainCamera.rightAtZZero

                    break

                case "identifier":
                    let alphabetized = lexeme.split('').sort().join('').toLowerCase() //TODO excessive

                    if (coloredNamesAlphabetically.indexOf(alphabetized) !== -1 ) {
                        let inProgress =
                            carat.positionInString === tokenEnd &&
                            carat.indexOfLastTypedCharacter === tokenEnd - 1

                        if ( inProgress) 
                            drawTokenCharacters(tokenStart, tokenEnd)
                        else {
                            drawName(alphabetized, drawingPosition.x + .5, drawingPosition.y)
                            drawingPosition.x += 1.

                            carat.moveOutOfToken(tokenStart, tokenEnd)
                        }   

                        break
                    }

                    drawTokenCharacters(tokenStart, tokenEnd)
                    break

                case "comment":
                    drawTokenCharacters(tokenStart, tokenEnd)
                    break

                case " ":
                    drawingPosition.x += characterWidth
                    break

                default:
                    console.error("haven't dealt with this token category")
            }
        })

        carat.postParseFunc()
    }
}