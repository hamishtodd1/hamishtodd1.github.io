function initMarkupPos() {

    let onThing = new Fl()
    let out = new Dq()
    clampPointDistanceFromThing = (point, thing, minDist, maxDist = Infinity) => {

        point.projectOn(thing, onThing)
        onThing.dqTo(point, out).normalizeTranslation()
        let dist = out.translationDistance()
        if (dist === 0.)
            console.error("zero distance from thing")
        let newDist = clamp(dist, minDist, maxDist)
        out[1] *= newDist / dist
        out[2] *= newDist / dist
        out[3] *= newDist / dist

        out.sandwich(onThing, point)
        point.normalizePoint()
        return point
    }

    let rotationPart = new Dq()
    let translationPart = new Dq()
    let planePart = new Fl()
    let pointPart = new Fl()
    let bivPart = new Dq()
    let axisBiv = new Dq()
    function regularizeMarkupPos(viz, noUpperLimit) {
        if(viz.constructor === DqViz) {
            viz.dq.invariantDecomposition(rotationPart, translationPart)
            rotationPart.selectGrade(2, bivPart)

            //if this has no rotation component, fuck it
            //could have something about it going to being closer to your line of sight
            if (Math.abs(bivPart.eNormSq()) < eps)
                return

            clampPointDistanceFromThing(viz.markupPos, bivPart, .015, noUpperLimit ? Infinity : .06)
        }
        else {
            //markupPos is only relevant when we have rotoreflection or transflection, so this will probably only be called then
            //And away from the plane
            //push the markupPos away from the axis of the rotation

            viz.fl.selectGrade(1, planePart)
            viz.fl.selectGrade(3, pointPart)
            let hasPlane = !planePart.isZero()
            let hasPoint = !pointPart.isZero()

            if (!hasPlane || !hasPoint)
                return

            let maxDistFromPlane = .015
            if (planePart.distanceToPt(viz.markupPos) > maxDistFromPlane)
                clampPointDistanceFromThing(viz.markupPos, planePart, maxDistFromPlane, 1.)

            //TODO it should be far enough away from the axis that the arrow goes a larger arclength
            planePart.inner(pointPart, axisBiv)
            if (Math.abs(axisBiv.eNormSq()) > eps)
                clampPointDistanceFromThing(viz.markupPos, axisBiv, .05)
        }
    }

    updateMarkupPoses = () => {

        /*To take into account:
            You could be holding the thing/have just let go of the thing
        */

        // if(frameCount === 900)
        //     debugger
        vizes.forEach((viz,vizIndex) => {

            //a case that remains external is the decompositions of the hand position, that's simple
            if (viz.dontUpdateMarkupPos)
                return
            else if (viz.constructor === FlViz && viz.lockedGrade === 3)
                viz.markupPos.copy(viz.fl)
            else if (viz.constructor === FlViz && viz.lockedGrade === 1) {
                // viz.markupPos.pointFromGibbsVec(viz.diskGroup.position)
                // viz.settleDiskPosition()
            }
            else if (viz.sclptable !== null && viz.constructor === DqViz && evenGrabbees.indexOf(viz) === -1) {
                viz.markupPos.lerp(viz.sclptable.com, .003, viz.markupPos)
            }
            else if(viz.affecters[0] !== null) {
                let res = viz.mv
                let mv0 = viz.affecters[0].mv
                let op = operators[viz.affecters[2]]
                let mv1 = viz.affecters[1] === null ? null : viz.affecters[1].mv
    
                if (op === `dqTo`) {
    
                    //arrow should go from the markupPos of the one it's coming from ofc
    
                    // res.sqrt(dq0)
    
                    // UNTESTED
    
                    if (mv0.hasGrade(3) || mv1.hasGrade(3)) {
                        viz.markupPos.copy(viz.affecters[0].markupPos)
                        // let firstHasIt = mv0.hasGrade(3)
                        // let p1 = (firstHasIt ? mv0 : mv1).selectGrade(3, fl0).normalizePoint()
                        // let p2 = p1.projectOn(firstHasIt ? mv1 : mv0, fl0).normalizePoint()
                        // let midPoint = p1.add(p2, fl3)
                        // res.sqrt(dq0).getReverse(dq1).sandwich(midPoint, viz.markupPos)
                    }
    
                    if (mv0.hasGrade(2) && mv1.hasGrade(2)) {
    
                        //will be their common plane if coplanar
                        let planeParallelToLine1ContainingLine0 = mv0.joinPt(mv1.meet(e0, fl0), fl1).zeroGrade(3)
                        let startyPoint = planeParallelToLine1ContainingLine0.meet(res.selectGrade(2, dq0), fl3)
                        let dirAlongLine0 = mv0.meet(e0, fl4)
                        startyPoint.movePointInDirectionByDistance(dirAlongLine0, .15, viz.markupPos) //point on line0
    
                    }
                    //yes this is one thing but a more important thing is choosing which things are visible to you
                    //also reducing by half the number of things
                }
    
                if (op === `joinPt`) {

                    log("yo")
    
                    let isTwoPoints = viz.mv.hasGrade(2) &&
                        mv0.hasGrade(3) &&
                        mv1.hasGrade(3)

                    //make it so that the potentialSnaps all have their markupPos's as similar as possible to
                    //your current markupPos
    
                    if (isTwoPoints) {
                        //TODO hacky way to enforce grade locking
                        viz.dq[0] = 0.
                        viz.dq[7] = 0.
    
                        let neitherIdeal = mv0[7] !== 0. && mv1[7] !== 0.
                        let atLeastOneFinite = mv0[7] !== 0. || mv1[7] !== 0.
                        let pointOnLineNearMarkupPos = fl2
                        if (neitherIdeal) {
                            fl0.copy(mv0).normalizePoint()
                            fl1.copy(mv1).normalizePoint()
                            fl0.add(fl1, pointOnLineNearMarkupPos).multiplyScalar(.5, pointOnLineNearMarkupPos)
                        }
                        else if (atLeastOneFinite) {
                            pointOnLineNearMarkupPos.copy(mv0[7] !== 0. ? mv0 : mv1).normalizePoint()
                            pointOnLineNearMarkupPos.normalizePoint()
                        }
                        //else both at infinity! Translation, perhaps

                        //Really, you maybe want an "along" line rather than an "around" line
                        
                        let arrowPlane = pointOnLineNearMarkupPos.inner(viz.dq, fl3)
                        let myRandomPoint = fl4.point(-0.34892, 0.4547, 0.0083, 1.)
                        myRandomPoint.projectOn(arrowPlane, viz.markupPos)
                        clampPointDistanceFromThing(viz.markupPos, pointOnLineNearMarkupPos, 0., .014)
                        //super close because who cares about the fucking rotation
                    }
                }
            }
        })
    }



    //an old thing for dqs
    // getNicePlane(target) {

    //     this.dq.invariantDecomposition(rotationPart, translationPart)

    //     let strippedAxis = dq1
    //     if (rotationPart.approxEquals(oneDq))
    //         translationPart.selectGrade(2, strippedAxis)
    //     else
    //         rotationPart.selectGrade(2, strippedAxis)

    //     strippedAxis.joinPt(camera.mvs.pos, target)
    // }
}