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

function updateFromAffecters(a) {
    if (a.affecters[0] !== null) {
        operate(a.affecters, a.mv)
        a.mv.normalize()
        socket.emit("snappable", {
            dqCoefficientsArray: a.mv,
            i: snappables.indexOf(a)
        })
    }

    let affecter0 = a.affecters[0]
    let affecter1 = a.affecters[1]
    let op = operators[a.affecters[2]]
    
    if(op === `joinPt` && 
        a.mv.hasGrade(2) && 
        affecter0.mv.hasGrade(3) && 
        affecter1.mv.hasGrade(3)) {

        a.mv[0] = 0.
        a.mv[7] = 0.

        if (affecter0.fl === undefined || affecter1.fl === undefined) {
            debugger
        }

        if (affecter0.fl[7] !== 0. && affecter1.fl[7] !== 0.) {
            fl0.copy(affecter0.mv).normalizePoint()
            fl1.copy(affecter1.mv).normalizePoint()
            let midPoint = fl0.add(fl1, fl2).multiplyScalar(.5, fl2)
            midPoint.add(randomPt, a.markupPos)
            clampPointDistanceFromThing( a.markupPos, camera.mvs.pos, 0., .5 )
        }
        else if (affecter0.fl[7] !== 0. || affecter1.fl[7] !== 0.) {
            let reachablePt = fl0.copy(affecter0.fl[7] !== 0. ? affecter0.fl : affecter1.fl).normalizePoint()
            reachablePt.add(randomPt, a.markupPos)
        }

        //no idea what this will do for both ideal
        a.regularizeMarkupPos()

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