function generateReassignmentText() {
    let ret = arguments[0] + "("

    let useLiteralValues = arguments[1] !== true
    if (useLiteralValues) {
        for (let i = 1, il = arguments.length; i < il; ++i)
            ret += arguments[i].toFixed(2) + (i === il - 1 ? "" : ",")
    }
    else {
        for (let i = 0, il = arguments[2]; i < il; ++i)
            ret += "overrideFloats["+i+"]" + (i === il - 1 ? "" : ",")
    }

    ret += ")"

    return ret
}

function initMention()
{
    let canvasPos = new THREE.Vector4()
    let style = window.getComputedStyle(textarea)
    let lineHeight = parseInt(style.lineHeight)
    let textAreaOffset = parseInt(style.padding) + parseInt(style.margin) // can add some fudge to this if you like
    let characterWidth = parseInt(window.getComputedStyle(textMeasurer).width) / 40.

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
        return line * lineHeight + textAreaOffset - textarea.scrollTop
    }
    columnToScreenX = (column) => {
        return column * characterWidth + textAreaOffset
    }
    updateHorizontalBounds = (column, nameLength, target) => {
        target.x = columnToScreenX(column)

        target.w = nameLength * characterWidth
    }

    hideHighlight = () => {
        $labelLines.forEach((svgLine) => { 
            setSvgLine(svgLine, -10, -10, -10, -10)
        })
    }

    getClosestTextAreaMention = (screenX, screenY) => {
        let ret = mentions.find((mention) => {
            if (mention.presenceLevel === PRESENCE_LEVEL_DELETED ||
                mention.lineIndex > lowestChangedLineSinceCompile)
                return false

            let mb = mention.horizontalBounds
            let mby = lineToScreenY(mention.lineIndex)
            let mouseInBox =
                mb.x <= screenX && screenX <= mb.x + mb.w &&
                mby  <= screenY && screenY < mby + lineHeight

            return mouseInBox
        })

        return ret === undefined ? null : ret
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
        variable;

        mentionsFromStart;
        horizontalBounds = { x: 0., w: 0. };
        presenceLevel = PRESENCE_LEVEL_DELETED;
        lineIndex = -1;
        mentionIndex = -1;

        constructor(variable) {
            mentions.push(this) //maybe better as mentions of a certain subclass

            this.variable = variable
        }

        getReassignmentNew(useOverrideFloats) {
            return this.variable.name + " = " + this.getReassignmentPostEquals(useOverrideFloats)
        }

        onGrab(dw) {

        }

        getShaderOutput(target) {
            return getOutput(this.mentionIndex,target)
        }

        //this may well get overridden
        getCanvasPosition(dw) {
            this.getWorldSpaceCanvasPosition(canvasPos,dw)

            canvasPos.applyMatrix4(camera.worldToCanvas)
            let canvasX = canvasPos.x / canvasPos.w
            let canvasY = canvasPos.y / canvasPos.w

            let ndcX = canvasX / 2. + .5
            let ndcY = canvasY / 2. + .5

            return ndcToWindow(ndcX,ndcY,dw)
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
}