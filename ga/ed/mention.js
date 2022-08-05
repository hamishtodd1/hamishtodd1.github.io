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
        return column * characterWidth + textareaOffsetHorizontal
    }
    
    hideHighlight = () => {
        $labelLines.forEach((svgLine) => { 
            setSvgLine(svgLine, -10, -10, -10, -10)
        })
    }

    getIndicatedTextareaMention = (screenX, screenY) => {
        let ret = null
        forEachUsedMention((mention)=>{
            if (inamongstChangedLines(mention.lineIndex) )
                return false

            let mb = mention.horizontalBounds
            let mby = lineToScreenY(mention.lineIndex)
            let xyInBox =
                mb.x <= screenX && screenX <= mb.x + mb.w &&
                mby <= screenY && screenY < mby + lineHeight

            if(xyInBox)
                ret = mention
        })

        return ret
    }

    class Mention {
        variable

        horizontalBounds = { x: 0., w: 0. }
        lineIndex = -1
        mentionIndex = -1
        duplicates = []

        constructor(variable) {
            this.variable = variable
        }

        onGrab(dw) {
        }
        onLetGo(dw) {
        }

        isBeingUsed() {
            let ourIndex = this.variable.mentions.indexOf(this)
            return ourIndex < this.variable.lowestUnusedMention
        }

        //often overridden
        getWindowCenter(dw) {
            this.getWorldCenter(dw, worldCenter)
            return dw.camera.worldToWindow(worldCenter,dw)
        }

        updateHorizontalBounds = (column, nameLength) => {
            this.horizontalBounds.x = columnToScreenX(column)
            this.horizontalBounds.w = nameLength * characterWidth
        }

        highlight() {
            let col = this.variable.col
            $labelLines.forEach((svgLine) => {
                svgLine.style.stroke = "rgb(" + col.r * 255. + "," + col.g * 255. + "," + col.b * 255. + ")"
            })

            let mb = this.horizontalBounds
            let mby = lineToScreenY(this.lineIndex)

            setSvgLine($labelSides[0], mb.x, mby, mb.x + mb.w, mby)
            setSvgLine($labelSides[1], mb.x + mb.w, mby, mb.x + mb.w, mby + lineHeight)
            setSvgLine($labelSides[2], mb.x + mb.w, mby + lineHeight, mb.x, mby + lineHeight)
            setSvgLine($labelSides[3], mb.x, mby + lineHeight, mb.x, mby)

            //Connect to the visualizations of the thing
            if (this.variable.isUniform) {
                
            }
            else if (this.variable.isIn) {

            }
            else {
                let lowestUnusedLabelConnector = 0
                //this is very shotgunny. Better would be
                forVizDws((dw) => {
                    if (this.isVisibleInDw(dw)) {

                        //TODO this works differently if .isIn or .isUniform

                        let [windowX, windowY] = this.getWindowCenter(dw)
                        if(windowX !== Infinity) {
                            setSvgLine($labelConnectors[lowestUnusedLabelConnector++],
                                mb.x + mb.w,
                                mby + lineHeight / 2.,
                                windowX, windowY)
                        }
                    }
                })
                for (let i = lowestUnusedLabelConnector; i < $labelConnectors.length; ++i)
                    setSvgLine($labelConnectors[i], -10, -10, -10, -10)
            }
        }

        ///////////////////////
        // debug bookkeeping //
        ///////////////////////

        //hmm, really looks like type business
        getValuesAssignment() {
            let commaSeparated = ""
            for (let i = 0, il = arguments.length; i < il; ++i) {
                let asStr = parseFloat(arguments[i].toFixed(2))
                if (asStr === Math.round(asStr))
                    asStr += "."
                commaSeparated += asStr + (i === il - 1 ? "" : ",")
            }

            return this.variable.type.glslName + "(" + commaSeparated + ")"
        }
    }
    window.Mention = Mention

    let randomColor = new THREE.Color()
    let currentHue = 0.
    let goldenRatio = (Math.sqrt(5.) + 1.) / 2.
    class Variable {
        name
        type

        col = new THREE.Color(0., 0., 0.)
        assignmentToOutput = ""
        isIn = false
        isUniform = false

        lowestUnusedMention = 0
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
            while (this.mentions.length <= this.lowestUnusedMention) {
                let newMention = new this.type.ourConstructor(this)
                this.mentions.push(newMention)
            }

            return this.mentions[this.lowestUnusedMention++]
        }
    }
    window.Variable = Variable

    class MentionType {
        glslName
        numFloats
        ourConstructor
        outputAssignmentPropts
        regexes = {}
        reassignmentPostEqualsFromOverride

        constructor(glslName, numFloats, ourConstructor, outputAssignmentPropts) {
            this.glslName = glslName
            this.numFloats = numFloats
            this.ourConstructor = ourConstructor

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
            this.reassignmentPostEqualsFromOverride = this.glslName + `(` + commaSeparated + `)`

            mentionTypes.push(this)
        }
    }
    window.MentionType = MentionType
}