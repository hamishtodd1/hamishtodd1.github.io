/*
    Surely if you can have infinities visualized you can have infinitesimals
    Look out for what happens to them when you have your disc model

    z = x*x + 2*x*y

    want a debug mode where you just see the characters
    And it goes along and highlights the parts of the text you care about

    
*/

function initCompileViewer(displayableCharacters, columnBackground) {

    initErrorHighlight()

    let finiteCategories = {
        infix: ["*","+"],
        separator: ["(", ")", ",", " "]
    }
    let categoryNames = Object.keys(finiteCategories)
    let alphabet = "abcdefghijklmnopqrstuvwxyz"

    let drawingPosition = new ScreenPosition()
    compileView = () => {

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

        getNewNameAssociatedToTokenIndex = function (tokenIndex) {
            for (variableName in declarationTokenIndices) {
                if (declarationTokenIndices[variableName] === tokenIndex)
                    return variableName
            }
            return null
        }

        let backgroundStringLength = backgroundString.length

        carat.preParseFunc()

        //////////////////////////
        ////  TOKENIZINGING   ////
        //////////////////////////

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

        function forEachToken(func) {
            for (let tokenIndex = 0, numTokens = tokenCategories.length; tokenIndex < numTokens; ++tokenIndex) {
                let tokenStart = tokenStarts[tokenIndex]
                let tokenEnd = getTokenEnd(tokenIndex)
                let lexeme = backgroundString.substr(tokenStart, tokenEnd - tokenStart)
                let tokenCategory = tokenCategories[tokenIndex]

                func(tokenIndex,tokenStart,tokenEnd,tokenCategory,lexeme)
            }
        }

        ///////////////////////
        ////  TRANSPILING  ////
        ///////////////////////

        let declaration = 0

        for (propt in declarationTokenIndices)
            delete declarationTokenIndices[propt]

        let lineLexemes = []

        let errorNewLines = []

        forEachToken( (tokenIndex, tokenStart, tokenEnd, tokenCategory, token) => {
            switch (tokenCategory) {
                case "literal":
                    let name = getDeclarationName(declaration)
                    ++declaration
                    declarationTokenIndices[name] = tokenIndex

                    parseMv(backgroundString.substr(tokenStart, tokenEnd - tokenStart), namedMvs[name])
                    lineLexemes.push(name)
                    break

                case "newline":
                    if (lineLexemes.length > 1) { //if it's 1 or 0, nothing to be made
                        let name = getDeclarationName(declaration)
                        ++declaration
                        declarationTokenIndices[name] = tokenIndex

                        let transpilationResult = transpileLine(lineLexemes)
                        if (typeof transpilationResult === "number")
                            errorNewLines.push(tokenIndex)
                        else
                            eval(parsedString + "namedMvs[" + name + "])")
                    }
                    lineLexemes.length = 0
                    break

                default:
                    if(token !== " " && tokenCategory !== "comment" )
                        lineLexemes.push(token)
                    break
            }
        })

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

            carat.moveOutOfToken(tokenStart, tokenEnd)
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
                    carat.moveOutOfToken(tokenStart, tokenEnd)

                    if (errorNewLines.indexOf(tokenIndex) !== -1)
                        placeErrorHighlight(drawingPosition)

                    for (let i = 0; i < displayWindows.length; ++i) {
                        if (drawingPosition.y === displayWindows[i].verticalPositionToRenderMvsFrom) {
                            displayWindows[i].numMvs = 0
                            for (let j = 0; j < namesInLine.length; ++j) {
                                if (namedMvs.indexOf(namesInLine[j]) !== -1)
                                    displayWindows[i].addMv(namesInLine[j]) //TODO shouldn't be any repeats
                            }
                        }
                    }
                    namesInLine.length = 0

                    drawingPosition.y -= 1.
                    drawingPosition.x = -mainCamera.rightAtZZero + 1.

                    break

                case "literal":
                    potentiallyDrawFirstDeclaration(tokenIndex, tokenStart, tokenEnd)
                    break

                case "identifier":
                    if (token === "globe")
                        drawEarth(drawingPosition,tokenStart, tokenEnd)
                    else if (namedMvs.indexOf(token) !== -1)
                        drawAndMoveAlong(token, tokenStart, tokenEnd)
                    else
                        drawTokenCharacters(tokenStart, tokenEnd)
                    break

                default:
                    drawTokenCharacters(tokenStart,tokenEnd)
            }
        })

        carat.postParseFunc()

        delete tokenCategories
        return
    }
}