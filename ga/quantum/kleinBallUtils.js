/*
You need to convert both sets of 3 points to a canonical form, which you do as follows:

- The 3 points are null vectors in 4D (ie the 2d conformal algebra).
- Scale these points so that all 3 inner products between pairs of points are -1.
- Introduce a 4th vector orthogonal to the other 3 (dualise the trivector formed by them) and scale this vector to unit magnitude.

Do this for both sets of 3 vectors and you have a frame system that can be interchanged by a rotor. The rotor recovery formula can then be used - sum 1 frame with the reciprocal of the other frame, and normalise the result and you have the rotor.
*/


function motorFromPsToQsChrisStyle(p, q, target) {
    //p currently is xyzNullPoints, no need for scaling
    //unfinished

    function basisFromThreePoints(pts) {
        let arr = []

        let combos = [0, 1, 0, 2, 0, 3, 1, 2, 1, 3, 2, 3]
        for (let i = 0; i < 6; ++i) {
            let first = p[combos[i * 2 + 0]]
            let second = p[combos[i * 2 + 0]]

            let ip = first.inner(second, mv0)[0]
            let multiplicand = -1. / ip
            //push to your array

            log(first.inner(second, mv0)[0]) //want to be -1 of course. Though might you have broken previous ones?
        }

        let planeOfAllThree = p[0].join(p[1].join(p[2], mv0))
        let fourthBasisPoint = planeOfAllThree.dual()
        arr.push(fourthBasisPoint)

        delete planeOfAllThree

        return arr
    }

    let pBasis = basisFromThreePoints(p)
    let qBasis = basisFromThreePoints(q)
    
}

function motorFromPsToQs(p, q, target) {

    // let nInfinity = e3.clone().add(e4)
    // let nOrigin = e3.clone().multiplyScalar(-1.).add(e4)
    // function conformalUp(x, target) {
    //     x.mul(x, mv0)
    //     mv0.mul(nInfinity, target)
    //     target.multiplyScalar(.5)
    //     target.add(nOrigin)
    //     target.add(x)
    // }

    //I mean, wouldn't it be nicer to do it on the circle/sphere?
    //would be nice to find that the picture tells you something about probability
    
    let bigM = new Mv()
    bigM[0] = 1.
    let bigQ = new Mv() //The ending mv (changes grade slowly)
    bigQ[15] = 1.
    let bigP = new Mv() //The starting mv (changes grade slowly)
    bigP[15] = 1.

    let pTransformedByCurrentM = new Mv()

    let toBeCopied = new Mv()
    for (let i = 0, il = p.length; i < il; ++i) {

        bigM.sandwich(p[i], pTransformedByCurrentM)
        pTransformedByCurrentM.join(bigQ, bigP)

        bigQ.copy(q[i].join(bigQ, toBeCopied))

        let motorTakingPToQ = new Mv()
        // debugger
        bigQ.simpleDiv(bigP, motorTakingPToQ)
        motorTakingPToQ.sqrtBiReflection(motorTakingPToQ)

        bigM.copy(motorTakingPToQ.mul(bigM, toBeCopied))

        delete motorTakingPToQ
    }

    delete pTransformedByCurrentM
    delete bigM
    delete bigQ
    delete bigP
    delete toBeCopied

    return target.copy(bigM)
}

function planeToSphere(numerator, denominator, target) {
    if (target === undefined)
        target = new Mv()

    let x, y, z
    if (denominator.re === 0. && denominator.im === 0.) {
        //result is point at infinity
        x = 0.
        y = 1.
        z = 0.
    }
    else {
        let temp = new Complex()
        numerator.div(denominator, temp)
        let re = temp.re
        let im = temp.im
        delete temp
        let denom = 1. / (1. + re * re + im * im)

        x = (2. * re) * denom
        y = (1. - re * re - im * im) * denom
        z = (2. * im) * denom
    }

    //should you normalize here? Current situation is that they're normalized and have e123 = 1.
    return target.point(x, y, z, 1.) // these are points on the "light cone"
}

function matrixToMotor(mat, target) {
    if (target === undefined)
        target = new Mv()

    //can just transpose
    let a = mat.get(0, 0), b = mat.get(0, 1)
    let c = mat.get(1, 0), d = mat.get(1, 1)

    let infinityPrimed = planeToSphere(a, c, mv3)

    let aPlusB = c0.copy(a).add(b)
    let cPlusD = c1.copy(c).add(d)
    let onePrimed = planeToSphere(
        aPlusB,
        cPlusD)
    delete aPlusB
    delete cPlusD

    let aIPlusB = new Complex().copy(b).add(a.mul(iComplex, c0))
    let cIPlusD = new Complex().copy(d).add(c.mul(iComplex, c0))
    let iPrimed = planeToSphere(aIPlusB, cIPlusD)
    delete aIPlusB
    delete cIPlusD

    let q = [
        onePrimed,
        infinityPrimed,
        iPrimed]
    //bloch sphere / complex numbers convention: z is up. Project from up onto (x,y) = (re,im)
    //computer graphics convention: y is up
    //our convention: project from y onto (x,z) = (re,im)

    // xyzNullPoints.forEach((qi)=>{qi.log()})
    // q.forEach((qi)=>{qi.log()})
    motorFromPsToQs(xyzNullPoints, q, target)

    delete q
    delete infinityPrimed
    delete onePrimed
    delete iPrimed

    return target
}