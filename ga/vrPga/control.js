/*
    When selecting, to make it less annoying,
        could prioritize based on the bb volume

    TODO
        Hovering a thing shows its affecters
        Sculpting can create new things or add to what's already there, depending on whether your paint is touching it
        You can hold two and it shows you different ones you could create from them
        Change the way your hand movement changes vizBeingModified
            You grab the thing, and its arrow moves such that its tip is where you just grabbed. It is frozen
            You move your hand, and that creates a further, separate arrow
            AND another arrow which is your current motion composed
            This is a good idea because it emphasizes to the user how they should think about things:
                movements create arrows, composing arrows is how you control things generally

    If you're     holding a  thing in your other hand and you hold the paint button
        it adds to that object
    If you're NOT holding anything in your other hand and you hold the paint button,
        it makes a new object 
        Probably if you press the grab button while holding the paint button, you're now holding the new object
    If you were holding a transform, great, we're adding it to that transform
    If you were holding a point/line/plane, erm, maybe not

    Other hand:
        Top finger: create point, line, plane, transform... scalar (appears on a double cover plot). First three act as a rigid bodies
        Transformation: Grab in one place, move hand. Most important, do first! This is animation!
        They snap. Use analogue stick to flick to different ones to snap to. Push in to turn off snapping
        Translations are arrows
            But there's the line at infinity to help stabilize thm ofc
            Possibly the start and end of them should be connected to that line

    Mouse:
        Mouse wheel press is for rotating the camera
        Joystick is joystick
        Click is index finger button
        Right click is side button (probably "hold"/grab)
        "Rewind" is A
        "Forward" is B
        Pushing in joystick is pushing in joystick 
        Wheel is rotating
        You do have that one other button just behind the mouswheel

    You probably want a laser, but not sure yet, and it raises many questions

    Your "go to next snap" button, if there IS no snap, could just try to do shit with whatever's visible
 */

function initControl() {

    //debug examples
    {
        // var sclptable = new Sclptable()
        // sclptable.brushStroke(fl0.point(0., 1.2, 0., 1.))

        // testCircuits()

        // let viz1 = new DqViz(0xFF0000)
        // viz1.dq.copy(Translator(.2, 0., 0.))
        // comfortablePos(-.3, viz1.markupPos,0.)

        // let viz2 = new DqViz(0xFF00FF)
        // viz2.dq.copy(Translator(0., .15, 0.))
        // comfortablePos( 0., viz2.markupPos, 0.1)

        // let viz3 = new DqViz()
        // comfortablePos( .3, viz3.markupPos, 0.)
        // viz3.affecters[0] = viz2
        // viz3.affecters[1] = viz1
        // viz3.affecters[2] = 1

        // let viz4 = new DqViz()
        // viz4.markupPos.point(-.1, 1.2, 0.)
        // let axis = new Dq()
        // axis[4] = 1.
        // axis[1] = 1.2
        // axis[2] = -.6
        // axis.multiplyScalar(TAU/2. - .01, axis).exp(viz4.dq)
        // blankFunction = () => {
        //     // studyNum[0] = Math.sin(.02 * frameCount)
        //     // // studyNum[7] = Math.sin(.015 * frameCount+50)
        //     // axis.mul(studyNum,dq0).exp(viz4.dq)

        //     // axis.multiplyScalar(Math.sin(.02 * frameCount), viz4.dq)
        //     // viz4.dq[0] = -1.

        //     viz4.markupPos.point(.3 * (1. + Math.cos(frameCount * .01)), 1.2, 0.)
        // }
    }

    initButtonLabels()

    // document.addEventListener(`mouseRewind`, () => { log("yo") })

    let showMarkupVizes = false
    let oldViz  = new DqViz(0xFF0000, true, true)
    oldViz.visible = false
    let dispViz = new DqViz(0xFF0000, true, true)
    dispViz.visible = false
    let heldDqOnGrab = new Dq()

    let highlightee = null
    let vizBeingModified = null
    let holdIsWithRight = false
    let paintHandIsRight = -1
    let grabbHandIsRight  = -1
    let oddVersor = false

    let grabbee = null
    let paintee = null

    onHandButtonDown = (isTriggerButton, isSideButton, isRightHand) => {

        //make it so paintingButtonHeld is defined

        //trigger -> nothing -> paint
        //trigger -> other side -> even versor
        //side -> other trigger -> paint
        //side -> other side -> odd versor (later)
        //side -> nothing -> even versor
        
        if(paintee !== null && isTriggerButton )
            return //huh, or maybe you could paint with both
        if(isSideButton && grabbee === null && paintHandIsRight && isRightHand)
            return

        if (isSideButton && grabbee === null) {

            grabbHandIsRight = isRightHand

            if (highlightee && !paintee)
                grabbee = highlightee
            else if( paintee )
                grabbee = paintee
            else {
                grabbee = new DqViz()
                grabbee.markupPos.copy(handPosition)
            }

            if (grabbee.dq.isScalarMultipleOf(oneDq))
                grabbee.markupPos.copy(handPosition)
            
            oldViz.dq.copy(grabbee.dq)
            oldViz.markupPos.copy(grabbee.markupPos)
            oldViz.dq.sandwich(oldViz.markupPos, dispViz.markupPos)
            dispViz.dq.copy(oneDq)
            getHandDq(heldDqOnGrab)
        }
        else if (isSideButton && grabbee !== null) {

            oddVersor = true

        }
        else if(isTriggerButton) {

            paintHandIsRight = isRightHand

            let isHeldInOtherHand = grabbee && (
                ( grabbHandIsRight && !isRightHand) ||
                (!grabbHandIsRight &&  isRightHand) )
            if (isHeldInOtherHand) {
                vizPaintingOn = grabbee
            }
            else if(!grabbee) {
                // figure out which one to paint on
                paintee = highlightee
                if(paintee === null) {
                    paintee = new DqViz()
                    paintee.sclptable = new Sclptable()
                }
            }

        }

    }

    modificationSculptingHighlighting = () => {
        
        setLabels(paintee !== null, grabbee !== null, paintHandIsRight, grabbHandIsRight)

        //highlighting
        if (grabbee === null && paintee === null) {

            let [nearestSnappable, nearestSnappableDist] = getNearestSnappableToPt(handPosition, false)
            let [nearestSclptable, nearestSclptableDist] = getNearestSclptableToPt(handPosition)

            if(Math.min(nearestSnappableDist, nearestSclptableDist) > .2) {
                highlightee = null
                return
            }

            if (nearestSnappableDist < nearestSclptableDist)
                highlightee = nearestSnappable
            else if (nearestSclptable !== null)
                highlightee = nearestSclptable.dqViz
        }
        else {

            //grabbing
            if (grabbee !== null) {
                highlightee = grabbee

                let handDqCurrent = getHandDq(dq0)
                handDqCurrent.mulReverse(heldDqOnGrab, dispViz.dq)
                dispViz.dq.mul(oldViz.dq, grabbee.dq)
                grabbee.dq.normalize()
                
                snap(grabbee)

                if (showMarkupVizes) {
                    dispViz.visible = !dispViz.dq.equals(oneDq)
                    oldViz.visible = dispViz.visible
                }

                socket.emit("snappable", {
                    dq: grabbee.dq,
                    markupPos: grabbee.markupPos,
                    i: snappables.indexOf(grabbee)
                })
            }

            //painting
            if(paintee !== null) {
                highlightee = paintee
                hidePalette()
                paintee.sclptable.brushStroke()
            }
        }

    }

    onHandButtonUp = (isTriggerButton, isSideButton, isRightHand) => {

        if (paintee !== null && isTriggerButton && ((isRightHand && paintHandIsRight) || (!isRightHand && !paintHandIsRight))) {
            // toggleButtonsVisibility()
            paintee.sclptable.emitSelf()
            paintee = null
        }

        if (grabbee && isSideButton && ((isRightHand && holdIsWithRight) || (!isRightHand && !holdIsWithRight))) {

            if (grabbee.sclptable) {
                grabbee.dq
                    .getReverse(dq0)
                    .sandwich(
                        grabbee.dq.sandwich(grabbee.sclptable.com, fl0),
                        grabbee.markupPos)
            }

            grabbee = null

            dispViz.visible = false
            oldViz.visible = false
        }
    }

    //////////////////////
    // Helper functions //
    //////////////////////

    function interdependencyExists(a, b) {
        return a.dependsOn(b) || b.dependsOn(a)
    }

    deleteHeld = () => {

        if (vizBeingModified !== null) {
            vizBeingModified.dispose()
            vizBeingModified = null
        }
    }

    updateHighlighting = () => {

        // let dqVizWithCircuitShowing = highlightee || vizBeingModified
        // if (dqVizWithCircuitShowing === null)
        //     hideCircuit()
        // else
        //     showCircuit(dqVizWithCircuitShowing)

        if( vizBeingModified !== null)
            highlightee = vizBeingModified

        snappables.forEach( snappable => {

            snappable.boxHelper.visible = snappable === highlightee

            if (snappable.sclptable)
                snappable.sclptable.boxHelper.visible = snappable.boxHelper.visible
        })

        snappables.forEach(snappable => {
            snappable.circuitVisible =
                highlightee === null ?
                    false :
                    snappable === highlightee ||
                    interdependencyExists(snappable, highlightee)
        })
    }

    function getNearestSclptableToPt(pt) {
        
        let nearest = null
        let nearestDist = Infinity

        snappables.forEach(snappable => {

            let sclptable = snappable.sclptable
            if (snappable.sclptable === null)
                return

            if (sclptable.com[7] === 0.)
                return

            let normalizedCom = sclptable.getWorldCom(fl0).multiplyScalar(1. / fl0[7], fl0)

            let dist = pt.distanceToPt(normalizedCom)
            if (dist < nearestDist) {
                nearest = sclptable
                nearestDist = dist
            }
        })

        return [nearest, nearestDist]
    }

    function getNearestSnappableToPt(pt, includeSculptables) {

        let nearest = null
        let nearestDist = Infinity
        snappables.forEach(snappable => {

            if (!includeSculptables) {
                if (snappable.sclptable !== null)
                    return
            }

            snappable.getArrowTip(fl0)
            let dist = pt.distanceToPt(fl0)

            if (dist < nearestDist) {
                nearest = snappable
                nearestDist = dist
            }

        })

        return [nearest, nearestDist]
    }

    function getNearestVizToHand() {
        let [nearestSnappable, nearestSnappableDist] = getNearestSnappableToPt(handPosition, true)
        let [nearestSclptable, nearestSclptableDist] = getNearestSclptableToPt(handPosition)

        if (nearestSnappableDist === Infinity && nearestSclptableDist === Infinity)
            return null
        else
            return nearestSnappableDist < nearestSclptableDist ? nearestSnappable : nearestSclptable.dqViz
    }
}

//for SSC Joel:
/*
    For every object having a "position" and a "rotation" is a bad idea
    I could justify this in terms of classical physics,
        like the fact that while "torque about your center of mass" is a useful simplification for an undergrad,
        pure torque is very rare in the real world, so most angular momentum is NOT about an axis through the center of mass
        But it's more than that, it has made people dependent on the origin
 */