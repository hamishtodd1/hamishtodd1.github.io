/*
    function syntax
        python indents, last line is return value
        arrow notation
*/

function initTranspiler(infixOperators, postfixOperators, builtInFunctionNames) {

    let loggedErrors = []
    handleError = function(tokenIndex, newError) {
        errorHighlightTokenIndices.push(tokenIndex)
        if (loggedErrors.indexOf(newError) === -1) {
            console.error("transpilation error: \n", newError)
            loggedErrors.push(newError)
        }
    }

    AbstractSyntaxTree = function() {
        let currentNodeBranchingFrom = null
        let functionNameJustSeen = null
        let branchCanComplete = false
        let globeProperties = null
        let functionsNeeded = []

        function Node(lexeme, terminal, replaceMostRecent) {
            this.lexeme = lexeme

            this.children = []

            if (terminal)
                this.expectedNumberOfChildren = 0
            else if (builtInFunctionNames.indexOf(lexeme) !== -1)
                this.expectedNumberOfChildren = eval(lexeme).length - 1 //-1 because target is last
            else if (functionsWithIr[lexeme] !== undefined) {
                this.expectedNumberOfChildren = functionsWithIr[lexeme].length - 1
            }
            else
                console.error("unrecognized function: ", lexeme)

            if (currentNodeBranchingFrom !== null)
                currentNodeBranchingFrom.addChild(this, replaceMostRecent)
            else
                this.parent = null
        }
        Node.prototype.addChild = function (child, replaceMostRecent) {
            if (!replaceMostRecent)
                this.children.push(child)
            else {
                // debugger
                let oldChild = this.children.pop()
                this.children.push(child)
                child.addChild(oldChild, false)
                currentNodeBranchingFrom = child
            }
            child.parent = this
        }
        Node.prototype.deleteProperties = function () {
            delete this.children
            delete this.lexeme
            delete this.parent
            delete this.expectedNumberOfChildren
        }

        let topNode = new Node("assign", false) //probably doesn't need to be this
        currentNodeBranchingFrom = topNode

        function adjustToOpenBracket(functionLexeme) {
            branchCanComplete = false
            currentNodeBranchingFrom = new Node(functionLexeme, false)
        }
        function injectNodeWithCurrentAsChild(infixLexeme) {
            new Node(infixLexeme, false, true)
        }

        this.addLexeme = function(tokenIndex,token,lexeme) {
            if (token === "comment" || token === " " || token === "\n")
                return false

            let isFunction = builtInFunctionNames.indexOf(lexeme) !== -1 || functionsWithIr[lexeme] !== undefined
            let isOpenBracket = lexeme === "("
            let isTerminalColoredName = token === "coloredName" && !isFunction

            if (!isOpenBracket && functionNameJustSeen !== null) {
                handleError(tokenIndex,"function " + functionNameJustSeen + " must be followed by (, instead got " + lexeme)
                return false
            }

            if (isTerminalColoredName || isFunction || isOpenBracket) {
                if (branchCanComplete)
                    injectNodeWithCurrentAsChild("gProduct")

                if (isTerminalColoredName) {
                    branchCanComplete = true

                    switch (getNameDrawerProperties(lexeme).type) {
                        case "mv":
                            new Node('getNameDrawerProperties("' + lexeme + '").value', true)
                            break

                        case "globe":
                            globeProperties = getNameDrawerProperties(lexeme)
                            new Node('pointOnGlobe', true)
                            break
                        
                        default:
                            handleError(tokenIndex, "unrecognized type: " + getNameDrawerProperties(lexeme).type)
                    }
                }
                else if (isOpenBracket) {
                    if(functionNameJustSeen) {
                        adjustToOpenBracket(functionNameJustSeen)
                        functionNameJustSeen = null
                    }
                    else
                        adjustToOpenBracket("assign")
                }
                else if (isFunction ) {
                    functionNameJustSeen = lexeme

                    if (functionsWithIr[functionNameJustSeen] !== undefined)
                        functionsNeeded.push(functionNameJustSeen)
                }
            }
            else if (branchCanComplete) {
                if (lexeme === "," && currentNodeBranchingFrom.children.length !== currentNodeBranchingFrom.expectedNumberOfChildren)
                    branchCanComplete = false
                else if (lexeme === ")" && currentNodeBranchingFrom.children.length === currentNodeBranchingFrom.expectedNumberOfChildren)
                    currentNodeBranchingFrom = currentNodeBranchingFrom.parent //we move up having finished branch, so this branch is potentially valid too
                else if (token === "infixSymbol") {
                    injectNodeWithCurrentAsChild(infixOperators[lexeme])
                    branchCanComplete = false
                }
                else if (token === "postfixSymbol")
                    injectNodeWithCurrentAsChild(postfixOperators[lexeme])
                else {
                    handleError(tokenIndex,"unexpected symbol " + lexeme)
                    return false
                }
            }
            else {
                handleError(tokenIndex,"unexpected symbol before branch end: " + lexeme)
                return false
            }

            return true
        }

        //since the top node is a "" function it should be ok if there's just a single mv
        function parseFunctionNode(node, numTmvsUsed) {
            let finalLine = node.lexeme + "("
            let computationLines = ""

            node.children.forEach((child) => {
                if (child.children.length === 0)
                    finalLine += child.lexeme + ","
                else {
                    let transpilationMvName = 'tMv' + numTmvsUsed.value
                    ++numTmvsUsed.value

                    computationLines += parseFunctionNode(child,numTmvsUsed) + transpilationMvName + ');\n'
                    finalLine += transpilationMvName + ','
                }
            })

            while(node.children.length)
                delete node.children.pop()

            return computationLines + finalLine
        }

        this.parseAndAssign = function(tokenIndex,nameToAssignTo, lineNumber) {
            if (!branchCanComplete) {
                handleError(tokenIndex,"unexpected line end")
                return false
            }

            let numTmvsUsed = { value: 0 }
            let body = parseFunctionNode(topNode, numTmvsUsed)

            if (globeProperties !== null) {
                body += `outputMv);`

                body = addTmvs(body, true, numTmvsUsed.value)

                let header = ""
                functionsNeeded.forEach((name)=>{
                    header += functionsWithIr[name].glslString + "\n"
                })

                // debugger

                assignTypeAndData(nameToAssignTo, "globeProjection", {
                    globeProperties, header, body
                })
            }
            else 
            {
                body += `getNameDrawerProperties("` + nameToAssignTo + `").value);`

                body = addTmvs(body, false, numTmvsUsed.value)

                let header = ""
                functionsNeeded.forEach((name)=>{
                    header += functionsWithIr[name].jsString + "\n"
                })

                assignMv(nameToAssignTo)
                
                eval(header + body) //easy because it does something to variables in scope here
            }

            globeProperties = null
            functionsNeeded.length = 0

            branchCanComplete = false
            currentNodeBranchingFrom = topNode
            functionNameJustSeen = null

            return true
        }
    }

    function TranspiledFunction(name) {
        this.irString = ""
        this.glslString = ""
        this.jsString = ""

        this.length = -1
        this.numTmvsUsed = -1
        
        this.name = name
        functionsWithIr[name] = this
    }
    TranspiledFunction.prototype.setIr = function(numArgumentsIncludingTarget,numTmvsUsed,newIr) {
        this.numTmvsUsed = numTmvsUsed
        this.length = numArgumentsIncludingTarget
        this.irString = newIr
        this.glslString = irToExecutable( true, this.name)
        this.jsString   = irToExecutable(false, this.name)
    }
    new TranspiledFunction("reflectHorizontally")
    let updateAlternatingFunction = () => {
        // if (Math.floor(frameCount / 50) % 2)
        //     functionsWithIr["reflectHorizontally"].setIr(2,0,`assign(arg0,target);`)
        // else 
        {
            functionsWithIr["reflectHorizontally"].setIr(2,2,
            `
            plane(tMv0,1.,0.,0.,0.);

            gProduct(tMv0,arg0,tMv1);
            gProduct(tMv1,tMv0,target);
            `)
        }

        // `
        // assign(pointOnGlobe,outputMv);
        // outputMv[12] -= .09;
        // `
        // `
        // point(outputMv,
        // 	lon * cos(lat) * .3,
        // 	lat * .3,
        // 	0.,1.);
        // `
    }
    // updateFunctions.splice(0, 0, updateAlternatingFunction)
    updateAlternatingFunction()

    function addTmvs(body,glslInsteadOfJs, numTmvsUsed) {
        let ret = body
        if (glslInsteadOfJs) {
            for (let i = 0; i < numTmvsUsed; ++i)
                ret = `float tMv` + i.toString() + `[16];\n` + ret
        }
        else {
            for (let i = 0; i < numTmvsUsed; ++i)
                ret = `let tMv` + i.toString() + ` = new Float32Array(16);\n` + ret + `\ndelete tMv` + i.toString() + `;`
        }

        return ret
    }

    function irToExecutable(glslInsteadOfJs, functionName) {
        let f = functionsWithIr[functionName]

        let body = addTmvs(f.irString, glslInsteadOfJs,f.numTmvsUsed)

        let isFunction = true
        if(!isFunction)
            return body
        
        let numNonTargetArguments = f.length - 1
        let signature = ""
        if (glslInsteadOfJs) {
            signature += `void ` + functionName + `(`
            for (let i = 0; i < numNonTargetArguments; ++i)
                signature += `in float arg` + i.toString() + `[16],`
            signature += `out float target[16])`
        }
        else {
            signature += `function ` + functionName + `(`
            for (let i = 0; i < numNonTargetArguments; ++i)
                signature += `arg` + i.toString() + `,`
            signature += `target)`
        }

        return signature + "\n{" + body + "\n}"
    }
}

//point your phone at a latex equation, it shows you a visualization of it