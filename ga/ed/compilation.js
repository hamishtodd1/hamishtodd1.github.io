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
    let randomColor = new THREE.Color()
    let currentHue = 0.
    let goldenRatio = (Math.sqrt(5.)+1.)/2.

    let focussedVertex = 0
    let numVertices = 20

    class Variable {
        name
        col = new THREE.Color(0., 0., 0.)
        class
        lowestUnusedMention = 0
        isAttrib = false
        isUniform = false
        mentions = []

        constructor(newName, newClass) {
            this.name = newName

            this.class = newClass

            randomColor.setHSL(currentHue, 1., .5)
            currentHue += 1./goldenRatio
            while (currentHue > 1.)
                currentHue -= 1.
            this.col.r = randomColor.r; this.col.g = randomColor.g; this.col.b = randomColor.b;

            variables.push(this)
        }

        getLowestUnusedMention() {
            while(this.mentions.length <= this.lowestUnusedMention) {
                let newMention = new this.class(this)
                this.mentions.push(newMention)
            }

            return this.mentions[this.lowestUnusedMention++]
        }
    }

    const nameRegex = /(?<=[^a-zA-Z_$0-9])([a-zA-Z_$][a-zA-Z_$0-9]*)/g

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

    let types = Object.keys(mentionClasses)
    let allTypeRegexes = {}
    let inRegexes = {}
    let uniformRegexes = {}
    let functionRegexes = {}
    types.forEach((type)=>{
        functionRegexes[type] = new RegExp('(?<=[^a-zA-Z_$0-9])(' + type + ')\\s*[a-zA-Z_$][a-zA-Z_$0-9]*\\(', 'gm')
         allTypeRegexes[type] = new RegExp('(?<=[^a-zA-Z_$0-9])(' + type + ')\\s*[a-zA-Z_$][a-zA-Z_$0-9]*', 'gm')
         uniformRegexes[type] = new RegExp('\\s*uniform\\s*('     + type + ')\\s', 'gm')
              inRegexes[type] = new RegExp('\\s*in\\s*('          + type + ')\\s', 'gm')
    })

    compile = async () => {

        let text = textarea.value
        if (text.indexOf("/*") !== -1 || text.indexOf("*/") !== -1) {
            console.error("multi-line comments not supported")
            return
        }

        text = text.replace(commentNotNewlineRegex,"")

        let uniforms = {}
        let geo = new THREE.BufferGeometry()
        let outputterUniforms = {}

        types.forEach((type) => {
            let functionResults = [...text.matchAll(functionRegexes[type])].map(a => a.index)
            let  allTypeResults = [...text.matchAll( allTypeRegexes[type])].map(a => a.index)
            let  uniformResults = [...text.matchAll( uniformRegexes[type])].map(a => a.index + a[0].indexOf(a[1]))
            let   attribResults = [...text.matchAll(      inRegexes[type])].map(a => a.index + a[0].indexOf(a[1]))
            
            allTypeResults.forEach((index) => {
                if( functionResults.indexOf(index) !== -1)
                    return
                    
                let name = text.slice(index + type.length).match(nameRegex)[0] //TODO potential speedup

                let variable = variables.find((v) => {
                    return v.name === name && v.class === mentionClasses[type]
                })
                if (variable === undefined)
                    variable = new Variable(name, mentionClasses[type])

                variable.lowestUnusedMention = 0
                    
                if (attribResults.indexOf(index) !== -1) {
                    variable.isAttrib = true

                    let numFloats = mentionClassNumFloats[type]

                    let attributeArray = new Float32Array(numFloats * numVertices)
                    for(let i = 0; i < attributeArray.length; ++i)
                        attributeArray[i] = Math.random() - .5
                    geo.setAttribute('position', new THREE.BufferAttribute(attributeArray, numFloats))
                    
                    let focussedAttributeValue = new Float32Array(numFloats)
                    for (let i = 0; i < numFloats; ++i)
                        focussedAttributeValue[i] = attributeArray[i + numFloats * focussedVertex]
                    outputterUniforms[name] = { value: focussedAttributeValue }
                }
                if(uniformResults.indexOf(index) !== -1) {
                    uniforms[name] = {value: 1.}
                    variable.isUniform = true
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
        let mentionIndex = 0
        //we assume that stuff is limited to a line
        //All that's relevant is on it
        //If we change it in its entirety, nothing will be lost
        textLines.forEach((l,lineIndex) => {

            finalChunks[lineIndex] = l
            if (l[0] === "i" && l[1] === "n" && l[2] === " ") {
                outputterChunks[lineIndex] = "uniform " + l.slice(3)
                //right, there's another attrib array where we need to specify which vertex is being talked about
                // uniformsIncludingSelectedAttribs
            }
            else
                outputterChunks[lineIndex] = l

            if (!ignoringDueToStruct && l.indexOf("struct") !== -1)
                ignoringDueToStruct = true
            else if (l.indexOf("}") !== -1)
                ignoringDueToStruct = false

            if ( ignoringDueToStruct )
                return

            let matches = [...l.matchAll(nameRegex)]
            matches.forEach((match)=>{
                let name = match[0]
                let variable = variables.find((v) => v.name === name)
                if( variable === undefined )
                    return

                //may want to modify them both using the usual interface
                //but that, instead of changing a line of code in the shader, modifies the input array

                let mention = variable.getLowestUnusedMention()
                mention.updateHorizontalBounds(match.index, name.length)

                mention.lineIndex = lineIndex
                mention.mentionIndex = mentionIndex++

                let isDeclaration = variable.lowestUnusedMention === 1
                let isUniformOrAttrib = variable.isAttrib || variable.isUniform

                let overrideGoesBefore = false
                if (!isUniformOrAttrib ) {
                    if (l.indexOf(`return`) !== -1)
                        overrideGoesBefore = true
                    else if(isDeclaration)
                        overrideGoesBefore = false

                    let overrideAddition = `\nif( overrideMentionIndex == ` + mention.mentionIndex + ` ) ` +
                        mention.getReassignmentNew(true) + ";"
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

                    let outputAddition   = `\nif( outputMentionIndex == ` + mention.mentionIndex + ` ) {` + 
                        mention.getShaderOutputFloatString() + `}`
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

        updateOutputtingAndFinalDw(
            outputterChunks.join("\n"), 
            finalChunks.join("\n"), 
            geo, uniforms, outputterUniforms)

        lowestChangedLineSinceCompile = Infinity
        updateChangedLineIndicator()

        forEachUsedMention((m) => {
            m.updateFromShader()
        })

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