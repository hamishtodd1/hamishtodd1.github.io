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
            let      allMatch = [...text.matchAll(type.declRegexes.all)]
            let functionMatch = [...text.matchAll(type.declRegexes.function)]
            let  uniformMatch = [...text.matchAll(type.declRegexes.uniform)]
            let       inMatch = [...text.matchAll(type.declRegexes.in)]
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

                let arrayLength = -1
                
                if (type.isArray) {
                    let arrayLengthStart = index + type.glslName.length + 1
                    let arrayLengthStr = text.slice(arrayLengthStart, text.indexOf(`]`, arrayLengthStart))
                    arrayLength = parseInt(arrayLengthStr)
                }

                let variable = variables.find((v) => {
                    return v.name === name && v.type === type && v.arrayLength === arrayLength
                })
                if (variable === undefined)
                    variable = new Variable(name, type, arrayLength)

                variable.isUniform = uniformResults.indexOf(index) !== -1
                variable.isIn = inResults.indexOf(index) !== -1

                variable.arrayLength = arrayLength
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
                
                let variable = variables.find((v) => v.name === name)
                if( variable === undefined )
                    return

                let isDeclaration = variable.lowestUnusedMention === 0

                let indexInArray = -1
                let charactersWide = name.length
                if (variable.isArray()) {
                    let start = match.index + name.length //we fully assume it goes "name["
                    let lineRemainder = l.slice(start + 1)
                    let indexInArrayOrNaN = parseInt(lineRemainder)   //it may a for-loop index
                    let isIndexless = isNaN(indexInArrayOrNaN)
                    if (!isIndexless) {
                        indexInArray = indexInArrayOrNaN
                        let closeBracketIndex = l.indexOf(`]`, start)
                        charactersWide = name.length + closeBracketIndex - start + 1
                    }
                    else if (!variable.isUniform) //isArray + !isUniform = dealing with overrides and outputs!
                        return
                }

                mention = variable.getLowestUnusedMention()
                mention.setIndexInArray(indexInArray)
                mention.column = match.index
                mention.lineIndex = lineIndex
                mention.mentionIndex = mentionIndex++
                mention.charactersWide = charactersWide

                let appearance = null
                let isAnElementOfAUniformArray = indexInArray !== -1 && variable.isUniform
                if (!variable.isUniform && !variable.isIn)
                    appearance = variable.type.getLowestUnusedAppearanceAndEnsureAssignmentToVariable(variable)
                else if (isAnElementOfAUniformArray) {
                    //guaranteed: not the first mention
                    //there will be an array appearance for the declaration. This appearance is just an entry from that array
                    let arrayUniformOfVariable = variable.mentions[0].appearance.uniform.value
                    appearance = variable.type.nonArrayType.getLowestUnusedAppearanceAndEnsureAssignmentToVariable(variable, arrayUniformOfVariable[indexInArray])
                }
                else if (!isDeclaration)
                    appearance = variable.mentions[0].appearance
                else {
                    appearance = variable.type.getLowestUnusedAppearanceAndEnsureAssignmentToVariable(variable)

                    if (variable.isUniform) {
                        attemptAppearanceIdentifationWithImportedModelUniform( appearance, name, uniforms )
                        uniforms[variable.name] = appearance.uniform
                    }
                    else if (variable.isIn) {
                        attemptAppearanceIdentifationWithImportedModelIn(appearance, name, geo )
                        outputterUniforms[variable.name + `Outputter`] = appearance.uniform

                        let decl = `uniform ` + variable.type.glslName + ` ` + name + `Outputter;\n`
                        outputterChunks[0] = decl + outputterChunks[0]
                        if (name !== `initialVertex`) {
                            //no declaration for you, it's coming in as a uniform
                            //we fully assume that it's on one line
                            outputterChunks[lineIndex] = ``
                        }
                    }
                }
                mention.appearance = appearance

                //so it gets an appearance that's an ordinary matrix
                
                //for several reasons, would be good to check whether the variable has received an assignment
                //pretty hard to tell. Eg foo( out target);
                //Could just say, if it's an argument to a function, it must have been modified
                
                if (variable.isUniform || variable.isIn)
                    return

                ///////////////////////
                // OVERRIDE ADDITION //
                ///////////////////////
                let isReturn = l.indexOf(`return`) !== -1
                let overrideGoesBefore = false
                
                if (isReturn)
                    overrideGoesBefore = true
                else if (isDeclaration)
                    overrideGoesBefore = false

                let overrideAddition = `\nif( overrideMentionIndex == ` + mention.mentionIndex + ` ) ` +
                    mention.getFullName() + " = " + mention.variable.type.literalAssignmentFromOverride + ";"
                if (overrideGoesBefore) {
                    finalChunks[lineIndex] = overrideAddition + finalChunks[lineIndex]
                    outputterChunks[lineIndex] = overrideAddition + outputterChunks[lineIndex]
                }
                else {
                    finalChunks[lineIndex] = finalChunks[lineIndex] + overrideAddition
                    outputterChunks[lineIndex] = outputterChunks[lineIndex] + overrideAddition
                }

                //sometimes arrays ARE assigned to, even if you do only have the below someteimes
                //so, aside from mentionIndex, you also have the arrayEntry. Extract them one by one

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
                    mention.getAssignmentToOutput() + `}`
                if (outputterGoesAfter) {
                    outputterChunks[lineIndex] = outputterChunks[lineIndex] + outputterAddition
                }
                else {
                    outputterChunks[lineIndex] = outputterAddition + outputterChunks[lineIndex]
                }
                
                //output every array entry?
                //so costly. 
                //So... only output the things when they're assigned to, not every time they're mentioned
                //So, look for the equals sign on the line, and what's on the left
            })
        })

        setInIndex(0)

        Object.assign(outputterUniforms, uniforms)

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

        if (logDebug)
            log(outputterChunks.join("\n------------------"))
    }
}