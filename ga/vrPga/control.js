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

        // let flViz0 = new FlViz()
        // debugUpdates.push(()=>{
        //     // e02.multiplyScalar(.1, dq0).exp(dq1)
        //     comfortableLookPos(fl0).joinPt(e023, dq0).exp(dq1)
        //     e1.addScaled(e0, .1, fl0)
        //     fl0.mul(dq1, flViz0.fl)

        //     // comfortableLookPos(flViz0.markupPos)
        //     flViz0.regularizeMarkupPos()
            
        // })

        // {
        //     // let flViz0 = new FlViz()
        //     // comfortableLookPos(flViz0.fl)
        //     // let flViz1 = new FlViz()
        //     // comfortableLookPos(flViz1.fl, .5)

        //     // let dqViz5 = new DqViz()
        //     // e23.projectOn(flViz0.fl.addScaled(e012, .01, fl0), dqViz5.dq)
        //     // // debugger
        //     // snap(dqViz5)
        //     // debugUpdates.push(()=>{
        //     //     if(frameCount === 2)
        //     //         dqViz5.regularizeMarkupPos()
        //     // })
        // }

        // let dqViz1 = new DqViz()
        // dqViz1.dq.copy(Translator(.2, 0., 0.))
        // dqViz1.dq[0] *= -1.
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
    let highlightedAndGrabbedCol = new THREE.Color(0xFF00FF)
    let highlighteeIsAffecteeCol = new THREE.Color(0xFF0000)
    let highlighteeIsAffectorCol = new THREE.Color(0x00FFFF)

    let rightFl = new Fl()
    let planePart = new Fl()
    let pointPart = new Fl()

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
    let evenGrabbees = [null,null]
    
    let oddGrabbee = null
    let evenVersion = new Dq()
    let handsHoldingOdd = [false, false]


    onHandButtonDown = (isTriggerButton, isSideButton, focusHand) => {

        //make it so paintingButtonHeld is defined

        //trigger -> nothing -> paint
        //trigger -> other side -> even versor
        //side -> other trigger -> paint
        //side -> other side -> odd versor
        //side -> even versor

        let otherHand = 1-focusHand
            
        if ( isSideButton ) {

            if(oddGrabbee)
                return

            if (paintees[focusHand] !== null) {
                // later: it controls a float, press-amount-dependent
                //but do a face with eyes first
                return 
            }
            else {
                
                evenGrabbees[focusHand] = paintees[otherHand] || highlightees[focusHand]

                let isOddVersor = 
                    (evenGrabbees[otherHand] !== null && evenGrabbees[otherHand] === evenGrabbees[focusHand] ) ||
                    (evenGrabbees[focusHand] !== null && evenGrabbees[focusHand].constructor === FlViz) ||
                    oddGrabbee !== null
                if (isOddVersor) {

                    handsHoldingOdd[focusHand] = true
                    
                    if (evenGrabbees[focusHand] !== null ) {
                        //switch it to being an fl
                        let newViz = new FlViz()
                        newViz.sclptable = evenGrabbees[focusHand].sclptable
    
                        let oldDqViz = evenGrabbees[focusHand]
                        evenGrabbees[focusHand] = null
                        oldDqViz.sclptable = null
                        oldDqViz.dispose()

                        oddGrabbee = newViz
                    }

                    evenGrabbees[LEFT] = null
                    evenGrabbees[RIGHT] = null
                    paintees[LEFT] = null
                    paintees[RIGHT] = null

                    dispDqVizes[focusHand].visible = false
                    oldDqVizes[focusHand].visible = false
                }
                else {

                    if( evenGrabbees[focusHand] === null )
                        evenGrabbees[focusHand] = new DqViz()

                    if(evenGrabbees[focusHand].dq === undefined)
                        debugger
    
                    if (evenGrabbees[focusHand].dq.isScalarMultipleOf(oneDq))
                        getIndicatedHandPosition(focusHand, evenGrabbees[focusHand].markupPos)
    
                    handDqOnGrabs[focusHand].copy(hands[focusHand].dq)
                    snappableDqOnGrabs[focusHand].copy(evenGrabbees[focusHand].dq)
    
                    oldDqVizes[focusHand].dq.copy(snappableDqOnGrabs[focusHand])
                    oldDqVizes[focusHand].markupPos.copy(evenGrabbees[focusHand].markupPos)
                    oldDqVizes[focusHand].dq.sandwich(oldDqVizes[focusHand].markupPos, dispDqVizes[focusHand].markupPos)
                    dispDqVizes[focusHand].dq.copy(oneDq)
                }
            }
        }
        else if(isTriggerButton) {

            if( evenGrabbees[focusHand] !== null ) {
                evenGrabbees[focusHand].dispose()
                evenGrabbees[focusHand] = null
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
    }

    movingPaintingHighlightingHandLabels = () => {

        // setLabels(paintee !== null, grabbee !== null, paintHandIsRight, grabbHandIsRight)

        if (paintees[0] === null && paintees[1] === null)
            getPalletteInput()

        if (oddGrabbee !== null) {

            let pointBetweenHands = fl3.pointFromGibbsVec(v1.addVectors(hands[0].position, hands[1].position).multiplyScalar(.5))
            
            //the right hand is the left hand preceded (that is, algebraically followed...) by a reflection in e1
            //so this is the transform that would reflect the right hand then get it to where left hand is
            hands[LEFT].dq.mul(e1, rightFl)
            //...the transform that would get the place where the right hand is to that
            rightFl.mulReverse(hands[RIGHT].dq, oddGrabbee.fl)
            
            oddGrabbee.fl.normalize()
            oddGrabbee.fl.selectGrade(1, planePart)
            oddGrabbee.fl.selectGrade(3, pointPart)
            let pointAtInf = fl2.copy(pointPart)
            pointAtInf[7] = 0.

            oddGrabbee.fl.mul(planePart, evenVersion)
            let evenVersionAxis = dq0
            evenVersion.selectGrade(2, evenVersionAxis)
            evenVersion.normalize()
            // evenVersion.log()

            let handsDistToAxis = evenVersionAxis.distanceToPt(pointBetweenHands)
            let distTaken = pointBetweenHands.distanceToPt( evenVersion.sandwich(pointBetweenHands, fl1) )

            let eNormSqAxis = Math.sqrt(Math.abs(evenVersionAxis.eNormSq()))
            let angle = 4. * Math.abs(Math.atan2(eNormSqAxis, evenVersion[0]))
            //4 because double cover, or WHATEVER
            // log(eNormSqAxis, evenVersion[0])
            // log(angle)

            let PLANE = 0
            let POINT = 1
            let ROTOREFLECTION = 2
            let TRANSFLECTION = 3
            
            let thingThisIs = TRANSFLECTION
            if(angle > Math.PI * .9)
                thingThisIs = POINT
            else if(angle > Math.PI * .2)
                thingThisIs = ROTOREFLECTION
            else if(distTaken < .13)
                thingThisIs = PLANE

            let eNormPlane = Math.sqrt( planePart.eNormSq() )
            let eNormPoint = Math.sqrt( pointPart.eNormSq() )
            let iNormPointAtInf = Math.sqrt( pointAtInf.iNormSq() )

            if (thingThisIs === TRANSFLECTION) {

                let newPointAtInf = pointBetweenHands.joinPt(pointPart, dq0).meet(e0, fl0)
                let scalar = .5 * distTaken / eNormPlane / Math.sqrt(fl0.iNormSq())
                planePart.addScaled(newPointAtInf, scalar, oddGrabbee.fl)
                
            }
            else if (thingThisIs === PLANE ) {
                oddGrabbee.fl.zeroPointPart()
                oddGrabbee.markupPos.copy(pointBetweenHands)
            }
            else if (thingThisIs === POINT )
                oddGrabbee.fl.zeroPlanePart()

            hands[RIGHT].dq.sandwich(e123, oddGrabbee.markupPos)
            oddGrabbee.regularizeMarkupPos()
            
            
            //we want points at infinity quite often

            // let distTaken = rightFl.sandwich(pointBetweenHands, fl4).distanceToPt(pointBetweenHands)

            // // let angleIsShallow = Math.abs(eNormSqPlane) > Math.abs(eNormSqPoint)
            // // // log(angleIsShallow, Math.abs(iNormSqPointAtInf) * 30., Math.abs(eNormSqPlane) )
            
            // if (distTaken > .2 ) {
            //     //might be concerned about whether or not this is in front of the camera
            //     // pointAtInf.multiplyScalar(1. / Math.sqrt(iNormSqPointAtInf), oddGrabbee.fl)
            //     oddGrabbee.fl[7] = 0.
            // }
            // else 
            // {

            //     if (angleIsShallow) {
            //         planePart.multiplyScalar(1. / Math.sqrt(eNormSqPlane), oddGrabbee.fl)
            //         oddGrabbee.markupPos.copy(pointBetweenHands)
            //     }
            //     else {
            //         pointPart.multiplyScalar(1. / Math.sqrt(eNormSqPlane), oddGrabbee.fl)
            //     }
            // }

            //look at their quats alone
            //planePart part is the bisector of their positions
            //compose the right hand's dq with the reflection to get an fl called rightBireflection

            

            //one of the extra planes is where one of your hands is
            //other is halfway between
            // let pl = extraPlanes[LEFT]
            // let planeFl = handPosition.joinPt(pointPart, dq0).inner(planePart, fl0)
            // pl.position.copy(hands[LEFT].position)

            // let firstPos = hands[LEFT].position

            // planeFlToMesh(extraPlanes[hand], planeFl, oddGrabbee.markupPos)
            // planeFlToMesh(extraPlanes[hand], planeFl, oddGrabbee.markupPos)

            
        }

        for(let hand = 0; hand < 2; ++hand) {

            /////////////////////
            // MOVING GRABBEES //
            /////////////////////
            if ( oddGrabbee === null && evenGrabbees[hand] !== null) {
                highlightees[hand] = evenGrabbees[hand]

                // hands[hand].dq.mulReverse(handDqOnGrabs[hand], dispDqVizes[hand].dq)
                // dispDqVizes[hand].dq.mul(oldDqVizes[hand].dq, evenGrabbees[hand].dq)

                // smootheningRecords[hand].add(hands[hand].dq, dq0).normalize()

                let movementSinceGrab = hands[hand].dq.mulReverse(handDqOnGrabs[hand], dq0)
                // some mild snapping here miiiight be nice?
                movementSinceGrab.mul(snappableDqOnGrabs[hand], evenGrabbees[hand].dq )
                evenGrabbees[hand].dq.normalize()
                dispDqVizes[hand].dq.copy(movementSinceGrab)
                
                snap(evenGrabbees[hand])

                if (showMarkupVizes) {
                    dispDqVizes[hand].visible = !oldDqVizes[hand].dq.equals(oneDq)
                    oldDqVizes[hand].visible = dispDqVizes[hand].visible
                }

                socket.emit("snappable", {
                    dqCoefficientsArray: evenGrabbees[hand].dq,
                    i: snappables.indexOf(evenGrabbees[hand])
                })
            }

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

        snappables.forEach(snappable => {
            snappable.boxHelper.visible = false
            snappable.circuitVisible = false //fuck that for now

            highlightees.forEach((highlightee,hand) => {
                if(highlightee === null)
                    return

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
    
    onHandButtonUp = (isTriggerButton, isSideButton, focusHand) => {

        if (paintees[focusHand] !== null && isTriggerButton ) {
            // toggleButtonsVisibility()
            paintees[focusHand].sclptable.emitSelf()
            paintees[focusHand] = null
        }

        if (evenGrabbees[focusHand] && isSideButton ) {

            if (evenGrabbees[focusHand].sclptable) {
                evenGrabbees[focusHand].dq
                    .getReverse(dq0)
                    .sandwich(
                        evenGrabbees[focusHand].dq.sandwich(evenGrabbees[focusHand].sclptable.com, fl0),
                        evenGrabbees[focusHand].markupPos)
            }

            evenGrabbees[focusHand] = null

            dispDqVizes[focusHand].visible = false
            oldDqVizes[focusHand].visible = false
        }

        if (oddGrabbee !== null && isSideButton) {
            handsHoldingOdd[focusHand] = false
            if (!handsHoldingOdd[0] && !handsHoldingOdd[1]) {
                oddGrabbee = null

            }
        }
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