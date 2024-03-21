function initControlHelpers() {

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

        // })

        // {
            // var flViz0 = new FlViz()
            // comfortableHandPos(flViz0.fl)
            // var flViz1 = new FlViz()
            // comfortableHandPos(flViz1.fl, .5)

            // var dqViz5 = new DqViz()
            // e23.projectOn(flViz0.fl.addScaled(e012, .01, fl0), dqViz5.dq)
            // snapOld(dqViz5)

        //     debugUpdates.push(()=>{
        //     })
        // }

        // let clp = comfortableHandPos(fl0)

        // let dqViz6 = new DqViz()
        // e23.projectOn( clp, dqViz6.dq )
        // dqViz6.markupPos.copy(clp)

        // let dqViz7 = new DqViz()
        // dqViz6.dq.addScaled(e13.projectOn(clp, dq0), .4, dqViz7.dq)
        // dqViz7.markupPos.copy(clp)

        // debugUpdates.push(()=>{
        //     if(snappables[2] !== undefined)
        //         log(snappables[2].markupPos)
        // })

        // log(dqViz7.dq.dqTo(dqViz6.dq, dq0))

        // let dqViz8 = new DqViz()
        // dqViz8.dq.set(
        //     0.982, -0.183, 0, 0., -0.19, 0, 0, 0.
        // )
        // let didSnap = snap(dqViz8)
        // log(didSnap)

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

    let myRay = new THREE.Ray()
    myRay.origin.set(0.,0.,0.)
    myRay.direction.set(0.,1.,0.)

    let testPoint = new Fl()
    let joinPlane = new Fl()
    getNearestGrabbable = (hand) => {

        getIndicatedHandPosition(hand, fl0 ).pointToGibbsVec( myRay.origin )
        hands[hand].laserDq.meet(e0, fl0).directionToGibbsVec( myRay.direction )

        let nearest = null
        let nearestDistSq = Infinity
        snappables.forEach(snappable => {
            if(snappable === null)
                return

            if(snappable.backgroundSnappable)
                return

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

    
    {
        let evenVersionAxis = new Dq()
        let evenVersion = new Dq()
        let pointBetweenHands = new Fl()
        let planePart = new Fl()
        let pointPart = new Fl()
        roundFlToTypes = (viz, bladesOnly) => {

            let fl = viz.fl

            fl.normalize()
            fl.selectGrade(1, planePart)
            fl.selectGrade(3, pointPart)

            fl.mul(planePart, evenVersion)
            evenVersion.normalize()
            evenVersion.selectGrade(2, evenVersionAxis)

            let eNormSqAxis = Math.sqrt(evenVersionAxis.eNormSq())
            let angle = 2. * Math.abs(Math.atan2(eNormSqAxis, evenVersion[0]))

            //potentially useful at some point
            // let handsDistToAxis = evenVersionAxis.distanceToPt(pointBetweenHands)

            pointBetweenHands.pointFromGibbsVec(v1.addVectors(hands[0].position, hands[1].position).multiplyScalar(.5))
            let distTaken = pointBetweenHands.distanceToPt(evenVersion.sandwich(pointBetweenHands, fl0))

            let thingThisIs = TRANSFLECTION
            if (angle > Math.PI * .62)
                thingThisIs = POINT
            else if (angle > Math.PI * .2)
                thingThisIs = ROTOREFLECTION
            else if (distTaken < .13)
                thingThisIs = PLANE

            if (bladesOnly) {
                if (thingThisIs === POINT || thingThisIs === TRANSFLECTION)
                    fl.zeroGrade(1)
                else
                    fl.zeroGrade(3)
            }
            else {
                if (thingThisIs === TRANSFLECTION) {

                    let distTaken = pointBetweenHands.distanceToPt(evenVersion.sandwich(pointBetweenHands, fl4))

                    let newPointAtInf = pointBetweenHands.joinPt(pointPart, dq0).meet(e0, fl0)
                    let scalar = .5 * distTaken / Math.sqrt(newPointAtInf.iNormSq())
                    planePart.normalize()
                    planePart.addScaled(newPointAtInf, scalar, fl).normalize()

                    getIndicatedHandPosition(RIGHT, viz.markupPos)
                }
                else if (thingThisIs === ROTOREFLECTION) {
                    getIndicatedHandPosition(RIGHT, viz.markupPos)
                }
                else if (thingThisIs === PLANE) {
                    fl.zeroGrade(3)
                    viz.markupPos.copy(pointBetweenHands)
                }
                else if (thingThisIs === POINT) {
                    fl.zeroGrade(1)
                    viz.markupPos.copy(fl)
                }
            }

            return thingThisIs
        }

        const rightFl = new Fl()
        handleOddGestures = (oddGrabbee) => {
            
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
                roundFlToTypes(oddGrabbee, false)

            if(oddGrabbee.fl.grade() === 1)
                oddGrabbee.markupPos.copy(pointBetweenHands)
        }
    }

    {
        class Decomposition {
            constructor() {
                this.rotationPart = new DqViz(0x00FFFF, true, true, true)
                this.translationPart = new DqViz(0x00FFFF, true, true, true)
                this.translationPart.scaleAxisRadius(.95)
                this.rotationPart.scaleAxisRadius(.95)
            }
        }
        let decompositions = [new Decomposition(), new Decomposition()]

        hideDqDecompositionVizes = (hand) => {
            decompositions[hand].rotationPart.visible = false
            decompositions[hand].translationPart.visible = false
        }
        
        let handPosition = new Fl()
        roundEvenGesture = (handIndex, snapMode) => {

            //if you rotate your hand only a little, that's a translation
            let evenGrabbee = evenGrabbees[handIndex]
            let rotationPart = decompositions[handIndex].rotationPart
            let translationPart = decompositions[handIndex].translationPart

            evenGrabbee.dq.invariantDecomposition(rotationPart.dq, translationPart.dq)

            if (!snapMode) {
                let dist = rotationPart.dq.selectGrade(2, dq0).distanceToPt(getIndicatedHandPosition(handIndex, handPosition))
                if (dist > .35)
                    evenGrabbee.markupPos.dqTo(handPosition, evenGrabbee.dq)
                
                rotationPart.visible = false
                translationPart.visible = false
                return
            }
            //are there circumstances under which it should decompose into a shorter rotation and a nether translation?

            let thresholdTranslation = .09
            let thresholdRotation = .09
            let threshold180 = .05
            let translationMeasure = rotationPart.markupPos.distanceToPt(rotationPart.getArrowTip(fl0))
            let rotationMeasure = translationPart.markupPos.distanceToPt(translationPart.getArrowTip(fl0))

            let snapToRotation = rotationMeasure < thresholdRotation
            let snapTo180 = snapToRotation && Math.abs(rotationPart.dq[0]) < threshold180
            let snapToTranslation = translationMeasure < thresholdTranslation

            rotationPart.visible = true
            translationPart.visible = true
            if (snapToRotation) {
                if (snapTo180) {
                    rotationPart.dq[0] = 0.
                    rotationPart.dq.normalize()
                }
                evenGrabbee.dq.copy(rotationPart.dq)

                //TODO would be nice to try this thing too
                // rotationPart.dq.projectTransformOn(evenGrabbee.dq.markupPos, rotationAroundStartPoint)
                // evenGrabbee.dq.copy(rotationAroundStartPoint)
            }
            else if (snapToTranslation) {
                evenGrabbee.dq.copy(translationPart.dq)
            }

            rotationPart.markupPos.copy(evenGrabbee.markupPos)
            translationPart.markupPos.copy(evenGrabbee.markupPos)
        }
    }
}