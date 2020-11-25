/*
    Below is based on the naieve assumption of

    function syntax
        python indents, last line is return value

    Need to use the built in capabilities, don't be manipulating a string every time you call a function (just when you define it)
    Yeah, transpile to a proper glsl/javascript function declaration
        So different signatures (all "in" for glsl)

    You get the function as a string
    It has its leaves
    the function arguments need to be put in those leaves, somehow

    When you type the name of an mv, it becomes a number in the backgroundString? Or something?

*/

function initTranspiler(infixOperators, infixSymbols, builtInFunctionNames) {

    let loggedErrors = []
    function logErrorIfNew(newError) {
        if (loggedErrors.indexOf(newError) === -1) {
            console.error("transpilation error: \n", newError)
            loggedErrors.push(newError)
        }
    }

    let numberedMvs = []



    AbstractSyntaxTree = function() {
        let currentNodeBranchingFrom = null
        function Node(lexeme, terminal, replaceMostRecent) {
            this.lexeme = lexeme

            this.children = []

            this.parent = currentNodeBranchingFrom
            if (this.parent !== null)
                this.parent.addChild(this, replaceMostRecent)

            if (terminal)
                this.expectedNumberOfChildren = 0
            else if (builtInFunctionNames.indexOf(lexeme) !== -1)
                this.expectedNumberOfChildren = eval(lexeme).length - 1 //-1 because target is last
            else
                console.error("unrecognized function: ", lexeme)
        }
        Node.prototype.addChild = function (child, replaceMostRecent) {
            if (!replaceMostRecent)
                this.children.push(child)
            else {
                // debugger
                let oldChild = this.children.pop()
                this.children.push(child)
                child.addChild(oldChild, false)
            }
            child.parent = this
        }
        Node.prototype.deleteProperties = function () {
            delete this.children
            delete this.lexeme
            delete this.parent
            delete this.expectedNumberOfChildren
        }

        let topNode = new Node("assign", false)
        currentNodeBranchingFrom = topNode

        let branchCanComplete = false
        function adjustToOpenBracket(functionLexeme) {
            branchCanComplete = false
            currentNodeBranchingFrom = new Node(functionLexeme, false)
        }
        function adjustToInfixNode(infixLexeme) {
            currentNodeBranchingFrom = new Node(infixLexeme, false, true)
        }

        let functionNameJustSeen = null
        this.addLexeme = function(token,lexeme) {
            if (token === "comment" || token === " " || token === "\n")
                return false
            if (functionNameJustSeen !== null)
                logErrorIfNew("function " + lexeme + " must be followed by open bracket")

            let isMvLexeme = (token === "coloredName" || token === "uncoloredName") && isNameMv(lexeme)
            let isFunction = builtInFunctionNames.indexOf(lexeme) !== -1 //TODO transpiledFunction
            let isOpenBracket = lexeme === "("

            if (isMvLexeme || isFunction || isOpenBracket) {
                if (branchCanComplete)
                    adjustToInfixNode("gp")

                if (isMvLexeme) {
                    //instead it could be getNamePropertiesAndReturnNullIfNoDrawers(child.lexeme).value
                    //OR coloredNamesAlphabetically
                    new Node('getNamePropertiesAndReturnNullIfNoDrawers("' + lexeme + '").value', true)
                    branchCanComplete = true
                }
                else if (isOpenBracket) {
                    if(functionNameJustSeen) {
                        adjustToOpenBracket(functionNameJustSeen)
                        functionNameJustSeen = null
                    }
                    else
                        adjustToOpenBracket("assign")
                }
                else if (isFunction )
                    functionNameJustSeen = lexeme
            }
            else if (branchCanComplete) {
                if (lexeme === "," && currentNodeBranchingFrom.children.length !== currentNodeBranchingFrom.expectedNumberOfChildren)
                    branchCanComplete = false
                else if (lexeme === ")" && currentNodeBranchingFrom.children.length === currentNodeBranchingFrom.expectedNumberOfChildren)
                    currentNodeBranchingFrom = currentNodeBranchingFrom.parent //we move up having finished branch, so this branch is potentially valid too
                else if (infixSymbols.indexOf(lexeme) !== -1) {//or other infixes
                    adjustToInfixNode(infixOperators[lexeme])
                    branchCanComplete = false
                }
                else
                    logErrorIfNew("unexpected symbol " + lexeme)
            }
            else
                logErrorIfNew("unexpected symbol before branch end: " + lexeme)
        }

        //since the top node is a "" function it should be ok if there's just a single mv
        function parseFunctionNode(node) {
            let lowestUntranscribedMv = 0
            
            let finalLine = node.lexeme + "("
            let computationLines = ""

            node.children.forEach((child) => {
                if (child.children.length === 0)
                    finalLine += child.lexeme + ","
                else {
                    // You need to have shit between { }, otherwise they'll clash
                    while (numberedMvs.length <= lowestUntranscribedMv)
                        numberedMvs.push(new Float32Array(16))
                    let mvString = 'numberedMvs[' + lowestUntranscribedMv + ']'
                    ++lowestUntranscribedMv

                    computationLines += parseFunctionNode(child) + mvString + ');\n'
                    finalLine += mvString + ','
                }

                //should be ok to reuse the numbered mvs across lines, you're not doing anything with them after
            })

            while(node.children.length)
                delete node.children.pop()

            return computationLines + finalLine
        }

        this.parseAndAssign = function(nameToAssignTo) {
            if (!branchCanComplete)
                logErrorIfNew("unexpected line end")
            // topNode.deleteProperties()
            // delete topNode
            let str = parseFunctionNode(topNode) + `getNamePropertiesAndReturnNullIfNoDrawers("` + nameToAssignTo + `").value);`
            eval(str)

            branchCanComplete = false
            currentNodeBranchingFrom = topNode
        }
    }

    /*
        Ok so the arguments are just a1, a2, etc
        The namedMvs that get given to them, well, yes that happens, but that's "just what you see"
    */
    if(0)
    {
        let jsArgumentsString = "( "
        let glslArgumentsString = "( "
        for (let i = 0; i < numArguments; ++i) {
            glslArgumentsString += (i === 0 ? "" : ", ") + "in float " + "argument" + i + "[16]"
            jsArgumentsString += (i === 0 ? "" : ", ") + "argument" + i
        }
        glslArgumentsString += (i === 0 ? "" : ", ") + "in float " + "target"
        jsArgumentsString += (i === 0 ? "" : ", ") + "target"

        lines.forEach((line, lineIndex) => {

            let intermediateRepresentation = transpileLine(line);
            jsBodyString +=
                "const variable" + lineIndex + " = new Float32Array(16); " + + "\n" +
                transpileLine(lexemes)

            glslBodyString +=
                "const float variable" + lineIndex + "[16]; " + + "\n" +
                + "namedMvs[" + name + "]"
        })
        let body = something +
            "return " + somethingElse + "\n}"

        let jsString = "function " + functionName + jsArgumentString + ") {\n" +
            body +
            "return variable" + (lines.length - 1).toString() + ";"
        "\n}"
        let glslString = "void " + functionName + glslArgumentString + ") {\n" +
            body +
            "return " +
            "\n}"
    }
}

//point your phone at a latex equation, it shows you a visualization of it