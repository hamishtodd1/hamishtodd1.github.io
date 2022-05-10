function initMouseInteractions() {
    var characterWidth = parseInt(window.getComputedStyle(textMeasurer).width) / 40.

    let dragPlane = new Mv()

    let grabbedMention = null
    document.addEventListener('mouseup',(event)=>{
        if(grabbedMention !== null) {

            let newLine = "\n    " + grabbedMention.variable.name + " = vec4(" +
                grabbedMention.viz.position.x.toFixed(2) + "," +
                grabbedMention.viz.position.y.toFixed(2) + "," +
                grabbedMention.viz.position.z.toFixed(2) + ",1.);\n"

            //so that you can see things respond in real time, a better situation would be:
            //you have a single array of floats that is a uniform, called "override"
            //and another, an integer that is lineThatIsAffectedByOverride

            let lines = textarea.value.split("\n")
            let pre  = lines.slice(0, grabbedMention.lineIndex+1).join("\n")
            let post = lines.slice(grabbedMention.lineIndex+1).join("\n")
            
            textarea.value = pre + newLine + post
            updateSyntaxHighlighting(textarea.value)
            compile()

            let newCaretPosition = textarea.value.length - post.length - 1
            textarea.focus()
            textarea.setSelectionRange(newCaretPosition, newCaretPosition)

            grabbedMention = null
        }

        updateBasedOnCaret()
    })
    getMouseRay = (dw,target)=>{
        let clientRect = dw.elem.getBoundingClientRect()
        let xProportion = (oldClientX - clientRect.x) / clientRect.width
        let yProportion = (oldClientY - clientRect.y) / clientRect.height

        let xPlane = mv3.fromLerp(camera.frustum.left, camera.frustum.right, xProportion)
        let yPlane = mv4.fromLerp(camera.frustum.bottom, camera.frustum.top, yProportion)

        meet(yPlane, xPlane, target)
        target.normalize()
        return target
    }
    document.addEventListener('mousemove', (event) => {       
        if (grabbedMention !== null ) {    
            
            let mouseRay = getMouseRay(dws.top,mv0)
            meet(dragPlane,mouseRay,mv1)
            mv1.toVector(grabbedMention.viz.position)
        }
    })

    let style = window.getComputedStyle(textarea)
    let lineHeight = parseInt(style.lineHeight)

    let textAreaOffset = parseInt(style.padding) + parseInt(style.margin) // can add some fudge to this if you like

    let svgLines = [labelLine, labelSide1, labelSide2, labelSide3, labelSide4]

    lineToScreenY = (line) => {
        return line * lineHeight + textAreaOffset - textarea.scrollTop
    }
    updateHorizontalBounds = (index, nameLength, target) => {
        target.x = index * characterWidth + textAreaOffset

        target.w = nameLength * characterWidth
    }

    function toElementCoord(type,x,y) {
        let dw = type === TYPES_POINT ? dws.top : dws.second
        // dw.elem.style.display = ''
        let dwRect = dw.elem.getBoundingClientRect()
        
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

        resetHover()

        camera.updateMatrixWorld()
        worldToCanvas.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse)

        mentions.every((mention) => {
            if (mention.lineIndex > lowestChangedLineSinceCompile)
                return false

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
        if (grabbedMention)
            return
        updateTextAreaHover(event.clientX,event.clientY)
    })

    textarea.addEventListener('scroll', (event) =>{
        updateTextAreaHover(oldClientX,oldClientY)
    })

    function onDwHover(dw, clientX,clientY) {
        camera.updateMatrixWorld()
        worldToCanvas.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse)

        resetHover()

        let closestIndex = -1
        let closestDist = Infinity
        mentions.forEach((mention,i) => {
            if (!mention.viz.visible || mention.viz.parent !== dw.scene)
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
            if(grabbedMention)
                return

            onDwHover(dw, event.clientX,event.clientY)
        })
        dw.elem.addEventListener('mousedown',(event)=>{
            if( lowestChangedLineSinceCompile !== Infinity) {
                changedLineIndicator.style.stroke = "rgb(255,255,255)"
                setTimeout(()=>{
                    changedLineIndicator.style.stroke = "rgb(180,180,180)"
                }, 500)
            }
            else {
                grabbedMention = hoveredMention
                hoveredMention = null

                let initialPosition = mv0
                initialPosition.fromVector(grabbedMention.viz.position)
                camera.frustum.far.projectOn(initialPosition, dragPlane)

                //project camera far plane onto initialPosition
            }
        })
    }
}