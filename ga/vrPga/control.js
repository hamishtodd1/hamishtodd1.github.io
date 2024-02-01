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

        let viz1 = new DqViz(0xFF0000)
        viz1.dq.copy(Translator(.2, 0., 0.))
        comfortableLookPos(-.3, viz1.markupPos,0.)

        let viz2 = new DqViz(0xFF00FF)
        viz2.dq.copy(Translator(0., .15, 0.))
        comfortableLookPos( 0., viz2.markupPos, 0.1)

        let viz3 = new DqViz()
        comfortableLookPos( .3, viz3.markupPos, 0.)
        viz3.affecters[0] = viz2
        viz3.affecters[1] = viz1
        viz3.affecters[2] = 1

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
    let oldVizes = [new DqViz( 0xFF0000, true, true ), new DqViz( 0xFF0000, true, true )]
    oldVizes[0].visible = false; oldVizes[1].visible = false;
    let dispVizes = [new DqViz(0xFF0000, true, true), new DqViz(0xFF0000, true, true)]
    dispVizes[0].visible = false; dispVizes[1].visible = false;
    let handDqOnGrabs = [new Dq(), new Dq()]
    let snappableDqOnGrabs = [new Dq(), new Dq()]

    let paintees = [null,null]
    let highlightees = [null,null]
    let grabbees = [null,null]
    let oddVersor = false

    onHandButtonDown = (isTriggerButton, isSideButton, focusHand) => {

        //make it so paintingButtonHeld is defined

        //trigger -> nothing -> paint
        //trigger -> other side -> even versor
        //side -> other trigger -> paint
        //side -> other side -> odd versor (later)
        //side -> nothing -> even versor

        let otherHand = 1-focusHand
        
        if ((grabbees[focusHand] !== null && isTriggerButton) ||
            (paintees[focusHand] !== null && isSideButton))
            return
            
        if ( isSideButton ) {

            grabbees[focusHand] = paintees[otherHand] || highlightees[focusHand]

            log(focusHand, grabbees )

            if (grabbees[RIGHT] !== null && grabbees[LEFT] !== null && grabbees[RIGHT] === grabbees[LEFT])
                oddVersor = true
            else {
                if( grabbees[focusHand] === null )
                    grabbees[focusHand] = new DqViz()

                if (grabbees[focusHand].dq.isScalarMultipleOf(oneDq))
                    getIndicatedHandPosition(focusHand, grabbees[focusHand].markupPos)

                handDqOnGrabs[focusHand].copy(hands[focusHand].dq)
                snappableDqOnGrabs[focusHand].copy(grabbees[focusHand].dq)

                oldVizes[focusHand].dq.copy(snappableDqOnGrabs[focusHand])
                oldVizes[focusHand].markupPos.copy(grabbees[focusHand].markupPos)
                oldVizes[focusHand].dq.sandwich(oldVizes[focusHand].markupPos, dispVizes[focusHand].markupPos)
                dispVizes[focusHand].dq.copy(oneDq)
            }
        }
        else if(isTriggerButton) {

            paintees[focusHand] = grabbees[otherHand] || paintees[otherHand] || highlightees[focusHand]
            if (paintees[focusHand] === null) {
                paintees[focusHand] = new DqViz()
                paintees[focusHand].sclptable = new Sclptable(paintees[focusHand])
            }
        }
    }

    movingPaintingHighlightingHandLabels = () => {

        // log(grabbees, highlightees)

        // setLabels(paintee !== null, grabbee !== null, paintHandIsRight, grabbHandIsRight)

        if (paintees[0] === null && paintees[1] === null)
            getPalletteInput()

        for(let hand = 0; hand < 2; ++hand) {

            /////////////////////
            // MOVING GRABBEES //
            /////////////////////
            if (grabbees[hand] !== null) {
                highlightees[hand] = grabbees[hand]

                // hands[hand].dq.mulReverse(handDqOnGrabs[hand], dispVizes[hand].dq)
                // dispVizes[hand].dq.mul(oldVizes[hand].dq, grabbees[hand].dq)
                let movementSinceGrab = hands[hand].dq.mulReverse(handDqOnGrabs[hand], dq0)
                movementSinceGrab.mul(snappableDqOnGrabs[hand], grabbees[hand].dq )
                grabbees[hand].dq.normalize()
                dispVizes[hand].dq.copy(movementSinceGrab)
                
                snap(grabbees[hand])

                if (showMarkupVizes) {
                    dispVizes[hand].visible = !dispVizes[hand].dq.equals(oneDq)
                    oldVizes[hand].visible = dispVizes[hand].visible
                }

                socket.emit("snappable", {
                    dqCoefficientsArray: grabbees[hand].dq,
                    i: snappables.indexOf(grabbees[hand])
                })
            }

            //////////////
            // PAINTING //
            //////////////
            if(paintees[hand] !== null) {
                highlightees[hand] = paintees[hand]
                hidePalette()

                paintees[hand].sclptable.brushStroke(getIndicatedHandPosition(hand,fl0))
            }

            //////////////////
            // HIGHLIGHTING //
            //////////////////
            if (grabbees[hand] === null && paintees[hand] === null) {

                let [nearest, nearestDistSq] = getNearest(hand) //getNearest(getIndicatedHandPosition(hand, fl0))

                if (nearestDistSq > .04)
                    highlightees[hand] = null
                else
                    highlightees[hand] = nearest

            }
        }

        //////////////////////////////
        // REACTING TO HIGHLIGHTING //
        //////////////////////////////

        snappables.forEach(snappable => {

            snappable.boxHelper.visible = highlightees.indexOf(snappable) !== -1

            if (snappable.sclptable)
                snappable.sclptable.boxHelper.visible = snappable.boxHelper.visible
        })

        snappables.forEach(snappable => {
            snappable.circuitVisible =
                highlightees.indexOf(snappable) !== -1 ||
                interdependencyExists(snappable, highlightees[0]) ||
                interdependencyExists(snappable, highlightees[1])
        })

        // let dqVizWithCircuitShowing = highlightee || vizBeingModified
        // if (dqVizWithCircuitShowing === null)
        //     hideCircuit()
        // else
        //     showCircuit(dqVizWithCircuitShowing)
    }
    
    onHandButtonUp = (isTriggerButton, isSideButton, focusHand) => {

        if (paintees[focusHand] !== null && isTriggerButton ) {
            // toggleButtonsVisibility()
            paintees[focusHand].sclptable.emitSelf()
            paintees[focusHand] = null
        }

        if (grabbees[focusHand] && isSideButton ) {

            if (grabbees[focusHand].sclptable) {
                grabbees[focusHand].dq
                    .getReverse(dq0)
                    .sandwich(
                        grabbees[focusHand].dq.sandwich(grabbees[focusHand].sclptable.com, fl0),
                        grabbees[focusHand].markupPos)
            }

            grabbees[focusHand] = null

            dispVizes[focusHand].visible = false
            oldVizes[focusHand].visible = false
        }

        if (oddVersor === true && isSideButton) {
            oddVersor = false
        }
    }

    //////////////////////
    // Helper functions //
    //////////////////////

    function interdependencyExists(a, b) {
        return a.dependsOn(b) || b.dependsOn(a)
    }

    deleteHeld = (focusHand) => {

        if (grabbees[focusHand] !== null) {
            grabbees[focusHand].dispose()
            grabbees[focusHand] = null
        }
    }

    let testPoint = new Fl()
    let joinPlane = new Fl()
    function getNearest(hand) {

        // debugFls[0].fl.copy(vrRight.laserPlane)
        // debugFls[0].markupPos.pointFromGibbsVec(vrRight.position)
        // debugFls[1].fl.copy(vrLeft.laserPlane)
        // debugFls[1].markupPos.pointFromGibbsVec(vrLeft.position)

        let nearest = null
        let nearestDistSq = Infinity
        snappables.forEach(snappable => {

            let distSq = Infinity
            
            testPoint.pointFromGibbsVec(snappable.boundingBox.getCenter(v1)).pointNormalize()
            if (true)//hands[hand].laserPlane.joinPt(testPoint)[0] > 0.)
                distSq = hands[hand].laserDq.joinPt(testPoint, joinPlane).eNormSq()

            // debugFls[2].fl.copy(testPoint)

            if (snappable.sclptable !== null) {
                
                if (snappable.sclptable.com[7] === 0.)
                    return

                snappable.sclptable.getWorldCom(testPoint).pointNormalize()
                debugFls[3].fl.copy(testPoint)

                if (true){//hands[hand].laserPlane.joinPt(testPoint)[0] > 0.) {
                    let sclptableDistSq = hands[hand].laserDq.joinPt(testPoint, joinPlane).eNormSq()
                    if (sclptableDistSq < distSq)
                        distSq = sclptableDistSq
                }
            }

            if (distSq < nearestDistSq) {
                nearest = snappable
                nearestDistSq = distSq
            }

        })

        return [nearest, nearestDistSq]
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