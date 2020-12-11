/*
    function syntax
        python indents, last line is return value
        arrow notation
*/

function initTranspiler(infixOperators, postfixOperators, builtInFunctionNames) {

    AbstractSyntaxTree = function() {
        let currentNodeBranchingFrom = null
        let functionNameJustSeen = null
        let branchCanComplete = false
        let globeProperties = null
        let functionsWithIrNeeded = []

        function Node(lexeme, terminal, replaceMostRecent) {
            this.lexeme = lexeme

            this.children = []

            if (terminal)
                this.expectedNumberOfArguments = 0
            else if (builtInFunctionNames.indexOf(lexeme) !== -1)
                this.expectedNumberOfArguments = eval(lexeme).length //-1 because target is last
            else if (functionsWithIr[lexeme] !== undefined) {
                this.expectedNumberOfArguments = functionsWithIr[lexeme].length //wanna remove that -1. How come reflect works?
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
            delete this.expectedNumberOfArguments
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

        let seen = false

        this.addLexeme = function(tokenIndex,token,lexeme) {
            if (token === "comment" || token === " " || token === "\n")
                return false

            if (lexeme === "stereographic" || lexeme === "reflectHorizontally" )
                seen = true

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
                        if(currentNodeBranchingFrom.expectedNumberOfArguments === 1) //bit hacky
                            branchCanComplete = true
                    }
                    else
                        adjustToOpenBracket("assign")
                }
                else if (isFunction ) {
                    functionNameJustSeen = lexeme

                    if (functionsWithIr[functionNameJustSeen] !== undefined)
                        functionsWithIrNeeded.push(functionNameJustSeen)
                }
            }
            else if (branchCanComplete) {
                if (lexeme === "," && currentNodeBranchingFrom.children.length !== currentNodeBranchingFrom.expectedNumberOfArguments - 1)
                    branchCanComplete = false
                else if (lexeme === ")" ) {
                    if (currentNodeBranchingFrom.children.length === currentNodeBranchingFrom.expectedNumberOfArguments - 1)
                        currentNodeBranchingFrom = currentNodeBranchingFrom.parent //we move up having finished branch, so this branch is potentially valid too
                    else
                        handleError(tokenIndex, "wrong number of non-target arguments for function '" + currentNodeBranchingFrom.lexeme + "' should be " + (currentNodeBranchingFrom.expectedNumberOfArguments-1)+", got " + currentNodeBranchingFrom.children.length)
                }
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
                // debugger
                return false
            }

            return true
        }

        //since the top node is a "" function it should be ok if there's just a single mv
        function parseFunctionNode(node, numTmvs) {
            let finalLine = node.lexeme + "("
            let computationLines = ""

            node.children.forEach((child) => {
                if (child.expectedNumberOfArguments === 0)
                    finalLine += child.lexeme + ","
                else {
                    let transpilationMvName = 'tMv' + numTmvs.value
                    ++numTmvs.value

                    computationLines += parseFunctionNode(child,numTmvs) + transpilationMvName + ');\n'
                    finalLine += transpilationMvName + ','
                }
            })

            while(node.children.length)
                delete node.children.pop()

            return computationLines + finalLine
        }

        this.parseAndAssign = function(
            tokenIndex,nameToAssignTo,lineNumber,
            transpilingFunctionProperties
            ) {
            if (!branchCanComplete) {
                handleError(tokenIndex,"unexpected line end")
                return false
            }

            if (seen) {
                // debugger
            }

            let numTmvs = { value: 0 }
            let bodySansFinalAssignmentTarget = parseFunctionNode(topNode, numTmvs)

            let targetGlsl = globeProperties !== null
            if (targetGlsl) {
                alert("compiling to shader temporarily turned off!")
                debugger

                // bodySansFinalAssignmentTarget += `outputMv);` //valid javascript...

                // bodySansFinalAssignmentTarget = addMvDeclarations(bodySansFinalAssignmentTarget, true, numTmvs.value,"t")

                // functionsWithIrNeeded.forEach((name) => {
                //     header += functionsWithIr[name].glslString + "\n"
                // })

                //these are the thing that let you see it on screen
                // assignTypeAndData(nameToAssignTo, "globeProjection", {
                //     globeProperties, header, bodySansFinalAssignmentTarget
                // })
            }

            //js
            {
                assignMv(nameToAssignTo)
                let body = bodySansFinalAssignmentTarget + `getNameDrawerProperties("` + nameToAssignTo + `").value);`

                body = addMvDeclarations(body, false, numTmvs.value, "t")

                let functionLocalizer = ""
                functionsWithIrNeeded.forEach((name) => {
                    functionLocalizer += "let " + name + " = functionsWithIr." + name + ".jsFunction;\n"
                })
                eval(functionLocalizer + body )
            }

            let tfp = transpilingFunctionProperties
            if (tfp.name !== null) {
                functionsWithIrNeeded.forEach((functionNeeded) => {
                    if (tfp.functionsWithIrNeeded.indexOf(functionNeeded) === -1) //mmm, make sure you don't have a load of leftover shit
                        tfp.functionsWithIrNeeded.push(functionNeeded)
                })

                tfp.ir += 
                    "{\n" +
                        bodySansFinalAssignmentTarget + "fMv" + tfp.numDeclarations.toString() + ");" + 
                    "\n}\n"
                ++tfp.numDeclarations
            }

            //Resetting the tree
            {
                globeProperties = null
                functionsWithIrNeeded.length = 0

                branchCanComplete = false
                currentNodeBranchingFrom = topNode
                functionNameJustSeen = null
            }

            return true
        }
    }
}

//point your phone at a latex equation, it shows you a visualization of it