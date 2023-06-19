/**
    Maybe you want:
        reverse
        log
        negate

    Maybe time should be a weight on a spring/simple harmonic oscillator?

    would be nice to have a guarantee that everything user makes is always well-defined

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

    let numLocalCgas = 32
    let localCgas = Array(numLocalCgas)
    for (let i = 0; i < numLocalCgas; ++i)
        localCgas[i] = new Cga()
    function clearStack(stack) {
        while (stack.length !== 0) {
            let thing = stack.pop()
            if (!cgaMethods.includes(thing))
                localCgas.push(thing) //because all there ever is is localCgas and cgaMethods
        }
    }

    const potentialNameRegex = /^[a-zA-Z0-9₀₁₂₃₄₅ₚₘ𝅘]+$/

    function reparseTokens(expression,logLevel) {

        expression = expression.replace(/\s/g, '')
        const tokens = tokenize(expression)
        if (logLevel > 0)
            log(tokens)
        const parsedTokens = parseTokens(tokens)
        if (logLevel > 0)
            log(parsedTokens)

        while(tokens.length > 0)
            delete tokens.pop()

        return parsedTokens
    }

    compile = ( expression, targetCga, logLevel = 0) => {

        const parsedTokens = reparseTokens( expression, logLevel )
            
        const stack = []
        // if (expression === translateExpression(`hand & e123`) && !mousePlanePosition.isZero() )
        //     debugger
            
        evaluateToStack( parsedTokens, stack )

        if (stack.length !== 1)
            return `malformed expression`
        else {
            let result = stack.pop()
            targetCga.copy(result)
            localCgas.push(result)
            return ``
        }
    }

    let specialSymbols = [`(`, `)`]
    const cgaMethods = []
    class CgaMethod {
        constructor(name, numArgs, precedence, symbols) {
            this.name = name
            this.numArgs = numArgs

            this.symbols = symbols || []
            this.precedence = precedence || 0

            cgaMethods.push(this)
            specialSymbols = specialSymbols.concat(this.symbols)
        }
    }
    
    new CgaMethod(`selectGradeWithCga`, 2, 3, [`_`] )
    new CgaMethod(`mul`,                2, 2, [`*`] )
    new CgaMethod(`meet`,               2, 2, [`∧`,`^`] )
    new CgaMethod(`join`,               2, 2, [`∨`,`&`] )
    new CgaMethod(`inner`,              2, 2, [`·`,`'`] )
    new CgaMethod(`sandwich`,           2, 2, [`⤻`, `>`,`→`] )
    new CgaMethod(`add`,                2, 1, [`+`] )
    new CgaMethod(`negate`,             1, 2, [`-`] )
    let subMethod = new CgaMethod(`sub`,2, 1 )
    new CgaMethod(`projectOn`,          2 )
    new CgaMethod(`dual`,               1 )
    new CgaMethod(`reverse`,            1 ) //You do not use it so often you need a symbol. Fuck prefix.
    new CgaMethod(`exp`,                1 )
    new CgaMethod(`sqrt`,               1 ) //TODO what if they put in unnormalized thing?    
    //and user-made methods would probably be added too
    
    function tokenize(expression) {

        const tokens = []
        let currentToken = ''

        function finishToken() {
            if (currentToken.length > 0) {
                tokens.push(currentToken)
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
            else
                currentToken += char
        }

        finishToken()

        return tokens
    }

    function isNumberOrVariable(token) {
        return !isNaN(parseFloat(token)) || potentialNameRegex.test(token) //hmmm
    }

    function parseTokens(tokens) {
        const outputQueue = []
        const operatorStack = []

        //just used for subtraction
        let nextNegationWouldBeSub = false //because i

        //you want to be able to have scalars next to thingies
        // let next

        tokens.forEach( token => {

            if (isNumberOrVariable(token)) {
                outputQueue.push(token)
                nextNegationWouldBeSub = true
            }
            else if (token === `(`) {
                operatorStack.push(token)
                nextNegationWouldBeSub = true
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

                nextNegationWouldBeSub = true
            }
            else if (cgaMethods.includes(token)) {

                let cm = token
                if(token.name === `negate` && nextNegationWouldBeSub ) {
                    // - b     //means "negate" - nothing previous
                    // a + - b //means "negate" - operator previous
                    // a - b   //means "sub"    - SOMETHING previous, NOT a method
                    cm = subMethod
                }

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

                nextNegationWouldBeSub = false
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

    let alphabet = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`

    //yes, we might want to put this in a shader
    function evaluateToStack(tokens,stack) {

        clearStack(stack)

        let tokenIndex = 0
        let numTokens = tokens.length
        for(tokenIndex; tokenIndex < numTokens; ++tokenIndex ) {
            let token = tokens[tokenIndex]

            if ( !isNaN(parseInt(token[0])) ) {

                let numberCga = localCgas.pop(); numberCga.zero(); numberCga[0] = parseFloat(token)
                stack.push(numberCga)

            }
            else if (cgaMethods.includes(token) && token.numArgs === 2 ) {

                const operand2 = stack.pop()
                const operand1 = stack.pop()
                if (operand1 === undefined)
                    break

                stack.push(operand1[token.name](operand2, localCgas.pop()) )

                localCgas.push(operand1, operand2)

            }
            else if (cgaMethods.includes(token) && token.numArgs === 1) {

                const operand1 = stack.pop()
                if (operand1 === undefined)
                    break

                stack.push(operand1[token.name](localCgas.pop()))
                
                localCgas.push(operand1)

            }
            else if (potentialNameRegex.test(token)) {

                let extraCga = cga0

                if (token === `time`) {
                    extraCga.zero()
                    extraCga[0] = clock.getElapsedTime() * .1
                }
                else if(token === `hand`) {
                    cga0.fromEga(mousePlanePosition).flatPpToConformalPoint(extraCga)
                }
                else if (/^[A-Z][0-9]+$/.test(token)) {
                    //spreadsheet entry
                    let column = alphabet.indexOf(token[0])
                    let row = parseInt(token.slice(1)) - 1
                    let cell = cells[column][row]

                    cell.refresh()

                    if (cell.viz === null )
                        break

                    cell.viz.getMv().cast(extraCga)
                }
                else if (!strToBasisCga(token, extraCga))
                    break

                stack.push(localCgas.pop().copy(extraCga))

            }
            else
                break

            if (localCgas.length === 0) {
                console.error(`needed more localCgas`)
                localCgas.push(new Cga())
            }
        }

        if (tokenIndex !== numTokens ) {

            clearStack(stack)
            let justAComment = numTokens === 1 && tokens[0] !== `e`
            if(!justAComment)
                console.error(`malformed expression, evaluation got to: `, tokens[tokenIndex], `tokens having been `, tokens)
        }
    }

    //perform tests if there are any
    for(let i = 0, il = tests.length / 2; i < il; ++i) {
        const result = compile(tests[i*2], cga0, 0)
        if(!result.equals(tests[i*2+1])) {
            console.error(`test failed, logging intermediate stuff`)
            const result = compile(tests[i * 2], cga0, 1)
        }
    }
}