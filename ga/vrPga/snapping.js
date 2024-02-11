

function initSnapping() {

    const tolerance = .15// .06 for users

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

    let toSnapLog = new Dq()
    let potentialSnap = null
    let psDq = new Dq()
    let psFl = new Fl()
    let potentialAffecters = new Uint8Array(3)
    snap = (toBeSnapped) => {

        let l1NormLowest = Infinity
        potentialAffecters[0] = -1; potentialAffecters[1] = -1; potentialAffecters[2] = -1;
        function rate(opName) {

            if (potentialSnap.isZero() )
                return false

            let l1Norm = Infinity

            switch (opName) {

                // case `logarithm`:
                //      toBeSnapped.dq.logarithm(toSnapLog)
                //     //we merely require closeness to any scalar multiple
                //     toSnapLog.div( potentialSnap, dq1 ) //we require dq1 is close to scalar
                //     //scalar is omitted
                //     l1Norm = Math.abs(dq1[1]) + Math.abs(dq1[2]) + Math.abs(dq1[3]) + Math.abs(dq1[4]) + Math.abs(dq1[5]) + Math.abs(dq1[6])

                case `joinPt`:
                    let g = potentialSnap.grade()
                    let gradeGPart = toBeSnapped.mv.selectGrade( g, toBeSnapped.mv.constructor === Dq ? dq4 : fl4 )
                    if(gradeGPart.isZero())
                        return false
                    l1Norm = potentialSnap.l1NormTo(toBeSnapped.mv)

                    break
                
                default:
                    potentialSnap.l1NormTo(toBeSnapped.mv)

                    return
            }

            let isLowest = l1Norm < l1NormLowest
            if (isLowest)
                l1NormLowest = l1Norm
            
            return isLowest
        }
        
        for (let i = 0, il = snappables.length; i < il; i++) {

            let mv0 = snappables[i].mv

            let ineligible0 =
                snappables[i] === toBeSnapped || 
                aDependsOnB(snappables[i],toBeSnapped) || 
                (mv0.constructor === Dq && mv0.isScalarMultipleOf(oneDq))
                
            if(ineligible0)
                continue

            for (let k = 0, kl = operators.length; k < kl; k++) {

                let isSingleArgumentOp = mv0[operators[k]].length === 1
                if( isSingleArgumentOp ) {

                    let outputType = getType(operators[k], mv0.constructor)
                    if (outputType !== toBeSnapped.mv.constructor)
                        continue

                    potentialSnap = outputType === Dq ? psDq : psFl
                    mv0[operators[k]]( potentialSnap ).normalize()

                    if( rate(operators[k]) ) {
                        potentialAffecters[0] = i 
                        potentialAffecters[1] = -1
                        potentialAffecters[2] = k
                    }
                }
                else {
                    
                    for (let j = 0, jl = snappables.length; j < jl; j++) {

                        let mv1 = snappables[j].mv

                        let outputType = getType( operators[k], mv0.constructor, mv1.constructor )

                        let ineligible1 = 
                            outputType !== toBeSnapped.mv.constructor ||
                            snappables[j] === toBeSnapped || 
                            aDependsOnB( snappables[j], toBeSnapped ) ||  //maybe one day
                            (mv1.constructor === Dq && mv1.isScalarMultipleOf(oneDq)) || //for what?
                            i === j //mulReverse would get identity, add would do nothing, mul covered by log, join meet would be 0, inner would be scalar

                        if( ineligible1 )
                            continue

                        potentialSnap = outputType === Dq ? psDq : psFl
                        mv0[operators[k]](mv1, potentialSnap).normalize()

                        if( rate(operators[k]) ) {
                            potentialAffecters[0] = i
                            potentialAffecters[1] = j
                            potentialAffecters[2] = k
                        }
                    }
                }
            }
        }
        
        let yesToSnap = Math.abs(l1NormLowest) < tolerance
        if (!yesToSnap) {
            toBeSnapped.affecters[0] = null
            toBeSnapped.affecters[1] = null
            toBeSnapped.affecters[2] = -1
        }
        else {

            log(operators[potentialAffecters[2]], potentialAffecters[0], potentialAffecters[1])

            toBeSnapped.affecters[0] = snappables[potentialAffecters[0]]
            toBeSnapped.affecters[1] = potentialAffecters[1] === -1 ? null : snappables[potentialAffecters[1]]
            toBeSnapped.affecters[2] = potentialAffecters[2]

            updateFromAffecters(toBeSnapped)
            toBeSnapped.regularizeMarkupPos()
            
        }

        return yesToSnap
    }    
}