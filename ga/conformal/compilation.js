/*
    Maybe you want:
        reverse
        log
        negate

    Maybe time should be a weight on a spring/simple harmonic oscillator?

    would be nice to have a guarantee that everything user makes is always well-defined

    If you have 5 and 6 in cells B1 and B2
        you can write (1+(B1:B2)*e01)
        and get two translations. Same with anything else

    Less certain
        sin, cos, arcsin, arcos
        Sum over... integral? Differential?
        Summation over a column

    User implements these themselves:
        Norm
        Infinity Norm
        Sqrt
    I mean, people expect no better in programming, no subscripts there

    Could do it with little coloured squares to represent the colors of the mvs
 */

function initCompilation() {

    const tests = [
        // `2 + 3`, new Cga().fromFloatAndIndex(5, 0),
        // `(2 + 3) * 5`, new Cga().fromFloatAndIndex(25, 0),
        // `(e1 ∧ e2) ∧ e3`, e123c,
    ]

    class Thingy extends Cga {
        constructor() {
            super()
            this.meshName = ``
        }

        free() {
            this.meshName = ``
            this.copy(zeroCga)
            unusedThingies.push(this)
        }
    }

    let numThingies = 32
    let unusedThingies = Array(numThingies)
    for (let i = 0; i < numThingies; ++i)
        unusedThingies[i] = new Thingy()
    function clearStack(stack) {
        while (stack.length !== 0) {
            let thingy = stack.pop()
            if (!cgaMethods.includes(thingy))
                thingy.free() //because all there ever is is Thingies and cgaMethods
        }
    }

    const potentialNameRegex = /^[a-zA-Z0-9₀₁₂₃₄₅ₚₘ𝅘]+$/

    reparseTokens = ( expression, parsedTokens, doLog ) => {

        expression = expression.replace(/\s/g, '')
        const tokens = tokenize(expression)
        if (doLog )
            log(tokens)
        parseTokens(tokens, parsedTokens)
        if (doLog )
            log(parsedTokens)

        while(tokens.length > 0)
            delete tokens.pop()

        return parsedTokens
    }

    let specialSymbols = [`(`, `)`]
    const cgaMethods = []
    class SpreadsheetMethod {
        constructor(name, numArgs, precedence, symbols) {
            this.name = name
            this.numArgs = numArgs

            this.symbols = symbols || []
            this.precedence = precedence || 0

            cgaMethods.push(this)
            specialSymbols = specialSymbols.concat(this.symbols)
        }
    }
    
    let mulMethod = new SpreadsheetMethod(`mul`,2, 2, [`*`] )
    let subMethod = new SpreadsheetMethod(`sub`,2, 1 )
    new SpreadsheetMethod(`selectGradeWithCga`, 2, 3, [`_`] )
    new SpreadsheetMethod(`meet`,               2, 2, [`∧`,`^`] )
    new SpreadsheetMethod(`join`,               2, 2, [`∨`,`&`] )
    new SpreadsheetMethod(`inner`,              2, 2, [`·`,`'`] )
    new SpreadsheetMethod(`sandwich`,           2, 2, [`⤳`, `>`,`→`] )
    new SpreadsheetMethod(`add`,                2, 1, [`+`] )
    new SpreadsheetMethod(`negate`,             1, 2, [`-`] )
    new SpreadsheetMethod(`projectOn`,          2 )
    new SpreadsheetMethod(`dual`,               1 )
    new SpreadsheetMethod(`reverse`,            1 ) //You do not use it so often you need a symbol. Fuck prefix.
    new SpreadsheetMethod(`exp`,                1 )
    new SpreadsheetMethod(`sqrt`,               1 ) //TODO what if they put in unnormalized thing?    
    //and user-made methods would probably be added too

    const letterSymbols = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`
    const numberSymbols = `0123456789.`
    
    function tokenize(expression) {

        const tokens = []
        let currentToken = ''
        let currentTokenIsNumber = false

        function finishToken() {
            if (currentToken.length > 0) {
                let cm = cgaMethods.find(cm => cm.name === currentToken)
                tokens.push( cm === undefined ? currentToken : cm )
                currentToken = ''
            }
        }

        for (let i = 0; i < expression.length; i++) {
            
            let char = expression[i]
            let cm = cgaMethods.find( cm => cm.symbols.includes(char) )

            if ( cm !== undefined ) {
                finishToken()
                tokens.push(cm)
            }
            else if(char === `)` || char === `(` ) {
                finishToken()
                tokens.push(char)
            }
            else if (char === ',')
                finishToken()
            else {
                if ( currentToken.length !== 0 && currentTokenIsNumber && !numberSymbols.includes(char))
                    finishToken()
                
                if (currentToken.length === 0)
                    currentTokenIsNumber = numberSymbols.includes(char)

                currentToken += char
            }
        }

        finishToken()

        return tokens
    }

    function isNumberOrVariable(token) {
        return !isNaN(parseFloat(token)) || potentialNameRegex.test(token) //hmmm
    }

    function parseTokens(tokens, outputQueue) {
        outputQueue.length = 0
        const operatorStack = []

        //you want to be able to have scalars next to unusedThingies
        
        let START = -1
        let NUMBER_OR_VARIABLE = 0
        let OPEN_BRACKET = 1
        let CLOSE_BRACKET = 2
        let METHOD = 3
        let lastTokenWas = START


        tokens.forEach( token => {

            if (isNumberOrVariable(token)) {

                outputQueue.push(token)

                if(lastTokenWas === NUMBER_OR_VARIABLE)
                    outputQueue.push(mulMethod)

                lastTokenWas = NUMBER_OR_VARIABLE
            }
            else if (token === `(`) {
                operatorStack.push(token)
                lastTokenWas = OPEN_BRACKET
            }
            else if (token === `)`) {
                
                // Pop to queue until opening bracket is encountered
                while (
                    operatorStack.length && 
                    operatorStack[operatorStack.length - 1] !== `(`
                ) {
                    outputQueue.push(operatorStack.pop())
                }

                if (operatorStack.length && operatorStack[operatorStack.length - 1] === `(`)
                    operatorStack.pop() // Discard opening bracket

                lastTokenWas = CLOSE_BRACKET
            }
            else if (cgaMethods.includes(token)) {

                let cm = token
                if (token.name === `negate` && (lastTokenWas === NUMBER_OR_VARIABLE || lastTokenWas === CLOSE_BRACKET ) )
                    cm = subMethod

                //if you have no precedence, it's a bit like being "5*(some,shit)" - so, maximal precedence
                if( token.precedence === null )
                    operatorStack.push(cm)
                else {
                    // if you have non-maximal precedence, pop operator stack fully
                    // unless maybe an operator with lower precedence is encountered
                    while (
                        operatorStack.length &&
                        operatorStack[operatorStack.length - 1] !== `(` &&
                        cm.precedence <= operatorStack[operatorStack.length - 1].precedence
                    ) {
                        outputQueue.push(operatorStack.pop())
                    }
                    operatorStack.push(cm)
                }

                lastTokenWas = METHOD
            }
            else
                console.error("Unrecognized token: "+token)
        })

        // Pop remaining operators to queue
        while (operatorStack.length)
            outputQueue.push(operatorStack.pop())

        return outputQueue
    }

    // function popArrFromStack(n) {
    //     let arr = Array(n)
    //     for (let i = 0; i < n; ++i)
    //         arr[n - i - 1] = stack.pop()
    //     return arr
    // }

    //yes, we might want to put this in a shader
    compile = (tokens) => {

        if (tokens.length === 0) //not sure how this is happenning, but it does for eg `B`
            return null

        let stack = []

        let tokenIndex = 0
        let numTokens = tokens.length
        for(tokenIndex; tokenIndex < numTokens; ++tokenIndex ) {
            let token = tokens[tokenIndex]

            let isCgaMethod = cgaMethods.includes(token)
            let isMesh = isMeshName(token)

            if ( !isNaN(parseFloat(token[0])) ) {

                let numberCga = unusedThingies.pop(); numberCga.zero(); numberCga[0] = parseFloat(token)
                stack.push(numberCga)

            }
            else if (isMesh) {
                    
                let meshCga = unusedThingies.pop(); meshCga.copy(oneCga);
                meshCga.meshName = token
                stack.push(meshCga)
            }
            else if (isCgaMethod && token.numArgs === 2 ) {

                const operand2 = stack.pop()
                const operand1 = stack.pop()
                if (operand1 === undefined)
                    break

                let result = unusedThingies.pop()
                if (token.name === `sandwich` && operand2.meshName !== `` ) {
                    result.copy(operand1)
                    result.meshName = operand2.meshName
                }
                else
                    operand1[token.name](operand2, result)

                stack.push( result )

                operand1.free()
                operand2.free()

            }
            else if (isCgaMethod && token.numArgs === 1) {

                const operand1 = stack.pop()
                if (operand1 === undefined)
                    break

                stack.push(operand1[token.name](unusedThingies.pop()))
                
                operand1.free()

            }
            else if (potentialNameRegex.test(token)) {

                let extraCga = cga0

                if (token === `time`)
                    extraCga.fromFloatAndIndex( clock.getElapsedTime() * .1, 0 )
                else if (token === `random`)
                    extraCga.fromFloatAndIndex(Math.random(), 0)
                else if(token === `hand`)
                    cga0.fromEga(mousePlanePosition).flatPpToConformalPoint(extraCga)
                // else if (token === `analogue`)
                //     cga0.fromEga(mousePlanePosition).flatPpToConformalPoint(extraCga)
                else if (/^[A-Z][0-9]+$/.test(token)) {
                    //spreadsheet entry
                    let spreadsheet = spreadsheets[letterSymbols.indexOf(token[0])]
                    let row = parseInt(token.slice(1)) - 1
                    let cell = spreadsheet.cells[row]

                    if (cell.viz === null )
                        extraCga.copy(zeroCga)
                    else {

                        if (!allVisibleMode)
                            cell.refresh()
                        setSecondarySelectionBox(spreadsheet, row)

                        cell.viz.getMv().cast(extraCga)

                    }
                }
                else if (!strToBasisCga(token, extraCga))
                    break

                stack.push(unusedThingies.pop().copy(extraCga))

            }
            else
                break

            if (unusedThingies.length === 0) {
                console.error(`needed more unusedThingies`)
                unusedThingies.push(new Thingy())
            }
        }

        let allIsWell = tokenIndex === numTokens && stack.length === 1 && stack[0].type !== cgaMethods.includes(stack[0])    
        
        if (allIsWell )  
            ret = stack.pop()
        else {
            clearStack(stack)
            ret = null

            let innocentFailure =
                (numTokens === 1 && tokens[0] !== `e`) ||
                stack.length === 0 ||
                (stack.length === 1 && cgaMethods.includes(stack[0]))
            if(!innocentFailure)
                console.error(`Evaluation error at "` + tokens[tokenIndex] + `", tokens having been `, tokens)
        }

        delete stack
        return ret //to be freed!
    }

    //perform tests if there are any
    for(let i = 0, il = tests.length / 2; i < il; ++i) {
        const result = compile( reparseTokens( tests[i*2] ), cga0)
        if(!result.equals(tests[i*2+1])) {
            console.error(`test failed, logging intermediate stuff`)
            const result = compile( reparseTokens( tests[i * 2], true ), cga0, true)
        }
    }
}