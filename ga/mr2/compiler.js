/*
    Surely if you can have infinities visualized you can have infinitesimals
    Look out for what happens to them when you have your disc model

    z = x*x + 2*x*y

    want a debug mode where you just see the characters
    And it goes along and highlights the parts of the text you care about

    
*/

function initCompileViewer(displayableCharacters, columnBackground) {

    //better as an enum but hey
    let finiteCategories = {
        infix: ["*","+"],
        separator: ["(", ")", ",", " "]
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
                let token = backgroundString.substr(tokenStart, tokenEnd - tokenStart)
                let tokenCategory = tokenCategories[tokenIndex]

                func(tokenIndex,tokenStart,tokenEnd,tokenCategory,token)
            }
        }

        ////////////////////////
        ////  INTERPRETING  ////
        ////////////////////////

        //need to convert everything to prefix
        let lineStack = []
        function clearStack() {
            while (lineStack.length !== 0) {
                let thing = lineStack.pop()
                if (isMv(thing))
                    delete thing
            }
            lineStack.length = 0
        }
        
        let positionInOrderedNames = 0
        function assignMvToName(tokenIndex,newValue) {
            while(positionInOrderedNames >= orderedNames.length)
                orderedNames.push(getLowestUnusedName())

            let name = orderedNames[positionInOrderedNames]
            ++positionInOrderedNames
            declarationTokenIndices[name] = tokenIndex

            return name
        }

        let functionNames = ["dual","earth","sq"]

        for (propt in declarationTokenIndices)
            delete declarationTokenIndices[propt]

        

        let ignoreLine = false
        forEachToken( (tokenIndex, tokenStart, tokenEnd, tokenCategory, token) => {

            if (ignoreLine) {
                if (token === "\n")
                    ignoreLine = false
                else
                    return
            }

            switch (tokenCategory) {
                case "literal":
                    let name = assignMvToName(tokenIndex)
                    parseMv(backgroundString.substr(tokenStart, tokenEnd - tokenStart), namedMvs[name])
                    lineStack.push(name)
                    break

                case "newline":
                    if (frameCount === 3)
                        log(lineStack)
                    {
                        let lineString = ""
                        let ourStack = []
                        lineStack.forEach((myToken)=>{
                            if (functionNames.indexOf(token) !== -1) {
                                ourStack.push(token)
                            }
                        })
                    }
                    let result = lineStack.pop()

                    //eval()

                    if (isMv(result))
                        assignMvToName(tokenIndex)

                    clearStack()
                    break

                case "infix":
                    //eventually there will be functions with anu number of arguments
                    lineStack.push(",")
                    if(token === "+") {
                        
                        //gotta go back however many ")" and "(" you've had
                        let numCloseBracketsWeNeedToSee = 0
                        for (let i = lineStack.length-1; i >= 0; --i) {
                            if(lineStack[i] === ")")
                                ++numCloseBracketsWeNeedToSee
                            else if (lineStack[i] === "(")
                                --numCloseBracketsWeNeedToSee
                            else if (orderedNames.indexOf(token) !== -1) {
                                if(numCloseBracketsWeNeedToSee  === 0) {
                                    //yay, you can do it?
                                }
                            }
                            else if (functionNames.indexOf(token) !== -1) {
                                //need to check if the function is gp
                            }
                                
                        }
                        //in the above, everything should be , ( ) functionName variableName

                        lineStack.push("gAdd")
                        //hmm, well everything in the stack will be prefix at least
                    }
                    // gp(a,b)
                    // a*b+c -> gp(a,b)+c   -> gAdd(gp(a,b),c))
                    // a+b+c -> gAdd(a,b)+c -> gAdd(gAdd(a,b),c))
                    // a+b*c -> gAdd(a,b)*c -> gp(gAdd(a,b),c)
                    //functions all have brackets, there's no "order of operations" 

                    //possibly you should wait until you've parsed the whole line then replace things
                    break

                case "separator":
                    if(token !== " ")
                        lineStack.push(token)
                    break

                case "identifier":
                    if (orderedNames.indexOf(token) !== -1)
                        lineStack.push(token)
                    else if (functionNames.indexOf(token) !== -1)
                        lineStack.push(token)
                    else {
                        console.error("uncaught identifier: ", token)
                        clearStack()
                        ignoreLine = true
                    }
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

            moveCaratOutOfToken(tokenStart, tokenEnd)
        }

        function moveCaratOutOfToken(tokenStart,tokenEnd) {
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
                    moveCaratOutOfToken(tokenStart, tokenEnd)

                    for (let i = 0; i < displayWindows.length; ++i) {
                        if (drawingPosition.y === displayWindows[i].verticalPositionToRenderMvsFrom) {
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
                    potentiallyDrawFirstDeclaration(tokenIndex, tokenStart, tokenEnd)
                    break

                case "identifier":
                    if (orderedNames.indexOf(token) !== -1)
                        drawAndMoveAlong(token, tokenStart, tokenEnd)
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