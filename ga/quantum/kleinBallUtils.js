/*
Conventions
    bloch sphere / complex numbers convention: z is up. Project from up onto (x,y) = (re,im)
    pauli: x gate reflects up/down, eg z
    computer graphics convention: y is up
    our convention: project from y onto (x,z) = (re,im)
    wikipedia convention: z is out of complex plane and -1 is point at infinity. We have y=1 is point at infinity

You need to convert both sets of 3 points to a canonical form, which you do as follows:

- The 3 points are null vectors in 4D (ie the 2d conformal algebra).
- Scale these points so that all 3 inner products between pairs of points are -1.
- Introduce a 4th vector orthogonal to the other 3 (dualise the trivector formed by them) and scale this vector to unit magnitude.

Do this for both sets of 3 vectors and you have a frame system that can be interchanged by a rotor.
The rotor recovery formula can then be used:
    Sum 1 frame with the reciprocal of the other frame, and normalise the result and you have the rotor.

To get the reciprocal frame you just wedge the n-1 other vectors together, dualise 
    and divide by a volume factor.
    
The formula is in my book. It's quite standard linear algebra - doesn't require anything more complicated.
*/

function insertPlanes(initialPlaneMvs) {
    let translator = new Mv()
    function insertSeriesOfPlanes(startingPlane, n, sep) {
        for (let i = 0; i < n; ++i) {
            e4.mul(startingPlane, translator)
            translator.normalize()
            translator.multiplyScalar(sep * (i + .5 - n / 2.))
            translator[0] += 1.

            initialPlaneMvs.push(translator.sandwich(startingPlane).normalize())
        }
    }

    function pushFromTri(vertArray, t, i) {
        pointFromVertIndex(vertArray, t[0], mv0)
        pointFromVertIndex(vertArray, t[1], mv1)
        pointFromVertIndex(vertArray, t[2], mv2)
        mv0.join(mv1, mv3).join(mv2, mv4)

        initialPlaneMvs.push(mv4.clone())
    }

    let icoverts = [
        [0., PHI, -1.],
        [0., PHI, 1.],
        [0., -PHI, -1.],
        [0., -PHI, 1.],
        [PHI, -1., 0.],
        [PHI, 1., 0.],
        [-PHI, -1., 0.],
        [-PHI, 1., 0.],
        [1., 0., PHI],
        [-1., 0., PHI],
        [1., 0., -PHI],
        [-1., 0., -PHI]]

    icoverts.forEach((v, i) => {
        if (i % 2)
            return

        let im = new Mv()
        im[1] = v[0]
        im[2] = v[1]
        im[3] = v[2]
        im.normalize()

        insertSeriesOfPlanes(im, 4, .11)
    })

    let octaVerts = [
        [1., 0., 0.],
        [-1., 0., 0.],
        [0., 1., 0.],
        [0., -1., 0.],
        [0., 0., 1.],
        [0., 0., -1.],
    ]
    let octaTris = [ //counter clockwise
        [0, 2, 4],
        [1, 4, 2],
        [4, 3, 0],
        [2, 0, 5],

        [1, 5, 3],
        [0, 3, 5],
        [3, 4, 1],
        [5, 1, 2]
    ]

    function pointFromVertIndex(vertArray, i, target) {
        if (target === undefined)
            target = new Mv()

        let v = vertArray[i]
        target.point(v[0], v[1], v[2], 1.)
        return target
    }

    // octaTris.forEach((t, i) => { pushFromTri(octaVerts,t,i)})

    // initialPlaneMvs.push(new Mv().plane(1.,1.,1.,0.))
    // initialPlaneMvs.push(new Mv().plane(-1.,1.,1.,0.))
    // initialPlaneMvs.push(new Mv().plane(1.,-1.,1.,0.))
    // initialPlaneMvs.push(new Mv().plane(1.,1.,-1.,0.))

    let cubeVerts = [
        [1., 1., 1.],

        [-1., 1., 1.],
        [1., -1., 1.],
        [1., 1., -1.],

        [1., -1., -1.],
        [-1., 1., -1.],
        [-1., -1., 1.],

        [-1., -1., -1.],
    ]
    cubeVerts.forEach((v) => { v[0] /= Math.sqrt(3.); v[1] /= Math.sqrt(3.); v[2] /= Math.sqrt(3.) })
    let cubeTris = [
        [0, 1, 2],
        [0, 2, 3],
        [0, 3, 1],

        [7, 5, 4],
        [7, 6, 5],
        [7, 4, 6]
    ]
    // cubeTris.forEach((t, i) => { pushFromTri(cubeVerts,t,i)})

    //----------------THREE ORTHOGONAL PLANES
    // initialPlaneMvs.push(new Mv().plane(1., 0., 0., 0.))
    // initialPlaneMvs.push(new Mv().plane(0., 1., 0., 0.))
    // initialPlaneMvs.push(new Mv().plane(0., 0., 1., 0.))

    //----------------LATITUDE AND LONGTITUDE
    // let numMeridians = 12
    // for (let i = 0.; i < numMeridians / 2.; ++i)
    //     initialPlaneMvs.push(new Mv().plane(Math.cos(TAU * i / numMeridians), 0., Math.sin(TAU * i / numMeridians), 0.))
    // insertSeriesOfPlanes(e2, 7, .18)

    //---------------SYMMETRY PLANES OF OCTAHEDRON
    // let numMeridians = 8
    // for (let i = 0; i < numMeridians / 2; ++i) {
    //     initialPlaneMvs.push(new Mv().plane(Math.cos(TAU * i / numMeridians), 0., Math.sin(TAU * i / numMeridians), 0.))
    //     initialPlaneMvs.push(new Mv().plane(0., Math.cos(TAU * i / numMeridians), Math.sin(TAU * i / numMeridians), 0.))
    //     initialPlaneMvs.push(new Mv().plane(Math.cos(TAU * i / numMeridians), Math.sin(TAU * i / numMeridians), 0., 0.))
    // }

    //----------------SMITH CHART
    if (0) {
        let tri1 = pointFromVertIndex(octaVerts, 2).join(pointFromVertIndex(octaVerts, 0)).join(pointFromVertIndex(octaVerts, 4)).normalize()
        let tri2 = pointFromVertIndex(octaVerts, 2).join(pointFromVertIndex(octaVerts, 1)).join(pointFromVertIndex(octaVerts, 5)).normalize()

        let surfaceMotor = tri2.mul(tri1)
        for (let i = 0; i < 28; ++i)
            surfaceMotor = surfaceMotor.sqrtBiReflection()
        surfaceMotor.log()

        let spineRotor = e31.sqrtBiReflection()

        let central = e1.clone().add(e3).normalize()
        for (let l = 0; l < 2; ++l) {
            for (let k = 0; k < 2; ++k) {
                for (let i = 0; i < 11; ++i) {
                    let im = central.clone()
                    for (let j = 0; j < i; ++j) {
                        surfaceMotor.sandwich(im, mv0).normalize()
                        im.copy(mv0)
                    }
                    if (l)
                        im.copy(spineRotor.sandwich(im, mv0).normalize())
                    initialPlaneMvs.push(im)
                }
                surfaceMotor[0] *= -1.
            }
        }
    }
}

function getReciprocalFrame(frame) {
    let rf = []

    let volumeElement = oneMv.clone()
    for (let i = 0; i < frame.length; ++i)
        volumeElement.copy(frame[i].meet(volumeElement, mv0))

    let othersWedged = new Mv()
    for(let j = 0; j < frame.length; ++j) {
        othersWedged.copy(oneMv) //identity for wedge
        for (let i = 0; i < frame.length; ++i) {
            if(i === j)
                continue

            othersWedged.copy(frame[i].meet(othersWedged, mv0))
        }

        let newMv = othersWedged.simpleDiv(volumeElement)
        newMv.multiplyScalar(Math.pow(-1.,j))
        rf.push(newMv)
    }

    delete volumeElement
    delete othersWedged

    return rf
}

function motorFromPsToQsChrisStyle(p, q, target) {
    //soooooo, could very well be using the wrong sort of dual. Check!

    function frameFromThreePoints(dualPts) {
        let frameVecs = []
        for (let i = 0; i < dualPts.length; ++i)  {
            frameVecs.push(dualPts[i].dual())
        }

        let ip = frameVecs[0].inner(frameVecs[1], mv0)[0]
        frameVecs[0].multiplyScalar(-1. / ip)
        
        ip = frameVecs[2].inner(frameVecs[1], mv0)[0]
        frameVecs[2].multiplyScalar(-1. / ip)
        
        ip = frameVecs[2].inner(frameVecs[0], mv0)[0]
        frameVecs[0].multiplyScalar( 1. / Math.sqrt(Math.abs(ip)))
        frameVecs[2].multiplyScalar( 1. / Math.sqrt(Math.abs(ip)))

        ip = frameVecs[0].inner(frameVecs[1], mv0)[0]
        frameVecs[1].multiplyScalar( -1. / ip)

        let extraVec = frameVecs[0].meet( frameVecs[1].meet(frameVecs[2],mv0), mv1 ).dual()
        extraVec.normalize()
        frameVecs.push(extraVec)

        return frameVecs
    }

    let pFrame = frameFromThreePoints(p)
    let qFrame = frameFromThreePoints(q)

    let rf = getReciprocalFrame(pFrame) //bit weird that it's got .5s but that might be the way it is

    target.copy(oneMv)
    for(let i = 0; i < qFrame.length; ++i) {
        qFrame[i].mul(rf[i],mv0)
        target.add(mv0)
    }
    target.normalize()

    //p is going to have its reciprocal taken because
}

function motorFromPsToQs(p, q, target) {

    //you're getting points ON the smith sphere and that's ok
    //they all have e123 = 1, fine
    //you want to scale it such that it's on the horosphere
    //in vector picture

    //if you want points NOT on the sphere

    
    

    //I mean, wouldn't it be nicer to do it on the circle/sphere?
    //would be nice to find that the picture tells you something about probability
    
    let bigM = new Mv()
    bigM[0] = 1.
    let bigQ = nInfinity.clone() //The ending mv (changes grade slowly)
    let bigP = new Mv() //The starting mv (changes grade slowly)

    let pTransformedByCurrentM = new Mv()

    let toBeCopied = new Mv()
    let motorTakingPToQ = new Mv()
    for (let i = 0, il = p.length; i < il; ++i) {

        bigM.sandwich(p[i], pTransformedByCurrentM)
        pTransformedByCurrentM.join(bigQ, bigP)

        bigQ.copy(q[i].join(bigQ, toBeCopied))

        debugger
        bigQ.simpleDiv(bigP, motorTakingPToQ)
        motorTakingPToQ.sqrtBiReflection(motorTakingPToQ)

        bigM.copy(motorTakingPToQ.mul(bigM, toBeCopied))

    }
    
    delete motorTakingPToQ
    delete pTransformedByCurrentM
    delete bigM
    delete bigQ
    delete bigP
    delete toBeCopied

    return target.copy(bigM)
}

function complexToSphere(numerator, denominator, target) {
    if (target === undefined)
        target = new Mv()

    let x, y, z
    if (denominator.re === 0. && denominator.im === 0. ) {
        // if(numerator.re === 1.)
        //result is point at infinity. It's DEFINITELY in that state
        x = 0.
        y = -1.
        z = 0.
    }
    else {
        let temp = new Complex()
        numerator.div(denominator, temp)
        let re = temp.re
        let im = temp.im
        delete temp
        let normalizer = 1. / (1. + re * re + im * im)

        x = (2. * re) * normalizer
        y = (1. - re * re - im * im) * normalizer
        z = (2. * im) * normalizer
    }

    //should you normalize here? Current situation is that they're normalized and have e123 = 1.
    return target.point(x, y, z, 1.) // these are points on the "light cone"
}

function complexToHorosphere(numerator, denominator, target) {
    if (target === undefined)
        target = new Mv()

    if (denominator.re === 0. && denominator.im === 0.) {
        target.copy(nInfinity)
        //yes, this is a bit weird. It'd still be weird if you wanted to go from circle
    }
    else {
        let temp = new Complex()
        numerator.div(denominator, temp)

        let x = new Mv()
        //re = e1, im = e2
        x[1] = temp.re
        x[2] = temp.im
        x.mul(x, mv0)
        mv0.mul(nInfinity, target)
        target.multiplyScalar(.5)
        target.add(nOrigin)
        target.add(x)

        delete temp
        delete x
    }

    return target
}

function abcdToMotor(a,b,c,d,target) {
    let infinityPrimed = complexToSphere(a, c, mv3)

    let aPlusB = c0.copy(a).add(b)
    let cPlusD = c1.copy(c).add(d)
    let onePrimed = complexToSphere(
        aPlusB,
        cPlusD)
    delete aPlusB
    delete cPlusD

    let aIPlusB = new Complex().copy(b).add(a.mul(iComplex, c0))
    let cIPlusD = new Complex().copy(d).add(c.mul(iComplex, c0))
    let iPrimed = complexToSphere(aIPlusB, cIPlusD)
    delete aIPlusB
    delete cIPlusD

    let q = [
        onePrimed,
        infinityPrimed,
        iPrimed]

    motorFromPsToQsChrisStyle(xyzNullPoints, q, target)
    // motorFromPsToQs(oneInfinityIPoints, q, target)

    delete q
    delete infinityPrimed
    delete onePrimed
    delete iPrimed

    return target
}

function matrixToMotor(mat, target) {
    if (target === undefined)
        target = new Mv()

    //can just transpose
    let a = mat.get(0, 0), b = mat.get(0, 1)
    let c = mat.get(1, 0), d = mat.get(1, 1)

    //switching around left and right column is kinda like rotating

    abcdToMotor(a,b,c,d,target)

    return target
}