function makeUnaffected(viz) {
    viz.affecters[0] = null
    viz.affecters[1] = null
    viz.affecters[2] = -1
}

function operate(affecters, target) {

    let op = operators[affecters[2]]
    let affecter0 = affecters[0]
    let affecter1 = affecters[1]

    // debugger
    if (affecter0.mv[op].length === 1)
        affecter0.mv[op](target)
    else
        affecter0.mv[op](affecter1.mv, target)

    target.normalize()
}

function giveSnappableProperties(s) {
    
    s.add(s.boxHelper)
    s.boxHelper.visible = false
    s.boxHelper.matrixAutoUpdate = false

    s.sclptable = null

    snappables.push(s)
}

function updateFromAffecters(output) {
    if (output.affecters[0] !== null) {
        operate(output.affecters, output.mv)
        output.mv.normalize()
        socket.emit("snappable", {
            dqCoefficientsArray: output.mv,
            i: snappables.indexOf(output)
        })
    }

    let mv0 = output.affecters[0].mv
    let mv1 = output.affecters[1].mv
    let op = operators[output.affecters[2]]

    if(op === `dqTo` ) {
        //arrow should go from the markupPos of the one it's coming from ofc
        if (mv0.hasGrade(2) && mv1.hasGrade(2) && Math.abs(mv0.meet(mv1, dq0)[7]) < eps) {
            //arrow's plane should be 
        }
        //yes this is one thing but a more important thing is choosing which things are visible to you
        //also reducing by half the number of things
    }

    if(op === `joinPt` ) {

        let isTwoPoints = output.mv.hasGrade(2) &&
                          mv0.hasGrade(3) &&
                          mv1.hasGrade(3)

        if (isTwoPoints) {
            output.mv[0] = 0.
            output.mv[7] = 0.
    
            if (mv0[7] !== 0. && mv1[7] !== 0.) {
                fl0.copy(mv0).normalizePoint()
                fl1.copy(mv1).normalizePoint()
                let midPoint = fl0.add(fl1, fl2).multiplyScalar(.5, fl2)
                midPoint.add(randomPt, output.markupPos)
                clampPointDistanceFromThing( output.markupPos, camera.mvs.pos, 0., .5 )
            }
            else if (mv0[7] !== 0. || mv1[7] !== 0.) {
                let reachablePt = fl0.copy(mv0[7] !== 0. ? mv0 : mv1).normalizePoint()
                reachablePt.add(randomPt, output.markupPos)
            }
            
            //no idea what this will do for both ideal
            output.regularizeMarkupPos()
        }
    }
}

function interdependencyExists(a, b) {
    return aDependsOnB(a,b) || aDependsOnB(b,a)
}

function aDependsOnB(a,b) {
    let ret = false
    if (a.affecters[0] === b ||
        a.affecters[1] === b)
        ret = true

    if (ret === false && a.affecters[0] !== null)
        ret = aDependsOnB(a.affecters[0],b)
    if (ret === false && a.affecters[1] !== null)
        ret = aDependsOnB(a.affecters[1],b)

    return ret
}

function disposeMostOfSnappable(sn) {
    if (snappables.indexOf(sn) !== -1) {

        let i = snappables.indexOf(sn)

        if (spectatorMode === false)
            socket.emit(`disposeSnappable`, { i })

        snappables.splice(i, 1)
    }

    if (sn.sclptable !== null) {
        let s = sn.sclptable
        sn.sclptable = null
        s.dispose()
    }

    while (sn.children.length > 0) {
        let child = sn.children[sn.children.length - 1]
        sn.remove(child)
    }

    scene.remove(sn)
}