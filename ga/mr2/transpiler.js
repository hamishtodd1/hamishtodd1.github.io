/*
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
    logLastParsedString = () => {
        log(parsedString)
    }
    let numberedMvs = Array()

    let infixFunctions = {
        "+": "gAdd",
        "=": "assign"
        //wedge
        //subtract
        //divide
    }
    //then reverse, dual, exponential are single argument
    let infixSymbols = Object.keys(infixFunctions)

    let functionNames = ["reverse", "assign","gAdd","inner","gp","join"] //"earth", sin, cos, tan, exp, sqrt

    let currentNodeBranchingFrom = null
    function Node(lexeme, terminal, replaceMostRecent) {
        this.lexeme = lexeme

        this.children = []

        this.parent = currentNodeBranchingFrom
        if( this.parent !== null )
            this.parent.addChild(this, replaceMostRecent)
        
        if (terminal)
            this.expectedNumberOfChildren = 0
        else if(functionNames.indexOf(lexeme) !== -1)
            this.expectedNumberOfChildren = eval(lexeme).length - 1 //-1 because target is last
        else
            console.error("unrecognized function: ", lexeme)
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

    transpileLine = (lexemes) => {   
        lowestUnusedMv = 0

        currentNodeBranchingFrom = null
        let topNode = new Node("assign",false)
        currentNodeBranchingFrom = topNode

        function adjustToOpenBracket(functionLexeme) {
            branchCanComplete = false
            let newNode = new Node(functionLexeme,false)
            currentNodeBranchingFrom = newNode
        }
        function adjustToInfixNode(infixLexeme) {
            let infixFunctionNode = new Node(infixLexeme,false, true)
            currentNodeBranchingFrom = infixFunctionNode
        }
        
        let branchCanComplete = false
        
        for (let i = 0, il = lexemes.length; i < il; ++i) {
            let lexeme = lexemes[i]

            //token categories!
            let isMvName = namedMvs.indexOf(lexeme) !== -1
            let isFunction = functionNames.indexOf(lexeme) !== -1
            let isOpenBracket = lexeme === "("

            if (isMvName || isFunction || isOpenBracket) {
                if (branchCanComplete)
                    adjustToInfixNode("gp")

                if (isMvName) {
                    new Node('namedMvs["' + child.lexeme + '"],',true)
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

        return parsedString = parseFunctionNode(topNode)
    }

    //since the top node is a "" function it should be ok if there's just a single mv
    let lowestUnusedMv = 0
    function parseFunctionNode(node) {
        let functionLine = node.lexeme + "("
        let computationLines = ""

        node.children.forEach((child) => {
            if(child.children.length === 0)
                functionLine += child.lexeme + ","
            else {
                // You need to have shit between { }, otherwise they'll clash
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