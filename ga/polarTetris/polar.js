/*
    A given square is a bunch of

    A line segment is a pair of points connected by part of a line
    Dual to that is a pair of lines with a little angle thing in them
    A square has 4 line segments with a winding order. The "inner part" is on one side of all of them

    Make the squares broken up into lots and lots of little points
 */

function init201() {

    class Pga extends Float32Array {
        constructor() {
            super(8)
        }

        line(x, y, d) {
            this[1] = d
            this[2] = x
            this[3] = y
        }

        pointFromVec(vec) {
            this[6] = 1.
            this[5] = vec.x
            this[4] = vec.y
            return this
        }

        pointToVec(target) {
            target.x = this[5] / this[6]
            target.y = this[4] / this[6]
            target.z = 0.
            return target
        }

        meet(b,target) {
            target[0] = b[0] * this[0]
            target[1] = b[1] * this[0] + b[0] * this[1]
            target[2] = b[2] * this[0] + b[0] * this[2]
            target[3] = b[3] * this[0] + b[0] * this[3]
            target[4] = b[4] * this[0] + b[2] * this[1] - b[1] * this[2] + b[0] * this[4]
            target[5] = b[5] * this[0] - b[3] * this[1] + b[1] * this[3] + b[0] * this[5]
            target[6] = b[6] * this[0] + b[3] * this[2] - b[2] * this[3] + b[0] * this[6]
            target[7] = b[7] * this[0] + b[6] * this[1] + b[5] * this[2] + b[4] * this[3] + b[3] * this[4] + b[2] * this[5] + b[1] * this[6] + b[0] * this[7]

            return target
        }

        dual(target) {
            target[0] = this[7]
            target[1] = this[6]
            target[2] = this[5]
            target[3] = this[4]
            target[4] = this[3]
            target[5] = this[2]
            target[6] = this[1]
            target[7] = this[0]
            return target
        }
    }
    window.Pga = Pga
}