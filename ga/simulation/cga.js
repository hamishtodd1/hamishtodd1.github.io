function initCgaWithoutDeclarations() {

    class Cga extends Float32Array {

        constructor() {
            super(32)
        }

        fromMat(cm) {
            seligMatrices.forEach((sm, i) => {
                matMul(cm, sm, cm0)
                this[i] = math.trace(cm0).re / 4.
            })
            return this
        }

        isZero() {
            let ret = true
            for (let i = 0; i < 32; ++i)
                if (this[i] !== 0.)
                    ret = false
            return ret
        }

        lowestNonzero() {
            for (let i = 0; i < 32; ++i)
                if (this[i] !== 0.)
                    return i
            return -1
        }

        fromFloatAndIndex(float, index) {
            for (let i = 0; i < 32; ++i) {
                if (i === index)
                    this[i] = float
                else
                    this[i] = 0.
            }
            return this
        }

        multiplyScalar(s, target) {
            if (target === undefined) {
                if (frameCount > 0)
                    console.error("no target at " + getWhereThisWasCalledFrom(1))
                target = new this.constructor()
            }

            for (let i = 0; i < 32; ++i)
                target[i] = s * this[i]

            return target
        }

        copy(v) {
            if (!basicallySameType(this, v)) {
                v.cast(this)
                return this
            }

            for (let i = 0; i < 32; ++i)
                this[i] = v[i]

            return this
        }

        clone() {
            let cl = new this.constructor()
            //also the planes lines and points' magnitude should be on the thingy
            cl.copy(this)

            return cl
        }

        equals(v) {
            if (v.constructor.size !== 32)
                console.error("type error at " + getWhereThisWasCalledFrom())

            let ret = true
            for (let i = 0; i < 32; ++i) {
                if (this[i] !== v[i])
                    ret = false
            }
            return ret
        }

        approxEquals(v) {
            if (!basicallySameType(this, v))
                console.error("type error")

            let doesEqual = true
            for (let i = 0; i < 32; ++i) {
                if (Math.abs(this[i] - v[i]) > .0001)
                    doesEqual = false
            }
            return doesEqual
        }

        fromArray(arr) {
            for (let i = 0; i < 32; ++i)
                this[i] = arr[i]

            return this
        }

        toArray(arr, offset) {
            if (offset === undefined)
                offset = 0

            for (let i = 0; i < 32; ++i)
                arr[offset * 32 + i] = this[i]

            return arr
        }

        add(v, target) {

            if (target === undefined)
                target = new this.constructor()

            if (!basicallySameType(this, v))
                console.error("type error")

            for (let i = 0; i < 32; ++i)
                target[i] = this[i] + v[i]
            return target
        }
        sub(v, target) {

            if (target === undefined)
                target = new this.constructor()

            if (!basicallySameType(this, v))
                console.error("type error")

            for (let i = 0; i < 32; ++i)
                target[i] = this[i] - v[i]
            return target
        }

        addScaled(v, scale, target) { //by default, applies to itself

            if (target === undefined)
                target = new this.constructor()

            if (!basicallySameType(this, v))
                console.error("type error")

            for (let i = 0; i < 32; ++i)
                target[i] = this[i] + scale * v[i]
            return target
        }

        log(label, numDecimalPlaces) {

            let str = this.toString(numDecimalPlaces)

            if (label !== undefined)
                str = label + ": " + str
            else {
                label = getWhereThisWasCalledFrom()
                str = label + ": " + str
            }

            console.log(str)
        }

        negate(target) {
            if (target === undefined)
                target = new this.constructor()

            for (let i = 0; i < 32; ++i)
                target[i] = -1. * this[i]

            return target
        }

        toString(numDecimalPlaces) {
            if (numDecimalPlaces === undefined)
                numDecimalPlaces = 1

            let isCga = 32 === 32

            let str = ""
            for (let j = 0; j < 32; ++j) {

                let i = j
                if (j === 26) i = 31
                if (j === 31) i = 26

                if (Math.abs(this[i]) > 0.05 || isNaN(this[i])) { // && this[i].toFixed() != 0) {

                    if (str !== "")
                        str += " + "

                    // let sign = 1.
                    // if (this.constructor.onesWithMinus.indexOf(this.constructor.basisNames[i]) !== -1)
                    //     sign = -1.

                    let numString = this[i].toString()
                    if (numString.length > numDecimalPlaces)
                        numString = this[i].toFixed(numDecimalPlaces)

                    let basisName = this.constructor.basisNames[i]
                    str += numString + (basisName === `` ? `` : `e`) + basisName

                    //would be nice to have e0 in cga printing
                }
            }

            if (str === ``)
                str += `0.`

            return str
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

        selfSelfReverseScalar() {
            let b = this.reverse(newCga)
            return b[0] * this[0] + b[1] * this[1] + b[2] * this[2] + b[3] * this[3] + b[4] * this[4] - b[5] * this[5] - b[6] * this[6] - b[7] * this[7] - b[8] * this[8] + b[9] * this[9] - b[10] * this[10] - b[11] * this[11] + b[12] * this[12] - b[13] * this[13] + b[14] * this[14] + b[15] * this[15] - b[16] * this[16] - b[17] * this[17] + b[18] * this[18] - b[19] * this[19] + b[20] * this[20] + b[21] * this[21] - b[22] * this[22] + b[23] * this[23] + b[24] * this[24] + b[25] * this[25] + b[26] * this[26] - b[27] * this[27] - b[28] * this[28] - b[29] * this[29] - b[30] * this[30] - b[31] * this[31];
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

        let current = newCga
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

/*END*/}