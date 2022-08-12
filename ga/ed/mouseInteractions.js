function initMouseInteractions() {
    let indicatedMention = null
    let grabbedDw = null // if this isn't null, indicatedMention is grabbed

    let rightClicking = false
    let dragOccurred = false
    let textareaGrabAddition = [0.,0.]

    oldClientToDwNdc = (dw) => {
        let clientRect = dw.elem.getBoundingClientRect()
        let xProportion = (clientXOld + textareaGrabAddition[0] - clientRect.x) / clientRect.width
        let yProportion = (clientYOld + textareaGrabAddition[1] - clientRect.y) / clientRect.height
        return [xProportion, yProportion]
    }

    let mouseRay = new Mv()
    getMouseRay = (dw) => {
        let [xProportion,yProportion] = oldClientToDwNdc(dw)

        let xPlane = mv3.fromLerp(camera.frustum.left, camera.frustum.right, xProportion)
        let yPlane = mv4.fromLerp(camera.frustum.bottom, camera.frustum.top, yProportion)

        meet(xPlane, yPlane, mouseRay)
        mouseRay.normalize()
        return mouseRay
    }

    let mouseAreaOld = null
    updateMentionVisibilitiesAndIndication = (mouseArea, userIndicationX, userIndicationY) => {
        //moving the mouse should not get rid of the caret's indication
        if(mouseArea === undefined)
            mouseArea = mouseAreaOld
        else
            mouseAreaOld = mouseArea

        if(userIndicationX === undefined) {
            userIndicationX = clientXOld
            userIndicationY = clientYOld
        }

        //this needs to happen before getHoveredMention because that depends on visibility
        forEachUsedMention((mention) => {
            mention.appearance.setVisibility(mentionVisibleDueToCaret(mention))
        })

        if(mouseArea === null)
            indicatedMention = null
        else if (mouseArea === textarea)
            indicatedMention = getIndicatedTextareaMention(userIndicationX, userIndicationY)
        else
            indicatedMention = mouseArea.getHoveredMention(userIndicationX, userIndicationY)

        if (indicatedMention !== null)
            indicatedMention.appearance.setVisibility(true)

        //if you only do this when indicatedMentionOld !== indicatedMention, you risk eg when you have just let go
        if (indicatedMention === null)
            hideHighlight()
        else
            indicatedMention.highlight()
    }

    function onMouseMove(mouseArea, event) {
        if (!rightClicking) {
            if(grabbedDw !== null) {

                //might be mention, uniform, or In
                //there's a javascript representation of the glsl data
                //the appearance, eg meshes, come from that
                //that's what the uniforms and overrides are too
                //so, make interfacing that data more generic
                //then you can put stuff into uniforms
                //neaten up this updateOverride horsecrap

                dragOccurred = true
                if (indicatedMention.variable.isIn) {
                    //dragging this does not change data, but selects among it
                }
                else {
                    indicatedMention.appearance.updateStateFromDrag(grabbedDw)
                    if( indicatedMention.variable.isUniform ) {
                        updateOverride(null)
                        indicatedMention.appearance.updateUniformFromState()
                    }
                    else
                        updateOverride(indicatedMention)

                    indicatedMention.appearance.updateAppearanceFromState()
                }
    
                updateMentionsFromRun((mention) => {
                    return mentionVisibleDueToCaret(mention)
                })

                //if you ever see dragging around looking ok, then when you let go it goes to shit
                //it might be that your adjustment of the state on the cpu side, after the round trip, is mangled

                indicatedMention.highlight()
            }
            else if(mouseArea !== document) {
                updateMentionVisibilitiesAndIndication(mouseArea, event.clientX, event.clientY)
            }
        }
        else {
            event.preventDefault()

            addToCameraLonLat(event.clientX - clientXOld, event.clientY - clientYOld)
            
            //we do NOT change hoveredmention, we merely update the lines
            if(indicatedMention !== null)
                indicatedMention.highlight()
        }

        renderAll()

        clientXOld = event.clientX
        clientYOld = event.clientY

        event.stopPropagation()
    }

    function onPotentialHoveredMentionGrab(event,dw) {
        if (indicatedMention === null || event.which !== 1 )
            return

        let fromTextarea = dw === undefined
        
        if (fromTextarea) {
            dw = indicatedMention.appearance.getTextareaManipulationDw()
            
            event.preventDefault()
            textareaGrabAddition = indicatedMention.appearance.getWindowCenter(dw)

            let wasOffscreen = textareaGrabAddition[0] === Infinity
            if(wasOffscreen)
                textareaGrabAddition = dw.worldToWindow(zeroVector)

            textareaGrabAddition[0] -= clientXOld
            textareaGrabAddition[1] -= clientYOld
        }
        else {
            textareaGrabAddition[0] = 0.
            textareaGrabAddition[1] = 0.
        }

        grabbedDw = dw

        indicatedMention.appearance.onGrab(dw)
    }

    document.addEventListener('mouseup',(event)=>{
        if (event.button === 2)
            rightClicking = false
            
        if(event.button !== 0 || grabbedDw === null)
            return
            
        grabbedDw = null

        if(!dragOccurred) //just clicked and let go
            return

        dragOccurred = false
        indicatedMention.appearance.onLetGo()
        updateOverride(null)
        
        if (!indicatedMention.variable.isUniform &&
            !indicatedMention.variable.isIn) {
            let [caretColumnIndex, caretLineIndex] = getCaretColumnAndLine() //done first since we're about to change stuff
            
            let newLine = "\n    " + indicatedMention.variable.name + " = " + 
                indicatedMention.appearance.getLiteralAssignmentFromState() + ";\n"
            let lines = textarea.value.split("\n")
            let pre  = lines.slice(0, indicatedMention.lineIndex + 1).join("\n")
            let post = lines.slice(indicatedMention.lineIndex + 1).join("\n")
    
            textarea.value = pre + newLine + post
            
            let newCaretPosition = -1
            if (caretLineIndex < indicatedMention.lineIndex)
                newCaretPosition = caretPositionOld
            else if (caretLineIndex === indicatedMention.lineIndex)
                newCaretPosition = pre.length + Math.min(caretColumnIndex, newLine.length)
            else if (caretLineIndex > indicatedMention.lineIndex)
                newCaretPosition = caretPositionOld + newLine.length

            // would be nice to move the caret to where the newly-created indicated mention now is
            //so you can see your handiwork
            
            setCaretPosition(newCaretPosition)

            updateSyntaxHighlighting()

            textarea.focus()

            compile()
            onCaretMove()
        }

        grabbedDw = null

        //be aware, an extra mousemove will happen. There is nothing you can do about this
    })

    document.addEventListener('mousedown', (event) => {
        if (event.button === 2)
            rightClicking = true

        // when you do this, it makes it so that clicking and unclicking creates a new line, which is annoying
        // onMouseMove(document, event)
    })

    textarea.addEventListener('mousedown', (event) => {
        if (event.button === 2)
            event.preventDefault()
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