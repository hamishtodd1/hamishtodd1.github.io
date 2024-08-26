
function init41() {

    // class Una extends GeneralVector {
    //     constructor() {
    //         super(5)
    //     }
    
    //     mul(b,target) {
    //         if(b.constructor === Even) {
    //             target[0] = this[0] * b[0] + this[4] * b[4] - this[1] * b[1] - this[2] * b[2] - this[3] * b[3];
    //             target[1] = this[0] * b[1] + this[1] * b[0] + this[4] * b[7] - this[2] * b[5] - this[3] * b[6];
    //             target[2] = this[0] * b[2] + this[1] * b[5] + this[2] * b[0] + this[4] * b[9] - this[3] * b[8];
    //             target[3] = this[0] * b[3] + this[1] * b[6] + this[2] * b[8] + this[3] * b[0] + this[4] * b[10];
    //             target[4] = this[0] * b[4] + this[1] * b[7] + this[2] * b[9] + this[3] * b[10] + this[4] * b[0];
    //             target[5] = this[0] * b[5] + this[2] * b[1] + this[4] * b[12] - this[1] * b[2] - this[3] * b[11];
    //             target[6] = this[0] * b[6] + this[2] * b[11] + this[3] * b[1] + this[4] * b[13] - this[1] * b[3];
    //             target[7] = this[0] * b[7] + this[2] * b[12] + this[3] * b[13] + this[4] * b[1] - this[1] * b[4];
    //             target[8] = this[0] * b[8] + this[3] * b[2] + this[4] * b[14] - this[1] * b[11] - this[2] * b[3];
    //             target[9] = this[0] * b[9] + this[3] * b[14] + this[4] * b[2] - this[1] * b[12] - this[2] * b[4];
    //             target[10] = this[0] * b[10] + this[4] * b[3] - this[1] * b[13] - this[2] * b[14] - this[3] * b[4];
    //             target[11] = this[0] * b[11] + this[1] * b[8] + this[3] * b[5] + this[4] * b[15] - this[2] * b[6];
    //             target[12] = this[0] * b[12] + this[1] * b[9] + this[3] * b[15] + this[4] * b[5] - this[2] * b[7];
    //             target[13] = this[0] * b[13] + this[1] * b[10] + this[4] * b[6] - this[2] * b[15] - this[3] * b[7];
    //             target[14] = this[0] * b[14] + this[1] * b[15] + this[2] * b[10] + this[4] * b[8] - this[3] * b[9];
    //             target[15] = this[0] * b[15] + this[2] * b[13] + this[4] * b[11] - this[1] * b[14] - this[3] * b[12];
    //         }
    
    //         return target
    //     }
    // }
    
    class Even extends GeneralVector {

        constructor() {
            super(16)
        }

        decomposeBivector(targets) {

            let square = this.mul(this, localEven13)
            let inBrackets = square.studyConjugate(localEven14)
            inBrackets.multiplyScalar(1. / square.studyNorm(), inBrackets)

            inBrackets[0] += 1.
            inBrackets.mul(this, targets[0])
            targets[0].multiplyScalar(.5, targets[0])

            inBrackets[0] -= 2.
            inBrackets.mul(this, targets[0])
            targets[0].multiplyScalar(.5, targets[0])
        }

        //aliasing allowed
        studyConjugate(target) {
            this.multiplyScalar(-1., target)
            target[0] = -target[0]
            return target
        }

        studyNorm() {
            this.selectGrade(4, localEven11)
            let squaredQuadvecPart = localEven11.mul(localEven11, localEven12)[0]
            return Math.sqrt(sq(this[0]) - squaredQuadvecPart)
        }

        translationToVec3(target) {
            target.set(0., 0., 0.)
            for (let i = 0; i < 16; ++i) {
                target.x += this[i] * _e10[i] * .5 //because of double cover AND because there are two in there!
                target.y += this[i] * _e20[i] * .5
                target.z += this[i] * _e30[i] * .5
            }
            target.multiplyScalar(1. / this[0])
            return target
        }

        translationFromVec3(v) {
            this.copy(_one)
                .addScaled(_e10, v.x * .5, this)
                .addScaled(_e20, v.y * .5, this)
                .addScaled(_e30, v.z * .5, this)
            return this
        }

        mulReverse(b, target) {
            return this.mul(b.reverse(b.constructor === Even ? localEven5 : localOdd5), target)
        }

        //aliasing allowed
        pow(factor,target) {
            this.getNormalization(localEven1)
            // debugger
            localEven1.logarithm(localEven2).multiplyScalar(factor, localEven2)
            return localEven2.exp(target)
        }

        normalize() {
            return this.copy(this.getNormalization(localEven1))
        }

        pointPairToVec3s(targets) {

            let projector = this.getNormalization(localEven7).multiplyScalar(.5, localEven8)
            projector[0] = .5
            let projectableUna = this.join(_e1234, localOdd8)
            
            for (let i = 0; i < 2; ++i) {
                
                let zrs = projector.mul(projectableUna, localOdd9)
                if (zrs[3] === zrs[4])
                    targets[i].copy(outOfSightVec3)
                else
                    zrs.zrsToVec3(targets[i])

                projector.reverse(projector)
                //ohhh, better if they have two different colors
            }
        }

        getNormalization(target) {

            let theSquare = this.mul(this.reverse(localEven5), localEven6)
            let isScalar = true
            for (let i = 1; i < 16; ++i) {
                if(theSquare[i] !== 0.)
                    isScalar = false
            }
            if (isScalar && theSquare[0] !== 0. ) {
                return this.multiplyScalar(1. / Math.sqrt(Math.abs(theSquare[0])),target)
            }

            var S = this[0] * this[0] - this[10] * this[10] + this[11] * this[11] - this[12] * this[12] - this[13] * this[13] - this[14] * this[14] - this[15] * this[15] + this[1] * this[1]
                + this[2] * this[2] + this[3] * this[3] - this[4] * this[4] + this[5] * this[5] + this[6] * this[6] - this[7] * this[7] + this[8] * this[8] - this[9] * this[9];
            var T1 = 2 * (this[0] * this[11] - this[10] * this[12] + this[13] * this[9] - this[14] * this[7] + this[15] * this[4] - this[1] * this[8] + this[2] * this[6] - this[3] * this[5]);
            var T2 = 2 * (this[0] * this[12] - this[10] * this[11] + this[13] * this[8] - this[14] * this[6] + this[15] * this[3] - this[1] * this[9] + this[2] * this[7] - this[4] * this[5]);
            var T3 = 2 * (this[0] * this[13] - this[10] * this[1] + this[11] * this[9] - this[12] * this[8] + this[14] * this[5] - this[15] * this[2] + this[3] * this[7] - this[4] * this[6]);
            var T4 = 2 * (this[0] * this[14] - this[10] * this[2] - this[11] * this[7] + this[12] * this[6] - this[13] * this[5] + this[15] * this[1] + this[3] * this[9] - this[4] * this[8]);
            var T5 = 2 * (this[0] * this[15] - this[10] * this[5] + this[11] * this[4] - this[12] * this[3] + this[13] * this[2] - this[14] * this[1] + this[6] * this[9] - this[7] * this[8]);
            var TT = -T1 * T1 + T2 * T2 + T3 * T3 + T4 * T4 + T5 * T5;
            var N = ((S * S + TT) ** .5 + S) ** .5
            var N2 = N * N;
            var ND = Math.SQRT2 * N / (N2 * N2 + TT);
            var C = N2 * ND;
            var [D1, D2, D3, D4, D5] = [-T1 * ND, -T2 * ND, -T3 * ND, -T4 * ND, -T5 * ND];
            return target.set(C * this[0] + D1 * this[11] - D2 * this[12] - D3 * this[13] - D4 * this[14] - D5 * this[15],
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
                C * this[15] - D1 * this[4] + D2 * this[3] - D3 * this[2] + D4 * this[1] + D5 * this[0]);
        }

        logarithm(target) {
            // B*B = S + T*e1234
            var S = this[0] * this[0] + this[11] * this[11] - this[12] * this[12] - this[13] * this[13] - this[14] * this[14] - this[15] * this[15] - 1;
            var [T1, T2, T3, T4, T5] = [
                2 * this[0] * this[15],   //e2345
                2 * this[0] * this[14],   //e1345
                2 * this[0] * this[13],   //e1245
                2 * this[0] * this[12],   //e1235
                2 * this[0] * this[11],   //e1234
            ]
            var Tsq = -T1 * T1 - T2 * T2 - T3 * T3 - T4 * T4 + T5 * T5;
            var norm = Math.sqrt(S * S - Tsq)
            if (norm == 0 && S == 0)   // at most a single translation
                return target.set(0.,this[1], this[2], this[3], this[4], this[5], this[6], this[7], this[8], this[9], this[10],0.,0.,0.,0.,0.)
            var lambdap = 0.5 * S + 0.5 * norm;
            // lm is always a rotation, lp can be boost, translation, rotation
            var [lp, lm] = [Math.sqrt(Math.abs(lambdap)), Math.sqrt(-0.5 * S + 0.5 * norm)]
            var theta2 = lm == 0 ? 0 : Math.atan2(lm, this[0]);
            var theta1 = lambdap < 0 ? Math.asin(lp / Math.cos(theta2)) : lambdap > 0 ? Math.atanh(lp / this[0]) : lp / this[0];
            var [l1, l2] = [lp == 0 ? 0 : theta1 / lp, lm == 0 ? 0 : theta2 / lm]
            var [A, B1, B2, B3, B4, B5] = [
                (l1 - l2) * 0.5 * (1 + S / norm) + l2, -0.5 * T1 * (l1 - l2) / norm, -0.5 * T2 * (l1 - l2) / norm,
                -0.5 * T3 * (l1 - l2) / norm, -0.5 * T4 * (l1 - l2) / norm, -0.5 * T5 * (l1 - l2) / norm,
            ];
            return target.set( 0.,
                (A * this[1] + B3 * this[10] + B4 * this[9] - B5 * this[8]),
                (A * this[2] + B2 * this[10] - B4 * this[7] + B5 * this[6]),
                (A * this[3] - B2 * this[9] - B3 * this[7] - B5 * this[5]),
                (A * this[4] - B2 * this[8] - B3 * this[6] - B4 * this[5]),
                (A * this[5] + B1 * this[10] + B4 * this[4] - B5 * this[3]),
                (A * this[6] - B1 * this[9] + B3 * this[4] + B5 * this[2]),
                (A * this[7] - B1 * this[8] + B3 * this[3] + B4 * this[2]),
                (A * this[8] + B1 * this[7] + B2 * this[4] - B5 * this[1]),
                (A * this[9] + B1 * this[6] + B2 * this[3] - B4 * this[1]),
                (A * this[10] - B1 * this[5] - B2 * this[2] - B3 * this[1]),
                0.,0.,0.,0.,0.
            )
        }

        exp(target) {

            let B = [this[1], this[2], this[3], this[4], this[5], this[6], this[7], this[8], this[9], this[10]]
            
            // B*B = S + Ti*ei*I
            var S = -B[0] * B[0] - B[1] * B[1] - B[2] * B[2] + B[3] * B[3] - B[4] * B[4] - B[5] * B[5] + B[6] * B[6] - B[7] * B[7] + B[8] * B[8] + B[9] * B[9];
            var [T1, T2, T3, T4, T5] = [
                2 * (B[4] * B[9] - B[5] * B[8] + B[6] * B[7]), //e2345
                2 * (B[1] * B[9] - B[2] * B[8] + B[3] * B[7]), //e1345
                2 * (B[0] * B[9] - B[2] * B[6] + B[3] * B[5]), //e1245
                2 * (B[0] * B[8] - B[1] * B[6] + B[3] * B[4]), //e1235
                2 * (B[0] * B[7] - B[1] * B[5] + B[2] * B[4])  //e1234
            ]

            // Calculate the norms of the invariants
            var Tsq = -T1 * T1 - T2 * T2 - T3 * T3 - T4 * T4 + T5 * T5;
            if(S === 0. || S*S <= Tsq) {
                target.copy(this)
                target[0] = 1.
                return target
            }
            
            var norm = Math.sqrt(S * S - Tsq)
            var sc = -0.5 / norm
            var lambdap = 0.5 * S + 0.5 * norm;
            var [lp, lm] = [Math.sqrt(Math.abs(lambdap)), Math.sqrt(-0.5 * S + 0.5 * norm)]
            // The associated trig (depending on sign lambdap)
            var [cp, sp] = lambdap > 0 ? [Math.cosh(lp), Math.sinh(lp) / lp] : lambdap < 0 ? [Math.cos(lp), Math.sin(lp) / lp] : [1, 1]
            var [cm, sm] = [Math.cos(lm), lm == 0 ? 1 : Math.sin(lm) / lm]
            // Calculate the mixing factors alpha and beta_i.
            var [cmsp, cpsm, spsm] = [cm * sp, cp * sm, sp * sm / 2], D = cmsp - cpsm, E = sc * D;
            var [alpha, beta1, beta2, beta3, beta4, beta5] = [D * (0.5 - sc * S) + cpsm, E * T1, -E * T2, E * T3, -E * T4, -E * T5]
            // Create the final rotor.
            return target.set(
                cp * cm,
                (B[0] * alpha + B[7] * beta5 - B[8] * beta4 + B[9] * beta3),
                (B[1] * alpha - B[5] * beta5 + B[6] * beta4 - B[9] * beta2),
                (B[2] * alpha + B[4] * beta5 - B[6] * beta3 + B[8] * beta2),
                (B[3] * alpha + B[4] * beta4 - B[5] * beta3 + B[7] * beta2),
                (B[4] * alpha + B[2] * beta5 - B[3] * beta4 + B[9] * beta1),
                (B[5] * alpha - B[1] * beta5 + B[3] * beta3 - B[8] * beta1),
                (B[6] * alpha - B[1] * beta4 + B[2] * beta3 - B[7] * beta1),
                (B[7] * alpha + B[0] * beta5 - B[3] * beta2 + B[6] * beta1),
                (B[8] * alpha + B[0] * beta4 - B[2] * beta2 + B[5] * beta1),
                (B[9] * alpha - B[0] * beta3 + B[1] * beta2 - B[4] * beta1),
                spsm * T5, spsm * T4, spsm * T3, spsm * T2, spsm * T1
            )
        }

        fromDq(dq) {
            this[0] = dq[0]
            this[1] = dq[4] //e12
            this[5] = dq[6] //e23
            this[2] = -dq[5] //e13
            this[3] = -dq[1]; this[4] = -dq[1] //e10
            this[6] = -dq[2]; this[7] = -dq[2] //e20
            this[8] = -dq[3]; this[9] = -dq[3] //e30
            this[11] = -dq[7]; this[12] = -dq[7] //e30
            return this
        }

        toDq(dq) {
            dq[0] = this[0]
            dq[4] = this[1] //e12
            dq[6] = this[5] //e23
            dq[5] = -this[2] //e13
            dq[1] = -.5 * (this[3] + this[4]) //e10
            dq[2] = -.5 * (this[6] + this[7]) //e20
            dq[3] = -.5 * (this[8] + this[9]) //e30
            dq[7] = -.5 * (this[11] + this[12])
            return this
        }

        toQuaternion(target) {
            target.w = this[0]
            target.x = -this[5]
            target.y = this[2]
            target.z = -this[1]
            return target
        }
    
        reverse(target) {
            target[0] = this[0]; target[1] = -this[1]; target[2] = -this[2]; target[3] = -this[3]; target[4] = -this[4]; target[5] = -this[5]; target[6] = -this[6]; target[7] = -this[7]; target[8] = -this[8]; target[9] = -this[9]; target[10] = -this[10]; target[11] = this[11]; target[12] = this[12]; target[13] = this[13]; target[14] = this[14]; target[15] = this[15];
    
            return target
        }
    
        sandwich(b, target) {
            if (b.constructor === Even && target.constructor === Even) {
                this.mul( b, localEven0).mulReverse(this, target)
            }
            else if (b.constructor === Odd && target.constructor === Odd) {
                this.mul( b, localOdd0).mulReverse(this, target)
            }
    
            return target
        }

        projectOn(b, target) {
            if (b.constructor === Odd)
                this.inner(b, localOdd0).mulReverse(b, target)
            else if (b.constructor === Even)
                this.inner(b, localEven0).mulReverse(b, target)

            return target
        }
    
        mul(b,target) {
            if (b.constructor === Even && target.constructor === Even) {
                target[0] = this[0] * b[0] + this[10] * b[10] + this[11] * b[11] + this[4] * b[4] + this[7] * b[7] + this[9] * b[9] - this[12] * b[12] - this[13] * b[13] - this[14] * b[14] - this[15] * b[15] - this[1] * b[1] - this[2] * b[2] - this[3] * b[3] - this[5] * b[5] - this[6] * b[6] - this[8] * b[8];
                target[1] = this[0] * b[1] + this[10] * b[13] + this[12] * b[9] + this[13] * b[10] + this[15] * b[14] + this[1] * b[0] + this[4] * b[7] + this[5] * b[2] + this[6] * b[3] + this[9] * b[12] - this[11] * b[8] - this[14] * b[15] - this[2] * b[5] - this[3] * b[6] - this[7] * b[4] - this[8] * b[11];
                target[2] = this[0] * b[2] + this[10] * b[14] + this[11] * b[6] + this[13] * b[15] + this[14] * b[10] + this[1] * b[5] + this[2] * b[0] + this[4] * b[9] + this[6] * b[11] + this[8] * b[3] - this[12] * b[7] - this[15] * b[13] - this[3] * b[8] - this[5] * b[1] - this[7] * b[12] - this[9] * b[4];
                target[3] = this[0] * b[3] + this[15] * b[12] + this[1] * b[6] + this[2] * b[8] + this[3] * b[0] + this[4] * b[10] - this[10] * b[4] - this[11] * b[5] - this[12] * b[15] - this[13] * b[7] - this[14] * b[9] - this[5] * b[11] - this[6] * b[1] - this[7] * b[13] - this[8] * b[2] - this[9] * b[14];
                target[4] = this[0] * b[4] + this[15] * b[11] + this[1] * b[7] + this[2] * b[9] + this[3] * b[10] + this[4] * b[0] - this[10] * b[3] - this[11] * b[15] - this[12] * b[5] - this[13] * b[6] - this[14] * b[8] - this[5] * b[12] - this[6] * b[13] - this[7] * b[1] - this[8] * b[14] - this[9] * b[2];
                target[5] = this[0] * b[5] + this[10] * b[15] + this[12] * b[4] + this[14] * b[13] + this[15] * b[10] + this[2] * b[1] + this[4] * b[12] + this[5] * b[0] + this[7] * b[9] + this[8] * b[6] - this[11] * b[3] - this[13] * b[14] - this[1] * b[2] - this[3] * b[11] - this[6] * b[8] - this[9] * b[7];
                target[6] = this[0] * b[6] + this[11] * b[2] + this[12] * b[14] + this[13] * b[4] + this[2] * b[11] + this[3] * b[1] + this[4] * b[13] + this[5] * b[8] + this[6] * b[0] + this[7] * b[10] - this[10] * b[7] - this[14] * b[12] - this[15] * b[9] - this[1] * b[3] - this[8] * b[5] - this[9] * b[15];
                target[7] = this[0] * b[7] + this[11] * b[14] + this[12] * b[2] + this[13] * b[3] + this[2] * b[12] + this[3] * b[13] + this[4] * b[1] + this[5] * b[9] + this[6] * b[10] + this[7] * b[0] - this[10] * b[6] - this[14] * b[11] - this[15] * b[8] - this[1] * b[4] - this[8] * b[15] - this[9] * b[5];
                target[8] = this[0] * b[8] + this[13] * b[12] + this[14] * b[4] + this[15] * b[7] + this[3] * b[2] + this[4] * b[14] + this[6] * b[5] + this[7] * b[15] + this[8] * b[0] + this[9] * b[10] - this[10] * b[9] - this[11] * b[1] - this[12] * b[13] - this[1] * b[11] - this[2] * b[3] - this[5] * b[6];
                target[9] = this[0] * b[9] + this[13] * b[11] + this[14] * b[3] + this[15] * b[6] + this[3] * b[14] + this[4] * b[2] + this[6] * b[15] + this[7] * b[5] + this[8] * b[10] + this[9] * b[0] - this[10] * b[8] - this[11] * b[13] - this[12] * b[1] - this[1] * b[12] - this[2] * b[4] - this[5] * b[7];
                target[10] = this[0] * b[10] + this[10] * b[0] + this[11] * b[12] + this[4] * b[3] + this[7] * b[6] + this[9] * b[8] - this[12] * b[11] - this[13] * b[1] - this[14] * b[2] - this[15] * b[5] - this[1] * b[13] - this[2] * b[14] - this[3] * b[4] - this[5] * b[15] - this[6] * b[7] - this[8] * b[9];
                target[11] = this[0] * b[11] + this[11] * b[0] + this[12] * b[10] + this[14] * b[7] + this[1] * b[8] + this[3] * b[5] + this[4] * b[15] + this[5] * b[3] + this[8] * b[1] + this[9] * b[13] - this[10] * b[12] - this[13] * b[9] - this[15] * b[4] - this[2] * b[6] - this[6] * b[2] - this[7] * b[14];
                target[12] = this[0] * b[12] + this[11] * b[10] + this[12] * b[0] + this[14] * b[6] + this[1] * b[9] + this[3] * b[15] + this[4] * b[5] + this[5] * b[4] + this[8] * b[13] + this[9] * b[1] - this[10] * b[11] - this[13] * b[8] - this[15] * b[3] - this[2] * b[7] - this[6] * b[14] - this[7] * b[2];
                target[13] = this[0] * b[13] + this[10] * b[1] + this[12] * b[8] + this[13] * b[0] + this[15] * b[2] + this[1] * b[10] + this[4] * b[6] + this[5] * b[14] + this[6] * b[4] + this[9] * b[11] - this[11] * b[9] - this[14] * b[5] - this[2] * b[15] - this[3] * b[7] - this[7] * b[3] - this[8] * b[12];
                target[14] = this[0] * b[14] + this[10] * b[2] + this[11] * b[7] + this[13] * b[5] + this[14] * b[0] + this[1] * b[15] + this[2] * b[10] + this[4] * b[8] + this[6] * b[12] + this[8] * b[4] - this[12] * b[6] - this[15] * b[1] - this[3] * b[9] - this[5] * b[13] - this[7] * b[11] - this[9] * b[3];
                target[15] = this[0] * b[15] + this[10] * b[5] + this[12] * b[3] + this[14] * b[1] + this[15] * b[0] + this[2] * b[13] + this[4] * b[11] + this[5] * b[10] + this[7] * b[8] + this[8] * b[7] - this[11] * b[4] - this[13] * b[2] - this[1] * b[14] - this[3] * b[12] - this[6] * b[9] - this[9] * b[6];
            }
            else if(b.constructor === Odd && target.constructor === Odd) {
                target[0] = this[0] * b[0] + this[10] * b[10] + this[12] * b[12] + this[13] * b[13] + this[14] * b[14] + this[1] * b[1] + this[2] * b[2] + this[3] * b[3] + this[7] * b[7] + this[9] * b[9] - this[11] * b[11] - this[15] * b[15] - this[4] * b[4] - this[5] * b[5] - this[6] * b[6] - this[8] * b[8];
                target[1] = this[0] * b[1] + this[10] * b[13] + this[11] * b[8] + this[14] * b[15] + this[15] * b[14] + this[2] * b[5] + this[3] * b[6] + this[5] * b[2] + this[6] * b[3] + this[9] * b[12] - this[12] * b[9] - this[13] * b[10] - this[1] * b[0] - this[4] * b[7] - this[7] * b[4] - this[8] * b[11];
                target[2] = this[0] * b[2] + this[10] * b[14] + this[12] * b[7] + this[3] * b[8] + this[6] * b[11] + this[8] * b[3] - this[11] * b[6] - this[13] * b[15] - this[14] * b[10] - this[15] * b[13] - this[1] * b[5] - this[2] * b[0] - this[4] * b[9] - this[5] * b[1] - this[7] * b[12] - this[9] * b[4];
                target[3] = this[0] * b[3] + this[11] * b[5] + this[12] * b[15] + this[13] * b[7] + this[14] * b[9] + this[15] * b[12] - this[10] * b[4] - this[1] * b[6] - this[2] * b[8] - this[3] * b[0] - this[4] * b[10] - this[5] * b[11] - this[6] * b[1] - this[7] * b[13] - this[8] * b[2] - this[9] * b[14];
                target[4] = this[0] * b[4] + this[11] * b[15] + this[12] * b[5] + this[13] * b[6] + this[14] * b[8] + this[15] * b[11] - this[10] * b[3] - this[1] * b[7] - this[2] * b[9] - this[3] * b[10] - this[4] * b[0] - this[5] * b[12] - this[6] * b[13] - this[7] * b[1] - this[8] * b[14] - this[9] * b[2];
                target[5] = this[0] * b[5] + this[10] * b[15] + this[11] * b[3] + this[13] * b[14] + this[15] * b[10] + this[1] * b[2] + this[3] * b[11] + this[5] * b[0] + this[7] * b[9] + this[8] * b[6] - this[12] * b[4] - this[14] * b[13] - this[2] * b[1] - this[4] * b[12] - this[6] * b[8] - this[9] * b[7];
                target[6] = this[0] * b[6] + this[14] * b[12] + this[1] * b[3] + this[5] * b[8] + this[6] * b[0] + this[7] * b[10] - this[10] * b[7] - this[11] * b[2] - this[12] * b[14] - this[13] * b[4] - this[15] * b[9] - this[2] * b[11] - this[3] * b[1] - this[4] * b[13] - this[8] * b[5] - this[9] * b[15];
                target[7] = this[0] * b[7] + this[14] * b[11] + this[1] * b[4] + this[5] * b[9] + this[6] * b[10] + this[7] * b[0] - this[10] * b[6] - this[11] * b[14] - this[12] * b[2] - this[13] * b[3] - this[15] * b[8] - this[2] * b[12] - this[3] * b[13] - this[4] * b[1] - this[8] * b[15] - this[9] * b[5];
                target[8] = this[0] * b[8] + this[11] * b[1] + this[12] * b[13] + this[15] * b[7] + this[1] * b[11] + this[2] * b[3] + this[6] * b[5] + this[7] * b[15] + this[8] * b[0] + this[9] * b[10] - this[10] * b[9] - this[13] * b[12] - this[14] * b[4] - this[3] * b[2] - this[4] * b[14] - this[5] * b[6];
                target[9] = this[0] * b[9] + this[11] * b[13] + this[12] * b[1] + this[15] * b[6] + this[1] * b[12] + this[2] * b[4] + this[6] * b[15] + this[7] * b[5] + this[8] * b[10] + this[9] * b[0] - this[10] * b[8] - this[13] * b[11] - this[14] * b[3] - this[3] * b[14] - this[4] * b[2] - this[5] * b[7];
                target[10] = this[0] * b[10] + this[10] * b[0] + this[12] * b[11] + this[13] * b[1] + this[14] * b[2] + this[1] * b[13] + this[2] * b[14] + this[3] * b[4] + this[7] * b[6] + this[9] * b[8] - this[11] * b[12] - this[15] * b[5] - this[4] * b[3] - this[5] * b[15] - this[6] * b[7] - this[8] * b[9];
                target[11] = this[0] * b[11] + this[13] * b[9] + this[2] * b[6] + this[5] * b[3] + this[8] * b[1] + this[9] * b[13] - this[10] * b[12] - this[11] * b[0] - this[12] * b[10] - this[14] * b[7] - this[15] * b[4] - this[1] * b[8] - this[3] * b[5] - this[4] * b[15] - this[6] * b[2] - this[7] * b[14];
                target[12] = this[0] * b[12] + this[13] * b[8] + this[2] * b[7] + this[5] * b[4] + this[8] * b[13] + this[9] * b[1] - this[10] * b[11] - this[11] * b[10] - this[12] * b[0] - this[14] * b[6] - this[15] * b[3] - this[1] * b[9] - this[3] * b[15] - this[4] * b[5] - this[6] * b[14] - this[7] * b[2];
                target[13] = this[0] * b[13] + this[10] * b[1] + this[11] * b[9] + this[14] * b[5] + this[15] * b[2] + this[2] * b[15] + this[3] * b[7] + this[5] * b[14] + this[6] * b[4] + this[9] * b[11] - this[12] * b[8] - this[13] * b[0] - this[1] * b[10] - this[4] * b[6] - this[7] * b[3] - this[8] * b[12];
                target[14] = this[0] * b[14] + this[10] * b[2] + this[12] * b[6] + this[3] * b[9] + this[6] * b[12] + this[8] * b[4] - this[11] * b[7] - this[13] * b[5] - this[14] * b[0] - this[15] * b[1] - this[1] * b[15] - this[2] * b[10] - this[4] * b[8] - this[5] * b[13] - this[7] * b[11] - this[9] * b[3];
                target[15] = this[0] * b[15] + this[10] * b[5] + this[11] * b[4] + this[13] * b[2] + this[15] * b[0] + this[1] * b[14] + this[3] * b[12] + this[5] * b[10] + this[7] * b[8] + this[8] * b[7] - this[12] * b[3] - this[14] * b[1] - this[2] * b[13] - this[4] * b[11] - this[6] * b[9] - this[9] * b[6];
            }
            // else if(b.constructor === Una && target.constructor === Odd) {
            //     target[0] = this[0] * b[0] + this[1] * b[1] + this[2] * b[2] + this[3] * b[3] - this[4] * b[4];
            //     target[1] = this[0] * b[1] + this[5] * b[2] + this[6] * b[3] - this[1] * b[0] - this[7] * b[4];
            //     target[2] = this[0] * b[2] + this[8] * b[3] - this[2] * b[0] - this[5] * b[1] - this[9] * b[4];
            //     target[3] = this[0] * b[3] - this[10] * b[4] - this[3] * b[0] - this[6] * b[1] - this[8] * b[2];
            //     target[4] = this[0] * b[4] - this[10] * b[3] - this[4] * b[0] - this[7] * b[1] - this[9] * b[2];
            //     target[5] = this[11] * b[3] + this[1] * b[2] + this[5] * b[0] - this[12] * b[4] - this[2] * b[1];
            //     target[6] = this[1] * b[3] + this[6] * b[0] - this[11] * b[2] - this[13] * b[4] - this[3] * b[1];
            //     target[7] = this[1] * b[4] + this[7] * b[0] - this[12] * b[2] - this[13] * b[3] - this[4] * b[1];
            //     target[8] = this[11] * b[1] + this[2] * b[3] + this[8] * b[0] - this[14] * b[4] - this[3] * b[2];
            //     target[9] = this[12] * b[1] + this[2] * b[4] + this[9] * b[0] - this[14] * b[3] - this[4] * b[2];
            //     target[10] = this[10] * b[0] + this[13] * b[1] + this[14] * b[2] + this[3] * b[4] - this[4] * b[3];
            //     target[11] = this[5] * b[3] + this[8] * b[1] - this[11] * b[0] - this[15] * b[4] - this[6] * b[2];
            //     target[12] = this[5] * b[4] + this[9] * b[1] - this[12] * b[0] - this[15] * b[3] - this[7] * b[2];
            //     target[13] = this[10] * b[1] + this[15] * b[2] + this[6] * b[4] - this[13] * b[0] - this[7] * b[3];
            //     target[14] = this[10] * b[2] + this[8] * b[4] - this[14] * b[0] - this[15] * b[1] - this[9] * b[3];
            //     target[15] = this[11] * b[4] + this[13] * b[2] + this[15] * b[0] - this[12] * b[3] - this[14] * b[1];
            // }
            else
                console.error("not implemented")
    
            return target
        }

        inner(b,target) {
            if(b.constructor === Even && target.constructor === Even) {
                target[0] = this[0] * b[0] + this[10] * b[10] + this[11] * b[11] + this[4] * b[4] + this[7] * b[7] + this[9] * b[9] - this[12] * b[12] - this[13] * b[13] - this[14] * b[14] - this[15] * b[15] - this[1] * b[1] - this[2] * b[2] - this[3] * b[3] - this[5] * b[5] - this[6] * b[6] - this[8] * b[8];
                target[1] = this[0] * b[1] + this[10] * b[13] + this[12] * b[9] + this[13] * b[10] + this[1] * b[0] + this[9] * b[12] - this[11] * b[8] - this[8] * b[11];
                target[2] = this[0] * b[2] + this[10] * b[14] + this[11] * b[6] + this[14] * b[10] + this[2] * b[0] + this[6] * b[11] - this[12] * b[7] - this[7] * b[12];
                target[3] = this[0] * b[3] + this[3] * b[0] - this[11] * b[5] - this[13] * b[7] - this[14] * b[9] - this[5] * b[11] - this[7] * b[13] - this[9] * b[14];
                target[4] = this[0] * b[4] + this[4] * b[0] - this[12] * b[5] - this[13] * b[6] - this[14] * b[8] - this[5] * b[12] - this[6] * b[13] - this[8] * b[14];
                target[5] = this[0] * b[5] + this[10] * b[15] + this[12] * b[4] + this[15] * b[10] + this[4] * b[12] + this[5] * b[0] - this[11] * b[3] - this[3] * b[11];
                target[6] = this[0] * b[6] + this[11] * b[2] + this[13] * b[4] + this[2] * b[11] + this[4] * b[13] + this[6] * b[0] - this[15] * b[9] - this[9] * b[15];
                target[7] = this[0] * b[7] + this[12] * b[2] + this[13] * b[3] + this[2] * b[12] + this[3] * b[13] + this[7] * b[0] - this[15] * b[8] - this[8] * b[15];
                target[8] = this[0] * b[8] + this[14] * b[4] + this[15] * b[7] + this[4] * b[14] + this[7] * b[15] + this[8] * b[0] - this[11] * b[1] - this[1] * b[11];
                target[9] = this[0] * b[9] + this[14] * b[3] + this[15] * b[6] + this[3] * b[14] + this[6] * b[15] + this[9] * b[0] - this[12] * b[1] - this[1] * b[12];
                target[10] = this[0] * b[10] + this[10] * b[0] - this[13] * b[1] - this[14] * b[2] - this[15] * b[5] - this[1] * b[13] - this[2] * b[14] - this[5] * b[15];
                target[11] = this[0] * b[11] + this[11] * b[0];
                target[12] = this[0] * b[12] + this[12] * b[0];
                target[13] = this[0] * b[13] + this[13] * b[0];
                target[14] = this[0] * b[14] + this[14] * b[0];
                target[15] = this[0] * b[15] + this[15] * b[0];
            }
            else if (b.constructor === Odd && target.constructor === Odd) {
                target[0] = this[0] * b[0] + this[10] * b[10] + this[12] * b[12] + this[13] * b[13] + this[14] * b[14] + this[1] * b[1] + this[2] * b[2] + this[3] * b[3] + this[7] * b[7] + this[9] * b[9] - this[11] * b[11] - this[15] * b[15] - this[4] * b[4] - this[5] * b[5] - this[6] * b[6] - this[8] * b[8];
                target[1] = this[0] * b[1] + this[10] * b[13] + this[11] * b[8] + this[14] * b[15] + this[15] * b[14] + this[2] * b[5] + this[3] * b[6] + this[5] * b[2] + this[6] * b[3] + this[9] * b[12] - this[12] * b[9] - this[13] * b[10] - this[1] * b[0] - this[4] * b[7] - this[7] * b[4] - this[8] * b[11];
                target[2] = this[0] * b[2] + this[10] * b[14] + this[12] * b[7] + this[3] * b[8] + this[6] * b[11] + this[8] * b[3] - this[11] * b[6] - this[13] * b[15] - this[14] * b[10] - this[15] * b[13] - this[1] * b[5] - this[2] * b[0] - this[4] * b[9] - this[5] * b[1] - this[7] * b[12] - this[9] * b[4];
                target[3] = this[0] * b[3] + this[11] * b[5] + this[12] * b[15] + this[13] * b[7] + this[14] * b[9] + this[15] * b[12] - this[10] * b[4] - this[1] * b[6] - this[2] * b[8] - this[3] * b[0] - this[4] * b[10] - this[5] * b[11] - this[6] * b[1] - this[7] * b[13] - this[8] * b[2] - this[9] * b[14];
                target[4] = this[0] * b[4] + this[11] * b[15] + this[12] * b[5] + this[13] * b[6] + this[14] * b[8] + this[15] * b[11] - this[10] * b[3] - this[1] * b[7] - this[2] * b[9] - this[3] * b[10] - this[4] * b[0] - this[5] * b[12] - this[6] * b[13] - this[7] * b[1] - this[8] * b[14] - this[9] * b[2];
                target[5] = this[0] * b[5] + this[10] * b[15] + this[11] * b[3] - this[12] * b[4];
                target[6] = this[0] * b[6] - this[11] * b[2] - this[13] * b[4] - this[9] * b[15];
                target[7] = this[0] * b[7] - this[12] * b[2] - this[13] * b[3] - this[8] * b[15];
                target[8] = this[0] * b[8] + this[11] * b[1] + this[7] * b[15] - this[14] * b[4];
                target[9] = this[0] * b[9] + this[12] * b[1] + this[6] * b[15] - this[14] * b[3];
                target[10] = this[0] * b[10] + this[13] * b[1] + this[14] * b[2] - this[5] * b[15];
                target[11] = this[0] * b[11] - this[11] * b[0] - this[15] * b[4] - this[4] * b[15];
                target[12] = this[0] * b[12] - this[12] * b[0] - this[15] * b[3] - this[3] * b[15];
                target[13] = this[0] * b[13] + this[15] * b[2] + this[2] * b[15] - this[13] * b[0];
                target[14] = this[0] * b[14] - this[14] * b[0] - this[15] * b[1] - this[1] * b[15];
                target[15] = this[0] * b[15];
            }
            else
                console.error("not implemented")

            return target
        }

        meet(b, target) {
            if(b.constructor === Even && target.constructor === Even) {
                target[ 0] = this[0] * b[0];
                target[ 1] = this[0] * b[1] + this[1] * b[0];
                target[ 2] = this[0] * b[2] + this[2] * b[0];
                target[ 3] = this[0] * b[3] + this[3] * b[0];
                target[ 4] = this[0] * b[4] + this[4] * b[0];
                target[ 5] = this[0] * b[5] + this[5] * b[0];
                target[ 6] = this[0] * b[6] + this[6] * b[0];
                target[ 7] = this[0] * b[7] + this[7] * b[0];
                target[ 8] = this[0] * b[8] + this[8] * b[0];
                target[ 9] = this[0] * b[9] + this[9] * b[0];
                target[10] = this[0] * b[10] + this[10] * b[0];
                target[11] = this[0] * b[11] + this[11] * b[0] + this[1] * b[8] + this[3] * b[5] + this[5] * b[3] + this[8] * b[1] - this[2] * b[6] - this[6] * b[2];
                target[12] = this[0] * b[12] + this[12] * b[0] + this[1] * b[9] + this[4] * b[5] + this[5] * b[4] + this[9] * b[1] - this[2] * b[7] - this[7] * b[2];
                target[13] = this[0] * b[13] + this[10] * b[1] + this[13] * b[0] + this[1] * b[10] + this[4] * b[6] + this[6] * b[4] - this[3] * b[7] - this[7] * b[3];
                target[14] = this[0] * b[14] + this[10] * b[2] + this[14] * b[0] + this[2] * b[10] + this[4] * b[8] + this[8] * b[4] - this[3] * b[9] - this[9] * b[3];
                target[15] = this[0] * b[15] + this[10] * b[5] + this[15] * b[0] + this[5] * b[10] + this[7] * b[8] + this[8] * b[7] - this[6] * b[9] - this[9] * b[6];
            }
            else if (b.constructor === Odd && target.constructor === Odd) {
                target[0] = this[0] * b[0];
                target[1] = this[0] * b[1];
                target[2] = this[0] * b[2];
                target[3] = this[0] * b[3];
                target[4] = this[0] * b[4];
                target[5] = this[0] * b[5] + this[1] * b[2] + this[5] * b[0] - this[2] * b[1];
                target[6] = this[0] * b[6] + this[1] * b[3] + this[6] * b[0] - this[3] * b[1];
                target[7] = this[0] * b[7] + this[1] * b[4] + this[7] * b[0] - this[4] * b[1];
                target[8] = this[0] * b[8] + this[2] * b[3] + this[8] * b[0] - this[3] * b[2];
                target[9] = this[0] * b[9] + this[2] * b[4] + this[9] * b[0] - this[4] * b[2];
                target[10] = this[0] * b[10] + this[10] * b[0] + this[3] * b[4] - this[4] * b[3];
                target[11] = this[0] * b[11] + this[5] * b[3] + this[8] * b[1] - this[6] * b[2];
                target[12] = this[0] * b[12] + this[5] * b[4] + this[9] * b[1] - this[7] * b[2];
                target[13] = this[0] * b[13] + this[10] * b[1] + this[6] * b[4] - this[7] * b[3];
                target[14] = this[0] * b[14] + this[10] * b[2] + this[8] * b[4] - this[9] * b[3];
                target[15] = this[0] * b[15] + this[10] * b[5] + this[11] * b[4] + this[13] * b[2] + this[15] * b[0] + this[1] * b[14] + this[3] * b[12] + this[5] * b[10] + this[7] * b[8] + this[8] * b[7] - this[12] * b[3] - this[14] * b[1] - this[2] * b[13] - this[4] * b[11] - this[6] * b[9] - this[9] * b[6];
            }
            else
                console.error("not implemented")

            return target
        }

        join(b,target) {
            if (b.constructor === Even && target.constructor === Odd) {
                target[0] = this[11] * b[4] + this[13] * b[2] + this[1] * b[14] + this[3] * b[12] - this[12] * b[3] - this[14] * b[1] - this[2] * b[13] - this[4] * b[11];
                target[1] = this[11] * b[7] + this[13] * b[5] + this[1] * b[15] + this[6] * b[12] - this[12] * b[6] - this[15] * b[1] - this[5] * b[13] - this[7] * b[11];
                target[2] = this[11] * b[9] + this[14] * b[5] + this[2] * b[15] + this[8] * b[12] - this[12] * b[8] - this[15] * b[2] - this[5] * b[14] - this[9] * b[11];
                target[3] = this[11] * b[10] + this[14] * b[6] + this[3] * b[15] + this[8] * b[13] - this[10] * b[11] - this[13] * b[8] - this[15] * b[3] - this[6] * b[14];
                target[4] = this[12] * b[10] + this[14] * b[7] + this[4] * b[15] + this[9] * b[13] - this[10] * b[12] - this[13] * b[9] - this[15] * b[4] - this[7] * b[14];
                target[5] = this[11] * b[12] - this[12] * b[11];
                target[6] = this[11] * b[13] - this[13] * b[11];
                target[7] = this[12] * b[13] - this[13] * b[12];
                target[8] = this[11] * b[14] - this[14] * b[11];
                target[9] = this[12] * b[14] - this[14] * b[12];
                target[10] = this[13] * b[14] - this[14] * b[13];
                target[11] = this[11] * b[15] - this[15] * b[11];
                target[12] = this[12] * b[15] - this[15] * b[12];
                target[13] = this[13] * b[15] - this[15] * b[13];
                target[14] = this[14] * b[15] - this[15] * b[14];
                target[15] = 0.;
            }
            else
                console.error("not implemented")
            
            return target
        }
    }
    window.Even = Even
    Even.indexGrades = [
        0, 
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        4, 4, 4, 4,
    ]
    Even.basisNames = ['', '12', '13', '14', '15', '23', '24', '25', '34', '35', '45', '1234', '1235', '1245', '1345', '2345']
    
    class Odd extends GeneralVector {
        constructor() {
            super(16)
        }

        fromFl(fl) {
            this[0] = fl[1]
            this[1] = fl[2]
            this[2] = fl[3]
            this[3] = fl[0]; this[4] = fl[0]

            this[5] = fl[7]
            this[6] = -fl[4]; this[7] = -fl[4] //e012
            this[8] = fl[5]; this[9] = fl[5] //e013
            this[11] = -fl[6]; this[12] = -fl[6] //e023
            return this
        }

        pointPairToVec3s(targets) {
            return this.mul(_e12345, localEven10).pointPairToVec3s(targets)
        }

        zrsToVec3(target) {
            return this.inner(_e1230, localOdd3).flatPointToVec3(target)
        }

        flatPointToVec3(target) {
            this.mulReverse(_e123, localEven0)
            return localEven0.translationToVec3(target)
        }

        mulReverse(b,target) {
            return this.mul(b.reverse(b.constructor === Even?localEven5:localOdd5),target)
        }

        normalize() {
            this.mul(this.reverse(localOdd0),localEven0)
            return this.multiplyScalar(1./localEven0[0],this)
        }
    
        reverse(target) {
            target[0] = this[0]; target[1] = this[1]; target[2] = this[2]; target[3] = this[3]; target[4] = this[4]; target[5] = -this[5]; target[6] = -this[6]; target[7] = -this[7]; target[8] = -this[8]; target[9] = -this[9]; target[10] = -this[10]; target[11] = -this[11]; target[12] = -this[12]; target[13] = -this[13]; target[14] = -this[14]; target[15] = this[15];
            return target
        }
    
        sandwich(b, target) {
            if (b.constructor === Even && target.constructor === Even) {
                this.mul( b, localOdd0).mulReverse(this, target)
            }
            else if (b.constructor === Odd && target.constructor === Odd) {
                this.mul(b, localEven0).mulReverse(this, target)
                target.multiplyScalar(-1., target)
            }
    
            return target
        }

        projectOn(b, target) {
            if (b.constructor === Even )
                this.inner(b, localOdd0).mulReverse(b, target)
            else if (b.constructor === Odd )
                this.inner(b, localEven0).mulReverse(b, target)

            return target
        }
    
        inner(b,target) {
            if(b.constructor === Even && target.constructor === Odd) {
                target[0] = this[0] * b[0] + this[10] * b[10] + this[11] * b[11] + this[4] * b[4] + this[7] * b[7] + this[9] * b[9] - this[12] * b[12] - this[13] * b[13] - this[14] * b[14] - this[15] * b[15] - this[1] * b[1] - this[2] * b[2] - this[3] * b[3] - this[5] * b[5] - this[6] * b[6] - this[8] * b[8];
                target[1] = this[0] * b[1] + this[10] * b[13] + this[12] * b[9] + this[13] * b[10] + this[15] * b[14] + this[1] * b[0] + this[4] * b[7] + this[5] * b[2] + this[6] * b[3] + this[9] * b[12] - this[11] * b[8] - this[14] * b[15] - this[2] * b[5] - this[3] * b[6] - this[7] * b[4] - this[8] * b[11];
                target[2] = this[0] * b[2] + this[10] * b[14] + this[11] * b[6] + this[13] * b[15] + this[14] * b[10] + this[1] * b[5] + this[2] * b[0] + this[4] * b[9] + this[6] * b[11] + this[8] * b[3] - this[12] * b[7] - this[15] * b[13] - this[3] * b[8] - this[5] * b[1] - this[7] * b[12] - this[9] * b[4];
                target[3] = this[0] * b[3] + this[15] * b[12] + this[1] * b[6] + this[2] * b[8] + this[3] * b[0] + this[4] * b[10] - this[10] * b[4] - this[11] * b[5] - this[12] * b[15] - this[13] * b[7] - this[14] * b[9] - this[5] * b[11] - this[6] * b[1] - this[7] * b[13] - this[8] * b[2] - this[9] * b[14];
                target[4] = this[0] * b[4] + this[15] * b[11] + this[1] * b[7] + this[2] * b[9] + this[3] * b[10] + this[4] * b[0] - this[10] * b[3] - this[11] * b[15] - this[12] * b[5] - this[13] * b[6] - this[14] * b[8] - this[5] * b[12] - this[6] * b[13] - this[7] * b[1] - this[8] * b[14] - this[9] * b[2];
                target[5] = this[15] * b[10] + this[4] * b[12] + this[5] * b[0] - this[3] * b[11];
                target[6] = this[2] * b[11] + this[4] * b[13] + this[6] * b[0] - this[15] * b[9];
                target[7] = this[2] * b[12] + this[3] * b[13] + this[7] * b[0] - this[15] * b[8];
                target[8] = this[15] * b[7] + this[4] * b[14] + this[8] * b[0] - this[1] * b[11];
                target[9] = this[15] * b[6] + this[3] * b[14] + this[9] * b[0] - this[1] * b[12];
                target[10] = this[10] * b[0] - this[15] * b[5] - this[1] * b[13] - this[2] * b[14];
                target[11] = this[0] * b[11] + this[11] * b[0] + this[4] * b[15] - this[15] * b[4];
                target[12] = this[0] * b[12] + this[12] * b[0] + this[3] * b[15] - this[15] * b[3];
                target[13] = this[0] * b[13] + this[13] * b[0] + this[15] * b[2] - this[2] * b[15];
                target[14] = this[0] * b[14] + this[14] * b[0] + this[1] * b[15] - this[15] * b[1];
                target[15] = this[15] * b[0];
            }
            else
                console.error("not implemented")
    
            return target
        }

        meet(b, target) {
            if (b.constructor === Even && target.constructor === Odd) {
                target[0] = this[0] * b[0];
                target[1] = this[1] * b[0];
                target[2] = this[2] * b[0];
                target[3] = this[3] * b[0];
                target[4] = this[4] * b[0];
                target[5] = this[0] * b[5] + this[2] * b[1] + this[5] * b[0] - this[1] * b[2];
                target[6] = this[0] * b[6] + this[3] * b[1] + this[6] * b[0] - this[1] * b[3];
                target[7] = this[0] * b[7] + this[4] * b[1] + this[7] * b[0] - this[1] * b[4];
                target[8] = this[0] * b[8] + this[3] * b[2] + this[8] * b[0] - this[2] * b[3];
                target[9] = this[0] * b[9] + this[4] * b[2] + this[9] * b[0] - this[2] * b[4];
                target[10] = this[0] * b[10] + this[10] * b[0] + this[4] * b[3] - this[3] * b[4];
                target[11] = this[11] * b[0] + this[1] * b[8] + this[3] * b[5] - this[2] * b[6];
                target[12] = this[12] * b[0] + this[1] * b[9] + this[4] * b[5] - this[2] * b[7];
                target[13] = this[13] * b[0] + this[1] * b[10] + this[4] * b[6] - this[3] * b[7];
                target[14] = this[14] * b[0] + this[2] * b[10] + this[4] * b[8] - this[3] * b[9];
                target[15] = this[0] * b[15] + this[10] * b[5] + this[12] * b[3] + this[14] * b[1] + this[15] * b[0] + this[2] * b[13] + this[4] * b[11] + this[5] * b[10] + this[7] * b[8] + this[8] * b[7] - this[11] * b[4] - this[13] * b[2] - this[1] * b[14] - this[3] * b[12] - this[6] * b[9] - this[9] * b[6];
            }
            else
                console.error("not implemented")
    
            return target
        }
    
        mul(b,target) {
            if (b.constructor === Even && target.constructor === Odd) {
                target[0] = this[0] * b[0] + this[10] * b[10] + this[11] * b[11] + this[4] * b[4] + this[7] * b[7] + this[9] * b[9] - this[12] * b[12] - this[13] * b[13] - this[14] * b[14] - this[15] * b[15] - this[1] * b[1] - this[2] * b[2] - this[3] * b[3] - this[5] * b[5] - this[6] * b[6] - this[8] * b[8];
                target[1] = this[0] * b[1] + this[10] * b[13] + this[12] * b[9] + this[13] * b[10] + this[15] * b[14] + this[1] * b[0] + this[4] * b[7] + this[5] * b[2] + this[6] * b[3] + this[9] * b[12] - this[11] * b[8] - this[14] * b[15] - this[2] * b[5] - this[3] * b[6] - this[7] * b[4] - this[8] * b[11];
                target[2] = this[0] * b[2] + this[10] * b[14] + this[11] * b[6] + this[13] * b[15] + this[14] * b[10] + this[1] * b[5] + this[2] * b[0] + this[4] * b[9] + this[6] * b[11] + this[8] * b[3] - this[12] * b[7] - this[15] * b[13] - this[3] * b[8] - this[5] * b[1] - this[7] * b[12] - this[9] * b[4];
                target[3] = this[0] * b[3] + this[15] * b[12] + this[1] * b[6] + this[2] * b[8] + this[3] * b[0] + this[4] * b[10] - this[10] * b[4] - this[11] * b[5] - this[12] * b[15] - this[13] * b[7] - this[14] * b[9] - this[5] * b[11] - this[6] * b[1] - this[7] * b[13] - this[8] * b[2] - this[9] * b[14];
                target[4] = this[0] * b[4] + this[15] * b[11] + this[1] * b[7] + this[2] * b[9] + this[3] * b[10] + this[4] * b[0] - this[10] * b[3] - this[11] * b[15] - this[12] * b[5] - this[13] * b[6] - this[14] * b[8] - this[5] * b[12] - this[6] * b[13] - this[7] * b[1] - this[8] * b[14] - this[9] * b[2];
                target[5] = this[0] * b[5] + this[10] * b[15] + this[12] * b[4] + this[14] * b[13] + this[15] * b[10] + this[2] * b[1] + this[4] * b[12] + this[5] * b[0] + this[7] * b[9] + this[8] * b[6] - this[11] * b[3] - this[13] * b[14] - this[1] * b[2] - this[3] * b[11] - this[6] * b[8] - this[9] * b[7];
                target[6] = this[0] * b[6] + this[11] * b[2] + this[12] * b[14] + this[13] * b[4] + this[2] * b[11] + this[3] * b[1] + this[4] * b[13] + this[5] * b[8] + this[6] * b[0] + this[7] * b[10] - this[10] * b[7] - this[14] * b[12] - this[15] * b[9] - this[1] * b[3] - this[8] * b[5] - this[9] * b[15];
                target[7] = this[0] * b[7] + this[11] * b[14] + this[12] * b[2] + this[13] * b[3] + this[2] * b[12] + this[3] * b[13] + this[4] * b[1] + this[5] * b[9] + this[6] * b[10] + this[7] * b[0] - this[10] * b[6] - this[14] * b[11] - this[15] * b[8] - this[1] * b[4] - this[8] * b[15] - this[9] * b[5];
                target[8] = this[0] * b[8] + this[13] * b[12] + this[14] * b[4] + this[15] * b[7] + this[3] * b[2] + this[4] * b[14] + this[6] * b[5] + this[7] * b[15] + this[8] * b[0] + this[9] * b[10] - this[10] * b[9] - this[11] * b[1] - this[12] * b[13] - this[1] * b[11] - this[2] * b[3] - this[5] * b[6];
                target[9] = this[0] * b[9] + this[13] * b[11] + this[14] * b[3] + this[15] * b[6] + this[3] * b[14] + this[4] * b[2] + this[6] * b[15] + this[7] * b[5] + this[8] * b[10] + this[9] * b[0] - this[10] * b[8] - this[11] * b[13] - this[12] * b[1] - this[1] * b[12] - this[2] * b[4] - this[5] * b[7];
                target[10] = this[0] * b[10] + this[10] * b[0] + this[11] * b[12] + this[4] * b[3] + this[7] * b[6] + this[9] * b[8] - this[12] * b[11] - this[13] * b[1] - this[14] * b[2] - this[15] * b[5] - this[1] * b[13] - this[2] * b[14] - this[3] * b[4] - this[5] * b[15] - this[6] * b[7] - this[8] * b[9];
                target[11] = this[0] * b[11] + this[11] * b[0] + this[12] * b[10] + this[14] * b[7] + this[1] * b[8] + this[3] * b[5] + this[4] * b[15] + this[5] * b[3] + this[8] * b[1] + this[9] * b[13] - this[10] * b[12] - this[13] * b[9] - this[15] * b[4] - this[2] * b[6] - this[6] * b[2] - this[7] * b[14];
                target[12] = this[0] * b[12] + this[11] * b[10] + this[12] * b[0] + this[14] * b[6] + this[1] * b[9] + this[3] * b[15] + this[4] * b[5] + this[5] * b[4] + this[8] * b[13] + this[9] * b[1] - this[10] * b[11] - this[13] * b[8] - this[15] * b[3] - this[2] * b[7] - this[6] * b[14] - this[7] * b[2];
                target[13] = this[0] * b[13] + this[10] * b[1] + this[12] * b[8] + this[13] * b[0] + this[15] * b[2] + this[1] * b[10] + this[4] * b[6] + this[5] * b[14] + this[6] * b[4] + this[9] * b[11] - this[11] * b[9] - this[14] * b[5] - this[2] * b[15] - this[3] * b[7] - this[7] * b[3] - this[8] * b[12];
                target[14] = this[0] * b[14] + this[10] * b[2] + this[11] * b[7] + this[13] * b[5] + this[14] * b[0] + this[1] * b[15] + this[2] * b[10] + this[4] * b[8] + this[6] * b[12] + this[8] * b[4] - this[12] * b[6] - this[15] * b[1] - this[3] * b[9] - this[5] * b[13] - this[7] * b[11] - this[9] * b[3];
                target[15] = this[0] * b[15] + this[10] * b[5] + this[12] * b[3] + this[14] * b[1] + this[15] * b[0] + this[2] * b[13] + this[4] * b[11] + this[5] * b[10] + this[7] * b[8] + this[8] * b[7] - this[11] * b[4] - this[13] * b[2] - this[1] * b[14] - this[3] * b[12] - this[6] * b[9] - this[9] * b[6];
            }
            // else if (b.constructor === Una && target.constructor === Even) {
            //     target[0] = this[0] * b[0] + this[1] * b[1] + this[2] * b[2] + this[3] * b[3] - this[4] * b[4];
            //     target[1] = this[0] * b[1] + this[5] * b[2] + this[6] * b[3] - this[1] * b[0] - this[7] * b[4];
            //     target[2] = this[0] * b[2] + this[8] * b[3] - this[2] * b[0] - this[5] * b[1] - this[9] * b[4];
            //     target[3] = this[0] * b[3] - this[10] * b[4] - this[3] * b[0] - this[6] * b[1] - this[8] * b[2];
            //     target[4] = this[0] * b[4] - this[10] * b[3] - this[4] * b[0] - this[7] * b[1] - this[9] * b[2];
            //     target[5] = this[11] * b[3] + this[1] * b[2] + this[5] * b[0] - this[12] * b[4] - this[2] * b[1];
            //     target[6] = this[1] * b[3] + this[6] * b[0] - this[11] * b[2] - this[13] * b[4] - this[3] * b[1];
            //     target[7] = this[1] * b[4] + this[7] * b[0] - this[12] * b[2] - this[13] * b[3] - this[4] * b[1];
            //     target[8] = this[11] * b[1] + this[2] * b[3] + this[8] * b[0] - this[14] * b[4] - this[3] * b[2];
            //     target[9] = this[12] * b[1] + this[2] * b[4] + this[9] * b[0] - this[14] * b[3] - this[4] * b[2];
            //     target[10] = this[10] * b[0] + this[13] * b[1] + this[14] * b[2] + this[3] * b[4] - this[4] * b[3];
            //     target[11] = this[5] * b[3] + this[8] * b[1] - this[11] * b[0] - this[15] * b[4] - this[6] * b[2];
            //     target[12] = this[5] * b[4] + this[9] * b[1] - this[12] * b[0] - this[15] * b[3] - this[7] * b[2];
            //     target[13] = this[10] * b[1] + this[15] * b[2] + this[6] * b[4] - this[13] * b[0] - this[7] * b[3];
            //     target[14] = this[10] * b[2] + this[8] * b[4] - this[14] * b[0] - this[15] * b[1] - this[9] * b[3];
            //     target[15] = this[11] * b[4] + this[13] * b[2] + this[15] * b[0] - this[12] * b[3] - this[14] * b[1];
            // }
            else if (b.constructor === Odd && target.constructor === Even) {
                target[0] = this[0] * b[0] + this[10] * b[10] + this[12] * b[12] + this[13] * b[13] + this[14] * b[14] + this[1] * b[1] + this[2] * b[2] + this[3] * b[3] + this[7] * b[7] + this[9] * b[9] - this[11] * b[11] - this[15] * b[15] - this[4] * b[4] - this[5] * b[5] - this[6] * b[6] - this[8] * b[8];
                target[1] = this[0] * b[1] + this[10] * b[13] + this[11] * b[8] + this[14] * b[15] + this[15] * b[14] + this[2] * b[5] + this[3] * b[6] + this[5] * b[2] + this[6] * b[3] + this[9] * b[12] - this[12] * b[9] - this[13] * b[10] - this[1] * b[0] - this[4] * b[7] - this[7] * b[4] - this[8] * b[11];
                target[2] = this[0] * b[2] + this[10] * b[14] + this[12] * b[7] + this[3] * b[8] + this[6] * b[11] + this[8] * b[3] - this[11] * b[6] - this[13] * b[15] - this[14] * b[10] - this[15] * b[13] - this[1] * b[5] - this[2] * b[0] - this[4] * b[9] - this[5] * b[1] - this[7] * b[12] - this[9] * b[4];
                target[3] = this[0] * b[3] + this[11] * b[5] + this[12] * b[15] + this[13] * b[7] + this[14] * b[9] + this[15] * b[12] - this[10] * b[4] - this[1] * b[6] - this[2] * b[8] - this[3] * b[0] - this[4] * b[10] - this[5] * b[11] - this[6] * b[1] - this[7] * b[13] - this[8] * b[2] - this[9] * b[14];
                target[4] = this[0] * b[4] + this[11] * b[15] + this[12] * b[5] + this[13] * b[6] + this[14] * b[8] + this[15] * b[11] - this[10] * b[3] - this[1] * b[7] - this[2] * b[9] - this[3] * b[10] - this[4] * b[0] - this[5] * b[12] - this[6] * b[13] - this[7] * b[1] - this[8] * b[14] - this[9] * b[2];
                target[5] = this[0] * b[5] + this[10] * b[15] + this[11] * b[3] + this[13] * b[14] + this[15] * b[10] + this[1] * b[2] + this[3] * b[11] + this[5] * b[0] + this[7] * b[9] + this[8] * b[6] - this[12] * b[4] - this[14] * b[13] - this[2] * b[1] - this[4] * b[12] - this[6] * b[8] - this[9] * b[7];
                target[6] = this[0] * b[6] + this[14] * b[12] + this[1] * b[3] + this[5] * b[8] + this[6] * b[0] + this[7] * b[10] - this[10] * b[7] - this[11] * b[2] - this[12] * b[14] - this[13] * b[4] - this[15] * b[9] - this[2] * b[11] - this[3] * b[1] - this[4] * b[13] - this[8] * b[5] - this[9] * b[15];
                target[7] = this[0] * b[7] + this[14] * b[11] + this[1] * b[4] + this[5] * b[9] + this[6] * b[10] + this[7] * b[0] - this[10] * b[6] - this[11] * b[14] - this[12] * b[2] - this[13] * b[3] - this[15] * b[8] - this[2] * b[12] - this[3] * b[13] - this[4] * b[1] - this[8] * b[15] - this[9] * b[5];
                target[8] = this[0] * b[8] + this[11] * b[1] + this[12] * b[13] + this[15] * b[7] + this[1] * b[11] + this[2] * b[3] + this[6] * b[5] + this[7] * b[15] + this[8] * b[0] + this[9] * b[10] - this[10] * b[9] - this[13] * b[12] - this[14] * b[4] - this[3] * b[2] - this[4] * b[14] - this[5] * b[6];
                target[9] = this[0] * b[9] + this[11] * b[13] + this[12] * b[1] + this[15] * b[6] + this[1] * b[12] + this[2] * b[4] + this[6] * b[15] + this[7] * b[5] + this[8] * b[10] + this[9] * b[0] - this[10] * b[8] - this[13] * b[11] - this[14] * b[3] - this[3] * b[14] - this[4] * b[2] - this[5] * b[7];
                target[10] = this[0] * b[10] + this[10] * b[0] + this[12] * b[11] + this[13] * b[1] + this[14] * b[2] + this[1] * b[13] + this[2] * b[14] + this[3] * b[4] + this[7] * b[6] + this[9] * b[8] - this[11] * b[12] - this[15] * b[5] - this[4] * b[3] - this[5] * b[15] - this[6] * b[7] - this[8] * b[9];
                target[11] = this[0] * b[11] + this[13] * b[9] + this[2] * b[6] + this[5] * b[3] + this[8] * b[1] + this[9] * b[13] - this[10] * b[12] - this[11] * b[0] - this[12] * b[10] - this[14] * b[7] - this[15] * b[4] - this[1] * b[8] - this[3] * b[5] - this[4] * b[15] - this[6] * b[2] - this[7] * b[14];
                target[12] = this[0] * b[12] + this[13] * b[8] + this[2] * b[7] + this[5] * b[4] + this[8] * b[13] + this[9] * b[1] - this[10] * b[11] - this[11] * b[10] - this[12] * b[0] - this[14] * b[6] - this[15] * b[3] - this[1] * b[9] - this[3] * b[15] - this[4] * b[5] - this[6] * b[14] - this[7] * b[2];
                target[13] = this[0] * b[13] + this[10] * b[1] + this[11] * b[9] + this[14] * b[5] + this[15] * b[2] + this[2] * b[15] + this[3] * b[7] + this[5] * b[14] + this[6] * b[4] + this[9] * b[11] - this[12] * b[8] - this[13] * b[0] - this[1] * b[10] - this[4] * b[6] - this[7] * b[3] - this[8] * b[12];
                target[14] = this[0] * b[14] + this[10] * b[2] + this[12] * b[6] + this[3] * b[9] + this[6] * b[12] + this[8] * b[4] - this[11] * b[7] - this[13] * b[5] - this[14] * b[0] - this[15] * b[1] - this[1] * b[15] - this[2] * b[10] - this[4] * b[8] - this[5] * b[13] - this[7] * b[11] - this[9] * b[3];
                target[15] = this[0] * b[15] + this[10] * b[5] + this[11] * b[4] + this[13] * b[2] + this[15] * b[0] + this[1] * b[14] + this[3] * b[12] + this[5] * b[10] + this[7] * b[8] + this[8] * b[7] - this[12] * b[3] - this[14] * b[1] - this[2] * b[13] - this[4] * b[11] - this[6] * b[9] - this[9] * b[6];
            }
            else
                console.error("not implemented")
    
            return target
        }
    }
    window.Odd = Odd
    Odd.indexGrades = [
        1, 1, 1, 1, 1,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        5,
    ]
    Odd.basisNames = ['1', '2', '3', '4', '5', '123', '124', '125', '134', '135', '145', '234', '235', '245', '345', '12345']

    localOdd0 = new Odd(); localOdd1 = new Odd(); localOdd2 = new Odd(); localOdd3 = new Odd(); localOdd4 = new Odd(); localOdd5 = new Odd(); localOdd6 = new Odd(); localOdd7 = new Odd(); localOdd8 = new Odd(); localOdd9 = new Odd();
    localEven0 = new Even(); localEven1 = new Even(); localEven2 = new Even(); localEven3 = new Even(); localEven4 = new Even(); localEven5 = new Even(); localEven6 = new Even(); localEven7 = new Even(); localEven8 = new Even(); localEven9 = new Even(); localEven10 = new Even(); localEven11 = new Even(); localEven12 = new Even(); localEven13 = new Even(); localEven14 = new Even(); localEven15 = new Even();

    // could be e15, 1+e15, e234

    _one = new Even().fromFloatAndIndex(1., 0)

    _e1 = new Odd().fromFloatAndIndex(1., 0)
    _e2 = new Odd().fromFloatAndIndex(1., 1)
    _e3 = new Odd().fromFloatAndIndex(1., 2)
    _e4 = new Odd().fromFloatAndIndex(1., 3)
    _e5 = new Odd().fromFloatAndIndex(1., 4)

    _e0 = new Odd()
    _e4.add(_e5, _e0) //this is the part where you decide everything has magnitude sqrt(2)
    _eo = new Odd()
    _e4.sub(_e5, _eo)

    _e10 = _e1.mul(_e0, new Even())
    _e20 = _e2.mul(_e0, new Even())
    _e30 = _e3.mul(_e0, new Even())

    _e45 = _e4.mul(_e5, new Even())

    _e12 = _e1.mul(_e2, new Even())
    _e23 = _e2.mul(_e3, new Even())
    _e13 = _e1.mul(_e3, new Even())

    _e14 = _e1.mul(_e4, new Even())
    _e15 = _e1.mul(_e5, new Even())
    _e24 = _e2.mul(_e4, new Even())
    _e25 = _e2.mul(_e5, new Even())
    _e34 = _e3.mul(_e4, new Even())
    _e35 = _e3.mul(_e5, new Even())
    
    _e123 = _e12.mul(_e3, new Odd())
    _e124 = _e12.mul(_e4, new Odd())
    _e125 = _e12.mul(_e5, new Odd())
    _e234 = _e23.mul(_e4, new Odd())
    _e235 = _e23.mul(_e5, new Odd())
    _e134 = _e13.mul(_e4, new Odd())
    _e135 = _e13.mul(_e5, new Odd())

    _e1234 = _e123.mul(_e4, new Even())
    _e1230 = _e123.mul(_e0, new Even())

    _e12345 = _e123.mul(_e45, new Odd())

    // debugger
    
    odd0 = new Odd(); odd1 = new Odd(); odd2 = new Odd(); odd3 = new Odd(); odd4 = new Odd(); odd5 = new Odd(); odd6 = new Odd();
    even0 = new Even(); even1 = new Even(); even2 = new Even(); even3 = new Even(); even4 = new Even(); even5 = new Even(); even6 = new Even();
}