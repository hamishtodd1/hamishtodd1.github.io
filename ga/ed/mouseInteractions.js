function initMouseInteractions() {
    let grabbedMention = null
    
    var characterWidth = parseInt(window.getComputedStyle(textMeasurer).width) / 40.

    let grabbedDw = null

    document.addEventListener('mouseup',(event)=>{
        if(grabbedMention !== null) {

            let newLine = grabbedMention.getReassignmentText()

            //so that you can see things respond in real time, a better situation would be:
            //you have a single array of floats that is a uniform, called "override"
            //and another, an integer that is lineThatIsAffectedByOverride
            //a = b + c; if(lineToOverride == 10) a[0] = override[0];a[1] = override[1]; ...

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
            grabbedDw = null
        }

        updateBasedOnCaret()
    })

    let mouseRay = new Mv()
    getMouseRay = (dw) => {
        let clientRect = dw.elem.getBoundingClientRect()
        let xProportion = (oldClientX - clientRect.x) / clientRect.width
        let yProportion = (oldClientY - clientRect.y) / clientRect.height

        let xPlane = mv3.fromLerp(camera.frustum.left, camera.frustum.right, xProportion)
        let yPlane = mv4.fromLerp(camera.frustum.bottom, camera.frustum.top, yProportion)

        meet(yPlane, xPlane, mouseRay)
        mouseRay.normalize()
        return mouseRay
    }
    
    document.addEventListener('mousemove', (event) => {       
        if (grabbedMention !== null )
            grabbedMention.respondToDrag(grabbedDw)
    })

    let style = window.getComputedStyle(textarea)
    let lineHeight = parseInt(style.lineHeight)

    let textAreaOffset = parseInt(style.padding) + parseInt(style.margin) // can add some fudge to this if you like

    let svgLines = [$labelLine, $labelSide1, $labelSide2, $labelSide3, $labelSide4]
    setSvgHighlightColor = (c) => {
        svgLines.forEach((svgLine) => { 
            svgLine.style.stroke = "rgb(" + c.r * 255. + "," + c.g * 255. + "," + c.b * 255. + ")" 
        })
    }

    lineToScreenY = (line) => {
        return line * lineHeight + textAreaOffset - textarea.scrollTop
    }
    updateHorizontalBounds = (index, nameLength, target) => {
        target.x = index * characterWidth + textAreaOffset

        target.w = nameLength * characterWidth
    }

    function highlightMention(mention) {
        hoveredMention = mention

        mention.highlight()
    }

    function resetHover() {
        hoveredMention = null
        svgLines.forEach((svgLine) => { setSvgLine(svgLine, -10, -10, -10, -10) })
    }

    function updateTextAreaHover(clientX,clientY) {

        resetHover()

        mentions.every((mention) => {
            if( mention.presenceLevel === PRESENCE_LEVEL_DELETED ||
                mention.lineIndex > lowestChangedLineSinceCompile )
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

        resetHover()

        let closestIndex = -1
        let closestDist = Infinity
        mentions.forEach((mention,i) => {
            if (!mention.isVisibleInDw(dw) )
                return

            let [elemX, elemY] = mention.getCanvasPosition(dw)
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
            if(grabbedMention !== null)
                return

            onDwHover(dw, event.clientX,event.clientY)
        })
        dw.elem.addEventListener('mousedown',(event)=>{
            if( lowestChangedLineSinceCompile !== Infinity) {
                $changedLineIndicator.style.stroke = "rgb(255,255,255)"
                setTimeout(()=>{
                    $changedLineIndicator.style.stroke = "rgb(180,180,180)"
                }, 500)
            }
            else if (event.which === 1 && hoveredMention !== null ) {
                grabbedMention = hoveredMention
                grabbedDw = dw
                resetHover()

                grabbedMention.onGrab()
            }
        })
    }
}