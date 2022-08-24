function initMention() {
    
    let worldCenter = new THREE.Vector4()
    let style = window.getComputedStyle(textarea)
    let lineHeight = parseInt(style.lineHeight)
    let textareaOffsetHorizontal = parseInt(style.padding) + parseInt(style.margin) // can add some fudge to this if you like
    let textareaOffsetVertical = parseInt(style.top) + parseInt(style.padding) + parseInt(style.margin)
    let characterWidth = parseInt(window.getComputedStyle(textMeasurer).width) / 40.

    forEachUsedMention = (func) => {
        variables.forEach((v) => {
            for (let i = 0; i < v.lowestUnusedMention; ++i)
                func(v.mentions[i])
        })
    }
    forEachUsedAppearance = (func) => {
        appearanceTypes.forEach((appearanceType) => {
            for (let i = 0; i < appearanceType.lowestUnusedAppearance; ++i)
                func(appearanceType.appearances[i])
        })
    }

    let $labelLines = []
    function LabelLine() {
        let l = document.createElementNS('http://www.w3.org/2000/svg','line') //weblink refers to a standard
        ourSvg.appendChild(l)
        $labelLines.push(l)

        return l
    }

    let $labelSides = []
    for(let i = 0; i < 4; ++i)
        $labelSides[i] = LabelLine()
    let $labelConnectors = []
    $labelConnectors.push(LabelLine(), LabelLine(), LabelLine())

    lineToScreenY = (line) => {
        return line * lineHeight + textareaOffsetVertical - textarea.scrollTop
    }
    columnToScreenX = (column) => {
        return column * characterWidth + textareaOffsetHorizontal - textarea.scrollLeft
    }
    
    hideHighlight = () => {
        $labelLines.forEach((svgLine) => { 
            setSvgLine(svgLine, -10, -10, -10, -10)
        })
        forEachPropt(dws, (dw) => {
            dw.setBorderHighlight(false)
        })
    }

    getIndicatedTextareaMention = (screenX, screenY) => {
        let ret = null
        forEachUsedMention((mention)=>{
            if (inamongstChangedLines(mention.lineIndex) )
                return false

            let y = lineToScreenY(mention.lineIndex)
            let x = columnToScreenX(mention.column)
            let w = mention.variable.name.length * characterWidth

            let xyInBox =
                x <= screenX && screenX <= x + w &&
                y <= screenY && screenY < y + lineHeight

            if(xyInBox)
                ret = mention
        })

        return ret
    }

    forEachAppearance = (func) => {
        appearanceTypes.forEach((at) => {
            at.appearances.forEach((a) => {
                func(a)
            })
        })
    }

    let arrayForGettingLiterals = new Float32Array(16)

    class Appearance {
        variable
        state
        uniform = {value: null}
        col = new THREE.Color()

        duplicates = [] //they may have been redefined, but they do have the same values as extracted

        visible

        toHaveVisibilitiesSet = []

        onGrab(dw) {}
        onLetGo(dw) {}

        updateFromState() {
            this.updateUniformFromState()
            this.updateMeshesFromState()
        } 
        
        updateUniformFromState() {} //for most, uniform.value === state, so nothing need happen

        //sometimes overridden
        equals(m) {
            return m.state.equals(this.state)
        }
        updateStateFromRunResult(floatArray) {
            // if(this.variable.name === `control2`)
            //     log(floatArray)
            this.state.fromArray(floatArray)
        }
        stateToFloatArray(floatArray) {
            this.state.toArray(floatArray)
        }
        getLiteralAssignmentFromState() {
            this.stateToFloatArray(arrayForGettingLiterals)

            let commaSeparated = ""
            for (let i = 0, il = this.variable.type.numFloats; i < il; ++i) {
                let asStr = parseFloat(arrayForGettingLiterals[i].toFixed(2))
                if (asStr === Math.round(asStr))
                    asStr += "."
                commaSeparated += asStr + (i === il - 1 ? "" : ",")
            }

            return this.variable.type.glslName + "(" + commaSeparated + ")"
        }

        updateStateFromDrag(dw) {
            let result = this._updateStateFromDrag(dw)
            if(result === false)
                console.error("Not in dw: ", keyOfProptInObject(dw, dws))
        }

        isVisibleInDw(dw) {
            return this._isVisibleInDw(dw) || (this.variable.isIn && dw === dws.mesh)
        }
        setVisibility(newVisibility) {
            this.visible = newVisibility
            this.toHaveVisibilitiesSet.forEach((m)=>{
                m.visible = newVisibility
            })
        }

        getTextareaManipulationDw() {
            return this.variable.isIn ? dws.mesh : this._getTextareaManipulationDw()
        }

        getWindowCenter(dw) {
            this.getWorldCenter(dw, worldCenter)
            return dw.worldToWindow(worldCenter)
        }
    }
    window.Appearance = Appearance

    class Mention {
        lineIndex = -1
        column = -1

        mentionIndex = -1

        variable

        appearance = null

        constructor(variable) {
            this.variable = variable
        }

        highlight() {
            let col = this.variable.col
            $labelLines.forEach((svgLine) => {
                svgLine.style.stroke = "rgb(" + col.r * 255. + "," + col.g * 255. + "," + col.b * 255. + ")"
            })

            //mouse box
            let y = lineToScreenY(this.lineIndex)
            let x = columnToScreenX(this.column)
            let w = this.variable.name.length * characterWidth

            setSvgLine($labelSides[0], x, y, x + w, y)
            setSvgLine($labelSides[1], x + w, y, x + w, y + lineHeight)
            setSvgLine($labelSides[2], x + w, y + lineHeight, x, y + lineHeight)
            setSvgLine($labelSides[3], x, y + lineHeight, x, y)

            let lowestUnusedLabelConnector = 0
            //this is very shotgunny. Better would be
            forNonFinalDws((dw) => {
                if (this.appearance.isVisibleInDw(dw) ) {
                    let [windowX, windowY] = this.appearance.getWindowCenter(dw)
                    if(windowX === Infinity) 
                        dw.setBorderHighlight(true, col)
                    else {
                        setSvgLine($labelConnectors[lowestUnusedLabelConnector++],
                            x + w,
                            y + lineHeight / 2.,
                            windowX, windowY)
                        dw.setBorderHighlight(false)
                    }
                }
            })
            for (let i = lowestUnusedLabelConnector; i < $labelConnectors.length; ++i)
                setSvgLine($labelConnectors[i], -10, -10, -10, -10)
        }
    }
    window.Mention = Mention

    let randomColor = new THREE.Color()
    let currentHue = 0.
    let goldenRatio = (Math.sqrt(5.) + 1.) / 2.
    class Variable {
        name
        type
        isIn = false
        isUniform = false
        //could have something to indicate it's neither of those. A "variable" I guess

        col = new THREE.Color(0., 0., 0.)
        assignmentToOutput = ""

        lowestUnusedMention = 0 //well, index thereof. Maybe change
        mentions = []
        
        constructor(newName, newClass) {
            //never changed after this
            this.name = newName
            this.type = newClass

            for (let i = 0; i < newClass.numFloats; ++i)
                this.assignmentToOutput += `    outputFloats[` + i + `] = ` + newName + newClass.outputAssignmentPropts[i] + `;\n`

            randomColor.setHSL(currentHue, 1., .5)
            currentHue += 1. / goldenRatio
            while (currentHue > 1.)
                currentHue -= 1.
            this.col.r = randomColor.r; this.col.g = randomColor.g; this.col.b = randomColor.b;

            variables.push(this)
        }

        getLowestUnusedMention() {
            console.assert(this.mentions.length >= this.lowestUnusedMention)
            if (this.mentions.length === this.lowestUnusedMention)
                this.mentions.push(new Mention(this))

            return this.mentions[this.lowestUnusedMention++]
        }
    }
    window.Variable = Variable

    //note that this is agnostic of variables and mentions
    class AppearanceType {
        glslName
        numFloats
        constructAppearance
        outputAssignmentPropts
        regexes = {}
        literalAssignmentFromOverride

        lowestUnusedAppearance = 0
        appearances = []

        constructor(glslName, numFloats, _constructAppearance, outputAssignmentPropts) {
            this.glslName = glslName
            this.numFloats = numFloats

            let self = this
            this.constructAppearance = function() {

                let appearance = new _constructAppearance()
                self.appearances.push(appearance)

                return appearance
            }

            this.outputAssignmentPropts = Array(numFloats)
            if (outputAssignmentPropts !== undefined) {
                for (let i = 0; i < this.numFloats; ++i)
                    this.outputAssignmentPropts[i] = `.` + outputAssignmentPropts[i]
            }
            else {
                for (let i = 0; i < this.numFloats; ++i)
                    this.outputAssignmentPropts[i] = `[` + i + `]`
            }

            this.regexes.function = new RegExp('(?<=[^a-zA-Z_$0-9])(' + glslName + ')\\s*[a-zA-Z_$][a-zA-Z_$0-9]*\\(', 'gm')
            this.regexes.all = new RegExp('(?<=[^a-zA-Z_$0-9])(' + glslName + ')\\s*[a-zA-Z_$][a-zA-Z_$0-9]*', 'gm')
            this.regexes.uniform = new RegExp('\\s*uniform\\s*(' + glslName + ')\\s', 'gm')
            this.regexes.in = new RegExp('\\s*in\\s*(' + glslName + ')\\s', 'gm')

            let commaSeparated = ``
            for (let i = 0; i < this.numFloats; ++i)
                commaSeparated += `overrideFloats[` + i + `]` + (i === this.numFloats - 1 ? `` : `,`)
            this.literalAssignmentFromOverride = this.glslName + `(` + commaSeparated + `)`

            appearanceTypes.push(this)
        }

        getLowestUnusedAppearanceAndEnsureAssignment(variable) {
            let needNewOne = this.lowestUnusedAppearance === this.appearances.length
            let ret = null
            if (!needNewOne)
                ret = this.appearances[this.lowestUnusedAppearance]
            else
                ret = new this.constructAppearance()
                
            ret.variable = variable
            ret.col.copy(variable.col)

            ++this.lowestUnusedAppearance

            return ret
        }

        getAnAppearance( variable, uniforms, outputterUniforms, geo) {
            let ret = null

            if (!variable.isUniform && !variable.isIn) 
                ret = this.getLowestUnusedAppearanceAndEnsureAssignment(variable)
            else {
                if(variable.lowestUnusedMention > 1)
                    ret = variable.mentions[0].appearance
                else {
                    ret = this.getLowestUnusedAppearanceAndEnsureAssignment(variable)
                    
                    ret.updateFromState()
                    if (variable.isIn) {
                        createIn(geo, ret)
                        outputterUniforms[variable.name + `Outputter`] = ret.uniform
                    }
                    else { //isUniform
                        uniforms[variable.name] = ret.uniform
                        outputterUniforms[variable.name] = ret.uniform
                    }
                }
            }
            
            return ret
        }
    }
    window.AppearanceType = AppearanceType
}