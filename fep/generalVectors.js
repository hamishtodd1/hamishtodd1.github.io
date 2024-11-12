function initGeneralVectors() {

    class GeneralVector extends Float32Array {

        randomize() {
            for (let i = 0, il = this.length; i < il; ++i)
                this[i] = Math.random() * 2. - 1.
            return this
        }


        lerpSelf(b, alpha) {
            this.lerp(b, alpha, this)
            return this
        }

        reverse() {
            console.error("you mean getReverse!")
        }

        lerp(toLerpTo, alpha, target) {
            if (target === undefined)
                target = new this.constructor()

            if (this.constructor !== toLerpTo.constructor || this.constructor !== target.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0, il = this.length; i < il; ++i)
                target[i] = this[i] + alpha * (toLerpTo[i] - this[i])

            return target
        }

        isZero() {
            let ret = true
            for (let i = 0, il = this.length; i < il; ++i)
                if (this[i] !== 0.)
                    ret = false
            return ret
        }

        selectGrade(desiredGrade, target) {
            if (target === undefined)
                target = new this.constructor()

            if (this.constructor !== target.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0, il = this.length; i < il; ++i) {
                if (this.constructor.indexGrades[i] === desiredGrade)
                    target[i] = this[i]
                else
                    target[i] = 0.
            }

            return target
        }

        //0 is grade -1, and mixtures of any kind are grade -2
        //mathematically, 0 is of all grades
        grade() {
            let grade = -1 //0 is grade -1!
            for (let i = 0, il = this.length; i < il; ++i) {
                if (this[i] !== 0.) {
                    let extraGrade = this.constructor.indexGrades[i]
                    if (grade === -1)
                        grade = extraGrade
                    else if (grade !== extraGrade) //it's some kind of combination. Hopefully a rotor
                        grade = -2
                }
            }

            return grade
        }

        set() {
            if (arguments.length !== this.length)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0, il = arguments.length; i < il; ++i)
                this[i] = arguments[i]
            return this
        }

        zero() {
            for (let i = 0, il = this.length; i < il; ++i)
                this[i] = 0.
            return this
        }

        lowestNonzero() {
            for (let i = 0, il = this.length; i < il; ++i)
                if (this[i] !== 0.)
                    return i
            return -1
        }

        fromFloatAndIndex(float, index) {
            for (let i = 0, il = this.length; i < il; ++i) {
                if (i === index)
                    this[i] = float
                else
                    this[i] = 0.
            }
            return this
        }

        multiplyScalar(s, target) {
            if (target === undefined) {
                console.error("no target at " + getWhereThisWasCalledFrom(1))
                target = new this.constructor()
            }

            if (this.constructor !== target.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0, il = this.length; i < il; ++i)
                target[i] = s * this[i]

            return target
        }

        copy(b) {
            if (this.constructor !== b.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0, il = this.length; i < il; ++i)
                this[i] = b[i]

            return this
        }

        clone() {
            let cl = new this.constructor()
            //also the planes lines and points' magnitude should be on the thingy
            cl.copy(this)

            return cl
        }

        equals(b) {
            if (this.constructor !== b.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            let ret = true
            for (let i = 0, il = this.length; i < il; ++i) {
                if (this[i] !== b[i])
                    ret = false
            }
            return ret
        }

        approxEquals(b) {
            if (this.constructor !== b.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            let doesEqual = true
            for (let i = 0, il = this.length; i < il; ++i) {
                if (Math.abs(this[i] - b[i]) > .0001)
                    doesEqual = false
            }
            return doesEqual
        }

        fromArray(arr) {
            for (let i = 0, il = this.length; i < il; ++i)
                this[i] = arr[i]

            return this
        }

        toArray(arr, offset) {
            if (offset === undefined)
                offset = 0

            for (let i = 0, il = this.length; i < il; ++i)
                arr[offset * il + i] = this[i]

            return arr
        }

        add(a, target) {

            if (target === undefined)
                target = new this.constructor()

            if (a.constructor !== target.constructor || this.constructor !== target.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0, il = this.length; i < il; ++i)
                target[i] = this[i] + a[i]

            return target
        }

        sub(a, target) {

            if (target === undefined)
                target = new this.constructor()

            if (this.constructor !== a.constructor || this.constructor !== target.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0, il = this.length; i < il; ++i)
                target[i] = this[i] - a[i]

            return target
        }

        addScaled(v, scale, target) {

            if (target === undefined)
                target = new this.constructor()

            if (this.constructor !== v.constructor || this.constructor !== target.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0, il = this.length; i < il; ++i)
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

            for (let i = 0, il = this.length; i < il; ++i)
                target[i] = -1. * this[i]

            return target
        }

        toString(numDecimalPlaces) {
            if (numDecimalPlaces === undefined)
                numDecimalPlaces = 1

            let str = ""
            for (let i = 0, il = this.length; i < il; ++i) {

                if (Math.abs(this[i]) > 0.05 || isNaN(this[i])) { // && this[i].toFixed() != 0) {

                    if (str !== "")
                        str += " + "

                    let numString = this[i].toString()
                    if (numString.length > numDecimalPlaces)
                        numString = this[i].toFixed(numDecimalPlaces)

                    let basisName = this.constructor.basisNames[i]

                    let e0Replacers = this.constructor.e0Replacers
                    if (e0Replacers !== undefined &&
                        e0Replacers[i] !== null &&
                        this[e0Replacers[i][0]] === this[e0Replacers[i][1]]) {
                        basisName = e0Replacers[i][2]
                        ++i
                    }

                    str += numString + (basisName === `` ? `` : `e`) + basisName
                }
            }

            if (str === ``)
                str += `0.`

            return str
        }
    }
    window.GeneralVector = GeneralVector
}