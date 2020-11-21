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

    initErrorHighlight()

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
                moveWhile(() => IDENTIFIER_CHARACTERS.indexOf(backgroundString[positionInString]) !== -1)
            }
        }

        forEachToken = (func) => {
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

        // forEachToken((tokenIndex, tokenStart, tokenEnd, token, lexeme) => {

        //     if(token === "identifier") {

        //     }
        // })

        drawTokens(errorNewLines)
    }
}