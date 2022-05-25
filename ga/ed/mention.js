function generateReassignmentText() {
    let ret = "\n    " + arguments[0] + " = " + arguments[1] + "("
    for (let i = 2, il = arguments.length; i < il; ++i)
        ret += arguments[i].toFixed(2) + (i === il - 1 ? "" : ",")
    ret += ");\n"

    return ret
}

function initMention()
{
    let canvasPos = new THREE.Vector4()
    let style = window.getComputedStyle(textarea)
    let lineHeight = parseInt(style.lineHeight)

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

    hideLabelLines = () => {
        $labelLines.forEach((svgLine) => { 
            setSvgLine(svgLine, -10, -10, -10, -10)
        })
    }
    hideLabelLines()

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

        onGrab(dw) {

        }

        getCanvasPosition(dw) {
            this.getCanvasPositionWorldSpace(canvasPos,dw)
            canvasPos.applyMatrix4(camera.worldToCanvas)
            let canvasX = canvasPos.x / canvasPos.w
            let canvasY = canvasPos.y / canvasPos.w

            let dwRect = dw.elem.getBoundingClientRect()

            let ndcX = canvasX / 2. + .5
            let ndcY = canvasY / 2. + .5

            let actuallyOnScreen =  0. <= ndcX && ndcX <= 1. &&
                                    0. <= ndcY && ndcY <= 1.

            return [
                dwRect.x + dwRect.width * ndcX,
                dwRect.y + dwRect.height * (1. - ndcY)
            ]
        }

        highlight() {
            let col = this.variable.col
            $labelLines.forEach((svgLine) => {
                svgLine.style.stroke = "rgb(" + col.r * 255. + "," + col.g * 255. + "," + col.b * 255. + ")"
            })

            let mb = this.horizontalBounds
            let mby = lineToScreenY(this.lineIndex)

            let lowestUnusedLabelConnector = 0
            this.setVisibility(true)
            for(dwName in dws) {
                let dw = dws[dwName]
                
                if(this.isVisibleInDw(dw)) {

                    if (lowestUnusedLabelConnector === $labelConnectors.length )
                        $labelConnectors.push(LabelLine())

                    let [elemX, elemY] = this.getCanvasPosition(dw)
                    setSvgLine($labelConnectors[lowestUnusedLabelConnector],
                        mb.x + mb.w,
                        mby + lineHeight / 2.,
                        elemX, elemY)
                    
                    ++lowestUnusedLabelConnector
                }
            }

            setSvgLine($labelSides[0], mb.x, mby, mb.x + mb.w, mby)
            setSvgLine($labelSides[1], mb.x + mb.w, mby, mb.x + mb.w, mby + lineHeight)
            setSvgLine($labelSides[2], mb.x + mb.w, mby + lineHeight, mb.x, mby + lineHeight)
            setSvgLine($labelSides[3], mb.x, mby + lineHeight, mb.x, mby)
        }
    }
    window.Mention = Mention
}