function initMouseInteractions() {
    let style = window.getComputedStyle(textarea)
    let lineHeight = parseInt(style.lineHeight)
    let characterWidth = parseInt(window.getComputedStyle(textMeasurer).width) / 40.
    let textAreaOffset = parseInt(style.padding) + parseInt(style.margin) // can add some fudge to this if you like
    
    let grabbedMention = null
    let grabbedDw = null

    let rightClicking = false

    let mouseRay = new Mv()
    getMouseRay = (dw) => {
        let clientRect = dw.elem.getBoundingClientRect()
        let xProportion = (oldClientX - clientRect.x) / clientRect.width
        let yProportion = (oldClientY - clientRect.y) / clientRect.height

        let xPlane = mv3.fromLerp(camera.frustum.left, camera.frustum.right, xProportion)
        let yPlane = mv4.fromLerp(camera.frustum.bottom, camera.frustum.top, yProportion)

        meet(xPlane, yPlane, mouseRay)
        mouseRay.normalize()
        return mouseRay
    }

    lineToScreenY = (line) => {
        return line * lineHeight + textAreaOffset - textarea.scrollTop
    }
    updateHorizontalBounds = (index, nameLength, target) => {
        target.x = index * characterWidth + textAreaOffset

        target.w = nameLength * characterWidth
    }

    function getTextAreaHoveredMention(clientX, clientY) {
        let res = mentions.find((mention) => {
            if (mention.presenceLevel === PRESENCE_LEVEL_DELETED ||
                mention.lineIndex > lowestChangedLineSinceCompile)
                return false

            let mb = mention.horizontalBounds
            let mby = lineToScreenY(mention.lineIndex)
            let mouseInBox =
                mb.x <= clientX && clientX < mb.x + mb.w &&
                mby  <= clientY && clientY < mby + lineHeight

            return mouseInBox
        })

        return res === undefined ? null : res
    }

    let mouseAreaOld = null
    updateHighlightingAndDws = (mouseArea,clientX,clientY) => {
        if(mouseArea === undefined)
            mouseArea = mouseAreaOld
        else
            mouseAreaOld = mouseArea

        if(clientX === undefined) {
            clientX = oldClientX
            clientY = oldClientY
        }

        mentions.forEach((mention) => {
            let visibility = mention.presenceLevel === PRESENCE_LEVEL_CONFIRMED && mentionVisibleDueToCaret(mention)
            mention.setVisibility(visibility)
        })

        if(mouseArea === null)
            hoveredMention = null
        else if (mouseArea === textarea)
            hoveredMention = getTextAreaHoveredMention(clientX, clientY)
        else
            hoveredMention = mouseArea.getHoveredMention(clientX, clientY)

        if(hoveredMention !== null)
            hoveredMention.setVisibility(true)

        let visibilityIndex = 0
        forVizDws( (dw) => {
            let hasMentionChild = false
            dw.scene.children.every((child) => {
                if (child.visible === true && dw.nonMentionChildren.indexOf(child) === -1)
                    hasMentionChild = true

                return !hasMentionChild
            })

            // if (hasMentionChild) {
            //     dw.elem.style.display = ''
            //     dw.setVerticalPosition(visibilityIndex++)
            // }
            // else
            //     dw.elem.style.display = 'none'
        })

        if (hoveredMention === null)
            hideHighlight()
        else
            hoveredMention.highlight()
    }

    function onMouseMove(mouseArea, event) {
        if (!rightClicking) {
            if(grabbedDw !== null) {
                grabbedMention.respondToDrag(grabbedDw)
                updateOverride(grabbedMention)
    
                grabbedMention.highlight()
            }
            else if(mouseArea !== document)
                updateHighlightingAndDws(mouseArea, event.clientX, event.clientY)
        }
        else {
            event.preventDefault()

            addToCameraLonLat(event.clientX - oldClientX, event.clientY - oldClientY)
            
            if(hoveredMention !== null)
                hoveredMention.highlight()
        }

        oldClientX = event.clientX
        oldClientY = event.clientY

        event.stopPropagation()
    }

    function onDwClick(dw,event) {
        if (lowestChangedLineSinceCompile !== Infinity) {
            //you've changed it? This is to let them know no editing from the window allowed
            $changedLineIndicator.style.stroke = "rgb(255,255,255)"
            setTimeout(() => {
                $changedLineIndicator.style.stroke = "rgb(180,180,180)"
            }, 350)
        }
        else if (event.which === 1 && hoveredMention !== null) {
            grabbedMention = hoveredMention
            grabbedDw = dw

            grabbedMention.onGrab(dw)
        }
    }

    document.addEventListener('mousedown',(event)=>{
        if (event.button === 2) 
            rightClicking = true
        
        onMouseMove(document,event)
    })
    document.addEventListener('mouseup',(event)=>{
        if (event.button === 2)
            rightClicking = false
        
        if (event.button === 0 && grabbedMention !== null) {
            let newLine = grabbedMention.getReassignmentText()
            
            let lines = textarea.value.split("\n")
            let pre = lines.slice(0, grabbedMention.lineIndex + 1).join("\n")
            let post = lines.slice(grabbedMention.lineIndex + 1).join("\n")
            
            textarea.value = pre + newLine + post
            updateSyntaxHighlighting(textarea.value)

            grabbedMention = null
            grabbedDw = null
            hoveredMention = null

            let newCaretPosition = textarea.value.length - post.length - 1
            textarea.focus()
            textarea.setSelectionRange(newCaretPosition, newCaretPosition)

            compile()
            onCaretMove()
            
            //possibly go back to just all windows visible
            //but if not that, would be nice not to have the ones already visible move when you hover
        }

        //be aware, an extra mousemove will happen. There is nothing you can do about this
    })

    textarea.addEventListener('scroll', (event) => onMouseMove(textarea, event))
    textarea.addEventListener('mousemove', (event) => onMouseMove(textarea, event))
    document.addEventListener('mousemove', (event) => onMouseMove(document, event))
    
    forVizDws( (dw) => {
        dw.elem.addEventListener('mousedown', (event) => onDwClick(dw,event))
        dw.elem.addEventListener('mousemove', (event) => onMouseMove(dw, event))
    })
}