function initMouseInteractions() {
    let style = window.getComputedStyle(textarea)
    let lineHeight = parseInt(style.lineHeight)
    let characterWidth = parseInt(window.getComputedStyle(textMeasurer).width) / 40.
    let textAreaOffset = parseInt(style.padding) + parseInt(style.margin) // can add some fudge to this if you like
    
    let grabbedMention = null
    let grabbedDw = null

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

        if(mouseArea === null)
            hoveredMention = null
        else if (mouseArea === textarea)
            hoveredMention = getTextAreaHoveredMention(clientX, clientY)
        else {
            // debugger
            hoveredMention = mouseArea.getHoveredMention(clientX, clientY)
        }
        // log(hoveredMention)

        mentions.forEach((mention) => {
            let visibility = mention.presenceLevel === PRESENCE_LEVEL_CONFIRMED &&
                (mention === hoveredMention || mentionVisibleDueToCaret(mention))

            // if (visibility)log(mention.variable.name)
            mention.setVisibility(visibility)
        })

        let visibilityIndex = 0
        forVizDws( (dw) => {
            let hasMentionChild = false
            dw.scene.children.every((child) => {
                if (child.visible === true && dw.nonMentionChildren.indexOf(child) === -1)
                    hasMentionChild = true

                return !hasMentionChild
            })

            if (hasMentionChild) {
                dw.elem.style.display = ''
                dw.setVerticalPosition(visibilityIndex++)
            }
            else
                dw.elem.style.display = 'none'
        })

        if (hoveredMention === null)
            hideHighlight()
        else
            hoveredMention.highlight()
    }

    let rightClicking = false

    function onMouseEvent(mouseArea, event) {
        if(event.button === 2 ) {
            if( event.type === 'mousedown')
                rightClicking = true
            else if (event.type === 'mouseup')
                rightClicking = false
        }
        if (event.type === 'mouseup' && grabbedMention !== null) {
            let newLine = grabbedMention.getReassignmentText()

            let lines = textarea.value.split("\n")
            let pre = lines.slice(0, grabbedMention.lineIndex + 1).join("\n")
            let post = lines.slice(grabbedMention.lineIndex + 1).join("\n")

            textarea.value = pre + newLine + post
            updateSyntaxHighlighting(textarea.value)
            compile()

            grabbedMention = null
            grabbedDw = null

            let newCaretPosition = textarea.value.length - post.length - 1
            textarea.focus()
            textarea.setSelectionRange(newCaretPosition, newCaretPosition)
            //current bug:
            //that triggers the selection change event
            //but, it's still the case that you need to move the mouse again to make the shit from the previous line disappear
        }

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

    function addMousemoveMouseup(area) {
        let elem = area.elem ? area.elem : area
        elem.addEventListener('mousemove', (event) => onMouseEvent(area, event))
        elem.addEventListener('mouseup', (event) => onMouseEvent(area, event))
    }
    
    textarea.addEventListener('mousedown', (event) => onMouseEvent(textarea, event))
    addMousemoveMouseup(textarea)
    
    document.addEventListener('mousedown', (event) => onMouseEvent(document, event))
    addMousemoveMouseup(document)
    
    forVizDws( (dw) => {
        dw.elem.addEventListener('mousedown', (event)=>{onDwClick(dw,event)})
        addMousemoveMouseup(dw)
    })

    textarea.addEventListener('scroll',    (event) => onMouseEvent(textarea, event))
    //and one day, scrolling = zooming for dws!
}