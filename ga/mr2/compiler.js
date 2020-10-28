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

    let drawingPosition = new ScreenPosition()
    compileView = () => {
        carat.preParseFunc()
        
        let drawingPositionInString = 0
        drawingPosition.x =-mainCamera.rightAtZZero + 1.
        drawingPosition.y = mainCamera.topAtZZero - .5
        columnBackground.position.copy(drawingPosition)

        let drawingPositionInOrderedNames = 0
        let lineNumber = 0

        let namesInLine = []

        if(frameCount === 3)
        {
            let tokenCategories = []
            let tokenStarts = []

            //better as an enum but hey
            let finiteCategories = {
                infix: ["+", "/", "-"],
                separator: ["(", ")", ",", " "],
                function: ["dual", "earth", "sq"], //and user stuff gets added I guess
                namedMv: orderedNames //possibly these should need to be space-terminated
            }
            let categoryNames = Object.keys(finiteCategories)

            let backgroundStringLength = backgroundString.length
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

                    // let name = orderedNames[drawingPositionInOrderedNames]
                    // ++drawingPositionInOrderedNames
                    // literalsPositionsInString[name] = positionInString //do it later... maybe? Or maybe you can extract this info from tokens?

                    let tokenLength = getLiteralLength(positionInString) //should only need this here

                    if (backgroundString.substr(positionInString + tokenLength, 5) === "color")
                        tokenLength += 5

                    tokenCategories.push("literal")
                    positionInString += tokenLength
                }
                else if (tokenStartCharacter === "/" && backgroundString[positionInString + 1] === "/") {
                    let tokenLength = 2
                    do
                        ++tokenLength
                    while (backgroundString[positionInString + tokenLength] !== "\n" && positionInString + tokenLength < backgroundStringLength)
                    tokenCategories.push("comment")
                    positionInString += tokenLength
                }
                else {
                    let identified = false
                    for (let categoryIndex = 0; categoryIndex < categoryNames.length && identified === false; ++categoryIndex) {
                        let categoryName = categoryNames[categoryIndex]
                        let tokenArray = finiteCategories[categoryName]
                        for (let j = 0, jl = tokenArray.length; j < jl && identified === false; ++j) {
                            if (backgroundString.substr(positionInString, tokenArray[j].length) === tokenArray[j]) {
                                tokenCategories.push(categoryName)
                                positionInString += tokenArray[j].length
                                identified = true
                            }
                        }
                    }

                    if (!identified) {
                        console.error("uncaught identifier")
                        debugger
                        //could keep moving to the next newline and
                        return
                    }
                }   
            }
            log(tokenCategories)
        }




        //bit memory-leaky
        literalsPositionsInString = {}
        declarationPositionsInString = {}

        let functionNames = ["dual", "earth", "sq"]
        function checkForFunctionNameAndAddToLineStack(token) {
            for(let i = 0; i < functionNames.length; ++i) {
                if (backgroundString.substr(drawingPositionInString, functionNames[i].length) === functionNames[i])
                    lineStack.push(functionNames[i])
            }
        }

        function localDrawMvFunction(name) {
            namesInLine.push(name)

            let endOfFirstOcurrence = -1
            if (literalsPositionsInString[name] !== undefined)
                endOfFirstOcurrence = literalsPositionsInString[name] + getLiteralLength(literalsPositionsInString[name])
            else
                endOfFirstOcurrence = declarationPositionsInString[name] + 1
            colorPointValues[name] = backgroundString.substr(endOfFirstOcurrence, 5) === "color"

            if (mouse.inBounds(drawingPosition.x, drawingPosition.x + 1., drawingPosition.y + .5, drawingPosition.y - .5)) {
                mouseDw.respondToHover(drawingPosition.x + .5, drawingPosition.y, lineNumber, name)

                if (mouse.rightClicking && !mouse.rightClickingOld) {
                    if (backgroundString.substr(endOfFirstOcurrence, 5) !== "color" ) {
                        backgroundStringSplice(endOfFirstOcurrence, 0, "color")
                        if( drawingPositionInString >= endOfFirstOcurrence )
                            drawingPositionInString += 5
                    }
                    else {
                        backgroundStringSplice(endOfFirstOcurrence, 5, "")
                        if( drawingPositionInString >= endOfFirstOcurrence )
                            drawingPositionInString -= 5
                    }
                    backgroundStringLength = backgroundString.length
                }
            }

            addMvToRender(name, drawingPosition.x + .5, drawingPosition.y, .5, true)

            drawingPosition.x += 1.
        }

        let backgroundStringLength = backgroundString.length
        for (drawingPositionInString; drawingPositionInString <= backgroundStringLength; ++drawingPositionInString) {
            
            carat.duringParseFunc(drawingPosition, drawingPositionInString, drawingPositionInOrderedNames,lineNumber)
            if (drawingPositionInString >= backgroundStringLength)
                break

            //-------Bifuricate!

            let currentCharacter = backgroundString[drawingPositionInString]
            
            if (currentCharacter === " ")
                drawingPosition.x += characterWidth
            else if (currentCharacter === "\n") {

                //---------End of line

                drawingPosition.x = -mainCamera.rightAtZZero

                if(lineStack.length !== 0) {
                    let result = lineStack.pop()
                    clearStack()

                    if (isMv(result) ) { //if it's just a name you don't want it
                        let name = orderedNames[drawingPositionInOrderedNames]
                        ++drawingPositionInOrderedNames
                        declarationPositionsInString[name] = drawingPositionInString

                        localDrawMvFunction(name)
                        if (backgroundString.substr(drawingPositionInString + 1, 5) === "color")
                            drawingPositionInString += 5

                        copyMv(result, namedMvs[name])
                    }
                }

                drawingPosition.y -= 1.
                drawingPosition.x = -mainCamera.rightAtZZero + 1.

                for(let i = 0; i < displayWindows.length; ++i) {
                    if(lineNumber === displayWindows[i].lineToRenderMvsFrom) {
                        displayWindows[i].numMvs = 0
                        for (let j = 0; j < namesInLine.length; ++j) {
                            if (orderedNames.indexOf(namesInLine[j]) !== -1)
                                displayWindows[i].addMv(namesInLine[j])
                        }
                    }
                }
                namesInLine.length = 0

                ++lineNumber
            }
            else if (freeVariableStartCharacters.indexOf(currentCharacter) !== -1) {

                //---------Free variable
                
                let name = orderedNames[drawingPositionInOrderedNames]
                ++drawingPositionInOrderedNames
                
                literalsPositionsInString[name] = drawingPositionInString
                let literalLength = getLiteralLength(drawingPositionInString)
                // debugger
                parseMv(backgroundString.substr(drawingPositionInString, literalLength), namedMvs[name])
                drawingPositionInString += literalLength - 1 //-1 because the loop does a +1
                lineStack.push(name)

                localDrawMvFunction(name)
                if (backgroundString.substr(drawingPositionInString + 1, 5) === "color")
                    drawingPositionInString += 5
            }
            else if(currentCharacter === "I") {

                //---------Interval

                addCharacterToDraw("I", drawingPosition)
                lineStack.push("I")
                drawingPosition.x += characterWidth
            }
            else if( currentCharacter === ")") {

                //---------Function application
                //yeah this would be better parsed out and turned into reverse polish

                let argumentName = lineStack.pop()
                let func = lineStack.pop()
                if ( namedMvs[argumentName] !== undefined ) {
                    let argument = namedMvs[argumentName]
                    if (func === "earth") {
                        let mv = new Float32Array(16)
                        earth(pointX(argument), pointY(argument),mv)
                        lineStack.push(mv)
                    }
                    if(func === "dual") {
                        let mv = new Float32Array(16)
                        copyMv(argument,mv)
                        dual(mv)
                        lineStack.push(mv)
                    }
                    if (func === "sq") {
                        let mv = new Float32Array(16)
                        gp(argument,argument,mv)
                        lineStack.push(mv)
                    }
                }

                addCharacterToDraw(")", drawingPosition)
                drawingPosition.x += characterWidth
            }
            else if (displayableCharacters.indexOf(currentCharacter) !== -1) {

                //---------Normal character

                if (backgroundString.substr(drawingPositionInString, 2) === "b ")
                // if (colorCharacters.indexOf(currentCharacter) !== -1 )
                {
                    let name = "b";
                    namesInLine.push(name)
                    lineStack.push(name)

                    localDrawMvFunction(name)
                }
                else
                {
                    checkForFunctionNameAndAddToLineStack()

                    addCharacterToDraw(currentCharacter, drawingPosition)
                    drawingPosition.x += characterWidth
                }
            }
            else {
                console.error("uncaught character: ", currentCharacter)
            }
        }

        carat.postParseFunc()

        clearStack()
    }
}