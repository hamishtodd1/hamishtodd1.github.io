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
        //     flViz0.regularizeMarkupPos()

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
        // dqViz6.regularizeMarkupPos()

        // let dqViz7 = new DqViz()
        // dqViz6.dq.addScaled(e13.projectOn(clp, dq0), .4, dqViz7.dq)
        // dqViz7.markupPos.copy(clp)
        // dqViz7.regularizeMarkupPos()

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
    let myBox = new THREE.Box3(v2.set(-0.5, 0.5, -0.5), v3.set(0.5, 1.5, 0.5))
    myRay.intersectBox(myBox, v1)

    let testPoint = new Fl()
    let joinPlane = new Fl()
    getNearest = (hand) => {

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

    let ZERO_BLADE = -1
    let PLANE = 1
    let LINE = 2
    let POINT = 3
    let ROTOREFLECTION = 5
    let TRANSFLECTION = 6

    let evenVersionAxis = new Dq()
    let evenVersion = new Dq()
    let pointBetweenHands = new Fl()
    let planePart = new Fl()
    let pointPart = new Fl()
    normalizeFlToTypes = (fl, bladesOnly) => {

        fl.normalize()
        fl.selectGrade(1, planePart)
        fl.selectGrade(3, pointPart)

        let pointIsZero = pointPart.isZero()
        let planeIsZero = planePart.isZero()
        if (pointIsZero && planeIsZero)
            return ZERO_BLADE
        else if (pointIsZero)
            return PLANE
        else if (planeIsZero)
            return POINT

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
        if (angle > Math.PI * .52)
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

            }
            else if (thingThisIs === PLANE) {
                fl.zeroGrade(3)
                // oddGrabbee.markupPos.copy(pointBetweenHands)
            }
            else if (thingThisIs === POINT)
                fl.zeroGrade(1)
        }

        return thingThisIs
    }
}