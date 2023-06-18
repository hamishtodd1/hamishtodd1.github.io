function initCga() {

    smallerInLarger.Cga = {
        Sphere: new Uint8Array([1, 2, 3, 4, 5]),
        Circle: new Uint8Array([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
        Rotor: new Uint8Array([
            0,
            6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            26, 27, 28, 29, 30
        ]),
        Number: new Uint8Array([0])

        //StudyCga! 

        //if you want to go between cga and ega, even with the canonical basis...
        //there are serious minus signs to think about
        //seems like no matter what you do, there's negatives involved
        //and REALLY you should think about the canonical clifford bundle
    }
    smallerInLarger.Rotor = {
        Circle: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
        Number: new Uint8Array([0])
    }

    //not actually a circle, really a bivector
    class Circle extends Multivector {
        static get size() {return 10}

        constructor() {
            super(10)
        }

        //THIS ISN'T WORKING
        decompose(targetCga1,targetCga2) {
            if (targetCga1 === undefined)
                targetCga1 = new Cga()
            if (targetCga2 === undefined)
                targetCga2 = new Cga()

            // debugger
            let thisCga = this.cast(localCga0)

            if(thisCga.equals(zeroCga)) {
                return [thisCga.cast(targetCga1) ]
            }

            let thisSq = thisCga.mul(thisCga,localCga1)
            let iss = thisSq[0]

            if( thisSq.equals(zeroCga) ) {
                //null, so either a translation or 0. If translation, just give back that one axis!
                return [this.cast(targetCga1) ]
            }

            let thisWedgeThis = thisCga.meet(thisCga, localCga2) //study number?
            let twtSq = thisWedgeThis.innerSelfScalar() //twt.mul(twt) is for-sure scalar. Apparently.
            let discriminant = sq(iss) - twtSq
            if(discriminant < 0.)
                console.error("negative discriminant")
            else if(discriminant === 0.) {
                //this "Inverse" you're about to calculate is not a proper inverse
                //the solution is unique...?
                console.error(`zero discriminant`)
            }
            else {
                let rightPart = Math.sqrt(discriminant)

                let thisInverse = thisCga.inverse(localCga3)

                localCga0.copy(thisWedgeThis).multiplyScalar(.5)
                let lambda1 = .5 * (iss + rightPart)
                localCga0[0] += lambda1
                localCga0.mul(thisInverse, targetCga1)

                if (rightPart === 0.) {
                    //solution was unique
                    return [targetCga1]
                }
                else {
                    localCga0.copy(thisWedgeThis).multiplyScalar(.5)
                    let lambda2 = .5 * (iss - rightPart)
                    localCga0[0] += lambda2
                    localCga0.mul(thisInverse, targetCga2)

                    return [targetCga1, targetCga2]
                }
            }
        }

        // should have target last
        exp ( target, angleOrDistance ) {
            
            if(target === undefined)
                target = new Rotor()
            
            if(!target.isRotor)
                console.error("exp called with non-rotor target")

            // debugger

            this.multiplyScalar( (angleOrDistance === undefined?1.:angleOrDistance*.5), multipliedCircle )

            // B*B = S + Ti*ei*I
            //6D study!
            let S = -multipliedCircle[0] * multipliedCircle[0] - multipliedCircle[1] * multipliedCircle[1] 
                    -multipliedCircle[2] * multipliedCircle[2] + multipliedCircle[3] * multipliedCircle[3] 
                    -multipliedCircle[4] * multipliedCircle[4] - multipliedCircle[5] * multipliedCircle[5]
                    +multipliedCircle[6] * multipliedCircle[6] - multipliedCircle[7] * multipliedCircle[7]
                    +multipliedCircle[8] * multipliedCircle[8] + multipliedCircle[9] * multipliedCircle[9];
            let [T1, T2, T3, T4, T5] = [
                2 * (multipliedCircle[4] * multipliedCircle[9] - multipliedCircle[5] * multipliedCircle[8] + multipliedCircle[6] * multipliedCircle[7]), //e2345
                2 * (multipliedCircle[1] * multipliedCircle[9] - multipliedCircle[2] * multipliedCircle[8] + multipliedCircle[3] * multipliedCircle[7]), //e1345
                2 * (multipliedCircle[0] * multipliedCircle[9] - multipliedCircle[2] * multipliedCircle[6] + multipliedCircle[3] * multipliedCircle[5]), //e1245
                2 * (multipliedCircle[0] * multipliedCircle[8] - multipliedCircle[1] * multipliedCircle[6] + multipliedCircle[3] * multipliedCircle[4]), //e1235
                2 * (multipliedCircle[0] * multipliedCircle[7] - multipliedCircle[1] * multipliedCircle[5] + multipliedCircle[2] * multipliedCircle[4])  //e1234
            ]

            // Calculate the norms of the invariants
            let Tsq = -T1 * T1 - T2 * T2 - T3 * T3 - T4 * T4 + T5 * T5
            let norm = Math.sqrt(S * S - Tsq)

            if(norm === 0.)
                return target.set(1., 
                    multipliedCircle[0], 
                    multipliedCircle[1], 
                    multipliedCircle[2], 
                    multipliedCircle[3], 
                    multipliedCircle[4], 
                    multipliedCircle[5], 
                    multipliedCircle[6], 
                    multipliedCircle[7], 
                    multipliedCircle[8], 
                    multipliedCircle[9], 
                    0., 0., 0., 0., 0.)

            let sc = -0.5 / norm, lambdap = 0.5 * S + 0.5 * norm

            let [lp, lm] = [Math.sqrt(Math.abs(lambdap)), Math.sqrt(-0.5 * S + 0.5 * norm)]
            // The associated trig (depending on sign lambdap)
            let [cp, sp] = 
                lambdap > 0. ? [Math.cosh(lp), Math.sinh(lp) / lp] : 
                lambdap < 0. ? [Math.cos( lp), Math.sin( lp) / lp] : [1., 1.]
            let [cm, sm] = [Math.cos(lm), lm == 0. ? 1. : Math.sin(lm) / lm]
            // Calculate the mixing factors alpha and beta_i.
            let [cmsp, cpsm, spsm] = [cm * sp, cp * sm, sp * sm / 2.]
            let D = cmsp - cpsm
            let E = sc * D;
            let [alpha, beta1, beta2, beta3, beta4, beta5] = [D * (0.5 - sc * S) + cpsm, E * T1, -E * T2, E * T3, -E * T4, -E * T5]
            // Create the final rotor.
            return target.set(
                cp * cm,
                (multipliedCircle[0] * alpha + multipliedCircle[7] * beta5 - multipliedCircle[8] * beta4 + multipliedCircle[9] * beta3),
                (multipliedCircle[1] * alpha - multipliedCircle[5] * beta5 + multipliedCircle[6] * beta4 - multipliedCircle[9] * beta2),
                (multipliedCircle[2] * alpha + multipliedCircle[4] * beta5 - multipliedCircle[6] * beta3 + multipliedCircle[8] * beta2),
                (multipliedCircle[3] * alpha + multipliedCircle[4] * beta4 - multipliedCircle[5] * beta3 + multipliedCircle[7] * beta2),
                (multipliedCircle[4] * alpha + multipliedCircle[2] * beta5 - multipliedCircle[3] * beta4 + multipliedCircle[9] * beta1),
                (multipliedCircle[5] * alpha - multipliedCircle[1] * beta5 + multipliedCircle[3] * beta3 - multipliedCircle[8] * beta1),
                (multipliedCircle[6] * alpha - multipliedCircle[1] * beta4 + multipliedCircle[2] * beta3 - multipliedCircle[7] * beta1),
                (multipliedCircle[7] * alpha + multipliedCircle[0] * beta5 - multipliedCircle[3] * beta2 + multipliedCircle[6] * beta1),
                (multipliedCircle[8] * alpha + multipliedCircle[0] * beta4 - multipliedCircle[2] * beta2 + multipliedCircle[5] * beta1),
                (multipliedCircle[9] * alpha - multipliedCircle[0] * beta3 + multipliedCircle[1] * beta2 - multipliedCircle[4] * beta1),
                spsm * T5, spsm * T4, spsm * T3, spsm * T2, spsm * T1
            )
        }
    }
    window.Circle = Circle
    Circle.basisNames = [`12`, `13`, `1p`, `1m`, `23`, `2p`, `2m`, `3p`, `3m`, `pm`]
    let multipliedCircle = new Circle()

    //incidentally, this is elliptic pga
    class Rotor extends Multivector {
        static get size() { return 16 }

        constructor() {
            super(16)

            this[0] = 1.

            this.isRotor = true
        }

        mul(b, target) {
            if (target === undefined)
                target = new Rotor()

            this.cast(localCga0)
            b.cast(localCga1)
            localCga0.mul(localCga1, localCga2).cast(target)

            return target
        }

        isStudy() {
            let has2 = false
            let has4 = false
            for (let i =  1; i < 11; ++i) if (this[i] !== 0.) has2 = true
            for (let i = 11; i < 16; ++i) if (this[i] !== 0.) has4 = true

            return has4 && !has2
        }

        reverse(target) {
            if(target === undefined)    
                target = new Rotor()

            target[ 0] =  this[ 0]
            
            target[ 1] = -this[ 1]
            target[ 2] = -this[ 2]
            target[ 3] = -this[ 3]
            target[ 4] = -this[ 4]
            target[ 5] = -this[ 5]
            target[ 6] = -this[ 6]
            target[ 7] = -this[ 7]
            target[ 8] = -this[ 8]
            target[ 9] = -this[ 9]
            target[10] = -this[10]
            
            target[11] =  this[11]
            target[12] =  this[12]
            target[13] =  this[13]
            target[14] =  this[14]
            target[15] =  this[15]

            return target
        }

        sandwichConformalPoint(point, target) { //both are cga's
            if(target === undefined)
                target = new Cga()

            let inte = localRotor0
            inte[ 0] = + point[26] * this[11] - point[27] * this[12] - point[28] * this[13] - point[29] * this[14] - point[30] * this[15];
            
            inte[ 1] = - point[26] * this[ 8] + point[27] * this[ 9] + point[28] * this[10] - point[30] * this[14] + point[29] * this[15];
            inte[ 2] = + point[26] * this[ 6] - point[27] * this[ 7] + point[29] * this[10] + point[30] * this[13] - point[28] * this[15];
            inte[ 3] = - point[26] * this[ 5] - point[28] * this[ 7] - point[29] * this[ 9] - point[30] * this[12] + point[27] * this[15];
            inte[ 4] = - point[27] * this[ 5] - point[28] * this[ 6] - point[29] * this[ 8] - point[30] * this[11] + point[26] * this[15];
            inte[ 5] = - point[26] * this[ 3] + point[27] * this[ 4] + point[30] * this[10] - point[29] * this[13] + point[28] * this[14];
            inte[ 6] = + point[26] * this[ 2] + point[28] * this[ 4] - point[30] * this[ 9] + point[29] * this[12] - point[27] * this[14];
            inte[ 7] = + point[27] * this[ 2] + point[28] * this[ 3] - point[30] * this[ 8] + point[29] * this[11] - point[26] * this[14];
            inte[ 8] = - point[26] * this[ 1] + point[29] * this[ 4] + point[30] * this[ 7] - point[28] * this[12] + point[27] * this[13];
            inte[ 9] = - point[27] * this[ 1] + point[29] * this[ 3] + point[30] * this[ 6] - point[28] * this[11] + point[26] * this[13];
            inte[10] = - point[28] * this[ 1] - point[29] * this[ 2] - point[30] * this[ 5] + point[27] * this[11] - point[26] * this[12];
            
            inte[11] =   point[26] * this[ 0] + point[30] * this[ 4] - point[29] * this[ 7] + point[28] * this[ 9] - point[27] * this[10];
            inte[12] =   point[27] * this[ 0] + point[30] * this[ 3] - point[29] * this[ 6] + point[28] * this[ 8] - point[26] * this[10];
            inte[13] =   point[28] * this[ 0] - point[30] * this[ 2] + point[29] * this[ 5] - point[27] * this[ 8] + point[26] * this[ 9];
            inte[14] =   point[29] * this[ 0] + point[30] * this[ 1] - point[28] * this[ 5] + point[27] * this[ 6] - point[26] * this[ 7];
            inte[15] =   point[30] * this[ 0] - point[29] * this[ 1] + point[28] * this[ 2] - point[27] * this[ 3] + point[26] * this[ 4];

            // debugger
            let sr = this.reverse( localRotor1 )

            inte.cast(new Cga()).mul(sr.cast(new Cga()), target)
            

            // target.zero()

            // target[26] = sr[11] * inte[ 0] + sr[ 8] * inte[ 1] - sr[ 6] * inte[ 2] + sr[ 5] * inte[ 3] + sr[15] * inte[ 4] + sr[ 3] * inte[ 5] - sr[ 2] * inte[ 6] - sr[14] * inte[ 7]
            //            + sr[ 1] * inte[ 8] + sr[13] * inte[ 9] - sr[12] * inte[10] + sr[ 0] * inte[11] + sr[10] * inte[12] - sr[ 9] * inte[13] + sr[ 7] * inte[14] - sr[ 4] * inte[15];
            // target[27] = sr[12] * inte[ 0] + sr[ 9] * inte[ 1] - sr[ 7] * inte[ 2] + sr[15] * inte[ 3] + sr[ 5] * inte[ 4] + sr[ 4] * inte[ 5] - sr[14] * inte[ 6] - sr[ 2] * inte[ 7]
            //            + sr[13] * inte[ 8] + sr[ 1] * inte[ 9] - sr[11] * inte[10] + sr[10] * inte[11] + sr[ 0] * inte[12] - sr[ 8] * inte[13] + sr[ 6] * inte[14] - sr[ 3] * inte[15];
            // // log( sr, inte )
            // target[28] = sr[13] * inte[ 0] + sr[10] * inte[ 1] - sr[15] * inte[ 2] - sr[ 7] * inte[ 3] + sr[ 6] * inte[ 4] + sr[14] * inte[ 5] + sr[ 4] * inte[ 6] - sr[ 3] * inte[ 7]
            //            - sr[12] * inte[ 8] + sr[11] * inte[ 9] + sr[ 1] * inte[10] - sr[ 9] * inte[11] + sr[ 8] * inte[12] + sr[ 0] * inte[13] - sr[ 5] * inte[14] + sr[ 2] * inte[15];
            // target[29] = sr[14] * inte[ 0] + sr[15] * inte[ 1] + sr[10] * inte[ 2] - sr[ 9] * inte[ 3] + sr[ 8] * inte[ 4] - sr[13] * inte[ 5] + sr[12] * inte[ 6] - sr[11] * inte[ 7]
            //            + sr[ 4] * inte[ 8] - sr[ 3] * inte[ 9] + sr[ 2] * inte[10] + sr[ 7] * inte[11] - sr[ 6] * inte[12] + sr[ 5] * inte[13] + sr[ 0] * inte[14] - sr[ 1] * inte[15];
            // target[30] = sr[15] * inte[ 0] - sr[14] * inte[ 1] + sr[13] * inte[ 2] - sr[12] * inte[ 3] + sr[11] * inte[ 4] + sr[10] * inte[ 5] - sr[ 9] * inte[ 6] + sr[ 8] * inte[ 7]
            //            + sr[ 7] * inte[ 8] - sr[ 6] * inte[ 9] + sr[ 5] * inte[10] - sr[ 4] * inte[11] + sr[ 3] * inte[12] - sr[ 2] * inte[13] + sr[ 1] * inte[14] + sr[ 0] * inte[15];    

            return target
        }

        normalize(target) {
            if(target === undefined)
                target = new Rotor()

            let S = this[0] * this[0] - this[10] * this[10] + this[11] * this[11] - this[12] * this[12] - this[13] * this[13] - this[14] * this[14] - this[15] * this[15] + this[1] * this[1]
                  + this[2] * this[2] + this[3] * this[3] - this[4] * this[4] + this[5] * this[5] + this[6] * this[6] - this[7] * this[7] + this[8] * this[8] - this[9] * this[9];
            let T1 = 2. * (this[0] * this[11] - this[10] * this[12] + this[13] * this[9] - this[14] * this[7] + this[15] * this[4] - this[1] * this[8] + this[2] * this[6] - this[3] * this[5]);
            let T2 = 2. * (this[0] * this[12] - this[10] * this[11] + this[13] * this[8] - this[14] * this[6] + this[15] * this[3] - this[1] * this[9] + this[2] * this[7] - this[4] * this[5]);
            let T3 = 2. * (this[0] * this[13] - this[10] * this[1] + this[11] * this[9] - this[12] * this[8] + this[14] * this[5] - this[15] * this[2] + this[3] * this[7] - this[4] * this[6]);
            let T4 = 2. * (this[0] * this[14] - this[10] * this[2] - this[11] * this[7] + this[12] * this[6] - this[13] * this[5] + this[15] * this[1] + this[3] * this[9] - this[4] * this[8]);
            let T5 = 2. * (this[0] * this[15] - this[10] * this[5] + this[11] * this[4] - this[12] * this[3] + this[13] * this[2] - this[14] * this[1] + this[6] * this[9] - this[7] * this[8]);
            let TT = -T1 * T1 + T2 * T2 + T3 * T3 + T4 * T4 + T5 * T5;
            // console.error(S, S * S + TT, TT)
            let N = Math.sqrt( S + Math.sqrt(S * S + TT) )
            let N2 = N * N;
            // console.error(N2 * N2 + TT)
            let ND = Math.SQRT2 * N / (N2 * N2 + TT);
            let C = N2 * ND, [D1, D2, D3, D4, D5] = [-T1 * ND, -T2 * ND, -T3 * ND, -T4 * ND, -T5 * ND];
            target.set(
                C * this[0] + D1 * this[11] - D2 * this[12] - D3 * this[13] - D4 * this[14] - D5 * this[15],
                C * this[1] - D1 * this[8] + D2 * this[9] + D3 * this[10] - D4 * this[15] + D5 * this[14],
                C * this[2] + D1 * this[6] - D2 * this[7] + D3 * this[15] + D4 * this[10] - D5 * this[13],
                C * this[3] - D1 * this[5] - D2 * this[15] - D3 * this[7] - D4 * this[9] + D5 * this[12],
                C * this[4] - D1 * this[15] - D2 * this[5] - D3 * this[6] - D4 * this[8] + D5 * this[11],
                C * this[5] - D1 * this[3] + D2 * this[4] - D3 * this[14] + D4 * this[13] + D5 * this[10],
                C * this[6] + D1 * this[2] + D2 * this[14] + D3 * this[4] - D4 * this[12] - D5 * this[9],
                C * this[7] + D1 * this[14] + D2 * this[2] + D3 * this[3] - D4 * this[11] - D5 * this[8],
                C * this[8] - D1 * this[1] - D2 * this[13] + D3 * this[12] + D4 * this[4] + D5 * this[7],
                C * this[9] - D1 * this[13] - D2 * this[1] + D3 * this[11] + D4 * this[3] + D5 * this[6],
                C * this[10] + D1 * this[12] - D2 * this[11] - D3 * this[1] - D4 * this[2] - D5 * this[5],
                C * this[11] + D1 * this[0] + D2 * this[10] - D3 * this[9] + D4 * this[7] - D5 * this[4],
                C * this[12] + D1 * this[10] + D2 * this[0] - D3 * this[8] + D4 * this[6] - D5 * this[3],
                C * this[13] - D1 * this[9] + D2 * this[8] + D3 * this[0] - D4 * this[5] + D5 * this[2],
                C * this[14] + D1 * this[7] - D2 * this[6] + D3 * this[5] + D4 * this[0] - D5 * this[1],
                C * this[15] - D1 * this[4] + D2 * this[3] - D3 * this[2] + D4 * this[1] + D5 * this[0])

            return target
        }

        sqrt(target) {
            this.normalize(localRotor1)
            localRotor1[0] += (localRotor1[0] === -1. ? -1. : 1.) //because negative translations
            return localRotor1.normalize(target)
        }

        logarithm(R) {
            // B*B = S + T*e1234
            var S = R[0] * R[0] + R[11] * R[11] - R[12] * R[12] - R[13] * R[13] - R[14] * R[14] - R[15] * R[15] - 1
            var [T1, T2, T3, T4, T5] = [
                2 * R[0] * R[15],   //e2345
                2 * R[0] * R[14],   //e1345
                2 * R[0] * R[13],   //e1245
                2 * R[0] * R[12],   //e1235
                2 * R[0] * R[11],   //e1234
            ]
            var Tsq = -T1 * T1 - T2 * T2 - T3 * T3 - T4 * T4 + T5 * T5
            var norm = Math.sqrt(S * S - Tsq)
            if (norm == 0 && S == 0)   // at most a single translation
                return bivector(R[1], R[2], R[3], R[4], R[5], R[6], R[7], R[8], R[9], R[10])
            var lambdap = 0.5 * S + 0.5 * norm
            // lm is always a rotation, lp can be boost, translation, rotation
            var [lp, lm] = [Math.sqrt(Math.abs(lambdap)), Math.sqrt(-0.5 * S + 0.5 * norm)]
            var theta2 = Math.atan2(lm, R[0])
            var theta1 = lambdap < 0 ? Math.asin(lp / Math.cos(theta2)) : lambdap > 0 ? Math.atanh(lp / R[0]) : lp / R[0]
            var [l1, l2] = [lp == 0 ? 0 : theta1 / lp, lm == 0 ? 0 : theta2 / lm]
            var [A, B1, B2, B3, B4, B5] = [
                (l1 - l2) * 0.5 * (1 + S / norm) + l2, -0.5 * T1 * (l1 - l2) / norm, -0.5 * T2 * (l1 - l2) / norm,
                -0.5 * T3 * (l1 - l2) / norm, -0.5 * T4 * (l1 - l2) / norm, -0.5 * T5 * (l1 - l2) / norm,
            ]
            return bivector(
                A * R[ 1] + B3 * R[10] + B4 * R[ 9] - B5 * R[ 8],
                A * R[ 2] + B2 * R[10] - B4 * R[ 7] + B5 * R[ 6],
                A * R[ 3] - B2 * R[ 9] - B3 * R[ 7] - B5 * R[ 5],
                A * R[ 4] - B2 * R[ 8] - B3 * R[ 6] - B4 * R[ 5],
                A * R[ 5] + B1 * R[10] + B4 * R[ 4] - B5 * R[ 3],
                A * R[ 6] - B1 * R[ 9] + B3 * R[ 4] + B5 * R[ 2],
                A * R[ 7] - B1 * R[ 8] + B3 * R[ 3] + B4 * R[ 2],
                A * R[ 8] + B1 * R[ 7] + B2 * R[ 4] - B5 * R[ 1],
                A * R[ 9] + B1 * R[ 6] + B2 * R[ 3] - B4 * R[ 1],
                A * R[10] - B1 * R[ 5] - B2 * R[ 2] - B3 * R[ 1]
            )
        }
    }
    window.Rotor = Rotor
    Rotor.basisNames = [
        ``,
        `12`, `13`, `1p`, `1m`, `23`, `2p`, `2m`, `3p`, `3m`, `pm`,  //line start is [6]
        `123p`, `123m`, `12pm`, `13pm`, `23pm`]
    Rotor.indexGrades = [
        0,                    // CGA           4D HPGA
        2,2,2,2,2,2,2,2,2,2,  //circle         plane
        4,4,4,4,4,            //point          point
    ]

    class Sphere extends Multivector {
        static get size() { return 5 }

        constructor() {
            super(5)
        }

        //upSphere is a special case
        fromCenterAndRadius(x,y,z,r) {
            let infFactor = 0.5 * (sq(x) + sq(y) + sq(z) - sq(r))

            this[0] = x
            this[1] = y
            this[2] = z
            this[3] =  0.5 + infFactor
            this[4] = -0.5 + infFactor

            return this
        }

        getRadius() {
            // gonna assume this thing was created by taking a sphere created this way:
            // x + eo + thingy * eInf
            // and then multiplied by alpha

            let overallScalar = this[3] - this[4]
            if(overallScalar === 0.)
                return Infinity //because it's a plane
            else {
                let radiusSq = 2. * (this[3] + this[4]) / overallScalar - ((sq(this[0]) + sq(this[1]) + sq(this[2])) / sq(overallScalar))
                return Math.sign(radiusSq) * Math.sqrt(Math.abs(radiusSq))
            }
        }
    }
    window.Sphere = Sphere
    Sphere.basisNames = [`1`, `2`, `3`, `p`, `m`]

    // e1s = e1c.cast(new Sphere())
    // e2s = e2c.cast(new Sphere())
    // e3s = e3c.cast(new Sphere())
    // eos = eo.cast(new Sphere())
    // e0s = e1c.cast(new Sphere())

    Sphere.indexGrades = [
        1,1,1,1,1,
    ]

    class Cga extends Multivector {
        static get size() { return 32 }

        constructor() {
            super(32)
        }

        //currently we just care about sphere, or rotor, or anything else
        getType() {
            if(this.isZero())
                return -1

            for(let i = 0; i < 32; ++i) {
                if( this[i] !== 0. ) {
                    if (Cga.indexGrades[i] % 2)
                        mightBeRotor = false
                }
            }
        }

        exp(target) {
            this.cast(localCircle0)
            localCircle0.exp(localRotor0)
            localRotor0.cast(target)
            return target
        }

        selectGradeWithCga(cgaWithGrade,target) {
            return this.selectGrade(cgaWithGrade[0], target)
        }

        //could try to do it properly for odd k
        sqrt(target) {
            this.cast(localRotor0)
            localRotor0.sqrt(localRotor1)
            localRotor1.cast(target)
            return target
        }

        flatPpToConformalPoint(target) {
            this.ppToConformalPoints(localCga0, localCga1)
            localCga0.downPt(v1); localCga1.downPt(v2)
            return target.copy(v1.equals(outOfSightVec3) ? localCga1 : localCga0)
        }

        ppToConformalPoints(pAdd, pSub) {
            //tortured appeal to hyperbolic PGA
            let directionTowardNullPt = em.meet(this, cga1)
            directionTowardNullPt.multiplyScalar(1. / Math.sqrt(sq(directionTowardNullPt[27]) + sq(directionTowardNullPt[28]) + sq(directionTowardNullPt[29]) + sq(directionTowardNullPt[30])))

            let imaginaryPtBetweenPts = e123p.projectOn(this, cga0)
            imaginaryPtBetweenPts.multiplyScalar(1. / imaginaryPtBetweenPts[26])

            let currentEDistFromHyperbolicCenterSq = sq(imaginaryPtBetweenPts[27]) + sq(imaginaryPtBetweenPts[28]) + sq(imaginaryPtBetweenPts[29]) + sq(imaginaryPtBetweenPts[30])
            directionTowardNullPt.multiplyScalar(Math.sqrt((1. - currentEDistFromHyperbolicCenterSq)))

            imaginaryPtBetweenPts.add(directionTowardNullPt, pAdd)
            if (pSub !== undefined)
                imaginaryPtBetweenPts.sub(directionTowardNullPt, pSub)
            return pAdd
        }

        rotorTo(b, target) {
            let ratioCga = b.mul(this.reverse(localCga6), localCga5)
            return ratioCga.cast(localRotor0).sqrt(target) //sqrt normalizes
        }

        div(b, target) {
            if (target === undefined)
                target = new Cga()

            return this.mul(b.inverse(localCga6), target)
        }

        inverse(target) {
            if (target === undefined)
                target = new Cga()

            this.reverse(target)
            let factor = Math.abs(1. / this.innerSelfScalar()) //so, potentially 0
            target.multiplyScalar(factor)
            return target
        }

        projectOn(toBeProjectedOn, target) {
            if (target === undefined)
                target = new Cga()

            this.inner(toBeProjectedOn, localCga0)
            toBeProjectedOn.reverse(localCga1)
            localCga0.mul(localCga1, target)

            return target
        }

        //an interesting function intended for zero-radius spheres that also works for ordinary spheres
        downSphere(targetVec3) {

            if (targetVec3 === undefined)
                targetVec3 = new THREE.Vector3()

            let pp = this.meet(e0c, localCga0).dual(localCga1)
            pp.toEga( ega6 ).pointToVec3(targetVec3)

            return targetVec3
        }

        upSphere(x, y, z) {
            if (x.isVector3) {
                z = x.z
                y = x.y
                x = x.x
            }

            localSphere0.fromCenterAndRadius(x,y,z,0.).cast(this)

            return this
        }

        upPt(x,y,z) {
            //heavy-duty version that can be used to verify the consistency of the below
            // let cgaTranslator = localCga2.fromEga(dq0.ptToPt(0., 0., 0., x, y, z).cast(ega5))
            // return cgaTranslator.sandwich(eOri, this)

            if (x.isVector3) {
                z = x.z
                y = x.y
                x = x.x
            }

            this.zero()
            let lengthSq = x * x + y * y + z * z
            this[26] = .5*lengthSq + .5
            this[27] = .5*lengthSq - .5

            this[28] =  z
            this[29] = -y
            this[30] =  x

            return this
        }

        downPt(targetVec3, doLog) {

            if (targetVec3 === undefined)
                targetVec3 = new THREE.Vector3()

            //For if it's not null, or it's the point at infinity
            targetVec3.copy(outOfSightVec3)

            if (this[26] - this[27] !== 0.) {
                let lambda = 1. / (this[26] - this[27]) //will be infinity if you're on plane at infinity

                let _26 = lambda * this[26]; let _27 = lambda * this[27]; let _28 = lambda * this[28]; let _29 = lambda * this[29]; let _30 = lambda * this[30]

                let lengthSqDesired = _26 + _27
                let lengthSqCurrent = _28 * _28 + _29 * _29 + _30 * _30
                if (Math.abs(lengthSqCurrent - lengthSqDesired) < .01) 
                {
                    //null point
                    targetVec3.z =  _28
                    targetVec3.y = -_29
                    targetVec3.x =  _30
                }
            }

            return targetVec3
        }

        sphereLineIntersection(line,target) {
            if(target === undefined)
                target = new Cga()

            target[16] =  line[10] * this[1] - line[ 7] * this[2] + line[ 6] * this[3];
            target[17] =  line[11] * this[1] - line[ 8] * this[2] + line[ 6] * this[4];
            target[18] =  line[12] * this[1] - line[ 9] * this[2] + line[ 6] * this[5];
            target[19] =  line[13] * this[1] - line[ 8] * this[3] + line[ 7] * this[4];
            target[20] =  line[14] * this[1] - line[ 9] * this[3] + line[ 7] * this[5];
            target[21] = -line[ 9] * this[4] + line[ 8] * this[5];
            target[22] =  line[13] * this[2] - line[11] * this[3] + line[10] * this[4];
            target[23] =  line[14] * this[2] - line[12] * this[3] + line[10] * this[5];
            target[24] = -line[12] * this[4] + line[11] * this[5];
            target[25] = -line[14] * this[4] + line[13] * this[5];
            //the three short ones are e1pm, e2pm, e3pm. So makes sense they have one less (PGA has no epm)

            return target
        }

        // fromPoga(poga) { //polar ga!
        //     this.zero()
        // }

        //fuck this shit
        // vec3 sphereLineIntersection(Biv line, Sphere sphere) {
        //     //deffo line, not circle
        //     //so line potentially has 6,7,8,9,10,11,12,13,14
        //     //8=9=-e01, 11=12=-e02, 13=14=-e03
        //     //6=
        //     target[16] =  line.e23 * sphere.e1 + line.e31 * sphere.e2 + line.e12 * sphere.e3;
        //     target[17] = -line.e02 * sphere.e1 + line.e01 * sphere.e2 + line.e12 * sphere.ep;
        //     target[18] = -line.e02 * sphere.e1 + line.e01 * sphere.e2 + line.e12 * sphere.em;
        //     target[19] = -line.e03 * sphere.e1 + line.e01 * sphere.e3 - line.e31 * sphere.ep;
        //     target[20] = -line.e03 * sphere.e1 + line.e01 * sphere.e3 - line.e31 * sphere.em;
        //     target[21] =  line.e01 * sphere.ep - line.e01 * sphere.em;
        //     target[22] = -line.e03 * sphere.e2 + line.e02 * sphere.e3 + line.e23 * sphere.ep;
        //     target[23] = -line.e03 * sphere.e2 + line.e02 * sphere.e3 + line.e23 * sphere.em;
        //     target[24] =  line.e02 * sphere.ep - line.e02 * sphere.em;
        //     target[25] =  line.e03 * sphere.ep - line.e03 * sphere.em;

        //     //urgh and how to extract?
        //     //Are you sure you need to extract? Both can be kinda relevant
        //     //well what you really want is the distance from a point to the point pair

        //     //would be kind of nice to have the oriented distance to them both
        //     //surely hugo worked it out

        //     //in principle you could have some "early indicator" from the above to rank the things

        //     //ok, step 1 is square it to see if there's an intersection at all.
        // }

        //probably DO need these around since "convert" doesn't cross ega cga yet
        fromEga(ega) {
            this.zero()

            this[ 0] = ega[ 0]

            this[ 1] = ega[ 2]; this[ 2] = ega[ 3]; this[ 3] = ega[ 4]  //e1, e2, e3
            this[ 6] = ega[ 8]; this[ 7] =-ega[ 9]; this[10] = ega[10]  //12, 13, 23
            this[16] = ega[14] //e123

            this[ 4] =  ega[ 1]; this[ 5] =  ega[ 1]; //e0 = ep+em
            this[ 8] = -ega[ 5]; this[ 9] = -ega[ 5]; //e01
            this[11] = -ega[ 6]; this[12] = -ega[ 6]; //e02
            this[13] = -ega[ 7]; this[14] = -ega[ 7]; //e03

            this[17] = -ega[11]; this[18] = -ega[11]; //e012, but ega stores e021
            this[19] =  ega[12]; this[20] =  ega[12]; //e013 stored by both!
            this[22] = -ega[13]; this[23] = -ega[13]; //e023, but ega stores e032

            this[26] = -ega[15]; this[27] = -ega[15];

            return this
        }

        toEga(target) {
            if(target === undefined)
                target = new Ega()

            target.zero()

            target[ 0] =  this[ 0]

            target[ 2] =  this[ 1]; target[ 3] =  this[ 2]; target[ 4] =  this[ 3]  //e1, e2, e3
            target[ 8] =  this[ 6]; target[ 9] =  this[ 7]; target[10] =  this[10]  //12, 13, 23
            target[14] =  this[16] //e123

            target[ 1] =  this[ 4]; target[ 1] =  this[ 5]; //e0 = ep+em
            target[ 5] = -this[ 8]; target[ 5] = -this[ 9]; //e01
            target[ 6] = -this[11]; target[ 6] = -this[11]; //e02
            target[ 7] = -this[13]; target[ 7] = -this[13]; //e03

            target[11] =  this[17]; target[11] =  this[18]; //e012
            target[13] =  this[22]; target[13] =  this[23]; //e023
            target[12] =  this[19]; target[12] =  this[19]; //e013

            target[15] = -this[26]; target[15] = -this[27];

            return target
        }

        sandwich(cgaToBeSandwiched, target, doLog) {
            if (target === undefined)
                target = new Cga()

            let sr = this.reverse(localCga0)

            let inte = this.mul(cgaToBeSandwiched, localCga1)
            inte.mul(sr, target)

            // let ks = cgaToBeSandwiched.grade() * this.grade()
            // if (ks % 2 === 0)
            //     target.multiplyScalar(-1.)

            return target
        }

        //aliasing allowed
        reverse(target) {
            if (target === undefined)
                target = new Cga()

            target[ 0] =  this[ 0];

            target[ 1] =  this[ 1];
            target[ 2] =  this[ 2];
            target[ 3] =  this[ 3];
            target[ 4] =  this[ 4];
            target[ 5] =  this[ 5];

            target[ 6] = -this[ 6];
            target[ 7] = -this[ 7];
            target[ 8] = -this[ 8];
            target[ 9] = -this[ 9];
            target[10] = -this[10];
            target[11] = -this[11];
            target[12] = -this[12];
            target[13] = -this[13];
            target[14] = -this[14];
            target[15] = -this[15];

            target[16] = -this[16];
            target[17] = -this[17];
            target[18] = -this[18];
            target[19] = -this[19];
            target[20] = -this[20];
            target[21] = -this[21];
            target[22] = -this[22];
            target[23] = -this[23];
            target[24] = -this[24];
            target[25] = -this[25];
            
            target[26] =  this[26];
            target[27] =  this[27];
            target[28] =  this[28];
            target[29] =  this[29];
            target[30] =  this[30];

            target[31] =  this[31];
            return target
        }

        meet(b, target) {
            if (target === undefined)
                target = new Cga()
            target[0] = b[0] * this[0];
            
            target[1] = b[1] * this[0] + b[0] * this[1];
            target[2] = b[2] * this[0] + b[0] * this[2];
            target[3] = b[3] * this[0] + b[0] * this[3];
            target[4] = b[4] * this[0] + b[0] * this[4];
            target[5] = b[5] * this[0] + b[0] * this[5];
            
            target[6] = b[6] * this[0] + b[2] * this[1] - b[1] * this[2] + b[0] * this[6];
            target[7] = b[7] * this[0] + b[3] * this[1] - b[1] * this[3] + b[0] * this[7];
            target[8] = b[8] * this[0] + b[4] * this[1] - b[1] * this[4] + b[0] * this[8];
            target[9] = b[9] * this[0] + b[5] * this[1] - b[1] * this[5] + b[0] * this[9];
            target[10] = b[10] * this[0] + b[3] * this[2] - b[2] * this[3] + b[0] * this[10];
            target[11] = b[11] * this[0] + b[4] * this[2] - b[2] * this[4] + b[0] * this[11];
            target[12] = b[12] * this[0] + b[5] * this[2] - b[2] * this[5] + b[0] * this[12];
            target[13] = b[13] * this[0] + b[4] * this[3] - b[3] * this[4] + b[0] * this[13];
            target[14] = b[14] * this[0] + b[5] * this[3] - b[3] * this[5] + b[0] * this[14];
            target[15] = b[15] * this[0] + b[5] * this[4] - b[4] * this[5] + b[0] * this[15];
            
            target[16] = b[16] * this[0] + b[10] * this[1] - b[7] * this[2] + b[6] * this[3] + b[3] * this[6] - b[2] * this[7] + b[1] * this[10] + b[0] * this[16];
            target[17] = b[17] * this[0] + b[11] * this[1] - b[8] * this[2] + b[6] * this[4] + b[4] * this[6] - b[2] * this[8] + b[1] * this[11] + b[0] * this[17];
            target[18] = b[18] * this[0] + b[12] * this[1] - b[9] * this[2] + b[6] * this[5] + b[5] * this[6] - b[2] * this[9] + b[1] * this[12] + b[0] * this[18];
            target[19] = b[19] * this[0] + b[13] * this[1] - b[8] * this[3] + b[7] * this[4] + b[4] * this[7] - b[3] * this[8] + b[1] * this[13] + b[0] * this[19];
            target[20] = b[20] * this[0] + b[14] * this[1] - b[9] * this[3] + b[7] * this[5] + b[5] * this[7] - b[3] * this[9] + b[1] * this[14] + b[0] * this[20];
            target[21] = b[21] * this[0] + b[15] * this[1] - b[9] * this[4] + b[8] * this[5] + b[5] * this[8] - b[4] * this[9] + b[1] * this[15] + b[0] * this[21];
            target[22] = b[22] * this[0] + b[13] * this[2] - b[11] * this[3] + b[10] * this[4] + b[4] * this[10] - b[3] * this[11] + b[2] * this[13] + b[0] * this[22];
            target[23] = b[23] * this[0] + b[14] * this[2] - b[12] * this[3] + b[10] * this[5] + b[5] * this[10] - b[3] * this[12] + b[2] * this[14] + b[0] * this[23];
            target[24] = b[24] * this[0] + b[15] * this[2] - b[12] * this[4] + b[11] * this[5] + b[5] * this[11] - b[4] * this[12] + b[2] * this[15] + b[0] * this[24];
            target[25] = b[25] * this[0] + b[15] * this[3] - b[14] * this[4] + b[13] * this[5] + b[5] * this[13] - b[4] * this[14] + b[3] * this[15] + b[0] * this[25];
            
            target[26] = b[26] * this[0] + b[22] * this[1] - b[19] * this[2] + b[17] * this[3] - b[16] * this[4] + b[13] * this[6] - b[11] * this[7] + b[10] * this[8] + b[8] * this[10] - b[7] * this[11] + b[6] * this[13] + b[4] * this[16] - b[3] * this[17] + b[2] * this[19] - b[1] * this[22] + b[0] * this[26];
            target[27] = b[27] * this[0] + b[23] * this[1] - b[20] * this[2] + b[18] * this[3] - b[16] * this[5] + b[14] * this[6] - b[12] * this[7] + b[10] * this[9] + b[9] * this[10] - b[7] * this[12] + b[6] * this[14] + b[5] * this[16] - b[3] * this[18] + b[2] * this[20] - b[1] * this[23] + b[0] * this[27];
            target[28] = b[28] * this[0] + b[24] * this[1] - b[21] * this[2] + b[18] * this[4] - b[17] * this[5] + b[15] * this[6] - b[12] * this[8] + b[11] * this[9] + b[9] * this[11] - b[8] * this[12] + b[6] * this[15] + b[5] * this[17] - b[4] * this[18] + b[2] * this[21] - b[1] * this[24] + b[0] * this[28];
            target[29] = b[29] * this[0] + b[25] * this[1] - b[21] * this[3] + b[20] * this[4] - b[19] * this[5] + b[15] * this[7] - b[14] * this[8] + b[13] * this[9] + b[9] * this[13] - b[8] * this[14] + b[7] * this[15] + b[5] * this[19] - b[4] * this[20] + b[3] * this[21] - b[1] * this[25] + b[0] * this[29];
            target[30] = b[30] * this[0] + b[25] * this[2] - b[24] * this[3] + b[23] * this[4] - b[22] * this[5] + b[15] * this[10] - b[14] * this[11] + b[13] * this[12] + b[12] * this[13] - b[11] * this[14] + b[10] * this[15] + b[5] * this[22] - b[4] * this[23] + b[3] * this[24] - b[2] * this[25] + b[0] * this[30];
            
            target[31] = b[31] * this[0] + b[30] * this[1] - b[29] * this[2] + b[28] * this[3] - b[27] * this[4] + b[26] * this[5] + b[25] * this[6] - b[24] * this[7] + b[23] * this[8] - b[22] * this[9] + b[21] * this[10] - b[20] * this[11] + b[19] * this[12] + b[18] * this[13] - b[17] * this[14] + b[16] * this[15] + b[15] * this[16] - b[14] * this[17] + b[13] * this[18] + b[12] * this[19] - b[11] * this[20] + b[10] * this[21] - b[9] * this[22] + b[8] * this[23] - b[7] * this[24] + b[6] * this[25] + b[5] * this[26] - b[4] * this[27] + b[3] * this[28] - b[2] * this[29] + b[1] * this[30] + b[0] * this[31];
            return target;
        }

        join(b, target) {
            if (target === undefined)
                target = new Cga()
            target[31] =  (this[31] * b[31])
            target[30] =  (this[30] * b[31] + this[31] * b[30])
            target[29] = -(this[29] * -1 * b[31] + this[31] * b[29] * -1)
            target[28] =  (this[28] * b[31] + this[31] * b[28])
            target[27] = -(this[27] * -1 * b[31] + this[31] * b[27] * -1)
            target[26] =  (this[26] * b[31] + this[31] * b[26])
            target[25] =  (this[25] * b[31] + this[29] * -1 * b[30] - this[30] * b[29] * -1 + this[31] * b[25])
            target[24] = -(this[24] * -1 * b[31] + this[28] * b[30] - this[30] * b[28] + this[31] * b[24] * -1)
            target[23] =  (this[23] * b[31] + this[27] * -1 * b[30] - this[30] * b[27] * -1 + this[31] * b[23])
            target[22] = -(this[22] * -1 * b[31] + this[26] * b[30] - this[30] * b[26] + this[31] * b[22] * -1)
            target[21] =  (this[21] * b[31] + this[28] * b[29] * -1 - this[29] * -1 * b[28] + this[31] * b[21])
            target[20] = -(this[20] * -1 * b[31] + this[27] * -1 * b[29] * -1 - this[29] * -1 * b[27] * -1 + this[31] * b[20] * -1)
            target[19] =  (this[19] * b[31] + this[26] * b[29] * -1 - this[29] * -1 * b[26] + this[31] * b[19])
            target[18] =  (this[18] * b[31] + this[27] * -1 * b[28] - this[28] * b[27] * -1 + this[31] * b[18])
            target[17] = -(this[17] * -1 * b[31] + this[26] * b[28] - this[28] * b[26] + this[31] * b[17] * -1)
            target[16] =  (this[16] * b[31] + this[26] * b[27] * -1 - this[27] * -1 * b[26] + this[31] * b[16])
            target[15] =  (this[15] * b[31] + this[21] * b[30] - this[24] * -1 * b[29] * -1 + this[25] * b[28] + this[28] * b[25] - this[29] * -1 * b[24] * -1 + this[30] * b[21] + this[31] * b[15])
            target[14] = -(this[14] * -1 * b[31] + this[20] * -1 * b[30] - this[23] * b[29] * -1 + this[25] * b[27] * -1 + this[27] * -1 * b[25] - this[29] * -1 * b[23] + this[30] * b[20] * -1 + this[31] * b[14] * -1)
            target[13] =  (this[13] * b[31] + this[19] * b[30] - this[22] * -1 * b[29] * -1 + this[25] * b[26] + this[26] * b[25] - this[29] * -1 * b[22] * -1 + this[30] * b[19] + this[31] * b[13])
            target[12] =  (this[12] * b[31] + this[18] * b[30] - this[23] * b[28] + this[24] * -1 * b[27] * -1 + this[27] * -1 * b[24] * -1 - this[28] * b[23] + this[30] * b[18] + this[31] * b[12])
            target[11] = -(this[11] * -1 * b[31] + this[17] * -1 * b[30] - this[22] * -1 * b[28] + this[24] * -1 * b[26] + this[26] * b[24] * -1 - this[28] * b[22] * -1 + this[30] * b[17] * -1 + this[31] * b[11] * -1)
            target[10] =  (this[10] * b[31] + this[16] * b[30] - this[22] * -1 * b[27] * -1 + this[23] * b[26] + this[26] * b[23] - this[27] * -1 * b[22] * -1 + this[30] * b[16] + this[31] * b[10])
            target[ 9] = -(this[9] * -1 * b[31] + this[18] * b[29] * -1 - this[20] * -1 * b[28] + this[21] * b[27] * -1 + this[27] * -1 * b[21] - this[28] * b[20] * -1 + this[29] * -1 * b[18] + this[31] * b[9] * -1)
            target[ 8] =  (this[8] * b[31] + this[17] * -1 * b[29] * -1 - this[19] * b[28] + this[21] * b[26] + this[26] * b[21] - this[28] * b[19] + this[29] * -1 * b[17] * -1 + this[31] * b[8])
            target[ 7] = -(this[7] * -1 * b[31] + this[16] * b[29] * -1 - this[19] * b[27] * -1 + this[20] * -1 * b[26] + this[26] * b[20] * -1 - this[27] * -1 * b[19] + this[29] * -1 * b[16] + this[31] * b[7] * -1)
            target[ 6] =  (this[6] * b[31] + this[16] * b[28] - this[17] * -1 * b[27] * -1 + this[18] * b[26] + this[26] * b[18] - this[27] * -1 * b[17] * -1 + this[28] * b[16] + this[31] * b[6])
            target[ 5] =  (this[5] * b[31] + this[9] * -1 * b[30] - this[12] * b[29] * -1 + this[14] * -1 * b[28] - this[15] * b[27] * -1 + this[18] * b[25] - this[20] * -1 * b[24] * -1 + this[21] * b[23] + this[23] * b[21] - this[24] * -1 * b[20] * -1 + this[25] * b[18] + this[27] * -1 * b[15] - this[28] * b[14] * -1 + this[29] * -1 * b[12] - this[30] * b[9] * -1 + this[31] * b[5])
            target[ 4] = -(this[4] * -1 * b[31] + this[8] * b[30] - this[11] * -1 * b[29] * -1 + this[13] * b[28] - this[15] * b[26] + this[17] * -1 * b[25] - this[19] * b[24] * -1 + this[21] * b[22] * -1 + this[22] * -1 * b[21] - this[24] * -1 * b[19] + this[25] * b[17] * -1 + this[26] * b[15] - this[28] * b[13] + this[29] * -1 * b[11] * -1 - this[30] * b[8] + this[31] * b[4] * -1)
            target[ 3] =  (this[3] * b[31] + this[7] * -1 * b[30] - this[10] * b[29] * -1 + this[13] * b[27] * -1 - this[14] * -1 * b[26] + this[16] * b[25] - this[19] * b[23] + this[20] * -1 * b[22] * -1 + this[22] * -1 * b[20] * -1 - this[23] * b[19] + this[25] * b[16] + this[26] * b[14] * -1 - this[27] * -1 * b[13] + this[29] * -1 * b[10] - this[30] * b[7] * -1 + this[31] * b[3])
            target[ 2] = -(this[2] * -1 * b[31] + this[6] * b[30] - this[10] * b[28] + this[11] * -1 * b[27] * -1 - this[12] * b[26] + this[16] * b[24] * -1 - this[17] * -1 * b[23] + this[18] * b[22] * -1 + this[22] * -1 * b[18] - this[23] * b[17] * -1 + this[24] * -1 * b[16] + this[26] * b[12] - this[27] * -1 * b[11] * -1 + this[28] * b[10] - this[30] * b[6] + this[31] * b[2] * -1)
            target[ 1] =  (this[1] * b[31] + this[6] * b[29] * -1 - this[7] * -1 * b[28] + this[8] * b[27] * -1 - this[9] * -1 * b[26] + this[16] * b[21] - this[17] * -1 * b[20] * -1 + this[18] * b[19] + this[19] * b[18] - this[20] * -1 * b[17] * -1 + this[21] * b[16] + this[26] * b[9] * -1 - this[27] * -1 * b[8] + this[28] * b[7] * -1 - this[29] * -1 * b[6] + this[31] * b[1])
            target[ 0] =  (this[0] * b[31] + this[1] * b[30] - this[2] * -1 * b[29] * -1 + this[3] * b[28] - this[4] * -1 * b[27] * -1 + this[5] * b[26] + this[6] * b[25] - this[7] * -1 * b[24] * -1 + this[8] * b[23] - this[9] * -1 * b[22] * -1 + this[10] * b[21] - this[11] * -1 * b[20] * -1 + this[12] * b[19] + this[13] * b[18] - this[14] * -1 * b[17] * -1 + this[15] * b[16] + this[16] * b[15] - this[17] * -1 * b[14] * -1 + this[18] * b[13] + this[19] * b[12] - this[20] * -1 * b[11] * -1 + this[21] * b[10] - this[22] * -1 * b[9] * -1 + this[23] * b[8] - this[24] * -1 * b[7] * -1 + this[25] * b[6] + this[26] * b[5] - this[27] * -1 * b[4] * -1 + this[28] * b[3] - this[29] * -1 * b[2] * -1 + this[30] * b[1] + this[31] * b[0])
            return target;
        }

        inner(b, target) {
            if (target === undefined)
                target = new Cga()
            target[ 0] = b[0] * this[0] + b[1] * this[1] + b[2] * this[2] + b[3] * this[3] + b[4] * this[4] - b[5] * this[5] - b[6] * this[6] - b[7] * this[7] - b[8] * this[8] + b[9] * this[9] - b[10] * this[10] - b[11] * this[11] + b[12] * this[12] - b[13] * this[13] + b[14] * this[14] + b[15] * this[15] - b[16] * this[16] - b[17] * this[17] + b[18] * this[18] - b[19] * this[19] + b[20] * this[20] + b[21] * this[21] - b[22] * this[22] + b[23] * this[23] + b[24] * this[24] + b[25] * this[25] + b[26] * this[26] - b[27] * this[27] - b[28] * this[28] - b[29] * this[29] - b[30] * this[30] - b[31] * this[31];
            target[ 1] = b[1] * this[0] + b[0] * this[1] - b[6] * this[2] - b[7] * this[3] - b[8] * this[4] + b[9] * this[5] + b[2] * this[6] + b[3] * this[7] + b[4] * this[8] - b[5] * this[9] - b[16] * this[10] - b[17] * this[11] + b[18] * this[12] - b[19] * this[13] + b[20] * this[14] + b[21] * this[15] - b[10] * this[16] - b[11] * this[17] + b[12] * this[18] - b[13] * this[19] + b[14] * this[20] + b[15] * this[21] + b[26] * this[22] - b[27] * this[23] - b[28] * this[24] - b[29] * this[25] - b[22] * this[26] + b[23] * this[27] + b[24] * this[28] + b[25] * this[29] - b[31] * this[30] - b[30] * this[31];
            target[ 2] = b[2] * this[0] + b[6] * this[1] + b[0] * this[2] - b[10] * this[3] - b[11] * this[4] + b[12] * this[5] - b[1] * this[6] + b[16] * this[7] + b[17] * this[8] - b[18] * this[9] + b[3] * this[10] + b[4] * this[11] - b[5] * this[12] - b[22] * this[13] + b[23] * this[14] + b[24] * this[15] + b[7] * this[16] + b[8] * this[17] - b[9] * this[18] - b[26] * this[19] + b[27] * this[20] + b[28] * this[21] - b[13] * this[22] + b[14] * this[23] + b[15] * this[24] - b[30] * this[25] + b[19] * this[26] - b[20] * this[27] - b[21] * this[28] + b[31] * this[29] + b[25] * this[30] + b[29] * this[31];
            target[ 3] = b[3] * this[0] + b[7] * this[1] + b[10] * this[2] + b[0] * this[3] - b[13] * this[4] + b[14] * this[5] - b[16] * this[6] - b[1] * this[7] + b[19] * this[8] - b[20] * this[9] - b[2] * this[10] + b[22] * this[11] - b[23] * this[12] + b[4] * this[13] - b[5] * this[14] + b[25] * this[15] - b[6] * this[16] + b[26] * this[17] - b[27] * this[18] + b[8] * this[19] - b[9] * this[20] + b[29] * this[21] + b[11] * this[22] - b[12] * this[23] + b[30] * this[24] + b[15] * this[25] - b[17] * this[26] + b[18] * this[27] - b[31] * this[28] - b[21] * this[29] - b[24] * this[30] - b[28] * this[31];
            target[ 4] = b[4] * this[0] + b[8] * this[1] + b[11] * this[2] + b[13] * this[3] + b[0] * this[4] + b[15] * this[5] - b[17] * this[6] - b[19] * this[7] - b[1] * this[8] - b[21] * this[9] - b[22] * this[10] - b[2] * this[11] - b[24] * this[12] - b[3] * this[13] - b[25] * this[14] - b[5] * this[15] - b[26] * this[16] - b[6] * this[17] - b[28] * this[18] - b[7] * this[19] - b[29] * this[20] - b[9] * this[21] - b[10] * this[22] - b[30] * this[23] - b[12] * this[24] - b[14] * this[25] + b[16] * this[26] + b[31] * this[27] + b[18] * this[28] + b[20] * this[29] + b[23] * this[30] + b[27] * this[31];
            target[ 5] = b[5] * this[0] + b[9] * this[1] + b[12] * this[2] + b[14] * this[3] + b[15] * this[4] + b[0] * this[5] - b[18] * this[6] - b[20] * this[7] - b[21] * this[8] - b[1] * this[9] - b[23] * this[10] - b[24] * this[11] - b[2] * this[12] - b[25] * this[13] - b[3] * this[14] - b[4] * this[15] - b[27] * this[16] - b[28] * this[17] - b[6] * this[18] - b[29] * this[19] - b[7] * this[20] - b[8] * this[21] - b[30] * this[22] - b[10] * this[23] - b[11] * this[24] - b[13] * this[25] + b[31] * this[26] + b[16] * this[27] + b[17] * this[28] + b[19] * this[29] + b[22] * this[30] + b[26] * this[31];
            target[ 6] = b[6] * this[0] + b[16] * this[3] + b[17] * this[4] - b[18] * this[5] + b[0] * this[6] - b[26] * this[13] + b[27] * this[14] + b[28] * this[15] + b[3] * this[16] + b[4] * this[17] - b[5] * this[18] + b[31] * this[25] - b[13] * this[26] + b[14] * this[27] + b[15] * this[28] + b[25] * this[31];
            target[ 7] = b[7] * this[0] - b[16] * this[2] + b[19] * this[4] - b[20] * this[5] + b[0] * this[7] + b[26] * this[11] - b[27] * this[12] + b[29] * this[15] - b[2] * this[16] + b[4] * this[19] - b[5] * this[20] - b[31] * this[24] + b[11] * this[26] - b[12] * this[27] + b[15] * this[29] - b[24] * this[31];
            target[ 8] = b[8] * this[0] - b[17] * this[2] - b[19] * this[3] - b[21] * this[5] + b[0] * this[8] - b[26] * this[10] - b[28] * this[12] - b[29] * this[14] - b[2] * this[17] - b[3] * this[19] - b[5] * this[21] + b[31] * this[23] - b[10] * this[26] - b[12] * this[28] - b[14] * this[29] + b[23] * this[31];
            target[ 9] = b[9] * this[0] - b[18] * this[2] - b[20] * this[3] - b[21] * this[4] + b[0] * this[9] - b[27] * this[10] - b[28] * this[11] - b[29] * this[13] - b[2] * this[18] - b[3] * this[20] - b[4] * this[21] + b[31] * this[22] - b[10] * this[27] - b[11] * this[28] - b[13] * this[29] + b[22] * this[31];
            target[10] = b[10] * this[0] + b[16] * this[1] + b[22] * this[4] - b[23] * this[5] - b[26] * this[8] + b[27] * this[9] + b[0] * this[10] + b[30] * this[15] + b[1] * this[16] + b[31] * this[21] + b[4] * this[22] - b[5] * this[23] - b[8] * this[26] + b[9] * this[27] + b[15] * this[30] + b[21] * this[31];
            target[11] = b[11] * this[0] + b[17] * this[1] - b[22] * this[3] - b[24] * this[5] + b[26] * this[7] + b[28] * this[9] + b[0] * this[11] - b[30] * this[14] + b[1] * this[17] - b[31] * this[20] - b[3] * this[22] - b[5] * this[24] + b[7] * this[26] + b[9] * this[28] - b[14] * this[30] - b[20] * this[31];
            target[12] = b[12] * this[0] + b[18] * this[1] - b[23] * this[3] - b[24] * this[4] + b[27] * this[7] + b[28] * this[8] + b[0] * this[12] - b[30] * this[13] + b[1] * this[18] - b[31] * this[19] - b[3] * this[23] - b[4] * this[24] + b[7] * this[27] + b[8] * this[28] - b[13] * this[30] - b[19] * this[31];
            target[13] = b[13] * this[0] + b[19] * this[1] + b[22] * this[2] - b[25] * this[5] - b[26] * this[6] + b[29] * this[9] + b[30] * this[12] + b[0] * this[13] + b[31] * this[18] + b[1] * this[19] + b[2] * this[22] - b[5] * this[25] - b[6] * this[26] + b[9] * this[29] + b[12] * this[30] + b[18] * this[31];
            target[14] = b[14] * this[0] + b[20] * this[1] + b[23] * this[2] - b[25] * this[4] - b[27] * this[6] + b[29] * this[8] + b[30] * this[11] + b[0] * this[14] + b[31] * this[17] + b[1] * this[20] + b[2] * this[23] - b[4] * this[25] - b[6] * this[27] + b[8] * this[29] + b[11] * this[30] + b[17] * this[31];
            target[15] = b[15] * this[0] + b[21] * this[1] + b[24] * this[2] + b[25] * this[3] - b[28] * this[6] - b[29] * this[7] - b[30] * this[10] + b[0] * this[15] - b[31] * this[16] + b[1] * this[21] + b[2] * this[24] + b[3] * this[25] - b[6] * this[28] - b[7] * this[29] - b[10] * this[30] - b[16] * this[31];
            target[16] = b[16] * this[0] - b[26] * this[4] + b[27] * this[5] + b[31] * this[15] + b[0] * this[16] + b[4] * this[26] - b[5] * this[27] + b[15] * this[31];
            target[17] = b[17] * this[0] + b[26] * this[3] + b[28] * this[5] - b[31] * this[14] + b[0] * this[17] - b[3] * this[26] - b[5] * this[28] - b[14] * this[31];
            target[18] = b[18] * this[0] + b[27] * this[3] + b[28] * this[4] - b[31] * this[13] + b[0] * this[18] - b[3] * this[27] - b[4] * this[28] - b[13] * this[31];
            target[19] = b[19] * this[0] - b[26] * this[2] + b[29] * this[5] + b[31] * this[12] + b[0] * this[19] + b[2] * this[26] - b[5] * this[29] + b[12] * this[31];
            target[20] = b[20] * this[0] - b[27] * this[2] + b[29] * this[4] + b[31] * this[11] + b[0] * this[20] + b[2] * this[27] - b[4] * this[29] + b[11] * this[31];
            target[21] = b[21] * this[0] - b[28] * this[2] - b[29] * this[3] - b[31] * this[10] + b[0] * this[21] + b[2] * this[28] + b[3] * this[29] - b[10] * this[31];
            target[22] = b[22] * this[0] + b[26] * this[1] + b[30] * this[5] - b[31] * this[9] + b[0] * this[22] - b[1] * this[26] - b[5] * this[30] - b[9] * this[31];
            target[23] = b[23] * this[0] + b[27] * this[1] + b[30] * this[4] - b[31] * this[8] + b[0] * this[23] - b[1] * this[27] - b[4] * this[30] - b[8] * this[31];
            target[24] = b[24] * this[0] + b[28] * this[1] - b[30] * this[3] + b[31] * this[7] + b[0] * this[24] - b[1] * this[28] + b[3] * this[30] + b[7] * this[31];
            target[25] = b[25] * this[0] + b[29] * this[1] + b[30] * this[2] - b[31] * this[6] + b[0] * this[25] - b[1] * this[29] - b[2] * this[30] - b[6] * this[31];
            target[26] = b[26] * this[0] - b[31] * this[5] + b[0] * this[26] - b[5] * this[31];
            target[27] = b[27] * this[0] - b[31] * this[4] + b[0] * this[27] - b[4] * this[31];
            target[28] = b[28] * this[0] + b[31] * this[3] + b[0] * this[28] + b[3] * this[31];
            target[29] = b[29] * this[0] - b[31] * this[2] + b[0] * this[29] - b[2] * this[31];
            target[30] = b[30] * this[0] + b[31] * this[1] + b[0] * this[30] + b[1] * this[31];
            target[31] = b[31] * this[0] + b[0] * this[31];
            return target;
        }

        dual(target) {
            if (target === undefined)
                target = new Cga()

            target[ 0] = -this[31];
            target[ 1] = -this[30];
            target[ 2] =  this[29];
            target[ 3] = -this[28];
            target[ 4] =  this[27];
            target[ 5] =  this[26];
            target[ 6] =  this[25];
            target[ 7] = -this[24];
            target[ 8] =  this[23];
            target[ 9] =  this[22];
            target[10] =  this[21];
            target[11] = -this[20];
            target[12] = -this[19];
            target[13] =  this[18];
            target[14] =  this[17];
            target[15] = -this[16];
            target[16] =  this[15];
            target[17] = -this[14];
            target[18] = -this[13];
            target[19] =  this[12];
            target[20] =  this[11];
            target[21] = -this[10];
            target[22] = -this[9];
            target[23] = -this[8];
            target[24] =  this[7];
            target[25] = -this[6];
            target[26] = -this[5];
            target[27] = -this[4];
            target[28] =  this[3];
            target[29] = -this[2];
            target[30] =  this[1];
            target[31] =  this[0];
            return target;
        }

        innerSelfScalar() {
            return this[0] * this[0] + this[1] * this[1] + this[2] * this[2] + this[3] * this[3] + this[4] * this[4] - this[5] * this[5] - this[6] * this[6] - this[7] * this[7] - this[8] * this[8] + this[9] * this[9] - this[10] * this[10] - this[11] * this[11] + this[12] * this[12] - this[13] * this[13] + this[14] * this[14] + this[15] * this[15] - this[16] * this[16] - this[17] * this[17] + this[18] * this[18] - this[19] * this[19] + this[20] * this[20] + this[21] * this[21] - this[22] * this[22] + this[23] * this[23] + this[24] * this[24] + this[25] * this[25] + this[26] * this[26] - this[27] * this[27] - this[28] * this[28] - this[29] * this[29] - this[30] * this[30] - this[31] * this[31]
        }

        mul(b, target) {
            if (target === undefined)
                target = new Cga()
            
            target[ 0] = b[ 0] * this[ 0] + b[ 1] * this[ 1] + b[ 2] * this[ 2] + b[ 3] * this[ 3] + b[ 4] * this[ 4] - b[ 5] * this[ 5] - b[ 6] * this[ 6] - b[ 7] * this[ 7] - b[ 8] * this[ 8] + b[ 9] * this[ 9] - b[10] * this[10] - b[11] * this[11] + b[12] * this[12] - b[13] * this[13] + b[14] * this[14] + b[15] * this[15] - b[16] * this[16] - b[17] * this[17] + b[18] * this[18] - b[19] * this[19] + b[20] * this[20] + b[21] * this[21] - b[22] * this[22] + b[23] * this[23] + b[24] * this[24] + b[25] * this[25] + b[26] * this[26] - b[27] * this[27] - b[28] * this[28] - b[29] * this[29] - b[30] * this[30] - b[31] * this[31];
            target[ 1] = b[ 1] * this[ 0] + b[ 0] * this[ 1] - b[ 6] * this[ 2] - b[ 7] * this[ 3] - b[ 8] * this[ 4] + b[ 9] * this[ 5] + b[ 2] * this[ 6] + b[ 3] * this[ 7] + b[ 4] * this[ 8] - b[ 5] * this[ 9] - b[16] * this[10] - b[17] * this[11] + b[18] * this[12] - b[19] * this[13] + b[20] * this[14] + b[21] * this[15] - b[10] * this[16] - b[11] * this[17] + b[12] * this[18] - b[13] * this[19] + b[14] * this[20] + b[15] * this[21] + b[26] * this[22] - b[27] * this[23] - b[28] * this[24] - b[29] * this[25] - b[22] * this[26] + b[23] * this[27] + b[24] * this[28] + b[25] * this[29] - b[31] * this[30] - b[30] * this[31];
            target[ 2] = b[ 2] * this[ 0] + b[ 6] * this[ 1] + b[ 0] * this[ 2] - b[10] * this[ 3] - b[11] * this[ 4] + b[12] * this[ 5] - b[ 1] * this[ 6] + b[16] * this[ 7] + b[17] * this[ 8] - b[18] * this[ 9] + b[ 3] * this[10] + b[ 4] * this[11] - b[ 5] * this[12] - b[22] * this[13] + b[23] * this[14] + b[24] * this[15] + b[ 7] * this[16] + b[ 8] * this[17] - b[ 9] * this[18] - b[26] * this[19] + b[27] * this[20] + b[28] * this[21] - b[13] * this[22] + b[14] * this[23] + b[15] * this[24] - b[30] * this[25] + b[19] * this[26] - b[20] * this[27] - b[21] * this[28] + b[31] * this[29] + b[25] * this[30] + b[29] * this[31];
            target[ 3] = b[ 3] * this[ 0] + b[ 7] * this[ 1] + b[10] * this[ 2] + b[ 0] * this[ 3] - b[13] * this[ 4] + b[14] * this[ 5] - b[16] * this[ 6] - b[ 1] * this[ 7] + b[19] * this[ 8] - b[20] * this[ 9] - b[ 2] * this[10] + b[22] * this[11] - b[23] * this[12] + b[ 4] * this[13] - b[ 5] * this[14] + b[25] * this[15] - b[ 6] * this[16] + b[26] * this[17] - b[27] * this[18] + b[ 8] * this[19] - b[ 9] * this[20] + b[29] * this[21] + b[11] * this[22] - b[12] * this[23] + b[30] * this[24] + b[15] * this[25] - b[17] * this[26] + b[18] * this[27] - b[31] * this[28] - b[21] * this[29] - b[24] * this[30] - b[28] * this[31];
            target[ 4] = b[ 4] * this[ 0] + b[ 8] * this[ 1] + b[11] * this[ 2] + b[13] * this[ 3] + b[ 0] * this[ 4] + b[15] * this[ 5] - b[17] * this[ 6] - b[19] * this[ 7] - b[ 1] * this[ 8] - b[21] * this[ 9] - b[22] * this[10] - b[ 2] * this[11] - b[24] * this[12] - b[ 3] * this[13] - b[25] * this[14] - b[ 5] * this[15] - b[26] * this[16] - b[ 6] * this[17] - b[28] * this[18] - b[ 7] * this[19] - b[29] * this[20] - b[ 9] * this[21] - b[10] * this[22] - b[30] * this[23] - b[12] * this[24] - b[14] * this[25] + b[16] * this[26] + b[31] * this[27] + b[18] * this[28] + b[20] * this[29] + b[23] * this[30] + b[27] * this[31];
            target[ 5] = b[ 5] * this[ 0] + b[ 9] * this[ 1] + b[12] * this[ 2] + b[14] * this[ 3] + b[15] * this[ 4] + b[ 0] * this[ 5] - b[18] * this[ 6] - b[20] * this[ 7] - b[21] * this[ 8] - b[ 1] * this[ 9] - b[23] * this[10] - b[24] * this[11] - b[ 2] * this[12] - b[25] * this[13] - b[ 3] * this[14] - b[ 4] * this[15] - b[27] * this[16] - b[28] * this[17] - b[ 6] * this[18] - b[29] * this[19] - b[ 7] * this[20] - b[ 8] * this[21] - b[30] * this[22] - b[10] * this[23] - b[11] * this[24] - b[13] * this[25] + b[31] * this[26] + b[16] * this[27] + b[17] * this[28] + b[19] * this[29] + b[22] * this[30] + b[26] * this[31];
            target[ 6] = b[ 6] * this[ 0] + b[ 2] * this[ 1] - b[ 1] * this[ 2] + b[16] * this[ 3] + b[17] * this[ 4] - b[18] * this[ 5] + b[ 0] * this[ 6] - b[10] * this[ 7] - b[11] * this[ 8] + b[12] * this[ 9] + b[ 7] * this[10] + b[ 8] * this[11] - b[ 9] * this[12] - b[26] * this[13] + b[27] * this[14] + b[28] * this[15] + b[ 3] * this[16] + b[ 4] * this[17] - b[ 5] * this[18] - b[22] * this[19] + b[23] * this[20] + b[24] * this[21] + b[19] * this[22] - b[20] * this[23] - b[21] * this[24] + b[31] * this[25] - b[13] * this[26] + b[14] * this[27] + b[15] * this[28] - b[30] * this[29] + b[29] * this[30] + b[25] * this[31];
            target[ 7] = b[ 7] * this[ 0] + b[ 3] * this[ 1] - b[16] * this[ 2] - b[ 1] * this[ 3] + b[19] * this[ 4] - b[20] * this[ 5] + b[10] * this[ 6] + b[ 0] * this[ 7] - b[13] * this[ 8] + b[14] * this[ 9] - b[ 6] * this[10] + b[26] * this[11] - b[27] * this[12] + b[ 8] * this[13] - b[ 9] * this[14] + b[29] * this[15] - b[ 2] * this[16] + b[22] * this[17] - b[23] * this[18] + b[ 4] * this[19] - b[ 5] * this[20] + b[25] * this[21] - b[17] * this[22] + b[18] * this[23] - b[31] * this[24] - b[21] * this[25] + b[11] * this[26] - b[12] * this[27] + b[30] * this[28] + b[15] * this[29] - b[28] * this[30] - b[24] * this[31];
            target[ 8] = b[ 8] * this[ 0] + b[ 4] * this[ 1] - b[17] * this[ 2] - b[19] * this[ 3] - b[ 1] * this[ 4] - b[21] * this[ 5] + b[11] * this[ 6] + b[13] * this[ 7] + b[ 0] * this[ 8] + b[15] * this[ 9] - b[26] * this[10] - b[ 6] * this[11] - b[28] * this[12] - b[ 7] * this[13] - b[29] * this[14] - b[ 9] * this[15] - b[22] * this[16] - b[ 2] * this[17] - b[24] * this[18] - b[ 3] * this[19] - b[25] * this[20] - b[ 5] * this[21] + b[16] * this[22] + b[31] * this[23] + b[18] * this[24] + b[20] * this[25] - b[10] * this[26] - b[30] * this[27] - b[12] * this[28] - b[14] * this[29] + b[27] * this[30] + b[23] * this[31];
            target[ 9] = b[ 9] * this[ 0] + b[ 5] * this[ 1] - b[18] * this[ 2] - b[20] * this[ 3] - b[21] * this[ 4] - b[ 1] * this[ 5] + b[12] * this[ 6] + b[14] * this[ 7] + b[15] * this[ 8] + b[ 0] * this[ 9] - b[27] * this[10] - b[28] * this[11] - b[ 6] * this[12] - b[29] * this[13] - b[ 7] * this[14] - b[ 8] * this[15] - b[23] * this[16] - b[24] * this[17] - b[ 2] * this[18] - b[25] * this[19] - b[ 3] * this[20] - b[ 4] * this[21] + b[31] * this[22] + b[16] * this[23] + b[17] * this[24] + b[19] * this[25] - b[30] * this[26] - b[10] * this[27] - b[11] * this[28] - b[13] * this[29] + b[26] * this[30] + b[22] * this[31];
            target[10] = b[10] * this[ 0] + b[16] * this[ 1] + b[ 3] * this[ 2] - b[ 2] * this[ 3] + b[22] * this[ 4] - b[23] * this[ 5] - b[ 7] * this[ 6] + b[ 6] * this[ 7] - b[26] * this[ 8] + b[27] * this[ 9] + b[ 0] * this[10] - b[13] * this[11] + b[14] * this[12] + b[11] * this[13] - b[12] * this[14] + b[30] * this[15] + b[ 1] * this[16] - b[19] * this[17] + b[20] * this[18] + b[17] * this[19] - b[18] * this[20] + b[31] * this[21] + b[ 4] * this[22] - b[ 5] * this[23] + b[25] * this[24] - b[24] * this[25] - b[ 8] * this[26] + b[ 9] * this[27] - b[29] * this[28] + b[28] * this[29] + b[15] * this[30] + b[21] * this[31];
            target[11] = b[11] * this[ 0] + b[17] * this[ 1] + b[ 4] * this[ 2] - b[22] * this[ 3] - b[ 2] * this[ 4] - b[24] * this[ 5] - b[ 8] * this[ 6] + b[26] * this[ 7] + b[ 6] * this[ 8] + b[28] * this[ 9] + b[13] * this[10] + b[ 0] * this[11] + b[15] * this[12] - b[10] * this[13] - b[30] * this[14] - b[12] * this[15] + b[19] * this[16] + b[ 1] * this[17] + b[21] * this[18] - b[16] * this[19] - b[31] * this[20] - b[18] * this[21] - b[ 3] * this[22] - b[25] * this[23] - b[ 5] * this[24] + b[23] * this[25] + b[ 7] * this[26] + b[29] * this[27] + b[ 9] * this[28] - b[27] * this[29] - b[14] * this[30] - b[20] * this[31];
            target[12] = b[12] * this[ 0] + b[18] * this[ 1] + b[ 5] * this[ 2] - b[23] * this[ 3] - b[24] * this[ 4] - b[ 2] * this[ 5] - b[ 9] * this[ 6] + b[27] * this[ 7] + b[28] * this[ 8] + b[ 6] * this[ 9] + b[14] * this[10] + b[15] * this[11] + b[ 0] * this[12] - b[30] * this[13] - b[10] * this[14] - b[11] * this[15] + b[20] * this[16] + b[21] * this[17] + b[ 1] * this[18] - b[31] * this[19] - b[16] * this[20] - b[17] * this[21] - b[25] * this[22] - b[ 3] * this[23] - b[ 4] * this[24] + b[22] * this[25] + b[29] * this[26] + b[ 7] * this[27] + b[ 8] * this[28] - b[26] * this[29] - b[13] * this[30] - b[19] * this[31];
            target[13] = b[13] * this[ 0] + b[19] * this[ 1] + b[22] * this[ 2] + b[ 4] * this[ 3] - b[ 3] * this[ 4] - b[25] * this[ 5] - b[26] * this[ 6] - b[ 8] * this[ 7] + b[ 7] * this[ 8] + b[29] * this[ 9] - b[11] * this[10] + b[10] * this[11] + b[30] * this[12] + b[ 0] * this[13] + b[15] * this[14] - b[14] * this[15] - b[17] * this[16] + b[16] * this[17] + b[31] * this[18] + b[ 1] * this[19] + b[21] * this[20] - b[20] * this[21] + b[ 2] * this[22] + b[24] * this[23] - b[23] * this[24] - b[ 5] * this[25] - b[ 6] * this[26] - b[28] * this[27] + b[27] * this[28] + b[ 9] * this[29] + b[12] * this[30] + b[18] * this[31];
            target[14] = b[14] * this[ 0] + b[20] * this[ 1] + b[23] * this[ 2] + b[ 5] * this[ 3] - b[25] * this[ 4] - b[ 3] * this[ 5] - b[27] * this[ 6] - b[ 9] * this[ 7] + b[29] * this[ 8] + b[ 7] * this[ 9] - b[12] * this[10] + b[30] * this[11] + b[10] * this[12] + b[15] * this[13] + b[ 0] * this[14] - b[13] * this[15] - b[18] * this[16] + b[31] * this[17] + b[16] * this[18] + b[21] * this[19] + b[ 1] * this[20] - b[19] * this[21] + b[24] * this[22] + b[ 2] * this[23] - b[22] * this[24] - b[ 4] * this[25] - b[28] * this[26] - b[ 6] * this[27] + b[26] * this[28] + b[ 8] * this[29] + b[11] * this[30] + b[17] * this[31];
            target[15] = b[15] * this[ 0] + b[21] * this[ 1] + b[24] * this[ 2] + b[25] * this[ 3] + b[ 5] * this[ 4] - b[ 4] * this[ 5] - b[28] * this[ 6] - b[29] * this[ 7] - b[ 9] * this[ 8] + b[ 8] * this[ 9] - b[30] * this[10] - b[12] * this[11] + b[11] * this[12] - b[14] * this[13] + b[13] * this[14] + b[ 0] * this[15] - b[31] * this[16] - b[18] * this[17] + b[17] * this[18] - b[20] * this[19] + b[19] * this[20] + b[ 1] * this[21] - b[23] * this[22] + b[22] * this[23] + b[ 2] * this[24] + b[ 3] * this[25] + b[27] * this[26] - b[26] * this[27] - b[ 6] * this[28] - b[ 7] * this[29] - b[10] * this[30] - b[16] * this[31];
            target[16] = b[16] * this[ 0] + b[10] * this[ 1] - b[ 7] * this[ 2] + b[ 6] * this[ 3] - b[26] * this[ 4] + b[27] * this[ 5] + b[ 3] * this[ 6] - b[ 2] * this[ 7] + b[22] * this[ 8] - b[23] * this[ 9] + b[ 1] * this[10] - b[19] * this[11] + b[20] * this[12] + b[17] * this[13] - b[18] * this[14] + b[31] * this[15] + b[ 0] * this[16] - b[13] * this[17] + b[14] * this[18] + b[11] * this[19] - b[12] * this[20] + b[30] * this[21] - b[ 8] * this[22] + b[ 9] * this[23] - b[29] * this[24] + b[28] * this[25] + b[ 4] * this[26] - b[ 5] * this[27] + b[25] * this[28] - b[24] * this[29] + b[21] * this[30] + b[15] * this[31];
            target[17] = b[17] * this[ 0] + b[11] * this[ 1] - b[ 8] * this[ 2] + b[26] * this[ 3] + b[ 6] * this[ 4] + b[28] * this[ 5] + b[ 4] * this[ 6] - b[22] * this[ 7] - b[ 2] * this[ 8] - b[24] * this[ 9] + b[19] * this[10] + b[ 1] * this[11] + b[21] * this[12] - b[16] * this[13] - b[31] * this[14] - b[18] * this[15] + b[13] * this[16] + b[ 0] * this[17] + b[15] * this[18] - b[10] * this[19] - b[30] * this[20] - b[12] * this[21] + b[ 7] * this[22] + b[29] * this[23] + b[ 9] * this[24] - b[27] * this[25] - b[ 3] * this[26] - b[25] * this[27] - b[ 5] * this[28] + b[23] * this[29] - b[20] * this[30] - b[14] * this[31];
            target[18] = b[18] * this[ 0] + b[12] * this[ 1] - b[ 9] * this[ 2] + b[27] * this[ 3] + b[28] * this[ 4] + b[ 6] * this[ 5] + b[ 5] * this[ 6] - b[23] * this[ 7] - b[24] * this[ 8] - b[ 2] * this[ 9] + b[20] * this[10] + b[21] * this[11] + b[ 1] * this[12] - b[31] * this[13] - b[16] * this[14] - b[17] * this[15] + b[14] * this[16] + b[15] * this[17] + b[ 0] * this[18] - b[30] * this[19] - b[10] * this[20] - b[11] * this[21] + b[29] * this[22] + b[ 7] * this[23] + b[ 8] * this[24] - b[26] * this[25] - b[25] * this[26] - b[ 3] * this[27] - b[ 4] * this[28] + b[22] * this[29] - b[19] * this[30] - b[13] * this[31];
            target[19] = b[19] * this[ 0] + b[13] * this[ 1] - b[26] * this[ 2] - b[ 8] * this[ 3] + b[ 7] * this[ 4] + b[29] * this[ 5] + b[22] * this[ 6] + b[ 4] * this[ 7] - b[ 3] * this[ 8] - b[25] * this[ 9] - b[17] * this[10] + b[16] * this[11] + b[31] * this[12] + b[ 1] * this[13] + b[21] * this[14] - b[20] * this[15] - b[11] * this[16] + b[10] * this[17] + b[30] * this[18] + b[ 0] * this[19] + b[15] * this[20] - b[14] * this[21] - b[ 6] * this[22] - b[28] * this[23] + b[27] * this[24] + b[ 9] * this[25] + b[ 2] * this[26] + b[24] * this[27] - b[23] * this[28] - b[ 5] * this[29] + b[18] * this[30] + b[12] * this[31];
            target[20] = b[20] * this[ 0] + b[14] * this[ 1] - b[27] * this[ 2] - b[ 9] * this[ 3] + b[29] * this[ 4] + b[ 7] * this[ 5] + b[23] * this[ 6] + b[ 5] * this[ 7] - b[25] * this[ 8] - b[ 3] * this[ 9] - b[18] * this[10] + b[31] * this[11] + b[16] * this[12] + b[21] * this[13] + b[ 1] * this[14] - b[19] * this[15] - b[12] * this[16] + b[30] * this[17] + b[10] * this[18] + b[15] * this[19] + b[ 0] * this[20] - b[13] * this[21] - b[28] * this[22] - b[ 6] * this[23] + b[26] * this[24] + b[ 8] * this[25] + b[24] * this[26] + b[ 2] * this[27] - b[22] * this[28] - b[ 4] * this[29] + b[17] * this[30] + b[11] * this[31];
            target[21] = b[21] * this[ 0] + b[15] * this[ 1] - b[28] * this[ 2] - b[29] * this[ 3] - b[ 9] * this[ 4] + b[ 8] * this[ 5] + b[24] * this[ 6] + b[25] * this[ 7] + b[ 5] * this[ 8] - b[ 4] * this[ 9] - b[31] * this[10] - b[18] * this[11] + b[17] * this[12] - b[20] * this[13] + b[19] * this[14] + b[ 1] * this[15] - b[30] * this[16] - b[12] * this[17] + b[11] * this[18] - b[14] * this[19] + b[13] * this[20] + b[ 0] * this[21] + b[27] * this[22] - b[26] * this[23] - b[ 6] * this[24] - b[ 7] * this[25] - b[23] * this[26] + b[22] * this[27] + b[ 2] * this[28] + b[ 3] * this[29] - b[16] * this[30] - b[10] * this[31];
            target[22] = b[22] * this[ 0] + b[26] * this[ 1] + b[13] * this[ 2] - b[11] * this[ 3] + b[10] * this[ 4] + b[30] * this[ 5] - b[19] * this[ 6] + b[17] * this[ 7] - b[16] * this[ 8] - b[31] * this[ 9] + b[ 4] * this[10] - b[ 3] * this[11] - b[25] * this[12] + b[ 2] * this[13] + b[24] * this[14] - b[23] * this[15] + b[ 8] * this[16] - b[ 7] * this[17] - b[29] * this[18] + b[ 6] * this[19] + b[28] * this[20] - b[27] * this[21] + b[ 0] * this[22] + b[15] * this[23] - b[14] * this[24] + b[12] * this[25] - b[ 1] * this[26] - b[21] * this[27] + b[20] * this[28] - b[18] * this[29] - b[ 5] * this[30] - b[ 9] * this[31];
            target[23] = b[23] * this[ 0] + b[27] * this[ 1] + b[14] * this[ 2] - b[12] * this[ 3] + b[30] * this[ 4] + b[10] * this[ 5] - b[20] * this[ 6] + b[18] * this[ 7] - b[31] * this[ 8] - b[16] * this[ 9] + b[ 5] * this[10] - b[25] * this[11] - b[ 3] * this[12] + b[24] * this[13] + b[ 2] * this[14] - b[22] * this[15] + b[ 9] * this[16] - b[29] * this[17] - b[ 7] * this[18] + b[28] * this[19] + b[ 6] * this[20] - b[26] * this[21] + b[15] * this[22] + b[ 0] * this[23] - b[13] * this[24] + b[11] * this[25] - b[21] * this[26] - b[ 1] * this[27] + b[19] * this[28] - b[17] * this[29] - b[ 4] * this[30] - b[ 8] * this[31];
            target[24] = b[24] * this[ 0] + b[28] * this[ 1] + b[15] * this[ 2] - b[30] * this[ 3] - b[12] * this[ 4] + b[11] * this[ 5] - b[21] * this[ 6] + b[31] * this[ 7] + b[18] * this[ 8] - b[17] * this[ 9] + b[25] * this[10] + b[ 5] * this[11] - b[ 4] * this[12] - b[23] * this[13] + b[22] * this[14] + b[ 2] * this[15] + b[29] * this[16] + b[ 9] * this[17] - b[ 8] * this[18] - b[27] * this[19] + b[26] * this[20] + b[ 6] * this[21] - b[14] * this[22] + b[13] * this[23] + b[ 0] * this[24] - b[10] * this[25] + b[20] * this[26] - b[19] * this[27] - b[ 1] * this[28] + b[16] * this[29] + b[ 3] * this[30] + b[ 7] * this[31];
            target[25] = b[25] * this[ 0] + b[29] * this[ 1] + b[30] * this[ 2] + b[15] * this[ 3] - b[14] * this[ 4] + b[13] * this[ 5] - b[31] * this[ 6] - b[21] * this[ 7] + b[20] * this[ 8] - b[19] * this[ 9] - b[24] * this[10] + b[23] * this[11] - b[22] * this[12] + b[ 5] * this[13] - b[ 4] * this[14] + b[ 3] * this[15] - b[28] * this[16] + b[27] * this[17] - b[26] * this[18] + b[ 9] * this[19] - b[ 8] * this[20] + b[ 7] * this[21] + b[12] * this[22] - b[11] * this[23] + b[10] * this[24] + b[ 0] * this[25] - b[18] * this[26] + b[17] * this[27] - b[16] * this[28] - b[ 1] * this[29] - b[ 2] * this[30] - b[ 6] * this[31];
            target[26] = b[26] * this[ 0] + b[22] * this[ 1] - b[19] * this[ 2] + b[17] * this[ 3] - b[16] * this[ 4] - b[31] * this[ 5] + b[13] * this[ 6] - b[11] * this[ 7] + b[10] * this[ 8] + b[30] * this[ 9] + b[ 8] * this[10] - b[ 7] * this[11] - b[29] * this[12] + b[ 6] * this[13] + b[28] * this[14] - b[27] * this[15] + b[ 4] * this[16] - b[ 3] * this[17] - b[25] * this[18] + b[ 2] * this[19] + b[24] * this[20] - b[23] * this[21] - b[ 1] * this[22] - b[21] * this[23] + b[20] * this[24] - b[18] * this[25] + b[ 0] * this[26] + b[15] * this[27] - b[14] * this[28] + b[12] * this[29] - b[ 9] * this[30] - b[ 5] * this[31];
            target[27] = b[27] * this[ 0] + b[23] * this[ 1] - b[20] * this[ 2] + b[18] * this[ 3] - b[31] * this[ 4] - b[16] * this[ 5] + b[14] * this[ 6] - b[12] * this[ 7] + b[30] * this[ 8] + b[10] * this[ 9] + b[ 9] * this[10] - b[29] * this[11] - b[ 7] * this[12] + b[28] * this[13] + b[ 6] * this[14] - b[26] * this[15] + b[ 5] * this[16] - b[25] * this[17] - b[ 3] * this[18] + b[24] * this[19] + b[ 2] * this[20] - b[22] * this[21] - b[21] * this[22] - b[ 1] * this[23] + b[19] * this[24] - b[17] * this[25] + b[15] * this[26] + b[ 0] * this[27] - b[13] * this[28] + b[11] * this[29] - b[ 8] * this[30] - b[ 4] * this[31];
            target[28] = b[28] * this[ 0] + b[24] * this[ 1] - b[21] * this[ 2] + b[31] * this[ 3] + b[18] * this[ 4] - b[17] * this[ 5] + b[15] * this[ 6] - b[30] * this[ 7] - b[12] * this[ 8] + b[11] * this[ 9] + b[29] * this[10] + b[ 9] * this[11] - b[ 8] * this[12] - b[27] * this[13] + b[26] * this[14] + b[ 6] * this[15] + b[25] * this[16] + b[ 5] * this[17] - b[ 4] * this[18] - b[23] * this[19] + b[22] * this[20] + b[ 2] * this[21] + b[20] * this[22] - b[19] * this[23] - b[ 1] * this[24] + b[16] * this[25] - b[14] * this[26] + b[13] * this[27] + b[ 0] * this[28] - b[10] * this[29] + b[ 7] * this[30] + b[ 3] * this[31];
            target[29] = b[29] * this[ 0] + b[25] * this[ 1] - b[31] * this[ 2] - b[21] * this[ 3] + b[20] * this[ 4] - b[19] * this[ 5] + b[30] * this[ 6] + b[15] * this[ 7] - b[14] * this[ 8] + b[13] * this[ 9] - b[28] * this[10] + b[27] * this[11] - b[26] * this[12] + b[ 9] * this[13] - b[ 8] * this[14] + b[ 7] * this[15] - b[24] * this[16] + b[23] * this[17] - b[22] * this[18] + b[ 5] * this[19] - b[ 4] * this[20] + b[ 3] * this[21] - b[18] * this[22] + b[17] * this[23] - b[16] * this[24] - b[ 1] * this[25] + b[12] * this[26] - b[11] * this[27] + b[10] * this[28] + b[ 0] * this[29] - b[ 6] * this[30] - b[ 2] * this[31];
            target[30] = b[30] * this[ 0] + b[31] * this[ 1] + b[25] * this[ 2] - b[24] * this[ 3] + b[23] * this[ 4] - b[22] * this[ 5] - b[29] * this[ 6] + b[28] * this[ 7] - b[27] * this[ 8] + b[26] * this[ 9] + b[15] * this[10] - b[14] * this[11] + b[13] * this[12] + b[12] * this[13] - b[11] * this[14] + b[10] * this[15] + b[21] * this[16] - b[20] * this[17] + b[19] * this[18] + b[18] * this[19] - b[17] * this[20] + b[16] * this[21] + b[ 5] * this[22] - b[ 4] * this[23] + b[ 3] * this[24] - b[ 2] * this[25] - b[ 9] * this[26] + b[ 8] * this[27] - b[ 7] * this[28] + b[ 6] * this[29] + b[ 0] * this[30] + b[ 1] * this[31];
            target[31] = b[31] * this[ 0] + b[30] * this[ 1] - b[29] * this[ 2] + b[28] * this[ 3] - b[27] * this[ 4] + b[26] * this[ 5] + b[25] * this[ 6] - b[24] * this[ 7] + b[23] * this[ 8] - b[22] * this[ 9] + b[21] * this[10] - b[20] * this[11] + b[19] * this[12] + b[18] * this[13] - b[17] * this[14] + b[16] * this[15] + b[15] * this[16] - b[14] * this[17] + b[13] * this[18] + b[12] * this[19] - b[11] * this[20] + b[10] * this[21] - b[ 9] * this[22] + b[ 8] * this[23] - b[ 7] * this[24] + b[ 6] * this[25] + b[ 5] * this[26] - b[ 4] * this[27] + b[ 3] * this[28] - b[ 2] * this[29] + b[ 1] * this[30] + b[ 0] * this[31];

            return target
        }
    }
    window.Cga = Cga

    Cga.basisNames = [
        ``,
        `1`, `2`, `3`, `p`, `m`,
        `12`, `13`, `1p`, `1m`, `23`, `2p`, `2m`, `3p`, `3m`, `pm`,  //line start is [6]
        `123`, `12p`, `12m`, `13p`, `13m`, `1pm`, `23p`, `23m`, `2pm`, `3pm`,  //lines starts at [16]
        `123p`, `123m`, `12pm`, `13pm`, `23pm`,
        `I`]
    

    Cga.indexGrades = [
        0,                    // CGA           4D HPGA
        1,1,1,1,1,            //sphere         3-plane
        2,2,2,2,2,2,2,2,2,2,  //circle         plane
        3,3,3,3,3,3,3,3,3,3,  //point pair     line
        4,4,4,4,4,            //point          point
        5   
    ]

    strToBasisCga = (token, target) => {
        if(target === undefined)
            console.error("target needed")

        let subscript = token.slice(1)

        if (token === "I") {
            target.fromFloatAndIndex(1., 31)
            return true
        }

        if(token[0] !== `e`)
            return false

        let current = localCga0
        target.fromFloatAndIndex( 1., 0 )
        for(let i = 0, il = subscript.length; i < il; ++i) {
            current.copy(target)

            let nextMeet = 
                (subscript[i] === `0` || subscript[i] === `₀`) ? e0c :
                (subscript[i] === `1` || subscript[i] === `₁`) ? e1c :
                (subscript[i] === `2` || subscript[i] === `₂`) ? e2c :
                (subscript[i] === `3` || subscript[i] === `₃`) ? e3c :
                (subscript[i] === `o` || subscript[i] === `𝅘`) ? eo :
                (subscript[i] === `p` || subscript[i] === `ₚ` || subscript[i] === `4` || subscript[i] === `₄`) ? ep :
                (subscript[i] === `m` || subscript[i] === `ₘ` || subscript[i] === `5` || subscript[i] === `₅`) ? em :
                null
            
            if(nextMeet === null)
                return false
            
            current.meet(nextMeet, target)
        }
        
        return true
    }

    zeroCga = new Cga()
    oneCga = new Cga()
    oneCga[0] = 1.
    let minusOneCga = new Cga()
    minusOneCga[0] = -1.


    // let thingies = ["p", "m", "1", "2", "3"]
    // let allNames = []
    // function meh( indices, start, numWanted ) {
    //     if(numWanted === 0) {
    //         let names = indices.map(i=>thingies[i])
    //         names.forEach((name)=>{

    //         })
    //         .join(``)
    //         log(name)
            
            
    //     }
    //     else {
    //         for(let i = start; i < 5; ++i) {
    //             let newIndices = indices.map(x => x)
    //             newIndices.push(i)
    //             meh(newIndices, i+1, numWanted-1 )
    //         }
    //     }
    // }
    // for(let i = 2; i < 6; ++i) {
    //     meh([],0,i)
    // }
    // log(allNames)


    ep = new Cga().fromFloatAndIndex(1., 4)
    em = new Cga().fromFloatAndIndex(1., 5) //not modelling, but minus

    //pga things
    {
        e1c = new Cga().fromFloatAndIndex(1., 1)
        e2c = new Cga().fromFloatAndIndex(1., 2)
        e3c = new Cga().fromFloatAndIndex(1., 3)
        e0c   = ep.add(em)

        e12c  = e1c.mul(e2c)
        e23c  = e2c.mul(e3c)
        e13c  = e1c.mul(e3c)
        e31c  = e3c.mul(e1c)
        
        e01c  = e0c.mul(e1c)
        e02c  = e0c.mul(e2c)
        e03c  = e0c.mul(e3c)
        
        e123c = e12c.mul(e3c)
        e012c = e0c.mul(e12c)
        e023c = e0c.mul(e23c)
        e013c = e0c.mul(e13c)
        e031c = e03c.mul(e1c)

        e0123c = e01c.mul(e23c) // = e0c.dual()
    }

    //unit great circles
    e1p = e1c.mul(ep)
    e2p = e2c.mul(ep)
    e3p = e3c.mul(ep)

    //alternative name is eo. Looks kinda cooler and we are doing lots of Conformal GA
    //zero-radius-sphere at the origin
    eo = ep.sub(em).multiplyScalar(0.5)
    eInf = e0123c
    eOri = eo.dual()
    
    //scalings
    epm = ep.mul(em)  //from infinity toward origin
    e1m = e1c.mul(em) //from unit sphere pole to other unit sphere pole
    e2m = e2c.mul(em)
    e3m = e3c.mul(em)

    e123p = e123c.mul(ep) //conformal or rotate -> conformal-and-rotate
    e123m = e123c.mul(em) //conformal or scale -> conformal-and-scale
    e12pm = e12c.mul(epm)
    e23pm = e23c.mul(epm)
    e13pm = e13c.mul(epm)

    cga0 = new Cga()
    cga1 = new Cga()
    cga2 = new Cga()
    cga3 = new Cga()
    cga4 = new Cga()
    cga5 = new Cga()
    cga6 = new Cga()

    let localCga0 = new Cga()
    let localCga1 = new Cga()
    let localCga2 = new Cga()
    let localCga3 = new Cga()
    let localCga4 = new Cga()
    let localCga5 = new Cga()
    let localCga6 = new Cga()

    let localRotor0 = new Rotor()
    let localRotor1 = new Rotor()
    let localRotor2 = new Rotor()
    rotor0 = new Rotor()
    rotor1 = new Rotor()
    rotor2 = new Rotor()
    rotor3 = new Rotor()
    rotor4 = new Rotor()

    let localCircle0 = new Circle()
    let localCircle1 = new Circle()
    let localCircle2 = new Circle()

    sphere0 = new Sphere()
    sphere1 = new Sphere()
    sphere2 = new Sphere()
    circle0 = new Circle()
    circle1 = new Circle()
    circle2 = new Circle()
    circle3 = new Circle()

    oneRotor = new Rotor()
    oneRotor[0] = 1.

    let localSphere0 = new Sphere()

    /*END*/
}