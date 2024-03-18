function initStack() {
    let stackLength = 3 
    let stack = Array(stackLength).fill(null)
    putOnStack = (s) => {
        if(stack.indexOf(snappables.indexOf(s)) !== -1)
            return

        let end = stack.indexOf(null)
        if(end === -1)
            end = stackLength - 1
        for(let i = end; i > 0; --i)
            stack[i] = stack[i - 1]

        stack[0] = snappables.indexOf(s)

        snappables.forEach((sn,i) => {
            if(sn !== null)
                sn.visible = stack.indexOf(i) !== -1
        })
    }
}

function copySnappable(from, to) {
    for (let i = 0; i < 3; ++i)
        to.affecters[i] = from.affecters[i]
    to.markupPos.copy(from.markupPos)
    to.mv.copy(from.mv)
    to.markupPos.copy(from.markupPos)
}

function operate(affecters, target) {

    let op = operators[affecters[2]]
    let affecter0 = affecters[0]
    let affecter1 = affecters[1]

    if (affecter0.mv[op].length === 1)
        affecter0.mv[op](target)
    else
        affecter0.mv[op](affecter1.mv, target)

    target.normalize()
}

function updateFromAffecters(output) {
    if (output.affecters[0] === null)
        return

    let res = output.mv
    let mv0 = output.affecters[0].mv
    let op = operators[output.affecters[2]]
    let mv1 = null
    
    if (output.affecters[1] === null)
        mv0[op](res)
    else {
        mv1 = output.affecters[1].mv
        mv0[op](mv1, res)
    }
    res.normalize() //sell-out!
    socket.emit("snappable", {
        dqCoefficientsArray: output.mv,
        i: snappables.indexOf(output)
    })

    if(op === `dqTo` ) {

        //arrow should go from the markupPos of the one it's coming from ofc

        // res.sqrt(dq0)

        // UNTESTED

        if(mv0.hasGrade(3) || mv1.hasGrade(3)) {
            let firstHasIt = mv0.hasGrade(3)
            let p1 = (firstHasIt ? mv0 : mv1).selectGrade(3, fl0).normalizePoint()
            let p2 = p1.projectOn(firstHasIt ? mv1 : mv0, fl0).normalizePoint()
            let midPoint = p1.add(p2, fl3)
            res.sqrt(dq0).getReverse(dq1).sandwich( midPoint, output.markupPos )
        }

        if (mv0.hasGrade(2) && mv1.hasGrade(2) ) {
            
            //will be their common plane if coplanar
            let planeParallelToLine1ContainingLine0 = mv0.joinPt( mv1.meet(e0, fl0), fl1).zeroGrade(3)
            let startyPoint = planeParallelToLine1ContainingLine0.meet(res.selectGrade(2,dq0), fl3)
            let dirAlongLine0 = mv0.meet(e0, fl4)
            startyPoint.movePointInDirectionByDistance( dirAlongLine0, .15, output.markupPos ) //point on line0

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

                //Really, you maybe want an "along" line rather than an "around" line
                clampPointDistanceFromThing( output.markupPos, camera.mvs.pos, 0., .15 )
            }
            else if (mv0[7] !== 0. || mv1[7] !== 0.) {
                let reachablePt = fl0.copy(mv0[7] !== 0. ? mv0 : mv1).normalizePoint()
                reachablePt.add(randomPt, output.markupPos)
            }
            //else both at infinity! Translation, perhaps
            
            //no idea what this will do for both ideal
            output.regularizeMarkupPos()
        }
    }
}

function makeSnappable(s) {

    s.sclptable = null

    let lastIndex = snappables.length - 1
    if (snappables[lastIndex] === null)
        snappables[lastIndex] = s
    else
        snappables.push(s)
}

function makeUnaffected(viz) {
    viz.affecters[0] = null
    viz.affecters[1] = null
    viz.affecters[2] = -1
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
        snappables[i] = null
        if (spectatorMode === false)
            socket.emit(`disposeSnappable`, { i })
        
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