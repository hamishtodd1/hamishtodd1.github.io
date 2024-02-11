function init31() {

    class Cga2d extends Float32Array {

        constructor() {
            super(16)
        }

        ppToDqLine(target) {

            target.zero()
            target[5] = -this[5]
            target[1] = -.5 * (this[6] + this[7])
            target[3] = -.5 * (this[8] + this[9])

            return target
        }

        sandwich(a, target) {

            let intermediate = this.mul(a, cgaA)
            let thisReverse = this.getReverse(cgaB)
            return intermediate.mul(thisReverse, target)
        }

        tangentVector(xPos, yPos, xDir, yDir) {

            this.zero()
            this.addScaled(e1oCga, xDir/2., this)
            this.addScaled(e2oCga, yDir/2., this)

            let myTranslator = cgaC.translatorToXy(xPos, yPos)
            return myTranslator.sandwich(this, this)
        }

        zeroRadiusCircle(x,y) { //zero radius circle

            let myTranslator = cgaF
            myTranslator.translatorToXy(x,y)
            return myTranslator.sandwich(eoCga,this)
        }

        translatorToXy(x,y) {

            this.zero()
            this[0] = 1.
            //e0 = e3+e4
            //e10 = e13+e14 //NOTE NOT e01! So no negation
            this.addScaled(e10Cga, x/2., this)
            this.addScaled(e20Cga, y/2., this)

            return this
        }

        log(label, numDecimalPlaces) {
            let str = this.toString(label, numDecimalPlaces)

            if (label !== undefined)
                str = label + ": " + str
            else {
                label = getWhereThisWasCalledFrom()
                str = label + ": " + str
            }

            console.log(str)
        }

        toString(numDecimalPlaces) {
            if (numDecimalPlaces === undefined)
                numDecimalPlaces = 1

            let str = ""
            for (let i = 0; i < 16; ++i) {

                if (Math.abs(this[i]) > 0.05 || isNaN(this[i])) { // && this[i].toFixed() != 0) {

                    if (str !== "")
                        str += " + "

                    let numString = this[i].toString()
                    if (numString.length > numDecimalPlaces)
                        numString = this[i].toFixed(numDecimalPlaces)

                    let basisName = this.constructor.basisNames[i]
                    str += numString + (basisName === `` ? `` : `e`) + basisName
                }
            }

            if (str === ``)
                str += `0.`

            return str
        }

        addScaled(a, scalar,target) {
            for(let i = 0; i < 16; ++i)
                target[i] = this[i] + scalar * a[i]
            return target
        }

        zero() {
            for(let i = 0; i < 16; ++i)
                this[i] = 0.
        }

        getReverse(target) {
            target[0] = this[0]; target[1] = this[1]; target[2] = this[2]; target[3] = this[3]; target[4] = this[4]; target[5] = -this[5]; target[6] = -this[6]; target[7] = -this[7]; target[8] = -this[8]; target[9] = -this[9]; target[10] = -this[10]; target[11] = -this[11]; target[12] = -this[12]; target[13] = -this[13]; target[14] = -this[14]; target[15] = this[15];
            return target;
        }

        getDual(target) {
            target[0] = -this[15]; target[1] = -this[14]; target[2] = this[13]; target[3] = -this[12]; target[4] = -this[11]; target[5] = this[10]; target[6] = -this[9]; target[7] = -this[8]; target[8] = this[7]; target[9] = this[6]; target[10] = -this[5]; target[11] = this[4]; target[12] = this[3]; target[13] = -this[2]; target[14] = this[1]; target[15] = this[0];
            return target;
        }

        mul(b, target) {

            if (target === undefined)
                target = new Cga2d()

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
            return target;
        }

        meet(b, target) {

            if(target === undefined)
                target = new Cga2d()

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
                target = new Cga2d()

            target[15] = 1 * (this[15] * b[15]);
            target[14] = -1 * (this[14] * -1 * b[15] + this[15] * b[14] * -1);
            target[13] = 1 * (this[13] * b[15] + this[15] * b[13]);
            target[12] = -1 * (this[12] * -1 * b[15] + this[15] * b[12] * -1);
            target[11] = 1 * (this[11] * b[15] + this[15] * b[11]);
            target[10] = 1 * (this[10] * b[15] + this[13] * b[14] * -1 - this[14] * -1 * b[13] + this[15] * b[10]);
            target[9] = -1 * (this[9] * -1 * b[15] + this[12] * -1 * b[14] * -1 - this[14] * -1 * b[12] * -1 + this[15] * b[9] * -1);
            target[8] = 1 * (this[8] * b[15] + this[11] * b[14] * -1 - this[14] * -1 * b[11] + this[15] * b[8]);
            target[7] = 1 * (this[7] * b[15] + this[12] * -1 * b[13] - this[13] * b[12] * -1 + this[15] * b[7]);
            target[6] = -1 * (this[6] * -1 * b[15] + this[11] * b[13] - this[13] * b[11] + this[15] * b[6] * -1);
            target[5] = 1 * (this[5] * b[15] + this[11] * b[12] * -1 - this[12] * -1 * b[11] + this[15] * b[5]);
            target[4] = -1 * (this[4] * -1 * b[15] + this[7] * b[14] * -1 - this[9] * -1 * b[13] + this[10] * b[12] * -1 + this[12] * -1 * b[10] - this[13] * b[9] * -1 + this[14] * -1 * b[7] + this[15] * b[4] * -1);
            target[3] = 1 * (this[3] * b[15] + this[6] * -1 * b[14] * -1 - this[8] * b[13] + this[10] * b[11] + this[11] * b[10] - this[13] * b[8] + this[14] * -1 * b[6] * -1 + this[15] * b[3]);
            target[2] = -1 * (this[2] * -1 * b[15] + this[5] * b[14] * -1 - this[8] * b[12] * -1 + this[9] * -1 * b[11] + this[11] * b[9] * -1 - this[12] * -1 * b[8] + this[14] * -1 * b[5] + this[15] * b[2] * -1);
            target[1] = 1 * (this[1] * b[15] + this[5] * b[13] - this[6] * -1 * b[12] * -1 + this[7] * b[11] + this[11] * b[7] - this[12] * -1 * b[6] * -1 + this[13] * b[5] + this[15] * b[1]);
            target[0] = 1 * (this[0] * b[15] + this[1] * b[14] * -1 - this[2] * -1 * b[13] + this[3] * b[12] * -1 - this[4] * -1 * b[11] + this[5] * b[10] - this[6] * -1 * b[9] * -1 + this[7] * b[8] + this[8] * b[7] - this[9] * -1 * b[6] * -1 + this[10] * b[5] + this[11] * b[4] * -1 - this[12] * -1 * b[3] + this[13] * b[2] * -1 - this[14] * -1 * b[1] + this[15] * b[0]);
            return target;
        }

        inner(b, target) {

            if (target === undefined)
                target = new Cga2d()

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
    }
    Cga2d.basisNames = [
        ``, `1`, `2`, `p`, `m`, `12`, `1p`, `1m`, `2p`, `2m`, `pm`, `12p`, `12m`, `1pm`, `2pm`, `12pm`
    ]

    let eoCga = new Cga2d()
    eoCga[3] = 1.
    eoCga[4] = -1.
    let e0Cga = new Cga2d()
    e0Cga[3] = 1.
    e0Cga[4] = 1.
    let ptAtInf = e0Cga.getDual(new Cga2d())

    let e1Cga = new Cga2d(); e1Cga[1] = 1.
    let e2Cga = new Cga2d(); e2Cga[2] = 1.
    let e10Cga = e1Cga.meet(e0Cga, new Cga2d())
    let e20Cga = e2Cga.meet(e0Cga, new Cga2d())
    let e1oCga = e1Cga.meet(eoCga, new Cga2d())
    let e2oCga = e2Cga.meet(eoCga, new Cga2d())

    // log(e0Cga.meet(e1Cga))
    // log(e0Cga.meet(e2Cga))

    let e12Cga = new Cga2d()
    e12Cga[5] = 1.

    //goal is to be given three points or two points and a direction
    //and find the circle that goes through them
    //then get the rotation going along the correct arc of that circle, as a dq
    //For now, just done with line segments

    //but, maybe want a limit on the radius there

    let cgaA = new Cga2d()
    let cgaB = new Cga2d()
    let cgaC = new Cga2d()
    let cgaD = new Cga2d()
    let cgaE = new Cga2d()
    let cgaF = new Cga2d()

    let cga0 = new Cga2d()
    let cga1 = new Cga2d()
    let cga2 = new Cga2d()
    let cga3 = new Cga2d()
    let cga4 = new Cga2d()
    let cga5 = new Cga2d()
    let cga6 = new Cga2d()

    let zrcA = new Cga2d()
    let zrcB = new Cga2d()
    let zrcC = new Cga2d()
    let zrpp = new Cga2d()

    function circleToDqLine(circle,target) {
        circle.inner(ptAtInf, retPp)
        return retPp.ppToDqLine(target)
    }
        
    let retPp = new Cga2d()
    rotationAxisFromDirAndPoints = (d,a,b, target) => {
        
        zrcA.zeroRadiusCircle( a.x, a.z )
        zrcB.zeroRadiusCircle( b.x, b.z )
        zrpp.tangentVector( a.x, a.z, d.x, d.z )

        let circle = zrpp.meet(zrcB, cga0).getDual(cga1)
        return circleToDqLine(circle, target)
    }
    
    //test
    // rotationAxisFromDirAndPoints(
    //     1.,0., 
    //     0., 1., 
    //     1., 0., dq0)
    // dq0.log()
    

    rotationAxisFromPoints = (a,b,c, target) => {

        zrcA.zeroRadiusCircle( a.x, a.z )
        zrcB.zeroRadiusCircle( b.x, b.z )
        zrcC.zeroRadiusCircle( c.x, c.z )

        let circle = zrcA.meet(zrcB, cga0).meet(zrcC, cga1).getDual(cga2)
        return circleToDqLine(circle, target)
    }

    let centralAxis = new Dq()
    let inputsPos = new Fl()
    let outputPos = new Fl()
    getDesiredCenter = (c) => {

        let dls = c.dottedLines
        outputPos.pointFromGibbsVec(dls[0].position)
        fl0.pointFromGibbsVec(dls[1].position).add(fl0.pointFromGibbsVec(dls[2].position), inputsPos)
        inputsPos.multiplyScalar(.5,inputsPos)

        let isLargishCircle = inputsPos.distanceToPt(outputPos) > .0001
        // log(isLargishCircle)

        rotationAxisFromPoints( dls[0].position,dls[1].position,dls[2].position, centralAxis )
        let circleCenter = centralAxis.meet(e2, fl0)
        if (circleCenter[7] !== 0.) {
            circleCenter.pointToGibbsVec(c.opBg.position)
        }
        else {
            circleCenter.directionToGibbsVec(c.opBg.position)
            c.opBg.position.negate().normalize()
        }
    }

    testCircuits = () => {

        let viz1 = new DqViz(0xFF0000)
        viz1.dq.copy(Translator(.3, 0., 0.))

        let viz2 = new DqViz(0xFF00FF)
        viz2.dq.copy(Translator(0., .2, 0.))

        let viz3 = new DqViz()
        viz3.affecters[0] = viz2
        viz3.affecters[1] = viz1
        viz3.affecters[2] = 1

        debugUpdates.push( () => {
            // viz2.markupPos.point(0., 1.2, Math.sin(frameCount * .004))
        })
    }
}