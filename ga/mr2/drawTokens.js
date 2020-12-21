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
                addCharacterToDraw(currentCharacter, drawingPosition)
            else {
                let index = proxyPairs.indexOf(currentCharacter)
                index += 1-(index%2)
                addCharacterToDraw(proxyPairs[index], drawingPosition)
            }
            drawingPosition.x += characterWidth
        }
    }

    let proxyPairs = ["&",JOIN_SYMBOL,"^",MEET_SYMBOL,"~",DAGGER_SYMBOL,".",INNER_SYMBOL]
    
    let tokensWhoseCharactersDontGetDrawn = [
        "coloredName","\n"
    ]
    drawTokens = function () {
        lineNumber = 0

        drawingPosition.x = -mainCamera.rightAtZZero
        drawingPosition.y = mainCamera.topAtZZero - .5 - toolbarHeight

        carat.preParseFunc()

        forEachToken((tokenIndex, tokenStart, tokenEnd, token, lexeme) => {
            if(errorHighlightTokenIndices.indexOf(tokenIndex) !== -1)
                placeErrorHighlight(drawingPosition)

            if (tokensWhoseCharactersDontGetDrawn.indexOf(token) === -1) {
                drawTokenCharacters(tokenStart, tokenEnd)
                return
            }

            carat.duringParseFunc(drawingPosition, tokenStart,lineNumber)

            switch (token) {
                case "\n":
                    drawingPosition.y -= 1.
                    drawingPosition.x = -mainCamera.rightAtZZero

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