function init31() {

    let basisNames = [
        "", 
        "1", "2", "Plus", "Minus", 
        "12", "1Plus", "1Minus", "2Plus", "2Minus", "PlusMinus", 
        "Plus12", "Minus12", "PlusMinus1", "PlusMinus2", 
        "I"]

    const N_COEFS = 16

    class Mv extends GeneralVector {
        static get size() { return N_COEFS }

        constructor() {
            return super(N_COEFS)
        }

        sandwich(mvToBeSandwiched, target) {
            if ( target === undefined )
                target = new Mv()

            this.reverse(localMv0)

            this.mul(mvToBeSandwiched, localMv1)
            localMv1.mul(localMv0, target)

            // let ks = mvToBeSandwiched.grade() * this.grade()
            // if (ks % 2 === 0)
            //     target.multiplyScalar(-1.)

            return target
        }

        fromPoint2D( x, y ) {
            this.copy(e12)
            this.addScaled(xDir, x)
            this.addScaled(yDir, y)
            
            return this
        }

        toPoint2D( array, offset ) {
            let w = this[5]
            let dotted = this.inner(eMinus,localMv0)
            array[offset + 0] = dotted[1] / w
            array[offset + 1] = dotted[2] / w
            array[offset + 2] = 0. //z
        }

        selectGrade(grade,target) {
            target.copy(this)
            for(let i = 0; i < 16; ++i) {
                if (indexGrades[i] !== grade)
                    target[i] = 0.
            }

            return target
        }

        hasGrade(grade) {
            if (grade === 0)
                return this[0] !== 0.
            if (grade === 1)
                return (this[1] !== 0. || this[2] !== 0. || this[3] !== 0. || this[4] !== 0.)
            if (grade === 2)
                return (this[5] !== 0. || this[6] !== 0. || this[7] !== 0. || this[8] !== 0. || this[9] !== 0. || this[10] !== 0.)
            if (grade === 3)
                return (this[11] !== 0. || this[12] !== 0. || this[13] !== 0. || this[14] !== 0.)
            if (grade === 4)
                return this[15] !== 0.
        }

        grade() {
            for (let i = 0; i < 5; ++i) {
                if (this.hasGrade(i))
                    return i
            }
        }

        log(label, numDecimalPlaces) {
            if (numDecimalPlaces === undefined)
                numDecimalPlaces = 1

            let str = ""
            for (let i = 0; i < basisNames.length; ++i) {
                if (this[i] !== 0.) { // && this[i].toFixed() != 0) {
                    if (str !== "")
                        str += ", "

                    let sign = 1.
                    // if (onesWithMinus.indexOf(basisNames[i]) !== -1)
                    //     sign = -1.

                    str += (sign * this[i]).toFixed(numDecimalPlaces) + (i !== 0 ? "e" : "") + basisNames[i]
                }
            }

            if (str === "")
                str += "0."

            if (label !== undefined)
                str = label + ": " + str
            else {
                label = getWhereThisWasCalledFrom()
                str = label + ": " + str
            }

            console.log(str)
        }

        bivector(a, b, c, d, e, f) {
            this.copy(zeroMv)
            this[5] = a; this[6] = b; this[7] = c;
            this[8] = d; this[9] = e; this[10] = f;
            return this
        }

        rotor(s,   a,b,c,d,e,f, p ) {
            this.copy(zeroMv)
            this[0] = s
            this[5] = a; this[6] = b; this[7] = c;
            this[8] = d; this[9] = e; this[10] = f;
            this[15] = p
            return this
        }
        normalize() {
            //only for rotors really
            var S = this[0] * this[0] + this[5] * this[5] + this[6] * this[6] - this[7] * this[7] + this[8] * this[8] - this[9] * this[9] - this[10] * this[10] - this[15] * this[15];
            var T = 2. * (this[0] * this[15] - this[5] * this[10] + this[6] * this[9] - this[7] * this[8]);
            var N = Math.sqrt(Math.sqrt(S * S + T * T) + S), N2 = N * N;
            var ND = Math.SQRT2 * N / (N2 * N2 + T * T);
            var C = N2 * ND, D = -T * ND;
            this.rotor(
                C * this[0] - D * this[15], C * this[5] + D * this[10], C * this[6] - D * this[9], C * this[7] - D * this[8],
                C * this[8] + D * this[7], C * this[9] + D * this[6], C * this[10] - D * this[5], C * this[15] + D * this[0]
            )

            return this
        }

        exp(target) {
            if (target === undefined)
                target = new Mv()

            if (!this.hasGrade(2))
                return target.copy(oneMv)

            let S = -this[5] * this[5] - this[6] * this[6] + this[7] * this[7] - this[8] * this[8] + this[9] * this[9] + this[10] * this[10]
            let T = 2. * (this[5] * this[10] - this[6] * this[9] + this[7] * this[8])
            // ||B*B||
            let norm = Math.sqrt(S * S + T * T)

            if(norm === 0.) {
                this.selectGrade(2,target)
                target[0] = 1.
                return target
            }

            // P_+ = xB + y*e1234*B
            let [x, y] = [0.5 * (1. + S / norm), -0.5 * T / norm];
            let [lp, lm] = [Math.sqrt(0.5 * S + 0.5 * norm), Math.sqrt(-0.5 * S + 0.5 * norm)]
            let [cp, sp] = [Math.cosh(lp), lp === 0. ? 1. : Math.sinh(lp) / lp]
            let [cm, sm] = [Math.cos(lm), lm === 0. ? 1. : Math.sin(lm) / lm]
            let [cmsp, cpsm] = [cm * sp, cp * sm]
            let [alpha, beta] = [(cmsp - cpsm) * x + cpsm, (cmsp - cpsm) * y]

            // Combine the two Euler's formulas together.
            target.rotor(
                cp * cm,
                (this[5] * alpha + this[10] * beta), (this[6] * alpha - this[9] * beta),
                (this[7] * alpha - this[8] * beta), (this[8] * alpha + this[7] * beta),
                (this[9] * alpha + this[6] * beta), (this[10] * alpha - this[5] * beta),
                sp * sm * T / 2.
            )

            return target
        }

        logarithm(target) {
            if (target === undefined)
                target = new Mv()

            if (this.hasGrade(0) && !this.hasGrade(2))
                return target.copy(zeroMv)

            // B*B = S + T*e1234
            let S = this[0] * this[0] - this[15] * this[15] - 1;
            let T = 2 * (this[0] * this[15])
            let norm = Math.sqrt(S * S + T * T)

            let [x, y] = [0.5 * (1 + S / norm), -0.5 * T / norm];
            // lp is always a boost, lm a rotation
            let [lp, lm] = [Math.sqrt(0.5 * S + 0.5 * norm), Math.sqrt(-0.5 * S + 0.5 * norm)]
            let theta2 = lm == 0 ? 0 : Math.atan2(lm, this[0]);
            let theta1 = Math.atanh(lp / this[0]);
            let [w1, w2] = [lp == 0 ? 0 : theta1 / lp, lm == 0 ? 0 : theta2 / lm]
            let [A, B] = [(w1 - w2) * x + w2, w1 == 0 ? Math.atanh(-this[15] / lm) / lm : (w1 - w2) * y];

            return target.line(
                this[5] * A + this[10] * B, this[6] * A - this[9] * B, this[7] * A - this[8] * B,
                this[8] * A + this[7] * B, this[9] * A + this[6] * B, this[10] * A - this[5] * B
            )
        }

        //aliasing allowed
        reverse(target) {
            if (target === undefined)
                target = new Mv()

            target[0] = this[0]
            target[1] = this[1]
            target[2] = this[2]
            target[3] = this[3]
            target[4] = this[4]
            target[5] = -this[5]
            target[6] = -this[6]
            target[7] = -this[7]
            target[8] = -this[8]
            target[9] = -this[9]
            target[10] = -this[10]
            target[11] = -this[11]
            target[12] = -this[12]
            target[13] = -this[13]
            target[14] = -this[14]
            target[15] = this[15]
            return target
        }

        meet(b, target) {
            if (target === undefined)
                target = new Mv()
            target[0] = b[0] * this[0];
            target[1] = b[1] * this[0] + b[0] * this[1];
            target[2] = b[2] * this[0] + b[0] * this[2];
            target[3] = b[3] * this[0] + b[0] * this[3];
            target[4] = b[4] * this[0] + b[0] * this[4];
            target[5] = b[5] * this[0] + b[2] * this[1] - b[1] * this[2] + b[0] * this[5];
            target[6] = b[6] * this[0] + b[3] * this[1] - b[1] * this[3] + b[0] * this[6];
            target[7] = b[7] * this[0] + b[4] * this[1] - b[1] * this[4] + b[0] * this[7];
            target[8] = b[8] * this[0] + b[3] * this[2] - b[2] * this[3] + b[0] * this[8];
            target[9] = b[9] * this[0] + b[4] * this[2] - b[2] * this[4] + b[0] * this[9];
            target[10] = b[10] * this[0] + b[4] * this[3] - b[3] * this[4] + b[0] * this[10];
            target[11] = b[11] * this[0] + b[8] * this[1] - b[6] * this[2] + b[5] * this[3] + b[3] * this[5] - b[2] * this[6] + b[1] * this[8] + b[0] * this[11];
            target[12] = b[12] * this[0] + b[9] * this[1] - b[7] * this[2] + b[5] * this[4] + b[4] * this[5] - b[2] * this[7] + b[1] * this[9] + b[0] * this[12];
            target[13] = b[13] * this[0] + b[10] * this[1] - b[7] * this[3] + b[6] * this[4] + b[4] * this[6] - b[3] * this[7] + b[1] * this[10] + b[0] * this[13];
            target[14] = b[14] * this[0] + b[10] * this[2] - b[9] * this[3] + b[8] * this[4] + b[4] * this[8] - b[3] * this[9] + b[2] * this[10] + b[0] * this[14];
            target[15] = b[15] * this[0] + b[14] * this[1] - b[13] * this[2] + b[12] * this[3] - b[11] * this[4] + b[10] * this[5] - b[9] * this[6] + b[8] * this[7] + b[7] * this[8] - b[6] * this[9] + b[5] * this[10] + b[4] * this[11] - b[3] * this[12] + b[2] * this[13] - b[1] * this[14] + b[0] * this[15];
            return target;
        }

        join(b, target) {
            if (target === undefined)
                target = new Mv()
            target[15] = 1. * (this[15] * b[15]);
            target[14] = -1. * (this[14] * -1. * b[15] + this[15] * b[14] * -1);
            target[13] = 1. * (this[13] * b[15] + this[15] * b[13]);
            target[12] = -1. * (this[12] * -1. * b[15] + this[15] * b[12] * -1);
            target[11] = 1. * (this[11] * b[15] + this[15] * b[11]);
            target[10] = 1. * (this[10] * b[15] + this[13] * b[14] * -1 - this[14] * -1. * b[13] + this[15] * b[10]);
            target[9] = -1. * (this[9] * -1. * b[15] + this[12] * -1. * b[14] * -1 - this[14] * -1. * b[12] * -1 + this[15] * b[9] * -1);
            target[8] = 1. * (this[8] * b[15] + this[11] * b[14] * -1 - this[14] * -1. * b[11] + this[15] * b[8]);
            target[7] = 1. * (this[7] * b[15] + this[12] * -1. * b[13] - this[13] * b[12] * -1 + this[15] * b[7]);
            target[6] = -1. * (this[6] * -1. * b[15] + this[11] * b[13] - this[13] * b[11] + this[15] * b[6] * -1);
            target[5] = 1. * (this[5] * b[15] + this[11] * b[12] * -1 - this[12] * -1. * b[11] + this[15] * b[5]);
            target[4] = -1. * (this[4] * -1. * b[15] + this[7] * b[14] * -1 - this[9] * -1. * b[13] + this[10] * b[12] * -1 + this[12] * -1. * b[10] - this[13] * b[9] * -1 + this[14] * -1. * b[7] + this[15] * b[4] * -1);
            target[3] = 1. * (this[3] * b[15] + this[6] * -1. * b[14] * -1 - this[8] * b[13] + this[10] * b[11] + this[11] * b[10] - this[13] * b[8] + this[14] * -1. * b[6] * -1 + this[15] * b[3]);
            target[2] = -1. * (this[2] * -1. * b[15] + this[5] * b[14] * -1 - this[8] * b[12] * -1 + this[9] * -1. * b[11] + this[11] * b[9] * -1 - this[12] * -1. * b[8] + this[14] * -1. * b[5] + this[15] * b[2] * -1);
            target[1] = 1. * (this[1] * b[15] + this[5] * b[13] - this[6] * -1. * b[12] * -1 + this[7] * b[11] + this[11] * b[7] - this[12] * -1. * b[6] * -1 + this[13] * b[5] + this[15] * b[1]);
            target[0] = 1. * (this[0] * b[15] + this[1] * b[14] * -1 - this[2] * -1. * b[13] + this[3] * b[12] * -1 - this[4] * -1. * b[11] + this[5] * b[10] - this[6] * -1. * b[9] * -1 + this[7] * b[8] + this[8] * b[7] - this[9] * -1. * b[6] * -1 + this[10] * b[5] + this[11] * b[4] * -1 - this[12] * -1. * b[3] + this[13] * b[2] * -1 - this[14] * -1. * b[1] + this[15] * b[0]);
            return target;
        }

        inner(b, target) {
            if (target === undefined)
                target = new Mv()
            target[0] = b[0] * this[0] + b[1] * this[1] + b[2] * this[2] + b[3] * this[3] - b[4] * this[4] - b[5] * this[5] - b[6] * this[6] + b[7] * this[7] - b[8] * this[8] + b[9] * this[9] + b[10] * this[10] - b[11] * this[11] + b[12] * this[12] + b[13] * this[13] + b[14] * this[14] - b[15] * this[15];
            target[1] = b[1] * this[0] + b[0] * this[1] - b[5] * this[2] - b[6] * this[3] + b[7] * this[4] + b[2] * this[5] + b[3] * this[6] - b[4] * this[7] - b[11] * this[8] + b[12] * this[9] + b[13] * this[10] - b[8] * this[11] + b[9] * this[12] + b[10] * this[13] - b[15] * this[14] + b[14] * this[15];
            target[2] = b[2] * this[0] + b[5] * this[1] + b[0] * this[2] - b[8] * this[3] + b[9] * this[4] - b[1] * this[5] + b[11] * this[6] - b[12] * this[7] + b[3] * this[8] - b[4] * this[9] + b[14] * this[10] + b[6] * this[11] - b[7] * this[12] + b[15] * this[13] + b[10] * this[14] - b[13] * this[15];
            target[3] = b[3] * this[0] + b[6] * this[1] + b[8] * this[2] + b[0] * this[3] + b[10] * this[4] - b[11] * this[5] - b[1] * this[6] - b[13] * this[7] - b[2] * this[8] - b[14] * this[9] - b[4] * this[10] - b[5] * this[11] - b[15] * this[12] - b[7] * this[13] - b[9] * this[14] + b[12] * this[15];
            target[4] = b[4] * this[0] + b[7] * this[1] + b[9] * this[2] + b[10] * this[3] + b[0] * this[4] - b[12] * this[5] - b[13] * this[6] - b[1] * this[7] - b[14] * this[8] - b[2] * this[9] - b[3] * this[10] - b[15] * this[11] - b[5] * this[12] - b[6] * this[13] - b[8] * this[14] + b[11] * this[15];
            target[5] = b[5] * this[0] + b[11] * this[3] - b[12] * this[4] + b[0] * this[5] + b[15] * this[10] + b[3] * this[11] - b[4] * this[12] + b[10] * this[15];
            target[6] = b[6] * this[0] - b[11] * this[2] - b[13] * this[4] + b[0] * this[6] - b[15] * this[9] - b[2] * this[11] - b[4] * this[13] - b[9] * this[15];
            target[7] = b[7] * this[0] - b[12] * this[2] - b[13] * this[3] + b[0] * this[7] - b[15] * this[8] - b[2] * this[12] - b[3] * this[13] - b[8] * this[15];
            target[8] = b[8] * this[0] + b[11] * this[1] - b[14] * this[4] + b[15] * this[7] + b[0] * this[8] + b[1] * this[11] - b[4] * this[14] + b[7] * this[15];
            target[9] = b[9] * this[0] + b[12] * this[1] - b[14] * this[3] + b[15] * this[6] + b[0] * this[9] + b[1] * this[12] - b[3] * this[14] + b[6] * this[15];
            target[10] = b[10] * this[0] + b[13] * this[1] + b[14] * this[2] - b[15] * this[5] + b[0] * this[10] + b[1] * this[13] + b[2] * this[14] - b[5] * this[15];
            target[11] = b[11] * this[0] + b[15] * this[4] + b[0] * this[11] - b[4] * this[15];
            target[12] = b[12] * this[0] + b[15] * this[3] + b[0] * this[12] - b[3] * this[15];
            target[13] = b[13] * this[0] - b[15] * this[2] + b[0] * this[13] + b[2] * this[15];
            target[14] = b[14] * this[0] + b[15] * this[1] + b[0] * this[14] - b[1] * this[15];
            target[15] = b[15] * this[0] + b[0] * this[15];
            return target;
        }

        dual(target) {
            if (target === undefined)
                target = new Mv()

            target[0] = -this[15];
            target[1] = -this[14];
            target[2] = this[13];
            target[3] = -this[12];
            target[4] = -this[11];
            target[5] = this[10];
            target[6] = -this[9];
            target[7] = -this[8];
            target[8] = this[7];
            target[9] = this[6];
            target[10] = -this[5];
            target[11] = this[4];
            target[12] = this[3];
            target[13] = -this[2];
            target[14] = this[1];
            target[15] = this[0];
            return target;
        }

        mul(b, target) {
            if (target === undefined)
                target = new Mv()
            target[0] = b[0] * this[0] + b[1] * this[1] + b[2] * this[2] + b[3] * this[3] - b[4] * this[4] - b[5] * this[5] - b[6] * this[6] + b[7] * this[7] - b[8] * this[8] + b[9] * this[9] + b[10] * this[10] - b[11] * this[11] + b[12] * this[12] + b[13] * this[13] + b[14] * this[14] - b[15] * this[15];
            target[1] = b[1] * this[0] + b[0] * this[1] - b[5] * this[2] - b[6] * this[3] + b[7] * this[4] + b[2] * this[5] + b[3] * this[6] - b[4] * this[7] - b[11] * this[8] + b[12] * this[9] + b[13] * this[10] - b[8] * this[11] + b[9] * this[12] + b[10] * this[13] - b[15] * this[14] + b[14] * this[15];
            target[2] = b[2] * this[0] + b[5] * this[1] + b[0] * this[2] - b[8] * this[3] + b[9] * this[4] - b[1] * this[5] + b[11] * this[6] - b[12] * this[7] + b[3] * this[8] - b[4] * this[9] + b[14] * this[10] + b[6] * this[11] - b[7] * this[12] + b[15] * this[13] + b[10] * this[14] - b[13] * this[15];
            target[3] = b[3] * this[0] + b[6] * this[1] + b[8] * this[2] + b[0] * this[3] + b[10] * this[4] - b[11] * this[5] - b[1] * this[6] - b[13] * this[7] - b[2] * this[8] - b[14] * this[9] - b[4] * this[10] - b[5] * this[11] - b[15] * this[12] - b[7] * this[13] - b[9] * this[14] + b[12] * this[15];
            target[4] = b[4] * this[0] + b[7] * this[1] + b[9] * this[2] + b[10] * this[3] + b[0] * this[4] - b[12] * this[5] - b[13] * this[6] - b[1] * this[7] - b[14] * this[8] - b[2] * this[9] - b[3] * this[10] - b[15] * this[11] - b[5] * this[12] - b[6] * this[13] - b[8] * this[14] + b[11] * this[15];
            target[5] = b[5] * this[0] + b[2] * this[1] - b[1] * this[2] + b[11] * this[3] - b[12] * this[4] + b[0] * this[5] - b[8] * this[6] + b[9] * this[7] + b[6] * this[8] - b[7] * this[9] + b[15] * this[10] + b[3] * this[11] - b[4] * this[12] + b[14] * this[13] - b[13] * this[14] + b[10] * this[15];
            target[6] = b[6] * this[0] + b[3] * this[1] - b[11] * this[2] - b[1] * this[3] - b[13] * this[4] + b[8] * this[5] + b[0] * this[6] + b[10] * this[7] - b[5] * this[8] - b[15] * this[9] - b[7] * this[10] - b[2] * this[11] - b[14] * this[12] - b[4] * this[13] + b[12] * this[14] - b[9] * this[15];
            target[7] = b[7] * this[0] + b[4] * this[1] - b[12] * this[2] - b[13] * this[3] - b[1] * this[4] + b[9] * this[5] + b[10] * this[6] + b[0] * this[7] - b[15] * this[8] - b[5] * this[9] - b[6] * this[10] - b[14] * this[11] - b[2] * this[12] - b[3] * this[13] + b[11] * this[14] - b[8] * this[15];
            target[8] = b[8] * this[0] + b[11] * this[1] + b[3] * this[2] - b[2] * this[3] - b[14] * this[4] - b[6] * this[5] + b[5] * this[6] + b[15] * this[7] + b[0] * this[8] + b[10] * this[9] - b[9] * this[10] + b[1] * this[11] + b[13] * this[12] - b[12] * this[13] - b[4] * this[14] + b[7] * this[15];
            target[9] = b[9] * this[0] + b[12] * this[1] + b[4] * this[2] - b[14] * this[3] - b[2] * this[4] - b[7] * this[5] + b[15] * this[6] + b[5] * this[7] + b[10] * this[8] + b[0] * this[9] - b[8] * this[10] + b[13] * this[11] + b[1] * this[12] - b[11] * this[13] - b[3] * this[14] + b[6] * this[15];
            target[10] = b[10] * this[0] + b[13] * this[1] + b[14] * this[2] + b[4] * this[3] - b[3] * this[4] - b[15] * this[5] - b[7] * this[6] + b[6] * this[7] - b[9] * this[8] + b[8] * this[9] + b[0] * this[10] - b[12] * this[11] + b[11] * this[12] + b[1] * this[13] + b[2] * this[14] - b[5] * this[15];
            target[11] = b[11] * this[0] + b[8] * this[1] - b[6] * this[2] + b[5] * this[3] + b[15] * this[4] + b[3] * this[5] - b[2] * this[6] - b[14] * this[7] + b[1] * this[8] + b[13] * this[9] - b[12] * this[10] + b[0] * this[11] + b[10] * this[12] - b[9] * this[13] + b[7] * this[14] - b[4] * this[15];
            target[12] = b[12] * this[0] + b[9] * this[1] - b[7] * this[2] + b[15] * this[3] + b[5] * this[4] + b[4] * this[5] - b[14] * this[6] - b[2] * this[7] + b[13] * this[8] + b[1] * this[9] - b[11] * this[10] + b[10] * this[11] + b[0] * this[12] - b[8] * this[13] + b[6] * this[14] - b[3] * this[15];
            target[13] = b[13] * this[0] + b[10] * this[1] - b[15] * this[2] - b[7] * this[3] + b[6] * this[4] + b[14] * this[5] + b[4] * this[6] - b[3] * this[7] - b[12] * this[8] + b[11] * this[9] + b[1] * this[10] - b[9] * this[11] + b[8] * this[12] + b[0] * this[13] - b[5] * this[14] + b[2] * this[15];
            target[14] = b[14] * this[0] + b[15] * this[1] + b[10] * this[2] - b[9] * this[3] + b[8] * this[4] - b[13] * this[5] + b[12] * this[6] - b[11] * this[7] + b[4] * this[8] - b[3] * this[9] + b[2] * this[10] + b[7] * this[11] - b[6] * this[12] + b[5] * this[13] + b[0] * this[14] - b[1] * this[15];
            target[15] = b[15] * this[0] + b[14] * this[1] - b[13] * this[2] + b[12] * this[3] - b[11] * this[4] + b[10] * this[5] - b[9] * this[6] + b[8] * this[7] + b[7] * this[8] - b[6] * this[9] + b[5] * this[10] + b[4] * this[11] - b[3] * this[12] + b[2] * this[13] - b[1] * this[14] + b[0] * this[15];

            return target
        }
    }
    window.Mv = Mv

    let indexGrades = [
        0,
        1,1,1,1,
        2,2,2, 2,2,2,
        3,3,3,3,
        4
    ]

    function MvFromFloatAndIndex(float, index) {
        let mv = new Mv()
        mv[index] = float
        return mv
    }

    zeroMv = new Mv()
    oneMv = new Mv()
    oneMv[0] = 1.
    let minusOneMv = new Mv()
    minusOneMv[0] = -1.

    e1 = MvFromFloatAndIndex(1., 1)
    e2 = MvFromFloatAndIndex(1., 2)
    ePlus = MvFromFloatAndIndex(1., 3)
    eMinus = MvFromFloatAndIndex(1., 4)

    e12 = e1.mul(e2)
    ePlus1 = ePlus.mul(e1)
    ePlus2 = ePlus.mul(e2)
    ePlusMinus = ePlus.mul(eMinus)
    eMinus1 = eMinus.mul(e1)
    eMinus2 = eMinus.mul(e2)

    ePlusMinus1 = ePlusMinus.mul(e1)
    ePlusMinus2 = ePlusMinus.mul(e2)
    ePlus12 = ePlus.mul(e12)
    eMinus12 = eMinus.mul(e12)
    I = ePlusMinus.mul(e12)

    e0 = ePlus.add(eMinus)
    e012 = e0.meet(e12)
    em = ePlus.sub(eMinus).multiplyScalar(0.5) // seems most readable
    em12 = em.meet(e12)

    xDir = e0.meet(e2)
    yDir = e0.meet(e1)

    mv0 = new Mv()
    mv1 = new Mv()
    mv2 = new Mv()
    mv3 = new Mv()
    mv4 = new Mv()
    mv5 = new Mv()
    mv6 = new Mv()

    let localMv0 = new Mv()
    let localMv1 = new Mv()
    let localMv2 = new Mv()
    let localMv3 = new Mv()
    let localMv4 = new Mv()
    let localMv5 = new Mv()
    let localMv6 = new Mv()

/*END*/}