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
    
    // if(op === `joinPt` && a.mv.constructor === Dq && a.mv.includesGrade(2)) {

    //     fl0.copy(affecter0.mv).normalizePoint()
    //     fl1.copy(affecter1.mv).normalizePoint()
    //     let midPoint = fl0.add(fl1, fl2).multiplyScalar(.5, fl2)
    //     a.markupPos.copy(midPoint)
    //     a.markupPos[4] += .01; a.markupPos[5] += .01; a.markupPos[6] += .01;
    //     a.regularizeMarkupPos()
    //     // a.markupPos.log()
    
    // }
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