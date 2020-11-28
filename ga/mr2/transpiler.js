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
        debugger
    }

    let numberedMvs = []

    transpiledFunctions["alternatingProj"] = {
        glslString: "", //maaaaaybe we'll have the actual js function
        length: 2 //num arguments, including target
    }
    let updateAlternatingFunction = () => {
        transpiledFunctions["alternatingProj"].glslString =
            Math.floor(frameCount / 50) % 2 ?
                `
                void alternatingProj(in float argument1[16], out float target[16])
                {
                    assign(argument1,target);
                }
                `
                :
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
                `
                void alternatingProj(in float argument1[16], out float target[16])
                {
                    float reflector[16];
                    plane(reflector,1.,0.,0.,0.);

                    float numberedMvs0[16];
                    gProduct(reflector,argument1,numberedMvs0);
                    gProduct(numberedMvs0,reflector,target);
                }
                `
        //what you want next is putting mv into this function and it friggin works
    }
    updateFunctions.splice(0, 0, updateAlternatingFunction)
    updateAlternatingFunction()


    AbstractSyntaxTree = function() {
        let currentNodeBranchingFrom = null
        let functionNameJustSeen = null
        let branchCanComplete = false
        let glslStuff = {
            globeProperties: null,
            main: "",
            header: ""
        }

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
            else if (transpiledFunctions[lexeme] !== undefined) {
                this.expectedNumberOfChildren = transpiledFunctions[lexeme].length - 1
            }
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

        function adjustToOpenBracket(functionLexeme) {
            branchCanComplete = false
            currentNodeBranchingFrom = new Node(functionLexeme, false)
        }
        function adjustToInfixNode(infixLexeme) {
            currentNodeBranchingFrom = new Node(infixLexeme, false, true)
        }

        this.addLexeme = function(token,lexeme) {
            if (token === "comment" || token === " " || token === "\n")
                return false

            let isFunction = builtInFunctionNames.indexOf(lexeme) !== -1 || transpiledFunctions[lexeme] !== undefined
            let isOpenBracket = lexeme === "("
            let isTerminalColoredName = token === "coloredName" && !isFunction
            //ok but it's NOT an mv, it's a globe! that changes everything!

            if (!isOpenBracket && functionNameJustSeen !== null)
                logErrorIfNew("function " + functionNameJustSeen + " must be followed by (, instead got " + lexeme)

            if (isTerminalColoredName || isFunction || isOpenBracket) {
                if (branchCanComplete)
                    adjustToInfixNode("gProduct")

                if (isTerminalColoredName) {
                    branchCanComplete = true

                    let nameDrawers = getNameDrawerProperties(lexeme).drawers
                    if (nameDrawers[0] === pictogramDrawers.mv[0])
                        new Node('getNameDrawerProperties("' + lexeme + '").value', true)

                    if (nameDrawers[0] === pictogramDrawers.globe) { //that's a type thing, it's an array
                        glslStuff.globeProperties = getNameDrawerProperties(lexeme)
                        new Node('pointOnGlobe', true)
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

                    if (transpiledFunctions[functionNameJustSeen] !== undefined)
                        glslStuff.header += transpiledFunctions[functionNameJustSeen].glslString
                }
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
        function parseFunctionNode(node,glslInsteadOfJs) {
            let lowestUnusedMv = 0
            
            let finalLine = node.lexeme + "("
            let computationLines = ""

            node.children.forEach((child) => {
                if (child.children.length === 0)
                    finalLine += child.lexeme + ","
                else {
                    // You need to have shit between { }, otherwise they'll clash
                    let mvString = ``
                    if(glslInsteadOfJs) {
                        mvString = 'numberedMvs' + lowestUnusedMv
                        computationLines = `float ` + mvString + `[16];\n` + computationLines
                    }
                    else {
                        while (numberedMvs.length <= lowestUnusedMv)
                            numberedMvs.push(new Float32Array(16))
                        mvString = 'numberedMvs[' + lowestUnusedMv + ']'
                    }
                    ++lowestUnusedMv

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
            
            if (glslStuff.globeProperties !== null) {
                assignTypeAndData(nameToAssignTo, pictogramDrawers.globeProjection, {
                    globeProperties: glslStuff.globeProperties,
                    main: parseFunctionNode(topNode,true) + `outputMv);`,
                    header: glslStuff.header
                })

                glslStuff.globeProperties = null
                glslStuff.main = ""
                glslStuff.header = ""
            }
            else 
            {
                assignMv(nameToAssignTo) //creates a new array, which kinda sucks. Probably better passing in the array here
                let parsed = parseFunctionNode(topNode) + `getNameDrawerProperties("` + nameToAssignTo + `").value);`
                // log(parsed)
                // debugger
                eval(parsed) //easy because it does something to variables in scope here
            }

            branchCanComplete = false
            currentNodeBranchingFrom = topNode
            functionNameJustSeen = null
        }
    }

    /*
        Ok so the arguments are just a1, a2, etc
        The namedMvs that get given to them, well, yes that happens, but that's "just what you see"
    */
    if(0)
    {
        let jsArgumentsString = `( `
        let glslArgumentsString = `( `
        function addArgument(argumentName) {
            glslArgumentsString += (i === 0 ? `` : `, `) + `in float ` + `target`
            jsArgumentsString += (i === 0 ? `` : `, `) + `target`
        }

        for (let i = 0; i < numArguments; ++i) {
            glslArgumentsString += `in float ` + `argument` + i + `[16],`
            jsArgumentsString += `argument` + i + `,`
        }
        glslArgumentsString += `out float target[16]`
        jsArgumentsString += `target`

        lines.forEach((line, lineIndex) => {

            let intermediateRepresentation = transpileLine(line);
            jsBodyString +=
                `const variable` + lineIndex + ` = new Float32Array(16); ` + + `\n` +
                transpileLine(lexemes)

            glslBodyString +=
                `const float variable` + lineIndex + `[16]; ` + + `\n` +
                + `namedMvs[` + name + `]`
        })
        let body = something +
            `return ` + somethingElse + `\n}`

        let jsString = `function ` + functionName + jsArgumentString + `) {\n` +
            body +
            `return variable` + (lines.length - 1).toString() + `;`
            `\n}`
        let glslString = `void ` + functionName + glslArgumentString + `) {\n` +
            body +
            `return ` +
            `\n}`
    }
}

//point your phone at a latex equation, it shows you a visualization of it