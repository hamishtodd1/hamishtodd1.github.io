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
    let finalFsq = FullScreenQuad(new THREE.ShaderMaterial())
    dws.final.scene.add(finalFsq)

    const nameRegex = /([a-zA-Z_$][a-zA-Z_$0-9]*)/g
    const glslReservedRegex = Prism.languages.glsl.keyword
    const lineDividingRegex = /^.*(\r?\n|$)/mg
    const notConsideredNamesRegex = /\b(?:mainImage|x|y|z|w)\b/
    const structRegex = /struct\s+([a-zA-Z_$][a-zA-Z_$0-9]*)\s+{[^}]*}/gm

    //if you want to use this, should probably replace with whitespace
    const commentNotNewlineRegex = /\/\/[^\n]*/gm

    //at the same time, EVEN IF YOU DO make a "variable has been edited on this line"
    //  just because it's not edited on that line doesn't mean you don't want to see it!
    //some amount of "you have to click it" is ok
    //or maybe, "if you've scrolled away from all those mentions". Maybe we go from top of window

    class Variable {
        name;
        col = new THREE.Color(0., 0., 0.);
        type;

        constructor(newName, newType) {
            this.name = newName

            this.type = newType

            let [r, g, b] = randomToViridis(.53 * Math.random())
            this.col.r = r; this.col.g = g; this.col.b = b;

            variables.push(this)
        }
    }
    
    class Mention {
        variable;

        mentionsFromStart;
        horizontalBounds = {x:0.,w:0.};
        canvasPosWorldSpace = new THREE.Vector4(0.,0.,0.,1.);
        presenceLevel = PRESENCE_LEVEL_DELETED;
        lineIndex = -1;

        constructor(associatedVariable) {
            this.variable = associatedVariable

            this.viz = this.variable.type.getFreshViz(this.variable.col)
            this.variable.type.dw.scene.add(this.viz)
            this.viz.visible = false

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

        lowestChangedLineSinceCompile = Infinity
        setSvgLine($changedLineIndicator, -10, -10, -10, -10)

        text = text.replace(commentNotNewlineRegex,"")

        {
            threejsIsCheckingForShaderErrors = true
            finalFsq.material.fragmentShader = text + toFragColorSuffix
            finalFsq.material.needsUpdate = true
        }
        
        mentions.forEach((mention) => {
            if (mention.presenceLevel === PRESENCE_LEVEL_CONFIRMED)
                mention.presenceLevel = PRESENCE_LEVEL_UNCONFIRMED
        })
        
        let variableNumMentions = {}

        let ignoringDueToStruct = false
        
        let lines = text.split("\n")
        lines.forEach((l,lineIndex) => {

            if (!ignoringDueToStruct && l.indexOf("struct") !== -1)
                ignoringDueToStruct = true
            else if (l.indexOf("}") !== -1)
                ignoringDueToStruct = false
            if(ignoringDueToStruct)
                return

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

                let mention = mentions.find((m) => 
                    m.variable.name === name && 
                    m.mentionsFromStart === variableNumMentions[name])
                if (mention === undefined) {

                    let variable = variables.find((v) => v.name === name )
                    if(variable === undefined) {
                        let partUpToName = l.slice(0, l.indexOf(name) - 1)
                        let splitByWhitespace = partUpToName.split(/\s+/)
                        let declaredType = splitByWhitespace[splitByWhitespace.length - 1]
                        switch(declaredType) {
                            case 'vec4':
                                variable = new Variable(name, types.point)
                                break;
                            case 'vec3':
                                variable = new Variable(name, types.vec3)
                                break;
                            default:
                                console.error("unrecognized type") //could put it in the thingy
                        }
                    }

                    mention = mentions.find((m) => 
                        m.presenceLevel === PRESENCE_LEVEL_DELETED && 
                        m.variable === variable)
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

            if (mention.presenceLevel === PRESENCE_LEVEL_UNCONFIRMED) {
                mention.presenceLevel = PRESENCE_LEVEL_DELETED
                return
            }

            let shaderWithMentionReadout = ``
            shaderWithMentionReadout += readoutPrefix
            shaderWithMentionReadout += lines.slice(0,mention.lineIndex+1).join("\n")

            shaderWithMentionReadout += mention.variable.type.getOutputFloatString(mention.variable.name)

            shaderWithMentionReadout += lines.slice(mention.lineIndex+1).join("\n")
            shaderWithMentionReadout += readoutSuffix

            //probably terrible to have a shader for every mention
            //just have the "readout shader". A uniform controls which line is being read out
            //compiler optimization number 1!
            
            //also when you do sphere at infinity dw, have the frustum and its view rect on there

            mention.variable.type.updateVizAndCanvasPos(mention, shaderWithMentionReadout)
        })
        //this doesn't guarantee that you're using them as much as possible, just that they'll be cleared up on the next one

        delete variableNumMentions
    }

    updateDwContents = () => {
        
        mentions.forEach((mention) => {
            mention.viz.visible =
                mention.presenceLevel === PRESENCE_LEVEL_CONFIRMED &&
                (mention === hoveredMention ||
                (caretLine < lowestChangedLineSinceCompile && 
                mention.lineIndex === caretLine ) )
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

    $changedLineIndicator.style.stroke = "rgb(180,180,180)"
    function updateCli() {
        if(lowestChangedLineSinceCompile !== Infinity) {
            let textareaBox = textarea.getBoundingClientRect()
            let y = lineToScreenY(lowestChangedLineSinceCompile - 1)
            setSvgLine($changedLineIndicator,
                textareaBox.x, y,
                textareaBox.x + textareaBox.width, y)
        }
    }
    textarea.addEventListener('scroll', updateCli)

    textarea.addEventListener('input', () => {
        errorBox.style.top = "-200px"

        if (caretLine+1 < lowestChangedLineSinceCompile)
            lowestChangedLineSinceCompile = caretLine+1
        
        updateCli()

        updateDwContents()
    })

    let caretPositionOld = -1
    let caretLine = -1
    updateBasedOnCaret = function() {
        
        let caretPosition = textarea.selectionStart
        if (caretPosition !== caretPositionOld) {
            let text = textarea.value

            let lineIndex = 0
            for (let i = 0, il = text.length; i < il; ++i) {
                if (i === caretPosition) {
                    //lineIndex is new caret line

                    if (lineIndex !== caretLine) {
                        caretLine = lineIndex
                        updateDwContents()
                    }
                }

                if (text[i] === "\n")
                    ++lineIndex
            }

            caretPositionOld = caretPosition
        }
    }

    document.addEventListener('selectionchange', updateBasedOnCaret)
}