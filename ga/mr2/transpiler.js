/*

    dual(reverse(a,target))

    reverse(a,target)
    dual(target)

    reverse(a,target)
    return target
*/

function initTranspiler()
{
    let functionNames = ["reverse", "sq", "assign","gAdd"] //"earth"

    let numberedMvs = Array()
    
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
        currentNodeBranchingFrom = null
        let topNode = new Node("assign") //TODO don't need to pass parent
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
        let skipFrom = -1
        
        for (let i = 0, il = lexemes.length; i < il && skipFrom === -1; ++i) {
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
                else
                    skipFrom = i
            }
            else if (branchCanComplete) {
                if (lexeme === "," && currentNodeBranchingFrom.children.length !== currentNodeBranchingFrom.expectedNumberOfChildren)
                    branchCanComplete = false
                else if (lexeme === ")" && currentNodeBranchingFrom.children.length === currentNodeBranchingFrom.expectedNumberOfChildren)
                    currentNodeBranchingFrom = currentNodeBranchingFrom.parent //we move up having finished branch, so this branch is potentially valid too
                else if (lexeme === "+") {//or other infixes
                    adjustToInfixNode("gAdd")
                    branchCanComplete = false
                }
                else
                    skipFrom = i
            }
            else
                skipFrom = i
        }
        if (!branchCanComplete)
            skipFrom = lexemes.length

        lowestUnusedMv = 0
        let str = parseFunctionNode(topNode) + "target);"
        eval(str)

        return skipFrom
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