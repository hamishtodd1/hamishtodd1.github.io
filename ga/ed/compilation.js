/*
    If you were to make a GA-products fighting game, what would it be like?
    Your avatars are flailing tentacle/cloud things, but there are bits you can lock onto

    When you compile, you could get the values onto the cpu (without await!)
    When you edit the thing, and let go, you could edit the textarea and recompile
    And re-get all the values in these things

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
    initHover()

    let lowestChangedLineSinceCompile = Infinity
    
    let finalFsq = FullScreenQuad(new THREE.ShaderMaterial())
    dws.final.scene.add(finalFsq)

    const nameRegex = /([a-zA-Z_$][a-zA-Z_$0-9]*)/g
    const glslReservedRegex = Prism.languages.glsl.keyword
    const lineDividingRegex = /^.*(\r?\n|$)/mg
    const notConsideredNamesRegex = /\b(?:mainImage|x|y|z|w)\b/
    const commentRemovalRegex = /(?:\/\/(?:\\\n|[^\n])*\n)|(?:\/\*(?:\n|\r|.)*?\*\/)|(("|')(?:\\\\|\\\2|\\\n|[^\2])*?\2)/g;

    //it's totally impractical to have a "mention" for literally every mention
    //at the same time, EVEN IF YOU DO make a "variable has been edited on this line"
    //  just because it's not edited on that line doesn't mean you don't want to see it!
    //some amount of "you have to click it" is ok
    //or maybe, "if you've scrolled away from all those mentions". Maybe we go from top of window

    class Variable {
        name;
        col = new THREE.Color(0., 0., 0.);
        type;

        changeType(newType) {
            this.type = newType

            mentions.forEach((mention)=>{
                if(mention.variable === this)
                    mention.putInCorrectWindow()
            })
        }

        constructor(newName, type) {
            this.name = newName

            this.type = type

            let [r, g, b] = randomToViridis(.53 * Math.random())
            this.col.r = r; this.col.g = g; this.col.b = b;

            variables.push(this)
        }
    }

    let pointGeo = new THREE.SphereBufferGeometry(.07, 32, 16)
    const PRESENCE_LEVEL_UNCONFIRMED = -1
    const PRESENCE_LEVEL_CONFIRMED = 1
    const PRESENCE_LEVEL_DELETED = 0
    class Mention {
        variable;

        mentionsFromStart;
        horizontalBounds = {x:0.,w:0.};
        canvasPosWorldSpace = new Float32Array([0.,0.,0.,0.]);
        presenceLevel = PRESENCE_LEVEL_DELETED;
        lineIndex = -1;

        putInCorrectWindow() {
            let dw = this.variable.type === TYPES_POINT ? dws.top : dws.second
            dw.scene.add(this.mesh)
        }

        constructor(associatedVariable) {
            this.variable = associatedVariable

            this.mesh = new THREE.Mesh(pointGeo, new THREE.MeshBasicMaterial({color:this.variable.col}));
            this.mesh.castShadow = true
            this.mesh.visible = false

            this.putInCorrectWindow()

            mentions.push(this)
        }
    }

    let toFragColorSuffix = `
void main() {
    vec4 myCol = vec4(0.,0.,0.,1.);
    mainImage(myCol);

    gl_FragColor = vec4(myCol);
}`
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
    for (int k = 0; k < 4; ++k)
        pixelFloat += pixelIndex == k ? outputFloats[k] : 0.;

    gl_FragColor = encodeFloat(pixelFloat);
}`

    let listeningForShaderErrors = false
    webglErrorThrower = (errorLine) => {

        if(!listeningForShaderErrors)
            return

        let errorParts = errorLine.split(":")
        //this could be a crazy number because who knows what's been prefixed for the first call
        const haphazardlyChosenNumber = 71
        let lineNumber = parseInt(errorParts[2]) - haphazardlyChosenNumber

        let errorContent = errorParts.slice(3).join(":")
        errorBox.textContent = errorContent
        errorBox.style.top = (lineToScreenY(.4 + lineNumber)).toString() + "px"

        listeningForShaderErrors = false
    }

    compile = async () => {

        lowestChangedLineSinceCompile = Infinity
        setSvgLine(changedLineIndicator, -10, -10, -10, -10)

        // let sansComments = textarea.value.replace(commentRemovalRegex, " ")

        //triggering a recompile isn't easy though
        {
            listeningForShaderErrors = true
            finalFsq.material.fragmentShader = textarea.value + toFragColorSuffix
            finalFsq.material.needsUpdate = true
        }
        
        mentions.forEach((mention) => {
            if (mention.presenceLevel === PRESENCE_LEVEL_CONFIRMED)
                mention.presenceLevel = PRESENCE_LEVEL_UNCONFIRMED
        })
        
        let variableNumMentions = {} //TODO should be in the Variable
        
        let lines = textarea.value.split("\n")
        lines.forEach((l,lineIndex) => {

            let matches = [...l.matchAll(nameRegex)]
            if(matches === null)
                return
            matches.forEach((match)=>{
                let name = match[0] //it's in 1 as well
                if (glslReservedRegex.test(name) || notConsideredNamesRegex.test(name))
                    return

                //we assume that stuff is limited to a line
                //All that's relevant is on it
                //If we change it in its entirety, nothing will be lost

                if (variableNumMentions[name] === undefined)
                    variableNumMentions[name] = 0

                //in *theory* you could avoid having to recompile stuff that's above an edit. Hard!
                let mention = mentions.find((m) => m.variable.name === name && m.mentionsFromStart === variableNumMentions[name])
                if (mention === undefined) {
                    let variable = variables.find((v) => v.name === name )
                    if(variable === undefined)
                        variable = new Variable(name, TYPES_POINT)

                    mention = mentions.find((m) => m.presenceLevel === PRESENCE_LEVEL_DELETED)
                    if (mention === undefined)
                        mention = new Mention(variable)

                    mention.mentionsFromStart = variableNumMentions[name]
                }

                mention.lineIndex = lineIndex
                mention.presenceLevel = PRESENCE_LEVEL_CONFIRMED

                updateHorizontalBounds(match.index, name.length, mention.horizontalBounds)

                ++variableNumMentions[name]
            })
        })

        mentions.forEach((mention) => {

            if (mention.presenceLevel === PRESENCE_LEVEL_UNCONFIRMED)
                mention.presenceLevel = PRESENCE_LEVEL_DELETED

            let withMentionReadout = ""
            withMentionReadout += readoutPrefix
            withMentionReadout += lines.slice(0,mention.lineIndex+1).join("\n")

            if (mention.variable.type === TYPES_POINT) {
                withMentionReadout +=
                    `     outputFloats[0] = ` + mention.variable.name + `.x;\n` +
                    `     outputFloats[1] = ` + mention.variable.name + `.y;\n` +
                    `     outputFloats[2] = ` + mention.variable.name + `.z;\n` +
                    `     outputFloats[3] = ` + mention.variable.name + `.w;\n`
            }
            else if (mention.variable.type === TYPES_COLOR) {
                withMentionReadout +=
                    `     outputFloats[0] = ` + mention.variable.name + `.r;\n` +
                    `     outputFloats[1] = ` + mention.variable.name + `.g;\n` +
                    `     outputFloats[2] = ` + mention.variable.name + `.b;\n`
            }

            withMentionReadout += lines.slice(mention.lineIndex+1).join("\n")
            withMentionReadout += readoutSuffix

            getShaderOutput( withMentionReadout, mention.canvasPosWorldSpace )

            mention.mesh.position.set(
                mention.canvasPosWorldSpace[0] / mention.canvasPosWorldSpace[3], 
                mention.canvasPosWorldSpace[1] / mention.canvasPosWorldSpace[3],
                mention.canvasPosWorldSpace[2] / mention.canvasPosWorldSpace[3] )
        })
        //this doesn't guarantee that you're using them as much as possible, just that they'll be cleared up on the next one

        delete variableNumMentions
    }

    updateDwContents = () => {
        
        mentions.forEach((mention) => {
            mention.mesh.visible =
                caretLine < lowestChangedLineSinceCompile &&
                (mention.lineIndex === caretLine ||
                mention === hoveredMention)
        })

        for(dwName in dws) {
            let dw = dws[dwName]
            let hasMentionChild = false
            dw.scene.children.every((child)=>{
                if (child.visible === true && dw.nonMentionChildren.indexOf(child) === -1 )
                    hasMentionChild = true

                return !hasMentionChild
            })
            // dw.elem.style.display = hasMentionChild ? '' : 'none'
        }
    }

    changedLineIndicator.style.stroke = "rgb(" + 180 + "," + 180 + "," + 180 + ")"
    textarea.addEventListener('input', () => {
        errorBox.style.top = "-200px"

        if (caretLine+1 < lowestChangedLineSinceCompile)
            lowestChangedLineSinceCompile = caretLine+1
        let textareaBox = textarea.getBoundingClientRect()
        let y = lineToScreenY(lowestChangedLineSinceCompile)
        setSvgLine(changedLineIndicator,
            textareaBox.x, y, 
            textareaBox.x + textareaBox.width, y)

        updateDwContents()
    })

    let caretPositionOld = -1
    let caretLine = -1
    updateFunctions.push( () => {
        let caretPosition = textarea.selectionStart
        if (caretPosition !== caretPositionOld) {
            
            let lineIndex = 0
            for(let i = 0, il = textarea.value.length; i < il; ++i) {
                if (i === caretPosition ) {
                    //lineIndex is new caret line
                    
                    if(lineIndex !== caretLine) {
                        caretLine = lineIndex
                        updateDwContents()
                    }
                }

                if (textarea.value[i] === "\n")
                    ++lineIndex
            }

            caretPositionOld = caretPosition
        }
    })
}