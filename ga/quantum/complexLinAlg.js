// function initChangingParallelStates() {
//     // initialized to 00
//     let state = new ComplexVector(4)
//     state.el[0].re = 1.



//     return state
// }

//possibly it should be thought of as always taking a 4x4 and giving two 2x2s
function partialTrace(secondQubit,vec4,target) {
    if(vec4.dim !== 4)
    console.error("wrong vector length")
    
    let m4x4 = localC4m0
    vec4.outerProductWithSelfConjugate(m4x4)
    
    // m4x4.log()
    
    // http://www.thphy.uni-duesseldorf.de/~ls3/teaching/1515-QOQI/Additional/partial_trace.pdf
    for(let i=0;i<2;++i)
    for(let j=0;j<2;++j)
    for(let k=0;k<2;++k)
    for(let l=0;l<2;++l) {

    }

    //hackyyyyy
    let el
    if(!secondQubit){
        el = target.get(0, 0)
        el.copy(m4x4.get(0, 0))
        el.add(m4x4.get(1, 1))

        el = target.get(1, 0)
        el.copy(m4x4.get(2, 0))
        el.add(m4x4.get(3, 1))

        el = target.get(0, 1)
        el.copy(m4x4.get(0, 2))
        el.add(m4x4.get(1, 3))

        el = target.get(1, 1)
        el.copy(m4x4.get(2, 2))
        el.add(m4x4.get(3, 3))
    }
    else {
        for(let i = 0; i < 2; ++i) {
            for(let j = 0; j < 2; ++j) {
                el = target.get(i, j)
                el.copy(m4x4.get(i, j))
                el.add(m4x4.get(i + 2, j + 2))
            }
        }
    }
}

function det2x2(mat, target) {
    let ad = mat.get(0, 0).mul(mat.get(1, 1))
    let bc = mat.get(0, 1).mul(mat.get(1, 0))

    target.copy(ad).sub(bc)
    delete ad
    delete bc
    return target
}

function getPauliVector(mat, target) {
    //target is a vector of 4 complex numbers

    let mSigmaI = localC2m0
    allPaulis.forEach((p, i) => {
        mat.mul(p, mSigmaI)
        mSigmaI.trace(target[i])
        target[i].re *= .5
        target[i].im *= .5
    })

    return target
}

//Analytic solution from wikipedia https://en.wikipedia.org/wiki/Singular_value_decomposition#Analytic_result_of_2_%C3%97_2_SVD
function svd2x2(mat, target) {
    const pauliVector = new ComplexVector(4)
    mat.getPauliVector(pauliVector)

    //it's a float
    let sumOfAbsoluteSquares = z0.absoluteSquare() + z1.absoluteSquare() + z2.absoluteSquare() + z3.absoluteSquare()

    let thingToGetAbsoluteSquareOf = new Complex()
    for (let i = 0; i < 4; ++i) {
        pauliVector[i].sq(c0)
        if (i !== 0)
            c0.multiplyScalar(-1.)
        thingToGetAbsoluteSquareOf.add(c0)
    }
    let thingToSqrt = sq(sumOfAbsoluteSquares) - thingToGetAbsoluteSquareOf.absoluteSquare()

    target.copy(zero2x2)
    let possiblyComplexThingToSqrt = new Complex()
    for (let i = 0; i < 2; ++i) {
        possiblyComplexThingToSqrt.setFromSqrt(thingToSqrt)
        if (i)
            possiblyComplexThingToSqrt.multiplyScalar(-1.)
        possiblyComplexThingToSqrt.re += sumOfAbsoluteSquares

        possiblyComplexThingToSqrt.pow(.5, target.get(i, i))
    }
    //er, which one at top and which at bottom?

    //the more important thing is the more visualizable matrix to spinor

    delete thingToGetAbsoluteSquareOf

    return target
}

//this guy https://www.youtube.com/watch?v=AUm0AWRNqSg
//get partial trace. Get eigenvalues of those via characteristic polynomial

class ComplexVector {
	constructor(n) {
		if(n === undefined)
			console.error("need to know how many there are!")
		else {
            this.el = Array(n)
			for(let i = 0; i < n; ++i)
				this.el[i] = new Complex(0.,0.)
		}

        this.dim = n
	}

    copy(toBeCopied) {
        for(let i = 0, il = this.el.length; i < il; ++i)
            this.el[i].copy(toBeCopied.el[i])
    }

    setAll(arr) {
        arr.forEach((s,i)=>{
            let isIm = i%2
            let theEl = this.el[(i-isIm)/2]
            if(isIm)
                theEl.im = s
            else
                theEl.re = s
        })
    }

    log(msg) {
        let str = ""
        for (let i = 0; i < this.el.length; ++i) {
            if (this.el[i].re !== 0. || this.el[i].im !== 0.) {
                if (str !== "")
                    str += " +\n"

                str += this.el[i].toString()

                let binaryRepOfThisIndex = ""
                let numBinaryDigits = Math.log2(this.el.length)
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
        let tempVec = new ComplexVector(this.el.length)

        let tempComplex = new Complex()
        for(let i = 0; i < this.el.length; ++i) {
            //i is the column in the matrix, the row in the vector
            tempVec.el[i].set(0.,0.)
            for(let j = 0; j < this.el.length; ++j) {
                let matEl = m.get(j,i)
                matEl.mul(this.el[j],tempComplex)
                // log(i, j, tempComplex)
                tempVec.el[i].add(tempComplex)
            }
        }
        
        this.copy(tempVec)

        return this
    }

    //aka ketbra, aka density matrix
    outerProductWithSelfConjugate(target) {
        if(target === undefined)
            target = new ComplexMat(this.dim)

        if(target.dim !== this.dim)
            console.error("bad target")

        target.forEachElement((row, col, el) => {
            let columnEntryConjugate = this.el[col].getConjugate(c0)
            this.el[row].mul(columnEntryConjugate, el)
        })

        return target
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

        this.el = Array(dim*dim)
        for (let i = 0; i < this.dim; ++i) {
            for (let j = 0; j < this.dim; ++j) {
                this.el[i * this.dim + j] = new Complex()
            }
        }
        
        if(values!==undefined) {
            this.forEachElement((row, col, element) => {
                let pairIndex = col + this.dim * row //reversed because row-major input
                element.set(values[pairIndex][0], values[pairIndex][1])
            })
        }
    }

    trace(target) {
        target.copy(zeroComplex)
        for (let i = 0; i < this.dim; ++i)
            target.add(this.get(i,i))

        return target
    }

    get(row, col) {
        return this.el[col * this.dim + row]
    }
    set(row, col, val) {
        this.el[col * this.dim + row].copy(val)
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
        return this
	}
    multiplyComplex(c) {
        let temp = new Complex()
		this.forEachElement((row, col, el) => {
            el.mul(c,temp)
            el.copy(temp)
		})
        return this
	}

    transpose(target) {
        if (target === undefined)
            target = new ComplexMat(this.dim)

        this.forEachElement((row, col, el)=>{
            target.get(col,row).copy(el)
        })
    }

    conjugateTranspose(target) {
        if (target === undefined)
            target = new ComplexMat(this.dim)

        this.forEachElement((row, col, el) => {
            el.getConjugate(target.get(col, row))
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

    exp(target) {
        //first two terms
        target.copy(this)
        target.add(this.dim === 4 ? identity4x4 : identity2x2)

        let increasingPower = this.dim === 4 ? localC4m0 : localC2m0
        increasingPower.copy(this)
        let standIn = this.dim === 4 ? localC4m1 : localC2m1
        let oneThatGetsScalarMultiple = this.dim === 4 ? localC4m2 : localC2m2
        prepreparedReciprocalFactorials.forEach((rf) => {
            standIn.copy(increasingPower)
            standIn.mul(this, increasingPower)

            oneThatGetsScalarMultiple.copy(increasingPower)
            oneThatGetsScalarMultiple.multiplyScalar(rf)
            target.add(oneThatGetsScalarMultiple)
        })

        return target
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
        let dim = v.el.length
        if (this.el.length !== dim * dim)
            console.error("matrix size mismatch!", dim, this.el.length)

        if (target === undefined)
            target = new ComplexVector(dim)

        for (let i = 0; i < dim; ++i)
            target.el[i].set(0., 0.)

        const dummy = new Complex()
        this.forEachElement((row, col, element) => {
            element.mul(v.el[col], dummy)
            target.el[row].add(dummy)
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

    add(a, target) { //to self!!
        if (target !== undefined)
            console.error("no target! Gonna add to this!")
        
        this.forEachElement((row,col,val)=>{
            val.re += a.get(row,col).re
            val.im += a.get(row,col).im
        })

        return this
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
        v.el[val2 + val1 * 2].re = 1.

        v.applyMatrix(this).log()
    }
}

// xti = pauli1.tensor(identity2x2)
// yti = pauli2.tensor(identity2x2)
// zti = pauli3.tensor(identity2x2)
// itx = identity2x2.tensor(pauli1)
// ity = identity2x2.tensor(pauli2)
// itz = identity2x2.tensor(pauli3)

let prepreparedReciprocalFactorials = [
    1. / 2., 1. / 6., 1. / 24., 1. / 120., 1. / 720., 1. / 5040., 1. / 40320., 1. / 362880., 1. / 3628800., 1. / 39916800., 1. / 479001600., 1. / 6227020800., 1. / 87178291200., 1. / 1307674368000.,
]

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

    equals(c) {
        return this.re === c.re && this.im === c.im
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

    pow(power,target) {
        let r = this.magnitude()
        let theta = Math.atan2(this.im,this.re)

        let rPowed = Math.abs(r-1.) > .01 ? Math.pow(r,power) : 1.
        target.re = rPowed * Math.cos(theta*power)
        target.im = rPowed * Math.sin(theta*power)
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

    sq(target) {
        return this.mul(this,target)
    }

    multiplyScalar(scalar) {
        this.re *= scalar
        this.im *= scalar
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

//"X"
pauli1 = new ComplexMat(2, [
    [0., 0.], [1., 0.],
    [1., 0.], [0., 0.],
])
XxX = pauli1.tensor(pauli1)
//"Y" but for us Z
pauli2 = new ComplexMat(2, [
    [0., 0.], [0., -1.],
    [0., 1.], [0., 0.],
])
YxY = pauli2.tensor(pauli2)
//"Z", but for us Y
pauli3 = new ComplexMat(2, [
    [1., 0.], [0., 0.],
    [0., 0.], [-1., 0.],
])
ZxZ = pauli3.tensor(pauli3)

let allPaulis = [identity2x2,pauli1,pauli2,pauli3]

hadamard = new ComplexMat(2, [
    [1. / Math.SQRT2, 0.], [1. / Math.SQRT2, 0.],
    [1. / Math.SQRT2, 0.], [-1. / Math.SQRT2, 0.],
])

zero4x4 = new ComplexMat(4, [
    [0., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [0., 0.],
])

cnot = new ComplexMat(4, [
    [1., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [1., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [1., 0.],
    [0., 0.], [0., 0.], [1., 0.], [0., 0.],
])

logCnotOverMinusIHalfPi = new ComplexMat(4, [
    [0., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [-1.,0.], [ 1.,0.],
    [0., 0.], [0., 0.], [ 1.,0.], [-1.,0.],
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

logSwapOverMinusIHalfPi = new ComplexMat(4, [
    [0., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [-1.,0.], [1., 0.], [0., 0.],
    [0., 0.], [1., 0.], [-1.,0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [0., 0.],
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

magic = new ComplexMat(4, [
    [1., 0.], [0., 1.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 1.], [1., 0.],
    [0., 0.], [0., 0.], [0., 1.], [-1.,0.],
    [1., 0.], [0., 1.], [0., 0.], [0., 0.],
])
magicConjugateTranspose = new ComplexMat(4, [
    [1., 0.], [0., 0.], [0., 0.], [1., 0.],
    [0.,-1.], [0., 0.], [0., 0.], [0.,-1.],
    [0., 0.], [0.,-1.], [0.,-1.], [0., 0.],
    [0., 0.], [1., 0.], [-1.,0.], [0., 0.],
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
localC4m0 = new ComplexMat(4)
localC4m1 = new ComplexMat(4)
localC4m2 = new ComplexMat(4)
localC4m3 = new ComplexMat(4)
localC2m0 = new ComplexMat(2)
localC2m1 = new ComplexMat(2)
localC2m2 = new ComplexMat(2)
localC2m3 = new ComplexMat(2)