/*
    it's really ; that separates, not newline

    If you were to make a GA-products fighting game, what would it be like?
    Your avatars are flailing tentacle/cloud things, but there are bits you can lock onto

    Bultins:
        Hand motor
        Things that shadertoy has:
            uniform vec3 iResolution;
            uniform float iTime;
            uniform float iTimeDelta;
            uniform float iFrame;
            uniform float iChannelTime[4];
            uniform vec4 iMouse;
            uniform vec4 iDate;
            uniform float iSampleRate;
            uniform vec3 iChannelResolution[4];
            
            uniform samplerXX iChanneli;

        Also have the frag point in *3D* space
*/

async function initCompilation()
{
    let focussedVertex = 0
    let numVertices = 20

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

        let uniforms = {}
        let outputterUniforms = {} // the "in"s are turned into uniforms
        let geo = new THREE.BufferGeometry()
        let mentionIndex = 0

        variables.forEach((variable)=>{
            variable.lowestUnusedMention = 0
        })

        mentionTypes.forEach((type) => {
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

                    let inArray = new Float32Array(type.numFloats * numVertices)
                    for (let i = 0, il = inArray.length; i < il; ++i)
                        inArray[i] = Math.random() - .5
                    geo.setAttribute('position', new THREE.BufferAttribute(inArray, type.numFloats))
                    
                    let focussedAttributeValue = new Float32Array(type.numFloats)
                    for (let i = 0; i < type.numFloats; ++i)
                        focussedAttributeValue[i] = inArray[i + type.numFloats * focussedVertex]
                    outputterUniforms[name] = { value: focussedAttributeValue }
                }
                if(uniformResults.indexOf(index) !== -1) {
                    variable.isUniform = true

                    if(type.glslName === 'float')
                        uniforms[name] = { value: 1. }
                    if (type.glslName === 'vec3')
                        uniforms[name] = { value: new THREE.Vector3(1.,1.,1.) } 
                    //would be good to have these be the state
                }
                
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
        let textLines = text.split("\n")
        let finalChunks = Array(textLines.length)
        let outputterChunks = Array(textLines.length)
        //we assume that stuff is limited to a line
        //All that's relevant is on it
        //If we change it in its entirety, nothing will be lost
        textLines.forEach((l,lineIndex) => {

            {
                finalChunks[lineIndex] = l
                if (l[0] === "i" && l[1] === "n" && l[2] === " ") {
                    outputterChunks[lineIndex] = "uniform " + l.slice(3)
                    //right, there's another attrib array where we need to specify which vertex is being talked about
                    // uniformsIncludingSelectedAttribs
                }
                else
                    outputterChunks[lineIndex] = l
            }

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

                //may want to modify them both using the usual interface
                //but that, instead of changing a line of code in the shader, modifies the input array

                let mention = variable.getLowestUnusedMention()
                mention.updateHorizontalBounds(match.index, name.length)

                mention.lineIndex = lineIndex
                mention.mentionIndex = mentionIndex++

                let isDeclaration = variable.lowestUnusedMention === 1
                let isUniformOrAttrib = variable.isIn || variable.isUniform

                let overrideGoesBefore = false
                if (!isUniformOrAttrib ) {
                    if (l.indexOf(`return`) !== -1)
                        overrideGoesBefore = true
                    else if(isDeclaration)
                        overrideGoesBefore = false

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
                }

                if ( !(isUniformOrAttrib && isDeclaration ) ) {
                    let goesBefore = l.indexOf(`return`) !== -1

                    let outputAddition   = `\nif( outputMentionIndex == ` + mention.mentionIndex + ` ) {\n` + 
                        mention.variable.assignmentToOutput + `}`
                    if( overrideGoesBefore === false)
                        goesBefore = false
                    if (goesBefore) {
                        outputterChunks[lineIndex] = outputAddition + outputterChunks[lineIndex]
                    }
                    else {
                        outputterChunks[lineIndex] = outputterChunks[lineIndex] + outputAddition
                    }
                }
            })
        })

        threejsIsCheckingForShaderErrors = true

        // log(outputterChunks.join("\n------------------")) //whyyyyy did there appear to be only even numbered mentionIndexes?

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

        updateVariableMentionsFromRun(()=>true)

        variables.forEach((v)=>{
            let currentDuplicates
            
            for (let i = 0; i < v.lowestUnusedMention; ++i) {
                let m = v.mentions[i]
                if( i === 0 || !m.equals(v.mentions[i-1]) )
                    currentDuplicates = [m]
                else
                    currentDuplicates.push(m)
                m.duplicates = currentDuplicates
                //GC alert!
            }
        })
    }
}