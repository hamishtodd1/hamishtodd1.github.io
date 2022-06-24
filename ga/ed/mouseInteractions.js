function initMouseInteractions() {
    let indicatedMention = null
    let grabbedDw = null // if this isn't null, indicatedMention is grabbed

    let rightClicking = false

    let textareaGrabAddition = [0.,0.]
    getAdjustedClient = () => {
        return [
            oldClientX + textareaGrabAddition[0], 
            oldClientY + textareaGrabAddition[1]
        ]
    }

    let mouseRay = new Mv()
    getMouseRay = (dw) => {
        let [xProportion,yProportion] = dw.oldClientToProportion()

        let xPlane = mv3.fromLerp(camera.frustum.left, camera.frustum.right, xProportion)
        let yPlane = mv4.fromLerp(camera.frustum.bottom, camera.frustum.top, yProportion)

        meet(xPlane, yPlane, mouseRay)
        mouseRay.normalize()
        return mouseRay
    }

    let mouseAreaOld = null
    updateMentionVisibilitiesAndIndication = (mouseArea, userIndicationX, userIndicationY) => {
        //moving the mouse should not get rid of the caret's indication
        let indicatedMentionOld = indicatedMention

        if(mouseArea === undefined)
            mouseArea = mouseAreaOld
        else
            mouseAreaOld = mouseArea

        if(userIndicationX === undefined) {
            userIndicationX = oldClientX
            userIndicationY = oldClientY
        }

        mentions.forEach((mention) => {
            let visibility = mention.presenceLevel === PRESENCE_LEVEL_CONFIRMED && mentionVisibleDueToCaret(mention)
            mention.setVisibility(visibility)
        })

        if(mouseArea === null)
            indicatedMention = null
        else if (mouseArea === textarea)
            indicatedMention = getClosestTextAreaMention(userIndicationX, userIndicationY)
        else
            indicatedMention = mouseArea.getHoveredMention(userIndicationX, userIndicationY)
            
        if (indicatedMention !== null)
            indicatedMention.setVisibility(true)

        if(indicatedMentionOld !== indicatedMention) {
            if (indicatedMention === null)
                hideHighlight()
            else
                indicatedMention.highlight()
        }
    }

    function onMouseMove(mouseArea, event) {
        if (!rightClicking) {
            if(grabbedDw !== null) {
                indicatedMention.overrideFromDrag(grabbedDw,event)
    
                mentions.forEach((mention) => {
                    let visible = mention.presenceLevel === PRESENCE_LEVEL_CONFIRMED && (mentionVisibleDueToCaret(mention) || mention === indicatedMention )
                    if (visible)
                        mention.updateFromShader()
                })

                indicatedMention.highlight()
            }
            else if(mouseArea !== document)
                updateMentionVisibilitiesAndIndication(mouseArea, event.clientX, event.clientY)
        }
        else {
            event.preventDefault()

            addToCameraLonLat(event.clientX - oldClientX, event.clientY - oldClientY)
            
            //we do NOT change hoveredmention, we merely update the lines
            if(indicatedMention !== null)
                indicatedMention.highlight()
        }

        renderAll()

        oldClientX = event.clientX
        oldClientY = event.clientY

        event.stopPropagation()
    }

    function onHoveredMentionGrab(dw,event,fromTextArea) {
        
        // if (lowestChangedLineSinceCompile !== Infinity) {
        //     //you've changed it? This is to let them know no editing from the window allowed
        //     $changedLineIndicator.style.stroke = "rgb(255,255,255)"
        //     setTimeout(() => {
        //         $changedLineIndicator.style.stroke = "rgb(180,180,180)"
        //     }, 350)
        // }
        // else 
        
        if (event.which === 1 && lowestChangedLineSinceCompile === Infinity) {
            if (fromTextArea) {
                event.preventDefault()
                textareaGrabAddition = indicatedMention.getCanvasPosition(dw)
                textareaGrabAddition[0] -= oldClientX
                textareaGrabAddition[1] -= oldClientY
            }
            else {
                textareaGrabAddition[0] = 0.
                textareaGrabAddition[1] = 0.
            }

            grabbedDw = dw

            indicatedMention.onGrab(dw)
        }
    }

    document.addEventListener('mouseup',(event)=>{
        if (event.button === 2)
            rightClicking = false
        
        if (event.button === 0 && grabbedDw !== null) {
            updateOverride(null)
            
            let newLine = "\n    " + indicatedMention.getReassignmentNew(false) + ";\n"
            let lines = textarea.value.split("\n")
            let pre  = lines.slice(0, indicatedMention.lineIndex + 1).join("\n")
            let post = lines.slice(indicatedMention.lineIndex + 1).join("\n")
            
            textarea.value = pre + newLine + post
            updateSyntaxHighlighting(textarea.value)

            grabbedDw = null
            indicatedMention = null

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

    document.addEventListener('mousedown', (event) => {
        if (event.button === 2)
            rightClicking = true

        // when you do this, it makes it so that clicking and unclicking creates a new line, which is annoying
        // onMouseMove(document, event)
    })

    textarea.addEventListener('mousedown', (event) => {
        if ( indicatedMention !== null )
            onHoveredMentionGrab(indicatedMention.textareaManipulationDw, event, true)
    })
    
    textarea.addEventListener('scroll', (event) => onMouseMove(textarea, event))
    textarea.addEventListener('mousemove', (event) => onMouseMove(textarea, event))
    document.addEventListener('mousemove', (event) => onMouseMove(document, event))
    forVizDws( (dw) => {
        dw.elem.addEventListener('mousedown', (event) => {
            if(indicatedMention!==null)
                onHoveredMentionGrab(dw,event,false)
        })
        dw.elem.addEventListener('mousemove', (event) => onMouseMove(dw, event))
    })
}