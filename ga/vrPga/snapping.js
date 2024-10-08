/*
 */

function initSnapping(scalarOnlyDqVizes) {

    {
        var decomposition = new Decomposition(1.)
        decomposition.a.dontUpdateMarkupPos = true
        decomposition.b.dontUpdateMarkupPos = true
        decomposition.currentAttachment = null
        decomposition.a.dontUpdateMarkupPos = true
        decomposition.b.dontUpdateMarkupPos = true
        let mp0Desired = new Fl()
        let mp1Desired = new Fl()

        detachDecomposition = () => {
            decomposition.currentAttachment = null
        }
        updateSnapDecomposition = () => {

            let best = decomposition.currentAttachment

            if (best === null) {
                decomposition.setVisibility(false)
                return
            }

            let affecters = best.affecters
            decomposition.setVisibility(true)
            decomposition.a.dq.copy(affecters[1].mv)
            decomposition.b.dq.copy(affecters[0].mv)

            //figure out the new markupPos
            mp0Desired.copy(best.markupPos)
            affecters[1].dq.sandwich(mp0Desired, mp1Desired)

            decomposition.a.markupPos.lerpSelf(mp0Desired, .04)
            decomposition.b.markupPos.lerpSelf(mp1Desired, .04)
        }
    }

    const translucentOpacity = .45//.65
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
        else if (opName === `joinPt` || opName === `mul` || 
            opName === `mulReverse` || opName === `meet` || opName === `inner`) {
            if (type1 === type2)
                return Dq
            else
                return Fl
        }

        console.error("type weirdness: ", opName, type1, type2)
        return null
    }

    function typeCheck(opIndex, mv0, mv1, toBeSnapped) {
        let g0 = mv0.grade()
        let g1 = mv1.grade()
        if ( (g0 === Infinity || g0 === 0 || g0 === 4) ||
             (g1 === Infinity || g1 === 0 || g1 === 4) )
            return false
            
        let isObject0 = g0 === 1 || g0 === 2 || g0 === 3
        let isObject1 = g1 === 1 || g1 === 2 || g1 === 3
        let isNull0 = mv0.eNormSq() === 0.
        let isNull1 = mv1.eNormSq() === 0.

        //For now, exact 180s and point reflections are for mathematicians
        //so, objects and trasforms coincide at reflections
        let isTransform0 = (g0 === -1 || g0 === -2 || g0 === 1) && !isNull0
        let isTransform1 = (g1 === -1 || g1 === -2 || g1 === 1) && !isNull1

        let opAcceptsTypes = true
        switch(operators[opIndex]) {
            case `mul`: // the only thing that can output a rotoreflection
                opAcceptsTypes = g0 === -2 && g1 === -2 // only evens for now isTransform0 && isTransform1
                break
            case `sandwich`:
                opAcceptsTypes = isTransform0// && isObject1
                //just translating a rotation, no?
                break
            case `dqTo`:
                opAcceptsTypes = isObject0 && isObject1 && !isNull0 && !isNull1
                break
            case `joinPt`:
                opAcceptsTypes = (g0 === 2 || g0 === 3) && g1 === 3 //no scalars allowed, for now
                break
            case `meet`:
                opAcceptsTypes = (g0 === 1 && (g1 === 1 || g1 === 2)) || (g0 === 2 && g0 === 1)
                break
            case `add`:
                opAcceptsTypes = g0 === g1
                break
            case `projectOn`:
                opAcceptsTypes = isObject0 && isObject1 && g0 !== g1 && !isNull0 && !isNull1
                break
            case `userPow`:
                let mv1IsPureTranslation = !isObject1 &&
                    mv1[0] !== 0. && mv1[4] === 0. && mv1[5] === 0. && mv1[6] === 0. && mv1[7] === 0.
                opAcceptsTypes = g0 === -2 && mv1IsPureTranslation
                break
            // case `velocityUnder`:
            //     opAcceptsTypes = g0 === -2 && isObject1 //not thinking about lines or planes for now
            // case `projectTransformOn`:
            //     opAcceptsTypes = isTransform0 && isObject1
            default: //new, I suppose
                console.error("no eligibility criteria for ", operators[opIndex])
                opAcceptsTypes = true
        }

        if(!opAcceptsTypes)
            return false

        let outputType = getType(operators[opIndex], mv0.constructor, mv1.constructor)
        return outputType === toBeSnapped.mv.constructor
    }

    generatePotentialSnaps = (potentialSnapsVizes, toBeSnapped) => {

        let lowestUnused = 0

        function addPotentialSnap(i, j, k) {
            if (potentialSnapsVizes[lowestUnused] === undefined) {
                potentialSnapsVizes[lowestUnused] = new toBeSnapped.constructor(0xFFA500, true)
                potentialSnapsVizes[lowestUnused].dontUpdateMarkupPos = false
            }

            let psv = potentialSnapsVizes[lowestUnused]
            psv.affecters[0] = snappables[i]
            psv.affecters[1] = j === -1 ? null : snappables[j]
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
                scalarOnlyDqVizes.indexOf(sn) !== -1 ||
                sn === toBeSnapped ||
                mv0.isZero() ||
                sn.visible === false ||
                aDependsOnB(sn, toBeSnapped)

            if (ineligible0)
                return

            for (let k = 0, kl = operators.length; k < kl; k++) {

                let op = operators[k]
                
                let isSingleArgumentOp = mv0[op] === undefined ? false : mv0[op].length === 1
                if (isSingleArgumentOp) {

                    let outputType = getType(op, mv0.constructor)
                    if (outputType !== toBeSnapped.mv.constructor)
                        continue

                    addPotentialSnap(i, -1, k)
                }
                else for (let j = /*i+1*/0, jl = snappables.length; j < jl; j++) {
                    if(snappables[j] === null)
                        continue

                    let mv1 = snappables[j].mv

                    let ineligible1 =
                        (scalarOnlyDqVizes.indexOf(snappables[j]) !== -1 && op !== `userPow`) ||
                        (snappables[j] === toBeSnapped && !(op === `sandwich` && sn.constructor === DqViz )) ||
                        (op === `sandwich` && snappables[j] === toBeSnapped) || //one day maybe
                        mv1.isZero() ||
                        snappables[j].visible === false ||
                        aDependsOnB(snappables[j], toBeSnapped) ||  //maybe one day

                        i === j || //mulReverse would get identity, add would do nothing, mul covered by log, join meet would be 0, inner would be scalar
                        !typeCheck(k, mv0, mv1, toBeSnapped)

                    if (ineligible1)
                        continue

                    // if (op === `sandwich`)
                    //     debugger

                    addPotentialSnap(i, j, k)
                }
            }
        })

        //the ones that have been made non-visible
        snappables.forEach(s => {
            if (s === null)
                return

            if(s.visible === true || s === toBeSnapped || s.constructor !== toBeSnapped.constructor || aDependsOnB(s, toBeSnapped) || s.mv.isZero() )
                return

            if (potentialSnapsVizes[lowestUnused] === undefined)
                potentialSnapsVizes[lowestUnused] = new toBeSnapped.constructor(0xFFA500, true )

            //a more proper thing might be for this potentialSnapViz to **be** s
            let psv = potentialSnapsVizes[lowestUnused]
            makeUnaffected(psv)
            psv.visible = true
            psv.mv.copy(s.mv)

            ++lowestUnused
        })

        return lowestUnused
    }

    let tbsnFl = new Fl()
    let tbsnDq = new Dq()
    let pscDq = new Dq()
    let pscFl = new Fl()
    
    function rate(opIndex, potentialSnap, toBeSnapped) {

        let psMv = potentialSnap.mv

        if (psMv.isZero())
            return false

        let l1Norm = Infinity

        let advantage = 1.

        //fucking mess
        function compareBlades() {

            let g = psMv.grade()
            let toBeSnappedGradeG = toBeSnapped.mv.selectGrade(g, toBeSnapped.mv.constructor === Dq ? tbsnDq : tbsnFl)
            if (toBeSnappedGradeG.isZero())
                return Infinity
            //gotta make it NOT a screw axis
            toBeSnappedGradeG.normalize()

            let potentialSnapComparable = psMv.constructor === Dq ? pscDq : pscFl
            potentialSnapComparable.copy(psMv)
            potentialSnapComparable.normalize()
            if (g === 3 && potentialSnapComparable[7] !== toBeSnappedGradeG[7])
                potentialSnapComparable.multiplyScalar(-1., potentialSnapComparable)

            return potentialSnapComparable.l1NormTo(toBeSnappedGradeG)
        }

        function compareDqs() {
            toBeSnapped.mv.logarithm(toSnapLogNormalized)
            psMv.logarithm(potentialSnapLogNormalized)
            if (toSnapLogNormalized.isZero() || potentialSnapLogNormalized.isZero())
                return Infinity
            else {
                potentialSnapLogNormalized.normalize()
                toSnapLogNormalized.normalize()

                return toSnapLogNormalized.l1NormTo(potentialSnapLogNormalized)
            }
        }

        let opName = opIndex === -1 ? `` : operators[opIndex] //could be -1 because it's just an mv you
        switch (opName) {

            //higher advantage = make it more likely
            case `userPow`:
                l1Norm = compareDqs()
                advantage = 10.
                break

            case `joinPt`:
                l1Norm = compareBlades()
                advantage = 5. // whatever it needs to make it feel right for tolerance = 1
                break

            case `projectOn`:
                l1Norm = compareBlades()
                advantage = 5.
                break

            case `sandwich`:
                l1Norm = compareBlades()

                advantage = 5.

                break

            case `mul`:
                l1Norm = compareDqs()
                advantage = 8.

                //"parenting"
                if (toBeSnapped.sclptable !== null && 
                    potentialSnap.affecters[0].sclptable !== null &&
                    toBeSnapped.sclptable.lastViz !== null && toBeSnapped.sclptable.lastViz === potentialSnap.affecters[1])
                    advantage = 9999.

                break

            case `dqTo`:
                l1Norm = compareDqs()
                advantage = 4.
                break

            default: //this includes -1, because sometimes you snap to something not defined by behaviour
                l1Norm = psMv.l1NormTo(toBeSnapped.mv)
                advantage = 2.
        }

        l1Norm /= advantage

        return l1Norm
    }

    let variantsDq = [new Dq(), new Dq(), new Dq(), new Dq()]
    let variantsFl = [new Fl(), new Fl(), new Fl(), new Fl()]
    handleSnaps = (potentialSnaps, toBeSnapped, numPotentialSnaps, fuckYouPsvs) => {

        // if(frameCount % 10 === 0)
        //     log(frameCount)

        // if(frameCount > 900)
        //     debugger

        for (let i = 0; i < numPotentialSnaps; ++i) {
            let ps = potentialSnaps[i]
            if (i < numPotentialSnaps && fuckYouPsvs.indexOf(ps) === -1)
                ps.snapRating = rate( ps.affecters[2], ps, toBeSnapped )
            else
                ps.snapRating = Infinity
        }

        for (let i = 0; i < numPotentialSnaps; ++i) {

            let ps = potentialSnaps[i]
            
            //and, look for ones that are similar to it and only show better rated version
            let variants = ps.mv.constructor === Dq ? variantsDq : variantsFl
            variants[0].copy(ps.mv)
            ps.mv.multiplyScalar(-1., variants[0])
            ps.mv.getReverse(variants[1])
            variants[0].getReverse(variants[2])

            for(let j = 0; j < numPotentialSnaps; ++j) {
                
                if (i === j)
                    continue

                let potentialJustAVariant = potentialSnaps[j]

                variants.forEach(variant => {
                    if (potentialJustAVariant.mv.l1NormTo(variant) < eps) {
                        let worseRated = potentialJustAVariant.snapRating > ps.snapRating ? potentialJustAVariant : ps
                        worseRated.snapRating = Infinity
                    }
                })
            }
        }

        potentialSnaps.sort((a, b) => a.snapRating - b.snapRating)

        let flashingOpacity = .5 + .5 * Math.sin(frameCount * .12)

        // logPotentialSnap(potentialSnaps[bestSnapIndex])
        
        for(let i = 0, il = potentialSnaps.length; i < il; ++i) {
            let ps = potentialSnaps[i]
            ps.visible = i < 3
            ps.setOpacity(translucentOpacity)
            ps.boxHelper.visible = false
        }

        if (potentialSnaps.length !== 0 ) {

            let best = potentialSnaps[0]
            best.boxHelper.visible = false
            best.setOpacity(flashingOpacity)

            if( best.affecters[0] !== null)
                best.affecters[0].setOpacity(flashingOpacity)
            if( best.affecters[1] !== null)
                best.affecters[1].setOpacity(flashingOpacity)

            let affecters = best.affecters
            if (operators[affecters[2]] === "mul" && affecters[0].mv.constructor === Dq && affecters[1].mv.constructor === Dq) {

                if(decomposition.currentAttachment !== best) {
                    decomposition.currentAttachment = best

                    decomposition.a.markupPos.copy(affecters[1].markupPos)
                    decomposition.a.setColor(affecters[1].rotAxisMesh.material.color)
                    decomposition.b.markupPos.copy(affecters[0].markupPos)
                    decomposition.b.setColor(affecters[0].rotAxisMesh.material.color)
                }
            }
            else
                decomposition.currentAttachment = null
        }
    }
}