function initSnapping() {

    const tolerance = .15// .06 for users

    let toSnapLog = new Dq()
    let potentialSnap = new Dq()
    let potentialAffecters = new Uint8Array(3)
    snap = (dqVizToSnap) => {

        dqVizToSnap.dq.logarithm(toSnapLog)

        let l1NormLowest = Infinity
        potentialAffecters[0] = -1; potentialAffecters[1] = -1; potentialAffecters[2] = -1;
        function rate(opName) {

            if (potentialSnap.isZero())
                return

            let l1Norm = -1

            switch (opName) {

                // case `logarithm`:
                //     //we merely require closeness to any scalar multiple
                //     toSnapLog.div( potentialSnap, dq1 ) //we require dq1 is close to scalar
                //     //scalar is omitted
                //     l1Norm = Math.abs(dq1[1]) + Math.abs(dq1[2]) + Math.abs(dq1[3]) + Math.abs(dq1[4]) + Math.abs(dq1[5]) + Math.abs(dq1[6])
                
                default:
                    potentialSnap.normalize()

                    let subtraction = potentialSnap.sub(dqVizToSnap.dq, dq1)
                    l1Norm = Math.abs(subtraction[0]) + Math.abs(subtraction[1]) + Math.abs(subtraction[2]) + Math.abs(subtraction[3]) + Math.abs(subtraction[4]) + Math.abs(subtraction[5]) + Math.abs(subtraction[6]) + Math.abs(subtraction[7])
            }

            let lowest = l1Norm < l1NormLowest
            if (lowest)
                l1NormLowest = l1Norm
            
            return lowest
        }
        
        for (let i = 0, il = snappables.length; i < il; i++) {

            let translator0 = snappables[i]
            if (translator0 === dqVizToSnap || translator0.dependsOn(dqVizToSnap) || translator0.dq.equals(oneDq) )
                continue

            for (let k = 0, kl = operators.length; k < kl; k++) {

                if( translator0.dq[operators[k]].length === 1 ) {
                    translator0.dq[operators[k]](potentialSnap).normalize()
                    if( rate(operators[k]) ) {
                        potentialAffecters[0] = i; potentialAffecters[1] = -1; potentialAffecters[2] = k;
                    }
                }
                else {
                    for (let j = 0, jl = snappables.length; j < jl; j++) {

                        let translator1 = snappables[j]
                        if (translator1 === dqVizToSnap || translator1.dependsOn(dqVizToSnap) || translator1.dq.equals(oneDq))
                            continue
    
                        if( i === j )
                            continue //mulReverse would get identity, add would do nothing, mul covered by log
                        
                        translator0.dq[operators[k]](translator1.dq, potentialSnap).normalize()
                        if( rate(operators[k]) ) {
                            potentialAffecters[0] = i; potentialAffecters[1] = j; potentialAffecters[2] = k;
                        }
                    }
                }
            }
        }
        
        let gonnaSnap = Math.abs(l1NormLowest) < tolerance
        if (!gonnaSnap) {
            dqVizToSnap.affecters[0] = null
            dqVizToSnap.affecters[1] = null
            dqVizToSnap.affecters[2] = -1
        }
        else {

            log(operators[potentialAffecters[2]], potentialAffecters[0], potentialAffecters[1])

            dqVizToSnap.affecters[0] = snappables[potentialAffecters[0]]
            dqVizToSnap.affecters[1] = potentialAffecters[1] === -1 ? null : snappables[potentialAffecters[1]]
            dqVizToSnap.affecters[2] = potentialAffecters[2]
            
        }

        return gonnaSnap
    }    
}