/*
    Plan
        Generic framework for the types, visualizations, literals
        Note that type does not govern viz method though, can have multiple

        projection functions:
            When given a single vec as input, they 
        

    Types:
        world map
        pga element. Different kind of PGA element?
        angle... / bivector...
            bring back that thing about bivectors being adjusted to a certain thing / looked at from a certain angle
        color
        function from positions to colors
        inverse trig function

*/

function initTokenizeEvaluateDisplay(displayableCharacters) {

    initErrorHighlight()

    let identifierCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

    tokenizeEvaluateDisplay = () => {

        let tokens = []

        let tokenStarts = []
        getTokenEnd = function (tokenIndex) {
            return tokenIndex === tokenStarts.length - 1 ? backgroundString.length : tokenStarts[tokenIndex + 1]
        }

        let backgroundStringLength = backgroundString.length

        //////////////////////////
        ////  TOKENIZINGING   ////
        //////////////////////////
        //just breaking it up into separate things, no sophisticated decisions about what to do

        function moveWhile(condition) {
            while (positionInString < backgroundStringLength && condition() )
                ++positionInString
        }

        let positionInString = 0
        while (positionInString < backgroundStringLength) {
            let tokenStartCharacter = backgroundString[positionInString]
            tokenStarts.push(positionInString)

            if (tokenStartCharacter === "/" && backgroundString[positionInString + 1] === "/") {
                tokens.push("comment")
                moveWhile(() => backgroundString[positionInString] !== "\n")
            }
            else if (tokenStartCharacter === " ") {
                tokens.push(" ")
                ++positionInString
            }
            else if (tokenStartCharacter === "\n") {
                tokens.push("\n")
                ++positionInString
            }
            else {
                tokens.push("identifier")
                moveWhile(() => identifierCharacters.indexOf(backgroundString[positionInString]) !== -1)
            }
        }

        function forEachToken(func) {
            for (let tokenIndex = 0, numTokens = tokens.length; tokenIndex < numTokens; ++tokenIndex) {
                let tokenStart = tokenStarts[tokenIndex]
                let tokenEnd = getTokenEnd(tokenIndex)
                let lexeme = backgroundString.substr(tokenStart, tokenEnd - tokenStart)
                let token = tokens[tokenIndex]

                func(tokenIndex,tokenStart,tokenEnd,token,lexeme)
            }
        }

        ///////////////////////
        ////  TRANSPILING  ////
        ///////////////////////

        let errorNewLines = []

        forEachToken((tokenIndex, tokenStart, tokenEnd, token, lexeme) => {

            if(token === "identifier") {
                if (namedMvs[lexeme] !== undefined) {

                }

            }
        })

        ///////////////////
        ////  DRAWING  ////
        ///////////////////
        carat.preParseFunc()

        let drawingPosition = new ScreenPosition()

        drawingPosition.x =-mainCamera.rightAtZZero
        drawingPosition.y = mainCamera.topAtZZero - .5

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
        
        let mvNamesInLine = []
        forEachToken((tokenIndex, tokenStart, tokenEnd, token, lexeme) => {

            carat.duringParseFunc(drawingPosition, tokenStart)

            switch (token) {
                case "\n":
                    if (errorNewLines.indexOf(tokenIndex) !== -1)
                        placeErrorHighlight(drawingPosition)

                    for (let i = 0; i < displayWindows.length; ++i) {
                        if (drawingPosition.y === displayWindows[i].verticalPositionToRenderFrom) {
                            displayWindows[i].numMvs = 0
                            // for (let j = 0; j < mvNamesInLine.length; ++j) {
                            //     if (namedMvs.indexOf(mvNamesInLine[j]) !== -1)
                            //         displayWindows[i].addMv(mvNamesInLine[j])
                            // }
                            // console.error("pictogram array!")
                        }
                    }
                    mvNamesInLine.length = 0

                    drawingPosition.y -= 1.
                    drawingPosition.x = -mainCamera.rightAtZZero

                    break

                case "identifier":
                    // pictogramTypeArrays //namedMvs, 
                    let found = false
                    pictogramTypeArrays.forEach((pictogramArray) => { //hash table is probably needed
                        let names = Object.keys(pictogramArray)
                        for (let i = 0, il = names; i < il && !found; ++i) {
                            if (names[i] === lexeme) {

                                //replaces addMvToRender and drawEarth
                                //also, "mvNamesInLine"
                                pictogramArray.add(lexeme,
                                    drawingPosition.x + .5,
                                    drawingPosition.y,
                                    .5,
                                    true )

                                drawingPosition.x += 1.
                                carat.moveOutOfToken(tokenStart, tokenEnd)

                                found = true
                                break
                            }
                        }
                    })

                    if(!found)
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