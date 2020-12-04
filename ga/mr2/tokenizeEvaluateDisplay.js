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

function initTokenizer(displayableCharacters) {

    let postfixOperators = {
        "*": "dual"
        //"inverse", "transpose"
        //exponential? It's single argument
        //length / magnitude?
        //normalize. But maybe everything is always normalized?
    }
    postfixOperators[DAGGER_SYMBOL] = "reverse"
    let postfixSymbols = Object.keys(postfixOperators)
    
    let infixOperators = {
        "+": "gAdd"
        //wedge
        //subtract
        //divide
    }
    infixOperators[JOIN_SYMBOL] = "join" //TODO sure this works across browsers?
    let infixSymbols = Object.keys(infixOperators)

    let builtInFunctionNames = ["inner", "gProduct", "join","assign"] //"earth", sin, cos, tan, exp, sqrt
    infixSymbols.forEach((key)=>{builtInFunctionNames.push(infixOperators[key])})
    postfixSymbols.forEach((key)=>{builtInFunctionNames.push(postfixOperators[key])})

    initTranspiler(infixOperators, postfixOperators, builtInFunctionNames)
    let lineTree = new AbstractSyntaxTree()

    initErrorHighlight()
    initPadDisplay()

    const namesNeedingToBeCleared = []

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

        let uniqueTokens = [" ","\n",LAMBDA_SYMBOL,"="]
        let separators = ["(", ")"]
        let keywords = ["def"]

        let positionInString = 0
        while (positionInString < backgroundStringLength) {
            let tokenStartCharacter = backgroundString[positionInString]
            tokenStarts.push(positionInString)

            if (tokenStartCharacter === "/" && backgroundString[positionInString + 1] === "/") {
                tokens.push("comment")
                moveWhile(() => backgroundString[positionInString] !== "\n")
            }
            else if ( uniqueTokens.indexOf(tokenStartCharacter) !== -1) {
                tokens.push(tokenStartCharacter)
                ++positionInString
            }
            else if (separators.indexOf(tokenStartCharacter)!== -1) {
                tokens.push("separator")
                ++positionInString
            }
            else if (infixSymbols.indexOf(tokenStartCharacter) !== -1) {
                tokens.push("infixSymbol")
                ++positionInString
            }
            else if (postfixSymbols.indexOf(tokenStartCharacter) !== -1) {
                tokens.push("postfixSymbol")
                ++positionInString
            }
            else if (IDENTIFIER_CHARACTERS.indexOf(backgroundString[positionInString]) !== -1) {
                let tokenStart = positionInString
                moveWhile(() => IDENTIFIER_CHARACTERS.indexOf(backgroundString[positionInString]) !== -1)
                let lexeme = backgroundString.substr(tokenStart, positionInString-tokenStart)
                
                let isKeyword = false
                keywords.forEach((kw) => {
                    if (lexeme === kw) {
                        isKeyword = true
                        tokens.push(lexeme)
                    }
                })
                if(isKeyword)
                    return false

                let usableNamePotentially = getAlphabetizedColoredName(lexeme)
                if(usableNamePotentially === null) 
                    tokens.push("uncoloredName")
                else {
                    if(usableNamePotentially !== lexeme && !checkIfTokenIsInProgress(positionInString))
                        backgroundStringSplice(tokenStart,positionInString - tokenStart,usableNamePotentially)
                    tokens.push("coloredName")
                }
            }
            else
                handleError(tokenStarts.length, "don't know what to do with this character: ", tokenStartCharacter)
        }

        forEachToken = (func) => {
            for (let tokenIndex = 0, numTokens = tokens.length; tokenIndex < numTokens; ++tokenIndex) {
                let tokenStart = tokenStarts[tokenIndex]
                let tokenEnd = getTokenEnd(tokenIndex)
                let lexeme = backgroundString.substr(tokenStart, tokenEnd - tokenStart)
                let token = tokens[tokenIndex]

                let needToBreak = func(tokenIndex,tokenStart,tokenEnd,token,lexeme)
                if(needToBreak)
                    break
            }
        }

        ///////////////////////
        ////  TRANSPILING  ////
        ///////////////////////

        //a function call causes a new thing to be made
        // a single line with multiple operations preceding an assignment compiles to something you need to execute. 

        //for the purposes of this video there are multiple kinds of "=":
        //those things are DEFINITELY going to have their evaluation deferred until render time

        //the job of this thing is to associate names with IR strings
        //you're going to evaluate the whole lot in js... some of which

        // transpile()

        let unusedNameJustSeen = null

        let skipLine = false

        let nameToAssignTo = null

        let nextNameIsFunction = false
        let functionNameToAssignTo = null
        let functionTree = null

        logLastFewTokens = (tokenIndex) => {
            let numTokensToCheck = Math.min(tokenIndex, 15)
            for (let i = tokenIndex - numTokensToCheck; i <= tokenIndex; ++i) {
                log(tokens[i])
            }
        }

        clearNames(namesNeedingToBeCleared)
        namesNeedingToBeCleared.length = 0
        //then have all the things that are currently in the separate files done here

        let lineNumber = 0
        forEachToken((tokenIndex, tokenStart, tokenEnd, token, lexeme) => {
            if(token === "\n") {
                ++lineNumber

                if (nameToAssignTo !== null && skipLine === false) {
                    lineTree.parseAndAssign(tokenIndex, nameToAssignTo, lineNumber)

                    namesNeedingToBeCleared.push(nameToAssignTo)

                    if (functionNameToAssignTo !== null) {
                        // globeProjectionPictogramPrograms["simpleAlternating"].setIr()
                        // something = new GlobeProjectionIr()                 
                    }
                }

                nameToAssignTo = null
                unusedNameJustSeen = null

                skipLine = false
            }
            else if(skipLine)
                return false

            if (token === "comment" || token === " " )
                return false
            else  if (lexeme === "def") {
                if (nextNameIsFunction || functionNameToAssignTo !== null || nameToAssignTo !== null)
                    handleError(tokenIndex, "misplaced lambda")

                nextNameIsFunction = true
            }
            else if ((token === "coloredName" || token === "uncoloredName") 
                && getNameDrawerProperties(lexeme) === null 
                && functionsWithIr[lexeme] === undefined
                && builtInFunctionNames.indexOf(lexeme) === -1 )
            {
                if (nameToAssignTo !== null || unusedNameJustSeen !== null)
                    handleError(tokenIndex, "misplaced new name: " + lexeme)
                    
                unusedNameJustSeen = lexeme
            }
            else if (lexeme === "=") {
                if (unusedNameJustSeen === null || nameToAssignTo !== null)
                    handleError(tokenIndex, "misplaced =")

                if (nextNameIsFunction) {
                    if (functionNameToAssignTo !== null)
                        handleError(tokenIndex, "misplaced new function name: " + lexeme)
                    functionNameToAssignTo = unusedNameJustSeen
                    nextNameIsFunction = false
                }
                else {
                    if (nameToAssignTo !== null)
                        handleError(tokenIndex, "misplaced new variable name: " + lexeme)
                    nameToAssignTo = unusedNameJustSeen
                }

                unusedNameJustSeen = null
            }

            //////////////////////
            ////  ALL SET UP  ////
            //////////////////////

            //all you can do is apply the function to the globe
            //we might like it to be the case that eg "t Proj tDagger" gives you proj rotated by t. But eh
            
            else if (nameToAssignTo !== null) {
                // if (nameToAssignTo === "y")
                //     debugger
                let result = lineTree.addLexeme(tokenIndex, token, lexeme)
                if (result === false)
                    skipLine = true
            }
            else if (functionNameToAssignTo !== null && lexeme === "}" && nameToAssignTo === null) {
                //time to collect up those lines and round off
                functionNameToAssignTo = null
            }
        })

        drawTokens()

        errorHighlightTokenIndices.length = 0
    }
}