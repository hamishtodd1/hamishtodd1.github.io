function initTokenize(infixSymbols, postfixSymbols) {
    
    let tokens = []
    let tokenStarts = []
    tokenize = () =>{
        tokens.length = 0
        tokenStarts.length = 0

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

        let uniqueMonoSymbols = [" ", "\n", "=", "(", ")","{","}",","]
        let uniqueMultiSymbols = ["def"]

        let positionInString = 0
        while (positionInString < backgroundStringLength) {
            let tokenStartCharacter = backgroundString[positionInString]
            tokenStarts.push(positionInString)

            if (tokenStartCharacter === "/" ) { // && backgroundString[positionInString + 1] === "/") { //don't have divide yet
                tokens.push("comment")
                moveWhile(() => backgroundString[positionInString] !== "\n")

                //TODO: you DO want to see pictograms in a comment
            }
            else if ( uniqueMonoSymbols.indexOf(tokenStartCharacter) !== -1) {
                tokens.push(tokenStartCharacter)
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
                
                if (uniqueMultiSymbols.indexOf(lexeme) !== -1) {
                    tokens.push(lexeme)
                    continue
                }

                let usableNamePotentially = getAlphabetizedColoredName(lexeme)
                if(usableNamePotentially === null) 
                    tokens.push("uncoloredName")
                else {
                    if(usableNamePotentially !== lexeme && !checkIfTokenIsInProgress(positionInString))
                        backgroundStringSplice(tokenStart,positionInString - tokenStart,usableNamePotentially)
                    tokens.push("coloredName")
                }
            }
            else {
                console.error("don't know what to do with this character: " + tokenStartCharacter)
                debugger
            }
        }
        // log(tokens)
    }

    forEachToken = (func) => {
        for (let tokenIndex = 0, numTokens = tokens.length; tokenIndex < numTokens; ++tokenIndex) {
            let tokenStart = tokenStarts[tokenIndex]
            let tokenEnd = getTokenEnd(tokenIndex)
            let lexeme = backgroundString.substr(tokenStart, tokenEnd - tokenStart)
            let token = tokens[tokenIndex]

            let needToBreak = func(tokenIndex, tokenStart, tokenEnd, token, lexeme)
            if (needToBreak)
                break
        }
    }
}