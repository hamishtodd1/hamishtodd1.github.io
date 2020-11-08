/*
*/

function initTranspiler()
{
    let loggedErrors = []
    function logErrorIfNew(newError) {
        if (loggedErrors.indexOf(newError) === -1) {
            console.error("transpilation error: \n", newError)
            loggedErrors.push(newError)
        }
    }

    let parsedString = ""
    sigh = () => {
        log(parsedString)
    }
    let numberedMvs = Array()

    let infixFunctions = {
        "+": "gAdd",
        "=": "def"
        //wedge
        //subtract
        //divide
    }
    //then reverse, dual, exponential are single argument
    let infixSymbols = Object.keys(infixFunctions)

    let functionNames = ["reverse", "assign","gAdd","inner","gp","join"] //"earth", sin, cos, tan, exp, sqrt

    let currentNodeBranchingFrom = null
    function Node(lexeme, replaceMostRecent) {
        this.lexeme = lexeme

        this.children = []

        this.parent = currentNodeBranchingFrom
        if( this.parent !== null )
            this.parent.addChild(this, replaceMostRecent)

        if (orderedNames.indexOf(lexeme) !== -1 )
            this.expectedNumberOfChildren = 0
        else if(functionNames.indexOf(lexeme) !== -1)
            this.expectedNumberOfChildren = eval(lexeme).length - 1 //-1 because target is last
        else
            console.error("unrecognized lexeme: ", lexeme)
    }
    Node.prototype.addChild = function(child, replaceMostRecent) {
        if (!replaceMostRecent)
            this.children.push(child)
        else {
            let oldChild = this.children.pop()
            this.children.push(child)
            child.addChild(oldChild,false)
        }
        child.parent = this
    }

    transpile = (lexemes,target) => {   
        lowestUnusedMv = 0

        currentNodeBranchingFrom = null
        let topNode = new Node("assign")
        currentNodeBranchingFrom = topNode

        function adjustToOpenBracket(functionLexeme) {
            branchCanComplete = false
            let newNode = new Node(functionLexeme)
            currentNodeBranchingFrom = newNode
        }
        function adjustToInfixNode(infixLexeme) {
            let infixFunctionNode = new Node(infixLexeme, true)
            currentNodeBranchingFrom = infixFunctionNode
        }
        
        let branchCanComplete = false
        
        for (let i = 0, il = lexemes.length; i < il; ++i) {
            let lexeme = lexemes[i]

            let isMvName = orderedNames.indexOf(lexeme) !== -1
            let isFunction = functionNames.indexOf(lexeme) !== -1
            let isOpenBracket = lexeme === "("

            if (isMvName || isFunction || isOpenBracket) {
                if (branchCanComplete)
                    adjustToInfixNode("gp")

                if (isMvName) {
                    new Node(lexeme)
                    branchCanComplete = true
                }
                else if (isFunction && lexemes[i + 1] === "(") {
                    adjustToOpenBracket(lexeme)
                    ++i
                }
                else if (isOpenBracket)
                    adjustToOpenBracket("assign")
                else {
                    logErrorIfNew("function " + lexeme + " must be followed by open bracket")
                    return i
                }
            }
            else if (branchCanComplete) {
                if (lexeme === "," && currentNodeBranchingFrom.children.length !== currentNodeBranchingFrom.expectedNumberOfChildren)
                    branchCanComplete = false
                else if (lexeme === ")" && currentNodeBranchingFrom.children.length === currentNodeBranchingFrom.expectedNumberOfChildren)
                    currentNodeBranchingFrom = currentNodeBranchingFrom.parent //we move up having finished branch, so this branch is potentially valid too
                else if (infixSymbols.indexOf(lexeme) === -1) {//or other infixes
                    adjustToInfixNode(infixFunctions[lexeme])
                    branchCanComplete = false
                }
                else {
                    logErrorIfNew("unexpected symbol " + lexeme)
                    return i
                }
            }
            else {
                logErrorIfNew("unexpected symbol before branch end: " + lexeme)
                return i
            }
        }
        if (!branchCanComplete) {
            logErrorIfNew("unexpected line end after symbol " + lexemes[lexemes.length-1])
            return lexemes.length - 1
        }

        // if(lexemes.indexOf("inner") !== -1)
        //     debugger
        parsedString = parseFunctionNode(topNode) + "target);"
        eval(parsedString)

        return -1
    }

    //since the top node is a "" function it should be ok if there's just a single mv
    let lowestUnusedMv = 0
    function parseFunctionNode(node) {
        let functionLine = node.lexeme + "("
        let computationLines = ""

        node.children.forEach((child) => {
            if(child.children.length === 0) {
                functionLine += 'namedMvs["' + child.lexeme + '"],'

            }
            else {
                while (numberedMvs.length <= lowestUnusedMv)
                    numberedMvs.push(new Float32Array(16))
                let mvString = 'numberedMvs[' + lowestUnusedMv + ']'
                ++lowestUnusedMv
                
                computationLines += parseFunctionNode(child) + mvString + ');\n'
                functionLine += mvString + ','
            }
        })

        return computationLines + functionLine
    }
}

//point your phone at a latex equation, it shows you a visualization of it