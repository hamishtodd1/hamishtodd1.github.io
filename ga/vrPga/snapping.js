/*
 */

function initSnapping() {

    const tolerance = .15// .06 for users
    let toSnapLogNormalized = new Dq()
    let potentialSnapLogNormalized = new Dq()

    logPotentialSnap = (ps) => {
        log(snappables.indexOf(ps.affecters[0]), ps.affecters[0])
        log(snappables.indexOf(ps.affecters[1]), ps.affecters[1])
        log(operators[ps.affecters[2]])
    }

    logPotentialSnaps = (potentialSnapsVizes, num) => {
        log("\n\nBUNCH OF SNAPS\n\n")
        for (let i = 0; i < num; ++i)
            logPotentialSnap(potentialSnapsVizes[i])
    }

    function getType(opName, type1, type2) {
        if (opName === `sandwich`)
            return type2
        else if (opName === `projectOn` || opName === `copyTo` || opName === `projectTransformOn` )
            return type1
        else if (opName === `dqTo` || opName === `userPow`)
            return Dq
        else if (opName === `add` || opName === `sub`)
            return type1
        else if (opName === `velocityUnder`)
            return type2
        else if (opName === `joinPt` || opName === `mul` || opName === `mulReverse` || opName === `meet`) {
            if (type1 === type2)
                return Dq
            else
                return Fl
        }

        console.error("type weirdness: ", opName, type1, type2)
        return null
    }

    function typeCheck(opIndex, mv0, mv1) {
        let g0 = mv0.grade()
        let g1 = mv1.grade()
        if ( (g0 === Infinity || g0 === 0 || g0 === 4) ||
             (g1 === Infinity || g1 === 0 || g1 === 4) )
            return false
            
        let isObject0 = g0 === 1 || g0 === 2 || g0 === 3
        let isObject1 = g1 === 1 || g1 === 2 || g1 === 3
        let isNull0 = mv0.eNormSq() === 0.
        let isNull1 = mv1.eNormSq() === 0.

        //exact 180s and point reflections are for mathematicians
        //so, objects and trasforms coincide at reflections
        let isTransform0 = (g0 === -1 || g0 === -2 || g0 === 1) && !isNull0
        let isTransform1 = (g1 === -1 || g1 === -2 || g1 === 1) && !isNull1

        switch(operators[opIndex]) {
            case `mul`: // the only thing that can output a rotoreflection
                return isTransform0 && isTransform1
            case `sandwich`:
                return isObject1 && isTransform0
            case `dqTo`:
                return isObject0 && isObject1 && !isNull0 && !isNull1
            case `joinPt`:
                return (g0 === 2 || g0 === 3) && g1 === 3 //no scalars allowed, for now
            case `meet`:
                return (g0 === 1 && (g1 === 1 || g1 === 2)) || (g0 === 2 && g0 === 1)
            case `add`:
                return g0 === g1
            case `projectOn`:
                return isObject0 && isObject1 && g0 !== g1
            case `userPow`:
                let mv1IsTranslation = !isObject1 &&
                    mv1[0] !== 0. && mv1[4] === 0. && mv1[5] === 0. && mv1[6] === 0. && mv1[7] === 0.
                return g0 === -2 && mv1IsTranslation
            // case `velocityUnder`:
            //     return g0 === -2 && isObject1 //not thinking about lines or planes for now
            // case `projectTransformOn`:
            //     return isTransform0 && isObject1
            default: //new, I suppose
                console.error("no eligibility criteria for ", operators[opIndex])
                return true
        }
    }

    generatePotentialSnaps = (potentialSnapsVizes, toBeSnapped) => {

        let lowestUnused = 0

        function addPotentialSnap(i, j, k) {
            if (potentialSnapsVizes[lowestUnused] === undefined) {
                potentialSnapsVizes[lowestUnused] = new toBeSnapped.constructor(0xFFA500, true, true)
                potentialSnapsVizes[lowestUnused].dontUpdateMarkupPos = false
            }

            let psv = potentialSnapsVizes[lowestUnused]
            psv.affecters[0] = snappables[i]
            psv.affecters[1] = snappables[j]
            psv.affecters[2] = k
            updateFromAffecters(psv)
            if (!psv.mv.isZero()) {
                psv.visible = true
                ++lowestUnused
            }
        }

        snappables.forEach((sn, i) => {

            if(sn === null)
                return
            
            let mv0 = sn.mv

            let ineligible0 =
                sn === toBeSnapped ||
                mv0.isZero() ||
                sn.visible === false ||
                aDependsOnB(sn, toBeSnapped)

            if (ineligible0)
                return

            for (let k = 0, kl = operators.length; k < kl; k++) {

                let isSingleArgumentOp = mv0[operators[k]].length === 1
                if (isSingleArgumentOp) {

                    let outputType = getType(operators[k], mv0.constructor)
                    if (outputType !== toBeSnapped.mv.constructor)
                        continue

                    addPotentialSnap(i, -1, k)
                }
                else for (let j = /*i+1*/0, jl = snappables.length; j < jl; j++) {
                    if(snappables[j] === null)
                        continue

                    let mv1 = snappables[j].mv

                    let ineligible1 =
                        i === j || //mulReverse would get identity, add would do nothing, mul covered by log, join meet would be 0, inner would be scalar
                        snappables[j].visible === false ||
                        snappables[j] === toBeSnapped ||
                        aDependsOnB(snappables[j], toBeSnapped) ||  //maybe one day
                        !typeCheck(k, mv0, mv1)

                    let outputType = getType(operators[k], mv0.constructor, mv1.constructor)
                    if (outputType !== toBeSnapped.mv.constructor)
                        continue

                    if (ineligible1)
                        continue

                    // if (operators[k] === `sandwich`)
                    //     debugger

                    addPotentialSnap(i, j, k)
                }
            }
            
        })

        snappables.forEach(s => {
            if (s === null)
                return

            if(s.visible === true || s === toBeSnapped || s.constructor !== toBeSnapped.constructor || aDependsOnB(s, toBeSnapped) || s.mv.isZero() )
                return

            if (potentialSnapsVizes[lowestUnused] === undefined)
                potentialSnapsVizes[lowestUnused] = new toBeSnapped.constructor(0xFFA500, true, true)

            //a more proper thing might be for this potentialSnapViz to **be** s
            let psv = potentialSnapsVizes[lowestUnused]
            makeUnaffected(psv)
            psv.visible = true
            psv.mv.copy(s.mv)

            ++lowestUnused
        })

        return lowestUnused
    }

    let filteredDq = new Dq()
    let filteredFl = new Fl()
    let tbsnFl = new Fl()
    let tbsnDq = new Dq()
    let pscDq = new Dq()
    let pscFl = new Fl()
    
    rate = (opIndex, potentialSnap, toBeSnapped) => {

        if (potentialSnap.isZero())
            return false

        let l1Norm = Infinity

        let advantage = 1.

        //fucking mess
        function compareBlades() {

            let g = potentialSnap.grade()
            let toBeSnappedGradeG = toBeSnapped.mv.selectGrade(g, toBeSnapped.mv.constructor === Dq ? tbsnDq : tbsnFl)
            if (toBeSnappedGradeG.isZero())
                return Infinity
            //gotta make it NOT a screw axis
            toBeSnappedGradeG.normalize()
            
            let potentialSnapComparable = potentialSnap.constructor === Dq ? pscDq : pscFl
            potentialSnapComparable.copy(potentialSnap)
            potentialSnapComparable.normalize()
            if(g === 3 && potentialSnapComparable[7] !== toBeSnappedGradeG[7])
                potentialSnapComparable.multiplyScalar(-1., potentialSnapComparable)

            return potentialSnapComparable.l1NormTo(toBeSnappedGradeG)
        }

        let opName = opIndex === -1 ? `` : operators[opIndex] 
        switch (opName) {

            // case `logarithm`:
            //      toBeSnapped.dq.logarithm(toSnapLog)
            //     //we merely require closeness to any scalar multiple
            //     toSnapLog.div( potentialSnap, dq1 ) //we require dq1 is close to scalar
            //     //scalar is omitted
            //     l1Norm = Math.abs(dq1[1]) + Math.abs(dq1[2]) + Math.abs(dq1[3]) + Math.abs(dq1[4]) + Math.abs(dq1[5]) + Math.abs(dq1[6])

            case `joinPt`:
                l1Norm = compareBlades()

                advantage = 5. // whatever it needs to make it feel right for tolerance = 1

                break

            // case `projectOn`:

            case `sandwich`:
                l1Norm = compareBlades()
                advantage = 5.
                break

            case `dqTo`:

                toBeSnapped.mv.logarithm(toSnapLogNormalized)
                potentialSnap.logarithm(potentialSnapLogNormalized)
                if (toSnapLogNormalized.isZero() || potentialSnapLogNormalized.isZero())
                    return Infinity
                else {
                    potentialSnapLogNormalized.normalize()
                    toSnapLogNormalized.normalize()
    
                    l1Norm = toSnapLogNormalized.l1NormTo(potentialSnapLogNormalized)
                    advantage = 4.
                }

                break

            default: //this includes -1, because sometimes you snap to something not defined by behaviour
                l1Norm = potentialSnap.l1NormTo(toBeSnapped.mv)
                advantage = 2.
        }

        l1Norm /= advantage

        return l1Norm
    }

    let variantsDq = [new Dq(), new Dq(), new Dq(), new Dq()]
    let variantsFl = [new Fl(), new Fl(), new Fl(), new Fl()]
    handleSnaps = (potentialSnaps, toBeSnapped, numPotentialSnaps) => {

        if (debuggerTrigger)
            debugger
        for (let i = 0; i < numPotentialSnaps; ++i) {
            let ps = potentialSnaps[i]
            ps.snapRating = rate(ps.affecters[2], ps.mv, toBeSnapped)
            ps.visible = true
        }

        let bestSnapIndex = getBestAcceptableSnap(potentialSnaps, numPotentialSnaps)
        // logPotentialSnap(potentialSnaps[bestSnapIndex])

        // debugger

        for (let i = 0; i < numPotentialSnaps; ++i) {

            let ps = potentialSnaps[i]
            ps.setTransparency(i === bestSnapIndex ? .5 + .5 * Math.sin(frameCount * .12) : translucentOpacity)
            ps.boxHelper.visible = i === bestSnapIndex

            //and, look for ones that are similar to it and only show better rated version
            let variants = ps.mv.constructor === Dq ? variantsDq : variantsFl
            variants[0].copy(ps.mv)
            ps.mv.multiplyScalar(-1., variants[0])
            ps.mv.getReverse(variants[1])
            variants[0].getReverse(variants[2])
            //I mean really if the bivector part is the same then they're similar

            for(let j = 0; j < numPotentialSnaps; ++j) {
                
                if (i === j)
                    continue

                let ps2 = potentialSnaps[j]

                variants.forEach(variant => {
                    if (ps2.mv.l1NormTo(variant) < eps) {
                        let betterRated = ps2.snapRating > ps.snapRating ? ps2 : ps
                        betterRated.visible = false
                    }
                })
            }
        }

        // log(potentialSnaps[bestSnapIndex].visible)
    }

    getBestAcceptableSnap = ( potentialSnaps, numPotentialSnaps ) => {

        //something here
        //those points should have snapped?

        let lowestRating = Infinity
        let lowestRatingIndex = -1

        for (let i = 0; i < numPotentialSnaps; ++i) {
            let ps = potentialSnaps[i]
    
            if (ps.snapRating < lowestRating) {
                lowestRating = ps.snapRating
                lowestRatingIndex = i
            }
        }

        if (Math.abs(lowestRating) < tolerance)
            return lowestRatingIndex
        else
            return -1
    }
}