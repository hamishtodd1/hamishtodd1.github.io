/*
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

    class Variable {
        name;
        col = new THREE.Color(0., 0., 0.);
        class;

        constructor(newName, newClass) {
            this.name = newName

            this.class = newClass

            randomColor.setHSL(Math.random(), 1., .5)
            this.col.r = randomColor.r; this.col.g = randomColor.g; this.col.b = randomColor.b;

            variables.push(this)
        }
    }

    const nameRegex = /(?<=[\s\(\)])([a-zA-Z_$][a-zA-Z_$0-9]*)/g
    const glslReservedRegex = Prism.languages.glsl.keyword
    const lineDividingRegex = /^.*(\r?\n|$)/mg
    const notConsideredNamesRegex = /\b(?:mainImage|x|y|z|w|fragColor|applyDqToPt)\b/
    const structRegex = /struct\s+([a-zA-Z_$][a-zA-Z_$0-9]*)\s+{[^}]*}/gm

    //if you want to use this, should probably replace with whitespace
    const commentNotNewlineRegex = /\/\/[^\n]*/gm

    //at the same time, EVEN IF YOU DO make a "variable has been edited on this line"
    //  just because it's not edited on that line doesn't mean you don't want to see it!
    //some amount of "you have to click it" is ok
    //or maybe, "if you've scrolled away from all those mentions". Maybe we go from top of window

    let readoutPrefix = `
float[8] outputFloats;
    `
    let readoutSuffix = `
varying vec2 frameCoord;

void main() {
    vec4 myCol = vec4(0.,0.,0.,1.); //do nothing with this, just making sure outputFloats gets filled
    mainImage(myCol);

    int pixelIndex = int(round(frameCoord.x * 8. - .5));
    float pixelFloat = 0.;
    for (int k = 0; k < 8; ++k)
        pixelFloat += pixelIndex == k ? outputFloats[k] : 0.;

    gl_FragColor = encodeFloat(pixelFloat);
}`

    //used by three.js
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

        threejsIsCheckingForShaderErrors = false
    }

    compile = async () => {

        let text = textarea.value
        if (text.indexOf("/*") !== -1 || text.indexOf("*/") !== -1) {
            console.error("multi-line comments not supported")
            return
        }

        text = text.replace(commentNotNewlineRegex,"")
        let finalText = ""
        
        mentions.forEach((mention) => {
            if (mention.presenceLevel === PRESENCE_LEVEL_CONFIRMED)
                mention.presenceLevel = PRESENCE_LEVEL_UNCONFIRMED
        })
        let variableNumMentions = {}
        
        let ignoringDueToStruct = false
        let textLines = text.split("\n")
        let finalLines = Array(textLines.length)
        let mentionIndex = 0
        textLines.forEach((l,lineIndex) => {

            if (!ignoringDueToStruct && l.indexOf("struct") !== -1)
                ignoringDueToStruct = true
            else if (l.indexOf("}") !== -1)
                ignoringDueToStruct = false
            if(ignoringDueToStruct)
                return

            let matches = [...l.matchAll(nameRegex)]
            finalLines[lineIndex] = l
            if(matches === null)
                return
            else matches.forEach((match)=>{
                let name = match[0] //it's in 1 as well
                if (glslReservedRegex.test(name) || notConsideredNamesRegex.test(name) || types[name] !== undefined)
                    return

                //we assume that stuff is limited to a line
                //All that's relevant is on it
                //If we change it in its entirety, nothing will be lost

                if (variableNumMentions[name] === undefined)
                    variableNumMentions[name] = 0

                let mention = mentions.find((m) => 
                    m.variable.name === name && 
                    m.mentionsFromStart === variableNumMentions[name])
                if (mention === undefined) {

                    let variable = variables.find((v) => v.name === name )
                    if(variable === undefined) {
                        let partUpToName = l.slice(0, l.indexOf(name))
                        let splitByWhitespace = partUpToName.split(/\s+/)
                        let declaredType = splitByWhitespace[splitByWhitespace.length - 2]
                        if( types[declaredType] === undefined ) {
                            console.error(
                                "unrecognized type: " + declaredType +
                                "\nname:" + name +
                                "\nline:" + l +
                                "\nsplit:" + splitByWhitespace.join(","))
                        }
                        else {
                            variable = new Variable(name, types[declaredType])
                        }
                    }

                    mention = mentions.find((m) => 
                        m.presenceLevel === PRESENCE_LEVEL_DELETED && 
                        m.variable === variable)
                    if (mention === undefined)
                        mention = new variable.class(variable)

                    mention.mentionsFromStart = variableNumMentions[name]
                }

                mention.lineIndex = lineIndex
                mention.presenceLevel = PRESENCE_LEVEL_CONFIRMED
                mention.mentionIndex = mentionIndex++

                finalLines[lineIndex] += 
                    ` if( overrideMentionIndex == ` + mention.mentionIndex + ` ) ` + 
                        mention.getReassignmentNew(true) + ";"

                updateHorizontalBounds(match.index, name.length, mention.horizontalBounds)

                ++variableNumMentions[name]
            })
        })

        mentions.forEach((mention) => {

            if (mention.presenceLevel === PRESENCE_LEVEL_UNCONFIRMED) {
                mention.presenceLevel = PRESENCE_LEVEL_DELETED
                return
            }

            let shaderWithMentionReadout = 
                readoutPrefix +
                finalLines.slice(0,mention.lineIndex+1).join("\n") +
                mention.getShaderOutputFloatString() +
                finalLines.slice(mention.lineIndex+1).join("\n") + 
                readoutSuffix

            // if(mention.variable.name === "myVec")
            //     log(shaderWithMentionReadout)

            //probably terrible to have a shader for every mention
            //just have the "readout shader". A uniform controls which line is being read out
            //compiler optimization number 1!

            mention.updateViz(shaderWithMentionReadout)
        })
        //this doesn't guarantee that you're using them as much as possible, just that they'll be cleared up on the next one

        threejsIsCheckingForShaderErrors = true
        updateFinalDw(generalShaderPrefix + finalLines.join("\n"))

        lowestChangedLineSinceCompile = Infinity
        updateChangedLineIndicator()

        delete variableNumMentions
    }
}