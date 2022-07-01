function initMouseInteractions() {
    let indicatedMention = null
    let grabbedDw = null // if this isn't null, indicatedMention is grabbed

    let rightClicking = false

    let dragOccurred = false

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

        forEachUsedMention((mention) => {
            mention.setVisibility(mentionVisibleDueToCaret(mention))
        })

        if(mouseArea === null)
            indicatedMention = null
        else if (mouseArea === textarea)
            indicatedMention = getIndicatedTextareaMention(userIndicationX, userIndicationY)
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
                dragOccurred = true
                indicatedMention.overrideFromDrag(grabbedDw,event)
    
                forEachUsedMention((mention) => {
                    let visible = mentionVisibleDueToCaret(mention) || mention === indicatedMention
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

    function onPotentialHoveredMentionGrab(event,dw) {
        if (indicatedMention === null || event.which !== 1 )
            return

        let fromTextarea = dw === undefined
        
        if (fromTextarea) {
            dw = indicatedMention.getTextareaManipulationDw()
            
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

    document.addEventListener('mouseup',(event)=>{
        if (event.button === 2)
            rightClicking = false
        
        if (event.button === 0 && dragOccurred) {
            dragOccurred = false
            updateOverride(null)
            
            let newLine = "\n    " + indicatedMention.getReassignmentNew(false) + ";\n"
            let lines = textarea.value.split("\n")
            let pre  = lines.slice(0, indicatedMention.lineIndex + 1).join("\n")
            let post = lines.slice(indicatedMention.lineIndex + 1).join("\n")
            
            textarea.value = pre + newLine + post
            updateSyntaxHighlighting()

            grabbedDw = null
            indicatedMention = null

            let newCaretPosition = textarea.value.length - post.length - 1
            textarea.focus()
            textarea.setSelectionRange(newCaretPosition, newCaretPosition)

            compile()
            onCaretMove()
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
        onPotentialHoveredMentionGrab( event )
    })
    
    textarea.addEventListener('scroll', (event) => onMouseMove(textarea, event))
    textarea.addEventListener('mousemove', (event) => onMouseMove(textarea, event))
    document.addEventListener('mousemove', (event) => onMouseMove(document, event))
    forVizDws( (dw) => {
        dw.elem.addEventListener('mousedown', (event) => {
            onPotentialHoveredMentionGrab( event, dw)
        })
        dw.elem.addEventListener('mousemove', (event) => onMouseMove(dw, event))
    })
}