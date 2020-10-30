/*
    Surely if you can have infinities visualized you can have infinitesimals
    Look out for what happens to them when you have your disc model

    z = x*x + 2*x*y

    want a debug mode where you just see the characters
    And it goes along and highlights the parts of the text you care about

    
*/

function initCompileViewer(displayableCharacters, columnBackground) {

    let lineStack = []
    function clearStack() {
        while (lineStack.length !== 0) {
            let thing = lineStack.pop()
            if (isMv(thing))
                delete thing
        }
        lineStack.length = 0
    }

    //better as an enum but hey
    let finiteCategories = {
        infixFunction: ["+", "/", "-"],
        separator: ["(", ")", ",", " "],
        function: ["dual", "earth", "sq"], //and user stuff gets added I guess
    }
    let categoryNames = Object.keys(finiteCategories)

    let tokenCategories = []
    let tokenStarts = []
    let declarationTokenIndices = {}
    getTokenEnd = function (tokenInfo) {
        let tokenIndex = typeof tokenInfo === "number" ? tokenInfo : declarationTokenIndices[tokenInfo]
        return tokenIndex === tokenStarts.length - 1 ? backgroundString.length : tokenStarts[tokenIndex + 1]
    }
    declarationPosition = function (name) {
        return tokenStarts[declarationTokenIndices[name]]
    }

    getNewNameAssociatedToTokenIndex = function(tokenIndex) {
        for (variableName in declarationTokenIndices) {
            if (declarationTokenIndices[variableName] === tokenIndex)
                return variableName
        }
        return null
    }

    let drawingPosition = new ScreenPosition()
    compileView = () => {
        let backgroundStringLength = backgroundString.length
        carat.preParseFunc()

        let alphabet = "abcdefghijklmnopqrstuvwxyz"

        //memory leak?
        tokenCategories.length = 0
        tokenStarts.length = 0

        //////////////////////////
        ////  TOKENIZINGING   ////
        //////////////////////////

        {
            function getIndexOfLineEnd(positionInString) {
                let addition = 0
                while (backgroundString[positionInString + addition] !== "\n" && positionInString + addition < backgroundStringLength)
                    ++addition

                return positionInString + addition
            }

            let positionInString = 0
            while (positionInString < backgroundStringLength) {
                let tokenStartCharacter = backgroundString[positionInString]
                tokenStarts.push(positionInString)

                if (tokenStartCharacter === "I") {
                    tokenCategories.push("interval")
                    positionInString += 1
                }
                else if (tokenStartCharacter === "\n") {
                    tokenCategories.push("newline")

                    let tokenLength = 1
                    if (backgroundString.substr(positionInString + 1, 5) === "color")
                        tokenLength += 5
                    positionInString += tokenLength
                }
                else if (freeVariableStartCharacters.indexOf(tokenStartCharacter) !== -1) {

                    let tokenLength = getLiteralLength(positionInString) //should only need this here 

                    if (backgroundString.substr(positionInString + tokenLength, 5) === "color")
                        tokenLength += 5

                    tokenCategories.push("literal")
                    positionInString += tokenLength
                }
                else if (tokenStartCharacter === "/" && backgroundString[positionInString + 1] === "/") {
                    tokenCategories.push("comment")
                    positionInString = getIndexOfLineEnd(positionInString)
                }
                else {
                    let identified = false
                    for (let categoryIndex = 0, numCategories = categoryNames.length; categoryIndex < numCategories && !identified; ++categoryIndex) {
                        let categoryName = categoryNames[categoryIndex]
                        let possibleTokenArray = finiteCategories[categoryName]
                        for (let j = 0, jl = possibleTokenArray.length; j < jl && !identified; ++j) {
                            if (backgroundString.substr(positionInString, possibleTokenArray[j].length) === possibleTokenArray[j]) {
                                tokenCategories.push(categoryName)
                                positionInString += possibleTokenArray[j].length
                                identified = true
                            }
                        }
                    }

                    if (!identified && alphabet.indexOf(tokenStartCharacter) !== -1) {
                        tokenCategories.push("identifier")
                        while (alphabet.indexOf(backgroundString[positionInString]) !== -1)
                            ++positionInString
                    }
                }   
            }
        }

        function forEachToken(func) {
            for (let tokenIndex = 0, numTokens = tokenCategories.length; tokenIndex < numTokens; ++tokenIndex) {
                let tokenStart = tokenStarts[tokenIndex]
                let tokenEnd = getTokenEnd(tokenIndex)
                let token = backgroundString.substr(tokenStart, tokenEnd - tokenStart)
                let tokenCategory = tokenCategories[tokenIndex]

                func(tokenIndex,tokenStart,tokenEnd,tokenCategory,token)
            }
        }

        /////////////////////////
        ////  INTERPRETING   ////
        /////////////////////////

        {
            let positionInOrderedNames = 0
            function setName(tokenIndex) {
                if (positionInOrderedNames >= orderedNames.length )
                    orderedNames.push(getLowestUnusedName())

                let name = orderedNames[positionInOrderedNames]
                ++positionInOrderedNames
                declarationTokenIndices[name] = tokenIndex
            }

            for (propt in declarationTokenIndices)
                delete declarationTokenIndices[propt]

            let lineStack = []
            let ignoreLine = false
            forEachToken((tokenIndex, tokenStart, tokenEnd, tokenCategory, token) => {
                if(ignoreLine) {
                    if(token === "\n")
                        ignoreLine = false
                    else
                        return
                }

                switch (tokenCategory) {
                    case "literal":
                        setName(tokenIndex)
                        break

                    case "newline":
                        let result = lineStack.pop()
                        if (isMv(result))
                            setName(tokenIndex)
                        clearStack()
                        break
                    
                    case "identifier":
                        if(orderedNames.indexOf(token) !== -1) {
                            //interesting to see what happens when you do stuff with variables above the place where they're defined
                        }
                        else if (finiteCategories.function.indexOf(token) !== -1) {
                            //yeah do some functions
                        }
                        else {
                            console.error("uncaught identifier: ", token)
                            clearStack()
                            ignoreLine = true
                        }
                        break
                }
            })
        }

        ///////////////////
        ////  DRAWING  ////
        ///////////////////

        drawingPosition.x = -mainCamera.rightAtZZero + 1.
        drawingPosition.y = mainCamera.topAtZZero - .5
        columnBackground.position.copy(drawingPosition)
        
        let namesInLine = []
        function drawAndMoveAlong(name,tokenStart,tokenEnd) {
            // if(name === "b" && drawingPosition.y < -4.)
            //     debugger
            namesInLine.push(name)
            addMvToRender(name, drawingPosition.x + .5, drawingPosition.y, .5, true)
            drawingPosition.x += 1.

            moveCaratOutOfBox(tokenStart, tokenEnd)
        }

        function moveCaratOutOfBox(tokenStart,tokenEnd) {
            if (tokenStart < carat.positionInString && carat.positionInString < tokenEnd) {
                if (carat.positionInString < tokenStart + (tokenEnd - tokenStart) / 2.)
                    carat.positionInString = tokenEnd
                else
                    carat.positionInString = tokenStart
            }
        }
        
        function drawTokenCharacters(tokenStart,tokenEnd) {
            for (let positionInString = tokenStart; positionInString < tokenEnd; ++positionInString) {
                carat.duringParseFunc(drawingPosition, positionInString)

                let currentCharacter = backgroundString[positionInString]
                if (currentCharacter !== " ")
                    addCharacterToDraw(currentCharacter, drawingPosition)
                drawingPosition.x += characterWidth
            }
        }

        function potentiallyDrawFirstDeclaration(tokenIndex,tokenStart,tokenEnd) {
            let variableName = getNewNameAssociatedToTokenIndex(tokenIndex)
            if (variableName !== null) {
                colorPointValues[variableName] = backgroundString.substr(tokenEnd - 5, 5) === "color"
                drawAndMoveAlong(variableName,tokenStart,tokenEnd)
            }
            return variableName
        }

        forEachToken((tokenIndex, tokenStart, tokenEnd, tokenCategory, token) => {

            carat.duringParseFunc(drawingPosition, tokenStart)

            switch (tokenCategory) {
                case "newline":
                    drawingPosition.x = -mainCamera.rightAtZZero
                    potentiallyDrawFirstDeclaration(tokenIndex, tokenStart, tokenEnd)

                    for (let i = 0; i < displayWindows.length; ++i) {
                        if (drawingPosition.y === displayWindows[i].verticalPositionToRenderMvsFrom) {
                            // debugger
                            displayWindows[i].numMvs = 0
                            for (let j = 0; j < namesInLine.length; ++j) {
                                if (orderedNames.indexOf(namesInLine[j]) !== -1)
                                    displayWindows[i].addMv(namesInLine[j]) //TODO shouldn't be any repeats
                            }
                        }
                    }
                    namesInLine.length = 0

                    drawingPosition.y -= 1.
                    drawingPosition.x = -mainCamera.rightAtZZero + 1.

                    break

                case "literal":
                    let name = potentiallyDrawFirstDeclaration(tokenIndex, tokenStart, tokenEnd)
                    parseMv(backgroundString.substr(tokenStart, tokenEnd-tokenStart), namedMvs[name])
                    lineStack.push(name)
                    break

                case "identifier":
                    if (orderedNames.indexOf(token) !== -1) {
                        drawAndMoveAlong(token, tokenStart, tokenEnd)
                        lineStack.push(token)
                    }
                    else if (functions.indexOf(token) !== -1)
                        drawTokenCharacters(tokenStart, tokenEnd)
                    else
                        drawTokenCharacters(tokenStart, tokenEnd)

                    
                    break

                default:
                    drawTokenCharacters(tokenStart,tokenEnd)
            }
        })

        carat.postParseFunc()

        clearStack()

        delete tokenCategories
        return
    }
}