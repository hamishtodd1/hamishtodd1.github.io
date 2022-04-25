function initHover() {
    var characterWidth = parseInt(window.getComputedStyle(textMeasurer).width) / 40.

    let style = window.getComputedStyle(textarea)
    let lineHeight = parseInt(style.lineHeight)

    let textAreaOffset = parseInt(style.padding) + parseInt(style.margin) // can add some fudge to this if you like

    let svgLines = [labelLine, labelSide1, labelSide2, labelSide3, labelSide4]

    let lastClientX = 100
    let lastClientY = 100

    lineToScreenY = (line) => {
        return line * lineHeight + textAreaOffset - textarea.scrollTop
    }
    updateHorizontalBounds = (index, nameLength, target) => {
        target.x = index * characterWidth + textAreaOffset

        target.w = nameLength * characterWidth
    }

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

        return toElementCoord(mention.variable.type, canvasX, canvasY)
    }

    function highlightMention(mention) {
        hoveredMention = mention

        let c = mention.variable.col
        svgLines.forEach((svgLine) => { svgLine.style.stroke = "rgb(" + c.r * 255. + "," + c.g * 255. + "," + c.b * 255. + ")" })

        let [elemX, elemY] = canvasPos(mention)

        let mb = mention.horizontalBounds
        let mby = lineToScreenY(mention.lineIndex)

        setSvgLine(labelLine,
            mb.x + mb.w,
            mby + lineHeight / 2.,
            elemX, elemY)

        setSvgLine(labelSide1, mb.x, mby, mb.x + mb.w, mby)
        setSvgLine(labelSide2, mb.x + mb.w, mby, mb.x + mb.w, mby + lineHeight)
        setSvgLine(labelSide3, mb.x + mb.w, mby + lineHeight, mb.x, mby + lineHeight)
        setSvgLine(labelSide4, mb.x, mby + lineHeight, mb.x, mby)
    }

    function resetHover() {            
        hoveredMention = null
        svgLines.forEach((svgLine) => { setSvgLine(svgLine, -10, -10, -10, -10) })
    }

    function updateTextAreaHover(clientX,clientY) {
        if(clientX !== undefined)
            lastClientX = clientX
        else
            clientX = lastClientX
        if (clientY !== undefined)
            lastClientY = clientY
        else
            clientY = lastClientY

        resetHover()

        camera.updateMatrixWorld()
        worldToCanvas.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse)

        mentions.every((mention) => {
            let mb = mention.horizontalBounds
            let mby = lineToScreenY(mention.lineIndex)
            let mouseInBox =
                mb.x <= clientX && clientX < mb.x + mb.w &&
                mby <= clientY && clientY < mby + lineHeight

            if (mouseInBox)
                highlightMention(mention)

            return !mouseInBox
        })

        updateDwContents()
    }

    let worldToCanvas = new THREE.Matrix4()
    let transformedV = new THREE.Vector4()
    textarea.addEventListener('mousemove', (event)=>{
        updateTextAreaHover(event.clientX,event.clientY)
    })

    function onDblClick() {
        if(hoveredMention !== null) {
            let vari = hoveredMention.variable
            vari.changeType(1 - vari.type)
        }
    }
    textarea.addEventListener('dblclick', (event)=>{
        onDblClick()
        updateTextAreaHover(event.clientX,event.clientY)
    })

    textarea.addEventListener('scroll', (event) =>{
        updateTextAreaHover()
    })

    function onDwHover(dw, clientX,clientY) {
        camera.updateMatrixWorld()
        worldToCanvas.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse)

        resetHover()

        let closestIndex = -1
        let closestDist = Infinity
        mentions.forEach((mention,i) => {
            if (!mention.mesh.visible || mention.mesh.parent !== dw.scene)
                return

            let [elemX, elemY] = canvasPos(mention)
            let dist = Math.sqrt(sq(clientX - elemX) + sq(clientY - elemY))

            if(dist < closestDist) {
                closestIndex = i
                closestDist = dist
            }
        })
        if(closestIndex !== -1)
            highlightMention(mentions[closestIndex])
    }

    for(dwName in dws ) {
        let dw = dws[dwName]
        dw.elem.addEventListener('mousemove',(event)=>{
            onDwHover(dw, event.clientX,event.clientY)
        })
        dw.elem.addEventListener('dblclick', (event) => {
            onDblClick()
            onDwHover(event.clientX, event.clientY)
        })
    }
}