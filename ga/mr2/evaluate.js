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

function initEvaluate() {

    let postfixOperators = {
        "*": "dual",
        "~": "reverse"
        //"inverse", "transpose"
        //exponential
        //length / magnitude?
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
        //divide = Multiplication by the normalized thing???
    }
    let infixSymbols = Object.keys(infixOperators)

    let builtInFunctionNames = ["inner", "gProduct", "assign"] //"earth", sin, cos, tan, exp, sqrt
    infixSymbols.forEach((key)=>{builtInFunctionNames.push(infixOperators[key])})
    postfixSymbols.forEach((key)=>{builtInFunctionNames.push(postfixOperators[key])})
    
    initTranspiler(infixOperators, postfixOperators, builtInFunctionNames)
    initTokenize(infixSymbols, postfixSymbols)

    initErrorHighlight()
    initDrawTokens()

    let lineTree = new AbstractSyntaxTree()
    
    tokenizeEvaluateDrawTokens = () => {

        tokenize()

        let unusedNameJustSeen = null
        let skipLine = false
        let nameToAssignTo = null

        //probably completely unnecessary to store this, just use the function itself
        let transpilingFunctionProperties = {
            maxTmvs: 0,
            name: null,
            argumentsInSignature: [],
            internalDeclarations: [],
            namesWithLocalizationNeeded:[],
            ir: "",
        }
        
        const functionSignatureTokens = ["uncoloredName", "(",",","{"]
        let nextFunctionSignatureTokenIndex = 99999

        logLastFewTokens = (tokenIndex) => {
            let numTokensToCheck = Math.min(tokenIndex, 15)
            for (let i = tokenIndex - numTokensToCheck; i <= tokenIndex; ++i)
                log(tokens[i])
        }

        clearNames(derivedNames)
        derivedNames.length = 0
        //then have all the things that are currently in the separate files done here

        function checkNameIsUnused(lexeme) {
            return getNameDrawerProperties(lexeme) === null
                    && functionsWithIr[lexeme] === undefined
                    && builtInFunctionNames.indexOf(lexeme) === -1
        }

        Object.keys(functionsWithIr).forEach((key) => {
            if (!functionsWithIr[key].stillDefinedInProgram) {
                if (key !== "reflectHorizontally")
                    delete functionsWithIr[key]
            }
            else functionsWithIr[key].stillDefinedInProgram = false
        })

        let lineNumber = 0
        forEachToken((tokenIndex, tokenStart, tokenEnd, token, lexeme) => {
            if(token === "\n") {
                if (nameToAssignTo !== null && skipLine === false) {
                    // if(nameToAssignTo === "pw")
                    //     log(carat.lineNumber !== lineNumber)
                    if (carat.lineNumber !== lineNumber)
                        lineTree.parseAndAssign(tokenIndex, nameToAssignTo, lineNumber, transpilingFunctionProperties)

                    derivedNames.push(nameToAssignTo) //because what if you save
                }

                nameToAssignTo = null
                skipLine = false
                unusedNameJustSeen = null

                ++lineNumber
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
                    else if (token === "coloredName" ) { //intuition was that it shouldn't be a used one. But, er, the word "used", what does it mean?
                        if (transpilingFunctionProperties.argumentsInSignature.indexOf(lexeme) !== -1)
                            handleError(tokenIndex,"same argument twice")
                        transpilingFunctionProperties.argumentsInSignature.push(lexeme)
                    }

                    return false
                }
                else if (token === expectation) {
                    ++nextFunctionSignatureTokenIndex

                    if (token === "uncoloredName")
                        transpilingFunctionProperties.name = lexeme

                    return false
                }

                handleError(tokenIndex, "unexpected symbol in function signature: " + lexeme + ", was expecting " + expectation)
            }
            else {
                if (token === "def") {
                    if (nameToAssignTo !== null || unusedNameJustSeen !== null)
                        handleError(tokenIndex, "misplaced lambda")

                    nextFunctionSignatureTokenIndex = 0
                }
                else if ((token === "coloredName" || token === "uncoloredName")
                    && checkNameIsUnused(lexeme)) {
                    if (nameToAssignTo !== null || unusedNameJustSeen !== null)
                        handleError(tokenIndex, "misplaced new name: " + lexeme)

                    unusedNameJustSeen = lexeme
                }
                else if (lexeme === "=") {
                    if (nameToAssignTo !== null || unusedNameJustSeen === null  ) {
                        handleError(tokenIndex, "misplaced =")
                    }

                    nameToAssignTo = unusedNameJustSeen
                    unusedNameJustSeen = null
                }
                else if (nameToAssignTo !== null) {
                    if(carat.lineNumber !== lineNumber) {
                        let lexemeSuccessfullyAdded = lineTree.addLexeme(tokenIndex, token, lexeme)
                        if (!lexemeSuccessfullyAdded)
                            skipLine = true
                    }
                }
                else if (lexeme === "}") {
                    let tfp = transpilingFunctionProperties

                    if (tfp.name === null)
                        handleError(tokenIndex, "misplaced }")
                    
                    if (functionsWithIr[tfp.name] === undefined)
                        functionsWithIr[tfp.name] = new FunctionWithIr(tfp.name)

                    functionsWithIr[tfp.name].setIr(tfp)

                    tfp.internalDeclarations.length = 0
                    tfp.namesWithLocalizationNeeded.length = 0
                    tfp.argumentsInSignature.length = 0
                    tfp.ir = ""
                    tfp.name = null
                    tfp.maxTmvs = 0
                }
            }
        })

        drawTokens()

        errorHighlightTokenIndices.length = 0
    }
}