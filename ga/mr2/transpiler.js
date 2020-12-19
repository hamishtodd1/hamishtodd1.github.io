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

        let namesWithLocalizationNeeded = []

        function Node(lexeme, terminal, replaceMostRecent) {
            this.lexeme = lexeme

            this.children = []

            if (terminal)
                this.expectedNumberOfArguments = 0
            else if (builtInFunctionNames.indexOf(lexeme) !== -1)
                this.expectedNumberOfArguments = eval(lexeme).length
            else if (functionsWithIr[lexeme] !== undefined) {
                this.expectedNumberOfArguments = functionsWithIr[lexeme].length
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
                // console.error("b")
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

        this.addLexeme = function(tokenIndex,token,lexeme) {
            if (token === "comment" || token === " " || token === "\n")
                return false

            // log(lexeme)

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
                            new Node(lexeme, true)
                            namesWithLocalizationNeeded.push(lexeme)
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
                else if (isFunction )
                    functionNameJustSeen = lexeme
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
        function parseFunctionNode(node, numTmvs, argumentNames) {
            let finalLine = node.lexeme + "("
            let computationLines = ""

            //terminal symbols get transformed into arg0, arg1

            node.children.forEach((child) => {
                if (child.expectedNumberOfArguments === 0)
                    finalLine += child.lexeme + ","
                else {
                    let transpilationMvName = 'tMv' + numTmvs.value
                    ++numTmvs.value

                    computationLines += parseFunctionNode(child,numTmvs,argumentNames) + transpilationMvName + ');\n'
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

            let tfp = transpilingFunctionProperties

            let numTmvs = { value: 0 }
            let bodySansFinalAssignmentTarget = parseFunctionNode(topNode, numTmvs, tfp.argumentsInSignature)

            let targetGlsl = globeProperties !== null
            if (targetGlsl) {
                let body = bodySansFinalAssignmentTarget + `target);`

                if(tfp.argumentsInSignature.length !== 0) {
                    console.error("not sure what to do here")
                    debugger
                    // tfp.argumentsInSignature.forEach((argument, i) => {
                    //     body = "float arg" + i + " = " + argument + ";\n" + body
                    // })
                }

                body = addMvDeclarations(body,  true, numTmvs.value, namesWithLocalizationNeeded)

                // "just" the things that let you see it on screen
                assignTypeAndData(nameToAssignTo, "globeProjection", {
                    globeProperties, body
                })
            }
            else {
                let body = bodySansFinalAssignmentTarget + `getNameDrawerProperties("` + nameToAssignTo + `").value);\n`
                body = addMvDeclarations(body, false, numTmvs.value, namesWithLocalizationNeeded)

                assignMv( nameToAssignTo )
                eval( body )
            }

            if (tfp.name !== null) {
                namesWithLocalizationNeeded.forEach((name) => {
                    let externalMvNotKnownToFunctionYet = 
                        tfp.internalDeclarations.indexOf(name) === -1 &&
                        tfp.namesWithLocalizationNeeded.indexOf(name) === -1 &&
                        tfp.argumentsInSignature.indexOf(name) === -1
                    if (externalMvNotKnownToFunctionYet)
                        tfp.namesWithLocalizationNeeded.push(name)
                })

                tfp.maxTmvs = Math.max(tfp.maxTmvs, numTmvs.value)
                tfp.ir += 
                    "   {\n" +
                    bodySansFinalAssignmentTarget + nameToAssignTo + ");\n" +
                    "   }\n"
                tfp.internalDeclarations.push(nameToAssignTo)
                //you're building up that list that's declared internally, what about the ones that aren't?
            }

            //Resetting the tree
            {
                globeProperties = null
                
                namesWithLocalizationNeeded.length = 0

                branchCanComplete = false
                currentNodeBranchingFrom = topNode
                functionNameJustSeen = null
            }

            return true
        }
    }
}

//point your phone at a latex equation, it shows you a visualization of it