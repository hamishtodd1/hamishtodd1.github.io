// function initChangingParallelStates() {
//     // initialized to 00
//     let state = new ComplexVector(4)
//     state.elements[0].re = 1.

    
    
//     return state
// }

function initChangingQuantumState(state) {
    // let controlsArray = [
    //     pauliX, "t", "g",
    //     pauliY, "i", "k",
    //     pauliZ, "w", "s",
    // ]

    // let dummy4x4 = new ComplexMat(4)
    // let dummyState = new ComplexVector(4)

    // for (let j = 0, jl = controlsArray.length / 3; j < jl; ++j) {
    //     bindButton(controlsArray[j * 3 + 1], () => {
    //         dummy4x4.fromTensorProduct(controlsArray[j*3], identity2x2)
    //         dummy4x4.multiplyColumnVector( state, dummyState )
    //         state.copy(dummyState)
    //         // state.log()
    //     })
    //     bindButton(controlsArray[j * 3 + 2], () => {
    //         dummy4x4.fromTensorProduct(identity2x2, controlsArray[j*3])
    //         dummy4x4.multiplyColumnVector( state, dummyState )
    //         state.copy(dummyState)
    //         // state.log()
    //     })
    // }
}

class ComplexVector {
	constructor(n) {
		if(n === undefined)
			console.error("need to know how many there are!")
		else {
            this.elements = Array(n)
			for(let i = 0; i < n; ++i)
				this.elements[i] = new Complex(0.,0.)
		}
	}

    copy(toBeCopied) {
        for(let i = 0, il = this.elements.length; i < il; ++i)
            this.elements[i].copy(toBeCopied.elements[i])
    }

    log(msg) {
        let str = ""
        for (let i = 0; i < this.elements.length; ++i) {
            if (this.elements[i].re !== 0. || this.elements[i].im !== 0.) {
                if (str !== "")
                    str += " +\n"

                str += this.elements[i].toString()

                let twoDigitBinaryRepOfThisIndex = ""
                for (let j = 0; j < 2; ++j)
                    twoDigitBinaryRepOfThisIndex = ((i & (1 << j)) ? "1" : "0") + twoDigitBinaryRepOfThisIndex
                str += " |" + twoDigitBinaryRepOfThisIndex + ">"
            }
        }

        if (msg !== undefined)
            str = msg + ": " + str

        log(str)
    }

	// multiplyOneEntry(input, ourIndex, inputIndex, target, targetIndex) {
	// 	let a = this.re(ourIndex)
	// 	let b = this.im(ourIndex)

	// 	let c = input.re(inputIndex)
	// 	let d = input.im(inputIndex)

	// 	target.setRe(targetIndex, (a * c - b * d))
	// 	target.setIm(targetIndex, (c * b + a * d))
	// }

	// tensorProduct(b) {
	// 	let a = this
	// 	let ret = new ComplexVector(a.length * b.length / 4)
	// 	for (let i = 0, il = a.length / 2; i < il; ++i) {
	// 		for (let j = 0, jl = b.length / 2; j < jl; ++j) {
	// 			a.multiplyOneEntry(b, i, j, ret, i * jl + j)
	// 		}
	// 	}

	// 	return ret
	// }
}

class ComplexMat {

    constructor(dim,values) {
        this.dim = dim

        this.elements = Array(dim*dim)
        for (let i = 0; i < this.dim; ++i) {
            for (let j = 0; j < this.dim; ++j) {
                this.elements[i * this.dim + j] = new Complex()
            }
        }
        
        if(values!==undefined) {
            this.forEachElement((row, col, element) => {
                let pairIndex = col + this.dim * row //reversed because row-major input
                element.set(values[pairIndex][0], values[pairIndex][1])
            })
        }
    }

    get(row, col) {
        return this.elements[col * this.dim + row]
    }
    set(row, col, val) {
        this.elements[col * this.dim + row].copy(val)
    }

	copy(m) {
		this.forEachElement((row,col,el)=>{
			el.copy(m.get(row,col))
		})
	}

	multiplyScalar(scalar) {
		this.forEachElement((row, col, el) => {
			el.re *= scalar
			el.im *= scalar
		})
	}

    forEachElement(func) {
        for(let row = 0; row < this.dim; ++row) {
            for(let col = 0; col < this.dim; ++col) {
                func(row, col, this.get(row,col))
            }
        }
    }

    log() {
        for (let row = 0; row < this.dim; ++row) {
            let str = ""
            for (let col = 0; col < this.dim; ++col ) {
                str += this.get(row, col).toString()
                if(col < this.dim - 1)
                    str += ", "
            }
            log(str)
        }
    }

    tensor(m2, target) {
        if(target === undefined)
            target = new ComplexMat(this.dim * m2.dim)

        target.fromTensorProduct(this,m2)
        return target
    }

    fromTensorProduct(m1, m2) {
        if (this.dim !== m1.dim * m2.dim)
            console.error("dimensions mismatch:", this.dim, m1.dim, m2.dim)

        const dummy = new Complex()
        m1.forEachElement( (row1, col1, element1) => {
            m2.forEachElement( (row2, col2, element2) => {
                element1.mul(element2,dummy)
                this.set(
                    row1*m2.dim + row2,
                    col1*m2.dim + col2, dummy )
            })
        })

        return this
    }

    wolframAlphaStyle() {
        let str = "["
        for(let i = 0; i < this.dim; ++i) {
            str += "["
            for(let j = 0; j < this.dim; ++j) {
                str += this.get(j,i).toString()
                if(j < this.dim-1)
                    str += ","
            }
            str += "]"

            if (i < this.dim - 1)
                str += ","
        }
        str += "]"

        log(str)
    }

    multiplyColumnVector(v, target) {
        let dim = v.elements.length
        if (this.elements.length !== dim * dim)
            console.error("matrix size mismatch!", dim, this.elements.length)

        if (target === undefined)
            target = new ComplexVector(dim)

        for (let i = 0; i < dim; ++i)
            target.elements[i].set(0., 0.)

        const dummy = new Complex()
        this.forEachElement((row, col, element) => {
            element.mul(v.elements[col], dummy)
            target.elements[row].add(dummy)
        })

        return target
    }

	mul(rightMultiple,target) {
        if(target === undefined)
            target = new ComplexMat(this.dim)

		let temp = new Complex()

		for(let targRow = 0; targRow < this.dim; ++targRow) {
			for (let targColumn = 0; targColumn < this.dim; ++targColumn) {
				let targ = target.get(targRow,targColumn)
				targ.set(0.,0.)
				
				for(let k = 0; k < this.dim; ++k) {
					let ourC = this.get(targRow, k )
                    let rightMultipleC = rightMultiple.get(k, targColumn)
                    ourC.mul(rightMultipleC, temp)
					targ.add(temp)
				}
			}
		}

        return target
	}

    //they're unitary
    getInverse(target) {
        if (target === undefined)
            target = new ComplexMat(this.dim)

        let temp = new Complex()
        for (let row = 0; row < this.dim; ++row) {
            for (let col = 0; col < this.dim; ++col) {
                temp.copy(this.get(row, col))
                temp.im *= -1.
                target.set(col, row, temp)
            }
        }

        // delete temp

        return target
    }

    sandwichBetween(a,target) {
        if (target === undefined)
            target = new ComplexMat(this.dim)

        if(a.dim !== this.dim || this.dim !== target.dim)
            console.error("that's not going to go well!")

        let intermediate = new ComplexMat(this.dim)
        a.mul(this,intermediate)
        let temp = new ComplexMat(this.dim)
        a.getInverse(temp)
        intermediate.mul(temp,target)

        // delete temp
        // delete intermediate

        return target
    }

    add(a, target) {
        if (target === undefined)
            target = new ComplexMat(this.dim)
        
        let temp = new Complex()
        this.forEachElement((row,col,val)=>{
            temp.re = val.re + a.get(row,col).re
            temp.im = val.im + a.get(row,col).im
            target.set(row,col,temp)
        })

        return target
    }
}

// xti = pauliX.tensor(identity2x2)
// yti = pauliY.tensor(identity2x2)
// zti = pauliZ.tensor(identity2x2)
// itx = identity2x2.tensor(pauliX)
// ity = identity2x2.tensor(pauliY)
// itz = identity2x2.tensor(pauliZ)



class Complex {

	constructor(re,im) {
		this.re = re === undefined ? 0. : re
		this.im = im === undefined ? 0. : im
	}

	clone() {
		return new Complex(this.re, this.im)
	}

	copy(toBeCopied) {
		this.re = toBeCopied.re
		this.im = toBeCopied.im
		return this
	}

	toString() {
		if (this.re !== 0. && this.im === 0.)
			return this.re.toFixed(1)
		else if (this.re === 0. && this.im !== 0.)
			return this.im.toFixed(1) + "i"
		else if (this.re !== 0. && this.im !== 0.)
			return "(" + this.re.toFixed(1) + "+" + this.im.toFixed(1) + "i)"
		else
			return "0.0"
	}

	squaredMagnitude() {
		return this.re * this.re + this.im * this.im
	}

	magnitude() {
		return Math.sqrt(this.squaredMagnitude())
	}

	set(re,im) {
		this.re = re
		this.im = im
	}

	getConjugate(target) {
		if(target === undefined)
			target = new Complex()
		target.copy(this)
		target.im *= -1.

		return target
	}

	add(c) {
		this.re += c.re
		this.im += c.im
	}
	sub(c) {
		this.re -= c.re
		this.im -= c.im
	}

	mul(c,target) {
		if (target === undefined)
			target = new Complex()
		target.re = this.re * c.re - this.im * c.im
		target.im = this.re * c.im + this.im * c.re

        return target
	}

    log() {
        console.log(this.toString())
    }
}

const c1 = new Complex()
const c2 = new Complex()
const c3 = new Complex()
const c4 = new Complex()
const c5 = new Complex()
const c6 = new Complex()

cnot = new ComplexMat(4, [
    [1., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [1., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [1., 0.],
    [0., 0.], [0., 0.], [1., 0.], [0., 0.],
])

swap = new ComplexMat(4, [
    [1., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [1., 0.], [0., 0.],
    [0., 0.], [1., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [1., 0.],
])

function ps(theta) {
    return new ComplexMat(2,[
        [1., 0.], [0., 0.],
        [0., 0.], [Math.cos(theta), Math.sin(theta)],
    ])
}

function rx(theta) {
    return new ComplexMat(2, [
        [Math.cos(theta/2.), 0.], [0.,-Math.sin(theta/2.)],
        [0.,-Math.sin(theta/2.)], [ Math.cos(theta/2.), 0.],
    ])
}

function ry(theta) {
    return new ComplexMat(2, [
        [Math.cos(theta/2.), 0.], [-Math.sin(theta/2.), 0.],
        [Math.sin(theta/2.), 0.], [ Math.cos(theta/2.), 0.],
    ])
}

function rz(theta) {
    return new ComplexMat(2, [
        [Math.cos(-theta/2.), Math.sin(-theta/2.)], [0., 0.],
        [0., 0.], [Math.cos(theta/2.), Math.sin(theta/2.)],
    ])
}

identity2x2 = new ComplexMat(2, [
    [1., 0.], [0., 0.],
    [0., 0.], [1., 0.],
])
pauliX = new ComplexMat(2, [
    [0., 0.], [1., 0.],
    [1., 0.], [0., 0.],
])
pauliY = new ComplexMat(2, [
    [0., 0.], [0., -1.],
    [0., 1.], [0., 0.],
])
pauliZ = new ComplexMat(2, [
    [1., 0.], [0., 0.],
    [0., 0.], [-1., 0.],
])

hadamard = new ComplexMat(2, [
    [1. / Math.SQRT2, 0.], [1. / Math.SQRT2, 0.],
    [1. / Math.SQRT2, 0.], [-1. / Math.SQRT2, 0.],
])
