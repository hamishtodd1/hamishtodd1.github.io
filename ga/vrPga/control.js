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

function initControl(potentialSnapDqVizes, potentialSnapFlVizes) {

    // initButtonLabels()
    initControlHelpers()

    const paintees = [null, null]
    const highlightees = [null, null]

    let handDqOnGrabs = [new Dq(), new Dq()]
    let evenGrabbeeOnGrabs = [new Dq(), new Dq()]
    let oddGrabbeeOnGrabs = [new Fl(), new Fl()]
    // let smootheningRecords = [new Dq(), new Dq()]

    let highlightedColor = new THREE.Color(0xFFFFFF)
    let highlightedAndGrabbedCol = new THREE.Color(0xFF00FF)
    let highlighteeIsAffecteeCol = new THREE.Color(0xFF0000)
    let highlighteeIsAffectorCol = new THREE.Color(0x00FFFF)

    let snapMode = false
    let fuckYouPsvs = []
    {
        var numPotentialSnaps = -1
        //they shouldn't be snappables, but they SHOULD be updated based on their affecters
        function turnOffSnapMode() {
            snapMode = false
            numPotentialSnaps = -1
            for (let i = 0, il = potentialSnapDqVizes.length; i < il; ++i)
                potentialSnapDqVizes[i].visible = false
            for (let i = 0, il = potentialSnapFlVizes.length; i < il; ++i)
                potentialSnapFlVizes[i].visible = false

            fuckYouPsvs.length = 0
        }
        onSnapButtonUp = () => {
            turnOffSnapMode()
        }
        onSnapButtonDown = () => {

            let toBeSnapped = grabbees[0] || grabbees[1]
            if (toBeSnapped === null || snapMode === true)
                return

            snapMode = true

            //pt turning invisible somewhere here
            let potentialSnapsVizes = toBeSnapped.constructor === DqViz ? potentialSnapDqVizes : potentialSnapFlVizes
            numPotentialSnaps = generatePotentialSnaps(potentialSnapsVizes, toBeSnapped)
            // logPotentialSnaps(potentialSnapsVizes, numPotentialSnaps)
        }
    }

    snapIfAcceptable = (toBeSnapped, potentialSnaps ) => {
        
        if (potentialSnaps.length === 0 || potentialSnaps[0].visible === false) {
            makeUnaffected(toBeSnapped)
            return toBeSnapped
        }
        else {
            let bestRatedSnap = potentialSnaps[0]

            let existingSnappable = snappables.find(s => (
                s !== null &&
                s.visible === false && 
                bestRatedSnap.mv.constructor === s.constructor && 
                bestRatedSnap.mv.equals(s.mv)))
            if (existingSnappable === undefined) {
                copySnappable(bestRatedSnap, toBeSnapped)
                return toBeSnapped
            }
            else {
                if (toBeSnapped.sclptable !== null && existingSnappable.sclptable !== null)
                    console.error("wanna snap to an old one but both have sclptables!")
                
                toBeSnapped.dispose()
                return existingSnappable
            }
        }
    }

    onGrabButtonDown = (focusHand) => {

        let otherHand = 1-focusHand

        let grabbee = paintees[focusHand] || paintees[otherHand] || highlightees[focusHand]

        if (grabbee !== null && grabbees[otherHand] === grabbee ) {

            if (grabbees[otherHand].sclptable !== null) 
                grabbee = null //not allowed!
            else {
                grabbee = new FlViz(null, false)
                let oldDqViz = grabbees[otherHand]
                grabbees[otherHand] = grabbee
                oldDqViz.dispose() //draw a pentagram and summon the garbage collector
            }
        }

        if (grabbee === null )
            grabbee = new DqViz(null, false)

        //grabbee is now what it should be! Now a case of doing stuff

        if (grabbee !== null && grabbee === grabbees[otherHand]) {

            grabbee.lockedGrade = -1

            handleOddGestures(grabbee)
            v1.addVectors(hands[0].position, hands[1].position).multiplyScalar(.5)
            grabbee.settleDiskPosition(fl0.pointFromGibbsVec(v1))
        }
        else if (grabbee.constructor === FlViz)
            oddGrabbeeOnGrabs[focusHand].copy(grabbee.fl)
        else if (grabbee.constructor === DqViz) {

            if (grabbee.dq.isScalar())
                getIndicatedHandPosition(focusHand, grabbee.markupPos)

            evenGrabbeeOnGrabs[focusHand].copy(grabbee.dq)
        }

        handDqOnGrabs[focusHand].copy(hands[focusHand].dq)
        grabbee.visible = true
        grabbees[focusHand] = grabbee
        // makeUnaffected(grabbee)

        if (grabbee.lockedGrade !== 1)
            grabbee.dontUpdateMarkupPos = true
        else
            grabbee.dontUpdateMarkupPos = false //because we just like doing it for that one
    }

    // let rotationAroundStartPoint = new Dq()
    movingPaintingHighlightingHandLabels = () => {

        // if (mrh === 3)
        //     debugger

        if (paintees[0] === null && paintees[1] === null)
            getPalletteInput()

        //////////////
        // Gestures //
        //////////////

        snappables.forEach(snappable => {

            if(snappable === null)
                return

            //in advance of these being mucked around with
            snappable.setOpacity(1.)
        })
        
        if (grabbees[0] !== null && grabbees[0] === grabbees[1]) {

            handleOddGestures(grabbees[0] )

            if(snapMode)
                handleSnaps(potentialSnapFlVizes, grabbees[0], numPotentialSnaps, fuckYouPsvs)
        }
        else {

            for(let focusHand = 0; focusHand < 2; ++focusHand) {

                let grabbee = grabbees[focusHand]
                if( grabbee === null) {
                    hideDqDecompositionVizes(focusHand)
                    continue
                }

                highlightees[focusHand] = null
                paintees[focusHand] = null
    
                if( grabbee.constructor === FlViz) {

                    hands[focusHand].dq.mulReverse(handDqOnGrabs[focusHand], dq0)
                    dq0.sandwich(oddGrabbeeOnGrabs[focusHand],grabbee.fl)
                    if (grabbee.lockedGrade === 1)
                        grabbee.fl.zeroGrade(3)
                    if (grabbee.lockedGrade === 3)
                        grabbee.fl.zeroGrade(1)

                    if (snapMode)
                        handleSnaps(potentialSnapFlVizes, grabbee, numPotentialSnaps, fuckYouPsvs)
                }
                else if (grabbee.constructor === DqViz)  {
    
                    hands[focusHand].dq.mulReverse( handDqOnGrabs[focusHand], dq0 )
                    dq0.mul( evenGrabbeeOnGrabs[focusHand], grabbee.dq )
    
                    roundEvenGesture(focusHand, snapMode)

                    // setMeasurer(grabbees[focusHand])
    
                    if(snapMode)
                        handleSnaps(potentialSnapDqVizes, grabbee, numPotentialSnaps, fuckYouPsvs)

                    if (grabbee.sclptable) {
                        socket.emit("snappable", {
                            dqCoefficientsArray: grabbee.dq,
                            i: snappables.indexOf(grabbee)
                        })
                    }
                }
            }
        }

        for(let focusHand = 0; focusHand < 2; ++focusHand) {

            //////////////
            // PAINTING //
            //////////////
            if ( paintees[focusHand] !== null) {
                highlightees[focusHand] = paintees[focusHand]
                hidePalette()

                paintees[focusHand].sclptable.brushStroke(getIndicatedHandPosition(focusHand,fl0))
            }

            //////////////////
            // HIGHLIGHTING //
            //////////////////
            if (grabbees[focusHand] === null && paintees[focusHand] === null ) {
                let [nearest, nearestDistSq] = getIndicatedGrabbable(focusHand) //getNearest(getIndicatedHandPosition(focusHand, fl0))
                highlightees[focusHand] = nearest
                hands[focusHand].laser.scale.z = nearestDistSq === Infinity ? 0.02 : Math.sqrt(nearestDistSq)
            }
        }

        //////////////////////////////
        // REACTING TO HIGHLIGHTING //
        //////////////////////////////

        snappables.forEach(snappable => {
            if(snappable === null)
                return

            snappable.boxHelper.visible = false
            if(snappable.sclptable)
                snappable.sclptable.boxHelper.visible = false
        })

        // hands.forEach((hand, i) => {

        //     let len = 0.02
        //     let highlightee = highlightees[i]
        //     if (highlightee !== null) {
        //         if (highlightee.sclptable)
        //             highlightee.sclptable.boundingBox.getCenter(v1)
        //         len = v1.distanceTo(hand.laser.getWorldPosition(v0))
        //     }

        //     hand.laser.scale.z = len
        // })

        snappables.forEach(snappable => {
            if (snappable === null)
                return
            
            snappable.boxHelper.visible = false
            snappable.circuitVisible = false //fuck that for now

            highlightees.forEach((highlightee,hand) => {

                if(highlightee === null)
                    return

                // log(highlightee.affecters, snappable.affecters)

                if (highlightee === snappable) {
                    snappable.boxHelper.visible = true
                    let col = grabbees[1-hand] === highlightee ? highlightedAndGrabbedCol : highlightedColor
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
            grabbees.forEach((grabbee,hand) => {

                if (grabbee === null)
                    return

                if (aDependsOnB(grabbee,snappable)) {
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

        let output = grabbees[focusHand]
        if(output === null)
            return

        if (grabbees[0] !== null && grabbees[0] === grabbees[1])
            grabbees[1 - focusHand] = null
        grabbees[focusHand] = null

        if (snapMode) {
            let psvs = output.constructor === DqViz ? potentialSnapDqVizes : potentialSnapFlVizes
            output = snapIfAcceptable(output, psvs)

            turnOffSnapMode()
        }

        output.dontUpdateMarkupPos = false
        putOnStack(output)
        
        if (output.constructor === FlViz && output.affecters[0] === null) {
            
            roundFlToTypes(output, true)
            let has1 = output.fl.hasGrade(1)
            let has3 = output.fl.hasGrade(3)
            output.lockedGrade = has1 && !has3 ? 1 : 3 //nobody wants rotoreflections/transflections

            //Bit hacky. For rotoreflections.
            if (output.lockedGrade === 1) {
                output.markupPos.pointFromGibbsVec(output.diskGroup.position)
                output.settleDiskPosition(output.markupPos)
            }
        }
    }

    onPaintButtonDown = (focusHand) => {

        let otherHand = 1 - focusHand

        //if you're holding something in the hand that you pressed the button for, well, that would make no sense
        //so that's the delete button
        //unless you're in snapMode. Hopefully fuck you button is not needed!
        //the CORRECT way to do it is: what ever snap you have, this is a composition on top of that
        //so you move the jaw to the head and let go. Then, you move the jaw down
        // if (snapMode)
        //     fuckYouPsvs.push(potentialSnapDqVizes[0])
        // else 
        if (grabbees[focusHand] !== null) {

            if (grabbees[otherHand] === grabbees[focusHand])
                grabbees[otherHand] = null

            grabbees[focusHand].dispose()
            grabbees[focusHand] = null

            if (snapMode)
                turnOffSnapMode()
        }
        else {

            let potentialPaintee = grabbees[otherHand] || paintees[otherHand] || highlightees[focusHand]

            if (potentialPaintee === null || potentialPaintee.constructor === FlViz)
                potentialPaintee = new DqViz()

            if (potentialPaintee.sclptable === null)
                potentialPaintee.sclptable = new Sclptable(potentialPaintee)

            paintees[focusHand] = potentialPaintee
        }
    }

    onPaintButtonUp = (focusHand) => {

        if (paintees[focusHand] !== null) {
            // toggleButtonsVisibility()
            paintees[focusHand].sclptable.finishAndEmit()
            paintees[focusHand] = null
        }
    }
}