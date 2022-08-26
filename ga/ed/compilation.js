async function initCompilation() {

    const potentialNameRegex = /(?<=[^a-zA-Z_$0-9])([a-zA-Z_$][a-zA-Z_$0-9]*)/g
    const commentNotNewlineRegex = /\/\/[^\n]*/gm

    function checkForOurErrors() {
        if (textarea.value.indexOf("/*") !== -1 || textarea.value.indexOf("*/") !== -1) {
            console.error("multi-line comments not supported")
            return false
        }
        if (textarea.value.indexOf('initialVertex') === -1) {
            console.error("no initialVertex use found!")
            return false
        }
        return true
    }

    compile = async (logDebug) => {
        
        let text = textarea.value
        if(!checkForOurErrors())
            return

        text = text.replace(commentNotNewlineRegex,"")
        let vertexMode = text.indexOf("getColor") === -1
        updateVertexMode(vertexMode)

        // it's really ; that separates, not newline
        let textLines = text.split("\n")
        let finalChunks = Array(textLines.length)
        let outputterChunks = Array(textLines.length)
        textLines.forEach((l, lineIndex) => {
            finalChunks[lineIndex] = l
            outputterChunks[lineIndex] = l
        })

        let outputterUniforms = {} // where "in"s are turned into uniforms
        let uniforms = {}
        let geo = new THREE.BufferGeometry()
        let mentionIndex = 0

        variables.forEach((variable)=>{
            variable.lowestUnusedMention = 0
        })
        appearanceTypes.forEach((appearanceType)=>{
            appearanceType.lowestUnusedAppearance = 0
        })

        //look for declarations
        appearanceTypes.forEach((type) => {
            let      arrMatch = [...text.matchAll(type.regexes.arr)]
            let      allMatch = [...text.matchAll(type.regexes.all)]
            let functionMatch = [...text.matchAll(type.regexes.function)]
            let  uniformMatch = [...text.matchAll(type.regexes.uniform)]
            let       inMatch = [...text.matchAll(type.regexes.in)]
            let      arrResults =      arrMatch.map(a => a.index)
            let      allResults =      allMatch.map(a => a.index)
            let functionResults = functionMatch.map(a => a.index)
            let  uniformResults =  uniformMatch.map(a => a.index + a[0].indexOf(a[1]))
            let       inResults =       inMatch.map(a => a.index + a[0].indexOf(a[1]))
            
            allResults.forEach((index) => {
                if( functionResults.indexOf(index) !== -1)
                    return
                    
                //could continue looking forward until you find a `;`
                let name = text.slice(index + type.glslName.length).match(potentialNameRegex)[0] //TODO potential speedup
                //people may well want to use the name "position". Could have: position -> __position

                let variable = variables.find((v) => {
                    return v.name === name && v.type === type
                })
                if (variable === undefined)
                    variable = new Variable(name, type)

                variable.isArray = arrResults.indexOf(index) !== -1
                variable.isUniform = uniformResults.indexOf(index) !== -1
                variable.isIn = inResults.indexOf(index) !== -1

                if( variable.isIn ) {
                    let decl = `uniform ` + variable.type.glslName + ` ` + name + `Outputter;\n`
                    //... and presumably remove the line declaring the In if it's an attribute?
                    //for now, it's just the input of a function so no need
                    outputterChunks[0] = decl + outputterChunks[0]
                }
            })
        })
        
        let ignoringDueToStruct = false
        textLines.forEach((l,lineIndex) => {

            {
                if (!ignoringDueToStruct && l.indexOf("struct") !== -1)
                    ignoringDueToStruct = true
                else if (l.indexOf("}") !== -1)
                    ignoringDueToStruct = false

                if (ignoringDueToStruct)
                    return
            }

            //faster might be a match of the whole thing rather than the individual lines
            let matches = [...l.matchAll(potentialNameRegex)]
            let mention = null
            matches.forEach( (match) => {
                let name = match[0]
                // if (name === "ourArr")
                //     debugger
                let variable = variables.find((v) => v.name === name)
                if( variable === undefined )
                    return

                if(!variable.isArray) {
                    mention = variable.getLowestUnusedMention()
                    mention.charactersWide = name.length
                    mention.indexInArray = -1
                }
                else {
                    //we make the thing hoverable only if it is a picking out of a specific element
                    let start = match.index + name.length //we fully assume it goes "name["
                    let lineRemainder = l.slice(start+1)
                    let indexInArray = parseInt(lineRemainder)   //it may a for-loop index
                    if(isNaN(indexInArray))
                        return
                    else {
                        mention = variable.getLowestUnusedMention()
                        mention.indexInArray = indexInArray

                        let closeBracketIndex = l.indexOf(`]`,start)
                        mention.charactersWide = name.length + closeBracketIndex - start + 1
                    }
                }

                mention.column = match.index
                mention.lineIndex = lineIndex
                mention.mentionIndex = mentionIndex++
                mention.appearance = variable.type.getAnAppearance( variable, uniforms, outputterUniforms, geo )
                
                //for several reasons, would be good to check whether the variable has received an assignment
                //pretty hard to tell. Eg foo( out target);
                //Could just say, if it's an argument to a function, it must have been modified
                //because of uniforms, will have infrastructure to have one variable, one mesh
                
                if (variable.isUniform || variable.isIn)
                    return
                    
                let isDeclaration = variable.lowestUnusedMention === 1
                let isReturn = l.indexOf(`return`) !== -1

                let overrideGoesBefore = false
                if (isReturn)
                    overrideGoesBefore = true
                else if(isDeclaration)
                    overrideGoesBefore = false

                ///////////////////////
                // OVERRIDE ADDITION //
                ///////////////////////
                let overrideAddition = `\nif( overrideMentionIndex == ` + mention.mentionIndex + ` ) ` +
                    mention.getFullName() + " = " + mention.variable.type.literalAssignmentFromOverride + ";"
                if (overrideGoesBefore) {
                    finalChunks[lineIndex]     = overrideAddition +     finalChunks[lineIndex]
                    outputterChunks[lineIndex] = overrideAddition + outputterChunks[lineIndex]
                }
                else {
                    finalChunks[lineIndex]     =     finalChunks[lineIndex] + overrideAddition
                    outputterChunks[lineIndex] = outputterChunks[lineIndex] + overrideAddition
                }
                //you're best off visualizing it in this completely different way, when the declaration is hovered

                ////////////////////////
                // OUTPUTTER ADDITION //
                ////////////////////////

                let outputterGoesAfter = true
                if( isReturn )
                    outputterGoesAfter = false
                if(!outputterGoesAfter)
                    console.assert( !isDeclaration && overrideGoesBefore) //if these, dunno what to do

                if( !overrideGoesBefore )
                    outputterGoesAfter = true

                let assignmentToOutput = variable.isArray ? variable.getAssignmentToOutputForArray(mention.indexInArray) : mention.variable.assignmentToOutput
                let outputterAddition   = `\nif( outputMentionIndex == ` + mention.mentionIndex + ` ) {\n` + 
                    assignmentToOutput + `}`
                if (outputterGoesAfter) {
                    outputterChunks[lineIndex] = outputterChunks[lineIndex] + outputterAddition
                }
                else {
                    outputterChunks[lineIndex] = outputterAddition + outputterChunks[lineIndex]
                }
            })
        })

        if (logDebug)
            log(outputterChunks.join("\n------------------"))

        let outputterText = outputterChunks.join("\n")
        let finalText = finalChunks.join("\n")
        if (vertexMode ) {
            updateOutputter(outputterText, outputterUniforms, true)
            updateFinalDwVertex(finalText, uniforms, geo)
        }
        else {
            updateOutputter(outputterText, outputterUniforms, false)
            updateFinalDwFragment(finalText, uniforms)
        }

        updateLclsc(Infinity)

        let currentDuplicates
        //duplicates are a halfway step towards what you'd prefer: knowledge of when the things have really been changed
        //i.e. when they are new variables probably
        appearanceTypes.forEach((at)=>{
            for (let i = 0; i < at.lowestUnusedAppearance; ++i) {
                let appearance = at.appearances[i]
                if (i === 0 || appearance.variable !== at.appearances[i - 1].variable || !appearance.stateEquals(at.appearances[i - 1].state) )
                    currentDuplicates = [appearance]
                else
                    currentDuplicates.push(appearance)
                appearance.duplicates = currentDuplicates
                //GC alert!
            }
        })
    }
}