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

    setSvgHighlight = function (x, y, w, h, $sidesArray) {
        setSvgLine($sidesArray[0], x, y, x + w, y)
        setSvgLine($sidesArray[1], x + w, y, x + w, y + h)
        setSvgLine($sidesArray[2], x + w, y + h, x, y + h)
        setSvgLine($sidesArray[3], x, y + h, x, y)
    }

    setSvgLineColor = function(line, r, g, b) {
        line.style.stroke = "rgb(" + r * 255. + "," + g * 255. + "," + b * 255. + ")"
    }
}
