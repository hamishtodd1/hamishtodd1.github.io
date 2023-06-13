/**
    Functions you want:
        Infix:
            Add, Subtract, Mul, Wedge, Inner, Vee (div = mul by inverse)
            Underscore for grade selection
        Functions?
            exp, log, sqrt, reverse
        Negate?

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
        `2 + 3`, new Cga().fromFloatAndIndex(5, 0),
        `(2 + 3) * 5`, new Cga().fromFloatAndIndex(25, 0),
        `(e1 ∧ e2) ∧ e3`, e123c,
    ]

    const potentialNameRegex = /^[a-zA-Z0-9]+$/

    function evaluateExpression(expression, logLevel = 0) {
        expression = expression.replace(/\s/g, '')
        const tokens = tokenize(expression)
        if(logLevel > 0)
            log(tokens)
        const parsedTokens = parseTokens(tokens)
        if(logLevel > 0)
            log(parsedTokens)
        // debugger
        return evaluate(parsedTokens)
    }

    const specialSymbols = [`(`, `)`]
    const cgaMethods = []
    class CgaMethod {
        constructor(name, numArgs, symbol, precedence) {
            this.name = name
            this.numArgs = numArgs
            this.symbol = symbol || null
            this.precedence = precedence || null

            cgaMethods.push(this)
            if(this.symbol !== null)
                specialSymbols.push(this.symbol)
        }
    }
    
    new CgaMethod(`selectGradeWithCga`, 2, "_", 3 )
    new CgaMethod(`mul`,                2, "*", 2 )
    new CgaMethod(`meet`,               2, "∧", 2 )
    new CgaMethod(`join`,               2, "∨", 2 )
    new CgaMethod(`inner`,              2, "·", 2 )
    new CgaMethod(`sandwich`,           2, "⤻", 2 )
    new CgaMethod(`add`,                2, "+", 1 )
    new CgaMethod(`sub`,                2, "-", 1 )
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
            let cm = cgaMethods.find( cm => cm.symbol === char )

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

        tokens.forEach( token => {

            if (isNumberOrVariable(token)) {
                outputQueue.push(token)
            } else if (token === '(') {
                operatorStack.push(token)
            } else if (token === ')') {
                
                // Pop to queue until opening bracket is encountered
                while (
                    operatorStack.length && 
                    operatorStack[operatorStack.length - 1] !== '('
                ) {
                    outputQueue.push(operatorStack.pop())
                }

                if (operatorStack.length && operatorStack[operatorStack.length - 1] === '(')
                    operatorStack.pop() // Discard opening bracket

            } else if (cgaMethods.includes(token)) {

                //if you have no precedence, it's a bit like being "5*(some,shit)" - so, maximal precedence
                if( token.precedence === null )
                    operatorStack.push(token)
                else {
                    // if you have non-maximal precedence, pop operator stack fully
                    // unless maybe an operator with lower precedence is encountered
                    while (
                        operatorStack.length &&
                        operatorStack[operatorStack.length - 1] !== '(' &&
                        (precedence[token] || 0) <= (precedence[operatorStack[operatorStack.length - 1]] || 0)
                    ) {
                        outputQueue.push(operatorStack.pop())
                    }
                    operatorStack.push(token)
                }
            }
            else
                console.error("Unrecognized token: "+token)
        })

        // Pop remaining operators to queue
        while (operatorStack.length)
            outputQueue.push(operatorStack.pop())

        return outputQueue
    }

    let numLocalCgas = 32
    let localCgas = Array(numLocalCgas)
    for(let i = 0; i < numLocalCgas; ++i)
        localCgas[i] = new Cga()

    // function popArrFromStack(n) {
    //     let arr = Array(n)
    //     for (let i = 0; i < n; ++i)
    //         arr[n - i - 1] = stack.pop()
    //     return arr
    // }

    const stack = []
    //yes, we might want to put this in a shader
    function evaluate(tokens) {
        stack.length = 0

        // debugger
        tokens.forEach(token=> {

            if ( !isNaN(parseInt(token[0])) ) {

                let numberCga = localCgas.pop(); numberCga.zero(); numberCga[0] = parseFloat(token)
                stack.push(numberCga)

            } else if (cgaMethods.includes(token) && token.numArgs === 2 ) {

                const operand2 = stack.pop()
                const operand1 = stack.pop()
                // if (operand1 === undefined)
                //     debugger
                stack.push( operand1[token.name]( operand2, localCgas.pop() ) )
                localCgas.push(operand1,operand2)

            } else if (cgaMethods.includes(token) && token.numArgs === 1) {

                const operand1 = stack.pop()
                stack.push(operand1[token.name](localCgas.pop()))
                localCgas.push(operand1)

            } else if (potentialNameRegex.test(token)) {

                let namedCga = localCgas.pop()
                let isBlade = strToCga(token, namedCga)
                if(isBlade)
                    stack.push(namedCga)
                    
                //could also be row-and-column

            } else {
                console.error("not sure what to do with this token: ", token)
            }

            if (localCgas.length === 0)
                console.error("need more localCgas")
        })

        if(stack.length !== 1)
            console.error("invalid expression")

        return stack.pop()
    }

    //perform tests
    for(let i = 0, il = tests.length / 2; i < il; ++i) {
        const result = evaluateExpression(tests[i*2], 0)
        if(!result.equals(tests[i*2+1])) {
            console.error("test failed, logging intermediate stuff")
            const result = evaluateExpression(tests[i * 2], 1)
            log(result)
        }
    }
}

function _initCompilation() {

    //enum: sorts-of-viz
    const NO_VIZ_TYPE = 0
    const SPHERE = 1
    const SPINOR = 2
    const vizTypes = [NO_VIZ_TYPE, SPHERE, SPINOR]
    //want a mesh type, and a curve type
    //no longer sorts-of-viz
    let constructors = [() => null, SphereViz, RotorViz]

    let numOfEachVizType = 90
    let unusedVizes = Array(vizTypes.length)
    for (let i = 0; i < vizTypes.length; ++i) {
        unusedVizes[i] = Array(numOfEachVizType)
        for (let j = 0; j < numOfEachVizType; ++j) {
            if (i === 0)
                unusedVizes[i][j] = null
            else {
                unusedVizes[i][j] = new constructors[i]()
                unusedVizes[i][j].visible = false
            }
        }
    }

    let knownMultivectors = {
        "e1": e1c, "e2": e2c, "e3": e3c,
        "eo": eo, "ep": ep, // "e0": e0c, //yet to have a satisfying visualization of this
        "e12": e12c, "e23": e23c, "e31": e31c, "e13": e13c, "e12": e12c,
        "e01": e01c, "e02": e02c, "e03": e03c,
        "e1p": e1p, "e2p": e2p, "e3p": e3p,
    }

    // parse into AST... parse out again

    // class Ast {

    // }

    compile = (cell) => {
        let oldVizType = cell.viz === null ? NO_VIZ_TYPE : constructors.indexOf(cell.viz.constructor)

        let trimmed = cell.currentText.trim()
        let vizType = knownMultivectors[trimmed] === undefined ? NO_VIZ_TYPE : vizTypes[trimmed.length - 1]

        if (oldVizType !== vizType) {
            unusedVizes[oldVizType].push(cell.viz)
            cell.viz = unusedVizes[vizType].pop()
        }

        //now give it the value
        if (vizType !== NO_VIZ_TYPE) {
            if (knownMultivectors[trimmed] !== undefined)
                knownMultivectors[trimmed].cast(cell.viz.getMv())
            else
                cell.viz.getMv().zero()
        }
    }
}