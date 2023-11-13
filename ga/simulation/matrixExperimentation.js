function initMatrixExperimentation() {

    initSeligMatrices()

    logMat = (m, msg) => {
        let str = ``
        for(let i = 0, il = m._data.length; i < il; ++i) {
            for(let j = 0, jl = m._data[i].length; j < jl; ++j) {
                let bleh = m._data[i][j].toString()
                str += ` ` + ( bleh.length === 2 ? bleh : ` `+bleh )
            }
            str += `\n`
        }
        let title = msg ? msg + `:\n` : ``
        log(title+str)
    }

    // let a = math.matrix([[1, 0], [0, 1]])
    // logMat(a)

    cmul = (a,b,target) => {
        if(target=== undefined)
            target = math.complex(0.,0.)
        target.re = a.re * b.re - a.im * b.im
        target.im = a.re * b.im + a.im * b.re
        return target
    }
    cConjugate = (a, target) => {
        if(target=== undefined)
            target = math.complex(0.,0.)
        target.re = a.re
        target.im = -a.im
        return target
    }
    cCopy = (a,target) => {
        target.re = a.re
        target.im = a.im
    }

    c0 = math.complex(0.,0.)
    matMul = (a,b,target) => {

        if(target === undefined)
            target = e1Mat.clone()

        for(let i = 0; i < 4; ++i) {
            for(let j = 0; j < 4; ++j) { 

                target._data[i][j].re = 0.
                target._data[i][j].im = 0.

                for(let k = 0; k < 4; ++k) {
                    cmul(a._data[i][k], b._data[k][j], c0)
                    target._data[i][j].re += c0.re
                    target._data[i][j].im += c0.im
                }
            }
        }

        return target
    }

    matFromString = (str, target) => {
            
        if(target === undefined)
            target = e1Mat.clone()

        let rows = str.trim().split('\n')
        for(let i = 0; i < 4; ++i) {
            let cols = rows[i].trim().split(' ')

            for(let j = 0; j < 4; ++j) {
                let c = math.complex(cols[j])
                cCopy(c, target._data[i][j])
                delete c
            }
        }
        return target
    }

    //ketbra
    matFromVec = (aRe, aIm, bRe, bIm, cRe, cIm, dRe, dIm, target) => {

        if (target === undefined)
            target = e1Mat.clone()

        //TODO optimize
        let vec = math.matrix([ math.complex(aRe, aIm), math.complex(bRe, bIm), math.complex(cRe, cIm), math.complex(dRe, dIm) ])

        // debugger
        for(let i = 0; i < 4; ++i) { //going down
            let a = vec._data[i]
            for(let j = 0; j < 4; ++j) { //going across (and conjugated)
                let bConj = cConjugate(vec._data[j], c0)
                cmul(a, bConj, target._data[i][j])
            }
        }

        return target
    }

    logCga = (mat) => {
        cga0.fromMat(mat)
        cga0.log("yo",6)
    }

    let theta1 = TAU * Math.random()
    let theta2 = TAU * Math.random()
    let theta3 = TAU * Math.random()
    let theta4 = TAU * Math.random()
    let mrh = matFromVec(
        Math.cos(theta1), Math.sin(theta1),  //00    //0.3 +  0.3e3 +  0.3epm +  0.3e3pm
        Math.cos(theta2), Math.sin(theta2),  //01    //0.3 + -0.3e3 +  0.3epm + -0.3e3pm
        Math.cos(theta3), Math.sin(theta3),  //10    //0.3 + -0.3e3 + -0.3epm +  0.3e3pm
        Math.cos(theta4), Math.sin(theta4))  //11    //0.3 +  0.3e3 + -0.3epm + -0.3e3pm
    log("equal probabilities on all")
    logCga(mrh)

    log("00")
    logCga(matFromVec(1.,0., 0.,0., 0.,0., 0.,0.))
    log("01")
    logCga(matFromVec(0., 0., 1., 0., 0., 0., 0., 0.))
    log("untentangleds")
    logCga(matFromVec(1., 0., 1., 0., 0., 0., 0., 0.))
    logCga(matFromVec(1., 0., 0., 0., 1., 0., 0., 0.))
    logCga(matFromVec(0., 0., 1., 0., 0., 0., 1., 0.))
    logCga(matFromVec(0., 0., 0., 0., 1., 0., 1., 0.))
    log("entangleds")
    logCga(matFromVec(1.,0., 0.,0., 0.,0., 1.,0.))
    logCga(matFromVec(0.,0., 1.,0., 1.,0., 0.,0.))
    logCga(matFromVec(1.,0., 0.,0., 0.,0.,-1.,0.))
    logCga(matFromVec(0.,0., 1.,0.,-1.,0., 0.,0.))

    let s00 = matFromVec(1., 0., 0., 0., 0., 0., 0., 0.)
    let s00 = matFromVec(1., 0., 0., 0., 0., 0., 0., 0.)

    //Sooo, you CAN factorize the "entangled" cga rep
    //the factorization is (0 + 1) (0 + 2), repellent

    // let cnot = e1Mat.clone()
    // matFromString(`
    //     1 0 0 0
    //     0 0 0 0
    //     0 0 0 0
    //     0 0 0 0
    // `, cnot)
}