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
        // comfortableLookPos(-.3, viz1.markupPos,0.)

        // let viz2 = new DqViz(0xFF00FF)
        // viz2.dq.copy(Translator(0., .15, 0.))
        // comfortableLookPos( 0., viz2.markupPos, 0.1)

        // let viz3 = new DqViz()
        // comfortableLookPos( .3, viz3.markupPos, 0.)
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
    let dqOnGrab = new Dq()

    let highlightee = null
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
            return //huh, or maybe you could paint with both hands

        if (isSideButton && grabbee === null) {

            grabbHandIsRight = isRightHand ? 1 : 0

            if (highlightee && !paintee)
                grabbee = highlightee
            else if( paintee )
                grabbee = paintee
            else {
                grabbee = new DqViz()
                getIndicatedHandPosition(grabbHandIsRight,grabbee.markupPos)
            }

            if (grabbee.dq.isScalarMultipleOf(oneDq))
                getIndicatedHandPosition(grabbHandIsRight,grabbee.markupPos)
            
            oldViz.dq.copy(grabbee.dq)
            oldViz.markupPos.copy(grabbee.markupPos)
            oldViz.dq.sandwich(oldViz.markupPos, dispViz.markupPos)
            dispViz.dq.copy(oneDq)
            dqOnGrab.copy(grabbHandIsRight ? handRight.dq : handLeft.dq)
        }
        else if (isSideButton && grabbee !== null) {

            oddVersor = true

        }
        else if(isTriggerButton) {

            paintHandIsRight = isRightHand ? 1 : 0

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
                    paintee.sclptable = new Sclptable(paintee)
                }
            }

        }

    }

    movingPaintingHighlightingHandLabels = () => {
        
        setLabels(paintee !== null, grabbee !== null, paintHandIsRight, grabbHandIsRight)

        if (paintHandIsRight === -1)
            getPalletteInput()

        //highlighting
        if (grabbee === null && paintee === null) {

            let [nearestSclptableLeft,  nearestSclptableDistLeft ] = getNearestSclptableToPt(getIndicatedHandPosition(false, fl0))
            let [nearestSnappableLeft,  nearestSnappableDistLeft ] = getNearestSnappableToPt(getIndicatedHandPosition(false, fl0))
            let [nearestSclptableRight, nearestSclptableDistRight] = getNearestSclptableToPt(getIndicatedHandPosition(true, fl0))
            let [nearestSnappableRight, nearestSnappableDistRight] = getNearestSnappableToPt(getIndicatedHandPosition(true, fl0))
            let nearestSnappableDist = nearestSnappableDistRight < nearestSnappableDistLeft ? nearestSnappableDistRight : nearestSnappableDistLeft
            let nearestSclptableDist = nearestSclptableDistRight < nearestSclptableDistLeft ? nearestSclptableDistRight : nearestSclptableDistLeft
            let nearestSnappable = nearestSnappableDistRight < nearestSnappableDistLeft ? nearestSnappableRight : nearestSnappableLeft
            let nearestSclptable = nearestSclptableDistRight < nearestSclptableDistLeft ? nearestSclptableRight : nearestSclptableLeft

            let maxDist = .2
            if(nearestSclptableDistLeft > maxDist && nearestSclptableDistRight > maxDist && nearestSnappableDistLeft > maxDist && nearestSnappableDistRight > maxDist) {
                highlightee = null
                return
            }
            else {
                if (nearestSnappableDist < nearestSclptableDist)
                    highlightee = nearestSnappable
                else if (nearestSclptable !== null)
                    highlightee = nearestSclptable.dqViz
            }

        }
        else {

            //grabbing
            if (grabbee !== null) {
                highlightee = grabbee

                let handDqCurrent = grabbHandIsRight ? handRight.dq : handLeft.dq
                handDqCurrent.mulReverse(dqOnGrab, dispViz.dq)
                dispViz.dq.mul(oldViz.dq, grabbee.dq)
                grabbee.dq.normalize()
                
                snap(grabbee)

                if (showMarkupVizes) {
                    dispViz.visible = !dispViz.dq.equals(oneDq)
                    oldViz.visible = dispViz.visible
                }

                socket.emit("snappable", {
                    dqCoefficientsArray: grabbee.dq,
                    i: snappables.indexOf(grabbee)
                })
            }

            //painting
            if(paintee !== null) {
                highlightee = paintee
                hidePalette()

                paintee.sclptable.brushStroke(getIndicatedHandPosition(paintHandIsRight,fl0))
            }
        }

    }

    onHandButtonUp = (isTriggerButton, isSideButton, isRightHand) => {

        if (paintee !== null && isTriggerButton && ((isRightHand && paintHandIsRight===1) || (!isRightHand && paintHandIsRight === 0))) {
            // toggleButtonsVisibility()
            paintee.sclptable.emitSelf()
            paintee = null
            paintHandIsRight = -1
        }

        if (grabbee && isSideButton && ((isRightHand && grabbHandIsRight) || (!isRightHand && !grabbHandIsRight))) {

            if (grabbee.sclptable) {
                grabbee.dq
                    .getReverse(dq0)
                    .sandwich(
                        grabbee.dq.sandwich(grabbee.sclptable.com, fl0),
                        grabbee.markupPos)
            }

            grabbee = null
            oddVersor = false

            dispViz.visible = false
            oldViz.visible = false
            grabbHandIsRight = -1
        }
    }

    //////////////////////
    // Helper functions //
    //////////////////////

    function interdependencyExists(a, b) {
        return a.dependsOn(b) || b.dependsOn(a)
    }

    deleteHeld = () => {

        if (grabbee !== null) {
            grabbee.dispose()
            grabbee = null
        }
    }

    updateHighlighting = () => {

        // let dqVizWithCircuitShowing = highlightee || vizBeingModified
        // if (dqVizWithCircuitShowing === null)
        //     hideCircuit()
        // else
        //     showCircuit(dqVizWithCircuitShowing)

        if( grabbee !== null)
            highlightee = grabbee

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

    let normalizedCom = new Fl()
    function getNearestSclptableToPt(pt) {
        
        let nearest = null
        let nearestDist = Infinity

        snappables.forEach(snappable => {

            let sclptable = snappable.sclptable
            if (snappable.sclptable === null)
                return

            if (sclptable.com[7] === 0.)
                return

            sclptable.getWorldCom(normalizedCom).multiplyScalar(1. / normalizedCom[7], normalizedCom)

            let dist = pt.distanceToPt(normalizedCom)
            if (dist < nearestDist) {
                nearest = sclptable
                nearestDist = dist
            }
        })

        return [nearest, nearestDist]
    }

    function getNearestSnappableToPt(pt) {

        let nearest = null
        let nearestDist = Infinity
        snappables.forEach(snappable => {

            if (snappable.sclptable !== null)
                return

            snappable.getArrowTip(fl0)
            let dist = pt.distanceToPt(fl0)

            if (dist < nearestDist) {
                nearest = snappable
                nearestDist = dist
            }

        })

        return [nearest, nearestDist]
    }
}

//for SSC Joel:
/*
    For every object having a "position" and a "rotation" is a bad idea
    I could justify this in terms of classical physics,
        while "torque about your center of mass" is a useful simplification for an undergrad,
        pure torque is very rare in the real world, so most angular momentum is NOT about an axis through the center of mass
        But it's more than that, it has made people dependent on the origin
 */