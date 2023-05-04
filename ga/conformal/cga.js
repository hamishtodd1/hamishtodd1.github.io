function initCga() {

    class Cga extends GeneralVector {
        static get size() { return 32 }

        constructor() {
            return super(32)
        }

        fromPoga(poga) { //polar ga!
            this.zero()
        }

        fromEga(ega) {
            this.zero()

            this[ 0] = ega[ 0]

            this[ 1] = ega[ 2]; this[ 2] = ega[ 3]; this[ 3] = ega[ 4]  //e1, e2, e3
            this[ 6] = ega[ 8]; this[ 7] = ega[ 9]; this[10] = ega[10]  //12, 13, 23
            this[16] = ega[14] //e123

            this[ 4] =  ega[ 1]; this[ 5] =  ega[ 1]; //e0 = ep+em
            this[ 8] = -ega[ 5]; this[ 9] = -ega[ 5]; //e01
            this[11] = -ega[ 6]; this[11] = -ega[ 6]; //e02
            this[13] = -ega[ 7]; this[13] = -ega[ 7]; //e03

            this[17] = ega[11]; this[18] = ega[11]; //e012
            this[22] = ega[13]; this[23] = ega[13]; //e023
            this[19] = ega[12]; this[19] = ega[12]; //e013

            this[26] = -ega[15]; this[27] = -ega[15];

            return this
        }

        toEga(ega) {
            ega.zero()

            ega[ 0] =  this[ 0]

            ega[ 2] =  this[ 1]; ega[ 3] =  this[ 2]; ega[ 4] =  this[ 3]  //e1, e2, e3
            ega[ 8] =  this[ 6]; ega[ 9] =  this[ 7]; ega[10] =  this[10]  //12, 13, 23
            ega[14] =  this[16] //e123

            ega[ 1] =  this[ 4]; ega[ 1] =  this[ 5]; //e0 = ep+em
            ega[ 5] = -this[ 8]; ega[ 5] = -this[ 9]; //e01
            ega[ 6] = -this[11]; ega[ 6] = -this[11]; //e02
            ega[ 7] = -this[13]; ega[ 7] = -this[13]; //e03

            ega[11] =  this[17]; ega[11] =  this[18]; //e012
            ega[13] =  this[22]; ega[13] =  this[23]; //e023
            ega[12] =  this[19]; ega[12] =  this[19]; //e013

            ega[15] = -this[26]; ega[15] = -this[27];

            return ega
        }

        sandwich(cgaToBeSandwiched, target) {
            if (target === undefined)
                target = new Cga()

            this.reverse(localCga0)

            this.mul(cgaToBeSandwiched, localCga1)
            localCga1.mul(localCga0, target)

            // let ks = cgaToBeSandwiched.grade() * this.grade()
            // if (ks % 2 === 0)
            //     target.multiplyScalar(-1.)

            return target
        }

        selectGrade(grade, target) {
            target.copy(this)
            for (let i = 0; i < this.constructor.size; ++i) {
                if (this.constructor.indexGrades[i] !== grade)
                    target[i] = 0.
            }

            return target
        }

        // hasGrade(grade) {
        //     if (grade === 0)
        //         return this[0] !== 0.
        //     if (grade === 1)
        //         return (this[1] !== 0. || this[2] !== 0. || this[3] !== 0. || this[4] !== 0.)
        //     if (grade === 2)
        //         return (this[5] !== 0. || this[6] !== 0. || this[7] !== 0. || this[8] !== 0. || this[9] !== 0. || this[10] !== 0.)
        //     if (grade === 3)
        //         return (this[11] !== 0. || this[12] !== 0. || this[13] !== 0. || this[14] !== 0.)
        //     if (grade === 4)
        //         return this[15] !== 0.
        // }

        // grade() {
        //     for (let i = 0; i < 5; ++i) {
        //         if (this.hasGrade(i))
        //             return i
        //     }
        // }

        //aliasing allowed
        reverse(target) {
            if (target === undefined)
                target = new Cga()

            target[0] = cga[0];
            target[1] = cga[1];
            target[2] = cga[2];
            target[3] = cga[3];
            target[4] = cga[4];
            target[5] = cga[5];
            target[6] = -cga[6];
            target[7] = -cga[7];
            target[8] = -cga[8];
            target[9] = -cga[9];
            target[10] = -cga[10];
            target[11] = -cga[11];
            target[12] = -cga[12];
            target[13] = -cga[13];
            target[14] = -cga[14];
            target[15] = -cga[15];
            target[16] = -cga[16];
            target[17] = -cga[17];
            target[18] = -cga[18];
            target[19] = -cga[19];
            target[20] = -cga[20];
            target[21] = -cga[21];
            target[22] = -cga[22];
            target[23] = -cga[23];
            target[24] = -cga[24];
            target[25] = -cga[25];
            target[26] = cga[26];
            target[27] = cga[27];
            target[28] = cga[28];
            target[29] = cga[29];
            target[30] = cga[30];
            target[31] = cga[31];
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
            target[31] = 1 * (this[31] * b[31])
            target[30] = 1 * (this[30] * b[31] + this[31] * b[30])
            target[29] = -1 * (this[29] * -1 * b[31] + this[31] * b[29] * -1)
            target[28] = 1 * (this[28] * b[31] + this[31] * b[28])
            target[27] = -1 * (this[27] * -1 * b[31] + this[31] * b[27] * -1)
            target[26] = 1 * (this[26] * b[31] + this[31] * b[26])
            target[25] = 1 * (this[25] * b[31] + this[29] * -1 * b[30] - this[30] * b[29] * -1 + this[31] * b[25])
            target[24] = -1 * (this[24] * -1 * b[31] + this[28] * b[30] - this[30] * b[28] + this[31] * b[24] * -1)
            target[23] = 1 * (this[23] * b[31] + this[27] * -1 * b[30] - this[30] * b[27] * -1 + this[31] * b[23])
            target[22] = -1 * (this[22] * -1 * b[31] + this[26] * b[30] - this[30] * b[26] + this[31] * b[22] * -1)
            target[21] = 1 * (this[21] * b[31] + this[28] * b[29] * -1 - this[29] * -1 * b[28] + this[31] * b[21])
            target[20] = -1 * (this[20] * -1 * b[31] + this[27] * -1 * b[29] * -1 - this[29] * -1 * b[27] * -1 + this[31] * b[20] * -1)
            target[19] = 1 * (this[19] * b[31] + this[26] * b[29] * -1 - this[29] * -1 * b[26] + this[31] * b[19])
            target[18] = 1 * (this[18] * b[31] + this[27] * -1 * b[28] - this[28] * b[27] * -1 + this[31] * b[18])
            target[17] = -1 * (this[17] * -1 * b[31] + this[26] * b[28] - this[28] * b[26] + this[31] * b[17] * -1)
            target[16] = 1 * (this[16] * b[31] + this[26] * b[27] * -1 - this[27] * -1 * b[26] + this[31] * b[16])
            target[15] = 1 * (this[15] * b[31] + this[21] * b[30] - this[24] * -1 * b[29] * -1 + this[25] * b[28] + this[28] * b[25] - this[29] * -1 * b[24] * -1 + this[30] * b[21] + this[31] * b[15])
            target[14] = -1 * (this[14] * -1 * b[31] + this[20] * -1 * b[30] - this[23] * b[29] * -1 + this[25] * b[27] * -1 + this[27] * -1 * b[25] - this[29] * -1 * b[23] + this[30] * b[20] * -1 + this[31] * b[14] * -1)
            target[13] = 1 * (this[13] * b[31] + this[19] * b[30] - this[22] * -1 * b[29] * -1 + this[25] * b[26] + this[26] * b[25] - this[29] * -1 * b[22] * -1 + this[30] * b[19] + this[31] * b[13])
            target[12] = 1 * (this[12] * b[31] + this[18] * b[30] - this[23] * b[28] + this[24] * -1 * b[27] * -1 + this[27] * -1 * b[24] * -1 - this[28] * b[23] + this[30] * b[18] + this[31] * b[12])
            target[11] = -1 * (this[11] * -1 * b[31] + this[17] * -1 * b[30] - this[22] * -1 * b[28] + this[24] * -1 * b[26] + this[26] * b[24] * -1 - this[28] * b[22] * -1 + this[30] * b[17] * -1 + this[31] * b[11] * -1)
            target[10] = 1 * (this[10] * b[31] + this[16] * b[30] - this[22] * -1 * b[27] * -1 + this[23] * b[26] + this[26] * b[23] - this[27] * -1 * b[22] * -1 + this[30] * b[16] + this[31] * b[10])
            target[9] = -1 * (this[9] * -1 * b[31] + this[18] * b[29] * -1 - this[20] * -1 * b[28] + this[21] * b[27] * -1 + this[27] * -1 * b[21] - this[28] * b[20] * -1 + this[29] * -1 * b[18] + this[31] * b[9] * -1)
            target[8] = 1 * (this[8] * b[31] + this[17] * -1 * b[29] * -1 - this[19] * b[28] + this[21] * b[26] + this[26] * b[21] - this[28] * b[19] + this[29] * -1 * b[17] * -1 + this[31] * b[8])
            target[7] = -1 * (this[7] * -1 * b[31] + this[16] * b[29] * -1 - this[19] * b[27] * -1 + this[20] * -1 * b[26] + this[26] * b[20] * -1 - this[27] * -1 * b[19] + this[29] * -1 * b[16] + this[31] * b[7] * -1)
            target[6] = 1 * (this[6] * b[31] + this[16] * b[28] - this[17] * -1 * b[27] * -1 + this[18] * b[26] + this[26] * b[18] - this[27] * -1 * b[17] * -1 + this[28] * b[16] + this[31] * b[6])
            target[5] = 1 * (this[5] * b[31] + this[9] * -1 * b[30] - this[12] * b[29] * -1 + this[14] * -1 * b[28] - this[15] * b[27] * -1 + this[18] * b[25] - this[20] * -1 * b[24] * -1 + this[21] * b[23] + this[23] * b[21] - this[24] * -1 * b[20] * -1 + this[25] * b[18] + this[27] * -1 * b[15] - this[28] * b[14] * -1 + this[29] * -1 * b[12] - this[30] * b[9] * -1 + this[31] * b[5])
            target[4] = -1 * (this[4] * -1 * b[31] + this[8] * b[30] - this[11] * -1 * b[29] * -1 + this[13] * b[28] - this[15] * b[26] + this[17] * -1 * b[25] - this[19] * b[24] * -1 + this[21] * b[22] * -1 + this[22] * -1 * b[21] - this[24] * -1 * b[19] + this[25] * b[17] * -1 + this[26] * b[15] - this[28] * b[13] + this[29] * -1 * b[11] * -1 - this[30] * b[8] + this[31] * b[4] * -1)
            target[3] = 1 * (this[3] * b[31] + this[7] * -1 * b[30] - this[10] * b[29] * -1 + this[13] * b[27] * -1 - this[14] * -1 * b[26] + this[16] * b[25] - this[19] * b[23] + this[20] * -1 * b[22] * -1 + this[22] * -1 * b[20] * -1 - this[23] * b[19] + this[25] * b[16] + this[26] * b[14] * -1 - this[27] * -1 * b[13] + this[29] * -1 * b[10] - this[30] * b[7] * -1 + this[31] * b[3])
            target[2] = -1 * (this[2] * -1 * b[31] + this[6] * b[30] - this[10] * b[28] + this[11] * -1 * b[27] * -1 - this[12] * b[26] + this[16] * b[24] * -1 - this[17] * -1 * b[23] + this[18] * b[22] * -1 + this[22] * -1 * b[18] - this[23] * b[17] * -1 + this[24] * -1 * b[16] + this[26] * b[12] - this[27] * -1 * b[11] * -1 + this[28] * b[10] - this[30] * b[6] + this[31] * b[2] * -1)
            target[1] = 1 * (this[1] * b[31] + this[6] * b[29] * -1 - this[7] * -1 * b[28] + this[8] * b[27] * -1 - this[9] * -1 * b[26] + this[16] * b[21] - this[17] * -1 * b[20] * -1 + this[18] * b[19] + this[19] * b[18] - this[20] * -1 * b[17] * -1 + this[21] * b[16] + this[26] * b[9] * -1 - this[27] * -1 * b[8] + this[28] * b[7] * -1 - this[29] * -1 * b[6] + this[31] * b[1])
            target[0] = 1 * (this[0] * b[31] + this[1] * b[30] - this[2] * -1 * b[29] * -1 + this[3] * b[28] - this[4] * -1 * b[27] * -1 + this[5] * b[26] + this[6] * b[25] - this[7] * -1 * b[24] * -1 + this[8] * b[23] - this[9] * -1 * b[22] * -1 + this[10] * b[21] - this[11] * -1 * b[20] * -1 + this[12] * b[19] + this[13] * b[18] - this[14] * -1 * b[17] * -1 + this[15] * b[16] + this[16] * b[15] - this[17] * -1 * b[14] * -1 + this[18] * b[13] + this[19] * b[12] - this[20] * -1 * b[11] * -1 + this[21] * b[10] - this[22] * -1 * b[9] * -1 + this[23] * b[8] - this[24] * -1 * b[7] * -1 + this[25] * b[6] + this[26] * b[5] - this[27] * -1 * b[4] * -1 + this[28] * b[3] - this[29] * -1 * b[2] * -1 + this[30] * b[1] + this[31] * b[0])
            return target;
        }

        inner(b, target) {
            if (target === undefined)
                target = new Cga()
            target[0] = b[0] * this[0] + b[1] * this[1] + b[2] * this[2] + b[3] * this[3] + b[4] * this[4] - b[5] * this[5] - b[6] * this[6] - b[7] * this[7] - b[8] * this[8] + b[9] * this[9] - b[10] * this[10] - b[11] * this[11] + b[12] * this[12] - b[13] * this[13] + b[14] * this[14] + b[15] * this[15] - b[16] * this[16] - b[17] * this[17] + b[18] * this[18] - b[19] * this[19] + b[20] * this[20] + b[21] * this[21] - b[22] * this[22] + b[23] * this[23] + b[24] * this[24] + b[25] * this[25] + b[26] * this[26] - b[27] * this[27] - b[28] * this[28] - b[29] * this[29] - b[30] * this[30] - b[31] * this[31];
            target[1] = b[1] * this[0] + b[0] * this[1] - b[6] * this[2] - b[7] * this[3] - b[8] * this[4] + b[9] * this[5] + b[2] * this[6] + b[3] * this[7] + b[4] * this[8] - b[5] * this[9] - b[16] * this[10] - b[17] * this[11] + b[18] * this[12] - b[19] * this[13] + b[20] * this[14] + b[21] * this[15] - b[10] * this[16] - b[11] * this[17] + b[12] * this[18] - b[13] * this[19] + b[14] * this[20] + b[15] * this[21] + b[26] * this[22] - b[27] * this[23] - b[28] * this[24] - b[29] * this[25] - b[22] * this[26] + b[23] * this[27] + b[24] * this[28] + b[25] * this[29] - b[31] * this[30] - b[30] * this[31];
            target[2] = b[2] * this[0] + b[6] * this[1] + b[0] * this[2] - b[10] * this[3] - b[11] * this[4] + b[12] * this[5] - b[1] * this[6] + b[16] * this[7] + b[17] * this[8] - b[18] * this[9] + b[3] * this[10] + b[4] * this[11] - b[5] * this[12] - b[22] * this[13] + b[23] * this[14] + b[24] * this[15] + b[7] * this[16] + b[8] * this[17] - b[9] * this[18] - b[26] * this[19] + b[27] * this[20] + b[28] * this[21] - b[13] * this[22] + b[14] * this[23] + b[15] * this[24] - b[30] * this[25] + b[19] * this[26] - b[20] * this[27] - b[21] * this[28] + b[31] * this[29] + b[25] * this[30] + b[29] * this[31];
            target[3] = b[3] * this[0] + b[7] * this[1] + b[10] * this[2] + b[0] * this[3] - b[13] * this[4] + b[14] * this[5] - b[16] * this[6] - b[1] * this[7] + b[19] * this[8] - b[20] * this[9] - b[2] * this[10] + b[22] * this[11] - b[23] * this[12] + b[4] * this[13] - b[5] * this[14] + b[25] * this[15] - b[6] * this[16] + b[26] * this[17] - b[27] * this[18] + b[8] * this[19] - b[9] * this[20] + b[29] * this[21] + b[11] * this[22] - b[12] * this[23] + b[30] * this[24] + b[15] * this[25] - b[17] * this[26] + b[18] * this[27] - b[31] * this[28] - b[21] * this[29] - b[24] * this[30] - b[28] * this[31];
            target[4] = b[4] * this[0] + b[8] * this[1] + b[11] * this[2] + b[13] * this[3] + b[0] * this[4] + b[15] * this[5] - b[17] * this[6] - b[19] * this[7] - b[1] * this[8] - b[21] * this[9] - b[22] * this[10] - b[2] * this[11] - b[24] * this[12] - b[3] * this[13] - b[25] * this[14] - b[5] * this[15] - b[26] * this[16] - b[6] * this[17] - b[28] * this[18] - b[7] * this[19] - b[29] * this[20] - b[9] * this[21] - b[10] * this[22] - b[30] * this[23] - b[12] * this[24] - b[14] * this[25] + b[16] * this[26] + b[31] * this[27] + b[18] * this[28] + b[20] * this[29] + b[23] * this[30] + b[27] * this[31];
            target[5] = b[5] * this[0] + b[9] * this[1] + b[12] * this[2] + b[14] * this[3] + b[15] * this[4] + b[0] * this[5] - b[18] * this[6] - b[20] * this[7] - b[21] * this[8] - b[1] * this[9] - b[23] * this[10] - b[24] * this[11] - b[2] * this[12] - b[25] * this[13] - b[3] * this[14] - b[4] * this[15] - b[27] * this[16] - b[28] * this[17] - b[6] * this[18] - b[29] * this[19] - b[7] * this[20] - b[8] * this[21] - b[30] * this[22] - b[10] * this[23] - b[11] * this[24] - b[13] * this[25] + b[31] * this[26] + b[16] * this[27] + b[17] * this[28] + b[19] * this[29] + b[22] * this[30] + b[26] * this[31];
            target[6] = b[6] * this[0] + b[16] * this[3] + b[17] * this[4] - b[18] * this[5] + b[0] * this[6] - b[26] * this[13] + b[27] * this[14] + b[28] * this[15] + b[3] * this[16] + b[4] * this[17] - b[5] * this[18] + b[31] * this[25] - b[13] * this[26] + b[14] * this[27] + b[15] * this[28] + b[25] * this[31];
            target[7] = b[7] * this[0] - b[16] * this[2] + b[19] * this[4] - b[20] * this[5] + b[0] * this[7] + b[26] * this[11] - b[27] * this[12] + b[29] * this[15] - b[2] * this[16] + b[4] * this[19] - b[5] * this[20] - b[31] * this[24] + b[11] * this[26] - b[12] * this[27] + b[15] * this[29] - b[24] * this[31];
            target[8] = b[8] * this[0] - b[17] * this[2] - b[19] * this[3] - b[21] * this[5] + b[0] * this[8] - b[26] * this[10] - b[28] * this[12] - b[29] * this[14] - b[2] * this[17] - b[3] * this[19] - b[5] * this[21] + b[31] * this[23] - b[10] * this[26] - b[12] * this[28] - b[14] * this[29] + b[23] * this[31];
            target[9] = b[9] * this[0] - b[18] * this[2] - b[20] * this[3] - b[21] * this[4] + b[0] * this[9] - b[27] * this[10] - b[28] * this[11] - b[29] * this[13] - b[2] * this[18] - b[3] * this[20] - b[4] * this[21] + b[31] * this[22] - b[10] * this[27] - b[11] * this[28] - b[13] * this[29] + b[22] * this[31];
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

    Cga.onesWithMinus

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


    e1c = new Cga().fromFloatAndIndex(1., 1)
    e2c = new Cga().fromFloatAndIndex(1., 2)
    e3c = new Cga().fromFloatAndIndex(1., 3)
    ep = new Cga().fromFloatAndIndex(1., 4)
    em = new Cga().fromFloatAndIndex(1., 5) //not modelling, but minus

    e12c = e1c.mul(e2c)
    e23c = e2c.mul(e3c)
    e13c = e1c.mul(e3c)
    e123c = e12c.mul(e3c)

    ep1 = ep.mul(e1c)
    ep2 = ep.mul(e2c)
    ep3 = ep.mul(e3c)
    epm = ep.mul(em)
    em1 = em.mul(e1c)
    em2 = em.mul(e2c)

    epm1 = epm.mul(e1c)
    epm2 = epm.mul(e2c)
    ep12 = ep.mul(e12c)
    em12 = em.mul(e12c)
    epm12 = epm.mul(e12c)

    //alternative name is eo. Looks kinda cooler and we are doing lots of Conformal GA
    eo = ep.sub(em).multiplyScalar(0.5)

    e0c = ep.add(em)
    e01c = e0c.mul(e1c)
    e02c = e0c.mul(e2c)
    e03c = e0c.mul(e3c)
    e012c = e0c.mul(e12c)
    e023c = e0c.mul(e23c)
    e013c = e0c.mul(e13c)
    e031c = e03c.mul(e1c)

    e0123c = e01c.mul(e23c)

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

    

    /*END*/
}