function setMarkupPosFromAffecters(viz) {

    let res = viz.mv
    let mv0 = viz.affecters[0].mv
    let op = operators[viz.affecters[2]]
    let mv1 = viz.affecters[1] === null ? null : viz.affecters[1].mv


    switch (op) {

        case `dqTo`:
            // UNTESTED

            if (viz.affecters[0].lockedGrade === 3) {
                viz.markupPos.copy(viz.affecters[0].markupPos)
            }
            else if (viz.affecters[0].lockedGrade === 1 && viz.affecters[1].lockedGrade === 1) {

                let axis = viz.mv.selectGrade(2, dq0)

                // debugger
                viz.affecters[0].getSettledDiskPosition(fl0).normalizePoint()
                viz.affecters[1].getSettledDiskPosition(fl1).normalizePoint()
                let disksMidPoint = fl0.add(fl1, fl2).projectOn(axis, fl0)
                
                let arrowPlane = axis.inner(disksMidPoint, fl0)
                let dir = arrowPlane.meet(viz.affecters[0].fl, dq0).meet(e0, fl3)
                disksMidPoint.movePointInDirectionByDistance(dir, .15, viz.markupPos)
                // debugFlVizes[2].fl.copy(viz.markupPos)
                log(frameCount, viz.markupPos)


                // (point, thing, minDist, maxDist = Infinity) => {
            }
            else if (mv0.hasGrade(2) && mv1.hasGrade(2)) {

                //will be their common plane if coplanar
                let planeParallelToLine1ContainingLine0 = mv0.joinPt(mv1.meet(e0, fl0), fl1).zeroGrade(3)
                let startyPoint = planeParallelToLine1ContainingLine0.meet(res.selectGrade(2, dq0), fl3)
                let dirAlongLine0 = mv0.meet(e0, fl4)
                startyPoint.movePointInDirectionByDistance(dirAlongLine0, .15, viz.markupPos) //point on line0
            }
            //not sure about this at all
            // else if (mv0.hasGrade(3) || mv1.hasGrade(3)) {
                // let firstHasIt = mv0.hasGrade(3)
                // let p1 = (firstHasIt ? mv0 : mv1).selectGrade(3, fl0).normalizePoint()
                // let p2 = p1.projectOn(firstHasIt ? mv1 : mv0, fl0).normalizePoint()
                // let midPoint = p1.add(p2, fl3)
                // res.sqrt(dq0).getReverse(dq1).sandwich(midPoint, viz.markupPos)
            // }
            //yes this is one thing but a more important thing is choosing which things are visible to you
            //also reducing by half the number of things

            break

        case `joinPt`:

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

            //else if is line and point, the disk goes between (and probably scales up... or becomes a triangle...)

            break

    }
}

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

    updateMarkupPoses = () => {

        /*To take into account:
            You could be holding the thing/have just let go of the thing
        */

        // if(potentialSnapDqVizes.length > 0)
        //     debugger

        // if(frameCount === 900)
        //     debugger
        vizes.forEach((viz, vizIndex) => {
            if (viz === null)
                return

            //a case that remains external is the decompositions of the hand position, that's simple
            if (viz.dontUpdateMarkupPos || viz.visible === false)
                return

            if (viz.affecters[0] !== null)
                setMarkupPosFromAffecters(viz)
            if(viz.constructor === FlViz ) {

                if ( viz.lockedGrade === 3 )
                    viz.markupPos.copy(viz.fl)
                else if ( viz.lockedGrade === 1 ) {
                    if( grabbees.indexOf(viz) !== -1 ) {
                        let handHeldIn = hands[grabbees.indexOf(viz)]
                        handHeldIn.laserDq.meet(viz.fl, viz.markupPos)
                    }
                }
            }
            else if (viz.constructor === DqViz) {

                if (viz.sclptable !== null && viz.constructor === DqViz && grabbees.indexOf(viz) === -1) {
                    viz.markupPos.lerp(viz.sclptable.com, .003, viz.markupPos)
                }
            }
        })
        
        potentialSnapDqVizes.forEach(viz => {
            
            if( viz.visible &&
                viz.affecters[2] === `mul` && 
                viz.affecters[0].constructor === DqViz && 
                viz.affecters[1].constructor === DqViz) {

                viz.affecters[0].markupPos.copy(viz.markupPos)
                viz.affecters[0].dq.sandwich(viz.affecters[0].markupPos, viz.affecters[1].markupPos)
            }
        })

        vizes.forEach(viz=>{
            if(viz.constructor === DqViz) {
                //to be doing this is to admit that you're using k-volumes
                //people will want the length of this thing
                if (operators[viz.affecters[2]] === `joinPt` && viz.affecters[0].fl[7] !== 0. && viz.affecters[1].fl[7] !== 0.) {
                    let distBetween = viz.affecters[0].fl.distanceToPt(viz.affecters[1].fl)
                    viz.rotAxisMesh.scale.y = Math.max(distBetween - .02, .02)
                }
                else
                    viz.rotAxisMesh.scale.y = 3.5 * viz.boundingBox.getSize(v0).length()
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