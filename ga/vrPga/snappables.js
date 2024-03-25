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
            if(sn !== null && !sn.backgroundSnappable )
                sn.visible = stack.indexOf(i) !== -1
        })
        log(stack)
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
    let mv1 = output.affecters[1] === null ? null : output.affecters[1].mv
    
    if (output.affecters[1] === null)
        mv0[op](res)
    else
        mv0[op](mv1, res)
    
    if (res.isZero())
        debugger
    res.normalize() //sell-out!
    socket.emit("snappable", {
        dqCoefficientsArray: output.mv,
        i: snappables.indexOf(output)
    })
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

    snappables.forEach((snappable)=>{
        if(snappable === null)
            return

        if(snappable.affecters.indexOf(sn) !== -1)
            makeUnaffected(snappable)
    })

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