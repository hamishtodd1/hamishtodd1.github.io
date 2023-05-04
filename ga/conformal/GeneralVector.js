function getWhereThisWasCalledFrom(depth) {
    let actualDepth = (depth || 0) + 3
    let splitIntoLines = Error().stack.split("\n")
    if (actualDepth >= splitIntoLines.length)
        actualDepth = splitIntoLines.length - 1
    let lineOfStackTrace = splitIntoLines[actualDepth]

    let splitBySlash = lineOfStackTrace.split("/")
    let stillGotColons = splitBySlash[splitBySlash.length - 1]
    let splitByColons = stillGotColons.split(":")
    return splitByColons[0] + ":" + splitByColons[1]
}

class GeneralVector extends Float32Array {
        
    set() {
        return this.copy(arguments)
    }

    zero() {
        for (let i = 0; i < this.constructor.size; ++i)
            this[i] = 0.
        return this
    }

    lowestNonzero() {
        for (let i = 0; i < this.constructor.size; ++i)
            if (this[i] !== 0.)
                return i
        return -1
    }

    fromFloatAndIndex(float, index) {
        for(let i = 0; i < this.constructor.size; ++i) {
            if(i === index)
                this[i] = float
            else
                this[i] = 0.
        }
        return this
    }

    multiplyScalar(s) {
        for (let i = 0; i < this.constructor.size; ++i)
            this[i] *= s

        return this
    }

    copy(a) {
        for (let i = 0; i < this.constructor.size; ++i)
            this[i] = a[i]

        return this
    }

    clone() {
        let cl = new this.constructor()
        //also the planes lines and points' magnitude should be on the thingy
        cl.copy(this)

        return cl
    }

    equals(a) {
        let ret = true
        for (let i = 0; i < this.constructor.size; ++i) {
            if (this[i] !== a[i])
                ret = false
        }
        return ret
    }

    approxEquals(a) {
        let doesEqual = true
        for (let i = 0; i < this.constructor.size; ++i) {
            if (Math.abs(this[i] - a[i]) > .0001)
                doesEqual = false
        }
        return doesEqual
    }

    fromArray(arr) {
        for (let i = 0; i < this.constructor.size; ++i)
            this[i] = arr[i]

        return this
    }

    toArray(arr) {
        for (let i = 0; i < this.constructor.size; ++i)
            arr[i] = this[i]

        return arr
    }

    // fromMv(mv) {
    //     for (let i = 0; i < this.constructor.size; ++i)
    //         this[i] = mv[this.constructor.mvOffsets[i]]

    //     return this
    // }

    // toMv(target) {
    //     if (target === undefined)
    //         target = new Mv()
            
    //     target.zero()
    //     for (let i = 0; i < this.constructor.size; ++i)
    //         target[this.constructor.mvOffsets[i]] = this[i]

    //     return target
    // }

    add(a,target) {
        if(target === undefined)
            target = new this.constructor()

        for(let i = 0; i < this.constructor.size; ++i)
            target[i] = this[i] + a[i]
        return target
    }
    sub(a, target) {
        if (target === undefined)
            target = new this.constructor()

        for (let i = 0; i < this.constructor.size; ++i)
            target[i] = this[i] - a[i]
        return target
    }

    addScaled(v, scale, target) { //want to add it to itself? Then specify itself!
        if(target === undefined)
            target = new this.constructor()

        for (let i = 0; i < this.constructor.size; ++i)
            target[i] = this[i] + scale * v[i]
        return target
    }

    log(label, numDecimalPlaces) {
        if (numDecimalPlaces === undefined)
            numDecimalPlaces = 1

        let str = ""
        for (let i = 0; i < this.constructor.basisNames.length; ++i) {
            if (Math.abs(this[i]) > 0.05) { // && this[i].toFixed() != 0) {
                if (str !== "")
                    str += " + "

                let sign = 1.
                // if (this.constructor.onesWithMinus.indexOf(this.constructor.basisNames[i]) !== -1)
                //     sign = -1.

                str += (sign * this[i]).toFixed(numDecimalPlaces) + (i !== 0 ? "e" : "") + this.constructor.basisNames[i]
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
}