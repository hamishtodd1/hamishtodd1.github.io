/*
    When selecting, to make it less annoying,
        could prioritize based on the bb volume

    TODO
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

    initButtonLabels()
    initControlHelpers()

    const paintees = [null, null]
    const highlightees = [null, null]

    const handsHoldingOdd = [false, false]
    let oddGrabbee = null
    const rightFl = new Fl()

    const evenGrabbees = [null, null]
    const rotationPart = new DqViz(0xFF0000, true, true)
    const translationPart = new DqViz(0xFF0000, true, true)
    translationPart.scaleAxisRadius(.95)
    rotationPart.scaleAxisRadius(.95)
    rotationPart.visible = false
    translationPart.visible = false
    let rotationFirst = true

    let showMarkupVizes = true
    let oldDqVizes = [new DqViz( 0xFF0000, true, true ), new DqViz( 0xFF0000, true, true )]
    oldDqVizes[0].visible = false; oldDqVizes[1].visible = false;
    let movementSinceGrabViz = [new DqViz(0xFF0000, true, true), new DqViz(0xFF0000, true, true)]
    movementSinceGrabViz[0].visible = false; movementSinceGrabViz[1].visible = false;

    let handDqOnGrabs = [new Dq(), new Dq()]
    let snappableDqOnGrabs = [new Dq(), new Dq()]
    // let smootheningRecords = [new Dq(), new Dq()]

    let highlightedColor = new THREE.Color(0xFFFFFF)
    let grabbedColor = new THREE.Color(0x00FF00)
    let highlightedAndGrabbedCol = new THREE.Color(0xFF00FF)
    let highlighteeIsAffecteeCol = new THREE.Color(0xFF0000)
    let highlighteeIsAffectorCol = new THREE.Color(0x00FFFF)

    let snapMode = false
    let numGens = 0
    {
        var numPotentialSnaps = -1
        var potentialSnapDqVizes = []
        var potentialSnapFlVizes = []
        //they shouldn't be snappables, but they SHOULD be updated based on their affecters
        function turnOffSnapMode() {
            snapMode = false
            numPotentialSnaps = -1
            for (let i = 0, il = potentialSnapDqVizes.length; i < il; ++i)
                potentialSnapDqVizes[i].visible = false
            for (let i = 0, il = potentialSnapFlVizes.length; i < il; ++i)
                potentialSnapFlVizes[i].visible = false
        }
        onSnapButtonUp = () => {
            turnOffSnapMode()
        }
        onSnapButtonDown = () => {

            let toBeSnapped = oddGrabbee || evenGrabbees[0] || evenGrabbees[1]
            if (toBeSnapped === null || snapMode)
                return

            let dqv1 = snappables.find(sn => sn.constructor === DqViz && sn !== toBeSnapped)
            let dqv2 = snappables.find(sn => { return sn.constructor === DqViz && sn !== dqv1 && sn !== toBeSnapped})
            
            snapMode = true

            let potentialSnapsVizes = toBeSnapped.constructor === DqViz ? potentialSnapDqVizes : potentialSnapFlVizes
            // if (dqv1 !== undefined && dqv2 !== undefined)
            //     debugger
            numPotentialSnaps = generatePotentialSnaps(potentialSnapsVizes, toBeSnapped)
            logPotentialSnaps(potentialSnapsVizes, numPotentialSnaps)
            ++numGens
        }
    }

    snapIfAcceptable = (toBeSnapped, potentialSnaps, snapIndex) => {
        if (snapIndex === -1)
            makeUnaffected(toBeSnapped)
        else {

            let bestRatedSnap = potentialSnaps[snapIndex]
            for (let i = 0; i < 3; ++i)
                toBeSnapped.affecters[i] = bestRatedSnap.affecters[i]
            toBeSnapped.markupPos.copy(bestRatedSnap.markupPos)

            // log(toBeSnapped.affecters)
            updateFromAffecters(toBeSnapped)
            toBeSnapped.regularizeMarkupPos()
        }
    }

    onGrabButtonDown = (focusHand) => {

        //make it so paintingButtonHeld is defined

        //trigger -> nothing -> paint
        //trigger -> other side -> even versor
        //side -> other trigger -> paint
        //side -> other side -> odd versor
        //side -> even versor

        let otherHand = 1-focusHand
            
        if(oddGrabbee)
            return

        let grabbee = paintees[focusHand] || paintees[otherHand] || highlightees[focusHand]

        let isOddVersor = 
            (evenGrabbees[otherHand] !== null && evenGrabbees[otherHand] === grabbee ) ||
            (grabbee !== null && grabbee.constructor === FlViz) ||
            oddGrabbee !== null
        if (isOddVersor) {

            if (evenGrabbees[otherHand] !== null ) {
                //switch it to being an fl
                let newViz = new FlViz()
                
                newViz.sclptable = evenGrabbees[otherHand].sclptable
                let oldDqViz = evenGrabbees[otherHand]
                evenGrabbees[otherHand] = null
                oldDqViz.sclptable = null
                oldDqViz.dispose()

                grabbee = newViz
            }

            oddGrabbee = grabbee
            handsHoldingOdd[focusHand] = true

            evenGrabbees[LEFT] = null
            evenGrabbees[RIGHT] = null
            paintees[LEFT] = null
            paintees[RIGHT] = null

            movementSinceGrabViz[focusHand].visible = false
            oldDqVizes[focusHand].visible = false
        }
        else {

            evenGrabbees[focusHand] = grabbee

            if( evenGrabbees[focusHand] === null )
                evenGrabbees[focusHand] = new DqViz()

            if(evenGrabbees[focusHand].dq === undefined)
                debugger

            if (evenGrabbees[focusHand].dq.isScalar())
                getIndicatedHandPosition( focusHand, evenGrabbees[focusHand].markupPos )

            handDqOnGrabs[focusHand].copy(hands[focusHand].dq)
            snappableDqOnGrabs[focusHand].copy(evenGrabbees[focusHand].dq)

            oldDqVizes[focusHand].dq.copy(snappableDqOnGrabs[focusHand])
            oldDqVizes[focusHand].markupPos.copy(evenGrabbees[focusHand].markupPos)
            oldDqVizes[focusHand].dq.sandwich(oldDqVizes[focusHand].markupPos, movementSinceGrabViz[focusHand].markupPos)
            movementSinceGrabViz[focusHand].dq.copy(oneDq)
        }
    }

    onPaintButtonDown = (focusHand) => {

        let otherHand = 1 - focusHand

        if( evenGrabbees[focusHand] !== null ) {
            evenGrabbees[focusHand].dispose()
            evenGrabbees[focusHand] = null
            movementSinceGrabViz[focusHand].visible = false
            oldDqVizes[focusHand].visible = false
        }
        else if (oddGrabbee !== null) {
            oddGrabbee.dispose()
            oddGrabbee = null
            handsHoldingOdd[0] = false
            handsHoldingOdd[1] = false
        }
        else {

            paintees[focusHand] = evenGrabbees[otherHand] || paintees[otherHand] || highlightees[focusHand]

            if (paintees[focusHand] === null)
                paintees[focusHand] = new DqViz()

            if( paintees[focusHand].sclptable === null)
                paintees[focusHand].sclptable = new Sclptable(paintees[focusHand])
        }
    }

    onPaintButtonUp = (focusHand) => {
        if (paintees[focusHand] !== null) {
            // toggleButtonsVisibility()
            paintees[focusHand].sclptable.emitSelf()
            paintees[focusHand] = null
        }
    }

    let rotationAroundStartPoint = new Dq()
    movingPaintingHighlightingHandLabels = () => {

        if (paintees[0] === null && paintees[1] === null)
            getPalletteInput()

        /////////
        // ODD //
        /////////
        if (oddGrabbee !== null) {

            //the right hand is the left hand preceded (that is, algebraically followed...) by a reflection in e1
            //so this is the transform that would reflect the right hand then get it to where left hand is
            hands[LEFT].dq.mul(e1, rightFl)
            //...the transform that would get the place where the right hand is to that
            rightFl.mulReverse(hands[RIGHT].dq, oddGrabbee.fl)

            if (oddGrabbee.lockedGrade === 1)
                oddGrabbee.fl.zeroGrade(3)
            else if (oddGrabbee.lockedGrade === 3)
                oddGrabbee.fl.zeroGrade(1)
            else 
                normalizeFlToTypes(oddGrabbee.fl, false)

            //doesn't matter much
            hands[RIGHT].dq.sandwich(e123, oddGrabbee.markupPos)
            oddGrabbee.regularizeMarkupPos()

            if(snapMode) {
                // handleSnaps(potentialSnapFlVizes, oddGrabbee, numPotentialSnaps)
            }
        }

        //////////
        // EVEN //
        //////////
        rotationPart.visible = false
        translationPart.visible = false
        // if(frameCount === 1)
        //     evenGrabbees[0] = new DqViz()
        for(let hand = 0; hand < 2; ++hand) {

            if ( evenGrabbees[hand] !== null)
            {
                //TODO need more stuff if you're using both hands at once

                highlightees[hand] = null

                // smootheningRecords[hand].add(hands[hand].dq, dq0).normalize()

                let hViz = evenGrabbees[hand]
                
                hands[hand].dq.mulReverse(handDqOnGrabs[hand], movementSinceGrabViz[hand].dq)
                movementSinceGrabViz[hand].dq.mul(snappableDqOnGrabs[hand], hViz.dq)

                //could have the markupPos's move if you're not at a pure rotn or trans, so tip always at hand
                hViz.dq.invariantDecomposition(rotationPart.dq, translationPart.dq)
                //are there circumstances under which it should decompose into a shorter rotation and a nether translation

                let translationThreshold = .09
                let rotationThreshold = .09
                let translationMeasure = rotationPart.markupPos.distanceToPt(rotationPart.getArrowTip(fl0))
                let rotationMeasure = translationPart.markupPos.distanceToPt(translationPart.getArrowTip(fl0))

                // let snapToRotation = translationPart.dq.l1NormTo(oneDq) < rotationThreshold
                // let snapToTranslation = Math.abs(rotationPart.dq[0]) > translationThreshold
                let snapToRotation = rotationMeasure < rotationThreshold
                let snapToTranslation = translationMeasure < translationThreshold
                
                rotationPart.visible = true
                translationPart.visible = true
                if (snapToRotation) {
                    hViz.dq.copy(rotationPart.dq)

                    //TODO would be nice to try this thing too
                    // rotationPart.dq.projectOn(hViz.markupPos, rotationAroundStartPoint)
                    // hViz.dq.copy(rotationAroundStartPoint)

                    rotationPart.visible = false
                    rotationFirst = true
                }
                else if (snapToTranslation) {
                    hViz.dq.copy(translationPart.dq)

                    translationPart.visible = false
                    rotationFirst = false
                }

                if (rotationFirst) {
                    rotationPart.markupPos.copy(evenGrabbees[hand].markupPos)
                    rotationPart.getArrowTip(translationPart.markupPos)
                }
                else {
                    translationPart.markupPos.copy(evenGrabbees[hand].markupPos)
                    translationPart.getArrowTip(rotationPart.markupPos)
                }

                if (showMarkupVizes) {
                    movementSinceGrabViz[hand].visible = !oldDqVizes[hand].dq.equals(oneDq)
                    oldDqVizes[hand].visible = movementSinceGrabViz[hand].visible
                }

                socket.emit("snappable", {
                    dqCoefficientsArray: evenGrabbees[hand].dq,
                    i: snappables.indexOf(evenGrabbees[hand])
                })

                if(snapMode) {
                    // handleSnaps(potentialSnapDqVizes, evenGrabbees[hand], numPotentialSnaps)
                }
            }
        }

        for(let hand = 0; hand < 2; ++hand) {

            //////////////
            // PAINTING //
            //////////////
            if (oddGrabbee === null && paintees[hand] !== null) {
                highlightees[hand] = paintees[hand]
                hidePalette()

                paintees[hand].sclptable.brushStroke(getIndicatedHandPosition(hand,fl0))
            }

            //////////////////
            // HIGHLIGHTING //
            //////////////////
            if (evenGrabbees[hand] === null && paintees[hand] === null && oddGrabbee === null) {

                let [nearest, nearestDistSq] = getNearest(hand) //getNearest(getIndicatedHandPosition(hand, fl0))

                //probably threshold should be about whether you are in the cuboid
                if (nearestDistSq > .01)
                    highlightees[hand] = null
                else
                    highlightees[hand] = nearest
            }
        }

        //////////////////////////////
        // REACTING TO HIGHLIGHTING //
        //////////////////////////////

        snappables.forEach(snappable => {
            snappable.boxHelper.visible = false
            if(snappable.sclptable)
                snappable.sclptable.boxHelper.visible = false
        })

        hands.forEach((hand,i) => {

            let len = 0.02
            let highlightee = highlightees[i]
            if(highlightee !== null) {
                if(highlightee.sclptable)
                    highlightee.sclptable.boundingBox.getCenter(v1)
                len = v1.distanceTo(hand.laser.getWorldPosition(v0))
            }
            
            hand.laser.scale.z = len
        })

        snappables.forEach(snappable => {
            snappable.boxHelper.visible = false
            snappable.circuitVisible = false //fuck that for now

            highlightees.forEach((highlightee,hand) => {
                if(highlightee === null)
                    return

                // log(highlightee.affecters, snappable.affecters)

                if (highlightee === snappable) {
                    snappable.boxHelper.visible = true
                    let col = evenGrabbees[1-hand] === highlightee ? highlightedAndGrabbedCol : highlightedColor
                    snappable.boxHelper.material.color.copy(col)
                }
                else if (aDependsOnB(highlightee,snappable) ) {
                    snappable.boxHelper.visible = true
                    snappable.boxHelper.material.color.copy(highlighteeIsAffectorCol)
                }
                else if (aDependsOnB(snappable,highlightee) ) {
                    snappable.boxHelper.visible = true
                    snappable.boxHelper.material.color.copy(highlighteeIsAffecteeCol)
                }
            })
            evenGrabbees.forEach((grabbee,hand) => {
                if (grabbee === null)
                    return

                if (grabbee === snappable) {
                    snappable.boxHelper.visible = true
                    let col = highlightees[1-hand] === grabbee ? highlightedAndGrabbedCol : grabbedColor
                    snappable.boxHelper.material.color.copy(col)
                }
                else if (aDependsOnB(grabbee,snappable)) {
                    snappable.boxHelper.visible = true
                    snappable.boxHelper.material.color.copy(highlighteeIsAffectorCol)
                }
                else if (aDependsOnB(snappable,grabbee)) {
                    snappable.boxHelper.visible = true
                    snappable.boxHelper.material.color.copy(highlighteeIsAffecteeCol)
                }
            })

            if (snappable.sclptable) {
                snappable.sclptable.boxHelper.visible = snappable.boxHelper.visible
                snappable.sclptable.boxHelper.material.color.copy( snappable.boxHelper.material.color )
            }
        })
    }

    onGrabButtonUp = (focusHand) => {
        if (evenGrabbees[focusHand]) {

            if(snapMode) {
                // let bestSnapIndex = getBestAcceptableSnap(potentialSnapDqVizes, evenGrabbees[focusHand], numPotentialSnaps)
                // snapIfAcceptable(evenGrabbees[focusHand], potentialSnapDqVizes, bestSnapIndex)
            }

            if (evenGrabbees[focusHand].sclptable) {
                evenGrabbees[focusHand].dq
                    .getReverse(dq0)
                    .sandwich(
                        evenGrabbees[focusHand].dq.sandwich(evenGrabbees[focusHand].sclptable.com, fl0),
                        evenGrabbees[focusHand].markupPos)
                evenGrabbees[focusHand].regularizeMarkupPos(true)
            }

            evenGrabbees[focusHand] = null

            movementSinceGrabViz[focusHand].visible = false
            oldDqVizes[focusHand].visible = false
        }

        if (oddGrabbee !== null) {

            handsHoldingOdd[focusHand] = false
            if (!handsHoldingOdd[0] && !handsHoldingOdd[1]) {

                if (snapMode) {
                    // let bestSnapIndex = getBestAcceptableSnap(potentialSnapFlVizes, oddGrabbee, numPotentialSnaps)
                    // snapIfAcceptable(oddGrabbee, potentialSnapFlVizes, bestSnapIndex)
                }

                if (oddGrabbee.affecters[0] === null) {
                    normalizeFlToTypes(oddGrabbee.fl, true)
                    let has1 = oddGrabbee.fl.hasGrade(1)
                    let has3 = oddGrabbee.fl.hasGrade(3)
                    oddGrabbee.lockedGrade = has1 && !has3 ? 1 : 3 //nobody wants rotoreflections/transflections
                }

                oddGrabbee = null
            }
        }

        if (snapMode && evenGrabbees[0] === null && evenGrabbees[1] === null && oddGrabbee === null)
            turnOffSnapMode()
    }
}