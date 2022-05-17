function initMention()
{
    let canvasPos = new THREE.Vector4()
    let style = window.getComputedStyle(textarea)
    let lineHeight = parseInt(style.lineHeight)

    class Mention {
        variable;

        mentionsFromStart;
        horizontalBounds = { x: 0., w: 0. };
        presenceLevel = PRESENCE_LEVEL_DELETED;
        lineIndex = -1;

        constructor(variable) {
            mentions.push(this) //maybe better as mentions of a certain subclass

            this.variable = variable
        }

        getCanvasPosition(dw) {
            this.getCanvasPositionWorldSpace(canvasPos,dw)
            canvasPos.applyMatrix4(camera.worldToCanvas)
            let canvasX = canvasPos.x / canvasPos.w
            let canvasY = canvasPos.y / canvasPos.w

            let dwRect = dw.elem.getBoundingClientRect()

            let ndcX = canvasX / 2. + .5
            let ndcY = canvasY / 2. + .5

            return [
                dwRect.x + dwRect.width * ndcX,
                dwRect.y + dwRect.height * (1. - ndcY)
            ]
        }

        highlight() {
            setSvgHighlightColor(this.variable.col)

            let mb = this.horizontalBounds
            let mby = lineToScreenY(this.lineIndex)

            let doneOne = false
            this.setVisibility(true)
            for(dwName in dws) {
                let dw = dws[dwName]
                
                if(this.isVisibleInDw(dw)) {
                    if (doneOne)
                        console.error("yes you need to make another svg line")

                    let [elemX, elemY] = this.getCanvasPosition(dw)
                    setSvgLine($labelLine,
                        mb.x + mb.w,
                        mby + lineHeight / 2.,
                        elemX, elemY)

                    doneOne = true
                }
            }

            setSvgLine($labelSide1, mb.x, mby, mb.x + mb.w, mby)
            setSvgLine($labelSide2, mb.x + mb.w, mby, mb.x + mb.w, mby + lineHeight)
            setSvgLine($labelSide3, mb.x + mb.w, mby + lineHeight, mb.x, mby + lineHeight)
            setSvgLine($labelSide4, mb.x, mby + lineHeight, mb.x, mby)
        }
    }
    window.Mention = Mention
}