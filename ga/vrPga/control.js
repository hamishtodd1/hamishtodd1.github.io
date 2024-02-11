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

    //debug examples
    {
        // var sclptable = new Sclptable()
        // sclptable.brushStroke(fl0.point(0., 1.2, 0., 1.))

        // testCircuits()

        let flViz0 = new FlViz()
        comfortableLookPos(flViz0.fl)
        let flViz1 = new FlViz()
        comfortableLookPos(flViz1.fl, .5)

        let dqViz1 = new DqViz()
        e23.projectOn(flViz0.fl.addScaled(e012, .01, fl0), dqViz1.dq)
        // debugger
        snap(dqViz1)
        debugUpdates.push(()=>{
            if(frameCount === 2)
                dqViz1.regularizeMarkupPos()
        })

        // let dqViz1 = new DqViz()
        // dqViz1.dq.copy(Translator(.2, 0., 0.))
        // comfortableHandPos(dqViz1.markupPos, -.3)

        // let dqViz2 = new DqViz()
        // dqViz2.dq.copy(Translator(0., .15, 0.))
        // comfortableHandPos( dqViz2.markupPos)

        // let dqViz3 = new DqViz()
        // comfortableHandPos(dqViz3.markupPos, .3)
        // dqViz3.affecters[0] = dqViz2
        // dqViz3.affecters[1] = dqViz1
        // dqViz3.affecters[2] = 1

        // let dqViz4 = new DqViz()
        // dqViz4.markupPos.point(-.1, 1.2, 0.)
        // let axis = new Dq()
        // axis[4] = 1.
        // axis[1] = 1.2
        // axis[2] = -.6
        // axis.multiplyScalar(TAU/2. - .01, axis).exp(dqViz4.dq)
        // blankFunction = () => {
        //     // studyNum[0] = Math.sin(.02 * frameCount)
        //     // // studyNum[7] = Math.sin(.015 * frameCount+50)
        //     // axis.mul(studyNum,dq0).exp(dqViz4.dq)

        //     // axis.multiplyScalar(Math.sin(.02 * frameCount), dqViz4.dq)
        //     // dqViz4.dq[0] = -1.

        //     dqViz4.markupPos.point(.3 * (1. + Math.cos(frameCount * .01)), 1.2, 0.)
        // }
    }

    let highlightedColor = new THREE.Color(0xFFFFFF)
    let grabbedColor = new THREE.Color(0x00FF00)
    let highlighteeIsAffecteeCol = new THREE.Color(0xFF0000)
    let highlighteeIsAffectorCol = new THREE.Color(0x00FFFF)

    initButtonLabels()

    // document.addEventListener(`mouseRewind`, () => { log("yo") })

    let showMarkupVizes = true
    let oldDqVizes = [new DqViz( 0xFF0000, true, true ), new DqViz( 0xFF0000, true, true )]
    oldDqVizes[0].visible = false; oldDqVizes[1].visible = false;
    let dispDqVizes = [new DqViz(0xFF0000, true, true), new DqViz(0xFF0000, true, true)]
    dispDqVizes[0].visible = false; dispDqVizes[1].visible = false;
    let handDqOnGrabs = [new Dq(), new Dq()]
    let snappableDqOnGrabs = [new Dq(), new Dq()]
    // let smootheningRecords = [new Dq(), new Dq()]

    let paintees = [null,null]
    let highlightees = [null,null]
    let grabbees = [null,null]
    let grabbeeOdd = null

    deleteHeld = (focusHand) => {

        if (grabbees[focusHand] !== null) {
            grabbees[focusHand].dispose()
            grabbees[focusHand] = null
        }
    }

    onHandButtonDown = (isTriggerButton, isSideButton, focusHand) => {

        //make it so paintingButtonHeld is defined

        //trigger -> nothing -> paint
        //trigger -> other side -> even versor
        //side -> other trigger -> paint
        //side -> other side -> odd versor (later)
        //side -> nothing -> even versor

        let otherHand = 1-focusHand
            
        if ( isSideButton ) {

            if (paintees[focusHand] !== null) {
                // later: it controls a boolean related to that thing
                //but do a face with eyes first
                return 
            }
            else {
                
                //if we do want to make arrows with two hands sometimes
                let oddVersorDesired = 
                    grabbees[otherHand] !== null && grabbees[otherHand] === highlightees[focusHand] &&
                    grabbees[otherHand].sclptable === null
                // let oddVersorDesired =
                //     grabbees[otherHand] !== null && grabbees[otherHand].sclptable === null

                // log(grabbees[otherHand])
    
                if (oddVersorDesired) {
                    grabbeeOdd = new FlViz()
                    if(grabbees[otherHand].sclptable !== null)
                        grabbees[otherHand].dispose()
                    grabbees[LEFT ] = null
                    grabbees[RIGHT] = null
                    paintees[LEFT ] = null
                    paintees[RIGHT] = null
                }
                else {

                    grabbees[focusHand] = paintees[otherHand] || highlightees[focusHand]

                    if( grabbees[focusHand] === null )
                        grabbees[focusHand] = new DqViz()
    
                    if (grabbees[focusHand].mv.constructor === Dq ) {
                        if (grabbees[focusHand].dq.isScalarMultipleOf(oneDq))
                            getIndicatedHandPosition(focusHand, grabbees[focusHand].markupPos)
        
                        handDqOnGrabs[focusHand].copy(hands[focusHand].dq)
                        snappableDqOnGrabs[focusHand].copy(grabbees[focusHand].dq)
        
                        oldDqVizes[focusHand].dq.copy(snappableDqOnGrabs[focusHand])
                        oldDqVizes[focusHand].markupPos.copy(grabbees[focusHand].markupPos)
                        oldDqVizes[focusHand].dq.sandwich(oldDqVizes[focusHand].markupPos, dispDqVizes[focusHand].markupPos)
                        dispDqVizes[focusHand].dq.copy(oneDq)
                    }
                }
            }
        }
        else if(isTriggerButton) {

            if( grabbees[focusHand] !== null )
                deleteHeld(focusHand)
            else {

                if(grabbeeOdd !== null)
                    return

                paintees[focusHand] = grabbees[otherHand] || paintees[otherHand] || highlightees[focusHand]

                if (paintees[focusHand] === null)
                    paintees[focusHand] = new DqViz()

                if(paintees[focusHand].sclptable === null)
                    paintees[focusHand].sclptable = new Sclptable(paintees[focusHand])
            }
        }
    }

    movingPaintingHighlightingHandLabels = () => {

        debugFls[0].fl.point(0., 0., 1., 0.)

        // setLabels(paintee !== null, grabbee !== null, paintHandIsRight, grabbHandIsRight)

        if (paintees[0] === null && paintees[1] === null)
            getPalletteInput()

        if (grabbeeOdd !== null) {

            //the right hand is the left hand preceded (that is, algebraically followed...) by a reflection in e1

            let pointBetweenHands = fl3.pointFromGibbsVec(v1.addVectors(hands[0].position, hands[1].position).multiplyScalar(.5))

            let rightFl = new Fl()
            hands[LEFT].dq.mul(e1, rightFl)
            rightFl.mulReverse(hands[RIGHT].dq, grabbeeOdd.fl)
            
            grabbeeOdd.fl.normalize()
            let plane = grabbeeOdd.fl.selectGrade(1, fl0)
            let point = grabbeeOdd.fl.selectGrade(3, fl1)
            let pointAtInf = fl2.copy(point)
            pointAtInf[7] = 0.

            let eNormSqPlane = plane.eNormSq()
            let eNormSqPoint = point.eNormSq()
            let iNormSqPointAtInf = pointAtInf.iNormSq()

            //we want points at infinity quite often
            //THIS IS SHIT MAKE IT BETTER

            let distanceTaken = rightFl.sandwich(pointBetweenHands, fl4).distanceToPt(pointBetweenHands)

            let angleIsShallow = Math.abs(eNormSqPlane) > Math.abs(eNormSqPoint)
            // log(angleIsShallow, Math.abs(iNormSqPointAtInf) * 30., Math.abs(eNormSqPlane) )
            
            // if (distanceTaken > .2 ) {
            //     //might be concerned about whether or not this is in front of the camera
            //     pointAtInf.multiplyScalar(1. / Math.sqrt(iNormSqPointAtInf), grabbeeOdd.fl)
            // }
            // else 
            {

                if (angleIsShallow) {
                    plane.multiplyScalar(1. / Math.sqrt(eNormSqPlane), grabbeeOdd.fl)
                    grabbeeOdd.markupPos.copy(pointBetweenHands)
                }
                else {
                    point.multiplyScalar(1. / Math.sqrt(eNormSqPlane), grabbeeOdd.fl)
                }
            }

            grabbeeOdd.fl.log()

            //look at their quats alone
            //plane part is the bisector of their positions
            //compose the right hand's dq with the reflection to get an fl called rightBireflection
        }

        for(let hand = 0; hand < 2; ++hand) {

            /////////////////////
            // MOVING GRABBEES //
            /////////////////////
            if ( grabbeeOdd === null && grabbees[hand] !== null) {
                highlightees[hand] = grabbees[hand]

                // hands[hand].dq.mulReverse(handDqOnGrabs[hand], dispDqVizes[hand].dq)
                // dispDqVizes[hand].dq.mul(oldDqVizes[hand].dq, grabbees[hand].dq)

                // smootheningRecords[hand].add(hands[hand].dq, dq0).normalize()

                let movementSinceGrab = hands[hand].dq.mulReverse(handDqOnGrabs[hand], dq0)
                // some mild snapping here miiiight be nice?
                movementSinceGrab.mul(snappableDqOnGrabs[hand], grabbees[hand].dq )
                grabbees[hand].dq.normalize()
                dispDqVizes[hand].dq.copy(movementSinceGrab)
                
                snap(grabbees[hand])

                if (showMarkupVizes) {
                    dispDqVizes[hand].visible = !dispDqVizes[hand].dq.equals(oneDq)
                    oldDqVizes[hand].visible = dispDqVizes[hand].visible
                }

                socket.emit("snappable", {
                    dqCoefficientsArray: grabbees[hand].dq,
                    i: snappables.indexOf(grabbees[hand])
                })
            }

            //////////////
            // PAINTING //
            //////////////
            if (grabbeeOdd === null && paintees[hand] !== null) {
                highlightees[hand] = paintees[hand]
                hidePalette()

                paintees[hand].sclptable.brushStroke(getIndicatedHandPosition(hand,fl0))
            }

            //////////////////
            // HIGHLIGHTING //
            //////////////////
            if (grabbees[hand] === null && paintees[hand] === null) {

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

        snappables.forEach(snappable => {
            snappable.boxHelper.visible = false
            snappable.circuitVisible = false //fuck that for now

            highlightees.forEach(highlightee => {
                if(highlightee === null)
                    return

                if (highlightee === snappable) {
                    snappable.boxHelper.visible = true
                    snappable.boxHelper.material.color.copy(highlightedColor)
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
            grabbees.forEach(grabbee => {
                if (grabbee === null)
                    return

                if (grabbee === snappable) {
                    snappable.boxHelper.visible = true
                    snappable.boxHelper.material.color.copy(grabbedColor)
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

            dispDqVizes[focusHand].visible = false
            oldDqVizes[focusHand].visible = false
        }

        if (grabbeeOdd !== null && isSideButton)
            grabbeeOdd = null
    }

    //////////////////////
    // Helper functions //
    //////////////////////

    let myRay = new THREE.Ray()
    myRay.origin.set(0.,0.,0.)
    myRay.direction.set(0.,1.,0.)
    let myBox = new THREE.Box3(v2.set(-0.5, 0.5, -0.5), v3.set(0.5, 1.5, 0.5))
    myRay.intersectBox(myBox, v1)

    let testPoint = new Fl()
    let joinPlane = new Fl()
    function getNearest(hand) {

        hands[hand].dq.sandwich(e123, fl0).pointToGibbsVec( myRay.origin )
        hands[hand].laserDq.meet(e0, fl0).directionToGibbsVec( myRay.direction )

        let nearest = null
        let nearestDistSq = Infinity
        snappables.forEach(snappable => {

            let distSq = Infinity
            testPoint.pointFromGibbsVec(snappable.boundingBox.getCenter(v1)).normalizePoint()
            
            let rayIntersectsBox = null !== myRay.intersectBox(snappable.boundingBox, v1)

            //let isInFront = hands[hand].laserPlane.joinPt(testPoint)[0] > 0.)
            if (rayIntersectsBox)
                distSq = hands[hand].laserDq.joinPt(testPoint, joinPlane).eNormSq()

            if (snappable.sclptable !== null && snappable.sclptable.com[7] !== 0.) {
                
                let rayIntersectsSclptableBox = null !== myRay.intersectBox(snappable.sclptable.boundingBox, v1)
                if(rayIntersectsSclptableBox) {
                    
                    snappable.sclptable.getWorldCom(testPoint).normalizePoint()
                    //let isInFront = hands[hand].laserPlane.joinPt(testPoint)[0] > 0.)
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