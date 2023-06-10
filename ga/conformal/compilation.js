/**
    Functions you want:
        Infix:
            Add, Subtract, Mul, Wedge, Inner, Vee (div = mul by inverse)
        Postfix:
            Inverse, grade select (underscore?), square
        Prefix
            exp, log, sqrt, negate, reverse

    Less certain
        sin, cos, arcsin, arcos
        Dual?
        Sum over... integral? Differential?
        Summation over a column
        Reverse

    User implements these themselves:
        Norm
        Infinity Norm
        Sqrt
    I mean, people expect no better in programming, no subscripts there

    Could do it with little coloured squares to represent the colors of the mvs
 */

function initCompilation() {

    class Number extends Multivector {
        static get size() { return 1 }

        constructor() {
            super(1)
        }

        mul(b, target) {
            if(target === undefined)
                target = new Number()

            target[0] = this[0] * b[0]
            return target
        }

        div(b, target) {
            if(target === undefined)
                target = new Number()

            target[0] = this[0] / b[0]
            return target
        }
    }

    function parseExpression(expression) {
        // Remove whitespace
        expression = expression.replace(/\s/g, '');

        const inFixes = ['+', '-', '*', '/']
        const postFixes = ['!']
        const sqrtFunction = 'sqrt'

        function getPrecedence(operator) {
            if (operator === '+' || operator === '-')
                return 1
            else if (operator === '*' || operator === '/')
                return 2
            return 0
        }

        function reduceStack() {

            const operator = operatorStack.pop()
            const operand2 = numberStack.pop()
            const operand1 = numberStack.pop()

            let result = null
            switch (operator) {
                case '+':
                    result = operand1.add(operand2)
                case '-':
                    result = operand1.subtract(operand2)
                case '*':
                    result = operand1.mul(operand2)
                case '/':
                    result = operand1.div(operand2)
                default:
                    console.error('Invalid operator: ' + operator)
            }

            numberStack.push(result)
        }

        const numberStack = []
        const operatorStack = []

        let numberBuffer = ''
        function clearNumberBuffer() {
            if (numberBuffer !== '') {
                const number = new Number(parseFloat(numberBuffer))
                numberStack.push(number)
                numberBuffer = ''
            }
        }

        for (let i = 0, il = expression.length; i < il; i++) {
            const char = expression[i]

            if (char === '(')
                operatorStack.push(char)
            else if (char === ')' ) {
                clearNumberBuffer()

                // Process operators within the parentheses
                while (
                    operatorStack.length > 0 &&
                    operatorStack[operatorStack.length - 1] !== '('
                ) {
                    reduceStack()
                }

                // Pop the opening bracket from the operator stack
                if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] === '(') {
                    operatorStack.pop()
                }
            }
            else if (inFixes.includes(char)) {
                clearNumberBuffer()

                // Process the operators and perform calculations if necessary
                while (
                    operatorStack.length > 0 &&
                    operatorStack[operatorStack.length - 1] !== '(' && //errr, and what do you do if it IS '('?
                    getPrecedence(operatorStack[operatorStack.length - 1]) >= getPrecedence(char)
                ) {
                    reduceStack()
                }

                operatorStack.push(char)
            }
            else if (postFixes.includes(char)) {
                clearNumberBuffer()

                // Apply factorial operation to the top number on the stack
                const operand = numberStack.pop()
                const result = operand.factorial()
                numberStack.push(result)
            }
            else if (expression.substr(i, sqrtFunction.length) === sqrtFunction) {
                clearNumberBuffer()

                // Skip ahead to the closing parenthesis of the sqrt() function
                let j = i + sqrtFunction.length
                let parenthesesCount = 1
                while (j < expression.length && parenthesesCount > 0) {
                    if (expression[j] === '(')
                        parenthesesCount++
                    else if (expression[j] === ')')
                        parenthesesCount--
                        
                    j++
                }

                // Parse the expression inside the sqrt() function recursively
                const subExpression = expression.substring(i + sqrtFunction.length + 1, j - 1)
                const sqrtResult = parseExpression(subExpression).sqrt()
                numberStack.push(sqrtResult)

                // Update the main loop index
                i = j - 1
            }
            else {
                numberBuffer += char
            }
        }

        // Process the remaining number buffer
        if (numberBuffer !== '') {
            const number = new Number(parseFloat(numberBuffer))
            numberStack.push(number)
        }

        // Perform any remaining calculations
        while (operatorStack.length > 0) {
            reduceStack()
        }

        // The final result should be at the top of the number stack
        return numberStack[0]
    }

    // Example usage
    const expression = 'sqrt(a + (b * c)!)'
    const parsedCode = parseExpression(expression)
    console.log(parsedCode) // Outputs: (a.add(b.mul(c.factorial()))).sqrt()
}

function initCompilation() {

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