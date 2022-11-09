function initMouseInteractions() {
    let indicatedMention = null
    let grabbedDw = null // if this isn't null, indicatedMention is grabbed

    let rightClicking = false
    let dragOccurred = false
    let textareaGrabAddition = [0.,0.]
    let raycaster = new THREE.Raycaster()

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

    let threeRay = new THREE.Ray()
    let mouseRayDirection = new Mv()
    getMouseThreeRay = (dw) => {
        let mouseRay = getMouseRay(dw)
        meet(e0, mouseRay, mouseRayDirection).toVector(threeRay.direction)
        threeRay.direction.normalize()

        threeRay.origin.copy(camera.position)

        return threeRay
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

        appearanceTypes.forEach((at) => {
            at.appearances.forEach((a) => {
                a.setVisibility(false)
            })
        })
        forEachUsedMention( (mention) => {
            //we just made all invisible. But some appearances are for multiple mentions.
            if (!mention.appearance.visible) {
                let visibility = mentionVisibleDueToCaret(mention)
                if (visibility && !mention.appearance.visible)
                    mention.appearance.setVisibility(true)
            }
        })

        if(mouseArea === null)
            indicatedMention = null
        else if (mouseArea === textarea)
            indicatedMention = getIndicatedTextareaMention(userIndicationX, userIndicationY)
        else
            indicatedMention = mouseArea.getHoveredMention(userIndicationX, userIndicationY)

        if (indicatedMention !== null)
            indicatedMention.appearance.setVisibility(true)
    }

    updateHighlight = () => {
        if (indicatedMention === null)
            hideHighlight()
        else
            indicatedMention.highlight()
    }

    function onMouseMove(mouseArea, event) {
        if (!rightClicking) {
            if(grabbedDw !== null) {
                dragOccurred = true

                if (indicatedMention.variable.isUniform)
                    indicatedMention.appearance.updateStateFromDrag(grabbedDw) 
                else if(indicatedMention.variable.isIn) {
                    let mouseRayBiv = biv0.fromMv(getMouseRay(dws.untransformed))

                    let attri = dws.untransformed.getInitialMeshAttributes().position
                    let closestDist = Infinity
                    let closestIndex = -1
                    for (let i = 0, il = attri.count; i < il; ++i) {
                        mv0.point(attri.getX(i), attri.getY(i), attri.getZ(i), 1.)
                        let dist = mouseRayBiv.distanceToPoint(mv0)
                        if(dist < closestDist) {
                            if(camera.pointInFront(mv0)) {
                                closestDist = dist
                                closestIndex = i
                            }
                        }
                    }

                    if (closestIndex !== -1)
                        setInIndex(closestIndex)
                }
                else {
                    indicatedMention.appearance.updateStateFromDrag(grabbedDw)
                    updateOverride(indicatedMention)
                    //that view of things where the dragged appearance is NOT about showing the state
                    //but instead its own thing, and when you let go it may be changed
                    //that's probably the right idea
                }
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
        
        if( !indicatedMention.variable.isUniform &&
            !indicatedMention.variable.isIn ) {
            let [caretColumnIndex, caretLineIndex] = getCaretColumnAndLine() //done first since we're about to change stuff
            
            let lines = textarea.value.split("\n")
            let indicatedMentionLineText = lines[indicatedMention.lineIndex]
            let numSpaces = 0
            for (let i = 0, il = indicatedMentionLineText.length; i < il; ++i) {
                if (indicatedMentionLineText[i] === " ")
                    ++numSpaces
                else
                    break
            }
            
            let pre  = lines.slice(0, indicatedMention.lineIndex + 1).join("\n")
            let post = lines.slice(indicatedMention.lineIndex + 1).join("\n")
            
            let newLine = "\n  " + " ".repeat(numSpaces) + indicatedMention.getFullName() + " = " + 
                indicatedMention.appearance.getLiteralAssignmentFromState() + ";\n"
            textarea.value = pre + newLine + post
            
            let newCaretPosition = -1
            if (caretLineIndex < indicatedMention.lineIndex) {
                // newCaretPosition = caretPositionOld
                //no, you probably want to admire your handiwork:
                newCaretPosition = pre.length + numSpaces + 2 //puts you inside the mention
            }
            else if (caretLineIndex === indicatedMention.lineIndex)
                newCaretPosition = pre.length + Math.min(caretColumnIndex, newLine.length-1)
            else if (caretLineIndex > indicatedMention.lineIndex)
                newCaretPosition = caretPositionOld + newLine.length-1

            // would be nice to move the caret to where the newly-created indicated mention now is
            //so you can see your handiwork
            
            setCaretPosition(newCaretPosition)

            updateSyntaxHighlighting()

            textarea.focus()

            compile(false)
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
        if (event.button === 2)
            event.preventDefault()
        onPotentialHoveredMentionGrab( event )
    })
    
    textarea.addEventListener('wheel', (event) => {
        onMouseMove(textarea, event)
        event.stopPropagation()
    })
    textarea.addEventListener('mousemove', (event) => onMouseMove(textarea, event))
    document.addEventListener('mousemove', (event) => onMouseMove(document, event))
    forNonFinalDws( (dw) => {
        dw.elem.addEventListener('mousedown', (event) => {
            onPotentialHoveredMentionGrab( event, dw)
        })
        dw.elem.addEventListener('mousemove', (event) => onMouseMove(dw, event))
    })
}