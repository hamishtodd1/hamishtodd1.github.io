function initHover() {
    var characterWidth = parseInt(window.getComputedStyle(textMeasurer).width) / 40.

    let style = window.getComputedStyle(textarea)
    let lineHeight = parseInt(style.lineHeight)

    let textAreaOffset = parseInt(style.padding) + parseInt(style.margin) // can add some fudge to this if you like

    let svgLines = [labelLine, labelSide1, labelSide2, labelSide3, labelSide4]

    function setSvgLine(svgLine, x1, y1, x2, y2) {
        svgLine.x1.baseVal.value = x1
        svgLine.y1.baseVal.value = y1
        svgLine.x2.baseVal.value = x2
        svgLine.y2.baseVal.value = y2
    }

    updateBox = (index, line, nameLength, target) => {
        target.x = index * characterWidth + textAreaOffset
        target.y = line * lineHeight + textAreaOffset

        target.w = nameLength * characterWidth
    }

    let hoveredMention = null

    function toElementCoord(type,x,y) {
        let dwRect = type === TYPES_POINT ? dws.top.elem.getBoundingClientRect() : dws.second.elem.getBoundingClientRect()
        
        let ndc = { 
            x: x / 2. + .5,
            y: y / 2. + .5
        }

        return [dwRect.x + dwRect.width * ndc.x, dwRect.y + dwRect.height * (1. - ndc.y)]
    }

    function canvasPos(mention) {
        transformedV.set(mention.canvasPosWorldSpace[0], mention.canvasPosWorldSpace[1], mention.canvasPosWorldSpace[2], mention.canvasPosWorldSpace[3])
        transformedV.applyMatrix4(worldToCanvas)
        let canvasX = transformedV.x / transformedV.w
        let canvasY = transformedV.y / transformedV.w

        return toElementCoord(mention.type, canvasX, canvasY)
    }

    function highlightMention(mention, elemX, elemY) {
        hoveredMention = mention

        let c = mention.variable.col
        svgLines.forEach((svgLine) => { svgLine.style.stroke = "rgb(" + c.r * 255. + "," + c.g * 255. + "," + c.b * 255. + ")" })

        if(elemX === undefined)
            [elemX, elemY] = canvasPos(mention)

        let mb = mention.box

        setSvgLine(labelLine,
            mb.x + mb.w,
            mb.y + lineHeight / 2.,
            elemX, elemY)

        setSvgLine(labelSide1, mb.x, mb.y, mb.x + mb.w, mb.y)
        setSvgLine(labelSide2, mb.x + mb.w, mb.y, mb.x + mb.w, mb.y + lineHeight)
        setSvgLine(labelSide3, mb.x + mb.w, mb.y + lineHeight, mb.x, mb.y + lineHeight)
        setSvgLine(labelSide4, mb.x, mb.y + lineHeight, mb.x, mb.y)
    }

    function resetHover() {
        hoveredMention = null
        svgLines.forEach((svgLine) => { setSvgLine(svgLine, -10, -10, -10, -10) })
    }

    function onTextAreaHover(clientX,clientY) {
        resetHover()

        camera.updateMatrixWorld()
        worldToCanvas.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse)

        mentions.every((mention) => {
            let mb = mention.box
            let mouseInBox =
                mb.x <= clientX && clientX < mb.x + mb.w &&
                mb.y <= clientY && clientY < mb.y + lineHeight

            if (mouseInBox)
                highlightMention(mention)

            return !mouseInBox
        })
    }

    let worldToCanvas = new THREE.Matrix4()
    let transformedV = new THREE.Vector4()
    textarea.addEventListener('mousemove', (event)=>{
        onTextAreaHover(event.clientX,event.clientY)
    })

    textarea.addEventListener('dblclick', (event) => {
        if (hoveredMention.type === TYPES_COLOR)
            hoveredMention.type = TYPES_POINT
        else if (hoveredMention.type === TYPES_POINT)
            hoveredMention.type = TYPES_COLOR

        onTextAreaHover(oldClientX,oldClientY)
    })

    function onDwHover(clientX,clientY) {
        camera.updateMatrixWorld()
        worldToCanvas.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse)

        resetHover()

        let boxSize = 6

        mentions.every((mention) => {
            let [elemX, elemY] = canvasPos(mention)
            let mouseProximate =
                -boxSize < clientX - elemX && clientX - elemX < boxSize &&
                -boxSize < clientY - elemY && clientY - elemY < boxSize

            if (mouseProximate)
                highlightMention(mention, elemX, elemY)

            return !mouseProximate
        })
    }

    for(dwName in dws ) {
        dws[dwName].elem.addEventListener('mousemove',(event)=>{
            onDwHover(event.clientX,event.clientY)
        })
    }
}