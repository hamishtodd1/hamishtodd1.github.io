class GeneralVector extends Float32Array {

    set() {
        return this.copy(arguments)
    }

    fromLerp(a, b, t) {
        for (let i = 0; i < this.constructor.size; ++i)
            this[i] = a[i] + t * (b[i] - a[i])

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

    fromMv(mv) {
        for (let i = 0; i < this.constructor.size; ++i)
            this[i] = mv[this.constructor.mvOffsets[i]]

        return this
    }

    toMv(target) {
        if (target === undefined)
            target = new Mv()

        target.copy(zeroMv)
        for (let i = 0; i < this.constructor.size; ++i)
            target[this.constructor.mvOffsets[i]] = this[i]

        return target
    }

    add(a, target) {
        if (target === undefined)
            target = new Mv()

        for (let i = 0; i < this.constructor.size; ++i)
            target[i] = this[i] + a[i]
        return target
    }
    sub(a, target) {
        if (target === undefined)
            target = new Mv()

        for (let i = 0; i < this.constructor.size; ++i)
            target[i] = this[i] - a[i]
        return target
    }
    
    addScaled(a, s) {
        for (let i = 0; i < this.constructor.size; ++i)
            this[i] = this[i] + a[i] * s
        return this
    }
}
window.GeneralVector = GeneralVector

class ScalarMv extends GeneralVector {
    static get mvOffsets() { return [0] }
    static get size() { return 1 }

    constructor() {
        return super(1)
    }
}
window.ScalarMv = ScalarMv