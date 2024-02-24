

function initSnapping() {

    const tolerance = .15// .06 for users
    let toSnapLogNormalized = new Dq()
    let potentialSnapLogNormalized = new Dq()

    function getType(opName, type1, type2) {
        if (opName === `sandwich`)
            return type2
        else if (opName === `projectOn`)
            return type1
        else if (opName === `dqTo`)
            return Dq
        else if (opName === `joinPt` || opName === `mul` || opName === `mulReverse` || opName === `meet`) {
            if (type1 === type2)
                return Dq
            else
                return Fl
        }
        else if(opName === `add` || opName === `sub`) {
            if(type1 === type2)
                return type1
            else
                return null
        }
        else if(opName === `velocity`) {
            if(type1 === Dq)
                return type2
            else
                return null
        }
        else if(opName === `logarithm` || opName === `sqrt`) {
            if(type1 === Dq)
                return Dq
            else
                return null
        }

        console.error("type weirdness: ", opName, type1, type2)
        return null
    }

    generatePotentialSnaps = (potentialSnapsVizes, toBeSnapped) => {

        let lowestUnused = 0

        function addPs(i, j, k) {
            if (potentialSnapsVizes[lowestUnused] === undefined)
                potentialSnapsVizes[lowestUnused] = new toBeSnapped.constructor(0x666666, true, true)

            let psv = potentialSnapsVizes[lowestUnused]
            psv.affecters[0] = snappables[i]
            psv.affecters[1] = snappables[j]
            psv.affecters[2] = k
            updateFromAffecters(psv)

            psv.markupPos.addNoise(4,7, .06)
            psv.regularizeMarkupPos()
            psv.visible = true

            ++lowestUnused
        }

        for (let i = 0, il = snappables.length; i < il; i++) {

            let mv0 = snappables[i].mv

            let ineligible0 =
                snappables[i] === toBeSnapped ||
                mv0.isZero()
            aDependsOnB(snappables[i], toBeSnapped) ||
                (mv0.constructor === Dq && mv0.isScalar())

            if (ineligible0)
                continue

            for (let k = 0, kl = operators.length; k < kl; k++) {

                let isSingleArgumentOp = mv0[operators[k]].length === 1
                if (isSingleArgumentOp) {

                    let outputType = getType(operators[k], mv0.constructor)
                    if (outputType !== toBeSnapped.mv.constructor)
                        continue

                    addPs(i, -1, k)
                }
                else for (let j = /*i+1*/0, jl = snappables.length; j < jl; j++) {

                    let mv1 = snappables[j].mv

                    let outputType = getType(operators[k], mv0.constructor, mv1.constructor)

                    let ineligible1 =
                        outputType !== toBeSnapped.mv.constructor ||
                        mv1.isZero() ||
                        snappables[j] === toBeSnapped ||
                        aDependsOnB(snappables[j], toBeSnapped) ||  //maybe one day
                        (mv1.constructor === Dq && mv1.isScalar()) || //for what?
                        i === j //mulReverse would get identity, add would do nothing, mul covered by log, join meet would be 0, inner would be scalar

                    if (ineligible1)
                        continue

                    addPs(i, j, k)
                }
            }
        }

        return lowestUnused
    }

    function rate(opName, potentialSnap, toBeSnapped) {

        if (potentialSnap.isZero())
            return false

        let l1Norm = Infinity

        let advantage = 1.

        switch (opName) {

            // case `logarithm`:
            //      toBeSnapped.dq.logarithm(toSnapLog)
            //     //we merely require closeness to any scalar multiple
            //     toSnapLog.div( potentialSnap, dq1 ) //we require dq1 is close to scalar
            //     //scalar is omitted
            //     l1Norm = Math.abs(dq1[1]) + Math.abs(dq1[2]) + Math.abs(dq1[3]) + Math.abs(dq1[4]) + Math.abs(dq1[5]) + Math.abs(dq1[6])

            case `joinPt`:
                let g = potentialSnap.grade()
                let gradeGPart = toBeSnapped.mv.selectGrade(g, toBeSnapped.mv.constructor === Dq ? dq4 : fl4)
                if (gradeGPart.isZero())
                    return false
                //gotta make it NOT a screw axis
                if (g === 2)
                    gradeGPart.normalize()

                l1Norm = potentialSnap.l1NormTo(gradeGPart)

                advantage = 5. // whatever it needs to make it feel right for tolerance = 1

                break

            case `dqTo`:

                toBeSnapped.mv.logarithm(toSnapLogNormalized)
                potentialSnap.logarithm(potentialSnapLogNormalized)
                if (!toSnapLogNormalized.isZero() && !potentialSnapLogNormalized.isZero()) {
                    potentialSnapLogNormalized.normalize()
                    toSnapLogNormalized.normalize()
    
                    l1Norm = toSnapLogNormalized.l1NormTo(potentialSnapLogNormalized)
                    advantage = 4.
                }

                break

            default:
                l1Norm = potentialSnap.l1NormTo(toBeSnapped.mv)
        }

        l1Norm /= advantage

        return l1Norm
    }

    getBestAcceptableSnap = ( potentialSnaps, toBeSnapped, numPotentialSnaps ) => {

        let lowestRating = Infinity
        let lowestRatingIndex = -1

        for (let i = 0; i < numPotentialSnaps; ++i) {
            let ps = potentialSnaps[i]
    
            let rating = rate(operators[ps.affecters[2]], ps.mv, toBeSnapped)
    
            if (rating < lowestRating) {
                lowestRating = rating
                lowestRatingIndex = i
            }
        }

        if (Math.abs(lowestRating) < tolerance)
            return lowestRatingIndex
        else
            return -1
    }
}