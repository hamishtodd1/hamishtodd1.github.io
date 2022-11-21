/*
    These are used for:
        Indicator for which lines have been edited
        highlighting a hovered variable


    You should probably be able to click on a variable, and if you immediately let go the caret goes there
 */

function initSvgLines() {
    SvgLine = function () {
        let l = document.createElementNS('http://www.w3.org/2000/svg', 'line') //weblink refers to a standard
        ourSvg.appendChild(l)
        return l
    }

    setSvgLine = function(svgLine, x1, y1, x2, y2) {
        if (x1 === Infinity || y1 === Infinity || x2 === Infinity || y2 === Infinity) {
            svgLine.setAttribute('x1', -10)
            svgLine.setAttribute('y1', -10)
            svgLine.setAttribute('x2', -10)
            svgLine.setAttribute('y2', -10)
        }
        else {
            svgLine.setAttribute('x1', x1)
            svgLine.setAttribute('y1', y1)
            svgLine.setAttribute('x2', x2)
            svgLine.setAttribute('y2', y2)
        }
    }

    hideSvgLine = function (svgLine) {
        setSvgLine(svgLine, -10, -10, -10, -10)
    }

    colorSvgLine = function(line, r, g, b) {
        line.style.stroke = "rgb(" + r * 255. + "," + g * 255. + "," + b * 255. + ")"
    }

    let $labelLines = []
    LabelLine = () => {
        let l = SvgLine()
        $labelLines.push(l)

        return l
    }
    hideLabelLines = () => {
        $labelLines.forEach((svgLine) => {
            hideSvgLine(svgLine)
        })
    }

    let $sides = []
    for (let i = 0; i < 4; ++i)
        $sides[i] = LabelLine()

    let $labelConnectors = []
    $labelConnectors.push(LabelLine(), LabelLine(), LabelLine(), LabelLine())
    highlightAppearance = (appearance, col, x, y, w) => {

        $labelLines.forEach((svgLine) => {
            colorSvgLine(svgLine, col.r, col.g, col.b)
        })

        let h = lineHeight
        setSvgLine($sides[0], x, y, x + w, y)
        setSvgLine($sides[1], x + w, y, x + w, y + h)
        setSvgLine($sides[2], x + w, y + h, x, y + h)
        setSvgLine($sides[3], x, y + h, x, y)

        let lowestUnusedLabelConnector = 0
        //this is very shotgunny
        // debugger
        // if(frameCount > 150)
        //     debugger
        forNonFinalDws((dw) => {
            if (appearance.isVisibleInDw(dw)) {
                let [windowX, windowY] = appearance.getWindowCenter(dw)
                if (windowX === Infinity)
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
            hideSvgLine($labelConnectors[i])
    }
}