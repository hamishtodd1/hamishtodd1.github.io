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

                let binaryRepOfThisIndex = ""
                let numBinaryDigits = Math.log2(this.elements.length)
                for (let j = 0; j < numBinaryDigits; ++j)
                    binaryRepOfThisIndex = ((i & (1 << j)) ? "1" : "0") + binaryRepOfThisIndex
                str += " |" + binaryRepOfThisIndex + ">"
            }
        }

        if(str === "")
            str += "0."

        if (msg !== undefined)
            str = msg + ": " + str

        log(str)
    }

    applyMatrix(m) {
        let tempVec = new ComplexVector(this.elements.length)

        let tempComplex = new Complex()
        for(let i = 0; i < this.elements.length; ++i) {
            //i is the column in the matrix, the row in the vector
            tempVec.elements[i].set(0.,0.)
            for(let j = 0; j < this.elements.length; ++j) {
                let matEl = m.get(j,i)
                matEl.mul(this.elements[j],tempComplex)
                // log(i, j, tempComplex)
                tempVec.elements[i].add(tempComplex)
            }
        }
        
        this.copy(tempVec)

        return this
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

// function svd2x2(a,b,c,d) {
//     z0.absoluteSquare() + z1.absoluteSquare() + z2.absoluteSquare() + z3.absoluteSquare()

//     //this looks extremely geometric algebra
//     let secondPart = 
//         z0.mul(z1.getConjugate(c0), c1).re +
//         z0.mul(z2.getConjugate(c0), c1).re +
//         z0.mul(z3.getConjugate(c0), c1).re +
//         z1.mul(z2.getConjugate(c0), c1).im +
//         z2.mul(z3.getConjugate(c0), c1).im +
//         z3.mul(z1.getConjugate(c0), c1).im
// }

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
        return this
	}

    clone() {
        let newMat = new ComplexMat(this.dim)
        newMat.copy(this)
        return newMat
    }

	multiplyScalar(scalar) {
		this.forEachElement((row, col, el) => {
			el.re *= scalar
			el.im *= scalar
		})
	}

    transpose(target) {
        this.forEachElement((row, col, el)=>{
            target.get(col,row).copy(el)
        })
    }

    forEachElement(func) {
        for(let row = 0; row < this.dim; ++row) {
            for(let col = 0; col < this.dim; ++col) {
                func(row, col, this.get(row,col))
            }
        }
    }

    log(msg) {
        if(msg !== undefined)
            log(msg)
            
        for (let row = 0; row < this.dim; ++row) {
            let str = ""
            for (let col = 0; col < this.dim; ++col ) {
                str += this.get(row, col).toString()
                if(col < this.dim - 1)
                    str += ", "
            }

            if (str === "")
                str += "0."

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

    similarTo(m) {
        let ret = true
        this.forEachElement(( row, col, el)=>{
            let elM = m.get(row, col)
            if( Math.abs(el.re - elM.re ) > 0.01 ||
                Math.abs(el.im - elM.im ) > 0.01 )
                ret = false
        })
        return ret
    }

    logEffect(val1,val2) {
        if(val1 === undefined) {
            val1 = 0
            val2 = 0
        }

        let v = new ComplexVector(4)
        v.elements[val2 + val1 * 2].re = 1.

        v.applyMatrix(this).log()
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

    approximatelyEquals(c) {
        const eps = .00001
        return  Math.abs(this.re - c.re) < eps &&
                Math.abs(this.im - c.im) < eps
    }

	squaredMagnitude() {
		return this.re * this.re + this.im * this.im
	}

    absoluteSquare() {
        return this.squaredMagnitude()
    }

	magnitude() {
		return Math.sqrt(this.squaredMagnitude())
	}

	set(re,im) {
		this.re = re
		this.im = im
	}

    setRTheta(r,theta) {
        this.re = r * Math.cos(theta)
        this.im = r * Math.sin(theta)
    }

    lerp(t,start,end) {
        this.re = lerp(t, start.re, end.re)
        this.im = lerp(t, start.im, end.im)
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
        return this
	}
	sub(c) {
		this.re -= c.re
		this.im -= c.im
        return this
	}

	mul(c,target) {
		if (target === undefined)
			target = new Complex()
		target.re = this.re * c.re - this.im * c.im
		target.im = this.re * c.im + this.im * c.re

        return target
	}

    div(c,target) {
        if (target === undefined)
            target = new Complex()

        let multiplicand = 1./(c.re*c.re + c.im*c.im)
        
        target.re = multiplicand * (c.re*this.re + c.im*this.im)
        target.im = multiplicand * (this.im*c.re - this.re*c.im)

        return target
    }

    log(msg) {
        let str = this.toString()
        if (msg !== undefined)
            str = msg + ": " + str
        console.log(str)
    }
}

const iComplex = new Complex(0., 1.)
const oneComplex = new Complex(1., 0.)
const zeroComplex = new Complex(0., 0.)
const c0 = new Complex()
const c1 = new Complex()
const c2 = new Complex()
const c3 = new Complex()
const c4 = new Complex()
const c5 = new Complex()
const c6 = new Complex()
const c7 = new Complex()
const c8 = new Complex()

function ps(theta) {
    return new ComplexMat(2,[
        [1., 0.], [0., 0.],
        [0., 0.], [Math.cos(theta), Math.sin(theta)],
    ])
}

function rx(theta, target) {
    if(target === undefined)
        target = new ComplexMat(2)

    return new ComplexMat(2, [
        [Math.cos(theta/2.), 0.], [0.,-Math.sin(theta/2.)],
        [0.,-Math.sin(theta/2.)], [ Math.cos(theta/2.), 0.],
    ])

    return target
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
zero2x2 = new ComplexMat(2, [
    [0., 0.], [0., 0.],
    [0., 0.], [0., 0.],
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

cnot = new ComplexMat(4, [
    [1., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [1., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [1., 0.],
    [0., 0.], [0., 0.], [1., 0.], [0., 0.],
])

identity4x4 = new ComplexMat(4, [
    [1., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [1., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [1., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [1., 0.],
])

swap = new ComplexMat(4, [
    [1., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [1., 0.], [0., 0.],
    [0., 0.], [1., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [1., 0.],
])

iSwap = new ComplexMat(4, [
    [1., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 1.], [0., 0.],
    [0., 0.], [0., 1.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [1., 0.],
])

sqrtSwap = new ComplexMat(4, [
    [1., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [.5, .5], [.5,-.5], [0., 0.],
    [0., 0.], [.5,-.5], [.5, .5], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [1., 0.],
])


g0 = new ComplexMat(4, [
    [1., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [1., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [-1.,0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [-1.,0.],
])
g1 = new ComplexMat(4, [
    [0., 0.], [0., 0.], [0., 0.], [1., 0.],
    [0., 0.], [0., 0.], [1., 0.], [0., 0.],
    [0., 0.], [-1.,0.], [0., 0.], [0., 0.],
    [-1.,0.], [0., 0.], [0., 0.], [0., 0.],
])
g2 = new ComplexMat(4, [
    [0., 0.], [0., 0.], [0., 0.], [0.,-1.],
    [0., 0.], [0., 0.], [0., 1.], [0., 0.],
    [0., 0.], [0., 1.], [0., 0.], [0., 0.],
    [0.,-1.], [0., 0.], [0., 0.], [0., 0.],
])
g3 = new ComplexMat(4, [
    [0., 0.], [0., 0.], [1., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [-1.,0.],
    [-1.,0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [1., 0.], [0., 0.], [0., 0.],
])
function multiplyMatrixByI(m){
    m.forEachElement((r,c,el)=>{
    let temp = el.re
    el.re = el.im
    el.im = temp
    })
}
multiplyMatrixByI(g0)
multiplyMatrixByI(g1)
multiplyMatrixByI(g2)
multiplyMatrixByI(g3)
// g5 = new ComplexMat(4, [
//     [0., 0.], [0., 0.], [0., 0.], [0., 0.],
//     [0., 0.], [0., 0.], [0., 0.], [0., 0.],
//     [0., 0.], [0., 0.], [0., 0.], [0., 0.],
//     [0., 0.], [0., 0.], [0., 0.], [0., 0.],
// ])

c4m0 = new ComplexMat(4)
c4m1 = new ComplexMat(4)
c2m0 = new ComplexMat(2)
c2m1 = new ComplexMat(2)