function initMention() {
    
    let canvasPos = new THREE.Vector4()
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
            if (mention.lineIndex >= lowestChangedLineSinceCompile)
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

    ndcToWindow = (ndcX,ndcY,dw) => {
        let dwRect = dw.elem.getBoundingClientRect()

        let actuallyOnScreen = 0. <= ndcX && ndcX <= 1. &&
                               0. <= ndcY && ndcY <= 1.
        if (actuallyOnScreen) {
            return [
                dwRect.x + dwRect.width * ndcX,
                dwRect.y + dwRect.height * (1. - ndcY)
            ]
        }
        else
            return [Infinity, Infinity]
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

        getReassignmentNew(useOverrideFloats) {
            return this.variable.name + " = " + this.getReassignmentPostEquals(useOverrideFloats)
        }

        onGrab(dw) {
        }
        onLetGo(dw) {
        }

        isBeingUsed() {
            let ourIndex = this.variable.mentions.indexOf(this)
            return ourIndex < this.variable.lowestUnusedMention
        }

        getShaderOutput(target) {
            return getOutput(this.mentionIndex,target)
        }

        //this may well get overridden
        getCanvasPosition(dw) {
            this.getWorldSpaceCanvasPosition(canvasPos,dw)
            return camera.positionToWindow(canvasPos,dw)
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
            let lowestUnusedLabelConnector = 0
            forVizDws((dw)=>{
                if (this.isVisibleInDw(dw)) {

                    //TODO this works differently if .isAttrib or .isUniform

                    let [elemX, elemY] = this.getCanvasPosition(dw)

                    setSvgLine($labelConnectors[lowestUnusedLabelConnector++],
                        mb.x + mb.w,
                        mby + lineHeight / 2.,
                        elemX, elemY)
                }
            })
            for(let i = lowestUnusedLabelConnector; i < $labelConnectors.length; ++i)
                setSvgLine($labelConnectors[i],-10,-10,-10,-10)
        }
    }
    window.Mention = Mention

    getFloatArrayAssignmentString = (variableName, len) => {
        let ret = "\n"
        for (let i = 0; i < len; ++i)
            ret += `    outputFloats[` + i + `] = ` + variableName + `[` + i + `];\n`
        return ret
    }

    generateReassignmentText = function() {
        let ret = arguments[0] + "("

        let useLiteralValues = arguments[1] !== true
        if (useLiteralValues) {
            for (let i = 1, il = arguments.length; i < il; ++i) {
                let asStr = parseFloat(arguments[i].toFixed(2))
                if (asStr === Math.round(asStr))
                    asStr += "."
                ret += asStr + (i === il - 1 ? "" : ",")
            }
        }
        else {
            for (let i = 0, il = arguments[2]; i < il; ++i)
                ret += "overrideFloats[" + i + "]" + (i === il - 1 ? "" : ",")
        }

        ret += ")"

        return ret
    }
}