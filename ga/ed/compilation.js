/*
    it's really ; that separates, not newline

    If you were to make a GA-products fighting game, what would it be like?
    Your avatars are flailing tentacle/cloud things, but there are bits you can lock onto

    Bultins:
        Things that shadertoy has:
            

        Also have the frag point in *3D* space
*/

async function initCompilation()
{
    let focussedVertex = 0

    const potentialNameRegex = /(?<=[^a-zA-Z_$0-9])([a-zA-Z_$][a-zA-Z_$0-9]*)/g

    //if you want to use this, should probably replace with whitespace
    const commentNotNewlineRegex = /\/\/[^\n]*/gm

    //at the same time, EVEN IF YOU DO make a "variable has been edited on this line"
    //  just because it's not edited on that line doesn't mean you don't want to see it!
    //some amount of "you have to click it" is ok
    //or maybe, "if you've scrolled away from all those mentions". Maybe we go from top of window

    //used by three.js
    let errorBoxHidden = true
    hideErrorBoxIfNeeded = () => {
        if (!errorBoxHidden) {
            errorBox.style.top = "-200px" //TODO this is more for when you recompile
            errorBoxHidden = true
        }
    }

    let threejsIsCheckingForShaderErrors = false
    webglErrorThrower = (errorLine) => {

        if(!threejsIsCheckingForShaderErrors)
            return

        let errorParts = errorLine.split(":")
        //this could be a crazy number because who knows what's been prefixed for the first call
        const haphazardlyChosenNumber = 71
        let lineNumber = parseInt(errorParts[2]) - haphazardlyChosenNumber

        let errorContent = errorParts.slice(3).join(":")
        errorBox.textContent = errorContent
        errorBox.style.top = (lineToScreenY(.4 + lineNumber)).toString() + "px"
        errorBoxHidden = false

        threejsIsCheckingForShaderErrors = false
    }

    compile = async () => {
        
        let text = textarea.value
        if (text.indexOf("/*") !== -1 || text.indexOf("*/") !== -1) {
            console.error("multi-line comments not supported")
            return
        }

        text = text.replace(commentNotNewlineRegex,"")
        let vertexMode = text.indexOf("getColor") === -1
        updateVertexMode(vertexMode)

        let textLines = text.split("\n")
        let finalChunks = Array(textLines.length)
        let outputterChunks = Array(textLines.length)
        textLines.forEach((l, lineIndex) => {
            finalChunks[lineIndex] = l
            outputterChunks[lineIndex] = l
        })

        let outputterUniforms = {} // the "in"s are turned into uniforms
        let uniforms = {}
        let geo = new THREE.BufferGeometry()
        let mentionIndex = 0

        variables.forEach((variable)=>{
            variable.lowestUnusedMention = 0
        })
        appearanceTypes.forEach((appearanceType)=>{
            appearanceType.lowestUnusedAppearance = 0
        })

        appearanceTypes.forEach((type) => {
            let functionResults = [...text.matchAll(type.regexes.function )].map(a => a.index)
            let      allResults = [...text.matchAll(type.regexes.all      )].map(a => a.index)
            let  uniformResults = [...text.matchAll(type.regexes.uniform  )].map(a => a.index + a[0].indexOf(a[1]))
            let       inResults = [...text.matchAll(type.regexes.in       )].map(a => a.index + a[0].indexOf(a[1]))
            
            allResults.forEach((index) => {
                if( functionResults.indexOf(index) !== -1)
                    return
                    
                let name = text.slice(index + type.glslName.length).match(potentialNameRegex)[0] //TODO potential speedup
                //people may well want to use the name "position". Could have: position -> __position

                let variable = variables.find((v) => {
                    return v.name === name && v.type === type
                })
                if (variable === undefined)
                    variable = new Variable(name, type)

                if (inResults.indexOf(index) !== -1) {
                    variable.isIn = true

                    let decl = `uniform ` + variable.type.glslName + ` ` + name + `Outputter;\n`
                    //... and presumably remove the line declaring the In if it's an attribute?
                    outputterChunks[0] = decl + outputterChunks[0]
                }
                if(uniformResults.indexOf(index) !== -1) 
                    variable.isUniform = true
                
                /*
                    how to treat Vertex attribs?
                        vec2s are uvs on a texture
                        vec3s / normals are arrows sticking out of that spot
                        Tangents?

                        One way of visualizing weights would be proximity to the bones
                        4D tetrahedron?
                        floats are colors
                        weights are visualized on the texture (probably)
                        Note that normal map is a texture
                        occlusion, roughness, metallic, normal
                */
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

                //ascribes an appearance, probably creating it in the process
                if (variable.isUniform || variable.isIn ) {
                    let firstMention = variable.lowestUnusedMention === 1
                    if (firstMention) {
                        //create it
                        mention.appearance = variable.type.getLowestUnusedAppearance(variable)
                        mention.appearance.updateUniformFromState()

                        if(variable.isUniform) {
                            uniforms[variable.name] = mention.appearance.uniform
                            outputterUniforms[variable.name] = mention.appearance.uniform
                        }
                        else
                            createIn(geo, outputterUniforms, name, mention.appearance)
                    }
                    else
                        mention.appearance = variable.mentions[0].appearance
                }
                else
                    mention.appearance = variable.type.getLowestUnusedAppearance(variable)

                if (variable.isIn || variable.isUniform)
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

        threejsIsCheckingForShaderErrors = true

        // log(outputterChunks.join("\n------------------"))

        let outputterText = outputterChunks.join("\n")
        let finalText = finalChunks.join("\n")
        if (vertexMode ) {
            updateOutputter(outputterText, outputterUniforms, true)
            updateFinalDwVertex(finalText, uniforms, geo)
            if(textarea.value.indexOf('initialVertex') === -1)
                console.error("no initialVertex use found!")
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
                if (i === 0 || appearance.variable !== at.appearances[i - 1].variable || !appearance.equals(at.appearances[i - 1]) )
                    currentDuplicates = [appearance]
                else
                    currentDuplicates.push(appearance)
                appearance.duplicates = currentDuplicates
                //GC alert!
            }
        })
    }
}