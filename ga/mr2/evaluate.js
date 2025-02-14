/*
    
*/

function initEvaluate() {

    let postfixOperators = {
        "*": "dual",
        "~": "reverse"
        //"inverse", i.e. ^-1 / "transpose"
        //exponential
        //length / magnitude?
        //polarity / "orthogonal"
        //normalize. But maybe everything is always normalized?
    }
    let postfixSymbols = Object.keys(postfixOperators)
    
    let infixOperators = {
        "+": "gAdd",
        "&": "join",
        "^": "meet",
        ".": "inner",
        //wedge
        //subtract
        //divide = Multiplication by the normalized thing according to leo???
    }
    let infixSymbols = Object.keys(infixOperators)

    let builtInFunctionNames = ["inner", "gProduct", "assign"] //"earth", sin, cos, tan, exp, sqrt
    infixSymbols.forEach((key)=>{builtInFunctionNames.push(infixOperators[key])})
    postfixSymbols.forEach((key)=>{builtInFunctionNames.push(postfixOperators[key])})
    
    initTranspiler(infixOperators, postfixOperators, builtInFunctionNames)
    initTokenize(infixSymbols, postfixSymbols)

    initErrorHighlight()

    let errorReport = new Textbox("INITIAL TEXT FOR ERROR MESSAGE", 1., 0., 0.)
    errorReport.visible = false
    {
        errorReport.tokenIndex = -1

        handleError = function (tokenIndex, newError) {
            errorReport.setText(newError)
            errorReport.tokenIndex = tokenIndex
            errorReport.visible = true
        }

        addRenderFunction(() => {
            errorReport.visible = false
        }, "end")
    }

    initDrawTokens()

    let lineTree = new AbstractSyntaxTree()

    let tfp = {} //transpilingFunctionProperties
    {
        tfp.internalDeclarations = []
        tfp.namesWithLocalizationNeeded = []
        tfp.argumentsInSignature = []
        function resetTfp() {
            tfp.internalDeclarations.length = 0
            tfp.namesWithLocalizationNeeded.length = 0
            tfp.argumentsInSignature.length = 0
            tfp.ir = ""
            tfp.name = null
            tfp.maxTmvs = 0
        }
        resetTfp()
    }

    function checkNameIsUnused(lexeme) {
        return getNameDrawerProperties(lexeme) === null
            && functionsWithIr[lexeme] === undefined
            && builtInFunctionNames.indexOf(lexeme) === -1
    }
    
    tokenizeEvaluateDrawTokens = () => {

        tokenize()

        const caratLineNumber = getLineNumberOfPositionInString(carat.positionInString)

        let unusedNameJustSeen = null
        let skipLine = false
        let nameToAssignTo = null

        //probably completely unnecessary to store this, just use the function itself
        resetTfp()
        
        const functionSignatureTokens = ["uncoloredName", "(",",","{"]
        let nextFunctionSignatureTokenIndex = 99999

        logLastFewTokens = (tokenIndex) => {
            let numTokensToCheck = Math.min(tokenIndex, 15)
            for (let i = tokenIndex - numTokensToCheck; i <= tokenIndex; ++i)
                log(tokens[i])
        }

        clearNames(derivedNames)
        derivedNames.length = 0

        Object.keys(functionsWithIr).forEach((key) => {
            if (!functionsWithIr[key].stillDefinedInProgram) {
                if (key !== "reflectHorizontally")
                    delete functionsWithIr[key]
            }
            else functionsWithIr[key].stillDefinedInProgram = false
        })

        let lineNumber = 0
        let currentLineStart = 0
        
        forEachToken((tokenIndex, tokenStart, tokenEnd, token, lexeme) => {
            if(token === "\n") {
                if (nameToAssignTo !== null && skipLine === false) {
                    const currentlyEditingThisLine =
                        caratLineNumber === lineNumber &&
                        currentLineStart <= carat.indexOfLastTypedCharacter && 
                        carat.indexOfLastTypedCharacter <= tokenEnd

                    if ( currentlyEditingThisLine )
                        lineTree.clear()
                    else {
                        let errorMessage = lineTree.parseAndAssign(tokenIndex, nameToAssignTo, lineNumber, tfp)
                        if(errorMessage !== "")
                            handleError(tokenIndex, errorMessage)
                    }

                    derivedNames.push(nameToAssignTo) //because what if you save

                    //TODO wanna remove those non-derived names that don't appear in the code
                }

                nameToAssignTo = null
                skipLine = false
                unusedNameJustSeen = null

                ++lineNumber
                currentLineStart = tokenStart
            }
            else if(skipLine)
                return false

            if (token === "comment" || token === " ")
                return false

            //----------------------

            if(nextFunctionSignatureTokenIndex < functionSignatureTokens.length) {
                let expectation = functionSignatureTokens[nextFunctionSignatureTokenIndex]

                if(expectation === ",") {
                    if(token === ")")
                        ++nextFunctionSignatureTokenIndex
                    else if (token === "coloredName" ) { //possibly it shouldn't be a used name
                        if (tfp.argumentsInSignature.indexOf(lexeme) !== -1)
                            handleError(tokenIndex,"same argument twice")
                        tfp.argumentsInSignature.push(lexeme)
                    }
                }
                else if (token === expectation) {
                    ++nextFunctionSignatureTokenIndex

                    if (token === "uncoloredName")
                        tfp.name = lexeme
                }
                else
                    handleError(tokenIndex, "unexpected symbol in function signature: " + lexeme + ", was expecting " + expectation)
            }
            else {
                if (token === "def") {
                    if (nameToAssignTo !== null || unusedNameJustSeen !== null)
                        handleError(tokenIndex, "misplaced def")

                    nextFunctionSignatureTokenIndex = 0
                }
                else if ((token === "coloredName" || token === "uncoloredName")
                    && checkNameIsUnused(lexeme)) {
                    if (nameToAssignTo !== null || unusedNameJustSeen !== null)
                        handleError(tokenIndex, "misplaced new name: " + lexeme)

                    unusedNameJustSeen = lexeme
                }
                else if (lexeme === "=") {
                    if (nameToAssignTo !== null || unusedNameJustSeen === null )
                        handleError(tokenIndex, "misplaced =")

                    nameToAssignTo = unusedNameJustSeen
                    unusedNameJustSeen = null
                }
                else if (nameToAssignTo !== null) {
                    let errorMessage = lineTree.addLexeme(tokenIndex, token, lexeme)
                    if (errorMessage !== "") {
                        handleError(tokenIndex, errorMessage)
                        skipLine = true
                    }
                }
                else if (lexeme === "}") {
                    if (tfp.name === null)
                        handleError(tokenIndex, "misplaced }")
                    
                    if (functionsWithIr[tfp.name] === undefined)
                        functionsWithIr[tfp.name] = new FunctionWithIr(tfp.name)

                    functionsWithIr[tfp.name].setIr(tfp)

                    resetTfp()
                }
            }

            return false
        })

        drawTokens(errorReport)

        // errorHighlightTokenIndices.length = 0
    }
}