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
                if (arrResults.indexOf(index) !== -1) {
                    return
                    //what do you want to happen IN THE CASE WHERE THEY ARE MAT4s OR DQs??
                    //when you hover the array as it appears WITH a number in there...
                        //obviously you get that thing
                    //hover its declaration, or a use of it without a specific number, and for now, you see nowt

                    //a mention is a mention of a variable. But maybe a variable can be an array?
                }
                    
                //could continue looking forward until you find a `;`
                let name = text.slice(index + type.glslName.length).match(potentialNameRegex)[0] //TODO potential speedup
                //people may well want to use the name "position". Could have: position -> __position

                let variable = variables.find((v) => {
                    return v.name === name && v.type === type
                })
                if (variable === undefined)
                    variable = new Variable(name, type)

                if (uniformResults.indexOf(index) !== -1)
                    variable.isUniform = true
                else if (inResults.indexOf(index) !== -1) {
                    variable.isIn = true

                    let decl = `uniform ` + variable.type.glslName + ` ` + name + `Outputter;\n`
                    //... and presumably remove the line declaring the In if it's an attribute?
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
            matches.forEach( (match) => {
                let name = match[0]
                let variable = variables.find((v) => v.name === name)
                if( variable === undefined )
                    return

                //for several reasons, would be good to check whether the variable has received an assignment
                //pretty hard to tell. Eg foo( out target);
                //because of uniforms, will have infrastructure to have one variable, one mesh

                let mention = variable.getLowestUnusedMention()
                mention.column = match.index
                mention.lineIndex = lineIndex
                mention.mentionIndex = mentionIndex++

                mention.appearance = variable.type.getAnAppearance(variable,uniforms, outputterUniforms, geo)

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
                    mention.variable.name + " = " + mention.variable.type.literalAssignmentFromOverride + ";"
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

                let outputterAddition   = `\nif( outputMentionIndex == ` + mention.mentionIndex + ` ) {\n` + 
                    mention.variable.assignmentToOutput + `}`
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