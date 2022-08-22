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

    class Appearance {
        variable
        state
        uniform = {value:null}

        duplicates = [] //they may have been redefined, but they do have the same values as extracted

        visible

        constructor(variable) {
            this.variable = variable
        }

        onGrab(dw) {}
        onLetGo(dw) {}
        updateUniformFromState() {}

        isVisibleInDw(dw) {
            return this._isVisibleInDw(dw)
        }
        setVisibility(newVisibility) {
            this.visible = newVisibility
            this._setVisibility(this.visible)
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

    class AppearanceType {
        glslName
        numFloats
        constructAppearance
        outputAssignmentPropts
        regexes = {}
        literalAssignmentFromOverride

        lowestUnusedAppearance = 0
        appearances = []

        constructor(glslName, numFloats, constructAppearance, outputAssignmentPropts) {
            this.glslName = glslName
            this.numFloats = numFloats
            this.constructAppearance = constructAppearance

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

        getLowestUnusedAppearance(variable) {
            console.assert(this.appearances.length >= this.lowestUnusedAppearance)
            if (this.appearances.length === this.lowestUnusedAppearance)
                this.appearances.push( new this.constructAppearance(this) )

            let theLowestUnusedAppearance = this.appearances[this.lowestUnusedAppearance++]
            theLowestUnusedAppearance.variable = variable
            theLowestUnusedAppearance.setColor(variable.col)

            return theLowestUnusedAppearance
        }

        getLiteralAssignmentFromValues() {
            let commaSeparated = ""
            for (let i = 0, il = arguments.length; i < il; ++i) {
                let asStr = parseFloat(arguments[i].toFixed(2))
                if (asStr === Math.round(asStr))
                    asStr += "."
                commaSeparated += asStr + (i === il - 1 ? "" : ",")
            }

            return this.glslName + "(" + commaSeparated + ")"
        }
    }
    window.AppearanceType = AppearanceType
}